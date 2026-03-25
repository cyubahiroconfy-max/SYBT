import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { BudgetSummary } from "@/components/BudgetSummary";
import { SetBudgetDialog } from "@/components/SetBudgetDialog";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";

const Index = () => {
  const {
    expenses,
    budget,
    totalSpent,
    remaining,
    percentUsed,
    isOverBudget,
    isNearBudget,
    addExpense,
    deleteExpense,
    setBudget,
  } = useExpenses();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary px-4 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-primary-foreground/20 p-2 rounded-xl">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-primary-foreground leading-tight">
                Student Budget Tracker
              </h1>
              <p className="text-xs text-primary-foreground/70">
                Track your spending, save smarter 💰
              </p>
            </div>
          </motion.div>
          <SetBudgetDialog currentBudget={budget} onSetBudget={setBudget} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <BudgetSummary
          budget={budget}
          totalSpent={totalSpent}
          remaining={remaining}
          percentUsed={percentUsed}
          isOverBudget={isOverBudget}
          isNearBudget={isNearBudget}
        />
        <AddExpenseForm onAdd={addExpense} />
        <ExpenseList expenses={expenses} onDelete={deleteExpense} />
      </main>
    </div>
  );
};

export default Index;
