# Estado del Proyecto

## Fase Actual
**Fase 4: Límites y Control** - ✅ COMPLETADA (incluyendo UI Clone)

## Progreso General
- **Módulos completados:** 12/23 (52%)
- **Módulos parciales:** 2/23 (9%)
- **Módulos pendientes:** 9/23 (39%)

## Último Commit
```
UI: Center Estado and Acciones cells in ticket monitoring table (c434e82)
```
**Fecha:** 2026-02-08
**Estado:** ✅ Desplegado

---

## Cambios de Hoy (2026-02-08) - Sesión 5: Monitor de Tickets UI

### ✅ Ticket Monitoring Table Redesign (083bac0, c434e82)
**Cambios:**
- Tabla más compacta (maxWidth 950→796px) para dar espacio al panel de detalle
- Columnas redistribuidas con anchos optimizados
- Fuente reducida a 0.75rem, headers y celdas centrados
- Botón de enviar eliminado de acciones, iconos más compactos
- Números de jugada formateados con guiones (2530→25-30)
- Panel de detalle con minWidth 350px y fuente 12px
- Usuario "Administrador" renombrado a "admin" en BD

---

## Cambios de Hoy (2026-02-08) - Sesión 4: Premios & Comisiones UX Fixes

### ✅ Batch Update para Comisiones (0707fda)
**Problema:** Escribir en el input "General" de comisiones era extremadamente lento (~1768 llamadas individuales a setState por keystroke).

**Fix:** Nuevo `handleBatchChange` que hace un solo `setFormData(prev => ({...prev, ...updates}))` con todas las ~1768 actualizaciones. Propagación instantánea.

**Archivos:** `useCompleteBettingPoolForm.ts`, `useEditBettingPoolForm.ts`, `PrizesTab/index.tsx`, `CommissionFieldList.tsx`, `EditBettingPool/index.tsx`, `CreateBettingPool/index.tsx`

### ✅ Reset General Input al cambiar tab (c0764f0)
**Problema:** El input "General" (bulk-fill) retenía su valor al cambiar de tab de sorteo porque el componente se mantiene montado.

**Fix:** `useEffect` que resetea `generalTopInput` a `''` cuando `activeDraw` cambia.

**Archivo:** `CommissionFieldList.tsx`

### ✅ No sobreescribir valores propagados al cambiar tab (c33dc43)
**Problema:** `loadDrawSpecificValues` recargaba del API cada vez que se cambiaba de tab de sorteo, sobreescribiendo valores propagados desde General.

**Fix:** `useRef<Set<string>>` para trackear draws ya cargados. Solo carga del API la primera vez que se visita cada draw.

**Archivo:** `PrizesTab/index.tsx`

### ✅ Guardar desde General persiste a todos los sorteos (4cd8c31)
**Problema:** `savePrizeConfigForSingleDraw('general')` solo incluía `general_*` keys, ignorando `draw_*` keys propagadas.

**Fix:** Incluir `draw_*` keys en el payload cuando se guarda desde General.

**Archivo:** `useEditBettingPoolForm.ts`

### ✅ Premios: misma propagación que comisiones (d7c7f4f)
**Problema:** BetTypeFieldGrid (premios) usaba llamadas individuales a `onFieldChange` para propagar, y el API sobreescribía valores propagados al cambiar de tab.

**Fix:**
1. `BetTypeFieldGrid.tsx` - Añadido `onBatchFieldChange` y batch update (igual que CommissionFieldList)
2. `PrizesTab/index.tsx` - Wrapper `handleBatchChangeWithTracking` que marca draws propagados en `loadedDrawsRef` para que el API no los sobreescriba

### ✅ UI: Scrollbar separado de tabs de sorteos (5af7fcd)
**Fix:** Añadido `pb: 1.5` al contenedor de draw chips en `DrawTabSelector.tsx`

### ✅ E2E Verificado: Comisiones correctas en tickets
**Test:** Creado ticket FQ-LB-0007-000000037 en Banca 07 (NEW YORK DAY)
- Directo $100 → comisión 20% = $20 ✅
- Palé $100 → comisión 30% = $30 ✅
- Total $200, comisión $50, neto $150 ✅

---

## Cambios de Ayer (2026-02-07) - Sesión 3

### ✅ Commission Save Propagation Fix (da7e437)
**Problema:** Guardar comisiones desde tab "General" solo guardaba `lotteryId: null` (general). Los 67 sorteos individuales NO recibían los nuevos valores.

**Root cause:** `savePrizeConfigForSingleDraw()` filtraba `formData` a solo `general_*` keys (optimización de premios), pero pasaba ese mismo `filteredFormData` a `saveCommissionConfigurations()`. Esta función busca `draw_*` keys para propagar a sorteos → no encontraba ninguna.

**Fix (1 línea):**
```typescript
// Antes: pasaba filteredFormData (sin draw_* keys)
await saveCommissionConfigurations(id, filteredFormData, ...);

// Después: pasa formData completo cuando es General
const commissionData = drawId === 'general' ? formData : filteredFormData;
await saveCommissionConfigurations(id, commissionData, ...);
```

