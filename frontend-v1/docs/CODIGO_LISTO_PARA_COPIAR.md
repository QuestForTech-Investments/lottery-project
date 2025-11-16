# Código Listo para Copiar y Pegar

Este documento contiene código completamente funcional que puedes copiar directamente en tu proyecto.

---

## 1. Hook Personalizado: usePrizeFieldsCache

Crea: `/home/jorge/projects/LottoWebApp/src/hooks/usePrizeFieldsCache.js`

```javascript
import { useState, useEffect, useMemo } from 'react';
import { getPrizeFields } from '../services/prizeFieldService';
import * as logger from '../utils/logger';

/**
 * Hook para cargar y cachear prize fields metadata
 * Solo carga una vez y construye lookups optimizados
 */
export const usePrizeFieldsCache = () => {
  const [prizeFieldsData, setPrizeFieldsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar prize fields solo una vez
  useEffect(() => {
    const loadPrizeFields = async () => {
      if (prizeFieldsData) {
        logger.info('PRIZE_CACHE', 'Prize fields ya cargados, usando caché');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        logger.info('PRIZE_CACHE', '📥 Cargando metadata de prize fields...');

        const startTime = performance.now();
        const fields = await getPrizeFields();
        const endTime = performance.now();

        setPrizeFieldsData(fields);

        logger.success('PRIZE_CACHE', '✅ Prize fields cargados', {
          count: fields?.length || 0,
          loadTime: `${(endTime - startTime).toFixed(2)}ms`
        });

      } catch (err) {
        logger.error('PRIZE_CACHE', '❌ Error cargando prize fields', {
          error: err.message
        });
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadPrizeFields();
  }, []); // Solo al montar

  // Construir lookups optimizados
  const metadata = useMemo(() => {
    if (!prizeFieldsData) return null;

    logger.info('PRIZE_CACHE', '🔨 Construyendo lookups...');

    const startTime = performance.now();

    const result = {
      byCode: {},       // fieldCode -> { prizeFieldId, defaultValue, ... }
      byId: {},         // prizeFieldId -> field object
      defaults: {},     // fieldCode -> defaultValue (number)
      codes: []         // Array de todos los fieldCodes
    };

    prizeFieldsData.forEach(betType => {
      const prizeFields = betType.prizeFields || betType.PrizeFields || [];

      prizeFields.forEach(field => {
        const fieldCode = field.fieldCode || field.FieldCode;
        const prizeFieldId = field.prizeFieldId || field.PrizeFieldId;
        const defaultValue = parseFloat(field.defaultValue || field.DefaultValue) || 0;

        if (fieldCode && prizeFieldId) {
          result.byCode[fieldCode] = {
            prizeFieldId,
            defaultValue,
            fieldCode,
            betType: betType.betTypeName || betType.BetTypeName,
            displayName: field.displayName || field.DisplayName || fieldCode
          };

          result.byId[prizeFieldId] = field;
          result.defaults[fieldCode] = defaultValue;
          result.codes.push(fieldCode);
        }
      });
    });

    const endTime = performance.now();

    logger.success('PRIZE_CACHE', '✅ Lookups construidos', {
      totalFields: result.codes.length,
      buildTime: `${(endTime - startTime).toFixed(2)}ms`
    });

    return result;
  }, [prizeFieldsData]);

  return {
    metadata,
    loading,
    error,
    isReady: metadata !== null
  };
};
```

---

## 2. Hook Personalizado: useFormChangeDetection

Crea: `/home/jorge/projects/LottoWebApp/src/hooks/useFormChangeDetection.js`

