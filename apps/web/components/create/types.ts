import { CreateStoryInput } from "@once/shared";

// something new , first time seeing these formats

export interface CreateStoryFormState extends Omit<CreateStoryInput, 'cast'> {
    cast: Array<{ id: string; name: string; description: string }>
}

export interface StepProps {
    form: CreateStoryFormState;
    updateForm: <K extends keyof CreateStoryFormState>(
        key: K,
        value: CreateStoryFormState[K]
    ) => void
}