/**
 * API Services - Central Export
 * Import all API modules from here: import { api, drawsApi, ticketsApi } from '@/services/api'
 */

// Export API client (correct exports from client.ts)
export { default as api } from './client';

// Export named auth functions
export * from './auth';

// Export domain-specific APIs
export { drawsApi } from './draws';
export { ticketsApi } from './tickets';
export { limitsApi } from './limits';
