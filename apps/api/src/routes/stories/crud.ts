import { Hono } from "hono";
import { db, eq, desc, and, count, gte } from "@once/database";
import { codexEntries, drafts, protagonists, scenes, stories } from "@once/database/schema";
import { success, error, paginated } from "@/lib/response";
import { createStorySchema, GenreFilter } from "@once/shared/schemas";
import { requireAuth, type AuthVariables } from "@/middleware/auth";
import { checkCredits, createStory, InsufficientCreditsError } from "@once/core";

const crudRouter = new Hono<{ Variables: AuthVariables }>();

crudRouter.get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const userStories = await db.query.stories.findMany({
        where: eq(stories.userId, user.id),
        orderBy: desc(stories.updatedAt)
    })

    return success(c, userStories);
});

crudRouter.get("/discover/stats", async (c) => {
    const storiesCount = await db.select({ count: count() }).from(stories).where(eq(stories.visibility, "public"));
    const writersCount = await db.selectDistinct({ userId: stories.userId }).from(stories).where(eq(stories.visibility, "public"));
    // wordsWrittenToday

    return success(c, { storiesPublished: storiesCount[0].count, activeWriters: writersCount.length })
})

crudRouter.get("/discover", async (c) => {
    const page = Number(c.req.query("page") || "1");
    const limit = Number(c.req.query("limit") || "20");
    const offset = (page - 1) * limit;

    const genre = c.req.query("genre") as GenreFilter;
    const sortBy = c.req.query("sortBy") || "hot";

    const conditions = [eq(stories.visibility, "public")]

    if (genre && genre !== "All") {
        conditions.push(eq(stories.genre, genre))
    }

    const publicStories = await db.query.stories.findMany({
        where: (and(...conditions)),
        orderBy: sortBy === 'new' ? desc(stories.createdAt) : desc(stories.upvotes),
        limit,
        offset,
        with: { user: true },
    });

    const formattedStories = publicStories.map(story => ({
        id: String(story.id),
        title: story.title,
        author: story.user.name,
        genre: story.genre,
        upvotes: story.upvotes,
        description: story.description ?? "",
        turnCount: story.turnCount
    }))

    const total = await db.select({ count: stories.id })
        .from(stories)
        .where(and(...conditions));

    return paginated(c, formattedStories, { page, pageSize: limit, total: total[0]?.count || 0 });
});

crudRouter.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
        return error(c, "INVALID_ID");
    }

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, id),
        with: {
            protagonist: true,
            user: true
        }
    });

    if (!story) {
        return error(c, "NOT_FOUND", "Story not found");
    }

    const user = c.get("user");
    const isOwner = user && story.userId === user.id;
    const isPublic = story.visibility === "public";

    if (!isOwner && !isPublic) {
        return error(c, "FORBIDDEN", "This story is private");
    }

    return success(c, story);
})

crudRouter.post("/", requireAuth, async (c) => {
    const body = await c.req.json();
    const parsed = createStorySchema.safeParse(body);

    if (!parsed.success) {
        return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);
    }

    const { title, genre, narrativeStance, storyMode, storyIdea, worldDescription, promptForOnce, startingScene, cast, castMode, protagonist } = parsed.data;
    const user = c.get("user")!;

    try {
        if (process.env.DEV_MODE === "false") await checkCredits(user.id);

        const { storyWithRelations } = await createStory({
            user,
            title,
            genre,
            narrativeStance,
            storyMode,
            storyIdea,
            worldDescription,
            promptForOnce,
            startingScene,
            castMode,
            cast,
            protagonist
        });

        return success(c, storyWithRelations, 201);
    } catch (err) {
        if (err instanceof InsufficientCreditsError) return error(c, "INSUFFICIENT_BALANCE", undefined, { balance: err.balance });

        console.error("LLM Error: ", err);
        return error(c, "LLM_ERROR", "Failed to create opening scene");
    }
});

crudRouter.delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
        return error(c, "INVALID_ID", "Invalid story ID");
    }

    const story = await db.query.stories.findFirst({ where: eq(stories.id, id) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    if (!user || story.userId !== user.id) return error(c, "FORBIDDEN", "You can only delete your own stories");

    await db.delete(stories).where(eq(stories.id, id))

    return success(c, { message: "Story deleted" });
});

crudRouter.delete("/undo/:id", requireAuth, async (c) => {
    const storyId = Number(c.req.param("id"));
    if (isNaN(storyId)) {
        return error(c, "INVALID_ID", "Invalid story ID");
    }

    const turnNumber = Number(c.req.query("turnNumber"));
    if (isNaN(turnNumber)) {
        return error(c, "NOT_FOUND", "Invalid turn number");
    }

    if(turnNumber === 1) return error(c,"FORBIDDEN","First scene cannot be undone");

    try{
        await db.transaction(async (tx) => {
            const story = await tx.query.stories.findFirst({where: eq(stories.id, storyId),with: { codexEntries: true }});
            if(!story) throw {type: "story"};

            const scene = await tx.query.scenes.findFirst({where: and(eq(scenes.storyId, storyId), eq(scenes.turnNumber, turnNumber-1))});
            if(!scene) throw {type: "scene"};

            const protagonistSnapshot = scene.protagonistSnapshot;

            if(protagonistSnapshot){
                const {id, ...toBeUpdated} = protagonistSnapshot;
                await tx.update(protagonists).set(toBeUpdated).where(eq(protagonists.storyId, storyId));
            }

            const codexEntriesFromTable = story.codexEntries;
            const codexToBeUndone = codexEntriesFromTable.filter(c => c.firstMentionedSceneId < turnNumber).map(c => {
                let metaData:Record<number,Record<string,string>> = {};
                if(c.metadata){
                    for (const [k,v] of Object.entries(c.metadata)){
                        const localTurnNumber = Number(k);
                        if(localTurnNumber < turnNumber) metaData[localTurnNumber] = v;
                    }
                }

                return {
                    ...c,
                    metadata: metaData
                }
            })

            if(codexToBeUndone.length > 0){
                await tx.delete(codexEntries).where(and(eq(codexEntries.storyId, storyId), gte(codexEntries.firstMentionedSceneId, turnNumber)));
                for (const codex of codexToBeUndone){
                    if(codex){
                        if(Object.keys(codex.metadata).length === 0) {
                            await tx.delete(codexEntries).where(and(eq(codexEntries.storyId, storyId), eq(codexEntries.id, codex.id)));
                        } else {
                            await tx.update(codexEntries).set({metadata: codex.metadata}).where(and(eq(codexEntries.storyId, storyId), eq(codexEntries.id,codex.id)));
                        }
                    }
                }
            }

            await tx.delete(drafts).where(and(eq(drafts.storyId,storyId), gte(drafts.turnNumber, turnNumber)))
            await tx.delete(scenes).where(and(eq(scenes.storyId,storyId), gte(scenes.turnNumber, turnNumber)));
            await tx.update(stories).set({turnCount: scene.turnNumber});
        });

        return success(c,{data: "Success"},200);
    } catch (err:any) {
        if(err.type){
            if(err.type === "story") return error(c,"STORY_NOT_FOUND");
            else if(err.type === "scene") return error(c,"SCENE_NOT_FOUND");
        }

        return error(c,"INTERNAL_ERROR", (err as Error).message);
    }
})

export default crudRouter;
