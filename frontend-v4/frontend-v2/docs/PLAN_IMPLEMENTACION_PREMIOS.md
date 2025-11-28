# PLAN DE IMPLEMENTACIÓN: Sistema de Premios y Comisiones

**Objetivo:** Conectar el frontend con el backend para cargar valores default y custom de premios.

**Tiempo estimado:** 10-15 horas
**Prioridad:** 🔴 ALTA

---

## 📋 PASO 1: Crear Mapeo de Campos ✅ PARCIAL

**Tiempo:** 3-4 horas
**Archivo:** `src/utils/prizeFieldMappings.js`

### Código a crear:

```javascript
/**
 * Mapeo entre códigos de bet_types de la API y nombres de campos del formulario
 * Este mapeo es necesario porque la API usa códigos como "DIRECTO_PRIMER_PAGO"
 * mientras que el formulario usa "pick3FirstPayment"
 */

export const BET_TYPE_TO_FORM_MAPPING = {
  // Pick 3 Straight (DIRECTO)
  'PICK_THREE_STRAIGHT': {
    apiCode: 'PICK_THREE_STRAIGHT',
    fields: {
      'PRIMER_PAGO': 'pick3FirstPayment',
      'SEGUNDO_PAGO': 'pick3SecondPayment',
      'TERCER_PAGO': 'pick3ThirdPayment',
      'DOBLES': 'pick3Doubles'
    }
  },

  // Pick 3 Super
  'PICK_THREE_BOX': {
    apiCode: 'PICK_THREE_BOX',
    fields: {
      'ALL_SEQUENCE': 'pick3SuperAllSequence',
      'PRIMER_PAGO': 'pick3SuperFirstPayment',
      'SEGUNDO_PAGO': 'pick3SuperSecondPayment',
      'TERCER_PAGO': 'pick3SuperThirdPayment'
    }
  },

  // Pick 3 NY
  'PICK_THREE_NY': {
    apiCode: 'PICK_THREE_NY',
    fields: {
      '3WAY_2IDENTICAL': 'pick3NY_3Way2Identical',
      '6WAY_3UNIQUE': 'pick3NY_6Way3Unique'
    }
  },

  // Pick 4
  'PICK_FOUR_STRAIGHT': {
    apiCode: 'PICK_FOUR_STRAIGHT',
    fields: {
      'PRIMER_PAGO': 'pick4FirstPayment',
      'SEGUNDO_PAGO': 'pick4SecondPayment'
    }
  },

  // Pick 4 Super
  'PICK_FOUR_BOX': {
    apiCode: 'PICK_FOUR_BOX',
    fields: {
      'ALL_SEQUENCE': 'pick4SuperAllSequence',
      'DOBLES': 'pick4SuperDoubles'
    }
  },

  // Pick 4 NY
  'PICK_FOUR_NY': {
    apiCode: 'PICK_FOUR_NY',
    fields: {
      'ALL_SEQUENCE': 'pick4NY_AllSequence',
      'DOBLES': 'pick4NY_Doubles'
    }
  },

  // Pick 4 Extra (Box variantes)
  'PICK_FOUR_BOX_24': {
    apiCode: 'PICK_FOUR_BOX_24',
    fields: {
      '24WAY_4UNIQUE': 'pick4_24Way4Unique'
    }
  },
  'PICK_FOUR_BOX_12': {
    apiCode: 'PICK_FOUR_BOX_12',
    fields: {
      '12WAY_2IDENTICAL': 'pick4_12Way2Identical'
    }
  },
  'PICK_FOUR_BOX_6': {
    apiCode: 'PICK_FOUR_BOX_6',
    fields: {
      '6WAY_2IDENTICAL': 'pick4_6Way2Identical'
    }
  },
  'PICK_FOUR_BOX_4': {
    apiCode: 'PICK_FOUR_BOX_4',
    fields: {
      '4WAY_3IDENTICAL': 'pick4_4Way3Identical'
    }
  },

  // Pick 5 variantes
  'PICK5_MEGA': {
    apiCode: 'PICK5_MEGA',
    fields: {
      'PRIMER_PAGO': 'pick5MegaFirstPayment'
    }
  },
  'PICK5_NY': {
    apiCode: 'PICK5_NY',
    fields: {
      'PRIMER_PAGO': 'pick5NYFirstPayment'
    }
  },
  'PICK5_BRONX': {
    apiCode: 'PICK5_BRONX',
    fields: {
      'PRIMER_PAGO': 'pick5BronxFirstPayment'
    }
  },
  'PICK5_BROOKLYN': {
    apiCode: 'PICK5_BROOKLYN',
    fields: {
      'PRIMER_PAGO': 'pick5BrooklynFirstPayment'
    }
  },
  'PICK5_QUEENS': {
    apiCode: 'PICK5_QUEENS',
    fields: {
      'PRIMER_PAGO': 'pick5QueensFirstPayment'
    }
  },
  'PICK5_EXTRA': {
    apiCode: 'PICK5_EXTRA',
    fields: {
      'PRIMER_PAGO': 'pick5FirstPayment'
    }
  },

  // Pick 5 Super
  'PICK5_SUPER': {
    apiCode: 'PICK5_SUPER',
    fields: {
      'ALL_SEQUENCE': 'pick5SuperAllSequence',
      'DOBLES': 'pick5SuperDoubles'
    }
  },

  // Pick 5 Super Extra (Box variantes)
  // ... continuar con todos los demás tipos ...

  // Lotto Classic
  'LOTTO_CLASSIC': {
    apiCode: 'LOTTO_CLASSIC',
    fields: {
      'PRIMER_PAGO': 'lottoClassicFirstPayment',
      'DOBLES': 'lottoClassicDoubles'
    }
  },

  // Lotto Plus
  'LOTTO_PLUS': {
    apiCode: 'LOTTO_PLUS',
    fields: {
      'PRIMER_PAGO': 'lottoPlusFirstPayment',
      'DOBLES': 'lottoPlusDoubles'
    }
  },

  // Mega Millions
  'MEGA_MILLIONS': {
    apiCode: 'MEGA_MILLIONS',
    fields: {
      'PRIMER_PAGO': 'megaMillionsFirstPayment',
      'DOBLES': 'megaMillionsDoubles'
    }
  },

  // Powerball - Primera Ronda
  'POWERBALL_FIRST': {
    apiCode: 'POWERBALL_FIRST',
    fields: {
      '4_NUMBERS': 'powerball4NumbersFirstRound',
      '3_NUMBERS': 'powerball3NumbersFirstRound',
      '2_NUMBERS': 'powerball2NumbersFirstRound',
      'LAST_NUMBER': 'powerballLastNumberFirstRound'
    }
  },

  // Powerball - Segunda Ronda
  'POWERBALL_SECOND': {
    apiCode: 'POWERBALL_SECOND',
    fields: {
      '4_NUMBERS': 'powerball4NumbersSecondRound',
      '3_NUMBERS': 'powerball3NumbersSecondRound',
      'LAST_2_NUMBERS': 'powerballLast2NumbersSecondRound',
      'LAST_NUMBER': 'powerballLastNumberSecondRound'
    }
  },

  // Powerball - Tercera Ronda
  'POWERBALL_THIRD': {
    apiCode: 'POWERBALL_THIRD',
    fields: {
      '4_NUMBERS': 'powerball4NumbersThirdRound',
      '3_NUMBERS': 'powerball3NumbersThirdRound',
      'LAST_2_NUMBERS': 'powerballLast2NumbersThirdRound',
      'LAST_NUMBER': 'powerballLastNumberThirdRound'
    }
  }
};

/**
 * Función auxiliar para encontrar el campo del formulario
 * basado en el código de campo de la API
 */
export const findFormFieldName = (betTypeCode, fieldCode) => {
  const mapping = BET_TYPE_TO_FORM_MAPPING[betTypeCode];
  if (!mapping) return null;

  // Buscar en los campos del mapeo
  for (const [apiFieldKey, formFieldName] of Object.entries(mapping.fields)) {
    if (fieldCode.includes(apiFieldKey)) {
      return formFieldName;
    }
  }

  return null;
};

/**
 * Mapea los bet types de la API a los campos del formulario
 * @param {Array} betTypes - Array de bet types con prizeFields de la API
 * @returns {Object} - Objeto con valores default para formData
 */
export const mapBetTypesToFormDefaults = async (betTypes) => {
  const formDefaults = {};

  for (const betType of betTypes) {
    if (!betType.prizeFields || betType.prizeFields.length === 0) {
      continue;
    }

    const mapping = BET_TYPE_TO_FORM_MAPPING[betType.betTypeCode];
    if (!mapping) {
      console.warn(`No mapping found for bet type: ${betType.betTypeCode}`);
      continue;
    }

    // Mapear cada prize field
    betType.prizeFields.forEach(field => {
      const formFieldName = findFormFieldName(betType.betTypeCode, field.fieldCode);
      if (formFieldName) {
        formDefaults[formFieldName] = field.defaultMultiplier;
      }
    });
  }

  return formDefaults;
};

/**
 * Mapea configuraciones custom a los campos del formulario
 * @param {Array} customConfigs - Array de configs custom de la API
 * @returns {Object} - Objeto con valores custom para formData
 */
export const mapCustomConfigsToForm = (customConfigs) => {
  const formCustoms = {};

  customConfigs.forEach(config => {
    // Aquí necesitarás mapear según el gameType
    // Por ejemplo: config.gameType = "DIRECTO" → mapear a pick3FirstPayment, etc.

    const mapping = BET_TYPE_TO_FORM_MAPPING[config.gameType];
    if (!mapping) return;

    // Mapear los 4 posibles valores
    if (config.prizePayment1 !== null && config.prizePayment1 !== undefined) {
      const field1 = mapping.fields['PRIMER_PAGO'];
      if (field1) formCustoms[field1] = config.prizePayment1;
    }

    if (config.prizePayment2 !== null && config.prizePayment2 !== undefined) {
      const field2 = mapping.fields['SEGUNDO_PAGO'];
      if (field2) formCustoms[field2] = config.prizePayment2;
    }

    if (config.prizePayment3 !== null && config.prizePayment3 !== undefined) {
      const field3 = mapping.fields['TERCER_PAGO'];
      if (field3) formCustoms[field3] = config.prizePayment3;
    }

    if (config.prizePayment4 !== null && config.prizePayment4 !== undefined) {
      const field4 = mapping.fields['DOBLES'];
      if (field4) formCustoms[field4] = config.prizePayment4;
    }
  });

  return formCustoms;
};

export default {
  BET_TYPE_TO_FORM_MAPPING,
  findFormFieldName,
  mapBetTypesToFormDefaults,
  mapCustomConfigsToForm
};
```

