import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SavingEntry } from "@/types/savings";

export function useSavings() {
  const [savings, setSavings] = useState<SavingEntry[]>([]);
  const [budget, setBudgetState] = useState<number>(0);
  const [expenses, setExpenses] = useState<{ id: string; amount: number; category: string; description: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [savingsRes, expensesRes, budgetRes] = await Promise.all([
        supabase.from("savings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("budgets").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      if (savingsRes.data) {
        setSavings(savingsRes.data.map((s: any) => ({
          id: s.id,
          amount: Number(s.amount),
          paymentMethod: s.payment_method as "MTN" | "Airtel",
          duration: s.duration_days,
          createdAt: s.created_at,
          unlockAt: s.lock_until || s.created_at,
          withdrawn: s.withdrawn,
        })));
      }

      if (expensesRes.data) {
        setExpenses(expensesRes.data.map((e: any) => ({
          id: e.id,
          amount: Number(e.amount),
          category: e.category,
          description: e.description || "",
          date: e.date,
        })));
      }

      if (budgetRes.data) {
        setBudgetState(Number(budgetRes.data.amount));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const addSaving = useCallback(async (amount: number, paymentMethod: "MTN" | "Airtel", durationDays: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const lockUntil = durationDays > 0 ? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000) : now;

    const { data, error } = await supabase.from("savings").insert({
      user_id: user.id,
      amount,
      payment_method: paymentMethod,
      duration_days: durationDays,
      lock_until: lockUntil.toISOString(),
    }).select().single();

    if (data && !error) {
      const entry: SavingEntry = {
        id: data.id,
        amount: Number(data.amount),
        paymentMethod: data.payment_method as "MTN" | "Airtel",
        duration: data.duration_days,
        createdAt: data.created_at,
        unlockAt: data.lock_until || data.created_at,
        withdrawn: data.withdrawn,
      };
      setSavings((prev) => [entry, ...prev]);
    }
  }, []);

  const withdraw = useCallback(async (id: string) => {
    const { error } = await supabase.from("savings").update({ withdrawn: true }).eq("id", id);
    if (!error) {
      setSavings((prev) => prev.map((s) => s.id === id ? { ...s, withdrawn: true } : s));
    }
  }, []);

  const addExpense = useCallback(async (expense: Omit<{ id: string; amount: number; category: string; description: string; date: string }, "id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("expenses").insert({
      user_id: user.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    }).select().single();

    if (data && !error) {
      setExpenses((prev) => [{
        id: data.id,
        amount: Number(data.amount),
        category: data.category,
        description: data.description || "",
        date: data.date,
      }, ...prev]);
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  }, []);

  const setBudget = useCallback(async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("budgets").upsert({
      user_id: user.id,
      amount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (!error) {
      setBudgetState(amount);
    }
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
    loading,
  };
}