```javascript
import { useState, useMemo, useCallback } from 'react';
import * as logger from '../utils/logger';

/**
 * Hook para detectar cambios granulares en un formulario
 * @param {Object} formData - Datos actuales del formulario
 * @param {Function} filterFn - Función para filtrar qué campos trackear (opcional)
 */
export const useFormChangeDetection = (formData, filterFn = null) => {
  const [initialFormData, setInitialFormData] = useState({});

  // Capturar estado inicial
  const captureInitialState = useCallback(() => {
    setInitialFormData({ ...formData });
    logger.info('FORM_CHANGES', '📸 Estado inicial capturado', {
      fieldCount: Object.keys(formData).length
    });
  }, [formData]);

  // Detectar cambios
  const changes = useMemo(() => {
    if (!initialFormData || Object.keys(initialFormData).length === 0) {
      return {};
    }

    const detectedChanges = {};

    Object.keys(formData).forEach(key => {
      // Aplicar filtro si existe
      if (filterFn && !filterFn(key)) return;

      const currentValue = formData[key];
      const initialValue = initialFormData[key];

      // Detectar cambio
      if (currentValue !== initialValue) {
        detectedChanges[key] = {
          field: key,
          currentValue,
          initialValue,
          hasChanged: true
        };
      }
    });

    return detectedChanges;
  }, [formData, initialFormData, filterFn]);

  const hasChanges = Object.keys(changes).length > 0;

  // Reset cambios (actualizar initial state)
  const resetChanges = useCallback(() => {
    setInitialFormData({ ...formData });
    logger.info('FORM_CHANGES', '🔄 Cambios reseteados');
  }, [formData]);

  return {
    changes,
    hasChanges,
    changeCount: Object.keys(changes).length,
    captureInitialState,
    resetChanges
  };
};
```

---

## 3. Hook Personalizado: usePrizeFieldChanges

Crea: `/home/jorge/projects/LottoWebApp/src/hooks/usePrizeFieldChanges.js`

```javascript
import { useMemo, useCallback } from 'react';
import * as logger from '../utils/logger';

/**
 * Hook específico para detectar cambios en campos de premios
 * @param {Object} formData - Datos del formulario
 * @param {Object} initialFormData - Datos iniciales
 * @param {Object} prizeFieldsMetadata - Metadata de prize fields (de usePrizeFieldsCache)
 */
export const usePrizeFieldChanges = (formData, initialFormData, prizeFieldsMetadata) => {
  // Convertir form key a field code
  const convertToFieldCode = useCallback((formKey) => {
    // "general_directo_primerPago" -> "DIRECTO_PRIMER_PAGO"
    const camelFieldCode = formKey.replace('general_', '');
    const snakeFieldCode = camelFieldCode.replace(/([A-Z])/g, '_$1').toLowerCase();
    return snakeFieldCode.toUpperCase();
  }, []);

  // Detectar cambios
  const changedFields = useMemo(() => {
    if (!prizeFieldsMetadata || !initialFormData || Object.keys(initialFormData).length === 0) {
      return {};
    }

    const changes = {};

    Object.keys(formData).forEach(key => {
      // Solo procesar campos de premios
      if (!key.startsWith('general_')) return;

      const currentValue = formData[key];
      const initialValue = initialFormData[key];

      // Comparar con valor inicial
      if (currentValue !== initialValue) {
        const fieldCode = convertToFieldCode(key);
        const fieldMetadata = prizeFieldsMetadata.byCode[fieldCode];

        if (fieldMetadata) {
          const currentNumeric = parseFloat(currentValue) || 0;
          const defaultValue = fieldMetadata.defaultValue;

          // Solo incluir si difiere del default
          if (currentNumeric !== defaultValue) {
            changes[key] = {
              formKey: key,
              fieldCode: fieldCode,
              prizeFieldId: fieldMetadata.prizeFieldId,
              value: currentNumeric,
              previousValue: parseFloat(initialValue) || 0,
              defaultValue: defaultValue,
              displayName: fieldMetadata.displayName
            };
          }
        } else {
          console.warn(`⚠️ Campo "${key}" (${fieldCode}) no encontrado en metadata`);
        }
      }
    });

    return changes;
  }, [formData, initialFormData, prizeFieldsMetadata, convertToFieldCode]);

  const hasChanges = Object.keys(changedFields).length > 0;

  // Construir payload para API
  const buildPayload = useCallback(() => {
    return Object.values(changedFields).map(change => ({
      prizeFieldId: change.prizeFieldId,
      fieldCode: change.fieldCode,
      value: change.value
    }));
  }, [changedFields]);

  return {
    changedFields,
    hasChanges,
    changeCount: Object.keys(changedFields).length,
    buildPayload
  };
};
```

---

## 4. EditBanca.jsx - Sección Refactorizada

