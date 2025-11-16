# 📊 ANÁLISIS COMPLETO - SISTEMA DE PREMIOS

**Proyecto:** `/home/jorge/projects/LottoWebApp`
**Fecha:** 2025-11-01
**Estado:** ⚠️ PROBLEMA CRÍTICO IDENTIFICADO

---

## 🎯 RESUMEN EJECUTIVO

El sistema de premios tiene **infraestructura completa** pero **NO está cargando datos al editar bancas**.

### Problema Principal

**❌ Al editar una banca, los campos de premios aparecen vacíos**

- Usuario creó Banca 1 con valores custom (Directo: 60, 15)
- Al abrir "Editar Banca 1" → Todos los campos aparecen vacíos
- Usuario debe reingresar los 60+ campos manualmente

### Impacto

| Métrica | Valor |
|---------|-------|
| Campos afectados | 60+ campos de premio |
| Tiempo perdido por edición | 15-20 minutos |
| Probabilidad de errores | Alta |
| Severidad | 🔴 **CRÍTICA** |

---

## 🏗️ ARQUITECTURA ACTUAL

### ✅ Infraestructura Existente (Completa)

1. **API Service** (`src/services/prizeFieldService.js`)
   ```javascript
   getPrizeFields()                    // Obtiene valores default
   getBancaPrizeConfig(bettingPoolId)  // Obtiene custom de una banca
   saveBancaPrizeConfig(id, configs)   // Guarda configuración
   ```

2. **Convertidores** (`src/utils/premioFieldConverter.js`)
   ```javascript
   apiResponseToJsonConfig(apiResponse) // API → JSON
   jsonConfigToApiPayload(json, fields) // JSON → API
   ```

3. **Mapeos** (`src/utils/premioFieldMapping.js`)
   ```javascript
   DIRECTO_FIELDS = {
     primerPago: 'DIRECTO_PRIMER_PAGO',
     segundoPago: 'DIRECTO_SEGUNDO_PAGO'
   }
   ```

4. **Hook Helper** (`src/hooks/usePremioDefaults.js`)
   ```javascript
   jsonConfigToFormData(json, 'general')  // JSON → FormData frontend
   formDataToJsonConfig(formData, 'general') // FormData → JSON
   ```

### ❌ Problema: Sin Integración en EditBanca.jsx

**Línea 323 de EditBanca.jsx:**
```javascript
// Premios & Comisiones - Todos los campos vacíos por ahora
pick3FirstPayment: '',
pick3SecondPayment: '',
// ... 58 campos más vacíos
```

---

## 🔍 FLUJO DE DATOS

### Formato de Datos (3 Capas)

```
┌─────────────────────────────────────────────────────────┐
│ 1. FRONTEND (hardcoded en PremiosComisionesTab.jsx)    │
│    "general_directo_primerPago"                         │
└─────────────────────────────────────────────────────────┘
                        ↕️
           jsonConfigToFormData()
           formDataToJsonConfig()
                        ↕️
┌─────────────────────────────────────────────────────────┐
│ 2. JSON API (formato intermedio)                        │
│    { directo: { primer_pago: 56 } }                     │
└─────────────────────────────────────────────────────────┘
                        ↕️
       apiResponseToJsonConfig()
       jsonConfigToApiPayload()
                        ↕️
┌─────────────────────────────────────────────────────────┐
│ 3. DATABASE (prize_fields table)                        │
│    DIRECTO_PRIMER_PAGO = 56                             │
└─────────────────────────────────────────────────────────┘
```

### Flujo Correcto (No Implementado)

**Al editar banca:**

```javascript
// 1. Obtener valores custom de la banca
const customConfigs = await getBancaPrizeConfig(bettingPoolId);

// 2. Obtener valores default del sistema
const prizeFields = await getPrizeFields();

// 3. Fusionar custom sobre defaults
const mergedJson = mergePrizeConfigs(prizeFields, customConfigs);

// 4. Convertir a formato formData
const premiosFormData = jsonConfigToFormData(mergedJson, 'general');

// 5. Actualizar state
setFormData(prev => ({
  ...prev,
  ...premiosFormData
}));
```

