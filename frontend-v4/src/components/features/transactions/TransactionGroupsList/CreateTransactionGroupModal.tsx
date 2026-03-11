import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Box,
  Alert,
  ListSubheader,
  Snackbar
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatCurrency';
import { getAllZones } from '../../../../services/zoneService';
import { getAccountableEntities } from '../../../../services/accountableEntityService';
import api from '../../../../services/api';
import type { BettingPoolBalanceAPI } from '../../../../services/balanceService';

const TRANSACTION_TYPES = ['Cobro', 'Pago', 'Ajuste', 'Retiro', 'Gasto'];

interface EntityOption {
  id: number;
  name: string;
  code: string;
  reference?: string;
  balance: number;
  zoneId?: number;
  source: 'bettingPool' | 'accountableEntity';
}

interface ZoneOption {
  id: number;
  name: string;
}

interface TransactionLine {
  id: number;
  transactionType: string;
  entity1Type: string;
  entity1Id: number;
  entity1Name: string;
  entity1Code: string;
  entity2Type: string | null;
  entity2Id: number | null;
  entity2Name: string;
  entity2Code: string;
  initialBalance1: number;
  initialBalance2: number;
  debit: number;
  credit: number;
  finalBalance1: number;
  finalBalance2: number;
  expenseCategory: string;
  notes: string;
  showInBanca: boolean;
}

interface CreateTransactionGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

// Type-based configuration for entity labels and sources
const getTypeConfig = (type: string) => {
  switch (type) {
    case 'Cobro':
      return { entity1Label: 'Entidad #1', entity2Label: 'Banco', debitDisabled: true, debitHidden: false, creditDisabled: false, showExpenseCategory: false, entity2IsText: false, entity2Optional: false, hideEntity2Balance: false };
    case 'Pago':
      return { entity1Label: 'Entidad #1', entity2Label: 'Banco', debitDisabled: false, debitHidden: false, creditDisabled: true, showExpenseCategory: false, entity2IsText: false, entity2Optional: false, hideEntity2Balance: false };
    case 'Ajuste':
      return { entity1Label: 'Entidad #1', entity2Label: 'Entidad #2', debitDisabled: false, debitHidden: false, creditDisabled: false, showExpenseCategory: false, entity2IsText: false, entity2Optional: false, hideEntity2Balance: false };
    case 'Retiro':
      return { entity1Label: 'Banco', entity2Label: 'Otros', debitDisabled: true, debitHidden: false, creditDisabled: false, showExpenseCategory: false, entity2IsText: false, entity2Optional: false, hideEntity2Balance: false };
    case 'Gasto':
      return { entity1Label: 'Banca/Banco', entity2Label: 'Consumidor', debitDisabled: true, debitHidden: true, creditDisabled: false, showExpenseCategory: true, entity2IsText: true, entity2Optional: true, hideEntity2Balance: true };
    default:
      return { entity1Label: 'Entidad #1', entity2Label: 'Entidad #2', debitDisabled: true, debitHidden: false, creditDisabled: true, showExpenseCategory: false, entity2IsText: false, entity2Optional: false, hideEntity2Balance: false };
  }
};

