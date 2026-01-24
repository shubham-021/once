import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { creditTransactions, db, eq } from "@once/database";
import { config } from "dotenv";
import { user, session, account, verification } from "@once/database";
import { dodopayments, checkout, portal, webhooks } from "@dodopayments/better-auth";
import Dodopayments from "dodopayments";
import { addCredits } from "@once/core";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { CREDITS_MAP } from "./rates";
import { sendEmail } from "./email";
import { emailOTP } from "better-auth/plugins";

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../../../../.env") });

// console.log(process.env.DODO_PAYMENT_API_KEY)

const dodoClient = new Dodopayments({
    bearerToken: process.env.DODO_PAYMENT_API_KEY,
    environment: "live_mode"
})

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification }
    }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [
        process.env.FRONTEND_URL || "http://localhost:3000"
    ],
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    // emailVerification: {
    //     sendOnSignUp: true,
    //     autoSignInAfterVerification: true,
    //     callbackURL:  `${process.env.FRONTEND_URL}/auth/login`,
    //     sendVerificationEmail: async ({ user, url }) => {
    //         // console.log(`[Auth] Sending verification email to: ${user.email}`);
    //         // console.log(`[CALLBACK] Callback url: ${process.env.FRONTEND_URL}`);
    //         try {
    //             const result = await sendEmail({
    //                 to: user.email,
    //                 subject: 'Verify your email - Once',
    //                 html: `
    //                     <h2>Welcome to Once!</h2>
    //                     <p>Click the link below to verify your email address:</p>
    //                     <a href="${url}">Verify Email</a>
    //                     <p>If you didn't create an account, you can ignore this email.</p>
    //                 `
    //             });
    //             // console.log(`[Auth] Email sent successfully:`, result);
    //         } catch (error) {
    //             console.error(`[Auth] Failed to send verification email:`, error);
    //         }
    //     },
    // },
    plugins: [
        dodopayments({
            client: dodoClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        { productId: process.env.STARTER_PRODUCT_ID!, slug: "starter" },
                        { productId: process.env.EXPLORER_PRODUCT_ID!, slug: "explorer" },
                        { productId: process.env.STORYTELLER_PRODUCT_ID!, slug: "storyteller" },
                        { productId: process.env.AUTHOR_PRODUCT_ID!, slug: "author" },
                        { productId: process.env.TEST_PRODUCT_ID!, slug: "test" }
                    ],
                    successUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/credits/success`,
                    authenticatedUsersOnly: true
                }),
                portal(),
                webhooks({
                    webhookKey: process.env.DODO_WEBHOOK_SECRET!,
                    onPaymentSucceeded: async (payload) => {
                        const data = payload.data;

                        if (!data.product_cart) throw new Error("No product id");

                        const productId = data.product_cart[0].product_id;

                        const credits = CREDITS_MAP[productId];

                        if (!credits) {
                            throw new Error(`No credits in metadata for payment: ${data.payment_id}`);
                        }

                        const foundUser = await db.query.user.findFirst({
                            where: eq(user.email, data.customer.email)
                        })

                        if (!foundUser) throw new Error(`User not found for email: ${data.customer.email}`);

                        const existingTx = await db.query.creditTransactions.findFirst({
                            where: eq(creditTransactions.paymentId, data.payment_id)
                        })

                        if (existingTx) {
                            console.log("Already processed: ", data.payment_id);
                            return;
                        }

                        await addCredits({
                            userId: foundUser.id,
                            credits: Number(credits),
                            paymentId: data.payment_id,
                            packageName: productId,
                            amountPaid: data.total_amount
                        })

                        console.log(`Added ${credits} credits for user ${foundUser.id}`);
                    }
                })
            ]
        }),
        emailOTP({
            overrideDefaultEmailVerification: true,
            otpLength: 6,
            expiresIn: 300,
            async sendVerificationOTP({email,otp,type}) {
                console.log(`[OTP VERIFICATION]: ${email}`);
                console.log(`[OTP VERIFICATION]: ${otp}`);
                console.log(`[OTP VERIFICATION]: ${type}`);
                if (type === "email-verification"){
                    try {
                        const result = await sendEmail({
                            to: email,
                            subject: 'Verify your email - Once',
                            html: `
                                <h2>Welcome to Once!</h2>
                                <p>Here is your otp for verification: </p>
                                ${otp}
                                <p>If you didn't create an account, you can ignore this email.</p>
                            `
                        });
                    // console.log(`[Auth] Email sent successfully:`, result);
                    } catch (error) {
                        console.error(`[Auth] Failed to send verification email:`, error);
                    }
                }
            }
        })
    ]
    // socialProviders: {
    //     google: {
    //         clientId: process.env.GOOGLE_CLIENT_ID!,
    //         clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    //     },
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID!,
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET!
    //     }
    // }
})