import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Paper,
  Popover,
  ClickAwayListener
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import {
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon
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

// Generate hours for time picker (12-hour format)
const HOURS_12: string[] = ['12 AM', '01 AM', '02 AM', '03 AM', '04 AM', '05 AM', '06 AM', '07 AM', '08 AM', '09 AM', '10 AM', '11 AM',
  '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM', '09 PM', '10 PM', '11 PM'];
const MINUTES: string[] = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface TimePickerProps {
  value: string; // Format: "HH:MM AM/PM"
  onChange: (value: string) => void;
  placeholder?: string;
}

const TimePicker = ({ value, onChange, placeholder = '12:00 AM' }: TimePickerProps): React.ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempHour, setTempHour] = useState<string>('12 AM');
  const [tempMinute, setTempMinute] = useState<string>('00');
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    // Parse current value to set initial selection
    if (value) {
      const match = value.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        const hourNum = match[1];
        const period = match[3].toUpperCase();
        setTempHour(`${hourNum} ${period}`);
        setTempMinute(match[2]);
      }
    } else {
      setTempHour('12 AM');
      setTempMinute('00');
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleConfirm = (): void => {
    // Combine hour and minute into final value
    const hourParts = tempHour.split(' ');
    const hourNum = hourParts[0];
    const period = hourParts[1];
    const newValue = `${hourNum}:${tempMinute} ${period}`;
    onChange(newValue);
    handleClose();
  };

  const handleHourSelect = (hour: string): void => {
    setTempHour(hour);
  };

  const handleMinuteSelect = (minute: string): void => {
    setTempMinute(minute);
  };

  // Scroll to selected item when popover opens
  useEffect(() => {
    if (open && hourListRef.current) {
      const selectedHourIndex = HOURS_12.indexOf(tempHour);
      if (selectedHourIndex >= 0) {
        const itemHeight = 32;
        hourListRef.current.scrollTop = selectedHourIndex * itemHeight - 64;
      }
    }
    if (open && minuteListRef.current) {
      const selectedMinuteIndex = MINUTES.indexOf(tempMinute);
      if (selectedMinuteIndex >= 0) {
        const itemHeight = 32;
        minuteListRef.current.scrollTop = selectedMinuteIndex * itemHeight - 64;
      }
    }
  }, [open, tempHour, tempMinute]);

  return (
    <>
      <TextField
        value={value || ''}
        onClick={handleClick}
        placeholder={placeholder}
        size="small"
        InputProps={{
          readOnly: true,
          sx: { cursor: 'pointer' }
        }}
        sx={{
          width: 105,
          '& .MuiInputBase-input': {
            fontSize: '13px',
            py: 0.75,
            px: 1,
            cursor: 'pointer'
          }
        }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            borderRadius: 1
          }
        }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box sx={{ width: 180 }}>
            {/* Time columns */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
              {/* Hours column */}
              <Box
                ref={hourListRef}
                sx={{
                  flex: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                  borderRight: '1px solid #e0e0e0',
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 3 }
                }}
              >
                {HOURS_12.map(hour => (
                  <Box
                    key={hour}
                    onClick={() => handleHourSelect(hour)}
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      fontSize: '13px',
                      cursor: 'pointer',
                      bgcolor: tempHour === hour ? '#51cbce' : 'transparent',
                      color: tempHour === hour ? 'white' : '#333',
                      '&:hover': {
                        bgcolor: tempHour === hour ? '#51cbce' : '#f5f5f5'
                      }
                    }}
                  >
                    {hour}
                  </Box>
                ))}
              </Box>
              {/* Minutes column */}
              <Box
                ref={minuteListRef}
                sx={{
                  flex: 1,
                  maxHeight: 200,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 3 }
                }}
              >
                {MINUTES.map(minute => (
                  <Box
                    key={minute}
                    onClick={() => handleMinuteSelect(minute)}
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      fontSize: '13px',
                      cursor: 'pointer',
                      bgcolor: tempMinute === minute ? '#51cbce' : 'transparent',
                      color: tempMinute === minute ? 'white' : '#333',
                      '&:hover': {
                        bgcolor: tempMinute === minute ? '#51cbce' : '#f5f5f5'
                      }
                    }}
                  >
                    {minute}
                  </Box>
                ))}
              </Box>
            </Box>
            {/* Confirm/Cancel buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
              <Button
                size="small"
                onClick={handleClose}
                sx={{
                  textTransform: 'lowercase',
                  color: '#51cbce',
                  fontSize: '12px',
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                cancelar
              </Button>
              <Button
                size="small"
                onClick={handleConfirm}
                sx={{
                  textTransform: 'lowercase',
                  color: '#51cbce',
                  fontSize: '12px',
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                confirmar
              </Button>
            </Box>
          </Box>
        </ClickAwayListener>
      </Popover>
    </>
  );
};

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

    // Create updated weekly schedule - ensure weeklySchedule exists
    const weeklySchedule = draw.weeklySchedule || {};
    const currentDaySchedule = weeklySchedule[dayKey] || { startTime: '00:00:00', endTime: '00:00:00', enabled: false };
    const updatedSchedule: WeeklySchedule = {
      ...weeklySchedule,
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

    const weeklySchedule = draw.weeklySchedule || {};
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
  }, [getDrawState]);

  // Copy schedule from one day to all other days
  const handleCopyToAllDays = useCallback((drawId: number, sourceDayKey: DayKey): void => {
    const draw = getDrawState(drawId);
    if (!draw) return;

    const weeklySchedule = draw.weeklySchedule || {};
    const sourceSchedule = weeklySchedule[sourceDayKey];

    if (!sourceSchedule || !sourceSchedule.enabled) return;

    // Create new schedule with source day's times copied to all days
    const updatedSchedule: WeeklySchedule = {};
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
                      bgcolor: '#51cbce',
                      color: 'white',
                      textTransform: 'uppercase',
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.2,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: '#45b8bb'
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
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                                        width: 70,
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: '#333'
                                      }}>
                                        {DAYS_ES[dayIndex]}
                                      </Typography>

                                      {/* Start Time - Time Picker */}
                                      <TimePicker
                                        value={startTime12}
                                        onChange={(value) => handleTimeChange(draw.drawId, dayKey, 'startTime', value)}
                                        placeholder="12:00 AM"
                                      />

                                      {/* Arrow */}
                                      <ArrowForwardIcon sx={{ color: '#51cbce', fontSize: 18, mx: 0.5 }} />

                                      {/* End Time - Time Picker */}
                                      <TimePicker
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
                                          p: 0.5,
                                          ml: 0.5,
                                          color: daySchedule.enabled ? '#666' : '#ccc',
                                          border: daySchedule.enabled ? '1px solid #ddd' : 'none',
                                          borderRadius: '50%',
                                          bgcolor: daySchedule.enabled ? '#f5f5f5' : 'transparent',
                                          '&:hover': {
                                            bgcolor: daySchedule.enabled ? '#e8e8e8' : 'transparent'
                                          }
                                        }}
                                      >
                                        <CopyIcon sx={{ fontSize: 14 }} />
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
                            bgcolor: '#51cbce',
                            '&:hover': { bgcolor: '#45b8bb' },
                            color: 'white',
                            fontSize: '14px',
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
  );
};

export default DrawSchedules;
