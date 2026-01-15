export const CREDIT_RATES = {
    claudeInput: 15,      // per 1K tokens
    claudeOutput: 75,     // per 1K tokens
    gptInput: 1,          // per 1K tokens
    gptOutput: 3,         // per 1K tokens
    embedding: 0.1        // per 1K tokens
} as const;

export const PACKAGES = {
    starter: { name: "Starter", price: 499, credits: 2000 },
    explorer: { name: "Explorer", price: 999, credits: 4000 },
    storyteller: { name: "Storyteller", price: 1999, credits: 8000 },
    author: { name: "Author", price: 4999, credits: 20000 }
} as const;

export type PackageId = keyof typeof PACKAGES;