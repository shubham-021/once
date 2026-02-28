"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeClosed } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [passwordType, setPasswordType] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await signIn.email({
            email,
            password,
        }, {
            onError: (data) => {
                if (data.error.status === 403) {
                    toast.error("Please verify your email address first");
                }
            }
        });

        if (result.error && result.error.status !== 403) {
            // setError(result.error.message || "Login failed");
            toast.error(result.error.message || "Login failed")
            setLoading(false);
            return;
        }

        router.push("/library");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl text-foreground">Welcome back</h1>
                    <p className="text-sm text-muted mt-2">Sign in to continue your stories</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-line rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                        required
                    />

                    <div className="relative">
                        <input
                            type={passwordType ? "password" : "text"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-surface border border-line rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setPasswordType((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer bg-surface"
                        >
                            {passwordType ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-accent/20 border border-accent/40 hover:bg-accent/40 text-white font-medium rounded-md disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-accent hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}