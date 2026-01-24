"use client";

import React, { ButtonHTMLAttributes, useState } from "react";
import { emailOtp, signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [showOtpfield, setShowOtpField] = useState(false);
    const [otp, setOtp] = useState("");

    const handleOtp = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            // setError("Passwords don't match");
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 8) {
            // setError("Password must be atleast 8 characters");
            toast.error("Password must be atleast 8 characters")
            return;
        }


        setSendingOtp(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sendOtp`, {
            method: "POST",
            body: JSON.stringify({ email })
        })

        if (!response.ok) {
            toast.error("Failed to send otp , try again later !!");
            return;
        } else {
            toast.success("Otp sent to your email");
            setShowOtpField(true);
        }
    }

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // setError("");

        if (otp.trim().length === 0) {
            toast.error("OTP is required !!")
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await emailOtp.checkVerificationOtp({
                email,
                type: "sign-in",
                otp
            })

            if (error) {
                console.log("[OTP CHECK ERROR]:", error);
                toast.error(error.message || "Invalid OTP !!");
                return;
            }

            const result = await signUp.email({
                name: name.trim(),
                email: email.trim(),
                password
            });

            if (result.error) throw new Error(result.error.message || "Signup failed");
            //     {
            //     // setError(result.error.message || "Signup failed");
            //     toast.error(result.error.message || "Signup failed");
            //     setLoading(false);
            //     return;
            // }

            router.push("/library");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl text-foreground">Create your account</h1>
                    <p className="text-sm text-muted mt-2">Start writing stories that matter</p>
                </div>

                {!showOtpfield
                    ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-line text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-line text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                                required
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-line text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                                required
                                minLength={8}
                            />

                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-surface border border-line text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                                required
                            />

                            <button
                                type="submit"
                                disabled={sendingOtp}
                                onClick={handleOtp}
                                className={cn(
                                    "w-full py-3 bg-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer",
                                )}
                            >
                                {sendingOtp ? 'Sending OTP...' : 'Submit'}
                            </button>
                        </div>
                    ) :
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 bg-surface border border-line text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                            required
                        />

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={cn(
                                "w-full py-3 bg-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer",
                            )}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                }

                <p className="text-center text-sm text-muted">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-accent hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}