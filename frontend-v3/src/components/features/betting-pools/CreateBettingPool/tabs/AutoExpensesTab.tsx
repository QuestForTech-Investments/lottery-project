/**
 * AutoExpensesTab Component
 * Contains automatic expenses configuration
 * TypeScript version with full type safety
 */

import React, { useState } from 'react'
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
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import type { BettingPoolFormData } from '../hooks/useCreateBettingPoolForm'

interface AutoExpensesTabProps {
  formData: BettingPoolFormData
  handleChange: (event: { target: { name: string; value: any } }) => void
}

interface AutoExpense {
  description: string
  amount: string
  frequency: 'diaria' | 'semanal' | 'mensual' | 'anual'
  active: boolean
}

const AutoExpensesTab: React.FC<AutoExpensesTabProps> = ({ formData, handleChange }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentExpense, setCurrentExpense] = useState<AutoExpense>({
    description: '',
    amount: '',
    frequency: 'diaria',
    active: true,
  })

  /**
   * Handle add new expense
   */
  const handleAddExpense = () => {
    setCurrentExpense({
      description: '',
      amount: '',
      frequency: 'diaria',
      active: true,
    })
    setEditingIndex(null)
    setOpenDialog(true)
  }

  /**
   * Handle edit expense
   */
  const handleEditExpense = (index: number) => {
    setCurrentExpense({ ...formData.autoExpenses[index] })
    setEditingIndex(index)
    setOpenDialog(true)
  }

  /**
   * Handle save expense
   */
  const handleSaveExpense = () => {
    const newAutoExpenses = [...formData.autoExpenses]

    if (editingIndex !== null) {
      // Update existing expense
      newAutoExpenses[editingIndex] = currentExpense
    } else {
      // Add new expense
      newAutoExpenses.push(currentExpense)
    }

    handleChange({
      target: {
        name: 'autoExpenses',
        value: newAutoExpenses,
      },
    })

    setOpenDialog(false)
  }

  /**
   * Handle delete expense
   */
  const handleDeleteExpense = (index: number) => {
    const newAutoExpenses = formData.autoExpenses.filter((_, i) => i !== index)
    handleChange({
      target: {
        name: 'autoExpenses',
        value: newAutoExpenses,
      },
    })
  }

  /**
   * Handle expense field change
   */
  const handleExpenseFieldChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const target = e.target as HTMLInputElement
    const { name, value } = target
    setCurrentExpense((prev) => ({
      ...prev,
      [name as string]: value,
    }))
  }

  /**
   * Get frequency label
   */
  const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      diaria: 'Diaria',
      semanal: 'Semanal',
      mensual: 'Mensual',
      anual: 'Anual',
    }
    return labels[frequency] || frequency
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Gastos Automáticos
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configura los gastos que se deducirán automáticamente del balance de la banca
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
            Agregar Gasto Automático
          </Button>
        </Grid>

        {/* Expenses Table */}
        <Grid item xs={12}>
          {formData.autoExpenses.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No hay gastos automáticos configurados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Haz clic en "Agregar Gasto Automático" para comenzar
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Descripción</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Monto</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Frecuencia</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Estado</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Acciones</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.autoExpenses.map((expense: AutoExpense, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell align="right">
                        ${parseFloat(expense.amount || '0').toFixed(2)}
                      </TableCell>
                      <TableCell>{getFrequencyLabel(expense.frequency)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={expense.active ? 'success.main' : 'text.secondary'}
                        >
                          {expense.active ? 'Activo' : 'Inactivo'}
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
                <strong>Total de gastos automáticos:</strong>{' '}
                {formData.autoExpenses.length} configurado(s)
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Editar Gasto Automático' : 'Nuevo Gasto Automático'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="description"
                  value={currentExpense.description}
                  onChange={handleExpenseFieldChange}
                  required
                  helperText="Nombre o concepto del gasto"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Monto"
                  name="amount"
                  value={currentExpense.amount}
                  onChange={handleExpenseFieldChange}
                  required
                  inputProps={{ step: '0.01', min: '0' }}
                  helperText="Monto del gasto"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Frecuencia</InputLabel>
                  <Select
                    name="frequency"
                    value={currentExpense.frequency}
                    onChange={handleExpenseFieldChange}
                    label="Frecuencia"
                  >
                    <MenuItem value="diaria">Diaria</MenuItem>
                    <MenuItem value="semanal">Semanal</MenuItem>
                    <MenuItem value="mensual">Mensual</MenuItem>
                    <MenuItem value="anual">Anual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveExpense}
            variant="contained"
            disabled={!currentExpense.description || !currentExpense.amount}
          >
            {editingIndex !== null ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

/**
 * Custom comparison function for AutoExpensesTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: AutoExpensesTabProps, nextProps: AutoExpensesTabProps): boolean => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false
  }

  // Check autoExpenses array (deep comparison for array of objects)
  const prevExpenses = prevProps.formData.autoExpenses
  const nextExpenses = nextProps.formData.autoExpenses

  if (prevExpenses.length !== nextExpenses.length) {
    return false
  }

  // Check each expense object
  for (let i = 0; i < prevExpenses.length; i++) {
    const prevExpense = prevExpenses[i]
    const nextExpense = nextExpenses[i]

    if (
      prevExpense.description !== nextExpense.description ||
      prevExpense.amount !== nextExpense.amount ||
      prevExpense.frequency !== nextExpense.frequency ||
      prevExpense.active !== nextExpense.active
    ) {
      return false
    }
  }

  // No relevant changes, skip re-render
  return true
}

export default React.memo(AutoExpensesTab, arePropsEqual)
