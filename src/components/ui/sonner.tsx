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
      className="sabbara-toaster"
      closeButton
      offset={16}
      gap={10}
      duration={3500}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "sabbara-toast",
          title: "sabbara-toast__title",
          description: "sabbara-toast__description",
          icon: "sabbara-toast__icon",
          success: "sabbara-toast--success",
          error: "sabbara-toast--error",
          warning: "sabbara-toast--warning",
          info: "sabbara-toast--info",
          closeButton: "sabbara-toast__close",
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
