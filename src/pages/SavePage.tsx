import { SaveMoneyForm } from "@/components/SaveMoneyForm";
import { SavingsLockList } from "@/components/SavingsLockList";
import { useSavingsContext } from "@/contexts/SavingsContext";

const SavePage = () => {
  const { savings, addSaving, withdraw } = useSavingsContext();

  return (
    <div className="space-y-4">
      <SaveMoneyForm onSave={addSaving} />
      <SavingsLockList savings={savings} onWithdraw={withdraw} />
    </div>
  );
};

export default SavePage;
