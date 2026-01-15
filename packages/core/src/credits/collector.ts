import { TokenUsage, createEmptyUsage, calculateCredits } from "./calculate";

export class UsageCollector {
    private usage: TokenUsage;

    constructor() {
        this.usage = createEmptyUsage();
    }

    addClaudeUsage(inputTokens: number, outputTokens: number): void {
        this.usage.claudeInput += inputTokens;
        this.usage.claudeOutput += outputTokens;
    }

    addGptUsage(inputTokens: number, outputTokens: number): void {
        this.usage.gptInput += inputTokens;
        this.usage.gptOutput += outputTokens;
    }

    addEmbeddingUsage(tokens: number): void {
        this.usage.embedding += tokens;
    }

    getUsage(): TokenUsage {
        return { ...this.usage };
    }

    getCredits(): number {
        return calculateCredits(this.usage);
    }

    toJSON() {
        return {
            usage: this.usage,
            credits: this.getCredits()
        };
    }
}