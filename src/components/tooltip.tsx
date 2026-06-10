import {
    TooltipContent,
    Tooltip as TooltipPrimitive,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FC } from "react";

interface TooltipProps {
  children: React.ReactNode;
  title: string;
}

const Tooltip: FC<TooltipProps> = ({ children, title }) => {
  return (
    <TooltipProvider>
      <TooltipPrimitive delayDuration={100}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </TooltipPrimitive>
    </TooltipProvider>
  );
};

export default Tooltip;
