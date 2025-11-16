# CLAUDE.md - LottoWebApp V1

Este archivo proporciona contexto a Claude Code sobre el proyecto V1 del sistema de lotería.

## Información del Proyecto

**Versión:** V1 (Frontend Original)
**Puerto:** http://localhost:4200/
**Ubicación:** `/home/jorge/projects/LottoWebApp`
**Stack:** React 18 + Vite

## Estado Actual (2025-11-14)

### Trabajo Reciente Completado

#### 1. ✅ Fix: Missing Prize Input Fields (2025-11-14)
**Problema:** Inputs de premios no se mostraban en tab "Premios & Comisiones" → "General"
**Causa Raíz:** API devuelve `prizeTypes` pero frontend espera `prizeFields`
**Solución Aplicada:**
- Archivo: `src/services/prizeFieldService.js`
- Líneas 11-29: Transformación en `getPrizeFields()` - agrega `prizeFields` apuntando a `prizeTypes`
- Líneas 50-64: Transformación en `getBetTypeById()` - mismo patrón
- Mantiene compatibilidad con fallback existente en componentes
**Status:** ✅ FUNCIONANDO - Confirmado con Playwright test (screenshot: `/tmp/v1-premios-result.png`)
**Resultado:** 23 bet types con 50+ inputs visibles (Directo, Palé, Tripleta, Pick Two, etc.)

#### 2. Fix: Problema de Guardado Automático en Premios & Comisiones
**Problema:** Cada cambio en un campo de premio disparaba guardado automático de toda la banca
**Causa Raíz:** `onPrizeValuesLoaded` callback se ejecutaba cada vez que cambiaba de lotería, actualizando `initialFormData` y disparando guardado
**Solución Aplicada:**
- Archivo: `src/components/tabs/PremiosComisionesTab.jsx`
- Línea 186-189: Eliminada llamada innecesaria a `onPrizeValuesLoaded` en useEffect de carga de bet types
- Línea 210: Removido `onPrizeValuesLoaded` de dependencias del useEffect
- Ahora solo se llama UNA VEZ en la carga inicial (líneas 300-310)

#### 2. Fix: useEffect Excesivo en PremioConfigTab
**Problema:** Cada cambio en campo disparaba recarga de API
**Causa Raíz:** useEffect tenía `selectedSorteo` (objeto completo) como dependencia, cambiaba referencia cada render
**Solución Aplicada:**
- Archivo: `src/components/tabs/PremioConfigTab.jsx`
- Línea 110: Cambiado dependencia de `selectedSorteo` → `selectedSorteo?.sorteo_id`
- Solo se dispara cuando el ID realmente cambia, no por cambio de referencia

#### 3. Fix: Field Editing Behavior en PremioConfigTab
**Problema:** Campos mostraban 0 inmediatamente al editar, perdían decimales
**Causa Raíz:** `parseFloat()` se ejecutaba en `handleFieldChange`
**Solución Aplicada:**
- Línea 194: Mantener valores como strings durante edición
- Línea 212: Parse a número solo al guardar en API

#### 4. Mejoras: Mensaje de Éxito
**Agregado:** Banner de éxito con animación slideDown
**Archivo:** `src/assets/css/PremioConfig.css` (líneas 517-575)
**Funcionalidad:** Auto-hide después de 5 segundos

#### 5. Fix: IDs Mock vs Reales
**Problema:** Frontend usaba IDs mock (1,2,3) en lugar de IDs reales de BD (83,84,85)
**Solución:** Líneas 164-169 de PremioConfigTab.jsx actualizadas con IDs reales
**Fallback:** Implementado para cargar config general si draw config está vacío

### Problema Pendiente Investigación

**Síntoma:** Valores editados en tab "General" de Premios & Comisiones no se guardan
**Diagnóstico Agregado:**
- `EditBanca.jsx` línea 475: Log cuando se edita campo `general_*`
- `EditBanca.jsx` línea 919: Log detallado de comparación currentValue vs initialValue
- Usuario necesita ejecutar edición y compartir logs para diagnóstico

**Logs Esperados:**
```
📝 [PREMIO INPUT] Campo editado: general_... → 80
🔍 [PREMIO DEBUG] Campo: general_... {currentValue, initialValue, sonDiferentes, types}
```

## Archivos Clave Modificados

### 1. `src/components/tabs/PremioConfigTab.jsx`
**Propósito:** Configuración de premios por sorteo
**Cambios Recientes:**
- Línea 20: `successMessage` state
- Líneas 104-110: useEffect con `selectedSorteo?.sorteo_id`
- Líneas 164-169: IDs reales de sorteos
- Líneas 180-195: `handleFieldChange` mantiene strings
- Líneas 207-214: `handleSave` parsea a números
- Líneas 441-447: Banner de éxito
- Console logs para debugging con emojis 🔵🔴🟠

### 2. `src/components/tabs/PremiosComisionesTab.jsx`
**Propósito:** Tab principal de Premios & Comisiones con 70 loterías
**Cambios Recientes:**
- Línea 189: Comentada llamada a `onPrizeValuesLoaded`
- Línea 210: Removido de dependencias useEffect
- Previene guardado automático al cambiar loterías

