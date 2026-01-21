import { db, DBTransaction, eq } from "@once/database";
import { deferredCharacters } from "@once/database/schema";
import { generateStructured, generateStructuredWithTracking } from "../llm";
import { buildDeferredCharPrompt } from "../llm/prompts/deferred";
import { deferredCharEvalSchema } from "@once/shared/schemas";
import { UsageCollector } from "@/credits/collector";

interface DeferredCharEvalContext {
    storyId: number;
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
    recentNarration: string;
}

export async function evaluateDeferredCharacters(ctx: DeferredCharEvalContext, usageCollector?: UsageCollector) {
    if (ctx.pendingCharacters.length === 0) return [];

    const prompt = buildDeferredCharPrompt(ctx);

    const result = await generateStructuredWithTracking(
        "You evaluate when deferred characters should be introduced into a story",
        prompt,
        deferredCharEvalSchema,
        "deferred_char_eval",
        usageCollector
    );

    return ctx.pendingCharacters.filter(c => result.triggeredCharacterIds.includes(c.id));
}

export async function markCharacterIntroduced(characterId: number, sceneId: number, tx: DBTransaction) {
    await tx.update(deferredCharacters)
        .set({
            introduced: true,
            introducedAtSceneId: sceneId,
        })
        .where(eq(deferredCharacters.id, characterId));
}