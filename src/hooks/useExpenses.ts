import { useState, useEffect, useCallback } from "react";
import type { Expense } from "@/types/expense";

const STORAGE_KEY = "student-budget-expenses";
const BUDGET_KEY = "student-budget-limit";

function loadExpenses(): Expense[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadBudget(): number {
  try {
    const stored = localStorage.getItem(BUDGET_KEY);
    return stored ? Number(stored) : 0;
  } catch {
    return 0;
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [budget, setBudgetState] = useState<number>(loadBudget);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, String(budget));
  }, [budget]);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    setExpenses((prev) => [
      { ...expense, id: crypto.randomUUID() },
      ...prev,
    ]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setBudget = useCallback((amount: number) => {
    setBudgetState(amount);
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;
  const percentUsed = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const isOverBudget = budget > 0 && totalSpent > budget;
  const isNearBudget = budget > 0 && percentUsed >= 80 && !isOverBudget;

  return {
    expenses,
    budget,
    totalSpent,
    remaining,
    percentUsed: Math.min(percentUsed, 100),
    isOverBudget,
    isNearBudget,
    addExpense,
    deleteExpense,
    setBudget,
  };
}
