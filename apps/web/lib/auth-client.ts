import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    plugins: [dodopaymentsClient()]
})

export const { signIn, signOut, signUp, useSession } = authClient;