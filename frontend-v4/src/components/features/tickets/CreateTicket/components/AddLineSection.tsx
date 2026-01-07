/**
 * AddLineSection Component
 *
 * Form section for adding a new line to the ticket.
 */

import { memo, type FC } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { Plus } from 'lucide-react';
import type { AddLineSectionProps } from '../types';
import { ADD_LINE_BUTTON_STYLE, SECTION_TITLE_STYLE } from '../constants';

const AddLineSection: FC<AddLineSectionProps> = memo(({
  draws,
  betTypes,
  selectedDraw,
  betNumber,
  selectedBetType,
  betAmount,
  multiplier,
  onDrawChange,
  onBetNumberChange,
  onBetTypeChange,
  onBetAmountChange,
  onMultiplierChange,
  onAddLine,
}) => (
  <Card sx={{ marginBottom: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={SECTION_TITLE_STYLE}>
        Agregar Linea
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Sorteo</InputLabel>
            <Select
              value={selectedDraw}
              label="Sorteo"
              onChange={(e) => onDrawChange(e.target.value)}
            >
              <MenuItem value="">Seleccione sorteo...</MenuItem>
              {draws.map(draw => (
                <MenuItem key={draw.drawId} value={draw.drawId}>
                  {draw.lotteryName} - {draw.drawName} ({draw.drawTime})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Numero"
            placeholder="Ej: 25, 123, etc."
            value={betNumber}
            onChange={(e) => onBetNumberChange(e.target.value)}
            inputProps={{ maxLength: 20 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Jugada</InputLabel>
            <Select
              value={selectedBetType}
              label="Tipo de Jugada"
              onChange={(e) => onBetTypeChange(e.target.value)}
            >
              <MenuItem value="">Seleccione tipo...</MenuItem>
              {betTypes.map(bt => (
                <MenuItem key={bt.betTypeId} value={bt.betTypeId}>
                  {bt.betTypeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Monto"
            placeholder="$0.00"
            value={betAmount}
            onChange={(e) => onBetAmountChange(e.target.value)}
            inputProps={{ min: 1, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Multiplicador"
            value={multiplier}
            onChange={(e) => onMultiplierChange(e.target.value)}
            inputProps={{ min: 1, max: 100, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={onAddLine}
            sx={ADD_LINE_BUTTON_STYLE}
          >
            AGREGAR LINEA
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
));

AddLineSection.displayName = 'AddLineSection';

export default AddLineSection;