Reemplaza las líneas 1-20 de `/home/jorge/projects/LottoWebApp/src/components/EditBanca.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBranchWithConfig, updateBranchConfig, updateBranch } from '../services/branchService';
import { getActiveZones } from '../services/zoneService';
import { saveBancaPrizeConfig, deleteBancaPrizeConfig } from '../services/prizeFieldService';
import * as logger from '../utils/logger';

// ✨ NUEVO: Imports de hooks optimizados
import { usePrizeFieldsCache } from '../hooks/usePrizeFieldsCache';
import { usePrizeFieldChanges } from '../hooks/usePrizeFieldChanges';

import TimePicker from './TimePicker';
import GastosAutomaticosTab from './tabs/GastosAutomaticosTab';
import PremiosComisionesTab from './tabs/PremiosComisionesTab';

import '../assets/css/CreateBranchGeneral.css';
import '../assets/css/FormStyles.css';
import '../assets/css/PremiosComisiones.css';
import '../assets/css/HorariosSorteos.css';
import '../assets/css/Sorteos.css';
import '../assets/css/PremioConfig.css';

const EditBanca = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados existentes
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState({ /* ... campos existentes ... */ });
  const [initialFormData, setInitialFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [zones, setZones] = useState([]);

  // ✨ NUEVO: Hook para caché de prize fields
  const {
    metadata: prizeFieldsMetadata,
    loading: prizeFieldsLoading,
    error: prizeFieldsError,
    isReady: prizeFieldsReady
  } = usePrizeFieldsCache();

  // ✨ NUEVO: Hook para detección de cambios
  const {
    changedFields: changedPrizeFields,
    hasChanges: prizeChanged,
    changeCount: prizeChangeCount,
    buildPayload
  } = usePrizeFieldChanges(formData, initialFormData, prizeFieldsMetadata);

  // ... resto del componente
```

---

## 5. EditBanca.jsx - Función de Guardado Optimizada

Reemplaza las líneas 810-899 con:

```javascript
      // ===================================================================
      // PASO 3: Guardar valores de Premios & Comisiones (OPTIMIZADO)
      // ===================================================================
      if (prizeChanged) {
        try {
          logger.info('EDIT_BANCA', '💾 Guardando cambios de premios', {
            changedCount: prizeChangeCount
          });

          const startTime = performance.now();

          // Construir payload usando el hook
          const prizeConfigs = buildPayload();

          logger.info('EDIT_BANCA', '📦 Payload construido', {
            configCount: prizeConfigs.length,
            fields: prizeConfigs.map(c => c.fieldCode),
            totalSize: `${JSON.stringify(prizeConfigs).length} bytes`
          });

          // 1. Eliminar configuraciones anteriores
          try {
            await deleteBancaPrizeConfig(id);
            logger.info('EDIT_BANCA', '🗑️ Configuraciones anteriores eliminadas');
          } catch (deleteError) {
            logger.info('EDIT_BANCA', 'ℹ️ No había configuraciones previas');
          }

          // 2. Guardar solo valores diferentes del default
          if (prizeConfigs.length > 0) {
            await saveBancaPrizeConfig(id, prizeConfigs);

            const endTime = performance.now();
            const saveTime = (endTime - startTime).toFixed(2);

            logger.success('EDIT_BANCA', '✅ Premios guardados', {
              savedCount: prizeConfigs.length,
              saveTime: `${saveTime}ms`,
              changes: Object.values(changedPrizeFields).map(c => ({
                field: c.displayName || c.fieldCode,
                from: c.previousValue,
                to: c.value
              }))
            });

            // Actualizar initialFormData
            setInitialFormData({ ...formData });

          } else {
            logger.info('EDIT_BANCA', 'ℹ️ Todos en default, no se guarda nada');
          }

        } catch (premioError) {
          logger.error('EDIT_BANCA', '❌ Error guardando premios', {
            error: premioError.message
          });
          console.warn('⚠️ Error en premios, pero banca actualizada:', premioError);
        }
      } else {
        logger.info('EDIT_BANCA', 'ℹ️ Sin cambios en premios, omitiendo');
      }
```

---

## 6. Componente de Indicador Visual

Crea: `/home/jorge/projects/LottoWebApp/src/components/common/UnsavedChangesIndicator.jsx`

