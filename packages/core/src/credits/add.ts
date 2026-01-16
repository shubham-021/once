import { db, eq } from "@once/database";
import { userCredits, creditTransactions } from "@once/database";

interface AddCreditsParam {
    userId: string;
    credits: number;
    paymentId: string;
    packageName: string;
    amountPaid: number
}

export async function addCredits(params: AddCreditsParam): Promise<number> {
    const { userId, credits, paymentId, packageName, amountPaid } = params;

    const result = await db.transaction(async (tx) => {
        let userCredit = await tx.query.userCredits.findFirst({
            where: eq(userCredits.userId, userId)
        });

        if (!userCredit) {
            await tx.insert(userCredits).values({
                userId,
                balance: credits,
                lifetimePurchased: credits,
                lifetimeUsed: 0
            }).returning();

            await tx.insert(creditTransactions).values({
                userId,
                type: "purchase",
                amount: credits,
                balanceAfter: credits,
                paymentId,
                packageName,
                amountPaid
            });

            return credits;
        }

        const newBalance = userCredit.balance + credits;

        await tx.update(userCredits).set({
            balance: newBalance,
            lifetimePurchased: userCredit.lifetimePurchased + credits,
            lastPurchaseAt: new Date(),
            updatedAt: new Date()
        }).where(eq(userCredits.userId, userId));

        await tx.insert(creditTransactions).values({
            userId,
            type: "purchase",
            amount: credits,
            balanceAfter: newBalance,
            paymentId,
            packageName,
            amountPaid
        });

        return newBalance;
    })

    return result;
}