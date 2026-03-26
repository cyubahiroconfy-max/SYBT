import { useState, useEffect, useCallback } from "react";
import type { SavingEntry } from "@/types/savings";

const SAVINGS_KEY = "sybt-savings";
const BUDGET_KEY = "sybt-budget";
const EXPENSES_KEY = "student-budget-expenses";

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function useSavings() {
  const [savings, setSavings] = useState<SavingEntry[]>(() => load(SAVINGS_KEY, []));
  const [budget, setBudgetState] = useState<number>(() => load(BUDGET_KEY, 0));
  const [expenses, setExpenses] = useState<{ id: string; amount: number; category: string; description: string; date: string }[]>(() => load(EXPENSES_KEY, []));

  useEffect(() => { localStorage.setItem(SAVINGS_KEY, JSON.stringify(savings)); }, [savings]);
  useEffect(() => { localStorage.setItem(BUDGET_KEY, String(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses)); }, [expenses]);

  const addSaving = useCallback((amount: number, paymentMethod: "MTN" | "Airtel", durationDays: number) => {
    const now = new Date();
    const unlockAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const entry: SavingEntry = {
      id: crypto.randomUUID(),
      amount,
      paymentMethod,
      duration: durationDays,
      createdAt: now.toISOString(),
      unlockAt: unlockAt.toISOString(),
      withdrawn: false,
    };
    setSavings((prev) => [entry, ...prev]);
  }, []);

  const withdraw = useCallback((id: string) => {
    setSavings((prev) => prev.map((s) => s.id === id ? { ...s, withdrawn: true } : s));
  }, []);

  const addExpense = useCallback((expense: Omit<{ id: string; amount: number; category: string; description: string; date: string }, "id">) => {
    setExpenses((prev) => [{ ...expense, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setBudget = useCallback((amount: number) => {
    setBudgetState(amount);
  }, []);

  const totalSaved = savings.filter((s) => !s.withdrawn).reduce((sum, s) => sum + s.amount, 0);
  const totalWithdrawn = savings.filter((s) => s.withdrawn).reduce((sum, s) => sum + s.amount, 0);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const activeSavings = savings.filter((s) => !s.withdrawn);
  const lockedSavings = activeSavings.filter((s) => new Date(s.unlockAt) > new Date());
  const unlockedSavings = activeSavings.filter((s) => new Date(s.unlockAt) <= new Date());

  return {
    savings,
    expenses,
    budget,
    totalSaved,
    totalWithdrawn,
    totalSpent,
    activeSavings,
    lockedSavings,
    unlockedSavings,
    addSaving,
    withdraw,
    addExpense,
    deleteExpense,
    setBudget,
  };
}
