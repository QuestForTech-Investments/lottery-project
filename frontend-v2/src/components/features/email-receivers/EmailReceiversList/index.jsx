import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

/**
 * EmailReceiversList Component (Material-UI V2)
 *
 * Lista de receptores de correo con funcionalidad CRUD
 */
const EmailReceiversList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mockup data - 10 receptores de correo
  const [receivers] = useState([
    { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@empresa.com', tipoNotificacion: 'Reportes diarios', activo: true },
    { id: 2, nombre: 'María García', email: 'maria.garcia@empresa.com', tipoNotificacion: 'Alertas de ventas', activo: true },
    { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@empresa.com', tipoNotificacion: 'Notificaciones de premios', activo: true },
    { id: 4, nombre: 'Ana Martínez', email: 'ana.martinez@empresa.com', tipoNotificacion: 'Resumen semanal', activo: false },
    { id: 5, nombre: 'Luis Rodríguez', email: 'luis.rodriguez@empresa.com', tipoNotificacion: 'Alertas de sistema', activo: true },
    { id: 6, nombre: 'Sofia Hernández', email: 'sofia.hernandez@empresa.com', tipoNotificacion: 'Todas las notificaciones', activo: true },
    { id: 7, nombre: 'Miguel Torres', email: 'miguel.torres@empresa.com', tipoNotificacion: 'Reportes diarios', activo: true },
    { id: 8, nombre: 'Laura Díaz', email: 'laura.diaz@empresa.com', tipoNotificacion: 'Alertas de ventas', activo: false },
    { id: 9, nombre: 'Pedro Ramírez', email: 'pedro.ramirez@empresa.com', tipoNotificacion: 'Resumen semanal', activo: true },
    { id: 10, nombre: 'Carmen Flores', email: 'carmen.flores@empresa.com', tipoNotificacion: 'Todas las notificaciones', activo: true }
  ]);

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort receivers
  const filteredAndSortedReceivers = useMemo(() => {
    let filtered = [...receivers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(receiver =>
        receiver.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receiver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receiver.tipoNotificacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [receivers, searchTerm, sortConfig]);

  const handleEdit = (id) => {
    console.log('Editar receptor:', id);
    alert(`Editar receptor #${id} (mockup)`);
  };

  const handleDelete = (id) => {
    console.log('Eliminar receptor:', id);
    if (window.confirm('¿Está seguro de eliminar este receptor de correo?')) {
      alert(`Receptor #${id} eliminado (mockup)`);
    }
  };

  const handleInfo = (id) => {
    const receiver = receivers.find(r => r.id === id);
    alert(`Información del receptor:\n\nNombre: ${receiver.nombre}\nEmail: ${receiver.email}\nTipo de notificación: ${receiver.tipoNotificacion}\nEstado: ${receiver.activo ? 'Activo' : 'Inactivo'}`);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 1400, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              color: '#2c2c2c'
            }}
          >
            Lista de receptores de correo
          </Typography>

          {/* Filtro rápido */}
          <Box sx={{ mb: 3, maxWidth: 400 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filtrado rápido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }
              }}
            />
          </Box>

          {/* Tabla */}
          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell
                    onClick={() => handleSort('id')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    # {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('nombre')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    Nombre {sortConfig.key === 'nombre' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('email')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    Correo electrónico {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('tipoNotificacion')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    Tipo de notificación {sortConfig.key === 'tipoNotificacion' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('activo')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textAlign: 'center' }}
                  >
                    Estado {sortConfig.key === 'activo' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textAlign: 'center' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedReceivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#999', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                      No se encontraron receptores de correo
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedReceivers.map((receiver) => (
                    <TableRow key={receiver.id} hover>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {receiver.id}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {receiver.nombre}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                        {receiver.email}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {receiver.tipoNotificacion}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={receiver.activo ? 'Activo' : 'Inactivo'}
                          color={receiver.activo ? 'success' : 'error'}
                          size="small"
                          sx={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleInfo(receiver.id)}
                          sx={{ color: '#17a2b8', mr: 0.5 }}
                          title="Ver información"
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(receiver.id)}
                          sx={{ color: '#007bff', mr: 0.5 }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(receiver.id)}
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
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid #dee2e6',
              fontSize: '14px',
              color: '#666',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            Mostrando {filteredAndSortedReceivers.length} de {receivers.length} entradas
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmailReceiversList;
