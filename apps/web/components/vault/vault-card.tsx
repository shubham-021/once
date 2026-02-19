"use client";

import React from "react";
import { MoreVertical, Trash2, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VaultCharacter } from "@once/shared";


export function VaultCard({ character, onDelete, onEdit }: { character: VaultCharacter, onDelete: (characterId: number) => void, onEdit: (characterId:number) => void }) {
    const [showMenu, setShowMenu] = React.useState(false);

    const handleDelete = () => {
        onDelete(character.id);
    }

    const handleEdit = () => {
        onEdit(character.id);
    }

    return (
        <div className="border border-line bg-surface p-5 relative rounded-lg">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg text-foreground">{character.name}</h2>
                    {character.description && (
                        <p className="mt-1 text-sm text-muted">{character.description}</p>
                    )}
                </div>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-muted hover:text-foreground cursor-pointer"
                >
                    <MoreVertical className="size-4" />
                </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {character.traits.map((trait) => (
                    <span key={trait} className="text-xs border border-line px-2 py-0.5 text-muted rounded-sm">
                        {trait}
                    </span>
                ))}
            </div>

            <p className="mt-4 text-xs text-muted">
                Used in {character.timesUsed} {character.timesUsed === 1 ? "story" : "stories"}
            </p>

            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-4 top-12 border border-line bg-surface shadow-lg z-10 rounded-lg space-y-2">
                        <button 
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-background w-full text-left cursor-pointer"
                        >
                            <Edit3 className="size-3" />
                            Edit
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-danger hover:bg-background w-full text-left cursor-pointer"
                        >
                            <Trash2 className="size-3" />
                            Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}