```javascript
import React from 'react';

/**
 * Indicador visual de cambios sin guardar
 */
const UnsavedChangesIndicator = ({ changes, title = 'Cambios sin guardar' }) => {
  const changeCount = Object.keys(changes).length;

  if (changeCount === 0) return null;

  const changedFields = Object.values(changes)
    .map(c => c.displayName || c.fieldCode)
    .slice(0, 5); // Mostrar máximo 5

  return (
    <div
      className="unsaved-changes-banner"
      style={{
        backgroundColor: '#fff3cd',
        borderLeft: '4px solid #ffc107',
        padding: '12px 16px',
        marginBottom: '16px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <span style={{ fontSize: '20px' }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <strong>{title}</strong>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#856404' }}>
          {changeCount} campo(s) modificado(s):
          {' '}
          {changedFields.join(', ')}
          {changeCount > 5 && ` y ${changeCount - 5} más...`}
        </p>
      </div>
    </div>
  );
};

export default UnsavedChangesIndicator;
```

---

## 7. Usar el Indicador en EditBanca

En el JSX de EditBanca, añadir antes del formulario:

```javascript
import UnsavedChangesIndicator from './common/UnsavedChangesIndicator';

// ...

return (
  <div className="edit-banca-container">
    {/* ✨ NUEVO: Indicador de cambios sin guardar */}
    <UnsavedChangesIndicator
      changes={changedPrizeFields}
      title="Premios & Comisiones - Cambios sin guardar"
    />

    {/* Loading state para prize fields */}
    {prizeFieldsLoading && (
      <div className="alert alert-info">
        Cargando campos de premios...
      </div>
    )}

    {/* Error state */}
    {prizeFieldsError && (
      <div className="alert alert-warning">
        ⚠️ No se pudieron cargar los campos de premios.
        Algunas funcionalidades estarán limitadas.
      </div>
    )}

    {/* Formulario existente */}
    <form onSubmit={handleSubmit}>
      {/* ... resto del formulario ... */}
    </form>
  </div>
);
```

---

## 8. Botón de Guardar Mejorado

Reemplaza el botón de submit con:

```javascript
<button
  type="submit"
  className="btn btn-primary"
  disabled={loading || prizeFieldsLoading || !prizeFieldsReady}
  style={{
    position: 'relative',
    minWidth: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }}
>
  {loading ? (
    <>
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      />
      <span>Guardando...</span>
    </>
  ) : prizeChanged ? (
    <>
      <span>💾 Guardar Cambios</span>
      <span
        className="badge bg-warning text-dark"
        style={{
          fontSize: '11px',
          padding: '2px 6px',
          borderRadius: '10px'
        }}
      >
        {prizeChangeCount}
      </span>
    </>
  ) : (
    <>
      <span>✅ Sin cambios</span>
    </>
  )}
</button>
```

---

## 9. CSS Animations

Añade a `/home/jorge/projects/LottoWebApp/src/assets/css/FormStyles.css`:

```css
/* ============================================
   UNSAVED CHANGES INDICATOR
   ============================================ */

.unsaved-changes-banner {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================================
   LOADING SKELETON
   ============================================ */

.prize-fields-loading {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  height: 40px;
  border-radius: 4px;
  margin: 10px 0;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ============================================
   FIELD CHANGED HIGHLIGHT
   ============================================ */

.prize-field-changed {
  border-left: 3px solid #ffc107 !important;
  background-color: #fffbf0 !important;
  transition: all 0.3s ease;
}

.prize-field-changed:focus {
  border-left-color: #ff9800 !important;
  background-color: #fff9e6 !important;
}

/* ============================================
   SAVE BUTTON STATES
   ============================================ */

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary .badge {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
```

---

## 10. Performance Monitoring Component

Crea: `/home/jorge/projects/LottoWebApp/src/components/common/PerformanceMonitor.jsx`

