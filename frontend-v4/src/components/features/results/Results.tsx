/**
 * Results Module
 *
 * Refactored component using modular architecture for better maintainability.
 * - State management via useResultsState hook (useReducer)
 * - Types centralized in ./types
 * - Constants centralized in ./constants
 * - Utility functions in ./utils
 */

import React, { useCallback, useEffect, useRef, useState, useMemo, type SyntheticEvent, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Lock as LockIcon,
} from '@mui/icons-material';
import {
  getResults,
  getResultLogs,
  getDrawsForResults,
  createResult,
  updateResult,
  deleteResult,
  type ResultDto,
  type ResultLogDto,
} from '@services/resultsService';

// Internal module imports
import { useResultsState } from './hooks';
import type { DrawResultRow, IndividualResultForm, EnabledFields } from './types';
import {
  EMPTY_INDIVIDUAL_FORM,
  COLORS,
  FIELD_ORDER,
  INDIVIDUAL_FIELD_ORDER,
} from './constants';
import {
  getMaxLength,
  getIndividualMaxLength,
  getFieldWidth,
  getEnabledFields,
  isValidLotteryNumber,
  hasDateLikePattern,
  sanitizeNumberInput,
  calculateUsaFields,
  isUsaTriggerField,
  calculatePlay4OnlyFields,
  isPlay4OnlyDraw,
} from './utils';
import { getDrawCategory, DRAW_CATEGORIES } from '@services/betTypeCompatibilityService';
import { ResultsTableRow } from './components/ResultsTable';

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate a result row before saving
 */
const validateResultRow = (row: DrawResultRow): { valid: boolean; error: string | null } => {
  if (row.num1 && !isValidLotteryNumber(row.num1)) {
    return { valid: false, error: `"${row.num1}" no es un número válido (debe ser 2 dígitos)` };
  }
  if (row.num2 && !isValidLotteryNumber(row.num2)) {
    return { valid: false, error: `"${row.num2}" no es un número válido (debe ser 2 dígitos)` };
  }
  if (row.num3 && !isValidLotteryNumber(row.num3)) {
    return { valid: false, error: `"${row.num3}" no es un número válido (debe ser 2 dígitos)` };
  }

  const combined = row.num1 + row.num2 + row.num3;
  if (combined && hasDateLikePattern(combined)) {
    return {
      valid: false,
      error: `El resultado "${combined}" parece una fecha. Verifique los números.`,
    };
  }

  return { valid: true, error: null };
};

// =============================================================================
// Main Component
// =============================================================================

