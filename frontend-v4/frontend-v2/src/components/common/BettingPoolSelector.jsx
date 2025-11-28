import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { getBettingPools } from '@/services/bettingPoolService';
import * as logger from '@/utils/logger';

/**
 * BettingPoolSelector Component
 * Material-UI single-select component for bettingPool (banca) selection
 * Filters bettingPools based on selected zone IDs
 *
 * @param {number|string} value - Selected bettingPool ID
 * @param {Function} onChange - Callback function when selection changes
 * @param {Array} selectedZoneIds - Array of selected zone IDs to filter bettingPools
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 */
const BettingPoolSelector = ({
  value = null,
  onChange,
  selectedZoneIds = [],
  placeholder = 'Seleccionar...',
  required = false,
}) => {
  const [bettingPools, setBettingPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load bettingPools when selected zones change
  useEffect(() => {
    const loadBettingPools = async () => {
      // Only load if there are selected zones
      if (!selectedZoneIds || selectedZoneIds.length === 0) {
        setBettingPools([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch bettingPools for each selected zone
        const bettingPoolPromises = selectedZoneIds.map(zoneId =>
          getBettingPools({ zoneId, isActive: true })
        );

        const responses = await Promise.all(bettingPoolPromises);

        // Combine all bettingPools from different zones
        const allBettingPools = responses.reduce((acc, response) => {
          const bettingPoolsData = response.data || response.bettingPools || response;
          if (Array.isArray(bettingPoolsData)) {
            return [...acc, ...bettingPoolsData];
          }
          return acc;
        }, []);

        // Remove duplicates based on bettingPool ID
        const uniqueBettingPools = Array.from(
          new Map(allBettingPools.map(bettingPool => [bettingPool.id, bettingPool])).values()
        );

        setBettingPools(uniqueBettingPools);
        logger.debug('Betting pools loaded successfully', { count: uniqueBettingPools.length });

        // Clear selection if the currently selected bettingPool is not in the new list
        if (value && !uniqueBettingPools.find(b => b.id === value)) {
          onChange(null);
        }
      } catch (err) {
        logger.error('Error loading betting pools', err);
        setError('Error al cargar betting pools');
        setBettingPools([]);
      } finally {
        setLoading(false);
      }
    };

    loadBettingPools();
  }, [selectedZoneIds, value, onChange]);

  // Find the selected bettingPool object
  const selectedBettingPool = bettingPools.find(bettingPool => bettingPool.id === value) || null;

  // Handle selection change
  const handleChange = (event, newValue) => {
    onChange(newValue ? newValue.id : null);
  };

  return (
    <Autocomplete
      id="bettingPool-selector"
      options={bettingPools}
      value={selectedBettingPool}
      onChange={handleChange}
      loading={loading}
      disabled={loading || error || selectedZoneIds.length === 0}
      getOptionLabel={(option) => option.name || option.code || ''}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={!!error}
          helperText={error || (selectedZoneIds.length === 0 ? 'Selecciona zonas primero' : '')}
          required={required && !selectedBettingPool}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        loading
          ? 'Cargando...'
          : selectedZoneIds.length === 0
          ? 'Selecciona zonas primero'
          : 'No hay betting pools disponibles'
      }
    />
  );
};

export default BettingPoolSelector;
