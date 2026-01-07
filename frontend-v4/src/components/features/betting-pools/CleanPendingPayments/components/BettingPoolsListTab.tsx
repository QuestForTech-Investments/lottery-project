/**
 * BettingPoolsListTab Component
 *
 * Displays the list of betting pools with search and sort functionality.
 */

import { memo, type FC } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  CleaningServices as CleanIcon
} from '@mui/icons-material';
import type { BettingPool, OrderDirection } from '../types';

interface BettingPoolsListTabProps {
  filteredData: BettingPool[];
  totalCount: number;
  searchTerm: string;
  orderBy: string;
  order: OrderDirection;
  onSearchChange: (term: string) => void;
  onSort: (property: string) => void;
  onOpenModal: (pool: BettingPool) => void;
}

const BettingPoolsListTab: FC<BettingPoolsListTabProps> = memo(({
  filteredData,
  totalCount,
  searchTerm,
  orderBy,
  order,
  onSearchChange,
  onSort,
  onOpenModal,
}) => {
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Lista de bancas
      </Typography>

      {/* Quick Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Filtrado rápido"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'number'}
                  direction={orderBy === 'number' ? order : 'asc'}
                  onClick={() => onSort('number')}
                >
                  Número
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => onSort('name')}
                >
                  Nombre
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'reference'}
                  direction={orderBy === 'reference' ? order : 'asc'}
                  onClick={() => onSort('reference')}
                >
                  Referencia
                </TableSortLabel>
              </TableCell>
              <TableCell>Usuarios</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((pool) => (
              <TableRow key={pool.bettingPoolId || pool.id} hover>
                <TableCell>{pool.bettingPoolId || pool.id}</TableCell>
                <TableCell>{pool.bettingPoolName || pool.name}</TableCell>
                <TableCell>{pool.reference || '-'}</TableCell>
                <TableCell>
                  {pool.userCodes?.join(', ') || pool.reference || '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onOpenModal(pool)}
                    title="Limpiar pendientes de pago"
                  >
                    <CleanIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Mostrando {filteredData.length} de {totalCount} entradas
      </Typography>
    </Box>
  );
});

BettingPoolsListTab.displayName = 'BettingPoolsListTab';

export default BettingPoolsListTab;
