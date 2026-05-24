import React, { useState, useCallback, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Collector {
  id: number;
  usuario: string;
  bancas: string;
  bancos: string;
}

interface FormData {
  usuario: string;
  bancas: string;
  zonas: string;
  bancos: string;
}

const initialFormData: FormData = {
  usuario: '',
  bancas: '',
  zonas: '',
  bancos: ''
};

const ManageDebtCollectors = (): React.ReactElement => {
  const { t } = useTranslation();
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Mockup data
  const [collectors, setCollectors] = useState<Collector[]>([
    { id: 1, usuario: 'lanfranco', bancas: '', bancos: 'BANCO LA CENTRAL' },
    { id: 2, usuario: 'maria', bancas: 'LA CENTRAL 01, LA CENTRAL 02', bancos: 'BANCO POPULAR' },
    { id: 3, usuario: 'jose', bancas: 'BANCA NORTE', bancos: 'BANCO BHD' }
  ]);

  const filteredCollectors: Collector[] = collectors.filter(c =>
    c.usuario.toLowerCase().includes(quickFilter.toLowerCase()) ||
    c.bancas.toLowerCase().includes(quickFilter.toLowerCase()) ||
    c.bancos.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const handleFormChange = useCallback((field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setQuickFilter(e.target.value);
  }, []);

  const handleAgregar = useCallback((): void => {
    if (!formData.usuario || !formData.bancos) {
      alert(t('collectorsAdmin.manage.msgFillRequired'));
      return;
    }

    const newCollector: Collector = {
      id: collectors.length + 1,
      usuario: formData.usuario,
      bancas: formData.bancas,
      bancos: formData.bancos
    };

    setCollectors(prev => [...prev, newCollector]);

    // Reset form
    setFormData(initialFormData);

    alert(t('collectorsAdmin.manage.msgAdded'));
  }, [formData, collectors.length, t]);

  const handleEdit = useCallback((id: number): void => {
    alert(t('collectorsAdmin.manage.msgEditMock', { id }));
  }, [t]);

  const handleDelete = useCallback((id: number): void => {
    if (window.confirm(t('collectorsAdmin.manage.confirmDelete'))) {
      setCollectors(prev => prev.filter(c => c.id !== id));
    }
  }, [t]);

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 4 } }}>
          {/* Título */}
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: { xs: 2, sm: 4 },
              fontSize: { xs: '18px', sm: '24px' },
              fontWeight: 500,
              color: '#2c2c2c'
            }}
          >
            {t('collectorsAdmin.manage.title')}
          </Typography>

          {/* Formulario */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            {/* Usuario */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>{t('collectorsAdmin.manage.userLabel')}</InputLabel>
              <Select
                value={formData.usuario}
                onChange={(e) => handleFormChange('usuario', e.target.value)}
                label={t('collectorsAdmin.manage.userLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>{t('collectorsAdmin.manage.selectPlaceholder')}</em></MenuItem>
                <MenuItem value="admin" sx={{ fontSize: '14px' }}>admin</MenuItem>
                <MenuItem value="carlos" sx={{ fontSize: '14px' }}>carlos</MenuItem>
                <MenuItem value="pedro" sx={{ fontSize: '14px' }}>pedro</MenuItem>
                <MenuItem value="ana" sx={{ fontSize: '14px' }}>ana</MenuItem>
              </Select>
            </FormControl>

            {/* Bancas */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>{t('collectorsAdmin.manage.bettingPoolsLabel')}</InputLabel>
              <Select
                value={formData.bancas}
                onChange={(e) => handleFormChange('bancas', e.target.value)}
                label={t('collectorsAdmin.manage.bettingPoolsLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>{t('collectorsAdmin.manage.selectPlaceholder')}</em></MenuItem>
                <MenuItem value="LA CENTRAL 01" sx={{ fontSize: '14px' }}>LA CENTRAL 01</MenuItem>
                <MenuItem value="LA CENTRAL 02" sx={{ fontSize: '14px' }}>LA CENTRAL 02</MenuItem>
                <MenuItem value="BANCA NORTE" sx={{ fontSize: '14px' }}>BANCA NORTE</MenuItem>
                <MenuItem value="BANCA SUR" sx={{ fontSize: '14px' }}>BANCA SUR</MenuItem>
              </Select>
            </FormControl>

            {/* Zonas */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>{t('collectorsAdmin.manage.zonesLabel')}</InputLabel>
              <Select
                value={formData.zonas}
                onChange={(e) => handleFormChange('zonas', e.target.value)}
                label={t('collectorsAdmin.manage.zonesLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>{t('collectorsAdmin.manage.selectPlaceholder')}</em></MenuItem>
                <MenuItem value="Zona Norte" sx={{ fontSize: '14px' }}>Zona Norte</MenuItem>
                <MenuItem value="Zona Sur" sx={{ fontSize: '14px' }}>Zona Sur</MenuItem>
                <MenuItem value="Zona Este" sx={{ fontSize: '14px' }}>Zona Este</MenuItem>
                <MenuItem value="Zona Oeste" sx={{ fontSize: '14px' }}>Zona Oeste</MenuItem>
              </Select>
            </FormControl>

            {/* Bancos */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>{t('collectorsAdmin.manage.banksLabel')}</InputLabel>
              <Select
                value={formData.bancos}
                onChange={(e) => handleFormChange('bancos', e.target.value)}
                label={t('collectorsAdmin.manage.banksLabel')}
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>{t('collectorsAdmin.manage.selectPlaceholder')}</em></MenuItem>
                <MenuItem value="BANCO LA CENTRAL" sx={{ fontSize: '14px' }}>BANCO LA CENTRAL</MenuItem>
                <MenuItem value="BANCO POPULAR" sx={{ fontSize: '14px' }}>BANCO POPULAR</MenuItem>
                <MenuItem value="BANCO BHD" sx={{ fontSize: '14px' }}>BANCO BHD</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Botón Agregar */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              onClick={handleAgregar}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
                fontSize: '14px',
                px: 5,
                py: 1.5,
                textTransform: 'none'
              }}
            >
              {t('collectorsAdmin.manage.addButton')}
            </Button>
          </Box>

          {/* Quick Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              placeholder={t('collectorsAdmin.manage.quickFilterPlaceholder')}
              value={quickFilter}
              onChange={handleQuickFilterChange}
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
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#e3e3e3' }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>{t('collectorsAdmin.manage.headerUser')}</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>{t('collectorsAdmin.manage.headerBettingPools')}</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>{t('collectorsAdmin.manage.headerBanks')}</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', textAlign: 'center' }}>{t('collectorsAdmin.manage.headerActions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCollectors.length > 0 ? (
                  filteredCollectors.map((collector) => (
                    <TableRow key={collector.id} hover>
                      <TableCell sx={{ fontSize: '14px' }}>{collector.usuario}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{collector.bancas}</TableCell>
                      <TableCell sx={{ fontSize: '14px' }}>{collector.bancos}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(collector.id)}
                          sx={{ color: '#28a745', mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(collector.id)}
                          sx={{ color: '#dc3545' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', color: '#999', py: 3 }}>
                      {t('collectorsAdmin.manage.noEntries')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
            {t('collectorsAdmin.manage.showingEntries', { shown: filteredCollectors.length, total: collectors.length })}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManageDebtCollectors;
