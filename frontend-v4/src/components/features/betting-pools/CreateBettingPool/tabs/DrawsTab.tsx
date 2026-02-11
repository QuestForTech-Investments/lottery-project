import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

interface Draw {
  drawId: number;
  drawName: string;
}

interface DrawsFormData {
  selectedDraws: number[];
  anticipatedClosing: string;
  anticipatedClosingDraws: number[];
  [key: string]: string | number | number[] | boolean;
}

interface SyntheticEventLike {
  target: {
    name: string;
    value: number[] | string;
  };
}

interface DrawsTabProps {
  formData: DrawsFormData;
  handleChange: (e: SyntheticEventLike) => void;
  draws?: Draw[];
  loadingDraws?: boolean;
}

interface DrawMultiselectProps {
  draws: Draw[];
  value: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder: string;
}

interface DrawsApiResponse {
  success: boolean;
  data?: Draw[];
}

/**
 * Orden específico de los sorteos (mismo que PrizesTab)
 */
const DRAW_ORDER = [
  'LA PRIMERA', 'NEW YORK DAY', 'NEW YORK NIGHT', 'FLORIDA AM', 'FLORIDA PM',
  'GANA MAS', 'NACIONAL', 'QUINIELA PALE', 'REAL', 'LOTEKA',
  'FL PICK2 AM', 'FL PICK2 PM', 'GEORGIA-MID AM', 'GEORGIA EVENING', 'GEORGIA NIGHT',
  'NEW JERSEY AM', 'NEW JERSEY PM', 'CONNECTICUT AM', 'CONNECTICUT PM',
  'CALIFORNIA AM', 'CALIFORNIA PM', 'CHICAGO AM', 'CHICAGO PM',
  'PENN MIDDAY', 'PENN EVENING', 'INDIANA MIDDAY', 'INDIANA EVENING',
  'DIARIA 11AM', 'DIARIA 3PM', 'DIARIA 9PM',
  'SUPER PALE TARDE', 'SUPER PALE NOCHE', 'SUPER PALE NY-FL AM', 'SUPER PALE NY-FL PM',
  'TEXAS MORNING', 'TEXAS DAY', 'TEXAS EVENING', 'TEXAS NIGHT',
  'VIRGINIA AM', 'VIRGINIA PM', 'SOUTH CAROLINA AM', 'SOUTH CAROLINA PM',
  'MARYLAND MIDDAY', 'MARYLAND EVENING', 'MASS AM', 'MASS PM', 'LA SUERTE',
  'NORTH CAROLINA AM', 'NORTH CAROLINA PM', 'LOTEDOM',
  'NY AM 6x1', 'NY PM 6x1', 'FL AM 6X1', 'FL PM 6X1',
  'King Lottery AM', 'King Lottery PM', 'L.E. PUERTO RICO 2PM', 'L.E. PUERTO RICO 10PM',
  'DELAWARE AM', 'DELAWARE PM', 'Anguila 1pm', 'Anguila 6PM', 'Anguila 9pm', 'Anguila 10am',
  'LA CHICA', 'LA PRIMERA 8PM', 'PANAMA MIERCOLES', 'PANAMA DOMINGO', 'LA SUERTE 6:00pm'
];

/**
 * DrawsTab Component
 * Contains draw selection with chip-based UI (like V1)
 * ⚡ PERFORMANCE: Draws loaded once in parent hook, eliminating duplicate API calls
 */
