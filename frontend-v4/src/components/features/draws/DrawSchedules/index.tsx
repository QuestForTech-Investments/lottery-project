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
  Paper
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import {
  ContentCopy as ContentCopyIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import {
  getDrawSchedules,
  updateDrawSchedules,
  groupDrawsByLottery,
  convertTo12Hour,
  convertTo24Hour
} from '../../../../services/drawScheduleService';

// Time input component using MUI TimePicker
interface TimeInputProps {
  value: string; // 12-hour format "HH:MM AM" or "HH:MM PM"
  onChange: (value: string) => void;
  placeholder?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, placeholder = '12:00 AM' }) => {
  // Convert 12-hour string to dayjs object
  const parseTime = (timeStr: string): Dayjs | null => {
    if (!timeStr || timeStr.trim() === '') return null;

    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format for dayjs
    if (period === 'AM' && hours === 12) {
      hours = 0;
    } else if (period === 'PM' && hours !== 12) {
      hours += 12;
    }

    return dayjs().hour(hours).minute(minutes).second(0);
  };

  // Convert dayjs object to 12-hour string
  const formatTime = (time: Dayjs | null): string => {
    if (!time) return '';
    return time.format('hh:mm A');
  };

  const handleChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      const formatted = formatTime(newValue);
      onChange(formatted);
    } else {
      onChange('');
    }
  };

  return (
    <TimePicker
      value={parseTime(value)}
      onChange={handleChange}
      slotProps={{
        textField: {
          size: 'small',
          placeholder: placeholder,
          sx: {
            width: 120,
            '& .MuiInputBase-input': {
              fontSize: '13px',
              py: 0.5,
              px: 1
            }
          }
        },
        popper: {
          sx: {
            '& .MuiPickersLayout-root': {
              bgcolor: 'white'
            },
            '& .MuiClock-pin': {
              bgcolor: '#8b5cf6'
            },
            '& .MuiClockPointer-root': {
              bgcolor: '#8b5cf6'
            },
            '& .MuiClockPointer-thumb': {
              bgcolor: '#8b5cf6',
              borderColor: '#8b5cf6'
            },
            '& .MuiClock-clock': {
              bgcolor: '#f5f5f5'
            },
            '& .Mui-selected': {
              bgcolor: '#8b5cf6 !important'
            },
            '& .MuiPickersDay-root.Mui-selected': {
              bgcolor: '#8b5cf6'
            },
            '& .MuiButtonBase-root.MuiPickersDay-root.Mui-selected': {
              bgcolor: '#8b5cf6'
            }
          }
        }
      }}
    />
  );
};

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

  const loadDrawSchedules = useCallback(async (showLoadingState = true): Promise<void> => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      const { data } = await getDrawSchedules();
      const grouped = groupDrawsByLottery(data) as Lottery[];
      setLotteries(grouped);
    } catch (error) {
      console.error('[ERROR] [DRAW SCHEDULES] Error loading:', error);
      showSnackbar('Error al cargar horarios de sorteos', 'error');
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
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

    // Create updated weekly schedule - ensure weeklySchedule exists
    const weeklySchedule = draw.weeklySchedule || {};
    const currentDaySchedule = weeklySchedule[dayKey] || { startTime: '00:00:00', endTime: '00:00:00', enabled: false };

    // If value is empty, disable the day
    if (!value || value.trim() === '') {
      const updatedSchedule: WeeklySchedule = {
        ...weeklySchedule,
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
      return;
    }

    // Convert valid 12-hour time to 24-hour format
    const time24 = convertTo24Hour(value);

    const updatedSchedule: WeeklySchedule = {
      ...weeklySchedule,
      [dayKey]: {
        ...currentDaySchedule,
        [field]: time24,
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

  const handleCopyToAllDays = useCallback((drawId: number, sourceDayKey: DayKey): void => {
    const draw = getDrawState(drawId);
    if (!draw) return;

    const weeklySchedule = draw.weeklySchedule || {};
    const sourceSchedule = weeklySchedule[sourceDayKey];

    if (!sourceSchedule || !sourceSchedule.enabled) return;

    // Copy the source day's times to all other days
    const updatedSchedule: WeeklySchedule = { ...weeklySchedule };
    DAY_KEYS.forEach(dayKey => {
      updatedSchedule[dayKey] = {
        startTime: sourceSchedule.startTime,
        endTime: sourceSchedule.endTime,
        enabled: true
      };
    });

    setModifiedDraws(prev => {
      const newMap = new Map(prev);
      newMap.set(drawId, {
        ...draw,
        useWeeklySchedule: true,
        weeklySchedule: updatedSchedule
      });
      return newMap;
    });

    showSnackbar('Horario copiado a todos los días', 'success');
  }, [getDrawState, showSnackbar]);

  // Validate schedules before saving
  const validateSchedules = useCallback((): string | null => {
    const dayNames: Record<string, string> = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };

    for (const draw of modifiedDraws.values()) {
      const schedule = draw.weeklySchedule;
      if (!schedule) continue;

      for (const dayKey of DAY_KEYS) {
        const daySchedule = schedule[dayKey];
        if (daySchedule && daySchedule.enabled) {
          // Compare times as strings (HH:MM:SS format)
          if (daySchedule.startTime >= daySchedule.endTime) {
            return `${draw.drawName} - ${dayNames[dayKey]}: La hora de fin debe ser mayor que la hora de inicio`;
          }
        }
      }
    }
    return null;
  }, [modifiedDraws]);

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

      // Validate before sending
      const validationError = validateSchedules();
      if (validationError) {
        showSnackbar(validationError, 'error');
        return;
      }

      await updateDrawSchedules(schedules as unknown as Parameters<typeof updateDrawSchedules>[0]);

      showSnackbar('Horarios actualizados correctamente', 'success');

      // Clear modified draws and reload (without showing loading spinner)
      setModifiedDraws(new Map());
      await loadDrawSchedules(false);

    } catch (error) {
      console.error('[ERROR] [DRAW SCHEDULES] Error saving:', error);
      showSnackbar('Error al guardar horarios', 'error');
    } finally {
      setSaving(false);
    }
  }, [modifiedDraws, showSnackbar, loadDrawSchedules, validateSchedules]);

  const handleCloseSnackbar = useCallback((): void => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <CircularProgress sx={{ color: '#8b5cf6' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Typography
              variant="h5"
              sx={{
                textAlign: 'center',
                mb: 4,
                fontWeight: 500,
                color: '#2c2c2c'
              }}
            >
              Horarios de sorteos
            </Typography>

            {/* Lottery Accordion Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {lotteries.map(lottery => {
                const isExpanded = expandedLotteryIds.has(lottery.lotteryId);

                return (
                  <Box key={lottery.lotteryId}>
                    {/* Lottery Accordion Button */}
                    <Button
                      fullWidth
                      onClick={() => toggleLotteryExpansion(lottery.lotteryId)}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textTransform: 'uppercase',
                        fontSize: '15px',
                        fontWeight: 500,
                        py: 1.2,
                        borderRadius: 1,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)'
                        }
                      }}
                    >
                      {lottery.lotteryName} ({lottery.timezone})
                    </Button>

                    {/* Expanded Section with Draw Cards */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ bgcolor: '#fafafa', p: 3, mt: 1, borderRadius: 1 }}>
                        {/* Draw Cards Grid - 3 per row */}
                        <Box sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                          gap: 3
                        }}>
                          {lottery.draws.map((draw) => {
                            const currentDraw = getDrawState(draw.drawId);
                            const schedule = currentDraw?.weeklySchedule || {};

                            return (
                              <Paper
                                key={draw.drawId}
                                elevation={0}
                                sx={{
                                  p: 2,
                                  border: '1px solid #e0e0e0',
                                  borderRadius: 1,
                                  bgcolor: 'white'
                                }}
                              >
                                {/* Draw Card Header */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                  {/* Plus Icon */}
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#999',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <AddIcon />
                                  </Box>

                                  {/* Name, Abbreviation, Color */}
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ mb: 1.5 }}>
                                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>
                                        Nombre
                                      </Typography>
                                      <TextField
                                        value={draw.drawName}
                                        disabled
                                        fullWidth
                                        size="small"
                                        sx={{
                                          '& .MuiInputBase-input': {
                                            bgcolor: '#fff',
                                            fontSize: '15px',
                                            py: 0.8,
                                            WebkitTextFillColor: '#333 !important',
                                            color: '#333 !important'
                                          },
                                          '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#ddd' }
                                          }
                                        }}
                                      />
                                    </Box>

                                    <Box sx={{ mb: 1.5 }}>
                                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>
                                        Abreviación
                                      </Typography>
                                      <TextField
                                        value={draw.abbreviation || ''}
                                        disabled
                                        fullWidth
                                        size="small"
                                        sx={{
                                          '& .MuiInputBase-input': {
                                            bgcolor: '#fff',
                                            fontSize: '15px',
                                            py: 0.8,
                                            WebkitTextFillColor: '#333 !important',
                                            color: '#333 !important'
                                          },
                                          '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: '#ddd' }
                                          }
                                        }}
                                      />
                                    </Box>

                                    <Box>
                                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>
                                        Color
                                      </Typography>
                                      <Box
                                        sx={{
                                          width: 34,
                                          height: 34,
                                          bgcolor: draw.color || '#f0e68c',
                                          border: '1px solid #ddd',
                                          borderRadius: 0.5,
                                          cursor: 'pointer'
                                        }}
                                        title={draw.color || '#f0e68c'}
                                      />
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Day Schedules */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {DAY_KEYS.map((dayKey, dayIndex) => {
                                    const daySchedule = schedule[dayKey] || { startTime: '00:00:00', endTime: '00:00:00', enabled: false };
                                    const startTime12 = daySchedule.enabled ? convertTo12Hour(daySchedule.startTime) : '';
                                    const endTime12 = daySchedule.enabled ? convertTo12Hour(daySchedule.endTime) : '';

                                    return (
                                      <Box
                                        key={dayKey}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5
                                        }}
                                      >
                                        {/* Day Label */}
                                        <Typography sx={{
                                          width: 75,
                                          fontSize: '14px',
                                          fontWeight: 500,
                                          color: '#333'
                                        }}>
                                          {DAYS_ES[dayIndex]}
                                        </Typography>

                                        {/* Start Time */}
                                        <TimeInput
                                          value={startTime12}
                                          onChange={(value) => handleTimeChange(draw.drawId, dayKey, 'startTime', value)}
                                          placeholder="12:00 AM"
                                        />

                                        {/* Arrow */}
                                        <ArrowForwardIcon sx={{ color: '#999', fontSize: 16 }} />

                                        {/* End Time */}
                                        <TimeInput
                                          value={endTime12}
                                          onChange={(value) => handleTimeChange(draw.drawId, dayKey, 'endTime', value)}
                                          placeholder="11:59 PM"
                                        />

                                        {/* Copy to All Days Button */}
                                        <IconButton
                                          size="small"
                                          onClick={() => handleCopyToAllDays(draw.drawId, dayKey)}
                                          disabled={!daySchedule.enabled}
                                          title="Copiar a todos los días"
                                          sx={{
                                            p: 0.3,
                                            color: daySchedule.enabled ? '#667eea' : '#ccc',
                                            '&:hover': {
                                              bgcolor: daySchedule.enabled ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                                            }
                                          }}
                                        >
                                          <ContentCopyIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              </Paper>
                            );
                          })}
                        </Box>

                        {/* Actualizar Button inside expanded section */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                          <Button
                            variant="contained"
                            onClick={handleSaveAll}
                            disabled={saving}
                            sx={{
                              bgcolor: '#8b5cf6',
                              '&:hover': { bgcolor: '#7c3aed' },
                              color: 'white',
                              fontSize: '15px',
                              textTransform: 'uppercase',
                              px: 4,
                              py: 1,
                              fontWeight: 500
                            }}
                          >
                            {saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Actualizar'}
                          </Button>
                        </Box>
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
    </LocalizationProvider>
  );
};

export default DrawSchedules;
