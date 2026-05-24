import React, { useState, useEffect, useMemo, useCallback, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
import { getActiveLocale } from '@/utils/formatters';

type SortDirection = 'asc' | 'desc';
type SortKey = 'transactionType' | 'createdAt' | 'createdByName' | 'entity1Name' | 'entity2Name' | 'debit' | 'credit' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

// Entity-type → i18n-key map. Translated at render with t().
const ENTITY_TYPE_KEYS: Record<string, string> = {
  bettingPool: 'common.bettingPool',
  accountableEntity: 'common.bank',
  zone: 'common.zone',
  group: 'transactions.group',
  externalAgent: 'transactions.externalAgent',
  employee: 'transactions.employee',
  personalClient: 'transactions.personalClient',
  system: 'transactions.system',
  accumulatedDrop: 'transactions.accumulatedDrop',
  other: 'transactions.other'
};

const TransactionsList = (): React.ReactElement => {
  const { t } = useTranslation();
  const getEntityTypeLabel = useCallback((type: string): string => {
    const key = ENTITY_TYPE_KEYS[type];
    return key ? t(key) : type;
  }, [t]);
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
    return parseUtc(dateStr).toLocaleDateString(getActiveLocale(), { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const d = parseUtc(dateStr);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${period}`;
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
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontWeight: 500, fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
        {t('transactions.title')}
      </Typography>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField type="date" label={t('common.dateStart')} value={startDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField type="date" label={t('common.dateEnd')} value={endDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} size="small" />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('transactions.entityType')}</InputLabel>
                  <Select value={selectedEntityType} label={t('transactions.entityType')} onChange={(e: SelectChangeEvent) => setSelectedEntityType(e.target.value)}>
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {entityTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{getEntityTypeLabel(type)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('transactions.entity')}</InputLabel>
                  <Select value={selectedEntity} label={t('transactions.entity')} onChange={(e: SelectChangeEvent) => setSelectedEntity(e.target.value)} disabled={!selectedEntityType}>
                    <MenuItem value="">{t('common.select')}</MenuItem>
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
                  <InputLabel>{t('transactions.transactionType')}</InputLabel>
                  <Select value={selectedTransactionType} label={t('transactions.transactionType')} onChange={(e: SelectChangeEvent) => setSelectedTransactionType(e.target.value)}>
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    {transactionTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('common.createdBy')}</InputLabel>
                  <Select value={selectedCreatedBy} label={t('common.createdBy')} onChange={(e: SelectChangeEvent) => setSelectedCreatedBy(e.target.value)}>
                    <MenuItem value="">{t('common.select')}</MenuItem>
                    {createdByOptions.map((user) => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel control={<Checkbox checked={showNotes} onChange={(e: ChangeEvent<HTMLInputElement>) => setShowNotes(e.target.checked)} />} label={t('transactions.showNotes')} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={handleFilter} sx={{ backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } }}>{t('common.filter').toUpperCase()}</Button>
              <Button variant="contained" startIcon={<FileDownloadIcon />} sx={{ backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } }}>CSV</Button>
              <Button variant="contained" startIcon={<PdfIcon />} sx={{ backgroundColor: '#8b5cf6', '&:hover': { backgroundColor: '#7c3aed' } }}>PDF</Button>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField size="small" placeholder={t('common.filterQuick')} value={quickFilter} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuickFilter(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ maxWidth: 300 }} />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1100 }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><TableSortLabel active={sortConfig.key === 'transactionType'} direction={sortConfig.key === 'transactionType' ? sortConfig.direction : 'asc'} onClick={() => handleSort('transactionType')}>{t('transactions.concept')}</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdAt'} direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdAt')}>{t('common.date')}</TableSortLabel></TableCell>
                    <TableCell sx={{ minWidth: 100, whiteSpace: 'nowrap' }}>{t('common.time')}</TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'createdByName'} direction={sortConfig.key === 'createdByName' ? sortConfig.direction : 'asc'} onClick={() => handleSort('createdByName')}>{t('common.createdBy')}</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'entity1Name'} direction={sortConfig.key === 'entity1Name' ? sortConfig.direction : 'asc'} onClick={() => handleSort('entity1Name')}>{t('transactions.entity1')}</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig.key === 'entity2Name'} direction={sortConfig.key === 'entity2Name' ? sortConfig.direction : 'asc'} onClick={() => handleSort('entity2Name')}>{t('transactions.entity2')}</TableSortLabel></TableCell>
                    <TableCell align="right">{t('transactions.initialBalance1')}</TableCell>
                    <TableCell align="right">{t('transactions.initialBalance2')}</TableCell>
                    <TableCell align="right" sx={{ color: '#dc3545' }}><TableSortLabel active={sortConfig.key === 'debit'} direction={sortConfig.key === 'debit' ? sortConfig.direction : 'asc'} onClick={() => handleSort('debit')}>{t('transactions.debit')}</TableSortLabel></TableCell>
                    <TableCell align="right" sx={{ color: '#28a745' }}><TableSortLabel active={sortConfig.key === 'credit'} direction={sortConfig.key === 'credit' ? sortConfig.direction : 'asc'} onClick={() => handleSort('credit')}>{t('transactions.credit')}</TableSortLabel></TableCell>
                    <TableCell align="right">{t('transactions.finalBalance1')}</TableCell>
                    <TableCell align="right">{t('transactions.finalBalance2')}</TableCell>
                    {showNotes && <TableCell>{t('common.notes')}</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showNotes ? 13 : 12} align="center" sx={{ py: 3 }}>{t('common.noEntries')}</TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {filteredAndSortedData.map((item) => (
                        <TableRow key={item.lineId} hover>
                          <TableCell>{item.transactionType}</TableCell>
                          <TableCell>{formatDate(item.createdAt)}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTime(item.createdAt)}</TableCell>
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
                        <TableCell colSpan={8} align="right"><strong>{t('balances.totals')}</strong></TableCell>
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

          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>{t('balances.showingCount', { count: filteredAndSortedData.length })}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionsList;
