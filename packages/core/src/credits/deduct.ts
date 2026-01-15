import { db, eq } from "@once/database";
import { userCredits, creditTransactions } from "@once/database/schema";
import { TokenUsage } from "./calculate";

interface DeductCreditsParams {
    userId: string;
    storyId: number;
    sceneId: number;
    creditsUsed: number;
    usage: TokenUsage;
}

export async function deductCredits(params: DeductCreditsParams): Promise<number> {
    const { userId, storyId, sceneId, creditsUsed, usage } = params;

    const result = await db.transaction(async (tx) => {
        const userCredit = await tx.query.userCredits.findFirst({
            where: eq(userCredits.userId, userId)
        })

        if (!userCredit) throw new Error(`No credit record for user ${userId}`);

        const newBalance = userCredit.balance - creditsUsed;

        await tx.update(userCredits).set({
            balance: newBalance,
            lifetimeUsed: userCredit.lifetimeUsed + creditsUsed,
            updatedAt: new Date()
        }).where(eq(userCredits.userId, userId));

        await tx.insert(creditTransactions).values({
            userId,
            type: "usage",
            amount: -creditsUsed,
            balanceAfter: newBalance,
            storyId,
            sceneId,
            claudeInputTokens: usage.claudeInput,
            claudeOutputTokens: usage.claudeOutput,
            gptInputTokens: usage.gptInput,
            gptOutputTokens: usage.gptOutput,
            embeddingTokens: usage.embedding
        });

        return newBalance;
    });

    return result;
}