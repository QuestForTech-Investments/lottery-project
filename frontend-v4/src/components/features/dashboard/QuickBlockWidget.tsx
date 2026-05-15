import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Box, FormControl, InputLabel, Select, MenuItem, TextField,
  Button, Chip, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import limitService from '@/services/limitService';
import { createBlockedNumbers, type BlockedNumberCreateItem } from '@/services/blockedNumbersService';
import useUserPermissions from '@/hooks/useUserPermissions';

const ACCENT = '#6366f1';

// Number format by game type label (matches backend names like "Directo", "Palé", "Tripleta", etc.)
interface NumberFormat { groups: number; digitsPerGroup: number; placeholder: string }
const GAME_TYPE_FORMATS: { match: (label: string) => boolean; format: NumberFormat }[] = [
  { match: l => /tripleta/i.test(l), format: { groups: 3, digitsPerGroup: 2, placeholder: '##-##-##' } },
  { match: l => /pal[eé]/i.test(l), format: { groups: 2, digitsPerGroup: 2, placeholder: '##-##' } },
  { match: l => /super\s*pal[eé]/i.test(l), format: { groups: 2, digitsPerGroup: 2, placeholder: '##-##' } },
  { match: l => /cash3|cash\s*3/i.test(l), format: { groups: 1, digitsPerGroup: 3, placeholder: '###' } },
  { match: l => /play4|play\s*4/i.test(l), format: { groups: 1, digitsPerGroup: 4, placeholder: '####' } },
  { match: l => /pick5|pick\s*5/i.test(l), format: { groups: 1, digitsPerGroup: 5, placeholder: '#####' } },
  { match: l => /pick\s*2|pick\s*two/i.test(l), format: { groups: 1, digitsPerGroup: 2, placeholder: '##' } },
  { match: l => /bolita/i.test(l), format: { groups: 1, digitsPerGroup: 2, placeholder: '##' } },
  { match: l => /singulaci[oó]n/i.test(l), format: { groups: 1, digitsPerGroup: 1, placeholder: '#' } },
  { match: l => /panama/i.test(l), format: { groups: 1, digitsPerGroup: 3, placeholder: '###' } },
  { match: l => /directo/i.test(l), format: { groups: 1, digitsPerGroup: 2, placeholder: '##' } },
];

const getFormatFor = (label: string): NumberFormat | null => {
  const found = GAME_TYPE_FORMATS.find(f => f.match(label));
  return found?.format ?? null;
};

const formatNumber = (raw: string, fmt: NumberFormat): string => {
  const digits = raw.replace(/\D/g, '').slice(0, fmt.groups * fmt.digitsPerGroup);
  if (fmt.groups === 1) return digits;
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += fmt.digitsPerGroup) {
    parts.push(digits.slice(i, i + fmt.digitsPerGroup));
  }
  return parts.join('-');
};

const isNumberComplete = (value: string, fmt: NumberFormat): boolean => {
  const digits = value.replace(/\D/g, '');
  return digits.length === fmt.groups * fmt.digitsPerGroup;
};

interface PendingBlock {
  id: number;
  drawId: number;
  drawName: string;
  gameTypeId: number;
  gameTypeName: string;
  betNumber: string;
  expirationDate?: string;
}

