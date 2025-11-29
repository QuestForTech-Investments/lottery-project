import React, { useState, useCallback, type ChangeEvent } from 'react';
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
      alert('Por favor complete los campos obligatorios');
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

    alert('Cobrador agregado exitosamente');
  }, [formData, collectors.length]);

  const handleEdit = useCallback((id: number): void => {
    console.log('Edit collector:', id);
    alert(`Editar cobrador ${id} (mockup)`);
  }, []);

  const handleDelete = useCallback((id: number): void => {
    if (window.confirm('¿Está seguro que desea eliminar este cobrador?')) {
      setCollectors(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
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
            Manejo de cobradores
          </Typography>

          {/* Formulario */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            {/* Usuario */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Usuario</InputLabel>
              <Select
                value={formData.usuario}
                onChange={(e) => handleFormChange('usuario', e.target.value)}
                label="Usuario"
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>Seleccione</em></MenuItem>
                <MenuItem value="admin" sx={{ fontSize: '14px' }}>admin</MenuItem>
                <MenuItem value="carlos" sx={{ fontSize: '14px' }}>carlos</MenuItem>
                <MenuItem value="pedro" sx={{ fontSize: '14px' }}>pedro</MenuItem>
                <MenuItem value="ana" sx={{ fontSize: '14px' }}>ana</MenuItem>
              </Select>
            </FormControl>

            {/* Bancas */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Bancas</InputLabel>
              <Select
                value={formData.bancas}
                onChange={(e) => handleFormChange('bancas', e.target.value)}
                label="Bancas"
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>Seleccione</em></MenuItem>
                <MenuItem value="LA CENTRAL 01" sx={{ fontSize: '14px' }}>LA CENTRAL 01</MenuItem>
                <MenuItem value="LA CENTRAL 02" sx={{ fontSize: '14px' }}>LA CENTRAL 02</MenuItem>
                <MenuItem value="BANCA NORTE" sx={{ fontSize: '14px' }}>BANCA NORTE</MenuItem>
                <MenuItem value="BANCA SUR" sx={{ fontSize: '14px' }}>BANCA SUR</MenuItem>
              </Select>
            </FormControl>

            {/* Zonas */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Zonas</InputLabel>
              <Select
                value={formData.zonas}
                onChange={(e) => handleFormChange('zonas', e.target.value)}
                label="Zonas"
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>Seleccione</em></MenuItem>
                <MenuItem value="Zona Norte" sx={{ fontSize: '14px' }}>Zona Norte</MenuItem>
                <MenuItem value="Zona Sur" sx={{ fontSize: '14px' }}>Zona Sur</MenuItem>
                <MenuItem value="Zona Este" sx={{ fontSize: '14px' }}>Zona Este</MenuItem>
                <MenuItem value="Zona Oeste" sx={{ fontSize: '14px' }}>Zona Oeste</MenuItem>
              </Select>
            </FormControl>

            {/* Bancos */}
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '12px' }}>Bancos</InputLabel>
              <Select
                value={formData.bancos}
                onChange={(e) => handleFormChange('bancos', e.target.value)}
                label="Bancos"
                sx={{ fontSize: '14px' }}
              >
                <MenuItem value=""><em>Seleccione</em></MenuItem>
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
              AGREGAR
            </Button>
          </Box>

          {/* Quick Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              placeholder="Filtrado rápido"
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
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Usuario</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Bancas</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878' }}>Bancos</TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#787878', textAlign: 'center' }}>Actions</TableCell>
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
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
            Mostrando {filteredCollectors.length} de {collectors.length} entradas
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ManageDebtCollectors;
