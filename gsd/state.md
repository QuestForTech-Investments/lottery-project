# Estado del Proyecto

## Fase Actual
**Fase 4: Límites y Control** - ✅ COMPLETADA (incluyendo UI Clone)

## Progreso General
- **Módulos completados:** 12/23 (52%)
- **Módulos parciales:** 2/23 (9%)
- **Módulos pendientes:** 9/23 (39%)

## Último Commit
```
Pendiente - ⚡ Maximum optimization: Batch save for prizes and commissions
```
**Fecha:** 2026-02-07
**Estado:** ⏳ Listo para desplegar

---

## Cambios de Hoy (2026-02-07)

### ⚡ Maximum Optimization - Batch Save (Pendiente commit)
**Problema:** Guardar premios/comisiones desde tab General tomaba 90+ segundos (200+ requests secuenciales)

**Solución:**
1. **Backend:** Nuevos endpoints batch:
   - `POST /betting-pools/{id}/prizes-commissions/batch` - Comisiones en lote
   - `POST /betting-pools/{id}/draws/prize-config/batch` - Premios por sorteo en lote

2. **Frontend:** Modificado `useEditBettingPoolForm.ts`:
   - `saveCommissionConfigurations` - 1 request en vez de 200+ secuenciales
   - `savePrizeConfigurations` - 2 requests (general + batch draws) en vez de 70+

**Archivos Backend:**
- `api/src/LotteryApi/Controllers/BettingPoolPrizesCommissionsController.cs` - +95 líneas
- `api/src/LotteryApi/Controllers/DrawPrizeConfigController.cs` - +115 líneas
- `api/src/LotteryApi/DTOs/BettingPoolDto.cs` - +35 líneas (BatchCommissionItemDto, etc.)
- `api/src/LotteryApi/DTOs/DrawPrizeConfigDto.cs` - +45 líneas (BatchDrawPrizeConfigRequest, etc.)

**Archivos Frontend:**
- `frontend-v4/.../EditBettingPool/hooks/useEditBettingPoolForm.ts` - saveCommissionConfigurations y savePrizeConfigurations optimizados

**Mejora de rendimiento esperada:**
- Antes: 90+ segundos, 200+ requests
- Después: < 5 segundos, 2-3 requests

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

**Fecha de última actualización:** 2026-02-07 02:29
