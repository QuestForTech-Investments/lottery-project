import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
  Box,
  Alert,
  ListSubheader,
  Snackbar,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatCurrency';
import { getAccountableEntities } from '@services/accountableEntityService';
import api from '@services/api';
import type { BettingPoolBalanceAPI } from '@services/balanceService';
import ConfirmPinModal from '@components/modals/ConfirmPinModal';

const TRANSACTION_TYPES = ['Cobro', 'Pago', 'Gasto'] as const;
type TransactionType = (typeof TRANSACTION_TYPES)[number];

const HIGH_AMOUNT_PIN_THRESHOLD = 10000;

interface EntityOption {
  id: number;
  name: string;
  code: string;
  reference?: string;
  balance: number;
  source: 'bettingPool' | 'accountableEntity';
}

interface ExpenseCategory {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
}

// Row pushed to the local table. Mirrors the shape the API expects in
// `lines[]` for POST /transaction-groups so submission is a 1:1 mapping.
interface Line {
  id: number;
  transactionType: TransactionType;
  bancaId: number;
  bancaName: string;
  bancaCode: string;
  bancaInitial: number;
  bancaFinal: number;
  bancoId: number;
  bancoName: string;
  bancoCode: string;
  bancoInitial: number;
  bancoFinal: number;
  amount: number;
  expenseCategory: string;
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CreateCobroPagoModal = ({ open, onClose, onCreated }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [transactionType, setTransactionType] = useState<TransactionType | ''>('');
  const [banca, setBanca] = useState<EntityOption | null>(null);
  const [banco, setBanco] = useState<EntityOption | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<string>('');
  const [lineNotes, setLineNotes] = useState<string>('');

  const [lines, setLines] = useState<Line[]>([]);
  const [nextLineId, setNextLineId] = useState(1);

  const [bancas, setBancas] = useState<EntityOption[]>([]);
  const [bancos, setBancos] = useState<EntityOption[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);

  const [creating, setCreating] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const bancaCodeRef = useRef<HTMLInputElement>(null);
  const bancoCodeRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const [bpResponse, entities, historicalBalances] = await Promise.all([
          api.get('/betting-pools?isActive=true&pageSize=5000') as Promise<{
            items: Array<{
              bettingPoolId: number;
              bettingPoolCode: string;
              bettingPoolName: string;
              reference: string | null;
            }>;
          }>,
          getAccountableEntities({ isActive: true }),
          api.get('/balances/betting-pools') as Promise<BettingPoolBalanceAPI[]>,
        ]);
        const histBalanceMap = new Map<number, number>();
        if (Array.isArray(historicalBalances)) {
          historicalBalances.forEach((hb) => histBalanceMap.set(hb.bettingPoolId, hb.balance));
        }
        const bpItems = bpResponse.items || [];
        setBancas(
          bpItems.map((bp) => ({
            id: bp.bettingPoolId,
            name: bp.bettingPoolName,
            code: bp.bettingPoolCode,
            reference: bp.reference || undefined,
            balance: histBalanceMap.get(bp.bettingPoolId) ?? 0,
            source: 'bettingPool' as const,
          })),
        );
        setBancos(
          entities
            .filter((e) => e.entityType === 'Banco')
            .map((e) => ({
              id: e.entityId,
              name: e.entityName,
              code: e.entityCode,
              balance: e.currentBalance,
              source: 'accountableEntity' as const,
            })),
        );
        try {
          const categories = (await api.get('/expense-categories?isActive=true')) as ExpenseCategory[];
          if (Array.isArray(categories)) setExpenseCategories(categories);
        } catch {
          /* expense categories optional */
        }
      } catch (err) {
        console.error('Error loading modal data:', err);
      }
    };
    load();
  }, [open]);

  const amountNum = parseFloat(amount) || 0;
  const amountWarning = amountNum > HIGH_AMOUNT_PIN_THRESHOLD;
  const isGasto = transactionType === 'Gasto';
  const isCobro = transactionType === 'Cobro';

  // Cobro: money flows banca → banco. Banca is fuente, banco is destino.
  // Pago / Gasto: money flows banco → banca. Banco is fuente, banca is destino.
  const fuente = isCobro ? banca : banco;
  const destino = isCobro ? banco : banca;
  const fuenteLabel = isCobro ? 'Banca' : 'Banco';
  const destinoLabel = isCobro ? 'Banco' : 'Banca';

  // Accumulate balance shifts from lines already in the table so subsequent
  // lines see realistic starting balances rather than the original snapshot.
  // Each prior line subtracts `amount` from its fuente and adds to its destino.
  const getAccumulatedAdjustment = useCallback(
    (entityId: number | undefined, entitySource: string | undefined): number => {
      if (!entityId || !entitySource) return 0;
      return lines.reduce((adj, l) => {
        const lineIsCobro = l.transactionType === 'Cobro';
        const lineFuenteId = lineIsCobro ? l.bancaId : l.bancoId;
        const lineFuenteSource = lineIsCobro ? 'bettingPool' : 'accountableEntity';
        const lineDestinoId = lineIsCobro ? l.bancoId : l.bancaId;
        const lineDestinoSource = lineIsCobro ? 'accountableEntity' : 'bettingPool';
        if (lineFuenteId === entityId && lineFuenteSource === entitySource) adj -= l.amount;
        if (lineDestinoId === entityId && lineDestinoSource === entitySource) adj += l.amount;
        return adj;
      }, 0);
    },
    [lines],
  );

  const fuenteInitial = fuente ? fuente.balance + getAccumulatedAdjustment(fuente.id, fuente.source) : 0;
  const destinoInitial = destino ? destino.balance + getAccumulatedAdjustment(destino.id, destino.source) : 0;
  const fuenteFinal = fuente ? fuenteInitial - amountNum : 0;
  const destinoFinal = destino ? destinoInitial + amountNum : 0;

  const canAddLine = useMemo(() => {
    if (!transactionType || amountNum <= 0) return false;
    if (!banca || !banco) return false;
    if (isGasto && !expenseCategory) return false;
    return true;
  }, [transactionType, amountNum, banca, banco, isGasto, expenseCategory]);

  const handleAddLine = useCallback(() => {
    if (!canAddLine || !banca || !banco || !transactionType) return;
    // Resolve initial/final per entity based on flow direction.
    const bancaInitial = isCobro ? fuenteInitial : destinoInitial;
    const bancaFinal = isCobro ? fuenteFinal : destinoFinal;
    const bancoInitial = isCobro ? destinoInitial : fuenteInitial;
    const bancoFinal = isCobro ? destinoFinal : fuenteFinal;
    const newLine: Line = {
      id: nextLineId,
      transactionType,
      bancaId: banca.id,
      bancaName: banca.name,
      bancaCode: banca.reference ? `${banca.code} (${banca.reference})` : banca.code,
      bancaInitial,
      bancaFinal,
      bancoId: banco.id,
      bancoName: banco.name,
      bancoCode: banco.code,
      bancoInitial,
      bancoFinal,
      amount: amountNum,
      expenseCategory,
      notes: lineNotes,
    };
    setLines((prev) => [...prev, newLine]);
    setNextLineId((prev) => prev + 1);
    setBanca(null);
    setAmount('');
    setLineNotes('');
    setTimeout(() => bancaCodeRef.current?.focus(), 50);
  }, [canAddLine, banca, banco, transactionType, amountNum, expenseCategory, lineNotes, nextLineId, isCobro, fuenteInitial, fuenteFinal, destinoInitial, destinoFinal]);

  const handleRemoveLine = useCallback((lineId: number) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setTransactionType(value as TransactionType);
    setBanca(null);
    setBanco(null);
    setAmount('');
    setExpenseCategory('');
    setLineNotes('');
    setTimeout(() => bancaCodeRef.current?.focus(), 50);
  }, []);

  const handleClose = useCallback(() => {
    setTransactionType('');
    setBanca(null);
    setBanco(null);
    setAmount('');
    setExpenseCategory('');
    setLineNotes('');
    setLines([]);
    setNextLineId(1);
    onClose();
  }, [onClose]);

  const totalAmount = useMemo(() => lines.reduce((s, l) => s + l.amount, 0), [lines]);
  const requiresPin = totalAmount > HIGH_AMOUNT_PIN_THRESHOLD;

  // Map UI lines → API payload. The backend expects the existing two-entity
  // shape, so we set entity1 = banca, entity2 = banco for every type.
  // Cobro moves money banca → banco (credit on banca side).
  // Pago moves money banco → banca (debit on banca side).
  // Gasto: money flows out of the banco to cover a banca expense — debit.
  const buildLinePayload = useCallback((l: Line) => {
    const lineIsCobro = l.transactionType === 'Cobro';
    const debit = lineIsCobro ? 0 : l.amount;
    const credit = lineIsCobro ? l.amount : 0;
    return {
      transactionType: l.transactionType,
      entity1Type: 'bettingPool',
      entity1Id: l.bancaId,
      entity1Name: l.bancaName,
      entity1Code: l.bancaCode,
      entity1InitialBalance: l.bancaInitial,
      entity1FinalBalance: l.bancaFinal,
      entity2Type: 'accountableEntity',
      entity2Id: l.bancoId,
      entity2Name: l.bancoName,
      entity2Code: l.bancoCode,
      entity2InitialBalance: l.bancoInitial,
      entity2FinalBalance: l.bancoFinal,
      debit,
      credit,
      expenseCategory: l.expenseCategory || null,
      notes: l.notes || null,
      showInBanca: false,
    };
  }, []);

  const submitCreate = useCallback(async () => {
    setCreating(true);
    try {
      const payload = {
        zoneId: null,
        notes: null,
        lines: lines.map(buildLinePayload),
      };
      await api.post('/transaction-groups', payload);
      setSnackbar({ open: true, message: t('payments.savedSuccess'), severity: 'success' });
      handleClose();
      onCreated?.();
    } catch (err) {
      console.error('Error creating transaction group:', err);
      setSnackbar({ open: true, message: t('payments.saveError'), severity: 'error' });
    } finally {
      setCreating(false);
    }
  }, [lines, handleClose, onCreated, buildLinePayload, t]);

  const attemptCreate = useCallback(() => {
    if (lines.length === 0 || creating) return;
    if (requiresPin) setPinOpen(true);
    else submitCreate();
  }, [lines.length, creating, requiresPin, submitCreate]);

  const disabledForm = !transactionType;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c2c2c', fontFamily: 'Montserrat, sans-serif' }}>
          {t('payments.createTitle')}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* LEFT COLUMN — form inputs */}
            <Grid item xs={12} md={7}>
              {/* Tipo */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }} required>
                <InputLabel>{t('common.type')}</InputLabel>
                <Select
                  value={transactionType}
                  onChange={(e: SelectChangeEvent) => handleTypeChange(e.target.value)}
                  label={t('common.type')}
                >
                  <MenuItem value=""><em>{t('common.selectOne')}</em></MenuItem>
                  {TRANSACTION_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Categoría de gastos (solo Gasto) */}
              {isGasto && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }} required>
                  <InputLabel>{t('transactions.expenseCategory')}</InputLabel>
                  <Select
                    value={expenseCategory}
                    onChange={(e: SelectChangeEvent) => setExpenseCategory(e.target.value)}
                    label={t('transactions.expenseCategory')}
                  >
                    {(() => {
                      const parents = expenseCategories.filter((c) => c.parentCategoryId === null);
                      const children = expenseCategories.filter((c) => c.parentCategoryId !== null);
                      const items: React.ReactNode[] = [];
                      parents.forEach((parent) => {
                        items.push(
                          <ListSubheader key={`h-${parent.categoryId}`} sx={{ fontWeight: 700, color: '#2c2c2c', bgcolor: '#f5f5f5' }}>
                            {parent.categoryName}
                          </ListSubheader>,
                        );
                        const kids = children.filter((c) => c.parentCategoryId === parent.categoryId);
                        if (kids.length > 0) {
                          kids.forEach((child) => {
                            items.push(
                              <MenuItem key={child.categoryId} value={child.categoryName} sx={{ pl: 4 }}>
                                {child.categoryName}
                              </MenuItem>,
                            );
                          });
                        } else {
                          items.push(
                            <MenuItem key={parent.categoryId} value={parent.categoryName}>
                              {parent.categoryName}
                            </MenuItem>,
                          );
                        }
                      });
                      return items;
                    })()}
                  </Select>
                </FormControl>
              )}

              {/* BANCA */}
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
                {t('common.bettingPool').toUpperCase()}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={8}>
                  <Autocomplete
                    size="small"
                    options={bancas}
                    getOptionLabel={(opt) => opt.name}
                    value={banca}
                    onChange={(_e, val) => setBanca(val)}
                    disabled={disabledForm}
                    renderInput={(params) => <TextField {...params} label={t('common.name')} placeholder={t('common.select')} />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    size="small"
                    autoHighlight
                    options={bancas}
                    getOptionLabel={(opt) => (opt.reference ? `${opt.code} (${opt.reference})` : opt.code)}
                    filterOptions={(options, state) => {
                      const input = state.inputValue.toLowerCase();
                      return options.filter(
                        (opt) =>
                          opt.code.toLowerCase().includes(input) ||
                          (opt.reference && opt.reference.toLowerCase().includes(input)),
                      );
                    }}
                    value={banca}
                    onChange={(_e, val) => {
                      setBanca(val);
                      if (val) setTimeout(() => amountRef.current?.focus(), 50);
                    }}
                    disabled={disabledForm}
                    renderInput={(params) => (
                      <TextField {...params} inputRef={bancaCodeRef} label={t('common.code')} placeholder={t('common.code')} />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Monto */}
              <TextField
                fullWidth
                size="small"
                label={t('common.amount')}
                type="number"
                inputRef={amountRef}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!banco) {
                      bancoCodeRef.current?.focus();
                      return;
                    }
                    handleAddLine();
                  }
                }}
                disabled={disabledForm}
                color={amountWarning ? 'warning' : undefined}
                helperText={amountWarning ? t('transactions.create.amountOverThreshold', { threshold: formatCurrency(HIGH_AMOUNT_PIN_THRESHOLD) }) : undefined}
                sx={{ mb: 2, ...(amountWarning && { '& .MuiOutlinedInput-root': { bgcolor: '#fff3e0' } }) }}
              />

              {/* BANCO */}
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
                {t('common.bank').toUpperCase()}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={8}>
                  <Autocomplete
                    size="small"
                    options={bancos}
                    getOptionLabel={(opt) => opt.name}
                    value={banco}
                    onChange={(_e, val) => setBanco(val)}
                    disabled={disabledForm}
                    renderInput={(params) => <TextField {...params} label={t('common.name')} placeholder={t('common.select')} />}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    size="small"
                    autoHighlight
                    options={bancos}
                    getOptionLabel={(opt) => opt.code}
                    value={banco}
                    onChange={(_e, val) => setBanco(val)}
                    disabled={disabledForm}
                    renderInput={(params) => (
                      <TextField {...params} inputRef={bancoCodeRef} label={t('common.code')} placeholder={t('common.code')} />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Notas de la línea */}
              <TextField
                fullWidth
                size="small"
                label={t('common.notes')}
                value={lineNotes}
                onChange={(e) => setLineNotes(e.target.value)}
                disabled={disabledForm}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* RIGHT COLUMN — Entidad fuente / destino balances */}
            <Grid item xs={12} md={5}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
                {t('payments.entityFuente')}{fuente ? ` — ${fuenteLabel === 'Banca' ? t('common.bettingPool') : t('common.bank')}` : ''}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('common.initialBalance')}
                    value={fuente ? formatCurrency(fuenteInitial) : '0.00'}
                    disabled
                    InputProps={{ sx: { bgcolor: '#f0f0f0' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('common.finalBalance')}
                    value={fuente ? formatCurrency(fuenteFinal) : '0.00'}
                    disabled
                    InputProps={{
                      sx: {
                        bgcolor: '#f0f0f0',
                        ...(fuente && fuenteFinal < 0 && { color: '#c62828' }),
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
                {t('payments.entityDestino')}{destino ? ` — ${destinoLabel === 'Banca' ? t('common.bettingPool') : t('common.bank')}` : ''}
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('common.initialBalance')}
                    value={destino ? formatCurrency(destinoInitial) : '0.00'}
                    disabled
                    InputProps={{ sx: { bgcolor: '#f0f0f0' } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('common.finalBalance')}
                    value={destino ? formatCurrency(destinoFinal) : '0.00'}
                    disabled
                    InputProps={{
                      sx: {
                        bgcolor: '#f0f0f0',
                        ...(destino && destinoFinal < 0 && { color: '#c62828' }),
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Add line button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleAddLine}
              disabled={!canAddLine}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('transactions.create.addLine')}
            </Button>
          </Box>

          {/* Lines table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.type')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.bettingPool')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.bank')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.amount')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.bettingPool')}: {t('common.initialBalance').toLowerCase()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.bettingPool')}: {t('common.finalBalance').toLowerCase()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.bank')}: {t('common.initialBalance').toLowerCase()}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.bank')}: {t('common.finalBalance').toLowerCase()}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.notes')}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '12px' }}>{t('common.delete')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <Alert severity="info" sx={{ justifyContent: 'center' }}>
                        {t('common.noInfo')}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  lines.map((line) => (
                    <TableRow key={line.id} hover>
                      <TableCell sx={{ fontSize: '13px' }}>{line.transactionType}</TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {line.bancaName}
                        <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '12px' }}>
                          ({line.bancaCode})
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {line.bancoName}
                        <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '12px' }}>
                          ({line.bancoCode})
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px', fontWeight: 600 }}>
                        {formatCurrency(line.amount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px' }}>{formatCurrency(line.bancaInitial)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px', color: line.bancaFinal < 0 ? '#c62828' : 'inherit' }}>
                        {formatCurrency(line.bancaFinal)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px' }}>{formatCurrency(line.bancoInitial)}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '13px', color: line.bancoFinal < 0 ? '#c62828' : 'inherit' }}>
                        {formatCurrency(line.bancoFinal)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{line.notes}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="error" onClick={() => handleRemoveLine(line.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>{t('common.total')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totalAmount)}</TableCell>
                  <TableCell colSpan={6} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none' }}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={attemptCreate}
            variant="contained"
            disabled={lines.length === 0 || creating}
            sx={{
              bgcolor: '#51cbce',
              '&:hover': { bgcolor: '#45b8bb' },
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {t('common.register')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <ConfirmPinModal
        isOpen={pinOpen}
        title={t('transactions.create.confirmTitle')}
        description={t('transactions.create.confirmDescription', {
          threshold: formatCurrency(HIGH_AMOUNT_PIN_THRESHOLD),
          total: formatCurrency(totalAmount),
        })}
        onConfirmed={() => {
          setPinOpen(false);
          submitCreate();
        }}
        onCancel={() => setPinOpen(false)}
      />
    </>
  );
};

export default CreateCobroPagoModal;