### 3. `src/components/EditBanca.jsx`
**Propósito:** Componente principal de edición de banca
**Cambios Recientes:**
- Línea 475: Log cuando se edita campo `general_*`
- Línea 726: Log con stack trace en `handleSubmit`
- Línea 919: Log detallado de comparación de valores
- Líneas 712-722: `handlePrizeValuesLoaded` callback

### 4. `src/assets/css/PremioConfig.css`
**Cambios:** Líneas 517-575 - Estilos para mensajes éxito/error con animación

## Documentos de Diagnóstico

- `/tmp/premio-field-diagnostic.md` - Diagnóstico del problema de llamadas excesivas
- `/tmp/timepicker-implementation-summary.md` - Resumen implementación TimePicker

## Flujo de Guardado de Premios

```
Usuario edita campo → handleInputChange (EditBanca)
                    → setFormData con valor string
                    → NO dispara guardado automático

Usuario click "Guardar" → handleSubmit (EditBanca)
                        → hasPrizeDataChanged() verifica cambios
                        → Compara formData vs initialFormData
                        → Si hay cambios: llama patchBancaPrizeConfig
                        → Parsea strings a números antes de enviar
```

## Relación con V2

**V2 Frontend:** `/home/jorge/projects/Lottery-Project/LottoWebApp`
**Puerto V2:** http://localhost:4000/

Ambos frontends comparten la misma API:
- **API URL:** http://localhost:5000/
- **Ubicación:** `/home/jorge/projects/Lottery-Apis/src/LotteryApi`

## Próximos Pasos

1. **URGENTE:** Investigar por qué valores en tab "General" no se guardan
   - Recopilar logs de consola cuando usuario edita y guarda
   - Verificar si `currentValue !== initialValue` está funcionando
   - Verificar conversión de fieldCode (camelCase → SNAKE_CASE)

2. **Verificar:** TimePicker funcionando en ambos frontends
   - V1: TimePicker.jsx (formato AM/PM)
   - V2: TimePickerMUI.jsx (12h display → 24h API)

3. **Testing:** Confirmar que fix de guardado automático funciona correctamente

## Comandos Útiles

```bash
# Dev server V1
cd /home/jorge/projects/LottoWebApp && npm run dev

# Ver logs de API
# (API ya está corriendo en background)

# Verificar puertos
lsof -ti:4200  # V1 frontend
lsof -ti:5000  # API backend
```

## Credenciales de Prueba

**Login:**
- Usuario: `admin`
- Contraseña: `Admin123456` ✅ (Verificado con Playwright el 2025-11-14)

**Banca de Prueba:**
- ID: 9
- Nombre: admin
- Código: RB003333 (Referencia actualizada del testing)

## Notas Importantes

- ⚠️ NO eliminar console.logs de debugging hasta confirmar que problema de guardado está resuelto
- ⚠️ `initialFormData` se actualiza solo UNA VEZ en carga inicial, NO en cada cambio
- ⚠️ useEffect dependencies deben ser primitivos (IDs) no objetos completos para evitar re-renders
- ✅ HMR (Hot Module Replacement) funciona correctamente en puerto 4200

## Testing con Playwright (Actualizado 2025-11-14)

### Tests Ejecutados

#### ✅ Test 1: Login
- **Resultado:** EXITOSO
- **URL:** http://localhost:4200
- **Credenciales:** admin / Admin123456
- **API Call:** POST /api/auth/login
- **Navegación:** /dashboard
- **Screenshots:** 3 capturas en /tmp/v1/

#### ✅ Test 2: BANCAS → Lista
- **Resultado:** EXITOSO
- **URL:** http://localhost:4200/bancas/lista
- **API Calls:**
  - GET /api/zones
  - GET /api/betting-pools?page=1&pageSize=1000
- **Bancas visibles:** 8 bancas
- **Tabla:** 10 columnas (Número, Nombre, Referencia, Usuarios, Activa, Zona, Balance, Caída, Préstamos, Acciones)

#### ⚠️ Test 3: Edición de Banca #9
- **Resultado:** Pendiente
- **Observación:** Botón de editar (lápiz celeste) visible pero selector de Playwright necesita ajuste
- **Próximo paso:** Probar selectores alternativos

### Selectores de Playwright Verificados (V1)

```javascript
// Login - ✅ FUNCIONA
'input[placeholder*="Usuario" i]'
'input[placeholder*="Contraseña" i]'
'button:has-text("INICIAR SESIÓN")'

// Navegación - ✅ FUNCIONA
'text=BANCAS'
'text=Lista'

// Editar Banca - ⚠️ PENDIENTE
// Visualmente: Botón de lápiz celeste en última columna
'tr:has-text("admin") >> button'  // A probar
```

### Comparación con Frontend V2

**V2 (puerto 4000):**
- ✅ Login: EXITOSO
- ✅ BANCAS → Lista: EXITOSO
- ✅ Edición Banca #9: EXITOSO
- ✅ Modificación de Sorteos: EXITOSO (agregado "DIARIA 11AM")
- ✅ Persistencia: Verificada (2 → 3 sorteos)

**Diferencias UI:**
- V1: Bootstrap 5 + jQuery + Font Awesome
- V2: Material-UI + Emotion + Lucide Icons

**Reporte Completo:** `/tmp/COMPARACION_TESTING_V1_V2.md`
