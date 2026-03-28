import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, PiggyBank, CreditCard, TrendingUp, Shield,
  ArrowUpRight, ArrowDownRight, Wallet, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface Stats {
  totalUsers: number;
  totalSavings: number;
  totalExpenses: number;
  totalBudgets: number;
  recentUsers: { id: string; username: string | null; created_at: string }[];
  recentSavings: { id: string; amount: number; payment_method: string; created_at: string }[];
  recentExpenses: { id: string; amount: number; category: string; date: string }[];
  savingsByMethod: { name: string; value: number }[];
  expensesByCategory: { name: string; amount: number }[];
  dailySavings: { day: string; amount: number }[];
  dailyExpenses: { day: string; amount: number }[];
}

const COLORS = ["hsl(172,66%,40%)", "hsl(12,85%,62%)", "hsl(220,66%,55%)", "hsl(38,92%,55%)", "hsl(145,60%,42%)"];

const StatCard = ({
  title, value, sub, icon: Icon, colorClass, delay,
}: {
  title: string; value: string; sub?: string; icon: any; colorClass: string; delay: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Card className="overflow-hidden border-border">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-5">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-foreground font-display mt-0.5">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs mt-0.5">
            {p.name}: {Number(p.value).toLocaleString()} RWF
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSavings: 0,
    totalExpenses: 0,
    totalBudgets: 0,
    recentUsers: [],
    recentSavings: [],
    recentExpenses: [],
    savingsByMethod: [],
    expensesByCategory: [],
    dailySavings: [],
    dailyExpenses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        profilesRes, savingsRes, expensesRes, budgetsRes,
        recentUsersRes, recentSavingsRes, recentExpensesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("savings").select("amount, payment_method, created_at"),
        supabase.from("expenses").select("amount, category, date, created_at"),
        supabase.from("budgets").select("amount"),
        supabase.from("profiles").select("id, username, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("savings").select("id, amount, payment_method, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("expenses").select("id, amount, category, date").order("created_at", { ascending: false }).limit(5),
      ]);

      const savings = savingsRes.data || [];
      const expenses = expensesRes.data || [];

      const totalSavingsAmount = savings.reduce((s, r) => s + Number(r.amount), 0);
      const totalExpensesAmount = expenses.reduce((s, r) => s + Number(r.amount), 0);
      const totalBudgetsAmount = (budgetsRes.data || []).reduce((s, r) => s + Number(r.amount), 0);

      const savingsByMethodMap: Record<string, number> = {};
      savings.forEach((s) => {
        savingsByMethodMap[s.payment_method] = (savingsByMethodMap[s.payment_method] || 0) + Number(s.amount);
      });

      const expensesByCategoryMap: Record<string, number> = {};
      expenses.forEach((e) => {
        expensesByCategoryMap[e.category] = (expensesByCategoryMap[e.category] || 0) + Number(e.amount);
      });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i);
        const dayStr = format(d, "MMM d");
        const dayStart = startOfDay(d).toISOString();
        const dayEnd = startOfDay(subDays(d, -1)).toISOString();
        const savAmt = savings
          .filter((s) => s.created_at >= dayStart && s.created_at < dayEnd)
          .reduce((sum, s) => sum + Number(s.amount), 0);
        const expAmt = expenses
          .filter((e) => e.created_at && e.created_at >= dayStart && e.created_at < dayEnd)
          .reduce((sum, e) => sum + Number(e.amount), 0);
        return { day: dayStr, savAmt, expAmt };
      });

      setStats({
        totalUsers: profilesRes.count || 0,
        totalSavings: totalSavingsAmount,
        totalExpenses: totalExpensesAmount,
        totalBudgets: totalBudgetsAmount,
        recentUsers: recentUsersRes.data || [],
        recentSavings: (recentSavingsRes.data || []).map((s: any) => ({ ...s, amount: Number(s.amount) })),
        recentExpenses: (recentExpensesRes.data || []).map((e: any) => ({ ...e, amount: Number(e.amount) })),
        savingsByMethod: Object.entries(savingsByMethodMap).map(([name, value]) => ({ name, value })),
        expensesByCategory: Object.entries(expensesByCategoryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, amount]) => ({ name, amount })),
        dailySavings: last7Days.map((d) => ({ day: d.day, amount: d.savAmt })),
        dailyExpenses: last7Days.map((d) => ({ day: d.day, amount: d.expAmt })),
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers.toString(), icon: Users, colorClass: "bg-blue-500", sub: "Registered accounts", delay: 0 },
    { title: "Total Savings", value: `${stats.totalSavings.toLocaleString()} RWF`, icon: PiggyBank, colorClass: "bg-emerald-500", sub: "All time", delay: 0.05 },
    { title: "Total Expenses", value: `${stats.totalExpenses.toLocaleString()} RWF`, icon: CreditCard, colorClass: "bg-rose-500", sub: "All time", delay: 0.1 },
    { title: "Total Budgets", value: `${stats.totalBudgets.toLocaleString()} RWF`, icon: TrendingUp, colorClass: "bg-amber-500", sub: "Set by users", delay: 0.15 },
  ];

  return (
    <div className="space-y-6 pb-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of all platform activity</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                Daily Savings — Last 7 Days
              </CardTitle>
              <CardDescription>Amount saved per day (RWF)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.dailySavings}>
                  <defs>
                    <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(172,66%,40%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(172,66%,40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" name="Savings" stroke="hsl(172,66%,40%)" fill="url(#savGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
                Daily Expenses — Last 7 Days
              </CardTitle>
              <CardDescription>Amount spent per day (RWF)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.dailyExpenses}>
                  <defs>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(12,85%,62%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(12,85%,62%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" name="Expenses" stroke="hsl(12,85%,62%)" fill="url(#expGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Expenses by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.expensesByCategory.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No expense data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.expensesByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
                      {stats.expensesByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-emerald-500" />
                Savings by Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.savingsByMethod.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">No savings data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={stats.savingsByMethod} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {stats.savingsByMethod.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} RWF`, "Amount"]} />
                    <Legend formatter={(v) => <span className="text-xs text-foreground">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">New Users</p>
                <div className="space-y-2.5">
                  {stats.recentUsers.length === 0 && <p className="text-xs text-muted-foreground">None yet</p>}
                  {stats.recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-2.5 text-sm">
                      <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{u.username || "—"}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(u.created_at), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Savings</p>
                <div className="space-y-2.5">
                  {stats.recentSavings.length === 0 && <p className="text-xs text-muted-foreground">None yet</p>}
                  {stats.recentSavings.map((s) => (
                    <div key={s.id} className="flex items-center gap-2.5 text-sm">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <PiggyBank className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{s.amount.toLocaleString()} RWF</p>
                        <p className="text-xs text-muted-foreground">{s.payment_method} · {format(new Date(s.created_at), "MMM d")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Expenses</p>
                <div className="space-y-2.5">
                  {stats.recentExpenses.length === 0 && <p className="text-xs text-muted-foreground">None yet</p>}
                  {stats.recentExpenses.map((e) => (
                    <div key={e.id} className="flex items-center gap-2.5 text-sm">
                      <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-3.5 w-3.5 text-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{e.amount.toLocaleString()} RWF</p>
                        <p className="text-xs text-muted-foreground">{e.category} · {e.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
