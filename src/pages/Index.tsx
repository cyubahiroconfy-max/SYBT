import { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Wallet, Receipt, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSavings } from "@/hooks/useSavings";
import { DashboardCards } from "@/components/DashboardCards";
import { SavingsProgress } from "@/components/SavingsProgress";
import { SaveMoneyForm } from "@/components/SaveMoneyForm";
import { SavingsLockList } from "@/components/SavingsLockList";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { SetBudgetDialog } from "@/components/SetBudgetDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GOAL_KEY = "sybt-goal";
function loadGoal() {
  try { return Number(localStorage.getItem(GOAL_KEY)) || 0; } catch { return 0; }
}

const Index = () => {
  const {
    savings, expenses, budget, totalSaved, totalSpent,
    lockedSavings, addSaving, withdraw, addExpense, deleteExpense, setBudget,
  } = useSavings();

  const [goal, setGoal] = useState(loadGoal);
  const [goalInput, setGoalInput] = useState("");

  const handleSetGoal = () => {
    const g = Number(goalInput);
    if (g > 0) {
      setGoal(g);
      localStorage.setItem(GOAL_KEY, String(g));
      setGoalInput("");
    }
  };

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
              <PiggyBank className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-primary-foreground leading-tight">
                Smart Youth Budget Tracker
              </h1>
              <p className="text-xs text-primary-foreground/70">
                Save smart, spend wise 💰
              </p>
            </div>
          </motion.div>
          <SetBudgetDialog currentBudget={budget} onSetBudget={setBudget} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <DashboardCards
          totalSaved={totalSaved}
          totalSpent={totalSpent}
          budget={budget}
          lockedCount={lockedSavings.length}
        />

        {/* Goal section */}
        <SavingsProgress totalSaved={totalSaved} goal={goal} />
        {goal <= 0 && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Set saving goal (RWF)"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
            />
            <Button onClick={handleSetGoal} size="sm">
              <Target className="h-4 w-4 mr-1" /> Set Goal
            </Button>
          </div>
        )}

        <Tabs defaultValue="save" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="save" className="text-xs sm:text-sm">
              <PiggyBank className="h-4 w-4 mr-1" /> Save
            </TabsTrigger>
            <TabsTrigger value="spend" className="text-xs sm:text-sm">
              <Wallet className="h-4 w-4 mr-1" /> Spend
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              <Receipt className="h-4 w-4 mr-1" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="save" className="space-y-4 mt-4">
            <SaveMoneyForm onSave={addSaving} />
            <SavingsLockList savings={savings} onWithdraw={withdraw} />
          </TabsContent>

          <TabsContent value="spend" className="space-y-4 mt-4">
            <AddExpenseForm onAdd={addExpense} />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <TransactionHistory savings={savings} expenses={expenses} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-4">
          Prepared by Cyubahiro Confiance · March 2026
        </p>
      </main>
    </div>
  );
};

export default Index;
