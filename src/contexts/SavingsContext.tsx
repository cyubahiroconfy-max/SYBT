import { createContext, useContext, type ReactNode } from "react";
import { useSavings } from "@/hooks/useSavings";

type SavingsContextType = ReturnType<typeof useSavings>;

const SavingsContext = createContext<SavingsContextType | null>(null);

export function SavingsProvider({ children }: { children: ReactNode }) {
  const value = useSavings();
  return <SavingsContext.Provider value={value}>{children}</SavingsContext.Provider>;
}

export function useSavingsContext() {
  const ctx = useContext(SavingsContext);
  if (!ctx) throw new Error("useSavingsContext must be used within SavingsProvider");
  return ctx;
}
