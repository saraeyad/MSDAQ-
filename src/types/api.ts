import type { PublicPagination } from "./articles";

export interface ApiResponse<T> {
  /** Collection envelope — preferred */
  success?: boolean;
  /** Legacy envelope still returned by some deployments */
  error?: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
  /** Paginated public articles list — sibling of `data` on live API */
  meta?: PublicPagination;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaginatedListResult<T> {
  items: T[];
  pagination?: PublicPagination;
}
