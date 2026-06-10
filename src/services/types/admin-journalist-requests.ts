import type {
  AffiliationType,
  JournalistRequestDetail,
  JournalistRequestListItem,
  JournalistRequestStatus,
} from "@/types/journalist-requests";
import { resolveApiMediaUrl } from "@/lib/media-url";
import type { ApiResponse } from "./api";

export type ApiJournalistRequestApplicant = {
  id: number;
  name: string;
  email: string;
};

export type ApiJournalistRequestReview = {
  reviewed_by: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
};

export type ApiJournalistRequestListItem = {
  id: number;
  status: JournalistRequestStatus;
  applicant: ApiJournalistRequestApplicant;
  review: ApiJournalistRequestReview;
  submitted_at: string;
};

export type ApiJournalistRequestDetails = {
  full_name: string;
  address: {
    city: string;
    country: string;
  };
  affiliation_type: AffiliationType;
  outlet_name: string | null;
  id_photo: string;
  journalism_proof: string | null;
};

export type ApiJournalistRequestDetail = ApiJournalistRequestListItem & {
  details: ApiJournalistRequestDetails;
};

export type JournalistRequestListParams = {
  status?: JournalistRequestStatus;
};

export type RejectJournalistRequestPayload = {
  rejection_reason?: string;
};

export type JournalistRequestsListResponse = ApiResponse<ApiJournalistRequestListItem[]>;
export type JournalistRequestDetailResponse = ApiResponse<ApiJournalistRequestDetail>;
export type JournalistRequestActionResponse = ApiResponse<null>;

function mapReviewFields(review: ApiJournalistRequestReview) {
  return {
    reviewedBy: review.reviewed_by,
    rejectionReason: review.rejection_reason,
    reviewedAt: review.reviewed_at,
  };
}

export function mapApiJournalistRequestListItem(
  item: ApiJournalistRequestListItem,
): JournalistRequestListItem {
  return {
    id: item.id,
    status: item.status,
    applicantId: item.applicant.id,
    applicantName: item.applicant.name,
    applicantEmail: item.applicant.email,
    submittedAt: item.submitted_at,
    ...mapReviewFields(item.review),
  };
}

export function mapApiJournalistRequestDetail(
  item: ApiJournalistRequestDetail,
): JournalistRequestDetail {
  return {
    ...mapApiJournalistRequestListItem(item),
    fullName: item.details.full_name,
    addressCity: item.details.address.city,
    addressCountry: item.details.address.country,
    affiliationType: item.details.affiliation_type,
    outletName: item.details.outlet_name,
    idPhoto: resolveApiMediaUrl(item.details.id_photo) ?? item.details.id_photo,
    journalismProof: item.details.journalism_proof
      ? resolveApiMediaUrl(item.details.journalism_proof) ?? item.details.journalism_proof
      : null,
  };
}

export function parseJournalistRequestsListResponse(
  response: JournalistRequestsListResponse,
): JournalistRequestListItem[] {
  if (response.error) {
    throw new Error(response.message || "Failed to load journalist requests");
  }

  return (response.data ?? []).map(mapApiJournalistRequestListItem);
}

export function parseJournalistRequestDetailResponse(
  response: JournalistRequestDetailResponse,
): JournalistRequestDetail {
  if (response.error || !response.data) {
    throw new Error(response.message || "Journalist request not found");
  }

  return mapApiJournalistRequestDetail(response.data);
}

export function parseJournalistRequestActionResponse(
  response: JournalistRequestActionResponse,
): void {
  if (response.error) {
    throw new Error(response.message || "Action failed");
  }
}
