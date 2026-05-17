/**
 * Shared helpers for the "Todos / Todas" entry that every multi-select filter
 * in the Daily Sales tabs uses to toggle the whole list at once.
 *
 * Convention: the sentinel value `-1` is reserved for the "Todos" menu item.
 * Real draw/zone IDs are always positive.
 */

export const SELECT_ALL = -1;

/**
 * Normalize a MUI <Select multiple/> value into a `number[]`. MUI may hand
 * back a comma-separated string in legacy form.
 */
export const toIdArray = (raw: number[] | string): number[] =>
  typeof raw === 'string'
    ? raw.split(',').filter(Boolean).map(Number)
    : raw;

/**
 * Returns the next selection array after the user changes a multi-select that
 * has the "Todos" sentinel as its first item.
 *
 *   - If the new value contains SELECT_ALL → toggle: clear if all were
 *     selected, otherwise select every id in `allIds`.
 *   - Otherwise → just strip out the sentinel and return.
 */
export const applySelectAllToggle = (
  raw: number[] | string,
  currentSelected: number[],
  allIds: number[],
): number[] => {
  const next = toIdArray(raw);
  if (!next.includes(SELECT_ALL)) return next;
  // "Todos" was just clicked
  return currentSelected.length === allIds.length ? [] : allIds.slice();
};
