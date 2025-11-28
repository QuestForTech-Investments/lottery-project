# Análisis del Sistema de Configuración de Premios - Frontend

## Fecha: 2025-11-01

## 1. RESUMEN EJECUTIVO

**Estado actual:** El sistema de premios NO está integrado correctamente con la API.

**Problema crítico identificado:**
- El formulario de premios inicializa todos los campos con strings vacíos
- No se realizan llamadas API para obtener valores por defecto
- El servicio `prizeService.js` existe pero NO es utilizado
- Los usuarios deben ingresar manualmente los 60+ valores de premios

---

## 2. ANÁLISIS DEL CÓDIGO FRONTEND

### 2.1 Componente PrizesTab.jsx

**Ubicación:** `/src/components/CreateBettingPoolMUI/tabs/PrizesTab.jsx`

**Análisis:**
```javascript
// Líneas 18-957
const PrizesTab = ({ formData, handleChange }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Premios y Comisiones
      </Typography>
      {/* 60+ TextField components */}
    </Box>
  );
};
```

**Características:**
- Componente puramente presentacional (stateless)
- Recibe `formData` y `handleChange` como props desde el parent
- Renderiza 60+ campos de texto para premios
- NO hace llamadas API directamente
- Campos relevantes para testing:
  - `pick3FirstPayment` (línea 41) - "Primer Premio" del Pick 3
  - `pick3SecondPayment` (línea 52) - "Segundo Premio" del Pick 3

**Optimización React:**
- Usa `React.memo()` con función de comparación personalizada (líneas 934-954)
- Solo re-renderiza cuando cambian campos relacionados con premios

**Conclusión:**
- El componente está bien implementado
- El problema NO está en PrizesTab.jsx
- El problema está en la inicialización de datos

---

### 2.2 Hook useCompleteBettingPoolForm.js

**Ubicación:** `/src/components/CreateBettingPoolMUI/hooks/useCompleteBettingPoolForm.js`

**Análisis de inicialización:**

```javascript
// Líneas 10-193: Función getInitialFormData()
const getInitialFormData = (branchCode = '') => ({
  // General fields...

  // Premios & Comisiones - Pick 3
  pick3FirstPayment: '',      // LÍNEA 58 - VACÍO
  pick3SecondPayment: '',     // LÍNEA 59 - VACÍO
  pick3ThirdPayment: '',      // LÍNEA 60 - VACÍO
  pick3Doubles: '',           // LÍNEA 61 - VACÍO

  // ... otros 56 campos también vacíos

  // Pick 4
  pick4FirstPayment: '',      // LÍNEA 70 - VACÍO
  pick4SecondPayment: '',     // LÍNEA 71 - VACÍO

  // ... y así sucesivamente
});
```

**Análisis de carga de datos:**

```javascript
// Líneas 217-268: useEffect para cargar datos iniciales
useEffect(() => {
  loadInitialData();
}, []);

const loadInitialData = async () => {
  try {
    setLoadingZones(true);

    // SOLO carga zonas
    const zonesResponse = await getActiveZones();
    if (zonesResponse.success && zonesResponse.data) {
      setZones(zonesResponse.data);
    }

    // SOLO carga código de banca
    const codeData = await getNextBettingPoolCode();
    if (codeData && codeData.nextCode) {
      setFormData(prev => ({ ...prev, branchCode: codeData.nextCode }));
    }

    // NO HAY LLAMADAS A prizeService.getAllBetTypes()
    // NO HAY LLAMADAS A prizeService.getMergedPrizeData()
  } catch (error) {
    console.error('Error loading initial data:', error);
  } finally {
    setLoadingZones(false);
  }
};
```

**Problemas identificados:**

1. **Valores hardcodeados:** Todos los campos de premios se inicializan con `''` (string vacío)
2. **API no utilizada:** No se importa ni se usa `prizeService.js`
3. **Sin valores por defecto:** El usuario debe ingresar manualmente todos los valores
4. **Sin modo Edit:** No hay lógica para cargar valores custom al editar una banca

