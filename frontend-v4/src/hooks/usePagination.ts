import { useState, useMemo, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants/masterData';

/**
 * Pagination state interface
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
}

/**
 * Pagination return interface
 */
export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
}

/**
 * Custom hook for pagination logic
 *
 * @param initialPageSize - Initial page size (default: 20)
 * @param initialTotalItems - Initial total items (default: 0)
 * @returns Pagination state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   page,
 *   pageSize,
 *   totalPages,
 *   hasNextPage,
 *   hasPrevPage,
 *   setPage,
 *   nextPage,
 *   prevPage,
 *   setTotalItems
 * } = usePagination(20);
 *
 * // When data loads
 * setTotalItems(response.totalRecords);
 *
 * // Render pagination controls
 * <Button disabled={!hasPrevPage} onClick={prevPage}>Prev</Button>
 * <span>Page {page} of {totalPages}</span>
 * <Button disabled={!hasNextPage} onClick={nextPage}>Next</Button>
 * ```
 */
export function usePagination(
  initialPageSize: number = DEFAULT_PAGE_SIZE,
  initialTotalItems: number = 0
): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    totalItems: initialTotalItems,
  });

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(state.totalItems / state.pageSize));
  }, [state.totalItems, state.pageSize]);

  const hasNextPage = useMemo(() => {
    return state.page < totalPages;
  }, [state.page, totalPages]);

  const hasPrevPage = useMemo(() => {
    return state.page > 1;
  }, [state.page]);

  const startIndex = useMemo(() => {
    return (state.page - 1) * state.pageSize;
  }, [state.page, state.pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + state.pageSize, state.totalItems);
  }, [startIndex, state.pageSize, state.totalItems]);

  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      page: Math.max(1, Math.min(page, Math.ceil(prev.totalItems / prev.pageSize) || 1)),
    }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setState(prev => ({
      ...prev,
      pageSize: size,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setState(prev => {
      const newTotalPages = Math.max(1, Math.ceil(total / prev.pageSize));
      return {
        ...prev,
        totalItems: total,
        // Adjust current page if it's now out of bounds
        page: Math.min(prev.page, newTotalPages),
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: Math.min(prev.page + 1, Math.ceil(prev.totalItems / prev.pageSize) || 1),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  }, []);

  const firstPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: 1,
    }));
  }, []);

  const lastPage = useCallback(() => {
    setState(prev => ({
      ...prev,
      page: Math.ceil(prev.totalItems / prev.pageSize) || 1,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      page: 1,
      pageSize: initialPageSize,
      totalItems: 0,
    });
  }, [initialPageSize]);

  return {
    page: state.page,
    pageSize: state.pageSize,
    totalPages,
    totalItems: state.totalItems,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
  };
}

export default usePagination;
