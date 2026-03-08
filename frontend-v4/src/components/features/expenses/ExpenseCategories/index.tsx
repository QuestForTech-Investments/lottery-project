import React, { useState, useEffect, useMemo, useCallback, type SyntheticEvent } from 'react';
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
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  type ExpenseCategoryAPI
} from '@services/expenseCategoryService';

type SortDirection = 'asc' | 'desc';
type SortKey = 'categoryName' | 'parentCategoryName' | null;

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const ExpenseCategories = (): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [quickFilter, setQuickFilter] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [loading, setLoading] = useState(true);

  // Data
  const [categories, setCategories] = useState<ExpenseCategoryAPI[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryAPI | null>(null);
  const [dialogName, setDialogName] = useState('');
  const [dialogParentId, setDialogParentId] = useState<number | ''>('');
  const [dialogSaving, setDialogSaving] = useState(false);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<ExpenseCategoryAPI | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExpenseCategories({ isActive: true });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setSnackbar({ open: true, message: 'Error al cargar categorías', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const parentCategories = useMemo(
    () => categories.filter(c => c.parentCategoryId === null),
    [categories]
  );

  const childCategories = useMemo(
    () => categories.filter(c => c.parentCategoryId !== null),
    [categories]
  );

  const currentData = activeTab === 0 ? parentCategories : childCategories;

  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
    setQuickFilter('');
    setSortConfig({ key: null, direction: 'asc' });
  }, []);

  const handleSort = useCallback((key: SortKey): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Create/Edit dialog
  const openCreateDialog = useCallback(() => {
    setDialogMode('create');
    setEditingCategory(null);
    setDialogName('');
    setDialogParentId(activeTab === 1 && parentCategories.length > 0 ? parentCategories[0].categoryId : '');
    setDialogOpen(true);
  }, [activeTab, parentCategories]);

  const openEditDialog = useCallback((category: ExpenseCategoryAPI) => {
    setDialogMode('edit');
    setEditingCategory(category);
    setDialogName(category.categoryName);
    setDialogParentId(category.parentCategoryId ?? '');
    setDialogOpen(true);
  }, []);

  const handleDialogSave = useCallback(async () => {
    if (!dialogName.trim()) return;

    setDialogSaving(true);
    try {
      if (dialogMode === 'create') {
        await createExpenseCategory({
          categoryName: dialogName.trim(),
          parentCategoryId: dialogParentId !== '' ? Number(dialogParentId) : null
        });
        setSnackbar({ open: true, message: 'Categoría creada exitosamente', severity: 'success' });
      } else if (editingCategory) {
        await updateExpenseCategory(editingCategory.categoryId, {
          categoryName: dialogName.trim(),
          parentCategoryId: dialogParentId !== '' ? Number(dialogParentId) : null
        });
        setSnackbar({ open: true, message: 'Categoría actualizada exitosamente', severity: 'success' });
      }
      setDialogOpen(false);
      await loadCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setSnackbar({ open: true, message: 'Error al guardar categoría', severity: 'error' });
    } finally {
      setDialogSaving(false);
    }
  }, [dialogMode, dialogName, dialogParentId, editingCategory, loadCategories]);

  // Delete
  const openDeleteDialog = useCallback((category: ExpenseCategoryAPI) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingCategory) return;

    setDeleteLoading(true);
    try {
      await deleteExpenseCategory(deletingCategory.categoryId);
      setSnackbar({ open: true, message: 'Categoría eliminada exitosamente', severity: 'success' });
      setDeleteDialogOpen(false);
      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setSnackbar({ open: true, message: 'Error al eliminar categoría', severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingCategory, loadCategories]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = currentData;

    if (quickFilter) {
      const lower = quickFilter.toLowerCase();
      filtered = filtered.filter((item) =>
        item.categoryName.toLowerCase().includes(lower) ||
        (item.parentCategoryName && item.parentCategoryName.toLowerCase().includes(lower))
      );
    }

    if (sortConfig.key) {
      const key = sortConfig.key;
      filtered = [...filtered].sort((a, b) => {
        const aVal = (key === 'parentCategoryName' ? a.parentCategoryName : a.categoryName) || '';
        const bVal = (key === 'parentCategoryName' ? b.parentCategoryName : b.categoryName) || '';
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [currentData, quickFilter, sortConfig]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#2c2c2c' }}>
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
                color: '#8b5cf6',
                fontWeight: 600
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
                      active={sortConfig.key === 'categoryName'}
                      direction={sortConfig.key === 'categoryName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('categoryName')}
                      sx={{ fontWeight: 600 }}
                    >
                      Nombre
                    </TableSortLabel>
                  </TableCell>
                  {activeTab === 1 && (
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'parentCategoryName'}
                        direction={sortConfig.key === 'parentCategoryName' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('parentCategoryName')}
                        sx={{ fontWeight: 600 }}
                      >
                        Categoría padre
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell align="center" sx={{ fontWeight: 600, width: '100px' }}>
                    Acciones
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
                  filteredAndSortedData.map((category) => (
                    <TableRow key={category.categoryId} hover>
                      <TableCell>{category.categoryName}</TableCell>
                      {activeTab === 1 && (
                        <TableCell>{category.parentCategoryName}</TableCell>
                      )}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => openEditDialog(category)}
                          sx={{ color: '#8b5cf6' }}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(category)}
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
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Mostrando {filteredAndSortedData.length} de {currentData.length} entradas
          </Typography>

          {/* Create Button */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={openCreateDialog}
              sx={{
                bgcolor: '#8b5cf6',
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Crear Categoría' : 'Editar Categoría'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nombre"
            value={dialogName}
            onChange={(e) => setDialogName(e.target.value)}
            sx={{ mt: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && dialogName.trim()) handleDialogSave();
            }}
          />
          {(activeTab === 1 || (dialogMode === 'edit' && editingCategory?.parentCategoryId)) && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Categoría padre</InputLabel>
              <Select
                value={dialogParentId}
                label="Categoría padre"
                onChange={(e) => setDialogParentId(e.target.value as number | '')}
              >
                {parentCategories.map(p => (
                  <MenuItem key={p.categoryId} value={p.categoryId}>
                    {p.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={dialogSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleDialogSave}
            variant="contained"
            disabled={!dialogName.trim() || dialogSaving}
            sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#45b5b8' } }}
          >
            {dialogSaving ? <CircularProgress size={20} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar la categoría "{deletingCategory?.categoryName}"?
          </Typography>
          {deletingCategory && !deletingCategory.parentCategoryId && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Al eliminar una categoría padre, todas sus categorías hijo también serán desactivadas.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExpenseCategories;
