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
        api.get('/zones') as Promise<{ items?: Zone[] } | Zone[]>,
        api.get('/draws?pageSize=200') as Promise<{ items?: Draw[] } | Draw[]>,
        api.get('/betting-pools') as Promise<{ items?: BettingPool[] } | BettingPool[]>
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
    setSelectedZones(prev =>
      prev.includes(zoneId)
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  }, []);

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
      alert('Debe seleccionar al menos una banca');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bettingPoolIds: selectedBettingPools,
        drawIds: selectedDraws,
        zoneIds: selectedZones,
        configuration: formData
      };

      await api.patch('/betting-pools/mass-update', payload);
      alert('Bancas actualizadas exitosamente');
    } catch (error) {
      console.error('Error updating:', error);
      alert('Error al actualizar las bancas');
    } finally {
      setSaving(false);
    }
  }, [selectedBettingPools, selectedDraws, selectedZones, formData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Actualizar banca
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Configuración" />
              <Tab label="Pies de página" />
              <Tab label="Premios & Comisiones" />
              <Tab label="Sorteos" />
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
                {saving ? 'ACTUALIZANDO...' : 'ACTUALIZAR'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default memo(MassEditBettingPools);
