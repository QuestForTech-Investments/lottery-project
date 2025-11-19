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
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const CombinacionesTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Combinaciones
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
              Sorteos
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Select
                multiple
                value={[]}
                input={<OutlinedInput />}
                renderValue={() => '69 seleccionadas'}
              >
                <MenuItem value={1}>Anguila 10am</MenuItem>
                <MenuItem value={2}>NY 12pm</MenuItem>
              </Select>
            </FormControl>
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
                {zones.map((zone) => (
                  <MenuItem key={zone.zoneId || zone.id} value={zone.zoneId || zone.id}>
                    <Checkbox checked={selectedZones.indexOf(zone.zoneId || zone.id) > -1} />
                    <ListItemText primary={zone.zoneName || zone.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Bancas
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Select
                multiple
                value={[]}
                input={<OutlinedInput />}
                renderValue={() => 'Seleccione'}
                displayEmpty
              >
                <MenuItem value={1}>Banca 1</MenuItem>
                <MenuItem value={2}>Banca 2</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
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
                <TableCell>Combinación</TableCell>
                <TableCell align="right">Total Vendido</TableCell>
                <TableCell align="right">Total comisiones</TableCell>
                <TableCell align="right">Total comisiones 2</TableCell>
                <TableCell align="right">Total premios</TableCell>
                <TableCell align="right">Balances</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: 'grey.200' }}>
                <TableCell><strong>Totales</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
                <TableCell align="right"><strong>$0.00</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
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

export default CombinacionesTab;
