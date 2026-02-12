import React, { useState, useEffect, useCallback, type ChangeEvent, type DragEvent } from 'react';
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
import type { AlertColor } from '@mui/material/Alert';
import { Search as SearchIcon, Edit as EditIcon, DragIndicator as DragIndicatorIcon, Close as CloseIcon } from '@mui/icons-material';
import { getAllDraws, updateDraw } from '../../../../services/drawService';

type SortOrder = 'asc' | 'desc';
type SortableColumn = 'name' | 'abbreviation' | 'displayOrder';

interface DrawOriginalData {
  drawId: number;
  drawName: string;
  drawTime?: string;
  description?: string;
  abbreviation?: string;
  displayColor?: string;
  displayOrder?: number;
  lotteryColour?: string;
  isActive?: boolean;
}

interface Draw {
  id: number;
  index: number;
  name: string;
  abbreviation: string;
  displayOrder: number;
  color: string;
  originalData: DrawOriginalData;
}

interface DrawsApiResponse {
  success: boolean;
  data?: DrawOriginalData[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface EditForm {
  abbreviation: string;
  displayOrder: number;
  color: string;
}

const DrawsList = (): React.ReactElement => {
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortableColumn | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingDraw, setEditingDraw] = useState<Draw | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ abbreviation: '', displayOrder: 0, color: '#9e9e9e' });
  const [saving, setSaving] = useState<boolean>(false);

  // Load draws desde la API
  useEffect(() => {
    const fetchDraws = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllDraws({ loadAll: true }) as DrawsApiResponse;

        if (response.success && response.data) {
          // Transformar datos de API al formato dthe component
          const transformedDraws: Draw[] = response.data.map((draw, index) => ({
            id: draw.drawId,
            index: index + 1,
            name: draw.drawName,
            abbreviation: draw.abbreviation || '',
            displayOrder: draw.displayOrder || 0,
            color: draw.displayColor || draw.lotteryColour || '#9e9e9e',
            originalData: draw
          }));
          setDraws(transformedDraws);
        } else {
          setError('No se pudieron cargar los sorteos');
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error loading draws:', err);
        setError('Error al cargar los sorteos: ' + (error.message || 'Error desconocido'));
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

  const handleSort = useCallback((column: SortableColumn) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const handleColorChange = useCallback(async (id: number, newColor: string) => {
    // Update estado local inmediatamente para UX responsiva
    setDraws(prev => prev.map(d => d.id === id ? { ...d, color: newColor } : d));

    // Encontrar el draw para obtener los datos originales
    const draw = draws.find(d => d.id === id);
    if (!draw) return;

    try {
      // Save en la API
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
      const error = err as Error;
      console.error('Error updating color:', err);
      // Revertir el color si falla
      setDraws(prev => prev.map(d => d.id === id ? { ...d, color: draw.color } : d));
      setSnackbar({
        open: true,
        message: 'Error al guardar el color: ' + (error.message || 'Error desconocido'),
        severity: 'error'
      });
    }
  }, [draws]);

  const handleEdit = useCallback((id: number) => {
    const draw = draws.find(d => d.id === id);
    if (draw) {
      setEditingDraw(draw);
      setEditForm({
        abbreviation: draw.abbreviation || '',
        displayOrder: draw.displayOrder || 0,
        color: draw.color || '#9e9e9e'
      });
      setEditModalOpen(true);
    }
  }, [draws]);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setEditingDraw(null);
    setEditForm({ abbreviation: '', displayOrder: 0, color: '#9e9e9e' });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingDraw) return;

    setSaving(true);
    try {
      await updateDraw(editingDraw.id, {
        drawName: editingDraw.originalData.drawName,
        drawTime: editingDraw.originalData.drawTime,
        description: editingDraw.originalData.description,
        abbreviation: editForm.abbreviation,
        displayOrder: editForm.displayOrder,
        displayColor: editForm.color,
        isActive: editingDraw.originalData.isActive
      });

      // Update estado local
      setDraws(prev => prev.map(d =>
        d.id === editingDraw.id
          ? { ...d, abbreviation: editForm.abbreviation, displayOrder: editForm.displayOrder, color: editForm.color }
          : d
      ));

      setSnackbar({
        open: true,
        message: `Sorteo "${editingDraw.name}" actualizado correctamente`,
        severity: 'success'
      });

      handleCloseEditModal();
    } catch (err) {
      const error = err as Error;
      console.error('Error updating draw:', err);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el sorteo: ' + (error.message || 'Error desconocido'),
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  }, [editingDraw, editForm, handleCloseEditModal]);

  const handleDragStart = useCallback((e: DragEvent<HTMLTableRowElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Auto-scroll when dragging near viewport edges
    const scrollMargin = 80;
    const scrollSpeed = 15;
    const y = e.clientY;

    if (y < scrollMargin) {
      window.scrollBy(0, -scrollSpeed);
    } else if (y > window.innerHeight - scrollMargin) {
      window.scrollBy(0, scrollSpeed);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex === dropIndex) return;

    setDraws(prev => {
      const newDraws = [...prev];
      const [draggedDraw] = newDraws.splice(dragIndex, 1);
      newDraws.splice(dropIndex, 0, draggedDraw);

      // Update indices
      return newDraws.map((d, idx) => ({ ...d, index: idx + 1 }));
    });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuickFilter(e.target.value);
  }, []);

  const handleColorInputChange = useCallback((id: number) => (e: ChangeEvent<HTMLInputElement>) => {
    handleColorChange(id, e.target.value);
  }, [handleColorChange]);

  const handleEditFormAbbreviationChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, abbreviation: e.target.value }));
  }, []);

  const handleEditFormDisplayOrderChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }));
  }, []);

  const handleEditFormColorChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEditForm(prev => ({ ...prev, color: e.target.value }));
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
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
                <TableRow sx={{ bgcolor: '#e3e3e3' }}>
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
                  <TableCell sx={{ fontSize: '14px', fontWeight: 600, color: '#787878', width: '80px', py: 2 }}>
                    <TableSortLabel
                      active={sortBy === 'displayOrder'}
                      direction={sortBy === 'displayOrder' ? sortOrder : 'asc'}
                      onClick={() => handleSort('displayOrder')}
                    >
                      Orden
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
                      <TableCell sx={{ fontSize: '16px', py: 2, textAlign: 'center' }}>{draw.displayOrder}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <input
                          type="color"
                          value={draw.color}
                          onChange={handleColorInputChange(draw.id)}
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
                          sx={{ color: '#8b5cf6' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', color: '#999', py: 3 }}>
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
                onChange={handleEditFormAbbreviationChange}
                fullWidth
                size="small"
                placeholder="Ingrese la abreviación"
              />

              {/* Orden de visualización */}
              <TextField
                label="Orden de visualización"
                type="number"
                value={editForm.displayOrder}
                onChange={handleEditFormDisplayOrderChange}
                fullWidth
                size="small"
                placeholder="0"
                helperText="Menor número = aparece primero"
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
                    onChange={handleEditFormColorChange}
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
                    onChange={handleEditFormColorChange}
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
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
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