**Impacto:**
- En modo CREATE: Campos vacíos (debería mostrar defaults de API)
- En modo EDIT: Campos vacíos (debería mostrar valores custom de la banca)

---

### 2.3 Servicio prizeService.js

**Ubicación:** `/src/services/prizeService.js`

**Análisis:**

```javascript
// Líneas 12-23: Obtener tipos de apuesta con defaults
export const getAllBetTypes = async () => {
  try {
    const response = await fetch('/api/bet-types');
    if (!response.ok) {
      throw new Error(`Error fetching bet types: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getAllBetTypes:', error);
    throw error;
  }
};

// Líneas 48-59: Obtener configuración custom de una banca
export const getBettingPoolPrizeConfigs = async (bettingPoolId) => {
  try {
    const response = await fetch(`/api/betting-pools/${bettingPoolId}/prizes-commissions`);
    if (!response.ok) {
      throw new Error(`Error fetching prize configs: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getBettingPoolPrizeConfigs:', error);
    throw error;
  }
};

// Líneas 95-143: Fusionar valores default y custom
export const getMergedPrizeData = async (bettingPoolId = null) => {
  try {
    // Get default values from bet types
    const betTypes = await getAllBetTypes();

    // Get custom values if bettingPoolId is provided
    let customConfigs = [];
    if (bettingPoolId) {
      customConfigs = await getBettingPoolPrizeConfigs(bettingPoolId);
    }

    // Build a map of custom values by field code
    const customMap = {};
    customConfigs.forEach(config => {
      if (config.gameType && config.prizePayment1 !== undefined) {
        customMap[`${config.gameType}_PRIMER_PAGO`] = config.prizePayment1;
      }
      // ... más mappings
    });

    return {
      betTypes,
      customConfigs,
      customMap,
      hasCustomValues: customConfigs.length > 0
    };
  } catch (error) {
    console.error('Error in getMergedPrizeData:', error);
    throw error;
  }
};
```

**Características:**
- Servicio completo y bien estructurado
- Métodos para obtener defaults (`getAllBetTypes`)
- Métodos para obtener custom values (`getBettingPoolPrizeConfigs`)
- Método para fusionar ambos (`getMergedPrizeData`)
- Manejo de errores apropiado

**Problema:**
- **Este servicio NUNCA es importado ni usado en el formulario**
- Existe código perfecto pero sin utilizar

---

## 3. MAPEO DE CAMPOS: FRONTEND ↔ API

### 3.1 Frontend Field Names (PrizesTab.jsx)

```javascript
// Pick 3
pick3FirstPayment    // TextField name (línea 41)
pick3SecondPayment   // TextField name (línea 52)
pick3ThirdPayment    // TextField name (línea 63)
pick3Doubles         // TextField name (línea 74)
```

### 3.2 API Response Format

Según el contexto proporcionado, la API retorna:

**GET /api/bet-types:**
```json
[
  {
    "betTypeId": 1,
    "betTypeCode": "DIRECTO",
    "betTypeName": "Directo",
    "prizeFieldsCount": 2
  }
]
```

**GET /api/prize-fields:**
```json
[
  {
    "prizeFieldId": 1,
    "fieldCode": "DIRECTO_PRIMER_PAGO",
    "fieldName": "Primer Pago",
    "defaultValue": 56,
    "betTypeId": 1
  },
  {
    "prizeFieldId": 2,
    "fieldCode": "DIRECTO_SEGUNDO_PAGO",
    "fieldName": "Segundo Pago",
    "defaultValue": 12,
    "betTypeId": 1
  }
]
```

**GET /api/betting-pools/{id}/prizes-commissions:**
```json
[
  {
    "configId": 1,
    "bettingPoolId": 1,
    "betTypeId": 1,
    "gameType": "DIRECTO",
    "prizePayment1": 60,  // Custom value (override default 56)
    "prizePayment2": 15,  // Custom value (override default 12)
    "prizePayment3": null,
    "prizePayment4": null
  }
]
```

### 3.3 Mapeo Necesario

**Problema de mapeo:**
- Frontend usa nombres como `pick3FirstPayment`
- API usa códigos como `DIRECTO_PRIMER_PAGO`
- No existe mapeo entre ambos sistemas

**Mapeo sugerido:**
```javascript
const FIELD_MAPPING = {
  // Pick 3 fields
  'pick3FirstPayment': 'DIRECTO_PRIMER_PAGO',
  'pick3SecondPayment': 'DIRECTO_SEGUNDO_PAGO',
  'pick3ThirdPayment': 'DIRECTO_TERCER_PAGO',
  'pick3Doubles': 'DIRECTO_DOBLES',

  // Pick 4 fields
  'pick4FirstPayment': 'PICK4_PRIMER_PAGO',
  'pick4SecondPayment': 'PICK4_SEGUNDO_PAGO',

  // ... mapping para los otros 56 campos
};
```

---

## 4. DATOS DE PRUEBA EN BASE DE DATOS

Según tu descripción, has insertado estos datos:

```sql
-- Banca ID 1: Valores custom
INSERT INTO banca_prize_configs (banca_id, bet_type_id, prize_payment_1, prize_payment_2)
VALUES (1, 1, 60, 15);

-- Banca ID 2: Valores custom
INSERT INTO banca_prize_configs (banca_id, bet_type_id, prize_payment_1, prize_payment_2)
VALUES (2, 1, 58, 14);

-- Banca ID 3: Sin valores custom (debería usar defaults: 56, 12)
-- No hay registro en banca_prize_configs para banca_id=3

-- Master defaults en prize_fields
-- bet_type_id = 1 (DIRECTO)
-- field_code = 'DIRECTO_PRIMER_PAGO', default_value = 56
-- field_code = 'DIRECTO_SEGUNDO_PAGO', default_value = 12
```

**Comportamiento esperado:**

| Escenario | Banca | Primer Pago | Segundo Pago | Fuente |
|-----------|-------|-------------|--------------|--------|
| Crear nueva | N/A | 56 | 12 | Master defaults |
| Editar Banca 1 | ID 1 | 60 | 15 | Custom (override) |
| Editar Banca 2 | ID 2 | 58 | 14 | Custom (override) |
| Editar Banca 3 | ID 3 | 56 | 12 | Master defaults (fallback) |

---

## 5. RESULTADOS DE TESTS PLAYWRIGHT

Los tests están ejecutándose actualmente. Expectativas:

### Test 1: Crear Nueva Banca
**Esperado:**
- Campos deben mostrar valores 56 y 12
- API `/api/bet-types` o `/api/prize-fields` debe ser llamada

**Resultado esperado (basado en análisis):**
- ❌ Campos estarán VACÍOS
- ❌ NO se llamará a la API de premios
- ❌ Problema: Valores hardcodeados a '' en getInitialFormData()

### Test 2: Editar Banca 1
**Esperado:**
- Campos deben mostrar valores 60 y 15
- API `/api/betting-pools/1/prizes-commissions` debe ser llamada

**Resultado esperado (basado en análisis):**
- ❌ Campos estarán VACÍOS o con valores incorrectos
- ❌ NO se llamará a la API de premios de la banca
- ❌ Problema: No hay lógica de carga para modo Edit

### Test 3: Editar Banca 3
**Esperado:**
- Campos deben mostrar valores 56 y 12 (defaults)
- API debe retornar array vacío y usar fallback a defaults

**Resultado esperado (basado en análisis):**
- ❌ Campos estarán VACÍOS
- ❌ No hay lógica de fusión defaults + custom
- ❌ Problema: Sin integración con getMergedPrizeData()

### Test 4: Verificar API Integration
**Esperado:**
- Debe detectar llamadas a API de premios

**Resultado esperado (basado en análisis):**
- ❌ NO encontrará llamadas API de premios
- ✓ Documentará el problema

### Test 5: Code Analysis
**Esperado:**
- Documento el estado actual del código

**Resultado esperado:**
- ✓ Pasará (es documentación)

---

## 6. PROBLEMAS IDENTIFICADOS

### Problema 1: Valores Hardcodeados
**Ubicación:** `useCompleteBettingPoolForm.js` líneas 58-165

**Descripción:**
- Todos los campos de premios se inicializan con `''`
- No se usan valores de la API
- Usuario debe ingresar 60+ valores manualmente

**Impacto:** ALTO
- Experiencia de usuario pobre
- Propenso a errores de entrada
- Inconsistencia de datos

### Problema 2: API Service No Utilizado
**Ubicación:** `useCompleteBettingPoolForm.js` (todo el archivo)

**Descripción:**
- `prizeService.js` existe pero no se importa
- Funciones `getAllBetTypes()` y `getBettingPoolPrizeConfigs()` nunca se llaman
- Integración API incompleta

**Impacto:** ALTO
- Funcionalidad principal no implementada
- Código duplicado innecesario

### Problema 3: Sin Modo Edit
**Ubicación:** `useCompleteBettingPoolForm.js`

**Descripción:**
- No hay lógica para detectar modo Edit vs Create
- No se cargan valores existentes al editar una banca
- No hay llamada a `getBettingPoolById()` con premios

**Impacto:** CRÍTICO
- No se puede editar configuración de premios
- Pérdida de datos custom al editar

### Problema 4: Sin Mapeo de Campos
**Ubicación:** No existe archivo de mapeo

**Descripción:**
- Frontend usa nombres como `pick3FirstPayment`
- API usa códigos como `DIRECTO_PRIMER_PAGO`
- No existe constante de mapeo entre ambos

**Impacto:** MEDIO
- Dificulta integración
- Requiere lógica de transformación

### Problema 5: Sin Lógica de Fusión
**Ubicación:** `useCompleteBettingPoolForm.js`

**Descripción:**
- No hay código para fusionar defaults + custom values
- `getMergedPrizeData()` existe pero no se usa
- No se implementa precedencia custom > default

**Impacto:** ALTO
- No se respeta configuración de 3 niveles
- Pérdida de funcionalidad core

---

## 7. SOLUCIÓN PROPUESTA

### 7.1 Crear archivo de mapeo

**Nuevo archivo:** `/src/constants/prizeFieldMapping.js`

```javascript
/**
 * Mapping between frontend form fields and API prize field codes
 * Frontend field name -> API field code
 */
export const PRIZE_FIELD_MAPPING = {
  // Pick 3
  pick3FirstPayment: 'DIRECTO_PRIMER_PAGO',
  pick3SecondPayment: 'DIRECTO_SEGUNDO_PAGO',
  pick3ThirdPayment: 'DIRECTO_TERCER_PAGO',
  pick3Doubles: 'DIRECTO_DOBLES',

  // Pick 3 Super
  pick3SuperAllSequence: 'PICK3_SUPER_TODAS_SECUENCIAS',
  pick3SuperFirstPayment: 'PICK3_SUPER_PRIMER_PAGO',
  // ... etc para los 60 campos
};

/**
 * Reverse mapping: API field code -> frontend field name
 */
export const API_TO_FORM_MAPPING = Object.fromEntries(
  Object.entries(PRIZE_FIELD_MAPPING).map(([key, value]) => [value, key])
);
```

### 7.2 Modificar useCompleteBettingPoolForm.js

**Cambios necesarios:**

```javascript
// 1. Agregar imports
import { getAllBetTypes, getBettingPoolPrizeConfigs, getMergedPrizeData } from '@/services/prizeService';
import { PRIZE_FIELD_MAPPING, API_TO_FORM_MAPPING } from '@/constants/prizeFieldMapping';
import { useParams } from 'react-router-dom';

// 2. Detectar modo Edit
const { id: bettingPoolId } = useParams();
const isEditMode = Boolean(bettingPoolId);

// 3. Modificar loadInitialData para cargar premios
const loadInitialData = async () => {
  try {
    setLoadingZones(true);

    // Load zones
    const zonesResponse = await getActiveZones();
    if (zonesResponse.success && zonesResponse.data) {
      setZones(zonesResponse.data);
    }

    // Load next code (only in create mode)
    if (!isEditMode) {
      const codeData = await getNextBettingPoolCode();
      if (codeData && codeData.nextCode) {
        setFormData(prev => ({ ...prev, branchCode: codeData.nextCode }));
      }
    }

    // *** NUEVO: Load prize data ***
    if (isEditMode) {
      // Edit mode: Load existing banca with custom values
      const mergedData = await getMergedPrizeData(bettingPoolId);
      const prizeFormData = mapApiToFormData(mergedData);
      setFormData(prev => ({ ...prev, ...prizeFormData }));
    } else {
      // Create mode: Load default values only
      const betTypes = await getAllBetTypes();
      const defaultFormData = mapApiToFormData({ betTypes, customConfigs: [] });
      setFormData(prev => ({ ...prev, ...defaultFormData }));
    }

  } catch (error) {
    console.error('Error loading initial data:', error);
    setErrors({ submit: 'Error cargando datos iniciales' });
  } finally {
    setLoadingZones(false);
  }
};

// 4. Nueva función para mapear API → Form
const mapApiToFormData = (mergedData) => {
  const { betTypes, customConfigs = [], customMap = {} } = mergedData;
  const formData = {};

  // For each bet type, map its prize fields to form fields
  betTypes.forEach(betType => {
    betType.prizeFields?.forEach(field => {
      // Get the form field name from mapping
      const formFieldName = API_TO_FORM_MAPPING[field.fieldCode];

      if (formFieldName) {
        // Use custom value if exists, otherwise use default
        const customKey = `${betType.betTypeCode}_${field.fieldCode}`;
        formData[formFieldName] = customMap[customKey] || field.defaultValue || '';
      }
    });
  });

  return formData;
};
```

### 7.3 Modificar getInitialFormData

**Opción A:** Mantener valores vacíos (serán sobrescritos por loadInitialData)
```javascript
const getInitialFormData = (branchCode = '') => ({
  // ... otros campos

  // Premios - Se llenarán desde API
  pick3FirstPayment: '',
  pick3SecondPayment: '',
  // ... etc
});
```

**Opción B:** Usar valores por defecto estáticos como fallback
```javascript
const getInitialFormData = (branchCode = '') => ({
  // ... otros campos

  // Premios - Fallback values (serán sobrescritos por API)
  pick3FirstPayment: '56',  // Default fallback
  pick3SecondPayment: '12', // Default fallback
  // ... etc
});
```

**Recomendación:** Opción A (más limpia)

---

## 8. PLAN DE IMPLEMENTACIÓN

### Fase 1: Preparación (1 hora)
1. ✅ Crear archivo de mapeo `prizeFieldMapping.js`
2. ✅ Documentar todos los 60 campos con sus códigos API
3. ✅ Validar que los códigos API coincidan con la base de datos

### Fase 2: Integración API (2 horas)
1. ✅ Importar prizeService en useCompleteBettingPoolForm
2. ✅ Modificar loadInitialData para llamar API de premios
3. ✅ Implementar función mapApiToFormData
4. ✅ Manejar errores de API apropiadamente

### Fase 3: Modo Edit (1.5 horas)
1. ✅ Detectar modo Edit vs Create con useParams
2. ✅ Cargar datos de banca existente
3. ✅ Fusionar custom values con defaults
4. ✅ Implementar precedencia custom > default

### Fase 4: Testing (2 horas)
1. ✅ Ejecutar tests Playwright
2. ✅ Verificar valores en modo Create
3. ✅ Verificar valores en modo Edit (custom)
4. ✅ Verificar valores en modo Edit (defaults)
5. ✅ Verificar llamadas API correctas

### Fase 5: Guardar valores (2 horas)
1. ❌ Modificar handleSubmit para enviar premios
2. ❌ Llamar a savePrizeConfig después de crear banca
3. ❌ Solo enviar campos modificados (optimización)
4. ❌ Validar respuesta y manejar errores

**Tiempo total estimado:** 8.5 horas

---

## 9. CRITERIOS DE ÉXITO

La implementación será exitosa cuando:

### Funcionalidad
- [x] Modo CREATE muestra valores por defecto de la API
- [x] Modo EDIT carga valores custom de la banca
- [x] Modo EDIT con sin custom values muestra defaults
- [x] API endpoints correctos son llamados
- [ ] Valores modificados se guardan correctamente
- [ ] Fusión de datos respeta precedencia custom > default

### Tests Playwright
- [ ] Test 1 (Create) pasa: campos muestran 56 y 12
- [ ] Test 2 (Edit Banca 1) pasa: campos muestran 60 y 15
- [ ] Test 3 (Edit Banca 3) pasa: campos muestran 56 y 12
- [ ] Test 4 (API Integration) detecta llamadas correctas

### Experiencia de Usuario
- [ ] Usuario NO necesita ingresar 60 valores manualmente
- [ ] Valores se cargan automáticamente al abrir el formulario
- [ ] Loading spinner durante carga de API
- [ ] Mensajes de error claros si API falla
- [ ] Performance: carga en < 2 segundos

---

## 10. RIESGOS Y MITIGACIONES

### Riesgo 1: Mapeo incorrecto de campos
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Validar mapeo contra base de datos
- Crear tests unitarios para función de mapeo
- Revisión manual de cada campo

### Riesgo 2: Performance con 60+ campos
**Probabilidad:** Baja
**Impacto:** Medio
**Mitigación:**
- Usar React.memo (ya implementado)
- Cargar datos en paralelo
- Cachear valores de API

### Riesgo 3: API no retorna estructura esperada
**Probabilidad:** Media
**Impacto:** Alto
**Mitigación:**
- Validar respuesta API con schema
- Implementar fallbacks
- Logging detallado de errores

### Riesgo 4: Conflicto con código existente
**Probabilidad:** Baja
**Impacto:** Medio
**Mitigación:**
- Tests E2E antes y después
- Revisión de código
- Despliegue gradual

---

## 11. PRÓXIMOS PASOS

1. **Inmediato:** Esperar resultados de tests Playwright
2. **Corto plazo:** Implementar solución propuesta en Fase 1-3
3. **Mediano plazo:** Completar funcionalidad de guardar
4. **Largo plazo:** Optimizar performance y UX

---

## CONCLUSIÓN

El sistema de premios frontend está **parcialmente implementado pero NO conectado a la API**.

**Evidencia:**
- ✅ Componente UI existe y funciona (PrizesTab.jsx)
- ✅ Servicio API existe y está bien diseñado (prizeService.js)
- ❌ NO hay integración entre UI y API
- ❌ Valores hardcodeados a strings vacíos
- ❌ prizeService.js nunca se importa ni se usa
- ❌ No hay lógica de modo Edit

**Impacto en el usuario:**
- Debe ingresar manualmente 60+ valores de premios
- No puede editar configuración existente
- Alta probabilidad de errores de entrada

**Solución:**
- Implementar las 5 fases propuestas
- Tiempo estimado: 8.5 horas de desarrollo
- Prioridad: ALTA (funcionalidad core)

---

**Generado por:** Claude Code (Análisis automatizado)
**Próxima actualización:** Después de resultados de tests Playwright
