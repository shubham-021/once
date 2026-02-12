import { Heart, Zap, MapPin } from "lucide-react";
import type { Protagonist } from "@once/shared";
import { SketchyBar } from "@/components/sketchy-bar";

interface Props {
    protagonist: Protagonist;
}

export function ProtagonistSidebar({ protagonist }: Props) {
    return (
        <div className="space-y-6 font-serif">
            {/* Header */}
            <div className="text-center pb-4 border-b border-dashed border-line">
                <h2 className="text-xl font-bold text-accent">{protagonist.name}</h2>
                {protagonist.description && (
                    <p className="text-sm text-muted italic mt-1">{protagonist.description}</p>
                )}
            </div>

            {/* Vitals */}
            <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                        <Heart size={16} className="text-danger" />
                        <span className="font-semibold">Health</span>
                        <span className="font-mono text-xs text-muted italic">{protagonist.health}/{100}</span>
                    </div>
                    <div className="text-danger">
                        <SketchyBar value={protagonist.health} max={100} width={200} height={16} textColor="text-red-500" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                        <Zap size={16} className="text-yellow-500" />
                        <span className="font-semibold">Energy</span>
                        <span className="font-mono text-xs text-muted italic">{protagonist.energy}/{100}</span>
                    </div>
                    <div className="text-yellow-500">
                        <SketchyBar value={protagonist.energy} max={100} width={200} height={16} textColor="text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground border p-2 rounded-md bg-surface/50 border-line/50">
                <MapPin size={16} />
                <span>{protagonist.currentLocation}</span>
            </div>

            {/* Traits */}
            <div>
                <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">Traits</h3>
                <div className="flex flex-wrap gap-2">
                    {protagonist.currentTraits.map((trait) => (
                        <span key={trait} className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full border border-accent/20">
                            {trait}
                        </span>
                    ))}
                </div>
            </div>

            {/* Inventory */}
            <div>
                <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">Inventory</h3>
                <ul className="space-y-1 text-sm list-disc pl-4 marker:text-muted">
                    {protagonist.inventory.map((item) => (
                        <li key={item} className="text-foreground/90">{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}