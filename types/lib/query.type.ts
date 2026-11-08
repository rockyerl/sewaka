/**
 * Shared query and pagination types
 * Used across all features for consistent API responses
 */

export enum QueryDirection {
  DESC = 'DESC',
  ASC = 'ASC',
}

export declare namespace Query {
  interface Params {
    page?: number;
    itemPerPage?: number;
    sortBy?: string;
    direction?: QueryDirection;
    search?: string;
  }

  interface Pagination<T> {
    items: T[];
    count: number;
  }

  interface PaginationWithMeta<T> {
    items: T[];
    count: number;
    page: number;
    itemPerPage: number;
    totalPages: number;
  }

  interface Meta {
    total: number;
    page: number;
    itemPerPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }

  interface Sort {
    field: string;
    direction: 'asc' | 'desc';
  }

  interface Filter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
    value: unknown;
  }
}

// Convenience type aliases
export type QueryParams = Query.Params;
export type QueryPagination<T> = Query.Pagination<T>;
export type QueryPaginationWithMeta<T> = Query.PaginationWithMeta<T>;
export type QueryMeta = Query.Meta;
