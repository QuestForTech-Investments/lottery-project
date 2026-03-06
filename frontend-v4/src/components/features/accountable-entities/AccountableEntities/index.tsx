import React, { useState, useCallback, useEffect, useMemo, type SyntheticEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatCurrency';
import api from '../../../../services/api';
import { getAccountableEntities, type AccountableEntityAPI } from '../../../../services/accountableEntityService';

type SortOrder = 'asc' | 'desc';

interface Entity {
  id: number;
  nombre: string;
  codigo: string;
  balance?: number;
  caida?: number;
  prestamo?: number;
  zona?: string;
  entityType?: string;
}

type ColumnKey = 'nombre' | 'codigo' | 'balance' | 'caida' | 'prestamo' | 'zona';

const getValueColor = (value: number | undefined): string => {
  if (value === undefined || value === null) return '#2c2c2c';
  if (value > 0) return '#2e7d32';
  if (value < 0) return '#c62828';
  return '#1565c0';
};

const AccountableEntities = (): React.ReactElement => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<ColumnKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [bancas, setBancas] = useState<Entity[]>([]);
  const [accountableEntities, setAccountableEntities] = useState<AccountableEntityAPI[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load bancas (betting pools with live balance) and accountable entities in parallel
        const [bpResponse, entities] = await Promise.all([
          api.get('/betting-pools?isActive=true&pageSize=500') as Promise<{
            items: Array<{
              bettingPoolId: number;
              bettingPoolCode: string;
              bettingPoolName: string;
              zoneName: string | null;
              balance: number;
            }>;
          }>,
          getAccountableEntities({ isActive: true })
        ]);

        const bpItems = bpResponse.items || [];
        setBancas(bpItems.map(bp => ({
          id: bp.bettingPoolId,
          nombre: bp.bettingPoolName,
          codigo: bp.bettingPoolCode,
          balance: bp.balance,
          caida: 0,
          prestamo: 0,
          zona: bp.zoneName || ''
        })));

        setAccountableEntities(entities);
      } catch (err) {
        console.error('Error loading entities:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const bancos = useMemo(() =>
    accountableEntities
      .filter(e => e.entityType === 'Banco')
      .map(e => ({
        id: e.entityId,
        nombre: e.entityName,
        codigo: e.entityCode,
        balance: e.currentBalance,
        zona: e.zoneName || ''
      })),
    [accountableEntities]
  );

  const otros = useMemo(() =>
    accountableEntities
      .filter(e => e.entityType === 'Otro')
      .map(e => ({
        id: e.entityId,
        nombre: e.entityName,
        codigo: e.entityCode,
        balance: e.currentBalance,
        zona: e.zoneName || ''
      })),
    [accountableEntities]
  );

  const tabs = ['bancas', 'empleados', 'bancos', 'zonas', 'otros'];

  const getCurrentData = useCallback((): Entity[] => {
    switch (tabs[activeTab]) {
      case 'bancas': return bancas;
      case 'bancos': return bancos;
      case 'otros': return otros;
      default: return [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, bancas, bancos, otros]);

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
    const currentTab = tabs[activeTab];
    if (currentTab === 'bancas') {
      navigate(`/betting-pools/edit/${id}`);
    } else {
      alert(`Editar entidad ${id}`);
    }
  }, [activeTab, navigate]);

  const getColumns = useCallback((): ColumnKey[] => {
    switch (tabs[activeTab]) {
      case 'bancas':
        return ['nombre', 'codigo', 'balance', 'caida', 'prestamo'];
      case 'empleados':
        return ['nombre', 'codigo', 'balance', 'prestamo', 'zona'];
      case 'bancos':
        return ['nombre', 'codigo', 'balance', 'zona'];
      case 'zonas':
        return ['nombre', 'codigo', 'balance', 'zona'];
      case 'otros':
        return ['nombre', 'codigo', 'balance', 'zona'];
      default:
        return [];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isCurrencyColumn = (col: ColumnKey) => ['balance', 'caida', 'prestamo'].includes(col);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            TabIndicatorProps={{ style: { backgroundColor: '#8b5cf6' } }}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Bancas" sx={{ fontSize: '14px', color: activeTab === 0 ? '#8b5cf6' : '#999' }} />
            <Tab label="Empleados" sx={{ fontSize: '14px', color: activeTab === 1 ? '#8b5cf6' : '#999' }} />
            <Tab label="Bancos" sx={{ fontSize: '14px', color: activeTab === 2 ? '#8b5cf6' : '#999' }} />
            <Tab label="Zonas" sx={{ fontSize: '14px', color: activeTab === 3 ? '#8b5cf6' : '#999' }} />
            <Tab label="Otros" sx={{ fontSize: '14px', color: activeTab === 4 ? '#8b5cf6' : '#999' }} />
          </Tabs>

          {/* Tab Content */}
          <Box>
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                        {getColumns().map(col => (
                          <TableCell
                            key={col}
                            sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                            align="center"
                          >
                            <TableSortLabel
                              active={sortBy === col}
                              direction={sortBy === col ? sortOrder : 'asc'}
                              onClick={() => handleSort(col)}
                            >
                              {getColumnLabel(col)}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                        <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textAlign: 'center' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedData.length > 0 ? (
                        sortedData.map((item) => (
                          <TableRow key={item.id} hover>
                            {getColumns().map(col => (
                              <TableCell
                                key={col}
                                align="center"
                                sx={{
                                  fontSize: '14px',
                                  color: isCurrencyColumn(col)
                                    ? getValueColor(item[col] as number)
                                    : '#2c2c2c',
                                  fontWeight: isCurrencyColumn(col) ? 600 : 400
                                }}
                              >
                                {isCurrencyColumn(col)
                                  ? formatCurrency(item[col] as number)
                                  : item[col]}
                              </TableCell>
                            ))}
                            <TableCell sx={{ textAlign: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(item.id)}
                                sx={{ color: '#8b5cf6' }}
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

                <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
                  Mostrando {sortedData.length} {getCurrentData().length > sortedData.length ? `de ${getCurrentData().length}` : ''} entradas
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccountableEntities;