**Archivo:** `EditBettingPool/hooks/useEditBettingPoolForm.ts` línea 1279

**Verificado con Playwright (local):** 14 sorteos verificados, todos mostraron valor propagado (33) correctamente.

---

### ✅ prize-config/resolved 500 Error Fix (c576376)
**Problema:** Todos los endpoints `/betting-pools/{id}/draws/{drawId}/prize-config/resolved` devolvían HTTP 500. Afectaba la carga de premios en sorteos individuales (69 errores por página).

**Root cause:** Double-Join entre `LotteryGameCompatibilities → GameTypes → BetTypes` fallaba en Azure SQL. Posiblemente por collation/accent mismatch entre `GameTypeCode` y `BetTypeCode`.

**Fix:** Eliminado el Join complejo. Ahora usa todos los PrizeTypes activos directamente (el filtrado por compatibilidad de lotería ya lo hace el frontend).

**Archivo:** `api/src/LotteryApi/Controllers/DrawPrizeConfigController.cs`

**Verificado:** Endpoint ahora devuelve 200 OK con 20KB de datos en producción.

---

## Cambios de Hoy (2026-02-07) - Sesión 2

### ✅ Template Copy Config - Create Mode (c327860)
**Problema:** Al copiar plantilla en "Crear Banca", los campos de configuración no coincidían con la banca origen (caída MENSUAL mostraba OFF).

**Root causes:** Mapeos en español vs API en inglés, field names incorrectos (`allowPassPot` vs `allowJackpot`), handleSubmit leía campos viejos.

**Archivo:** `CreateBettingPool/hooks/useCompleteBettingPoolForm.ts`

### ✅ Success Message en Create Mode (c327860)
Edit mostraba "Plantilla aplicada correctamente" pero Create no. Agregado Snackbar.

### ✅ Rutas camelCase → kebab-case (217256a)
4 archivos usaban `/bettingPools/list` en vez de `/betting-pools/list`.

### ✅ Auto-reload chunk errors post-deploy (c559739)
ErrorBoundary detecta "Failed to fetch dynamically imported module" y recarga automáticamente.

---

## Cambios de Hoy (2026-02-07) - Sesión 1

### ✅ Prize Load/Save Fix - Edit Mode (2a11567)
Key mismatch por acentos en `getMergedPrizeData`. Fix: usar prizeTypeId → betTypeCode map del API.

### ✅ Template Copy - Live Preview (287958f, ed4032c, 638c22e, f28abff)
Auto-apply, fix setSuccessMessage, fix prize key format, fix comisiones.

### ✅ Performance - Herencia + Batch (0700c0e, 8660d24, eb6e028)
Solo guardar General (~56 items vs ~3920). Batch endpoints backend.

---

## Fase 4 - Límites y Control (COMPLETADA)

### Backend (.NET) - ✅ 100%
- `LimitsController.cs`, `AutomaticLimitsController.cs`, `HotNumbersController.cs`

### Frontend (React) - ✅ 100% + UI Clonado

---

## Próxima Fase
**Fase 5: Resultados y Sincronización**
- Sincronización de resultados desde app original
- Cálculo de premios
- Reporte de ganadores

## URLs Importantes
| Entorno | URL |
|---------|-----|
| Producción | https://lottobook.net |
| Local Frontend | http://localhost:4001 |
| Local API | http://localhost:5000 |
| App Original | https://la-numbers.apk.lol |

## Credenciales
- **Admin local:** admin / Admin123456
- **App original:** oliver / oliver0597@

---

## Lecciones Aprendidas (2026-02-07)

### ❌ Errores Comunes a Evitar
1. **Mapeos español vs inglés:** API retorna enums en INGLÉS. Frontend debe usar inglés.
2. **Field name mismatch:** Verificar qué nombre usa el componente UI antes de setear en el hook.
3. **Rutas kebab-case:** Nunca usar camelCase en `navigate()`.
4. **Chunk errors post-deploy:** SPAs necesitan auto-reload cuando chunks cambian de hash.
5. **Key mismatch por acentos:** Nunca extraer betTypeCode de fieldCode.
6. **Auth token en raw fetch:** `prizeService.ts` necesita token manual.
7. **Playwright paralelo:** Siempre testear secuencialmente.
8. **filteredFormData vs formData:** Al optimizar save (filtrar keys), cuidado con funciones que necesitan las keys completas. Comisiones necesitan `draw_*` keys para propagar.
9. **EF Core Joins con acentos:** Joins entre tablas con códigos acentuados pueden fallar en Azure SQL. Preferir queries simples.

### 📁 Guías
| Guía | Descripción |
|------|-------------|
| `gsd/guides/deploy-workflow.md` | Proceso de deploy automático |
| `gsd/guides/batch-save-pattern.md` | Patrón para guardado en lote |
| `gsd/guides/ui-cloning-guide.md` | Clonar UI con Playwright |

---

**Fecha de última actualización:** 2026-02-08 09:30