const DrawsTab: React.FC<DrawsTabProps> = ({ formData, handleChange, draws: propDraws = [], loadingDraws: propLoadingDraws = false }) => {
  // ⚡ PERFORMANCE: Draws loaded in parent hook when provided, otherwise load locally (backward compatible)
  const [localDraws, setLocalDraws] = useState<Draw[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use prop draws if provided, otherwise use local draws
  const draws = propDraws.length > 0 ? propDraws : localDraws;
  const loading = propDraws.length > 0 ? propLoadingDraws : localLoading;

  // Load draws locally only if not provided by parent
  useEffect(() => {
    if (propDraws.length === 0) {
      const loadLocalDraws = async () => {
        try {
          setLocalLoading(true);
          const { getAllDraws } = await import('@services/drawService');
          const response = await getAllDraws({ loadAll: true }) as DrawsApiResponse;
          if (response.success && response.data) {
            const sortedDraws = response.data.sort((a: Draw, b: Draw) =>
              a.drawName.localeCompare(b.drawName)
            );
            setLocalDraws(sortedDraws);
          }
        } catch (err) {
          console.error('[ERROR] Error loading draws locally:', err);
          setError('Error cargando sorteos');
        } finally {
          setLocalLoading(false);
        }
      };
      loadLocalDraws();
    }
  }, [propDraws.length]);

  /**
   * Handle draw chip click
   */
  const handleDrawClick = (drawId: number): void => {
    let newSelectedDraws = [...(formData.selectedDraws || [])];

    if (newSelectedDraws.includes(drawId)) {
      // Deselect
      newSelectedDraws = newSelectedDraws.filter(id => id !== drawId);
    } else {
      // Select
      newSelectedDraws.push(drawId);
    }

    handleChange({
      target: {
        name: 'selectedDraws',
        value: newSelectedDraws
      }
    });
  };

  /**
   * Handle select all / deselect all
   */
  const handleToggleAll = (): void => {
    const allDrawIds = draws.map(draw => draw.drawId);
    const allSelected = draws.length > 0 &&
                       formData.selectedDraws?.length === draws.length;

    handleChange({
      target: {
        name: 'selectedDraws',
        value: allSelected ? [] : allDrawIds
      }
    });
  };

  const selectedCount = formData.selectedDraws?.length || 0;
  const _allSelected = draws.length > 0 && selectedCount === draws.length;

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Sorteos
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona los sorteos de lotería que estarán disponibles en esta banca
      </Typography>

      <Grid container spacing={3}>
        {/* Draw Selection with Chips */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            {/* Chips Grid */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {draws.map((draw) => {
                const isSelected = formData.selectedDraws?.includes(draw.drawId);

                return (
                  <Chip
                    key={draw.drawId}
                    label={draw.drawName}
                    onClick={() => handleDrawClick(draw.drawId)}
                    sx={{
                      backgroundColor: isSelected ? '#6610f2' : '#e0e0e0',
                      color: isSelected ? '#ffffff' : '#606266',
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '13px',
                      height: '32px',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: isSelected ? '#5a0edb' : '#d0d0d0',
                      },
                    }}
                  />
                );
              })}
            </Box>

            {/* TODOS button and counter */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleToggleAll}
                sx={{
                  backgroundColor: '#6610f2',
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#5a0edb',
                  },
                }}
              >
                TODOS
              </Button>

              <Typography variant="body2" color="text.secondary">
                {selectedCount} de {draws.length} sorteo(s) seleccionado(s)
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Anticipated Closing */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configuración de Cierre Anticipado
            </Typography>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minutos de Cierre Anticipado"
                  name="anticipatedClosing"
                  value={formData.anticipatedClosing || ''}
                  onChange={handleChange}
                  helperText="Minutos antes del sorteo para cerrar las ventas"
                  inputProps={{ min: "0", step: "1" }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Aplicar cierre anticipado a:
                </Typography>

                {/* Draw Multiselect */}
                <DrawMultiselect
                  draws={draws}
                  value={formData.anticipatedClosingDraws || []}
                  onChange={(selectedIds) => {
                    handleChange({
                      target: {
                        name: 'anticipatedClosingDraws',
                        value: selectedIds
                      }
                    });
                  }}
                  placeholder="Seleccionar sorteos..."
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

/**
 * DrawMultiselect Component
 * Multiselect dropdown for draws (similar to V1 zone selector)
 */
const DrawMultiselect: React.FC<DrawMultiselectProps> = ({ draws, value = [], onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDraws = draws.filter(draw =>
    draw.drawName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedDraws = draws.filter(draw => value.includes(draw.drawId));

  const handleToggleDraw = (drawId: number): void => {
    let newValue: number[];
    if (value.includes(drawId)) {
      newValue = value.filter(id => id !== drawId);
    } else {
      newValue = [...value, drawId];
    }
    onChange(newValue);
  };

  const handleRemoveDraw = (drawId: number, e: React.MouseEvent): void => {
    e.stopPropagation();
    const newValue = value.filter(id => id !== drawId);
    onChange(newValue);
  };

  const handleSelectAll = (): void => {
    const allDrawIds = filteredDraws.map(draw => draw.drawId);
    onChange(allDrawIds);
  };

  const handleClearAll = (): void => {
    onChange([]);
  };

  const isAllSelected = filteredDraws.length > 0 &&
                        filteredDraws.every(draw => value.includes(draw.drawId));

  return (
    <Box ref={dropdownRef} sx={{ position: 'relative' }}>
      <Paper
        variant="outlined"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          p: 1,
          cursor: 'pointer',
          minHeight: '56px',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        {/* Selected draws as chips */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          {selectedDraws.map(draw => (
            <Chip
              key={draw.drawId}
              label={draw.drawName}
              size="small"
              onDelete={(e) => handleRemoveDraw(draw.drawId, e)}
              sx={{
                backgroundColor: '#6610f2',
                color: '#ffffff',
                '& .MuiChip-deleteIcon': {
                  color: '#ffffff',
                  '&:hover': {
                    color: '#eeeeee',
                  },
                },
              }}
            />
          ))}

          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedDraws.length === 0 ? placeholder : ''}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              minWidth: '120px',
              fontSize: '14px',
            }}
          />
        </Box>
      </Paper>

      {/* Dropdown */}
      {isOpen && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            maxHeight: '300px',
            overflow: 'auto',
            zIndex: 1300,
          }}
        >
          {/* Action buttons */}
          <Box sx={{ p: 1, display: 'flex', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={isAllSelected}
              sx={{ fontSize: '12px' }}
            >
              Seleccionar todas
            </Button>
            <Button
              size="small"
              onClick={handleClearAll}
              disabled={value.length === 0}
              sx={{ fontSize: '12px' }}
            >
              Limpiar
            </Button>
          </Box>

          {/* Options list */}
          {filteredDraws.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              {searchTerm ? 'No se encontraron sorteos' : 'No hay sorteos disponibles'}
            </Box>
          ) : (
            <Box>
              {filteredDraws.map(draw => {
                const isSelected = value.includes(draw.drawId);
                return (
                  <Box
                    key={draw.drawId}
                    onClick={() => handleToggleDraw(draw.drawId)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: isSelected ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Typography variant="body2">{draw.drawName}</Typography>
                    {isSelected && (
                      <Box sx={{ color: 'primary.main' }}>✓</Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Paper>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {value.length} sorteo{value.length !== 1 ? 's' : ''} seleccionado{value.length !== 1 ? 's' : ''}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Custom comparison function for DrawsTab
 * Only re-renders when relevant fields for this tab change
 */
const arePropsEqual = (prevProps: DrawsTabProps, nextProps: DrawsTabProps): boolean => {
  // Check if handleChange changed
  if (prevProps.handleChange !== nextProps.handleChange) {
    return false;
  }

  // Check anticipatedClosing
  if (prevProps.formData.anticipatedClosing !== nextProps.formData.anticipatedClosing) {
    return false;
  }

  // Check selectedDraws array
  const prevDraws = prevProps.formData.selectedDraws || [];
  const nextDraws = nextProps.formData.selectedDraws || [];

  if (prevDraws.length !== nextDraws.length) {
    return false;
  }

  // Check if all draw IDs are the same (order doesn't matter)
  const prevSet = new Set(prevDraws);
  const nextSet = new Set(nextDraws);

  if (prevSet.size !== nextSet.size) {
    return false;
  }

  for (const id of prevSet) {
    if (!nextSet.has(id)) {
      return false;
    }
  }

  // Check anticipatedClosingDraws array
  const prevClosingDraws = prevProps.formData.anticipatedClosingDraws || [];
  const nextClosingDraws = nextProps.formData.anticipatedClosingDraws || [];

  if (prevClosingDraws.length !== nextClosingDraws.length) {
    return false;
  }

  const prevClosingSet = new Set(prevClosingDraws);
  const nextClosingSet = new Set(nextClosingDraws);

  if (prevClosingSet.size !== nextClosingSet.size) {
    return false;
  }

  for (const id of prevClosingSet) {
    if (!nextClosingSet.has(id)) {
      return false;
    }
  }

  // No relevant changes, skip re-render
  return true;
};

export default React.memo(DrawsTab, arePropsEqual);
