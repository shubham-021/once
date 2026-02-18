import { Hono } from "hono";
import { db, eq } from "@once/database";
import { stories } from "@once/database";
import { success, error } from "@/lib/response";
import { requireAuth } from "@/middleware/auth";

const options = new Hono();

// options.post("/health", (c) => {
//     return c.json({data: 'Good'});
// })

options.post("/:id", requireAuth, async (c) => {
    const user = c.get("user");
    if(!user) return error(c,"INVALID_USER_ID","Unauthorised");

    const storyId = parseInt(c.req.param("id"));
    console.log(storyId);
    if(!storyId) return error(c,"INVALID_ID","StoryId is required");

    const visibility = c.req.query("visibility") as "public" | "private" | undefined
    const status = c.req.query("status") as "active" | "completed" | undefined

    const updateData: Partial<{ visibility: "public" | "private"; status: "active" | "completed" }> = {}

    if (visibility) updateData.visibility = visibility
    if (status) updateData.status = status

    if (Object.keys(updateData).length === 0) {
        return error(c,"MISSING_FIELD","Nothing to update");
    }

    try{
        await db.update(stories).set(updateData).where(eq(stories.id, storyId))
        return success(c,{data: "Successfully updated"},200);
    } catch {
        return error(c,"INTERNAL_ERROR");
    }
})

export default options;