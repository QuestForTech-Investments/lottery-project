import { useMemo, useState } from 'react';

export type SortOrder = 'asc' | 'desc';

export interface UseTableSortResult<T, K extends string> {
  sortBy: K;
  sortOrder: SortOrder;
  sortedData: T[];
  onSort: (key: K) => void;
  /** Bundle to spread on each `<TableCell>`/`<TableSortLabel>` header. */
  getSortProps: (key: K) => {
    active: boolean;
    direction: SortOrder;
    onClick: () => void;
  };
}

/**
 * Lightweight client-side table sort. Pass an accessor that returns the
 * comparable value for a given column key (string or number). Numeric
 * columns default to descending on first click; string columns to ascending.
 */
export function useTableSort<T, K extends string = string>(
  data: T[],
  accessor: (row: T, key: K) => string | number | null | undefined,
  initial: { sortBy: K; sortOrder?: SortOrder },
): UseTableSortResult<T, K> {
  const [sortBy, setSortBy] = useState<K>(initial.sortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initial.sortOrder ?? 'asc');

  const onSort = (key: K) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      const sample = data.length > 0 ? accessor(data[0], key) : '';
      setSortOrder(typeof sample === 'number' ? 'desc' : 'asc');
    }
  };

  const sortedData = useMemo(() => {
    if (data.length === 0) return data;
    const dir = sortOrder === 'asc' ? 1 : -1;
    return data.slice().sort((a, b) => {
      const av = accessor(a, sortBy);
      const bv = accessor(b, sortBy);
      const aNum = typeof av === 'number' ? av : Number.NaN;
      const bNum = typeof bv === 'number' ? bv : Number.NaN;
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return (aNum - bNum) * dir;
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
  }, [data, sortBy, sortOrder, accessor]);

  const getSortProps = (key: K) => ({
    active: sortBy === key,
    direction: sortBy === key ? sortOrder : ('asc' as SortOrder),
    onClick: () => onSort(key),
  });

  return { sortBy, sortOrder, sortedData, onSort, getSortProps };
}
