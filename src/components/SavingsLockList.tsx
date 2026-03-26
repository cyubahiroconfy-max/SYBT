import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Clock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavingEntry } from "@/types/savings";

interface Props {
  savings: SavingEntry[];
  onWithdraw: (id: string) => void;
}

function CountdownTimer({ unlockAt }: { unlockAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(unlockAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Unlocked!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${mins}m`);
      else setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [unlockAt]);

  return <span>{timeLeft}</span>;
}

export function SavingsLockList({ savings, onWithdraw }: Props) {
  const activeSavings = savings.filter((s) => !s.withdrawn);

  if (activeSavings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl bg-card p-8 shadow-lg border border-border text-center"
      >
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No active savings</p>
        <p className="text-sm text-muted-foreground">Start saving to see your locked funds here!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card shadow-lg border border-border overflow-hidden"
    >
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-display font-bold text-card-foreground flex items-center gap-2">
          <Lock className="h-5 w-5 text-warning" />
          Locked Savings
          <span className="ml-auto text-sm font-body font-normal text-muted-foreground">
            {activeSavings.length} active
          </span>
        </h2>
      </div>
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        <AnimatePresence>
          {activeSavings.map((entry) => {
            const isUnlocked = new Date(entry.unlockAt) <= new Date();
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 flex items-center gap-3"
              >
                <div className={`p-2 rounded-xl ${isUnlocked ? "bg-success/10" : "bg-warning/10"}`}>
                  {isUnlocked ? (
                    <Unlock className="h-5 w-5 text-success" />
                  ) : (
                    <Lock className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-card-foreground">
                    {entry.amount.toLocaleString()} RWF
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Smartphone className="h-3 w-3" />
                    <span>{entry.paymentMethod}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <CountdownTimer unlockAt={entry.unlockAt} />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isUnlocked ? "default" : "outline"}
                  disabled={!isUnlocked}
                  onClick={() => onWithdraw(entry.id)}
                  className="text-xs"
                >
                  {isUnlocked ? "Withdraw" : "Locked"}
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
