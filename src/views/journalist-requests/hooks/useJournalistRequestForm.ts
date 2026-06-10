import { errorToast, infoToast, successToast } from "@/components/sonner-toast";
import { useAuth } from "@/context/auth";
import { useJournalistRequestPending } from "@/hooks/useJournalistRequestPending";
import { ROUTES } from "@/router/routes";
import {
  journalistRequestSchema,
  type JournalistRequestSchemaType,
} from "@/schemas/journalist-request-schema";
import { buildJournalistRequestFormData } from "@/lib/journalist-request-form";
import { setJournalistRequestPending } from "@/lib/journalist-request-status";
import JournalistRequests_APIs from "@/services/api/journalist-requests";
import {
  getJournalistRequestErrorMessage,
  isJournalistRequestDuplicateError,
  parseJournalistRequestResponse,
} from "@/services/types/journalist-requests";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const JOURNALIST_APPLY_TOTAL_STEPS = 3;

const STEP_FIELDS: Record<number, (keyof JournalistRequestSchemaType)[]> = {
  1: ["full_name", "address_city", "address_country"],
  2: ["affiliation_type", "outlet_name"],
  3: ["id_photo", "journalism_proof"],
};

const useJournalistRequestForm = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPending } = useJournalistRequestPending();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<JournalistRequestSchemaType>({
    mode: "onSubmit",
    resolver: zodResolver(journalistRequestSchema),
    defaultValues: {
      full_name: user?.name ?? "",
      address_city: "",
      address_country: "AE",
      affiliation_type: "independent",
      outlet_name: "",
      journalism_proof: null,
    },
  });

  const affiliationType = form.watch("affiliation_type");

  const goToNextStep = async () => {
    const fields = [...STEP_FIELDS[currentStep]];
    if (currentStep === 2 && affiliationType !== "affiliated") {
      fields.splice(fields.indexOf("outlet_name"), 1);
    }

    const valid = await form.trigger(fields);
    if (!valid) return;

    setCurrentStep((prev) => Math.min(prev + 1, JOURNALIST_APPLY_TOTAL_STEPS));
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: JournalistRequestSchemaType) => {
    if (loading || isPending) {
      if (isPending) {
        infoToast(t("journalistRequest.underReview"));
      }
      return;
    }

    const formData = buildJournalistRequestFormData(data, t);

    setLoading(true);
    try {
      const response = await JournalistRequests_APIs.create(formData);
      const result = parseJournalistRequestResponse(response.data);
      if (user?.id) {
        setJournalistRequestPending(user.id);
      }
      successToast(response.data.message || t("journalistRequest.submitSuccess"));
      navigate(ROUTES.HOME, {
        state: { journalistRequestId: result.journalist_request_id },
      });
    } catch (error) {
      if (isJournalistRequestDuplicateError(error)) {
        if (user?.id) {
          setJournalistRequestPending(user.id);
        }
        infoToast(t("journalistRequest.underReview"));
        return;
      }

      errorToast(
        getJournalistRequestErrorMessage(
          error,
          t,
          t("journalistRequest.submitError"),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    loading,
    affiliationType,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    user,
    isPending,
  };
};

export default useJournalistRequestForm;
