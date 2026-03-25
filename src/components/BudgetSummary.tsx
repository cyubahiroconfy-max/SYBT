import { motion } from "framer-motion";
import { Wallet, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  budget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  isNearBudget: boolean;
}

export function BudgetSummary({ budget, totalSpent, remaining, percentUsed, isOverBudget, isNearBudget }: Props) {
  const getStatusColor = () => {
    if (isOverBudget) return "text-destructive";
    if (isNearBudget) return "text-warning";
    return "text-success";
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="h-5 w-5" />;
    if (isNearBudget) return <AlertTriangle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const getStatusMessage = () => {
    if (budget === 0) return "Set a budget to start tracking!";
    if (isOverBudget) return `You're ${Math.abs(remaining).toLocaleString()} RWF over budget! 😱`;
    if (isNearBudget) return "Careful! You're running low! ⚠️";
    return "You're doing great! Keep it up! 🎉";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card p-6 shadow-lg border border-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-bold text-card-foreground">Budget Overview</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Budget</p>
          <p className="text-xl font-bold font-display text-card-foreground">{budget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">RWF</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Spent</p>
          <p className="text-xl font-bold font-display text-accent">{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">RWF</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Left</p>
          <p className={`text-xl font-bold font-display ${remaining < 0 ? 'text-destructive' : 'text-success'}`}>
            {remaining.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">RWF</p>
        </div>
      </div>

      {budget > 0 && (
        <div className="space-y-2">
          <Progress value={percentUsed} className="h-3" />
          <div className={`flex items-center gap-2 text-sm font-medium ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{getStatusMessage()}</span>
          </div>
        </div>
      )}

      {budget === 0 && (
        <p className="text-sm text-muted-foreground text-center italic">{getStatusMessage()}</p>
      )}
    </motion.div>
  );
}
