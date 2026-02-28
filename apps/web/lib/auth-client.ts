import { createAuthClient } from "better-auth/react";
import { dodopaymentsClient } from "@dodopayments/better-auth";
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    fetchOptions: {
        credentials: 'include'
    },
    plugins: [dodopaymentsClient(), emailOTPClient()]
})



export const { signIn, signOut, signUp, useSession, emailOtp } = authClient;