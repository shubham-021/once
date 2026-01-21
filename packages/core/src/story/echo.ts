import { db, DBTransaction, eq, inArray } from "@once/database";
import { echoes } from "@once/database/schema";
import { generateStructured, generateStructuredWithTracking } from "../llm/generate";
import { buildEchoEvalPrompt } from "../llm/prompts/echo";
import { echoEvalSchema } from "@once/shared/schemas";
import { DebugCollector } from "@/debug";
import { UsageCollector } from "@/credits/collector";

interface EchoEvalContext {
    storyId: number;
    pendingEchoes: Array<{
        id: number;
        description: string;
        triggerCondition: string;
    }>;
    protagonistLocation: string;
    protagonistState: string;
    userAction: string;
    recentNarration: string;
}

export async function evaluateEchoes(ctx: EchoEvalContext, usageCollector?: UsageCollector): Promise<typeof ctx.pendingEchoes> {
    if (ctx.pendingEchoes.length === 0) return [];

    const prompt = buildEchoEvalPrompt({
        pendingEchoes: ctx.pendingEchoes,
        protagonistLocation: ctx.protagonistLocation,
        protagonistState: ctx.protagonistState,
        userAction: ctx.userAction,
        recentNarration: ctx.recentNarration
    })

    if (!prompt) return [];

    const result = await generateStructuredWithTracking(
        "You evaluate story echoes to decide which should trigger",
        prompt,
        echoEvalSchema,
        "echo_eval",
        usageCollector
    );

    return ctx.pendingEchoes.filter(e => result.triggeredEchoIds.includes(e.id));
}

export async function plantEcho(
    storyId: number,
    sourceSceneId: number,
    description: string,
    triggerCondition: string,
    tx: DBTransaction
) {
    await tx.insert(echoes).values({
        storyId,
        sourceSceneId,
        description,
        triggerCondition,
        status: "pending"
    })
}

export async function resolveEchoes(echoIds: number[], resolvedAtSceneId: number, tx: DBTransaction, collector?: DebugCollector) {
    if (echoIds.length === 0) return;
    await tx.update(echoes)
        .set({
            status: "resolved",
            resolvedAtSceneId,
            updatedAt: new Date(),
        })
        .where(inArray(echoes.id, echoIds));

    collector?.add('db', 'storingResolvedEchoes', { status: 'resolved', resolvedAtSceneId });
}