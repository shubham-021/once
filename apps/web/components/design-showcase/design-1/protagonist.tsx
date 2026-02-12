"use client";

import { mockProtagonist } from "../mock-data";
import { Heart, Zap, MapPin } from "lucide-react";

export function ProtagonistSidebarClassic() {
  return (
    <div className="space-y-6 font-serif">
      {/* Header */}
      <div className="text-center pb-4 border-b border-dashed border-line">
        <h2 className="text-xl font-bold text-accent font-playfair">
          {mockProtagonist.name}
        </h2>
        <p className="text-sm text-muted italic mt-1">
          {mockProtagonist.description}
        </p>
      </div>

      {/* Vitals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="flex items-center gap-2 font-semibold">
            <Heart size={16} className="text-danger" /> Health
          </span>
          <span>{mockProtagonist.health}/100</span>
        </div>
        <div className="h-2 w-full bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-danger transition-all"
            style={{ width: `${mockProtagonist.health}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm mb-1">
          <span className="flex items-center gap-2 font-semibold">
            <Zap size={16} className="text-yellow-500" /> Energy
          </span>
          <span>{mockProtagonist.energy}/100</span>
        </div>
        <div className="h-2 w-full bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-500 transition-all"
            style={{ width: `${mockProtagonist.energy}%` }}
          />
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground border p-2 rounded-md bg-surface/50 border-line/50">
        <MapPin size={16} />
        <span>{mockProtagonist.currentLocation}</span>
      </div>

      {/* Traits */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">
          Traits
        </h3>
        <div className="flex flex-wrap gap-2">
          {mockProtagonist.currentTraits.map((trait) => (
            <span
              key={trait}
              className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full border border-accent/20"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Inventory */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">
          Inventory
        </h3>
        <ul className="space-y-1 text-sm list-disc pl-4 marker:text-muted">
          {mockProtagonist.inventory.map((item) => (
            <li key={item} className="text-foreground/90">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