```javascript
import React, { useEffect, useRef } from 'react';
import * as logger from '../../utils/logger';

/**
 * Componente para monitorear performance de operaciones
 * Uso: <PerformanceMonitor operation="prize-save" enabled={true} />
 */
const PerformanceMonitor = ({ operation, enabled = true, children }) => {
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Iniciar timing
    startTimeRef.current = performance.now();
    performance.mark(`${operation}-start`);

    return () => {
      // Finalizar timing
      if (startTimeRef.current) {
        const endTime = performance.now();
        const duration = endTime - startTimeRef.current;

        performance.mark(`${operation}-end`);
        performance.measure(
          operation,
          `${operation}-start`,
          `${operation}-end`
        );

        logger.info('PERFORMANCE', `⏱️ ${operation}`, {
          duration: `${duration.toFixed(2)}ms`
        });

        // Alerta si es muy lento
        if (duration > 1000) {
          console.warn(
            `⚠️ ${operation} took longer than 1s: ${duration.toFixed(2)}ms`
          );
        }
      }
    };
  }, [operation, enabled]);

  return children || null;
};

export default PerformanceMonitor;

/**
 * Hook alternativo para usar sin componente
 */
export const usePerformanceMonitor = (operationName) => {
  const startTimeRef = useRef(null);

  const start = () => {
    startTimeRef.current = performance.now();
    performance.mark(`${operationName}-start`);
  };

  const end = (metadata = {}) => {
    if (!startTimeRef.current) return;

    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;

    performance.mark(`${operationName}-end`);
    performance.measure(
      operationName,
      `${operationName}-start`,
      `${operationName}-end`
    );

    logger.info('PERFORMANCE', `⏱️ ${operationName}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...metadata
    });

    startTimeRef.current = null;
    return duration;
  };

  return { start, end };
};
```

Uso en EditBanca:

```javascript
import { usePerformanceMonitor } from './common/PerformanceMonitor';

const EditBanca = () => {
  const performanceTracker = usePerformanceMonitor('prize-save');

  const handleSubmit = async (e) => {
    e.preventDefault();

    performanceTracker.start();

    try {
      // ... código de guardado ...

      performanceTracker.end({
        changedFields: prizeChangeCount,
        totalFields: 168
      });

    } catch (error) {
      performanceTracker.end({ error: true });
    }
  };
};
```

---

## 11. Service con PATCH Endpoint

Actualiza `/home/jorge/projects/LottoWebApp/src/services/prizeFieldService.js`:

```javascript
/**
 * OPTIMIZED: Actualizar configuración usando PATCH (UPSERT)
 * @param {number} bettingPoolId - ID de la banca
 * @param {Array} prizeConfigs - Array de configuraciones modificadas
 * @returns {Promise<Object>} Respuesta con detalles de la actualización
 */
export const updateBancaPrizeConfig = async (bettingPoolId, prizeConfigs) => {
  try {
    console.log(`🔄 [PRIZE SERVICE] PATCH /betting-pools/${bettingPoolId}/prize-config`, {
      count: prizeConfigs.length,
      fields: prizeConfigs.map(c => c.fieldCode)
    });

    const startTime = performance.now();

    const response = await api.patch(
      `/betting-pools/${bettingPoolId}/prize-config`,
      { prizeConfigs }
    );

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    console.log(`✅ [PRIZE SERVICE] Updated in ${duration}ms`, response);

    return response.data;

  } catch (error) {
    console.error(`❌ [PRIZE SERVICE] Error updating:`, error);

    // Fallback a método legacy si PATCH no disponible
    if (error.response?.status === 404 || error.response?.status === 405) {
      console.warn('⚠️ PATCH endpoint not available, using legacy method');

      await deleteBancaPrizeConfig(bettingPoolId);

      if (prizeConfigs.length > 0) {
        await saveBancaPrizeConfig(bettingPoolId, prizeConfigs);
      }

      return { success: true, method: 'legacy' };
    }

    throw error;
  }
};
```

---

## 12. Feature Flag Configuration

Crea: `/home/jorge/projects/LottoWebApp/src/config/features.js`

```javascript
/**
 * Feature flags para activar/desactivar funcionalidades
 */
export const FEATURES = {
  // Usar endpoint PATCH para prize config (requiere backend actualizado)
  USE_PATCH_PRIZE_CONFIG: false, // ← Cambiar a true cuando backend esté listo

  // Mostrar indicador de cambios sin guardar
  SHOW_UNSAVED_CHANGES_INDICATOR: true,

  // Performance monitoring en consola
  ENABLE_PERFORMANCE_MONITORING: true,

  // Logs detallados de prize fields
  VERBOSE_PRIZE_LOGGING: false,

  // Optimistic updates (actualizar UI antes de confirmar servidor)
  ENABLE_OPTIMISTIC_UPDATES: false
};

