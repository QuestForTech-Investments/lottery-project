import React, { useState, memo } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack } from '@mui/material';
import { Refresh, PictureAsPdf } from '@mui/icons-material';

interface PoolData {
  id: number;
  amount: number;
  date: string;
}

const ExportedPool: React.FC = () => {
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [data] = useState<PoolData[]>([]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" align="center" sx={{ color: '#1976d2', mb: 4, fontWeight: 400 }}>
            Bote exportado
          </Typography>

          <Box sx={{ mb: 3, maxWidth: 400 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<Refresh />} sx={{ textTransform: 'uppercase' }}>
              Refrescar
            </Button>
            <Button variant="contained" startIcon={<PictureAsPdf />} sx={{ textTransform: 'uppercase' }}>
              PDF
            </Button>
          </Stack>

          {data.length === 0 && (
            <Typography variant="h6" sx={{ fontWeight: 400 }}>
              No hay entradas para la fecha elegida
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default memo(ExportedPool);
