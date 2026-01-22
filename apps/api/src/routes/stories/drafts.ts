import { Hono } from "hono";
import { db, eq, and, desc, user, stories, scenes, drafts, userCredits, creditTransactions, protagonists } from "@once/database";
import { success, error } from "@/lib/response";
import { streamSSE } from "hono/streaming";
import { requireAuth } from "@/middleware/auth";
import { checkCredits, evaluateDeferredCharacters, evaluateEchoes, extractCodexEntries, extractEntities, extractSceneData, InsufficientCreditsError, markCharacterIntroduced, plantEcho, resolveEchoes, storySceneMemory, streamNarrationOnly, streamOpeningScene, streamRevision, updateProtagonistState, UsageCollector } from "@once/core";
import { createStorySchema } from "@once/shared";


const draftsRouter = new Hono();

draftsRouter.post("/draft", requireAuth, async (c) => {
    const body = await c.req.json();
    const parsed = createStorySchema.safeParse(body);

    if (!parsed.success) {
        return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);
    }
    const { title, genre, narrativeStance, storyMode, storyIdea, worldDescription, promptForOnce, startingScene, cast, castMode, protagonist } = parsed.data;
    const user = c.get("user")!;

    if (process.env.DEV_MODE !== "true") {
        try {
            await checkCredits(user.id);
        } catch (err) {
            if (err instanceof InsufficientCreditsError) {
                return error(c, "INSUFFICIENT_BALANCE", undefined, { balance: err.balance });
            }
            throw err;
        }
    }

    const usageCollector = process.env.DEV_MODE !== "true" ? new UsageCollector() : undefined;

    return streamSSE(c, async (stream) => {
        let fullNarration = "";

        try {

            const narrationStream = streamOpeningScene({
                narrativeStance,
                storyMode,
                title,
                genre,
                storyIdea,
                worldDescription,
                promptForOnce,
                startingScene,
                cast,
                castMode,
                protagonist: protagonist ? {
                    name: protagonist.name,
                    description: protagonist.description,
                    traits: protagonist.traits,
                } : undefined,
            }, usageCollector);

            for await (const chunk of narrationStream) {
                fullNarration += chunk;
                await stream.writeSSE({ event: "narration", data: chunk });
            }

            const result = await db.transaction(async (tx) => {
                const [newStory] = await tx.insert(stories).values({
                    userId: user.id,
                    title,
                    genre,
                    narrativeStance,
                    storyMode,
                    worldDescription,
                    promptForOnce,
                    startingScene,
                    turnCount: 0,
                }).returning();

                let newProtagonist: typeof protagonists.$inferSelect | undefined;

                if (storyMode === "protagonist" && protagonist) {
                    [newProtagonist] = await tx.insert(protagonists).values({
                        storyId: newStory.id,
                        name: protagonist.name,
                        description: protagonist.description,
                        currentLocation: "Unknown",
                        baseTraits: protagonist.traits,
                        currentTraits: protagonist.traits,
                    }).returning();
                }

                const [draft] = await tx.insert(drafts).values({
                    storyId: newStory.id,
                    userId: user.id,
                    userAction: "[STORY_START]",
                    narration: fullNarration,
                    turnNumber: 1,
                    triggeredEchoes: [],
                    triggeredCharacters: [],
                    protagonistSnapshot: newProtagonist ? {
                        id: newProtagonist.id,
                        name: newProtagonist.name,
                        description: newProtagonist.description,
                        health: newProtagonist.health,
                        energy: newProtagonist.energy,
                        currentLocation: newProtagonist.currentLocation,
                        baseTraits: newProtagonist.baseTraits,
                        currentTraits: newProtagonist.currentTraits,
                        inventory: newProtagonist.inventory,
                        scars: newProtagonist.scars,
                    } : null,
                }).returning();

                if (usageCollector) {
                    const creditsUsed = usageCollector.getCredits();
                    const usage = usageCollector.getUsage();
                    const userCredit = await tx.query.userCredits.findFirst({
                        where: eq(userCredits.userId, user.id),
                    });

                    if (!userCredit) throw new Error(`No credit record for user ${user.id}`);

                    const newBalance = userCredit.balance - creditsUsed;

                    await tx.update(userCredits).set({
                        balance: newBalance,
                        lifetimeUsed: userCredit.lifetimeUsed + creditsUsed,
                        updatedAt: new Date(),
                    }).where(eq(userCredits.userId, user.id));

                    await tx.insert(creditTransactions).values({
                        userId: user.id,
                        type: "usage",
                        amount: -creditsUsed,
                        balanceAfter: newBalance,
                        storyId: newStory.id,
                        sceneId: null,
                        draftId: draft.id,
                        claudeInputTokens: usage.claudeInput,
                        claudeOutputTokens: usage.claudeOutput,
                        gptInputTokens: usage.gptInput,
                        gptOutputTokens: usage.gptOutput,
                        embeddingTokens: usage.embedding,
                    });
                }
                return { newStory, draft };
            });

            await stream.writeSSE({
                event: "complete",
                data: JSON.stringify({ storyId: result.newStory.id, draftId: result.draft.id }),
            });
        } catch (err) {
            console.error("Opening scene draft error:", err);
            await stream.writeSSE({ event: "error", data: JSON.stringify({ code: "LLM_ERROR" }) });
        }
    });
})

