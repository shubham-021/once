"use client";

import { useSession } from "@/lib/auth-client";
import { useCreditStore } from "@/stores/credits-store";
import { useEffect } from "react";


export function CreditsProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const fetchCredits = useCreditStore((s) => s.fetchCredits);

    useEffect(() => {
        if (session?.user) fetchCredits();
    }, [session?.user, fetchCredits])

    return <>{children}</>
}