---

## 📋 PASO 2: Modificar useCompleteBettingPoolForm.js

**Tiempo:** 2-3 horas
**Archivo:** `src/components/CreateBettingPoolMUI/hooks/useCompleteBettingPoolForm.js`

### 2.1 Agregar imports

```javascript
import { getMergedPrizeData } from '@/services/prizeService';
import { mapBetTypesToFormDefaults } from '@/utils/prizeFieldMappings';
```

### 2.2 Modificar loadInitialData

```javascript
const loadInitialData = async () => {
  try {
    setLoadingZones(true);

    // Ejecutar todas las cargas en paralelo para mejor performance
    const [zonesResponse, codeData, prizeData] = await Promise.all([
      getActiveZones(),
      getNextBettingPoolCode(),
      getMergedPrizeData() // ⭐ NUEVO
    ]);

    // Procesar zonas
    if (zonesResponse.success && zonesResponse.data) {
      setZones(zonesResponse.data);
    }

    // Procesar código de banca
    let initialFormData = { ...getInitialFormData() };
    if (codeData && codeData.nextCode) {
      initialFormData.branchCode = codeData.nextCode;
    }

    // ⭐ NUEVO: Procesar premios default
    if (prizeData && prizeData.betTypes) {
      const prizeDefaults = await mapBetTypesToFormDefaults(prizeData.betTypes);
      initialFormData = { ...initialFormData, ...prizeDefaults };
    }

    setFormData(initialFormData);

  } catch (error) {
    console.error('Error loading initial data:', error);
    setErrors({ submit: 'Error cargando datos iniciales' });
  } finally {
    setLoadingZones(false);
  }
};
```

