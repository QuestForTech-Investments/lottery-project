/**
 * useDebouncedValue Hook
 * Debounces a value to prevent excessive updates
 * Useful for search inputs, API calls, and expensive computations
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value that updates after the delay
 *
 * @example
 * const debouncedSearch = useDebouncedValue(searchText, 500);
 *
 * useQuery({
 *   queryKey: ['data', debouncedSearch], // Only triggers after 500ms of no changes
 *   queryFn: () => api.search(debouncedSearch),
 * });
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: cancel the timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebouncedValue;
