import { generateResponseWithTracking, generateStructured, generateStructuredWithTracking, streamNarrationWithTracking } from "../llm/generate";
import { buildSystemPrompt } from "../llm/prompts/system";
import { buildInitializePrompt } from "../llm/prompts/initialize";
import { buildContinuePrompt } from "../llm/prompts/continue";
import { openSceneSchema, sceneResponseSchema } from "@once/shared/schemas";
import type { NarrativeStance, StoryMode } from "@once/shared/schemas";
import { UsageCollector } from "@/credits/collector";
import { buildOpeningRevisionPrompt, buildRevisionPrompt, buildRevisionSystemPrompt } from "@/llm/prompts/revision";

interface InitializeContext {
    narrativeStance: NarrativeStance;
    storyMode: StoryMode;
    title: string;
    genre: string;
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
        location: string;
    };
}

interface ContinueContext {
    narrativeStance: NarrativeStance;
    storyMode: StoryMode;
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

interface OpeningContext {
    narrativeStance: NarrativeStance;
    storyMode: StoryMode;
    title: string;
    genre: string;
    storyIdea?: string;
    worldDescription?: string | null;
    promptForOnce?: string;
    startingScene?: string;
    cast?: Array<{ name: string; description: string }>;
    castMode?: 'strict' | 'flexible';
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
    };
}

interface systemPromptContext {
    narrativeStance: NarrativeStance;
    storyMode: StoryMode;
    title: string;
    genre: string;
    storyIdea?: string;
    worldDescription?: string | null;
    promptForOnce?: string;
    startingScene?: string;
    cast?: Array<{ name: string; description: string }>;
    castMode?: 'strict' | 'flexible';
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
    };
}

interface OpeningRevisionContext {
    originalNarration: string;
    userComment: string;
    title: string;
    genre: string;
    protagonist?: {
        id: number;
        description: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storyId: number;
        health: number;
        energy: number;
        currentLocation: string;
        baseTraits: string[];
        currentTraits: string[];
        inventory: string[];
        scars: string[];
        isActive: boolean;
    };
    worldDescription?: string | null;
    storyIdea?: string | null;
}

export async function generateOpeningScene(ctx: systemPromptContext, usageCollector?: UsageCollector) {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode);
    const initPrompt = buildInitializePrompt({startingScene: ctx.startingScene});

    return generateStructuredWithTracking(
        systemPrompt,
        initPrompt,
        openSceneSchema,
        "opening_scene",
        usageCollector
    );
}

export async function* streamOpeningScene(ctx: systemPromptContext, usageCollector?: UsageCollector): AsyncGenerator<string> {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode, ctx.title, ctx.genre, ctx.storyIdea, ctx.protagonist ,ctx.worldDescription, ctx.promptForOnce, ctx.cast, ctx.castMode);
    const initPrompt = buildInitializePrompt({ startingScene: ctx.startingScene });

    yield* streamNarrationWithTracking(systemPrompt, initPrompt, usageCollector);
}

export async function* streamOpeningRevision(ctx: OpeningRevisionContext, usageCollector?: UsageCollector): AsyncGenerator<string> {
    const systemPrompt = buildRevisionSystemPrompt();
    const revisionPrompt = buildOpeningRevisionPrompt(ctx);

    yield* streamNarrationWithTracking(systemPrompt, revisionPrompt, usageCollector);
}

export async function generateOpeningNarration(ctx: OpeningContext, usageCollector?: UsageCollector): Promise<string> {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode, ctx.title, ctx.genre, ctx.storyIdea, ctx.protagonist ,ctx.worldDescription, ctx.promptForOnce, ctx.cast, ctx.castMode);
    const initPrompt = buildInitializePrompt({ startingScene: ctx.startingScene });

    return generateResponseWithTracking(systemPrompt, initPrompt, usageCollector);
}

export async function generateContinuation(syst: systemPromptContext, cont: ContinueContext, usageCollector?: UsageCollector) {
    const systemPrompt = buildSystemPrompt(syst.narrativeStance, syst.storyMode, syst.title, syst.genre, syst.storyIdea, syst.protagonist ,syst.worldDescription, syst.promptForOnce, syst.cast, syst.castMode);

    const continuePrompt = buildContinuePrompt({
        stance: cont.narrativeStance,
        mode: cont.storyMode,
        protagonist: cont.protagonist,
        recentScenes: cont.recentScenes,
        userAction: cont.userAction,
        triggeredEchoes: cont.triggeredEchoes,
        factualKnowledge: cont.factualKnowledge,
        introducedCharacters: cont.introducedCharacters
    });

    return generateStructuredWithTracking(
        systemPrompt,
        continuePrompt,
        sceneResponseSchema,
        "scene_response",
        usageCollector
    );
}

export async function* streamNarrationOnly(syst: systemPromptContext, cont: ContinueContext, usageCollector?: UsageCollector): AsyncGenerator<string> {
    const systemPrompt = buildSystemPrompt(syst.narrativeStance, syst.storyMode, syst.title, syst.genre, syst.storyIdea, syst.protagonist ,syst.worldDescription, syst.promptForOnce, syst.cast, syst.castMode);
    const continuePrompt = buildContinuePrompt({
        stance: cont.narrativeStance,
        mode: cont.storyMode,
        protagonist: cont.protagonist,
        recentScenes: cont.recentScenes,
        userAction: cont.userAction,
        triggeredEchoes: cont.triggeredEchoes,
        factualKnowledge: cont.factualKnowledge,
        introducedCharacters: cont.introducedCharacters
    });

    yield* streamNarrationWithTracking(systemPrompt, continuePrompt, usageCollector);
}

export async function* streamRevision(originalNarration: string, userComment: string, usageCollector?: UsageCollector): AsyncGenerator<string> {
    const systemPrompt = buildRevisionSystemPrompt();
    const revisionPrompt = buildRevisionPrompt({ originalNarration, userComment });

    yield* streamNarrationWithTracking(systemPrompt, revisionPrompt, usageCollector);
}