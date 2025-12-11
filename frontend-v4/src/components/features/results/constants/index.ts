/**
 * Results Module Constants
 *
 * Centralized constants and styles for the Results module.
 * These are defined once to avoid object recreation on each render.
 */

import type { SxProps, Theme } from '@mui/material';
import type { IndividualResultForm } from '../types';

// =============================================================================
// Configuration Constants
// =============================================================================

/**
 * Auto-refresh interval in milliseconds
 */
export const AUTO_REFRESH_INTERVAL = 60_000; // 60 seconds

/**
 * Maximum length for each field type
 */
export const FIELD_MAX_LENGTHS: Record<string, number> = {
  num1: 2,
  num2: 2,
  num3: 2,
  bolita1: 2,
  bolita2: 2,
  singulaccion1: 2,
  singulaccion2: 2,
  singulaccion3: 2,
  cash3: 3,
  play4: 4,
  pickFour: 4,
  pick5: 5,
  pickFive: 5,
};

/**
 * Field order for auto-advance in table
 */
export const TABLE_FIELD_ORDER = ['num1', 'num2', 'num3', 'cash3', 'play4', 'pick5'];

/**
 * Alias for TABLE_FIELD_ORDER (used in Results.tsx)
 */
export const FIELD_ORDER = TABLE_FIELD_ORDER;

/**
 * Field order for auto-advance in individual form
 */
export const INDIVIDUAL_FIELD_ORDER = [
  'num1',
  'num2',
  'num3',
  'cash3',
  'pickFour',
  'bolita1',
  'bolita2',
  'singulaccion1',
  'singulaccion2',
  'singulaccion3',
];

/**
 * Input widths by field type
 */
export const FIELD_WIDTHS: Record<string, number> = {
  num1: 40,
  num2: 40,
  num3: 40,
  cash3: 50,
  play4: 55,
  pick5: 60,
};

// =============================================================================
// Initial States
// =============================================================================

/**
 * Empty individual form state
 */
export const EMPTY_INDIVIDUAL_FORM: IndividualResultForm = {
  selectedDrawId: null,
  num1: '',
  num2: '',
  num3: '',
  cash3: '',
  pickFour: '',
  pickFive: '',
  bolita1: '',
  bolita2: '',
  singulaccion1: '',
  singulaccion2: '',
  singulaccion3: '',
};

// =============================================================================
// Theme Colors
// =============================================================================

export const COLORS = {
  primary: '#37b9f9',
  primaryHover: '#2da8e8',
  primaryDisabled: '#b0e0e6',
  success: '#4caf50',
  successHover: '#45a049',
  info: '#2196f3',
  infoHover: '#1976d2',
  warning: '#ff9800',
  error: '#f44336',
  // Backgrounds
  cellWithValue: '#c5f0f0',
  cellEmpty: '#fff',
  headerBg: '#f5f5f5',
  rowHover: '#fafafa',
  rowPublished: '#e3f2fd', // Light blue for published results
  rowPublishedHover: '#bbdefb', // Darker blue on hover for published results
  // Text
  textPrimary: '#333',
  textSecondary: '#666',
  textDisabled: '#ccc',
  // Borders
  border: '#e0e0e0',
  borderLight: '#ddd',
  borderHover: '#bbb',
  // Buttons
  publishGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  publishGradientHover: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
  unlock: '#f5d623',
  unlockHover: '#e6c700',
} as const;

// =============================================================================
// Table Cell Styles (defined once, reused everywhere)
// =============================================================================

export const TABLE_CELL_STYLES = {
  /**
   * Style for draw name column
   */
  drawName: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontSize: '12px',
    bgcolor: COLORS.headerBg,
    color: COLORS.textPrimary,
    borderRight: `1px solid ${COLORS.border}`,
  } as SxProps<Theme>,

  /**
   * Style for table header cells
   */
  header: {
    fontWeight: 600,
    bgcolor: COLORS.headerBg,
    fontSize: '13px',
    color: '#555',
  } as SxProps<Theme>,

  /**
   * Style for input cells with value
   */
  cellWithValue: {
    p: 0.5,
    bgcolor: COLORS.cellWithValue,
    borderRight: `1px solid ${COLORS.border}`,
  } as SxProps<Theme>,

  /**
   * Style for empty input cells
   */
  cellEmpty: {
    p: 0.5,
    bgcolor: COLORS.cellEmpty,
    borderRight: `1px solid ${COLORS.border}`,
  } as SxProps<Theme>,

  /**
   * Style for save button
   */
  saveButton: {
    bgcolor: COLORS.primary,
    '&:hover': { bgcolor: COLORS.primaryHover },
    '&.Mui-disabled': { bgcolor: COLORS.primaryDisabled, color: '#fff' },
    textTransform: 'none',
    minWidth: 40,
    fontWeight: 500,
    fontSize: '11px',
    py: 0.3,
    px: 1,
  } as SxProps<Theme>,
} as const;

