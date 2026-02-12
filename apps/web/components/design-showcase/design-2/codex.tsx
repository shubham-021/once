"use client";

import { useState } from "react";
import { mockCodex } from "../mock-data";
import { Search, User, MapPin, Package, Book, Info } from "lucide-react";
import { CodexEntry } from "@once/shared";

export function CodexSidebarModern() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filteredEntries = mockCodex.filter((entry) => {
    const matchesSearch = entry.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filter ? entry.entryType === filter : true;
    return matchesSearch && matchesFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "character":
        return <User size={16} />;
      case "location":
        return <MapPin size={16} />;
      case "item":
        return <Package size={16} />;
      case "concept":
        return <Book size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface/30 backdrop-blur-sm rounded-xl border border-line p-4 shadow-sm">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search Codex..."
          className="w-full pl-9 pr-4 py-2 bg-background/50 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
        {["All", "Character", "Location", "Item"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab === "All" ? null : tab.toLowerCase())}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              (tab === "All" && !filter) || filter === tab.toLowerCase()
                ? "bg-accent text-white shadow-sm"
                : "bg-background border border-line text-muted-foreground hover:bg-accent/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="group relative bg-background border border-line rounded-lg p-3 hover:border-accent hover:shadow-md transition-all cursor-pointer overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-accent/10 rounded-md text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                {getIcon(entry.entryType)}
              </span>
              <h4 className="font-semibold text-sm truncate">{entry.name}</h4>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {entry.description}
            </p>

            {/* Hover Overlay for Detail */}
            <div className="absolute inset-0 bg-background/95 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center">
              <span className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
                {entry.entryType}
              </span>
              <p className="text-xs text-foreground/80">{entry.description}</p>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No entries found.
          </div>
        )}
      </div>
    </div>
  );
}
