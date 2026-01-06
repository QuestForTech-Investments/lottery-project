import React, { memo, type RefObject, type KeyboardEvent } from 'react';
import { Box, TextField, Select, MenuItem, FormControl, Typography, IconButton } from '@mui/material';
import type { BetType, Draw } from '../types';

interface BetInputRowProps {
  betNumber: string;
  amount: string;
  betError: string;
  selectedBetType: string;
  selectedDraw: Draw | null;
  betTypes: BetType[];
  totalBets: number;
  grandTotal: string;
  betNumberInputRef: RefObject<HTMLInputElement>;
  onBetNumberChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onBetTypeChange: (value: string) => void;
  onAddBet: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
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
  selectedBetType,
  selectedDraw,
  betTypes,
  totalBets,
  grandTotal,
  betNumberInputRef,
  onBetNumberChange,
  onAmountChange,
  onBetTypeChange,
  onAddBet,
  onKeyDown,
}) => (
  <>
    {/* Main input row */}
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        placeholder="JUGADA"
        value={betNumber}
        onChange={(e) => onBetNumberChange(e.target.value)}
        onKeyDown={onKeyDown}
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
        value={betError}
        disabled
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            bgcolor: betError ? '#c62828' : 'white',
            height: '100%',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: betError ? '#c62828' : 'rgba(0, 0, 0, 0.23)',
          },
          '& input': {
            fontSize: betError ? '14px' : '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            py: 2,
            color: betError ? '#fff' : '#333',
            WebkitTextFillColor: betError ? '#fff' : '#999',
            '&.Mui-disabled': {
              WebkitTextFillColor: betError ? '#fff' : '#999',
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
        onChange={(e) => onAmountChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={!selectedDraw}
        type="number"
        inputProps={{ tabIndex: 2 }}
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

    {/* Dropdown + Counter row */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
        <Select
          value={selectedBetType}
          onChange={(e) => onBetTypeChange(e.target.value)}
          displayEmpty
          disabled={!selectedDraw}
        >
          <MenuItem value="">Seleccione...</MenuItem>
          {betTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <IconButton
        onClick={onAddBet}
        disabled={!betNumber || !amount || !selectedDraw}
        sx={{ bgcolor: '#51cbce', color: 'white', '&:hover': { bgcolor: '#45b8bb' } }}
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
));

BetInputRow.displayName = 'BetInputRow';

export default BetInputRow;
