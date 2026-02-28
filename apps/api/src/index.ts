import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { setCookie } from "hono/cookie";
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
import { db, eq, user, verification } from "@once/database";

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

    if (!email || typeof email !== "string") return error(c, "MISSING_FIELD", "Email is required");

    const otp = Math.floor(Math.random() * 900000) + 100000;
    const identifier = `signup-otp-${email.toLocaleLowerCase()}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {

        await db.transaction(async (tx) => {

            const response = await tx.query.user.findFirst({ where: eq(user.email, email) });

            if (response) {
                throw { code: 'email_exists' };
            }

            await tx.delete(verification).where(eq(verification.identifier, identifier));
            await tx.insert(verification).values({
                id: crypto.randomUUID(),
                identifier: identifier,
                value: otp.toString(),
                expiresAt: expiresAt
            })
        })

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
    } catch (err: any) {
        if (err.code === 'email_exists') return error(c, 'FORBIDDEN', "Email already exists");
        return error(c, "INTERNAL_ERROR", "Failed to send otp");
    }
})

app.post("/verifyOtp", async (c) => {
    const body = await c.req.json();
    const { name, email, password, otp } = body;

    if (!email || !otp) return error(c, "MISSING_FIELD", "Email and otp are required");

    const identifier = `signup-otp-${email.toLocaleLowerCase()}`;

    try {
        const record = await db.query.verification.findFirst({
            where: eq(verification.identifier, identifier)
        })

        if (!record) return error(c, "INVALID_OTP", "Invalid or expired otp");

        if (record.expiresAt < new Date()) {
            await db.delete(verification).where(eq(verification.identifier, identifier));
            return error(c, "EXPIRED_OTP", "OTP has expired");
        }

        if (record.value !== otp.toString()) {
            return error(c, "INVALID_OTP", "Invalid otp");
        }

        const signupResponse = await auth.api.signUpEmail({
            body: { name, email, password },
            asResponse: true
        })

        if (!signupResponse.ok) {
            const errData = await signupResponse.json();
            return error(c, errData.code || "SIGNUP_FAILED", "Failed to create account");
        }

        await db.transaction(async (tx) => {
            await tx.update(user).set({ emailVerified: true }).where(eq(user.email, email.toLocaleLowerCase()));
            await tx.delete(verification).where(eq(verification.identifier, identifier));
        })

        const cookies = signupResponse.headers.getSetCookie();

        const response = new Response(JSON.stringify({success: true}), {
            status: 200,
            headers: {
                'Content-Type' : 'application/json'
            }
        })

        for (const cookie of cookies) {
            response.headers.append('Set-cookie', cookie);
        }

        return response;
    } catch (err) {
        console.error("Verify otp error: ", err);
        return error(c, "INTERNAL_ERROR", "Failed to verify otp");
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