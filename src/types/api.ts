export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  results: T[];
}
