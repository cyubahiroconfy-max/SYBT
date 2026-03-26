import { AddExpenseForm } from "@/components/AddExpenseForm";
import { useSavings } from "@/hooks/useSavings";

const SpendPage = () => {
  const { addExpense } = useSavings();

  return (
    <div className="space-y-4">
      <AddExpenseForm onAdd={addExpense} />
    </div>
  );
};

export default SpendPage;
