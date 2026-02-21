"use client";
import { useEffect, useRef, useState } from "react";
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

  const grouped = codex.reduce(
    (acc, entry) => {
      const label = displayNames[entry.entryType] || entry.entryType;
      if (!acc[label]) acc[label] = [];
      acc[label].push(entry);
      return acc;
    },
    {} as Record<string, CodexEntry[]>,
  );

  return (
    <div className="space-y-8 font-serif">
      <div className="w-full flex justify-center items-center border-b border-dashed border-line pb-2 text-lg font-semibold">
        <span>Codex</span>
      </div>
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
                    onClick={() =>
                      setExpandedId(expandedId === entry.id ? null : entry.id)
                    }
                    className={`flex items-start text-left w-full group transition-colors cursor-pointer ${
                      expandedId === entry.id
                        ? "text-accent"
                        : protagonistName === entry.name
                          ? "text-accent font-medium"
                          : "text-foreground hover:text-accent"
                    }`}
                  >
                    <span className="mt-1 mr-1 opacity-50">
                      {expandedId === entry.id ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronRight size={12} />
                      )}
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
                        <div className="ml-4 mt-2 text-[11px] text-muted-foreground py-2 space-y-3">
                          {entry.metadata && (
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                              {Object.entries(entry.metadata).reverse().map(
                                ([sceneId, metadata]) => (
                                  <div
                                    key={`SceneId:${sceneId}`}
                                    className="space-y-2 pl-3 pb-2 last:pb-0 border-l-2 border-accent/70"
                                  >
                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted">
                                      <span className="inline-flex h-4 items-center rounded-full border border-line/70 px-2">
                                        Scene
                                      </span>
                                      <span className="truncate">
                                        {sceneId}
                                      </span>
                                    </div>
                                    <div className="space-y-1 rounded-md px-2 py-1">
                                      {Object.entries(metadata).map(
                                        ([key, value]) => (
                                          <div
                                            key={key}
                                            className="flex flex-wrap items-baseline gap-2"
                                          >
                                            <span className="text-muted">
                                              {key}:
                                            </span>
                                            <span className="font-medium text-foreground/80">
                                              {String(value)}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
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
