import { CreateStoryInput } from "@once/shared";
import { create } from "zustand";

interface CreateStore {
    open: boolean;
    setOpen: (open: boolean) => void;
    isCreating: boolean;
    setIsCreating: (isCreating: boolean) => void;
    // formData: CreateStoryInput | null;
    // setFormData: (data: CreateStoryInput | null) => void;
}


export const useCreateStore = create<CreateStore>()((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
    isCreating: false,
    setIsCreating: (isCreating: boolean) => set({ isCreating })
    // formData: null,
    // setFormData: (formData: CreateStoryInput | null) => set({ formData })
}))