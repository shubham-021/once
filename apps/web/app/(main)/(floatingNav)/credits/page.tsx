"use client";

import { useCreditStore } from "@/stores/credits-store";
import { authClient } from "@/lib/auth-client";
import { Coins, Loader2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const creditPackages = [
    {
        slug: "starter",
        name: "Starter",
        credits: 2000,
        price: "$4.99",
        description: "Perfect for trying things out",
        turnsEstimate: "~20 story turns"
    },
    {
        slug: "explorer",
        name: "Explorer",
        credits: 4000,
        price: "$9.99",
        description: "For casual storytellers",
        turnsEstimate: "~40 story turns"
    },
    {
        slug: "storyteller",
        name: "Storyteller",
        credits: 8000,
        price: "$19.99",
        description: "Most popular choice",
        turnsEstimate: "~80 story turns",
        highlight: true,
        badge: "Popular"
    },
    {
        slug: "author",
        name: "Author",
        credits: 20000,
        price: "$49.99",
        description: "Best value for dedicated writers",
        turnsEstimate: "~200 story turns",
        badge: "Best Value"
    },
];

// Only show test package in dev
const isDev = process.env.NODE_ENV === "development";
const testPackage = {
    slug: "test",
    name: "Test",
    credits: 1000,
    price: "$0.50",
    description: "Development only",
    turnsEstimate: "~10 story turns"
};

export default function CreditsPage() {
    const { balance } = useCreditStore();
    const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

    const handlePurchase = async (slug: string) => {
        setLoadingSlug(slug);
        const { data, error } = await authClient.dodopayments.checkoutSession({
            slug
        });

        if (data?.url) {
            window.location.href = data.url;
        } else {
            setLoadingSlug(null);
        }
    };

    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            <div className="mb-12">
                <h1 className="text-3xl font-bold mb-6">Credits</h1>

                <div className="p-6 rounded-xl border border-line bg-surface">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                            <Coins className="size-5 text-accent" />
                        </div>
                        <span className="text-muted">Your Balance</span>
                    </div>
                    <div className="text-4xl font-bold mb-2">
                        {balance.toLocaleString()} <span className="text-lg font-normal text-muted">credits</span>
                    </div>
                    <p className="text-sm text-muted">
                        ≈ {Math.floor(balance / 100)} story turns remaining
                    </p>
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-xl font-semibold mb-6">Choose a package</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isDev && (
                        <button
                            onClick={() => handlePurchase(testPackage.slug)}
                            disabled={loadingSlug !== null}
                            className="p-6 rounded-xl border border-dashed border-line bg-surface/50 hover:border-muted transition-colors text-left opacity-60 cursor-pointer"
                        >
                            {loadingSlug === testPackage.slug ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="size-5 animate-spin text-muted" />
                                </div>
                            ) : (
                                <>
                                    <div className="text-sm text-muted mb-1">DEV ONLY</div>
                                    <div className="text-lg font-semibold">{testPackage.name}</div>
                                    <div className="text-2xl font-bold text-foreground my-2">
                                        {testPackage.credits.toLocaleString()}
                                    </div>
                                    <div className="text-muted">{testPackage.price}</div>
                                </>
                            )}
                        </button>
                    )}

                    {creditPackages.map((pkg) => (
                        <button
                            key={pkg.slug}
                            onClick={() => handlePurchase(pkg.slug)}
                            disabled={loadingSlug !== null}
                            className={cn(
                                "relative p-6 rounded-xl border text-left transition-all cursor-pointer",
                                pkg.highlight
                                    ? "border-accent bg-accent/5 hover:bg-accent/10"
                                    : "border-line bg-surface hover:border-foreground/20"
                            )}
                        >
                            {pkg.badge && (
                                <div className="absolute -top-2.5 left-4 px-2 py-0.5 text-xs font-medium bg-accent text-background rounded">
                                    {pkg.badge}
                                </div>
                            )}

                            {loadingSlug === pkg.slug ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="size-6 animate-spin text-accent" />
                                </div>
                            ) : (
                                <>
                                    <div className="text-lg font-semibold mb-1">{pkg.name}</div>
                                    <div className="text-3xl font-bold text-foreground my-2">
                                        {pkg.credits.toLocaleString()}
                                        <span className="text-sm font-normal text-muted ml-1">credits</span>
                                    </div>
                                    <div className="text-xl font-semibold text-accent mb-2">{pkg.price}</div>
                                    <p className="text-sm text-muted">{pkg.description}</p>
                                    <p className="text-xs text-muted/70 mt-1">{pkg.turnsEstimate}</p>
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-line pt-8">
                <h3 className="text-sm font-medium text-muted mb-4">How credits work</h3>
                <ul className="space-y-2 text-sm text-muted/80">
                    <li className="flex items-center gap-2">
                        <Zap className="size-4 text-accent" />
                        <span>~100 credits per story turn (varies by complexity)</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Sparkles className="size-4 text-accent" />
                        <span>Credits never expire — use them whenever you want</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <Coins className="size-4 text-accent" />
                        <span>Only used for AI generation, not storage</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}