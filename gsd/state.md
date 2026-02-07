# Estado del Proyecto

## Fase Actual
**Fase 4: Límites y Control** - ✅ COMPLETADA (incluyendo UI Clone)

## Progreso General
- **Módulos completados:** 12/23 (52%)
- **Módulos parciales:** 2/23 (9%)
- **Módulos pendientes:** 9/23 (39%)

## Último Commit
```
Perf: Optimize prize save - only save General, draws inherit
```
**Fecha:** 2026-02-07
**Estado:** ✅ Desplegado

---

## Cambios de Hoy (2026-02-07)

### ⚡ Prize Save - Herencia en vez de Propagación ✅ COMPLETADO
**Problema:** Aunque batch reducía requests, premios aún tardaba ~30s porque enviaba ~3920 items (70 draws × 14 bet types × 4 fields)

**Solución (0700c0e):**
1. **Solo guardar `general_*`:** Cuando guardas desde General, solo se envían ~56 items (valores generales)
2. **Herencia en carga:** Frontend ahora usa `/prize-config/resolved` que tiene fallback:
   - `draw_specific` → `banca_default` → `system_default`
3. **Los draws heredan automáticamente** del valor general de la banca

**Archivos modificados:**
- `useEditBettingPoolForm.ts`:
  - `savePrizeConfigForSingleDraw`: Solo incluye `general_*` al guardar desde General
  - `loadDrawSpecificValues`: Usa endpoint `/resolved` con herencia

**Resultado esperado:**
- Antes: ~30 segundos, ~3920 items
- Después: ~2 segundos, ~56 items

**🧪 Test Exhaustivo en Producción (2026-02-07 03:36):**

| Test | Operación | Tiempo | Persistencia |
|------|-----------|--------|--------------|
| Premios | Directo Primer Pago 77→78 | ~1.5s | ✅ Verificado |
| Comisiones | Directo 20→21→20 | Rápido | ✅ Verificado |

- ✅ Valores persisten después de reload
- ✅ Redirect automático a lista de bancas
- ✅ Sin errores 400/429
- ✅ Valores restaurados a originales

---

### ⚡ Batch Save - Comisiones y Crear Banca ✅ COMPLETADO
**Commits:** 8660d24, eb6e028

**Cambios:**
- `CreateBettingPool`: Ahora usa batch para comisiones Y premios por sorteo
- `EditBettingPool`: Comisiones usan batch (ya funcionaba rápido)

---

### ⚡ Batch Endpoints Backend ✅ COMPLETADO
**Problema original:** Guardar tomaba 90+ segundos (200+ requests secuenciales)

**Endpoints creados:**
- `POST /betting-pools/{id}/prizes-commissions/batch` - Comisiones en lote
- `POST /betting-pools/{id}/draws/prize-config/batch` - Premios por sorteo en lote

**Archivos Backend:**
- `BettingPoolPrizesCommissionsController.cs` - +95 líneas
- `DrawPrizeConfigController.cs` - +115 líneas
- DTOs: BatchCommissionItemDto, BatchDrawPrizeConfigRequest, etc.

---

### Cambios anteriores de hoy

### 8234c10 - General SIEMPRE pisa overrides
**Spec:** Cuando General cambia, propaga a TODOS los sorteos sin excepción.
Los "overrides" son temporales hasta la próxima propagación desde General.

**Cambio:**
- Eliminada la protección que preservaba valores existentes en formData al cargar desde DB
- Ahora los valores de DB se cargan, pero la propagación de General los sobrescribe

**Archivo:**
- `PrizesTab/index.tsx` - useEffect ya no protege valores existentes

**Verificación con Playwright (2026-02-07 02:28):**
- ✅ Cambiar campo "General" (25→33) propaga a todos los tipos de apuesta
- ✅ Propagación llega a sorteo LA PRIMERA (33)
- ✅ Propagación llega a sorteo TEXAS MORNING (33)
- ✅ Valores restaurados a 25

### 367d0cc - Fix error 400 al guardar comisiones desde General
**Problema:** Al guardar desde tab General, múltiples draws comparten el mismo `lotteryId`.
Después de crear un registro por POST, el siguiente draw con el mismo `lotteryId` fallaba con 400
porque `existingRecords` fue cargado antes de crear el primer registro.

**Solución:**
- Después de un POST exitoso, agregar el nuevo registro a `existingRecords`
- Esto permite que los siguientes draws encuentren el registro y usen PUT en lugar de POST

**Archivos:**
- `EditBettingPool/hooks/useEditBettingPoolForm.ts` - `saveCommissionsForPrefix` ahora actualiza `existingRecords`

