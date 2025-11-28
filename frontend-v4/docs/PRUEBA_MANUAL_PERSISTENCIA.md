# ✅ Prueba Manual - Persistencia de Cambios en Editar Banca

## 🎯 Objetivo
Verificar que los cambios en configuración de banca **persisten** después de guardar.

## 📋 Pasos para Probar

### Test 1: Cambios en Datos Básicos (Tab General)

1. **Ir a http://localhost:4000**
2. **Hacer login** con tus credenciales
3. **Ir a Bancas → Lista de Bancas**
4. **Hacer clic en "Editar"** en la Banca #9
5. **En el tab "General":**
   - Cambiar el nombre de la banca a: `BANCA TEST ${hora actual}`
   - Anotar el nuevo nombre
6. **Hacer clic en "Guardar Cambios"**
7. **Verificar:**
   - ✅ Aparece mensaje: "Banca actualizada exitosamente"
   - ✅ NO se redirige a lista (te quedas en el formulario)
   - ✅ El nombre sigue mostrando el nuevo valor
8. **Refrescar la página (F5)**
9. **Verificar:**
   - ✅ El nombre todavía muestra el nuevo valor (NO revirtió al original)

### Test 2: Cambios en Configuración (Tab Configuración)

1. **Ir a http://localhost:4000/bettingPools/edit/9**
2. **Ir al tab "Configuración"**
3. **Cambiar "Límite de Venta Diaria":**
   - Anotar el valor actual
   - Cambiar a: `15000.50`
4. **Hacer clic en "Guardar Cambios"**
5. **Verificar:**
   - ✅ Aparece mensaje: "Banca actualizada exitosamente"
   - ✅ NO se redirige a lista
6. **Refrescar la página (F5)**
7. **Ir de nuevo al tab "Configuración"**
8. **Verificar:**
   - ✅ "Límite de Venta Diaria" muestra: `15000.50` (NO revirtió al original)

### Test 3: Verificar Llamadas a la API (DevTools)

1. **Abrir DevTools (F12)**
2. **Ir a tab "Network"**
3. **Filtrar por: "betting-pools"**
4. **Ir a http://localhost:4000/bettingPools/edit/9**
5. **Hacer un cambio cualquiera y guardar**
6. **En Network, verificar que aparecen:**
   - ✅ `PUT /api/betting-pools/9` (datos básicos)
   - ✅ `POST /api/betting-pools/9/config` (configuración)
   - Ambos deben retornar status **200 OK**

### Test 4: Verificar Console Logs

1. **Abrir DevTools (F12) → tab "Console"**
2. **Hacer un cambio y guardar**
3. **Verificar que aparecen estos logs:**
   ```
   🚀 Starting save operation...
   📤 Calling 2 endpoints in parallel...
     - PUT /api/betting-pools/9 {...}
     - POST /api/betting-pools/9/config {...}
   ✅ Basic data response: {success: true, ...}
   ✅ Config response: {success: true, ...}
   ✅ initialFormData updated with new values
   ✅ Save operation completed successfully in XXms
   ```

## 🐛 Problema que se SOLUCIONÓ

### Antes (❌ Problema):
1. Editar campo de configuración (ej: "Límite de Venta Diaria")
2. Guardar → Aparece éxito
3. Refrescar página
4. ❌ El valor revierte al original

**Causa:**
- Frontend enviaba TODO al endpoint `PUT /api/betting-pools/9`
- Backend ignoraba campos de configuración (no están en el DTO)
- `initialFormData` no se actualizaba después de guardar

### Ahora (✅ Solución):
1. Frontend separa datos en DOS payloads
2. Llama DOS endpoints en paralelo:
   - `PUT /api/betting-pools/9` → Datos básicos (8 campos)
   - `POST /api/betting-pools/9/config` → Configuración (3 sub-objetos)
3. Actualiza `initialFormData` después de guardar exitoso
4. ✅ Los valores **persisten** al refrescar

## 📊 Resultado Esperado

Si la solución funciona correctamente:
- ✅ Todos los cambios persisten después de refrescar
- ✅ Se llaman ambos endpoints (PUT y POST)
- ✅ Aparece mensaje de éxito sin redirección
- ✅ Console logs muestran "initialFormData updated"

## 🚨 Si NO Funciona

Verificar:
1. **Dev server corriendo:** `npm run dev` en LottoWebApp
2. **API corriendo:** Backend en http://localhost:5000
3. **Console logs:** ¿Hay errores en rojo?
4. **Network tab:** ¿Ambas llamadas retornan 200?
5. **Archivo modificado:** `/home/jorge/projects/Lottery-Project/LottoWebApp/src/components/features/betting-pools/EditBettingPool/hooks/useEditBettingPoolForm.js` líneas 577-720

---

## 🔧 Archivos Modificados

1. `LottoWebApp/src/services/bettingPoolService.js`
   - ✅ Añadida función `updateBettingPoolConfig` (líneas 296-339)

2. `LottoWebApp/src/components/features/betting-pools/EditBettingPool/hooks/useEditBettingPoolForm.js`
   - ✅ Import actualizado (línea 3)
   - ✅ handleSubmit reescrito (líneas 577-720)
   - ✅ State `successMessage` (línea 206)

3. `LottoWebApp/src/components/features/betting-pools/EditBettingPool/index.jsx`
   - ✅ Success alert inline (líneas 96-103)
