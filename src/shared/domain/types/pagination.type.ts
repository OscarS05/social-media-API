export type PaginationResponse<T> = Pick<PaginatedResponse<T>, 'data' | 'total'>;

export type PaginationRequest = { limit: number; offset: number };

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}
