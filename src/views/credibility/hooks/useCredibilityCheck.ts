import { errorToast } from "@/components/sonner-toast";
import {
  credibilityCheckSchema,
  type CredibilityCheckSchemaType,
} from "@/schemas/credibility-schema";
import Credibility_APIs from "@/services/api/credibility";
import { getApiErrorMessage } from "@/services/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

function useCredibilityCheck() {
  const { t } = useTranslation();
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const form = useForm<CredibilityCheckSchemaType>({
    resolver: zodResolver(credibilityCheckSchema),
    defaultValues: { content: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: CredibilityCheckSchemaType) => Credibility_APIs.check(data),
    onSuccess: () => {
      setCheckedAt(new Date().toISOString());
    },
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("credibility.checkError")));
    },
  });

  const onSubmit = (data: CredibilityCheckSchemaType) => {
    mutation.mutate(data);
  };

  const clearResult = () => {
    mutation.reset();
    setCheckedAt(null);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      clearResult();
    }
  };

  return {
    form,
    onSubmit,
    loading: mutation.isPending,
    result: mutation.data?.data.data ?? null,
    checkedAt,
    clearResult,
    handleModalOpenChange,
  };
}

export default useCredibilityCheck;
