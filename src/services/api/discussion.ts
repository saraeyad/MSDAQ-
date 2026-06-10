import type {
  CreateDiscussionCommentPayload,
  CreateDiscussionPostPayload,
} from "@/types/discussion";
import type {
  DiscussionCommentResponse,
  DiscussionCommentsListParams,
  DiscussionCommentsListResponse,
  DiscussionPostResponse,
  DiscussionPostsListParams,
  DiscussionPostsListResponse,
} from "../types/discussion";
import {
  buildCreateCommentPayload,
  buildCreatePostPayload,
} from "../types/discussion";
import API from "./api.repository";

const Discussion_APIs = {
  list: async (params: DiscussionPostsListParams = {}) => {
    return API.get<DiscussionPostsListResponse>("/api/discussion-posts", {
      params,
    });
  },

  create: async (payload: CreateDiscussionPostPayload) => {
    return API.post<DiscussionPostResponse>(
      "/api/discussion-posts",
      buildCreatePostPayload(payload),
    );
  },

  listComments: async (
    postId: number | string,
    params: DiscussionCommentsListParams = {},
  ) => {
    return API.get<DiscussionCommentsListResponse>(
      `/api/discussion-posts/${postId}/comments`,
      { params },
    );
  },

  createComment: async (
    postId: number | string,
    payload: CreateDiscussionCommentPayload,
  ) => {
    return API.post<DiscussionCommentResponse>(
      `/api/discussion-posts/${postId}/comments`,
      buildCreateCommentPayload(payload),
    );
  },

  flagPost: async (postId: number | string) => {
    return API.put<DiscussionPostResponse>(
      `/api/journalist/discussion-posts/${postId}/flag`,
    );
  },

  unflagPost: async (postId: number | string) => {
    return API.put<DiscussionPostResponse>(
      `/api/journalist/discussion-posts/${postId}/unflag`,
    );
  },
};

export default Discussion_APIs;
