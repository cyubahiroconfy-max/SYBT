import { AddExpenseForm } from "@/components/AddExpenseForm";
import { useSavingsContext } from "@/contexts/SavingsContext";

const SpendPage = () => {
  const { addExpense } = useSavingsContext();

  return (
    <div className="space-y-4">
      <AddExpenseForm onAdd={addExpense} />
    </div>
  );
};

export default SpendPage;
