import React, { useState, useRef, useEffect } from 'react';
import '../../assets/css/PremiosComisiones.css';
import { getLotteries, getAllLotteries, getBetTypesByLottery } from '../../services/lotteryService';
import { getBancaPrizeConfig, getPrizeFields } from '../../services/prizeFieldService';

/**
 * Orden específico de las loterías según requerimiento del usuario
 * NOTA: Estos son los nombres EXACTOS que están en la base de datos (después del rename)
 */
const LOTTERY_ORDER = [
  'LA PRIMERA',               // 1
  'NEW YORK DAY',             // 2
  'NEW YORK NIGHT',           // 3
  'FLORIDA AM',               // 4
  'FLORIDA PM',               // 5
  'GANA MAS',                 // 6
  'NACIONAL',                 // 7
  'QUINIELA PALE',            // 8
  'REAL',                     // 9
  'LOTEKA',                   // 10
  'FL PICK2 AM',              // 11
  'FL PICK2 PM',              // 12
  'GEORGIA-MID AM',           // 13
  'GEORGIA EVENING',          // 14
  'GEORGIA NIGHT',            // 15
  'NEW JERSEY AM',            // 16
  'NEW JERSEY PM',            // 17
  'CONNECTICUT AM',           // 18
  'CONNECTICUT PM',           // 19
  'CALIFORNIA AM',            // 20
  'CALIFORNIA PM',            // 21
  'CHICAGO AM',               // 22
  'CHICAGO PM',               // 23
  'PENN MIDDAY',              // 24
  'PENN EVENING',             // 25
  'INDIANA MIDDAY',           // 26
  'INDIANA EVENING',          // 27
  'DIARIA 11AM',              // 28
  'DIARIA 3PM',               // 29
  'DIARIA 9PM',               // 30
  'SUPER PALE TARDE',         // 31
  'SUPER PALE NOCHE',         // 32
  'SUPER PALE NY-FL AM',      // 33
  'SUPER PALE NY-FL PM',      // 34
  'TEXAS MORNING',            // 35
  'TEXAS DAY',                // 36
  'TEXAS EVENING',            // 37
  'TEXAS NIGHT',              // 38
  'VIRGINIA AM',              // 39
  'VIRGINIA PM',              // 40
  'SOUTH CAROLINA AM',        // 41
  'SOUTH CAROLINA PM',        // 42
  'MARYLAND MIDDAY',          // 43
  'MARYLAND EVENING',         // 44
  'MASS AM',                  // 45
  'MASS PM',                  // 46
  'LA SUERTE',                // 47
  'NORTH CAROLINA AM',        // 48
  'NORTH CAROLINA PM',        // 49
  'LOTEDOM',                  // 50
  'NY AM 6x1',                // 51
  'NY PM 6x1',                // 52
  'FL AM 6X1',                // 53
  'FL PM 6X1',                // 54
  'King Lottery AM',          // 55
  'King Lottery PM',          // 56
  'L.E. PUERTO RICO 2PM',     // 57
  'L.E. PUERTO RICO 10PM',    // 58
  'DELAWARE AM',              // 59
  'DELAWARE PM',              // 60
  'Anguila 1pm',              // 61
  'Anguila 6PM',              // 62
  'Anguila 9pm',              // 63
  'Anguila 10am',             // 64
  'LA CHICA',                 // 65
  'LA PRIMERA 8PM',           // 66
  'PANAMA MIERCOLES',         // 67
  'PANAMA DOMINGO',           // 68
  'LA SUERTE 6:00pm'          // 69
];

/**
 * Componente para el tab "Premios & Comisiones"
 * Implementa 3 niveles de navegación:
 * - Nivel 1: Tab principal (ya existe en CreateBanca)
 * - Nivel 2: Sub-tabs (Premios, Comisiones, Comisiones 2)
 * - Nivel 3: Tabs de loterías (70 loterías)
 */
