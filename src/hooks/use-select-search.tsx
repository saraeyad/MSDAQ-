import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface SelectSearchProps {
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
}

const useSelectSearch = ({
  labelField = "LABEL",
  ...props
}: SelectSearchProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>("");

  const filteredOptions = useMemo(() => {
    if (!props.searchable || !search.trim()) return props.options;

    return props.options.filter((option) =>
      option[labelField].toString().toLowerCase().includes(search.toLowerCase())
    );
  }, [props.options, search, props.searchable, labelField]);

  const SelectFilter = () => {
    if (props.searchable && props.options.length > 0)
      return (
        <div className="sticky -top-2 z-10 bg-white p-2">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              props.label || props.placeholder || t("GENERAL.SEARCH")
            }
            className="ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-foreground"
            autoFocus
          />
        </div>
      );
  };

  return { setSearch, filteredOptions, SelectFilter };
};

export default useSelectSearch;
