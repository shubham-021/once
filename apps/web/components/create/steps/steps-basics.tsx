"use client";

import { User, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { genres, suggestedTraits } from "@once/shared/schemas";
import type { StepProps } from "../types";

export function StepBasics({ form, updateForm, errors }: StepProps) {
  const isProtagonistMode = form.storyMode === "protagonist";

  const toggleTrait = (trait: string) => {
    const current = form.protagonist?.traits || [];
    if (current.includes(trait)) {
      updateForm("protagonist", {
        ...form.protagonist!,
        traits: current.filter((t) => t !== trait),
      });
    } else if (current.length < 5) {
      updateForm("protagonist", {
        ...form.protagonist!,
        traits: [...current, trait],
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm text-muted">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
          placeholder="The Chapel at Midnight..."
          className={cn(
            "w-full border-b bg-transparent py-2 text-lg text-foreground placeholder:text-muted/50 focus:outline-none",
            errors.title
              ? "border-red-500 focus:border-red-500"
              : "border-line focus:border-foreground",
          )}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted">Genre</label>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => updateForm("genre", genre)}
              className={cn(
                "px-3 py-1 text-sm border transition-colors cursor-pointer",
                form.genre === genre
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-muted hover:border-foreground/50",
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Narrative Stance</label>
        <div className="flex flex-wrap gap-2">
          {(["heroic", "grimdark", "grounded", "mythic", "noir"] as const).map(
            (stance) => (
              <button
                key={stance}
                type="button"
                onClick={() => updateForm("narrativeStance", stance)}
                className={cn(
                  "px-3 py-1 text-sm capitalize border transition-colors cursor-pointer",
                  form.narrativeStance === stance
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line text-muted hover:border-foreground/50",
                )}
              >
                {stance}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted">Story Mode</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateForm("storyMode", "protagonist")}
            className={cn(
              "flex flex-col items-start gap-2 border p-3 text-left transition-colors cursor-pointer",
              isProtagonistMode
                ? "border-accent bg-accent/10"
                : "border-line hover:border-foreground/50",
            )}
          >
            <User
              className={cn(
                "size-4",
                isProtagonistMode ? "text-accent" : "text-muted",
              )}
            />
            <span className="text-sm text-foreground">Protagonist</span>
          </button>
          <button
            type="button"
            onClick={() => updateForm("storyMode", "narrator")}
            className={cn(
              "flex flex-col items-start gap-2 border p-3 text-left transition-colors cursor-pointer",
              !isProtagonistMode
                ? "border-accent bg-accent/10"
                : "border-line hover:border-foreground/50",
            )}
          >
            <Globe
              className={cn(
                "size-4",
                !isProtagonistMode ? "text-accent" : "text-muted",
              )}
            />
            <span className="text-sm text-foreground">Narrator</span>
          </button>
        </div>
      </div>
      {isProtagonistMode && (
        <>
          <div className="space-y-2">
            <label className="text-sm text-muted">Protagonist Name</label>
            <input
              type="text"
              value={form.protagonist?.name || ""}
              onChange={(e) =>
                updateForm("protagonist", {
                  ...form.protagonist!,
                  name: e.target.value,
                })
              }
              placeholder="Kira, Valen, Sera..."
              className={cn(
                "w-full border-b bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:outline-none",
                errors["protagonist.name"]
                  ? "border-red-500 focus:border-red-500"
                  : "border-line focus:border-foreground",
              )}
            />
            {errors["protagonist.name"] && (
              <p className="text-xs text-red-500 mt-1">
                {errors["protagonist.name"]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted">
              Traits ({form.protagonist?.traits?.length || 0}/5)
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestedTraits.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  className={cn(
                    "px-2 py-1 text-xs border transition-colors cursor-pointer",
                    form.protagonist?.traits?.includes(trait)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-line text-muted hover:border-foreground/50",
                  )}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {!isProtagonistMode && (
        <div className="space-y-2">
          <label className="text-sm text-muted">Story Idea / Premise</label>
          <textarea
            value={form.storyIdea}
            onChange={(e) => updateForm("storyIdea", e.target.value)}
            placeholder="A disgraced knight seeks redemption..."
            rows={4}
            className={cn(
              "w-full border bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:outline-none resize-none",
              errors.storyIdea
                ? "border-red-500 focus:border-red-500"
                : "border-line focus:border-foreground",
            )}
          />
          {errors.storyIdea && (
            <p className="text-xs text-red-500 mt-1">{errors.storyIdea}</p>
          )}
        </div>
      )}
    </div>
  );
}
