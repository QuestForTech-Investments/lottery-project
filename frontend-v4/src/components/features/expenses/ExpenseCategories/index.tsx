import React, { useState, useMemo, useCallback, type SyntheticEvent, type ChangeEvent } from 'react';
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
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ParentCategory {
  id: number;
  nombre: string;
}

interface ChildCategory {
  id: number;
  nombre: string;
  padre: string;
}

type SortDirection = 'asc' | 'desc';
type SortKey = 'nombre' | 'padre' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ExpenseCategories = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = parent, 1 = child
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  // Mockup data - Parent categories
  const parentCategories = [
    { id: 1, nombre: 'DIETA' },
    { id: 2, nombre: 'EQUIPOS' },
    { id: 3, nombre: 'MATERIAL GASTABLE' },
    { id: 4, nombre: 'RENTA' },
    { id: 5, nombre: 'SALARIO' },
    { id: 6, nombre: 'SERVICIOS' },
    { id: 7, nombre: 'TRANSPORTE' }
  ];

  // Mockup data - Child categories
  const childCategories = [
    { id: 1, nombre: 'Desayuno', padre: 'DIETA' },
    { id: 2, nombre: 'Almuerzo', padre: 'DIETA' },
    { id: 3, nombre: 'Cena', padre: 'DIETA' },
    { id: 4, nombre: 'Computadoras', padre: 'EQUIPOS' },
    { id: 5, nombre: 'Impresoras', padre: 'EQUIPOS' },
    { id: 6, nombre: 'Papel', padre: 'MATERIAL GASTABLE' },
    { id: 7, nombre: 'Tinta', padre: 'MATERIAL GASTABLE' }
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
    setQuickFilter('');
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleSort = (key: SortKey): void => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const currentData = activeTab === 0 ? parentCategories : childCategories;

  const filteredAndSortedData = useMemo(() => {
    let filtered = currentData;

    // Quick filter
    if (quickFilter) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(quickFilter.toLowerCase())
        )
      );
    }

    // Sorting
    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered = [...filtered].sort((a, b) => {
        const aVal: string = key === 'padre' && 'padre' in a ? (a as ChildCategory).padre : a.nombre;
        const bVal: string = key === 'padre' && 'padre' in b ? (b as ChildCategory).padre : b.nombre;

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [currentData, quickFilter, sortConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          textAlign: 'center',
          fontWeight: 600,
          color: '#2c2c2c'
        }}
      >
        Lista de Categorías de gastos
      </Typography>

      <Card elevation={1}>
        <CardContent sx={{ p: 3 }}>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontSize: '14px',
                textTransform: 'none',
                fontWeight: 500
              },
              '& .Mui-selected': {
                color: '#51cbce',
                fontWeight: 600
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#51cbce'
              }
            }}
          >
            <Tab label="Categorias padre" />
            <Tab label="Categorias hijo" />
          </Tabs>

          {/* Quick Filter */}
          <TextField
            fullWidth
            size="small"
            placeholder="Filtrado rápido"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'nombre'}
                      direction={sortConfig.key === 'nombre' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('nombre')}
                      sx={{ fontWeight: 600 }}
                    >
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  {activeTab === 1 && (
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'padre'}
                        direction={sortConfig.key === 'padre' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('padre')}
                        sx={{ fontWeight: 600 }}
                      >
                        Categoría padre
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell align="center" sx={{ fontWeight: 600, width: '100px' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeTab === 1 ? 3 : 2} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay entradas disponibles
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.nombre}</TableCell>
                      {activeTab === 1 && 'padre' in item && (
                        <TableCell>{(item as ChildCategory).padre}</TableCell>
                      )}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          sx={{ color: '#51cbce' }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: '#dc3545' }}
                          title="Eliminar"
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

          {/* Footer */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            Mostrando {filteredAndSortedData.length} de {currentData.length} entradas
          </Typography>

          {/* Create Button */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b5b8' },
                fontWeight: 600,
                textTransform: 'uppercase',
                px: 4
              }}
            >
              Crear Categoría
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExpenseCategories;
