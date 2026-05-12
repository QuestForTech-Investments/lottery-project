import { useState, useMemo, useCallback, useEffect, type ChangeEvent, type MouseEvent } from 'react';
import {
  getBlockedSessions,
  unblockSession,
  type BlockedSession,
  type BlockedType,
} from '@services/blockedSessionsService';

interface BlockedRow {
  id: string;
  usuario: string;
  bloqueadoEn: string;
  ip: string;
}

type TabValue = 'contrasena' | 'pin' | 'ip';

const TAB_TO_TYPE: Record<TabValue, BlockedType> = {
  contrasena: 'password',
  pin: 'pin',
  ip: 'ip',
};

const formatBlockedAt = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
};

const toRow = (s: BlockedSession): BlockedRow => ({
  id: s.id,
  usuario: s.username ?? s.identifier,
  bloqueadoEn: formatBlockedAt(s.blockedAt),
  ip: s.ip ?? '',
});

/**
 * Custom hook for managing UserBlockedSessions state and logic.
 * Backed by /api/auth/blocked-sessions.
 */
const useUserBlockedSessions = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('contrasena');
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [rows, setRows] = useState<BlockedRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = useCallback(async (tab: TabValue) => {
    setLoading(true);
    try {
      const list = await getBlockedSessions(TAB_TO_TYPE[tab]);
      setRows(list.map(toRow));
    } catch (err) {
      console.error('Error loading blocked sessions:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  const filteredData = useMemo(() => {
    if (!searchText) return rows;
    const q = searchText.toLowerCase();
    return rows.filter(
      r =>
        r.usuario.toLowerCase().includes(q) ||
        r.ip.toLowerCase().includes(q) ||
        r.bloqueadoEn.toLowerCase().includes(q)
    );
  }, [rows, searchText]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchText('');
  }, []);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
    setPage(0);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setPage(0);
  }, []);

  const handleChangePage = useCallback(
    (_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      setPage(newPage);
    },
    []
  );

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleUnlock = useCallback(
    async (item: BlockedRow) => {
      try {
        await unblockSession(item.id, TAB_TO_TYPE[activeTab]);
        // Optimistic remove
        setRows(prev => prev.filter(r => r.id !== item.id));
      } catch (err) {
        console.error('Error unblocking session:', err);
        // Reload to stay in sync
        loadData(activeTab);
      }
    },
    [activeTab, loadData]
  );

  return {
    currentTabData: paginatedData,
    totalRecords: filteredData.length,
    loading,

    activeTab,
    searchText,
    page,
    rowsPerPage,

    handleTabChange,
    handleSearchChange,
    handleClearSearch,
    handleChangePage,
    handleChangeRowsPerPage,
    handleUnlock,
  };
};

export default useUserBlockedSessions;
