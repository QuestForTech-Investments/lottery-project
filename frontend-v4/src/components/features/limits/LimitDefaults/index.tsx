import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { getLimitDefaults, updateLimitDefaults, type LimitDefaultItem, type UpdateLimitDefaultItem } from '@/services/limitService';
import { useUserPermissions } from '@hooks/useUserPermissions';

const ACCENT = '#6366f1';
const ACCENT_HOVER = '#5558e6';

const LimitDefaults = (): React.ReactElement => {
  const { hasPermission } = useUserPermissions();
  const canManage = hasPermission('MANAGE_LIMIT_DEFAULTS');

  const [defaults, setDefaults] = useState<LimitDefaultItem[]>([]);
  const [editedDefaults, setEditedDefaults] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const loadDefaults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLimitDefaults();
      setDefaults(data);
      setEditedDefaults(new Map());
    } catch (err) {
      console.error('Error loading defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDefaults(); }, [loadDefaults]);

  const handleChange = useCallback((defaultType: string, gameTypeId: number, value: string) => {
    const num = parseFloat(value) || 0;
    setEditedDefaults(prev => {
      const next = new Map(prev);
      next.set(`${defaultType}-${gameTypeId}`, num);
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (editedDefaults.size === 0) return;
    setSaving(true);
    try {
      const items: UpdateLimitDefaultItem[] = [];
      editedDefaults.forEach((maxAmount, key) => {
        const [defaultType, gameTypeIdStr] = key.split('-');
        items.push({ defaultType, gameTypeId: parseInt(gameTypeIdStr), maxAmount });
      });
      await updateLimitDefaults(items);
      await loadDefaults();
      setSnackbar({ open: true, message: 'Valores por defecto actualizados', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al actualizar valores por defecto', severity: 'error' });
    } finally {
      setSaving(false);
    }
  }, [editedDefaults, loadDefaults]);

  if (!canManage) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No tiene permisos para acceder a esta configuración.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', minHeight: 300, alignItems: 'center' }}>
        <CircularProgress sx={{ color: ACCENT }} />
      </Box>
    );
  }

  const renderTable = (dtype: string, title: string) => {
    const typeDefaults = defaults.filter(d => d.defaultType === dtype);
    if (typeDefaults.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 600, color: ACCENT, fontSize: '16px', mb: 1.5 }}>
          {title}
        </Typography>
        <TableContainer sx={{ bgcolor: 'white', borderRadius: '8px', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 8px' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Tipo de Jugada</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555', fontSize: '13px', width: 180 }}>Monto por Defecto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {typeDefaults.map(d => {
                const editKey = `${d.defaultType}-${d.gameTypeId}`;
                const editedValue = editedDefaults.get(editKey);
                const currentValue = editedValue !== undefined ? editedValue : d.maxAmount;
                return (
                  <TableRow key={d.limitDefaultId} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ fontSize: '13px', color: '#333' }}>{d.gameTypeName}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={currentValue}
                        onChange={e => handleChange(d.defaultType, d.gameTypeId, e.target.value)}
                        sx={{ width: 140, '& input': { fontSize: '13px', py: 0.5 } }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography sx={{ textAlign: 'center', mb: 1, fontSize: '28px', fontWeight: 400, color: '#2c2c2c', fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif' }}>
        Configuración de Límites
      </Typography>
      <Typography sx={{ textAlign: 'center', mb: 3, color: '#888', fontSize: '14px' }}>
        Valores predeterminados al crear límites automáticos para zonas nuevas y al pre-llenar límites de banca.
      </Typography>

      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        {renderTable('zona', 'Valores por Defecto — Zona')}
        {renderTable('banca', 'Valores por Defecto — Banca')}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button
            onClick={() => setEditedDefaults(new Map())}
            sx={{ color: '#666', textTransform: 'none' }}
            disabled={editedDefaults.size === 0}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={editedDefaults.size === 0 || saving}
            sx={{ bgcolor: ACCENT, color: 'white', textTransform: 'none', px: 3, '&:hover': { bgcolor: ACCENT_HOVER }, '&.Mui-disabled': { bgcolor: '#ccc' } }}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(LimitDefaults);
