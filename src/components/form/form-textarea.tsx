import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Textarea } from "../ui/textarea";

interface FormTextAreaProps {
  name: string;
  placeholder?: string;
  label?: string;
  rows?: number;
  required?: boolean;
  wrapperClassName?: string;
  textareaClassName?: string;
  columnView?: boolean;
  toolbar?: ReactNode;
}

export default function FormTextArea({
  rows = 5,
  ...props
}: FormTextAreaProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "col-span-1 flex flex-col gap-2 max-w-5xl",
            {
              "lg:flex-col items-start": props.columnView,
              "lg:flex-row lg:items-center": !props.columnView,
            },
            props.wrapperClassName
          )}
        >
          {props.label && (
            <FormLabel
              className="w-full max-w-[300px]"
              required={props.required}
            >
              {props.label}
            </FormLabel>
          )}
          <div
            className={cn(
              "flex w-full flex-col",
              props.toolbar ? "gap-1" : "gap-2",
            )}
          >
            {props.toolbar}
            <FormControl>
              <Textarea
                {...field}
                rows={rows}
                placeholder={props.placeholder}
                className={cn("min-h-20", props.textareaClassName)}
              />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
