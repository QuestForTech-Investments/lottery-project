# Estado del Proyecto

## Fase Actual
**Fase 4: Límites y Control** - ✅ COMPLETADA (incluyendo UI Clone)

## Progreso General
- **Módulos completados:** 12/23 (52%)
- **Módulos parciales:** 2/23 (9%)
- **Módulos pendientes:** 9/23 (39%)

## Último Commit
```
Fix: Auto-reload on stale chunk errors after deploy (c559739)
```
**Fecha:** 2026-02-07
**Estado:** ✅ Desplegado

---

## Cambios de Hoy (2026-02-07) - Sesión 2

### ✅ Template Copy Config - Create Mode (c327860)
**Problema:** Al copiar plantilla en "Crear Banca", los campos de configuración no coincidían con la banca origen. Ejemplo: banca con caída MENSUAL mostraba "OFF".

**Root causes (3 bugs):**
1. **Mapeos en español vs API en inglés:** Create usaba `MENSUAL`, `COBRO`, `RIFERO`, `GENERICO`, `EFECTIVO`, `TICKET_GRATIS`. El API retorna `MONTHLY`, `COLLECTION`, `SELLER`, `GENERIC`, `CASH`, `FREE_TICKET`.
2. **Nombres de campo incorrectos:** `ConfigurationTab.tsx` lee `allowJackpot` y `printEnabled`, pero el hook seteaba `allowPassPot` y `printTickets`.
3. **handleSubmit leía campos viejos:** `formData.allowPassPot` y `formData.printTickets` en vez de los correctos.

**Fix:**
- Mapeos cambiados a inglés (matching `EditBettingPool/hooks/utils.ts`)
- Field names corregidos: `allowPassPot`→`allowJackpot`, `printTickets`→`printEnabled`
- handleSubmit usa `??` fallback para compatibilidad
- Agregado `paymentModeMap` para modo de pago
- Agregado soporte para `allowFutureSales` y `maxFutureDays`

**Archivo:** `CreateBettingPool/hooks/useCompleteBettingPoolForm.ts`

**Verificado con Playwright (local):**
- ✅ Tipo de Caída = MENSUAL (no OFF)
- ✅ Permitir Pasar Bote = checked
- ✅ Imprimir = checked
- ✅ Modo de Pago = BANCA
- ✅ Proveedor de Descuento = RIFERO
- ✅ Modo de Descuento = OFF

---

### ✅ Success Message en Create Mode (c327860)
**Problema:** Edit mostraba "Plantilla aplicada correctamente" pero Create no mostraba nada.

**Fix:**
- Agregado `successMessage` state + `clearSuccessMessage` al hook
- Agregado Snackbar + Alert al componente `CreateBettingPool/index.tsx`
- Ahora muestra "Plantilla aplicada correctamente" igual que Edit

---

### ✅ Rutas camelCase → kebab-case (217256a)
**Problema:** 4 archivos usaban `/bettingPools/list` (camelCase) pero App.tsx define `/betting-pools/list` (kebab-case). Causaba navegación rota.

**Archivos corregidos:**
| Archivo | Ruta vieja | Ruta nueva |
|---------|-----------|------------|
| `CreateBettingPool/index.tsx` | `/bettingPools/list` | `/betting-pools/list` |
| `EditBettingPool/index.tsx` | `/bettingPools/list` | `/betting-pools/list` |
| `useCreateBettingPoolForm.ts` | `/bettingPools/list` | `/betting-pools/list` |
| `useCompleteBettingPoolForm.ts` | `/bettingPools/create` | `/betting-pools/new` |

---

### ✅ Auto-reload en chunk errors post-deploy (c559739)
**Problema:** Después de un deploy, los archivos JS cambian de nombre (hash). Usuarios con la app abierta ven: `TypeError: Failed to fetch dynamically imported module: .../DashboardMUI.B6_25tHj.js`

**Fix:** `ErrorBoundary.componentDidCatch` detecta este error específico y recarga la página automáticamente (1 vez, con guard de 10s para evitar loops).

**Archivo:** `components/common/ErrorBoundary.tsx`

---

## Cambios de Hoy (2026-02-07) - Sesión 1

### ✅ Prize Load/Save Fix - Edit Mode (2a11567)
**Problema:** Premios no persistían en Edit. Cambiar Palé de 1200→1000 y guardar mostraba 1200 al recargar.

**Root cause:** Key mismatch por acentos en `getMergedPrizeData` (prizeService.ts):
- `betTypeCode` del API: `PALÉ` (con acento)
- `fieldCode.split('_')[0]`: `PALE` (sin acento)

**Fix:** Usar `prizeTypeId → betTypeCode` map del API (con acentos reales).

---

### ✅ Template Copy - Live Preview (287958f, ed4032c, 638c22e, f28abff)
- Auto-apply al seleccionar template o cambiar checkboxes
- Fix setSuccessMessage undefined en Create
- Fix prize key format
- Fix comisiones incluidas en template copy

---

### ✅ Performance - Herencia + Batch (0700c0e, 8660d24, eb6e028)
- Solo guardar valores "General" (~56 items vs ~3920)
- Backend con herencia: `draw_specific` → `banca_default` → `system_default`
- Endpoints batch para comisiones y premios

---

## Fase 4 - Límites y Control (COMPLETADA)

### Backend (.NET) - ✅ 100%
- `LimitsController.cs` con 8 endpoints
- `AutomaticLimitsController.cs` con 6 endpoints
- `HotNumbersController.cs` con 8 endpoints

### Frontend (React) - ✅ 100% + UI Clonado
- UI clonada de app original usando Playwright MCP

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
1. **Mapeos español vs inglés:** El API de .NET retorna enums en INGLÉS (`MONTHLY`, `SELLER`, `COLLECTION`). Los mapeos en frontend deben usar inglés, no español.
2. **Field name mismatch:** Si `ConfigurationTab` lee `formData.allowJackpot`, el hook debe setear `updates.allowJackpot`, NO `updates.allowPassPot`. Siempre verificar qué nombre usa el componente UI.
3. **Rutas kebab-case:** App.tsx usa `/betting-pools/list` (kebab-case). Nunca usar camelCase en `navigate()`.
4. **Chunk errors post-deploy:** SPAs con code-splitting necesitan auto-reload cuando los chunks cambian de hash.
5. **Key mismatch por acentos:** `betTypeCode` tiene acentos (`PALÉ`) pero `fieldCode` no (`PALE_*`). Nunca extraer betTypeCode de fieldCode.
6. **Auth token en raw fetch:** `prizeService.ts` usa `fetch()` no `apiFetch()` → necesita token manual.
7. **Playwright paralelo:** Dos agents Playwright comparten el mismo browser → causa "redirects" falsos. Siempre testear secuencialmente.

### 📁 Guías
| Guía | Descripción |
|------|-------------|
| `gsd/guides/deploy-workflow.md` | Proceso de deploy automático |
| `gsd/guides/batch-save-pattern.md` | Patrón para guardado en lote |
| `gsd/guides/ui-cloning-guide.md` | Clonar UI con Playwright |

---

**Fecha de última actualización:** 2026-02-07 23:00
