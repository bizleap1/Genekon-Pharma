import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  as: Component = "div",
  ...props
}) => {
  return (
    <Component
      className={cn(
        "w-full px-3 sm:px-5 lg:px-6",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