**Verificación:**
- Probado en producción con Playwright MCP
- Sin errores 400 al guardar ✅
- Nota: El guardado es lento (~70 draws) y puede generar 429 (rate limit) si hay muchos requests

### 853fba3 - Fix propagación comisiones individuales
**Problema:** Al cambiar un tipo de apuesta individual (ej: Tripleta=30) en tab General, no se propagaba a los sorteos específicos.
**Solución:**
- Modificar `handleInputChange` para también propagar cuando `activeDraw === 'general'`
- Ahora itera por TODOS los draws disponibles igual que `handleGeneralFieldChange`

**Archivos:**
- `PrizesTab/components/CommissionFieldList.tsx` - `handleInputChange` ahora propaga a todos los draws

**Verificación:**
- Probado en producción con Playwright MCP
- Set Tripleta=88 en General → Verificado en LA PRIMERA (88) y NEW YORK DAY (88) ✅

### 079dc4c - Fix propagación campo "General" (comisiones)
**Problema:** El campo "General" (arriba) no propagaba a todos los sorteos.
**Solución:**
- Pasar lista de `draws` a `CommissionFieldList`
- `handleGeneralFieldChange` ahora itera por TODOS los draws disponibles

**Archivos:**
- `PrizesTab/components/CommissionFieldList.tsx` - Nueva prop `draws`, lógica de propagación
- `PrizesTab/index.tsx` - Pasa `draws` al componente

### 92533cd - Zona default en crear banca
**Cambio:** Al crear una banca, la zona "Default" se selecciona automáticamente.
**Archivo:** `CreateBettingPool/hooks/useCompleteBettingPoolForm.ts`

### 328951e - Documentación GSD ventas futuras
Actualización de state.md con cambios de OliverJPR (e33eca4).

### e33eca4 - Ventas Futuras (OliverJPR)
**Nueva funcionalidad:** Las bancas pueden vender tickets para sorteos futuros.

| Backend | Cambios |
|---------|---------|
| `TicketsController.cs` | `TicketDate` opcional, validación ventas futuras |
| `SalesReportsController.cs` | Reportes por `DrawDate` |
| `BettingPoolConfig.cs` | +`AllowFutureSales`, `MaxFutureDays` |

| Frontend | Cambios |
|----------|---------|
| `CreateBettingPool/ConfigurationTab.tsx` | UI ventas futuras |
| `EditBettingPool/hooks/*` | Soporte edición |

---

## Fase 4 - Límites y Control (COMPLETADA)

### Backend (.NET) - ✅ 100%
- `LimitsController.cs` con 8 endpoints
- `AutomaticLimitsController.cs` con 6 endpoints
- `HotNumbersController.cs` con 8 endpoints

### Frontend (React) - ✅ 100% + UI Clonado
- UI clonada de app original usando Playwright MCP
- Ver guía: `gsd/guides/ui-cloning-guide.md`

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

### ✅ Workflow de Testing
1. **Siempre se puede probar en producción:** Commit + push = auto-deploy a Azure
2. **Playwright MCP:** Ideal para verificar cambios en producción sin abrir navegador

### ⚡ Herencia > Propagación
**Problema:** Batch seguía lento porque enviaba 3920 items (valores propagados a 70 draws)

**Solución:**
1. Solo guardar valores "General" (~56 items)
2. Backend con herencia: `draw_specific` → `banca_default` → `system_default`
3. Frontend usa endpoint `/resolved` para cargar con fallback
3. **Ver `gsd/guides/deploy-workflow.md`:** Documentación del proceso

### ✅ Patrón Batch Save
1. **Problema identificado:** Guardado lento = muchos requests HTTP
2. **Solución:** Endpoints batch que procesan N items en 1 request
3. **Ver `gsd/guides/batch-save-pattern.md`:** Guía completa del patrón

### ❌ Errores Comunes a Evitar
1. **Error 400 al guardar:** Ocurre cuando POST duplica un registro
   - **Fix:** Actualizar lista de `existingRecords` después de cada POST
2. **Rate limit 429:** Demasiados requests en poco tiempo
   - **Fix:** Usar endpoints batch
3. **Propagación no funcionaba:** El tab General no propagaba a sorteos
   - **Fix:** Iterar por TODOS los draws disponibles

### 📁 Guías Creadas
| Guía | Descripción |
|------|-------------|
| `gsd/guides/deploy-workflow.md` | Proceso de deploy automático |
| `gsd/guides/batch-save-pattern.md` | Patrón para guardado en lote |
| `gsd/guides/ui-cloning-guide.md` | Clonar UI con Playwright |

---

**Fecha de última actualización:** 2026-02-07 03:37
