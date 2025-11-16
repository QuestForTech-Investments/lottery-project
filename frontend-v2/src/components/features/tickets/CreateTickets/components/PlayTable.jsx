import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';

/**
 * PlayTable Component
 * Displays a table of plays for a specific type
 * Optimized with React.memo and useMemo
 */
const PlayTable = ({ title, plays, type, onDeletePlay, onDeleteAll }) => {
  // Memoize total calculation to avoid recalculating on every render
  const total = useMemo(() => {
    return plays.reduce((sum, play) => sum + play.amount, 0);
  }, [plays]);

  if (plays.length === 0) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          sx={{ color: 'white' }}
          onClick={() => onDeleteAll(type)}
          title="Eliminar todas las jugadas"
        >
          <DeleteSweepIcon />
        </IconButton>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>LOT</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>NUM</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">MONTO</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center" width="80px">ACCIÓN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plays.map((play) => (
              <TableRow
                key={play.id}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                  '&:hover': { bgcolor: 'action.selected' },
                }}
              >
                <TableCell>{play.lot}</TableCell>
                <TableCell>{play.num}</TableCell>
                <TableCell align="right">${play.amount.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeletePlay(play.id, type)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.200', p: 1.5, textAlign: 'right' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          TOTAL: ${total.toFixed(2)}
        </Typography>
      </Box>
    </Paper>
  );
};

/**
 * Memoize PlayTable to prevent unnecessary re-renders
 * Only re-renders when title, plays, type, onDeletePlay, or onDeleteAll change
 */
export default React.memo(PlayTable);
