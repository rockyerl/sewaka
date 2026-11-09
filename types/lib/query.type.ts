/**
 * Shared query and pagination types
 * Used across all features for consistent API responses
 */

export enum QueryDirection {
  DESC = 'DESC',
  ASC = 'ASC',
}

export interface QueryParams {
  page?: number;
  itemPerPage?: number;
  sortBy?: string;
  direction?: QueryDirection;
  search?: string;
}

export interface QueryPagination<T> {
  items: T[];
  count: number;
}

export interface QueryPaginationWithMeta<T> {
  items: T[];
  count: number;
  page: number;
  itemPerPage: number;
  totalPages: number;
}

export interface QueryMeta {
  total: number;
  page: number;
  itemPerPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QuerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface QueryFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
}

