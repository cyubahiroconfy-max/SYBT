import { TransactionHistory } from "@/components/TransactionHistory";
import { useSavingsContext } from "@/contexts/SavingsContext";

const HistoryPage = () => {
  const { savings, expenses } = useSavingsContext();

  return (
    <div>
      <TransactionHistory savings={savings} expenses={expenses} />
    </div>
  );
};

export default HistoryPage;
