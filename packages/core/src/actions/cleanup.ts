import { deleteSceneGraph, deleteSceneVector, deleteStoryGraph, deleteStoryVector } from "@/memory";
import { db, eq, scenes, stories } from "@once/database";

export async function cleanupFailedStory(storyId: number): Promise<void> {
    console.log(`Cleanup: Rolling back failed story: ${storyId}`);

    await deleteStoryVector(storyId).catch(e =>
        console.error("Cleanup: Vector cleanup failed:", e)
    );

    await deleteStoryGraph(storyId).catch(e =>
        console.error("Cleanup: Graph cleanup failed:", e)
    );

    await db.delete(stories).where(eq(stories.id, storyId)).catch(e =>
        console.error("Cleanup: DB cleanup failed:", e)
    );

    console.log(`Cleanup: Story ${storyId} rolled back`);
}

export async function cleanupFailedScene(storyId: number, sceneId: number): Promise<void> {
    console.log(`Cleanup: Rolling back failed scene: ${sceneId}`);

    await deleteSceneVector(sceneId).catch(e =>
        console.error("Cleanup: Vector cleanup failed:", e)
    );

    await deleteSceneGraph(storyId, sceneId).catch(e =>
        console.error("Cleanup: Graph cleanup failed:", e)
    );

    await db.delete(scenes).where(eq(scenes.id, sceneId)).catch(e =>
        console.error("Cleanup: DB cleanup failed:", e)
    );

    console.log(`Cleanup: Scene ${sceneId} rolled back`);
}