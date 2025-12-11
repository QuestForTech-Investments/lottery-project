/**
 * useResultsState Hook
 *
 * Centralized state management for the Results module using useReducer.
 * This replaces 15+ useState hooks with a single, predictable state.
 */

import { useReducer, useCallback, useMemo } from 'react';
import type {
  ResultsState,
  ResultsAction,
  DrawResultRow,
  IndividualResultForm,
  ResultLogDto,
  ExternalResultDto,
} from '../types';
import { EMPTY_INDIVIDUAL_FORM } from '../constants';

// =============================================================================
// Initial State
// =============================================================================

const getInitialState = (): ResultsState => ({
  // Date and navigation
  selectedDate: new Date().toISOString().split('T')[0],
  activeTab: 0,
  logsFilterDate: '',
  // Data
  drawResults: [],
  logsData: [],
  externalResults: [],
  individualForm: EMPTY_INDIVIDUAL_FORM,
  // Loading states
  loading: false,
  fetchingExternal: false,
  comparing: false,
  savingIndividual: false,
  // Messages
  error: null,
  successMessage: null,
  // Auto-refresh
  autoRefreshEnabled: true,
  lastRefresh: new Date(),
  // Dialogs
  showCompareDialog: false,
});

// =============================================================================
// Reducer
// =============================================================================

function resultsReducer(state: ResultsState, action: ResultsAction): ResultsState {
  switch (action.type) {
    // -------------------------------------------------------------------------
    // Navigation Actions
    // -------------------------------------------------------------------------
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_LOGS_FILTER_DATE':
      return { ...state, logsFilterDate: action.payload };

    // -------------------------------------------------------------------------
    // Loading State Actions
    // -------------------------------------------------------------------------
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_FETCHING_EXTERNAL':
      return { ...state, fetchingExternal: action.payload };

    case 'SET_COMPARING':
      return { ...state, comparing: action.payload };

    case 'SET_SAVING_INDIVIDUAL':
      return { ...state, savingIndividual: action.payload };

    // -------------------------------------------------------------------------
    // Message Actions
    // -------------------------------------------------------------------------
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload };

    // -------------------------------------------------------------------------
    // Data Actions
    // -------------------------------------------------------------------------
    case 'SET_DRAW_RESULTS':
      return {
        ...state,
        drawResults: action.payload,
        lastRefresh: new Date(),
      };

    case 'UPDATE_FIELD':
      return {
        ...state,
        drawResults: state.drawResults.map((row) =>
          row.drawId === action.payload.drawId
            ? { ...row, [action.payload.field]: action.payload.value, isDirty: true }
            : row
        ),
      };

    case 'SET_SAVING':
      return {
        ...state,
        drawResults: state.drawResults.map((row) =>
          row.drawId === action.payload.drawId
            ? { ...row, isSaving: action.payload.isSaving }
            : row
        ),
      };

    case 'MARK_SAVED':
      return {
        ...state,
        drawResults: state.drawResults.map((row) =>
          row.drawId === action.payload.drawId
            ? {
                ...row,
                resultId: action.payload.resultId,
                hasResult: true,
                isDirty: false,
                isSaving: false,
              }
            : row
        ),
      };

    case 'MARK_DELETED':
      return {
        ...state,
        drawResults: state.drawResults.map((row) =>
          row.drawId === action.payload.drawId
            ? {
                ...row,
                resultId: null,
                num1: '',
                num2: '',
                num3: '',
                cash3: '',
                play4: '',
                pick5: '',
                bolita1: '',
                bolita2: '',
                singulaccion1: '',
                singulaccion2: '',
                singulaccion3: '',
                hasResult: false,
                isDirty: false,
              }
            : row
        ),
      };

    // -------------------------------------------------------------------------
    // Individual Form Actions
    // -------------------------------------------------------------------------
    case 'SET_INDIVIDUAL_FORM':
      return {
        ...state,
        individualForm: { ...state.individualForm, ...action.payload },
      };

    case 'RESET_INDIVIDUAL_FORM':
      return { ...state, individualForm: EMPTY_INDIVIDUAL_FORM };

    // -------------------------------------------------------------------------
    // External Results Actions
    // -------------------------------------------------------------------------
    case 'SET_EXTERNAL_RESULTS':
      return { ...state, externalResults: action.payload };

    case 'SET_EXTERNAL_COMPARISON':
      return { ...state, drawResults: action.payload };

    // -------------------------------------------------------------------------
    // Logs Actions
    // -------------------------------------------------------------------------
    case 'SET_LOGS':
      return { ...state, logsData: action.payload };

    // -------------------------------------------------------------------------
    // Auto-refresh Actions
    // -------------------------------------------------------------------------
    case 'TOGGLE_AUTO_REFRESH':
      return { ...state, autoRefreshEnabled: !state.autoRefreshEnabled };

    case 'SET_LAST_REFRESH':
      return { ...state, lastRefresh: action.payload };

    // -------------------------------------------------------------------------
    // Dialog Actions
    // -------------------------------------------------------------------------
    case 'SET_SHOW_COMPARE_DIALOG':
      return { ...state, showCompareDialog: action.payload };

    default:
      return state;
  }
}

