/**
 * useCleanPendingPayments Hook
 *
 * Manages all state and logic for the CleanPendingPayments component.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@services/api';
import type {
  BettingPool,
  ReportItem,
  CleanSummary,
  OrderDirection,
  ReportTotals
} from '../types';

interface UseCleanPendingPaymentsReturn {
  // Loading and error states
  loading: boolean;
  error: string | null;

  // List tab state
  bettingPools: BettingPool[];
  searchTerm: string;
  orderBy: string;
  order: OrderDirection;
  filteredAndSortedData: BettingPool[];
  setSearchTerm: (term: string) => void;
  handleSort: (property: string) => void;

  // Report tab state
  reportStartDate: string;
  reportEndDate: string;
  reportBancaId: string;
  reportData: ReportItem[];
  reportSearchTerm: string;
  reportOrderBy: string;
  reportOrder: OrderDirection;
  loadingReport: boolean;
  filteredAndSortedReportData: ReportItem[];
  reportTotals: ReportTotals;
  setReportStartDate: (date: string) => void;
  setReportEndDate: (date: string) => void;
  setReportBancaId: (id: string) => void;
  setReportSearchTerm: (term: string) => void;
  handleReportSort: (property: string) => void;
  handleSearchReport: () => Promise<void>;

  // Modal state
  modalOpen: boolean;
  selectedPool: BettingPool | null;
  cleanDate: string;
  cleanSummary: CleanSummary;
  cleaning: boolean;
  setCleanDate: (date: string) => void;
  handleOpenModal: (pool: BettingPool) => void;
  handleCloseModal: () => void;
  handleCleanPayments: () => Promise<void>;

  // Actions
  loadBettingPools: () => Promise<void>;
}

export const useCleanPendingPayments = (): UseCleanPendingPaymentsReturn => {
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // List tab state
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderBy, setOrderBy] = useState<string>('number');
  const [order, setOrder] = useState<OrderDirection>('asc');

  // Report tab state
  const [reportStartDate, setReportStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reportEndDate, setReportEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reportBancaId, setReportBancaId] = useState<string>('');
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [reportSearchTerm, setReportSearchTerm] = useState<string>('');
  const [reportOrderBy, setReportOrderBy] = useState<string>('fecha');
  const [reportOrder, setReportOrder] = useState<OrderDirection>('asc');
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedPool, setSelectedPool] = useState<BettingPool | null>(null);
  const [cleanDate, setCleanDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [cleanSummary, setCleanSummary] = useState<CleanSummary>({
    tickets: 0,
    amount: 0
  });
  const [cleaning, setCleaning] = useState<boolean>(false);

  // Load betting pools on mount
  const loadBettingPools = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const poolsData = await api.get('/betting-pools') as { items?: BettingPool[] } | BettingPool[];
      const poolsArray: BettingPool[] = Array.isArray(poolsData)
        ? poolsData
        : (poolsData?.items || []);
      setBettingPools(poolsArray);
    } catch (err) {
      const error = err as Error;
      console.error('[CLEAN] Error loading betting pools:', error);
      setError(error.message || 'Error loading betting pools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBettingPools();
  }, [loadBettingPools]);

  // Sort handlers
  const handleSort = useCallback((property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [orderBy, order]);

  const handleReportSort = useCallback((property: string): void => {
    const isAsc = reportOrderBy === property && reportOrder === 'asc';
    setReportOrder(isAsc ? 'desc' : 'asc');
    setReportOrderBy(property);
  }, [reportOrderBy, reportOrder]);

  // Modal handlers
  const handleOpenModal = useCallback((pool: BettingPool): void => {
    setSelectedPool(pool);
    setCleanDate(new Date().toISOString().split('T')[0]);
    setCleanSummary({ tickets: 0, amount: 0 });
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback((): void => {
    setModalOpen(false);
    setSelectedPool(null);
  }, []);

  const handleCleanPayments = useCallback(async (): Promise<void> => {
    if (!selectedPool) return;

    const confirmed = window.confirm(
      `¿Está seguro de limpiar ${cleanSummary.tickets} tickets pendientes por un monto de $${cleanSummary.amount.toFixed(2)}?`
    );
    if (!confirmed) return;

    setCleaning(true);
    try {
      await api.post(
        `/betting-pools/${selectedPool.bettingPoolId || selectedPool.id}/clean-pending-payments`,
        { untilDate: cleanDate }
      );
      alert('Pendientes de pago limpiados exitosamente');
      handleCloseModal();
      loadBettingPools();
    } catch (err) {
      console.error('Error cleaning payments:', err);
      alert('Error al limpiar pendientes de pago');
    } finally {
      setCleaning(false);
    }
  }, [selectedPool, cleanSummary, cleanDate, handleCloseModal, loadBettingPools]);

  // Report search handler
  const handleSearchReport = useCallback(async (): Promise<void> => {
    if (!reportBancaId) {
      alert('Por favor seleccione una banca');
      return;
    }

    setLoadingReport(true);
    try {
      const data = await api.get(
        `/betting-pools/${reportBancaId}/cleaned-payments?startDate=${reportStartDate}&endDate=${reportEndDate}`
      ) as { items?: ReportItem[] } | ReportItem[];
      setReportData(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      console.error('Error loading report:', err);
      setReportData([]);
    } finally {
      setLoadingReport(false);
    }
  }, [reportBancaId, reportStartDate, reportEndDate]);

  // Filtered and sorted list data
  const filteredAndSortedData = useMemo((): BettingPool[] => {
    let data = [...bettingPools];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(pool =>
        (pool.bettingPoolId || pool.id)?.toString().includes(term) ||
        (pool.bettingPoolName || pool.name)?.toLowerCase().includes(term) ||
        (pool.reference || '')?.toLowerCase().includes(term) ||
        (pool.userCodes?.join(', ') || '')?.toLowerCase().includes(term)
      );
    }

    // Sort
    data.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (orderBy) {
        case 'number':
          aValue = a.bettingPoolId || a.id || 0;
          bValue = b.bettingPoolId || b.id || 0;
          break;
        case 'name':
          aValue = (a.bettingPoolName || a.name || '').toLowerCase();
          bValue = (b.bettingPoolName || b.name || '').toLowerCase();
          break;
        case 'reference':
          aValue = (a.reference || '').toLowerCase();
          bValue = (b.reference || '').toLowerCase();
          break;
        default:
          aValue = (a[orderBy] as number) || 0;
          bValue = (b[orderBy] as number) || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return order === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return data;
  }, [bettingPools, searchTerm, orderBy, order]);

  // Filtered and sorted report data
  const filteredAndSortedReportData = useMemo((): ReportItem[] => {
    let data = [...reportData];

    if (reportSearchTerm) {
      const term = reportSearchTerm.toLowerCase();
      data = data.filter(item =>
        item.ticketNumber?.toString().includes(term) ||
        item.usuario?.toLowerCase().includes(term)
      );
    }

    return data;
  }, [reportData, reportSearchTerm]);

  // Report totals
  const reportTotals = useMemo((): ReportTotals => {
    return filteredAndSortedReportData.reduce<ReportTotals>(
      (acc, item) => ({
        monto: acc.monto + (item.monto || 0),
        premios: acc.premios + (item.premios || 0)
      }),
      { monto: 0, premios: 0 }
    );
  }, [filteredAndSortedReportData]);

  return {
    loading,
    error,
    bettingPools,
    searchTerm,
    orderBy,
    order,
    filteredAndSortedData,
    setSearchTerm,
    handleSort,
    reportStartDate,
    reportEndDate,
    reportBancaId,
    reportData,
    reportSearchTerm,
    reportOrderBy,
    reportOrder,
    loadingReport,
    filteredAndSortedReportData,
    reportTotals,
    setReportStartDate,
    setReportEndDate,
    setReportBancaId,
    setReportSearchTerm,
    handleReportSort,
    handleSearchReport,
    modalOpen,
    selectedPool,
    cleanDate,
    cleanSummary,
    cleaning,
    setCleanDate,
    handleOpenModal,
    handleCloseModal,
    handleCleanPayments,
    loadBettingPools,
  };
};

export default useCleanPendingPayments;
