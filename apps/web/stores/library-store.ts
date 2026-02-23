import { Story } from "@once/shared";
import { create } from "zustand";

interface LibraryStore {
    inProgress: boolean;
    setInProgress: (progress:boolean) => void;
    stories: Story[];
    setStories: (stories: Story[]) => void;
    showPublicDescription: boolean;
    setShowPublicDescription: (show: boolean) => void;
    inFocusStory: Story | null;
    setInFocusStory : (story: Story) => void;
}

export const useLibraryStore = create<LibraryStore>()((set) => ({
    inProgress: false,
    setInProgress: (progress) => set({inProgress: progress}),
    stories: [],
    setStories: (stories) => set({stories}),
    showPublicDescription: false,
    setShowPublicDescription: (show) => set({showPublicDescription: show}),
    inFocusStory: null,
    setInFocusStory: (story) => set({inFocusStory: story})
}))