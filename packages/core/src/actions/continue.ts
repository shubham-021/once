import { extractCodexEntries, extractEntities } from "@/extraction";
import { buildContext, storySceneMemory } from "@/memory";
import { updateProtagonistState } from "@/protagonist";
import { evaluateDeferredCharacters, evaluateEchoes, generateContinuation, markCharacterIntroduced, plantEcho, resolveEchoes } from "@/story";
import { db, eq, scenes, stories } from "@once/database";
import { deferredCharactersSchema, echoesSchema, protagonistSchema, scenesSchema, storySchema } from "@once/database/types";
import { DebugCollector } from "@/debug";
import { cleanupFailedScene } from "./cleanup";
import { UsageCollector, deductCredits, checkCredits, InsufficientCreditsError } from "@/credits";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";


const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../.env") });


interface ContinueStoryProps {
    story: storySchema & {
        scenes: Array<scenesSchema>,
        protagonist: Array<protagonistSchema>,
        echoes: Array<echoesSchema>,
        deferredCharacters: Array<deferredCharactersSchema>
    };
    userAction: string
}

interface ContinueStoryResult {
    scene: {
        id: number;
        createdAt: Date;
        storyId: number;
        turnNumber: number;
        userAction: string;
        narration: string;
        protagonistSnapshot: Record<string, unknown> | null;
        mood: string | null;
        protagonistId: number | null;
    };
    response: {
        narration: string;
        protagonistUpdates: {
            health: number | null;
            energy: number | null;
            location: string | null;
            addTraits: string[] | null;
            removeTraits: string[] | null;
            addInventory: string[] | null;
            removeInventory: string[] | null;
            addScars: string[] | null;
        } | null;
        echoPlanted: {
            description: string;
            triggerCondition: string;
        } | null;
    },
    protagonistUpdates: {
        health: number | null;
        energy: number | null;
        location: string | null;
        addTraits: string[] | null;
        removeTraits: string[] | null;
        addInventory: string[] | null;
        removeInventory: string[] | null;
        addScars: string[] | null;
    } | null;
    echoPlanted: boolean;
    narration: string;
    creditsUsed?: number;
}

// continue and continueStream endpoint have difference when extracting codex , this helps in skipping codex extraction for streaming enpoint so we can extract codex later when streaming of narration is done
// interface ContinueStoryOptions {
//     skipCodexExtraction?: boolean;
// }


