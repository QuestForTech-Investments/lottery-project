import React from 'react';
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
  Box
} from '@mui/material';
import { Trash2 } from 'lucide-react';

/**
 * Componente para mostrar una sección de apuestas
 * (DIRECTO, PALE & TRIPLETA, CASH 3, o PLAY 4 & PICK 5)
 */
const BetSection = ({ title, lines, total, onDeleteAll, onDeleteLine }) => {
  return (
    <Card sx={{ marginBottom: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          padding: 1.5,
          borderBottom: '2px solid #51cbce'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
          {title}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px', color: '#51cbce' }}>
          TOTAL: ${total.toFixed(2)}
        </Typography>
      </Box>

      <CardContent sx={{ padding: 0 }}>
        {lines.length === 0 ? (
          <Box sx={{ padding: 3, textAlign: 'center', color: '#999', fontSize: '12px' }}>
            No hay apuestas en esta sección
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#e9ecef' }}>
                <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', padding: '8px' }}>
                  LOT
                </TableCell>
                <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', padding: '8px' }}>
                  NUM
                </TableCell>
                <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', padding: '8px' }} align="right">
                  $
                </TableCell>
                <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', padding: '8px' }} align="center">
                  <IconButton
                    size="small"
                    onClick={onDeleteAll}
                    sx={{ padding: 0.5 }}
                    title="Eliminar todas las jugadas de esta sección"
                  >
                    <Trash2 size={16} color="#dc3545" />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line) => (
                <TableRow
                  key={line.id}
                  sx={{
                    '&:hover': { bgcolor: '#f8f9fa' },
                    fontSize: '11px'
                  }}
                >
                  <TableCell sx={{ fontSize: '11px', padding: '6px', maxWidth: '120px' }}>
                    <Box
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={`${line.lotteryName} - ${line.drawName}`}
                    >
                      {line.drawName}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '12px', fontWeight: 'bold', padding: '6px' }}>
                    {line.betNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: '11px', padding: '6px' }} align="right">
                    ${line.amount.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ padding: '6px' }} align="center">
                    <IconButton
                      size="small"
                      onClick={() => onDeleteLine(line.id)}
                      sx={{ padding: 0.5 }}
                    >
                      <Trash2 size={14} color="#6c757d" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default BetSection;
