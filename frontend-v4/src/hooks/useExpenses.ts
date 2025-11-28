import { useState, useCallback, useMemo } from 'react';
import { DEFAULT_EXPENSE, type Expense } from '../config/expenseConfig';

/**
 * Custom hook to manage automatic expenses state and operations
 * Separates business logic from presentation
 *
 * @param {Array} initialExpenses - Initial expenses array
 * @param {Function} onUpdate - Callback when expenses are updated
 * @returns {Object} Expense management methods and state
 */
type UpdateCallback = (expenses: Expense[]) => void

export const useExpenses = (initialExpenses: Expense[] = [], onUpdate?: UpdateCallback) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  /**
   * Add a new expense with default values
   */
  const addExpense = useCallback(() => {
    const newExpense: Expense = { ...DEFAULT_EXPENSE, id: Date.now() };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);

    if (onUpdate) {
      onUpdate(updatedExpenses);
    }
  }, [expenses, onUpdate]);

  /**
   * Remove an expense by index
   */
  const removeExpense = useCallback((index: number) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);

    // Adjust current page if needed
    const totalPages = Math.ceil(updatedExpenses.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }

    if (onUpdate) {
      onUpdate(updatedExpenses);
    }
  }, [expenses, onUpdate, currentPage, itemsPerPage]);

  /**
   * Update a specific field of an expense
   */
  const updateExpense = useCallback(<K extends keyof Expense>(index: number, field: K, value: Expense[K]) => {
    const updatedExpenses = expenses.map((expense, i) =>
      i === index ? { ...expense, [field]: value } : expense
    );
    setExpenses(updatedExpenses);

    if (onUpdate) {
      onUpdate(updatedExpenses);
    }
  }, [expenses, onUpdate]);

  /**
   * Update entire expense object
   */
  const updateEntireExpense = useCallback((index: number, newExpense: Partial<Expense>) => {
    const updatedExpenses = expenses.map((expense, i) =>
      i === index ? { ...expense, ...newExpense } : expense
    );
    setExpenses(updatedExpenses);

    if (onUpdate) {
      onUpdate(updatedExpenses);
    }
  }, [expenses, onUpdate]);

  /**
   * Clear all expenses
   */
  const clearExpenses = useCallback(() => {
    setExpenses([]);
    setCurrentPage(1);

    if (onUpdate) {
      onUpdate([]);
    }
  }, [onUpdate]);

  /**
   * Filter expenses based on search term
   */
  const filteredExpenses = useMemo(() => {
    if (!filter.trim()) {
      return expenses;
    }

    const searchTerm = filter.toLowerCase();
    return expenses.filter(expense =>
      expense.description?.toLowerCase().includes(searchTerm) ||
      expense.type?.toLowerCase().includes(searchTerm) ||
      expense.amount?.toString().includes(searchTerm)
    );
  }, [expenses, filter]);

  /**
   * Get paginated expenses
   */
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, currentPage, itemsPerPage]);

  /**
   * Calculate total pages
   */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredExpenses.length / itemsPerPage);
  }, [filteredExpenses.length, itemsPerPage]);

  /**
   * Calculate total amount of all expenses
   */
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const amountValue =
        typeof expense.amount === 'string' ? parseFloat(expense.amount) : Number(expense.amount) || 0;
      const amount = Number.isFinite(amountValue) ? amountValue : 0;
      return sum + amount;
    }, 0);
  }, [expenses]);

  /**
   * Validate expense data
   */
  const validateExpense = useCallback((expense: Expense) => {
    const errors: Record<string, string> = {};

    if (!expense.type) {
      errors.type = 'Tipo de gasto requerido';
    }

    if (!expense.description?.trim()) {
      errors.description = 'Descripción requerida';
    }

    const parsedAmount =
      typeof expense.amount === 'string' ? parseFloat(expense.amount) : Number(expense.amount);

    if (!parsedAmount || parsedAmount <= 0) {
      errors.amount = 'Monto debe ser mayor a 0';
    }

    if (!expense.frequency) {
      errors.frequency = 'Frecuencia requerida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);

  return {
    // State
    expenses,
    filteredExpenses,
    paginatedExpenses,
    filter,
    currentPage,
    itemsPerPage,
    totalPages,
    totalAmount,

    // Actions
    addExpense,
    removeExpense,
    updateExpense,
    updateEntireExpense,
    clearExpenses,
    setFilter,
    setCurrentPage,
    setItemsPerPage,
    validateExpense,

    // Computed
    hasExpenses: expenses.length > 0,
    isEmpty: expenses.length === 0
  };
};
