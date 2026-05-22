import React, { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import { getBettingPools, type BettingPool } from '@services/bettingPoolService';
import { createLoan } from '@services/loanService';

const CreateLoan = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-CA');
  const DAY_LABELS = useMemo(() => [
    t('loansAdmin.day.monday'),
    t('loansAdmin.day.tuesday'),
    t('loansAdmin.day.wednesday'),
    t('loansAdmin.day.thursday'),
    t('loansAdmin.day.friday'),
    t('loansAdmin.day.saturday'),
    t('loansAdmin.day.sunday')
  ], [t]);

  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [paymentDay, setPaymentDay] = useState<number>(0);
  const [startDate, setStartDate] = useState(today);
  const [interestRate, setInterestRate] = useState('0');
  const [notes, setNotes] = useState('');

  const [pools, setPools] = useState<BettingPool[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  useEffect(() => {
    const loadPools = async () => {
      try {
        const response = await getBettingPools({ isActive: true, pageSize: 1000 });
        setPools(response?.items ?? []);
      } catch (err) {
        console.error('Error loading betting pools:', err);
      } finally {
        setPoolsLoading(false);
      }
    };
    loadPools();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedPool || !loanAmount || !installmentAmount) return;

    setSubmitting(true);
    try {
      await createLoan({
        entityType: 'bettingPool',
        entityId: selectedPool.bettingPoolId,
        entityName: selectedPool.bettingPoolName,
        entityCode: selectedPool.bettingPoolCode ?? '',
        principalAmount: parseFloat(loanAmount),
        installmentAmount: parseFloat(installmentAmount),
        frequency,
        paymentDay: frequency === 'weekly' ? paymentDay : null,
        startDate,
        interestRate: parseFloat(interestRate) || 0,
        notes: notes || undefined
      });
      setSnackbar({ open: true, message: t('loansAdmin.create.successMsg'), severity: 'success' });
      setTimeout(() => navigate('/loans/list'), 1500);
    } catch (err) {
      console.error('Error creating loan:', err);
      setSnackbar({ open: true, message: t('loansAdmin.create.errorMsg'), severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [selectedPool, loanAmount, installmentAmount, frequency, paymentDay, startDate, interestRate, notes, navigate, t]);

  const isValid = selectedPool && parseFloat(loanAmount) > 0 && parseFloat(installmentAmount) > 0;

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ textAlign: 'center', mb: 4, color: '#2c2c2c', fontWeight: 600 }}>
            {t('loansAdmin.create.title')}
          </Typography>

          <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Entity Type */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                {t('loansAdmin.create.entityType')}
              </Typography>
              <FormControl fullWidth size="small">
                <Select value="bettingPool" disabled sx={{ fontSize: '14px' }}>
                  <MenuItem value="bettingPool">{t('loansAdmin.create.bettingPool')}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Entity (Banca) */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                {t('loansAdmin.create.entity')}
              </Typography>
              <Autocomplete
                fullWidth
                size="small"
                options={pools}
                loading={poolsLoading}
                value={selectedPool}
                onChange={(_e, val) => setSelectedPool(val)}
                getOptionLabel={(opt) =>
                  `${opt.bettingPoolCode ?? ''} - ${opt.bettingPoolName}${opt.reference ? ` (${opt.reference})` : ''}`
                }
                filterOptions={(options, { inputValue }) => {
                  const lower = inputValue.toLowerCase();
                  return options.filter(o =>
                    (o.bettingPoolCode ?? '').toLowerCase().includes(lower) ||
                    o.bettingPoolName.toLowerCase().includes(lower) ||
                    (o.reference ?? '').toLowerCase().includes(lower)
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder={t('loansAdmin.create.searchPool')} sx={{ '& input': { fontSize: '14px' } }} />
                )}
                isOptionEqualToValue={(opt, val) => opt.bettingPoolId === val.bettingPoolId}
              />
            </Box>

            {/* Loan Amount */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                {t('loansAdmin.create.loanAmount')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={loanAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { fontSize: '14px' }
                }}
              />
            </Box>

            {/* Installment Amount */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                {t('loansAdmin.create.installmentAmount')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={installmentAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInstallmentAmount(e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { fontSize: '14px' }
                }}
              />
            </Box>

            {/* Frequency */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                {t('loansAdmin.create.paymentFrequency')}
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  row
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  {[
                    { value: 'daily', label: t('loansAdmin.frequency.daily') },
                    { value: 'weekly', label: t('loansAdmin.frequency.weekly') },
                    { value: 'monthly', label: t('loansAdmin.frequency.monthly') },
                    { value: 'annual', label: t('loansAdmin.frequency.annual') }
                  ].map(f => (
                    <FormControlLabel
                      key={f.value}
                      value={f.value}
                      control={<Radio size="small" />}
                      label={f.label}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Day of Week (only for weekly) */}
            {frequency === 'weekly' && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                  {t('loansAdmin.create.paymentDay')}
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={paymentDay}
                    onChange={(e: SelectChangeEvent<number>) => setPaymentDay(e.target.value as number)}
                    sx={{ fontSize: '14px' }}
                  >
                    {DAY_LABELS.map((label, idx) => (
                      <MenuItem key={idx} value={idx}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Start Date */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                {t('loansAdmin.create.startDate')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ sx: { fontSize: '14px' } }}
              />
            </Box>

            {/* Interest Rate */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)' }}>
                {t('loansAdmin.create.interestRate')}
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={interestRate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInterestRate(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                placeholder="0.0"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  sx: { fontSize: '14px' }
                }}
              />
            </Box>

            {/* Notes */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
              <Typography sx={{ width: '280px', fontSize: '12px', color: 'rgb(120, 120, 120)', pt: 1 }}>
                {t('loansAdmin.create.notes')}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                placeholder={t('loansAdmin.create.notesPlaceholder')}
                InputProps={{ sx: { fontSize: '14px' } }}
              />
            </Box>

            {/* Submit */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                sx={{
                  bgcolor: '#8b5cf6',
                  '&:hover': { bgcolor: '#7c3aed' },
                  color: 'white',
                  px: 3,
                  py: 1,
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none'
                }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : t('loansAdmin.create.createButton')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateLoan;
