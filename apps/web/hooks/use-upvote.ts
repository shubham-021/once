import { storiesApi } from "@/lib/api";
import { useUpvotesStore } from "@/stores/upvotes-store";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function useUpvote(storyId: string) {
    const id = Number(storyId);

    const [isUpvoting, setIsUpvoting] = useState(false);
    const hasUpvoted = useUpvotesStore(s => s.upvotedIds.has(id));
    const upvoteCount = useUpvotesStore(s => s.counts[id] ?? 0);
    const toggle = useUpvotesStore(s => s.toggle);

    const upvoteRef = useRef<NodeJS.Timeout | null>(null);


    const toggleUpvote = useCallback(async () => {
        if(upvoteRef.current) clearTimeout(upvoteRef.current);

        try {
            const countBeforeToggle = upvoteCount;
            toggle(id, countBeforeToggle);

            upvoteRef.current = setTimeout(async () => {
                const result = await storiesApi.upvote(storyId);

                if (result.error) {
                    toggle(id, hasUpvoted ? countBeforeToggle - 1 : countBeforeToggle + 1);
                    toast.error(result.error.message);
                }
            }, 2000)
        } catch {
            toast.error('Failed to upvote.');
        }
    }, [id, storyId, upvoteCount, toggle]);

    return { hasUpvoted, upvoteCount, toggleUpvote, isUpvoting };
}