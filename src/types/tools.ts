import type { User } from "./admin";
import type { VideoStatus } from "./articles";

export type StandardsSpanSeverity = "low" | "medium" | "high";

export interface StandardsSpan {
  quote: string;
  reason: string;
  severity: StandardsSpanSeverity;
}

export interface StandardsCriterion {
  key: string;
  label: string;
  score: number | null;
  passed: boolean | null;
  max: number | null;
  feedback: string;
  spans?: StandardsSpan[];
}

export interface StandardsCheckResult {
  fusha_passed: boolean;
  total_score: number;
  max_score: number;
  criteria: StandardsCriterion[];
}

export interface CredibilityClaim {
  text: string;
  verdict: "verified" | "unverified" | "false" | "disputed" | string;
  explanation: string;
}

export interface CredibilityCheckResult {
  credibility_score: number;
  total_claims: number;
  claims: CredibilityClaim[];
}

export interface LocalizationResult {
  simplified: string;
  dialect: string;
}

export interface StandaloneStandardsBreakdown extends StandardsCriterion {}

/** @deprecated Prefer StandardsCheckResult — kept for backward compatibility. */
export interface StandaloneStandardsResult extends StandardsCheckResult {
  breakdown?: StandaloneStandardsBreakdown[];
}

export interface StandaloneCredibilityResult {
  credibility_score: number;
}

export interface StandaloneLocalizationResult {
  content_simplified: string;
  content_dialect: string;
}

export interface GeneratedAudio {
  id: number;
  name: string | null;
  audio_url: string;
  voice: string;
  style: string | null;
  is_saved: boolean;
  saved_at: string | null;
  saved_by?: string | null;
  user_id?: number | null;
  created_by?: Pick<User, "id" | "name"> | null;
  created_at: string;
}

export interface Transcript {
  id: number;
  article_id: number | null;
  name: string | null;
  original_filename: string;
  file_size: number;
  status: "processing" | "completed" | "failed";
  transcript: string | null;
  is_saved: boolean;
  saved_at: string | null;
  saved_by?: string | null;
  user_id?: number | null;
  created_by?: Pick<User, "id" | "name"> | null;
  created_at: string;
  updated_at: string;
}

export interface SmartEditorResult {
  suggestion?: string;
  bullets?: string[];
}

/** Bias / discrimination detect-rewrite flow (Smart Editor collection). */
export type EditorialReviewSpan = StandardsSpan;

export interface EditorialDetectResult {
  spans: EditorialReviewSpan[];
}

export interface EditorialRewriteSpan {
  quote: string;
  reason: string;
}

export interface EditorialRewritePayload {
  text: string;
  spans: EditorialRewriteSpan[];
}

export interface ReverseSearchMatch {
  title: string;
  link: string;
  domain: string;
  logo?: string;
  image?: string | null;
  date?: string | null;
}

export interface AiDetectionResult {
  likely_ai_generated: boolean;
  confidence_score: number;
  status: string;
  verdict: "ai_generated" | "likely_real" | "uncertain" | string;
}

export interface TtsVoice {
  name: string;
  description: string;
  style: string;
}

export interface TtsResult {
  article_id: number;
  audio_url: string;
}

export interface VideoUploadResult {
  video_status: Exclude<VideoStatus, null>;
  message?: string;
}

export interface TranscriptJob {
  id: number;
  article_id: number | null;
  original_filename: string;
  file_size: number;
  status: "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface DomainCheckResult {
  domain: string;
  is_available: boolean;
  registered_at?: string | null;
  expires_at?: string | null;
  updated_at?: string | null;
  registrar?: string | null;
  name_servers?: string[];
}
