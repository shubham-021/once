import { z } from "zod";

export interface LLMUsage {
    inputTokens: number;
    outputTokens: number;
}

export interface LLMResponse<T = string> {
    result: T;
    usage: LLMUsage;
}

export interface LLMProvider {
    generateText(instructions: string, input: string): Promise<string>;
    generateStructured<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, schemaName: string): Promise<z.infer<T>>;
    streamText(instructions: string, input: string): AsyncGenerator<string>;

    generateTextWithUsage(instructions: string, input: string): Promise<LLMResponse<string>>;
    generateStructuredWithUsage<T>(instructions: string, input: string, schema: z.ZodSchema<T>, schemaName?: string): Promise<LLMResponse<T>>;
}

export interface EmbeddingProvider {
    embed(text: string): Promise<number[]>;
    embedWithUsage(text: string): Promise<{ embedding: number[]; tokens: number }>;
    dimensions: number;
}