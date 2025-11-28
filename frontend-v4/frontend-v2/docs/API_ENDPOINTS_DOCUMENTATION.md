# Documentación de Endpoints de API - Frontend

Este documento detalla todos los endpoints de la API que utiliza la aplicación frontend de Lottery Management System.

**Base URL**: `http://localhost:5000/api`

---

## Índice
- [Usuarios (Users)](#usuarios-users)
- [Zonas (Zones)](#zonas-zones)
- [Betting Pools](#betting-pools)
- [Permisos (Permissions)](#permisos-permissions)
- [Roles](#roles)
- [Logs](#logs)

---

## Usuarios (Users)

### GET `/users`
**Propósito**: Obtener lista de usuarios con paginación y filtros

**Parámetros de consulta**:
- `page` (número): Número de página
- `pageSize` (número): Elementos por página
- `search` (string): Búsqueda por nombre/username
- `roleId` (número): Filtrar por rol
- `zoneId` (número): Filtrar por zona

**Usado en**: `userService.getAllUsers()`

---

### GET `/users/{userId}`
**Propósito**: Obtener detalles de un usuario específico

**Parámetros de ruta**:
- `userId` (número): ID del usuario

**Usado en**: `userService.getUserById()`

---

### GET `/users/{userId}/permissions`
**Propósito**: Obtener permisos asignados a un usuario (incluye permisos de rol + permisos directos)

**Parámetros de ruta**:
- `userId` (número): ID del usuario

**Usado en**: `userService.getUserPermissions()`

---

### GET `/users/by-role/{roleId}`
**Propósito**: Obtener todos los usuarios que tienen un rol específico

**Parámetros de ruta**:
- `roleId` (número): ID del rol

**Usado en**: `userService.getUsersByRole()`

---

### GET `/users/by-zone/{zoneId}`
**Propósito**: Obtener todos los usuarios asignados a una zona

**Parámetros de ruta**:
- `zoneId` (número): ID de la zona

**Usado en**: `userService.getUsersByZone()`

---

### GET `/users/by-bettingPool/{bettingPoolId}`
**Propósito**: Obtener todos los usuarios asignados a un betting pool

**Parámetros de ruta**:
- `bettingPoolId` (número): ID del betting pool

**Usado en**: `userService.getUsersByBranch()`

---

### GET `/users/search?query={query}`
**Propósito**: Buscar usuarios por nombre, username, email, etc.

**Parámetros de consulta**:
- `query` (string): Término de búsqueda

**Usado en**:
- `userService.searchUsers()`
- `userService.checkUsernameAvailability()`

---

### POST `/users/with-permissions`
**Propósito**: Crear nuevo usuario con permisos directos (sistema híbrido)

**Body (JSON)**:
```json
{
  "username": "string (requerido)",
  "password": "string (requerido, min 6 chars)",
  "fullName": "string (opcional)",
  "email": "string (opcional)",
  "phone": "string (opcional)",
  "roleId": "number (opcional)",
  "zoneId": "number (opcional)",
  "bettingPoolId": "number (opcional)",
  "commissionRate": "number (opcional)",
  "isActive": "boolean (opcional, default: true)",
  "permissionIds": "array<number> (opcional)"
}
```

**Usado en**: `userService.createUser()`

---

### PUT `/users/{userId}`
**Propósito**: Actualizar información básica de usuario

**Parámetros de ruta**:
- `userId` (número): ID del usuario

**Body (JSON)**: Campos a actualizar (ej: fullName, email, phone, isActive, etc.)

**Usado en**:
- `userService.updateUser()`
- `userService.activateUser()` (con `{ isActive: true }`)

---

### PUT `/users/{userId}/permissions`
**Propósito**: Actualizar permisos directos de un usuario

**Parámetros de ruta**:
- `userId` (número): ID del usuario

**Body (JSON)**:
```json
{
  "permissionIds": [1, 2, 3, 4, ...]
}
```

**Usado en**: `userService.updateUserPermissions()`

---

### PUT `/users/{userId}/complete`
**Propósito**: Actualización completa de usuario (permisos, zona, betting pool, rol)

**Parámetros de ruta**:
- `userId` (número): ID del usuario

**Body (JSON)**:
```json
{
  "permissionIds": "array<number> (opcional)",
  "zoneId": "number (opcional)",
  "bettingPoolId": "number (opcional)",
  "roleId": "number (opcional)"
}
```

**Usado en**: `userService.updateUserComplete()`

---

### PUT `/users/{userId}/password`
**Propósito**: Cambiar contraseña de usuario

**Parámetros de ruta**:
- `userId` (número): ID del usuario

**Body (JSON)**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Usado en**: `userService.changePassword()`

---

### DELETE `/users/{userId}`
**Propósito**: Desactivar usuario (soft delete - marca como inactivo)

**Parámetros de ruta**:
- `userId` (número): ID del usuario

**Usado en**: `userService.deactivateUser()`

---

## Zonas (Zones)

### GET `/zones`
**Propósito**: Obtener lista de todas las zonas

**Parámetros de consulta**:
- `includeStats` (boolean): Incluir estadísticas de la zona

**Usado en**:
- `zoneService.getAllZones()`
- `zoneService.getActiveZones()` (filtra activas del lado cliente)

---

### GET `/zones/{zoneId}`
**Propósito**: Obtener detalles de una zona específica

**Parámetros de ruta**:
- `zoneId` (número): ID de la zona

**Usado en**:
- `zoneService.getZoneById()`
- `zoneService.getZoneFullDetails()` (parte de llamadas paralelas)

---

### GET `/zones/{zoneId}/bettingPools`
**Propósito**: Obtener todos los betting pools de una zona

**Parámetros de ruta**:
- `zoneId` (número): ID de la zona

**Usado en**:
- `zoneService.getZoneBranches()`
- `zoneService.getZoneFullDetails()` (parte de llamadas paralelas)

---

### GET `/zones/{zoneId}/users`
**Propósito**: Obtener todos los usuarios de una zona

**Parámetros de ruta**:
- `zoneId` (número): ID de la zona

**Usado en**:
- `zoneService.getZoneUsers()`
- `zoneService.getZoneFullDetails()` (parte de llamadas paralelas)

---

### GET `/zones/stats`
**Propósito**: Obtener estadísticas generales de todas las zonas

**Usado en**: `zoneService.getZonesStats()`

---

### POST `/zones`
**Propósito**: Crear nueva zona

**Body (JSON)**:
```json
{
  "zoneName": "string (requerido)",
  "description": "string (opcional)",
  "isActive": "boolean (opcional)"
}
```

**Usado en**: `zoneService.createZone()`

---

### PUT `/zones/{zoneId}`
**Propósito**: Actualizar información de zona

**Parámetros de ruta**:
- `zoneId` (número): ID de la zona

**Body (JSON)**: Campos a actualizar (zoneName, description, isActive)

**Usado en**: `zoneService.updateZone()`

---

### DELETE `/zones/{zoneId}`
**Propósito**: Desactivar zona (soft delete)

**Parámetros de ruta**:
- `zoneId` (número): ID de la zona

**Usado en**: `zoneService.deactivateZone()`

---

## Betting Pools

**Nota**: Anteriormente llamados "branches" o "bancas". Endpoint base: `/api/betting-pools`

### GET `/betting-pools`
**Propósito**: Listar betting pools con filtros y paginación

**Parámetros de consulta**:
- `page` (número): Número de página (default: 1)
- `pageSize` (número): Tamaño de página (default: 20)
- `search` (string): Búsqueda por nombre o código
- `zoneId` (número): Filtrar por zona
- `isActive` (boolean): Filtrar por estado activo/inactivo

**Usado en**: `bettingPoolService.getBettingPools()`

---

### GET `/betting-pools/{bettingPoolId}`
**Propósito**: Obtener detalles de un betting pool específico

**Parámetros de ruta**:
- `bettingPoolId` (número): ID del betting pool

**Usado en**: `bettingPoolService.getBettingPoolById()`

---

### GET `/betting-pools/next-code`
**Propósito**: Obtener el próximo código de betting pool disponible (para auto-completar)

**Respuesta**:
```json
{
  "nextCode": "B0001"
}
```

**Usado en**: `bettingPoolService.getNextBettingPoolCode()`

---

### GET `/betting-pools/{bettingPoolId}/users`
**Propósito**: Obtener usuarios asignados a un betting pool

**Parámetros de ruta**:
- `bettingPoolId` (número): ID del betting pool

**Usado en**: `bettingPoolService.getBettingPoolUsers()`

---

### POST `/betting-pools`
**Propósito**: Crear nuevo betting pool

**Body (JSON)**:
```json
{
  "bettingPoolName": "string (1-100 chars, requerido)",
  "branchCode": "string (1-20 chars, único, requerido)",
  "zoneId": "number (requerido)",
  "location": "string (max 255 chars, opcional)",
  "reference": "string (max 255 chars, opcional)",
  "comment": "string (opcional)",
  "userId": "number (opcional)",
  "password": "string (6-100 chars, opcional)"
}
```

**Validaciones**:
- `bettingPoolName`: Requerido, 1-100 caracteres
- `branchCode`: Requerido, único, 1-20 caracteres
- `zoneId`: Requerido, debe existir la zona
- `password`: Si se proporciona userId, opcional 6-100 caracteres

**Usado en**: `bettingPoolService.createBettingPool()`

---

### PUT `/betting-pools/{bettingPoolId}`
**Propósito**: Actualizar betting pool existente

**Parámetros de ruta**:
- `bettingPoolId` (número): ID del betting pool

**Body (JSON)**:
```json
{
  "bettingPoolName": "string (opcional)",
  "location": "string (opcional)",
  "reference": "string (opcional)",
  "comment": "string (opcional)"
}
```

**Nota**: No se puede cambiar el código (branchCode) ni la zona (zoneId) después de creado

**Usado en**: `bettingPoolService.updateBettingPool()`

---

### DELETE `/betting-pools/{bettingPoolId}`
**Propósito**: Eliminar betting pool (solo si no tiene usuarios)

**Parámetros de ruta**:
- `bettingPoolId` (número): ID del betting pool

**Validación**: Falla si el betting pool tiene usuarios asignados (error 400)

**Usado en**: `bettingPoolService.deleteBettingPool()`

---

## Permisos (Permissions)

### GET `/permissions`
**Propósito**: Obtener todos los permisos

**Parámetros de consulta**:
- `category` (string, opcional): Filtrar por categoría

**Usado en**:
- `permissionService.getAllPermissions()`
- `permissionService.getActivePermissions()` (filtra activos del lado cliente)

---

### GET `/users/permissions/all`
**Propósito**: Obtener lista plana de todos los permisos (endpoint correcto según docs)

**Usado en**: `permissionService.getAllPermissionsFlat()`

---

### GET `/permissions/categories`
**Propósito**: Obtener permisos agrupados por categoría

**Respuesta**: Lista de categorías con sus permisos

**Usado en**:
- `permissionService.getPermissionCategories()`
- `permissionService.getPermissionsGroupedByCategory()`

---

### GET `/permissions/{permissionId}`
**Propósito**: Obtener detalles de un permiso específico

**Parámetros de ruta**:
- `permissionId` (número): ID del permiso

**Usado en**: `permissionService.getPermissionById()`

---

### GET `/permissions/{permissionId}/roles`
**Propósito**: Obtener roles que tienen un permiso específico

**Parámetros de ruta**:
- `permissionId` (número): ID del permiso

**Usado en**: `permissionService.getPermissionRoles()`

---

### GET `/permissions/search?query={query}`
**Propósito**: Buscar permisos por nombre o código

**Parámetros de consulta**:
- `query` (string): Término de búsqueda

**Usado en**:
- `permissionService.searchPermissions()`
- `permissionService.checkPermissionExists()`

---

### GET `/permissions/unassigned/{roleId}`
**Propósito**: Obtener permisos no asignados a un rol específico

**Parámetros de ruta**:
- `roleId` (número): ID del rol

**Usado en**: `permissionService.getUnassignedPermissions()`

---

### GET `/permissions/stats`
**Propósito**: Obtener estadísticas de permisos

**Usado en**: `permissionService.getPermissionsStats()`

---

### POST `/permissions`
**Propósito**: Crear nuevo permiso

**Body (JSON)**:
```json
{
  "permissionCode": "string (requerido)",
  "permissionName": "string (requerido)",
  "category": "string (requerido)",
  "description": "string (opcional)",
  "isActive": "boolean (opcional)"
}
```

**Usado en**: `permissionService.createPermission()`

---

### PUT `/permissions/{permissionId}`
**Propósito**: Actualizar permiso

**Parámetros de ruta**:
- `permissionId` (número): ID del permiso

**Body (JSON)**: Campos a actualizar

**Usado en**: `permissionService.updatePermission()`

---

### DELETE `/permissions/{permissionId}`
**Propósito**: Desactivar permiso (soft delete)

**Parámetros de ruta**:
- `permissionId` (número): ID del permiso

**Usado en**: `permissionService.deactivatePermission()`

---

## Roles

### GET `/roles`
**Propósito**: Obtener todos los roles

**Parámetros de consulta**:
- `includePermissions` (boolean): Incluir permisos en la respuesta

**Usado en**:
- `roleService.getAllRoles()`
- `roleService.getActiveRoles()` (filtra activos del lado cliente)

---

### GET `/roles/{roleId}`
**Propósito**: Obtener detalles de un rol específico

**Parámetros de ruta**:
- `roleId` (número): ID del rol

**Usado en**:
- `roleService.getRoleById()`
- `roleService.getRoleFullDetails()` (parte de llamadas paralelas)

---

### GET `/roles/{roleId}/permissions`
**Propósito**: Obtener permisos asignados a un rol

**Parámetros de ruta**:
- `roleId` (número): ID del rol

**Usado en**:
- `roleService.getRolePermissions()`
- `roleService.getRoleFullDetails()` (parte de llamadas paralelas)

---

### POST `/roles`
**Propósito**: Crear nuevo rol

**Body (JSON)**:
```json
{
  "name": "string (requerido)",
  "description": "string (opcional)",
  "isActive": "boolean (opcional)",
  "permissionIds": "array<number> (opcional)"
}
```

**Usado en**: `roleService.createRole()`

---

### PUT `/roles/{roleId}`
**Propósito**: Actualizar información de rol

**Parámetros de ruta**:
- `roleId` (número): ID del rol

**Body (JSON)**: Campos a actualizar (name, description, isActive)

**Usado en**: `roleService.updateRole()`

---

### POST `/roles/{roleId}/permissions`
**Propósito**: Asignar permisos a un rol

**Parámetros de ruta**:
- `roleId` (número): ID del rol

**Body (JSON)**:
```json
{
  "permissionIds": [1, 2, 3, 4, ...]
}
```

**Usado en**: `roleService.assignPermissionsToRole()`

---

### DELETE `/roles/{roleId}/permissions/{permissionId}`
**Propósito**: Remover un permiso específico de un rol

**Parámetros de ruta**:
- `roleId` (número): ID del rol
- `permissionId` (número): ID del permiso

**Usado en**: `roleService.removePermissionFromRole()`

---

### DELETE `/roles/{roleId}`
**Propósito**: Desactivar rol (soft delete)

**Parámetros de ruta**:
- `roleId` (número): ID del rol

**Usado en**: `roleService.deactivateRole()`

---

## Logs

**Nota**: Actualmente deshabilitados en el frontend (API no disponible en desarrollo)

### POST `/logs/frontend`
**Propósito**: Enviar log individual del frontend al backend

**Body (JSON)**:
```json
{
  "level": "string (INFO, ERROR, etc.)",
  "category": "string",
  "message": "string",
  "timestamp": "string (ISO timestamp)",
  "data": "object (datos adicionales)"
}
```

**Estado**: DESHABILITADO - Comentado en código
**Usado en**: `logService.sendLogToAPI()`

---

### POST `/logs/frontend/batch`
**Propósito**: Enviar múltiples logs en batch

**Body (JSON)**:
```json
{
  "logs": [
    {
      "level": "string",
      "category": "string",
      "message": "string",
      "timestamp": "string",
      "data": "object"
    }
  ]
}
```

**Estado**: DESHABILITADO - Comentado en código
**Usado en**: `logService.sendLogsBatch()`

---

## Resumen por Módulo

### Total de Endpoints Utilizados: 58

| Módulo | GET | POST | PUT | DELETE | Total |
|--------|-----|------|-----|--------|-------|
| **Users** | 7 | 1 | 4 | 1 | **13** |
| **Zones** | 5 | 1 | 1 | 1 | **8** |
| **Betting Pools** | 4 | 1 | 1 | 1 | **7** |
| **Permissions** | 8 | 1 | 1 | 1 | **11** |
| **Roles** | 3 | 2 | 1 | 2 | **8** |
| **Logs** | 0 | 2 | 0 | 0 | **2** (deshabilitados) |

---

## Características Especiales

### 1. Sistema Híbrido de Permisos
El sistema soporta permisos tanto a nivel de **rol** como **directos** al usuario:
- Endpoint `/users/with-permissions` permite crear usuarios con permisos directos
- Endpoint `/users/{userId}/permissions` muestra permisos combinados (rol + directos)
- Endpoint `/users/{userId}/complete` permite actualización completa

### 2. Relación N:M Usuario-Zona
Un usuario puede pertenecer a múltiples zonas (desde v3.0):
- `/users/by-zone/{zoneId}` obtiene usuarios de una zona
- `/zones/{zoneId}/users` obtiene usuarios desde la zona

### 3. Soft Deletes
Todos los endpoints DELETE realizan **soft delete** (marcan como inactivo):
- Users: `isActive = false`
- Zones: `isActive = false`
- Permissions: `isActive = false`
- Roles: `isActive = false`
- Betting Pools: Eliminación real pero solo si no tiene usuarios

### 4. Paginación y Filtros
Endpoints de listado soportan:
- Paginación: `page`, `pageSize`
- Búsqueda: `search`
- Filtros: `roleId`, `zoneId`, `isActive`

### 5. Estadísticas
Varios endpoints ofrecen variantes con estadísticas:
- `/zones?includeStats=true`
- `/zones/stats`
- `/permissions/stats`
- `/roles?includePermissions=true`

---

## Configuración del Cliente API

**Base API Service** (`src/services/api.js`):
- Base URL: `http://localhost:5000/api` (configurable vía `VITE_API_BASE_URL`)
- Autenticación: Bearer token desde `localStorage.authToken`
- Content-Type: `application/json`
- Logging: Integrado con sistema de logs del frontend
- Manejo de errores: Consistente con status codes HTTP

---

## Notas de Implementación

1. **Autenticación**: Todos los endpoints requieren JWT Bearer token (excepto login)
2. **CORS**: Configurado en el backend para permitir todos los orígenes
3. **Validación**: El backend valida todos los campos requeridos
4. **Respuesta estándar**:
   ```json
   {
     "success": true/false,
     "data": {...},
     "message": "string (opcional)"
   }
   ```

---

**Última actualización**: 2025-10-22
**Versión API**: v4.0
**Versión Frontend**: v1.0
