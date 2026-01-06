import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  TextField,
  IconButton,
  Collapse,
  Alert,
  CircularProgress,
  Snackbar,
  Divider
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import {
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  getDrawSchedules,
  updateDrawSchedules,
  groupDrawsByLottery,
  convertTo12Hour,
  convertTo24Hour
} from '../../../../services/drawScheduleService';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DaySchedule {
  startTime: string;
  endTime: string;
  enabled: boolean;
}

interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  [key: string]: DaySchedule | undefined;
}

interface Draw {
  drawId: number;
  drawName: string;
  abbreviation?: string;
  logoUrl?: string;
  color?: string;
  useWeeklySchedule?: boolean;
  weeklySchedule: WeeklySchedule;
}

interface Lottery {
  lotteryId: number;
  lotteryName: string;
  timezone: string;
  draws: Draw[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ScheduleUpdate {
  drawId: number;
  useWeeklySchedule: boolean | undefined;
  weeklySchedule: WeeklySchedule;
}

const DAYS_ES: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DrawSchedules = (): React.ReactElement => {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedLotteryIds, setExpandedLotteryIds] = useState<Set<number>>(new Set());
  const [modifiedDraws, setModifiedDraws] = useState<Map<number, Draw>>(new Map());
  const [saving, setSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // eslint-disable-next-line react-hooks/exhaustive-deps -- Only run once on mount
  useEffect(() => {
    loadDrawSchedules();
  }, []);

  const showSnackbar = useCallback((message: string, severity: AlertColor = 'success'): void => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const loadDrawSchedules = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await getDrawSchedules();
      const grouped = groupDrawsByLottery(data) as Lottery[];
      setLotteries(grouped);
    } catch (error) {
      console.error('[ERROR] [DRAW SCHEDULES] Error loading:', error);
      showSnackbar('Error al cargar horarios de sorteos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const toggleLotteryExpansion = useCallback((lotteryId: number): void => {
    setExpandedLotteryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lotteryId)) {
        newSet.delete(lotteryId);
      } else {
        newSet.add(lotteryId);
      }
      return newSet;
    });
  }, []);

  // Memoize draw state to avoid O(n²) lookups during render
  const drawStateCache = useMemo((): Map<number, Draw> => {
    const cache = new Map<number, Draw>();

    // Pre-populate cache with all draws
    lotteries.forEach(lottery => {
      lottery.draws.forEach(draw => {
        // Use modified version if it exists, otherwise use original
        cache.set(
          draw.drawId,
          modifiedDraws.has(draw.drawId) ? modifiedDraws.get(draw.drawId)! : draw
        );
      });
    });

    return cache;
  }, [lotteries, modifiedDraws]);

  const getDrawState = useCallback((drawId: number): Draw | null => {
    return drawStateCache.get(drawId) || null;
  }, [drawStateCache]);

  const handleTimeChange = useCallback((drawId: number, dayKey: DayKey, field: 'startTime' | 'endTime', value: string): void => {
    // Get the draw's current state (from modified or original)
    const draw = getDrawState(drawId);
    if (!draw) return;

    // Create updated weekly schedule
    const currentDaySchedule = draw.weeklySchedule[dayKey] || { startTime: '00:00:00', endTime: '00:00:00', enabled: false };
    const updatedSchedule: WeeklySchedule = {
      ...draw.weeklySchedule,
      [dayKey]: {
        ...currentDaySchedule,
        [field]: convertTo24Hour(value),
        enabled: true
      }
    };

    // Update modified draws map
    setModifiedDraws(prev => {
      const newMap = new Map(prev);
      newMap.set(drawId, {
        ...draw,
        useWeeklySchedule: true,
        weeklySchedule: updatedSchedule
      });
      return newMap;
    });
  }, [getDrawState]);

  const handleDeleteDay = useCallback((drawId: number, dayKey: DayKey): void => {
    const draw = getDrawState(drawId);
    if (!draw) return;

    const updatedSchedule: WeeklySchedule = {
      ...draw.weeklySchedule,
      [dayKey]: {
        startTime: '00:00:00',
        endTime: '00:00:00',
        enabled: false
      }
    };

    setModifiedDraws(prev => {
      const newMap = new Map(prev);
      newMap.set(drawId, {
        ...draw,
        weeklySchedule: updatedSchedule
      });
      return newMap;
    });
  }, [getDrawState]);

  const handleSaveAll = useCallback(async (): Promise<void> => {
    try {
      setSaving(true);

      // Convert modified draws to API format
      const schedules: ScheduleUpdate[] = Array.from(modifiedDraws.values()).map(draw => ({
        drawId: draw.drawId,
        useWeeklySchedule: draw.useWeeklySchedule,
        weeklySchedule: draw.weeklySchedule
      }));

      if (schedules.length === 0) {
        showSnackbar('No hay cambios para guardar', 'info');
        return;
      }

      await updateDrawSchedules(schedules as unknown as Parameters<typeof updateDrawSchedules>[0]);

      showSnackbar('Horarios actualizados correctamente', 'success');

      // Clear modified draws and reload
      setModifiedDraws(new Map());
      await loadDrawSchedules();

    } catch (error) {
      console.error('[ERROR] [DRAW SCHEDULES] Error saving:', error);
      showSnackbar('Error al guardar horarios', 'error');
    } finally {
      setSaving(false);
    }
  }, [modifiedDraws, showSnackbar, loadDrawSchedules]);

  const handleCloseSnackbar = useCallback((): void => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <CircularProgress sx={{ color: '#51cbce' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 2 }}>
            <ScheduleIcon sx={{ fontSize: 32, color: '#51cbce' }} />
            <Typography
              variant="h4"
              sx={{
                fontSize: '24px',
                fontWeight: 500,
                color: '#2c2c2c'
              }}
            >
              Horarios de sorteos
            </Typography>
          </Box>

          {/* Lottery Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lotteries.map(lottery => {
              const isExpanded = expandedLotteryIds.has(lottery.lotteryId);

              return (
                <Box key={lottery.lotteryId}>
                  {/* Lottery Button */}
                  <Button
                    fullWidth
                    onClick={() => toggleLotteryExpansion(lottery.lotteryId)}
                    sx={{
                      bgcolor: '#51cbce',
                      color: 'white',
                      textTransform: 'uppercase',
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#45b8bb'
                      }
                    }}
                  >
                    {lottery.lotteryName} ({lottery.timezone})
                  </Button>

                  {/* Expanded Draw Sections */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ bgcolor: '#fafafa', p: 3, mt: 2, borderRadius: 1 }}>
                      {lottery.draws.map((draw, drawIndex) => {
                        const currentDraw = getDrawState(draw.drawId);
                        const schedule = currentDraw?.weeklySchedule || {};

                        return (
                          <Box key={draw.drawId} sx={{ mb: drawIndex < lottery.draws.length - 1 ? 4 : 0 }}>
                            {/* Draw Header: Logo + Info */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                              {/* Logo */}
                              <Box
                                sx={{
                                  width: 150,
                                  height: 150,
                                  bgcolor: 'white',
                                  border: '1px solid #ddd',
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  overflow: 'hidden'
                                }}
                              >
                                {draw.logoUrl ? (
                                  <img
                                    src={draw.logoUrl}
                                    alt={`${draw.drawName} logo`}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                  />
                                ) : (
                                  <Typography sx={{ color: '#999', fontSize: '12px' }}>
                                    Sin logo
                                  </Typography>
                                )}
                              </Box>

                              {/* Name, Abbreviation, Color */}
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                  <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                    Nombre
                                  </Typography>
                                  <TextField
                                    value={draw.drawName}
                                    disabled
                                    fullWidth
                                    size="small"
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        bgcolor: '#e9ecef',
                                        color: '#495057'
                                      }
                                    }}
                                  />
                                </Box>

                                <Box>
                                  <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                    Abreviación
                                  </Typography>
                                  <TextField
                                    value={draw.abbreviation || ''}
                                    disabled
                                    fullWidth
                                    size="small"
                                    sx={{
                                      '& .MuiInputBase-input': {
                                        bgcolor: '#e9ecef',
                                        color: '#495057'
                                      }
                                    }}
                                  />
                                </Box>

                                <Box>
                                  <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                                    Color
                                  </Typography>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: draw.color || '#51cbce',
                                      border: '1px solid #ddd',
                                      borderRadius: 1,
                                      cursor: 'pointer'
                                    }}
                                    title={draw.color || '#51cbce'}
                                  />
                                </Box>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Day Schedules */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {DAY_KEYS.map((dayKey, dayIndex) => {
                                const daySchedule = schedule[dayKey] || { startTime: '00:00:00', endTime: '00:00:00', enabled: false };
                                // Only convert times when enabled to avoid unnecessary conversions
                                const startTime12 = daySchedule.enabled ? convertTo12Hour(daySchedule.startTime) : '';
                                const endTime12 = daySchedule.enabled ? convertTo12Hour(daySchedule.endTime) : '';

                                return (
                                  <Box
                                    key={dayKey}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2
                                    }}
                                  >
                                    {/* Day Label */}
                                    <Typography sx={{ width: 90, fontSize: '14px', fontWeight: 500 }}>
                                      {DAYS_ES[dayIndex]}:
                                    </Typography>

                                    {/* Start Time */}
                                    <TextField
                                      value={startTime12}
                                      onChange={(e) => handleTimeChange(draw.drawId, dayKey, 'startTime', e.target.value)}
                                      placeholder="12:00 AM"
                                      size="small"
                                      sx={{ width: 100 }}
                                    />

                                    {/* Arrow Icon */}
                                    <ArrowForwardIcon sx={{ color: '#999', fontSize: 16 }} />

                                    {/* End Time */}
                                    <TextField
                                      value={endTime12}
                                      onChange={(e) => handleTimeChange(draw.drawId, dayKey, 'endTime', e.target.value)}
                                      placeholder="11:59 PM"
                                      size="small"
                                      sx={{ width: 100 }}
                                    />

                                    {/* Delete Button */}
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteDay(draw.drawId, dayKey)}
                                      disabled={!daySchedule.enabled}
                                      sx={{
                                        color: daySchedule.enabled ? '#dc3545' : '#ccc',
                                        '&:hover': {
                                          bgcolor: daySchedule.enabled ? 'rgba(220, 53, 69, 0.1)' : 'transparent'
                                        }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>

          {lotteries.length === 0 && (
            <Alert severity="info">
              No hay sorteos configurados
            </Alert>
          )}

          {/* Update Button */}
          {modifiedDraws.size > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSaveAll}
                disabled={saving}
                sx={{
                  bgcolor: '#51cbce',
                  '&:hover': { bgcolor: '#45b8bb' },
                  color: 'white',
                  fontSize: '16px',
                  textTransform: 'uppercase',
                  px: 6,
                  py: 1.5,
                  fontWeight: 500
                }}
              >
                {saving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'ACTUALIZAR'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default DrawSchedules;
