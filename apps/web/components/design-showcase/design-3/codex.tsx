"use client";

import { useState } from "react";
import { mockCodex } from "../mock-data";
import {
  User,
  MapPin,
  Package,
  Book,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function CodexSidebarMinimal() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "character":
        return <User size={20} />;
      case "location":
        return <MapPin size={20} />;
      case "item":
        return <Package size={20} />;
      case "concept":
        return <Book size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const types = ["character", "location", "item", "concept"];

  // If expanded, show full list. If collapsed, show icons.

  return (
    <div
      className={`h-full transition-all duration-300 flex flex-col ${isExpanded ? "w-64" : "w-16 items-center"} bg-charcoal text-white rounded-r-lg lg:rounded-lg shadow-xl overflow-hidden`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-center hover:bg-white/10 transition-colors border-b border-white/10"
      >
        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* Content */}
      <div className="flex-1 overflow-y-auto w-full">
        {isExpanded ? (
          <div className="p-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-200">
            {types.map((type) => {
              const entries = mockCodex.filter((c) => c.entryType === type);
              if (entries.length === 0) return null;

              return (
                <div key={type}>
                  <h3 className="text-xs uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
                    {getIcon(type)} {type}s
                  </h3>
                  <ul className="space-y-1">
                    {entries.map((entry) => (
                      <li key={entry.id} className="group">
                        <div className="text-sm font-medium text-white/90 group-hover:text-accent cursor-pointer transition-colors">
                          {entry.name}
                        </div>
                        <div className="text-[10px] text-white/50 line-clamp-1 group-hover:text-white/70">
                          {entry.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 space-y-4 flex flex-col items-center">
            {types.map((type) => (
              <div
                key={type}
                className="p-3 rounded-full hover:bg-accent/20 text-white/70 hover:text-accent transition-colors relative group"
              >
                {getIcon(type)}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-charcoal text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-lg border border-white/10">
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
