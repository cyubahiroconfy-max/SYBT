export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const CATEGORIES = [
  "🍔 Food & Snacks",
  "🚌 Transport",
  "📚 School Supplies",
  "🎮 Entertainment",
  "👕 Clothing",
  "📱 Phone & Data",
  "🎁 Gifts",
  "💡 Other",
] as const;
