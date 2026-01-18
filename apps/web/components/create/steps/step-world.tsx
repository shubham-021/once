"use client"

import type { StepProps } from "../types";

export function StepWorld({ form, updateForm }: StepProps) {
    const isProtagonistMode = form.storyMode === "protagonist";

    return (
        <div className="space-y-8">
            {/* Protagonist Description (protagonist mode only) */}
            {isProtagonistMode && (
                <div className="space-y-2">
                    <label className="text-sm text-muted">Protagonist Description</label>
                    <textarea
                        value={form.protagonist?.description || ""}
                        onChange={(e) => updateForm("protagonist", { ...form.protagonist!, description: e.target.value })}
                        placeholder="Who is your protagonist? Describe their personality, background, motivations, fears..."
                        rows={4}
                        className="w-full border border-line bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                    />
                </div>
            )}

            {/* World Description */}
            <div className="space-y-2">
                <label className="text-sm text-muted">World Description (optional)</label>
                <textarea
                    value={form.worldDescription || ""}
                    onChange={(e) => updateForm("worldDescription", e.target.value)}
                    placeholder="Describe the world: its rules, atmosphere, conflicts, what makes it unique..."
                    rows={4}
                    className="w-full border border-line bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                />
            </div>

            {/* Prompt for Once */}
            <div className="space-y-2">
                <label className="text-sm text-muted">Instructions for Once (optional)</label>
                <textarea
                    value={form.promptForOnce || ""}
                    onChange={(e) => updateForm("promptForOnce", e.target.value)}
                    placeholder="Any specific instructions? E.g., 'Keep the tone dark', 'No romance subplots'..."
                    rows={3}
                    className="w-full border border-line bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                />
            </div>
        </div>
    );
}