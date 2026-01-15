import { CREDIT_RATES } from "./rates";

export interface TokenUsage {
    claudeInput: number;
    claudeOutput: number;
    gptInput: number;
    gptOutput: number;
    embedding: number;
}

export function calculateCredits(usage: TokenUsage): number {
    return Math.ceil(
        (usage.claudeInput / 1000) * CREDIT_RATES.claudeInput +
        (usage.claudeOutput / 1000) * CREDIT_RATES.claudeOutput +
        (usage.gptInput / 1000) * CREDIT_RATES.gptInput +
        (usage.gptOutput / 1000) * CREDIT_RATES.gptOutput +
        (usage.embedding / 1000) * CREDIT_RATES.embedding
    );
}

export function estimateCredits(contextLength: number): number {
    // Estimate based on typical continuation
    const usage: TokenUsage = {
        claudeInput: contextLength,
        claudeOutput: 800,      // typical narration
        gptInput: 2600,         // auxiliary tasks
        gptOutput: 600,         // auxiliary outputs
        embedding: 800          // scene text
    };
    return calculateCredits(usage);
}

export function createEmptyUsage(): TokenUsage {
    return {
        claudeInput: 0,
        claudeOutput: 0,
        gptInput: 0,
        gptOutput: 0,
        embedding: 0
    };
}