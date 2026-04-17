import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Link } from '@mui/material';
import { getSalesByDraw, type SalesByDrawItem } from '@/services/dashboardService';
import { formatCurrency } from '@/utils/formatCurrency';

const ACCENT = '#6366f1';

type SortKey = 'name' | 'tickets' | 'ventas' | 'comision' | 'neto';
type SortDir = 'asc' | 'desc';

const SalesByDrawWidget: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SalesByDrawItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('ventas');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await getSalesByDraw();
        if (alive) setData(rows);
      } catch {
        if (alive) setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let va: string | number = a[sortKey];
      let vb: string | number = b[sortKey];
      if (typeof va === 'string' && typeof vb === 'string') {
        va = va.toLowerCase(); vb = vb.toLowerCase();
        return sortDir === 'asc' ? (va > vb ? 1 : va < vb ? -1 : 0) : (va < vb ? 1 : va > vb ? -1 : 0);
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return sorted;
  }, [data, sortKey, sortDir]);

  const totals = useMemo(() => ({
    ventas: data.reduce((s, r) => s + (r.ventas || 0), 0),
    comision: data.reduce((s, r) => s + (r.comision || 0), 0),
    neto: data.reduce((s, r) => s + (r.neto || 0), 0),
    tickets: data.reduce((s, r) => s + (r.tickets || 0), 0),
  }), [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const headerCell = (key: SortKey, label: string, align: 'left' | 'right' = 'left') => (
    <TableCell
      align={align}
      sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#f5f5f5', color: '#444' }}
      sortDirection={sortKey === key ? sortDir : false}
    >
      <TableSortLabel
        active={sortKey === key}
        direction={sortKey === key ? sortDir : 'asc'}
        onClick={() => handleSort(key)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 1 }}>
        Ventas por Sorteo del Día
      </Typography>
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: ACCENT }} size={24} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">Sin ventas del día</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ flex: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {headerCell('name', 'Nombre')}
                {headerCell('tickets', 'Tickets', 'right')}
                {headerCell('ventas', 'Venta Total', 'right')}
                {headerCell('comision', 'Comisión', 'right')}
                {headerCell('neto', 'Neto', 'right')}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map(row => (
                <TableRow key={row.drawId} hover>
                  <TableCell sx={{ fontSize: 13, textTransform: 'uppercase' }}>
                    <Link
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => navigate(`/sales/day?tab=1&drawId=${row.drawId}`)}
                      sx={{ color: ACCENT, fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', fontSize: 13 }}
                    >
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{row.tickets}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{formatCurrency(row.ventas)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{formatCurrency(row.comision)}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{formatCurrency(row.neto)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell sx={{ fontSize: 13, fontWeight: 700 }}>Totales</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700 }}>{totals.tickets}</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(totals.ventas)}</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(totals.comision)}</TableCell>
                <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700 }}>{formatCurrency(totals.neto)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default SalesByDrawWidget;
