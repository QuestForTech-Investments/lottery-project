/**
 * ReportTab Component
 *
 * Displays the cleaned payments report with filters and table.
 */

import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { BettingPool, ReportItem, OrderDirection, ReportTotals } from '../types';

interface ReportTabProps {
  bettingPools: BettingPool[];
  startDate: string;
  endDate: string;
  bancaId: string;
  searchTerm: string;
  orderBy: string;
  order: OrderDirection;
  loading: boolean;
  filteredData: ReportItem[];
  totalCount: number;
  totals: ReportTotals;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onBancaIdChange: (id: string) => void;
  onSearchTermChange: (term: string) => void;
  onSort: (property: string) => void;
  onSearch: () => void;
}

const ReportTab: FC<ReportTabProps> = memo(({
  bettingPools,
  startDate,
  endDate,
  bancaId,
  searchTerm,
  orderBy,
  order,
  loading,
  filteredData,
  totalCount,
  totals,
  onStartDateChange,
  onEndDateChange,
  onBancaIdChange,
  onSearchTermChange,
  onSort,
  onSearch,
}) => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        {t('bettingPoolsAdmin.paidAndCleanedTickets')}
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label={t('common.dateStart')}
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label={t('common.dateEnd')}
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel>{t('bettingPoolsAdmin.bancaSelectLabel')}</InputLabel>
          <Select
            value={bancaId}
            label={t('bettingPoolsAdmin.bancaSelectLabel')}
            onChange={(e) => onBancaIdChange(e.target.value)}
          >
            <MenuItem value="">
              <em>{t('bettingPoolsAdmin.bancaSelectPlaceholder')}</em>
            </MenuItem>
            {bettingPools.map((pool) => (
              <MenuItem
                key={pool.bettingPoolId || pool.id}
                value={pool.bettingPoolId || pool.id}
              >
                {pool.reference || pool.bettingPoolName || pool.name} (
                {pool.bettingPoolId || pool.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? t('bettingPoolsAdmin.searching') : t('bettingPoolsAdmin.searchButton')}
        </Button>
      </Box>

      {/* Quick Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder={t('bettingPoolsAdmin.quickFilter')}
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Report Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fecha'}
                  direction={orderBy === 'fecha' ? order : 'asc'}
                  onClick={() => onSort('fecha')}
                >
                  {t('bettingPoolsAdmin.reportColDate')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'ticketNumber'}
                  direction={orderBy === 'ticketNumber' ? order : 'asc'}
                  onClick={() => onSort('ticketNumber')}
                >
                  {t('bettingPoolsAdmin.reportColTicketNumber')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'monto'}
                  direction={orderBy === 'monto' ? order : 'asc'}
                  onClick={() => onSort('monto')}
                >
                  {t('bettingPoolsAdmin.reportColAmount')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'premios'}
                  direction={orderBy === 'premios' ? order : 'asc'}
                  onClick={() => onSort('premios')}
                >
                  {t('bettingPoolsAdmin.reportColPrizes')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'fechaPago'}
                  direction={orderBy === 'fechaPago' ? order : 'asc'}
                  onClick={() => onSort('fechaPago')}
                >
                  {t('bettingPoolsAdmin.reportColPaymentDate')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'usuario'}
                  direction={orderBy === 'usuario' ? order : 'asc'}
                  onClick={() => onSort('usuario')}
                >
                  {t('bettingPoolsAdmin.reportColUser')}
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t('bettingPoolsAdmin.noEntriesAvailable')}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.fecha}</TableCell>
                  <TableCell>{item.ticketNumber}</TableCell>
                  <TableCell>${(item.monto || 0).toFixed(2)}</TableCell>
                  <TableCell>${(item.premios || 0).toFixed(2)}</TableCell>
                  <TableCell>{item.fechaPago}</TableCell>
                  <TableCell>{item.usuario}</TableCell>
                </TableRow>
              ))
            )}
            {/* Totals Row */}
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>{t('bettingPoolsAdmin.totalsLabel')}</strong></TableCell>
              <TableCell><strong>-</strong></TableCell>
              <TableCell><strong>${totals.monto.toFixed(2)}</strong></TableCell>
              <TableCell><strong>${totals.premios.toFixed(2)}</strong></TableCell>
              <TableCell><strong>-</strong></TableCell>
              <TableCell><strong>-</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        {t('common.showingEntries', { shown: filteredData.length, total: totalCount })}
      </Typography>
    </Box>
  );
});

ReportTab.displayName = 'ReportTab';

export default ReportTab;
