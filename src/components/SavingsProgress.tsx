import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  totalSaved: number;
  goal: number;
}

export function SavingsProgress({ totalSaved, goal }: Props) {
  if (goal <= 0) return null;
  const percent = Math.min((totalSaved / goal) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-primary" />
        <span className="font-display font-bold text-card-foreground text-sm">Savings Goal</span>
        <span className="ml-auto text-xs text-muted-foreground">{percent.toFixed(0)}%</span>
      </div>
      <Progress value={percent} className="h-3 mb-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{totalSaved.toLocaleString()} RWF saved</span>
        <span>Goal: {goal.toLocaleString()} RWF</span>
      </div>
    </motion.div>
  );
}
