import { z } from "zod";
import { llm } from "./providers";
import { UsageCollector } from "@/credits/collector";

export async function* streamNarration(instructions: string, input: string): AsyncGenerator<string> {
    yield* llm.streamText(instructions, input);
}

export async function generateResponse(instructions: string, input: string): Promise<string> {
    return llm.generateText(instructions, input)
}

export async function generateStructured<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, schemaName: string = "response"): Promise<z.infer<T>> {
    return llm.generateStructured(instructions, input, schema, schemaName);
}

export async function generateResponseWithTracking(instructions: string, input: string, collector?: UsageCollector): Promise<string> {
    if (collector) {
        const { result, usage } = await llm.generateTextWithUsage(instructions, input);
        collector.addGptUsage(usage.inputTokens, usage.outputTokens);
        return result;
    }

    return llm.generateText(instructions, input);
}


export async function generateStructuredWithTracking<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, schemaName: string = "response", collector?: UsageCollector): Promise<z.infer<T>> {

    if (collector) {
        const { result, usage } = await llm.generateStructuredWithUsage(
            instructions,
            input,
            schema,
            schemaName
        );

        // using GPT, will switch to Claude later
        collector.addGptUsage(usage.inputTokens, usage.outputTokens);
        return result;
    }

    return llm.generateStructured(instructions, input, schema, schemaName);
}