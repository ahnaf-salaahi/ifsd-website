export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function normalizePagination(input: PaginationInput = {}) {
  const page = Number.isInteger(input.page) && (input.page ?? 0) > 0
    ? input.page!
    : 1;
  const requestedSize =
    Number.isInteger(input.pageSize) && (input.pageSize ?? 0) > 0
      ? input.pageSize!
      : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(requestedSize, MAX_PAGE_SIZE);
  const from = (page - 1) * pageSize;

  return { page, pageSize, from, to: from + pageSize - 1 };
}

export function pageResult<T>(
  items: T[],
  total: number,
  pagination: ReturnType<typeof normalizePagination>,
): PageResult<T> {
  return {
    items,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pagination.pageSize),
  };
}
