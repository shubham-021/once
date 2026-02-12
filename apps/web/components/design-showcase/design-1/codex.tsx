"use client";

import { useState } from "react";
import { mockCodex } from "../mock-data";
import { ChevronRight, ChevronDown } from "lucide-react";

export function CodexSidebarClassic() {
  // Group entries by type
  const grouped = mockCodex.reduce(
    (acc, entry) => {
      const type =
        entry.entryType.charAt(0).toUpperCase() +
        entry.entryType.slice(1) +
        "s";
      if (!acc[type]) acc[type] = [];
      acc[type].push(entry);
      return acc;
    },
    {} as Record<string, typeof mockCodex>,
  );

  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <div className="space-y-8 font-serif">
      {Object.entries(grouped).map(([category, entries]) => (
        <div key={category}>
          <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">
            {category}
          </h3>
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <button
                  onClick={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                  className={`flex items-start text-left w-full group transition-colors ${
                    expandedId === entry.id
                      ? "text-accent"
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

                {expandedId === entry.id && (
                  <div className="ml-4 mt-2 text-xs text-muted-foreground italic border-l-2 border-accent/20 pl-2 py-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    <p>{entry.description}</p>
                    {entry.metadata && (
                      <div className="mt-2 grid grid-cols-2 gap-1 opacity-70">
                        {Object.entries(entry.metadata).map(([k, v]) => (
                          <span key={k}>
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
