/**
 * MassEditBettingPools Component
 *
 * Mass edit settings for multiple betting pools at once.
 */

import React, { useState, useEffect, useCallback, memo, type FormEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '@services/api';

// Local imports
import type { Zone, Draw, BettingPool, BetType, FormData } from './types';
import { INITIAL_FORM_DATA } from './constants';
import {
  ConfigurationTab,
  FootersTab,
  PrizesTab,
  DrawsTab,
  SelectionSection,
} from './components';

// ============================================================================
// Main Component
// ============================================================================

const MassEditBettingPools: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Data from API
  const [zones, setZones] = useState<Zone[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [betTypes, setBetTypes] = useState<BetType[]>([]);
  const [loadingBetTypes, setLoadingBetTypes] = useState<boolean>(false);
  const [prizesSubTab, setPrizesSubTab] = useState<number>(0);

  // Form state
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Selection state
  const [selectedDraws, setSelectedDraws] = useState<number[]>([]);
  const [selectedBettingPools, setSelectedBettingPools] = useState<number[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [zonesData, drawsData, poolsData] = await Promise.all([
        api.get('/zones?pageSize=1000') as Promise<{ items?: Zone[] } | Zone[]>,
        api.get('/draws?pageSize=200') as Promise<{ items?: Draw[] } | Draw[]>,
        // pageSize=5000 so tenants with several hundred bancas (La Central
        // has 600+) get the full list. API clamps the request.
        api.get('/betting-pools?pageSize=5000') as Promise<{ items?: BettingPool[] } | BettingPool[]>
      ]);
      setZones(Array.isArray(zonesData) ? zonesData : (zonesData?.items || []));
      setDraws(Array.isArray(drawsData) ? drawsData : (drawsData?.items || []));
      setBettingPools(Array.isArray(poolsData) ? poolsData : (poolsData?.items || []));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((field: string, value: string | number | boolean | number[] | null): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDrawToggle = useCallback((drawId: number): void => {
    setSelectedDraws(prev =>
      prev.includes(drawId)
        ? prev.filter(id => id !== drawId)
        : [...prev, drawId]
    );
  }, []);

  const handlePoolToggle = useCallback((poolId: number): void => {
    setSelectedBettingPools(prev =>
      prev.includes(poolId)
        ? prev.filter(id => id !== poolId)
        : [...prev, poolId]
    );
  }, []);

  const handleZoneToggle = useCallback((zoneId: number): void => {
    const isCurrentlySelected = selectedZones.includes(zoneId);
    // Bancas belonging to this zone — used to sync the banca selection
    // alongside the zone toggle. A banca might miss its zoneId in older
    // API responses; those just don't auto-toggle.
    const bancaIdsInZone = bettingPools
      .filter(bp => bp.zoneId === zoneId)
      .map(bp => bp.bettingPoolId ?? bp.id)
      .filter((id): id is number => typeof id === 'number');

    setSelectedZones(prev =>
      isCurrentlySelected
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );

    setSelectedBettingPools(prev => {
      if (isCurrentlySelected) {
        // Zone going OFF — drop every banca that belonged to it. If the user
        // had hand-picked one of those, they can re-click it after.
        const drop = new Set(bancaIdsInZone);
        return prev.filter(id => !drop.has(id));
      }
      // Zone going ON — union the banca ids into the existing selection.
      const merged = new Set([...prev, ...bancaIdsInZone]);
      return Array.from(merged);
    });
  }, [selectedZones, bettingPools]);

  // Bulk "select all / clear all" handlers. Each receives the ids currently
  // visible in the chip group (search-filtered) and a flag.
  const handleDrawsBulkSelect = useCallback((ids: number[], shouldSelect: boolean): void => {
    setSelectedDraws(prev => {
      if (shouldSelect) return Array.from(new Set([...prev, ...ids]));
      const drop = new Set(ids);
      return prev.filter(id => !drop.has(id));
    });
  }, []);

  const handlePoolsBulkSelect = useCallback((ids: number[], shouldSelect: boolean): void => {
    setSelectedBettingPools(prev => {
      if (shouldSelect) return Array.from(new Set([...prev, ...ids]));
      const drop = new Set(ids);
      return prev.filter(id => !drop.has(id));
    });
  }, []);

  const handleZonesBulkSelect = useCallback((zoneIds: number[], shouldSelect: boolean): void => {
    // Mirrors handleZoneToggle but for many zones at once — keeps the banca
    // auto-selection logic consistent so "Seleccionar todos" on zones picks
    // up every banca in those zones too.
    const bancaIdsInZones = bettingPools
      .filter(bp => typeof bp.zoneId === 'number' && zoneIds.includes(bp.zoneId))
      .map(bp => bp.bettingPoolId ?? bp.id)
      .filter((id): id is number => typeof id === 'number');

    setSelectedZones(prev => {
      if (shouldSelect) return Array.from(new Set([...prev, ...zoneIds]));
      const drop = new Set(zoneIds);
      return prev.filter(id => !drop.has(id));
    });

    setSelectedBettingPools(prev => {
      if (shouldSelect) return Array.from(new Set([...prev, ...bancaIdsInZones]));
      const drop = new Set(bancaIdsInZones);
      return prev.filter(id => !drop.has(id));
    });
  }, [bettingPools]);

  // Load bet types when Premios & Comisiones tab is activated
  const loadBetTypes = useCallback(async (): Promise<void> => {
    if (betTypes.length > 0) return;
    setLoadingBetTypes(true);
    try {
      const data = await api.get('/bet-types/with-fields') as BetType[];
      const transformed = (data || []).map(bt => ({
        ...bt,
        prizeFields: bt.prizeTypes || []
      }));
      setBetTypes(transformed);
    } catch (error) {
      console.error('Error loading bet types:', error);
    } finally {
      setLoadingBetTypes(false);
    }
  }, [betTypes.length]);

  // Handle tab change
  const handleTabChange = useCallback((_: React.SyntheticEvent, newVal: number): void => {
    setActiveTab(newVal);
    // Load bet types when prizes tab is selected
    if (newVal === 2 && betTypes.length === 0) {
      loadBetTypes();
    }
  }, [betTypes.length, loadBetTypes]);

  // Prize field handlers
  const handlePrizeFieldChange = useCallback((betTypeCode: string, fieldCode: string, value: string): void => {
    const key = `prize_${betTypeCode}_${fieldCode}`;
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleCommissionChange = useCallback((betTypeCode: string, value: string): void => {
    const key = `commission_${betTypeCode}`;
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGeneralCommissionChange = useCallback((value: string): void => {
    setFormData(prev => ({ ...prev, generalCommission: value }));
  }, []);

  const handleCommissionTypeChange = useCallback((value: string): void => {
    setFormData(prev => ({ ...prev, commissionType: value }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (selectedBettingPools.length === 0) {
      alert(t('massEditBettingPools.alertSelectOnePool'));
      return;
    }

    setSaving(true);
    try {
      // Build the typed payload. Each field is only included when the user
      // actually set a value — empty strings, null, 'no_change' all signal
      // "skip this field per banca" so partial edits work as expected
      // (e.g. changing only "minutos para cancelar" leaves the other 13
      // configuration fields untouched on every selected banca).
      const payload: Record<string, unknown> = {
        bettingPoolIds: selectedBettingPools,
      };

      // Draws — pass-through (existing behavior)
      if (selectedDraws.length > 0) payload.drawIds = selectedDraws;

      // Zone (single id, from configuration tab dropdown)
      const zoneNum = parseInt(String(formData.zoneId ?? ''), 10);
      if (!Number.isNaN(zoneNum) && zoneNum > 0) payload.zoneId = zoneNum;

      // Tri-state booleans — only send "on"/"off"; "no_change" is dropped.
      const triStateFields: Array<[keyof FormData, string]> = [
        ['isActive', 'isActive'],
        ['printTicketCopy', 'printTicketCopy'],
        ['winningTicketControl', 'controlWinningTickets'],
        ['canChangePassword', 'allowPasswordChange'],
        ['allowViewCommission', 'allowViewCommission'],
      ];
      for (const [src, dest] of triStateFields) {
        const v = formData[src];
        if (v === 'on' || v === 'off') payload[dest] = v;
      }

      // Strings — only send when non-empty/non-null.
      const stringFields: Array<[keyof FormData, string]> = [
        ['fallType', 'fallType'],
        ['language', 'defaultLanguage'],
        ['printMode', 'printMode'],
        ['discountMode', 'discountMode'],
      ];
      for (const [src, dest] of stringFields) {
        const v = formData[src];
        if (typeof v === 'string' && v.trim() !== '') payload[dest] = v;
      }

      // Numbers — parse and skip if empty/NaN. Decimals vs integers vary
      // per field, but JSON.stringify handles either fine.
      const numericFields: Array<[keyof FormData, string]> = [
        ['fallPercentage', 'fallPercentage'],
        ['deactivationBalance', 'deactivationBalance'],
        ['dailySaleLimit', 'dailySaleLimit'],
        ['minutesToCancelTicket', 'cancelMinutes'],
        ['ticketsToCancelPerDay', 'dailyCancelTickets'],
      ];
      for (const [src, dest] of numericFields) {
        const raw = formData[src];
        if (raw === '' || raw === null || raw === undefined) continue;
        const n = Number(raw);
        if (!Number.isNaN(n)) payload[dest] = n;
      }

      // Footers — only send the block when the user touched a footer line.
      // Sending autoFooter standalone would force the switch position onto
      // every banca, which is the same gotcha we're trying to avoid for
      // the configuration fields.
      const footerKeys = ['footer1', 'footer2', 'footer3', 'footer4', 'footer5', 'footer6', 'footer7', 'footer8'] as const;
      const anyFooterTouched = footerKeys.some(k => {
        const v = formData[k];
        return typeof v === 'string' && v.trim() !== '';
      });
      if (anyFooterTouched) {
        for (const k of footerKeys) {
          const v = formData[k];
          if (typeof v === 'string') {
            // Match DTO names: footer1 → Footer1
            const dest = k.charAt(0).toUpperCase() + k.slice(1);
            payload[dest] = v;
          }
        }
        // autoFooter is a Switch (boolean) — encode as the same tri-state
        // string the backend expects.
        payload.autoFooter = formData.autoFooter ? 'on' : 'off';
      }

      // Prizes & commissions — iterate `betTypes` directly instead of scanning
      // formData keys. Scanning was prone to two bugs:
      //   1. `prize_<betTypeCode>_<fieldCode>` split at the FIRST underscore
      //      broke when betTypeCode itself contained one (e.g. "SUPER_PALE").
      //   2. General commission was sent as a separate field, but the backend
      //      had no list of bet types to attach it to — so for fresh bancas
      //      with no existing prize_commission rows, the General edit was a
      //      silent no-op.
      // Iterating betTypes fixes both: codes can't collide with the separator,
      // and General is expanded into per-type entries client-side.
      const commissionsByBetType: Record<string, number> = {};
      const prizeFieldsByBetType: Record<string, number> = {};

      for (const bt of betTypes) {
        const code = bt.betTypeCode;
        if (!code) continue;

        // Per-bet-type commission.
        const commissionRaw = formData[`commission_${code}`];
        if (typeof commissionRaw === 'string' && commissionRaw.trim() !== '') {
          const n = Number(commissionRaw);
          if (!Number.isNaN(n)) commissionsByBetType[code] = n;
        }

        // Per-prize-field multipliers.
        for (const field of bt.prizeFields ?? []) {
          const raw = formData[`prize_${code}_${field.fieldCode}`];
          if (typeof raw !== 'string' || raw.trim() === '') continue;
          const n = Number(raw);
          if (Number.isNaN(n)) continue;
          prizeFieldsByBetType[`${code}__${field.fieldCode}`] = n;
        }
      }

      // Expand General commission → fill any bet type that doesn't already
      // have a per-type override. Backend never sees a separate "general"
      // value, which avoids the empty-bancas silent-skip path.
      if (typeof formData.generalCommission === 'string' && formData.generalCommission.trim() !== '') {
        const n = Number(formData.generalCommission);
        if (!Number.isNaN(n)) {
          for (const bt of betTypes) {
            const code = bt.betTypeCode;
            if (code && !(code in commissionsByBetType)) {
              commissionsByBetType[code] = n;
            }
          }
        }
      }

      if (Object.keys(commissionsByBetType).length > 0) {
        payload.commissionsByBetType = commissionsByBetType;
      }
      if (Object.keys(prizeFieldsByBetType).length > 0) {
        payload.prizeFieldsByBetType = prizeFieldsByBetType;
      }

      // Useful for debugging the "edit dropped silently" class of bug.
      // Only keys present in `payload` will actually be applied.

      await api.patch('/betting-pools/mass-update', payload);
      alert(t('massEditBettingPools.successUpdated'));
    } catch (error) {
      console.error('Error updating:', error);
      alert(t('massEditBettingPools.errorUpdating'));
    } finally {
      setSaving(false);
    }
  }, [selectedBettingPools, selectedDraws, formData, betTypes, t]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            {t('massEditBettingPools.title')}
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, '& .MuiTab-root': { minWidth: { xs: 'auto', sm: 90 }, px: { xs: 1.25, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
            >
              <Tab label={t('massEditBettingPools.tabs.configuration')} />
              <Tab label={t('massEditBettingPools.tabs.footers')} />
              <Tab label={t('massEditBettingPools.tabs.prizesCommissions')} />
              <Tab label={t('massEditBettingPools.tabs.draws')} />
            </Tabs>

            {/* Tab Content */}
            {activeTab === 0 && (
              <ConfigurationTab
                formData={formData}
                zones={zones}
                onInputChange={handleInputChange}
              />
            )}

            {activeTab === 1 && (
              <FootersTab
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}

            {activeTab === 2 && (
              <PrizesTab
                betTypes={betTypes}
                loadingBetTypes={loadingBetTypes}
                prizesSubTab={prizesSubTab}
                formData={formData}
                onSubTabChange={setPrizesSubTab}
                onPrizeFieldChange={handlePrizeFieldChange}
                onCommissionChange={handleCommissionChange}
                onGeneralCommissionChange={handleGeneralCommissionChange}
                onCommissionTypeChange={handleCommissionTypeChange}
              />
            )}

            {activeTab === 3 && (
              <DrawsTab
                draws={draws}
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}

            <Divider sx={{ my: 4 }} />

            {/* Selection Section */}
            <SelectionSection
              draws={draws}
              bettingPools={bettingPools}
              zones={zones}
              selectedDraws={selectedDraws}
              selectedBettingPools={selectedBettingPools}
              selectedZones={selectedZones}
              updateGeneralValues={formData.updateGeneralValues}
              onDrawToggle={handleDrawToggle}
              onPoolToggle={handlePoolToggle}
              onZoneToggle={handleZoneToggle}
              onDrawsBulkSelect={handleDrawsBulkSelect}
              onPoolsBulkSelect={handlePoolsBulkSelect}
              onZonesBulkSelect={handleZonesBulkSelect}
              onUpdateGeneralValuesChange={(checked) => handleInputChange('updateGeneralValues', checked)}
            />

            {/* Submit Button */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                disabled={saving || selectedBettingPools.length === 0}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon sx={{ fontSize: 20 }} />}
                sx={{ minWidth: 200 }}
              >
                {saving ? t('massEditBettingPools.updating') : t('massEditBettingPools.update')}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default memo(MassEditBettingPools);
