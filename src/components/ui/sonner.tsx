import {
  CircleAlert,
  CircleCheck,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import "sonner/dist/styles.css";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      dir="rtl"
      className="misdaq-toaster"
      closeButton
      offset={16}
      gap={10}
      duration={3500}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "misdaq-toast",
          title: "misdaq-toast__title",
          description: "misdaq-toast__description",
          icon: "misdaq-toast__icon",
          success: "misdaq-toast--success",
          error: "misdaq-toast--error",
          warning: "misdaq-toast--warning",
          info: "misdaq-toast--info",
          closeButton: "misdaq-toast__close",
        },
      }}
      icons={{
        success: <CircleCheck className="size-5 shrink-0" aria-hidden />,
        error: <CircleAlert className="size-5 shrink-0" aria-hidden />,
        warning: <TriangleAlert className="size-5 shrink-0" aria-hidden />,
        info: <CircleAlert className="size-5 shrink-0" aria-hidden />,
      }}
      {...props}
    />
  );
}
