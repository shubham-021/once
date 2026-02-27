"use client";

import { cn } from "@/lib/utils";
import type { StepProps } from "../types";

export function StepWorld({ form, updateForm, errors }: StepProps) {
  const isProtagonistMode = form.storyMode === "protagonist";

  return (
    <div className="space-y-8">
      {/* Protagonist Description (protagonist mode only) */}
      {isProtagonistMode && (
        <div className="space-y-2">
          <label className="text-sm text-muted">Protagonist Description</label>
          <textarea
            value={form.protagonist?.description || ""}
            onChange={(e) =>
              updateForm("protagonist", {
                ...form.protagonist!,
                description: e.target.value,
              })
            }
            placeholder="Who is your protagonist? Describe their personality, background, motivations, fears..."
            rows={4}
            className={cn(
              "w-full border bg-transparent p-3 mt-1 rounded-md text-foreground placeholder:text-muted/50 focus:outline-none resize-none",
              errors["protagonist.description"]
                ? "border-red-500 focus:border-red-500"
                : "border-line focus:border-foreground",
            )}
          />
          {errors["protagonist.description"] && (
            <p className="text-xs text-red-500 mt-1">
              {errors["protagonist.description"]}
            </p>
          )}
        </div>
      )}

      {/* World Description */}
      <div className="space-y-2">
        <label className="text-sm text-muted">
          World Description (optional)
        </label>
        <textarea
          value={form.worldDescription || ""}
          onChange={(e) => updateForm("worldDescription", e.target.value)}
          placeholder="Describe the world: its rules, atmosphere, conflicts, what makes it unique..."
          rows={4}
          className={cn(
            "w-full border bg-transparent p-3 mt-1 rounded-md text-foreground placeholder:text-muted/50 focus:outline-none resize-none",
            errors.worldDescription
              ? "border-red-500 focus:border-red-500"
              : "border-line focus:border-foreground",
          )}
        />
        {errors.worldDescription && (
          <p className="text-xs text-red-500 mt-1">{errors.worldDescription}</p>
        )}
      </div>

      {/* Prompt for Once */}
      <div className="space-y-2">
        <label className="text-sm text-muted">
          Instructions for Once (optional)
        </label>
        <textarea
          value={form.promptForOnce || ""}
          onChange={(e) => updateForm("promptForOnce", e.target.value)}
          placeholder="Any specific instructions? E.g., 'Keep the tone dark', 'No romance subplots'..."
          rows={3}
          className={cn(
            "w-full border bg-transparent p-3 mt-1 rounded-md text-foreground placeholder:text-muted/50 focus:outline-none resize-none",
            errors.promptForOnce
              ? "border-red-500 focus:border-red-500"
              : "border-line focus:border-foreground",
          )}
        />
        {errors.promptForOnce && (
          <p className="text-xs text-red-500 mt-1">{errors.promptForOnce}</p>
        )}
      </div>
    </div>
  );
}
