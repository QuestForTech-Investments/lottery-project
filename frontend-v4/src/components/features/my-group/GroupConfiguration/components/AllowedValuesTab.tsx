/**
 * AllowedValuesTab Component
 *
 * Editable lists of allowed values per (gameType, fieldKey).
 * Admin can add new values and remove existing ones.
 */

import { memo, useState, type FC, type ChangeEvent, type KeyboardEvent } from 'react';
import { Box, Typography, Chip, TextField, IconButton, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PRIZE_FIELDS_CONFIG } from '../constants';

export type AllowedValuesMap = Record<string, Record<string, number[]>>;

interface AllowedValuesTabProps {
  allowedValues: AllowedValuesMap;
  onChange: (gameType: string, fieldKey: string, values: number[]) => void;
}

interface FieldEditorProps {
  label: string;
  values: number[];
  onAdd: (value: number) => void;
  onRemove: (value: number) => void;
}

const FieldEditor = memo<FieldEditorProps>(({ label, values, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleAdd = (): void => {
    const num = parseFloat(input.replace(',', '.'));
    if (!Number.isFinite(num) || values.includes(num)) {
      setInput('');
      return;
    }
    onAdd(num);
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: '12px', mb: 0.5, color: '#666' }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          type="number"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Nuevo valor"
          sx={{ width: '140px', '& input': { textAlign: 'right' } }}
        />
        <IconButton size="small" onClick={handleAdd} disabled={!input.trim()} sx={{ color: '#6366f1' }}>
          <AddIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {values.map(v => (
          <Chip
            key={v}
            label={v}
            onDelete={() => onRemove(v)}
            size="small"
            sx={{ bgcolor: '#6366f1', color: 'white', fontWeight: 600, '&:hover': { bgcolor: '#4f52d4' }, '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.9)', '&:hover': { color: '#fff' } } }}
          />
        ))}
      </Box>
    </Box>
  );
});

FieldEditor.displayName = 'FieldEditor';

const AllowedValuesTab: FC<AllowedValuesTabProps> = memo(({ allowedValues, onChange }) => {
  const getValues = (gt: string, fk: string): number[] =>
    allowedValues[gt]?.[fk] ?? [];

  const addValue = (gt: string, fk: string, v: number): void => {
    const current = getValues(gt, fk);
    onChange(gt, fk, [...current, v]);
  };

  const removeValue = (gt: string, fk: string, v: number): void => {
    const current = getValues(gt, fk);
    onChange(gt, fk, current.filter(x => x !== v));
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontSize: '18px', fontWeight: 600 }}>
        Valores permitidos
      </Typography>

      <Grid container spacing={3}>
        {PRIZE_FIELDS_CONFIG.map(cfg => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cfg.gameType}>
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, height: '100%' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, mb: 1.5, textAlign: 'center', textTransform: 'uppercase', color: '#2c2c2c' }}>
                {cfg.title}
              </Typography>
              {Object.entries(cfg.fields).map(([fk, label]) => (
                <FieldEditor
                  key={fk}
                  label={label as string}
                  values={getValues(cfg.gameType, fk)}
                  onAdd={(v) => addValue(cfg.gameType, fk, v)}
                  onRemove={(v) => removeValue(cfg.gameType, fk, v)}
                />
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

AllowedValuesTab.displayName = 'AllowedValuesTab';

export default AllowedValuesTab;
