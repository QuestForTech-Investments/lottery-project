import React, { useState, useEffect, useMemo, useCallback, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  InputAdornment,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  type SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import {
  getTransactionLines,
  getTransactionLineFilterOptions,
  getEntitiesByType,
  type TransactionLineReportAPI,
  type EntityOption
} from '@services/transactionGroupService';

type SortDirection = 'asc' | 'desc';
type SortKey = 'transactionType' | 'createdAt' | 'createdByName' | 'entity1Name' | 'entity2Name' | 'debit' | 'credit' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  bettingPool: 'Banca',
  accountableEntity: 'Banco',
  zone: 'Zona',
  group: 'Grupo',
  externalAgent: 'Agente externo',
  employee: 'Empleado',
  personalClient: 'Cliente personal',
  system: 'Sistema',
  accumulatedDrop: 'Caída acumulada',
  other: 'Otros'
};

const getEntityTypeLabel = (type: string): string => ENTITY_TYPE_LABELS[type] ?? type;

const TransactionsList = (): React.ReactElement => {
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState<TransactionLineReportAPI[]>([]);

  // Filter states
  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string>('');
  const [showNotes, setShowNotes] = useState<boolean>(false);

  // Filter options from API
  const [entityTypeOptions, setEntityTypeOptions] = useState<string[]>([]);
  const [transactionTypeOptions, setTransactionTypeOptions] = useState<string[]>([]);
  const [createdByOptions, setCreatedByOptions] = useState<string[]>([]);
  const [entityOptions, setEntityOptions] = useState<EntityOption[]>([]);

  // Load filter options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await getTransactionLineFilterOptions();
        setEntityTypeOptions(options.entityTypes ?? []);
        setTransactionTypeOptions(options.transactionTypes ?? []);
        setCreatedByOptions(options.createdByUsers ?? []);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadOptions();
  }, []);

  // Load entities when entity type changes
  useEffect(() => {
    if (!selectedEntityType) {
      setEntityOptions([]);
      setSelectedEntity('');
      return;
    }
    const loadEntities = async () => {
      try {
        const entities = await getEntitiesByType(selectedEntityType);
        setEntityOptions(Array.isArray(entities) ? entities : []);
        setSelectedEntity('');
      } catch (err) {
        console.error('Error loading entities:', err);
      }
    };
    loadEntities();
  }, [selectedEntityType]);

  const loadLines = useCallback(async (params?: {
    startDate?: string;
    endDate?: string;
    entityType?: string;
    transactionType?: string;
    entityName?: string;
    createdBy?: string;
  }) => {
    try {
      setLoading(true);
      const data = await getTransactionLines(params);
      setLines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLines({ startDate: today, endDate: today });
  }, [loadLines, today]);

  const handleFilter = useCallback(() => {
    loadLines({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      entityType: selectedEntityType || undefined,
      transactionType: selectedTransactionType || undefined,
      entityName: selectedEntity || undefined,
      createdBy: selectedCreatedBy || undefined
    });
  }, [startDate, endDate, selectedEntityType, selectedTransactionType, selectedEntity, selectedCreatedBy, loadLines]);

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const parseUtc = (dateStr: string): Date => {
    return new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return parseUtc(dateStr).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return parseUtc(dateStr).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (val: number): string => `$${val.toFixed(2)}`;

  const filteredAndSortedData = useMemo(() => {
    let filtered = lines;

    if (quickFilter) {
      const lower = quickFilter.toLowerCase();
      filtered = filtered.filter((item) =>
        item.transactionType.toLowerCase().includes(lower) ||
        item.entity1Name.toLowerCase().includes(lower) ||
        (item.entity2Name && item.entity2Name.toLowerCase().includes(lower)) ||
        (item.createdByName && item.createdByName.toLowerCase().includes(lower)) ||
        (item.notes && item.notes.toLowerCase().includes(lower)) ||
        item.groupNumber.toLowerCase().includes(lower)
      );
    }

    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered = [...filtered].sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';

        switch (key) {
          case 'transactionType': aVal = a.transactionType; bVal = b.transactionType; break;
          case 'createdAt': aVal = a.createdAt ?? ''; bVal = b.createdAt ?? ''; break;
          case 'createdByName': aVal = a.createdByName ?? ''; bVal = b.createdByName ?? ''; break;
          case 'entity1Name': aVal = a.entity1Name; bVal = b.entity1Name; break;
          case 'entity2Name': aVal = a.entity2Name ?? ''; bVal = b.entity2Name ?? ''; break;
          case 'debit': aVal = a.debit; bVal = b.debit; break;
          case 'credit': aVal = a.credit; bVal = b.credit; break;
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [lines, quickFilter, sortConfig]);

  const totalDebit = filteredAndSortedData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = filteredAndSortedData.reduce((sum, item) => sum + item.credit, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
        Lista de transacciones
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField type="date" label="Fecha inicial" value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField type="date" label="Fecha final" value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} size="small" />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de entidad</InputLabel>
                  <Select value={selectedEntityType} label="Tipo de entidad" onChange={(e: SelectChangeEvent) => setSelectedEntityType(e.target.value)}>
                    <MenuItem value="">Seleccione</MenuItem>
                    {entityTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{getEntityTypeLabel(type)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Entidad</InputLabel>
                  <Select value={selectedEntity} label="Entidad" onChange={(e: SelectChangeEvent) => setSelectedEntity(e.target.value)} disabled={!selectedEntityType}>
                    <MenuItem value="">Seleccione</MenuItem>
                    {entityOptions.map((entity) => (
                      <MenuItem key={entity.id} value={entity.name}>
                        {entity.code ? `${entity.name} (${entity.code})` : entity.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo de transacción</InputLabel>
                  <Select value={selectedTransactionType} label="Tipo de transacción" onChange={(e: SelectChangeEvent) => setSelectedTransactionType(e.target.value)}>
                    <MenuItem value="">Todos</MenuItem>
                    {transactionTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Creado por</InputLabel>
                  <Select value={selectedCreatedBy} label="Creado por" onChange={(e: SelectChangeEvent) => setSelectedCreatedBy(e.target.value)}>
                    <MenuItem value="">Seleccione</MenuItem>
                    {createdByOptions.map((user) => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel control={<Checkbox checked={showNotes} onChange={(e: ChangeEvent<HTMLInputElement>) => setShowNotes(e.target.checked)} />} label="Mostrar notas" />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#45b5b8' } }}>FILTRAR</Button>
              <Button variant="contained" startIcon={<FileDownloadIcon />} sx={{ backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#45b5b8' } }}>CSV</Button>
              <Button variant="contained" startIcon={<PdfIcon />} sx={{ backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#45b5b8' } }}>PDF</Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField size="small" placeholder="Filtro rapido" value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 300 }} />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><TableSortLabel active={sortConfig.key === 'transactionType'} direction={sortConfig.key === 'transactionType' ? sortConfig.direction : 'asc'} onClick={() => handleSort('transactionType')}>Concepto</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdAt'} direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdAt')}>Fecha</TableSortLabel></TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdByName'} direction={sortConfig.key === 'createdByName' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdByName')}>Creado por</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'entity1Name'} direction={sortConfig.key === 'entity1Name' ? sortConfig.direction : 'asc'} onClick={() => handleSort('entity1Name')}>Entidad #1</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'entity2Name'} direction={sortConfig.key === 'entity2Name' ? sortConfig.direction : 'asc'} onClick={() => handleSort('entity2Name')}>Entidad #2</TableSortLabel></TableCell>
                    <TableCell align="right">Saldo inicial de Entidad #1</TableCell>
                    <TableCell align="right">Saldo inicial de Entidad #2</TableCell>
                    <TableCell align="right" sx={{ color: '#dc3545' }}><TableSortLabel active={sortConfig.key === 'debit'} direction={sortConfig.key === 'debit' ? sortConfig.direction : 'asc'} onClick={() => handleSort('debit')}>Débito</TableSortLabel></TableCell>
                    <TableCell align="right" sx={{ color: '#28a745' }}><TableSortLabel active={sortConfig.key === 'credit'} direction={sortConfig.key === 'credit' ? sortConfig.direction : 'asc'} onClick={() => handleSort('credit')}>Crédito</TableSortLabel></TableCell>
                    <TableCell align="right">Saldo final de Entidad #1</TableCell>
                    <TableCell align="right">Saldo final de Entidad #2</TableCell>
                    {showNotes && <TableCell>Notas</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showNotes ? 13 : 12} align="center" sx={{ py: 3 }}>No hay entradas disponibles</TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredAndSortedData.map((item) => (
                        <TableRow key={item.lineId} hover>
                          <TableCell>{item.transactionType}</TableCell>
                          <TableCell>{formatDate(item.createdAt)}</TableCell>
                          <TableCell>{formatTime(item.createdAt)}</TableCell>
                          <TableCell>{item.createdByName ?? ''}</TableCell>
                          <TableCell>{item.entity1Name}</TableCell>
                          <TableCell>{item.entity2Name ?? ''}</TableCell>
                          <TableCell align="right">{formatCurrency(item.entity1InitialBalance)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.entity2InitialBalance)}</TableCell>
                          <TableCell align="right" sx={{ color: '#dc3545', fontWeight: 500 }}>{formatCurrency(item.debit)}</TableCell>
                          <TableCell align="right" sx={{ color: '#28a745', fontWeight: 500 }}>{formatCurrency(item.credit)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.entity1FinalBalance)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.entity2FinalBalance)}</TableCell>
                          {showNotes && <TableCell>{item.notes ?? ''}</TableCell>}
                        </TableRow>
                      ))}
                      <TableRow sx={{ backgroundColor: '#f8f9fa', fontWeight: 600 }}>
                        <TableCell colSpan={8} align="right"><strong>Totales</strong></TableCell>
                        <TableCell align="right" sx={{ color: '#dc3545', fontWeight: 600 }}>{formatCurrency(totalDebit)}</TableCell>
                        <TableCell align="right" sx={{ color: '#28a745', fontWeight: 600 }}>{formatCurrency(totalCredit)}</TableCell>
                        <TableCell colSpan={showNotes ? 3 : 2}></TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>Mostrando {filteredAndSortedData.length} entradas</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionsList;
