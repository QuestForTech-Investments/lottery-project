/**
 * ManageZones Component
 *
 * Form to manage all zones - assign betting pools and users with tabs.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo, type ChangeEvent, type FormEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { getAllZones, assignToZone } from '@/services/zoneService';
import { getBettingPools } from '@/services/bettingPoolService';
import { getAllUsers } from '@/services/userService';
import './ManageZonesMUI.css';

// Types and constants
import type {
  Zone,
  BettingPool,
  User,
  ZoneSelections,
  ZonesApiResponse,
  BettingPoolApiResponse,
  BettingPoolApiItem,
  UserApiResponse,
  UserApiItem,
  AssignResult,
} from './types';
import { PILL_BUTTON_STYLE } from './constants';

// Components
import { SearchBar, ZoneTabs, SelectionSection, FormActions } from './components';

// ============================================================================
// Main Component
// ============================================================================

const ManageZonesMUI = (): React.ReactElement => {
  const navigate = useNavigate();
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [zoneSelections, setZoneSelections] = useState<ZoneSelections>({});
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        const [zonesResponse, bettingPoolsResponse, usersResponse] = await Promise.all([
          getAllZones({ page: 1, pageSize: 1000 }) as Promise<ZonesApiResponse | Zone[]>,
          getBettingPools({ page: 1, pageSize: 1000 }) as Promise<BettingPoolApiResponse | BettingPoolApiItem[]>,
          getAllUsers({ page: 1, pageSize: 1000 }) as Promise<UserApiResponse | UserApiItem[]>
        ]);

        // Process zones
        const zonesData = (zonesResponse as ZonesApiResponse).success
          ? (zonesResponse as ZonesApiResponse).data
          : zonesResponse as Zone[];
        setZones(zonesData || []);

        // Process betting pools
        const bettingPoolsData = (bettingPoolsResponse as BettingPoolApiResponse).success
          ? (bettingPoolsResponse as BettingPoolApiResponse).data
          : (bettingPoolsResponse as BettingPoolApiResponse).items || bettingPoolsResponse as BettingPoolApiItem[];

        const mappedBettingPools: BettingPool[] = (bettingPoolsData || []).map(pool => ({
          id: pool.bettingPoolId,
          name: pool.bettingPoolName || pool.branchCode || ''
        }));
        setBettingPools(mappedBettingPools);

        // Process users
        const usersData = (usersResponse as UserApiResponse).success
          ? (usersResponse as UserApiResponse).data
          : (usersResponse as UserApiResponse).items || usersResponse as UserApiItem[];

        const mappedUsers: User[] = (usersData || []).map(user => ({
          id: user.userId,
          username: user.username
        }));
        setUsers(mappedUsers);

        // Initialize selections for each zone
        const initialSelections: ZoneSelections = {};
        (zonesData || []).forEach(zone => {
          initialSelections[zone.zoneId] = { bettingPools: [], users: [] };
        });
        setZoneSelections(initialSelections);

        setLoading(false);
      } catch (err) {
        const error = err as Error;
        setError(`Error al cargar los datos: ${error.message}`);
        setTimeout(() => setError(null), 5000);
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Handlers
  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleBettingPoolToggle = useCallback((zoneId: number, poolId: number) => {
    setZoneSelections(prev => {
      const zoneData = prev[zoneId] || { bettingPools: [], users: [] };
      const pools = zoneData.bettingPools || [];
      const newBettingPools = pools.includes(poolId)
        ? pools.filter(id => id !== poolId)
        : [...pools, poolId];

      return {
        ...prev,
        [zoneId]: { ...zoneData, bettingPools: newBettingPools }
      };
    });
  }, []);

  const handleUserToggle = useCallback((zoneId: number, userId: number) => {
    setZoneSelections(prev => {
      const zoneData = prev[zoneId] || { bettingPools: [], users: [] };
      const userList = zoneData.users || [];
      const newUsers = userList.includes(userId)
        ? userList.filter(id => id !== userId)
        : [...userList, userId];

      return {
        ...prev,
        [zoneId]: { ...zoneData, users: newUsers }
      };
    });
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const zonesToUpdate = Object.entries(zoneSelections).filter(
        ([, data]) => data.bettingPools.length > 0 || data.users.length > 0
      );

      if (zonesToUpdate.length === 0) {
        setError('No hay cambios para guardar');
        setSaving(false);
        return;
      }

      const savePromises = zonesToUpdate.map(([zoneId, data]) =>
        assignToZone(parseInt(zoneId), {
          bettingPoolIds: data.bettingPools,
          userIds: data.users
        }) as Promise<AssignResult>
      );

      const results = await Promise.allSettled(savePromises);

      const successful = results.filter(r => r.status === 'fulfilled' && (r.value as AssignResult).success).length;
      const failed = results.filter(r => r.status === 'rejected' || !(r.value as AssignResult)?.success).length;

      const successfulAssignments = results
        .filter((r): r is PromiseFulfilledResult<AssignResult> => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value?.summary?.successful || 0), 0);

      const failedAssignments = results
        .filter((r): r is PromiseFulfilledResult<AssignResult> => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value?.summary?.failed || 0), 0);

      if (failed === 0 && failedAssignments === 0) {
        setSuccessMessage(`Cambios guardados exitosamente: ${successfulAssignments} asignaciones en ${successful} zonas`);
      } else {
        setSuccessMessage(`Guardado parcial: ${successfulAssignments} exitosas, ${failedAssignments} fallidas`);
      }

      setTimeout(() => setSuccessMessage(''), 5000);
      setSaving(false);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error al guardar los cambios');
      setTimeout(() => setError(null), 5000);
      setSaving(false);
    }
  }, [zoneSelections]);

  const handleCancel = useCallback(() => {
    navigate('/zones/list');
  }, [navigate]);

  const scrollTabsLeft = useCallback(() => {
    tabsContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  }, []);

  const scrollTabsRight = useCallback(() => {
    tabsContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setActiveTab(0);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setActiveTab(0);
  }, []);

  // Filtered zones
  const filteredZones = useMemo(() =>
    zones.filter(zone =>
      zone.zoneName.toLowerCase().includes(searchText.toLowerCase()) ||
      zone.zoneId.toString().includes(searchText)
    ),
    [zones, searchText]
  );

  // Current zone and selections
  const currentZone = filteredZones[activeTab];
  const currentSelections = zoneSelections[currentZone?.zoneId] || { bettingPools: [], users: [] };

  // Mapped items for SelectionSection
  const bettingPoolItems = useMemo(() =>
    bettingPools.map(pool => ({ id: pool.id, label: pool.name })),
    [bettingPools]
  );

  const userItems = useMemo(() =>
    users.map(user => ({ id: user.id, label: user.username })),
    [users]
  );

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Cargando zonas, bancas y usuarios...
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Empty state
  if (zones.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3}>
          <Box sx={{ textAlign: 'center', p: 6 }}>
            <Typography>No hay zonas disponibles</Typography>
            <Button onClick={handleCancel} variant="outlined" sx={{ mt: 2 }}>
              Volver
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1">Manejar Zonas</Typography>
          <Typography variant="body2" color="text.secondary">
            Asigna bancas y usuarios a cada zona
          </Typography>
        </Box>

        {/* Messages */}
        {successMessage && (
          <Box sx={{ p: 2 }}>
            <Alert severity="success">{successMessage}</Alert>
          </Box>
        )}
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Search */}
        <SearchBar
          searchText={searchText}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          resultCount={filteredZones.length}
        />

        {/* Tabs */}
        <ZoneTabs
          zones={filteredZones}
          activeTab={activeTab}
          tabsContainerRef={tabsContainerRef}
          searchText={searchText}
          onTabChange={handleTabChange}
          onScrollLeft={scrollTabsLeft}
          onScrollRight={scrollTabsRight}
        />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {filteredZones.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 6 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No se encontraron zonas que coincidan con su busqueda.
              </Typography>
              <Button variant="outlined" onClick={handleClearSearch} sx={PILL_BUTTON_STYLE}>
                Limpiar busqueda
              </Button>
            </Box>
          ) : (
            <Box sx={{ p: 3 }}>
              <SelectionSection
                title="Bancas"
                items={bettingPoolItems}
                selectedIds={currentSelections.bettingPools}
                emptyMessage="No hay bancas disponibles"
                onToggle={(id) => handleBettingPoolToggle(currentZone.zoneId, id)}
              />
              <SelectionSection
                title="Usuarios"
                items={userItems}
                selectedIds={currentSelections.users}
                emptyMessage="No hay usuarios disponibles"
                onToggle={(id) => handleUserToggle(currentZone.zoneId, id)}
              />
            </Box>
          )}

          {filteredZones.length > 0 && (
            <FormActions saving={saving} onCancel={handleCancel} />
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default React.memo(ManageZonesMUI);