---

## 📁 ARCHIVOS CLAVE

### Requieren Modificación

| Archivo | Tamaño | Estado | Acción Requerida |
|---------|--------|--------|------------------|
| `src/components/EditBanca.jsx` | 104 KB | ❌ Sin carga de premios | Agregar useEffect para cargar premios (línea ~350) |

### Infraestructura Existente (OK)

| Archivo | Tamaño | Estado |
|---------|--------|--------|
| `src/services/prizeFieldService.js` | 5.9 KB | ✅ Completo |
| `src/utils/premioFieldConverter.js` | 14.4 KB | ✅ Completo |
| `src/utils/premioFieldMapping.js` | 10.5 KB | ✅ Completo |
| `src/hooks/usePremioDefaults.js` | 3.9 KB | ✅ Completo |
| `src/components/CreateBanca.jsx` | 82 KB | ✅ Guarda premios correctamente |

---

## 💡 SOLUCIÓN PROPUESTA

### Opción A: Fix Rápido (1-2 horas)

**Modificar EditBanca.jsx línea ~350:**

```javascript
// DESPUÉS de cargar la configuración general (línea 314)

// ========== NUEVO: CARGAR PREMIOS ==========
try {
  // 1. Obtener prize fields con defaults
  const prizeFieldsResponse = await getPrizeFields();
  const defaultJson = apiResponseToJsonConfig(prizeFieldsResponse);

  // 2. Obtener configuración custom de la banca (si existe)
  let customJson = { config: {} };
  try {
    const customConfigs = await getBancaPrizeConfig(id);
    if (customConfigs && customConfigs.length > 0) {
      customJson = apiResponseToJsonConfig(customConfigs);
    }
  } catch (err) {
    // Si no hay custom configs, usar solo defaults
    console.log('No hay configuración custom, usando defaults');
  }

  // 3. Fusionar custom sobre defaults
  const mergedJson = {
    ...defaultJson.config,
    ...Object.fromEntries(
      Object.entries(customJson.config).map(([betType, fields]) => [
        betType,
        { ...defaultJson.config[betType], ...fields }
      ])
    )
  };

  // 4. Convertir a formato formData
  const premiosFormData = jsonConfigToFormData(mergedJson, 'general');

  console.log(`✅ Premios cargados: ${Object.keys(premiosFormData).length} campos`);

  // 5. Actualizar formData
  setFormData(prev => ({
    ...prev,
    ...premiosFormData
  }));

} catch (premioError) {
  console.error('⚠️ Error cargando premios:', premioError);
  // No fallar la carga de la banca por error en premios
}
// ========== FIN NUEVO CÓDIGO ==========
```

**Imports necesarios (agregar al inicio de EditBanca.jsx):**

```javascript
import { getBancaPrizeConfig, getPrizeFields } from '../services/prizeFieldService';
import { apiResponseToJsonConfig } from '../utils/premioFieldConverter';
import { jsonConfigToFormData } from '../hooks/usePremioDefaults';
```

### Criterios de Éxito

- [ ] Al editar Banca 1: Campos muestran valores custom (60, 15)
- [ ] Al editar Banca 3: Campos muestran valores default (56, 12)
- [ ] Al crear nueva banca: Campos muestran valores default
- [ ] Los valores se guardan correctamente al actualizar
- [ ] No hay errores en consola

---

## 🧪 PLAN DE PRUEBAS

### Prueba Manual

1. **Editar Banca con valores custom (Banca 1):**
   ```
   1. Abrir http://localhost:3000/bancas
   2. Click "Editar" en Banca 1
   3. Ir al tab "Premios & Comisiones"
   4. Verificar:
      ✅ Directo - Primer Pago = 60
      ✅ Directo - Segundo Pago = 15
   ```

2. **Editar Banca sin valores custom (Banca 3):**
   ```
   1. Click "Editar" en Banca 3
   2. Ir al tab "Premios & Comisiones"
   3. Verificar:
      ✅ Directo - Primer Pago = 56 (default)
      ✅ Directo - Segundo Pago = 12 (default)
   ```

