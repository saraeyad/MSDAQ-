import { cn } from "@/lib/utils";
import React, { FC } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const SectionTitle: FC<Props> = ({ children, className }) => {
  return (
    <h3 className={cn("my-0 font-headline text-headline-sm text-foreground", className)}>
      {children}
    </h3>
  );
};

export default SectionTitle;
