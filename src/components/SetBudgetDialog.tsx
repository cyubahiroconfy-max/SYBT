import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface Props {
  currentBudget: number;
  onSetBudget: (amount: number) => void;
}

export function SetBudgetDialog({ currentBudget, onSetBudget }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(currentBudget || ""));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (num > 0) {
      onSetBudget(num);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          {currentBudget > 0 ? "Edit Budget" : "Set Budget"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Set Your Monthly Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="budget-amount">Budget Amount (RWF)</Label>
            <Input
              id="budget-amount"
              type="number"
              min="1"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">Save Budget</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
