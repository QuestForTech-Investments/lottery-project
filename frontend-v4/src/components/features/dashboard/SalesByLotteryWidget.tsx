import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Link, useMediaQuery, useTheme } from '@mui/material';
import { getSalesByDraw, type SalesByDrawItem } from '@/services/dashboardService';
import { formatCurrency } from '@/utils/formatCurrency';

const ACCENT = '#6366f1';

type SortKey = 'name' | 'tickets' | 'ventas' | 'premios' | 'comision' | 'descuento' | 'neto';
type SortDir = 'asc' | 'desc';

const SalesByDrawWidget: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  // On phones we want Lotería → Venta → Premio to show without scroll; the
  // remaining columns slide in via horizontal scroll inside the TableContainer.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    premios: data.reduce((s, r) => s + (r.premios || 0), 0),
    comision: data.reduce((s, r) => s + (r.comision || 0), 0),
    descuento: data.reduce((s, r) => s + (r.descuento || 0), 0),
    neto: data.reduce((s, r) => s + (r.neto || 0), 0),
    tickets: data.reduce((s, r) => s + (r.tickets || 0), 0),
  }), [data]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // Column descriptors — order swaps on mobile so Venta/Premio appear before
  // the secondary columns, which the user reaches via horizontal scroll.
  const COLUMNS_DESKTOP: { key: SortKey; labelKey: string }[] = [
    { key: 'name', labelKey: 'dashboard.salesByDraw.lottery' },
    { key: 'tickets', labelKey: 'dashboard.salesByDraw.tickets' },
    { key: 'ventas', labelKey: 'dashboard.salesByDraw.sale' },
    { key: 'comision', labelKey: 'dashboard.salesByDraw.commission' },
    { key: 'descuento', labelKey: 'dashboard.salesByDraw.discount' },
    { key: 'premios', labelKey: 'dashboard.salesByDraw.prize' },
    { key: 'neto', labelKey: 'dashboard.salesByDraw.net' },
  ];
  const COLUMNS_MOBILE: { key: SortKey; labelKey: string }[] = [
    { key: 'name', labelKey: 'dashboard.salesByDraw.lottery' },
    { key: 'ventas', labelKey: 'dashboard.salesByDraw.sale' },
    { key: 'premios', labelKey: 'dashboard.salesByDraw.prize' },
    { key: 'tickets', labelKey: 'dashboard.salesByDraw.tickets' },
    { key: 'comision', labelKey: 'dashboard.salesByDraw.commission' },
    { key: 'descuento', labelKey: 'dashboard.salesByDraw.discount' },
    { key: 'neto', labelKey: 'dashboard.salesByDraw.net' },
  ];
  const orderedColumns = isMobile ? COLUMNS_MOBILE : COLUMNS_DESKTOP;

  // Sticky-cell helpers. Lotería pins left on phones so it survives horizontal
  // scroll; the Totales row pins bottom on every size so the grand totals are
  // always visible. Z-indexes form a layering hierarchy:
  //   header–name (top-left corner) > totals–name (bottom-left corner) >
  //   totals (bottom row) > body–name (left col) > MUI stickyHeader (top row).
  // Callers supply bgcolor — sticky cells must be opaque or content scrolls
  // through them.
  const bodyNameStickySx = isMobile
    ? { position: 'sticky' as const, left: 0, zIndex: 2, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.08)' }
    : {};
  const headerNameStickySx = isMobile
    ? { position: 'sticky' as const, left: 0, zIndex: 5, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.08)' }
    : {};
  const totalsRowStickySx = { position: 'sticky' as const, bottom: 0, zIndex: 3 };
  const totalsNameStickySx = isMobile
    ? { ...totalsRowStickySx, left: 0, zIndex: 4, boxShadow: '2px 0 4px -2px rgba(0,0,0,0.08)' }
    : totalsRowStickySx;

  const headerCell = (
    key: SortKey,
    label: string,
    align: 'left' | 'right' = 'left',
    extraSx: Record<string, unknown> = {},
  ) => (
    <TableCell
      align={align}
      sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#f5f5f5', color: '#444', ...extraSx }}
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
    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 1 }}>
        {t('dashboard.salesByDraw.title')}
      </Typography>
      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: ACCENT }} size={24} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">{t('dashboard.salesByDraw.noSales')}</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: 'auto', maxHeight: { xs: 380, sm: 460 } }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {orderedColumns.map((col) => (
                  col.key === 'name'
                    ? headerCell('name', t('dashboard.salesByDraw.lottery'), 'left', headerNameStickySx)
                    : headerCell(col.key, t(col.labelKey), 'right')
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map(row => (
                <TableRow key={row.drawId} hover>
                  {orderedColumns.map((col) => {
                    if (col.key === 'name') {
                      return (
                        <TableCell key="name" sx={{ fontSize: 13, textTransform: 'uppercase', bgcolor: '#fff', ...bodyNameStickySx }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {row.imageUrl ? (
                              <Box
                                component="img"
                                src={row.imageUrl}
                                alt={row.name}
                                sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, bgcolor: '#f0f0f0' }}
                              />
                            ) : (
                              <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#e0e0e0', flexShrink: 0 }} />
                            )}
                            <Link
                              component="button"
                              type="button"
                              underline="hover"
                              onClick={() => navigate(`/sales/day?tab=1&drawId=${row.drawId}`)}
                              sx={{ color: ACCENT, fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', fontSize: 13 }}
                            >
                              {row.name}
                            </Link>
                          </Box>
                        </TableCell>
                      );
                    }
                    const raw = row[col.key as keyof SalesByDrawItem];
                    return (
                      <TableCell key={col.key} align="right" sx={{ fontSize: 13 }}>
                        {col.key === 'tickets' ? (raw as number) : formatCurrency(raw as number)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              <TableRow>
                {orderedColumns.map((col) => {
                  if (col.key === 'name') {
                    return (
                      <TableCell key="name" sx={{ fontSize: 13, fontWeight: 700, bgcolor: '#fafafa', ...totalsNameStickySx }}>
                        {t('balances.totals')}
                      </TableCell>
                    );
                  }
                  const value = totals[col.key as Exclude<SortKey, 'name'>];
                  return (
                    <TableCell key={col.key} align="right" sx={{ fontSize: 13, fontWeight: 700, bgcolor: '#fafafa', ...totalsRowStickySx }}>
                      {col.key === 'tickets' ? value : formatCurrency(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default SalesByDrawWidget;