3. **Modificar y guardar:**
   ```
   1. Cambiar "Directo - Primer Pago" a 65
   2. Click "Actualizar Banca"
   3. Recargar página
   4. Verificar:
      ✅ El nuevo valor (65) persiste
   ```

### Prueba con Playwright

```javascript
// tests/edit-banca-prizes.spec.js
test('should load custom prize values when editing banca', async ({ page }) => {
  await page.goto('http://localhost:3000/bancas/edit/1');

  // Esperar a que cargue el formulario
  await page.waitForSelector('[name="branchName"]');

  // Ir al tab de premios
  await page.click('text=Premios & Comisiones');

  // Verificar valores custom
  const primerPago = await page.inputValue('[name="general_directo_primerPago"]');
  const segundoPago = await page.inputValue('[name="general_directo_segundoPago"]');

  expect(primerPago).toBe('60');
  expect(segundoPago).toBe('15');
});
```

---

## 📊 DATOS DE PRUEBA EN BASE DE DATOS

```sql
-- Verificación de datos de prueba existentes
SELECT
    bp.betting_pool_id,
    bp.betting_pool_name,
    pf.field_name,
    pf.default_multiplier,
    bpc.custom_value,
    COALESCE(bpc.custom_value, pf.default_multiplier) as effective_value
FROM betting_pools bp
CROSS JOIN prize_fields pf
LEFT JOIN banca_prize_configs bpc
    ON bpc.betting_pool_id = bp.betting_pool_id
    AND bpc.prize_field_id = pf.prize_field_id
WHERE pf.bet_type_id = 1  -- DIRECTO
  AND pf.prize_field_id IN (61, 62)  -- Primer y Segundo Pago
  AND bp.betting_pool_id IN (1, 2, 3)
ORDER BY bp.betting_pool_id, pf.prize_field_id;
```

**Resultados esperados:**

| Banca | Campo | Default | Custom | Efectivo |
|-------|-------|---------|--------|----------|
| Banca 1 | Primer Pago | 56 | **60** | **60** |
| Banca 1 | Segundo Pago | 12 | **15** | **15** |
| Banca 2 | Primer Pago | 56 | **58** | **58** |
| Banca 2 | Segundo Pago | 12 | **14** | **14** |
| Banca 3 | Primer Pago | 56 | NULL | **56** |
| Banca 3 | Segundo Pago | 12 | NULL | **12** |

---

## 📝 NOTAS ADICIONALES

### Diferencias con Proyecto Lottery-Project/LottoWebApp

| Aspecto | `/LottoWebApp` | `/Lottery-Project/LottoWebApp` |
|---------|----------------|--------------------------------|
| Estructura | Componentes monolíticos | Material-UI con tabs |
| Archivo principal | `EditBanca.jsx` (104 KB) | `tabs/PrizesTab.jsx` + hook |
| Estado | Infraestructura completa | Sin infraestructura |
| Problema | Solo falta integrar | Falta TODO |

### Próximos Pasos

1. **Corto plazo (Hoy):**
   - Implementar fix en EditBanca.jsx
   - Hacer lo mismo en CreateBanca.jsx (cargar defaults al crear)
   - Probar manualmente con Banca 1 y 3

2. **Mediano plazo (Esta semana):**
   - Crear tests Playwright automatizados
   - Documentar flujo completo para equipo
   - Verificar performance con 60+ campos

3. **Largo plazo (Próximo sprint):**
   - Refactorizar a custom hook compartido
   - Agregar loading states
   - Implementar caché de defaults

---

## 🎯 RECOMENDACIÓN FINAL

**Implementar Opción A (Fix Rápido) AHORA:**

- Tiempo estimado: 1-2 horas
- Riesgo: Bajo (usa infraestructura existente)
- Impacto: Alto (desbloquea funcionalidad crítica)

**Razón:** Toda la infraestructura ya existe y funciona. Solo falta conectar los puntos en EditBanca.jsx.

---

**Generado por:** Claude Code
**Análisis basado en:** Inspección directa de código y base de datos Azure SQL
