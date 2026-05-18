/**
 * useHistoricalSales Hook
 *
 * Manages all state and logic for the HistoricalSales component.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@services/api';
import { getTodayDate } from '@/utils/formatters';
import type {
  Zona,
  Grupo,
  BancaData,
  SorteoData,
  CombinacionData,
  ZonaData,
  Totals,
  BettingPoolSalesDto,
  DrawSalesResponse,
  CombinationSalesResponse,
  ZoneSalesResponse
} from '../types';
import { DEFAULT_TOTALS } from '../types';

export interface DrawOption {
  drawId: number;
  drawName: string;
}

export interface BancaOption {
  id: number;
  name: string;
  code: string;
}

interface UseHistoricalSalesReturn {
  mainTab: number;
  setMainTab: (tab: number) => void;
  fechaInicial: string;
  fechaFinal: string;
  zonas: Zona[];
  grupo: string | number;
  filterType: string;
  filtroRapido: string;
  loading: boolean;
  setFechaInicial: (date: string) => void;
  setFechaFinal: (date: string) => void;
  setZonas: (zonas: Zona[]) => void;
  setGrupo: (grupo: string | number) => void;
  setFilterType: (type: string) => void;
  setFiltroRapido: (filtro: string) => void;
  zonasList: Zona[];
  gruposList: Grupo[];
  drawsList: DrawOption[];
  bancasList: BancaOption[];
  selectedDraws: number[];
  selectedBancas: number[];
  setSelectedDraws: (ids: number[]) => void;
  setSelectedBancas: (ids: number[]) => void;
  bancasData: BancaData[];
  sorteoData: SorteoData[];
  combinacionesData: CombinacionData[];
  zonasData: ZonaData[];
  totals: Totals;
  handleSearch: () => void;
}

export const useHistoricalSales = (): UseHistoricalSalesReturn => {
  const [mainTab, setMainTab] = useState<number>(0);
  const [fechaInicial, setFechaInicial] = useState<string>(getTodayDate());
  const [fechaFinal, setFechaFinal] = useState<string>(getTodayDate());
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [grupo, setGrupo] = useState<string | number>('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [gruposList] = useState<Grupo[]>([]);
  const [drawsList, setDrawsList] = useState<DrawOption[]>([]);
  const [bancasList, setBancasList] = useState<BancaOption[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [selectedBancas, setSelectedBancas] = useState<number[]>([]);

  const [bancasData, setBancasData] = useState<BancaData[]>([]);
  const [sorteoData, setSorteoData] = useState<SorteoData[]>([]);
  const [combinacionesData, setCombinacionesData] = useState<CombinacionData[]>([]);
  const [zonasData, setZonasData] = useState<ZonaData[]>([]);
  const [totals, setTotals] = useState<Totals>(DEFAULT_TOTALS);

  const initialLoadDone = useRef(false);

  // Load zones on mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await api.get<{ items?: Zona[] } | Zona[]>('/zones');
        const zonesArray = (response && typeof response === 'object' && 'items' in response)
          ? (response.items || [])
          : (response as Zona[] || []);

        const normalizedZones = zonesArray.map((z: Zona) => ({
          id: z.zoneId || z.id,
          name: z.zoneName || z.name
        }));
        setZonasList(normalizedZones);
        setZonas(normalizedZones);
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    loadZones();
  }, []);

  // Load draws + bancas once for the Combinaciones filters.
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Default page size on the API is 50 — request a high page size to get every active draw.
        const drawsResponse = await api.get<{ items?: DrawOption[] } | DrawOption[]>('/draws?pageSize=500');
        const drawsArray = (drawsResponse && typeof drawsResponse === 'object' && 'items' in drawsResponse)
          ? (drawsResponse.items || [])
          : (drawsResponse as DrawOption[] || []);
        const normalizedDraws = drawsArray.map((d: DrawOption & { lotteryName?: string }) => ({
          drawId: d.drawId,
          drawName: d.drawName || d.lotteryName || `Draw ${d.drawId}`,
        }));
        setDrawsList(normalizedDraws);
        setSelectedDraws(normalizedDraws.map(d => d.drawId));

        type BancaRow = {
          bettingPoolId?: number;
          id?: number;
          bettingPoolName?: string;
          name?: string;
          bettingPoolCode?: string;
          code?: string;
        };
        const bancasResponse = await api.get<{ items?: BancaRow[] } | BancaRow[]>('/betting-pools?pageSize=1000');
        const bancasArray = (bancasResponse && typeof bancasResponse === 'object' && 'items' in bancasResponse)
          ? (bancasResponse.items || [])
          : (bancasResponse as BancaRow[] || []);
        const normalized = bancasArray.map(b => ({
          id: b.bettingPoolId || b.id || 0,
          name: b.bettingPoolName || b.name || '',
          code: b.bettingPoolCode || b.code || '',
        }));
        setBancasList(normalized);
      } catch (error) {
        console.error('Error loading combinaciones filters:', error);
      }
    };
    loadFilters();
  }, []);

  // Build zone query param
  const getZoneParam = useCallback(() => {
    const ids = zonas.map(z => z.id).join(',');
    return ids ? `&zoneIds=${ids}` : '';
  }, [zonas]);

  // Load bancas data (General tab)
  const loadBancasData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<BettingPoolSalesDto[]>(
        `/reports/sales/by-betting-pool?startDate=${fechaInicial}&endDate=${fechaFinal}${getZoneParam()}`
      );

      const mapped: BancaData[] = (response || []).map(item => ({
        ref: item.reference || '',
        codigo: item.bettingPoolCode,
        tickets: (item.pendingCount || 0) + (item.winnerCount || 0) + (item.loserCount || 0),
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: item.totalDiscounts || 0,
        premios: item.totalPrizes,
        neto: item.totalNet,
        caida: item.fall || 0,
        gastos: 0,
        final: item.totalNet - (item.fall || 0)
      }));

      setBancasData(mapped);

      const newTotals = mapped.reduce<Totals>(
        (acc, row) => ({
          tickets: acc.tickets + row.tickets,
          venta: acc.venta + row.venta,
          comisiones: acc.comisiones + row.comisiones,
          descuentos: acc.descuentos + row.descuentos,
          premios: acc.premios + row.premios,
          neto: acc.neto + row.neto,
          caida: acc.caida + row.caida,
          gastos: acc.gastos + row.gastos,
          final: acc.final + row.final
        }),
        DEFAULT_TOTALS
      );
      setTotals(newTotals);
    } catch (error) {
      console.error('Error loading bancas data:', error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, getZoneParam]);

  // Load sales by draw (Por sorteo tab)
  const loadSorteoData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<DrawSalesResponse>(
        `/reports/sales/by-draw?startDate=${fechaInicial}&endDate=${fechaFinal}${getZoneParam()}`
      );

      const mapped: SorteoData[] = (response?.draws || []).map(item => ({
        sorteo: item.drawName,
        tickets: item.ticketCount,
        lineas: item.lineCount,
        ganadores: item.winnerCount,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: 0,
        premios: item.totalPrizes,
        neto: item.totalNet,
        lotteryImageUrl: item.lotteryImageUrl ?? null,
      }));

      setSorteoData(mapped);
    } catch (error) {
      console.error('Error loading sorteo data:', error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, getZoneParam]);

  // Load combinations (Combinaciones tab)
  const loadCombinacionesData = useCallback(async () => {
    setLoading(true);
    try {
      // Only include the filter param when the user has narrowed below the full list —
      // sending all IDs is equivalent to omitting the filter on the backend.
      const drawParam = (selectedDraws.length > 0 && selectedDraws.length < drawsList.length)
        ? `&drawIds=${selectedDraws.join(',')}`
        : '';
      const bancaParam = (selectedBancas.length > 0 && selectedBancas.length < bancasList.length)
        ? `&bettingPoolIds=${selectedBancas.join(',')}`
        : '';

      const response = await api.get<CombinationSalesResponse>(
        `/reports/sales/combinations?startDate=${fechaInicial}&endDate=${fechaFinal}${getZoneParam()}${drawParam}${bancaParam}`
      );

      const mapped: CombinacionData[] = (response?.combinations || []).map(item => ({
        combinacion: item.betNumber,
        sorteo: item.drawName,
        tipoApuesta: item.betTypeName,
        lineas: item.lineCount,
        totalVendido: item.totalSold,
        comisiones: item.totalCommissions,
        comisiones2: 0,
        premios: item.totalPrizes,
        balances: item.balance
      }));

      setCombinacionesData(mapped);
    } catch (error) {
      console.error('Error loading combinaciones data:', error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, getZoneParam, selectedDraws, drawsList.length, selectedBancas, bancasList.length]);

  // Load sales by zone (Por zona tab)
  const loadZonasData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<ZoneSalesResponse>(
        `/reports/sales/by-zone?startDate=${fechaInicial}&endDate=${fechaFinal}${getZoneParam()}`
      );

      const mapped: ZonaData[] = (response?.zones || []).map(item => ({
        nombre: item.zoneName,
        bancasActivas: item.bettingPoolCount,
        tickets: item.ticketCount,
        lineas: item.lineCount,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: item.totalDiscounts,
        premios: item.totalPrizes,
        neto: item.totalNet,
        p: item.pendingCount,
        l: item.loserCount,
        w: item.winnerCount,
        total: (item.pendingCount || 0) + (item.loserCount || 0) + (item.winnerCount || 0),
        caida: item.fall,
        final: item.final,
        balance: item.balance
      }));

      setZonasData(mapped);
    } catch (error) {
      console.error('Error loading zonas data:', error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicial, fechaFinal, getZoneParam]);

  // Handle search based on current tab
  const handleSearch = useCallback(() => {
    switch (mainTab) {
      case 0: loadBancasData(); break;
      case 1: loadSorteoData(); break;
      case 2: loadCombinacionesData(); break;
      case 3: loadZonasData(); break;
    }
  }, [mainTab, loadBancasData, loadSorteoData, loadCombinacionesData, loadZonasData]);

  // Auto-load on mount once zones are loaded
  useEffect(() => {
    if (zonas.length > 0 && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadBancasData();
    }
  }, [zonas.length, loadBancasData]);

  // Auto-load when tab changes
  useEffect(() => {
    if (!initialLoadDone.current) return;
    handleSearch();
  }, [mainTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    mainTab,
    setMainTab,
    fechaInicial,
    fechaFinal,
    zonas,
    grupo,
    filterType,
    filtroRapido,
    loading,
    setFechaInicial,
    setFechaFinal,
    setZonas,
    setGrupo,
    setFilterType,
    setFiltroRapido,
    zonasList,
    gruposList,
    drawsList,
    bancasList,
    selectedDraws,
    selectedBancas,
    setSelectedDraws,
    setSelectedBancas,
    bancasData,
    sorteoData,
    combinacionesData,
    zonasData,
    totals,
    handleSearch,
  };
};

export default useHistoricalSales;
