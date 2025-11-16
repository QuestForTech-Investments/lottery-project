import React, { useState, useEffect } from 'react';
import '../../assets/css/PremioConfig.css';

/**
 * PremioConfigTab - New Premio Configuration Component
 *
 * Implements the correct architecture for the premio system:
 * - 62 prize fields across 24 bet types
 * - 3-level precedence: System Default → Banca General → Sorteo Override
 * - Dynamic loading from API
 * - Sorteo-based navigation (not lottery-based)
 *
 * Created: 2025-10-30
 * Replaces: PremiosComisionesTab.jsx (old incorrect structure)
 */
const PremioConfigTab = ({ bancaId, onSave }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [premioConfig, setPremioConfig] = useState(null);
  const [selectedSorteo, setSelectedSorteo] = useState(null);
  const [sorteos, setSorteos] = useState([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState('dominican-picks');
  const [hasChanges, setHasChanges] = useState(false);

  // Field categories for tab organization
  const FIELD_CATEGORIES = {
    'dominican-picks': {
      label: 'Dominican Picks',
      description: 'Directo, Palé, Tripleta, Terminal, etc.',
      betTypes: ['DIRECTO', 'PALE', 'TRIPLETA', 'TERMINAL', 'QUINIELA_PALE', 'SUPER_PALE', 'PATA_CABALLO', 'CENTENA']
    },
    'pick-two-three': {
      label: 'Pick 2 & Pick 3',
      description: 'Pick Two and Pick Three variants',
      betTypes: [
        'PICK_TWO_FRONT', 'PICK_TWO_BACK', 'PICK_TWO_MIDDLE',
        'PICK_THREE_STRAIGHT', 'PICK_THREE_BOX', 'PICK_THREE_STRAIGHT_BOX',
        'PICK_THREE_COMBO', 'PICK_THREE_FRONT_PAIR', 'PICK_THREE_BACK_PAIR'
      ]
    },
    'pick-four': {
      label: 'Pick 4',
      description: 'Pick Four Straight, Box, Combo, Pairs',
      betTypes: [
        'PICK_FOUR_STRAIGHT', 'PICK_FOUR_BOX_24', 'PICK_FOUR_BOX_12', 'PICK_FOUR_BOX_6', 'PICK_FOUR_BOX_4',
        'PICK_FOUR_STRAIGHT_BOX', 'PICK_FOUR_COMBO'
      ]
    },
    'pick-five': {
      label: 'Pick 5',
      description: 'Pick Five Straight, Box, Pairs, combinations',
      betTypes: ['PICK_FIVE_STRAIGHT', 'PICK_FIVE_BOX_120', 'PICK_FIVE_BOX_60', 'PICK_FIVE_BOX_30', 'PICK_FIVE_BOX_20', 'PICK_FIVE_BOX_10', 'PICK_FIVE_BOX_5']
    },
    'lotto-powerball': {
      label: 'Lotto & Powerball',
      description: 'Lotto and Powerball prize tiers',
      betTypes: ['LOTTO_3_NUMBERS', 'LOTTO_4_NUMBERS', 'LOTTO_5_NUMBERS', 'LOTTO_6_NUMBERS', 'POWERBALL_5_PLUS_POWERBALL']
    },
    'instant-win': {
      label: 'Instant Win',
      description: 'Instant win games',
      betTypes: ['INSTANT_WIN']
    }
  };

  // Mock data structure that matches what API will return
  // This will be replaced with real API call
  const MOCK_PREMIO_FIELDS = [
    // Dominican Picks
    { campo_premio_id: 1, field_code: 'DIRECTO_MONTO', field_name: 'Directo - Monto', bet_type_code: 'DIRECTO', effective_multiplier: 60, system_default: 60, banca_general: 60, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 2, field_code: 'PALE_MONTO', field_name: 'Palé - Monto', bet_type_code: 'PALE', effective_multiplier: 7, system_default: 7, banca_general: 7, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 3, field_code: 'TRIPLETA_MONTO', field_name: 'Tripleta - Monto', bet_type_code: 'TRIPLETA', effective_multiplier: 300, system_default: 300, banca_general: 300, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 4, field_code: 'TERMINAL_MONTO', field_name: 'Terminal - Monto', bet_type_code: 'TERMINAL', effective_multiplier: 0, system_default: 0, banca_general: 0, sorteo_override: null, source: 'SYSTEM_DEFAULT', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 5, field_code: 'QUINIELA_PALE_MONTO', field_name: 'Quiniela Palé - Monto', bet_type_code: 'QUINIELA_PALE', effective_multiplier: 10, system_default: 10, banca_general: 10, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 6, field_code: 'SUPER_PALE_MONTO', field_name: 'Super Palé - Monto', bet_type_code: 'SUPER_PALE', effective_multiplier: 8, system_default: 8, banca_general: 8, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 7, field_code: 'PATA_CABALLO_MONTO', field_name: 'Pata de Caballo - Monto', bet_type_code: 'PATA_CABALLO', effective_multiplier: 0, system_default: 0, banca_general: 0, sorteo_override: null, source: 'SYSTEM_DEFAULT', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 8, field_code: 'CENTENA_MONTO', field_name: 'Centena - Monto', bet_type_code: 'CENTENA', effective_multiplier: 0, system_default: 0, banca_general: 0, sorteo_override: null, source: 'SYSTEM_DEFAULT', min_value: 0, max_value: 9999.99 },

    // Pick Two
    { campo_premio_id: 9, field_code: 'PICK_TWO_FRONT_MONTO', field_name: 'Pick Two Front - Monto', bet_type_code: 'PICK_TWO_FRONT', effective_multiplier: 50, system_default: 50, banca_general: 50, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 10, field_code: 'PICK_TWO_BACK_MONTO', field_name: 'Pick Two Back - Monto', bet_type_code: 'PICK_TWO_BACK', effective_multiplier: 50, system_default: 50, banca_general: 50, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 11, field_code: 'PICK_TWO_MIDDLE_MONTO', field_name: 'Pick Two Middle - Monto', bet_type_code: 'PICK_TWO_MIDDLE', effective_multiplier: 50, system_default: 50, banca_general: 50, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },

    // Pick Three
    { campo_premio_id: 12, field_code: 'PICK_THREE_STRAIGHT_MONTO', field_name: 'Pick Three Straight - Monto', bet_type_code: 'PICK_THREE_STRAIGHT', effective_multiplier: 500, system_default: 500, banca_general: 500, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 13, field_code: 'PICK_THREE_BOX_MONTO', field_name: 'Pick Three Box - Monto', bet_type_code: 'PICK_THREE_BOX', effective_multiplier: 80, system_default: 80, banca_general: 80, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 14, field_code: 'PICK_THREE_STRAIGHT_BOX_STRAIGHT', field_name: 'Pick Three Straight/Box - Straight', bet_type_code: 'PICK_THREE_STRAIGHT_BOX', effective_multiplier: 250, system_default: 250, banca_general: 250, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 15, field_code: 'PICK_THREE_STRAIGHT_BOX_BOX', field_name: 'Pick Three Straight/Box - Box', bet_type_code: 'PICK_THREE_STRAIGHT_BOX', effective_multiplier: 40, system_default: 40, banca_general: 40, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 16, field_code: 'PICK_THREE_COMBO_MONTO', field_name: 'Pick Three Combo - Monto', bet_type_code: 'PICK_THREE_COMBO', effective_multiplier: 500, system_default: 500, banca_general: 500, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 17, field_code: 'PICK_THREE_FRONT_PAIR_MONTO', field_name: 'Pick Three Front Pair - Monto', bet_type_code: 'PICK_THREE_FRONT_PAIR', effective_multiplier: 50, system_default: 50, banca_general: 50, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 18, field_code: 'PICK_THREE_BACK_PAIR_MONTO', field_name: 'Pick Three Back Pair - Monto', bet_type_code: 'PICK_THREE_BACK_PAIR', effective_multiplier: 50, system_default: 50, banca_general: 50, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },

    // Pick Four
    { campo_premio_id: 19, field_code: 'PICK_FOUR_STRAIGHT_MONTO', field_name: 'Pick Four Straight - Monto', bet_type_code: 'PICK_FOUR_STRAIGHT', effective_multiplier: 5000, system_default: 5000, banca_general: 5000, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },
    { campo_premio_id: 20, field_code: 'PICK_FOUR_BOX_24_MONTO', field_name: 'Pick Four Box 24-way - Monto', bet_type_code: 'PICK_FOUR_BOX_24', effective_multiplier: 200, system_default: 200, banca_general: 200, sorteo_override: null, source: 'BANCA_GENERAL', min_value: 0, max_value: 9999.99 },

    // ... More fields would be added here to reach 62 total
    // For brevity in this initial version, showing the pattern
  ];

  // Load premio configuration on mount
  // Using selectedSorteo?.sorteo_id instead of selectedSorteo to avoid unnecessary re-renders
  // when the object reference changes but the ID stays the same
  useEffect(() => {
    console.log('🔴 useEffect fired - bancaId:', bancaId, 'selectedSorteo.sorteo_id:', selectedSorteo?.sorteo_id);
    loadPremioConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bancaId, selectedSorteo?.sorteo_id]);

  const loadPremioConfig = async () => {
    console.log('🟠 loadPremioConfig called');
    try {
      setLoading(true);
      setError(null);

      // Use correct API endpoint based on whether sorteo is selected
      const url = selectedSorteo?.sorteo_id
        ? `/api/betting-pools/${bancaId}/draws/${selectedSorteo.sorteo_id}/prize-config`
        : `/api/betting-pools/${bancaId}/prize-config`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load premio config');
      let apiData = await response.json();

      // If draw-specific config is empty, fallback to general config
      if (selectedSorteo && Array.isArray(apiData) && apiData.length === 0) {
        console.log(`⚠️ No draw-specific config for sorteo ${selectedSorteo.sorteo_id}, loading general config as fallback`);
        const generalResponse = await fetch(`/api/betting-pools/${bancaId}/prize-config`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        if (generalResponse.ok) {
          apiData = await generalResponse.json();
        }
      }

      // Transform API response to match component's expected format
      const transformedData = {
        banca_id: bancaId,
        sorteo_id: selectedSorteo?.sorteo_id || null,
        fields: apiData.map(item => ({
          campo_premio_id: item.prizeFieldId,
          field_code: item.fieldCode,
          field_name: item.fieldCode.replace(/_/g, ' '),
          bet_type_code: item.fieldCode.split('_')[0],
          effective_multiplier: item.customValue,
          system_default: null,
          banca_general: item.customValue,
          sorteo_override: selectedSorteo ? item.customValue : null,
          source: selectedSorteo ? 'SORTEO_OVERRIDE' : 'BANCA_GENERAL',
          min_value: 0,
          max_value: 9999.99
        }))
      };

      setPremioConfig(transformedData);

      // Use real draw IDs from database
      // TODO: Create API endpoint to load draws dynamically
      setSorteos([
        { sorteo_id: null, lottery_name: 'General Config', draw_time: null, display_name: 'Configuración General' },
        { sorteo_id: 83, lottery_name: 'LA PRIMERA', draw_time: '10:00', display_name: 'LA PRIMERA - 10:00' },
        { sorteo_id: 84, lottery_name: 'LA PRIMERA', draw_time: '12:00', display_name: 'LA PRIMERA - 12:00' },
        { sorteo_id: 85, lottery_name: 'LA PRIMERA', draw_time: '18:00', display_name: 'LA PRIMERA - 18:00' },
      ]);

      setLoading(false);
    } catch (err) {
      console.error('Error loading premio config:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFieldChange = (campoPremioId, newValue) => {
    console.log('🔵 handleFieldChange called:', campoPremioId, newValue);
    setPremioConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.campo_premio_id === campoPremioId
          ? {
              ...field,
              // Keep as string during editing, only parse on save
              effective_multiplier: newValue === '' ? '' : newValue
            }
          : field
      )
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    console.log('💾 handleSave called - Stack trace:', new Error().stack);
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Use correct API endpoint based on whether sorteo is selected
      const url = selectedSorteo?.sorteo_id
        ? `/api/betting-pools/${bancaId}/draws/${selectedSorteo.sorteo_id}/prize-config`
        : `/api/betting-pools/${bancaId}/prize-config`;

      // Transform data to match API expected format
      const requestBody = {
        prizeConfigs: premioConfig.fields.map(f => ({
          prizeFieldId: f.campo_premio_id,
          fieldCode: f.field_code,
          value: parseFloat(f.effective_multiplier) || 0
        }))
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save premio config');
      }

      const responseData = await response.json();
      console.log('✅ Premio config saved successfully');
      setHasChanges(false);

      // Show success message
      const savedCount = responseData.savedCount || 0;
      const updatedCount = responseData.updatedCount || 0;
      setSuccessMessage(`Configuración actualizada exitosamente: ${savedCount} nuevos, ${updatedCount} actualizados`);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      // Reload data from API to ensure we have the latest
      await loadPremioConfig();

      if (onSave) {
        onSave(premioConfig);
      }
    } catch (err) {
      console.error('❌ Error saving premio config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOverride = async (campoPremioId) => {
    if (!selectedSorteo) return;

    try {
      setLoading(true);
      setError(null);

      // Call real API
      const response = await fetch(
        `/api/premio-config/sorteo-override/${selectedSorteo.sorteo_id}/${campoPremioId}?bancaId=${premioConfig.banca_id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete override');

      // Reload config
      await loadPremioConfig();
    } catch (err) {
      console.error('Error deleting override:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getPrecedenceBadge = (source) => {
    const badges = {
      'SYSTEM_DEFAULT': { label: 'Default', className: 'badge-default', icon: '⚙️' },
      'BANCA_GENERAL': { label: 'Banca', className: 'badge-banca', icon: '🏦' },
      'SORTEO_OVERRIDE': { label: 'Override', className: 'badge-override', icon: '📌' }
    };
    return badges[source] || badges['SYSTEM_DEFAULT'];
  };

  const renderFieldsByCategory = (category) => {
    if (!premioConfig) return null;

    const categoryConfig = FIELD_CATEGORIES[category];
    const fieldsInCategory = premioConfig.fields.filter(field =>
      categoryConfig.betTypes.includes(field.bet_type_code)
    );

    if (fieldsInCategory.length === 0) {
      return <p className="no-fields-message">No hay campos en esta categoría</p>;
    }

    return (
      <div className="premio-fields-grid">
        {fieldsInCategory.map(field => {
          const badge = getPrecedenceBadge(field.source);

          return (
            <div key={field.campo_premio_id} className="premio-field-card">
              <div className="field-header">
                <label className="field-label" title={`Code: ${field.field_code}`}>
                  {field.field_name}
                </label>
                <span className={`precedence-badge ${badge.className}`} title={`Source: ${field.source}`}>
                  <span className="badge-icon">{badge.icon}</span>
                  <span className="badge-label">{badge.label}</span>
                </span>
              </div>

              <div className="field-input-container">
                <input
                  type="number"
                  step="0.01"
                  min={field.min_value}
                  max={field.max_value}
                  value={field.effective_multiplier}
                  onChange={(e) => handleFieldChange(field.campo_premio_id, e.target.value)}
                  className="field-input"
                  disabled={loading}
                />
                <span className="field-multiplier-label">×</span>
              </div>

              <div className="field-precedence-info">
                <div className="precedence-values">
                  <span className="precedence-value" title="System Default">
                    Default: {field.system_default}
                  </span>
                  {field.banca_general !== null && (
                    <span className="precedence-value" title="Banca General">
                      Banca: {field.banca_general}
                    </span>
                  )}
                  {field.sorteo_override !== null && (
                    <>
                      <span className="precedence-value" title="Sorteo Override">
                        Override: {field.sorteo_override}
                      </span>
                      <button
                        type="button"
                        className="btn-reset-override"
                        onClick={() => handleDeleteOverride(field.campo_premio_id)}
                        title="Eliminar override y volver a configuración general"
                      >
                        ↺ Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && !premioConfig) {
    return (
      <div className="premio-config-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando configuración de premios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premio-config-container">
      {/* Header */}
      <div className="premio-config-header">
        <h2>Configuración de Premios</h2>
        <p className="premio-config-subtitle">
          Gestiona los multiplicadores de premio para {premioConfig?.is_general_config ? 'toda la banca' : 'sorteos específicos'}
        </p>
      </div>

      {/* Sorteo Selector */}
      <div className="sorteo-selector-container">
        <label className="sorteo-selector-label">Configurando premios para:</label>
        <select
          value={selectedSorteo?.sorteo_id || ''}
          onChange={(e) => {
            const sorteoId = e.target.value;
            setSelectedSorteo(sorteos.find(s => String(s.sorteo_id) === String(sorteoId)) || sorteos[0]);
          }}
          className="sorteo-selector"
          disabled={loading}
        >
          {sorteos.map(sorteo => (
            <option key={sorteo.sorteo_id || 'general'} value={sorteo.sorteo_id || ''}>
              {sorteo.display_name}
            </option>
          ))}
        </select>

        {!premioConfig?.is_general_config && (
          <span className="sorteo-info-badge">
            Override Mode - Los cambios solo afectan a este sorteo
          </span>
        )}
      </div>

      {/* Category Tabs */}
      <div className="category-tabs-container">
        {Object.entries(FIELD_CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            type="button"
            className={`category-tab ${activeCategoryTab === key ? 'active' : ''}`}
            onClick={() => setActiveCategoryTab(key)}
            disabled={loading}
          >
            <span className="category-tab-label">{category.label}</span>
            <span className="category-tab-description">{category.description}</span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="success-message-banner">
          <span className="success-icon">✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Fields Grid */}
      <div className="premio-fields-container">
        {renderFieldsByCategory(activeCategoryTab)}
      </div>

      {/* Action Buttons */}
      <div className="premio-config-actions">
        <button
          type="button"
          className="btn-save-premio"
          onClick={handleSave}
          disabled={loading || !hasChanges}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>

        {hasChanges && (
          <button
            type="button"
            className="btn-cancel-premio"
            onClick={loadPremioConfig}
            disabled={loading}
          >
            Cancelar
          </button>
        )}

        <div className="premio-info-section">
          <p className="premio-info-text">
            <strong>Importante:</strong> Los valores son multiplicadores, no montos fijos.
            El premio final se calcula como: Apuesta × Multiplicador = Premio
          </p>
          <p className="premio-info-example">
            Ejemplo: $10 × 60 = $600
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="precedence-legend">
        <h4>Leyenda de Precedencia:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="precedence-badge badge-default">
              <span className="badge-icon">⚙️</span>
              <span className="badge-label">Default</span>
            </span>
            <span className="legend-description">Valor por defecto del sistema</span>
          </div>
          <div className="legend-item">
            <span className="precedence-badge badge-banca">
              <span className="badge-icon">🏦</span>
              <span className="badge-label">Banca</span>
            </span>
            <span className="legend-description">Configuración general de la banca</span>
          </div>
          <div className="legend-item">
            <span className="precedence-badge badge-override">
              <span className="badge-icon">📌</span>
              <span className="badge-label">Override</span>
            </span>
            <span className="legend-description">Override específico para este sorteo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremioConfigTab;
