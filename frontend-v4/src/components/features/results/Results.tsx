import React, { useState, useCallback, useEffect, useRef, type SyntheticEvent, type ChangeEvent } from 'react';
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
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Upload as UploadIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  CompareArrows as CompareIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
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
  type ResultLogDto,
  type DrawForResults,
  type ExternalResultDto,
} from '@services/resultsService';
import { getDrawCategory } from '@services/betTypeCompatibilityService';

// Interface for merged draw + result data
interface DrawResultRow {
  drawId: number;
  drawName: string;
  abbreviation: string;
  color?: string; // Draw color for table display
  resultId: number | null;
  num1: string;
  num2: string;
  num3: string;
  cash3: string;
  play4: string;
  pick5: string;
  bolita1: string;
  bolita2: string;
  singulaccion1: string;
  singulaccion2: string;
  singulaccion3: string;
  hasResult: boolean;
  isDirty: boolean;
  isSaving: boolean;
  // For comparison with external results
  externalNum1?: string;
  externalNum2?: string;
  externalNum3?: string;
  externalCash3?: string;
  externalPlay4?: string;
  externalPick5?: string;
  hasExternalResult?: boolean;
  matchesExternal?: boolean;
}

// Interface for individual result form
interface IndividualResultForm {
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

// No longer filtering by hardcoded list - API already filters draws by:
// 1. Active draws only
// 2. Draws scheduled for the selected day of week
// 3. For today: only draws whose time has already passed (so results can be entered)

// Validate that a lottery number is valid (2 digits, 00-99)
const isValidLotteryNumber = (value: string): boolean => {
  if (!value) return true; // Empty is valid (means not filled yet)
  return /^\d{2}$/.test(value);
};

// Validate that winningNumber doesn't look like a date pattern
const hasDateLikePattern = (winningNumber: string): boolean => {
  // Check for YYYYMM patterns like "202512" (2025-12)
  if (/^202[45]\d{2}$/.test(winningNumber)) return true;
  // Check for MMYYYY patterns
  if (/^\d{2}202[45]$/.test(winningNumber)) return true;
  // Check for YYYYMMDD patterns
  if (/^202[45](0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(winningNumber)) return true;
  return false;
};

// Validate a result row before saving
const validateResultRow = (row: DrawResultRow): { valid: boolean; error: string | null } => {
  // Check individual numbers are valid 2-digit format
  if (row.num1 && !isValidLotteryNumber(row.num1)) {
    return { valid: false, error: `"${row.num1}" no es un número válido (debe ser 2 dígitos, ej: 07)` };
  }
  if (row.num2 && !isValidLotteryNumber(row.num2)) {
    return { valid: false, error: `"${row.num2}" no es un número válido (debe ser 2 dígitos, ej: 47)` };
  }
  if (row.num3 && !isValidLotteryNumber(row.num3)) {
    return { valid: false, error: `"${row.num3}" no es un número válido (debe ser 2 dígitos, ej: 25)` };
  }

  // Build combined number and check for date patterns
  const combined = row.num1 + row.num2 + row.num3;
  if (combined && hasDateLikePattern(combined)) {
    return {
      valid: false,
      error: `El resultado "${combined}" parece una fecha (YYYYMM). Verifique los números.`,
    };
  }

  return { valid: true, error: null };
};

// Field configuration type for draw categories
interface EnabledFields {
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

// Determine which fields are enabled based on draw category
// Uses betTypeCompatibilityService for consistent categorization across the app
const getEnabledFields = (drawName: string): EnabledFields => {
  const category = getDrawCategory(drawName);

  // Default all fields disabled
  const allDisabled: EnabledFields = {
    num1: false, num2: false, num3: false,
    cash3: false, play4: false, pick5: false,
    bolita1: false, bolita2: false,
    singulaccion1: false, singulaccion2: false, singulaccion3: false
  };

  switch (category) {
    case 'DOMINICAN':
    case 'ANGUILA':
    case 'PANAMA':
      // Dominican, Anguila and Panama lotteries - only num1, num2, num3 (used for Directo, Palé, Tripleta)
      return { ...allDisabled, num1: true, num2: true, num3: true };

    case 'USA':
      // USA lotteries (TEXAS, etc.) - Full set: 1ra, 2da, 3ra, Cash 3, Pick Four, bolita 1, bolita 2, Singulaccion 1-3
      // Note: Pick five is NOT used for Texas
      return {
        ...allDisabled,
        num1: true, num2: true, num3: true,
        cash3: true, play4: true, pick5: false,
        bolita1: true, bolita2: true,
        singulaccion1: true, singulaccion2: true, singulaccion3: true
      };

    case 'SUPER_PALE':
      // Super Pale - uses num1/num2 for the paired numbers
      return { ...allDisabled, num1: true, num2: true };

    case 'GENERAL':
    default:
      // Unknown category - show all fields and let user decide
      return {
        num1: true, num2: true, num3: true,
        cash3: true, play4: true, pick5: true,
        bolita1: true, bolita2: true,
        singulaccion1: true, singulaccion2: true, singulaccion3: true
      };
  }
};

// Initial empty form state
const emptyIndividualForm: IndividualResultForm = {
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

const Results = (): React.ReactElement => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [logsFilterDate, setLogsFilterDate] = useState<string>('');

  // Data states
  const [drawResults, setDrawResults] = useState<DrawResultRow[]>([]);
  const [logsData, setLogsData] = useState<ResultLogDto[]>([]);
  const [externalResults, setExternalResults] = useState<ExternalResultDto[]>([]);

  // Individual result form state
  const [individualForm, setIndividualForm] = useState<IndividualResultForm>(emptyIndividualForm);
  const [savingIndividual, setSavingIndividual] = useState<boolean>(false);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingExternal, setFetchingExternal] = useState<boolean>(false);
  const [comparing, setComparing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Comparison dialog
  const [showCompareDialog, setShowCompareDialog] = useState<boolean>(false);

  // Auto-refresh state (refresh every 60 seconds by default)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [autoRefreshInterval] = useState<number>(60000); // 60 seconds
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load all draws and results
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load draws (filtered by day of week) and results in parallel
      const [drawsList, resultsList] = await Promise.all([
        getDrawsForResults(selectedDate),
        getResults(selectedDate),
      ]);

      // Create a map of results by drawId
      const resultsMap = new Map<number, ResultDto>();
      resultsList.forEach((r) => {
        resultsMap.set(r.drawId, r);
      });

      // Merge draws with results
      // API already filters:
      // - Active draws only
      // - Draws scheduled for selected day of week
      // - For today: draws whose time has already passed
      const mergedData: DrawResultRow[] = drawsList.map((draw) => {
        const result = resultsMap.get(draw.drawId);
        // Use API color property, fallback to default turquoise
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

      // Sort by draw name for consistent display
      // API already returns draws sorted by DrawTime
      setDrawResults(mergedData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Load data on mount and when date changes
  useEffect(() => {
    loadData();
    setLastRefresh(new Date());
  }, [loadData]);

  // Auto-refresh every X seconds when enabled
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(async () => {
      console.log('[Auto-refresh] Refreshing results data...');
      await loadData();
      setLastRefresh(new Date());
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, autoRefreshInterval, loadData]);

  // Load logs when tab changes
  useEffect(() => {
    const loadLogs = async () => {
      if (activeTab !== 1) return;
      try {
        const logs = await getResultLogs(logsFilterDate || undefined);
        setLogsData(logs);
      } catch (err) {
        console.error('Error loading logs:', err);
      }
    };
    loadLogs();
  }, [activeTab, logsFilterDate]);

  // Field order for auto-advance navigation
  const fieldOrder = ['num1', 'num2', 'num3', 'cash3', 'play4', 'pick5'];

  // Get max length for each field
  const getMaxLength = (field: string): number => {
    switch (field) {
      case 'num1':
      case 'num2':
      case 'num3':
        return 2;
      case 'cash3':
        return 3;
      case 'play4':
        return 4;
      case 'pick5':
        return 5;
      default:
        return 2;
    }
  };

  // Handle field change with input sanitization and auto-advance
  const handleFieldChange = useCallback((drawId: number, field: string, value: string, inputElement?: HTMLInputElement) => {
    // Only allow digits
    const sanitizedValue = value.replace(/\D/g, '');
    const maxLength = getMaxLength(field);

    setDrawResults((prev) =>
      prev.map((row) => {
        if (row.drawId !== drawId) return row;
        return {
          ...row,
          [field]: sanitizedValue,
          isDirty: true,
        };
      })
    );

    // Auto-advance to next input when field is complete
    if (sanitizedValue.length >= maxLength && inputElement) {
      const currentFieldIndex = fieldOrder.indexOf(field);
      if (currentFieldIndex !== -1 && currentFieldIndex < fieldOrder.length - 1) {
        // Find the next input in the same row
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
  }, []);

  // Save a single result
  const handleSaveResult = useCallback(async (drawId: number) => {
    const row = drawResults.find((r) => r.drawId === drawId);
    if (!row) return;

    // Validate before saving
    const validation = validateResultRow(row);
    if (!validation.valid) {
      setError(`Error en ${row.drawName}: ${validation.error}`);
      return;
    }

    // Mark as saving
    setDrawResults((prev) =>
      prev.map((r) => (r.drawId === drawId ? { ...r, isSaving: true } : r))
    );

    try {
      // Build winning number from fields
      const winningNumber = row.num1 + row.num2 + row.num3;

      const data = {
        drawId: row.drawId,
        winningNumber,
        resultDate: selectedDate,
      };

      let savedResult: ResultDto | null;
      if (row.resultId) {
        savedResult = await updateResult(row.resultId, data);
      } else {
        savedResult = await createResult(data);
      }

      // Update local state
      setDrawResults((prev) =>
        prev.map((r) => {
          if (r.drawId !== drawId) return r;
          return {
            ...r,
            resultId: savedResult?.resultId || r.resultId,
            hasResult: true,
            isDirty: false,
            isSaving: false,
          };
        })
      );

      setSuccessMessage(`Resultado guardado para ${row.drawName}`);
    } catch (err) {
      console.error('Error saving result:', err);
      setError(`Error al guardar resultado para ${row.drawName}`);
      setDrawResults((prev) =>
        prev.map((r) => (r.drawId === drawId ? { ...r, isSaving: false } : r))
      );
    }
  }, [drawResults, selectedDate]);

  // Delete a result
  const handleDeleteResult = useCallback(async (drawId: number) => {
    const row = drawResults.find((r) => r.drawId === drawId);
    if (!row || !row.resultId) return;

    if (!window.confirm(`¿Eliminar resultado de ${row.drawName}?`)) return;

    try {
      await deleteResult(row.resultId);
      setDrawResults((prev) =>
        prev.map((r) => {
          if (r.drawId !== drawId) return r;
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
        })
      );
      setSuccessMessage(`Resultado eliminado para ${row.drawName}`);
    } catch (err) {
      console.error('Error deleting result:', err);
      setError('Error al eliminar resultado');
    }
  }, [drawResults]);

  // Fetch external results
  const handleFetchExternal = useCallback(async () => {
    setFetchingExternal(true);
    setError(null);
    try {
      const response = await fetchExternalResults(selectedDate);
      if (response) {
        setSuccessMessage(
          `Obtenidos ${response.resultsFetched} resultados, guardados ${response.resultsSaved}`
        );
        // Reload data to show new results
        await loadData();
      }
    } catch (err) {
      console.error('Error fetching external results:', err);
      setError('Error al obtener resultados externos');
    } finally {
      setFetchingExternal(false);
    }
  }, [selectedDate, loadData]);

  // Compare with external results
  const handleCompareResults = useCallback(async () => {
    setComparing(true);
    setError(null);
    try {
      const response = await fetchExternalResults(selectedDate);
      if (response && response.results) {
        setExternalResults(response.results);

        // Match external results with local draws
        setDrawResults((prev) =>
          prev.map((row) => {
            // Find matching external result
            const external = response.results.find(
              (ext) => ext.lotteryName.toUpperCase().includes(row.drawName.toUpperCase()) ||
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
          })
        );

        setShowCompareDialog(true);
      }
    } catch (err) {
      console.error('Error comparing results:', err);
      setError('Error al comparar resultados');
    } finally {
      setComparing(false);
    }
  }, [selectedDate]);

  // Publish all pending results
  const handlePublishAll = useCallback(async () => {
    const dirtyRows = drawResults.filter((r) => r.isDirty && (r.num1 || r.cash3));
    if (dirtyRows.length === 0) {
      setError('No hay resultados pendientes de guardar');
      return;
    }

    // Validate all rows before publishing
    const invalidRows = dirtyRows
      .map((row) => ({ row, validation: validateResultRow(row) }))
      .filter((item) => !item.validation.valid);

    if (invalidRows.length > 0) {
      const errorMessages = invalidRows
        .map((item) => `${item.row.drawName}: ${item.validation.error}`)
        .join('\n');
      setError(`No se puede publicar. Errores encontrados:\n${errorMessages}`);
      return;
    }

    for (const row of dirtyRows) {
      await handleSaveResult(row.drawId);
    }
    setSuccessMessage(`${dirtyRows.length} resultados publicados`);
  }, [drawResults, handleSaveResult]);

  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  const handleLogsFilterDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLogsFilterDate(e.target.value);
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Handle individual form draw selection
  const handleDrawSelect = useCallback((event: SelectChangeEvent<number>) => {
    const drawId = event.target.value as number;
    const selectedDraw = drawResults.find(d => d.drawId === drawId);
    if (selectedDraw) {
      setIndividualForm({
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
  }, [drawResults]);

  // Refs for individual form inputs (for auto-advance)
  const individualFormRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Individual form field order for auto-advance
  const individualFieldOrder = ['num1', 'num2', 'num3', 'cash3', 'pickFour', 'bolita1', 'bolita2', 'singulaccion1', 'singulaccion2', 'singulaccion3'];

  // Get max length for individual form fields
  const getIndividualMaxLength = (field: string): number => {
    switch (field) {
      case 'num1':
      case 'num2':
      case 'num3':
      case 'bolita1':
      case 'bolita2':
      case 'singulaccion1':
      case 'singulaccion2':
      case 'singulaccion3':
        return 2;
      case 'cash3':
        return 3;
      case 'pickFour':
        return 4;
      case 'pickFive':
        return 5;
      default:
        return 2;
    }
  };

  // Handle individual form field change with auto-advance
  const handleIndividualFormChange = useCallback((field: keyof IndividualResultForm, value: string, enabledFieldsList?: string[]) => {
    const sanitizedValue = value.replace(/\D/g, '');
    const maxLength = getIndividualMaxLength(field);

    setIndividualForm(prev => ({ ...prev, [field]: sanitizedValue }));

    // Auto-advance to next enabled field when current field is complete
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
  }, []);

  // Publish individual result
  const handlePublishIndividual = useCallback(async () => {
    if (!individualForm.selectedDrawId) {
      setError('Seleccione un sorteo');
      return;
    }

    setSavingIndividual(true);
    try {
      const row = drawResults.find(d => d.drawId === individualForm.selectedDrawId);
      if (!row) return;

      const winningNumber = individualForm.num1 + individualForm.num2 + individualForm.num3;
      const data = {
        drawId: individualForm.selectedDrawId,
        winningNumber,
        resultDate: selectedDate,
      };

      let savedResult;
      if (row.resultId) {
        savedResult = await updateResult(row.resultId, data);
      } else {
        savedResult = await createResult(data);
      }

      // Update local state
      setDrawResults(prev =>
        prev.map(r => {
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
        })
      );

      setSuccessMessage(`Resultado publicado para ${row.drawName}`);
      setIndividualForm(emptyIndividualForm);
    } catch (err) {
      console.error('Error publishing individual result:', err);
      setError('Error al publicar resultado');
    } finally {
      setSavingIndividual(false);
    }
  }, [individualForm, drawResults, selectedDate]);

  // Render a cell with input field
  const renderInputCell = (row: DrawResultRow, field: keyof DrawResultRow, enabled: boolean) => {
    const value = row[field] as string;
    const hasExternal = row.hasExternalResult && row[`external${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof DrawResultRow];
    const externalValue = row[`external${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof DrawResultRow] as string;
    const matches = value === externalValue;

    return (
      <TableCell
        align="center"
        sx={{
          p: 0.5,
          bgcolor: !enabled ? '#e0e0e0' : '#fff',
          position: 'relative',
        }}
      >
        <TextField
          value={value}
          onChange={(e) => handleFieldChange(row.drawId, field, e.target.value)}
          disabled={!enabled || row.isSaving}
          size="small"
          inputProps={{
            maxLength: field === 'pick5' ? 5 : field === 'play4' ? 4 : field === 'cash3' ? 3 : 2,
            style: {
              textAlign: 'center',
              padding: '4px 8px',
              fontWeight: 600,
              fontSize: '14px',
            },
          }}
          sx={{
            width: field === 'pick5' ? 70 : field === 'play4' ? 60 : 50,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: value ? '#4caf50' : '#ccc' },
            },
          }}
        />
        {hasExternal && !matches && (
          <Tooltip title={`Externo: ${externalValue}`}>
            <WarningIcon
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                fontSize: 14,
                color: '#ff9800',
              }}
            />
          </Tooltip>
        )}
      </TableCell>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="success">{successMessage}</Alert>
      </Snackbar>

      <Paper elevation={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { color: '#37b9f9', textTransform: 'none', fontWeight: 500 },
            '& .Mui-selected': { color: '#37b9f9' },
            '& .MuiTabs-indicator': { backgroundColor: '#37b9f9' },
          }}
        >
          <Tab label="Manejar resultados" />
          <Tab label="Logs de resultados" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <>
              <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
                Manejar resultados
              </Typography>

              {/* Individual Result Entry Form - Like Original App */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, border: '1px solid #ddd' }}>
                {/* Row 1: Fecha + Sorteo Dropdown */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>Fecha</Typography>
                    <TextField
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      size="small"
                      sx={{ width: 200, bgcolor: '#fff' }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>Sorteo</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={individualForm.selectedDrawId || ''}
                        onChange={handleDrawSelect}
                        displayEmpty
                        sx={{ bgcolor: '#fff' }}
                      >
                        <MenuItem value="" disabled>Seleccione</MenuItem>
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

                {/* Row 2: Selected Draw Name + Input Fields - Dynamic based on draw category */}
                {individualForm.selectedDrawId && (() => {
                  const selectedDraw = drawResults.find(d => d.drawId === individualForm.selectedDrawId);
                  const defaultEnabled: EnabledFields = {
                    num1: true, num2: true, num3: true,
                    cash3: true, play4: true, pick5: true,
                    bolita1: true, bolita2: true,
                    singulaccion1: true, singulaccion2: true, singulaccion3: true
                  };
                  const enabledFields = selectedDraw ? getEnabledFields(selectedDraw.drawName) : defaultEnabled;

                  // Build dynamic field list based on enabled fields
                  const primaryFields = [
                    { field: 'num1' as const, label: '1ra', maxLen: 2, enabled: enabledFields.num1 },
                    { field: 'num2' as const, label: '2da', maxLen: 2, enabled: enabledFields.num2 },
                    { field: 'num3' as const, label: '3ra', maxLen: 2, enabled: enabledFields.num3 },
                    { field: 'cash3' as const, label: 'Cash 3', maxLen: 3, enabled: enabledFields.cash3 },
                    { field: 'pickFour' as const, label: 'Pick Four', maxLen: 4, enabled: enabledFields.play4 },
                    { field: 'bolita1' as const, label: 'Bolita 1', maxLen: 2, enabled: enabledFields.bolita1 },
                    { field: 'bolita2' as const, label: 'Bolita 2', maxLen: 2, enabled: enabledFields.bolita2 },
                    { field: 'singulaccion1' as const, label: 'Singulaccion 1', maxLen: 2, enabled: enabledFields.singulaccion1 },
                    { field: 'singulaccion2' as const, label: 'Singulaccion 2', maxLen: 2, enabled: enabledFields.singulaccion2 },
                    { field: 'singulaccion3' as const, label: 'Singulaccion 3', maxLen: 2, enabled: enabledFields.singulaccion3 },
                  ].filter(f => f.enabled);

                  // Build list of enabled field names for auto-advance
                  const enabledFieldsList = primaryFields.map(f => f.field);

                  return (
                    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
                      {/* Header row with field names - only enabled fields */}
                      <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                        <Box sx={{ width: 140, p: 1, borderRight: '1px solid #ddd' }}></Box>
                        {primaryFields.map((f, idx) => (
                          <Box key={f.field} sx={{ flex: 1, p: 1, textAlign: 'center', borderRight: idx < primaryFields.length - 1 ? '1px solid #ddd' : 'none', fontSize: '12px', color: '#666' }}>
                            {f.label}
                          </Box>
                        ))}
                      </Box>
                      {/* Input row - only enabled fields with auto-advance */}
                      <Box sx={{ display: 'flex', bgcolor: '#fff' }}>
                        <Box sx={{ width: 140, p: 1, borderRight: '1px solid #ddd', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                          {selectedDraw?.drawName}
                        </Box>
                        {primaryFields.map((f, idx) => (
                          <Box key={f.field} sx={{ flex: 1, p: 0.5, borderRight: idx < primaryFields.length - 1 ? '1px solid #ddd' : 'none' }}>
                            <TextField
                              value={individualForm[f.field]}
                              onChange={(e) => handleIndividualFormChange(f.field, e.target.value, enabledFieldsList)}
                              inputRef={(el) => { individualFormRefs.current[f.field] = el; }}
                              size="small"
                              inputProps={{ maxLength: f.maxLen, style: { textAlign: 'center', padding: '8px' } }}
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
                    sx={{ bgcolor: '#37b9f9', '&:hover': { bgcolor: '#2da8e8' }, textTransform: 'uppercase', fontWeight: 600, px: 3, color: '#fff' }}
                  >
                    {savingIndividual ? <CircularProgress size={20} color="inherit" /> : 'PUBLICAR RESULTADO'}
                  </Button>
                </Box>
              </Paper>

              {/* Action Bar: External buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={fetchingExternal ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
                  onClick={handleFetchExternal}
                  disabled={fetchingExternal}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' }, textTransform: 'none', fontWeight: 600 }}
                >
                  {fetchingExternal ? 'Obteniendo...' : 'Obtener resultados externos'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={comparing ? <CircularProgress size={16} color="inherit" /> : <CompareIcon />}
                  onClick={handleCompareResults}
                  disabled={comparing}
                  sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' }, textTransform: 'none', fontWeight: 600 }}
                >
                  {comparing ? 'Comparando...' : 'Comparar con externos'}
                </Button>
                <IconButton onClick={loadData} sx={{ bgcolor: '#e0e0e0' }}>
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Results Table Section */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#37b9f9' }}>
                  Resultados {selectedDate}
                </Typography>

                {/* Action buttons - PUBLICAR RESULTADOS is violet gradient, DESBLOQUEAR is yellow */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={handlePublishAll}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
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
                    PUBLICAR<br />RESULTADOS
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
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 140, fontSize: '13px', color: '#555' }}>Sorteos</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 55, fontSize: '13px', color: '#555' }}>1ra</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 55, fontSize: '13px', color: '#555' }}>2da</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 55, fontSize: '13px', color: '#555' }}>3ra</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 65, fontSize: '13px', color: '#555' }}>Cash 3</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 65, fontSize: '13px', color: '#555' }}>Play 4</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 75, fontSize: '13px', color: '#555' }}>Pick five</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 70, fontSize: '13px', color: '#555' }}>Detalles</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5', minWidth: 60 }}></TableCell>
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
                              <TableRow key={row.drawId} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                {/* Draw name - simple styling like original app */}
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    fontSize: '12px',
                                    bgcolor: '#f5f5f5',
                                    color: '#333',
                                    borderRight: '1px solid #e0e0e0',
                                  }}
                                >
                                  {row.drawName}
                                  {row.matchesExternal === false && (
                                    <Tooltip title="No coincide con externo">
                                      <WarningIcon sx={{ ml: 1, fontSize: 14, color: '#ff9800', verticalAlign: 'middle' }} />
                                    </Tooltip>
                                  )}
                                </TableCell>
                                {/* 1ra - show input when enabled, show "-" when disabled */}
                                <TableCell align="center" sx={{ p: 0.5, bgcolor: row.num1 ? '#c5f0f0' : '#fff', borderRight: '1px solid #e0e0e0' }}>
                                  {enabledFields.num1 ? (
                                    <TextField
                                      value={row.num1}
                                      onChange={(e) => handleFieldChange(row.drawId, 'num1', e.target.value, e.target as HTMLInputElement)}
                                      disabled={row.isSaving}
                                      size="small"
                                      inputProps={{ maxLength: 2, style: { textAlign: 'center', padding: '4px 6px', fontWeight: 700, fontSize: '13px', color: '#333' } }}
                                      sx={{
                                        width: 40,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                          '& fieldset': { border: '1px solid #ddd' },
                                          '&:hover fieldset': { border: '1px solid #bbb' },
                                          '&.Mui-focused fieldset': { border: '1px solid #37b9f9' },
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#ccc', fontSize: '12px' }}>-</Typography>
                                  )}
                                </TableCell>
                                {/* 2da - show input when enabled, show "-" when disabled */}
                                <TableCell align="center" sx={{ p: 0.5, bgcolor: row.num2 ? '#c5f0f0' : '#fff', borderRight: '1px solid #e0e0e0' }}>
                                  {enabledFields.num2 ? (
                                    <TextField
                                      value={row.num2}
                                      onChange={(e) => handleFieldChange(row.drawId, 'num2', e.target.value, e.target as HTMLInputElement)}
                                      disabled={row.isSaving}
                                      size="small"
                                      inputProps={{ maxLength: 2, style: { textAlign: 'center', padding: '4px 6px', fontWeight: 700, fontSize: '13px', color: '#333' } }}
                                      sx={{
                                        width: 40,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                          '& fieldset': { border: '1px solid #ddd' },
                                          '&:hover fieldset': { border: '1px solid #bbb' },
                                          '&.Mui-focused fieldset': { border: '1px solid #37b9f9' },
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#ccc', fontSize: '12px' }}>-</Typography>
                                  )}
                                </TableCell>
                                {/* 3ra - show input when enabled, show "-" when disabled */}
                                <TableCell align="center" sx={{ p: 0.5, bgcolor: row.num3 ? '#c5f0f0' : '#fff', borderRight: '1px solid #e0e0e0' }}>
                                  {enabledFields.num3 ? (
                                    <TextField
                                      value={row.num3}
                                      onChange={(e) => handleFieldChange(row.drawId, 'num3', e.target.value, e.target as HTMLInputElement)}
                                      disabled={row.isSaving}
                                      size="small"
                                      inputProps={{ maxLength: 2, style: { textAlign: 'center', padding: '4px 6px', fontWeight: 700, fontSize: '13px', color: '#333' } }}
                                      sx={{
                                        width: 40,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                          '& fieldset': { border: '1px solid #ddd' },
                                          '&:hover fieldset': { border: '1px solid #bbb' },
                                          '&.Mui-focused fieldset': { border: '1px solid #37b9f9' },
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#ccc', fontSize: '12px' }}>-</Typography>
                                  )}
                                </TableCell>
                                {/* Cash 3 - green background when has value */}
                                <TableCell align="center" sx={{ p: 0.5, bgcolor: row.cash3 ? '#c5f0f0' : '#fff', borderRight: '1px solid #e0e0e0' }}>
                                  {enabledFields.cash3 ? (
                                    <TextField
                                      value={row.cash3}
                                      onChange={(e) => handleFieldChange(row.drawId, 'cash3', e.target.value, e.target as HTMLInputElement)}
                                      disabled={row.isSaving}
                                      size="small"
                                      inputProps={{ maxLength: 3, style: { textAlign: 'center', padding: '4px 6px', fontWeight: 700, fontSize: '13px', color: '#333' } }}
                                      sx={{
                                        width: 50,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                          '& fieldset': { border: '1px solid #ddd' },
                                          '&:hover fieldset': { border: '1px solid #bbb' },
                                          '&.Mui-focused fieldset': { border: '1px solid #37b9f9' },
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#ccc', fontSize: '12px' }}>-</Typography>
                                  )}
                                </TableCell>
                                {/* Play 4 - green background when has value */}
                                <TableCell align="center" sx={{ p: 0.5, bgcolor: row.play4 ? '#c5f0f0' : '#fff', borderRight: '1px solid #e0e0e0' }}>
                                  {enabledFields.play4 ? (
                                    <TextField
                                      value={row.play4}
                                      onChange={(e) => handleFieldChange(row.drawId, 'play4', e.target.value, e.target as HTMLInputElement)}
                                      disabled={row.isSaving}
                                      size="small"
                                      inputProps={{ maxLength: 4, style: { textAlign: 'center', padding: '4px 6px', fontWeight: 700, fontSize: '13px', color: '#333' } }}
                                      sx={{
                                        width: 55,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                          '& fieldset': { border: '1px solid #ddd' },
                                          '&:hover fieldset': { border: '1px solid #bbb' },
                                          '&.Mui-focused fieldset': { border: '1px solid #37b9f9' },
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#ccc', fontSize: '12px' }}>-</Typography>
                                  )}
                                </TableCell>
                                {/* Pick five - green background when has value */}
                                <TableCell align="center" sx={{ p: 0.5, bgcolor: row.pick5 ? '#c5f0f0' : '#fff', borderRight: '1px solid #e0e0e0' }}>
                                  {enabledFields.pick5 ? (
                                    <TextField
                                      value={row.pick5}
                                      onChange={(e) => handleFieldChange(row.drawId, 'pick5', e.target.value, e.target as HTMLInputElement)}
                                      disabled={row.isSaving}
                                      size="small"
                                      inputProps={{ maxLength: 5, style: { textAlign: 'center', padding: '4px 6px', fontWeight: 700, fontSize: '13px', color: '#333' } }}
                                      sx={{
                                        width: 60,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                          '& fieldset': { border: '1px solid #ddd' },
                                          '&:hover fieldset': { border: '1px solid #bbb' },
                                          '&.Mui-focused fieldset': { border: '1px solid #37b9f9' },
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#ccc', fontSize: '12px' }}>-</Typography>
                                  )}
                                </TableCell>
                                {/* Detalles column with turquoise Ver button like original */}
                                <TableCell align="center" sx={{ p: 0.5 }}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleSaveResult(row.drawId)}
                                    disabled={!row.isDirty || row.isSaving}
                                    sx={{
                                      bgcolor: '#37b9f9',
                                      '&:hover': { bgcolor: '#2da8e8' },
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
                                {/* Edit icon like original app (turquoise open-in-new style) */}
                                <TableCell align="center" sx={{ p: 0.5 }}>
                                  <Tooltip title="Editar">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setIndividualForm({
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
                                      }}
                                      sx={{ color: '#37b9f9' }}
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
                <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total: {drawResults.length} sorteos |{' '}
                    Con resultado: {drawResults.filter(r => r.hasResult).length} |{' '}
                    Pendientes: {drawResults.filter(r => r.isDirty).length}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      icon={autoRefreshEnabled ? <RefreshIcon sx={{ animation: 'spin 2s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} /> : undefined}
                      label={`Auto-refresh: ${autoRefreshEnabled ? 'ON (60s)' : 'OFF'}`}
                      onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
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
                          <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</TableCell>
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
      <Dialog open={showCompareDialog} onClose={() => setShowCompareDialog(false)} maxWidth="md" fullWidth>
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
                {drawResults.filter(r => r.hasExternalResult).map((row) => (
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
          <Button onClick={() => setShowCompareDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Results;