draftsRouter.post("/draft/:storyId/continue", requireAuth, async (c) => {
    const storyId = Number(c.req.param("storyId"));
    if (isNaN(storyId)) return error(c, "INVALID_ID");

    const body = await c.req.json();
    const userAction = body.action;

    if (!userAction || typeof userAction !== "string") return error(c, "VALIDATION_ERROR", "Action is required");

    const user = c.get("user");
    if (!user) return error(c, "INVALID_USER_ID");

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId),
        with: {
            protagonist: true,
            scenes: { orderBy: desc(scenes.turnNumber), limit: 10 },
            echoes: true,
            deferredCharacters: true
        }
    })

    if (!story) return error(c, "NOT_FOUND", "Story not found");
    if (story.userId !== user.id) return error(c, "FORBIDDEN");
    if (story.status !== "active") return error(c, "STORY_COMPLETED");

    const exisitingDraft = await db.query.drafts.findFirst({
        where: and(eq(drafts.storyId, storyId), eq(drafts.userId, user.id)),
    });

    if (exisitingDraft) return error(c, "DRAFT_EXISTS", "A draf already exists for this story");

    const activeProtagonist = story.protagonist.find((p) => p.isActive);
    const pendingEchoes = story.echoes.filter((e) => e.status === "pending");
    const pendingCharacters = story.deferredCharacters.filter((c) => !c.introduced);
    const lastScene = story.scenes[0];

    const triggeredEchoes = await evaluateEchoes(
        {
            storyId,
            pendingEchoes: pendingEchoes.map((e) => ({
                id: e.id,
                description: e.description,
                triggerCondition: e.triggerCondition,
            })),
            protagonistLocation: activeProtagonist?.currentLocation || "",
            protagonistState: activeProtagonist
                ? `Health: ${activeProtagonist.health}, Energy: ${activeProtagonist.energy}`
                : "",
            userAction,
            recentNarration: lastScene?.narration || "",
        }
    );

    const triggeredCharacters = await evaluateDeferredCharacters(
        {
            storyId,
            pendingCharacters: pendingCharacters.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                role: c.role,
                triggerCondition: c.triggerCondition,
            })),
            protagonistLocation: activeProtagonist?.currentLocation || "",
            protagonistState: activeProtagonist
                ? `Health: ${activeProtagonist.health}, Energy: ${activeProtagonist.energy}`
                : "",
            userAction,
            recentNarration: lastScene?.narration || "",
        }
    );

    const newTurnNumber = (story.turnCount || 0) + 1;
    const usageCollector = process.env.DEV_MODE !== "true" ? new UsageCollector() : undefined;

    return streamSSE(c, async (stream) => {
        let fullNarration = "";

        try {
            const narrationStream = streamNarrationOnly({
                promptForOnce: story.promptForOnce,
                worldDescription: story.worldDescription,
                narrativeStance: story.narrativeStance,
                storyMode: story.storyMode,
                protagonist: activeProtagonist
                    ? {
                        name: activeProtagonist.name,
                        description: activeProtagonist.description,
                        traits: activeProtagonist.currentTraits || [],
                        health: activeProtagonist.health,
                        energy: activeProtagonist.energy,
                        location: activeProtagonist.currentLocation,
                        inventory: activeProtagonist.inventory || [],
                        scars: activeProtagonist.scars || [],
                    }
                    : undefined,
                recentScenes: story.scenes.slice().reverse().map((s) => ({
                    userAction: s.userAction,
                    narration: s.narration,
                })),
                userAction,
                triggeredEchoes: triggeredEchoes.map((e) => ({ description: e.description })),
                factualKnowledge: [],
                introducedCharacters: triggeredCharacters.map((c) => ({
                    name: c.name,
                    description: c.description,
                    role: c.role,
                })),
            }, usageCollector);

            for await (const chunk of narrationStream) {
                fullNarration += chunk;
                await stream.writeSSE({ event: "narration", data: chunk });
            }

            const result = await db.transaction(async (tx) => {
                const [draft] = await tx.insert(drafts).values({
                    storyId,
                    userId: user.id,
                    userAction,
                    narration: fullNarration,
                    turnNumber: newTurnNumber,
                    triggeredEchoes: triggeredEchoes.map((e) => ({ id: e.id, description: e.description })),
                    triggeredCharacters: triggeredCharacters.map((c) => ({
                        id: c.id,
                        name: c.name,
                        description: c.description ?? null,
                        role: c.role ?? null,
                    })),
                    protagonistSnapshot: activeProtagonist
                        ? {
                            id: activeProtagonist.id,
                            name: activeProtagonist.name,
                            description: activeProtagonist.description,
                            health: activeProtagonist.health,
                            energy: activeProtagonist.energy,
                            currentLocation: activeProtagonist.currentLocation,
                            baseTraits: activeProtagonist.baseTraits,
                            currentTraits: activeProtagonist.currentTraits,
                            inventory: activeProtagonist.inventory,
                            scars: activeProtagonist.scars,
                        }
                        : null,
                }).returning();

                if (usageCollector) {
                    const creditsUsed = usageCollector.getCredits();
                    const usage = usageCollector.getUsage();
                    const userCredit = await tx.query.userCredits.findFirst({
                        where: eq(userCredits.userId, user.id),
                    });

                    if (!userCredit) throw new Error(`No credit record for user ${user.id}`);

                    const newBalance = userCredit.balance - creditsUsed;

                    await tx.update(userCredits).set({
                        balance: newBalance,
                        lifetimeUsed: userCredit.lifetimeUsed + creditsUsed,
                        updatedAt: new Date(),
                    }).where(eq(userCredits.userId, user.id));

                    await tx.insert(creditTransactions).values({
                        userId: user.id,
                        type: "usage",
                        amount: -creditsUsed,
                        balanceAfter: newBalance,
                        storyId: draft.storyId,
                        sceneId: null,
                        draftId: draft.id,
                        claudeInputTokens: usage.claudeInput,
                        claudeOutputTokens: usage.claudeOutput,
                        gptInputTokens: usage.gptInput,
                        gptOutputTokens: usage.gptOutput,
                        embeddingTokens: usage.embedding,
                    });
                }

                return { draft };
            })

            await stream.writeSSE({
                event: "complete",
                data: JSON.stringify({ draftId: result.draft.id }),
            });
        } catch (err) {
            console.error("Draft streaming error:", err);
            await stream.writeSSE({ event: "error", data: JSON.stringify({ code: "LLM_ERROR" }) });
        }
    });
})

