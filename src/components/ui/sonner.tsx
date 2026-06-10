import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import "sonner/dist/styles.css";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="misdaq-toaster"
      closeButton={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "misdaq-toast",
          title: "misdaq-toast__title",
          description: "misdaq-toast__description",
          icon: "misdaq-toast__icon",
          success: "misdaq-toast--success",
          error: "misdaq-toast--error",
          info: "misdaq-toast--info",
        },
      }}
      icons={{
        success: <CircleCheck className="size-4 shrink-0" aria-hidden />,
        error: <CircleX className="size-4 shrink-0" aria-hidden />,
        info: <CircleAlert className="size-4 shrink-0" aria-hidden />,
      }}
      {...props}
    />
  );
}
