import { Hono } from "hono";
import { db, eq } from "@once/database";
import { userCredits } from "@once/database";
import { AuthVariables, requireAuth } from "../middleware/auth";
import { error, success } from "@/lib/response";

const creditsRouter = new Hono<{ Variables: AuthVariables }>();

creditsRouter.use("*", requireAuth);

creditsRouter.get("/", async (c) => {
    const user = c.get("user");

    if (!user) return error(c, "INVALID_USER_ID");

    const userCredit = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, user.id)
    });

    return success(c, { balance: userCredit?.balance ?? 0 })
});

export default creditsRouter;