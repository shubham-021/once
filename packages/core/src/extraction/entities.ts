import { generateStructured, generateStructuredWithTracking } from "@/llm";
import {
    extractedEntitiesSchema,
    extractionSystemPrompt,
    buildExtractionPrompt,
    type ExtractedEntities
} from "../llm/prompts/extract";
import { UsageCollector } from "@/credits/collector";


export async function extractEntities(
    narration: string,
    protagonistName: string,
    usageCollector?: UsageCollector
): Promise<ExtractedEntities> {
    try {
        const prompt = buildExtractionPrompt(narration, protagonistName);

        const response = await generateStructuredWithTracking(extractionSystemPrompt, prompt, extractedEntitiesSchema, "extracted_entities", usageCollector);

        return response ?? {
            characters: [],
            locations: [],
            objects: [],
            relationships: [],
            events: [],
        };

    } catch (error) {
        console.error("Entity extraction error:", error);
        return {
            characters: [],
            locations: [],
            objects: [],
            relationships: [],
            events: [],
        };
    }
}