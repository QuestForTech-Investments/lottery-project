import React, { useState, useMemo, useCallback, type SyntheticEvent } from 'react';
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
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface ParentCategory {
  id: number;
  nombre: string;
}

interface ChildCategory {
  id: number;
  nombre: string;
  parentId: number;
}

type Category = ParentCategory | ChildCategory;
type SortDirection = 'asc' | 'desc';
type SortKey = 'nombre' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ExpenseCategories = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  // Mockup data - Parent categories
  const parentCategoriesData: ParentCategory[] = [
    { id: 1, nombre: 'DIETA' },
    { id: 2, nombre: 'EQUIPOS' },
    { id: 3, nombre: 'MATERIAL GASTABLE' },
    { id: 4, nombre: 'RENTA' },
    { id: 5, nombre: 'SALARIO' },
    { id: 6, nombre: 'SERVICIOS' },
    { id: 7, nombre: 'TRANSPORTE' }
  ];

  // Mockup data - Child categories
  const childCategoriesData: ChildCategory[] = [
    { id: 1, nombre: 'Almuerzos', parentId: 1 },
    { id: 2, nombre: 'Cenas', parentId: 1 },
    { id: 3, nombre: 'Computadoras', parentId: 2 },
    { id: 4, nombre: 'Impresoras', parentId: 2 },
    { id: 5, nombre: 'Papel', parentId: 3 },
    { id: 6, nombre: 'Tinta', parentId: 3 },
    { id: 7, nombre: 'Local comercial', parentId: 4 },
    { id: 8, nombre: 'Bodega', parentId: 4 }
  ];

  const currentData: Category[] = activeTab === 0 ? parentCategoriesData : childCategoriesData;

  const handleTabChange = useCallback((event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  }, []);

  const handleSort = useCallback((key: SortKey): void => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const handleEdit = useCallback((category: Category): void => {
    // TODO: Implementar edit modal
  }, []);

  const handleDelete = useCallback((category: Category): void => {
    // TODO: Implementar confirmación de eliminación
  }, []);

  const handleCreate = useCallback((): void => {
    // TODO: Implementar modal de creación
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let filtered = currentData;

    // Quick filter
    if (quickFilter) {
      filtered = filtered.filter((item) =>
        item.nombre.toLowerCase().includes(quickFilter.toLowerCase())
      );
    }

    // Sorting
    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [currentData, quickFilter, sortConfig]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
        Lista de Categorías de gastos
      </Typography>

      <Card>
        <CardContent>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                color: '#8b5cf6',
                '&.Mui-selected': {
                  color: '#8b5cf6'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8b5cf6'
              }
            }}
          >
            <Tab label="Categorias padre" />
            <Tab label="Categorias hijo" />
          </Tabs>

          {/* Quick Filter */}
          <Box sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Filtrado rápido"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ maxWidth: 300 }}
            />
          </Box>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'nombre'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('nombre')}
                    >
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center" sx={{ width: '120px' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>{category.nombre}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(category)}
                          sx={{ color: '#8b5cf6', mr: 1 }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon fontSize="small" />}
                          onClick={() => handleDelete(category)}
                          sx={{ fontSize: '11px', textTransform: 'none' }}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Create Button */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                backgroundColor: '#8b5cf6',
                '&:hover': { backgroundColor: '#45b5b8' },
                color: 'white',
                px: 3,
                py: 1,
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              CREAR CATEGORÍA
            </Button>
          </Box>

          {/* Footer */}
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Mostrando {filteredAndSortedData.length} de {currentData.length} entradas
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExpenseCategories;
