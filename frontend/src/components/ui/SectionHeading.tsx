import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  actionText,
  actionHref,
  className,
}) => {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8", className)}>
      <div className="space-y-1 max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-wider text-[#69A82F]">
            {eyebrow}
          </p>
        )}
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-[-0.025em] text-[#14304A] leading-[1.15]">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-[#68746F]">
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center text-sm font-semibold text-[#315FAE] hover:text-[#264b8a] transition-colors group self-start md:self-end"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};
