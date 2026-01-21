import { generateStructured, generateStructuredWithTracking, streamNarrationWithTracking } from "../llm/generate";
import { buildSystemPrompt } from "../llm/prompts/system";
import { buildInitializePrompt } from "../llm/prompts/initialize";
import { buildContinuePrompt } from "../llm/prompts/continue";
import { openSceneSchema, sceneResponseSchema } from "@once/shared/schemas";
import type { NarrativeStance, StoryMode } from "@once/shared/schemas";
import { UsageCollector } from "@/credits/collector";
import { buildRevisionPrompt, buildRevisionSystemPrompt } from "@/llm/prompts/revision";

interface StoryContext {
    narrativeStance: NarrativeStance;
    storyMode: StoryMode;
}

interface InitializeContext extends StoryContext {
    title: string;
    genre: string;
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
        location: string;
    };
}

interface ContinueContext extends StoryContext {
    promptForOnce?: string | null;
    worldDescription?: string | null;
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
    triggeredEchoes: Array<{ description: string }>;
    factualKnowledge: string[],
    introducedCharacters?: Array<{
        name: string;
        description?: string | null;
        role?: string | null;
    }>;
}

export async function generateOpeningScene(ctx: InitializeContext, usageCollector?: UsageCollector) {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode);
    const initPrompt = buildInitializePrompt({
        title: ctx.title,
        genre: ctx.genre,
        stance: ctx.narrativeStance,
        mode: ctx.storyMode,
        protagonist: ctx.protagonist,
    });

    return generateStructuredWithTracking(
        systemPrompt,
        initPrompt,
        openSceneSchema,
        "opening_scene",
        usageCollector
    );
}

export async function generateContinuation(ctx: ContinueContext, usageCollector?: UsageCollector) {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode, ctx.worldDescription, ctx.promptForOnce);

    const continuePrompt = buildContinuePrompt({
        stance: ctx.narrativeStance,
        mode: ctx.storyMode,
        protagonist: ctx.protagonist,
        recentScenes: ctx.recentScenes,
        userAction: ctx.userAction,
        triggeredEchoes: ctx.triggeredEchoes,
        factualKnowledge: ctx.factualKnowledge,
        introducedCharacters: ctx.introducedCharacters
    });

    return generateStructuredWithTracking(
        systemPrompt,
        continuePrompt,
        sceneResponseSchema,
        "scene_response",
        usageCollector
    );
}

export async function* streamNarrationOnly(ctx: ContinueContext, usageCollector?: UsageCollector): AsyncGenerator<string> {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode, ctx.worldDescription, ctx.promptForOnce);
    const continuePrompt = buildContinuePrompt({
        stance: ctx.narrativeStance,
        mode: ctx.storyMode,
        protagonist: ctx.protagonist,
        recentScenes: ctx.recentScenes,
        userAction: ctx.userAction,
        triggeredEchoes: ctx.triggeredEchoes,
        factualKnowledge: ctx.factualKnowledge,
        introducedCharacters: ctx.introducedCharacters
    });

    yield* streamNarrationWithTracking(systemPrompt, continuePrompt, usageCollector);
}

export async function* streamRevision(originalNarration: string, userComment: string, usageCollector?: UsageCollector): AsyncGenerator<string> {
    const systemPrompt = buildRevisionSystemPrompt();
    const revisionPrompt = buildRevisionPrompt({ originalNarration, userComment });

    yield* streamNarrationWithTracking(systemPrompt, revisionPrompt, usageCollector);
}