import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useExpenses } from '../../hooks/useExpenses';
import ExpenseRow from '../shared/ExpenseRow';
import Pagination from '../shared/Pagination';
import { PAGINATION_OPTIONS, DEFAULT_ITEMS_PER_PAGE } from '../../config/expenseConfig';
import '../../assets/css/GastosAutomaticos.css';

/**
 * GastosAutomaticosTab Component
 * Main tab for managing automatic expenses
 *
 * Features:
 * - Add/Remove expenses
 * - Filter/Search expenses
 * - Pagination
 * - Data table with sortable columns
 */
const GastosAutomaticosTab = React.memo(({
  formData,
  onChange,
  error,
  success
}) => {
  // Initialize expenses hook with form data
  const {
    paginatedExpenses,
    filter,
    currentPage,
    itemsPerPage,
    totalPages,
    totalAmount,
    addExpense,
    removeExpense,
    updateExpense,
    setFilter,
    setCurrentPage,
    setItemsPerPage,
    hasExpenses,
    filteredExpenses
  } = useExpenses(formData.autoExpenses || [], (updatedExpenses) => {
    // Sync with parent form data
    onChange({
      target: {
        name: 'autoExpenses',
        value: updatedExpenses
      }
    });
  });

  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  }, [setFilter, setCurrentPage]);

  // Handle clear filter
  const handleClearFilter = useCallback(() => {
    setFilter('');
    setCurrentPage(1);
  }, [setFilter, setCurrentPage]);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(num);
  }, []);

  return (
    <div className="gastos-automaticos-tab">
      {/* Header Section */}
      <div className="expenses-header">
        <div className="expenses-title-section">
          <h3 className="expenses-title">Gastos Automáticos</h3>
          <p className="expenses-subtitle">
            Configure los gastos recurrentes de la banca
          </p>
        </div>

        <button
          type="button"
          onClick={addExpense}
          className="btn-add-expense"
          aria-label="Agregar nuevo gasto"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
          </svg>
          Agregar nuevo gasto
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Filters and Pagination Controls */}
      {hasExpenses && (
        <div className="expenses-controls">
          <div className="expenses-pagination-control">
            <label htmlFor="expenses-per-page" className="control-label">
              Entradas por página
            </label>
            <select
              id="expenses-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="control-select"
            >
              {PAGINATION_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="expenses-filter">
            <input
              type="text"
              value={filter}
              onChange={handleFilterChange}
              placeholder="Filtrado rápido"
              className="filter-input"
              aria-label="Filtrar gastos"
            />
            <button
              type="button"
              onClick={handleClearFilter}
              disabled={!filter}
              className="btn-clear-filter"
              aria-label="Limpiar filtro"
              title="Limpiar filtro"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      {hasExpenses ? (
        <div className="expenses-table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th className="table-header">Tipo</th>
                <th className="table-header">Descripción</th>
                <th className="table-header">Frecuencia</th>
                <th className="table-header">Monto</th>
                <th className="table-header">Día</th>
                <th className="table-header">Fecha</th>
                <th className="table-header table-actions-header">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((expense, index) => {
                  // Calculate actual index in full array
                  const actualIndex = (currentPage - 1) * itemsPerPage + index;

                  return (
                    <ExpenseRow
                      key={expense.id || actualIndex}
                      expense={expense}
                      index={actualIndex}
                      onUpdate={updateExpense}
                      onRemove={removeExpense}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No se encontraron gastos que coincidan con el filtro
                  </td>
                </tr>
              )}
            </tbody>
            {paginatedExpenses.length > 0 && (
              <tfoot>
                <tr className="table-footer">
                  <td colSpan="3" className="footer-label">
                    Total:
                  </td>
                  <td className="footer-total">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Loading Indicator */}
          {filteredExpenses.length > 0 && paginatedExpenses.length === 0 && (
            <div className="loading-container">
              <div className="loading-spinner" aria-label="Cargando">
                Cargando...
              </div>
            </div>
          )}

          {/* Pagination Info */}
          <div className="expenses-footer">
            <div className="expenses-count">
              Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredExpenses.length)} de{' '}
              {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} de{' '}
              {filteredExpenses.length} entradas
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredExpenses.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemsPerPageOptions={PAGINATION_OPTIONS}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1H1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
              <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2H3z"/>
            </svg>
          </div>
          <h4 className="empty-state-title">No hay gastos automáticos configurados</h4>
          <p className="empty-state-message">
            Haga clic en "Agregar nuevo gasto" para comenzar a configurar los gastos recurrentes
          </p>
        </div>
      )}
    </div>
  );
});

GastosAutomaticosTab.displayName = 'GastosAutomaticosTab';

GastosAutomaticosTab.propTypes = {
  formData: PropTypes.shape({
    autoExpenses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        type: PropTypes.string,
        description: PropTypes.string,
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        frequency: PropTypes.string,
        day: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        date: PropTypes.string
      })
    )
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  success: PropTypes.string
};

export default GastosAutomaticosTab;
