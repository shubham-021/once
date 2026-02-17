import { UsageCollector } from "@/credits";
import { generateStructuredWithTracking } from "@/llm";
import { buildSceneExtractionPrompt, sceneExtractionSystemPrompt } from "@/llm/prompts/scene-extract";
import { SceneExtraction, sceneExtractionSchema } from "@once/shared";

type Props = {
    narration: string;
    protagonist: {
        name: string;
        health: number;
        energy: number;
        location: string;
        traits: string[];
        inventory: string[]
    },
    usageCollector?: UsageCollector
}

export async function extractSceneData(props: Props): Promise<SceneExtraction> {
    const sceneExtractionPrompt = buildSceneExtractionPrompt(props.narration, props.protagonist);

    return generateStructuredWithTracking(sceneExtractionSystemPrompt, sceneExtractionPrompt, sceneExtractionSchema, "scene_extraction", props.usageCollector);
}