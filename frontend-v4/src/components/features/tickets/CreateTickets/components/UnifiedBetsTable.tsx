/**
 * UnifiedBetsTable — Mobile-only view that consolidates the 4 desktop bet
 * columns (Directo, Pale, Cash3, Play4) into a single "Jugadas" table. The
 * desktop component grid renders four side-by-side cards; that doesn't fit
 * on a phone, so we surface everything in one scrollable list with a small
 * type-chip per row.
 */

import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, IconButton, Typography, Chip } from '@mui/material';
import { Trash2 } from 'lucide-react';
import type { Bet, ColumnType } from '../types';
import { COLUMN_COLORS } from '../constants';

// Mirrors the formatter used by BetCardColumn — duplicating the small helper
// here is cheaper than threading it through props and keeps the two views
// visually consistent.
const formatBetNumber = (number: string): string => {
  if (!number) return '';
  const str = String(number);
  const suffixMatch = str.match(/(fs|fb|bs|bb|bk|s[123]|b[12]|m[123]|[sbfm])$/);
  if (suffixMatch) {
    const suffix = suffixMatch[1];
    const digits = str.slice(0, str.length - suffix.length);
    return digits + suffix;
  }
  const cleanNumber = str.replace(/[^0-9]/g, '');
  if (cleanNumber.length <= 3 || cleanNumber.length === 5) return cleanNumber;
  const pairs: string[] = [];
  for (let i = 0; i < cleanNumber.length; i += 2) {
    pairs.push(cleanNumber.slice(i, i + 2));
  }
  return pairs.join('-');
};

const TYPE_LABEL: Record<ColumnType, string> = {
  directo: 'D',
  pale: 'P',
  cash3: 'C3',
  play4: 'P4',
};

interface UnifiedBetsTableProps {
  directBets: Bet[];
  paleBets: Bet[];
  cash3Bets: Bet[];
  play4Bets: Bet[];
  directTotal: string;
  paleTotal: string;
  cash3Total: string;
  play4Total: string;
  onDeleteBet: (columnType: ColumnType, id: number) => void;
  onDeleteAll: (columnType: ColumnType) => void;
}

const UnifiedBetsTable: React.FC<UnifiedBetsTableProps> = memo(({
  directBets,
  paleBets,
  cash3Bets,
  play4Bets,
  directTotal,
  paleTotal,
  cash3Total,
  play4Total,
  onDeleteBet,
  onDeleteAll,
}) => {
  const { t } = useTranslation();

  // Merge all 4 buckets and tag each bet with its column type. Newest first
  // (same ordering as BetCardColumn which reverses bets on display).
  const allBets: Array<{ bet: Bet; type: ColumnType }> = [
    ...directBets.map(bet => ({ bet, type: 'directo' as const })),
    ...paleBets.map(bet => ({ bet, type: 'pale' as const })),
    ...cash3Bets.map(bet => ({ bet, type: 'cash3' as const })),
    ...play4Bets.map(bet => ({ bet, type: 'play4' as const })),
  ].sort((a, b) => b.bet.id - a.bet.id);

  const totalAll = (
    parseFloat(directTotal || '0') +
    parseFloat(paleTotal || '0') +
    parseFloat(cash3Total || '0') +
    parseFloat(play4Total || '0')
  ).toFixed(2);

  const handleDeleteAllAcrossColumns = () => {
    // Clear every column. We call onDeleteAll once per type so existing
    // per-column side effects (limit reservations etc.) still run.
    if (directBets.length) onDeleteAll('directo');
    if (paleBets.length) onDeleteAll('pale');
    if (cash3Bets.length) onDeleteAll('cash3');
    if (play4Bets.length) onDeleteAll('play4');
  };

  return (
    <Paper sx={{ overflow: 'hidden', mb: 2 }}>
      {/* Title bar */}
      <Box sx={{ bgcolor: '#8b5cf6', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
        {t('tickets.create.playsTitle', { defaultValue: 'Jugadas' })}
      </Box>

      {/* Column headers */}
      <Box
        sx={{
          bgcolor: '#ede9fe',
          display: 'grid',
          gridTemplateColumns: '14% 30% 22% 22% 12%',
          alignItems: 'center',
          fontSize: '11px',
          fontWeight: 'bold',
          py: 0.5,
          borderBottom: '1px solid #ccc',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>Tipo</Box>
        <Box sx={{ textAlign: 'center' }}>{t('tickets.create.lotShort')}</Box>
        <Box sx={{ textAlign: 'center' }}>{t('tickets.create.numShort')}</Box>
        <Box sx={{ textAlign: 'center' }}>$</Box>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton size="small" onClick={handleDeleteAllAcrossColumns}>
            <Trash2 size={14} />
          </IconButton>
        </Box>
      </Box>

      {/* Bets list */}
      <Box sx={{ maxHeight: 360, overflowY: 'auto', bgcolor: 'white' }}>
        {allBets.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center', fontSize: '12px', color: '#888' }}>
            {t('tickets.create.noBetsYet', { defaultValue: 'No hay jugadas todavía' })}
          </Typography>
        ) : (
          allBets.map(({ bet, type }) => {
            const colors = COLUMN_COLORS[type];
            return (
              <Box
                key={`${type}-${bet.id}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '14% 30% 22% 22% 12%',
                  alignItems: 'center',
                  py: 0.5,
                  borderBottom: '1px solid #eee',
                  fontSize: '12px',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={TYPE_LABEL[type]}
                    size="small"
                    sx={{
                      bgcolor: colors.headerColor,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '10px',
                      height: 20,
                      minWidth: 28,
                    }}
                  />
                </Box>
                <Box sx={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', px: 0.5 }}>
                  {bet.drawAbbr || bet.drawName}
                </Box>
                <Box sx={{ fontWeight: 'bold', textAlign: 'center' }}>{formatBetNumber(bet.betNumber)}</Box>
                <Box sx={{ textAlign: 'center' }}>${bet.betAmount.toFixed(2)}</Box>
                <Box sx={{ textAlign: 'center' }}>
                  <IconButton size="small" onClick={() => onDeleteBet(type, bet.id)}>
                    <Trash2 size={12} color="#f44336" />
                  </IconButton>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Grand total */}
      <Box sx={{ bgcolor: '#8b5cf6', color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
        {t('common.total').toUpperCase()}: ${totalAll}
      </Box>
    </Paper>
  );
});

UnifiedBetsTable.displayName = 'UnifiedBetsTable';

export default UnifiedBetsTable;
