import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  iconLeft,
  iconRight,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer";

  const sizeStyles = {
    sm: "text-xs font-semibold px-3 py-1.5 gap-1.5 h-8",
    md: "text-sm font-medium px-4 py-2.5 gap-2 h-10",
    lg: "text-base font-semibold px-6 py-3.5 gap-2.5 h-12",
  };

  const variantStyles = {
    primary:
      "bg-[#69A82F] hover:bg-[#588f27] text-white shadow-sm hover:shadow focus-visible:ring-[#69A82F]",
    secondary:
      "bg-[#315FAE] hover:bg-[#264b8a] text-white shadow-sm hover:shadow focus-visible:ring-[#315FAE]",
    outline:
      "border border-[#E7ECEF] hover:border-[#315FAE] text-[#14304A] hover:text-[#315FAE] bg-white hover:bg-[#F2F6FC]/50 focus-visible:ring-[#315FAE]",
    ghost:
      "text-[#14304A] hover:text-[#315FAE] hover:bg-[#F2F6FC] focus-visible:ring-[#315FAE]",
    soft:
      "bg-[#F3F8EE] hover:bg-[#e6f1dc] text-[#588f27] font-semibold focus-visible:ring-[#69A82F]",
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled}
      {...props}
    >
      {iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
};
