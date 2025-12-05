import React, { useState, useCallback, useEffect, type SyntheticEvent, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Upload as UploadIcon,
  LockOpen as LockOpenIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import {
  getResults,
  getResultLogs,
  getDrawsForResults,
  createResult,
  deleteResult,
  fetchExternalResults,
  type ResultDto,
  type ResultLogDto,
  type DrawForResults,
} from '@services/resultsService';

interface ResultData {
  id: number;
  name: string;
  num1: string;
  num2: string;
  num3: string;
  cash3: string;
  play4: string;
  pick5: string;
}

const Results = (): React.ReactElement => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSorteo, setSelectedSorteo] = useState<string>('');
  const [selectedDrawId, setSelectedDrawId] = useState<number | null>(null);
  const [quickResult1, setQuickResult1] = useState<string>('');
  const [quickResult2, setQuickResult2] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [logsFilterDate, setLogsFilterDate] = useState<string>('');

  // API data states
  const [resultsData, setResultsData] = useState<ResultData[]>([]);
  const [logsData, setLogsData] = useState<ResultLogDto[]>([]);
  const [draws, setDraws] = useState<DrawForResults[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingExternal, setFetchingExternal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load draws on mount
  useEffect(() => {
    const loadDraws = async () => {
      try {
        const drawsList = await getDrawsForResults();
        setDraws(drawsList);
      } catch (err) {
        console.error('Error loading draws:', err);
      }
    };
    loadDraws();
  }, []);

  // Load results when date changes
  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiResults = await getResults(selectedDate);
        // Transform API results to component format
        const transformedResults: ResultData[] = apiResults.map((r: ResultDto) => ({
          id: r.drawId,
          name: r.drawName,
          num1: r.num1 || '',
          num2: r.num2 || '',
          num3: r.num3 || '',
          cash3: r.cash3 || '',
          play4: r.play4 || '',
          pick5: r.pick5 || '',
        }));
        setResultsData(transformedResults);
      } catch (err) {
        console.error('Error loading results:', err);
        setError('Error al cargar los resultados');
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      loadResults();
    }
  }, [selectedDate]);

  // Load logs when tab changes to logs or date filter changes
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

  const handleFetchExternalResults = useCallback(async () => {
    setFetchingExternal(true);
    setError(null);
    try {
      const response = await fetchExternalResults(selectedDate);
      if (response) {
        setSuccessMessage(
          `Obtenidos ${response.resultsFetched} resultados, guardados ${response.resultsSaved}`
        );
        // Reload results to show the new data
        const apiResults = await getResults(selectedDate);
        const transformedResults: ResultData[] = apiResults.map((r: ResultDto) => ({
          id: r.drawId,
          name: r.drawName,
          num1: r.num1 || '',
          num2: r.num2 || '',
          num3: r.num3 || '',
          cash3: r.cash3 || '',
          play4: r.play4 || '',
          pick5: r.pick5 || '',
        }));
        setResultsData(transformedResults);
      }
    } catch (err) {
      console.error('Error fetching external results:', err);
      setError('Error al obtener resultados externos');
    } finally {
      setFetchingExternal(false);
    }
  }, [selectedDate]);

  const handlePublishResult = useCallback(async () => {
    if (!selectedDrawId) {
      setError('Seleccione un sorteo');
      return;
    }
    if (!quickResult1) {
      setError('Ingrese al menos el primer resultado');
      return;
    }

    try {
      const winningNumber = `${quickResult1.padStart(2, '0')}${quickResult2 || ''}`;
      await createResult({
        drawId: selectedDrawId,
        winningNumber,
        resultDate: selectedDate,
      });

      setSuccessMessage(`Resultado publicado para ${selectedSorteo}`);
      setQuickResult1('');
      setQuickResult2('');

      // Reload results
      const apiResults = await getResults(selectedDate);
      const transformedResults: ResultData[] = apiResults.map((r: ResultDto) => ({
        id: r.drawId,
        name: r.drawName,
        num1: r.num1 || '',
        num2: r.num2 || '',
        num3: r.num3 || '',
        cash3: r.cash3 || '',
        play4: r.play4 || '',
        pick5: r.pick5 || '',
      }));
      setResultsData(transformedResults);
    } catch (err) {
      console.error('Error publishing result:', err);
      setError('Error al publicar el resultado');
    }
  }, [selectedDrawId, selectedSorteo, quickResult1, quickResult2, selectedDate]);

  const handlePublishAllResults = useCallback(() => {
    setSuccessMessage('Todos los resultados han sido publicados');
  }, []);

  const handleUnlockResults = useCallback(() => {
    setSuccessMessage('Resultados desbloqueados');
  }, []);

  const handleViewDetails = useCallback((sorteoId: number) => {
    alert(`Ver detalles del sorteo ${sorteoId}`);
  }, []);

  const handleEditResult = useCallback((sorteoId: number) => {
    alert(`Editar resultado del sorteo ${sorteoId}`);
  }, []);

  const handleDeleteResult = useCallback(async (sorteoId: number) => {
    if (window.confirm('¿Está seguro de eliminar este resultado?')) {
      try {
        await deleteResult(sorteoId);
        setSuccessMessage('Resultado eliminado');
        // Reload results
        const apiResults = await getResults(selectedDate);
        const transformedResults: ResultData[] = apiResults.map((r: ResultDto) => ({
          id: r.drawId,
          name: r.drawName,
          num1: r.num1 || '',
          num2: r.num2 || '',
          num3: r.num3 || '',
          cash3: r.cash3 || '',
          play4: r.play4 || '',
          pick5: r.pick5 || '',
        }));
        setResultsData(transformedResults);
      } catch (err) {
        console.error('Error deleting result:', err);
        setError('Error al eliminar el resultado');
      }
    }
  }, [selectedDate]);

  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  const handleSorteoChange = useCallback((e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setSelectedSorteo(value);
    const draw = draws.find(d => d.drawName === value);
    setSelectedDrawId(draw?.drawId || null);
  }, [draws]);

  const handleResult1Change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuickResult1(e.target.value);
  }, []);

  const handleResult2Change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuickResult2(e.target.value);
  }, []);

  const handleLogsFilterDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLogsFilterDate(e.target.value);
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Error/Success Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
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
            '& .MuiTab-root': {
              color: '#37b9f9',
              textTransform: 'none',
              fontWeight: 500,
            },
            '& .Mui-selected': {
              color: '#37b9f9',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#37b9f9',
            },
          }}
        >
          <Tab label="Manejar resultados" />
          <Tab label="Logs de resultados" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <>
          <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
            Manejar resultados
          </Typography>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Fecha"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sorteo</InputLabel>
              <Select
                value={selectedSorteo}
                onChange={handleSorteoChange}
                label="Sorteo"
              >
                <MenuItem value="">Seleccione</MenuItem>
                {draws.map((draw) => (
                  <MenuItem key={draw.drawId} value={draw.drawName}>{draw.drawName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={fetchingExternal ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
              onClick={handleFetchExternalResults}
              disabled={fetchingExternal}
              sx={{
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {fetchingExternal ? 'Obteniendo...' : 'Obtener resultados externos'}
            </Button>
          </Box>

          {/* Quick Result Input */}
          {selectedSorteo && (
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedSorteo}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="1ro"
                  value={quickResult1}
                  onChange={handleResult1Change}
                  inputProps={{ maxLength: 2 }}
                  size="small"
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Cash 3"
                  value={quickResult2}
                  onChange={handleResult2Change}
                  inputProps={{ maxLength: 3 }}
                  size="small"
                  sx={{ width: 120 }}
                />
              </Box>
              <Button
                variant="contained"
                onClick={handlePublishResult}
                sx={{
                  mt: 2,
                  bgcolor: '#37b9f9',
                  '&:hover': { bgcolor: '#2da8e8' },
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                PUBLICAR RESULTADO
              </Button>
            </Paper>
          )}

          {/* Results Table Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Resultados {selectedDate}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={handlePublishAllResults}
                sx={{
                  bgcolor: '#37b9f9',
                  '&:hover': { bgcolor: '#2da8e8' },
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                PUBLICAR RESULTADOS
              </Button>
              <Button
                variant="contained"
                startIcon={<LockOpenIcon />}
                onClick={handleUnlockResults}
                sx={{
                  bgcolor: '#ffc107',
                  color: '#333',
                  '&:hover': { bgcolor: '#e0a800' },
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                DESBLOQUEAR
              </Button>
              <IconButton sx={{ bgcolor: '#e0e0e0' }}>
                <SettingsIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  const loadResults = async () => {
                    setLoading(true);
                    try {
                      const apiResults = await getResults(selectedDate);
                      const transformedResults: ResultData[] = apiResults.map((r: ResultDto) => ({
                        id: r.drawId,
                        name: r.drawName,
                        num1: r.num1 || '',
                        num2: r.num2 || '',
                        num3: r.num3 || '',
                        cash3: r.cash3 || '',
                        play4: r.play4 || '',
                        pick5: r.pick5 || '',
                      }));
                      setResultsData(transformedResults);
                    } finally {
                      setLoading(false);
                    }
                  };
                  loadResults();
                }}
                sx={{ bgcolor: '#e0e0e0' }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Sorteos</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#a8e6cf', minWidth: 60 }}>1ra</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#a8e6cf', minWidth: 60 }}>2da</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#d0d0d0', minWidth: 60 }}>3ra</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#d0d0d0', minWidth: 60 }}>Cash 3</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#d0d0d0', minWidth: 60 }}>Play 4</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#d0d0d0', minWidth: 70 }}>Pick five</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#87ceeb' }}>Detalles</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultsData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No hay resultados para esta fecha. Haga clic en "Obtener resultados externos" para cargar datos.
                        </TableCell>
                      </TableRow>
                    ) : (
                      resultsData.map((result) => (
                        <TableRow key={result.id} hover>
                          <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{result.name}</TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#d4edda', fontWeight: 600 }}>{result.num1}</TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#d4edda', fontWeight: 600 }}>{result.num2}</TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#e9ecef', fontWeight: 600 }}>{result.num3}</TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#e9ecef', fontWeight: 600 }}>{result.cash3}</TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#e9ecef', fontWeight: 600 }}>{result.play4}</TableCell>
                          <TableCell align="center" sx={{ bgcolor: '#e9ecef', fontWeight: 600 }}>{result.pick5}</TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              onClick={() => handleViewDetails(result.id)}
                              sx={{
                                bgcolor: '#87ceeb',
                                color: '#333',
                                '&:hover': { bgcolor: '#6bb3d9' },
                                fontWeight: 600,
                                fontSize: '10px',
                                minWidth: 'auto',
                                px: 1.5,
                              }}
                            >
                              VER
                            </Button>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditResult(result.id)}
                              sx={{ color: '#37b9f9' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteResult(result.id)}
                              sx={{ color: '#dc3545' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
            </>
          )}

          {activeTab === 1 && (
            <>
              <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
                Logs de resultados
              </Typography>

              {/* Date Filter */}
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

              {/* Logs Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer' }}>
                        Sorteo
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer' }}>
                        Usuario
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer' }}>
                        Fecha de resultado
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, cursor: 'pointer' }}>
                        Fecha de registro
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        Números
                      </TableCell>
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
    </Box>
  );
};

export default Results;
