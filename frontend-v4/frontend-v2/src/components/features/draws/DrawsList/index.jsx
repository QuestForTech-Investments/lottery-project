import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, DragIndicator as DragIndicatorIcon, Close as CloseIcon } from '@mui/icons-material';
import { getAllDraws, updateDraw } from '../../../../services/drawService';

const DrawsList = () => {
  const [quickFilter, setQuickFilter] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado para el modal de edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDraw, setEditingDraw] = useState(null);
  const [editForm, setEditForm] = useState({ abbreviation: '', color: '#9e9e9e' });
  const [saving, setSaving] = useState(false);

  // Cargar draws desde la API
  useEffect(() => {
    const fetchDraws = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllDraws({ loadAll: true });

        if (response.success && response.data) {
          // Transformar datos de API al formato del componente
          const transformedDraws = response.data.map((draw, index) => ({
            id: draw.drawId,
            index: index + 1,
            name: draw.drawName,
            abbreviation: draw.abbreviation || '',
            color: draw.displayColor || draw.lotteryColour || '#9e9e9e',
            // Guardar datos originales para la actualización
            originalData: draw
          }));
          setDraws(transformedDraws);
        } else {
          setError('No se pudieron cargar los sorteos');
        }
      } catch (err) {
        console.error('Error loading draws:', err);
        setError('Error al cargar los sorteos: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, []);

  const filteredDraws = draws.filter(d =>
    d.name.toLowerCase().includes(quickFilter.toLowerCase()) ||
    d.abbreviation.toLowerCase().includes(quickFilter.toLowerCase())
  );

  const sortedDraws = [...filteredDraws].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleColorChange = async (id, newColor) => {
    // Actualizar estado local inmediatamente para UX responsiva
    setDraws(draws.map(d => d.id === id ? { ...d, color: newColor } : d));

    // Encontrar el draw para obtener los datos originales
    const draw = draws.find(d => d.id === id);
    if (!draw) return;

    try {
      // Guardar en la API
      await updateDraw(id, {
        drawName: draw.originalData.drawName,
        drawTime: draw.originalData.drawTime,
        description: draw.originalData.description,
        abbreviation: draw.originalData.abbreviation,
        displayColor: newColor,
        isActive: draw.originalData.isActive
      });

      setSnackbar({
        open: true,
        message: `Color actualizado para "${draw.name}"`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating color:', err);
      // Revertir el color si falla
      setDraws(draws.map(d => d.id === id ? { ...d, color: draw.color } : d));
      setSnackbar({
        open: true,
        message: 'Error al guardar el color: ' + (err.message || 'Error desconocido'),
        severity: 'error'
      });
    }
  };

  const handleEdit = (id) => {
    const draw = draws.find(d => d.id === id);
    if (draw) {
      setEditingDraw(draw);
      setEditForm({
        abbreviation: draw.abbreviation || '',
        color: draw.color || '#9e9e9e'
      });
      setEditModalOpen(true);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingDraw(null);
    setEditForm({ abbreviation: '', color: '#9e9e9e' });
  };

  const handleSaveEdit = async () => {
    if (!editingDraw) return;

    setSaving(true);
    try {
      await updateDraw(editingDraw.id, {
        drawName: editingDraw.originalData.drawName,
        drawTime: editingDraw.originalData.drawTime,
        description: editingDraw.originalData.description,
        abbreviation: editForm.abbreviation,
        displayColor: editForm.color,
        isActive: editingDraw.originalData.isActive
      });

      // Actualizar estado local
      setDraws(draws.map(d =>
        d.id === editingDraw.id
          ? { ...d, abbreviation: editForm.abbreviation, color: editForm.color }
          : d
      ));

      setSnackbar({
        open: true,
        message: `Sorteo "${editingDraw.name}" actualizado correctamente`,
        severity: 'success'
      });

      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating draw:', err);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el sorteo: ' + (err.message || 'Error desconocido'),
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex === dropIndex) return;

    const newDraws = [...draws];
    const [draggedDraw] = newDraws.splice(dragIndex, 1);
    newDraws.splice(dropIndex, 0, draggedDraw);

    // Update indices
    const reindexed = newDraws.map((d, idx) => ({ ...d, index: idx + 1 }));
    setDraws(reindexed);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#51cbce' }} />
        <Typography sx={{ ml: 2, color: '#666' }}>Cargando sorteos...</Typography>
      </Box>
    );
  }

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
            Lista de sorteos
          </Typography>

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Quick Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <TextField
              placeholder="Filtrado rápido"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
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
                  <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#787878', width: '70px', py: 2 }}>Index</TableCell>
                  <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#787878', py: 2 }}>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#787878', py: 2 }}>
                    <TableSortLabel
                      active={sortBy === 'abbreviation'}
                      direction={sortBy === 'abbreviation' ? sortOrder : 'asc'}
                      onClick={() => handleSort('abbreviation')}
                    >
                      Abreviación
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#787878', width: '120px', py: 2 }}>Color</TableCell>
                  <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#787878', textAlign: 'center', width: '120px', py: 2 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedDraws.length > 0 ? (
                  sortedDraws.map((draw, idx) => (
                    <TableRow
                      key={draw.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      hover
                      sx={{ cursor: 'move', height: '56px' }}
                    >
                      <TableCell sx={{ fontSize: '16px', py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DragIndicatorIcon sx={{ color: '#999', fontSize: '24px' }} />
                          {draw.index}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '16px', py: 2, fontWeight: 500 }}>{draw.name}</TableCell>
                      <TableCell sx={{ fontSize: '16px', py: 2 }}>{draw.abbreviation}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <input
                          type="color"
                          value={draw.color}
                          onChange={(e) => handleColorChange(draw.id, e.target.value)}
                          style={{
                            width: '60px',
                            height: '40px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 2 }}>
                        <IconButton
                          size="medium"
                          onClick={() => handleEdit(draw.id)}
                          sx={{ color: '#51cbce' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#999', py: 3 }}>
                      No hay entradas disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Typography sx={{ textAlign: 'center', fontSize: '12px', color: '#999', mt: 2 }}>
            Mostrando {sortedDraws.length} de {draws.length} entradas
          </Typography>
        </CardContent>
      </Card>

      {/* Modal de edición */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Editar sorteo
          </Typography>
          <IconButton onClick={handleCloseEditModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {editingDraw && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Nombre del sorteo (solo lectura) */}
              <TextField
                label="Nombre del sorteo"
                value={editingDraw.name}
                disabled
                fullWidth
                size="small"
              />

              {/* Abreviación */}
              <TextField
                label="Abreviación"
                value={editForm.abbreviation}
                onChange={(e) => setEditForm({ ...editForm, abbreviation: e.target.value })}
                fullWidth
                size="small"
                placeholder="Ingrese la abreviación"
              />

              {/* Color */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                  Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="color"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    style={{
                      width: '80px',
                      height: '45px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '2px'
                    }}
                  />
                  <TextField
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    size="small"
                    sx={{ width: '120px' }}
                    placeholder="#000000"
                  />
                  <Box
                    sx={{
                      width: '45px',
                      height: '45px',
                      bgcolor: editForm.color,
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseEditModal}
            variant="outlined"
            sx={{ color: '#666', borderColor: '#ddd' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={saving}
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {saving ? 'Guardando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DrawsList;
