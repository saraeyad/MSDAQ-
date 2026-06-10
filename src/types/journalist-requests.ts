export type JournalistRequestStatus = "pending" | "approved" | "rejected";

export type AffiliationType = "affiliated" | "independent";

export type JournalistRequestListItem = {
  id: number;
  status: JournalistRequestStatus;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  reviewedBy: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  submittedAt: string;
};

export type JournalistRequestDetail = JournalistRequestListItem & {
  fullName: string;
  addressCity: string;
  addressCountry: string;
  affiliationType: AffiliationType;
  outletName: string | null;
  idPhoto: string;
  journalismProof: string | null;
};
