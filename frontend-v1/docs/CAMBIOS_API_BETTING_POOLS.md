# 🔄 Actualización de Endpoints: Branches → Betting Pools

**Fecha:** 19 de Octubre, 2025
**Tipo:** Breaking Change - Actualización de rutas de API

---

## 📋 Resumen del Cambio

Los endpoints de la API han sido renombrados de **`/api/branches`** a **`/api/betting-pools`** para reflejar mejor la nomenclatura del dominio.

### Tabla de Cambios

| Método | Endpoint Anterior | Endpoint Nuevo | Descripción |
|--------|------------------|----------------|-------------|
| GET | `/api/branches` | `/api/betting-pools` | Listar betting pools |
| GET | `/api/branches/{id}` | `/api/betting-pools/{id}` | Obtener betting pool por ID |
| POST | `/api/branches` | `/api/betting-pools` | Crear betting pool |
| PUT | `/api/branches/{id}` | `/api/betting-pools/{id}` | Actualizar betting pool |
| DELETE | `/api/branches/{id}` | `/api/betting-pools/{id}` | Eliminar betting pool |
| GET | `/api/branches/{id}/users` | `/api/betting-pools/{id}/users` | Obtener usuarios del betting pool |
| GET | `/api/branches/next-code` | `/api/betting-pools/next-code` | Obtener siguiente código disponible |

---

## 🔧 Cambios en el Frontend

### Archivo Modificado

**`src/services/branchService.js`**

```javascript
// ❌ ANTES
const API_BASE_URL = '/api/branches';

// ✅ DESPUÉS
const API_BASE_URL = '/api/betting-pools';
```

### Componentes Afectados (Actualizados Automáticamente)

Los siguientes componentes usan `branchService.js` y se actualizarán automáticamente:

1. ✅ **CreateBanca.jsx** - Creación de bancas
   - Usa: `createBranch()`, `getNextBranchCode()`, `handleBranchError()`

2. ✅ **BancasList.jsx** - Listado de bancas
   - Usa: `getBranches()`, `handleBranchError()`

3. ✅ **EditBanca.jsx** (si existe) - Edición de bancas
   - Usa: `getBranchById()`, `updateBranch()`

### Componentes NO Afectados

Los siguientes componentes mencionan "branch" pero no hacen llamadas a la API:
- `EditUser.jsx` - Solo maneja asignación de usuarios
- `BranchSelector.jsx` - Componente de UI para selección
- `CreateUser.jsx` - Asignación de usuarios a bancas
- `TestToggleBranch.jsx` - Componente de prueba

---

## 🚀 Cambios en el Backend

### Controller Renombrado

**Archivo:** `LotteryAPI/Controllers/BranchesController.cs`

```csharp
// ❌ ANTES
[Route("api/[controller]")]
public class BranchesController : ControllerBase

// ✅ DESPUÉS
[Route("api/betting-pools")]
public class BettingPoolsController : ControllerBase
```

### Endpoints Disponibles

Todos los endpoints mantienen la misma funcionalidad, solo cambió la ruta base:

```
GET    /api/betting-pools                 - Listar con filtros y paginación
GET    /api/betting-pools/{id}            - Obtener por ID
POST   /api/betting-pools                 - Crear nuevo
PUT    /api/betting-pools/{id}            - Actualizar existente
DELETE /api/betting-pools/{id}            - Eliminar
GET    /api/betting-pools/{id}/users      - Obtener usuarios
GET    /api/betting-pools/next-code       - Obtener siguiente código
GET    /api/betting-pools/configuration   - Obtener opciones de configuración
```

---

## ✅ Verificación de Cambios

### Checklist de Testing

- [x] ✅ Actualizado `branchService.js` con nuevo endpoint base
- [x] ✅ Verificado que componentes usan el servicio (no fetch directo)
- [ ] ⏳ Reiniciar servidor de desarrollo frontend
- [ ] ⏳ Probar crear nueva banca
- [ ] ⏳ Probar listar bancas
- [ ] ⏳ Probar editar banca existente
- [ ] ⏳ Verificar que no hay errores 404 en consola

