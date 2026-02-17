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
        ## Protagonist: ${protagonist.name}
        ${protagonist.description ? `Description: ${protagonist.description}` : ""}
        Health: ${protagonist.health}/100, Energy: ${protagonist.energy}/100
        Location: ${protagonist.location}
        Traits: ${protagonist.traits.join(", ") || "None"}
        Inventory: ${protagonist.inventory.join(", ") || "Empty"}
        ## Narration
        ${narration}
        Extract state changes and planted echoes.
    `.trim();
}