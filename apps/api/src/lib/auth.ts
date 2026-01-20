import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { creditTransactions, db, eq } from "@once/database";
import { user, session, account, verification } from "@once/database";
import { dodopayments, checkout, portal, webhooks } from "@dodopayments/better-auth";
import Dodopayments from "dodopayments";
import { addCredits } from "@once/core";
import { CREDITS_MAP } from "./rates";
import { AT_PD_ID, DODO_API_KEY, EXP_PD_ID, FE_URL, STORY_PD_ID, STRTR_PD_ID, TEST_PD_ID } from "@/envProvider";

// const __dirname = dirname(fileURLToPath(import.meta.url))
// config({ path: resolve(__dirname, "../../../../.env") });

// console.log(process.env.DODO_PAYMENT_API_KEY)

const dodoClient = new Dodopayments({
    bearerToken: DODO_API_KEY,
    environment: "live_mode"
})

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { user, session, account, verification }
    }),
    emailAndPassword: {
        enabled: true
    },
    trustedOrigins: [
        FE_URL
    ],
    plugins: [
        dodopayments({
            client: dodoClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        { productId: STRTR_PD_ID, slug: "starter" },
                        { productId: EXP_PD_ID, slug: "explorer" },
                        { productId: STORY_PD_ID, slug: "storyteller" },
                        { productId: AT_PD_ID, slug: "author" },
                        { productId: TEST_PD_ID, slug: "test" }
                    ],
                    successUrl: `${FE_URL}/credits/success`,
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