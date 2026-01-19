import { generateStructured, generateStructuredWithTracking } from "../llm/generate";
import { buildSystemPrompt } from "../llm/prompts/system";
import { buildInitializePrompt } from "../llm/prompts/initialize";
import { buildContinuePrompt } from "../llm/prompts/continue";
import { openSceneSchema, sceneResponseSchema } from "@once/shared/schemas";
import type { NarrativeStance, StoryMode } from "@once/shared/schemas";
import { UsageCollector } from "@/credits/collector";

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