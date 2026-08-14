import type { User } from "./admin";

export type LibraryFileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "other";

export interface LibraryItem {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  file_url?: string | null;
  file_type: LibraryFileType | string;
  uploaded_by?: Pick<User, "id" | "name"> | null;
  created_at: string;
}

export interface UpdateLibraryItemPayload {
  title?: string;
  description?: string;
  category?: string;
}

export interface LibraryListParams {
  category?: string;
  file_type?: LibraryFileType;
  search?: string;
  page?: number;
}
