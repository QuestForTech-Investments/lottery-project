import React, { useState, useCallback, type SyntheticEvent, type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  TableSortLabel,
  Alert
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';

type SortOrder = 'asc' | 'desc';

interface Entity {
  id: number;
  nombre: string;
  codigo: string;
  balance?: number;
  caida?: number;
  prestamo?: number;
  zona?: string;
}

type ColumnKey = 'nombre' | 'codigo' | 'balance' | 'caida' | 'prestamo' | 'zona';

const AccountableEntities = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<ColumnKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Mockup data - Bancas (137 total, showing first 20)
  const bancas: Entity[] = [
    { id: 220, nombre: 'CARIBBEAN 186', codigo: 'LAN-0186', balance: 610.26, caida: 0.00, prestamo: 0.00 },
    { id: 232, nombre: 'CARIBBEAN 198', codigo: 'LAN-0198', balance: 700.86, caida: 0.00, prestamo: 0.00 },
    { id: 10967, nombre: 'CARIBBEAN 264', codigo: 'LAN-0264', balance: 499.84, caida: 0.00, prestamo: 0.00 },
    { id: 11093, nombre: 'CARIBBEAN 278', codigo: 'LAN-0278', balance: 462.60, caida: 0.00, prestamo: 0.00 },
    { id: 11094, nombre: 'CARIBBEAN 279', codigo: 'LAN-0279', balance: 600.16, caida: 0.00, prestamo: 0.00 },
    { id: 11099, nombre: 'CARIBBEAN 284', codigo: 'LAN-0284', balance: 549.01, caida: 0.00, prestamo: 0.00 },
    { id: 11109, nombre: 'CARIBBEAN 294', codigo: 'LAN-0294', balance: 395.76, caida: 0.00, prestamo: 200.00 },
    { id: 42652, nombre: 'CARIBBEAN 380', codigo: 'LAN-0380', balance: 68.12, caida: 0.00, prestamo: 500.00 },
    { id: 90, nombre: 'LA CENTRAL 63', codigo: 'LAN-0063', balance: 930.73, caida: 0.00, prestamo: 0.00 },
    { id: 28, nombre: 'LA CENTRAL 01', codigo: 'LAN-0001', balance: 139.26, caida: 0.00, prestamo: 0.00 },
    { id: 37, nombre: 'LA CENTRAL 10', codigo: 'LAN-0010', balance: 796.85, caida: 0.00, prestamo: 0.00 },
    { id: 133, nombre: 'LA CENTRAL 101', codigo: 'LAN-0101', balance: 1492.80, caida: 0.00, prestamo: 0.00 },
    { id: 153, nombre: 'LA CENTRAL 119', codigo: 'LAN-0119', balance: 349.60, caida: 0.00, prestamo: 0.00 },
    { id: 169, nombre: 'LA CENTRAL 135', codigo: 'LAN-0135', balance: 499.20, caida: -1739.20, prestamo: 0.00 },
    { id: 180, nombre: 'LA CENTRAL 146', codigo: 'LAN-0146', balance: 825.40, caida: 0.00, prestamo: 0.00 },
    { id: 195, nombre: 'LA CENTRAL 161', codigo: 'LAN-0161', balance: 654.30, caida: 0.00, prestamo: 100.00 },
    { id: 201, nombre: 'LA CENTRAL 167', codigo: 'LAN-0167', balance: 1125.75, caida: 0.00, prestamo: 0.00 },
    { id: 215, nombre: 'LA CENTRAL 181', codigo: 'LAN-0181', balance: 432.90, caida: 0.00, prestamo: 0.00 },
    { id: 228, nombre: 'LA CENTRAL 194', codigo: 'LAN-0194', balance: 789.50, caida: 0.00, prestamo: 0.00 },
    { id: 241, nombre: 'LA CENTRAL 207', codigo: 'LAN-0207', balance: 563.25, caida: 0.00, prestamo: 0.00 }
  ];

  const empleados: Entity[] = []; // Empty in original
  const bancos: Entity[] = []; // Empty in original
  const zonas: Entity[] = []; // Empty in original
  const otros: Entity[] = []; // Empty in original

  const tabs = ['bancas', 'empleados', 'bancos', 'zonas', 'otros'];

  const getCurrentData = useCallback((): Entity[] => {
    switch (tabs[activeTab]) {
      case 'bancas': return bancas;
      case 'empleados': return empleados;
      case 'bancos': return bancos;
      case 'zonas': return zonas;
      case 'otros': return otros;
      default: return [];
    }
  }, [activeTab]);

  const filteredData = getCurrentData().filter(item => {
    const searchText = quickFilter.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(searchText) ||
      item.codigo?.toLowerCase().includes(searchText) ||
      item.zona?.toLowerCase().includes(searchText)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal === undefined || bVal === undefined) return 0;
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const handleSort = useCallback((column: ColumnKey) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleEdit = useCallback((id: number) => {
    console.log('Edit entity:', id);
    alert(`Editar entidad ${id} (mockup)`);
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  }, []);

  const getColumns = useCallback((): ColumnKey[] => {
    switch (tabs[activeTab]) {
      case 'bancas':
        return ['nombre', 'codigo', 'balance', 'caida', 'prestamo'];
      case 'empleados':
        return ['nombre', 'codigo', 'balance', 'prestamo', 'zona'];
      case 'bancos':
      case 'zonas':
        return ['nombre', 'codigo', 'balance', 'zona'];
      case 'otros':
        return ['nombre', 'codigo'];
      default:
        return [];
    }
  }, [activeTab]);

  const getColumnLabel = useCallback((col: ColumnKey): string => {
    const labels: Record<ColumnKey, string> = {
      nombre: 'Nombre',
      codigo: 'Código',
      balance: 'Balance',
      caida: 'Caída acumulada',
      prestamo: 'Préstamo',
      zona: 'Zona'
    };
    return labels[col] || col;
  }, []);

  const getTabTitle = useCallback((): string => {
    const titles = ['Bancas', 'Empleados', 'Bancos', 'Zonas', 'Otros'];
    return titles[activeTab];
  }, [activeTab]);

  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setQuickFilter('');
  }, []);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuickFilter(e.target.value);
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            TabIndicatorProps={{ style: { backgroundColor: '#51cbce' } }}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Bancas" sx={{ fontSize: '14px', color: activeTab === 0 ? '#51cbce' : '#999' }} />
            <Tab label="Empleados" sx={{ fontSize: '14px', color: activeTab === 1 ? '#51cbce' : '#999' }} />
            <Tab label="Bancos" sx={{ fontSize: '14px', color: activeTab === 2 ? '#51cbce' : '#999' }} />
            <Tab label="Zonas" sx={{ fontSize: '14px', color: activeTab === 3 ? '#51cbce' : '#999' }} />
            <Tab label="Otros" sx={{ fontSize: '14px', color: activeTab === 4 ? '#51cbce' : '#999' }} />
          </Tabs>

          {/* Tab Content */}
          <Box>
            {/* Título */}
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                mb: 4,
                fontSize: '24px',
                fontWeight: 500,
                color: '#2c2c2c'
              }}
            >
              {getTabTitle()}
            </Typography>

            {/* Quick Filter */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <TextField
                placeholder="Filtrado rápido"
                value={quickFilter}
                onChange={handleFilterChange}
                size="small"
                sx={{ width: '300px' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                  sx: { fontSize: '14px' }
                }}
              />
            </Box>

            {/* Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    {getColumns().map(col => (
                      <TableCell key={col} sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>
                        <TableSortLabel
                          active={sortBy === col}
                          direction={sortBy === col ? sortOrder : 'asc'}
                          onClick={() => handleSort(col)}
                        >
                          {getColumnLabel(col)}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.length > 0 ? (
                    sortedData.map((item) => (
                      <TableRow key={item.id} hover>
                        {getColumns().map(col => (
                          <TableCell
                            key={col}
                            sx={{
                              fontSize: '14px',
                              color: col === 'caida' && (item[col] as number) < 0 ? '#dc3545' : '#2c2c2c'
                            }}
                          >
                            {['balance', 'caida', 'prestamo'].includes(col)
                              ? formatCurrency(item[col] as number)
                              : item[col]}
                          </TableCell>
                        ))}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item.id)}
                            sx={{ color: '#51cbce' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={getColumns().length + 1}>
                        <Alert severity="info" sx={{ justifyContent: 'center' }}>
                          No hay entradas disponibles
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer */}
            <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
              Mostrando {sortedData.length} {getCurrentData().length > sortedData.length ? `de ${getCurrentData().length}` : ''} entradas
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountableEntities;
