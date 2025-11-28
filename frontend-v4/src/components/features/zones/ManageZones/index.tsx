import React, { useState, useEffect, useRef, useCallback, type ChangeEvent, type FormEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { getAllZones, assignToZone } from '@/services/zoneService';
import { getBettingPools } from '@/services/bettingPoolService';
import { getAllUsers } from '@/services/userService';
import './ManageZonesMUI.css';

interface Zone {
  zoneId: number;
  zoneName: string;
  isActive?: boolean;
}

interface BettingPool {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
}

interface ZoneSelection {
  bettingPools: number[];
  users: number[];
}

interface ZoneSelections {
  [zoneId: number]: ZoneSelection;
}

interface ZonesApiResponse {
  success?: boolean;
  data?: Zone[];
}

interface BettingPoolApiItem {
  bettingPoolId: number;
  bettingPoolName?: string;
  branchCode?: string;
}

interface BettingPoolApiResponse {
  success?: boolean;
  data?: BettingPoolApiItem[];
  items?: BettingPoolApiItem[];
}

interface UserApiItem {
  userId: number;
  username: string;
}

interface UserApiResponse {
  success?: boolean;
  data?: UserApiItem[];
  items?: UserApiItem[];
}

interface AssignResult {
  success?: boolean;
  summary?: {
    totalAssignments?: number;
    successful?: number;
    failed?: number;
  };
}

/**
 * ManageZonesMUI Component
 * Form to manage all zones - assign betting pools and users with tabs
 * Uses Material-UI tabs with multiselect buttons
 */
const ManageZonesMUI = (): React.ReactElement => {
  const navigate = useNavigate();

  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  const [zones, setZones] = useState<Zone[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Ref for tabs container
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchText, setSearchText] = useState<string>('');

  // Selections state - object with zoneId as key
  const [zoneSelections, setZoneSelections] = useState<ZoneSelections>({});

  // Real data from API
  const [bettingPools, setBettingPools] = useState<BettingPool[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  /**
   * Load all data on mount - zones, betting pools, and users
   */
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // Load zones, betting pools, and users in parallel
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

        // Process betting pools - map API response to expected format
        const bettingPoolsData = (bettingPoolsResponse as BettingPoolApiResponse).success
          ? (bettingPoolsResponse as BettingPoolApiResponse).data
          : (bettingPoolsResponse as BettingPoolApiResponse).items || bettingPoolsResponse as BettingPoolApiItem[];

        const mappedBettingPools: BettingPool[] = (bettingPoolsData || []).map(pool => ({
          id: pool.bettingPoolId,
          name: pool.bettingPoolName || pool.branchCode || ''
        }));
        setBettingPools(mappedBettingPools);

        // Process users - map API response to expected format
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
          // TODO: Load actual zone assignments from API
          // For now, start with empty selections
          initialSelections[zone.zoneId] = {
            bettingPools: [],
            users: []
          };
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

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  /**
   * Handle betting pool button click
   */
  const handleBettingPoolToggle = useCallback((zoneId: number, poolId: number) => {
    setZoneSelections(prev => {
      const zoneData = prev[zoneId] || { bettingPools: [], users: [] };
      const bettingPools = zoneData.bettingPools || [];

      const newBettingPools = bettingPools.includes(poolId)
        ? bettingPools.filter(id => id !== poolId)
        : [...bettingPools, poolId];

      return {
        ...prev,
        [zoneId]: {
          ...zoneData,
          bettingPools: newBettingPools
        }
      };
    });
  }, []);

  /**
   * Handle user button click
   */
  const handleUserToggle = useCallback((zoneId: number, userId: number) => {
    setZoneSelections(prev => {
      const zoneData = prev[zoneId] || { bettingPools: [], users: [] };
      const users = zoneData.users || [];

      const newUsers = users.includes(userId)
        ? users.filter(id => id !== userId)
        : [...users, userId];

      return {
        ...prev,
        [zoneId]: {
          ...zoneData,
          users: newUsers
        }
      };
    });
  }, []);

  /**
   * Handle form submit
   * Saves all zone assignments (betting pools and users) to API
   */
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Get all zones with selections
      const zonesToUpdate = Object.entries(zoneSelections).filter(
        ([, data]) => data.bettingPools.length > 0 || data.users.length > 0
      );

      if (zonesToUpdate.length === 0) {
        setError('No hay cambios para guardar');
        setSaving(false);
        return;
      }

      console.log('Saving assignments for zones:', zonesToUpdate.map(([zoneId]) => zoneId));

      // Save assignments for all zones in parallel
      const savePromises = zonesToUpdate.map(([zoneId, data]) =>
        assignToZone(parseInt(zoneId), {
          bettingPoolIds: data.bettingPools,
          userIds: data.users
        }) as Promise<AssignResult>
      );

      const results = await Promise.allSettled(savePromises);

      // Count successes and failures
      const successful = results.filter(r => r.status === 'fulfilled' && (r.value as AssignResult).success).length;
      const failed = results.filter(r => r.status === 'rejected' || !(r.value as AssignResult)?.success).length;

      // Calculate total assignments
      const totalAssignments = results
        .filter((r): r is PromiseFulfilledResult<AssignResult> => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value?.summary?.totalAssignments || 0), 0);

      const successfulAssignments = results
        .filter((r): r is PromiseFulfilledResult<AssignResult> => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value?.summary?.successful || 0), 0);

      const failedAssignments = results
        .filter((r): r is PromiseFulfilledResult<AssignResult> => r.status === 'fulfilled')
        .reduce((sum, r) => sum + (r.value?.summary?.failed || 0), 0);

      console.log('Save results:', {
        zones: { successful, failed, total: zonesToUpdate.length },
        assignments: { successfulAssignments, failedAssignments, totalAssignments }
      });

      // Show results to user
      if (failed === 0 && failedAssignments === 0) {
        setSuccessMessage(
          `✓ Cambios guardados exitosamente: ${successfulAssignments} asignaciones en ${successful} zonas`
        );
      } else {
        setSuccessMessage(
          `Guardado parcial: ${successfulAssignments} exitosas, ${failedAssignments} fallidas`
        );
      }

      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      setSaving(false);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error al guardar los cambios');
      console.error('Error saving zone assignments:', err);
      setTimeout(() => setError(null), 5000);
      setSaving(false);
    }
  }, [zoneSelections]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    navigate('/zones/list');
  }, [navigate]);

  /**
   * Scroll tabs left
   */
  const scrollTabsLeft = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  }, []);

  /**
   * Scroll tabs right
   */
  const scrollTabsRight = useCallback(() => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  }, []);

  /**
   * Filter zones based on search text
   */
  const filteredZones = zones.filter(zone =>
    zone.zoneName.toLowerCase().includes(searchText.toLowerCase()) ||
    zone.zoneId.toString().includes(searchText)
  );

  /**
   * Handle search text change
   */
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    // Reset to first tab when searching
    setActiveTab(0);
  }, []);

  /**
   * Clear search
   */
  const handleClearSearch = useCallback(() => {
    setSearchText('');
    setActiveTab(0);
  }, []);

  // Show loading state while fetching data
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

  const currentZone = filteredZones[activeTab];
  const currentSelections = zoneSelections[currentZone?.zoneId] || { bettingPools: [], users: [] };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1">
            Manejar Zonas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Asigna bancas y usuarios a cada zona
          </Typography>
        </Box>

        {/* Success/Error Messages */}
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

        {/* Search Bar */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
            <TextField
              fullWidth
              placeholder="Buscar zona por nombre o ID..."
              value={searchText}
              onChange={handleSearchChange}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '14px',
                },
              }}
            />
            {searchText && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {filteredZones.length} zona{filteredZones.length !== 1 ? 's' : ''} encontrada{filteredZones.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f9fa', position: 'relative' }}>
          <IconButton
            onClick={scrollTabsLeft}
            sx={{
              flexShrink: 0,
              width: 40,
              height: 48,
              borderRadius: 0,
              borderRight: 1,
              borderColor: 'divider',
              color: '#666',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                color: '#333',
              },
            }}
            aria-label="Scroll tabs left"
          >
            <ChevronLeft />
          </IconButton>

          <Box
            ref={tabsContainerRef}
            sx={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ccc',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#999',
              },
            }}
          >
            {filteredZones.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', width: '100%' }}>
                <Typography variant="body2">
                  No se encontraron zonas que coincidan con "{searchText}"
                </Typography>
              </Box>
            ) : (
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons={false}
                sx={{
                  '& .MuiTab-root': {
                    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    minHeight: 48,
                  },
                  '& .Mui-selected': {
                    color: '#51BCDA !important',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#51BCDA',
                    height: 3,
                  },
                }}
              >
                {filteredZones.map((zone) => (
                  <Tab key={zone.zoneId} label={zone.zoneName} />
                ))}
              </Tabs>
            )}
          </Box>

          <IconButton
            onClick={scrollTabsRight}
            sx={{
              flexShrink: 0,
              width: 40,
              height: 48,
              borderRadius: 0,
              borderLeft: 1,
              borderColor: 'divider',
              color: '#666',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                color: '#333',
              },
            }}
            aria-label="Scroll tabs right"
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {filteredZones.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 6 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No se encontraron zonas que coincidan con su búsqueda.
              </Typography>
              <Button
                variant="outlined"
                onClick={handleClearSearch}
                sx={{
                  borderRadius: '30px',
                  px: 3,
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                Limpiar búsqueda
              </Button>
            </Box>
          ) : (
          <Box sx={{ p: 3 }}>
            {/* Betting Pools Section */}
            <Box
              sx={{
                border: 1,
                borderColor: '#e9ecef',
                borderRadius: 1,
                p: 2,
                bgcolor: '#f8f9fa',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontSize: '1.125rem', fontWeight: 500 }}>
                Bancas
              </Typography>

              <Box
                className="multiselect-buttons-container-mui"
              >
                {bettingPools.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No hay bancas disponibles
                  </Typography>
                ) : (
                  bettingPools.map((pool) => (
                    <Chip
                      key={pool.id}
                      label={pool.name}
                      onClick={() => handleBettingPoolToggle(currentZone.zoneId, pool.id)}
                      className={currentSelections.bettingPools.includes(pool.id) ? 'selected' : ''}
                      sx={{
                        fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                        fontSize: '11px',
                        fontWeight: currentSelections.bettingPools.includes(pool.id) ? 600 : 500,
                        bgcolor: currentSelections.bettingPools.includes(pool.id) ? '#51BCDA' : 'white',
                        color: currentSelections.bettingPools.includes(pool.id) ? 'white' : '#333',
                        border: '1.15px solid',
                        borderColor: currentSelections.bettingPools.includes(pool.id) ? '#51BCDA' : 'rgb(206, 212, 218)',
                        '&:hover': {
                          bgcolor: currentSelections.bettingPools.includes(pool.id) ? '#3da8c8' : 'rgba(81, 188, 218, 0.1)',
                          borderColor: '#51BCDA',
                        },
                      }}
                    />
                  ))
                )}
              </Box>
            </Box>

            {/* Users Section */}
            <Box
              sx={{
                border: 1,
                borderColor: '#e9ecef',
                borderRadius: 1,
                p: 2,
                bgcolor: '#f8f9fa',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontSize: '1.125rem', fontWeight: 500 }}>
                Usuarios
              </Typography>

              <Box
                className="multiselect-buttons-container-mui"
              >
                {users.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No hay usuarios disponibles
                  </Typography>
                ) : (
                  users.map((user) => (
                    <Chip
                      key={user.id}
                      label={user.username}
                      onClick={() => handleUserToggle(currentZone.zoneId, user.id)}
                      className={currentSelections.users.includes(user.id) ? 'selected' : ''}
                      sx={{
                        fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                      fontSize: '11px',
                      fontWeight: currentSelections.users.includes(user.id) ? 600 : 500,
                      bgcolor: currentSelections.users.includes(user.id) ? '#51BCDA' : 'white',
                      color: currentSelections.users.includes(user.id) ? 'white' : '#333',
                      border: '1.15px solid',
                      borderColor: currentSelections.users.includes(user.id) ? '#51BCDA' : 'rgb(206, 212, 218)',
                      '&:hover': {
                        bgcolor: currentSelections.users.includes(user.id) ? '#3da8c8' : 'rgba(81, 188, 218, 0.1)',
                        borderColor: '#51BCDA',
                      },
                    }}
                  />
                  ))
                )}
              </Box>
            </Box>
          </Box>
          )}

          {/* Submit Buttons */}
          {filteredZones.length > 0 && (
          <Box
            sx={{
              p: 3,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: '#f8f9fa',
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
              sx={{
                borderRadius: '30px',
                px: 3,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{
                borderRadius: '30px',
                px: 3,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif',
                bgcolor: '#51BCDA',
                '&:hover': {
                  bgcolor: '#3da8c8',
                },
                '&:disabled': {
                  bgcolor: '#b0dae6',
                },
              }}
            >
              {saving ? 'Guardando cambios...' : 'Guardar cambios'}
            </Button>
          </Box>
          )}
        </form>
      </Paper>
    </Box>
  );
};

/**
 * Memoize ManageZonesMUI to prevent unnecessary re-renders
 */
export default React.memo(ManageZonesMUI);