// =============================================================================
// Hook
// =============================================================================

export interface UseResultsStateReturn {
  state: ResultsState;
  dispatch: React.Dispatch<ResultsAction>;
  actions: {
    // Navigation
    setDate: (date: string) => void;
    setTab: (tab: number) => void;
    setLogsFilterDate: (date: string) => void;
    // Loading
    setLoading: (loading: boolean) => void;
    setFetchingExternal: (fetching: boolean) => void;
    setComparing: (comparing: boolean) => void;
    setSavingIndividual: (saving: boolean) => void;
    // Messages
    setError: (error: string | null) => void;
    setSuccess: (message: string | null) => void;
    clearMessages: () => void;
    // Data
    setDrawResults: (results: DrawResultRow[]) => void;
    updateField: (drawId: number, field: string, value: string) => void;
    setSaving: (drawId: number, isSaving: boolean) => void;
    markSaved: (drawId: number, resultId: number) => void;
    markDeleted: (drawId: number) => void;
    // Individual form
    setIndividualForm: (form: Partial<IndividualResultForm>) => void;
    resetIndividualForm: () => void;
    // External
    setExternalResults: (results: ExternalResultDto[]) => void;
    setExternalComparison: (results: DrawResultRow[]) => void;
    // Logs
    setLogs: (logs: ResultLogDto[]) => void;
    // Auto-refresh
    toggleAutoRefresh: () => void;
    setLastRefresh: (date: Date) => void;
    // Dialog
    setShowCompareDialog: (show: boolean) => void;
  };
  // Computed values
  computed: {
    dirtyRows: DrawResultRow[];
    rowsWithResults: DrawResultRow[];
    pendingCount: number;
    totalCount: number;
    withResultsCount: number;
  };
}

