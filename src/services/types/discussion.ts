import type {
  CreateDiscussionCommentPayload,
  CreateDiscussionPostPayload,
  DiscussionComment,
  DiscussionPost,
} from "@/types/discussion";
import type { ApiResponse } from "./api";
import type { PaginatedApiResponse, PaginationMeta } from "./articles";

export type ApiDiscussionPost = {
  id: number;
  content: string;
  is_anonymous: boolean;
  author: string;
  status: string;
  journalist_flag: string | null;
  flagged_at: string | null;
  created_at: string;
};

export type ApiDiscussionComment = {
  id: number;
  post_id: number;
  parent_id: number | null;
  content: string;
  is_anonymous: boolean;
  author: string;
  created_at: string;
  replies?: ApiDiscussionComment[];
};

export type DiscussionPostsListParams = {
  page?: number;
};

export type DiscussionCommentsListParams = {
  page?: number;
};

export type DiscussionPostsListResult = {
  posts: DiscussionPost[];
  meta: PaginationMeta;
};

export type DiscussionCommentsListResult = {
  comments: DiscussionComment[];
  meta: PaginationMeta;
};

export type DiscussionPostsListResponse = PaginatedApiResponse<ApiDiscussionPost[]>;
export type DiscussionPostResponse = ApiResponse<ApiDiscussionPost>;
export type DiscussionCommentsListResponse = PaginatedApiResponse<ApiDiscussionComment[]>;
export type DiscussionCommentResponse = ApiResponse<ApiDiscussionComment>;

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

export function mapApiDiscussionPost(post: ApiDiscussionPost): DiscussionPost {
  return {
    id: post.id,
    content: post.content,
    author: post.author,
    isAnonymous: post.is_anonymous,
    status: post.status,
    journalistFlag: post.journalist_flag,
    flaggedAt: post.flagged_at,
    createdAt: post.created_at,
  };
}

export function mapApiDiscussionComment(comment: ApiDiscussionComment): DiscussionComment {
  return {
    id: comment.id,
    postId: comment.post_id,
    parentId: comment.parent_id,
    content: comment.content,
    author: comment.author,
    isAnonymous: comment.is_anonymous,
    createdAt: comment.created_at,
    replies: (comment.replies ?? []).map(mapApiDiscussionComment),
  };
}

export function parseDiscussionPostsResponse(
  response: DiscussionPostsListResponse,
): DiscussionPostsListResult {
  if (response.error) {
    throw new Error(response.message || "Failed to load discussion posts");
  }

  return {
    posts: (response.data ?? []).map(mapApiDiscussionPost),
    meta: response.meta ?? EMPTY_META,
  };
}

export function parseDiscussionPostResponse(
  response: DiscussionPostResponse,
): DiscussionPost {
  if (response.error || !response.data) {
    throw new Error(response.message || "Failed to save discussion post");
  }

  return mapApiDiscussionPost(response.data);
}

export function parseDiscussionCommentsResponse(
  response: DiscussionCommentsListResponse,
): DiscussionCommentsListResult {
  if (response.error) {
    throw new Error(response.message || "Failed to load comments");
  }

  return {
    comments: (response.data ?? []).map(mapApiDiscussionComment),
    meta: response.meta ?? EMPTY_META,
  };
}

export function parseDiscussionCommentResponse(
  response: DiscussionCommentResponse,
): DiscussionComment {
  if (response.error || !response.data) {
    throw new Error(response.message || "Failed to save comment");
  }

  return mapApiDiscussionComment(response.data);
}

export function buildCreatePostPayload(
  payload: CreateDiscussionPostPayload,
): Record<string, string | boolean> {
  const body: Record<string, string | boolean> = {
    content: payload.content.trim(),
    is_anonymous: payload.is_anonymous ?? false,
  };

  if (!body.is_anonymous && payload.display_name?.trim()) {
    body.display_name = payload.display_name.trim();
  }

  return body;
}

export function buildCreateCommentPayload(
  payload: CreateDiscussionCommentPayload,
): Record<string, string | boolean | number> {
  const body: Record<string, string | boolean | number> = {
    content: payload.content.trim(),
    is_anonymous: payload.is_anonymous ?? false,
  };

  if (!body.is_anonymous && payload.display_name?.trim()) {
    body.display_name = payload.display_name.trim();
  }

  if (payload.parent_id != null) {
    body.parent_id = payload.parent_id;
  }

  return body;
}

export function getDiscussionErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const axiosError = error as {
    response?: {
      status?: number;
      data?: { message?: string; errors?: Record<string, string[]> };
    };
    message?: string;
  };

  const data = axiosError.response?.data;
  if (data?.errors) {
    const firstError = Object.values(data.errors).flat()[0];
    if (firstError) return firstError;
  }

  return data?.message ?? axiosError.message ?? fallback;
}
