import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case "active":
      case "delivered":
      case "approved":
      case "paid":
        return "bg-[#EDF7E9] text-[#447719] border-[#CDE5C8]";
      case "shipped":
      case "processing":
      case "confirmed":
      case "retail":
        return "bg-[#EBF3FC] text-[#1853A8] border-[#CFE2F9]";
      case "pending":
      case "pending review":
      case "pending verification":
      case "low stock":
      case "wholesale":
        return "bg-[#FFF6E5] text-[#D97706] border-[#FDE6B8]";
      case "cancelled":
      case "rejected":
      case "out of stock":
      case "blocked":
      case "refunded":
        return "bg-[#FEECEB] text-[#D32F2F] border-[#F8C8C6]";
      default:
        return "bg-[#F2F5F3] text-[#556957] border-[#D5E0D7]";
    }
  };

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border ${sizeClass} ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      <span>{status}</span>
    </span>
  );
};
