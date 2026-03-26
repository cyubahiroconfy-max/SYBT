import { motion } from "framer-motion";
import { History, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { SavingEntry } from "@/types/savings";

interface Props {
  savings: SavingEntry[];
  expenses: { id: string; amount: number; category: string; description: string; date: string }[];
}

export function TransactionHistory({ savings, expenses }: Props) {
  const transactions = [
    ...savings.map((s) => ({
      id: s.id,
      type: s.withdrawn ? "withdrawal" as const : "saving" as const,
      amount: s.amount,
      label: s.withdrawn ? "Withdrawal" : `Saved via ${s.paymentMethod}`,
      date: s.createdAt,
      detail: `${s.duration} day lock`,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      amount: e.amount,
      label: e.description,
      date: e.date,
      detail: e.category,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (transactions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-card p-8 shadow-lg border border-border text-center">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No transactions yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card shadow-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-display font-bold text-card-foreground flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Transaction History
          <span className="ml-auto text-sm font-body font-normal text-muted-foreground">{transactions.length} records</span>
        </h2>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {transactions.slice(0, 50).map((tx) => (
          <div key={tx.id + tx.type} className="flex items-center gap-3 p-4">
            {tx.type === "expense" ? (
              <ArrowUpCircle className="h-5 w-5 text-accent shrink-0" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 text-success shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-card-foreground truncate">{tx.label}</p>
              <p className="text-xs text-muted-foreground">{tx.detail} · {new Date(tx.date).toLocaleDateString()}</p>
            </div>
            <p className={`font-display font-bold text-sm whitespace-nowrap ${tx.type === "expense" ? "text-accent" : "text-success"}`}>
              {tx.type === "expense" ? "-" : "+"}{tx.amount.toLocaleString()} RWF
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
