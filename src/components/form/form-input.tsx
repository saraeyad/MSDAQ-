import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface FormInputProps {
  name: string;
  placeholder?: string;
  label?: string | React.ReactNode;
  required?: boolean;
  type?: string;
  className?: string;
  labelClassName?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  disabled?: boolean;
  readOnly?: boolean;
  columnView?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: (value: any) => void;
  hidden?: boolean;
  inputLoading?: boolean;
  isFormatted?: boolean;
}

export default function FormInput({ name, ...props }: FormInputProps) {
  const { t } = useTranslation();
  const form = useFormContext();

  const isNumeric =
    props.type === "number" ||
    props.inputMode === "numeric" ||
    props.pattern === "[0-9]*";

  const shouldFormat = !!props.isFormatted && isNumeric;

  const [showPassword, setShowPassword] = useState(false);
  const [displayValue, setDisplayValue] = useState("");

  const watched = form.watch(name);

  useEffect(() => {
    if (!shouldFormat) {
      setDisplayValue((watched ?? "") as string);
      return;
    }
    const plain = String(watched ?? "").replace(/,/g, "");
    if (plain === "") {
      setDisplayValue("");
      return;
    }
    const n = Number(plain);
    setDisplayValue(isNaN(n) ? "" : n.toLocaleString("en-US"));
  }, [watched, shouldFormat, name]);

  const inputType =
    props.type === "password"
      ? showPassword
        ? "text"
        : "password"
      : props.type;

  const effectiveType = shouldFormat ? "text" : inputType;

  // helpers
  const countDigits = (s: string) => (s.match(/\d/g) || []).length;
  const caretFromDigits = (formatted: string, digitsLeft: number) => {
    let c = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) c++;
      if (c === digitsLeft) return i + 1;
    }
    return formatted.length;
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "col-span-1 flex flex-col gap-2 max-w-5xl",
            {
              "lg:flex-col items-start": props.columnView,
              "lg:flex-row lg:items-center": !props.columnView,
              hidden: props.hidden,
            },
            props.className
          )}
        >
          {props.label && (
            <FormLabel
              className={cn("w-full max-w-[300px]", props.labelClassName)}
              required={props.required}
              htmlFor={name}
            >
              {props.label}
            </FormLabel>
          )}

          <div className="flex flex-col w-full">
            <FormControl>
              <div className="relative">
                {props.inputLoading ? (
                  <div className="h-10 rounded-md bg-muted animate-pulse w-full" />
                ) : (
                  <>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      placeholder={
                        props.placeholder ||
                        t("GENERAL.ENTER", { field: props.label })
                      }
                      type={effectiveType}
                      inputMode={props.inputMode}
                      pattern={props.pattern}
                      disabled={props.disabled}
                      readOnly={props.readOnly}
                      aria-invalid={!!form.formState.errors[name]}
                      aria-describedby={
                        form.formState.errors[name]
                          ? `${name}-error`
                          : undefined
                      }
                      value={shouldFormat ? displayValue : field.value ?? ""}
                      onChange={(e) => {
                        // Non-numeric or not formatted => normal behavior
                        if (!shouldFormat) {
                          if (isNumeric) {
                            const val = e.target.value;
                            const raw = val.replace(/,/g, "");
                            if (raw === "") {
                              field.onChange("");
                              props.onChange?.("");
                              return;
                            }
                            let numVal: number | string = Number(raw);
                            if (isNaN(numVal)) numVal = "";
                            if (typeof numVal === "number" && numVal < 0)
                              numVal = 0;
                            field.onChange(
                              numVal === "" ? "" : numVal.toString()
                            );
                            props.onChange?.(
                              numVal === "" ? "" : numVal.toString()
                            );
                          } else {
                            field.onChange(e);
                            props.onChange?.(e);
                          }
                          return;
                        }

                        // --- Live formatted numeric ---
                        const input = e.target as HTMLInputElement;
                        const caret = input.selectionStart ?? 0;
                        const current = input.value;

                        // digits to the left of caret BEFORE formatting
                        const digitsLeft = countDigits(current.slice(0, caret));

                        // strip all commas/non-digits
                        const rawDigits = current.replace(/[^\d]/g, "");

                        if (rawDigits === "") {
                          setDisplayValue("");
                          field.onChange("");
                          props.onChange?.("");
                          return;
                        }

                        let numVal = Number(rawDigits);
                        if (isNaN(numVal) || numVal < 0) numVal = 0;

                        // update form (store raw numeric string)
                        const rawStr = numVal.toString();
                        field.onChange(rawStr);
                        props.onChange?.(rawStr);

                        // format for display
                        const formatted = numVal.toLocaleString("en-US");
                        setDisplayValue(formatted);

                        // restore caret based on digits count
                        requestAnimationFrame(() => {
                          const newCaret = caretFromDigits(
                            formatted,
                            digitsLeft
                          );
                          input.setSelectionRange(newCaret, newCaret);
                        });
                      }}
                      onBlur={(e) => {
                        // call RHF onBlur + custom
                        field.onBlur();
                        props.onBlur?.(e);
                      }}
                      {...props.inputProps}
                    />

                    {props.type === "password" && (
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeClosed className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </FormControl>

            <FormMessage className="mt-2" />
          </div>
        </FormItem>
      )}
    />
  );
}
