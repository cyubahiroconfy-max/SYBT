import { TransactionHistory } from "@/components/TransactionHistory";
import { useSavings } from "@/hooks/useSavings";

const HistoryPage = () => {
  const { savings, expenses } = useSavings();

  return (
    <div>
      <TransactionHistory savings={savings} expenses={expenses} />
    </div>
  );
};

export default HistoryPage;
