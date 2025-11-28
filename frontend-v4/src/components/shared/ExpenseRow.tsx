import { memo, useCallback } from 'react'
import type { ChangeEvent } from 'react'
import SelectField from './SelectField'
import FormField from './FormField'
import type { Expense } from '@config/expenseConfig'
import { EXPENSE_TYPES, FREQUENCY_OPTIONS, WEEKDAYS } from '@config/expenseConfig'

interface ExpenseRowProps {
  expense: Expense
  index: number
  onUpdate: (index: number, field: keyof Expense, value: string) => void
  onRemove: (index: number) => void
  errors?: Partial<Record<keyof Expense, string>>
}

/**
 * ExpenseRow Component
 * Represents a single row in the expenses table
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const ExpenseRow = memo(({ expense, index, onUpdate, onRemove, errors = {} }: ExpenseRowProps) => {
  // Handle field changes with useCallback to prevent recreating functions
  const handleFieldChange = useCallback(
    (field: keyof Expense) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onUpdate(index, field, e.target.value)
    },
    [index, onUpdate],
  )

  const handleRemove = useCallback(() => {
    onRemove(index)
  }, [index, onRemove])

  return (
    <tr className="expense-row">
      <td className="expense-cell">
        <SelectField
          name={`expense-type-${index}`}
          value={expense.type || ''}
          onChange={handleFieldChange('type')}
          options={EXPENSE_TYPES}
          placeholder="Seleccione tipo"
          valueKey="id"
          labelKey="name"
          error={errors.type}
          className="expense-type-select"
        />
      </td>

      <td className="expense-cell">
        <FormField
          name={`expense-description-${index}`}
          type="text"
          value={expense.description || ''}
          onChange={handleFieldChange('description')}
          placeholder="Descripción del gasto"
          error={errors.description}
          className="expense-description-input"
        />
      </td>

      <td className="expense-cell">
        <SelectField
          name={`expense-frequency-${index}`}
          value={expense.frequency || ''}
          onChange={handleFieldChange('frequency')}
          options={FREQUENCY_OPTIONS}
          valueKey="value"
          labelKey="label"
          error={errors.frequency}
          className="expense-frequency-select"
        />
      </td>

      <td className="expense-cell">
        <FormField
          name={`expense-amount-${index}`}
          type="number"
          value={expense.amount || ''}
          onChange={handleFieldChange('amount')}
          placeholder="0.00"
          min="0"
          step="0.01"
          error={errors.amount}
          className="expense-amount-input"
        />
      </td>

      <td className="expense-cell">
        {expense.frequency === 'weekly' ? (
          <SelectField
            name={`expense-day-${index}`}
            value={expense.day || '1'}
            onChange={handleFieldChange('day')}
            options={WEEKDAYS}
            valueKey="value"
            labelKey="short"
            className="expense-day-select"
          />
        ) : expense.frequency === 'monthly' ? (
          <FormField
            name={`expense-date-${index}`}
            type="number"
            value={expense.day || '1'}
            onChange={handleFieldChange('day')}
            min="1"
            max="31"
            placeholder="1-31"
            className="expense-date-input"
          />
        ) : (
          <FormField
            name={`expense-date-${index}`}
            type="date"
            value={expense.date || ''}
            onChange={handleFieldChange('date')}
            className="expense-date-input"
          />
        )}
      </td>

      <td className="expense-cell expense-actions">
        <button
          type="button"
          onClick={handleRemove}
          className="btn-remove-expense"
          title="Eliminar gasto"
          aria-label={`Eliminar gasto ${expense.description || 'sin descripción'}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </td>
    </tr>
  )
})

ExpenseRow.displayName = 'ExpenseRow'

export default ExpenseRow
