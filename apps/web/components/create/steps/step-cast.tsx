"use client"

import { Plus, X } from "lucide-react";
import type { StepProps } from "../types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function StepCast({ form, updateForm }: StepProps) {
    const addCastMember = () => {
        const newMember = {
            id: crypto.randomUUID(),
            name: "",
            description: "",
        };
        updateForm("cast", [...form.cast, newMember]);
    };

    const removeCastMember = (id: string) => {
        updateForm("cast", form.cast.filter(m => m.id !== id));
    };

    const updateCastMember = (id: string, field: "name" | "description", value: string) => {
        updateForm("cast", form.cast.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center justify-between py-3 border-b border-line mb-4">
                    <div>
                        <p className="text-sm text-foreground">Cast Mode</p>
                        <p className="text-xs text-muted">
                            {form.castMode === "strict"
                                ? "Only use characters from your list"
                                : "LLM can introduce its own characters"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateForm("castMode", form.castMode === "strict" ? "flexible" : "strict")}
                        className={cn("relative w-12 h-6 rounded-full transition-colors cursor-pointer", form.castMode === "strict" ? "bg-accent" : "bg-line")}
                    >
                        <motion.span
                            className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full")}
                            animate={{ x: form.castMode === "strict" ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>
                <label className="text-sm text-muted">Cast (optional)</label>
                <p className="text-xs text-muted/70">Characters you'd like woven into your story</p>
            </div>

            <div className="space-y-6">
                {form.cast.map((member) => (
                    <div key={member.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={member.name}
                                onChange={(e) => updateCastMember(member.id, "name", e.target.value)}
                                placeholder="Character name..."
                                className="flex-1 border-b border-line bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => removeCastMember(member.id)}
                                className="p-1 text-muted/50 hover:text-foreground transition-colors cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <textarea
                            value={member.description}
                            onChange={(e) => updateCastMember(member.id, "description", e.target.value)}
                            placeholder="Who are they? Their role, personality..."
                            rows={2}
                            className="w-full border border-line bg-transparent p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                        />
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addCastMember}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
            >
                <Plus className="size-4" />
                Add character
            </button>
        </div>
    );
}