---

## 📋 PASO 3: Agregar Modo Edición

**Tiempo:** 2-3 horas
**Archivo:** `src/components/CreateBettingPoolMUI/hooks/useCompleteBettingPoolForm.js`

### 3.1 Modificar hook signature

```javascript
const useCompleteBettingPoolForm = (editMode = false, bettingPoolId = null) => {
  // ... estado existente ...

  /**
   * Load betting pool data for editing
   */
  const loadBettingPoolData = async (poolId) => {
    try {
      setLoading(true);

      // Cargar en paralelo
      const [poolData, prizeData] = await Promise.all([
        getBettingPoolById(poolId),
        getMergedPrizeData(poolId) // ⭐ Con poolId para obtener customs
      ]);

      // Mapear datos de la banca
      let editFormData = {
        ...getInitialFormData(),
        bettingPoolName: poolData.bettingPoolName,
        branchCode: poolData.bettingPoolCode,
        zoneId: poolData.zoneId,
        // ... mapear todos los campos de poolData ...
      };

      // ⭐ Mapear premios (custom > default)
      if (prizeData) {
        const prizeDefaults = await mapBetTypesToFormDefaults(prizeData.betTypes);
        const prizeCustoms = mapCustomConfigsToForm(prizeData.customConfigs);

        // Merge: customs sobrescriben defaults
        editFormData = {
          ...editFormData,
          ...prizeDefaults,
          ...prizeCustoms // ⭐ Precedencia: custom > default
        };
      }

      setFormData(editFormData);

    } catch (error) {
      console.error('Error loading betting pool data:', error);
      setErrors({ submit: 'Error cargando datos de la banca' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load data based on mode (create vs edit)
   */
  useEffect(() => {
    if (editMode && bettingPoolId) {
      loadBettingPoolData(bettingPoolId);
    } else {
      loadInitialData();
    }
  }, [editMode, bettingPoolId]);

  return {
    formData,
    loading,
    loadingZones,
    errors,
    success,
    zones,
    activeTab,
    handleChange,
    handleTabChange,
    handleSubmit,
    copyScheduleToAll,
  };
};

export default useCompleteBettingPoolForm;
```

