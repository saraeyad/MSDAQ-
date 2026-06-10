import type { DiscussionPost } from "@/types/discussion";
import type { ApiResponse } from "./api";
import type { PaginatedApiResponse, PaginationMeta } from "./articles";
import type { ApiDiscussionPost } from "./discussion";
import { mapApiDiscussionPost } from "./discussion";

export type RemovedDiscussionPostsListParams = {
  page?: number;
};

export type RemovedDiscussionPostsListResult = {
  posts: DiscussionPost[];
  meta: PaginationMeta;
};

export type RemovedDiscussionPostsListResponse =
  PaginatedApiResponse<ApiDiscussionPost[]>;

export type AdminDiscussionActionResponse = ApiResponse<null>;
export type AdminDiscussionRestoreResponse = ApiResponse<ApiDiscussionPost>;

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

export function parseRemovedDiscussionPostsResponse(
  response: RemovedDiscussionPostsListResponse,
): RemovedDiscussionPostsListResult {
  if (response.error) {
    throw new Error(response.message || "Failed to load removed posts");
  }

  return {
    posts: (response.data ?? []).map(mapApiDiscussionPost),
    meta: response.meta ?? EMPTY_META,
  };
}

export function parseAdminDiscussionActionResponse(
  response: AdminDiscussionActionResponse,
): void {
  if (response.error) {
    throw new Error(response.message || "Action failed");
  }
}

export function parseAdminDiscussionRestoreResponse(
  response: AdminDiscussionRestoreResponse,
): DiscussionPost {
  if (response.error || !response.data) {
    throw new Error(response.message || "Failed to restore post");
  }

  return mapApiDiscussionPost(response.data);
}
