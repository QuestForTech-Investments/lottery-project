/**
 * Configuration constants for automatic expenses
 * Centralized configuration to avoid hardcoding values
 */

export const EXPENSE_TYPES = [
  { id: 'electricity', name: 'Electricidad', icon: '⚡' },
  { id: 'water', name: 'Agua', icon: '💧' },
  { id: 'internet', name: 'Internet', icon: '🌐' },
  { id: 'rent', name: 'Alquiler', icon: '🏠' },
  { id: 'maintenance', name: 'Mantenimiento', icon: '🔧' },
  { id: 'salary', name: 'Salario', icon: '💰' },
  { id: 'supplies', name: 'Suministros', icon: '📦' },
  { id: 'security', name: 'Seguridad', icon: '🔒' },
  { id: 'cleaning', name: 'Limpieza', icon: '🧹' },
  { id: 'other', name: 'Otro', icon: '📋' }
];

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario', days: 1 },
  { value: 'weekly', label: 'Semanal', days: 7 },
  { value: 'biweekly', label: 'Quincenal', days: 15 },
  { value: 'monthly', label: 'Mensual', days: 30 }
];

export const WEEKDAYS = [
  { value: '0', label: 'Domingo', short: 'Dom' },
  { value: '1', label: 'Lunes', short: 'Lun' },
  { value: '2', label: 'Martes', short: 'Mar' },
  { value: '3', label: 'Miércoles', short: 'Mié' },
  { value: '4', label: 'Jueves', short: 'Jue' },
  { value: '5', label: 'Viernes', short: 'Vie' },
  { value: '6', label: 'Sábado', short: 'Sáb' }
];

export const DEFAULT_EXPENSE = {
  type: '',
  description: '',
  amount: '',
  frequency: 'monthly',
  day: '1',
  date: new Date().toISOString().split('T')[0]
};

export const PAGINATION_OPTIONS = [5, 10, 20, 50, 100];

export const DEFAULT_ITEMS_PER_PAGE = 20;
