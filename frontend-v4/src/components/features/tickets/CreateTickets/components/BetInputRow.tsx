import React, { memo, type RefObject, type KeyboardEvent, type ReactNode } from 'react';
import { Box, TextField, Typography, IconButton } from '@mui/material';
import type { Draw } from '../types';

interface BetInputRowProps {
  betNumber: string;
  amount: string;
  betError: string;
  betWarning: string;
  selectedDraw: Draw | null;
  totalBets: number;
  grandTotal: string;
  betNumberInputRef: RefObject<HTMLInputElement>;
  amountInputRef: RefObject<HTMLInputElement>;
  onBetNumberChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onAddBet: () => void;
  onBetNumberKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAmountKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onBetNumberBlur?: () => void;
  limitAvailable?: number | null;
  ticketsDropdown?: ReactNode;
  allowSplitAmount?: boolean;
}

const BetInputRow: React.FC<BetInputRowProps> = memo(({
  betNumber,
  amount,
  betError,
  betWarning,
  selectedDraw,
  totalBets,
  grandTotal,
  betNumberInputRef,
  amountInputRef,
  onBetNumberChange,
  onAmountChange,
  onAddBet,
  onBetNumberKeyDown,
  onAmountKeyDown,
  onBetNumberBlur,
  limitAvailable,
  ticketsDropdown,
  allowSplitAmount = false,
}) => {
  const handleAmountChange = (value: string) => {
    const pattern = allowSplitAmount
      ? /^\d*\.?\d*(\+\d*\.?\d*)?$/
      : /^\d*\.?\d*$/;
    if (value === '' || pattern.test(value)) {
      onAmountChange(value);
    }
  };

  // Determine what to show in the middle field
  const hasError = !!betError;
  const hasWarning = !!betWarning;
  const hasLimit = limitAvailable !== null && limitAvailable !== undefined;

  let middleText = '';
  let middleBgColor = 'white';
  let middleTextColor = '#999';
  let middleFontSize = '24px';

  if (hasError) {
    middleText = betError;
    middleBgColor = '#c62828';
    middleTextColor = '#fff';
    middleFontSize = '14px';
  } else if (hasWarning) {
    middleText = betWarning;
    middleBgColor = '#e65100';
    middleTextColor = '#fff';
    middleFontSize = '14px';
  } else if (hasLimit) {
    if (limitAvailable === -1) {
      middleText = 'Sin Límite';
      middleBgColor = '#e8f5e9';
      middleTextColor = '#2e7d32';
      middleFontSize = '18px';
    } else if (limitAvailable === 0) {
      middleText = 'BLOQUEADO';
      middleBgColor = '#c62828';
      middleTextColor = '#fff';
      middleFontSize = '18px';
    } else {
      middleText = `$${limitAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      middleBgColor = limitAvailable < 100 ? '#fff3e0' : '#e8f5e9';
      middleTextColor = limitAvailable < 100 ? '#e65100' : '#2e7d32';
      middleFontSize = '24px';
    }
  }

  return (
  <>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        placeholder="JUGADA"
        value={betNumber}
        onChange={(e) => onBetNumberChange(e.target.value)}
        onKeyDown={onBetNumberKeyDown}
        onBlur={onBetNumberBlur}
        disabled={!selectedDraw}
        autoFocus={!!selectedDraw}
        inputRef={betNumberInputRef}
        inputProps={{ tabIndex: 1 }}
        sx={{
          flex: 1, bgcolor: 'white',
          '& input': { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', py: 2, color: '#333' },
          '& input::placeholder': { color: '#999', opacity: 1 },
        }}
      />
      <TextField
        placeholder="N/A"
        value={middleText}
        disabled
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': { bgcolor: middleBgColor, height: '100%' },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? '#c62828' : hasWarning ? '#e65100' : 'rgba(0, 0, 0, 0.23)',
          },
          '& input': {
            fontSize: middleFontSize, fontWeight: 'bold', textAlign: 'center', py: 2,
            color: middleTextColor,
            WebkitTextFillColor: middleTextColor,
            '&.Mui-disabled': { WebkitTextFillColor: middleTextColor },
          },
          '& input::placeholder': { color: '#999', opacity: 1 },
        }}
      />
      <TextField
        placeholder="MONTO"
        value={amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        onKeyDown={onAmountKeyDown}
        onFocus={(e) => e.target.select()}
        disabled={!selectedDraw}
        inputRef={amountInputRef}
        inputProps={{ tabIndex: 2, inputMode: 'decimal' }}
        sx={{
          flex: 1, bgcolor: 'white',
          '& input': { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', py: 2, color: '#333' },
          '& input::placeholder': { color: '#999', opacity: 1 },
        }}
      />
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      {ticketsDropdown}
      <IconButton
        onClick={onAddBet}
        disabled={!betNumber || !amount || !selectedDraw}
        sx={{ bgcolor: '#8b5cf6', color: 'white', '&:hover': { bgcolor: '#7c3aed' } }}
        title="Agregar jugada (o presione Enter)"
      >
        ➕
      </IconButton>
      <Typography sx={{ fontSize: '14px', color: '#666' }}>
        <strong>Jugadas:</strong> {totalBets}
      </Typography>
      <Typography sx={{ fontSize: '14px', color: '#666' }}>
        <strong>Total:</strong> ${grandTotal}
      </Typography>
      <Typography sx={{ fontSize: '12px', color: '#888', fontStyle: 'italic', ml: 'auto' }}>
        Use Tab para navegar, Enter para agregar
      </Typography>
    </Box>
  </>
  );
});

BetInputRow.displayName = 'BetInputRow';

export default BetInputRow;
