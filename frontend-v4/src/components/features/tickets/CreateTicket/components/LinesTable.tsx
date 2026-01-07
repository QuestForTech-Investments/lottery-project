/**
 * LinesTable Component
 *
 * Table displaying ticket lines with delete action.
 */

import { memo, type FC } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import type { LinesTableProps } from '../types';
import { TABLE_HEADER_STYLE, SECTION_TITLE_STYLE } from '../constants';

const LinesTable: FC<LinesTableProps> = memo(({ lines, onRemoveLine }) => {
  if (lines.length === 0) return null;

  return (
    <Card sx={{ marginBottom: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={SECTION_TITLE_STYLE}>
          Lineas del Ticket ({lines.length})
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: TABLE_HEADER_STYLE.bgcolor }}>
              <TableCell sx={{ color: TABLE_HEADER_STYLE.color }}>#</TableCell>
              <TableCell sx={{ color: TABLE_HEADER_STYLE.color }}>Sorteo</TableCell>
              <TableCell sx={{ color: TABLE_HEADER_STYLE.color }}>Numero</TableCell>
              <TableCell sx={{ color: TABLE_HEADER_STYLE.color }}>Tipo</TableCell>
              <TableCell sx={{ color: TABLE_HEADER_STYLE.color, textAlign: 'right' }}>Monto</TableCell>
              <TableCell sx={{ color: TABLE_HEADER_STYLE.color, textAlign: 'center' }}>Accion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{line.lotteryName} - {line.drawName}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{line.betNumber}</TableCell>
                <TableCell>{line.betTypeName}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>${line.betAmount.toFixed(2)}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => onRemoveLine(index)}
                    sx={{ color: '#dc3545' }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

LinesTable.displayName = 'LinesTable';

export default LinesTable;
