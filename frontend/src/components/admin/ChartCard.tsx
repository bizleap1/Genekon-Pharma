import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-[#E2EAE0] bg-white p-5 sm:p-6 shadow-2xs ${className}`}
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EDF3EC] gap-2">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#14304A]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#637766] mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div>{children}</div>
    </div>
  );
};