### 3.2 Modificar componente CreateBettingPoolMUI

```javascript
// En CreateBettingPoolMUI/index.jsx
const CreateBettingPoolMUI = () => {
  const {
    formData,
    loading,
    // ... resto de props
  } = useCompleteBettingPoolForm(false, null); // ⭐ Modo creación

  // ... resto del componente
};
```

### 3.3 Modificar componente EditBettingPoolMUI

```javascript
// En EditBettingPoolMUI/index.jsx
import { useParams } from 'react-router-dom';

const EditBettingPoolMUI = () => {
  const { id } = useParams();

  const {
    formData,
    loading,
    // ... resto de props
  } = useCompleteBettingPoolForm(true, parseInt(id)); // ⭐ Modo edición

  // ... resto del componente
};
```

---

## 📋 PASO 4: Agregar Validaciones

**Tiempo:** 2-3 horas
**Archivo:** `src/utils/prizeValidations.js`

### Código a crear:

```javascript
/**
 * Validaciones para campos de premios
 */

import { getAllBetTypes } from '@/services/prizeService';

// Cache de información de prize fields
let prizeFieldsCache = null;

/**
 * Carga información de prize fields desde la API
 */
export const loadPrizeFieldsInfo = async () => {
  if (prizeFieldsCache) return prizeFieldsCache;

  try {
    const betTypes = await getAllBetTypes();
    prizeFieldsCache = {};

    betTypes.forEach(betType => {
      if (betType.prizeFields) {
        betType.prizeFields.forEach(field => {
          prizeFieldsCache[field.fieldCode] = {
            min: field.minMultiplier,
            max: field.maxMultiplier,
            default: field.defaultMultiplier,
            fieldName: field.fieldName
          };
        });
      }
    });

    return prizeFieldsCache;
  } catch (error) {
    console.error('Error loading prize fields info:', error);
    return {};
  }
};

/**
 * Valida un campo de premio
 */
export const validatePrizeField = (fieldName, value, prizeFieldInfo) => {
  // Si no hay valor, es válido (campo opcional)
  if (!value || value === '') return null;

  const numValue = parseFloat(value);

  // Validar que sea un número
  if (isNaN(numValue)) {
    return 'Debe ser un número válido';
  }

  // Validar contra mínimo
  if (prizeFieldInfo && numValue < prizeFieldInfo.min) {
    return `Valor mínimo: ${prizeFieldInfo.min}`;
  }

  // Validar contra máximo
  if (prizeFieldInfo && numValue > prizeFieldInfo.max) {
    return `Valor máximo: ${prizeFieldInfo.max}`;
  }

  return null; // Sin errores
};

/**
 * Valida todos los campos de premios del formulario
 */
export const validateAllPrizeFields = async (formData) => {
  const prizeFieldsInfo = await loadPrizeFieldsInfo();
  const errors = {};

  // Campos de premios (todos los que empiezan con pick, lotto, mega, powerball)
  const prizeFieldNames = Object.keys(formData).filter(key =>
    key.startsWith('pick') ||
    key.startsWith('lotto') ||
    key.startsWith('mega') ||
    key.startsWith('powerball')
  );

  prizeFieldNames.forEach(fieldName => {
    const value = formData[fieldName];
    // Aquí necesitarás mapear fieldName → fieldCode de la API
    // Por ahora, validación básica
    const error = validatePrizeField(fieldName, value, { min: 0, max: 10000 });
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

export default {
  loadPrizeFieldsInfo,
  validatePrizeField,
  validateAllPrizeFields
};
```

### Integrar en handleChange

