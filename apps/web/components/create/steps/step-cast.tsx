"use client";

import { BookUser, Plus, X } from "lucide-react";
import type { StepProps } from "../types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { VaultCharacter } from "@once/shared";
import { vaultApi } from "@/lib/api";

export function StepCast({ form, updateForm, errors }: StepProps) {
  const [vaultCharacters, setVaultCharacters] = useState<VaultCharacter[]>([]);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [showVaultDropdown, setShowVaultDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    vaultApi.list().then((res) => {
      if (res.data) setVaultCharacters(res.data);
      setVaultLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowVaultDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCastMember = () => {
    const newMember = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
    };
    updateForm("cast", [...form.cast, newMember]);
  };

  const removeCastMember = (id: string) => {
    updateForm(
      "cast",
      form.cast.filter((m) => m.id !== id),
    );
  };

  const updateCastMember = (
    id: string,
    field: "name" | "description",
    value: string,
  ) => {
    updateForm(
      "cast",
      form.cast.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const addFromVault = (vc: VaultCharacter) => {
    const parts: string[] = [];

    if (vc.description) parts.push(vc.description);
    if (vc.traits.length > 0) parts.push(`Traits: ${vc.traits.join(", ")}`);
    if (vc.backstory) parts.push(vc.backstory);

    const newMember = {
      id: crypto.randomUUID(),
      name: vc.name,
      description: parts.join("\n"),
      vaultCharacterId: vc.id,
    };

    updateForm("cast", [...form.cast, newMember]);
    setShowVaultDropdown(false);
  };

  const isVaultCharInCast = (vcId: string) =>
    form.cast.some((m) => m.name.toLowerCase() === vcId.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between py-3 border-b border-line mb-4">
          <div>
            <p className="text-sm text-foreground">Cast Mode</p>
            <p className="text-xs pt-1 text-accent">
              {form.castMode === "strict"
                ? "Only use characters from your list"
                : "LLM can introduce its own characters"}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateForm(
                "castMode",
                form.castMode === "strict" ? "flexible" : "strict",
              )
            }
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
              form.castMode === "strict" ? "bg-accent" : "bg-line",
            )}
          >
            <motion.span
              className={cn(
                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full",
              )}
              animate={{ x: form.castMode === "strict" ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
        <label className="text-sm text-muted">Cast (optional)</label>
        <p className="text-xs text-muted/70">
          Characters you'd like woven into your story
        </p>
      </div>

      <div className="space-y-6">
        {form.cast.map((member, index) => (
          <div key={member.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={member.name}
                onChange={(e) =>
                  updateCastMember(member.id, "name", e.target.value)
                }
                placeholder="Character name..."
                className={cn(
                  "flex-1 border-b bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:outline-none",
                  errors[`cast.${index}.name`]
                    ? "border-red-500 focus:border-red-500"
                    : "border-line focus:border-foreground",
                )}
              />
              {member.vaultCharacterId && (
                <span className="text-[11px] rounded-md bg-accent/20 text-muted border border-accent/40 px-1.5 py-1 whitespace-nowrap">
                  vault
                </span>
              )}
              <button
                type="button"
                onClick={() => removeCastMember(member.id)}
                className="p-1 text-muted/50 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            {errors[`cast.${index}.name`] && (
              <p className="text-xs text-red-500 mt-1">
                {errors[`cast.${index}.name`]}
              </p>
            )}
            <textarea
              value={member.description}
              onChange={(e) =>
                updateCastMember(member.id, "description", e.target.value)
              }
              placeholder="Who are they? Their role, personality..."
              rows={2}
              className={cn(
                "w-full border bg-transparent p-3 rounded-md text-sm text-foreground placeholder:text-muted/50 focus:outline-none resize-none",
                errors[`cast.${index}.description`]
                  ? "border-red-500 focus:border-red-500"
                  : "border-line focus:border-foreground",
              )}
            />
            {errors[`cast.${index}.description`] && (
              <p className="text-xs text-red-500 mt-1">
                {errors[`cast.${index}.description`]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={addCastMember}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Plus className="size-4" />
          Add character
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowVaultDropdown(!showVaultDropdown)}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <BookUser className="size-4" />
            Add from Vault
          </button>

          {showVaultDropdown && (
            <div className="absolute left-0 bottom-full mb-2 w-72 max-h-60 rounded-md overflow-y-auto border border-line bg-surface shadow-lg z-20">
              {vaultLoading ? (
                <p className="px-4 py-3 text-xs text-muted">Loading...</p>
              ) : vaultCharacters.length === 0 ? (
                <p className="px-4 py-3 text-xs text-muted">
                  No characters in your vault
                </p>
              ) : (
                vaultCharacters.map((vc) => {
                  const alreadyAdded = isVaultCharInCast(vc.name);
                  return (
                    <button
                      key={vc.id}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addFromVault(vc)}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-line last:border-b-0 transition-colors",
                        alreadyAdded
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-background cursor-pointer",
                      )}
                    >
                      <p className="text-sm text-foreground">{vc.name}</p>
                      {vc.description && (
                        <p className="text-xs text-muted mt-0.5 line-clamp-1">
                          {vc.description}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
