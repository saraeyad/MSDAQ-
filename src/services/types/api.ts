export type ApiResponse<T> = {
  error: boolean;
  message: string;
  data: T | null;
};
