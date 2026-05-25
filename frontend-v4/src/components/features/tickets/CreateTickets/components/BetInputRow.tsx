import React, { memo, type RefObject, type KeyboardEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, TextField, Typography, IconButton, Button, useMediaQuery, useTheme } from '@mui/material';
import { CornerDownLeft } from 'lucide-react';
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
  /** True while a limit-availability response is in flight. Blocks add. */
  limitChecking?: boolean;
  ticketsDropdown?: ReactNode;
  allowSplitAmount?: boolean;
  /**
   * True when the current input is a compound-play command (e.g. "25.").
   * Replaces the middle "limit" field with a neutral "X" — the backend handles
   * validation per generated bet.
   */
  compoundMode?: boolean;
  /** Opens the "Convertir jugadas" modal when "+" is typed on an empty input. */
  onOpenConvertModal?: () => void;
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
  limitChecking = false,
  ticketsDropdown,
  allowSplitAmount = false,
  compoundMode = false,
  onOpenConvertModal,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // Phones use the numeric keyboard on the play input — bet numbers are
  // mostly digits and the on-screen letter keys aren't worth the screen real
  // estate. We surface the letter/symbol modifiers (F, B, +, -) as buttons
  // below the input row instead.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const appendToBetNumber = (chunk: string) => {
    const next = (betNumber + chunk).toUpperCase();
    // Preserve the "+ on empty input" shortcut that opens the convert modal.
    if (chunk === '+' && betNumber === '' && onOpenConvertModal) {
      onOpenConvertModal();
      return;
    }
    onBetNumberChange(next);
    // Keep focus on the input so the next numeric tap continues building the
    // play without an extra tap to re-focus.
    setTimeout(() => betNumberInputRef.current?.focus(), 0);
  };

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
  } else if (compoundMode) {
    // Compound plays bypass the limit check — backend validates each bet.
    middleText = 'X';
    middleBgColor = '#f5f5f5';
    middleTextColor = '#666';
    middleFontSize = '28px';
  } else if (limitChecking) {
    middleText = t('tickets.create.searching');
    middleBgColor = '#fff8e1';
    middleTextColor = '#8d6e00';
    middleFontSize = '16px';
  } else if (hasLimit) {
    if (limitAvailable === -1) {
      middleText = t('tickets.create.noLimit');
      middleBgColor = '#e8f5e9';
      middleTextColor = '#2e7d32';
      middleFontSize = '18px';
    } else if (limitAvailable === 0) {
      middleText = t('ticketStatus.blocked').toUpperCase();
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
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 1, md: 2 },
        mb: 2,
      }}
    >
      <TextField
        placeholder={t('tickets.create.playPlaceholder')}
        value={betNumber}
        onChange={(e) => {
          const next = e.target.value.toUpperCase();
          // "+" on an empty input is the shortcut to open "Convertir jugadas".
          // Anywhere else "+" is a real modifier (box, etc.).
          if (next === '+' && betNumber === '' && onOpenConvertModal) {
            onOpenConvertModal();
            return;
          }
          onBetNumberChange(next);
        }}
        onKeyDown={onBetNumberKeyDown}
        onBlur={onBetNumberBlur}
        disabled={!selectedDraw}
        autoFocus={!!selectedDraw}
        inputRef={betNumberInputRef}
        // `inputMode: decimal` triggers the numeric keypad WITH a period on
        // mobile (iOS/Android both surface "." on decimal). Letters and the
        // remaining symbols (F, B, +, -) are reachable through the helper
        // buttons below the row. Desktop ignores `inputMode` so typing still
        // works as before.
        inputProps={{ tabIndex: 1, inputMode: isMobile ? 'decimal' : undefined }}
        sx={{
          flex: 1, bgcolor: 'white',
          '& input': { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', py: 2, color: '#333', textTransform: 'uppercase' },
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
        placeholder={t('tickets.create.amountPlaceholder')}
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

    {/* Mobile-only modifier keypad. Surfaces the letter/symbol characters
        (F, B, +, -) that the numeric keyboard hides, so users can build the
        full set of play codes (FS, FB, BS, BB, 12+34, etc.) by tapping. Each
        modifier is meant to appear at most once in a play, so the button
        disables itself once the char is already present in the input. */}
    {isMobile && (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75, mb: 1.5 }}>
        {(['F', 'B', '+', '-'] as const).map((ch) => {
          const alreadyPresent = betNumber.toUpperCase().includes(ch);
          return (
            <Button
              key={ch}
              variant="outlined"
              disabled={!selectedDraw || alreadyPresent}
              onClick={() => appendToBetNumber(ch)}
              sx={{
                minWidth: 0,
                py: 1,
                fontSize: '18px',
                fontWeight: 700,
                color: '#8b5cf6',
                borderColor: '#c4b5fd',
                bgcolor: 'white',
                '&:hover': { bgcolor: '#f5f3ff', borderColor: '#8b5cf6' },
              }}
            >
              {ch}
            </Button>
          );
        })}
      </Box>
    )}

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      {ticketsDropdown}
      {/* "Bajar jugada" — adds the current row to the bets list. Mobile shows
          a labelled "Enter" button (icon + word) so it's not confused with
          the "+" and "-" modifier buttons above. */}
      {isMobile ? (
        <Button
          onClick={onAddBet}
          disabled={!betNumber || !amount || !selectedDraw || limitChecking}
          variant="contained"
          startIcon={<CornerDownLeft size={18} />}
          sx={{
            bgcolor: '#8b5cf6',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            px: 2,
            py: 0.75,
            '&:hover': { bgcolor: '#7c3aed' },
          }}
          title={limitChecking ? t('tickets.create.waitingAvailability') : t('tickets.create.addPlayHint')}
        >
          {t('tickets.create.enterButton', { defaultValue: 'Enter' })}
        </Button>
      ) : (
        <IconButton
          onClick={onAddBet}
          disabled={!betNumber || !amount || !selectedDraw || limitChecking}
          sx={{
            bgcolor: '#8b5cf6',
            color: 'white',
            '&:hover': { bgcolor: '#7c3aed' },
          }}
          title={limitChecking ? t('tickets.create.waitingAvailability') : t('tickets.create.addPlayHint')}
        >
          ➕
        </IconButton>
      )}
      <Typography sx={{ fontSize: '14px', color: '#666' }}>
        <strong>{t('tickets.create.plays')}:</strong> {totalBets}
      </Typography>
      <Typography sx={{ fontSize: '14px', color: '#666' }}>
        <strong>{t('tickets.create.totalLabel')}:</strong> ${grandTotal}
      </Typography>
      {!isMobile && (
        <Typography sx={{ fontSize: '12px', color: '#888', fontStyle: 'italic', ml: 'auto' }}>
          {t('tickets.create.tabHint')}
        </Typography>
      )}
    </Box>
  </>
  );
});

BetInputRow.displayName = 'BetInputRow';

export default BetInputRow;
