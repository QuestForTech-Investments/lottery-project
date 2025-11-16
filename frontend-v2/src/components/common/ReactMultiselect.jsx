import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
  Box,
} from '@mui/material';
import { getAllZones } from '@/services/zoneService';
import * as logger from '@/utils/logger';

/**
 * ReactMultiselect Component
 * Material-UI multi-select component for zones selection
 *
 * @param {Array} value - Array of selected zone IDs
 * @param {Function} onChange - Callback function when selection changes
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether the field is required
 */
const ReactMultiselect = ({ value = [], onChange, placeholder = 'Seleccionar...', required = false }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load zones on component mount
  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllZones({ isActive: true, pageSize: 1000 });

        console.log('🔵 V2 ZONES API Response:', response);

        // Handle different response structures
        const zonesData = response.data || response;
        console.log('🔵 V2 Zones data:', zonesData);
        setZones(Array.isArray(zonesData) ? zonesData : []);

        logger.debug('Zones loaded successfully', { count: zonesData?.length || 0 });
      } catch (err) {
        console.error('🔴 V2 Error loading zones:', err);
        logger.error('Error loading zones', err);
        setError('Error al cargar zonas');
        setZones([]);
      } finally {
        setLoading(false);
      }
    };

    loadZones();
  }, []);

  // Convert value (array of IDs) to zone objects
  const selectedZones = zones.filter(zone => value.includes(zone.zoneId));

  // Handle selection change
  const handleChange = (event, newValue) => {
    // Convert zone objects to array of IDs
    const newIds = newValue.map(zone => zone.zoneId);
    onChange(newIds);
  };

  return (
    <Autocomplete
      multiple
      id="zones-multiselect"
      options={zones}
      value={selectedZones}
      onChange={handleChange}
      loading={loading}
      disabled={loading || error}
      getOptionLabel={(option) => option.zoneName || ''}
      isOptionEqualToValue={(option, value) => option.zoneId === value.zoneId}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={selectedZones.length === 0 ? placeholder : ''}
          error={!!error}
          helperText={error}
          required={required && selectedZones.length === 0}
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
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.zoneName}
            {...getTagProps({ index })}
            key={option.zoneId}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))
      }
      noOptionsText={loading ? 'Cargando...' : 'No hay zonas disponibles'}
      sx={{
        '& .MuiOutlinedInput-root': {
          padding: '4px',
        },
      }}
    />
  );
};

export default ReactMultiselect;