### Comando para Probar

```bash
# 1. Reiniciar frontend
npm run dev

# 2. Abrir navegador en http://localhost:5173

# 3. Probar las siguientes acciones:
- Ir a "Lista de Bancas" - debe cargar correctamente
- Crear una nueva banca - debe funcionar
- Editar una banca existente - debe funcionar
```

---

## 🐛 Posibles Errores

### Error 404 en Console

**Síntoma:**
```
GET http://localhost:5000/api/branches 404 (Not Found)
```

**Causa:** Frontend no actualizado o caché del navegador

**Solución:**
1. Verificar que `branchService.js` tiene `/api/betting-pools`
2. Limpiar caché del navegador (Ctrl + Shift + Del)
3. Hacer hard reload (Ctrl + F5)
4. Reiniciar servidor de desarrollo

### Error de CORS

**Síntoma:**
```
Access to fetch at 'http://localhost:5000/api/betting-pools' has been blocked by CORS
```

**Causa:** Backend no configurado para nuevos endpoints

**Solución:**
Verificar que la API tiene configurado CORS correctamente en `Program.cs`

---

## 📊 Impacto del Cambio

### Frontend
- ✅ **1 archivo modificado:** `branchService.js`
- ✅ **0 componentes modificados:** Todos usan el servicio
- ✅ **Impacto bajo:** Cambio centralizado

### Backend
- ✅ **1 controller renombrado:** `BettingPoolsController.cs`
- ✅ **Rutas actualizadas:** De `/api/branches` a `/api/betting-pools`
- ✅ **Funcionalidad:** Sin cambios, solo rutas

### Base de Datos
- ✅ **Sin cambios:** Las tablas siguen siendo `branches`
- ✅ **Modelos:** `Branch` sin cambios
- ✅ **DTOs:** `CreateBranchRequest`, `UpdateBranchRequest` sin cambios

---

## 🔄 Compatibilidad con Versiones Anteriores

⚠️ **BREAKING CHANGE:** Este es un cambio incompatible con versiones anteriores.

Si hay otros clientes consumiendo la API (móvil, desktop, etc.), deben actualizarse también.

### Migración Gradual (Opcional)

Si se requiere soporte para ambos endpoints temporalmente:

```csharp
// Backend: Soportar ambas rutas temporalmente
[Route("api/branches")]        // Deprecated
[Route("api/betting-pools")]   // Nuevo
public class BettingPoolsController : ControllerBase
{
    // ...
}
```

Luego deprecar `/api/branches` después de un período de transición.

---

## 📝 Notas Adicionales

### Nomenclatura

El cambio de "branches" a "betting-pools" refleja mejor la naturaleza del dominio:
- **Branch** (genérico) → **Betting Pool** (específico al negocio de lotería)

### Testing del Script Automatizado

Los scripts de testing también necesitan actualización:

**Archivo:** `lottery-api/LotteryAPI/test-configuration-fields.ps1`

```powershell
# Actualizar la URL en línea 11:
# ❌ ANTES
$ApiUrl = "http://localhost:5000/api/branches"

# ✅ DESPUÉS
$ApiUrl = "http://localhost:5000/api/betting-pools"
```

---

## ✅ Estado de Implementación

| Componente | Estado | Observaciones |
|-----------|--------|---------------|
| Frontend Service | ✅ Completado | branchService.js actualizado |
| Backend Controller | ✅ Completado | BettingPoolsController renombrado |
| Frontend Components | ✅ Completado | Usan servicio, no requieren cambios |
| Base de Datos | ✅ Sin cambios | Tablas mantienen nombre "branches" |
| Documentación API | ⏳ Pendiente | Actualizar docs de API |
| Scripts de Testing | ⏳ Pendiente | Actualizar test-configuration-fields.ps1 |

---

**Actualizado:** 19 de Octubre, 2025
**Responsable:** Claude Code
**Impacto:** Breaking Change - Requiere actualización de todos los clientes
