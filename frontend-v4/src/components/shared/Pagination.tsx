import { memo, useCallback } from 'react'
import type { ChangeEvent } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  itemsPerPageOptions?: number[]
}

/**
 * Pagination Component
 * Provides navigation between pages with customizable items per page
 */
const Pagination = memo(({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
}: PaginationProps) => {
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleFirstPage = useCallback(() => {
    onPageChange(1);
  }, [onPageChange]);

  const handleLastPage = useCallback(() => {
    onPageChange(totalPages);
  }, [totalPages, onPageChange]);

  const handleItemsPerPageChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    onItemsPerPageChange(newItemsPerPage);
    // Reset to first page when changing items per page
    onPageChange(1);
  }, [onItemsPerPageChange, onPageChange]);

  // Calculate range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1 && totalItems <= itemsPerPageOptions[0]) {
    return null; // Don't show pagination if not needed
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <label htmlFor="items-per-page" className="pagination-label">
          Entradas por página
        </label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="pagination-select"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value={totalItems}>Todos</option>
        </select>
      </div>

      <div className="pagination-status">
        Mostrando {startItem} de {endItem} de {totalItems} entradas
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="pagination-btn"
          aria-label="Primera página"
          title="Primera página"
        >
          &laquo;
        </button>

        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination-btn"
          aria-label="Página anterior"
          title="Página anterior"
        >
          &lsaquo;
        </button>

        <span className="pagination-current">
          {currentPage}
        </span>

        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-btn"
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          &rsaquo;
        </button>

        <button
          type="button"
          onClick={handleLastPage}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-btn"
          aria-label="Última página"
          title="Última página"
        >
          &raquo;
        </button>
      </div>
    </div>
  )
})

Pagination.displayName = 'Pagination'

export default Pagination
