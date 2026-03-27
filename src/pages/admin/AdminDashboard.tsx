import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, PiggyBank, CreditCard, TrendingUp, Shield, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalUsers: number;
  totalSavings: number;
  totalExpenses: number;
  totalBudgets: number;
  recentUsers: { id: string; username: string | null; created_at: string }[];
  recentSavings: { id: string; amount: number; payment_method: string; created_at: string }[];
  recentExpenses: { id: string; amount: number; category: string; date: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSavings: 0,
    totalExpenses: 0,
    totalBudgets: 0,
    recentUsers: [],
    recentSavings: [],
    recentExpenses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, savingsRes, expensesRes, budgetsRes, recentUsersRes, recentSavingsRes, recentExpensesRes] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("savings").select("amount"),
          supabase.from("expenses").select("amount"),
          supabase.from("budgets").select("amount"),
          supabase.from("profiles").select("id, username, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("savings").select("id, amount, payment_method, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("expenses").select("id, amount, category, date").order("created_at", { ascending: false }).limit(5),
        ]);

      const totalSavingsAmount = savingsRes.data?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      const totalExpensesAmount = expensesRes.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const totalBudgetsAmount = budgetsRes.data?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

      setStats({
        totalUsers: profilesRes.count || 0,
        totalSavings: totalSavingsAmount,
        totalExpenses: totalExpensesAmount,
        totalBudgets: totalBudgetsAmount,
        recentUsers: recentUsersRes.data || [],
        recentSavings: (recentSavingsRes.data || []).map((s: any) => ({ ...s, amount: Number(s.amount) })),
        recentExpenses: (recentExpensesRes.data || []).map((e: any) => ({ ...e, amount: Number(e.amount) })),
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Total Savings", value: `${stats.totalSavings.toLocaleString()} RWF`, icon: PiggyBank, color: "text-green-500" },
    { title: "Total Expenses", value: `${stats.totalExpenses.toLocaleString()} RWF`, icon: CreditCard, color: "text-red-500" },
    { title: "Total Budgets", value: `${stats.totalBudgets.toLocaleString()} RWF`, icon: TrendingUp, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet</p>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u.id} className="flex justify-between text-sm">
                  <span className="text-card-foreground">{u.username || "No username"}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Savings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4" /> Recent Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentSavings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No savings yet</p>
            ) : (
              stats.recentSavings.map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">+{s.amount.toLocaleString()} RWF</span>
                  <span className="text-muted-foreground text-xs">{s.payment_method}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" /> Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses yet</p>
            ) : (
              stats.recentExpenses.map((e) => (
                <div key={e.id} className="flex justify-between text-sm">
                  <span className="text-red-500 font-medium">-{e.amount.toLocaleString()} RWF</span>
                  <span className="text-muted-foreground text-xs">{e.category}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
