"use client";

import { useState } from "react";
import { mockProtagonist } from "../mock-data";
import {
  Heart,
  Zap,
  MapPin,
  Backpack,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function ProtagonistSidebarMinimal() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`h-full transition-all duration-300 flex flex-col ${isExpanded ? "w-64" : "w-16 items-center"} bg-charcoal text-white rounded-l-lg lg:rounded-lg shadow-xl overflow-hidden`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-center hover:bg-white/10 transition-colors border-b border-white/10"
      >
        {isExpanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Vitals (Always Visible as mini bars or detailed) */}
      <div
        className={`p-4 space-y-4 ${isExpanded ? "" : "flex flex-col items-center"}`}
      >
        {/* Health */}
        <div className="group relative">
          {isExpanded ? (
            <div>
              <div className="flex justify-between text-xs text-danger font-bold mb-1">
                <span>Health</span>
                <span>{mockProtagonist.health}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-danger w-[75%]" />
              </div>
            </div>
          ) : (
            <div className="relative w-2 h-16 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute bottom-0 w-full bg-danger"
                style={{ height: `${mockProtagonist.health}%` }}
              />
            </div>
          )}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-charcoal text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
            Health: {mockProtagonist.health}%
          </div>
        </div>

        {/* Energy */}
        <div className="group relative">
          {isExpanded ? (
            <div>
              <div className="flex justify-between text-xs text-yellow-500 font-bold mb-1">
                <span>Energy</span>
                <span>{mockProtagonist.energy}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[40%]" />
              </div>
            </div>
          ) : (
            <div className="relative w-2 h-16 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute bottom-0 w-full bg-yellow-500"
                style={{ height: `${mockProtagonist.energy}%` }}
              />
            </div>
          )}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-charcoal text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
            Energy: {mockProtagonist.energy}%
          </div>
        </div>
      </div>

      {/* Content when expanded */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-200 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 text-white/90 mb-1">
              <MapPin size={14} className="text-accent" />
              <span className="font-medium text-sm">
                {mockProtagonist.currentLocation}
              </span>
            </div>
            <p className="text-xs text-white/50">
              {mockProtagonist.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
              <Backpack size={14} /> Inventory
            </h3>
            <ul className="space-y-1">
              {mockProtagonist.inventory.map((item) => (
                <li
                  key={item}
                  className="text-xs text-white/80 border-b border-white/5 pb-1"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Icons when collapsed */}
      {!isExpanded && (
        <div className="flex flex-col items-center gap-4 mt-2">
          <div className="p-2 rounded-full hover:bg-white/10 text-accent group relative">
            <MapPin size={18} />
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-charcoal text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-lg border border-white/10 max-w-[150px] truncate">
              {mockProtagonist.currentLocation}
            </div>
          </div>
          <div className="p-2 rounded-full hover:bg-white/10 text-white/70 group relative">
            <Backpack size={18} />
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-charcoal text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
              {mockProtagonist.inventory.length} Items
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
