interface DeferredCharContext {
    pendingCharacters: Array<{
        id: number;
        name: string;
        description?: string | null;
        role?: string | null;
        triggerCondition: string;
    }>;
    protagonistLocation: string;
    protagonistState: string;
    userAction: string;
    recentScenes: Array<{
        userAction: string;
        narration: string;
    }>;
}

export function buildDeferredCharPrompt(ctx: DeferredCharContext): string {
    const characterList = ctx.pendingCharacters.map(c =>
        `
            <character_${c.id}>
                name: ${c.name}
                role: ${c.role || "unknown role"}
                description: ${c.description || "no description available"}
                trigger: ${c.triggerCondition}
            </character_${c.id}>
        `
    ).join("\n");

    const scenes = `
        <recent_scenes>
            ${ctx.recentScenes.map((s, i) =>
                `<scene_${i + 1}>\n
                    <user_action>
                        ${s.userAction}
                    </user_action>
                    <narration>
                        ${s.narration}
                    </narration>
                <scene_${i + 1}>`
            ).join("\n\n")}
        </recent_scenes>
    `

    return `Based on the provided characters list, current context and user action, evaluate which character need to appear in the next scene.

        <pending_characters>
            ${characterList}
        </pending_characters>

        <current_context>
            location: ${ctx.protagonistLocation}
            protagonist State: ${ctx.protagonistState}
        </current_context>

        <recent_scenes>
            ${scenes}
        </recent_scenes>

        <rules>
            Return the IDs of characters whose trigger conditions are NOW met.
            Only trigger if the condition is clearly satisfied.
            Empty array if none should trigger.
        <rules>
    `;
}