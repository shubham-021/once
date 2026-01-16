"use client";

import { authClient } from "@/lib/auth-client";
import { useCreditStore } from "@/stores/credits-store";
import { Coins } from "lucide-react";

const creditPackages = [
    { slug: "test", name: "Test", credits: 1000, price: "$0.50" },
    { slug: "starter", name: "Starter", credits: 2000, price: "$4.99" },
    { slug: "explorer", name: "Explorer", credits: 4000, price: "$9.99" },
    { slug: "storyteller", name: "Storyteller", credits: 8000, price: "$19.99" },
    { slug: "author", name: "Author", credits: 20000, price: "$49.99" },
];

export default function CreditsPage() {
    const { balance } = useCreditStore();

    const handlePurchase = async (slug: string) => {
        const { data, error } = await authClient.dodopayments.checkoutSession({
            slug
        });

        if (data?.url) {
            window.location.href = data.url;
        }
    };

    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Credits</h1>
                <div className="flex items-center gap-2 text-lg text-muted">
                    <Coins className="size-5" />
                    <span>Current balance: <strong className="text-foreground">{balance.toLocaleString()}</strong></span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {creditPackages.map((pkg) => (
                    <button
                        key={pkg.slug}
                        onClick={() => handlePurchase(pkg.slug)}
                        className="p-6 rounded-lg border border-line bg-surface hover:border-accent transition-colors text-left"
                    >
                        <div className="text-xl font-semibold mb-1">{pkg.name}</div>
                        <div className="text-2xl font-bold text-accent mb-2">{pkg.credits.toLocaleString()} credits</div>
                        <div className="text-muted">{pkg.price}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}