export async function continueStory(props: ContinueStoryProps, collector?: DebugCollector): Promise<ContinueStoryResult> {

    const { story, userAction } = props;
    const storyId = story.id;

    const usageCollector = process.env.DEV_MODE === "true" ? undefined : new UsageCollector();

    let sceneId: number | null = null;

    try {

        if (usageCollector) await checkCredits(story.userId);

        const activeProtagonist = story.protagonist.find(p => p.isActive);

        const pendingEchoes = story.echoes.filter(e => e.status === "pending");
        const lastScene = story.scenes[0];

        const triggeredEchoes = await evaluateEchoes(
            {
                storyId,
                pendingEchoes: pendingEchoes.map(e => ({
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
            },
            usageCollector
        );

        // debug collector
        collector?.add('llm', 'triggeredEchoes', triggeredEchoes);

        const pendingCharacters = story.deferredCharacters.filter(c => !c.introduced);
        const triggeredCharacters = await evaluateDeferredCharacters(
            {
                storyId,
                pendingCharacters: pendingCharacters.map(c => ({
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
            },
            usageCollector
        );

        //debug collector
        collector?.add('llm', 'triggeredCharacters', triggeredCharacters);

        const memoryContext = await buildContext(
            storyId,
            userAction,
            activeProtagonist?.name || "protagonist",
            activeProtagonist?.currentLocation
        );

        // debug collector
        collector?.add('llm', 'memoryContext', memoryContext);

        const factualKnowledge = memoryContext.similarScenes.map(s => s.narration);

        // debug collector
        // collector?.add('context', '', factualKnowledge);

        const response = await generateContinuation(
            {
                narrativeStance: story.narrativeStance,
                storyMode: story.storyMode,
                protagonist: activeProtagonist ? {
                    name: activeProtagonist.name,
                    description: activeProtagonist.description,
                    traits: activeProtagonist.currentTraits || [],
                    health: activeProtagonist.health,
                    energy: activeProtagonist.energy,
                    location: activeProtagonist.currentLocation,
                    inventory: activeProtagonist.inventory || [],
                    scars: activeProtagonist.scars || [],
                } : undefined,
                recentScenes: story.scenes.reverse().map(s => ({
                    userAction: s.userAction,
                    narration: s.narration,
                })),
                userAction,
                triggeredEchoes: triggeredEchoes.map(e => ({ description: e.description })),
                factualKnowledge,
                introducedCharacters: triggeredCharacters.map(c => ({ name: c.name, description: c.description, role: c.role }))
            },
            usageCollector
        );

        // debug collector
        collector?.add('llm', 'continuation', response);

        const newTurnNumber = (story.turnCount || 0) + 1;

        let updatedProtagonist = activeProtagonist;
        if (activeProtagonist && response.protagonistUpdates) {
            const updates = await updateProtagonistState(activeProtagonist, response.protagonistUpdates);
            updatedProtagonist = { ...activeProtagonist, ...updates }
        }

        const [newScene] = await db.insert(scenes).values({
            storyId,
            turnNumber: newTurnNumber,
            userAction,
            narration: response.narration,
            protagonistId: updatedProtagonist?.id,
            protagonistSnapshot: updatedProtagonist ? {
                name: updatedProtagonist.name,
                description: updatedProtagonist.description,
                health: updatedProtagonist.health,
                energy: updatedProtagonist.energy,
                currentLocation: updatedProtagonist.currentLocation,
                baseTraits: updatedProtagonist.baseTraits,
                currentTraits: updatedProtagonist.currentTraits,
                inventory: updatedProtagonist.inventory,
                scars: updatedProtagonist.scars,
            } : null,
        }).returning();

        sceneId = newScene.id;

        // debug collector
        collector?.add('db', 'insert:scenes', newScene);

        await Promise.all([
            db.update(stories).set({ turnCount: newTurnNumber, updatedAt: new Date() }).where(eq(stories.id, storyId)),
            ...triggeredCharacters.map(character => markCharacterIntroduced(character.id, newScene.id))
        ])

        collector?.add('db', 'update:stories', { storyId, turnCount: newTurnNumber });

        const entities = await extractEntities(response.narration, activeProtagonist?.name || "protagonist", usageCollector)

        // debug collector
        collector?.add('llm', 'extractedEntities', entities);

        await storySceneMemory(newScene.id.toString(), response.narration, storyId, newTurnNumber, entities, collector, usageCollector);

        await Promise.all([
            resolveEchoes(triggeredEchoes.map(e => e.id), newScene.id, collector),
            response.echoPlanted ? plantEcho(storyId, newScene.id, response.echoPlanted.description, response.echoPlanted.triggerCondition) : Promise.resolve(),
            extractCodexEntries(storyId, response.narration, collector, usageCollector)
        ])

        if (usageCollector) {
            const creditsUsed = usageCollector.getCredits();
            const usage = usageCollector.getUsage();

            await deductCredits({
                userId: story.userId,
                storyId,
                sceneId: newScene.id,
                creditsUsed,
                usage
            })
        }

        return {
            scene: newScene,
            response,
            protagonistUpdates: response.protagonistUpdates,
            echoPlanted: response.echoPlanted ? true : false,
            narration: response.narration,
            creditsUsed: usageCollector?.getCredits(),
        };

    } catch (error) {

        if (sceneId) await cleanupFailedScene(storyId, sceneId);
        throw error;
    }
}