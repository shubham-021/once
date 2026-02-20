import { DebugCollector } from "@/debug";
import { codexEntries, db, eq, protagonists, scenes, stories } from "@once/database";
import { protagonistSchema, scenesSchema, storySchema } from "@once/database/types";
import { CodexEntry } from "@once/shared";

interface ForkStoryProps {
    originalStory: storySchema,
    sceneId: number,
    storyId: number,
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    },
    forkScene: scenesSchema,
    originalCodexEntries: CodexEntry[]
}

interface ForkStoryResult {
    storyWithRelations: storySchema & {
        scenes: Array<scenesSchema>,
        protagonist: Array<protagonistSchema>
    }
}

export async function forkStory(props: ForkStoryProps, collector?: DebugCollector): Promise<{forkedStoryId: number}>{

    const { originalStory, sceneId, storyId, user, forkScene, originalCodexEntries } = props;

    const protagonistSnapshot = forkScene.protagonistSnapshot as Record<string, unknown> | null;

    const forkedStoryId = await db.transaction(async (tx) => {

        const [forkedStory] = await tx.insert(stories).values({
            userId: user.id,
            title: originalStory.title,
            description: originalStory.description,
            genre: originalStory.genre,
            narrativeStance: originalStory.narrativeStance,
            storyMode: originalStory.storyMode,
            forkedFromStoryId: storyId,
            forkedAtSceneId: sceneId,
            turnCount: forkScene.turnNumber
        }).returning();

        // debug collector
        collector?.add('db', 'insert:stories', forkedStory);

        let protagonistId: number | undefined;
        if (protagonistSnapshot) {
            const [newProtagonist] = await tx.insert(protagonists).values({
                storyId: forkedStory.id,
                name: protagonistSnapshot.name as string,
                description: protagonistSnapshot.description as string | null,
                health: protagonistSnapshot.health as number,
                energy: protagonistSnapshot.energy as number,
                currentLocation: protagonistSnapshot.currentLocation as string,
                baseTraits: protagonistSnapshot.baseTraits as string[],
                currentTraits: protagonistSnapshot.currentTraits as string[],
                inventory: protagonistSnapshot.inventory as string[],
                scars: protagonistSnapshot.scars as string[],
                isActive: true,
            }).returning();
            protagonistId = newProtagonist.id;

            // debug collector
            collector?.add('db', 'insert:protagonists', newProtagonist);
        }

        const scenesToCopy = await tx.query.scenes.findMany({
            where: eq(scenes.storyId, storyId),
            orderBy: (scenes, { asc }) => [asc(scenes.turnNumber)],
        });

        const scenesUpToFork = scenesToCopy.filter(s => s.turnNumber <= forkScene.turnNumber);

        const codexToBeCopied = originalCodexEntries.filter(codex => codex.firstMentionedSceneId <= forkScene.turnNumber).map(codex => {
            let copiedMetadata: Record<number, Record<string, string>> = {};

            if(codex.metadata){
                for (const [k,v] of Object.entries(codex.metadata)) {
                    const turnNumber = Number(k);
                    if(turnNumber <= forkScene.turnNumber){
                        copiedMetadata = {...copiedMetadata, [turnNumber]: v}
                    }
                }
            }

            return {
                ...codex,
                metadata: copiedMetadata
            }
        });

        for (const scene of scenesUpToFork) {
            await tx.insert(scenes).values({
                storyId: forkedStory.id,
                turnNumber: scene.turnNumber,
                userAction: scene.userAction,
                narration: scene.narration,
                protagonistSnapshot: scene.protagonistSnapshot,
                mood: scene.mood,
                protagonistId,
            });

            collector?.add('db', 'insert:scenes', { turnNumber: scene.turnNumber });
        }

        for (const codex of codexToBeCopied) {
            await tx.insert(codexEntries).values({
                storyId: forkedStory.id,
                name: codex.name,
                entryType: codex.entryType,
                firstMentionedSceneId: codex.firstMentionedSceneId,
                metadata: codex.metadata,
            })
        }

        return forkedStory.id;
    })

    return {forkedStoryId}
}