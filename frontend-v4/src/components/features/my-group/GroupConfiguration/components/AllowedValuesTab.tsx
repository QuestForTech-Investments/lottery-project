/**
 * AllowedValuesTab Component
 *
 * Tab content for allowed values selection.
 */

import { memo, useCallback, type FC } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import ValueChip from './ValueChip';
import type { AllowedValuesTabProps, PrizesData } from '../types';
import { ALLOWED_VALUES } from '../constants';

// Reusable field section component
interface ValueFieldSectionProps {
  label: string;
  value: string;
  allowedValues: string[];
  onSelect: (value: string) => void;
}

const ValueFieldSection = memo<ValueFieldSectionProps>(({ label, value, allowedValues, onSelect }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" sx={{ fontSize: '12px', mb: 1, color: '#666' }}>
      {label}
    </Typography>
    <TextField
      size="small"
      value={value}
      placeholder="0"
      sx={{ width: '150px', mb: 1, '& input': { textAlign: 'right' } }}
      InputProps={{ readOnly: true }}
    />
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {allowedValues.map((v) => (
        <ValueChip
          key={v}
          value={v}
          isSelected={value === v}
          onClick={() => onSelect(v)}
        />
      ))}
    </Box>
  </Box>
));

ValueFieldSection.displayName = 'ValueFieldSection';

const AllowedValuesTab: FC<AllowedValuesTabProps> = memo(({ prizesData, onPrizeChange }) => {
  const handleDirectoChange = useCallback(
    (field: string) => (value: string) => onPrizeChange('directo', field, value),
    [onPrizeChange]
  );

  const handlePaleChange = useCallback(
    (field: string) => (value: string) => onPrizeChange('pale', field, value),
    [onPrizeChange]
  );

  const handlePickTwoChange = useCallback(
    (field: string) => (value: string) => onPrizeChange('pickTwo', field, value),
    [onPrizeChange]
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontSize: '18px', fontWeight: 600 }}>
        Valores permitidos
      </Typography>

      <Box sx={{ p: 3 }}>
        {/* Directo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
            Directo
          </Typography>
          <ValueFieldSection
            label="Primer Pago"
            value={prizesData.directo?.primerPago || ''}
            allowedValues={ALLOWED_VALUES.directo.primerPago}
            onSelect={handleDirectoChange('primerPago')}
          />
          <ValueFieldSection
            label="Segundo Pago"
            value={prizesData.directo?.segundoPago || ''}
            allowedValues={ALLOWED_VALUES.directo.segundoPago}
            onSelect={handleDirectoChange('segundoPago')}
          />
          <ValueFieldSection
            label="Tercer Pago"
            value={prizesData.directo?.tercerPago || ''}
            allowedValues={ALLOWED_VALUES.directo.tercerPago}
            onSelect={handleDirectoChange('tercerPago')}
          />
          <ValueFieldSection
            label="Dobles"
            value={prizesData.directo?.dobles || ''}
            allowedValues={ALLOWED_VALUES.directo.dobles}
            onSelect={handleDirectoChange('dobles')}
          />
        </Box>

        {/* Pale */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
            Pale
          </Typography>
          <ValueFieldSection
            label="Todos en secuencia"
            value={prizesData.pale?.todosSecuencia || ''}
            allowedValues={ALLOWED_VALUES.pale.todosSecuencia}
            onSelect={handlePaleChange('todosSecuencia')}
          />
          <ValueFieldSection
            label="Primer Pago"
            value={prizesData.pale?.primerPago || ''}
            allowedValues={ALLOWED_VALUES.pale.primerPago}
            onSelect={handlePaleChange('primerPago')}
          />
          <ValueFieldSection
            label="Segundo Pago"
            value={prizesData.pale?.segundoPago || ''}
            allowedValues={ALLOWED_VALUES.pale.segundoPago}
            onSelect={handlePaleChange('segundoPago')}
          />
          <ValueFieldSection
            label="Tercer Pago"
            value={prizesData.pale?.tercerPago || ''}
            allowedValues={ALLOWED_VALUES.pale.tercerPago}
            onSelect={handlePaleChange('tercerPago')}
          />
        </Box>

        {/* Pick Two */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#2c2c2c' }}>
            Pick Two
          </Typography>
          <ValueFieldSection
            label="Primer Pago"
            value={prizesData.pickTwo?.primerPago || ''}
            allowedValues={ALLOWED_VALUES.pickTwo.primerPago}
            onSelect={handlePickTwoChange('primerPago')}
          />
          <ValueFieldSection
            label="Dobles"
            value={prizesData.pickTwo?.dobles || ''}
            allowedValues={ALLOWED_VALUES.pickTwo.dobles}
            onSelect={handlePickTwoChange('dobles')}
          />
        </Box>

        <Typography variant="body2" sx={{ color: '#666', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', mt: 4 }}>
          Nota: Haga clic en un valor para seleccionarlo. El valor se aplicara al campo correspondiente.
        </Typography>
      </Box>
    </Box>
  );
});

AllowedValuesTab.displayName = 'AllowedValuesTab';

export default AllowedValuesTab;
