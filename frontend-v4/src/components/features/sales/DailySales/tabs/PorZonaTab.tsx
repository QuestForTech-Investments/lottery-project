import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Search as SearchIcon } from '@mui/icons-material';

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface PorZonaTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'with-sales', label: 'Con ventas' },
  { value: 'with-prizes', label: 'Con premios' },
  { value: 'pending-tickets', label: 'Con tickets pendientes' },
  { value: 'negative-net', label: 'Con ventas netas negativas' },
  { value: 'positive-net', label: 'Con ventas netas positivas' }
];

const PorZonaTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: PorZonaTabProps): React.ReactElement => {
  const [filterType, setFilterType] = useState<string>('with-sales');

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Zonas
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
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

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Zonas
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Select
                multiple
                value={selectedZones}
                onChange={handleZoneChange}
                input={<OutlinedInput />}
                renderValue={(selected) => `${selected.length} seleccionadas`}
              >
                {zones.map((zone) => {
                  const zoneId = zone.zoneId || zone.id || 0;
                  return (
                    <MenuItem key={zoneId} value={zoneId}>
                      <Checkbox checked={selectedZones.indexOf(zoneId) > -1} />
                      <ListItemText primary={zone.zoneName || zone.name} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
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
            Ver ventas
          </Button>
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
            PDF
          </Button>
        </Box>

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Total: $0.00
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            Filtros
          </Typography>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={(e, newValue) => newValue && setFilterType(newValue)}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            {FILTER_OPTIONS.map(option => (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.8
                }}
              >
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
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
                <TableCell>Nombre</TableCell>
                <TableCell align="center">P</TableCell>
                <TableCell align="center">L</TableCell>
                <TableCell align="center">W</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Venta</TableCell>
                <TableCell align="right">Comisiones</TableCell>
                <TableCell align="right">Descuentos</TableCell>
                <TableCell align="right">Premios</TableCell>
                <TableCell align="right">Neto</TableCell>
                <TableCell align="right">Caída</TableCell>
                <TableCell align="right">Final</TableCell>
                <TableCell align="right">Balance</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: 'grey.200' }}>
                <TableCell><strong>Totales</strong></TableCell>
                <TableCell align="center"><strong>0</strong></TableCell>
                <TableCell align="center"><strong>0</strong></TableCell>
                <TableCell align="center"><strong>0</strong></TableCell>
                <TableCell align="right"><strong>0</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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

export default PorZonaTab;
