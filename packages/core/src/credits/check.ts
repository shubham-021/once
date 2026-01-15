import { db, eq } from "@once/database";
import { userCredits } from "@once/database/schema";

// ??
export class InsufficientCreditsError extends Error {
    constructor(public balance: number) {
        super(`Insufficient credits. Current balance: ${balance}`);
        this.name = "InsufficientCreditsError";
    }
}

export async function checkCredits(userId: string): Promise<number> {
    const userCredit = await db.query.userCredits.findFirst({
        where: eq(userCredits.userId, userId)
    });

    if (!userCredit) {
        throw new InsufficientCreditsError(0);
    }

    // Must have > 0 to start (can go negative during scene)
    if (userCredit.balance <= 0) {
        throw new InsufficientCreditsError(userCredit.balance);
    }

    return userCredit.balance;
}