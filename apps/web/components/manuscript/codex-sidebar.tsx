"use client";
import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { CodexEntry } from "@once/shared";
import { AnimatePresence, motion } from "motion/react";

interface Props {
    codex: CodexEntry[];
    protagonistName?: string;
}

const displayNames: Record<string, string> = {
    character: "Characters",
    location: "Locations",
    item: "Items",
    faction: "Factions",
    event: "Events",
    lore: "Lore",
};

export function CodexSidebar({ codex, protagonistName }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const grouped = codex.reduce((acc, entry) => {
        const label = displayNames[entry.entryType] || entry.entryType;
        if (!acc[label]) acc[label] = [];
        acc[label].push(entry);
        return acc;
    }, {} as Record<string, CodexEntry[]>);

    return (
        <div className="space-y-8 font-serif">
            {Object.entries(grouped).map(([category, entries]) => (
                <div key={category}>
                    <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">
                        {category}
                    </h3>
                    <ul className="space-y-2">
                        <AnimatePresence initial={false}>
                            {entries.map((entry) => (
                                <motion.li
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    layout
                                >
                                    <button
                                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                                        className={`flex items-start text-left w-full group transition-colors cursor-pointer ${expandedId === entry.id
                                            ? "text-accent"
                                            : protagonistName === entry.name
                                                ? "text-accent font-medium"
                                                : "text-foreground hover:text-accent"
                                            }`}
                                    >
                                        <span className="mt-1 mr-1 opacity-50">
                                            {expandedId === entry.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                        </span>
                                        <span className="text-sm font-medium">{entry.name}</span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {expandedId === entry.id && (
                                            <motion.div
                                                key={entry.id}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="ml-4 mt-2 text-xs text-muted-foreground italic border-l-2 border-accent/20 pl-2 py-1">
                                                    <p>{entry.summary}</p>
                                                    {entry.metadata && (
                                                        <div className="mt-2 grid grid-cols-2 gap-1 opacity-70 not-italic">
                                                            {Object.entries(entry.metadata).map(([k, v]) => (
                                                                <span key={k}>{k}: {v}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </div>
            ))}
        </div>
    );
}