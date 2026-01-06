import { memo, useMemo, useState, type FC } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import type { ResultLogDto } from '@services/resultsService';

interface ResultsLogsTabProps {
  logsData: ResultLogDto[];
  logsFilterDate: string;
  onFilterDateChange: (date: string) => void;
}

/**
 * Render winning numbers with styled badges
 */
const WinningNumbersBadges: FC<{ log: ResultLogDto }> = memo(({ log }) => {
  const labels: { label: string; value: string }[] = [];

  // Add main numbers (1ra, 2da, 3ra) if present
  if (log.num1) labels.push({ label: '1ra', value: log.num1 });
  if (log.num2) labels.push({ label: '2da', value: log.num2 });
  if (log.num3) labels.push({ label: '3ra', value: log.num3 });

  // Add USA lottery bet types if present
  if (log.cash3) labels.push({ label: 'Pick 3', value: log.cash3 });
  if (log.play4) labels.push({ label: 'Pick 4', value: log.play4 });
  if (log.pick5) labels.push({ label: 'Pick 5', value: log.pick5 });

  // Add derived bet types (Bolita and Singulaccion) if present
  if (log.bolita1) labels.push({ label: 'Bolita 1', value: log.bolita1 });
  if (log.bolita2) labels.push({ label: 'Bolita 2', value: log.bolita2 });
  if (log.singulaccion1) labels.push({ label: 'Sing. 1', value: log.singulaccion1 });
  if (log.singulaccion2) labels.push({ label: 'Sing. 2', value: log.singulaccion2 });
  if (log.singulaccion3) labels.push({ label: 'Sing. 3', value: log.singulaccion3 });

  if (labels.length === 0) {
    return <span>{log.winningNumbers || '-'}</span>;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {labels.map((item, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
            {item.label}
          </Typography>
          <Box
            sx={{
              bgcolor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              px: 0.8,
              py: 0.2,
              minWidth: '28px',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '12px', color: '#333' }}>
              {item.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
});

WinningNumbersBadges.displayName = 'WinningNumbersBadges';

/**
 * Results Logs Tab
 *
 * Displays a table of result logs with filtering capabilities.
 */
export const ResultsLogsTab: FC<ResultsLogsTabProps> = memo(({
  logsData,
  logsFilterDate,
  onFilterDateChange,
}) => {
  const [logsFilter, setLogsFilter] = useState<string>('');

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!logsFilter) return logsData;
    const filterLower = logsFilter.toLowerCase();
    return logsData.filter((log) =>
      log.drawName.toLowerCase().includes(filterLower) ||
      log.username.toLowerCase().includes(filterLower) ||
      log.winningNumbers.includes(logsFilter)
    );
  }, [logsData, logsFilter]);

  return (
    <>
      <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600 }}>
        Logs de resultados
      </Typography>

      {/* Date Filter */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontSize: '12px' }}>
          Fecha
        </Typography>
        <TextField
          type="date"
          value={logsFilterDate}
          onChange={(e) => onFilterDateChange(e.target.value)}
          size="small"
          sx={{ minWidth: 200, bgcolor: '#fff' }}
        />
      </Box>

      {/* Quick Filter */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          size="small"
          placeholder="Filtrado rápido"
          value={logsFilter}
          onChange={(e) => setLogsFilter(e.target.value)}
          sx={{ width: 250, bgcolor: '#fff' }}
        />
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600, color: '#555' }}>Sorteo</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#555' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#555' }}>Fecha de resultado</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#555' }}>Fecha de registro</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#555' }}>Números</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                  No hay entradas disponibles
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{ bgcolor: index % 2 === 0 ? '#fff' : '#f0f0f0' }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{log.drawName}</TableCell>
                  <TableCell>{log.username}</TableCell>
                  <TableCell>{new Date(log.resultDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleDateString() +
                        ' ' +
                        new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <WinningNumbersBadges log={log} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Mostrando {filteredLogs.length} de {logsData.length} entradas
      </Typography>
    </>
  );
});

ResultsLogsTab.displayName = 'ResultsLogsTab';

export default ResultsLogsTab;
