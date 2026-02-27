import type { NarrativeStance, StoryMode } from "@once/shared/schemas";

interface ContinueContext {
    stance: NarrativeStance;
    mode: StoryMode;
    protagonist?: {
        name: string;
        description?: string | null;
        traits: string[];
        health: number;
        energy: number;
        location: string;
        inventory: string[];
        scars: string[];
    };
    recentScenes: Array<{
        userAction: string;
        narration: string;
    }>;
    userAction: string;
    triggeredEchoes?: Array<{ description: string; }>;
    factualKnowledge?: string[];
    introducedCharacters?: Array<{
        name: string;
        description?: string | null;
        role?: string | null;
    }>;
}

export function buildContinuePrompt(ctx: ContinueContext): string {
    const hasProtagonist = ctx.mode === "protagonist" && ctx.protagonist;

    let stateBlock = "";
    if (hasProtagonist) {
        const p = ctx.protagonist!;
        stateBlock = `
            <current_protagonist_state>
                name: ${p.name}
                health: ${p.health}/100
                energy: ${p.energy}/100
                location: ${p.location}
                traits: ${p.traits.join(", ") || "None"}
                inventory: ${p.inventory.length > 0 ? p.inventory.join(", ") : "Empty"}
                scars: ${p.scars.length > 0 ? p.scars.join(", ") : "None"}
            </current_protagonist_state>    
        `;
    }

    const recentContext = `
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

    let echoBlock = "";
    if (ctx.triggeredEchoes && ctx.triggeredEchoes.length > 0) {
        const echoDescriptions = ctx.triggeredEchoes.map(e => `<echo> ${e.description} </echo>`).join("\n");
        echoBlock = `
        <echoes>
            The following past choices are now coming back:
            ${echoDescriptions}
        </echoes>

        <task>
            Weave these consequences naturally into the scene. Don't announce them, show them through events, dialogue, or changed circumstances.
        </task>
        `;
    }

    let memoryBlock = "";
    if (ctx.factualKnowledge && ctx.factualKnowledge.length > 0) {
        const facts = ctx.factualKnowledge.map(f => `<fact> ${f} </fact>`).join("\n");
        memoryBlock = `
        <relevant_memories>
            ${facts}
        </relevant_memories>
        `;
    }

    let characterBlock = "";
    if (ctx.introducedCharacters && ctx.introducedCharacters.length > 0) {
        const chars = ctx.introducedCharacters.map(c =>
            `
                <character>
                    name: ${c.name}
                    description: ${c.description || "A mysterious figure"}
                    role: ${c.role || "unknown role"}
                </character>
            `
        ).join("\n");
        characterBlock = `
            <characters_to_introduce>
                The following characters should appear in this scene:

                ${chars}
            </characters_to_introduce>

            
            <task>
                Introduce them naturally through the narrative, don't just announce their arrival.
            </task>
        `;
    }

    return `
        <task> 
            Continue the story based on the user's action. 
            ${stateBlock}
            ${echoBlock}
            ${memoryBlock}
            ${characterBlock}

            <recent_event>
                ${recentContext}
            </recent_event>

            <user_action>
                ${ctx.userAction}
            </user_action>

            <rules>
                <point_1> Respond to the action naturally within the world's rules. </point_1>
                <point_2> Write pure prose narration only. Do not include stat blocks, health values, inventory lists, or location headers. No meta-commentary. </point_2>
                <point_3> Advance only one narrative beat beyond the user action. Do not jump ahead to resolve future plot events unless the user explicitly asks for them. </point_3>
                <point_4> If the user action is broad, respond broadly but avoid completing major plot turns or long-arc reveals in the same scene. </point_4>
            </rules>
        </task>
    `;
}
