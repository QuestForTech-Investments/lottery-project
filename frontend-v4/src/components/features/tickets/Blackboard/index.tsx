import React, { useState, memo } from 'react';
import { Box, Paper, Typography, TextField, Autocomplete, Button, Stack, FormControlLabel, Switch } from '@mui/material';
import { Refresh, PictureAsPdf, Print } from '@mui/icons-material';

interface Sorteo {
  id: number;
  name: string;
}

interface Zona {
  id: number;
  name: string;
}

interface BlackboardData {
  id: number;
  numero: string;
  monto: number;
}

const Blackboard: React.FC = () => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sorteo, setSorteo] = useState<Sorteo | null>(null);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [banca, setBanca] = useState<string>('');
  const [autoRefrescar, setAutoRefrescar] = useState<boolean>(false);
  const [data] = useState<BlackboardData[]>([]);
  const [sorteosList] = useState<Sorteo[]>([]);
  const [zonasList] = useState<Zona[]>([]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Monitoreo de jugadas
          </Typography>

          <Box sx={{ mb: 2, maxWidth: 400 }}>
            <TextField fullWidth type="date" label="Fecha" value={fecha} onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }} size="small" />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Autocomplete options={sorteosList} getOptionLabel={(o) => o.name || ''} value={sorteo}
              onChange={(e, v) => setSorteo(v)} renderInput={(params) => <TextField {...params} label="Sorteos" size="small" />} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Autocomplete multiple options={zonasList} getOptionLabel={(o) => o.name || ''} value={zonas}
              onChange={(e, v) => setZonas(v)} renderInput={(params) => <TextField {...params} label="Zonas" size="small"
                helperText={zonas.length > 0 ? `${zonas.length} seleccionadas` : ''} />} />
          </Box>

          <Box sx={{ mb: 3, maxWidth: 400 }}>
            <TextField fullWidth label="Banca" value={banca} onChange={(e) => setBanca(e.target.value)} size="small" />
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<Refresh />} sx={{ textTransform: 'uppercase' }}>Refrescar</Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ textTransform: 'uppercase' }}>PDF</Button>
            <Button variant="contained" startIcon={<Print />} sx={{ textTransform: 'uppercase' }}>Imprimir</Button>
            <FormControlLabel control={<Switch checked={autoRefrescar} onChange={(e) => setAutoRefrescar(e.target.checked)} />}
              label="Auto refrescar" />
          </Stack>

          {data.length === 0 && (
            <Typography variant="h6" sx={{ fontWeight: 400 }}>
              No hay entradas para el sorteo y la fecha elegidos
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(Blackboard);