draftsRouter.put("/draft/:draftId/revise", requireAuth, async (c) => {
    const draftId = Number(c.req.param("draftId"));
    if (isNaN(draftId)) return error(c, "INVALID_ID");

    const user = c.get("user");
    if (!user) return error(c, "INVALID_USER_ID");

    const body = await c.req.json();
    const { narration, comment } = body;

    if (!narration || typeof narration !== "string") {
        return error(c, "VALIDATION_ERROR", "Narration is required");
    }

    const draft = await db.query.drafts.findFirst({
        where: eq(drafts.id, draftId),
    });

    if (!draft) return error(c, "DRAFT_NOT_FOUND");
    if (draft.userId !== user.id) return error(c, "FORBIDDEN");

    if (!comment) {
        await db.update(drafts).set({ narration, updatedAt: new Date() }).where(eq(drafts.id, draftId));
        return success(c, { draftId, narration });
    }

    const usageCollector = process.env.DEV_MODE !== "true" ? new UsageCollector() : undefined;

    return streamSSE(c, async (stream) => {
        let fullNarration = "";

        try {
            const revisionStream = streamRevision(narration, comment, usageCollector);

            for await (const chunk of revisionStream) {
                fullNarration += chunk;
                await stream.writeSSE({ event: "narration", data: chunk });
            }

            await db.transaction(async (tx) => {
                await tx.update(drafts).set({ narration: fullNarration, updatedAt: new Date() }).where(eq(drafts.id, draftId));

                if (usageCollector) {
                    const creditsUsed = usageCollector.getCredits();
                    const usage = usageCollector.getUsage();
                    const userCredit = await tx.query.userCredits.findFirst({
                        where: eq(userCredits.userId, user.id),
                    });

                    if (!userCredit) throw new Error(`No credit record for user ${user.id}`);

                    const newBalance = userCredit.balance - creditsUsed;

                    await tx.update(userCredits).set({
                        balance: newBalance,
                        lifetimeUsed: userCredit.lifetimeUsed + creditsUsed,
                        updatedAt: new Date(),
                    }).where(eq(userCredits.userId, user.id));

                    await tx.insert(creditTransactions).values({
                        userId: user.id,
                        type: "usage",
                        amount: -creditsUsed,
                        balanceAfter: newBalance,
                        storyId: draft.storyId,
                        sceneId: null,
                        draftId: draft.id,
                        claudeInputTokens: usage.claudeInput,
                        claudeOutputTokens: usage.claudeOutput,
                        gptInputTokens: usage.gptInput,
                        gptOutputTokens: usage.gptOutput,
                        embeddingTokens: usage.embedding,
                    });
                }
            })

            await stream.writeSSE({
                event: "complete",
                data: JSON.stringify({ draftId }),
            });

        } catch (err) {
            console.error("Revision streaming error:", err);
            await stream.writeSSE({ event: "error", data: JSON.stringify({ code: "LLM_ERROR" }) });
        }
    });
})

