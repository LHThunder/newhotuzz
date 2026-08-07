import { prisma } from "@/lib/prisma";
import type { CreateTransactionInput } from "@/lib/validations/finance";

export const financeService = {
  /** Dashboard rollup: income/expense for the month + spending by category. */
  async summary(userId: string, month = new Date()) {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);

    const [txns, accounts] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: start, lt: end } },
      }),
      prisma.account.findMany({ where: { userId } }),
    ]);

    const income = sum(txns.filter((t) => t.type === "INCOME").map((t) => Number(t.amount)));
    const expense = sum(txns.filter((t) => t.type === "EXPENSE").map((t) => Number(t.amount)));
    const netWorth = sum(accounts.map((a) => Number(a.balance)));

    const byCategory = Object.entries(
      txns
        .filter((t) => t.type === "EXPENSE")
        .reduce<Record<string, number>>((acc, t) => {
          acc[t.category] = (acc[t.category] ?? 0) + Number(t.amount);
          return acc;
        }, {}),
    ).map(([category, amount]) => ({ category, amount }));

    return {
      income,
      expense,
      netWorth,
      savingsRate: income ? Math.round(((income - expense) / income) * 100) : 0,
      byCategory,
    };
  },

  list(userId: string, take = 50) {
    return prisma.transaction.findMany({
      where: { userId },
      include: { account: true },
      orderBy: { date: "desc" },
      take,
    });
  },

  accounts(userId: string) {
    return prisma.account.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  },

  /** Returns the user's first account, creating a default "Ví" wallet if none. */
  async defaultAccount(userId: string) {
    const existing = await prisma.account.findFirst({ where: { userId } });
    if (existing) return existing;
    return prisma.account.create({ data: { userId, name: "Ví", kind: "cash", balance: 0 } });
  },

  async create(userId: string, input: CreateTransactionInput) {
    // Create the transaction and adjust the account balance atomically.
    const delta = input.type === "INCOME" ? input.amount : -input.amount;
    return prisma.$transaction([
      prisma.transaction.create({ data: { ...input, userId } }),
      prisma.account.update({
        where: { id: input.accountId },
        data: { balance: { increment: delta } },
      }),
    ]);
  },
};

function sum(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0);
}
