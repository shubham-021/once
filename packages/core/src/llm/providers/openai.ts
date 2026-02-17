import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { LLMProvider, EmbeddingProvider, LLMResponse, LLMUsage } from "./types";
import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../../.env") });


// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// })

// even though we are using google , this openai initiation is being imported and tries to create the openai client at module load , causing error
// solution: we have to lazy load this

// lazy getter:

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })
    }
    return _openai;
}

const LLM_MODEL = process.env.OPENAI_LLM_MODEL || 'gpt-4o-mini';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

export const openaiLLM: LLMProvider = {
    async generateText(instructions: string, input: string): Promise<string> {
        const response = await getOpenAI().responses.create({
            model: LLM_MODEL,
            instructions,
            input
        })

        return response.output_text
    },

    async generateStructured<T extends z.ZodTypeAny>(
        instructions: string,
        input: string,
        schema: T,
        schemaName: string
    ): Promise<z.infer<T>> {

        const response = await getOpenAI().responses.parse({
            model: LLM_MODEL,
            instructions,
            input,
            text: { format: zodTextFormat(schema, schemaName) }
        })

        return response.output_parsed
    },

    async *streamTextWithUsage(instructions: string, input: string): AsyncGenerator<string, LLMUsage> {
        const stream = await getOpenAI().responses.create({
            model: LLM_MODEL,
            instructions,
            input,
            stream: true
        })

        let usage: LLMUsage = { inputTokens: 0, outputTokens: 0 };

        for await (const event of stream) {
            if (event.type === 'response.output_text.delta') {
                yield event.delta
            }

            if (event.type === 'response.completed') {
                usage = {
                    inputTokens: event.response.usage?.input_tokens || 0,
                    outputTokens: event.response.usage?.output_tokens || 0
                }
            }
        }

        return usage;
    },

    async *streamText(instructions: string, input: string): AsyncGenerator<string> {
        const stream = await getOpenAI().responses.create({
            model: LLM_MODEL,
            instructions,
            input,
            stream: true
        })

        for await (const event of stream) {
            if (event.type === 'response.output_text.delta') {
                yield event.delta
            }
        }
    },

    async generateTextWithUsage(instructions: string, input: string): Promise<LLMResponse<string>> {
        const response = await getOpenAI().responses.create({
            model: LLM_MODEL,
            instructions,
            input
        })

        return {
            result: response.output_text,
            usage: {
                inputTokens: response.usage?.input_tokens || 0,
                outputTokens: response.usage?.output_tokens || 0
            }
        }
    },

    async generateStructuredWithUsage<T>(instructions: string, input: string, schema: z.ZodSchema<T>, schemaName: string = "response"): Promise<LLMResponse<T>> {

        const response = await getOpenAI().responses.parse({
            model: LLM_MODEL,
            instructions,
            input,
            text: { format: zodTextFormat(schema, schemaName) }
        });

        return {
            result: response.output_parsed as T,
            usage: {
                inputTokens: response.usage?.input_tokens || 0,
                outputTokens: response.usage?.output_tokens || 0
            }
        };
    }
}


export const openaiEmbedding: EmbeddingProvider = {
    dimensions: 1536,

    async embed(text: string): Promise<number[]> {
        const response = await getOpenAI().embeddings.create({
            model: EMBEDDING_MODEL,
            input: text,
            dimensions: 1536
        })
        return response.data[0].embedding
    },

    async embedWithUsage(text: string): Promise<{ embedding: number[]; tokens: number }> {

        const response = await getOpenAI().embeddings.create({
            model: EMBEDDING_MODEL,
            input: text,
            dimensions: 1536
        });

        return {
            embedding: response.data[0].embedding,
            tokens: response.usage?.total_tokens || 0
        };
    }
}