draftsRouter.put("/draft/:draftId/accept", requireAuth, async (c) => {
    const draftId = Number(c.req.param("draftId"));
    if (isNaN(draftId)) return error(c, "INVALID_ID");

    const user = c.get("user");
    if (!user) return error(c, "INVALID_USER_ID");

    const draft = await db.query.drafts.findFirst({
        where: eq(drafts.id, draftId),
        with: { story: true },
    });

    if (!draft) return error(c, "DRAFT_NOT_FOUND");
    if (draft.userId !== user.id) return error(c, "FORBIDDEN");

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, draft.storyId),
        with: { protagonist: true },
    });

    if (!story) return error(c, "NOT_FOUND");

    const activeProtagonist = story.protagonist.find((p) => p.isActive);
    const usageCollector = process.env.DEV_MODE === "true" ? undefined : new UsageCollector();

    try {
        const extraction = await extractSceneData({
            narration: draft.narration,
            protagonist: activeProtagonist
                ? {
                    name: activeProtagonist.name,
                    health: activeProtagonist.health,
                    energy: activeProtagonist.energy,
                    location: activeProtagonist.currentLocation,
                    traits: activeProtagonist.currentTraits,
                    inventory: activeProtagonist.inventory,
                }
                : { name: "Protagonist", health: 100, energy: 100, location: "Unknown", traits: [], inventory: [] },
            usageCollector,
        });

        const result = await db.transaction(async (tx) => {
            let updatedProtagonist = activeProtagonist;
            if (activeProtagonist && extraction.protagonistUpdates) {
                const updates = await updateProtagonistState(activeProtagonist, extraction.protagonistUpdates, tx);
                updatedProtagonist = { ...activeProtagonist, ...updates };
            }

            const [newScene] = await tx.insert(scenes).values({
                storyId: draft.storyId,
                turnNumber: draft.turnNumber,
                userAction: draft.userAction,
                narration: draft.narration,
                protagonistId: updatedProtagonist?.id,
                protagonistSnapshot: draft.protagonistSnapshot,
            }).returning();

            const entities = await extractEntities(draft.narration, activeProtagonist?.name || "protagonist", usageCollector);

            await Promise.all([
                tx.update(stories).set({ turnCount: draft.turnNumber, updatedAt: new Date() }).where(eq(stories.id, draft.storyId)),
                ...draft.triggeredCharacters.map((c) => markCharacterIntroduced(c.id, newScene.id, tx)),
                storySceneMemory(newScene.id.toString(), draft.narration, draft.storyId, draft.turnNumber, entities, undefined, usageCollector),
                resolveEchoes(draft.triggeredEchoes.map((e) => e.id), newScene.id, tx),
                extraction.echoPlanted ? plantEcho(draft.storyId, newScene.id, extraction.echoPlanted.description, extraction.echoPlanted.triggerCondition, tx) : Promise.resolve(),
                extractCodexEntries(draft.storyId, draft.narration, tx, undefined, usageCollector),
            ]);

            if (usageCollector) {
                const creditsUsed = usageCollector.getCredits();
                const usage = usageCollector.getUsage();
                const userCredit = await tx.query.userCredits.findFirst({
                    where: eq(userCredits.userId, user.id),
                });

                if (!userCredit) throw new Error(`No credit record for user ${user.id}`);

                const newBalance = userCredit.balance - creditsUsed;

                await tx.update(userCredits).set({
                    balance: newBalance,
                    lifetimeUsed: userCredit.lifetimeUsed + creditsUsed,
                    updatedAt: new Date(),
                }).where(eq(userCredits.userId, user.id));

                await tx.insert(creditTransactions).values({
                    userId: user.id,
                    type: "usage",
                    amount: -creditsUsed,
                    balanceAfter: newBalance,
                    storyId: draft.storyId,
                    sceneId: newScene.id,
                    claudeInputTokens: usage.claudeInput,
                    claudeOutputTokens: usage.claudeOutput,
                    gptInputTokens: usage.gptInput,
                    gptOutputTokens: usage.gptOutput,
                    embeddingTokens: usage.embedding,
                });
            }

            await tx.delete(drafts).where(eq(drafts.id, draftId));

            return { newScene, protagonistUpdates: extraction.protagonistUpdates, echoPlanted: !!extraction.echoPlanted };
        });

        return success(c, {
            scene: result.newScene,
            protagonistUpdates: result.protagonistUpdates,
            echoPlanted: result.echoPlanted,
            creditsUsed: usageCollector?.getCredits(),
        });

    } catch (err) {
        console.error("Accept error:", err);
        return error(c, "INTERNAL_ERROR");
    }
})

draftsRouter.delete("/draft/:draftId", requireAuth, async (c) => {
    const draftId = Number(c.req.param("draftId"));
    if (isNaN(draftId)) return error(c, "INVALID_ID");

    const user = c.get("user");
    if (!user) return error(c, "INVALID_USER_ID");

    const draft = await db.query.drafts.findFirst({
        where: eq(drafts.id, draftId),
    });

    if (!draft) return error(c, "DRAFT_NOT_FOUND");
    if (draft.userId !== user.id) return error(c, "FORBIDDEN");

    await db.delete(drafts).where(eq(drafts.id, draftId));

    return success(c, { deleted: true });
});

export default draftsRouter;