/**
 * Hooks barrel export
 * Import all hooks from this file for consistency
 */

// Data fetching
export { useFetch, useMutation } from './useFetch';
export type { UseFetchState, UseFetchOptions, UseFetchReturn } from './useFetch';

// Debounce
export { useDebounce } from './useDebounce';

// Pagination
export { usePagination } from './usePagination';
export type { PaginationState, UsePaginationReturn } from './usePagination';

// Local storage
export { useLocalStorage } from './useLocalStorage';

// Time utilities
export { useTime } from './useTime';
export { useTimezone, getTimezoneOptions, getAllTimezones } from './useTimezone';

// Domain-specific hooks
export { useBetDetection } from './useBetDetection';
export { useExpenses } from './useExpenses';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Permissions
export { useUserPermissions } from './useUserPermissions';