/**
 * Helper para verificar si una feature está habilitada
 */
export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] === true;
};
```

Uso:

```javascript
import { FEATURES, isFeatureEnabled } from '../config/features';

// En EditBanca.jsx
if (isFeatureEnabled('USE_PATCH_PRIZE_CONFIG')) {
  await updateBancaPrizeConfig(id, prizeConfigs);
} else {
  await deleteBancaPrizeConfig(id);
  await saveBancaPrizeConfig(id, prizeConfigs);
}
```

---

## 13. Testing Utilities

Crea: `/home/jorge/projects/LottoWebApp/src/utils/testHelpers.js`

```javascript
/**
 * Utilidades para testing de performance
 */

/**
 * Medir tiempo de ejecución de una función
 */
export const measureExecutionTime = async (fn, label = 'Operation') => {
  const startTime = performance.now();

  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    console.log(`⏱️ ${label}: ${duration}ms`);

    return { result, duration: parseFloat(duration) };

  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    console.error(`❌ ${label} failed after ${duration}ms:`, error);

    throw error;
  }
};

/**
 * Comparar performance de dos implementaciones
 */
export const comparePerformance = async (fn1, fn2, label1 = 'Method 1', label2 = 'Method 2', iterations = 10) => {
  console.log(`\n🏁 Performance Comparison: ${label1} vs ${label2}`);
  console.log(`Running ${iterations} iterations each...\n`);

  // Warm up
  await fn1();
  await fn2();

  // Test fn1
  const times1 = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn1();
    times1.push(performance.now() - start);
  }

  // Test fn2
  const times2 = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn2();
    times2.push(performance.now() - start);
  }

  // Calculate stats
  const avg1 = times1.reduce((a, b) => a + b, 0) / iterations;
  const avg2 = times2.reduce((a, b) => a + b, 0) / iterations;
  const improvement = ((avg1 - avg2) / avg1) * 100;

  console.log(`${label1}: ${avg1.toFixed(2)}ms (avg)`);
  console.log(`${label2}: ${avg2.toFixed(2)}ms (avg)`);
  console.log(`\n${label2} is ${Math.abs(improvement).toFixed(1)}% ${improvement > 0 ? 'faster' : 'slower'}\n`);

  return { avg1, avg2, improvement };
};

/**
 * Verificar que los hooks no causan re-renders innecesarios
 */
export const trackRerenders = (componentName) => {
  let renderCount = 0;

  return () => {
    renderCount++;
    console.log(`🔄 ${componentName} rendered: ${renderCount} times`);
  };
};
```

Uso en tests:

```javascript
import { measureExecutionTime, comparePerformance } from '../utils/testHelpers';

// Test simple
const { result, duration } = await measureExecutionTime(
  () => savePrizeChanges(),
  'Save Prize Changes'
);

// Comparación
await comparePerformance(
  () => legacySave(),
  () => optimizedSave(),
  'Legacy DELETE+POST',
  'Optimized PATCH',
  10
);
```

---

## 14. Script de Migración

Crea: `/home/jorge/projects/LottoWebApp/migrate-to-optimized.sh`

```bash
#!/bin/bash

echo "🚀 Migrando EditBanca a versión optimizada..."

# Backup del archivo original
echo "📦 Creando backup..."
cp src/components/EditBanca.jsx src/components/EditBanca.jsx.backup

# Crear directorio de hooks si no existe
mkdir -p src/hooks
mkdir -p src/components/common
mkdir -p src/config

echo "✅ Backup creado: src/components/EditBanca.jsx.backup"