const PremiosComisionesTab = ({ formData, onChange, error, success, bancaId, onPrizeValuesLoaded, loadLotterySpecificValues }) => {
  const [activeSubTab, setActiveSubTab] = useState('premios');
  const [activeLottery, setActiveLottery] = useState('general');
  const [lotteries, setLotteries] = useState([]);
  const [loadingLotteries, setLoadingLotteries] = useState(true);
  const [lotteryError, setLotteryError] = useState(null);
  const lotteryTabsRef = useRef(null);

  // Estados para filtrado dinámico de bet types por lotería
  const [betTypes, setBetTypes] = useState([]);
  const [loadingBetTypes, setLoadingBetTypes] = useState(true);
  const [betTypesError, setBetTypesError] = useState(null);

  // Estado para valores "general" (usados como fallback)
  const [generalValues, setGeneralValues] = useState({});

  // Cargar loterías desde la API al montar el componente
  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        setLoadingLotteries(true);
        setLotteryError(null);

        // Cargar TODAS las loterías (no solo la primera página)
        const response = await getLotteries({ isActive: true, loadAll: true });

        if (response.items && Array.isArray(response.items)) {
          // Transformar los datos de la API al formato esperado
          const apiLotteries = response.items.map(lottery => ({
            id: `lottery_${lottery.lotteryId}`,
            name: lottery.lotteryName,
            lotteryId: lottery.lotteryId,
            type: lottery.lotteryType
          }));

          // Ordenar según LOTTERY_ORDER
          const sortedLotteries = LOTTERY_ORDER
            .map(orderName => apiLotteries.find(lottery => lottery.name === orderName))
            .filter(lottery => lottery !== undefined);

          // Agregar loterías que no están en el orden específico al final
          const unorderedLotteries = apiLotteries.filter(
            lottery => !LOTTERY_ORDER.includes(lottery.name)
          );

          const formattedLotteries = [
            { id: 'general', name: 'General' }, // Siempre incluir "General" primero
            ...sortedLotteries,
            ...unorderedLotteries
          ];

          console.log(`✅ Loterías cargadas: ${formattedLotteries.length} (${sortedLotteries.length} ordenadas + ${unorderedLotteries.length} sin orden)`);

          setLotteries(formattedLotteries);
        } else {
          throw new Error('No se pudieron cargar las loterías');
        }
      } catch (err) {
        console.error('Error cargando loterías:', err);
        setLotteryError(err.message);

        // Usar loterías por defecto en caso de error
        setLotteries([
          { id: 'general', name: 'General' },
          { id: 'laPrimera', name: 'LA PRIMERA' },
          { id: 'newYorkDay', name: 'NEW YORK DAY' }
        ]);
      } finally {
        setLoadingLotteries(false);
      }
    };

    fetchLotteries();
  }, []);

  // Cargar tipos de premios dinámicamente según la lotería activa
  useEffect(() => {
    const loadBetTypes = async () => {
      try {
        setLoadingBetTypes(true);
        setBetTypesError(null);

        let betTypesData;

        if (activeLottery === 'general') {
          // Para "General", cargar TODOS los tipos
          console.log('📋 Cargando todos los tipos de premios para General');
          betTypesData = await getPrizeFields();
        } else {
          // Para lotería específica, cargar solo tipos compatibles
          const lotteryId = parseInt(activeLottery.replace('lottery_', ''));
          console.log(`🎯 Cargando tipos de premios filtrados para lotería ID: ${lotteryId}`);

          const response = await getBetTypesByLottery(lotteryId);
          betTypesData = response.data;
        }

        console.log(`✅ Tipos de premios cargados: ${betTypesData.length} para ${activeLottery}`);
        setBetTypes(betTypesData);

        // NO llamar a onPrizeValuesLoaded aquí - solo debe llamarse en la carga inicial de valores guardados
      } catch (err) {
        console.error('❌ Error cargando tipos de premios:', err);
        setBetTypesError(err.message || 'Error al cargar tipos de premios');

        // En caso de error, intentar cargar todos los tipos como fallback
        try {
          console.log('⚠️ Usando fallback: cargando todos los tipos de premios');
          const fallback = await getPrizeFields();
          setBetTypes(fallback);
        } catch (fallbackErr) {
          console.error('❌ Error en fallback:', fallbackErr);
          setBetTypes([]);
        }
      } finally {
        setLoadingBetTypes(false);
      }
    };

    loadBetTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLottery]); // Solo se ejecuta cuando cambia activeLottery, NO cuando cambia onPrizeValuesLoaded

  // 🔥 NEW: Load lottery-specific values when switching to a lottery tab
  useEffect(() => {
    // Only load if:
    // 1. We're editing (bancaId exists)
    // 2. We have the load function
    // 3. We're on a specific lottery tab (not general)
    if (bancaId && loadLotterySpecificValues && activeLottery !== 'general' && activeLottery.startsWith('lottery_')) {
      const lotteryId = parseInt(activeLottery.split('_')[1]);
      console.log(`🎯 [V1] Tab changed to lottery ${lotteryId}, loading specific values...`);

      loadLotterySpecificValues(lotteryId)
        .then(lotteryValues => {
          if (Object.keys(lotteryValues).length > 0) {
            console.log(`✅ [V1] Loaded lottery values, updating form data...`);
            // Merge lottery-specific values into formData
            Object.keys(lotteryValues).forEach(key => {
              onChange({
                target: {
                  name: key,
                  value: lotteryValues[key]
                }
              });
            });
          }
        })
        .catch(error => {
          console.error(`❌ [V1] Error loading lottery-specific values:`, error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLottery, bancaId]);

  // Cargar valores "general" una sola vez (para usar como fallback)
  useEffect(() => {
    const loadGeneralDefaults = async () => {
      try {
        console.log('📋 Cargando valores "general" para usar como fallback...');
        const prizeFields = await getPrizeFields();

        if (prizeFields && Array.isArray(prizeFields)) {
          const generalVals = {};

          prizeFields.forEach(betType => {
            const prizeFieldsArray = betType.prizeFields || betType.PrizeFields || [];

            prizeFieldsArray.forEach(field => {
              const fieldCode = field.fieldCode || field.FieldCode;
              const defaultMultiplier = field.defaultMultiplier !== undefined
                ? field.defaultMultiplier
                : field.DefaultMultiplier;

              if (fieldCode && defaultMultiplier !== undefined) {
                // ✅ FIX: fieldCode ya incluye betType, no duplicar
                // Formato: general_{fieldCode}
                const key = `general_${fieldCode}`;
                generalVals[key] = defaultMultiplier;
              }
            });
          });

          console.log(`✅ Valores "general" cargados: ${Object.keys(generalVals).length} campos`);
          setGeneralValues(generalVals);
        }
      } catch (error) {
        console.error('❌ Error cargando valores general:', error);
      }
    };

    loadGeneralDefaults();
  }, []);

  // Cargar valores guardados de la banca (solo valores personalizados)
  useEffect(() => {
    if (!bancaId) return;

    const loadSavedValues = async () => {
      try {
        console.log('📥 [FALLBACK] Cargando valores personalizados de banca:', bancaId);
        const savedConfig = await getBancaPrizeConfig(bancaId);

        if (savedConfig && savedConfig.length > 0) {
          console.log('✅ Valores personalizados encontrados:', savedConfig.length, 'configuraciones');

          // Aplicar solo los valores guardados (personalizados)
          savedConfig.forEach(config => {
            // ✅ FIX: fieldCode ya viene en formato correcto desde la API
            // Formato: "DIRECTO_PRIMER_PAGO" (completo, con betType incluido)
            // NO duplicar el betTypeCode
            const fieldCode = config.fieldCode; // "DIRECTO_PRIMER_PAGO"

            // Construir key en formato: general_{fieldCode}
            const key = `general_${fieldCode}`;

            console.log(`🔵 [V1 LOAD] API fieldCode: ${config.fieldCode}`);
            console.log(`🔵 [V1 LOAD] Construyendo key: ${key}`);
            console.log(`🔵 [V1 LOAD] Valor a aplicar: ${config.customValue}`);

            onChange({ target: { name: key, value: config.customValue } });
          });
        } else {
          console.log('ℹ️ No hay valores personalizados - se usarán valores de "general" (fallback)');
        }

        // Notificar al padre
        console.log('🔥 [FALLBACK] Notificando que valores están listos');
        if (onPrizeValuesLoaded) {
          setTimeout(() => {
            onPrizeValuesLoaded();
          }, 150);
        }
      } catch (error) {
        console.error('❌ Error cargando valores:', error.message);
        if (onPrizeValuesLoaded) {
          setTimeout(() => {
            onPrizeValuesLoaded();
          }, 100);
        }
      }
    };

    loadSavedValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bancaId]);

  // NOTA: Con sistema de fallback, ya NO copiamos valores de "general" a loterías específicas
  // Los valores de "general" se usan automáticamente si no hay valor específico

  // Función para hacer scroll a la izquierda
  const scrollLeft = () => {
    if (lotteryTabsRef.current) {
      lotteryTabsRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  // Función para hacer scroll a la derecha
  const scrollRight = () => {
    if (lotteryTabsRef.current) {
      lotteryTabsRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const renderSubTabContent = () => {
    if (activeSubTab === 'premios') {
      return renderPremiosContent();
    } else if (activeSubTab === 'comisiones') {
      return renderComisionesContent();
    } else if (activeSubTab === 'comisiones2') {
      return renderComisiones2Content();
    }
  };

  const renderPremiosContent = () => {
    // Renderizar campos de premios según la lotería activa
    return (
      <div className="premios-fields-container">
        <div className="lottery-info-header">
          <h3>Configuración de Premios - {lotteries.find(l => l.id === activeLottery)?.name}</h3>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
            {loadingBetTypes ? 'Cargando tipos de premios...' : `${betTypes.length} tipos de premios disponibles`}
          </p>
        </div>

        {loadingBetTypes ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Cargando tipos de premios...
          </div>
        ) : betTypesError ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f' }}>
            Error: {betTypesError}
          </div>
        ) : betTypes.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No hay tipos de premios configurados para esta lotería
          </div>
        ) : (
          <div className="premios-grid">
            {betTypes.map((betType) => {
              // Obtener bet_type_code (puede venir en diferentes formatos)
              const betTypeCode = betType.betTypeCode || betType.bet_type_code || betType.BetTypeCode || '';
              const betTypeName = betType.betTypeName || betType.bet_type_name || betType.BetTypeName || betTypeCode;
              const prizeFields = betType.prizeFields || betType.PrizeFields || [];

              if (!betTypeCode || prizeFields.length === 0) {
                return null;
              }

              // Convertir bet_type_code a camelCase para los nombres de campos
              // Ejemplo: "DIRECTO" -> "directo", "CASH3 STRAIGHT" -> "cash3Straight"
              const betTypeFieldName = betTypeCode
                .toLowerCase()
                .split(' ')
                .map((word, index) =>
                  index === 0
                    ? word
                    : word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join('');

              return (
                <div key={betTypeCode} className="premio-group">
                  <h4 className="premio-group-title">{betTypeName.toUpperCase()}</h4>
                  {prizeFields.map((field, fieldIndex) => {
                    const fieldCode = field.fieldCode || field.FieldCode || '';
                    const fieldName = field.fieldName || field.FieldName || fieldCode;
                    const defaultMultiplier = field.defaultMultiplier !== undefined
                      ? field.defaultMultiplier
                      : field.DefaultMultiplier !== undefined
                      ? field.DefaultMultiplier
                      : '';

                    if (!fieldCode) {
                      return null;
                    }

                    // ✅ FIX: Usar fieldCode completo (ya incluye betTypeCode)
                    // Formato: {lotteryId}_{fieldCode}
                    // Ejemplo: "general_DIRECTO_PRIMER_PAGO" (NO duplicar betTypeCode)
                    const inputName = `${activeLottery}_${fieldCode}`;
                    const generalKey = `general_${fieldCode}`;

                    // Debug: Log de primer campo para verificar formato
                    if (fieldIndex === 0 && activeLottery === 'general') {
                      console.log(`🟢 [V1 RENDER] BetType: ${betTypeCode}, FieldCode: ${fieldCode}`);
                      console.log(`🟢 [V1 RENDER] InputName generado: ${inputName}`);
                      console.log(`🟢 [V1 RENDER] GeneralKey: ${generalKey}`);
                    }

                    // Lógica de fallback:
                    // - Si es "general", usar formData[inputName]
                    // - Si es lotería específica:
                    //   - Si tiene valor propio (incluso si es ''), usarlo
                    //   - Si no está definido (undefined/null), usar valor de general como fallback
                    const currentValue = activeLottery === 'general'
                      ? formData[inputName]
                      : formData[inputName] !== undefined && formData[inputName] !== null
                        ? formData[inputName]
                        : generalValues[generalKey] || formData[generalKey] || '';

                    // Placeholder: mostrar valor de general si estamos en lotería específica
                    const placeholderText = activeLottery === 'general'
                      ? defaultMultiplier.toString()
                      : `${generalValues[generalKey] || formData[generalKey] || defaultMultiplier} (general)`;

                    return (
                      <div key={fieldCode} className="premio-field">
                        <label className="premio-label">{fieldName}</label>
                        <input
                          type="text"
                          name={inputName}
                          value={currentValue}
                          onChange={onChange}
                          onKeyPress={(e) => {
                            // Solo permitir números, punto decimal y teclas de control
                            if (!/[\d.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onInput={(e) => {
                            // Limpiar cualquier carácter que no sea número o punto decimal
                            e.target.value = e.target.value.replace(/[^\d.]/g, '');
                          }}
                          className="premio-input"
                          placeholder={placeholderText}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderComisionesContent = () => {
    return (
      <div className="comisiones-container">
        <div className="lottery-info-header">
          <h3>Configuración de Comisiones - {lotteries.find(l => l.id === activeLottery)?.name}</h3>
        </div>
        <p className="placeholder-text">
          Contenido del tab "Comisiones" - Por implementar en Fase 4
        </p>
      </div>
    );
  };

  const renderComisiones2Content = () => {
    return (
      <div className="comisiones2-container">
        <div className="lottery-info-header">
          <h3>Configuración de Comisiones 2 - {lotteries.find(l => l.id === activeLottery)?.name}</h3>
        </div>
        <p className="placeholder-text">
          Contenido del tab "Comisiones 2" - Por implementar en Fase 4
        </p>
      </div>
    );
  };

  return (
    <div className="premios-comisiones-tab-container">
      {/* Nivel 2: Sub-tabs (Premios, Comisiones, Comisiones 2) */}
      <div className="sub-tabs-container">
        <button
          type="button"
          className={`sub-tab ${activeSubTab === 'premios' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('premios')}
        >
          Premios
        </button>
        <button
          type="button"
          className={`sub-tab ${activeSubTab === 'comisiones' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('comisiones')}
        >
          Comisiones
        </button>
        <button
          type="button"
          className={`sub-tab ${activeSubTab === 'comisiones2' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('comisiones2')}
        >
          Comisiones 2
        </button>
      </div>

      {/* Nivel 3: Tabs de loterías (scroll horizontal) */}
      <div className="lottery-tabs-wrapper">
        {/* Botón scroll izquierda */}
        <button
          type="button"
          className="lottery-scroll-btn lottery-scroll-left"
          onClick={scrollLeft}
          aria-label="Scroll left"
          disabled={loadingLotteries}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Container de tabs con scroll */}
        <div className="lottery-tabs-container" ref={lotteryTabsRef}>
          {loadingLotteries ? (
            <div className="lottery-tab" style={{ cursor: 'default' }}>
              Cargando loterías...
            </div>
          ) : (
            lotteries.map((lottery) => (
              <button
                key={lottery.id}
                type="button"
                className={`lottery-tab ${activeLottery === lottery.id ? 'active' : ''}`}
                onClick={() => setActiveLottery(lottery.id)}
              >
                {lottery.name}
              </button>
            ))
          )}
        </div>

        {/* Botón scroll derecha */}
        <button
          type="button"
          className="lottery-scroll-btn lottery-scroll-right"
          onClick={scrollRight}
          aria-label="Scroll right"
          disabled={loadingLotteries}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Mensaje de error de carga de loterías */}
      {lotteryError && (
        <div className="error-message" style={{ marginTop: '10px' }}>
          Error al cargar loterías: {lotteryError}. Usando loterías por defecto.
        </div>
      )}

      {/* Contenido del sub-tab activo */}
      <div className="sub-tab-content">
        {renderSubTabContent()}
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Botón de actualizar */}
      <div className="form-actions">
        <button type="submit" className="create-button">
          ACTUALIZAR
        </button>
      </div>
    </div>
  );
};

export default PremiosComisionesTab;
