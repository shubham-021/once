"use client";

import { mockProtagonist } from "../mock-data";
import {
  Zap,
  Heart,
  MapPin,
  Sparkles,
  AlertCircle,
  Backpack,
} from "lucide-react";

export function ProtagonistSidebarModern() {
  return (
    <div className="flex flex-col h-full bg-surface/30 backdrop-blur-sm rounded-xl border border-line p-4 shadow-sm space-y-6">
      {/* Header / Avatar */}
      <div className="flex items-center gap-4 border-b border-dashed border-line pb-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold border-2 border-accent shadow-inner">
          {mockProtagonist.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {mockProtagonist.name}
          </h2>
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            {mockProtagonist.description}
          </p>
        </div>
      </div>

      {/* Circular Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-line opacity-30"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * mockProtagonist.health) / 100}
                className="text-danger transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-danger text-lg">
              {mockProtagonist.health}%
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1">
            <Heart size={12} className="text-danger" /> Health
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-line opacity-30"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={226}
                strokeDashoffset={226 - (226 * mockProtagonist.energy) / 100}
                className="text-yellow-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-yellow-500 text-lg">
              {mockProtagonist.energy}%
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1">
            <Zap size={12} className="text-yellow-500" /> Energy
          </span>
        </div>
      </div>

      {/* Location & Status */}
      <div className="bg-background rounded-lg border border-line p-3 text-sm space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <MapPin size={16} className="text-accent" />
          {mockProtagonist.currentLocation}
        </div>
        <div className="flex items-start gap-2 text-muted-foreground text-xs italic border-t border-dashed border-line pt-2">
          <AlertCircle size={14} className="mt-0.5 text-orange-400" />
          <span>Scars: {mockProtagonist.scars.join(", ")}</span>
        </div>
      </div>

      {/* Traits Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <Sparkles size={12} /> Traits
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {mockProtagonist.currentTraits.map((trait) => (
            <div
              key={trait}
              className="bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-md px-2 py-1.5 text-xs text-center text-accent font-medium transition-colors cursor-help"
            >
              {trait}
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="flex-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <Backpack size={12} /> Inventory
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {mockProtagonist.inventory.map((item, i) => (
            <div
              key={i}
              className="aspect-square bg-background border border-line rounded-lg flex items-center justify-center text-center p-1 hover:border-accent hover:shadow-md transition-all cursor-pointer group relative"
            >
              <span className="text-[10px] leading-tight font-medium text-foreground/80 line-clamp-3 group-hover:text-accent">
                {item}
              </span>
            </div>
          ))}
          {/* Empty Slots */}
          {[...Array(Math.max(0, 6 - mockProtagonist.inventory.length))].map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square bg-background/30 border border-line/50 rounded-lg flex items-center justify-center opacity-50 border-dashed"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
