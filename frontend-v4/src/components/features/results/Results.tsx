/**
 * Results Module
 *
 * Refactored component using modular architecture for better maintainability.
 * - State management via useResultsState hook (useReducer)
 * - Types centralized in ./types
 * - Constants centralized in ./constants
 * - Utility functions in ./utils
 */

import React, { useCallback, useEffect, useRef, type SyntheticEvent, type ChangeEvent } from 'react';
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
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Chip,
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
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  CompareArrows as CompareIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  getResults,
  getResultLogs,
  getDrawsForResults,
  createResult,
  updateResult,
  deleteResult,
  fetchExternalResults,
  type ResultDto,
} from '@services/resultsService';

// Internal module imports
import { useResultsState } from './hooks';
import type { DrawResultRow, IndividualResultForm, EnabledFields } from './types';
import {
  EMPTY_INDIVIDUAL_FORM,
  AUTO_REFRESH_INTERVAL,
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
} from './utils';

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
    fetchingExternal,
    comparing,
    savingIndividual,
    error,
    successMessage,
    autoRefreshEnabled,
    lastRefresh,
    showCompareDialog,
  } = state;

  // Refs for individual form inputs (for auto-advance)
  const individualFormRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
          bolita1: '',
          bolita2: '',
          singulaccion1: '',
          singulaccion2: '',
          singulaccion3: '',
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

  // Load data on mount and when date changes
  useEffect(() => {
    loadData();
    actions.setLastRefresh(new Date());
  }, [loadData, actions]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(async () => {
      console.log('[Auto-refresh] Refreshing results data...');
      await loadData();
      actions.setLastRefresh(new Date());
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, loadData, actions]);

  // Load logs when tab changes
  useEffect(() => {
    const loadLogs = async () => {
      if (activeTab !== 1) return;
      try {
        const logs = await getResultLogs(logsFilterDate || undefined);
        actions.setLogs(logs);
      } catch (err) {
        console.error('Error loading logs:', err);
      }
    };
    loadLogs();
  }, [activeTab, logsFilterDate, actions]);

  // ---------------------------------------------------------------------------
  // Field Change Handlers
  // ---------------------------------------------------------------------------

  const handleFieldChange = useCallback(
    (drawId: number, field: string, value: string, inputElement?: HTMLInputElement) => {
      const sanitizedValue = sanitizeNumberInput(value);
      const maxLength = getMaxLength(field);

      actions.updateField(drawId, field, sanitizedValue);

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
    [actions]
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
        const data = { drawId: row.drawId, winningNumber, resultDate: selectedDate };

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
  // External Results Handlers
  // ---------------------------------------------------------------------------

  const handleFetchExternal = useCallback(async () => {
    actions.setFetchingExternal(true);
    actions.setError(null);
    try {
      const response = await fetchExternalResults(selectedDate);
      if (response) {
        actions.setSuccess(
          `Obtenidos ${response.resultsFetched} resultados, guardados ${response.resultsSaved}`
        );
        await loadData();
      }
    } catch (err) {
      console.error('Error fetching external results:', err);
      actions.setError('Error al obtener resultados externos');
    } finally {
      actions.setFetchingExternal(false);
    }
  }, [selectedDate, loadData, actions]);

  const handleCompareResults = useCallback(async () => {
    actions.setComparing(true);
    actions.setError(null);
    try {
      const response = await fetchExternalResults(selectedDate);
      if (response && response.results) {
        actions.setExternalResults(response.results);

        const comparedResults = drawResults.map((row) => {
          const external = response.results.find(
            (ext) =>
              ext.lotteryName.toUpperCase().includes(row.drawName.toUpperCase()) ||
              row.drawName.toUpperCase().includes(ext.lotteryName.toUpperCase())
          );

          if (!external) return { ...row, hasExternalResult: false };

          const extNum1 = external.numbers[0] || '';
          const extNum2 = external.numbers[1] || '';
          const extNum3 = external.numbers[2] || '';
          const matches = row.num1 === extNum1 && row.num2 === extNum2 && row.num3 === extNum3;

          return {
            ...row,
            externalNum1: extNum1,
            externalNum2: extNum2,
            externalNum3: extNum3,
            hasExternalResult: true,
            matchesExternal: matches,
          };
        });

        actions.setExternalComparison(comparedResults);
        actions.setShowCompareDialog(true);
      }
    } catch (err) {
      console.error('Error comparing results:', err);
      actions.setError('Error al comparar resultados');
    } finally {
      actions.setComparing(false);
    }
  }, [selectedDate, drawResults, actions]);

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
      const data = { drawId: individualForm.selectedDrawId, winningNumber, resultDate: selectedDate };

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
          hasResult: true,
          isDirty: false,
        };
      });
      actions.setDrawResults(updatedResults);
      actions.setSuccess(`Resultado publicado para ${row.drawName}`);
      actions.resetIndividualForm();
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

  // ---------------------------------------------------------------------------
  // Render Helpers
  // ---------------------------------------------------------------------------

  const renderNumberInputCell = (
    row: DrawResultRow,
    field: 'num1' | 'num2' | 'num3' | 'cash3' | 'play4' | 'pick5',
    enabledFields: EnabledFields
  ) => {
    const value = row[field];
    const enabled = enabledFields[field];
    const hasValue = Boolean(value);
    const maxLength = getMaxLength(field);
    const width = getFieldWidth(field);

    return (
      <TableCell
        align="center"
        sx={{
          p: 0.5,
          bgcolor: hasValue ? COLORS.cellWithValue : COLORS.cellEmpty,
          borderRight: `1px solid ${COLORS.border}`,
        }}
      >
        {enabled ? (
          <TextField
            value={value}
            onChange={(e) =>
              handleFieldChange(row.drawId, field, e.target.value, e.target as HTMLInputElement)
            }
            disabled={row.isSaving}
            size="small"
            inputProps={{
              maxLength,
              style: {
                textAlign: 'center',
                padding: '4px 6px',
                fontWeight: 700,
                fontSize: '13px',
                color: '#333',
              },
            }}
            sx={{
              width,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'transparent',
                '& fieldset': { border: '1px solid #ddd' },
                '&:hover fieldset': { border: '1px solid #bbb' },
                '&.Mui-focused fieldset': { border: `1px solid ${COLORS.primary}` },
              },
            }}
          />
        ) : (
          <Typography variant="body2" sx={{ color: COLORS.textDisabled, fontSize: '12px' }}>
            -
          </Typography>
        )}
      </TableCell>
    );
  };

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
                        displayEmpty
                        sx={{ bgcolor: '#fff' }}
                      >
                        <MenuItem value="" disabled>
                          Seleccione
                        </MenuItem>
                        {drawResults
                          .filter((draw) => !draw.hasResult)
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

                    const primaryFields = [
                      { field: 'num1' as const, label: '1ra', maxLen: 2, enabled: enabledFields.num1 },
                      { field: 'num2' as const, label: '2da', maxLen: 2, enabled: enabledFields.num2 },
                      { field: 'num3' as const, label: '3ra', maxLen: 2, enabled: enabledFields.num3 },
                      { field: 'cash3' as const, label: 'Cash 3', maxLen: 3, enabled: enabledFields.cash3 },
                      { field: 'pickFour' as const, label: 'Pick Four', maxLen: 4, enabled: enabledFields.play4 },
                      { field: 'bolita1' as const, label: 'Bolita 1', maxLen: 2, enabled: enabledFields.bolita1 },
                      { field: 'bolita2' as const, label: 'Bolita 2', maxLen: 2, enabled: enabledFields.bolita2 },
                      { field: 'singulaccion1' as const, label: 'Sing. 1', maxLen: 2, enabled: enabledFields.singulaccion1 },
                      { field: 'singulaccion2' as const, label: 'Sing. 2', maxLen: 2, enabled: enabledFields.singulaccion2 },
                      { field: 'singulaccion3' as const, label: 'Sing. 3', maxLen: 2, enabled: enabledFields.singulaccion3 },
                    ].filter((f) => f.enabled);

                    const enabledFieldsList = primaryFields.map((f) => f.field);

                    return (
                      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                        {/* Header row */}
                        <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                          <Box sx={{ width: 140, p: 1, borderRight: '1px solid #ddd' }}></Box>
                          {primaryFields.map((f, idx) => (
                            <Box
                              key={f.field}
                              sx={{
                                flex: 1,
                                p: 1,
                                textAlign: 'center',
                                borderRight: idx < primaryFields.length - 1 ? '1px solid #ddd' : 'none',
                                fontSize: '12px',
                                color: '#666',
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
                          {primaryFields.map((f, idx) => (
                            <Box
                              key={f.field}
                              sx={{
                                flex: 1,
                                p: 0.5,
                                borderRight: idx < primaryFields.length - 1 ? '1px solid #ddd' : 'none',
                              }}
                            >
                              <TextField
                                value={individualForm[f.field]}
                                onChange={(e) =>
                                  handleIndividualFormChange(f.field, e.target.value, enabledFieldsList)
                                }
                                inputRef={(el) => {
                                  individualFormRefs.current[f.field] = el;
                                }}
                                size="small"
                                inputProps={{
                                  maxLength: f.maxLen,
                                  style: { textAlign: 'center', padding: '8px' },
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
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

              {/* Action Bar */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={
                    fetchingExternal ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <CloudDownloadIcon />
                    )
                  }
                  onClick={handleFetchExternal}
                  disabled={fetchingExternal}
                  sx={{
                    bgcolor: COLORS.success,
                    '&:hover': { bgcolor: '#45a049' },
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {fetchingExternal ? 'Obteniendo...' : 'Obtener resultados externos'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    comparing ? <CircularProgress size={16} color="inherit" /> : <CompareIcon />
                  }
                  onClick={handleCompareResults}
                  disabled={comparing}
                  sx={{
                    bgcolor: '#2196f3',
                    '&:hover': { bgcolor: '#1976d2' },
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {comparing ? 'Comparando...' : 'Comparar con externos'}
                </Button>
                <IconButton onClick={loadData} sx={{ bgcolor: '#e0e0e0' }}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Results Table Section */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.primary }}>
                  Resultados {selectedDate}
                </Typography>

                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
                      fontSize: '13px',
                      px: 3,
                      py: 1.5,
                      borderRadius: 6,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      color: '#fff',
                    }}
                  >
                    PUBLICAR
                    <br />
                    RESULTADOS
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<LockIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      background: '#f5d623 !important',
                      '&:hover': { background: '#e6c700 !important' },
                      textTransform: 'none',
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
                            Cash 3
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 65, fontSize: '13px', color: '#555' }}>
                            Play 4
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 75, fontSize: '13px', color: '#555' }}>
                            Pick five
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 70, fontSize: '13px', color: '#555' }}>
                            Detalles
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: COLORS.headerBg, minWidth: 60 }}></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {drawResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              No hay sorteos configurados
                            </TableCell>
                          </TableRow>
                        ) : (
                          drawResults.map((row) => {
                            const enabledFields = getEnabledFields(row.drawName);
                            return (
                              <TableRow key={row.drawId} hover sx={{ '&:hover': { bgcolor: COLORS.rowHover } }}>
                                {/* Draw name */}
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    fontSize: '12px',
                                    bgcolor: COLORS.headerBg,
                                    color: '#333',
                                    borderRight: `1px solid ${COLORS.border}`,
                                  }}
                                >
                                  {row.drawName}
                                  {row.matchesExternal === false && (
                                    <Tooltip title="No coincide con externo">
                                      <WarningIcon
                                        sx={{ ml: 1, fontSize: 14, color: COLORS.warning, verticalAlign: 'middle' }}
                                      />
                                    </Tooltip>
                                  )}
                                </TableCell>

                                {/* Number input cells */}
                                {renderNumberInputCell(row, 'num1', enabledFields)}
                                {renderNumberInputCell(row, 'num2', enabledFields)}
                                {renderNumberInputCell(row, 'num3', enabledFields)}
                                {renderNumberInputCell(row, 'cash3', enabledFields)}
                                {renderNumberInputCell(row, 'play4', enabledFields)}
                                {renderNumberInputCell(row, 'pick5', enabledFields)}

                                {/* Save button */}
                                <TableCell align="center" sx={{ p: 0.5 }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleSaveResult(row.drawId)}
                                    disabled={!row.isDirty || row.isSaving}
                                    sx={{
                                      bgcolor: COLORS.primary,
                                      '&:hover': { bgcolor: COLORS.primaryHover },
                                      '&.Mui-disabled': { bgcolor: '#b0e0e6', color: '#fff' },
                                      textTransform: 'none',
                                      minWidth: 40,
                                      fontWeight: 500,
                                      fontSize: '11px',
                                      py: 0.3,
                                      px: 1,
                                    }}
                                  >
                                    {row.isSaving ? <CircularProgress size={12} color="inherit" /> : 'ver'}
                                  </Button>
                                </TableCell>

                                {/* Edit button */}
                                <TableCell align="center" sx={{ p: 0.5 }}>
                                  <Tooltip title="Editar">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditRow(row)}
                                      sx={{ color: COLORS.primary }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      icon={
                        autoRefreshEnabled ? (
                          <RefreshIcon
                            sx={{
                              animation: 'spin 2s linear infinite',
                              '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                              },
                            }}
                          />
                        ) : undefined
                      }
                      label={`Auto-refresh: ${autoRefreshEnabled ? 'ON (60s)' : 'OFF'}`}
                      onClick={actions.toggleAutoRefresh}
                      color={autoRefreshEnabled ? 'success' : 'default'}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Última: {lastRefresh.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                Logs de resultados
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Fecha"
                  type="date"
                  value={logsFilterDate}
                  onChange={handleLogsFilterDateChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Sorteo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha de resultado</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha de registro</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Números</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                          No hay entradas disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      logsData.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>{log.drawName}</TableCell>
                          <TableCell>{log.username}</TableCell>
                          <TableCell>{new Date(log.resultDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>{log.winningNumbers}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Mostrando {logsData.length} de {logsData.length} entradas
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* Comparison Dialog */}
      <Dialog open={showCompareDialog} onClose={() => actions.setShowCompareDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Comparación con Resultados Externos</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sorteo</TableCell>
                  <TableCell align="center">Local</TableCell>
                  <TableCell align="center">Externo</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drawResults
                  .filter((r) => r.hasExternalResult)
                  .map((row) => (
                    <TableRow key={row.drawId}>
                      <TableCell>{row.drawName}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.num1}-{row.num2}-{row.num3}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.externalNum1}-{row.externalNum2}-{row.externalNum3}
                      </TableCell>
                      <TableCell align="center">
                        {row.matchesExternal ? (
                          <Chip label="Coincide" size="small" color="success" icon={<CheckIcon />} />
                        ) : (
                          <Chip label="No coincide" size="small" color="error" icon={<WarningIcon />} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => actions.setShowCompareDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Results;
