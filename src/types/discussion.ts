export type DiscussionTag = "personal_story" | "accountability" | "ethics";

export type DiscussionPost = {
  id: number;
  content: string;
  author: string;
  isAnonymous: boolean;
  status: string;
  journalistFlag: string | null;
  flaggedAt: string | null;
  createdAt: string;
};

export type DiscussionComment = {
  id: number;
  postId: number;
  parentId: number | null;
  content: string;
  author: string;
  isAnonymous: boolean;
  createdAt: string;
  replies: DiscussionComment[];
};

export type CreateDiscussionPostPayload = {
  content: string;
  is_anonymous?: boolean;
  display_name?: string;
};

export type CreateDiscussionCommentPayload = {
  content: string;
  is_anonymous?: boolean;
  display_name?: string;
  parent_id?: number;
};

export type DiscussionCategoryStat = {
  tag: DiscussionTag;
  count: number;
};
