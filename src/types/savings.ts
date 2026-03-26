export interface SavingEntry {
  id: string;
  amount: number;
  paymentMethod: "MTN" | "Airtel";
  duration: number; // in days
  createdAt: string; // ISO date
  unlockAt: string; // ISO date
  withdrawn: boolean;
}

export interface SavingGoal {
  targetAmount: number;
  description: string;
}
