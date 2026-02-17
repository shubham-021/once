import { db, DBTransaction, eq } from "@once/database";
import { codexEntries } from "@once/database/schema";
import { generateStructured, generateStructuredWithTracking } from "../llm/generate";
import { buildCodexExtractionPrompt } from "../llm/prompts/codex";
import { CodexExtractionResponse, codexExtractionSchema } from "@once/shared/schemas";
import { DebugCollector } from "@/debug";
import { UsageCollector } from "@/credits/collector";

export async function extractCodexEntries(storyId: number, narration: string, tx: DBTransaction, collector?: DebugCollector, usageCollector?: UsageCollector): Promise<typeof codexEntries.$inferSelect[]> {
    const existingEntries = await tx.query.codexEntries.findMany({
        where: eq(codexEntries.storyId, storyId)
    })

    const existingNames = new Set(existingEntries.map(e => `${e.entryType.toLowerCase()}::${e.name.toLowerCase()}`));

    const prompt = buildCodexExtractionPrompt({
        narration,
        existingEntries: existingEntries.map(e => ({ name: e.name, entryType: e.entryType }))
    })

    // debug collector
    collector?.add('llm', 'codexExtractionPrompt', prompt);

    const extraction = await generateStructuredWithTracking(
        "You extract notable entities from story narration for an encyclopedia.",
        prompt,
        codexExtractionSchema,
        "codex_extraction",
        usageCollector
    );

    const trueEntries = extraction.newEntries.filter(e => !existingNames.has(`${e.entryType.toLowerCase()}::${e.name.toLowerCase()}`));

    // debug collector
    collector?.add('llm', 'generatedStructuredOutput', extraction);

    if (trueEntries.length > 0) {
        await tx.insert(codexEntries).values(
            trueEntries.map(entry => ({
                storyId,
                entryType: entry.entryType,
                name: entry.name,
                summary: entry.summary,
                metadata: entry.metadata ?? null
            }))
        )

        // debug collector
        collector?.add('db', 'insert:extractedCodexEntries', { storyId });
    }

    if (extraction.updates && extraction.updates.length > 0) {
        for (const update of extraction.updates) {
            const existing = existingEntries.find(e =>
                e.name.toLowerCase() === update.name.toLowerCase()
            );
            if (existing && !existing.userEdited) {
                await tx.update(codexEntries)
                    .set({
                        summary: `${existing.summary}\n\n${update.newInfo}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(codexEntries.id, existing.id));

                // debug collector
                collector?.add('db', 'updateCodexEntries', { summary: `${existing.summary}\n\n${update.newInfo}` });
            }
        }
    }

    const allEntries = await tx.query.codexEntries.findMany({
        where: eq(codexEntries.storyId, storyId)
    });

    return allEntries;
}