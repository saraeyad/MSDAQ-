"use client";

import useSelectSearch from "@/hooks/use-select-search";
import i18n from "@/i18n";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FormSelectProps {
  name: string;
  placeholder?: string;
  label?: string;
  options: any[];
  labelField?: string;
  valueField?: string;
  required?: boolean;
  wrapperClassName?: string;
  disabled?: boolean;
  disabledWarning?: string;
  columnView?: boolean;
  searchable?: boolean;
  clearOnSelect?: boolean;
  onChange?: (value: any) => void;
  loading?: boolean;
  readOnly?: boolean;
  isStringValue?: boolean;
}

export default function FormSelect({
  labelField = "LABEL",
  valueField = "VALUE",
  clearOnSelect = true,
  ...props
}: FormSelectProps) {
  const { t } = useTranslation();
  const form = useFormContext();

  const { setSearch, filteredOptions, SelectFilter } = useSelectSearch({
    ...props,
  });

  return (
    <FormField
      control={form.control}
      name={props.name}
      render={({ field, fieldState }) => (
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
          <div className="flex flex-col w-full">
            <Select
              value={field.value ? field.value.toString() : undefined}
              onValueChange={(value) => {
                field.onChange(
                  value === undefined
                    ? undefined
                    : props.isStringValue
                    ? value
                    : Number(value)
                );
                props.onChange?.(props.isStringValue ? value : Number(value));
                if (clearOnSelect) setSearch("");
              }}
              disabled={props.disabled || props.readOnly}
            >
              <FormControl>
                <SelectTrigger
                  loading={props.loading}
                  className={cn(
                    "w-full border border-black",
                    "data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px]",
                    {
                      "border-destructive data-[state=open]:border-destructive data-[state=open]:ring-destructive/40":
                        fieldState.error,
                    }
                  )}
                  dir={i18n.dir()}
                >
                  <SelectValue
                    placeholder={
                      props.placeholder ||
                      t("GENERAL.SELECT", {
                        field: props.label,
                      })
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent
                className="max-h-[300px] overflow-auto border-border bg-card [&_svg]:hidden z-[100]"
                dir={i18n.dir()}
              >
                <SelectFilter />

                {props.disabled && (
                  <div className="text-muted-foreground flex items-center justify-center p-2 text-sm">
                    {props.disabledWarning || t("GENERAL.DISABLED")}
                  </div>
                )}

                {filteredOptions.length > 0
                  ? filteredOptions.map((option: any) => (
                      <SelectItem
                        key={option[valueField]}
                        value={option[valueField].toString()}
                      >
                        {option[labelField]}
                      </SelectItem>
                    ))
                  : !props.disabled && (
                      <div className="text-muted-foreground flex items-center justify-center p-2 text-sm">
                        {t("GENERAL.NO_OPTIONS")}
                      </div>
                    )}
              </SelectContent>
            </Select>
            <FormMessage className="mt-2" />
          </div>
        </FormItem>
      )}
    />
  );
}
