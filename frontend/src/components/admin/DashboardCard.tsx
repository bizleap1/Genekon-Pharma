import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  period?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  period,
  icon: Icon,
  iconBg = "bg-[#EDF7E9]",
  iconColor = "text-[#559620]",
}) => {
  return (
    <div className="rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#657968] tracking-wide">
            {title}
          </p>
          <h3 className="font-serif text-2xl font-bold text-[#14304A] mt-1 tracking-tight">
            {value}
          </h3>
        </div>

        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 border border-black/5`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {change && (
        <div className="mt-4 pt-3 border-t border-[#EDF3EC] flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 font-bold ${
              isPositive ? "text-[#447719]" : "text-[#D97706]"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {change}
          </span>
          {period && <span className="text-[#7A8E7D] text-[11px]">{period}</span>}
        </div>
      )}
    </div>
  );
};
