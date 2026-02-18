export interface TuitionFee {
  id: number;
  class_category: string;
  amount: string;
  billing_cycle: string;
  created_at?: string;
  updated_at?: string;
}

export function getCardStyle(classCategory: string) {
  switch (classCategory) {
    case "Nursery":
      return {
        gradient: "from-pink-500 via-purple-500 to-pink-500",
        accent: "from-pink-500 via-purple-500 to-pink-500",
        iconBg: "from-pink-400 to-purple-500",
        iconHover: "from-pink-300 to-purple-400",
        textGradient: "from-pink-600 to-purple-600",
        checkColor: "text-pink-500",
        hoverText: "group-hover:text-pink-600",
      };
    case "Primary":
      return {
        gradient: "from-blue-500 via-cyan-500 to-blue-500",
        accent: "from-blue-500 via-cyan-500 to-blue-500",
        iconBg: "from-blue-400 to-cyan-500",
        iconHover: "from-blue-300 to-cyan-400",
        textGradient: "from-blue-600 to-cyan-600",
        checkColor: "text-blue-500",
        hoverText: "group-hover:text-blue-600",
        popular: true,
      };
    default:
      return {
        gradient: "from-orange-500 via-red-500 to-orange-500",
        accent: "from-orange-500 via-red-500 to-orange-500",
        iconBg: "from-orange-400 to-red-500",
        iconHover: "from-orange-300 to-red-400",
        textGradient: "from-orange-600 to-red-600",
        checkColor: "text-orange-500",
        hoverText: "group-hover:text-orange-600",
      };
  }
}

export function formatAmount(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "N/A";
  return "\u20A6" + num.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatBillingCycle(cycle: string) {
  if (!cycle) return "Per academic year";
  return "Per " + cycle.charAt(0).toUpperCase() + cycle.slice(1);
}
