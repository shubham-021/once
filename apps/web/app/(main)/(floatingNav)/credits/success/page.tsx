"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreditStore } from "@/stores/credits-store";

export default function CreditsSuccessPage() {
    const router = useRouter();
    const fetchCredits = useCreditStore((s) => s.fetchCredits);

    useEffect(() => {
        fetchCredits();
        toast.success("Purchase successful! Credits added to your account.", {
            id: "payment-sucess" // so strict mode doesnt render it twice
        });

        router.replace("/library");
    }, [fetchCredits, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted">Redirecting...</p>
        </div>
    );
}