import { create } from "zustand";

interface UpvoteStore {
    upvotedIds: Set<number>;
    counts: Record<number, number>;
    initialise: (upvotedIds: number[], stories: { id: number | string; upvotes: number }[]) => void;
    toggle: (storyId: number, currentCount: number) => { nowUpvoted: boolean };
}

export const useUpvotesStore = create<UpvoteStore>((set, get) => ({
    upvotedIds: new Set(),
    counts: {},
    initialise: (upvotedIds, stories) => {
        const counts: Record<number, number> = {};
        for (const s of stories) counts[Number(s.id)] = s.upvotes;
        set({ upvotedIds: new Set(upvotedIds), counts })
    },
    toggle: (storyId, currentCount) => {
        const { upvotedIds, counts } = get();
        const wasUpvoted = upvotedIds.has(storyId);
        const newUpvotedIds = new Set(upvotedIds);

        if (wasUpvoted) newUpvotedIds.delete(storyId);
        else newUpvotedIds.add(storyId);

        set({
            upvotedIds: newUpvotedIds,
            counts: { ...counts, [storyId]: wasUpvoted ? currentCount - 1 : currentCount + 1 }
        });

        return { nowUpvoted: !wasUpvoted }
    }
}))