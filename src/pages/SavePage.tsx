import { SaveMoneyForm } from "@/components/SaveMoneyForm";
import { SavingsLockList } from "@/components/SavingsLockList";
import { useSavings } from "@/hooks/useSavings";

const SavePage = () => {
  const { savings, addSaving, withdraw } = useSavings();

  return (
    <div className="space-y-4">
      <SaveMoneyForm onSave={addSaving} />
      <SavingsLockList savings={savings} onWithdraw={withdraw} />
    </div>
  );
};

export default SavePage;