export function useResultsState(): UseResultsStateReturn {
  const [state, dispatch] = useReducer(resultsReducer, undefined, getInitialState);

  // ===========================================================================
  // Memoized Action Creators
  // ===========================================================================

  // Navigation
  const setDate = useCallback(
    (date: string) => dispatch({ type: 'SET_DATE', payload: date }),
    []
  );

  const setTab = useCallback(
    (tab: number) => dispatch({ type: 'SET_TAB', payload: tab }),
    []
  );

  const setLogsFilterDate = useCallback(
    (date: string) => dispatch({ type: 'SET_LOGS_FILTER_DATE', payload: date }),
    []
  );

  // Loading
  const setLoading = useCallback(
    (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    []
  );

  const setFetchingExternal = useCallback(
    (fetching: boolean) => dispatch({ type: 'SET_FETCHING_EXTERNAL', payload: fetching }),
    []
  );

  const setComparing = useCallback(
    (comparing: boolean) => dispatch({ type: 'SET_COMPARING', payload: comparing }),
    []
  );

  const setSavingIndividual = useCallback(
    (saving: boolean) => dispatch({ type: 'SET_SAVING_INDIVIDUAL', payload: saving }),
    []
  );

  // Messages
  const setError = useCallback(
    (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error }),
    []
  );

  const setSuccess = useCallback(
    (message: string | null) => dispatch({ type: 'SET_SUCCESS', payload: message }),
    []
  );

  const clearMessages = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });
  }, []);

  // Data
  const setDrawResults = useCallback(
    (results: DrawResultRow[]) => dispatch({ type: 'SET_DRAW_RESULTS', payload: results }),
    []
  );

  const updateField = useCallback(
    (drawId: number, field: string, value: string) =>
      dispatch({ type: 'UPDATE_FIELD', payload: { drawId, field, value } }),
    []
  );

  const setSaving = useCallback(
    (drawId: number, isSaving: boolean) =>
      dispatch({ type: 'SET_SAVING', payload: { drawId, isSaving } }),
    []
  );

  const markSaved = useCallback(
    (drawId: number, resultId: number) =>
      dispatch({ type: 'MARK_SAVED', payload: { drawId, resultId } }),
    []
  );

  const markDeleted = useCallback(
    (drawId: number) => dispatch({ type: 'MARK_DELETED', payload: { drawId } }),
    []
  );

  // Individual form
  const setIndividualForm = useCallback(
    (form: Partial<IndividualResultForm>) =>
      dispatch({ type: 'SET_INDIVIDUAL_FORM', payload: form }),
    []
  );

  const resetIndividualForm = useCallback(
    () => dispatch({ type: 'RESET_INDIVIDUAL_FORM' }),
    []
  );

  // External
  const setExternalResults = useCallback(
    (results: ExternalResultDto[]) =>
      dispatch({ type: 'SET_EXTERNAL_RESULTS', payload: results }),
    []
  );

  const setExternalComparison = useCallback(
    (results: DrawResultRow[]) =>
      dispatch({ type: 'SET_EXTERNAL_COMPARISON', payload: results }),
    []
  );

  // Logs
  const setLogs = useCallback(
    (logs: ResultLogDto[]) => dispatch({ type: 'SET_LOGS', payload: logs }),
    []
  );

  // Auto-refresh
  const toggleAutoRefresh = useCallback(
    () => dispatch({ type: 'TOGGLE_AUTO_REFRESH' }),
    []
  );

  const setLastRefresh = useCallback(
    (date: Date) => dispatch({ type: 'SET_LAST_REFRESH', payload: date }),
    []
  );

  // Dialog
  const setShowCompareDialog = useCallback(
    (show: boolean) => dispatch({ type: 'SET_SHOW_COMPARE_DIALOG', payload: show }),
    []
  );

  // ===========================================================================
  // Computed Values (Memoized)
  // ===========================================================================

  const computed = useMemo(
    () => ({
      dirtyRows: state.drawResults.filter((r) => r.isDirty && (r.num1 || r.cash3)),
      rowsWithResults: state.drawResults.filter((r) => r.hasResult),
      pendingCount: state.drawResults.filter((r) => r.isDirty).length,
      totalCount: state.drawResults.length,
      withResultsCount: state.drawResults.filter((r) => r.hasResult).length,
    }),
    [state.drawResults]
  );

  // ===========================================================================
  // Memoized Actions Object
  // ===========================================================================
  // CRITICAL: This must be memoized to prevent infinite re-render loops.
  // Without useMemo, a new actions object is created on every render,
  // which causes useEffect hooks depending on 'actions' to re-trigger infinitely.

  const actions = useMemo(
    () => ({
      setDate,
      setTab,
      setLogsFilterDate,
      setLoading,
      setFetchingExternal,
      setComparing,
      setSavingIndividual,
      setError,
      setSuccess,
      clearMessages,
      setDrawResults,
      updateField,
      setSaving,
      markSaved,
      markDeleted,
      setIndividualForm,
      resetIndividualForm,
      setExternalResults,
      setExternalComparison,
      setLogs,
      toggleAutoRefresh,
      setLastRefresh,
      setShowCompareDialog,
    }),
    [
      setDate,
      setTab,
      setLogsFilterDate,
      setLoading,
      setFetchingExternal,
      setComparing,
      setSavingIndividual,
      setError,
      setSuccess,
      clearMessages,
      setDrawResults,
      updateField,
      setSaving,
      markSaved,
      markDeleted,
      setIndividualForm,
      resetIndividualForm,
      setExternalResults,
      setExternalComparison,
      setLogs,
      toggleAutoRefresh,
      setLastRefresh,
      setShowCompareDialog,
    ]
  );

  // ===========================================================================
  // Return
  // ===========================================================================

  return {
    state,
    dispatch,
    actions,
    computed,
  };
}