const Results = (): React.ReactElement => {
  // ---------------------------------------------------------------------------
  // State Management (via useReducer hook)
  // ---------------------------------------------------------------------------
  const { state, actions, computed } = useResultsState();
  const {
    selectedDate,
    activeTab,
    logsFilterDate,
    drawResults,
    logsData,
    individualForm,
    loading,
    savingIndividual,
    error,
    successMessage,
    lastRefresh,
  } = state;

  // Refs for individual form inputs (for auto-advance)
  const individualFormRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Ref to prevent duplicate API calls from StrictMode double-mounting
  const isLoadingRef = useRef(false);
  const lastLoadedDateRef = useRef<string | null>(null);

  // Filter state for table
  const [drawFilter, setDrawFilter] = useState<string>('');

  // Status filter: 'all' | 'pending' | 'completed'
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');


  // Filter state for logs tab
  const [logsFilter, setLogsFilter] = useState<string>('');

  // State for view details modal
  const [viewDetailsRow, setViewDetailsRow] = useState<DrawResultRow | null>(null);

  // Filtered draw results (by status and text filter)
  const filteredDrawResults = useMemo(() => {
    let results = drawResults;

    // Apply status filter
    if (statusFilter === 'pending') {
      results = results.filter((row) => !row.hasResult);
    } else if (statusFilter === 'completed') {
      results = results.filter((row) => row.hasResult);
    }

    // Apply text filter
    if (drawFilter) {
      results = results.filter((row) =>
        row.drawName.toLowerCase().includes(drawFilter.toLowerCase())
      );
    }

    return results;
  }, [drawResults, drawFilter, statusFilter]);

  // Counts for filter tabs
  const filterCounts = useMemo(() => ({
    all: drawResults.length,
    pending: drawResults.filter((row) => !row.hasResult).length,
    completed: drawResults.filter((row) => row.hasResult).length,
  }), [drawResults]);



  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!logsFilter) return logsData;
    const filterLower = logsFilter.toLowerCase();
    return logsData.filter((log) =>
      log.drawName.toLowerCase().includes(filterLower) ||
      log.username.toLowerCase().includes(filterLower) ||
      log.winningNumbers.includes(logsFilter)
    );
  }, [logsData, logsFilter]);

  // Memoized enabled fields map - calculate once for all draws
  // This prevents calling getEnabledFields() 68+ times per render
  const enabledFieldsMap = useMemo(() => {
    const map = new Map<number, EnabledFields>();
    drawResults.forEach((row) => {
      map.set(row.drawId, getEnabledFields(row.drawName));
    });
    return map;
  }, [drawResults]);

  /**
   * Parse winning numbers string and return formatted display with labels and badges
   * Input format could be: "405691" (6 digits) or with additional numbers like "405691741344974134"
   * The winningNumbers field from API contains the formatted string ready to display
   */
  const renderWinningNumbers = useCallback((winningNumbers: string) => {
    if (!winningNumbers) return '-';

    // If the API already returns formatted string like "1ra: 40, 2da: 56, 3ra: 91"
    // Parse it and create badges. Otherwise, try to parse raw numbers.

    // Try to detect if it's already formatted with labels
    if (winningNumbers.includes(':') || winningNumbers.includes('1ra')) {
      // Already formatted, parse and display with badges
      const parts = winningNumbers.split(/[,;]/).map(p => p.trim()).filter(Boolean);
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          {parts.map((part, idx) => {
            const match = part.match(/^(.+?)[:.]?\s*(\d+)$/);
            if (match) {
              const [, label, value] = match;
              return (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
                    {label.trim()}
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      px: 0.8,
                      py: 0.2,
                      minWidth: '28px',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '12px', color: '#333' }}>
                      {value}
                    </Typography>
                  </Box>
                </Box>
              );
            }
            return null;
          })}
        </Box>
      );
    }

    // If it's raw numbers, try to parse (e.g., "405691" = 40, 56, 91)
    // Basic format: 6 digits = 3 x 2-digit numbers
    const cleanNumbers = winningNumbers.replace(/\D/g, '');

    if (cleanNumbers.length >= 6) {
      const num1 = cleanNumbers.substring(0, 2);
      const num2 = cleanNumbers.substring(2, 4);
      const num3 = cleanNumbers.substring(4, 6);
      const remaining = cleanNumbers.substring(6);

      const labels: { label: string; value: string }[] = [
        { label: '1ra', value: num1 },
        { label: '2da', value: num2 },
        { label: '3ra', value: num3 },
      ];

      // Parse additional numbers if present (Pick 3: 3 digits, Pick 4: 4 digits, Pick 5: 5 digits)
      if (remaining.length >= 3) {
        labels.push({ label: 'Pick 3', value: remaining.substring(0, 3) });
        const afterCash3 = remaining.substring(3);
        if (afterCash3.length >= 4) {
          labels.push({ label: 'Pick 4', value: afterCash3.substring(0, 4) });
          const afterPlay4 = afterCash3.substring(4);
          if (afterPlay4.length >= 5) {
            labels.push({ label: 'Pick 5', value: afterPlay4.substring(0, 5) });
          }
        }
      }

      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          {labels.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
                {item.label}
              </Typography>
              <Box
                sx={{
                  bgcolor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  px: 0.8,
                  py: 0.2,
                  minWidth: '28px',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '12px', color: '#333' }}>
                  {item.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    // Fallback: just show the raw string
    return winningNumbers;
  }, []);

  /**
   * Render log winning numbers using pre-parsed fields from API
   * Uses the individual fields (num1, num2, num3, cash3, play4, pick5) from ResultLogDto
   */
  const renderLogWinningNumbers = useCallback((log: ResultLogDto) => {
    const labels: { label: string; value: string }[] = [];

    // Add main numbers (1ra, 2da, 3ra) if present
    if (log.num1) labels.push({ label: '1ra', value: log.num1 });
    if (log.num2) labels.push({ label: '2da', value: log.num2 });
    if (log.num3) labels.push({ label: '3ra', value: log.num3 });

    // Add USA lottery bet types if present
    if (log.cash3) labels.push({ label: 'Pick 3', value: log.cash3 });
    if (log.play4) labels.push({ label: 'Pick 4', value: log.play4 });
    if (log.pick5) labels.push({ label: 'Pick 5', value: log.pick5 });

    // Add derived bet types (Bolita and Singulaccion) if present
    if (log.bolita1) labels.push({ label: 'Bolita 1', value: log.bolita1 });
    if (log.bolita2) labels.push({ label: 'Bolita 2', value: log.bolita2 });
    if (log.singulaccion1) labels.push({ label: 'Singulaccion 1', value: log.singulaccion1 });
    if (log.singulaccion2) labels.push({ label: 'Singulaccion 2', value: log.singulaccion2 });
    if (log.singulaccion3) labels.push({ label: 'Singulaccion 3', value: log.singulaccion3 });

    // If no labels, show fallback
    if (labels.length === 0) {
      return log.winningNumbers || '-';
    }

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {labels.map((item, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
              {item.label}
            </Typography>
            <Box
              sx={{
                bgcolor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                px: 0.8,
                py: 0.2,
                minWidth: '28px',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '12px', color: '#333' }}>
                {item.value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Data Loading
  // ---------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    actions.setLoading(true);
    actions.setError(null);
    try {
      const [drawsList, resultsList] = await Promise.all([
        getDrawsForResults(selectedDate),
        getResults(selectedDate),
      ]);

      const resultsMap = new Map<number, ResultDto>();
      resultsList.forEach((r) => resultsMap.set(r.drawId, r));

      const mergedData: DrawResultRow[] = drawsList.map((draw) => {
        const result = resultsMap.get(draw.drawId);
        const drawColor = (draw as { color?: string }).color || '#37b9f9';
        return {
          drawId: draw.drawId,
          drawName: draw.drawName,
          abbreviation: draw.abbreviation,
          color: drawColor,
          resultId: result?.resultId || null,
          num1: result?.num1 || '',
          num2: result?.num2 || '',
          num3: result?.num3 || '',
          cash3: result?.cash3 || '',
          play4: result?.play4 || '',
          pick5: result?.pick5 || '',
          bolita1: result?.bolita1 ?? '',
          bolita2: result?.bolita2 ?? '',
          singulaccion1: result?.singulaccion1 ?? '',
          singulaccion2: result?.singulaccion2 ?? '',
          singulaccion3: result?.singulaccion3 ?? '',
          hasResult: !!result,
          isDirty: false,
          isSaving: false,
        };
      });

      actions.setDrawResults(mergedData);
    } catch (err) {
      console.error('Error loading data:', err);
      actions.setError('Error al cargar los datos');
    } finally {
      actions.setLoading(false);
    }
  }, [selectedDate, actions]);

  // Consolidated data loading effect
  // Load results data on mount and when date changes
  // Also auto-select first available draw when data loads
  useEffect(() => {
    // Prevent duplicate API calls from React StrictMode double-mounting
    // Skip if already loading or if we just loaded this same date
    if (isLoadingRef.current || lastLoadedDateRef.current === selectedDate) {
      return;
    }

    const loadDataAndSetup = async () => {
      isLoadingRef.current = true;

      await loadData();

      isLoadingRef.current = false;
      lastLoadedDateRef.current = selectedDate;

      actions.setLastRefresh(new Date());

      // Auto-select first available draw if none selected
      // Use setTimeout to ensure state is updated after loadData completes
      setTimeout(() => {
        // Access latest state via ref to avoid stale closure
        const currentDrawResults = drawResultsRef.current;
        if (currentDrawResults.length > 0 && !individualForm.selectedDrawId) {
          const firstAvailableDraw = currentDrawResults.find((draw) => !draw.hasResult);
          if (firstAvailableDraw) {
            actions.setIndividualForm({
              selectedDrawId: firstAvailableDraw.drawId,
              num1: firstAvailableDraw.num1,
              num2: firstAvailableDraw.num2,
              num3: firstAvailableDraw.num3,
              cash3: firstAvailableDraw.cash3,
              pickFour: firstAvailableDraw.play4,
              pickFive: firstAvailableDraw.pick5,
              bolita1: firstAvailableDraw.bolita1,
              bolita2: firstAvailableDraw.bolita2,
              singulaccion1: firstAvailableDraw.singulaccion1,
              singulaccion2: firstAvailableDraw.singulaccion2,
              singulaccion3: firstAvailableDraw.singulaccion3,
            });
          }
        }
      }, 0);
    };

    loadDataAndSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]); // loadData and actions are stable, excluded to prevent cascading

  // Load logs when tab changes to Logs tab
  useEffect(() => {
    if (activeTab !== 1) return;

    const loadLogs = async () => {
      try {
        const logs = await getResultLogs(logsFilterDate || undefined);
        actions.setLogs(logs);
      } catch (err) {
        console.error('Error loading logs:', err);
      }
    };

    loadLogs();
  }, [activeTab, logsFilterDate]);

  // ---------------------------------------------------------------------------
  // Field Change Handlers
  // ---------------------------------------------------------------------------

  // Use ref to access current drawResults without triggering re-renders
  const drawResultsRef = useRef<DrawResultRow[]>(drawResults);

  // Update ref whenever drawResults changes
  useEffect(() => {
    drawResultsRef.current = drawResults;
  }, [drawResults]);

  const handleFieldChange = useCallback(
    (drawId: number, field: string, value: string, inputElement?: HTMLInputElement) => {
      const sanitizedValue = sanitizeNumberInput(value);
      const maxLength = getMaxLength(field);

      actions.updateField(drawId, field, sanitizedValue);

      // USA Lottery Auto-calculation
      // When cash3 or play4 changes, auto-calculate all derived fields
      if (isUsaTriggerField(field)) {
        // Use ref to avoid dependency on drawResults array
        const row = drawResultsRef.current.find((r) => r.drawId === drawId);
        if (row) {
          const category = getDrawCategory(row.drawName);
          if (category === 'USA') {
            // Check if this is a Play4-only draw (Massachusetts)
            if (isPlay4OnlyDraw(row.drawName)) {
              // Massachusetts only has Play4 - calculate only num2 and num3
              if (field === 'play4') {
                const play4Value = sanitizedValue;
                const calculated = calculatePlay4OnlyFields(play4Value);
                actions.updateField(drawId, 'num2', calculated.num2);
                actions.updateField(drawId, 'num3', calculated.num3);
              }
            } else {
              // Standard USA lottery - calculate all fields from cash3 and play4
              const cash3Value = field === 'cash3' ? sanitizedValue : row.cash3;
              const play4Value = field === 'play4' ? sanitizedValue : row.play4;

              // Calculate all derived fields
              const calculated = calculateUsaFields(cash3Value, play4Value);

              // Update all auto-calculated fields
              actions.updateField(drawId, 'num1', calculated.num1);
              actions.updateField(drawId, 'num2', calculated.num2);
              actions.updateField(drawId, 'num3', calculated.num3);
              actions.updateField(drawId, 'bolita1', calculated.bolita1);
              actions.updateField(drawId, 'bolita2', calculated.bolita2);
              actions.updateField(drawId, 'singulaccion1', calculated.singulaccion1);
              actions.updateField(drawId, 'singulaccion2', calculated.singulaccion2);
              actions.updateField(drawId, 'singulaccion3', calculated.singulaccion3);
              actions.updateField(drawId, 'pick5', calculated.pick5);
            }
          }
        }
      }

      // Auto-advance to next input when field is complete
      if (sanitizedValue.length >= maxLength && inputElement) {
        const currentFieldIndex = FIELD_ORDER.indexOf(field);
        if (currentFieldIndex !== -1 && currentFieldIndex < FIELD_ORDER.length - 1) {
          const row = inputElement.closest('tr');
          if (row) {
            const inputs = row.querySelectorAll('input[type="text"]');
            const currentIndex = Array.from(inputs).indexOf(inputElement);
            const nextInput = inputs[currentIndex + 1] as HTMLInputElement;
            if (nextInput && !nextInput.disabled) {
              setTimeout(() => {
                nextInput.focus();
                nextInput.select();
              }, 10);
            }
          }
        }
      }
    },
    [actions]
  );

  const handleIndividualFormChange = useCallback(
    (field: keyof IndividualResultForm, value: string, enabledFieldsList?: string[]) => {
      const sanitizedValue = sanitizeNumberInput(value);
      const maxLength = getIndividualMaxLength(field);

      actions.setIndividualForm({ [field]: sanitizedValue });

      // USA Lottery Auto-calculation for individual form
      // When cash3 or pickFour changes, auto-calculate all derived fields
      if (field === 'cash3' || field === 'pickFour') {
        const selectedDraw = drawResults.find((d) => d.drawId === individualForm.selectedDrawId);
        if (selectedDraw) {
          const category = getDrawCategory(selectedDraw.drawName);
          if (category === 'USA') {
            // Check if this is a Play4-only draw (Massachusetts)
            if (isPlay4OnlyDraw(selectedDraw.drawName)) {
              // Massachusetts only has Play4 - calculate only num2 and num3
              if (field === 'pickFour') {
                const pickFourValue = sanitizedValue;
                const calculated = calculatePlay4OnlyFields(pickFourValue);
                actions.setIndividualForm({
                  num2: calculated.num2,
                  num3: calculated.num3,
                });
              }
            } else {
              // Standard USA lottery - calculate all fields from cash3 and play4
              const cash3Value = field === 'cash3' ? sanitizedValue : individualForm.cash3;
              const pickFourValue = field === 'pickFour' ? sanitizedValue : individualForm.pickFour;

              // Calculate all derived fields
              const calculated = calculateUsaFields(cash3Value, pickFourValue);

              // Update all auto-calculated fields in the individual form
              actions.setIndividualForm({
                num1: calculated.num1,
                num2: calculated.num2,
                num3: calculated.num3,
                bolita1: calculated.bolita1,
                bolita2: calculated.bolita2,
                singulaccion1: calculated.singulaccion1,
                singulaccion2: calculated.singulaccion2,
                singulaccion3: calculated.singulaccion3,
                pickFive: calculated.pick5,
              });
            }
          }
        }
      }

      // Auto-advance
      if (sanitizedValue.length >= maxLength && enabledFieldsList) {
        const currentIndex = enabledFieldsList.indexOf(field);
        if (currentIndex !== -1 && currentIndex < enabledFieldsList.length - 1) {
          const nextField = enabledFieldsList[currentIndex + 1];
          const nextInput = individualFormRefs.current[nextField];
          if (nextInput) {
            setTimeout(() => {
              nextInput.focus();
              nextInput.select();
            }, 10);
          }
        }
      }
    },
    [actions, drawResults, individualForm.selectedDrawId, individualForm.cash3, individualForm.pickFour]
  );

  // ---------------------------------------------------------------------------
  // Save/Delete Handlers
  // ---------------------------------------------------------------------------

  const handleSaveResult = useCallback(
    async (drawId: number) => {
      const row = drawResults.find((r) => r.drawId === drawId);
      if (!row) return;

      const validation = validateResultRow(row);
      if (!validation.valid) {
        actions.setError(`Error en ${row.drawName}: ${validation.error}`);
        return;
      }

      actions.setSaving(drawId, true);

      try {
        const winningNumber = row.num1 + row.num2 + row.num3;

        // Build additionalNumber from cash3, play4, pick5 for USA lotteries
        // Format expected by API: cash3 (3 digits) + play4 (4 digits) + pick5 (5 digits)
        const additionalNumber = (row.cash3 || '') + (row.play4 || '') + (row.pick5 || '');

        const data = {
          drawId: row.drawId,
          winningNumber,
          additionalNumber: additionalNumber || null,
          resultDate: selectedDate
        };

        let savedResult: ResultDto | null;
        if (row.resultId) {
          savedResult = await updateResult(row.resultId, data);
        } else {
          savedResult = await createResult(data);
        }

        actions.markSaved(drawId, savedResult?.resultId || row.resultId || 0);
        actions.setSuccess(`Resultado guardado para ${row.drawName}`);
      } catch (err) {
        console.error('Error saving result:', err);
        actions.setError(`Error al guardar resultado para ${row.drawName}`);
        actions.setSaving(drawId, false);
      }
    },
    [drawResults, selectedDate, actions]
  );

  const handleDeleteResult = useCallback(
    async (drawId: number) => {
      const row = drawResults.find((r) => r.drawId === drawId);
      if (!row || !row.resultId) return;

      if (!window.confirm(`¿Eliminar resultado de ${row.drawName}?`)) return;

      try {
        await deleteResult(row.resultId);
        actions.markDeleted(drawId);
        actions.setSuccess(`Resultado eliminado para ${row.drawName}`);
      } catch (err) {
        console.error('Error deleting result:', err);
        actions.setError('Error al eliminar resultado');
      }
    },
    [drawResults, actions]
  );

  // ---------------------------------------------------------------------------
  // Publish Handlers
  // ---------------------------------------------------------------------------

  const handlePublishAll = useCallback(async () => {
    const dirtyRows = computed.dirtyRows;
    if (dirtyRows.length === 0) {
      actions.setError('No hay resultados pendientes de guardar');
      return;
    }

    const invalidRows = dirtyRows
      .map((row) => ({ row, validation: validateResultRow(row) }))
      .filter((item) => !item.validation.valid);

    if (invalidRows.length > 0) {
      const errorMessages = invalidRows
        .map((item) => `${item.row.drawName}: ${item.validation.error}`)
        .join('\n');
      actions.setError(`No se puede publicar. Errores:\n${errorMessages}`);
      return;
    }

    for (const row of dirtyRows) {
      await handleSaveResult(row.drawId);
    }
    actions.setSuccess(`${dirtyRows.length} resultados publicados`);
  }, [computed.dirtyRows, handleSaveResult, actions]);

  const handlePublishIndividual = useCallback(async () => {
    if (!individualForm.selectedDrawId) {
      actions.setError('Seleccione un sorteo');
      return;
    }

    actions.setSavingIndividual(true);
    try {
      const row = drawResults.find((d) => d.drawId === individualForm.selectedDrawId);
      if (!row) return;

      const winningNumber = individualForm.num1 + individualForm.num2 + individualForm.num3;

      // Build additionalNumber from cash3, pickFour (play4), pickFive (pick5) for USA lotteries
      const additionalNumber = (individualForm.cash3 || '') + (individualForm.pickFour || '') + (individualForm.pickFive || '');

      const data = {
        drawId: individualForm.selectedDrawId,
        winningNumber,
        additionalNumber: additionalNumber || null,
        resultDate: selectedDate
      };

      let savedResult;
      if (row.resultId) {
        savedResult = await updateResult(row.resultId, data);
      } else {
        savedResult = await createResult(data);
      }

      // Update the row in drawResults
      const updatedResults = drawResults.map((r) => {
        if (r.drawId !== individualForm.selectedDrawId) return r;
        return {
          ...r,
          resultId: savedResult?.resultId || r.resultId,
          num1: individualForm.num1,
          num2: individualForm.num2,
          num3: individualForm.num3,
          cash3: individualForm.cash3,
          play4: individualForm.pickFour,
          pick5: individualForm.pickFive,
          bolita1: individualForm.bolita1,
          bolita2: individualForm.bolita2,
          singulaccion1: individualForm.singulaccion1,
          singulaccion2: individualForm.singulaccion2,
          singulaccion3: individualForm.singulaccion3,
          hasResult: true,
          isDirty: false,
        };
      });
      actions.setDrawResults(updatedResults);
      actions.setSuccess(`Resultado publicado para ${row.drawName}`);

      // Find the next pending draw (without result) to auto-select
      const currentIndex = drawResults.findIndex((d) => d.drawId === individualForm.selectedDrawId);
      const nextPendingDraw = drawResults.find((d, index) => index > currentIndex && !d.hasResult);

      if (nextPendingDraw) {
        // Select the next pending draw
        actions.setIndividualForm({
          selectedDrawId: nextPendingDraw.drawId,
          num1: nextPendingDraw.num1,
          num2: nextPendingDraw.num2,
          num3: nextPendingDraw.num3,
          cash3: nextPendingDraw.cash3,
          pickFour: nextPendingDraw.play4,
          pickFive: nextPendingDraw.pick5,
          bolita1: nextPendingDraw.bolita1,
          bolita2: nextPendingDraw.bolita2,
          singulaccion1: nextPendingDraw.singulaccion1,
          singulaccion2: nextPendingDraw.singulaccion2,
          singulaccion3: nextPendingDraw.singulaccion3,
        });
      } else {
        // No more pending draws, reset form
        actions.resetIndividualForm();
      }
    } catch (err) {
      console.error('Error publishing individual result:', err);
      actions.setError('Error al publicar resultado');
    } finally {
      actions.setSavingIndividual(false);
    }
  }, [individualForm, drawResults, selectedDate, actions]);

  // ---------------------------------------------------------------------------
  // UI Event Handlers
  // ---------------------------------------------------------------------------

  const handleTabChange = useCallback(
    (_event: SyntheticEvent, newValue: number) => {
      actions.setTab(newValue);
    },
    [actions]
  );

  const handleDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      actions.setDate(e.target.value);
    },
    [actions]
  );

  const handleLogsFilterDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      actions.setLogsFilterDate(e.target.value);
    },
    [actions]
  );

  const handleCloseSnackbar = useCallback(() => {
    actions.clearMessages();
  }, [actions]);

  const handleDrawSelect = useCallback(
    (event: SelectChangeEvent<number>) => {
      const drawId = event.target.value as number;
      const selectedDraw = drawResults.find((d) => d.drawId === drawId);
      if (selectedDraw) {
        actions.setIndividualForm({
          selectedDrawId: drawId,
          num1: selectedDraw.num1,
          num2: selectedDraw.num2,
          num3: selectedDraw.num3,
          cash3: selectedDraw.cash3,
          pickFour: selectedDraw.play4,
          pickFive: selectedDraw.pick5,
          bolita1: selectedDraw.bolita1,
          bolita2: selectedDraw.bolita2,
          singulaccion1: selectedDraw.singulaccion1,
          singulaccion2: selectedDraw.singulaccion2,
          singulaccion3: selectedDraw.singulaccion3,
        });
      }
    },
    [drawResults, actions]
  );

  const handleEditRow = useCallback(
    (row: DrawResultRow) => {
      actions.setIndividualForm({
        selectedDrawId: row.drawId,
        num1: row.num1,
        num2: row.num2,
        num3: row.num3,
        cash3: row.cash3,
        pickFour: row.play4,
        pickFive: row.pick5,
        bolita1: row.bolita1,
        bolita2: row.bolita2,
        singulaccion1: row.singulaccion1,
        singulaccion2: row.singulaccion2,
        singulaccion3: row.singulaccion3,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [actions]
  );

  const handleViewDetails = useCallback((row: DrawResultRow) => {
    setViewDetailsRow(row);
  }, []);

  const handleCloseViewDetails = useCallback(() => {
    setViewDetailsRow(null);
  }, []);

  const handleDeleteRow = useCallback(
    async (row: DrawResultRow) => {
      if (!row.resultId) {
        actions.setError('Este sorteo no tiene resultado para borrar');
        return;
      }

      if (!window.confirm(`¿Está seguro de borrar el resultado de ${row.drawName}?`)) {
        return;
      }

      try {
        await deleteResult(row.resultId);

        // Update the row in drawResults to clear the result
        const updatedResults = drawResults.map((r) => {
          if (r.drawId !== row.drawId) return r;
          return {
            ...r,
            resultId: undefined,
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
          };
        });
        actions.setDrawResults(updatedResults);
        actions.setSuccess(`Resultado borrado para ${row.drawName}`);
      } catch (err) {
        console.error('Error deleting result:', err);
        actions.setError('Error al borrar resultado');
      }
    },
    [drawResults, actions]
  );


  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box sx={{ p: 3 }}>
      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Paper elevation={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { color: COLORS.primary, textTransform: 'none', fontWeight: 500 },
            '& .Mui-selected': { color: COLORS.primary },
            '& .MuiTabs-indicator': { backgroundColor: COLORS.primary },
          }}
        >
          <Tab label="Manejar resultados" />
          <Tab label="Logs de resultados" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <>
              <Typography
                variant="h5"
                align="center"
                sx={{ mb: 3, fontWeight: 600, color: '#333' }}
              >
                Manejar resultados
              </Typography>

              {/* Individual Result Entry Form */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, border: '1px solid #ddd' }}>
                {/* Row 1: Date + Draw Dropdown */}
                <Box
                  sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>
                      Fecha
                    </Typography>
                    <TextField
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      size="small"
                      sx={{ width: 200, bgcolor: '#fff' }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>
                      Sorteo
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={individualForm.selectedDrawId || ''}
                        onChange={handleDrawSelect}
                        sx={{ bgcolor: '#fff' }}
                      >
                        {drawResults
                          .filter((draw) => !draw.hasResult || draw.drawId === individualForm.selectedDrawId)
                          .map((draw) => (
                            <MenuItem key={draw.drawId} value={draw.drawId}>
                              {draw.drawName}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Row 2: Dynamic Input Fields based on draw category */}
                {individualForm.selectedDrawId &&
                  (() => {
                    const selectedDraw = drawResults.find(
                      (d) => d.drawId === individualForm.selectedDrawId
                    );
                    const enabledFields = selectedDraw
                      ? getEnabledFields(selectedDraw.drawName)
                      : getEnabledFields('');

                    // Define all possible fields with their configuration
                    // For USA draws: only cash3 and pickFour are editable (enabled)
                    // Other draws: fields are shown based on enabledFields
                    const allFields = [
                      { field: 'num1' as const, label: '1ra', maxLen: 2, enabled: enabledFields.num1 },
                      { field: 'num2' as const, label: '2da', maxLen: 2, enabled: enabledFields.num2 },
                      { field: 'num3' as const, label: '3ra', maxLen: 2, enabled: enabledFields.num3 },
                      { field: 'cash3' as const, label: 'Pick 3', maxLen: 3, enabled: enabledFields.cash3 },
                      { field: 'pickFour' as const, label: 'Pick 4', maxLen: 4, enabled: enabledFields.play4 },
                      { field: 'pickFive' as const, label: 'Pick 5', maxLen: 5, enabled: enabledFields.pick5 },
                      { field: 'bolita1' as const, label: 'Bolita 1', maxLen: 2, enabled: enabledFields.bolita1 },
                      { field: 'bolita2' as const, label: 'Bolita 2', maxLen: 2, enabled: enabledFields.bolita2 },
                      { field: 'singulaccion1' as const, label: 'Sing. 1', maxLen: 1, enabled: enabledFields.singulaccion1 },
                      { field: 'singulaccion2' as const, label: 'Sing. 2', maxLen: 1, enabled: enabledFields.singulaccion2 },
                      { field: 'singulaccion3' as const, label: 'Sing. 3', maxLen: 1, enabled: enabledFields.singulaccion3 },
                    ];

                    // Check if this is a USA draw (has cash3 or play4 enabled)
                    const isUsaDraw = enabledFields.cash3 && enabledFields.play4 && !enabledFields.num1;

                    // For USA draws, show all fields; for others, only show enabled fields
                    const visibleFields = isUsaDraw
                      ? allFields  // Show all fields for USA draws
                      : allFields.filter((f) => f.enabled);  // Only show enabled fields for other draws

                    // For auto-advance, only consider editable fields
                    const editableFieldsList = visibleFields.filter((f) => f.enabled).map((f) => f.field);

                    return (
                      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                        {/* Header row */}
                        <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                          <Box sx={{ width: 140, p: 1, borderRight: '1px solid #ddd' }}></Box>
                          {visibleFields.map((f, idx) => (
                            <Box
                              key={f.field}
                              sx={{
                                flex: 1,
                                p: 1,
                                textAlign: 'center',
                                borderRight: idx < visibleFields.length - 1 ? '1px solid #ddd' : 'none',
                                fontSize: '12px',
                                color: f.enabled ? '#333' : '#999',
                                fontWeight: f.enabled ? 600 : 400,
                              }}
                            >
                              {f.label}
                            </Box>
                          ))}
                        </Box>
                        {/* Input row */}
                        <Box sx={{ display: 'flex', bgcolor: '#fff' }}>
                          <Box
                            sx={{
                              width: 140,
                              p: 1,
                              borderRight: '1px solid #ddd',
                              fontWeight: 600,
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {selectedDraw?.drawName}
                          </Box>
                          {visibleFields.map((f, idx) => (
                            <Box
                              key={f.field}
                              sx={{
                                flex: 1,
                                p: 0.5,
                                borderRight: idx < visibleFields.length - 1 ? '1px solid #ddd' : 'none',
                                bgcolor: f.enabled ? '#fff' : '#f5f5f5',
                              }}
                            >
                              <TextField
                                value={individualForm[f.field]}
                                onChange={(e) =>
                                  handleIndividualFormChange(f.field, e.target.value, editableFieldsList)
                                }
                                inputRef={(el) => {
                                  individualFormRefs.current[f.field] = el;
                                }}
                                disabled={!f.enabled}
                                size="small"
                                inputProps={{
                                  maxLength: f.maxLen,
                                  style: {
                                    textAlign: 'center',
                                    padding: '8px',
                                    color: f.enabled ? '#333' : '#666',
                                    fontWeight: f.enabled ? 700 : 400,
                                  },
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: f.enabled ? '#fff' : '#f0f0f0',
                                    '&.Mui-disabled': {
                                      bgcolor: '#f5f5f5',
                                      '& fieldset': { border: '1px solid #ddd' },
                                    },
                                  },
                                }}
                                fullWidth
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })()}

                {/* Publish Individual Button */}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handlePublishIndividual}
                    disabled={!individualForm.selectedDrawId || savingIndividual}
                    sx={{
                      bgcolor: COLORS.primary,
                      '&:hover': { bgcolor: COLORS.primaryHover },
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      px: 3,
                      color: '#fff',
                    }}
                  >
                    {savingIndividual ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'PUBLICAR RESULTADO'
                    )}
                  </Button>
                </Box>
              </Paper>


              {/* Results Table Section */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.primary }}>
                  Resultados {selectedDate}
                </Typography>

                {/* Status Filter Tabs */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant={statusFilter === 'all' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setStatusFilter('all')}
                    sx={{
                      borderRadius: 20,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      fontSize: '13px',
                      bgcolor: statusFilter === 'all' ? COLORS.primary : 'transparent',
                      borderColor: statusFilter === 'all' ? COLORS.primary : '#ccc',
                      color: statusFilter === 'all' ? '#fff' : '#666',
                      '&:hover': {
                        bgcolor: statusFilter === 'all' ? COLORS.primaryHover : '#f5f5f5',
                        borderColor: COLORS.primary,
                      },
                    }}
                  >
                    Todos ({filterCounts.all})
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setStatusFilter('pending')}
                    sx={{
                      borderRadius: 20,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      fontSize: '13px',
                      bgcolor: statusFilter === 'pending' ? '#f5a623' : 'transparent',
                      borderColor: statusFilter === 'pending' ? '#f5a623' : '#ccc',
                      color: statusFilter === 'pending' ? '#fff' : '#666',
                      '&:hover': {
                        bgcolor: statusFilter === 'pending' ? '#e69500' : '#fff8e1',
                        borderColor: '#f5a623',
                      },
                    }}
                  >
                    Sin resultado ({filterCounts.pending})
                  </Button>
                  <Button
                    variant={statusFilter === 'completed' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setStatusFilter('completed')}
                    sx={{
                      borderRadius: 20,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2,
                      py: 0.5,
                      fontSize: '13px',
                      bgcolor: statusFilter === 'completed' ? '#4caf50' : 'transparent',
                      borderColor: statusFilter === 'completed' ? '#4caf50' : '#ccc',
                      color: statusFilter === 'completed' ? '#fff' : '#666',
                      '&:hover': {
                        bgcolor: statusFilter === 'completed' ? '#43a047' : '#e8f5e9',
                        borderColor: '#4caf50',
                      },
                    }}
                  >
                    Con resultado ({filterCounts.completed})
                  </Button>
                </Box>

                {/* Action buttons and filter */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handlePublishAll}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                        },
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '12px',
                        px: 2,
                        py: 1,
                        borderRadius: 6,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        color: '#fff',
                      }}
                    >
                      PUBLICAR RESULTADOS
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<LockIcon sx={{ fontSize: 18 }} />}
                      sx={{
                        background: '#f5d623 !important',
                        '&:hover': { background: '#e6c700 !important' },
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        fontSize: '12px',
                        color: '#333 !important',
                        px: 2,
                        py: 1,
                        borderRadius: 6,
                      }}
                    >
                      DESBLOQUEAR
                    </Button>
                  </Box>
                  <TextField
                    size="small"
                    placeholder="Filtrar sorteo..."
                    value={drawFilter}
                    onChange={(e) => setDrawFilter(e.target.value)}
                    sx={{
                      width: 200,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#fff',
                        fontSize: '12px',
                      }
                    }}
                  />
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 140, fontSize: '13px', color: '#555' }}>
                            Sorteos
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 55, fontSize: '13px', color: '#555' }}>
                            1ra
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 55, fontSize: '13px', color: '#555' }}>
                            2da
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 55, fontSize: '13px', color: '#555' }}>
                            3ra
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 65, fontSize: '13px', color: '#555' }}>
                            Pick 3
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 65, fontSize: '13px', color: '#555' }}>
                            Pick 4
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 75, fontSize: '13px', color: '#555' }}>
                            Pick 5
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 110, fontSize: '13px', color: '#555' }}>
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDrawResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              {drawFilter ? 'No se encontraron sorteos' : 'No hay sorteos configurados'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDrawResults.map((row) => (
                            <ResultsTableRow
                              key={row.drawId}
                              row={row}
                              enabledFields={enabledFieldsMap.get(row.drawId)!}
                              onFieldChange={handleFieldChange}
                              onSave={handleViewDetails}
                              onDelete={handleDeleteRow}
                              onEdit={handleEditRow}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Summary */}
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total: {computed.totalCount} sorteos | Con resultado: {computed.withResultsCount} |
                    Pendientes: {computed.pendingCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Última actualización: {lastRefresh.toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                Logs de resultados
              </Typography>

              {/* Date Filter */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>
                  Fecha
                </Typography>
                <TextField
                  type="date"
                  value={logsFilterDate}
                  onChange={handleLogsFilterDateChange}
                  size="small"
                  sx={{ minWidth: 200, bgcolor: '#fff' }}
                />
              </Box>

              {/* Quick Filter (Filtrado rápido) */}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                  size="small"
                  placeholder="Filtrado rápido"
                  value={logsFilter}
                  onChange={(e) => setLogsFilter(e.target.value)}
                  sx={{ width: 250, bgcolor: '#fff' }}
                  InputProps={{
                    sx: { bgcolor: '#fff' },
                  }}
                />
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                        Sorteo
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                        Usuario
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                        Fecha de resultado
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                        Fecha de registro
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#555' }}>
                        Números
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                          No hay entradas disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log, index) => (
                        <TableRow
                          key={index}
                          hover
                          sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f0f0f0' }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{log.drawName}</TableCell>
                          <TableCell>{log.username}</TableCell>
                          <TableCell>{new Date(log.resultDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleDateString() +
                                ' ' +
                                new Date(log.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true,
                                })
                              : '-'}
                          </TableCell>
                          <TableCell>{renderLogWinningNumbers(log)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Mostrando {filteredLogs.length} de {logsData.length} entradas
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewDetailsRow}
        onClose={handleCloseViewDetails}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{
          bgcolor: COLORS.primary,
          color: '#fff',
          fontWeight: 600,
          py: 1.5,
        }}>
          {viewDetailsRow?.drawName}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewDetailsRow && (() => {
            const category = getDrawCategory(viewDetailsRow.drawName);
            const isUsaDraw = category === 'USA';

            // Build fields array based on lottery type
            const fields: { label: string; value: string }[] = [];

            // Base fields (always shown if have value)
            if (viewDetailsRow.num1) fields.push({ label: '1RA', value: viewDetailsRow.num1 });
            if (viewDetailsRow.num2) fields.push({ label: '2DA', value: viewDetailsRow.num2 });
            if (viewDetailsRow.num3) fields.push({ label: '3RA', value: viewDetailsRow.num3 });

            // USA-specific fields (use != null to handle "0" values which are falsy)
            if (isUsaDraw) {
              if (viewDetailsRow.cash3 != null && viewDetailsRow.cash3 !== '') fields.push({ label: 'PICK THREE', value: viewDetailsRow.cash3 });
              if (viewDetailsRow.play4 != null && viewDetailsRow.play4 !== '') fields.push({ label: 'PICK FOUR', value: viewDetailsRow.play4 });
              if (viewDetailsRow.pick5 != null && viewDetailsRow.pick5 !== '') fields.push({ label: 'PICK FIVE', value: viewDetailsRow.pick5 });
              if (viewDetailsRow.bolita1 != null && viewDetailsRow.bolita1 !== '') fields.push({ label: 'BOLITA 1', value: viewDetailsRow.bolita1 });
              if (viewDetailsRow.bolita2 != null && viewDetailsRow.bolita2 !== '') fields.push({ label: 'BOLITA 2', value: viewDetailsRow.bolita2 });
              if (viewDetailsRow.singulaccion1 != null && viewDetailsRow.singulaccion1 !== '') fields.push({ label: 'SINGULACCION 1', value: viewDetailsRow.singulaccion1 });
              if (viewDetailsRow.singulaccion2 != null && viewDetailsRow.singulaccion2 !== '') fields.push({ label: 'SINGULACCION 2', value: viewDetailsRow.singulaccion2 });
              if (viewDetailsRow.singulaccion3 != null && viewDetailsRow.singulaccion3 !== '') fields.push({ label: 'SINGULACCION 3', value: viewDetailsRow.singulaccion3 });
            }

            return (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 2,
                py: 1,
              }}>
                {fields.map((field, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      textAlign: 'center',
                      p: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#666',
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.5,
                        fontSize: '11px',
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#333',
                        fontSize: '20px',
                      }}
                    >
                      {field.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseViewDetails}
            variant="contained"
            sx={{
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: COLORS.primaryHover },
              textTransform: 'none',
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Results;
