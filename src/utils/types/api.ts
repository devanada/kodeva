export interface IApiMetadata {
  status_code: number;
  status: string;
  timestamp: string;
  error?: string;
}

export interface IApiPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface IApiResponse<T> {
  metadata: IApiMetadata;
  data: T;
  pagination?: IApiPagination;
}
