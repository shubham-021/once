import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import storiesRouter from "./routes/stories";
import { success, error } from "./lib/response";
import vaultRouter from "./routes/vault";
import { auth } from "./lib/auth";
import { authMiddleware, requireAuth } from "./middleware/auth";
import creditsRouter from "./routes/credits";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { sendEmail } from "./lib/email";

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../../../.env") });

const app = new Hono();


app.use("*", logger()); // logs every incoming req (helps in debugging)
app.use("*", prettyJSON()); // makes api response easier to read when testing in browser or curl
app.use("*",
    cors({
        origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
        credentials: true,
    })
);
app.use("*", authMiddleware);


app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.post("/sendOtp", async (c) => {
    const body = await c.req.json();
    const email = body.email;

    if (!email) return error(c, "MISSING_FIELD", "Email is required");

    const otp = Math.floor(Math.random() * 900000) + 100000;

    try {
        await sendEmail({
            to: email,
            subject: 'Verify your email - Once',
            html: `
                <h2>Welcome to Once!</h2>
                <p>Here is your OTP for verification: </p>
                <h3>${otp}</h3>
                <p>If you didn't create an account, you can ignore this email.</p>
            `
        });

        return success(c, { data: "OTP sent" });
    } catch (err) {
        return error(c, "INTERNAL_ERROR", "Failed to send otp");
    }
})

app.route("/api/stories", storiesRouter);
app.route("/api/vault", vaultRouter);
app.route("/api/credits", creditsRouter);


app.onError((err, c) => {
    console.error(`Error: ${err.message}`);
    return error(c, "INTERNAL_ERROR", err.message)
});

app.notFound((c) => {
    return error(c, "NOT_FOUND", "Not found");
});

const PORT = process.env.PORT || 3001;

console.log(`Server starting on port ${PORT}`);

export default {
    port: PORT,
    fetch: app.fetch,
    idleTimeout: 120
};