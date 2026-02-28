"use client";

import React, { ButtonHTMLAttributes, useEffect, useState } from "react";
import { emailOtp, signUp, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import { getToastErrorMessage } from "@/lib/error-mapper";

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

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {data: session, refetch} = useSession();

    useEffect(() => {
        if(session) router.push('/library');
    },[session]);

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

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sendOtp`, {
                method: "POST",
                body: JSON.stringify({ email })
            })

            const resData = await response.json();

            if (!response.ok) throw { status: response.status };

            toast.success("Otp sent to your email");
            setShowOtpField(true);
        } catch (err: any) {
            if (err.status === 403) {
                toast.error('Email already exists.')
                return;
            }

            toast.error('Failed to send otp. Try again later.')
        } finally {
            setSendingOtp(false);
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

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/verifyOtp`, {
                method: "POST",
                body: JSON.stringify({ name, password, email, otp }),
                credentials: 'include'
            })

            const resData = await response.json();

            // console.log('Response: ', JSON.stringify(resData));

            if (!response.ok) {
                throw new Error("Signup failed");
            }

            await refetch();
            router.push("/library");
        } catch (error) {
            toast.error('Signup failed. Please try again after sometime.');
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
                                className="w-full px-4 py-3 bg-surface border border-line rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                                required
                            />

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
                                    type={!showPassword ? "password" : "text"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface border border-line rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer bg-surface"
                                >
                                    {!showPassword ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type={!showConfirmPassword ? "password" : "text"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface border border-line rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer bg-surface"
                                >
                                    {!showConfirmPassword ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={sendingOtp}
                                onClick={handleOtp}
                                className={cn(
                                    "w-full py-3 bg-accent/20 border border-accent/40 text-white rounded-md font-medium hover:bg-accent/40 transition-opacity disabled:opacity-50 cursor-pointer",
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
                            className="w-full px-4 py-3 bg-surface border border-line rounded-md text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                            required
                        />

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={cn(
                                "w-full py-3 bg-accent/20 border border-accent/40 rounded-md text-white font-medium hover:bg-accent/40 disabled:opacity-50 cursor-pointer",
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