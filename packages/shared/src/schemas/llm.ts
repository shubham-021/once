import { z } from "zod";

export const openSceneSchema = z.object({
    narration: z.string().describe("The opening scene narration (200-400 words)"),
    protagonistGenerated: z.object({
        name: z.string(),
        description: z.string(),
        traits: z.array(z.string())
    }).nullable().describe("Only present if protagonist was auto-generated"),
    extractedLocation: z.string().describe("The location where the scene takes place"),
    deferredCharacter: z.array(z.object({
        name: z.string(),
        description: z.string(),
        triggerCondition: z.string().describe("When this character should naturally appear , e.g. 'when protagonist visits the market'")
    })).nullable().describe('Cast members not introduced in this scene, to appear later')
})

// triggerCondition makes the story flow pre determined , we should let the story flow in its own shape , we have to work on the architecture , this is for now.

export const sceneResponseSchema = z.object({
    narration: z.string().describe("The scene narration"),
    protagonistUpdates: z.object({
        description: z.string().nullable().describe("Updated appeareance description if it changed significantly this scene"),
        health: z.number().nullable(),
        energy: z.number().nullable(),
        location: z.string().nullable(),
        addTraits: z.array(z.string()).nullable(),
        removeTraits: z.array(z.string()).nullable(),
        addInventory: z.array(z.string()).nullable(),
        removeInventory: z.array(z.string()).nullable(),
        addScars: z.array(z.string()).nullable(),
    }).nullable(),
    echoPlanted: z.object({
        description: z.string().describe("What happened that will echo later"),
        triggerCondition: z.string().describe("When this should resolve, e.g. 'when protagonist visits a market'"),
    }).nullable().describe("A consequence planted for future resolution"),
});

export const sceneExtractionSchema = sceneResponseSchema.pick({
    protagonistUpdates: true,
    echoPlanted: true
})

export type SceneExtraction = z.infer<typeof sceneExtractionSchema>;

export type OpeningSceneResponse = z.infer<typeof openSceneSchema>;
export type SceneResponse = z.infer<typeof sceneResponseSchema>;

export const echoEvalSchema = z.object({
    triggeredEchoIds: z.array(z.number()).describe("IDs of echoes that should trigger now"),
    reasoning: z.string().nullable().describe("Brief explanation of why these echoes triggered"),
});

export const codexExtractionSchema = z.object({
    newEntries: z.array(z.object({
        name: z.string().describe("Entity name"),
        entryType: z.enum(["character", "location", "item", "faction", "event", "lore"]),
        summary: z.string().describe("Brief description based on the scene"),
        metadata: z.record(z.string()).nullable().describe("Structured key-value pairs. For characters: role, status, affiliation. For location: region, dangerLevel, type. For items: rarity, type. For events/lore: timeline, impact")
    })).describe("New entities to add to codex"),

    updates: z.array(z.object({
        name: z.string().describe("Existing entry to update"),
        newInfo: z.string().describe("New information learned about this entity"),
    })).nullable().describe("Updates to existing entries"),
});

export type CodexExtractionResponse = z.infer<typeof codexExtractionSchema>;
export type EchoEvalResponse = z.infer<typeof echoEvalSchema>;

export const deferredCharEvalSchema = z.object({
    triggeredCharacterIds: z.array(z.number()).describe("IDs of deferred characters that should be introduced now"),
    reasoning: z.string().nullable().describe("Why these characters should appear"),
});

export type DeferredCharEvalResponse = z.infer<typeof deferredCharEvalSchema>;