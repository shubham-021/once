import type { CodexEntry } from "@once/shared";

interface Props {
    codex: CodexEntry[];
    protagonistName?: string;
}

export function CodexSidebar({ codex, protagonistName }: Props) {
    const characters = codex.filter(c => c.entryType === "character");
    const locations = codex.filter(c => c.entryType === "location");

    return (
        <div className="space-y-6">
            <SidebarSection title="CHARACTERS">
                {characters.map((char) => (
                    <SidebarItem key={char.id} highlighted={protagonistName === char.name}>
                        {char.name}
                    </SidebarItem>
                ))}
            </SidebarSection>
            <SidebarSection title="LOCATIONS">
                {locations.map((loc) => (
                    <SidebarItem key={loc.id}>{loc.name}</SidebarItem>
                ))}
            </SidebarSection>
        </div>
    );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs uppercase tracking-wider text-muted">{title}</h3>
            <div className="mt-2 space-y-1">{children}</div>
        </div>
    );
}

function SidebarItem({ children, highlighted }: { children: React.ReactNode; highlighted?: boolean }) {
    return (
        <p className={`text-sm cursor-pointer transition-colors ${highlighted ? "text-accent font-medium" : "text-foreground/80 hover:text-foreground"}`}>
            · {children}
        </p>
    );
}