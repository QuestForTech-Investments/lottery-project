/**
 * ResultsTableSection Component
 *
 * Displays the results table with filters and actions.
 */

import { memo, type FC } from 'react';
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
  Paper,
  CircularProgress,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import type { DrawResultRow, EnabledFields } from '../types';
import { COLORS } from '../constants';
import { ResultsTableRow } from './ResultsTable';
import type { StatusFilterType } from './StatusFilterTabs';

interface ResultsTableSectionProps {
  selectedDate: string;
  filteredDrawResults: DrawResultRow[];
  enabledFieldsMap: Map<number, EnabledFields>;
  loading: boolean;
  drawFilter: string;
  statusFilter: StatusFilterType;
  filterCounts: { all: number; pending: number; completed: number };
  totalCount: number;
  withResultsCount: number;
  pendingCount: number;
  lastRefresh: Date;
  onDrawFilterChange: (value: string) => void;
  onStatusFilterChange: (status: StatusFilterType) => void;
  onFieldChange: (drawId: number, field: string, value: string, inputElement?: HTMLInputElement) => void;
  onPublishAll: () => void;
  onViewDetails: (row: DrawResultRow) => void;
  onDelete: (row: DrawResultRow) => void;
  onEdit: (row: DrawResultRow) => void;
}

const ResultsTableSection: FC<ResultsTableSectionProps> = memo(({
  selectedDate,
  filteredDrawResults,
  enabledFieldsMap,
  loading,
  drawFilter,
  statusFilter,
  filterCounts,
  totalCount,
  withResultsCount,
  pendingCount,
  lastRefresh,
  onDrawFilterChange,
  onStatusFilterChange,
  onFieldChange,
  onPublishAll,
  onViewDetails,
  onDelete,
  onEdit,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: COLORS.primary }}>
        Resultados {selectedDate}
      </Typography>

      {/* Action buttons and filter */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={onPublishAll}
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
          onChange={(e) => onDrawFilterChange(e.target.value)}
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
        <TableContainer component={Paper} variant="outlined">
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
                    onFieldChange={onFieldChange}
                    onSave={onViewDetails}
                    onDelete={onDelete}
                    onEdit={onEdit}
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
          Total: {totalCount} sorteos | Con resultado: {withResultsCount} |
          Pendientes: {pendingCount}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Última actualización: {lastRefresh.toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
});

ResultsTableSection.displayName = 'ResultsTableSection';

export default ResultsTableSection;
