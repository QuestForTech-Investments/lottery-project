import React, { memo } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import { Trash2 } from 'lucide-react';
import type { Bet, ColumnType } from '../types';

/**
 * Format bet number with dashes separating each 2 digits
 * Examples:
 * - "23" -> "23" (directo)
 * - "2321" -> "23-21" (palé)
 * - "224466" -> "22-44-66" (tripleta)
 * - "123" -> "123" (cash3 - 3 digits no separator)
 */
const formatBetNumber = (number: string): string => {
  if (!number) return '';

  // Preserve Cash3 Box suffix (+)
  const hasBoxSuffix = String(number).endsWith('+');
  const cleanNumber = String(number).replace(/[^0-9]/g, '');

  if (cleanNumber.length <= 3) {
    return cleanNumber + (hasBoxSuffix ? '+' : '');
  }

  const pairs: string[] = [];
  for (let i = 0; i < cleanNumber.length; i += 2) {
    pairs.push(cleanNumber.slice(i, i + 2));
  }

  return pairs.join('-');
};

interface BetCardColumnProps {
  title: string;
  headerColor: string;
  headerBgColor: string;
  bets: Bet[];
  columnType: ColumnType;
  onDeleteBet: (columnType: ColumnType, id: number) => void;
  onDeleteAll: (columnType: ColumnType) => void;
  total: string;
}

/**
 * BetCardColumn Component
 *
 * Displays a column of bets with header, list, and total.
 */
const BetCardColumn: React.FC<BetCardColumnProps> = memo(({
  title,
  headerColor,
  headerBgColor,
  bets,
  columnType,
  onDeleteBet,
  onDeleteAll,
  total
}) => (
  <Paper sx={{ flex: 1, overflow: 'hidden' }}>
    <Box sx={{ bgcolor: headerColor, color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold' }}>
      {title}
    </Box>
    <Box sx={{
      bgcolor: headerBgColor,
      display: 'grid',
      gridTemplateColumns: '40% 20% 25% 15%',
      alignItems: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
      borderBottom: '1px solid #ccc',
    }}>
      <Box sx={{ textAlign: 'center' }}>LOT</Box>
      <Box sx={{ textAlign: 'center' }}>NUM</Box>
      <Box sx={{ textAlign: 'center' }}>$</Box>
      <Box sx={{ textAlign: 'center' }}>
        <IconButton size="small" onClick={() => onDeleteAll(columnType)}>
          <Trash2 size={14} />
        </IconButton>
      </Box>
    </Box>
    <Box sx={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', bgcolor: 'white' }}>
      {bets.map((bet) => (
        <Box key={bet.id} sx={{
          display: 'grid',
          gridTemplateColumns: '40% 20% 25% 15%',
          alignItems: 'center',
          py: 0.5,
          borderBottom: '1px solid #eee',
          fontSize: '12px'
        }}>
          <Box sx={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {bet.drawAbbr || bet.drawName}
          </Box>
          <Box sx={{ fontWeight: 'bold', textAlign: 'center' }}>{formatBetNumber(bet.betNumber)}</Box>
          <Box sx={{ textAlign: 'center' }}>${bet.betAmount.toFixed(2)}</Box>
          <Box sx={{ textAlign: 'center' }}>
            <IconButton size="small" onClick={() => onDeleteBet(columnType, bet.id)}>
              <Trash2 size={12} color="#f44336" />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Box>
    <Box sx={{ bgcolor: headerColor, color: 'white', p: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
      TOTAL: ${total}
    </Box>
  </Paper>
));

BetCardColumn.displayName = 'BetCardColumn';

export default BetCardColumn;
