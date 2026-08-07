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

  /** Income/expense totals per month for the last `months` months. */
  async monthlySeries(userId: string, months = 6) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const txns = await prisma.transaction.findMany({
      where: { userId, date: { gte: start } },
      select: { type: true, amount: true, date: true },
    });

    const series: { month: string; income: number; expense: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      series.push({ month: `T${d.getMonth() + 1}`, income: 0, expense: 0 });
    }
    for (const t of txns) {
      const idx = months - 1 - (now.getMonth() - t.date.getMonth() + 12 * (now.getFullYear() - t.date.getFullYear()));
      if (idx < 0 || idx >= months) continue;
      const amt = Number(t.amount);
      if (t.type === "INCOME") series[idx].income += amt;
      else if (t.type === "EXPENSE") series[idx].expense += amt;
    }
    return series;
  },

  /** Budgets for this month with computed spent per category. */
  async budgets(userId: string) {
    const start = new Date();
    start.setDate(1); start.setHours(0, 0, 0, 0);
    const [budgets, txns] = await Promise.all([
      prisma.budget.findMany({ where: { userId, period: "monthly" } }),
      prisma.transaction.findMany({ where: { userId, type: "EXPENSE", date: { gte: start } }, select: { category: true, amount: true } }),
    ]);
    const spent: Record<string, number> = {};
    for (const t of txns) spent[t.category] = (spent[t.category] ?? 0) + Number(t.amount);
    return budgets.map((b) => ({ id: b.id, category: b.category, limit: Number(b.limit), spent: spent[b.category] ?? 0 }));
  },

  setBudget(userId: string, category: string, limit: number) {
    return prisma.budget.upsert({
      where: { userId_category_period: { userId, category, period: "monthly" } },
      update: { limit },
      create: { userId, category, limit, period: "monthly" },
    });
  },

  async deleteBudget(userId: string, id: string) {
    const owned = await prisma.budget.findFirst({ where: { id, userId } });
    if (!owned) throw new Error("Không có quyền.");
    return prisma.budget.delete({ where: { id } });
  },

  /** Delete a transaction and reverse its effect on the account balance. */
  async deleteTransaction(userId: string, id: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new Error("Không tìm thấy.");
    const reverse = tx.type === "INCOME" ? -Number(tx.amount) : Number(tx.amount);
    return prisma.$transaction([
      prisma.transaction.delete({ where: { id } }),
      prisma.account.update({ where: { id: tx.accountId }, data: { balance: { increment: reverse } } }),
    ]);
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
