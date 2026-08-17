import type { User } from "./admin";

export interface LibraryFile {
  name: string;
  mime_type: string;
  size: string;
  url: string;
}

export interface LibraryItem {
  id: number;
  title: string;
  description?: string | null;
  /** Legacy — API returns null; not used for filtering or forms. */
  category?: string | null;
  /** Legacy — API returns null; use `file` instead. */
  file_type?: string | null;
  file: LibraryFile;
  uploaded_by?: Pick<User, "id" | "name"> | null;
  created_at: string;
}

export interface UpdateLibraryItemPayload {
  title?: string;
  description?: string | null;
}

export interface LibraryListParams {
  search?: string;
  page?: number;
}

/** Backend default page size for GET /library. */
export const LIBRARY_PAGE_SIZE = 15;
