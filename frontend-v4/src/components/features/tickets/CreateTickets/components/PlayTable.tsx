import React, { useMemo, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';

interface Play {
  id: number;
  lot: number;
  num: string;
  amount: number;
}

type PlayType = 'directo' | 'pale' | 'cash3' | 'play4';

interface PlayTableProps {
  title: string;
  plays: Play[];
  type: PlayType;
  onDeletePlay: (playId: number, type: PlayType) => void;
  onDeleteAll: (type: PlayType) => void;
}

/**
 * PlayTable Component
 * Displays a table of plays for a specific type
 * Optimized with React.memo and useMemo
 */
const PlayTable: React.FC<PlayTableProps> = ({ title, plays, type, onDeletePlay, onDeleteAll }) => {
  // Memoize total calculation to avoid recalculating on every render
  const total = useMemo(() => {
    return plays.reduce((sum, play) => sum + play.amount, 0);
  }, [plays]);

  return (
    <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        bgcolor: '#37b9f9',
        color: 'white',
        p: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '40px'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          sx={{ color: 'white', p: 0.5 }}
          onClick={() => onDeleteAll(type)}
          title="Eliminar todas las jugadas"
        >
          <DeleteSweepIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Table Headers */}
      <Box sx={{
        display: 'flex',
        bgcolor: '#f5f5f5',
        p: 0.5,
        borderBottom: '1px solid #ddd',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        <Box sx={{ flex: 1, textAlign: 'center' }}>LOT</Box>
        <Box sx={{ flex: 1.5, textAlign: 'center' }}>NUM</Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>$</Box>
        <Box sx={{ width: '30px', textAlign: 'center' }}>×</Box>
      </Box>

      {/* Table Body - Scrollable */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        minHeight: '150px',
        maxHeight: '200px',
        bgcolor: 'white'
      }}>
        {plays.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontSize: '12px' }}>
            Sin jugadas
          </Box>
        ) : (
          plays.map((play) => (
            <Box
              key={play.id}
              sx={{
                display: 'flex',
                p: 0.5,
                borderBottom: '1px solid #eee',
                fontSize: '11px',
                '&:hover': { bgcolor: '#f0f0f0' }
              }}
            >
              <Box sx={{ flex: 1, textAlign: 'center' }}>{play.lot}</Box>
              <Box sx={{ flex: 1.5, textAlign: 'center' }}>{play.num}</Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>${play.amount.toFixed(2)}</Box>
              <Box sx={{ width: '30px', textAlign: 'center' }}>
                <IconButton
                  size="small"
                  sx={{ p: 0, color: 'error.main' }}
                  onClick={() => onDeletePlay(play.id, type)}
                >
                  <DeleteIcon sx={{ fontSize: '14px' }} />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Footer */}
      <Box sx={{
        bgcolor: '#e0e0e0',
        p: 0.5,
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        TOTAL: ${total.toFixed(2)}
      </Box>
    </Paper>
  );
};

/**
 * Memoize PlayTable to prevent unnecessary re-renders
 * Only re-renders when title, plays, type, onDeletePlay, or onDeleteAll change
 */
export default memo(PlayTable);
