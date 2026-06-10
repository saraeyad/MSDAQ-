import type { AffiliationType, JournalistRequestStatus } from "@/types/journalist-requests";
import type { ApiResponse } from "./api";

export type JournalistRequestCreateData = {
  journalist_request_id: number;
  full_name: string;
  address: {
    city: string;
    country: string;
  };
  affiliation_type: AffiliationType;
  outlet_name: string | null;
  id_photo: string;
  journalism_proof: string | null;
  status?: JournalistRequestStatus;
};

export type JournalistRequestCreateResponse =
  ApiResponse<JournalistRequestCreateData>;

export function parseJournalistRequestResponse(
  response: JournalistRequestCreateResponse,
): JournalistRequestCreateData {
  if (response.error || !response.data?.journalist_request_id) {
    throw new Error(response.message || "Request submission failed");
  }

  return response.data;
}

export function isJournalistRequestDuplicateError(error: unknown): boolean {
  const axiosError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  const message = (
    axiosError.response?.data?.message ?? axiosError.message ?? ""
  ).toLowerCase();

  return (
    message.includes("already") &&
    (message.includes("request") || message.includes("submitted"))
  );
}

export function getJournalistRequestErrorMessage(
  error: unknown,
  translate: (key: string) => string,
  fallback: string,
): string {
  const axiosError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  if (isJournalistRequestDuplicateError(error)) {
    return translate("journalistRequest.underReview");
  }

  const message = (
    axiosError.response?.data?.message ?? axiosError.message ?? fallback
  ).toLowerCase();

  if (message.includes("normal_user") || message.includes("not authorized")) {
    return translate("journalistRequest.notEligible");
  }

  return axiosError.response?.data?.message ?? axiosError.message ?? fallback;
}