const QuickBlockWidget: React.FC = () => {
  const { hasPermission, loading: permsLoading } = useUserPermissions();
  const canQuickBlock = hasPermission('BLOCK_NUMBERS_QUICK');

  const [draws, setDraws] = useState<{ value: number; label: string }[]>([]);
  const [gameTypes, setGameTypes] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawId, setDrawId] = useState<string>('');
  const [gameTypeId, setGameTypeId] = useState<string>('');
  const [betNumber, setBetNumber] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');

  const [pending, setPending] = useState<PendingBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const params = await limitService.getLimitParams();
        if (!alive) return;
        setDraws(params.draws || []);
        setGameTypes(params.gameTypes || []);
      } catch {
        if (alive) { setDraws([]); setGameTypes([]); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const drawMap = useMemo(() => new Map(draws.map(d => [d.value, d.label])), [draws]);
  const gameTypeMap = useMemo(() => new Map(gameTypes.map(g => [g.value, g.label])), [gameTypes]);

  const selectedGameTypeLabel = gameTypeId ? gameTypeMap.get(parseInt(gameTypeId)) || '' : '';
  const currentFormat = useMemo(() => getFormatFor(selectedGameTypeLabel), [selectedGameTypeLabel]);

  const handleAdd = useCallback(() => {
    const dId = parseInt(drawId);
    const gId = parseInt(gameTypeId);
    const num = betNumber.trim();
    if (!dId || !gId || !num) {
      setSnackbar({ open: true, message: 'Complete sorteo, tipo de jugada y número', severity: 'error' });
      return;
    }
    if (currentFormat && !isNumberComplete(num, currentFormat)) {
      setSnackbar({ open: true, message: `Formato incompleto. Esperado: ${currentFormat.placeholder}`, severity: 'error' });
      return;
    }
    setPending(prev => [...prev, {
      id: Date.now(),
      drawId: dId,
      drawName: drawMap.get(dId) || '',
      gameTypeId: gId,
      gameTypeName: gameTypeMap.get(gId) || '',
      betNumber: num,
      expirationDate: expirationDate || undefined,
    }]);
    setBetNumber('');
  }, [drawId, gameTypeId, betNumber, expirationDate, drawMap, gameTypeMap, currentFormat]);

  const handleRemove = (id: number) => setPending(prev => prev.filter(p => p.id !== id));

  const handleSave = async () => {
    if (pending.length === 0) return;
    setSaving(true);
    try {
      const items: BlockedNumberCreateItem[] = pending.map(p => ({
        drawId: p.drawId,
        gameTypeId: p.gameTypeId,
        betNumber: p.betNumber,
        expirationDate: p.expirationDate ? new Date(p.expirationDate).toISOString() : null,
      }));
      await createBlockedNumbers(items);
      setPending([]);
      setSnackbar({ open: true, message: `${items.length} número(s) bloqueado(s)`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al bloquear números', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Hide the widget entirely if the user doesn't have the quick-block permission.
  // Waiting on permission load avoids a flash of the widget.
  if (permsLoading) return null;
  if (!canQuickBlock) return null;

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 1 }}>
        Bloqueo rápido de números
      </Typography>

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: ACCENT }} size={24} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Sorteo</InputLabel>
            <Select value={drawId} onChange={(e) => setDrawId(e.target.value)} label="Sorteo">
              <MenuItem value="">Seleccione</MenuItem>
              {draws.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Tipo de jugada</InputLabel>
            <Select
              value={gameTypeId}
              onChange={(e) => { setGameTypeId(e.target.value); setBetNumber(''); }}
              label="Tipo de jugada"
            >
              <MenuItem value="">Seleccione</MenuItem>
              {gameTypes.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField
            fullWidth size="small" label="Número"
            placeholder={currentFormat?.placeholder || ''}
            value={betNumber}
            onChange={(e) => {
              if (currentFormat) setBetNumber(formatNumber(e.target.value, currentFormat));
              else setBetNumber(e.target.value);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            inputProps={{ inputMode: currentFormat ? 'numeric' : 'text' }}
            disabled={!gameTypeId}
          />

          <TextField
            fullWidth size="small" type="date" label="Fecha expiración (opcional)"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {pending.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 90, overflowY: 'auto' }}>
              {pending.map(p => (
                <Chip
                  key={p.id}
                  label={`${p.betNumber} · ${p.gameTypeName}`}
                  size="small"
                  onDelete={() => handleRemove(p.id)}
                  sx={{ bgcolor: ACCENT, color: 'white' }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAdd}
              sx={{ flex: 1, color: ACCENT, borderColor: ACCENT }}>
              Agregar
            </Button>
            <Button variant="contained" size="small" onClick={handleSave}
              disabled={pending.length === 0 || saving}
              sx={{ flex: 1, bgcolor: ACCENT, '&:hover': { bgcolor: '#5558e6' } }}>
              {saving ? '...' : 'Bloquear'}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default QuickBlockWidget;
