/**
 * Results Module
 *
 * Refactored component using modular architecture for better maintainability.
 * - State management via useResultsState hook (useReducer)
 * - Types centralized in ./types
 * - Constants centralized in ./constants
 * - Utility functions in ./utils
 * - UI components in ./components
 */

import React, { useCallback, useEffect, useRef, useState, useMemo, type SyntheticEvent, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  getResults,
  getResultLogs,
  getDrawsForResults,
  createResult,
  updateResult,
  deleteResult,
  type ResultDto,
} from '@services/resultsService';

// Internal module imports
import { useResultsState } from './hooks';
import type { DrawResultRow, IndividualResultForm as IndividualResultFormType, EnabledFields } from './types';
import { COLORS, INDIVIDUAL_FIELD_ORDER, AUTO_REFRESH_INTERVAL } from './constants';
import {
  getMaxLength,
  getEnabledFields,
  sanitizeNumberInput,
  calculateUsaFields,
  isUsaTriggerField,
  calculatePlay4OnlyFields,
  isPlay4OnlyDraw,
  getSuperPaleTarget,
  SUPER_PALE_SOURCE_MAP,
  get6x1Target,
  DRAW_6X1_SOURCE_MAP,
  validateResultRow,
} from './utils';
import { getDrawCategory } from '@services/betTypeCompatibilityService';
import {
  IndividualResultForm,
  ResultsLogsTab,
  ViewDetailsDialog,
  ResultsTableSection,
  type StatusFilterType,
} from './components';

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
  // Always show all results - no status filtering
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

  // State for view details modal
  const [viewDetailsRow, setViewDetailsRow] = useState<DrawResultRow | null>(null);

  // Use ref to access current drawResults without triggering re-renders
  const drawResultsRef = useRef<DrawResultRow[]>(drawResults);
  useEffect(() => {
    drawResultsRef.current = drawResults;
  }, [drawResults]);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  const filteredDrawResults = useMemo(() => {
    let results = drawResults;
    if (statusFilter === 'pending') {
      results = results.filter((row) => !row.hasResult);
    } else if (statusFilter === 'completed') {
      results = results.filter((row) => row.hasResult);
    }
    if (drawFilter) {
      results = results.filter((row) =>
        row.drawName.toLowerCase().includes(drawFilter.toLowerCase())
      );
    }
    return results;
  }, [drawResults, drawFilter, statusFilter]);

  const filterCounts = useMemo(() => ({
    all: drawResults.length,
    pending: drawResults.filter((row) => !row.hasResult).length,
    completed: drawResults.filter((row) => row.hasResult).length,
  }), [drawResults]);

  const enabledFieldsMap = useMemo(() => {
    const map = new Map<number, EnabledFields>();
    drawResults.forEach((row) => {
      map.set(row.drawId, getEnabledFields(row.drawName));
    });
    return map;
  }, [drawResults]);

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
          drawName: draw.drawName || draw.abbreviation || `Draw ${draw.drawId}`,
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

      // Pre-populate Super Palé auto-calc draws from existing source results
      Object.entries(SUPER_PALE_SOURCE_MAP).forEach(([sourceName, target]) => {
        const sourceRow = mergedData.find(r => r.drawName.toUpperCase().includes(sourceName));
        const targetRow = mergedData.find(r => r.drawName.toUpperCase().includes(target.targetDraw));
        if (sourceRow?.num1 && targetRow && !targetRow.hasResult) {
          targetRow[target.targetField] = sourceRow.num1;
          targetRow.isDirty = true;
        }
      });

      // Pre-populate 6x1 auto-calc draws from existing source results
      Object.entries(DRAW_6X1_SOURCE_MAP).forEach(([sourceName, target]) => {
        const sourceRow = mergedData.find(r => r.drawName.toUpperCase().includes(sourceName));
        const targetRow = mergedData.find(r => r.drawName.toUpperCase().includes(target.targetDraw));
        if (sourceRow && targetRow && !targetRow.hasResult) {
          if (sourceRow.cash3) { targetRow.cash3 = sourceRow.cash3; targetRow.isDirty = true; }
          if (sourceRow.play4) { targetRow.play4 = sourceRow.play4; targetRow.isDirty = true; }
        }
      });

      actions.setDrawResults(mergedData);
    } catch (err) {
      console.error('Error loading data:', err);
      actions.setError('Error al cargar los datos');
    } finally {
      actions.setLoading(false);
    }
  }, [selectedDate, actions]);

  useEffect(() => {
    if (isLoadingRef.current || lastLoadedDateRef.current === selectedDate) {
      return;
    }

    const loadDataAndSetup = async () => {
      isLoadingRef.current = true;
      await loadData();
      isLoadingRef.current = false;
      lastLoadedDateRef.current = selectedDate;
      actions.setLastRefresh(new Date());

      setTimeout(() => {
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
  }, [selectedDate]);

  // ---------------------------------------------------------------------------
  // Auto-refresh: silently update rows that have no result and are not being edited
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!state.autoRefreshEnabled || activeTab !== 0) return;

    const silentRefresh = async () => {
      // Skip refresh if user is focused on any input inside the results table
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'INPUT' && activeEl.closest('.results-table-section')) {
        return;
      }

      try {
        const [drawsList, resultsList] = await Promise.all([
          getDrawsForResults(selectedDate),
          getResults(selectedDate),
        ]);

        const resultsMap = new Map<number, ResultDto>();
        resultsList.forEach((r) => resultsMap.set(r.drawId, r));

        const current = drawResultsRef.current;
        let changed = false;

        const updated = current.map((row) => {
          // Skip rows the user is currently editing or that already had a result
          if (row.isDirty || row.isSaving) return row;

          const freshResult = resultsMap.get(row.drawId);
          if (freshResult && !row.hasResult) {
            // A new result appeared from another user/session
            changed = true;
            return {
              ...row,
              resultId: freshResult.resultId,
              num1: freshResult.num1 || '',
              num2: freshResult.num2 || '',
              num3: freshResult.num3 || '',
              cash3: freshResult.cash3 || '',
              play4: freshResult.play4 || '',
              pick5: freshResult.pick5 || '',
              bolita1: freshResult.bolita1 ?? '',
              bolita2: freshResult.bolita2 ?? '',
              singulaccion1: freshResult.singulaccion1 ?? '',
              singulaccion2: freshResult.singulaccion2 ?? '',
              singulaccion3: freshResult.singulaccion3 ?? '',
              hasResult: true,
              isDirty: false,
            };
          }
          return row;
        });

        // Also add any new draws that weren't in the original list
        const currentIds = new Set(current.map((r) => r.drawId));
        drawsList.forEach((draw) => {
          if (!currentIds.has(draw.drawId)) {
            changed = true;
            const result = resultsMap.get(draw.drawId);
            const drawColor = (draw as { color?: string }).color || '#37b9f9';
            updated.push({
              drawId: draw.drawId,
              drawName: draw.drawName || draw.abbreviation || `Draw ${draw.drawId}`,
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
            });
          }
        });

        if (changed) {
          actions.setDrawResults(updated);
        }
        actions.setLastRefresh(new Date());
      } catch {
        // Silent fail - don't show error for background refresh
      }
    };

    const intervalId = setInterval(silentRefresh, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [selectedDate, activeTab, state.autoRefreshEnabled, actions]);

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

  const handleFieldChange = useCallback(
    (drawId: number, field: string, value: string, inputElement?: HTMLInputElement) => {
      const sanitizedValue = sanitizeNumberInput(value);
      const maxLength = getMaxLength(field);

      actions.updateField(drawId, field, sanitizedValue);

      if (isUsaTriggerField(field)) {
        const row = drawResultsRef.current.find((r) => r.drawId === drawId);
        if (row) {
          if (isPlay4OnlyDraw(row.drawName) && field === 'play4') {
            // Play4-only draws (Massachusetts): overlapping derivation from 4-digit result
            const calculated = calculatePlay4OnlyFields(sanitizedValue);
            actions.updateField(drawId, 'num1', calculated.num1);
            actions.updateField(drawId, 'num2', calculated.num2);
            actions.updateField(drawId, 'num3', calculated.num3);
            actions.updateField(drawId, 'cash3', calculated.cash3);
          } else {
            const category = getDrawCategory(row.drawName);
            if (category === 'USA') {
              const cash3Value = field === 'cash3' ? sanitizedValue : row.cash3;
              const play4Value = field === 'play4' ? sanitizedValue : row.play4;
              const calculated = calculateUsaFields(cash3Value, play4Value);
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

      // Super Palé auto-calculation: when source draw's num1 changes, update target Super Palé draw
      if (field === 'num1') {
        const row = drawResultsRef.current.find((r) => r.drawId === drawId);
        if (row) {
          const target = getSuperPaleTarget(row.drawName);
          if (target) {
            const targetRow = drawResultsRef.current.find(
              (r) => r.drawName.toUpperCase().trim().includes(target.targetDraw)
            );
            if (targetRow) {
              actions.updateField(targetRow.drawId, target.targetField, sanitizedValue);
            }
          }
        }
      }

      // 6x1 auto-calculation: when source draw's cash3 or play4 changes, update target 6x1 draw
      if (field === 'cash3' || field === 'play4') {
        const row = drawResultsRef.current.find((r) => r.drawId === drawId);
        if (row) {
          const target = get6x1Target(row.drawName);
          if (target) {
            const targetRow = drawResultsRef.current.find(
              (r) => r.drawName.toUpperCase().trim().includes(target.targetDraw)
            );
            if (targetRow) {
              actions.updateField(targetRow.drawId, field, sanitizedValue);
            }
          }
        }
      }

      if (sanitizedValue.length >= maxLength && inputElement) {
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
    },
    [actions]
  );

  const handleIndividualFormChange = useCallback(
    (field: keyof IndividualResultFormType, value: string, enabledFieldsList?: string[]) => {
      const sanitizedValue = sanitizeNumberInput(value);
      const maxLength = getMaxLength(field);

      actions.setIndividualForm({ [field]: sanitizedValue });

      if (field === 'cash3' || field === 'pickFour') {
        const selectedDraw = drawResults.find((d) => d.drawId === individualForm.selectedDrawId);
        if (selectedDraw) {
          if (isPlay4OnlyDraw(selectedDraw.drawName) && field === 'pickFour') {
            // Play4-only draws (Massachusetts): overlapping derivation from 4-digit result
            const calculated = calculatePlay4OnlyFields(sanitizedValue);
            actions.setIndividualForm({
              num1: calculated.num1,
              num2: calculated.num2,
              num3: calculated.num3,
              cash3: calculated.cash3,
            });
          } else {
            const category = getDrawCategory(selectedDraw.drawName);
            if (category === 'USA') {
              const cash3Value = field === 'cash3' ? sanitizedValue : individualForm.cash3;
              const pickFourValue = field === 'pickFour' ? sanitizedValue : individualForm.pickFour;
              const calculated = calculateUsaFields(cash3Value, pickFourValue);
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
      actions.setSaving(row.drawId, true);
      try {
        // All draws use standard storage: winningNumber = num1+num2+num3, additionalNumber = cash3+play4+pick5
        const winningNumber = row.num1 + row.num2 + row.num3;
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

        actions.markSaved(row.drawId, savedResult?.resultId || row.resultId || 0);
      } catch (err) {
        console.error('Error saving result:', err);
        actions.setError(`Error al guardar resultado para ${row.drawName}`);
        actions.setSaving(row.drawId, false);
      }
    }
    actions.setSuccess(`${dirtyRows.length} resultados publicados`);
  }, [computed.dirtyRows, selectedDate, actions]);

  const handlePublishIndividual = useCallback(async () => {
    if (!individualForm.selectedDrawId) {
      actions.setError('Seleccione un sorteo');
      return;
    }

    actions.setSavingIndividual(true);
    try {
      const row = drawResults.find((d) => d.drawId === individualForm.selectedDrawId);
      if (!row) return;

      // All draws use standard storage: winningNumber = num1+num2+num3, additionalNumber = cash3+play4+pick5
      const winningNumber = individualForm.num1 + individualForm.num2 + individualForm.num3;
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

      // Super Palé auto-calc: propagate source draw's 1ra to target Super Palé draw
      const publishedDraw = updatedResults.find(r => r.drawId === individualForm.selectedDrawId);
      if (publishedDraw) {
        const target = getSuperPaleTarget(publishedDraw.drawName);
        if (target) {
          const targetIdx = updatedResults.findIndex(
            r => r.drawName.toUpperCase().trim().includes(target.targetDraw)
          );
          if (targetIdx !== -1 && !updatedResults[targetIdx].hasResult) {
            updatedResults[targetIdx] = {
              ...updatedResults[targetIdx],
              [target.targetField]: publishedDraw.num1,
              isDirty: true,
            };
          }
        }

        // 6x1 auto-calc: propagate source draw's cash3/play4 to target 6x1 draw
        const target6x1 = get6x1Target(publishedDraw.drawName);
        if (target6x1) {
          const targetIdx = updatedResults.findIndex(
            r => r.drawName.toUpperCase().trim().includes(target6x1.targetDraw)
          );
          if (targetIdx !== -1 && !updatedResults[targetIdx].hasResult) {
            updatedResults[targetIdx] = {
              ...updatedResults[targetIdx],
              cash3: publishedDraw.cash3,
              play4: publishedDraw.play4,
              isDirty: true,
            };
          }
        }
      }

      actions.setDrawResults(updatedResults);
      actions.setSuccess(`Resultado publicado para ${row.drawName}`);

      const currentIndex = drawResults.findIndex((d) => d.drawId === individualForm.selectedDrawId);
      const nextPendingDraw = drawResults.find((d, index) => index > currentIndex && !d.hasResult);

      if (nextPendingDraw) {
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

  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    actions.setTab(newValue);
  }, [actions]);

  const handleDateChange = useCallback((value: string) => {
    actions.setDate(value);
  }, [actions]);

  const handleCloseSnackbar = useCallback(() => {
    actions.clearMessages();
  }, [actions]);

  const handleDrawSelect = useCallback((drawId: number) => {
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
  }, [drawResults, actions]);

  const handleEditRow = useCallback((row: DrawResultRow) => {
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
  }, [actions]);

  const handleViewDetails = useCallback((row: DrawResultRow) => {
    setViewDetailsRow(row);
  }, []);

  const handleCloseViewDetails = useCallback(() => {
    setViewDetailsRow(null);
  }, []);

  const handleDeleteRow = useCallback(async (row: DrawResultRow) => {
    if (!row.resultId) {
      actions.setError('Este sorteo no tiene resultado para borrar');
      return;
    }

    if (!window.confirm(`¿Está seguro de borrar el resultado de ${row.drawName}?`)) {
      return;
    }

    try {
      await deleteResult(row.resultId);
      const updatedResults = drawResults.map((r) => {
        if (r.drawId !== row.drawId) return r;
        return {
          ...r,
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
        };
      });
      actions.setDrawResults(updatedResults);
      actions.setSuccess(`Resultado borrado para ${row.drawName}`);
    } catch (err) {
      console.error('Error deleting result:', err);
      actions.setError('Error al borrar resultado');
    }
  }, [drawResults, actions]);

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
              {/* Individual Result Entry Form */}
              <IndividualResultForm
                selectedDate={selectedDate}
                drawResults={drawResults}
                form={individualForm}
                saving={savingIndividual}
                onDateChange={handleDateChange}
                onDrawSelect={handleDrawSelect}
                onFieldChange={handleIndividualFormChange}
                onPublish={handlePublishIndividual}
              />

              {/* Results Table Section */}
              <ResultsTableSection
                selectedDate={selectedDate}
                filteredDrawResults={filteredDrawResults}
                enabledFieldsMap={enabledFieldsMap}
                loading={loading}
                drawFilter={drawFilter}
                statusFilter={statusFilter}
                filterCounts={filterCounts}
                totalCount={computed.totalCount}
                withResultsCount={computed.withResultsCount}
                pendingCount={computed.pendingCount}
                lastRefresh={lastRefresh}
                onDrawFilterChange={setDrawFilter}
                onStatusFilterChange={setStatusFilter}
                onFieldChange={handleFieldChange}
                onPublishAll={handlePublishAll}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteRow}
                onEdit={handleEditRow}
              />
            </>
          )}

          {activeTab === 1 && (
            <ResultsLogsTab
              logsData={logsData}
              logsFilterDate={logsFilterDate}
              onFilterDateChange={(date) => actions.setLogsFilterDate(date)}
            />
          )}
        </Box>
      </Paper>

      {/* View Details Dialog */}
      <ViewDetailsDialog
        row={viewDetailsRow}
        open={!!viewDetailsRow}
        onClose={handleCloseViewDetails}
      />
    </Box>
  );
};

export default Results;
