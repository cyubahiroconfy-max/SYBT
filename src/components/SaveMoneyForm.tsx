import { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Props {
  onSave: (amount: number, method: "MTN" | "Airtel", durationDays: number) => void;
}

const DURATIONS = [
  { label: "1 Day", days: 1 },
  { label: "3 Days", days: 3 },
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
  { label: "6 Months", days: 180 },
];

export function SaveMoneyForm({ onSave }: Props) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"MTN" | "Airtel" | "">("");
  const [duration, setDuration] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  const handleSubmit = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (!duration) {
      toast({ title: "Select a saving duration", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handlePayment = (selectedMethod: "MTN" | "Airtel") => {
    const amt = Number(amount);
    const days = Number(duration);
    onSave(amt, selectedMethod, days);
    toast({
      title: "💰 Saving Successful!",
      description: `${amt.toLocaleString()} RWF saved via ${selectedMethod} for ${DURATIONS.find(d => d.days === days)?.label}`,
    });
    setAmount("");
    setMethod("");
    setDuration("");
    setStep(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border shadow-lg overflow-hidden"
    >
      <div className="p-4 border-b border-border bg-primary/5">
        <h2 className="text-lg font-display font-bold text-card-foreground flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          Save Money
        </h2>
      </div>

      {step === 1 ? (
        <div className="p-4 space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Amount (RWF)</label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Lock Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.days} value={String(d.days)}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full font-semibold">
            <PiggyBank className="h-4 w-4 mr-1" /> Save Money
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 space-y-3"
        >
          <p className="text-sm text-muted-foreground text-center mb-2">
            Choose your payment method for <span className="font-bold text-card-foreground">{Number(amount).toLocaleString()} RWF</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handlePayment("MTN")}
              className="h-20 flex-col gap-1 bg-[hsl(48,100%,50%)] hover:bg-[hsl(48,100%,45%)] text-[hsl(220,25%,15%)] font-bold rounded-xl"
            >
              <Smartphone className="h-6 w-6" />
              MTN MoMo
            </Button>
            <Button
              onClick={() => handlePayment("Airtel")}
              className="h-20 flex-col gap-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-xl"
            >
              <Smartphone className="h-6 w-6" />
              Airtel Money
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-muted-foreground">
            ← Go Back
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
