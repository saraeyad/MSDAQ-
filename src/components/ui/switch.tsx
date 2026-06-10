import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "@/lib/utils";

function Switch({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const baseClasses =
    "peer transition-all inline-flex items-center shrink-0 rounded-full border border-transparent shadow-xs outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

  const sizeClasses = "h-[1.5rem] w-10";

  const stateClasses = checked ? "bg-primary" : "bg-gray-400";

  return (
    <SwitchPrimitive.Root
      checked={checked}
      data-slot="switch"
      className={cn(baseClasses, sizeClasses, stateClasses, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block h-5 w-5 rounded-full ring-0 transition-transform",
          checked ? "translate-x-[calc(100%-3px)]" : "translate-x-[1px]"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

