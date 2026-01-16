import { create } from "zustand";
import { creditsApi } from "@/lib/api";

interface CreditsStore {
    balance: number;
    loading: boolean;
    fetchCredits: () => Promise<void>;
    setBalance: (balance: number) => void;
}

export const useCreditStore = create<CreditsStore>()((set) => ({
    balance: 0,
    loading: true,
    fetchCredits: async () => {
        try {
            set({ loading: true });
            const data = await creditsApi.get();
            set({ balance: data.data?.balance, loading: false })
        } catch (err) {
            console.error("Failed to fetch credits: ", err);
            set({ loading: false })
        }
    },
    setBalance: (balance) => set({ balance })
}))