import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { toast } from "sonner";

const baseStyle = {
  borderRadius: "8px",
  padding: "10px 15px",
  fontWeight: "400",
  fontSize: "0.875rem",
};

export const successToast = (msg: string) => {
  toast.success(msg, {
    style: { ...baseStyle, color: "green" },
    icon: <CircleCheck className="size-4" />,
  });
};

export const errorToast = (msg: string) => {
  toast.error(msg, {
    style: { ...baseStyle, color: "red" },
    icon: <CircleX className="size-4" />,
  });
};

export const infoToast = (msg: string) => {
  toast.info(msg, {
    style: { ...baseStyle, color: "var(--secondary)" },
    icon: <CircleAlert className="size-4" />,
  });
};
