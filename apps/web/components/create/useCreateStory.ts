import { useState } from "react";
import { CreateStoryFormState } from "./types";
import { genres } from "@once/shared";

const initialState: CreateStoryFormState = {
  title: "",
  genre: genres[0],
  narrativeStance: "heroic",
  storyMode: "protagonist",
  storyIdea: "",
  worldDescription: "",
  promptForOnce: "",
  startingScene: "",
  castMode: "flexible",
  cast: [],
  protagonist: {
    name: "",
    description: "",
    traits: [],
  },
};

export function useCreateStory() {
  const [form, setForm] = useState<CreateStoryFormState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = <K extends keyof CreateStoryFormState>(
    key: K,
    value: CreateStoryFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      // Clear exact match and any nested keys (e.g. "protagonist" clears "protagonist.name")
      for (const errKey of Object.keys(next)) {
        if (errKey === key || errKey.startsWith(`${key}.`)) {
          delete next[errKey];
        }
      }
      return next;
    });
  };

  const isProtagonistMode = form.storyMode === "protagonist";
  const totalSteps = isProtagonistMode ? 4 : 3;
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const reset = () => {
    setForm(initialState);
    setCurrentStep(0);
    setErrors({});
  };

  return {
    form,
    updateForm,
    currentStep,
    setCurrentStep,
    totalSteps,
    nextStep,
    prevStep,
    isProtagonistMode,
    reset,
    errors,
    setErrors,
  };
}
