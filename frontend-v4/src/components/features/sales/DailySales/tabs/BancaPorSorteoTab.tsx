import { type ChangeEvent } from 'react';
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
  OutlinedInput
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface Zone {
  zoneId?: number;
  id?: number;
  zoneName?: string;
  name?: string;
}

interface BancaPorSorteoTabProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  zones: Zone[];
  selectedZones: number[];
  handleZoneChange: (event: SelectChangeEvent<number[]>) => void;
}

const BancaPorSorteoTab = ({ selectedDate, setSelectedDate, zones, selectedZones, handleZoneChange }: BancaPorSorteoTabProps): React.ReactElement => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Montos por sorteo y banca
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
              Fecha inicial
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
              Fecha final
            </Typography>
            <TextField
              type="date"
              size="small"
              value={selectedDate}
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
                <MenuItem value={3}>FL 1pm</MenuItem>
                <MenuItem value={4}>GA 7pm</MenuItem>
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

        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 400, mb: 3 }}>
          Total neto: $0.00
        </Typography>

        <Typography variant="h6" align="center" sx={{ color: 'text.secondary', mt: 4 }}>
          No hay entradas para el sorteo y la fecha elegidos
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BancaPorSorteoTab;
