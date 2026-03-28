import { motion } from "framer-motion";
import { Target, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  totalSaved: number;
  goal: number;
}

export function SavingsProgress({ totalSaved, goal }: Props) {
  if (goal <= 0) return null;
  const percent = Math.min((totalSaved / goal) * 100, 100);
  const isComplete = percent >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-4 shadow-sm ${
        isComplete
          ? "bg-gradient-to-br from-success/10 to-success/5 border-success/30"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {isComplete ? (
          <div className="bg-success/20 p-2 rounded-xl">
            <Trophy className="h-5 w-5 text-success" />
          </div>
        ) : (
          <div className="bg-primary/10 p-2 rounded-xl">
            <Target className="h-5 w-5 text-primary" />
          </div>
        )}
        <span className="font-display font-bold text-card-foreground text-sm">
          {isComplete ? "🎉 Goal Reached!" : "Savings Goal"}
        </span>
        <span className="ml-auto text-sm font-bold text-primary">{percent.toFixed(0)}%</span>
      </div>
      <Progress value={percent} className="h-3 mb-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{totalSaved.toLocaleString()} RWF saved</span>
        <span>Goal: {goal.toLocaleString()} RWF</span>
      </div>
    </motion.div>
  );
}
