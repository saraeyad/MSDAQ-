import { errorToast } from "@/components/sonner-toast";
import {
  aiImageDetectionSchema,
  type AiImageDetectionSchemaType,
} from "@/schemas/ai-image-detection-schema";
import {
  imageVerificationSchema,
  type ImageVerificationSchemaType,
} from "@/schemas/image-verification-schema";
import ImageVerification_APIs from "@/services/api/image-verification";
import { getApiErrorMessage } from "@/services/types/auth";
import type { ImageVerificationMode } from "@/types/image-verification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

function useImageVerification() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ImageVerificationMode>("reverse");
  const [reversePreviewUrl, setReversePreviewUrl] = useState<string | null>(null);
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string | null>(null);

  const reverseForm = useForm<ImageVerificationSchemaType>({
    resolver: zodResolver(imageVerificationSchema),
    defaultValues: { image_url: "" },
  });

  const aiForm = useForm<AiImageDetectionSchemaType>({
    resolver: zodResolver(aiImageDetectionSchema),
  });

  const reverseMutation = useMutation({
    mutationFn: (data: ImageVerificationSchemaType) =>
      ImageVerification_APIs.reverseSearch(data),
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("imageVerification.checkError")));
    },
  });

  const aiMutation = useMutation({
    mutationFn: (data: AiImageDetectionSchemaType) =>
      ImageVerification_APIs.detectAi(data.image_file),
    onError: (error) => {
      errorToast(getApiErrorMessage(error, t("imageVerification.ai.checkError")));
    },
  });

  const revokeAiPreview = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  useEffect(() => {
    return () => revokeAiPreview(aiPreviewUrl);
  }, [aiPreviewUrl, revokeAiPreview]);

  const onReverseSubmit = (data: ImageVerificationSchemaType) => {
    setReversePreviewUrl(data.image_url);
    reverseMutation.mutate(data);
  };

  const onAiSubmit = (data: AiImageDetectionSchemaType) => {
    revokeAiPreview(aiPreviewUrl);
    setAiPreviewUrl(URL.createObjectURL(data.image_file));
    aiMutation.mutate(data);
  };

  const clearReverseResult = () => {
    reverseMutation.reset();
  };

  const clearAiResult = () => {
    aiMutation.reset();
  };

  const handleReverseModalOpenChange = (open: boolean) => {
    if (!open) {
      clearReverseResult();
    }
  };

  const handleAiModalOpenChange = (open: boolean) => {
    if (!open) {
      clearAiResult();
    }
  };

  const setAiFilePreview = (file: File | null) => {
    revokeAiPreview(aiPreviewUrl);
    if (file) {
      setAiPreviewUrl(URL.createObjectURL(file));
    } else {
      setAiPreviewUrl(null);
    }
  };

  return {
    mode,
    setMode,
    reverseForm,
    onReverseSubmit,
    reverseLoading: reverseMutation.isPending,
    reverseResult: reverseMutation.data?.data.data ?? null,
    reversePreviewUrl,
    setReversePreviewUrl,
    handleReverseModalOpenChange,
    aiForm,
    onAiSubmit,
    aiLoading: aiMutation.isPending,
    aiResult: aiMutation.data?.data.data ?? null,
    aiPreviewUrl,
    setAiFilePreview,
    handleAiModalOpenChange,
  };
}

export default useImageVerification;