# Instrucciones
echo ""
echo "📝 Próximos pasos:"
echo "1. Copiar los hooks desde CODIGO_LISTO_PARA_COPIAR.md:"
echo "   - src/hooks/usePrizeFieldsCache.js"
echo "   - src/hooks/usePrizeFieldChanges.js"
echo ""
echo "2. Copiar el componente de indicador:"
echo "   - src/components/common/UnsavedChangesIndicator.jsx"
echo ""
echo "3. Actualizar EditBanca.jsx con los snippets del documento"
echo ""
echo "4. Copiar el CSS a src/assets/css/FormStyles.css"
echo ""
echo "5. Crear config/features.js"
echo ""
echo "6. Probar en development: npm run dev"
echo ""
echo "7. Si hay problemas, revertir:"
echo "   cp src/components/EditBanca.jsx.backup src/components/EditBanca.jsx"
echo ""
```

Dar permisos de ejecución:
```bash
chmod +x migrate-to-optimized.sh
```

---

## 15. Checklist de Implementación

```markdown
# ✅ Checklist de Implementación

## Preparación
- [ ] Hacer backup de EditBanca.jsx
- [ ] Crear branch git: `git checkout -b optimize/prize-fields`
- [ ] Leer documentación completa

## Fase 1: Hooks y Utilities
- [ ] Crear `src/hooks/usePrizeFieldsCache.js`
- [ ] Crear `src/hooks/usePrizeFieldChanges.js`
- [ ] Crear `src/components/common/UnsavedChangesIndicator.jsx`
- [ ] Crear `src/config/features.js`
- [ ] Crear `src/utils/testHelpers.js` (opcional)

## Fase 2: Actualizar EditBanca
- [ ] Añadir imports de nuevos hooks
- [ ] Añadir `usePrizeFieldsCache()` hook
- [ ] Añadir `usePrizeFieldChanges()` hook
- [ ] Reemplazar lógica de guardado (líneas 810-899)
- [ ] Añadir `UnsavedChangesIndicator` en JSX
- [ ] Actualizar botón de guardar

## Fase 3: CSS y Estilos
- [ ] Añadir animaciones a `FormStyles.css`
- [ ] Verificar que estilos se aplican correctamente

## Fase 4: Testing
- [ ] Verificar que prize fields se cargan solo una vez
- [ ] Verificar detección de cambios funciona
- [ ] Probar guardar 1 campo
- [ ] Probar guardar 10 campos
- [ ] Probar cambiar campo y volverlo al default
- [ ] Verificar que indicador visual aparece/desaparece

## Fase 5: Performance Testing
- [ ] Medir tiempo antes vs después
- [ ] Verificar network requests (debe ser 1 menos)
- [ ] Verificar logs en consola
- [ ] Benchmark con 50 campos modificados

## Fase 6: Backend (Opcional)
- [ ] Implementar endpoint PATCH en backend
- [ ] Actualizar prizeFieldService.js
- [ ] Cambiar feature flag: `USE_PATCH_PRIZE_CONFIG: true`
- [ ] Re-test con endpoint PATCH

## Fase 7: Deploy
- [ ] Code review
- [ ] Merge a develop
- [ ] Deploy a staging
- [ ] QA testing
- [ ] Deploy a production
- [ ] Monitor performance metrics

## Rollback Plan
Si algo sale mal:
```bash
git checkout src/components/EditBanca.jsx.backup src/components/EditBanca.jsx
git commit -m "Rollback: revert prize fields optimization"
```
```

---

## Resumen de Archivos a Crear

1. **Hooks:**
   - `/src/hooks/usePrizeFieldsCache.js`
   - `/src/hooks/usePrizeFieldChanges.js`

2. **Componentes:**
   - `/src/components/common/UnsavedChangesIndicator.jsx`
   - `/src/components/common/PerformanceMonitor.jsx` (opcional)

3. **Config:**
   - `/src/config/features.js`

4. **Utils:**
   - `/src/utils/testHelpers.js` (opcional)

5. **Actualizar:**
   - `/src/components/EditBanca.jsx`
   - `/src/services/prizeFieldService.js`
   - `/src/assets/css/FormStyles.css`

---

## Quick Start (5 minutos)

```bash
# 1. Crear backup
cp src/components/EditBanca.jsx src/components/EditBanca.jsx.backup

# 2. Crear directorios
mkdir -p src/hooks src/components/common src/config

# 3. Copiar archivos desde este documento
# (Usar tu editor favorito)

# 4. Verificar que todo compila
npm run dev

# 5. Probar en navegador
# Ir a http://localhost:4000 y editar una banca
```

¡Listo! Con estos archivos tienes todo lo necesario para implementar la optimización.
