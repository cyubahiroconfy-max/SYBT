import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PiggyBank, Wallet, Receipt, Target, Sun, Moon, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavLink } from "@/components/NavLink";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { DashboardCards } from "@/components/DashboardCards";
import { SavingsProgress } from "@/components/SavingsProgress";
import { SetBudgetDialog } from "@/components/SetBudgetDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSavingsContext } from "@/contexts/SavingsContext";

const GOAL_KEY = "sybt-goal";
function loadGoal() {
  try { return Number(localStorage.getItem(GOAL_KEY)) || 0; } catch { return 0; }
}

const MainLayout = () => {
  const navigate = useNavigate();
  const {
    totalSaved, totalSpent, budget, lockedSavings, setBudget,
  } = useSavingsContext();

  const [goal, setGoal] = useState(loadGoal);
  const [goalInput, setGoalInput] = useState("");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const handleSetGoal = () => {
    const g = Number(goalInput);
    if (g > 0) {
      setGoal(g);
      localStorage.setItem(GOAL_KEY, String(g));
      setGoalInput("");
    }
  };

  const navItems = [
    { to: "/", icon: PiggyBank, label: "Save" },
    { to: "/spend", icon: Wallet, label: "Spend" },
    { to: "/history", icon: Receipt, label: "History" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <div className="flex items-center gap-2">
            <SetBudgetDialog currentBudget={budget} onSetBudget={setBudget} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground border-b-2 border-transparent"
              activeClassName="text-primary border-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5 flex-1 w-full">
        <DashboardCards
          totalSaved={totalSaved}
          totalSpent={totalSpent}
          budget={budget}
          lockedCount={lockedSavings.length}
        />

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

        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Prepared by Cyubahiro Confiance · March 2026
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="gap-1.5 text-muted-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-xs">{dark ? "Light" : "Dark"}</span>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
