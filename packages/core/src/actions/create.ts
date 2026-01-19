import { buildInitializePrompt, buildSystemPrompt, generateStructuredWithTracking } from "@/llm";
import { creditTransactions, db, deferredCharacters, eq, protagonists, scenes, stories, userCredits } from "@once/database";
import { protagonistSchema, scenesSchema, storySchema } from "@once/database/types";
import { openSceneSchema } from "@once/shared";
import { DebugCollector } from "@/debug";
import { UsageCollector } from "@/credits";

export interface CreateStoryProps {
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    };
    title: string;
    genre: string;
    narrativeStance: "grimdark" | "heroic" | "grounded" | "mythic" | "noir";
    storyMode: "protagonist" | "narrator";
    storyIdea: string | undefined;
    worldDescription: string | undefined;
    promptForOnce: string | undefined;
    startingScene: string | undefined;
    castMode: 'strict' | 'flexible';
    cast?: Array<{ name: string; description: string }>;
    protagonist?: {
        name: string;
        description: string;
        traits: string[];
    };
}

interface CreateStoryResult {
    storyWithRelations: storySchema & {
        protagonist: Array<protagonistSchema>,
        scenes: Array<scenesSchema>
    };
    creditsUsed?: number;
    creditsRemaining?: number;
}

export async function createStory(props: CreateStoryProps, collector?: DebugCollector): Promise<CreateStoryResult> {

    const { user, title, genre, narrativeStance, storyMode, storyIdea, worldDescription, promptForOnce, startingScene, cast, castMode, protagonist } = props;

    const usageCollector = process.env.DEV_MODE === "true" ? undefined : new UsageCollector();

    const systemPrompt = buildSystemPrompt(narrativeStance, storyMode, worldDescription, promptForOnce);
    const initPrompt = buildInitializePrompt({ title, genre, stance: narrativeStance, mode: storyMode, plot: storyIdea, startingScene, cast, castMode, protagonist });

    const openingScene = await generateStructuredWithTracking(systemPrompt, initPrompt, openSceneSchema, "opening_scene", usageCollector);

    // debug collector
    collector?.add('llm', 'prompts', { systemPrompt, initPrompt });
    collector?.add('llm', 'openingScene', openingScene);

    const result = await db.transaction(async (tx) => {
        const [newStory] = await tx.insert(stories).values({
            userId: user.id,
            title,
            genre,
            narrativeStance,
            storyMode,
            worldDescription,
            promptForOnce,
            startingScene
        }).returning();

        let newProtagonist: typeof protagonists.$inferSelect | undefined;

        if (storyMode === "protagonist" && protagonist) {
            [newProtagonist] = await tx.insert(protagonists).values({
                storyId: newStory.id,
                name: protagonist.name,
                description: protagonist.description,
                currentLocation: openingScene.extractedLocation,
                baseTraits: protagonist.traits,
                currentTraits: protagonist.traits
            }).returning();
        }

        const [newScene] = await tx.insert(scenes).values({
            storyId: newStory.id,
            turnNumber: 1,
            userAction: "[STORY_START]",
            narration: openingScene.narration,
            protagonistId: newProtagonist?.id,
        }).returning();

        // let characters: Array<{ name: string, description: string, triggerCondition: string }> | undefined;

        if (openingScene.deferredCharacter && openingScene.deferredCharacter.length > 0) {
            await tx.insert(deferredCharacters).values(
                openingScene.deferredCharacter.map(c => ({
                    storyId: newStory.id,
                    name: c.name,
                    description: c.description,
                    triggerCondition: c.triggerCondition
                }))
            );
        }

        let newBalance: number | undefined;

        if (usageCollector) {
            const creditsUsed = usageCollector.getCredits();
            const usage = usageCollector.getUsage();

            const userCredit = await tx.query.userCredits.findFirst({
                where: eq(userCredits.userId, user.id)
            })

            if (!userCredit) throw new Error(`No credit record for user ${user.id}`);

            newBalance = userCredit.balance - creditsUsed;

            await tx.update(userCredits).set({
                balance: newBalance,
                lifetimeUsed: userCredit.lifetimeUsed + creditsUsed,
                updatedAt: new Date()
            }).where(eq(userCredits.userId, user.id));

            await tx.insert(creditTransactions).values({
                userId: user.id,
                type: "usage",
                amount: -creditsUsed,
                balanceAfter: newBalance,
                storyId: newStory.id,
                sceneId: newScene.id,
                claudeInputTokens: usage.claudeInput,
                claudeOutputTokens: usage.claudeOutput,
                gptInputTokens: usage.gptInput,
                gptOutputTokens: usage.gptOutput,
                embeddingTokens: usage.embedding
            });
        }

        return { story: newStory, protagonist: newProtagonist ? [newProtagonist] : [], scenes: [newScene], creditsRemaining: newBalance }
    })

    // debug collector
    collector?.add('db', 'insert:stories', { story: result.story });
    result.protagonist.length > 0 && collector?.add('db', 'insert:protagonist', { protagonist: result.protagonist });
    collector?.add('db', 'insert:scene', { scene: result.scenes });

    const storyWithRelations = {
        ...result.story,
        protagonist: result.protagonist,
        scenes: result.scenes
    }

    return { storyWithRelations, creditsUsed: usageCollector?.getCredits(), creditsRemaining: result.creditsRemaining };
}