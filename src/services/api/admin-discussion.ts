import type {
  AdminDiscussionActionResponse,
  AdminDiscussionRestoreResponse,
  RemovedDiscussionPostsListParams,
  RemovedDiscussionPostsListResponse,
} from "../types/admin-discussion";
import API from "./api.repository";

const AdminDiscussion_APIs = {
  listRemoved: async (params: RemovedDiscussionPostsListParams = {}) => {
    return API.get<RemovedDiscussionPostsListResponse>(
      "/api/admin/discussion-posts/removed",
      { params },
    );
  },

  removePost: async (postId: number | string) => {
    return API.delete<AdminDiscussionActionResponse>(
      `/api/admin/discussion-posts/${postId}`,
    );
  },

  restorePost: async (postId: number | string) => {
    return API.put<AdminDiscussionRestoreResponse>(
      `/api/admin/discussion-posts/${postId}/restore`,
    );
  },
};

export default AdminDiscussion_APIs;
