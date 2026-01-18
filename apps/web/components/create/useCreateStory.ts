import { useState } from "react";
import { CreateStoryFormState } from "./types";

const initialState: CreateStoryFormState = {
    title: "",
    genre: "",
    narrativeStance: "heroic",
    storyMode: "protagonist",
    storyIdea: "",
    worldDescription: "",
    promptForOnce: "",
    startingScene: "",
    cast: [],
    protagonist: {
        name: "",
        description: "",
        traits: [],
    }
}

export function useCreateStory() {
    const [form, setForm] = useState<CreateStoryFormState>(initialState);
    const [currentStep, setCurrentStep] = useState(0);

    const updateForm = <K extends keyof CreateStoryFormState>(key: K, value: CreateStoryFormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    const isProtagonistMode = form.storyMode === "protagonist";
    const totalSteps = isProtagonistMode ? 4 : 3;
    const nextStep = () => setCurrentStep(s => Math.min(s + 1, totalSteps - 1))
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0))
    const reset = () => {
        setForm(initialState);
        setCurrentStep(0);
    }

    return {
        form,
        updateForm,
        currentStep,
        setCurrentStep,
        totalSteps,
        nextStep,
        prevStep,
        isProtagonistMode,
        reset
    }
}