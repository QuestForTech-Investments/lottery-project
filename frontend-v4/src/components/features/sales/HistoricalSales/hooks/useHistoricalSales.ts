/**
 * useHistoricalSales Hook
 *
 * Manages all state and logic for the HistoricalSales component.
 */

import { useState, useEffect, useCallback } from 'react';
import api from '@services/api';
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

interface UseHistoricalSalesReturn {
  // Tab state
  mainTab: number;
  setMainTab: (tab: number) => void;

  // Filter state
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

  // Reference data
  zonasList: Zona[];
  gruposList: Grupo[];

  // Tab data
  bancasData: BancaData[];
  sorteoData: SorteoData[];
  combinacionesData: CombinacionData[];
  zonasData: ZonaData[];
  totals: Totals;

  // Actions
  handleSearch: () => void;
}

export const useHistoricalSales = (): UseHistoricalSalesReturn => {
  // Tab state
  const [mainTab, setMainTab] = useState<number>(0);

  // Filter state
  const [fechaInicial, setFechaInicial] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [fechaFinal, setFechaFinal] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [grupo, setGrupo] = useState<string | number>('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filtroRapido, setFiltroRapido] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Reference data
  const [zonasList, setZonasList] = useState<Zona[]>([]);
  const [gruposList] = useState<Grupo[]>([]);

  // Tab data
  const [bancasData, setBancasData] = useState<BancaData[]>([]);
  const [sorteoData, setSorteoData] = useState<SorteoData[]>([]);
  const [combinacionesData, setCombinacionesData] = useState<CombinacionData[]>([]);
  const [zonasData, setZonasData] = useState<ZonaData[]>([]);
  const [totals, setTotals] = useState<Totals>(DEFAULT_TOTALS);

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
        setZonas(normalizedZones); // Select all by default
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };
    loadZones();
  }, []);

  // Load sales by betting pool (General tab)
  const loadBancasData = useCallback(async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<BettingPoolSalesDto[]>(
        `/reports/sales/by-betting-pool?startDate=${fechaInicial}&endDate=${fechaFinal}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
      );

      const mapped: BancaData[] = (response || []).map(item => ({
        ref: item.bettingPoolName,
        codigo: item.bettingPoolCode,
        tickets: 0,
        venta: item.totalSold,
        comisiones: item.totalCommissions,
        descuentos: 0,
        premios: item.totalPrizes,
        neto: item.totalNet,
        caida: 0,
        gastos: 0,
        final: item.totalNet
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
  }, [zonas, fechaInicial, fechaFinal]);

  // Load sales by draw (Por sorteo tab)
  const loadSorteoData = useCallback(async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<DrawSalesResponse>(
        `/reports/sales/by-draw?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
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
        neto: item.totalNet
      }));

      setSorteoData(mapped);
    } catch (error) {
      console.error('Error loading sorteo data:', error);
    } finally {
      setLoading(false);
    }
  }, [zonas, fechaInicial]);

  // Load combinations (Combinaciones tab)
  const loadCombinacionesData = useCallback(async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<CombinationSalesResponse>(
        `/reports/sales/combinations?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
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
  }, [zonas, fechaInicial]);

  // Load sales by zone (Por zona tab)
  const loadZonasData = useCallback(async () => {
    setLoading(true);
    try {
      const zoneIds = zonas.map(z => z.id).join(',');
      const response = await api.get<ZoneSalesResponse>(
        `/reports/sales/by-zone?date=${fechaInicial}${zoneIds ? `&zoneIds=${zoneIds}` : ''}`
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
        p: 0,
        l: 0,
        w: item.winnerCount,
        total: item.lineCount,
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
  }, [zonas, fechaInicial]);

  // Handle search based on current tab
  const handleSearch = useCallback(() => {
    switch (mainTab) {
      case 0:
        loadBancasData();
        break;
      case 1:
        loadSorteoData();
        break;
      case 2:
        loadCombinacionesData();
        break;
      case 3:
        loadZonasData();
        break;
    }
  }, [mainTab, loadBancasData, loadSorteoData, loadCombinacionesData, loadZonasData]);

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
    bancasData,
    sorteoData,
    combinacionesData,
    zonasData,
    totals,
    handleSearch,
  };
};

export default useHistoricalSales;
