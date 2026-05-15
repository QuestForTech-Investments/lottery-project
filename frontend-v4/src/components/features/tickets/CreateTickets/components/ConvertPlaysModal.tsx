/**
 * ConvertPlaysModal
 *
 * Opens via `+` in an empty bet input. Takes every 2-digit number that's
 * already in the current draw's Quiniela / Palé / Tripleta bets, dedupes them,
 * and lets the user generate all combinations for a chosen target type with a
 * single shared amount. Generated bets are added on top of the existing ones —
 * nothing is removed.
 */

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Bet } from '../types';

export type ConvertTarget = 'directo' | 'pale' | 'tripleta';

export interface ConvertResult {
  target: ConvertTarget;
  gameTypeId: number;
  amount: number;
  combos: string[]; // already-formatted clean numbers (2, 4 or 6 digits)
}

interface ConvertPlaysModalProps {
  open: boolean;
  onClose: () => void;
  /** All bets currently in the form — we filter by drawId internally. */
  allBets: Bet[];
  /** Draw the user is currently playing on. Numbers from other draws are ignored. */
  selectedDrawId: number | null;
  /**
   * Allowed game-type ids for the current draw. If empty/undefined we don't
   * restrict (matches existing behaviour for unconstrained draws).
   */
  allowedGameTypes: number[];
  onConvert: (result: ConvertResult) => void;
}

/** Combinatorial picker — every k-sized subset of arr, preserving order. */
const combinations = (arr: string[], k: number): string[][] => {
  if (k <= 0 || k > arr.length) return [];
  const out: string[][] = [];
  const buf: string[] = [];
  const walk = (start: number) => {
    if (buf.length === k) { out.push(buf.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      buf.push(arr[i]);
      walk(i + 1);
      buf.pop();
    }
  };
  walk(0);
  return out;
};

/** Pulls every clean 2-digit number out of a bet, depending on its game type. */
const extractTwoDigit = (bet: Bet): string[] => {
  const digits = (bet.cleanNumber || bet.betNumber || '').replace(/\D/g, '');
  switch (bet.gameTypeId) {
    case 1:  // DIRECTO
    case 15: // PICK2
      return digits.length === 2 ? [digits] : [];
    case 2:  // PALE
      return digits.length === 4 ? [digits.slice(0, 2), digits.slice(2, 4)] : [];
    case 3:  // TRIPLETA
      return digits.length === 6
        ? [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)]
        : [];
    default:
      return [];
  }
};

const ConvertPlaysModal = memo<ConvertPlaysModalProps>(({
  open,
  onClose,
  allBets,
  selectedDrawId,
  allowedGameTypes,
  onConvert,
}) => {
  const [amount, setAmount] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset + focus on every open
  useEffect(() => {
    if (!open) return;
    setAmount('');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // Numbers available from the current draw's bets, deduped + sorted
  const numbers = useMemo<string[]>(() => {
    if (!open) return [];
    const set = new Set<string>();
    for (const bet of allBets) {
      if (selectedDrawId != null && bet.drawId != null && bet.drawId !== selectedDrawId) continue;
      for (const n of extractTwoDigit(bet)) set.add(n);
    }
    return Array.from(set).sort();
  }, [open, allBets, selectedDrawId]);

  const allows = (id: number) =>
    !allowedGameTypes || allowedGameTypes.length === 0 || allowedGameTypes.includes(id);

  const directoAllowed  = allows(1) || allows(15);
  const paleAllowed     = allows(2);
  const tripletaAllowed = allows(3);

  // Pick the right Directo game type for the current draw
  const directoGameTypeId = allows(1) ? 1 : (allows(15) ? 15 : 1);

  const directoCount  = directoAllowed                       ? numbers.length                  : 0;
  const paleCount     = paleAllowed     && numbers.length >= 2 ? (numbers.length * (numbers.length - 1)) / 2 : 0;
  const tripletaCount = tripletaAllowed && numbers.length >= 3
    ? (numbers.length * (numbers.length - 1) * (numbers.length - 2)) / 6
    : 0;

  const amountNum = parseFloat(amount);
  const amountValid = !isNaN(amountNum) && amountNum > 0;

  const handleAmountChange = (v: string) => {
    if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v);
  };

  const handleConvert = (target: ConvertTarget) => {
    if (!amountValid) return;
    let combos: string[] = [];
    let gameTypeId = directoGameTypeId;
    if (target === 'directo') {
      combos = numbers.slice();
      gameTypeId = directoGameTypeId;
    } else if (target === 'pale') {
      combos = combinations(numbers, 2).map(c => c.join(''));
      gameTypeId = 2;
    } else {
      combos = combinations(numbers, 3).map(c => c.join(''));
      gameTypeId = 3;
    }
    if (combos.length === 0) return;
    onConvert({ target, gameTypeId, amount: amountNum, combos });
    onClose();
  };

  const targetBtnSx = {
    bgcolor: '#8b5cf6',
    color: 'white',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    py: 1.5,
    px: 2,
    fontSize: '13px',
    justifyContent: 'space-between',
    '&:hover': { bgcolor: '#7c3aed' },
    '&.Mui-disabled': { bgcolor: '#cbd5e1', color: 'white', opacity: 0.7 },
  } as const;

  const renderTargetBtn = (target: ConvertTarget, label: string, count: number) => (
    <Button
      variant="contained"
      disabled={!amountValid || count === 0}
      onClick={() => handleConvert(target)}
      sx={targetBtnSx}
      fullWidth
    >
      <span>{label}</span>
      <Box
        component="span"
        sx={{
          bgcolor: 'rgba(255,255,255,0.25)',
          borderRadius: '999px',
          px: 1.1,
          py: '2px',
          minWidth: 22,
          fontSize: '11px',
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        {count}
      </Box>
    </Button>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 360,
          maxWidth: '90vw',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#3e4449',
          color: 'white',
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: '17px', fontWeight: 700 }}>Convertir jugadas</Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <Box>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#495057',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              mb: 0.75,
            }}
          >
            Monto
          </Typography>
          <TextField
            inputRef={inputRef}
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            fullWidth
            inputProps={{ inputMode: 'decimal' }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: 'white',
                '& fieldset': { borderColor: '#dee2e6', borderWidth: 2 },
              },
              '& input': {
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'monospace',
                textAlign: 'center',
                py: 1.25,
              },
            }}
          />
        </Box>

        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#6c757d', textAlign: 'center' }}>
          {numbers.length === 0
            ? 'No hay jugadas para convertir'
            : `${numbers.length} número${numbers.length === 1 ? '' : 's'} disponible${numbers.length === 1 ? '' : 's'}`}
        </Typography>

        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#495057', textAlign: 'center', mt: 0.5 }}>
          Convertir a
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {renderTargetBtn('directo', 'Directo', directoCount)}
          {renderTargetBtn('pale', 'Palé', paleCount)}
          {renderTargetBtn('tripleta', 'Tripleta', tripletaCount)}
        </Box>
      </Box>
    </Dialog>
  );
});

ConvertPlaysModal.displayName = 'ConvertPlaysModal';

export default ConvertPlaysModal;
