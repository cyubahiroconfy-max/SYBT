import { motion } from "framer-motion";
import { Wallet, PiggyBank, TrendingUp, Lock } from "lucide-react";

interface Props {
  totalSaved: number;
  totalSpent: number;
  budget: number;
  lockedCount: number;
}

const cards = [
  { key: "saved", label: "Total Savings", icon: PiggyBank, gradient: "from-success/15 to-success/5", iconBg: "bg-success/20", iconColor: "text-success" },
  { key: "spent", label: "Total Spent", icon: TrendingUp, gradient: "from-accent/15 to-accent/5", iconBg: "bg-accent/20", iconColor: "text-accent" },
  { key: "budget", label: "Budget", icon: Wallet, gradient: "from-primary/15 to-primary/5", iconBg: "bg-primary/20", iconColor: "text-primary" },
  { key: "locked", label: "Locked Savings", icon: Lock, gradient: "from-warning/15 to-warning/5", iconBg: "bg-warning/20", iconColor: "text-warning" },
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
          whileHover={{ scale: 1.02, y: -2 }}
          className={`rounded-2xl bg-gradient-to-br ${card.gradient} border border-border p-4 shadow-sm hover:shadow-md transition-shadow cursor-default`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`${card.iconBg} p-2 rounded-xl`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{card.label}</p>
          <p className="text-lg font-display font-bold text-card-foreground">{values[card.key]}</p>
        </motion.div>
      ))}
    </div>
  );
}
