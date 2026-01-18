"use client"

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "../ui/dialog";
import { useCreateStory } from "./useCreateStory";
import { StepBasics } from "./steps/steps-basics";
import { StepStory } from "./steps/steps-story";
import { StepWorld } from "./steps/step-world";
import { StepCast } from "./steps/step-cast";
import { motion } from "motion/react";

interface CreateStoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateStoryModal({ open, onOpenChange }: CreateStoryModalProps) {
    const {
        form,
        updateForm,
        currentStep,
        totalSteps,
        nextStep,
        prevStep,
        isProtagonistMode,
        reset,
    } = useCreateStory();

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleCreate = () => {
        console.log("Creating story with:", form);
        // TODO: Call API
    };

    const isLastStep = currentStep === totalSteps - 1;

    // const stepWidths = isProtagonistMode
    //     ? ["480px", "640px", "640px", "800px"]  // Basics, Story, World, Cast
    //     : ["480px", "640px", "800px"];          // Basics, World, Cast

    // Step titles for header
    const getStepTitle = () => {
        if (isProtagonistMode) {
            return ["The Basics", "The Story", "The World", "The Cast"][currentStep];
        }
        return ["The Basics", "The World", "The Cast"][currentStep];
    };

    // Render current step
    const renderStep = () => {
        if (isProtagonistMode) {
            switch (currentStep) {
                case 0: return <StepBasics form={form} updateForm={updateForm} />;
                case 1: return <StepStory form={form} updateForm={updateForm} />;
                case 2: return <StepWorld form={form} updateForm={updateForm} />;
                case 3: return <StepCast form={form} updateForm={updateForm} />;
            }
        } else {
            switch (currentStep) {
                case 0: return <StepBasics form={form} updateForm={updateForm} />;
                case 1: return <StepWorld form={form} updateForm={updateForm} />;
                case 2: return <StepCast form={form} updateForm={updateForm} />;
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay className="bg-black/70" />

                <DialogContent
                    showCloseButton={false}
                    className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-h-[90vh] max-w-none bg-transparent p-0 overflow-visible border-none shadow-none"
                    data-lenis-prevent
                >
                    <DialogTitle className="sr-only">Create a New Story</DialogTitle>

                    <div className="flex flex-col h-full overflow-hidden w-full md:w-[800px] md:h-[90vh] rounded-none md:rounded-lg bg-surface">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2 lg:px-6 border-b border-line">
                            <div>
                                <h2 className="text-lg text-foreground">{getStepTitle()}</h2>
                                <p className="text-xs text-muted">Step {currentStep + 1} of {totalSteps}</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 text-muted hover:text-foreground transition-colors cursor-pointer"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 py-4">
                            {renderStep()}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-4  lg:px-6 bg-surface border-t border-line">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="flex items-center gap-1 px-4 py-2 text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="size-4" />
                                Back
                            </button>

                            {isLastStep ? (
                                <button
                                    onClick={handleCreate}
                                    className="px-2 py-1 bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer"
                                >
                                    Begin Story
                                </button>
                            ) : (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-1 px-4 py-2 text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    Next
                                    <ChevronRight className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}