```javascript
import { validatePrizeField } from '@/utils/prizeValidations';

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  // Limpiar error anterior
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: null }));
  }

  // ⭐ NUEVO: Validar campos de premio
  if (name.startsWith('pick') || name.startsWith('lotto') ||
      name.startsWith('mega') || name.startsWith('powerball')) {

    const error = validatePrizeField(name, value, { min: 0, max: 10000 });
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }

  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : (value === '' && name === 'limitPreference' ? null : value)
  }));
};
```

---

## 📋 PASO 5: Testing

**Tiempo:** 2-3 horas

### 5.1 Corregir test existente

**Archivo:** `tests/prizes-commissions-system.spec.js`

Cambiar:
```javascript
await page.goto('http://localhost:4000/bettingPools/new');
```

Por:
```javascript
await page.goto('http://localhost:4000/betting-pools/new');
```

### 5.2 Agregar test de integración

```javascript
test('INTEGRACIÓN: Cargar valores default al crear banca', async ({ page }) => {
  await page.goto('http://localhost:4000/betting-pools/new');
  await page.waitForLoadState('networkidle');

  // Ir al tab de premios
  const prizesTab = page.locator('button').filter({ hasText: 'Premios' });
  await prizesTab.click();
  await page.waitForTimeout(1000);

  // Verificar que los campos tienen valores default (no vacíos)
  const pick3FirstPayment = await page.inputValue('input[name="pick3FirstPayment"]');

  expect(parseFloat(pick3FirstPayment)).toBeGreaterThan(0);
  expect(parseFloat(pick3FirstPayment)).toBe(56.0); // Valor default de la BD

  console.log(`✓ Campo cargado con valor default: ${pick3FirstPayment}`);
});
```

---

## 📋 PASO 6: Documentación

**Tiempo:** 1 hora

### 6.1 Actualizar README.md

Agregar sección:

```markdown
### Sistema de Premios y Comisiones

El sistema carga automáticamente valores default desde la base de datos:

- **Crear banca:** Campos pre-llenados con valores default
- **Editar banca:** Carga valores custom si existen, sino usa defaults
- **Precedencia:** custom > default
- **Validaciones:** Automáticas contra min/max de la BD

#### Archivos involucrados:
- `src/services/prizeService.js` - API calls
- `src/utils/prizeFieldMappings.js` - Mapeo bet_types → form
- `src/utils/prizeValidations.js` - Validaciones
- `src/components/CreateBettingPoolMUI/hooks/useCompleteBettingPoolForm.js` - Lógica principal
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] **Paso 1:** Crear `prizeFieldMappings.js`
  - [ ] Definir todos los mapeos bet_types → form
  - [ ] Función `mapBetTypesToFormDefaults()`
  - [ ] Función `mapCustomConfigsToForm()`

- [ ] **Paso 2:** Modificar `useCompleteBettingPoolForm.js`
  - [ ] Importar prizeService y mappings
  - [ ] Modificar `loadInitialData()` para cargar defaults
  - [ ] Agregar loading state para premios

- [ ] **Paso 3:** Agregar modo edición
  - [ ] Crear función `loadBettingPoolData()`
  - [ ] Modificar hook signature para accept mode/id
  - [ ] Actualizar componentes Create y Edit

- [ ] **Paso 4:** Agregar validaciones
  - [ ] Crear `prizeValidations.js`
  - [ ] Integrar en `handleChange()`
  - [ ] Mostrar errores en UI

- [ ] **Paso 5:** Testing
  - [ ] Corregir rutas en tests existentes
  - [ ] Agregar tests de integración
  - [ ] Verificar en diferentes escenarios

- [ ] **Paso 6:** Documentación
  - [ ] Actualizar README
  - [ ] Comentar código
  - [ ] Crear guía de uso

---

## 🎯 CRITERIOS DE ÉXITO

1. ✅ Al crear banca, campos de premios muestran valores default (ej: 56, 12, 4)
2. ✅ Al editar banca con configs custom, muestra valores custom
3. ✅ Al editar banca sin configs custom, muestra valores default
4. ✅ Validaciones funcionan (min/max)
5. ✅ No hay errores en consola
6. ✅ Tests pasan correctamente
7. ✅ Performance aceptable (<2s carga inicial)

---

## 📦 ENTREGABLES

1. ✅ `src/utils/prizeFieldMappings.js`
2. ✅ `src/utils/prizeValidations.js`
3. ✅ `src/components/CreateBettingPoolMUI/hooks/useCompleteBettingPoolForm.js` (modificado)
4. ✅ `tests/prizes-commissions-system.spec.js` (corregido)
5. ✅ Documentación actualizada

---

**Inicio estimado:** Inmediato
**Fin estimado:** 10-15 horas después
**Responsable:** Equipo de desarrollo frontend
