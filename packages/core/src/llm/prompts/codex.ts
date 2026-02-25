interface CodexExtractionContext {
    narration: string;
    existingEntries: Array<{
        name: string;
        entryType: string;
    }>;
}

export function buildCodexExtractionPrompt(ctx: CodexExtractionContext): string {
    const existingList = ctx.existingEntries.length > 0
        ? ctx.existingEntries.map(e => `
            <codex_data>
                name: ${e.name}
                entryType: ${e.entryType}
            </codex_data>
        `).join("\n") : "None yet";

    return `
        <Task>
            Extract new entries from this narration following the provided schema, make sure to categorize new entries and updates in their respective fields.

            <current_scene_narration>
                ${ctx.narration}
            </current_scene_narration>

            <existing_codex_entries>
                ${existingList}
            </existing_codex_entries>
            
            <rules>
                <point_1> Only include metadata fields that are clearly evident from the narration. </point_1>
                <point_2> For existing entries, note if the narration reveals NEW information about them. </point_2>
                <point_3> Only extract what's clearly present in the narration, don't invent. </point_3>
            </rules>
        </Task>
    `;
}