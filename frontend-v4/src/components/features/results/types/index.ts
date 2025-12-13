/**
 * Results Module Types
 *
 * Consolidated type definitions for the Results module.
 * These types are shared across all components, hooks, and utilities.
 */

import type { ResultDto, ResultLogDto, ExternalResultDto } from '@services/resultsService';

// =============================================================================
// Domain Types
// =============================================================================

/**
 * Merged draw + result data for table display
 */
export interface DrawResultRow {
  drawId: number;
  drawName: string;
  abbreviation: string;
  color?: string;
  resultId: number | null;
  // Primary number fields
  num1: string;
  num2: string;
  num3: string;
  // Extended fields for USA lotteries
  cash3: string;
  play4: string;
  pick5: string;
  bolita1: string;
  bolita2: string;
  singulaccion1: string;
  singulaccion2: string;
  singulaccion3: string;
  // State flags
  hasResult: boolean;
  isDirty: boolean;
  isSaving: boolean;
  // External comparison data
  externalNum1?: string;
  externalNum2?: string;
  externalNum3?: string;
  externalCash3?: string;
  externalPlay4?: string;
  externalPick5?: string;
  hasExternalResult?: boolean;
  matchesExternal?: boolean;
}

/**
 * Individual result entry form state
 */
export interface IndividualResultForm {
  selectedDrawId: number | null;
  num1: string;
  num2: string;
  num3: string;
  cash3: string;
  pickFour: string;
  pickFive: string;
  bolita1: string;
  bolita2: string;
  singulaccion1: string;
  singulaccion2: string;
  singulaccion3: string;
}

/**
 * Field enable/disable configuration based on draw category
 */
export interface EnabledFields {
  num1: boolean;
  num2: boolean;
  num3: boolean;
  cash3: boolean;
  play4: boolean;
  pick5: boolean;
  bolita1: boolean;
  bolita2: boolean;
  singulaccion1: boolean;
  singulaccion2: boolean;
  singulaccion3: boolean;
}

// =============================================================================
// Field Name Types
// =============================================================================

/**
 * Union type for result field names (table)
 */
export type ResultFieldName =
  | 'num1'
  | 'num2'
  | 'num3'
  | 'cash3'
  | 'play4'
  | 'pick5'
  | 'bolita1'
  | 'bolita2'
  | 'singulaccion1'
  | 'singulaccion2'
  | 'singulaccion3';

/**
 * Union type for individual form field names
 */
export type IndividualFormFieldName =
  | 'num1'
  | 'num2'
  | 'num3'
  | 'cash3'
  | 'pickFour'
  | 'pickFive'
  | 'bolita1'
  | 'bolita2'
  | 'singulaccion1'
  | 'singulaccion2'
  | 'singulaccion3';

// =============================================================================
// State Management Types
// =============================================================================

/**
 * Complete state for the Results module
 */
export interface ResultsState {
  // Date and navigation
  selectedDate: string;
  activeTab: number;
  logsFilterDate: string;
  // Data
  drawResults: DrawResultRow[];
  logsData: ResultLogDto[];
  externalResults: ExternalResultDto[];
  individualForm: IndividualResultForm;
  // Loading states
  loading: boolean;
  fetchingExternal: boolean;
  comparing: boolean;
  savingIndividual: boolean;
  // Messages
  error: string | null;
  successMessage: string | null;
  // Auto-refresh
  autoRefreshEnabled: boolean;
  lastRefresh: Date;
  // Dialogs
  showCompareDialog: boolean;
}

/**
 * Actions for the results reducer
 */
export type ResultsAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TAB'; payload: number }
  | { type: 'SET_LOGS_FILTER_DATE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FETCHING_EXTERNAL'; payload: boolean }
  | { type: 'SET_COMPARING'; payload: boolean }
  | { type: 'SET_SAVING_INDIVIDUAL'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_DRAW_RESULTS'; payload: DrawResultRow[] }
  | { type: 'UPDATE_FIELD'; payload: { drawId: number; field: string; value: string } }
  | { type: 'SET_SAVING'; payload: { drawId: number; isSaving: boolean } }
  | { type: 'MARK_SAVED'; payload: { drawId: number; resultId: number } }
  | { type: 'MARK_DELETED'; payload: { drawId: number } }
  | { type: 'SET_INDIVIDUAL_FORM'; payload: Partial<IndividualResultForm> }
  | { type: 'RESET_INDIVIDUAL_FORM' }
  | { type: 'SET_EXTERNAL_RESULTS'; payload: ExternalResultDto[] }
  | { type: 'SET_EXTERNAL_COMPARISON'; payload: DrawResultRow[] }
  | { type: 'SET_LOGS'; payload: ResultLogDto[] }
  | { type: 'TOGGLE_AUTO_REFRESH' }
  | { type: 'SET_LAST_REFRESH'; payload: Date }
  | { type: 'SET_SHOW_COMPARE_DIALOG'; payload: boolean };

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for ResultsTableRow component
 */
export interface ResultsTableRowProps {
  row: DrawResultRow;
  enabledFields: EnabledFields;
  onFieldChange: (drawId: number, field: string, value: string, inputEl?: HTMLInputElement) => void;
  onSave: (row: DrawResultRow) => void;
  onEdit: (row: DrawResultRow) => void;
}

/**
 * Props for ResultInputCell component
 */
export interface ResultInputCellProps {
  value: string;
  enabled: boolean;
  isSaving: boolean;
  maxLength: number;
  width: number;
  hasValue?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Props for IndividualResultForm component
 */
export interface IndividualResultFormProps {
  selectedDate: string;
  drawResults: DrawResultRow[];
  form: IndividualResultForm;
  saving: boolean;
  onDateChange: (date: string) => void;
  onDrawSelect: (drawId: number) => void;
  onFieldChange: (field: keyof IndividualResultForm, value: string, enabledFieldsList?: string[]) => void;
  onPublish: () => void;
}

/**
 * Props for ResultsActions component
 */
export interface ResultsActionsProps {
  fetchingExternal: boolean;
  comparing: boolean;
  onFetchExternal: () => void;
  onCompare: () => void;
  onRefresh: () => void;
}

/**
 * Props for ResultsSummary component
 */
export interface ResultsSummaryProps {
  totalDraws: number;
  withResults: number;
  pending: number;
  autoRefreshEnabled: boolean;
  lastRefresh: Date;
  onToggleAutoRefresh: () => void;
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Result of validating a result row
 */
export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

/**
 * Field configuration for dynamic form building
 */
export interface FieldConfig {
  field: IndividualFormFieldName;
  label: string;
  maxLen: number;
  enabled: boolean;
}

// =============================================================================
// Re-exports from service
// =============================================================================

export type { ResultDto, ResultLogDto, ExternalResultDto };
