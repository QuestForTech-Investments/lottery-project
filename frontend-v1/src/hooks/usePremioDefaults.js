/**
 * Custom Hook para cargar valores default de premios desde la API
 * SIMPLIFICADO: Retorna datos directamente sin conversión
 */

import { useState, useEffect } from 'react';
import { getPrizeFields } from '../services/prizeFieldService';

/**
 * Hook para cargar valores default de premios directamente desde la API
 * @param {Function} onDefaultsLoaded - Callback que recibe los datos de la API
 * @returns {Object} { loading, error, prizeFieldsData }
 */
export const usePremioDefaults = (onDefaultsLoaded) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prizeFieldsData, setPrizeFieldsData] = useState(null);

  useEffect(() => {
    const loadDefaults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar prize fields desde la API (retorna directamente)
        const prizeFields = await getPrizeFields();

        setPrizeFieldsData(prizeFields);

        // Llamar callback con los datos directos de la API
        if (onDefaultsLoaded) {
          onDefaultsLoaded(prizeFields);
        }

        console.log('✅ Valores default de premios cargados:', prizeFields);
      } catch (err) {
        console.error('❌ Error cargando valores default de premios:', err);
        setError(err.message || 'Error al cargar valores default');
      } finally {
        setLoading(false);
      }
    };

    loadDefaults();
  }, []); // Solo se ejecuta una vez al montar el componente

  return {
    loading,
    error,
    prizeFieldsData
  };
};

/**
 * Función helper para crear un objeto lookup por fieldCode
 * @param {Array} prizeFieldsData - Datos de la API con estructura:
 *   [{ betTypeCode, prizeFields: [{ fieldCode, fieldName, defaultMultiplier }] }]
 * @returns {Object} - Lookup object { fieldCode: { fieldName, defaultMultiplier, betTypeCode } }
 */
export const createFieldLookup = (prizeFieldsData) => {
  const lookup = {};

  if (!Array.isArray(prizeFieldsData)) {
    return lookup;
  }

  prizeFieldsData.forEach(betType => {
    const betTypeCode = betType.betTypeCode || betType.BetTypeCode;
    const prizeFields = betType.prizeFields || betType.PrizeFields || [];

    prizeFields.forEach(field => {
      const fieldCode = field.fieldCode || field.FieldCode;
      const fieldName = field.fieldName || field.FieldName;
      const defaultMultiplier = field.defaultMultiplier !== undefined
        ? field.defaultMultiplier
        : field.DefaultMultiplier;

      if (fieldCode) {
        lookup[fieldCode] = {
          fieldName,
          defaultMultiplier,
          betTypeCode
        };
      }
    });
  });

  return lookup;
};

/**
 * Función helper para agrupar campos por bet type
 * @param {Array} prizeFieldsData - Datos de la API
 * @returns {Object} - Campos agrupados por betTypeCode
 */
export const groupByBetType = (prizeFieldsData) => {
  const grouped = {};

  if (!Array.isArray(prizeFieldsData)) {
    return grouped;
  }

  prizeFieldsData.forEach(betType => {
    const betTypeCode = betType.betTypeCode || betType.BetTypeCode;
    grouped[betTypeCode] = betType.prizeFields || betType.PrizeFields || [];
  });

  return grouped;
};
