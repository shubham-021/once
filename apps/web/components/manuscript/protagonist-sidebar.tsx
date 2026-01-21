import type { Protagonist } from "@once/shared";
import { SketchyBar } from "@/components/sketchy-bar";

interface Props {
    protagonist: Protagonist;
}

export function ProtagonistSidebar({ protagonist }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base text-foreground">{protagonist.name}</h2>
                <div className="mt-1 h-px w-full bg-line" />
            </div>

            <Section title="HEALTH">
                <SketchyBar value={protagonist.health} max={100} />
            </Section>

            <Section title="ENERGY">
                <SketchyBar value={protagonist.energy} max={100} />
            </Section>

            <Section title="LOCATION">
                <p className="text-sm text-foreground">{protagonist.currentLocation}</p>
            </Section>

            <Section title="TRAITS">
                {protagonist.currentTraits.map((trait, i) => (
                    <p key={i} className="text-sm text-foreground/80">· {trait}</p>
                ))}
            </Section>

            <Section title="INVENTORY">
                {protagonist.inventory.map((item, i) => (
                    <p key={i} className="text-sm text-foreground/80">· {item}</p>
                ))}
            </Section>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs uppercase tracking-wider text-muted">{title}</h3>
            <div className="mt-2 space-y-1">{children}</div>
        </div>
    );
}