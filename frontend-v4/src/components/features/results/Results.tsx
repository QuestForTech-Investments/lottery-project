import React, { useState, useCallback, type SyntheticEvent, type ChangeEvent } from 'react';
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Upload as UploadIcon,
  LockOpen as LockOpenIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

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

interface LogData {
  sorteo: string;
  usuario: string;
  fechaResultado: string;
  fechaRegistro: string;
  numeros: string;
}

const Results = (): React.ReactElement => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSorteo, setSelectedSorteo] = useState<string>('');
  const [quickResult1, setQuickResult1] = useState<string>('');
  const [quickResult2, setQuickResult2] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [logsFilterDate, setLogsFilterDate] = useState<string>('');
  const [logsQuickFilter, setLogsQuickFilter] = useState<string>('');

  // Sample logs data
  const [logsData] = useState<LogData[]>([]);

  // Sample results data
  const [resultsData] = useState<ResultData[]>([
    { id: 970, name: 'Anguila 10am', num1: '89', num2: '21', num3: '72', cash3: '', play4: '', pick5: '' },
    { id: 9, name: 'REAL', num1: '34', num2: '89', num3: '88', cash3: '', play4: '', pick5: '' },
    { id: 6, name: 'GANA MAS', num1: '65', num2: '77', num3: '10', cash3: '', play4: '', pick5: '' },
    { id: 1, name: 'LA PRIMERA', num1: '18', num2: '86', num3: '87', cash3: '', play4: '', pick5: '' },
    { id: 211, name: 'LA SUERTE', num1: '95', num2: '40', num3: '00', cash3: '', play4: '', pick5: '' },
    { id: 277, name: 'LOTEDOM', num1: '17', num2: '64', num3: '17', cash3: '', play4: '', pick5: '' },
    { id: 61, name: 'TEXAS MORNING', num1: '99', num2: '09', num3: '76', cash3: '728', play4: '0996', pick5: '' },
    { id: 62, name: 'TEXAS DAY', num1: '61', num2: '97', num3: '56', cash3: '061', play4: '8756', pick5: '' },
    { id: 541, name: 'King Lottery AM', num1: '48', num2: '01', num3: '19', cash3: '948', play4: '8118', pick5: '64961' },
    { id: 673, name: 'Anguila 1pm', num1: '12', num2: '28', num3: '51', cash3: '', play4: '', pick5: '' },
    { id: 2, name: 'NEW YORK DAY', num1: '88', num2: '22', num3: '81', cash3: '444', play4: '2784', pick5: '44889' },
    { id: 4, name: 'FLORIDA AM', num1: '37', num2: '90', num3: '73', cash3: '137', play4: '9073', pick5: '63572' },
    { id: 34, name: 'INDIANA MIDDAY', num1: '12', num2: '11', num3: '51', cash3: '412', play4: '1101', pick5: '' },
    { id: 13, name: 'GEORGIA MID AM', num1: '17', num2: '23', num3: '72', cash3: '817', play4: '2572', pick5: '98013' },
    { id: 16, name: 'NEW JERSEY AM', num1: '89', num2: '87', num3: '59', cash3: '889', play4: '8759', pick5: '69687' },
    { id: 607, name: 'L.E. PUERTO RICO 2PM', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 38, name: 'DIARIA 11AM', num1: '12', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 18, name: 'CONNECTICUT AM', num1: '82', num2: '19', num3: '42', cash3: '482', play4: '1042', pick5: '48210' },
    { id: 30, name: 'PENN MIDDAY', num1: '13', num2: '82', num3: '60', cash3: '713', play4: '8100', pick5: '63069' },
    { id: 376, name: 'NY AM 6x1', num1: '', num2: '', num3: '', cash3: '448', play4: '2784', pick5: '' },
    { id: 411, name: 'FL AM 6X1', num1: '', num2: '', num3: '', cash3: '137', play4: '9073', pick5: '' },
    { id: 75, name: 'MARYLAND MIDDAY', num1: '79', num2: '52', num3: '12', cash3: '379', play4: '5212', pick5: '52387' },
    { id: 65, name: 'VIRGINIA AM', num1: '16', num2: '03', num3: '95', cash3: '616', play4: '0395', pick5: '' },
    { id: 609, name: 'DELAWARE AM', num1: '55', num2: '78', num3: '83', cash3: '055', play4: '7883', pick5: '' },
    { id: 1036, name: 'LA CHICA', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 73, name: 'SOUTH CAROLINA AM', num1: '48', num2: '83', num3: '77', cash3: '548', play4: '8577', pick5: '' },
    { id: 20, name: 'CALIFORNIA AM', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 82, name: 'MASS AM', num1: '11', num2: '17', num3: '11', cash3: '717', play4: '1711', pick5: '' },
    { id: 244, name: 'NORTH CAROLINA AM', num1: '', num2: '', num3: '', cash3: '', play4: '', pick5: '' },
    { id: 24, name: 'CHICAGO AM', num1: '10', num2: '85', num3: '46', cash3: '610', play4: '8546', pick5: '61085' },
  ]);

  const sorteosList = [
    'CALIFORNIA AM', 'NEW YORK DAY', 'FLORIDA AM', 'TEXAS MORNING', 'TEXAS DAY',
    'TEXAS EVENING', 'TEXAS NIGHT', 'INDIANA MIDDAY', 'GEORGIA MID AM', 'NEW JERSEY AM'
  ];

  const handlePublishResult = useCallback(() => {
    if (!selectedSorteo) {
      alert('Seleccione un sorteo');
      return;
    }
    console.log('Publishing result:', { sorteo: selectedSorteo, num1: quickResult1, num2: quickResult2 });
    alert(`Resultado publicado para ${selectedSorteo}`);
    setQuickResult1('');
    setQuickResult2('');
  }, [selectedSorteo, quickResult1, quickResult2]);

  const handlePublishAllResults = useCallback(() => {
    alert('Todos los resultados han sido publicados');
  }, []);

  const handleUnlockResults = useCallback(() => {
    alert('Resultados desbloqueados');
  }, []);

  const handleViewDetails = useCallback((sorteoId: number) => {
    alert(`Ver detalles del sorteo ${sorteoId}`);
  }, []);

  const handleEditResult = useCallback((sorteoId: number) => {
    alert(`Editar resultado del sorteo ${sorteoId}`);
  }, []);

  const handleDeleteResult = useCallback((sorteoId: number) => {
    if (window.confirm('¿Está seguro de eliminar este resultado?')) {
      alert(`Resultado eliminado para sorteo ${sorteoId}`);
    }
  }, []);

  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  }, []);

  const handleSorteoChange = useCallback((e: SelectChangeEvent<string>) => {
    setSelectedSorteo(e.target.value);
  }, []);

  const handleResult1Change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuickResult1(e.target.value);
  }, []);

  const handleResult2Change = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuickResult2(e.target.value);
  }, []);

  const handleLogsFilterDateChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLogsFilterDate(e.target.value);
  }, []);

  const handleLogsQuickFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLogsQuickFilter(e.target.value);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
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
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
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
                {sorteosList.map((sorteo) => (
                  <MenuItem key={sorteo} value={sorteo}>{sorteo}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
            </Box>

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
                  {resultsData.map((result) => (
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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

              {/* Quick Filter */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  placeholder="Filtrado rápido"
                  value={logsQuickFilter}
                  onChange={handleLogsQuickFilterChange}
                  size="small"
                  sx={{ minWidth: 300 }}
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
                          <TableCell>{log.sorteo}</TableCell>
                          <TableCell>{log.usuario}</TableCell>
                          <TableCell>{log.fechaResultado}</TableCell>
                          <TableCell>{log.fechaRegistro}</TableCell>
                          <TableCell>{log.numeros}</TableCell>
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
