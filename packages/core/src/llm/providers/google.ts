import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { LLMProvider, EmbeddingProvider, LLMResponse } from "./types";
import zodToJsonSchema from "zod-to-json-schema";
import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../../.env") });

// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });

// even though we are using google , this openai initiation is being imported and tries to create the openai client at module load , causing error
// solution: we have to lazy load this

// lazy getter:

let _googleai: GoogleGenAI | null = null;

function getGoogleGenAi(): GoogleGenAI {
    if (!_googleai) {
        _googleai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_API_KEY
        })
    }
    return _googleai;
}

const LLM_MODEL = process.env.GOOGLE_LLM_MODEL || 'gemini-3-flash-preview';
const EMBEDDING_MODEL = process.env.GOOGLE_EMBEDDING_MODEL || 'gemini-embedding-001'

export const googleLLM: LLMProvider = {
    async generateText(instructions: string, input: string): Promise<string> {

        const response = await getGoogleGenAi().models.generateContent({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions
            }
        })

        return response.text || '';
    },

    async generateStructured<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, _schemaName: string): Promise<z.infer<T>> {
        const jsonSchema = zodToJsonSchema(schema);

        const response = await getGoogleGenAi().models.generateContent({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions,
                responseMimeType: 'application/json',
                responseSchema: jsonSchema
            }
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        return schema.parse(parsed);
    },

    async generateTextWithUsage(instructions: string, input: string): Promise<LLMResponse<string>> {
        const response = await getGoogleGenAi().models.generateContent({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions
            }
        });
        return {
            result: response.text || '',
            usage: {
                inputTokens: response.usageMetadata?.promptTokenCount || 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount || 0
            }
        };
    },

    async generateStructuredWithUsage<T>(
        instructions: string,
        input: string,
        schema: z.ZodSchema<T>,
        schemaName: string = "response"
    ): Promise<LLMResponse<T>> {
        const jsonSchema = zodToJsonSchema(schema);
        const response = await getGoogleGenAi().models.generateContent({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions,
                responseMimeType: 'application/json',
                responseSchema: jsonSchema
            }
        });
        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        return {
            result: schema.parse(parsed),
            usage: {
                inputTokens: response.usageMetadata?.promptTokenCount || 0,
                outputTokens: response.usageMetadata?.candidatesTokenCount || 0
            }
        };
    },

    async *streamText(instructions: string, input: string): AsyncGenerator<string> {
        const response = await getGoogleGenAi().models.generateContentStream({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions
            }
        });

        for await (const chunk of response) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    }
}

export const googleEmbedding: EmbeddingProvider = {
    dimensions: 1536,

    async embed(text: string): Promise<number[]> {
        const response = await getGoogleGenAi().models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
            config: {
                outputDimensionality: 1536
            }
        });
        return response.embeddings?.[0].values || [];
    },

    async embedWithUsage(text: string): Promise<{ embedding: number[]; tokens: number }> {

        const tokenCount = await getGoogleGenAi().models.countTokens({
            model: EMBEDDING_MODEL,
            contents: text
        })

        const response = await getGoogleGenAi().models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
            config: {
                outputDimensionality: 1536
            }
        });

        return {
            embedding: response.embeddings?.[0].values || [],
            tokens: tokenCount.totalTokens || 0
        };
    }
};

// Generative LLMs(GPT, Claude)
//     Input tokens: What you send (prompt, context)
//     Output tokens: What the model generates (new text)
//     Both are counted separately because:
//     Input = you're paying for processing/understanding
//     Output = you're paying for generation (computationally expensive)

// Embedding Models
//     Input tokens: The text you're encoding
//     Output: A fixed-size vector (e.g., 1536 floats) — NOT tokens
//     There's no "output tokens" because:
//     The model doesn't generate text
//     It transforms text into a mathematical representation
//     The output is always the same size (e.g., 1536 dimensions) regardless of input

// TLDR: Embedding models don't generate text — they just convert text into a vector. The "output" is a fixed-size array of numbers, not tokens. So there's only input to count.

// Embeddings are ~100-750x cheaper than LLM generation because there's no autoregressive token-by-token generation — just a single forward pass through the encoder.

