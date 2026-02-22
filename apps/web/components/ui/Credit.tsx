import { cn } from "@/lib/utils";
import { useCreditStore } from "@/stores/credits-store";
import { Coins } from "lucide-react";

export default function Credit({className}:{className: string}) {

    const balance = useCreditStore((s) => s.balance);
    const creditsLoading = useCreditStore((s) => s.loading);

    return(
        <div className={cn("flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors",className)}>
            {/* <Coins className="size-3.5" /> */}
            <span>Credits: </span>
            <span className="text-accent">{creditsLoading ? 0 : balance.toLocaleString()}</span>
        </div>
    )
}