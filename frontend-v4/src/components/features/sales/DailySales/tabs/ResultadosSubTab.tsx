import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import { getDrawsForResults, getResults } from '@services/resultsService';
import type { DrawForResults, ResultDto } from '@services/resultsService';

interface ResultField {
  label: string;
  value: string;
}

interface DrawWithResult {
  drawId: number;
  drawName: string;
  fields: ResultField[];
}

interface ResultadosSubTabProps {
  selectedDate: string;
}

const ResultadosSubTab = ({ selectedDate }: ResultadosSubTabProps): React.ReactElement => {
  const [loading, setLoading] = useState(true);
  const [drawResults, setDrawResults] = useState<DrawWithResult[]>([]);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      // Load draws available for this date
      const draws = await getDrawsForResults(selectedDate);

      // Load results for the date
      const results = await getResults(selectedDate);

      // Create a map of results by drawId
      const resultsMap = new Map<number, ResultDto>();
      results.forEach((r: ResultDto) => {
        resultsMap.set(r.drawId, r);
      });

      // Map draws to DrawWithResult format
      const mapped: DrawWithResult[] = draws.map((draw: DrawForResults) => {
        const result = resultsMap.get(draw.drawId);

        // Build fields based on available data
        const fields: ResultField[] = [];

        if (result) {
          // Always show 1ra, 2da, 3ra for all lotteries
          if (result.num1) fields.push({ label: '1ra', value: result.num1 });
          if (result.num2) fields.push({ label: '2da', value: result.num2 });
          if (result.num3) fields.push({ label: '3ra', value: result.num3 });

          // Show USA lottery specific fields if available
          if (result.cash3) fields.push({ label: 'Pick Three', value: result.cash3 });
          if (result.play4) fields.push({ label: 'Pick Four', value: result.play4 });
          if (result.pick5) fields.push({ label: 'Pick Five', value: result.pick5 });

          // Show derived fields (singulaccion, bolita) if available
          if (result.singulaccion1) fields.push({ label: 'Singulaccion 1', value: result.singulaccion1 });
          if (result.singulaccion2) fields.push({ label: 'Singulaccion 2', value: result.singulaccion2 });
          if (result.singulaccion3) fields.push({ label: 'Singulaccion 3', value: result.singulaccion3 });
          if (result.bolita1) fields.push({ label: 'Bolita 1', value: result.bolita1 });
          if (result.bolita2) fields.push({ label: 'Bolita 2', value: result.bolita2 });
        } else {
          // No result yet - show empty fields for basic numbers
          fields.push({ label: '1ra', value: '' });
          fields.push({ label: '2da', value: '' });
          fields.push({ label: '3ra', value: '' });
        }

        return {
          drawId: draw.drawId,
          drawName: draw.drawName,
          fields
        };
      });

      setDrawResults(mapped);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 400 }}>
        Resultados para {formatDate(selectedDate)}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {drawResults.length === 0 ? (
        <Typography color="text.secondary" align="center" py={3}>
          No hay sorteos disponibles para esta fecha
        </Typography>
      ) : (
        drawResults.map((draw) => (
          <Box key={draw.drawId} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  minWidth: 180,
                  pt: 1
                }}
              >
                {draw.drawName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {draw.fields.map((field, idx) => (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {field.label}:
                    </Typography>
                    <TextField
                      size="small"
                      value={field.value}
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        width: 80,
                        '& .MuiInputBase-root': {
                          backgroundColor: '#f5f5f5',
                        },
                        '& .MuiInputBase-input': {
                          textAlign: 'center',
                          py: 0.8,
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default ResultadosSubTab;
