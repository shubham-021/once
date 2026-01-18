import { create } from "zustand";

interface CreateStore {
    open: boolean;
    setOpen: (open: boolean) => void
}


export const useCreateStore = create<CreateStore>()((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open })
}))