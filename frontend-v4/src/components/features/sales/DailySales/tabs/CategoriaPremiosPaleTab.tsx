import { type ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface CategoriaPremiosPaleTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const CategoriaPremiosPaleTab = ({ selectedDate, setSelectedDate }: CategoriaPremiosPaleTabProps): React.ReactElement => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Total: $0.00
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Fecha
            </Typography>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              sx={{ width: 200 }}
            />
          </Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              borderRadius: '30px',
              px: 4,
              py: 1.2,
              textTransform: 'uppercase',
              fontWeight: 500,
              color: 'white'
            }}
          >
            Ver reporte
          </Button>
        </Box>

        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <TextField
            size="small"
            placeholder="Filtrado rápido"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ backgroundColor: 'grey.100' }}>
              <TableRow>
                <TableCell>Premio 1ra</TableCell>
                <TableCell align="center">P</TableCell>
                <TableCell align="center">L</TableCell>
                <TableCell align="center">W</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Venta</TableCell>
                <TableCell align="right">Comisiones</TableCell>
                <TableCell align="right">Premios</TableCell>
                <TableCell align="right">Neto</TableCell>
                <TableCell align="right">Recargas</TableCell>
                <TableCell align="right">Final</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: 'grey.200' }}>
                <TableCell><strong>Totales</strong></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No hay entradas disponibles
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Mostrando 0 de 0 entradas
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CategoriaPremiosPaleTab;
