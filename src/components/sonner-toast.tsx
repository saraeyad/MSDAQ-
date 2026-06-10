import { toast } from "sonner";

const toastOptions = {
  duration: 4000,
};

export const successToast = (msg: string) => {
  toast.success(msg, toastOptions);
};

export const errorToast = (msg: string) => {
  toast.error(msg, toastOptions);
};

export const infoToast = (msg: string) => {
  toast.info(msg, toastOptions);
};
