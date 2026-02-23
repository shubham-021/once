import { Hono } from "hono";
import { and, db, eq } from "@once/database";
import { stories } from "@once/database";
import { success, error } from "@/lib/response";
import { requireAuth } from "@/middleware/auth";

const options = new Hono();

// options.post("/health", (c) => {
//     return c.json({data: 'Good'});
// })

options.patch("/:id/forkOptions", requireAuth, async (c) => {
    const user = c.get("user");
    if(!user) return error(c,"INVALID_USER_ID","Unauthorised");

    const storyId = parseInt(c.req.param("id"));
    // console.log(storyId);
    if(Number.isNaN(storyId)) return error(c,"INVALID_ID","StoryId is required");

    const { allowForking } = await c.req.json() as {allowForking : boolean};

    if(allowForking === undefined) return error(c,"MISSING_FIELD");

    try{
        await db.transaction(async (tx) => {
            const story = await tx.query.stories.findFirst({where: and(eq(stories.userId, user.id),eq(stories.id, storyId))});
            if(!story) throw {code: "story_not_found"};

            await tx.update(stories).set({allowForking}).where(and(eq(stories.userId, user.id),eq(stories.id, storyId)));
        })

        return success(c,{data: "Successfully updated"},200);
    } catch(err:any) {
        if(err.code === "story_not_found") return error(c,"STORY_NOT_FOUND");
        return error(c,"INTERNAL_ERROR");
    }
})

options.patch("/:id/status", requireAuth, async (c) => {
    const user = c.get("user");
    if(!user) return error(c,"INVALID_USER_ID","Unauthorised");

    const storyId = parseInt(c.req.param("id"));
    // console.log(storyId);
    if(Number.isNaN(storyId)) return error(c,"INVALID_ID","StoryId is required");

    const { status } = await c.req.json() as {status : "active" | "completed"};

    if(status === undefined) return error(c,"MISSING_FIELD");

    try{
        await db.transaction(async (tx) => {
            const story = await tx.query.stories.findFirst({where: and(eq(stories.userId, user.id),eq(stories.id, storyId))});
            if(!story) throw {code: "story_not_found"};

            await tx.update(stories).set({status}).where(and(eq(stories.userId, user.id),eq(stories.id, storyId)));
        })

        return success(c,{data: "Successfully updated"},200);
    } catch(err:any) {
        if(err.code === "story_not_found") return error(c,"STORY_NOT_FOUND");
        return error(c,"INTERNAL_ERROR");
    }
})

options.patch("/:id/visibility", requireAuth, async (c) => {
    const user = c.get("user");
    if(!user) return error(c,"INVALID_USER_ID","Unauthorised");

    const storyId = parseInt(c.req.param("id"));
    // console.log(storyId);
    if(Number.isNaN(storyId)) return error(c,"INVALID_ID","StoryId is required");

    let { visibility, publicDescription } = await c.req.json() as {visibility: "private"|"public", publicDescription?: string};

    if(visibility === undefined) return error(c,"MISSING_FIELD");

    try{
        await db.transaction(async (tx) => {
            const story = await tx.query.stories.findFirst({where: and(eq(stories.userId, user.id),eq(stories.id, storyId))});
            if(!story) throw {code: "story_not_found"};

            const providedDescription = (typeof publicDescription === "string") ? publicDescription.trim() : undefined;

            if(visibility === "public" && !providedDescription && !story.publicDescription) throw {code: "description_missing"};

            const toUpdate: Partial<{visibility: "private"|"public"; publicDescription: string}> = {};

            if(visibility === "private") toUpdate.visibility = "private";
            if(visibility === "public"){
                toUpdate.visibility = "public";
                if(providedDescription !== undefined) toUpdate.publicDescription = providedDescription;
            };

            await tx.update(stories).set(toUpdate).where(and(eq(stories.userId, user.id),eq(stories.id, storyId)));
        })

        return success(c,{data: "Successfully updated"},200);
    } catch(err:any) {
        if(err.code === "story_not_found") return error(c,"STORY_NOT_FOUND");
        if(err.code === "description_missing") return error(c,"MISSING_FIELD","Description is missing");
        return error(c,"INTERNAL_ERROR");
    }
})

export default options;