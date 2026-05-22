import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import { getDrawsForResults, getResults } from '@services/resultsService';
import type { DrawForResults, ResultDto } from '@services/resultsService';
import { getActiveLocale } from '@/utils/formatters';

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
  const { t } = useTranslation();
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
          // Always show 1st, 2nd, 3rd positions for all lotteries
          if (result.num1) fields.push({ label: t('results.firstShort'), value: result.num1 });
          if (result.num2) fields.push({ label: t('results.secondShort'), value: result.num2 });
          if (result.num3) fields.push({ label: t('results.thirdShort'), value: result.num3 });

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
          fields.push({ label: t('results.firstShort'), value: '' });
          fields.push({ label: t('results.secondShort'), value: '' });
          fields.push({ label: t('results.thirdShort'), value: '' });
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
  }, [selectedDate, t]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(getActiveLocale(), {
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
        {t('results.resultsFor', { date: formatDate(selectedDate) })}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {drawResults.length === 0 ? (
        <Typography color="text.secondary" align="center" py={3}>
          {t('results.noDrawsForDate')}
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
