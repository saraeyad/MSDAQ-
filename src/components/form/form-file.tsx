import { cn } from "@/lib/utils";
import { CheckCircle, Plus } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface FormFileProps {
  name: string;
  label?: string | React.ReactNode;
  placeholder?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  columnView?: boolean;
  accept?: string;
  multiple?: boolean;
  onChange?: (value: any) => void;
  hideName?: boolean;
}

export default function FormFile(props: FormFileProps) {
  const { t } = useTranslation();
  const form = useFormContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const file = form.watch(props.name);

  const fieldValueRef = useRef<File | File[] | null>(null);

  useEffect(() => {
    if (!file && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [file]);

  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field }) => {
        fieldValueRef.current = file;

        return (
          <FormItem
            className={cn(
              "col-span-1 flex flex-col gap-2 max-w-5xl",
              {
                "lg:flex-col items-start": props.columnView,
                "lg:flex-row lg:items-center": !props.columnView,
              },
              props.className
            )}
          >
            {props.label && (
              <FormLabel
                className={cn("w-full max-w-[300px]", props.labelClassName)}
                required={props.required}
              >
                {props.label}
              </FormLabel>
            )}
            <div className="flex flex-col w-full">
              <FormControl>
                <input
                  type="file"
                  ref={inputRef}
                  accept={props.accept}
                  multiple={props.multiple}
                  onChange={(e) => {
                    const files = props.multiple
                      ? Array.from(e.target.files ?? [])
                      : e.target.files?.[0] ?? null;
                    field.onChange(files);
                    props.onChange?.(files);
                  }}
                  hidden
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                {file && !props.hideName ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                <span className="text-wrap line-clamp-1">
                  {props.hideName
                    ? props.placeholder ?? t("BTN.UPLOAD_FILE")
                    : !file || (Array.isArray(file) && file.length === 0)
                    ? props.placeholder ?? t("BTN.UPLOAD_FILE")
                    : !props.multiple && file instanceof File
                    ? file.name.split(".")[0]
                    : Array.isArray(file)
                    ? `${file.length} Files`
                    : props.placeholder ?? t("BTN.UPLOAD_FILE")}
                </span>
              </Button>
              <FormMessage className="mt-2" />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
