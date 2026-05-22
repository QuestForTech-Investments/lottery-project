import React, { useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface AutoExpense {
  description: string;
  amount: string;
  frequency: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  active: boolean;
}


interface AutoExpensesFormData {
  autoExpenses: AutoExpense[];
  [key: string]: AutoExpense[] | string | boolean | number;
}

interface SyntheticEventLike {
  target: {
    name: string;
    value: AutoExpense[];
  };
}

interface AutoExpensesTabProps {
  formData: AutoExpensesFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SyntheticEventLike) => void;
}

type FrequencyType = 'semanal' | 'quincenal' | 'mensual';

/**
 * AutoExpensesTab Component
 * Contains automatic expenses configuration
 */
const AutoExpensesTab: React.FC<AutoExpensesTabProps> = ({ formData, handleChange }) => {
  const { t } = useTranslation();
  const DAY_OF_WEEK_OPTIONS = [
    { value: 0, label: t('createBettingPool.autoExpenses.dayLunes') },
    { value: 1, label: t('createBettingPool.autoExpenses.dayMartes') },
    { value: 2, label: t('createBettingPool.autoExpenses.dayMiercoles') },
    { value: 3, label: t('createBettingPool.autoExpenses.dayJueves') },
    { value: 4, label: t('createBettingPool.autoExpenses.dayViernes') },
    { value: 5, label: t('createBettingPool.autoExpenses.daySabado') },
    { value: 6, label: t('createBettingPool.autoExpenses.dayDomingo') },
  ];
  const frequencyHelperText: Record<string, string> = {
    semanal: t('createBettingPool.autoExpenses.helperWeekly'),
    quincenal: t('createBettingPool.autoExpenses.helperBiweekly'),
    mensual: t('createBettingPool.autoExpenses.helperMonthly'),
  };
  const frequencyLabels: Record<FrequencyType, string> = {
    semanal: t('createBettingPool.autoExpenses.frequencyWeekly'),
    quincenal: t('createBettingPool.autoExpenses.frequencyBiweekly'),
    mensual: t('createBettingPool.autoExpenses.frequencyMonthly'),
  };
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentExpense, setCurrentExpense] = useState<AutoExpense>({
    description: '',
    amount: '',
    frequency: 'semanal',
    dayOfWeek: 0,
    active: true,
  });

  /**
   * Handle add new expense
   */
  const handleAddExpense = (): void => {
    setCurrentExpense({
      description: '',
      amount: '',
      frequency: 'semanal',
      dayOfWeek: 0,
      active: true,
    });
    setEditingIndex(null);
    setOpenDialog(true);
  };

  /**
   * Handle edit expense
   */
  const handleEditExpense = (index: number): void => {
    setCurrentExpense({ ...formData.autoExpenses[index] });
    setEditingIndex(index);
    setOpenDialog(true);
  };

  /**
   * Handle save expense
   */
  const handleSaveExpense = (): void => {
    const newAutoExpenses = [...formData.autoExpenses];

    if (editingIndex !== null) {
      // Update existing expense
      newAutoExpenses[editingIndex] = currentExpense;
    } else {
      // Add new expense
      newAutoExpenses.push(currentExpense);
    }

    handleChange({
      target: {
        name: 'autoExpenses',
        value: newAutoExpenses,
      }
    });

    setOpenDialog(false);
  };

  /**
   * Handle delete expense
   */
  const handleDeleteExpense = (index: number): void => {
    const newAutoExpenses = formData.autoExpenses.filter((_, i) => i !== index);
    handleChange({
      target: {
        name: 'autoExpenses',
        value: newAutoExpenses,
      }
    });
  };

  /**
   * Handle expense field change
   */
  const handleExpenseFieldChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>): void => {
    const { name, value } = e.target;
    setCurrentExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Get frequency label
   */
  const getFrequencyLabel = (expense: AutoExpense): string => {
    const base = frequencyLabels[expense.frequency as FrequencyType] || expense.frequency;
    if (expense.frequency === 'semanal' && expense.dayOfWeek != null) {
      const day = DAY_OF_WEEK_OPTIONS.find(d => d.value === expense.dayOfWeek);
      return `${base} (${day?.label || ''})`;
    }
    if (expense.frequency === 'mensual' && expense.dayOfMonth != null) {
      return `${base} (${t('createBettingPool.autoExpenses.labelDay', { value: expense.dayOfMonth })})`;
    }
    return base;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('createBettingPool.autoExpenses.title')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('createBettingPool.autoExpenses.subtitle')}
      </Typography>

      <Grid container spacing={3}>
        {/* Add Expense Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddExpense}
            sx={{ mb: 2 }}
          >
            {t('createBettingPool.autoExpenses.addButton')}
          </Button>
        </Grid>

        {/* Expenses Table */}
        <Grid item xs={12}>
          {formData.autoExpenses.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {t('createBettingPool.autoExpenses.emptyTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('createBettingPool.autoExpenses.emptyHint')}
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>{t('createBettingPool.autoExpenses.colDescription')}</strong></TableCell>
                    <TableCell align="right"><strong>{t('createBettingPool.autoExpenses.colAmount')}</strong></TableCell>
                    <TableCell><strong>{t('createBettingPool.autoExpenses.colFrequency')}</strong></TableCell>
                    <TableCell><strong>{t('createBettingPool.autoExpenses.colStatus')}</strong></TableCell>
                    <TableCell align="center"><strong>{t('createBettingPool.autoExpenses.colActions')}</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.autoExpenses.map((expense, index) => (
                    <TableRow key={index}>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell align="right">
                        ${parseFloat(expense.amount || '0').toFixed(2)}
                      </TableCell>
                      <TableCell>{getFrequencyLabel(expense)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={expense.active ? 'success.main' : 'text.secondary'}
                        >
                          {expense.active ? t('createBettingPool.autoExpenses.statusActive') : t('createBettingPool.autoExpenses.statusInactive')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditExpense(index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteExpense(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>

        {/* Summary */}
        {formData.autoExpenses.length > 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.lighter' }}>
              <Typography variant="body2">
                <strong>{t('createBettingPool.autoExpenses.totalLabel')}</strong>{' '}
                {t('createBettingPool.autoExpenses.totalConfigured', { value: formData.autoExpenses.length })}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? t('createBettingPool.autoExpenses.editTitle') : t('createBettingPool.autoExpenses.newTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('createBettingPool.autoExpenses.descriptionLabel')}
                  name="description"
                  value={currentExpense.description}
                  onChange={handleExpenseFieldChange}
                  required
                  helperText={t('createBettingPool.autoExpenses.descriptionHelper')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('createBettingPool.autoExpenses.amountLabel')}
                  name="amount"
                  value={currentExpense.amount}
                  onChange={handleExpenseFieldChange}
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                  helperText={t('createBettingPool.autoExpenses.amountHelper')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('createBettingPool.autoExpenses.frequencyLabel')}</InputLabel>
                  <Select
                    name="frequency"
                    value={currentExpense.frequency}
                    onChange={(e) => {
                      handleExpenseFieldChange(e);
                      // Reset day fields when frequency changes
                      setCurrentExpense(prev => ({
                        ...prev,
                        frequency: e.target.value as string,
                        dayOfWeek: e.target.value === 'semanal' ? 0 : undefined,
                        dayOfMonth: e.target.value === 'mensual' ? 1 : undefined,
                      }));
                    }}
                    label={t('createBettingPool.autoExpenses.frequencyLabel')}
                  >
                    <MenuItem value="semanal">{t('createBettingPool.autoExpenses.frequencyWeekly')}</MenuItem>
                    <MenuItem value="quincenal">{t('createBettingPool.autoExpenses.frequencyBiweekly')}</MenuItem>
                    <MenuItem value="mensual">{t('createBettingPool.autoExpenses.frequencyMonthly')}</MenuItem>
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {frequencyHelperText[currentExpense.frequency] || ''}
                  </Typography>
                </FormControl>
              </Grid>

              {/* Day of week selector (for semanal) */}
              {currentExpense.frequency === 'semanal' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('createBettingPool.autoExpenses.dayOfWeekLabel')}</InputLabel>
                    <Select
                      value={currentExpense.dayOfWeek ?? 0}
                      onChange={(e) => setCurrentExpense(prev => ({ ...prev, dayOfWeek: Number(e.target.value) }))}
                      label={t('createBettingPool.autoExpenses.dayOfWeekLabel')}
                    >
                      {DAY_OF_WEEK_OPTIONS.map(d => (
                        <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Day of month selector (for mensual) */}
              {currentExpense.frequency === 'mensual' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label={t('createBettingPool.autoExpenses.dayOfMonthLabel')}
                    value={currentExpense.dayOfMonth ?? 1}
                    onChange={(e) => setCurrentExpense(prev => ({ ...prev, dayOfMonth: Math.min(31, Math.max(1, Number(e.target.value))) }))}
                    inputProps={{ min: 1, max: 31 }}
                    helperText={t('createBettingPool.autoExpenses.dayOfMonthHelper')}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('createBettingPool.cancel')}
          </Button>
          <Button
            onClick={handleSaveExpense}
            variant="contained"
            disabled={!currentExpense.description || !currentExpense.amount}
          >
            {editingIndex !== null ? t('createBettingPool.autoExpenses.update') : t('createBettingPool.autoExpenses.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/**
 * Custom comparison function for AutoExpensesTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: AutoExpensesTabProps, nextProps: AutoExpensesTabProps): boolean => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check autoExpenses array (deep comparison for array of objects)
  const prevExpenses = prevProps.formData.autoExpenses;
  const nextExpenses = nextProps.formData.autoExpenses;

  if (prevExpenses.length !== nextExpenses.length) {
    return false;
  }

  // Check each expense object
  for (let i = 0; i < prevExpenses.length; i++) {
    const prevExpense = prevExpenses[i];
    const nextExpense = nextExpenses[i];

    if (prevExpense.description !== nextExpense.description ||
        prevExpense.amount !== nextExpense.amount ||
        prevExpense.frequency !== nextExpense.frequency ||
        prevExpense.active !== nextExpense.active) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(AutoExpensesTab, arePropsEqual);
