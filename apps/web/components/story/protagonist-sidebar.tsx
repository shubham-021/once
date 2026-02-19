import { Heart, Zap, MapPin } from "lucide-react";
import type { Protagonist } from "@once/shared";
import { SketchyBar } from "@/components/sketchy-bar";
import { AnimatePresence, motion } from "motion/react";

interface Props {
    protagonist: Protagonist;
}

export function ProtagonistSidebar({ protagonist }: Props) {
    // console.log(JSON.stringify(protagonist));

    // for now, backend should check for duplicates key produced by the llm.
    const traits = new Set([...protagonist.currentTraits]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="w-full flex justify-center items-center border-b border-dashed border-line pb-2 text-lg font-semibold">
                <span>Protagonist</span>
            </div>

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
                        <Zap size={16} className="text-sky-400" />
                        <span className="font-semibold">Energy</span>
                        <span className="font-mono text-xs text-muted italic">{protagonist.energy}/{100}</span>
                    </div>
                    <div>
                        <SketchyBar value={protagonist.energy} max={100} width={200} height={16} textColor="text-sky-400" />
                    </div>
                </div>
            </div>

            {/* Location */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={protagonist.currentLocation}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground border p-2 rounded-md bg-surface/50 border-line/50"
                >
                    <MapPin size={16} className="shrink-0"/>
                    <span>{protagonist.currentLocation}</span>
                </motion.div>
            </AnimatePresence>

            {/* Traits */}
            <div>
                <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">Traits</h3>
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {[...traits].map((trait) => (
                            <motion.span
                                key={trait}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.25 }}
                                className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full border border-accent/20"
                            >
                                {trait}
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Inventory */}
            <div>
                <h3 className="text-xs uppercase tracking-widest text-muted mb-3 border-b border-dashed border-line pb-1">Inventory</h3>
                <ul className="space-y-1 text-sm list-disc pl-4 marker:text-muted">
                    <AnimatePresence>
                        {protagonist.inventory.map((item) => (
                            <motion.li
                                key={item}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.25 }}
                                className="text-foreground/90"
                            >
                                {item}
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            </div>
        </div>
    );
}