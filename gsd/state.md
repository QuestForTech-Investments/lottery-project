# Estado del Proyecto

## Fase Actual
**Fase 4: Límites y Control** - ✅ COMPLETADA (incluyendo UI Clone)

## Progreso General
- **Módulos completados:** 12/23 (52%)
- **Módulos parciales:** 2/23 (9%)
- **Módulos pendientes:** 9/23 (39%)

## Último Commit
```
Fix: prize-config/resolved endpoint 500 error (c576376)
```
**Fecha:** 2026-02-07
**Estado:** ✅ Desplegado (frontend + API)

---

## Cambios de Hoy (2026-02-07) - Sesión 3

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

**Fecha de última actualización:** 2026-02-08 00:00
