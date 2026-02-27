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
  ticketsDropdown?: ReactNode;
  allowSplitAmount?: boolean;
}

/**
 * BetInputRow Component
 *
 * Input fields for bet number, amount, and bet type selection.
 */
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
  ticketsDropdown,
  allowSplitAmount = false,
}) => {
  const handleAmountChange = (value: string) => {
    // Allow split syntax (e.g. "5+2") only for non-Dominican draws
    const pattern = allowSplitAmount
      ? /^\d*\.?\d*(\+\d*\.?\d*)?$/
      : /^\d*\.?\d*$/;
    if (value === '' || pattern.test(value)) {
      onAmountChange(value);
    }
  };

  return (
  <>
    {/* Main input row */}
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        placeholder="JUGADA"
        value={betNumber}
        onChange={(e) => onBetNumberChange(e.target.value)}
        onKeyDown={onBetNumberKeyDown}
        disabled={!selectedDraw}
        autoFocus={!!selectedDraw}
        inputRef={betNumberInputRef}
        inputProps={{ tabIndex: 1 }}
        sx={{
          flex: 1,
          bgcolor: 'white',
          '& input': {
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            py: 2,
            color: '#333',
          },
          '& input::placeholder': {
            color: '#999',
            opacity: 1,
          },
        }}
      />
      <TextField
        placeholder="N/A"
        value={betError || betWarning}
        disabled
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            bgcolor: betError ? '#c62828' : betWarning ? '#e65100' : 'white',
            height: '100%',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: betError ? '#c62828' : betWarning ? '#e65100' : 'rgba(0, 0, 0, 0.23)',
          },
          '& input': {
            fontSize: (betError || betWarning) ? '14px' : '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            py: 2,
            color: (betError || betWarning) ? '#fff' : '#333',
            WebkitTextFillColor: (betError || betWarning) ? '#fff' : '#999',
            '&.Mui-disabled': {
              WebkitTextFillColor: (betError || betWarning) ? '#fff' : '#999',
            },
          },
          '& input::placeholder': {
            color: '#999',
            opacity: 1,
          },
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
          flex: 1,
          bgcolor: 'white',
          '& input': {
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            py: 2,
            color: '#333',
          },
          '& input::placeholder': {
            color: '#999',
            opacity: 1,
          },
        }}
      />
    </Box>

    {/* Tickets dropdown + Counter row */}
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