const CreateTransactionGroupModal = ({ open, onClose, onCreated }: CreateTransactionGroupModalProps): React.ReactElement => {
  const [zoneId, setZoneId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('');
  const [entity1, setEntity1] = useState<EntityOption | null>(null);
  const [entity2, setEntity2] = useState<EntityOption | null>(null);
  const [entity2Text, setEntity2Text] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<string>('');
  const [debit, setDebit] = useState<string>('0');
  const [credit, setCredit] = useState<string>('0');
  const [lineNotes, setLineNotes] = useState<string>('');
  const [remember, setRemember] = useState(false);
  const [showInBanca, setShowInBanca] = useState(false);
  const [groupNotes, setGroupNotes] = useState<string>('');
  const [entity2Error, setEntity2Error] = useState<string>('');

  const [lines, setLines] = useState<TransactionLine[]>([]);
  const [nextLineId, setNextLineId] = useState(1);

  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [bettingPools, setBettingPools] = useState<EntityOption[]>([]);
  const [bancos, setBancos] = useState<EntityOption[]>([]);
  const [otros, setOtros] = useState<EntityOption[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Array<{ categoryId: number; categoryName: string; parentCategoryId: number | null; parentCategoryName: string | null }>>([]);

  // Refs for keyboard flow
  const entity1CodeRef = useRef<HTMLInputElement>(null);
  const entity2CodeRef = useRef<HTMLInputElement>(null);
  const debitRef = useRef<HTMLInputElement>(null);
  const creditRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        const [zonesResponse, bpResponse, entities, historicalBalances] = await Promise.all([
          getAllZones({ isActive: true, pageSize: 200 }),
          api.get('/betting-pools?isActive=true&pageSize=500') as Promise<{
            items: Array<{
              bettingPoolId: number;
              bettingPoolCode: string;
              bettingPoolName: string;
              reference: string | null;
              balance: number;
              zoneId: number;
            }>;
          }>,
          getAccountableEntities({ isActive: true }),
          api.get('/balances/betting-pools') as Promise<BettingPoolBalanceAPI[]>
        ]);

        const zoneItems = (zonesResponse as { data?: Array<{ zoneId: number; zoneName: string }> }).data || [];
        setZones(zoneItems.map(z => ({ id: z.zoneId, name: z.zoneName })));

        // Build map of historical (previous fallback) balances by bettingPoolId
        const histBalanceMap = new Map<number, number>();
        if (Array.isArray(historicalBalances)) {
          historicalBalances.forEach(hb => histBalanceMap.set(hb.bettingPoolId, hb.balance));
        }

        const bpItems = bpResponse.items || [];
        setBettingPools(bpItems.map(bp => ({
          id: bp.bettingPoolId,
          name: bp.bettingPoolName,
          code: bp.bettingPoolCode,
          reference: bp.reference || undefined,
          balance: histBalanceMap.get(bp.bettingPoolId) ?? 0,
          zoneId: bp.zoneId,
          source: 'bettingPool' as const
        })));

        setBancos(entities
          .filter(e => e.entityType === 'Banco')
          .map(e => ({ id: e.entityId, name: e.entityName, code: e.entityCode, balance: e.currentBalance, zoneId: e.zoneId ?? undefined, source: 'accountableEntity' as const }))
        );

        setOtros(entities
          .filter(e => e.entityType === 'Otro')
          .map(e => ({ id: e.entityId, name: e.entityName, code: e.entityCode, balance: e.currentBalance, zoneId: e.zoneId ?? undefined, source: 'accountableEntity' as const }))
        );

        // Load expense categories
        try {
          const categories = await api.get('/expense-categories?isActive=true') as Array<{ categoryId: number; categoryName: string; parentCategoryId: number | null; parentCategoryName: string | null }>;
          if (Array.isArray(categories)) {
            setExpenseCategories(categories);
          }
        } catch {
          // Expense categories endpoint may not exist yet
        }
      } catch (err) {
        console.error('Error loading modal data:', err);
      }
    };
    loadData();
  }, [open]);

  const typeConfig = useMemo(() => getTypeConfig(transactionType), [transactionType]);

  const selectedZoneId = zoneId ? Number(zoneId) : null;

  const filterByZone = useCallback((items: EntityOption[]) => {
    if (!selectedZoneId) return items;
    return items.filter(item => !item.zoneId || item.zoneId === selectedZoneId);
  }, [selectedZoneId]);

  // Entity 1 options based on type and zone
  const entity1Options = useMemo((): EntityOption[] => {
    let options: EntityOption[];
    switch (transactionType) {
      case 'Cobro':
      case 'Pago':
        options = bettingPools;
        break;
      case 'Retiro':
        options = bancos;
        break;
      case 'Ajuste':
        options = [...bettingPools, ...bancos, ...otros];
        break;
      case 'Gasto':
        options = [...bettingPools, ...bancos];
        break;
      default:
        return [];
    }
    return filterByZone(options);
  }, [transactionType, bettingPools, bancos, otros, filterByZone]);

  // Entity 2 options based on type and zone
  const entity2Options = useMemo((): EntityOption[] => {
    let options: EntityOption[];
    switch (transactionType) {
      case 'Cobro':
      case 'Pago':
        options = bancos;
        break;
      case 'Retiro':
        options = otros;
        break;
      case 'Ajuste':
        options = [...bettingPools, ...bancos, ...otros];
        break;
      case 'Gasto':
        options = otros;
        break;
      default:
        return [];
    }
    return filterByZone(options);
  }, [transactionType, bettingPools, bancos, otros, filterByZone]);

  // Compute accumulated balance adjustments from existing lines
  const getAccumulatedAdjustment = useCallback((entityId: number | undefined, entitySource: string | undefined): number => {
    if (!entityId || !entitySource) return 0;
    return lines.reduce((adj, l) => {
      // Entity appears as entity1: balance changed by +debit -credit
      if (l.entity1Id === entityId && l.entity1Type === entitySource) {
        return adj + l.debit - l.credit;
      }
      // Entity appears as entity2: balance changed by -debit +credit
      if (l.entity2Id === entityId && l.entity2Type === entitySource) {
        return adj - l.debit + l.credit;
      }
      return adj;
    }, 0);
  }, [lines]);

  const initialBalance1 = (entity1?.balance ?? 0) + getAccumulatedAdjustment(entity1?.id, entity1?.source);
  const initialBalance2 = (entity2?.balance ?? 0) + getAccumulatedAdjustment(entity2?.id, entity2?.source);
  const debitNum = parseFloat(debit) || 0;
  const creditNum = parseFloat(credit) || 0;
  // Entity1: debit adds to balance, credit subtracts from balance
  // Entity2: credit adds to balance, debit subtracts from balance
  // Cobro: credit collected FROM banca (entity1 -credit) and deposited TO banco (entity2 +credit)
  // Pago: debit paid FROM banco (entity2 -debit) to banca (entity1 +debit)
  const finalBalance1 = initialBalance1 + debitNum - creditNum;
  const finalBalance2 = initialBalance2 - debitNum + creditNum;

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);

  const isFormDisabled = !transactionType;
  const HIGH_AMOUNT_THRESHOLD = 10000;
  const debitWarning = debitNum > HIGH_AMOUNT_THRESHOLD;
  const creditWarning = creditNum > HIGH_AMOUNT_THRESHOLD;

  const focusAmountField = useCallback(() => {
    const config = getTypeConfig(transactionType);
    if (!config.debitHidden && !config.debitDisabled) {
      setTimeout(() => { debitRef.current?.focus(); debitRef.current?.select(); }, 50);
    } else if (!config.creditDisabled) {
      setTimeout(() => { creditRef.current?.focus(); creditRef.current?.select(); }, 50);
    }
  }, [transactionType]);

  const sameEntitySelected = entity1 && entity2 && entity1.id === entity2.id && entity1.source === entity2.source;

  const entity1AlreadyInLines = useMemo(() => {
    if (!entity1) return false;
    return lines.some(l => l.entity1Id === entity1.id && l.entity1Type === entity1.source);
  }, [entity1, lines]);

  const canAddLine = useMemo(() => {
    if (!transactionType || (debitNum === 0 && creditNum === 0)) return false;
    if (!entity1) return false;
    if (sameEntitySelected) return false;
    if (entity1AlreadyInLines) return false;
    if (typeConfig.entity2Optional) return true;
    if (typeConfig.entity2IsText) return entity2Text.trim().length > 0;
    return !!entity2;
  }, [transactionType, debitNum, creditNum, entity1, entity2, entity2Text, typeConfig.entity2IsText, typeConfig.entity2Optional, sameEntitySelected, entity1AlreadyInLines]);

  const handleAddLine = useCallback(() => {
    if (!canAddLine || !entity1) return;

    const newLine: TransactionLine = {
      id: nextLineId,
      transactionType,
      entity1Type: entity1.source,
      entity1Id: entity1.id,
      entity1Name: entity1.name,
      entity1Code: entity1.reference ? `${entity1.code} (${entity1.reference})` : entity1.code,
      entity2Type: typeConfig.entity2IsText ? null : (entity2?.source ?? null),
      entity2Id: typeConfig.entity2IsText ? null : (entity2?.id ?? null),
      entity2Name: typeConfig.entity2IsText ? entity2Text : (entity2?.name ?? ''),
      entity2Code: typeConfig.entity2IsText ? '' : (entity2?.reference ? `${entity2.code} (${entity2.reference})` : (entity2?.code ?? '')),
      initialBalance1,
      initialBalance2: typeConfig.entity2IsText ? 0 : initialBalance2,
      debit: debitNum,
      credit: creditNum,
      finalBalance1,
      finalBalance2: typeConfig.entity2IsText ? 0 : finalBalance2,
      expenseCategory,
      notes: lineNotes,
      showInBanca
    };

    setLines(prev => [...prev, newLine]);
    setNextLineId(prev => prev + 1);

    // Clear entity1 (banca) but keep entity2 (banco) for faster re-entry
    setEntity1(null);
    setDebit('0');
    setCredit('0');
    if (!remember) {
      setLineNotes('');
    }

    // Refocus entity1 code for next line
    setTimeout(() => entity1CodeRef.current?.focus(), 50);
  }, [canAddLine, entity1, entity2, entity2Text, debitNum, creditNum, transactionType, initialBalance1, initialBalance2, finalBalance1, finalBalance2, lineNotes, nextLineId, remember, typeConfig.entity2IsText]);

  const handleRemoveLine = useCallback((lineId: number) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setTransactionType(value);
    setEntity1(null);
    setEntity2(null);
    setEntity2Text('');
    setExpenseCategory('');
    setDebit('0');
    setCredit('0');
    setEntity2Error('');
    setTimeout(() => entity1CodeRef.current?.focus(), 50);
  }, []);

  const handleClose = useCallback(() => {
    setZoneId('');
    setTransactionType('');
    setEntity1(null);
    setEntity2(null);
    setEntity2Text('');
    setExpenseCategory('');
    setDebit('0');
    setCredit('0');
    setLineNotes('');
    setGroupNotes('');
    setLines([]);
    setRemember(false);
    setShowInBanca(false);
    setNextLineId(1);
    onClose();
  }, [onClose]);

  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const handleCreate = useCallback(async () => {
    if (lines.length === 0 || creating) return;

    setCreating(true);
    try {
      const payload = {
        zoneId: zoneId ? Number(zoneId) : null,
        notes: groupNotes || null,
        lines: lines.map(l => ({
          transactionType: l.transactionType,
          entity1Type: l.entity1Type,
          entity1Id: l.entity1Id,
          entity1Name: l.entity1Name,
          entity1Code: l.entity1Code,
          entity1InitialBalance: l.initialBalance1,
          entity1FinalBalance: l.finalBalance1,
          entity2Type: l.entity2Type,
          entity2Id: l.entity2Id,
          entity2Name: l.entity2Name || null,
          entity2Code: l.entity2Code || null,
          entity2InitialBalance: l.initialBalance2,
          entity2FinalBalance: l.finalBalance2,
          debit: l.debit,
          credit: l.credit,
          expenseCategory: l.expenseCategory || null,
          notes: l.notes || null,
          showInBanca: l.showInBanca
        }))
      };

      await api.post('/transaction-groups', payload);
      setSnackbar({ open: true, message: 'Grupo de transacciones creado exitosamente', severity: 'success' });
      handleClose();
      onCreated?.();
    } catch (err) {
      console.error('Error creating transaction group:', err);
      setSnackbar({ open: true, message: 'Error al crear grupo de transacciones', severity: 'error' });
    } finally {
      setCreating(false);
    }
  }, [lines, creating, zoneId, groupNotes, handleClose, onCreated]);

  return (
    <>
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#2c2c2c', fontFamily: 'Montserrat, sans-serif' }}>
        Crear grupo de transacciones
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left column - Form fields */}
          <Grid item xs={12} md={5}>
            {/* Zona */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Zona</InputLabel>
              <Select
                value={zoneId}
                onChange={(e: SelectChangeEvent) => setZoneId(e.target.value)}
                label="Zona"
              >
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {zones.map(z => (
                  <MenuItem key={z.id} value={String(z.id)}>{z.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tipo */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }} required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={transactionType}
                onChange={(e: SelectChangeEvent) => handleTypeChange(e.target.value)}
                label="Tipo"
              >
                {TRANSACTION_TYPES.map(t => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Expense Category (Gasto only) */}
            {typeConfig.showExpenseCategory && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Categoría de gastos</InputLabel>
                <Select
                  value={expenseCategory}
                  onChange={(e: SelectChangeEvent) => setExpenseCategory(e.target.value)}
                  label="Categoría de gastos"
                >
                  {(() => {
                    const parents = expenseCategories.filter(c => c.parentCategoryId === null);
                    const children = expenseCategories.filter(c => c.parentCategoryId !== null);
                    const items: React.ReactNode[] = [];

                    parents.forEach(parent => {
                      items.push(
                        <ListSubheader key={`header-${parent.categoryId}`} sx={{ fontWeight: 700, color: '#2c2c2c', bgcolor: '#f5f5f5' }}>
                          {parent.categoryName}
                        </ListSubheader>
                      );
                      const childrenOfParent = children.filter(c => c.parentCategoryId === parent.categoryId);
                      if (childrenOfParent.length > 0) {
                        childrenOfParent.forEach(child => {
                          items.push(
                            <MenuItem key={child.categoryId} value={child.categoryName} sx={{ pl: 4 }}>
                              {child.categoryName}
                            </MenuItem>
                          );
                        });
                      } else {
                        items.push(
                          <MenuItem key={parent.categoryId} value={parent.categoryName}>
                            {parent.categoryName}
                          </MenuItem>
                        );
                      }
                    });

                    return items;
                  })()}
                </Select>
              </FormControl>
            )}

            {/* Entity 1 */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
              {typeConfig.entity1Label}
            </Typography>
            <Autocomplete
              size="small"
              options={entity1Options}
              getOptionLabel={(opt) => opt.name}
              value={entity1}
              onChange={(_e, val) => setEntity1(val)}
              disabled={isFormDisabled}
              renderInput={(params) => <TextField {...params} placeholder="Seleccione" />}
              sx={{ mb: 1 }}
            />
            <Autocomplete
              size="small"
              autoHighlight
              options={entity1Options}
              getOptionLabel={(opt) => opt.reference ? `${opt.code} (${opt.reference})` : opt.code}
              filterOptions={(options, state) => {
                const input = state.inputValue.toLowerCase();
                return options.filter(opt =>
                  opt.code.toLowerCase().includes(input) ||
                  (opt.reference && opt.reference.toLowerCase().includes(input))
                );
              }}
              value={entity1}
              onChange={(_e, val) => {
                setEntity1(val);
                if (val) {
                  if (!entity2) {
                    setTimeout(() => entity2CodeRef.current?.focus(), 50);
                  } else {
                    focusAmountField();
                  }
                }
              }}
              disabled={isFormDisabled}
              renderInput={(params) => <TextField {...params} inputRef={entity1CodeRef} label="Código" placeholder="Seleccione" />}
              sx={{ mb: 2 }}
            />

            {/* Entity 2 */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
              {typeConfig.entity2Label}
            </Typography>
            {typeConfig.entity2IsText ? (
              <TextField
                fullWidth size="small" placeholder="Seleccione"
                value={entity2Text}
                onChange={(e) => setEntity2Text(e.target.value)}
                disabled={isFormDisabled}
                sx={{ mb: 2 }}
              />
            ) : (
              <>
                <Autocomplete
                  size="small"
                  options={entity2Options}
                  getOptionLabel={(opt) => opt.name}
                  value={entity2}
                  onChange={(_e, val) => {
                    setEntity2(val);
                    if (val) {
                      setEntity2Error('');
                      focusAmountField();
                    }
                  }}
                  disabled={isFormDisabled}
                  renderInput={(params) => <TextField {...params} placeholder="Seleccione" />}
                  sx={{ mb: 1 }}
                />
                <Autocomplete
                  size="small"
                  autoHighlight
                  options={entity2Options}
                  getOptionLabel={(opt) => opt.reference ? `${opt.code} (${opt.reference})` : opt.code}
                  filterOptions={(options, state) => {
                    const input = state.inputValue.toLowerCase();
                    return options.filter(opt =>
                      opt.code.toLowerCase().includes(input) ||
                      (opt.reference && opt.reference.toLowerCase().includes(input))
                    );
                  }}
                  value={entity2}
                  onChange={(_e, val) => {
                    setEntity2(val);
                    if (val) {
                      setEntity2Error('');
                      focusAmountField();
                    }
                  }}
                  disabled={isFormDisabled}
                  renderInput={(params) => <TextField {...params} inputRef={entity2CodeRef} label="Código" placeholder="Seleccione" error={!!entity2Error} helperText={entity2Error} />}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            {sameEntitySelected && (
              <Alert severity="error" sx={{ mb: 2 }}>
                No se puede realizar una transacción con la misma entidad en ambos campos.
              </Alert>
            )}
            {entity1AlreadyInLines && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Ya existe una transacción para esta banca en la tabla.
              </Alert>
            )}

            {/* Notas */}
            <TextField
              fullWidth size="small" label="Notas" value={lineNotes}
              onChange={(e) => setLineNotes(e.target.value)}
              disabled={isFormDisabled}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={remember} onChange={(e) => setRemember(e.target.checked)} />}
                label={<Typography variant="body2">Recordar</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={showInBanca} onChange={(e) => setShowInBanca(e.target.checked)} />}
                label={<Typography variant="body2">Mostrar en banca</Typography>}
              />
            </Box>
          </Grid>

          {/* Right column - Balances */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth size="small" label={`Balance inicial: ${typeConfig.entity1Label}`}
              value={entity1 ? formatCurrency(initialBalance1) : 'N/A'}
              disabled sx={{ mb: 2 }}
              InputProps={{ sx: { bgcolor: '#f0f0f0' } }}
            />
            {!typeConfig.hideEntity2Balance && (
              <TextField
                fullWidth size="small"
                label={`Balance inicial: ${typeConfig.entity2Label}`}
                value={entity2 ? formatCurrency(initialBalance2) : 'N/A'}
                disabled sx={{ mb: 2 }}
                InputProps={{ sx: { bgcolor: '#f0f0f0' } }}
              />
            )}
            {!typeConfig.debitHidden && (
              <TextField
                fullWidth size="small" label="Débito" type="number"
                inputRef={debitRef}
                value={debit}
                onChange={(e) => setDebit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!entity2 && !typeConfig.hideEntity2Balance) {
                      setEntity2Error('Debe seleccionar un banco');
                      entity2CodeRef.current?.focus();
                      return;
                    }
                    handleAddLine();
                  }
                }}
                disabled={isFormDisabled || typeConfig.debitDisabled}
                color={debitWarning ? 'warning' : undefined}
                helperText={debitWarning ? 'Monto superior a $10,000' : undefined}
                sx={{ mb: 2, ...(debitWarning && { '& .MuiOutlinedInput-root': { bgcolor: '#fff3e0' } }) }}
              />
            )}
            <TextField
              fullWidth size="small" label="Crédito" type="number"
              inputRef={creditRef}
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!entity2 && !typeConfig.hideEntity2Balance) {
                    setEntity2Error('Debe seleccionar un banco');
                    entity2CodeRef.current?.focus();
                    return;
                  }
                  handleAddLine();
                }
              }}
              disabled={isFormDisabled || typeConfig.creditDisabled}
              color={creditWarning ? 'warning' : undefined}
              helperText={creditWarning ? 'Monto superior a $10,000' : undefined}
              sx={{ mb: 2, ...(creditWarning && { '& .MuiOutlinedInput-root': { bgcolor: '#fff3e0' } }) }}
            />
            <TextField
              fullWidth size="small" label={`Balance final: ${typeConfig.entity1Label}`}
              value={entity1 ? formatCurrency(finalBalance1) : 'N/A'}
              disabled sx={{ mb: 2 }}
              InputProps={{ sx: { bgcolor: '#f0f0f0' } }}
            />
            {typeConfig.hideEntity2Balance ? (
              <TextField
                fullWidth size="small"
                label="Balance final: #Sistema"
                value="N/A"
                disabled
                InputProps={{ sx: { bgcolor: '#f0f0f0' } }}
              />
            ) : (
              <TextField
                fullWidth size="small"
                label={`Balance final: ${typeConfig.entity2Label}`}
                value={entity2 ? formatCurrency(finalBalance2) : 'N/A'}
                disabled
                InputProps={{ sx: { bgcolor: '#f0f0f0' } }}
              />
            )}
          </Grid>

          {/* Add button */}
          <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'flex-end', pb: 2 }}>
            <Button
              variant="contained"
              onClick={handleAddLine}
              disabled={!canAddLine}
              sx={{ bgcolor: '#51cbce', '&:hover': { bgcolor: '#45b8bb' }, fontWeight: 600, textTransform: 'none' }}
            >
              Agregar línea
            </Button>
          </Grid>
        </Grid>

        {/* Transaction lines table */}
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Entidad #1</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Código</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Entidad #2</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Código</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>Saldo inicial #1</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>Saldo inicial #2</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>Débito</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>Crédito</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>Saldo final #1</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '12px' }}>Saldo final #2</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Notas</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Borrar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13}>
                    <Alert severity="info" sx={{ justifyContent: 'center' }}>
                      No hay registros para mostrar
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line) => (
                  <TableRow key={line.id} hover>
                    <TableCell sx={{ fontSize: '13px' }}>{line.transactionType}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{line.entity1Name}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{line.entity1Code}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{line.entity2Name}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{line.entity2Code}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13px' }}>{formatCurrency(line.initialBalance1)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13px' }}>{formatCurrency(line.initialBalance2)}</TableCell>
                    <TableCell align="right" sx={{ color: '#c62828', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(line.debit)}</TableCell>
                    <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '13px' }}>{formatCurrency(line.credit)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13px' }}>{formatCurrency(line.finalBalance1)}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '13px' }}>{formatCurrency(line.finalBalance2)}</TableCell>
                    <TableCell sx={{ fontSize: '13px' }}>{line.notes}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleRemoveLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {/* Totals row */}
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell colSpan={7} />
                <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totalDebit)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(totalCredit)}</TableCell>
                <TableCell colSpan={4} />
              </TableRow>
              <TableRow>
                <TableCell colSpan={7} />
                <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Total débito</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '12px' }}>Total crédito</TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Group notes */}
        <TextField
          fullWidth size="small" label="Notas para el grupo de transacciones"
          value={groupNotes}
          onChange={(e) => setGroupNotes(e.target.value)}
          multiline rows={2}
          sx={{ mt: 3 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={lines.length === 0}
          sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, textTransform: 'none', fontWeight: 600 }}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>

    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        severity={snackbar.severity}
        variant="filled"
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default CreateTransactionGroupModal;
