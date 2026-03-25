import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types/expense";

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-card p-8 shadow-lg border border-border text-center"
      >
        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No expenses yet</p>
        <p className="text-sm text-muted-foreground">Start adding your daily expenses above!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-card shadow-lg border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-display font-bold text-card-foreground flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Expense History
          <span className="ml-auto text-sm font-body font-normal text-muted-foreground">
            {expenses.length} item{expenses.length !== 1 ? "s" : ""}
          </span>
        </h2>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        <AnimatePresence>
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="text-2xl">{expense.category.split(" ")[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-card-foreground truncate">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.category.slice(2)} · {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <p className="font-display font-bold text-accent whitespace-nowrap">
                -{expense.amount.toLocaleString()} RWF
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(expense.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
