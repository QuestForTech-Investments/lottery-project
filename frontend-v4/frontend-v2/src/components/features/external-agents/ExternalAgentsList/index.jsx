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
 * ExternalAgentsList Component (Material-UI V2)
 *
 * Lista y CRUD de agentes externos
 */
const ExternalAgentsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Mockup data - 10 agentes externos
  const [agents] = useState([
    { id: 1, nombre: 'Agente Norte 1', codigo: 'AN001', contacto: 'Juan Pérez', telefono: '555-0101', email: 'juan@norte1.com', comision: 15.00, activo: true },
    { id: 2, nombre: 'Agente Sur 2', codigo: 'AS002', contacto: 'María García', telefono: '555-0102', email: 'maria@sur2.com', comision: 12.50, activo: true },
    { id: 3, nombre: 'Agente Este 3', codigo: 'AE003', contacto: 'Carlos López', telefono: '555-0103', email: 'carlos@este3.com', comision: 10.00, activo: true },
    { id: 4, nombre: 'Agente Oeste 4', codigo: 'AO004', contacto: 'Ana Martínez', telefono: '555-0104', email: 'ana@oeste4.com', comision: 13.00, activo: false },
    { id: 5, nombre: 'Agente Central 5', codigo: 'AC005', contacto: 'Luis Rodríguez', telefono: '555-0105', email: 'luis@central5.com', comision: 11.50, activo: true },
    { id: 6, nombre: 'Agente Premium 6', codigo: 'AP006', contacto: 'Sofia Hernández', telefono: '555-0106', email: 'sofia@premium6.com', comision: 18.00, activo: true },
    { id: 7, nombre: 'Agente Express 7', codigo: 'AX007', contacto: 'Miguel Torres', telefono: '555-0107', email: 'miguel@express7.com', comision: 14.00, activo: true },
    { id: 8, nombre: 'Agente Rápido 8', codigo: 'AR008', contacto: 'Laura Díaz', telefono: '555-0108', email: 'laura@rapido8.com', comision: 9.50, activo: false },
    { id: 9, nombre: 'Agente Plus 9', codigo: 'AP009', contacto: 'Pedro Ramírez', telefono: '555-0109', email: 'pedro@plus9.com', comision: 16.00, activo: true },
    { id: 10, nombre: 'Agente Gold 10', codigo: 'AG010', contacto: 'Carmen Flores', telefono: '555-0110', email: 'carmen@gold10.com', comision: 20.00, activo: true }
  ]);

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = [...agents];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [agents, searchTerm, sortConfig]);

  const handleEdit = (id) => {
    console.log('Editar agente:', id);
    alert(`Editar agente #${id} (mockup)`);
  };

  const handleDelete = (id) => {
    console.log('Eliminar agente:', id);
    if (window.confirm('¿Está seguro de eliminar este agente externo?')) {
      alert(`Agente #${id} eliminado (mockup)`);
    }
  };

  const handleInfo = (id) => {
    const agent = agents.find(a => a.id === id);
    alert(`Información del agente:\n\nNombre: ${agent.nombre}\nCódigo: ${agent.codigo}\nContacto: ${agent.contacto}\nTeléfono: ${agent.telefono}\nEmail: ${agent.email}\nComisión: ${agent.comision}%\nEstado: ${agent.activo ? 'Activo' : 'Inactivo'}`);
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
            Lista de agentes externos
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
                    onClick={() => handleSort('codigo')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    Código {sortConfig.key === 'codigo' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('contacto')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  >
                    Contacto {sortConfig.key === 'contacto' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    Teléfono
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                    Email
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('comision')}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, textAlign: 'right' }}
                  >
                    Comisión (%) {sortConfig.key === 'comision' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
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
                {filteredAndSortedAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5, color: '#999', fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                      No se encontraron agentes externos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedAgents.map((agent) => (
                    <TableRow key={agent.id} hover>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {agent.id}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {agent.nombre}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                        {agent.codigo}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {agent.contacto}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}>
                        {agent.telefono}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', fontFamily: 'Montserrat, sans-serif' }}>
                        {agent.email}
                      </TableCell>
                      <TableCell sx={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif', textAlign: 'right' }}>
                        {agent.comision.toFixed(2)}%
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={agent.activo ? 'Activo' : 'Inactivo'}
                          color={agent.activo ? 'success' : 'error'}
                          size="small"
                          sx={{ fontSize: '12px', fontFamily: 'Montserrat, sans-serif' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleInfo(agent.id)}
                          sx={{ color: '#17a2b8', mr: 0.5 }}
                          title="Ver información"
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(agent.id)}
                          sx={{ color: '#007bff', mr: 0.5 }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(agent.id)}
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
            Mostrando {filteredAndSortedAgents.length} de {agents.length} entradas
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExternalAgentsList;
