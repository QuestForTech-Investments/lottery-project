import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Tooltip,
  Collapse,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import limitService, { handleLimitError } from '@/services/limitService';
import {
  LimitRule,
  LimitFilter,
  LimitType,
  LimitTypeLabels,
  CreateLimitTypeLabels,
  CreateByNumberLimitTypeLabels,
  LimitParams,
  DaysOfWeek,
} from '@/types/limits';

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_BITMASKS = [1, 2, 4, 8, 16, 32, 64];

const LIMIT_TYPE_ORDER = [
  LimitType.GeneralForGroup,
  LimitType.GeneralForZone,
  LimitType.GeneralForBettingPool,
  LimitType.LocalForBettingPool,
  LimitType.ByNumberForGroup,
  LimitType.ByNumberForZone,
  LimitType.ByNumberForBettingPool,
];

const ACCENT = '#6366f1';
const ACCENT_HOVER = '#5558e6';

const styles = {
  container: { p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' },
  title: { textAlign: 'center', mb: 3, fontSize: '28px', fontWeight: 400, color: '#2c2c2c', fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif' },
  card: { bgcolor: 'white', borderRadius: '12px', boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 10px -4px', mb: 2 },
  label: { color: '#9a9a9a', fontSize: '12px', fontWeight: 400, mb: 0.5, display: 'block' },
  select: {
    height: '40px', fontSize: '14px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT }
  },
  refreshButton: {
    bgcolor: ACCENT, color: 'white', borderRadius: '30px', padding: '11px 23px',
    fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' as const,
    boxShadow: 'none', '&:hover': { bgcolor: ACCENT_HOVER },
  },
  dayTab: {
    textTransform: 'none' as const, fontSize: '14px', fontWeight: 500, minWidth: 0, flex: 1,
    color: '#666', '&.Mui-selected': { color: ACCENT, fontWeight: 600 },
  },
  drawTab: {
    textTransform: 'uppercase' as const, fontSize: '11px', fontWeight: 600, minWidth: 'auto',
    px: 1.5, py: 0.5, color: '#666', '&.Mui-selected': { color: ACCENT },
  },
  typeTab: {
    textTransform: 'none' as const, fontSize: '13px', fontWeight: 500, flex: 1, minWidth: 0,
    color: ACCENT, borderBottom: `2px solid ${ACCENT}`,
  },
  entityBar: {
    py: 1.5, px: 2, mb: 0.5, cursor: 'pointer', textAlign: 'center', color: 'white', fontWeight: 600,
    fontSize: '13px', borderRadius: '4px', transition: 'opacity 0.2s',
    '&:hover': { opacity: 0.85 },
  },
  tableHeader: {
    bgcolor: '#f5f5f5',
    '& th': { fontSize: '12px', fontWeight: 600, color: '#787878', borderBottom: '1px solid #eee', py: 1.5 }
  },
  tableCell: { fontSize: '14px', color: '#2c2c2c', py: 1.5 },
};

// Cycle through shades of turquoise for entity bars
const ENTITY_COLORS = ['#6366f1', '#6366f1', '#6366f1', '#6366f1', '#6366f1', '#6366f1'];

const LimitsList = (): React.ReactElement => {
  const [filterLimitType, setFilterLimitType] = useState<string>('');
  const [filterDrawId, setFilterDrawId] = useState<string>('');
  const [filterDay, setFilterDay] = useState<string>('');
  const [filterZone, setFilterZone] = useState<string>('');

  const [allLimits, setAllLimits] = useState<LimitRule[]>([]);
  const [params, setParams] = useState<LimitParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [paramsLoading, setParamsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTypeIdx, setSelectedTypeIdx] = useState(0);
  const [selectedDrawIds, setSelectedDrawIds] = useState<Record<string, number>>({}); // "type-entity" -> drawId
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [limitToDelete, setLimitToDelete] = useState<number | null>(null);
  const [deleteAllTarget, setDeleteAllTarget] = useState<{ drawId: number; limitType: number; zoneId?: number; bettingPoolId?: number } | null>(null);
  const [updatingAmount, setUpdatingAmount] = useState<string | null>(null); // "ruleId-gameTypeId"

  useEffect(() => {
    const loadParams = async () => {
      try { setParamsLoading(true); setParams(await limitService.getLimitParams()); }
      catch (err) { console.error('Error loading params:', err); }
      finally { setParamsLoading(false); }
    };
    loadParams();
  }, []);

  const loadLimits = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const filter: LimitFilter = { isActive: true };
      if (filterLimitType) filter.limitTypes = [parseInt(filterLimitType) as LimitType];
      if (filterDrawId) filter.drawIds = [parseInt(filterDrawId)];
      if (filterDay) filter.daysOfWeek = [parseInt(filterDay)];
      if (filterZone) filter.zoneId = parseInt(filterZone);
      setAllLimits(await limitService.getLimits(filter));
    } catch (err) { setError(handleLimitError(err, 'cargar límites')); }
    finally { setLoading(false); }
  }, [filterLimitType, filterDrawId, filterDay, filterZone]);

  useEffect(() => { loadLimits(); }, []);

  const selectedDayBitmask = DAY_BITMASKS[selectedDayIdx];

  // Filter by day
  const dayLimits = useMemo(() => allLimits.filter(l => !l.daysOfWeek || (l.daysOfWeek & selectedDayBitmask) !== 0), [allLimits, selectedDayBitmask]);

  // Get which limit types have data
  const activeTypes = useMemo(() => LIMIT_TYPE_ORDER.filter(lt => dayLimits.some(l => l.limitType === lt)), [dayLimits]);

  const currentType = activeTypes[selectedTypeIdx] || activeTypes[0];

  // Get limits for the current type
  const typeLimits = useMemo(() => dayLimits.filter(l => l.limitType === currentType), [dayLimits, currentType]);

  // Group by entity (zone for zona type, banca for banca types, none for global)
  interface EntityGroup {
    key: string;
    label: string;
    limits: LimitRule[];
    draws: { id: number; name: string }[];
  }

  const entityGroups = useMemo((): EntityGroup[] => {
    if (currentType === LimitType.GeneralForGroup || currentType === LimitType.ByNumberForGroup) {
      // Global: single group, no entity
      const drawMap = new Map<number, string>();
      typeLimits.forEach(l => { if (l.drawId && l.drawName) drawMap.set(l.drawId, l.drawName); });
      const draws = Array.from(drawMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
      return [{ key: 'global', label: '', limits: typeLimits, draws }];
    }

    if (currentType === LimitType.GeneralForZone || currentType === LimitType.ByNumberForZone) {
      // Group by zone
      const zoneMap = new Map<number, { name: string; limits: LimitRule[] }>();
      typeLimits.forEach(l => {
        if (!l.zoneId) return;
        if (!zoneMap.has(l.zoneId)) zoneMap.set(l.zoneId, { name: l.zoneName || `Zona ${l.zoneId}`, limits: [] });
        zoneMap.get(l.zoneId)!.limits.push(l);
      });
      return Array.from(zoneMap.entries()).map(([zoneId, data]) => {
        const drawMap = new Map<number, string>();
        data.limits.forEach(l => { if (l.drawId && l.drawName) drawMap.set(l.drawId, l.drawName); });
        const draws = Array.from(drawMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
        return { key: `zone-${zoneId}`, label: data.name, limits: data.limits, draws };
      }).sort((a, b) => a.label.localeCompare(b.label));
    }

    // Banca types: group by banca
    const bancaMap = new Map<number, { name: string; limits: LimitRule[] }>();
    typeLimits.forEach(l => {
      if (!l.bettingPoolId) return;
      if (!bancaMap.has(l.bettingPoolId)) bancaMap.set(l.bettingPoolId, { name: l.bettingPoolName || `Banca ${l.bettingPoolId}`, limits: [] });
      bancaMap.get(l.bettingPoolId)!.limits.push(l);
    });
    return Array.from(bancaMap.entries()).map(([bpId, data]) => {
      const drawMap = new Map<number, string>();
      data.limits.forEach(l => { if (l.drawId && l.drawName) drawMap.set(l.drawId, l.drawName); });
      const draws = Array.from(drawMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
      return { key: `bp-${bpId}`, label: data.name, limits: data.limits, draws };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [currentType, typeLimits]);

  const toggleEntity = (key: string) => {
    setExpandedEntities(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const getSelectedDraw = (entityKey: string, draws: { id: number }[]): number | null => {
    return selectedDrawIds[entityKey] || draws[0]?.id || null;
  };

  // Delete a single amount row
  const handleDeleteAmount = useCallback(async (ruleId: number, gameTypeId: number) => {
    try {
      await limitService.deleteAmount(ruleId, gameTypeId);
      // Remove from local state
      setAllLimits(prev => prev.map(l => {
        if (l.limitRuleId !== ruleId) return l;
        const newAmounts = l.amounts?.filter(a => a.gameTypeId !== gameTypeId);
        if (!newAmounts || newAmounts.length === 0) return null as unknown as typeof l; // mark for removal
        return { ...l, amounts: newAmounts };
      }).filter(Boolean));
      setSnackbar({ open: true, message: 'Monto eliminado', severity: 'success' });
    } catch (err) { setSnackbar({ open: true, message: handleLimitError(err, 'eliminar monto'), severity: 'error' }); }
  }, []);

  // Update a single amount inline
  const handleUpdateAmount = useCallback(async (ruleId: number, gameTypeId: number, newAmount: number) => {
    const key = `${ruleId}-${gameTypeId}`;
    setUpdatingAmount(key);
    try {
      await limitService.updateAmount(ruleId, gameTypeId, newAmount);
      setAllLimits(prev => prev.map(l => {
        if (l.limitRuleId !== ruleId) return l;
        return { ...l, amounts: l.amounts?.map(a => a.gameTypeId === gameTypeId ? { ...a, amount: newAmount } : a) };
      }));
      setSnackbar({ open: true, message: 'Monto actualizado', severity: 'success' });
    } catch (err) { setSnackbar({ open: true, message: handleLimitError(err, 'actualizar monto'), severity: 'error' }); }
    finally { setUpdatingAmount(null); }
  }, []);

  // Delete entire rule
  const handleDeleteClick = useCallback((id: number) => { setLimitToDelete(id); setDeleteDialogOpen(true); }, []);
  const handleConfirmDelete = useCallback(async () => {
    if (limitToDelete === null && !deleteAllTarget) return;

    try {
      if (deleteAllTarget) {
        await limitService.deleteByDraw(deleteAllTarget.drawId, deleteAllTarget.limitType, deleteAllTarget.zoneId, deleteAllTarget.bettingPoolId);
        setAllLimits(prev => prev.filter(l => !(
          l.drawId === deleteAllTarget.drawId &&
          l.limitType === deleteAllTarget.limitType &&
          (!deleteAllTarget.zoneId || l.zoneId === deleteAllTarget.zoneId) &&
          (!deleteAllTarget.bettingPoolId || l.bettingPoolId === deleteAllTarget.bettingPoolId)
        )));
        setSnackbar({ open: true, message: 'Todos los límites eliminados', severity: 'success' });
      } else if (limitToDelete !== null) {
        await limitService.deleteLimit(limitToDelete);
        setAllLimits(prev => prev.filter(l => l.limitRuleId !== limitToDelete));
        setSnackbar({ open: true, message: 'Límite eliminado', severity: 'success' });
      }
    } catch (err) { setSnackbar({ open: true, message: handleLimitError(err, 'eliminar'), severity: 'error' }); }
    finally { setDeleteDialogOpen(false); setLimitToDelete(null); setDeleteAllTarget(null); }
  }, [limitToDelete, deleteAllTarget]);

  const formatDate = (d?: string): string => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  };

  const limitTypeOptions = [
    ...Object.entries(CreateLimitTypeLabels).map(([v, l]) => ({ value: v, label: l as string })),
    ...Object.entries(CreateByNumberLimitTypeLabels).map(([v, l]) => ({ value: v, label: l as string }))
  ];

  const renderAmountsTable = (entityGroup: EntityGroup) => {
    const selectedDraw = getSelectedDraw(entityGroup.key, entityGroup.draws);
    const visibleLimits = entityGroup.limits.filter(l => l.drawId === selectedDraw);
    const drawIdx = entityGroup.draws.findIndex(d => d.id === selectedDraw);

    return (
      <Box>
        {/* Draw tabs */}
        {entityGroup.draws.length > 0 && (
          <Tabs
            value={drawIdx >= 0 ? drawIdx : 0}
            onChange={(_, idx) => {
              const draw = entityGroup.draws[idx];
              if (draw) setSelectedDrawIds(prev => ({ ...prev, [entityGroup.key]: draw.id }));
            }}
            variant="scrollable" scrollButtons="auto"
            TabIndicatorProps={{ sx: { bgcolor: ACCENT, height: 2 } }}
            sx={{ borderBottom: '1px solid #eee' }}
          >
            {entityGroup.draws.map(draw => (
              <Tab key={draw.id} label={draw.name} sx={styles.drawTab} />
            ))}
          </Tabs>
        )}

        {/* Borrar todos button */}
        {visibleLimits.length > 0 && selectedDraw && (
          <Box sx={{ textAlign: 'right', px: 2, pt: 1 }}>
            <Button
              size="small"
              onClick={() => {
                const sample = visibleLimits[0];
                setDeleteAllTarget({
                  drawId: selectedDraw,
                  limitType: sample.limitType,
                  zoneId: sample.zoneId || undefined,
                  bettingPoolId: sample.bettingPoolId || undefined
                });
                setDeleteDialogOpen(true);
              }}
              sx={{ color: '#ef8157', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}
            >
              Borrar todos
            </Button>
          </Box>
        )}

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={styles.tableHeader}>
                <TableCell>Tipo de jugada</TableCell>
                <TableCell>Numero</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Fecha de expiración</TableCell>
                <TableCell align="right" width={50}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleLimits.length > 0 ? visibleLimits.map(limit => {
                const amountItems = limit.amounts || [];
                if (amountItems.length > 0) {
                  return amountItems.map((amt) => {
                    const amtKey = `${limit.limitRuleId}-${amt.gameTypeId}`;
                    return (
                      <TableRow key={amtKey} hover>
                        <TableCell sx={{ ...styles.tableCell, color: ACCENT, fontWeight: 500 }}>{amt.gameTypeName}</TableCell>
                        <TableCell sx={{ ...styles.tableCell, fontWeight: 600, color: limit.betNumberPattern ? ACCENT : '#ccc' }}>
                          {limit.betNumberPattern || '-'}
                        </TableCell>
                        <TableCell sx={styles.tableCell}>
                          <TextField
                            type="number"
                            defaultValue={amt.amount}
                            size="small"
                            disabled={updatingAmount === amtKey}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val) && val !== amt.amount) {
                                handleUpdateAmount(limit.limitRuleId, amt.gameTypeId, val);
                              }
                            }}
                            sx={{ width: 120, '& .MuiOutlinedInput-root': { fontSize: '14px', height: '36px' } }}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                        <TableCell sx={styles.tableCell}>{formatDate(limit.effectiveTo)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" sx={{ color: '#ef8157' }} onClick={() => handleDeleteAmount(limit.limitRuleId, amt.gameTypeId)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  });
                }
                return (
                  <TableRow key={limit.limitRuleId} hover>
                    <TableCell sx={styles.tableCell}>{limit.gameTypeName || 'General'}</TableCell>
                    <TableCell sx={{ ...styles.tableCell, fontWeight: 600, color: limit.betNumberPattern ? ACCENT : '#ccc' }}>
                      {limit.betNumberPattern || '-'}
                    </TableCell>
                    <TableCell sx={styles.tableCell}>
                      <TextField type="number" defaultValue={limit.maxBetPerNumber || 0} size="small" disabled
                        sx={{ width: 120, '& .MuiOutlinedInput-root': { fontSize: '14px', height: '36px' } }} />
                    </TableCell>
                    <TableCell sx={styles.tableCell}>{formatDate(limit.effectiveTo)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" sx={{ color: '#ef8157' }} onClick={() => handleDeleteClick(limit.limitRuleId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#999' }}>Sin límites para este sorteo</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  if (loading && allLimits.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: ACCENT }} />
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography sx={styles.title}>Lista de límites</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Filters */}
      <Box sx={styles.card}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Box sx={{ minWidth: 180 }}>
              <Typography component="label" sx={styles.label}>Tipo de Límite</Typography>
              <FormControl fullWidth size="small">
                <Select value={filterLimitType} onChange={(e: SelectChangeEvent) => setFilterLimitType(e.target.value)} displayEmpty sx={styles.select}>
                  <MenuItem value=""><em style={{ color: '#9a9a9a' }}>Todos</em></MenuItem>
                  {limitTypeOptions.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 180 }}>
              <Typography component="label" sx={styles.label}>Sorteos</Typography>
              <FormControl fullWidth size="small" disabled={paramsLoading}>
                <Select value={filterDrawId} onChange={(e: SelectChangeEvent) => setFilterDrawId(e.target.value)} displayEmpty sx={styles.select}>
                  <MenuItem value=""><em style={{ color: '#9a9a9a' }}>Todos</em></MenuItem>
                  {(params?.draws || []).map(d => <MenuItem key={d.value} value={d.value.toString()}>{d.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 160 }}>
              <Typography component="label" sx={styles.label}>Dias</Typography>
              <FormControl fullWidth size="small">
                <Select value={filterDay} onChange={(e: SelectChangeEvent) => setFilterDay(e.target.value)} displayEmpty sx={styles.select}>
                  <MenuItem value=""><em style={{ color: '#9a9a9a' }}>Todos</em></MenuItem>
                  {DaysOfWeek.map(d => <MenuItem key={d.value} value={d.value.toString()}>{d.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 160 }}>
              <Typography component="label" sx={styles.label}>Zonas</Typography>
              <FormControl fullWidth size="small" disabled={paramsLoading}>
                <Select value={filterZone} onChange={(e: SelectChangeEvent) => setFilterZone(e.target.value)} displayEmpty sx={styles.select}>
                  <MenuItem value=""><em style={{ color: '#9a9a9a' }}>Todas</em></MenuItem>
                  {(params?.zones || []).map(z => <MenuItem key={z.value} value={z.value.toString()}>{z.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={loadLimits} disabled={loading} disableElevation sx={styles.refreshButton}>
              {loading ? 'Cargando...' : 'Refrescar'}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Day tabs */}
      <Box sx={styles.card}>
        <Tabs value={selectedDayIdx} onChange={(_, v) => setSelectedDayIdx(v)} variant="fullWidth"
          TabIndicatorProps={{ sx: { bgcolor: ACCENT, height: 3 } }}>
          {DAY_LABELS.map((label, idx) => <Tab key={idx} label={label} sx={styles.dayTab} />)}
        </Tabs>
      </Box>

      {activeTypes.length === 0 && !loading && (
        <Box sx={{ ...styles.card, p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#9a9a9a' }}>No hay límites configurados para este día</Typography>
        </Box>
      )}

      {/* Limit type tabs */}
      {activeTypes.length > 0 && (
        <Box sx={styles.card}>
          {/* Type tabs as horizontal bar */}
          <Box sx={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            {activeTypes.map((lt, idx) => (
              <Box
                key={lt}
                onClick={() => setSelectedTypeIdx(idx)}
                sx={{
                  flex: 1, py: 1.5, textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                  color: idx === selectedTypeIdx ? ACCENT : '#999',
                  borderBottom: idx === selectedTypeIdx ? `3px solid ${ACCENT}` : '3px solid transparent',
                  transition: 'all 0.2s', '&:hover': { color: ACCENT }
                }}
              >
                {LimitTypeLabels[lt as LimitType]}
              </Box>
            ))}
          </Box>

          {/* Content for selected type */}
          <Box sx={{ p: 2 }}>
            {entityGroups.map((group, idx) => {
              // Global: no expandable bar, show directly
              if (group.key === 'global') {
                return <Box key={group.key}>{renderAmountsTable(group)}</Box>;
              }

              // Entity bar (expandable)
              const isExpanded = expandedEntities.has(group.key);
              const barColor = ENTITY_COLORS[idx % ENTITY_COLORS.length];

              return (
                <Box key={group.key} sx={{ mb: 1 }}>
                  <Box
                    onClick={() => toggleEntity(group.key)}
                    sx={{ ...styles.entityBar, bgcolor: barColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                  >
                    {group.label}
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </Box>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ border: '1px solid #eee', borderRadius: '0 0 4px 4px', mb: 1 }}>
                      {renderAmountsTable(group)}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: ACCENT }} />
        </Box>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setLimitToDelete(null); setDeleteAllTarget(null); }}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent><DialogContentText>
          {deleteAllTarget
            ? '¿Está seguro de que desea eliminar TODOS los límites de este sorteo?'
            : '¿Está seguro de que desea eliminar este límite?'}
        </DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setLimitToDelete(null); setDeleteAllTarget(null); }} sx={{ color: '#666' }}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} sx={{ bgcolor: '#ef8157', color: 'white', '&:hover': { bgcolor: '#e06a3f' } }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LimitsList;
