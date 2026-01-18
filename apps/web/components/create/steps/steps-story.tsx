"use client"

import type { StepProps } from "../types";

export function StepStory({ form, updateForm }: StepProps) {
    const isProtagonistMode = form.storyMode === "protagonist";

    return (
        <div className="space-y-8">
            {/* Starting Scene (optional) */}
            <div className="space-y-2">
                <label className="text-sm text-muted">Starting Scene (optional)</label>
                <textarea
                    value={form.startingScene || ""}
                    onChange={(e) => updateForm("startingScene", e.target.value)}
                    placeholder="If you have a specific opening scene in mind, describe it here. Otherwise, Once will craft the beginning..."
                    rows={5}
                    className="w-full border border-line bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                />
            </div>

            {/* Story Idea/Premise (for protagonist mode) */}
            {isProtagonistMode && (
                <div className="space-y-2">
                    <label className="text-sm text-muted">Story Idea / Premise</label>
                    <textarea
                        value={form.storyIdea}
                        onChange={(e) => updateForm("storyIdea", e.target.value)}
                        placeholder="A disgraced knight seeks redemption in a land where the gods have fallen silent..."
                        rows={5}
                        className="w-full border border-line bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                    />
                </div>
            )}
        </div>
    );
}