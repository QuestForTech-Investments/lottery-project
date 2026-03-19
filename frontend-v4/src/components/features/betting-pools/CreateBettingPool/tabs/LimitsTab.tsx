import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, CircularProgress, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, TextField, Tabs, Tab,
  RadioGroup, FormControlLabel, Radio, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import limitService, { handleLimitError } from '@/services/limitService';
import { LimitRule, LimitType, LimitTypeLabels, LimitAmountItem } from '@/types/limits';

interface LimitsTabProps {
  bettingPoolId: number;
  bettingPoolName?: string;
}

const ACCENT = '#6366f1';
const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_BITMASKS = [1, 2, 4, 8, 16, 32, 64];

const LimitsTab: React.FC<LimitsTabProps> = ({ bettingPoolId, bettingPoolName }) => {
  const [limits, setLimits] = useState<LimitRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentType, setCurrentType] = useState<'banca' | 'local' | 'none'>('none');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; ruleId?: number; gameTypeId?: number }>({ open: false });
  const [switchDialog, setSwitchDialog] = useState<{ open: boolean; targetType: 'banca' | 'local' }>({ open: false, targetType: 'banca' });
  const [updatingAmount, setUpdatingAmount] = useState<string | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedDrawIdx, setSelectedDrawIdx] = useState(0);

  const selectedDayBitmask = DAY_BITMASKS[selectedDayIdx];

  // Filter by day, then group by draw
  const dayLimits = limits.filter(l => !l.daysOfWeek || (l.daysOfWeek & selectedDayBitmask) !== 0);
  const drawMap = new Map<number, { name: string; limits: LimitRule[] }>();
  dayLimits.forEach(l => {
    if (!l.drawId || !l.drawName) return;
    if (!drawMap.has(l.drawId)) drawMap.set(l.drawId, { name: l.drawName, limits: [] });
    drawMap.get(l.drawId)!.limits.push(l);
  });
  const draws = Array.from(drawMap.entries()).map(([id, data]) => ({ id, ...data })).sort((a, b) => a.name.localeCompare(b.name));

  const loadLimits = useCallback(async () => {
    try {
      setLoading(true);
      const [bancaLimits, localLimits] = await Promise.all([
        limitService.getLimits({ limitTypes: [LimitType.GeneralForBettingPool], bettingPoolId }).catch(() => []),
        limitService.getLimits({ limitTypes: [LimitType.LocalForBettingPool], bettingPoolId }).catch(() => [])
      ]);

      if (bancaLimits.length > 0) {
        setLimits(bancaLimits);
        setCurrentType('banca');
      } else if (localLimits.length > 0) {
        setLimits(localLimits);
        setCurrentType('local');
      } else {
        setLimits([]);
        setCurrentType('none');
      }
    } catch (err) {
      console.error('Error loading limits:', err);
    } finally {
      setLoading(false);
    }
  }, [bettingPoolId]);

  useEffect(() => { loadLimits(); }, [loadLimits]);

  const handleDeleteAmount = useCallback(async () => {
    if (!deleteDialog.ruleId) return;
    try {
      if (deleteDialog.gameTypeId) {
        await limitService.deleteAmount(deleteDialog.ruleId, deleteDialog.gameTypeId);
        setLimits(prev => prev.map(l => {
          if (l.limitRuleId !== deleteDialog.ruleId) return l;
          const newAmounts = l.amounts?.filter(a => a.gameTypeId !== deleteDialog.gameTypeId);
          if (!newAmounts || newAmounts.length === 0) return null as unknown as LimitRule;
          return { ...l, amounts: newAmounts };
        }).filter(Boolean));
      } else {
        await limitService.deleteLimit(deleteDialog.ruleId);
        setLimits(prev => prev.filter(l => l.limitRuleId !== deleteDialog.ruleId));
      }
      setSnackbar({ open: true, message: 'Eliminado correctamente', severity: 'success' });
      // Reload to check if type changed
      loadLimits();
    } catch (err) {
      setSnackbar({ open: true, message: handleLimitError(err, 'eliminar'), severity: 'error' });
    } finally {
      setDeleteDialog({ open: false });
    }
  }, [deleteDialog, loadLimits]);

  const handleDeleteAllForDraw = useCallback(async (drawId: number) => {
    try {
      const lt = currentType === 'banca' ? LimitType.GeneralForBettingPool : LimitType.LocalForBettingPool;
      await limitService.deleteByDraw(drawId, lt, undefined, bettingPoolId);
      setLimits(prev => prev.filter(l => l.drawId !== drawId));
      setSnackbar({ open: true, message: 'Límites del sorteo eliminados', severity: 'success' });
      loadLimits();
    } catch (err) {
      setSnackbar({ open: true, message: handleLimitError(err, 'eliminar'), severity: 'error' });
    }
  }, [currentType, bettingPoolId, loadLimits]);

  const handleUpdateAmount = useCallback(async (ruleId: number, gameTypeId: number, newAmount: number) => {
    const key = `${ruleId}-${gameTypeId}`;
    setUpdatingAmount(key);
    try {
      await limitService.updateAmount(ruleId, gameTypeId, newAmount);
      setLimits(prev => prev.map(l => {
        if (l.limitRuleId !== ruleId) return l;
        return { ...l, amounts: l.amounts?.map(a => a.gameTypeId === gameTypeId ? { ...a, amount: newAmount } : a) };
      }));
      setSnackbar({ open: true, message: 'Monto actualizado', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: handleLimitError(err, 'actualizar'), severity: 'error' });
    } finally { setUpdatingAmount(null); }
  }, []);

  const handleSwitchType = useCallback(async (newType: 'banca' | 'local') => {
    if (limits.length > 0) {
      // Delete all current limits first
      try {
        for (const limit of limits) {
          await limitService.deleteLimit(limit.limitRuleId);
        }
        setLimits([]);
        setCurrentType(newType);
        setSnackbar({ open: true, message: `Cambiado a ${newType === 'banca' ? 'Limite Banca' : 'Limite Local Banca'}. Cree los nuevos límites.`, severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: handleLimitError(err, 'cambiar tipo'), severity: 'error' });
      }
    } else {
      setCurrentType(newType);
    }
  }, [limits]);

  const formatDate = (d?: string): string => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress sx={{ color: ACCENT }} /></Box>;
  }

  const selectedDraw = draws[selectedDrawIdx];
  const visibleLimits = selectedDraw ? selectedDraw.limits : [];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#2c2c2c' }}>
        Límites de {bettingPoolName || `Banca #${bettingPoolId}`}
      </Typography>

      {/* Limit type selector */}
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>Tipo de límite asignado</Typography>
        <RadioGroup
          row
          value={currentType === 'none' ? '' : currentType}
          onChange={(e) => {
            const val = e.target.value as 'banca' | 'local';
            if (limits.length > 0 && val !== currentType) {
              setSwitchDialog({ open: true, targetType: val });
            } else {
              setCurrentType(val);
            }
          }}
        >
          <FormControlLabel value="banca" control={<Radio size="small" sx={{ '&.Mui-checked': { color: ACCENT } }} />} label="Limite Banca" />
          <FormControlLabel value="local" control={<Radio size="small" sx={{ '&.Mui-checked': { color: ACCENT } }} />} label="Limite Local Banca" />
        </RadioGroup>
      </Box>

      {currentType === 'none' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Seleccione un tipo de límite para esta banca. No puede tener ambos tipos.
        </Alert>
      )}

      {limits.length === 0 && currentType !== 'none' && (
        <Alert severity="info">
          No hay límites configurados. Cree límites desde la sección de Límites.
        </Alert>
      )}

      {limits.length > 0 && draws.length === 0 && (
        <Box sx={{ bgcolor: 'white', borderRadius: '0 0 8px 8px', border: '1px solid #eee', p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: '#999' }}>No hay límites para este día</Typography>
        </Box>
      )}

      {/* Day tabs */}
      {limits.length > 0 && (
        <Box sx={{ bgcolor: 'white', borderRadius: '8px 8px 0 0', border: '1px solid #eee', borderBottom: 'none', mb: 0 }}>
          <Tabs
            value={selectedDayIdx}
            onChange={(_, v) => { setSelectedDayIdx(v); setSelectedDrawIdx(0); }}
            variant="fullWidth"
            TabIndicatorProps={{ sx: { bgcolor: ACCENT, height: 3 } }}
          >
            {DAY_LABELS.map((label, idx) => (
              <Tab key={idx} label={label} sx={{ textTransform: 'none', fontSize: '13px', fontWeight: 500, minWidth: 0, flex: 1, color: '#666', '&.Mui-selected': { color: ACCENT, fontWeight: 600 } }} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Draw tabs + amounts table */}
      {draws.length > 0 && (
        <Box sx={{ bgcolor: 'white', borderRadius: limits.length > 0 ? '0 0 8px 8px' : 1, border: '1px solid #eee' }}>
          <Tabs
            value={selectedDrawIdx < draws.length ? selectedDrawIdx : 0}
            onChange={(_, v) => setSelectedDrawIdx(v)}
            variant="scrollable" scrollButtons="auto"
            TabIndicatorProps={{ sx: { bgcolor: ACCENT, height: 2 } }}
          >
            {draws.map(d => (
              <Tab key={d.id} label={d.name} sx={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#666', '&.Mui-selected': { color: ACCENT } }} />
            ))}
          </Tabs>

          {selectedDraw && visibleLimits.length > 0 && (
            <>
              <Box sx={{ textAlign: 'right', px: 2, pt: 1 }}>
                <Button size="small" onClick={() => handleDeleteAllForDraw(selectedDraw.id)}
                  sx={{ color: '#ef8157', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Borrar todos
                </Button>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontSize: '12px', fontWeight: 600, color: '#787878', bgcolor: '#f5f5f5' } }}>
                      <TableCell>Tipo de jugada</TableCell>
                      <TableCell>Monto</TableCell>
                      <TableCell>Expiración</TableCell>
                      <TableCell align="right" width={50}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleLimits.map(limit => (limit.amounts || []).map(amt => {
                      const key = `${limit.limitRuleId}-${amt.gameTypeId}`;
                      return (
                        <TableRow key={key} hover>
                          <TableCell sx={{ fontSize: '14px', color: ACCENT, fontWeight: 500 }}>{amt.gameTypeName}</TableCell>
                          <TableCell>
                            <TextField
                              type="number" defaultValue={amt.amount} size="small"
                              disabled={updatingAmount === key}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val !== amt.amount) handleUpdateAmount(limit.limitRuleId, amt.gameTypeId, val);
                              }}
                              sx={{ width: 120, '& .MuiOutlinedInput-root': { fontSize: '14px', height: '36px' } }}
                              inputProps={{ min: 0 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px', color: '#666' }}>{formatDate(limit.effectiveTo)}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" sx={{ color: '#ef8157' }}
                              onClick={() => setDeleteDialog({ open: true, ruleId: limit.limitRuleId, gameTypeId: amt.gameTypeId })}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    }))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent><DialogContentText>¿Está seguro de que desea eliminar este límite?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })} sx={{ color: '#666' }}>Cancelar</Button>
          <Button onClick={handleDeleteAmount} sx={{ bgcolor: '#ef8157', color: 'white', '&:hover': { bgcolor: '#e06a3f' } }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Switch type confirmation dialog */}
      <Dialog open={switchDialog.open} onClose={() => setSwitchDialog({ open: false, targetType: 'banca' })}>
        <DialogTitle>Cambiar tipo de límite</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Cambiar a {switchDialog.targetType === 'banca' ? 'Limite Banca' : 'Limite Local Banca'}? Se eliminarán todos los límites actuales de esta banca.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSwitchDialog({ open: false, targetType: 'banca' })} sx={{ color: '#666' }}>Cancelar</Button>
          <Button onClick={() => { handleSwitchType(switchDialog.targetType); setSwitchDialog({ open: false, targetType: 'banca' }); }}
            sx={{ bgcolor: ACCENT, color: 'white', '&:hover': { bgcolor: '#5558e6' } }}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LimitsTab;