// =============================================================================
// Input Styles
// =============================================================================

export const INPUT_STYLES = {
  /**
   * Common input props style
   */
  inputProps: {
    textAlign: 'center' as const,
    padding: '4px 6px',
    fontWeight: 700,
    fontSize: '13px',
    color: COLORS.textPrimary,
  },

  /**
   * TextField sx style for table inputs
   */
  textField: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'transparent',
      '& fieldset': { border: `1px solid ${COLORS.borderLight}` },
      '&:hover fieldset': { border: `1px solid ${COLORS.borderHover}` },
      '&.Mui-focused fieldset': { border: `1px solid ${COLORS.primary}` },
    },
  } as SxProps<Theme>,
} as const;

// =============================================================================
// Button Styles
// =============================================================================

export const BUTTON_STYLES = {
  /**
   * Publish all results button (violet gradient)
   */
  publishAll: {
    background: COLORS.publishGradient,
    '&:hover': { background: COLORS.publishGradientHover },
    textTransform: 'uppercase',
    fontWeight: 700,
    fontSize: '13px',
    px: 3,
    py: 1.5,
    borderRadius: 6,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#fff',
  } as SxProps<Theme>,

  /**
   * Unlock button (yellow)
   */
  unlock: {
    background: `${COLORS.unlock} !important`,
    '&:hover': { background: `${COLORS.unlockHover} !important` },
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '12px',
    color: `${COLORS.textPrimary} !important`,
    px: 2,
    py: 1,
    borderRadius: 6,
  } as SxProps<Theme>,

  /**
   * External actions buttons
   */
  externalGreen: {
    bgcolor: COLORS.success,
    '&:hover': { bgcolor: COLORS.successHover },
    textTransform: 'none',
    fontWeight: 600,
  } as SxProps<Theme>,

  externalBlue: {
    bgcolor: COLORS.info,
    '&:hover': { bgcolor: COLORS.infoHover },
    textTransform: 'none',
    fontWeight: 600,
  } as SxProps<Theme>,

  /**
   * Publish individual result button
   */
  publishIndividual: {
    bgcolor: COLORS.primary,
    '&:hover': { bgcolor: COLORS.primaryHover },
    textTransform: 'uppercase',
    fontWeight: 600,
    px: 3,
    color: '#fff',
  } as SxProps<Theme>,
} as const;

// =============================================================================
// Tab Styles
// =============================================================================

export const TAB_STYLES = {
  tabs: {
    borderBottom: 1,
    borderColor: 'divider',
    '& .MuiTab-root': { color: COLORS.primary, textTransform: 'none', fontWeight: 500 },
    '& .Mui-selected': { color: COLORS.primary },
    '& .MuiTabs-indicator': { backgroundColor: COLORS.primary },
  } as SxProps<Theme>,
} as const;

// =============================================================================
// Header Column Definitions
// =============================================================================

export const TABLE_COLUMNS = [
  { key: 'sorteos', label: 'Sorteos', minWidth: 140 },
  { key: 'num1', label: '1ra', minWidth: 55, align: 'center' as const },
  { key: 'num2', label: '2da', minWidth: 55, align: 'center' as const },
  { key: 'num3', label: '3ra', minWidth: 55, align: 'center' as const },
  { key: 'cash3', label: 'Cash 3', minWidth: 65, align: 'center' as const },
  { key: 'play4', label: 'Play 4', minWidth: 65, align: 'center' as const },
  { key: 'pick5', label: 'Pick five', minWidth: 75, align: 'center' as const },
  { key: 'detalles', label: 'Detalles', minWidth: 70, align: 'center' as const },
  { key: 'actions', label: '', minWidth: 60, align: 'center' as const },
];
