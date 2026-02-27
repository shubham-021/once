export const sceneExtractionSystemPrompt = `You are a narrative analyst. Extract protagonist state changes and planted consequences from the scene.
Only report explicit changes.`;

export function buildSceneExtractionPrompt(narration: string, protagonist: {
    name: string;
    description?: string;
    health: number;
    energy: number;
    location: string;
    traits: string[];
    inventory: string[];
}): string {
    return `
        <task>
            Extract state changes and planted echoes.

            <current_protagonist_state>
                name: ${protagonist.name}
                ${protagonist.description ? `description: ${protagonist.description}` : ""}
                health: ${protagonist.health}/100, energy: ${protagonist.energy}/100
                location: ${protagonist.location}
                traits: ${protagonist.traits.join(", ") || "None"}
                inventory: ${protagonist.inventory.join(", ") || "Empty"}
            </current_protagonist_state>
            
            <current_narration>
                ${narration}
            </current_narration>
        </task>
    `.trim();
}