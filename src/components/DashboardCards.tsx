import { motion } from "framer-motion";
import { Wallet, PiggyBank, TrendingUp, Lock } from "lucide-react";

interface Props {
  totalSaved: number;
  totalSpent: number;
  budget: number;
  lockedCount: number;
}

const cards = [
  { key: "saved", label: "Total Savings", icon: PiggyBank, color: "text-success" },
  { key: "spent", label: "Total Spent", icon: TrendingUp, color: "text-accent" },
  { key: "budget", label: "Budget", icon: Wallet, color: "text-primary" },
  { key: "locked", label: "Locked Savings", icon: Lock, color: "text-warning" },
] as const;

export function DashboardCards({ totalSaved, totalSpent, budget, lockedCount }: Props) {
  const values: Record<string, string> = {
    saved: `${totalSaved.toLocaleString()} RWF`,
    spent: `${totalSpent.toLocaleString()} RWF`,
    budget: `${budget.toLocaleString()} RWF`,
    locked: `${lockedCount} active`,
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-2xl bg-card border border-border p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`h-5 w-5 ${card.color}`} />
            <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
          </div>
          <p className="text-lg font-display font-bold text-card-foreground">{values[card.key]}</p>
        </motion.div>
      ))}
    </div>
  );
}
