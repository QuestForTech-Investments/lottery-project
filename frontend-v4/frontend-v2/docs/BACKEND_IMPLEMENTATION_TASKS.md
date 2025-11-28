# Tareas de Implementación del Backend

Este archivo sirve como **contrato de comunicación** entre el frontend (ya implementado) y el backend (por implementar).

**Para el agente del backend**: Lee este archivo para saber exactamente qué endpoints implementar.

---

## 📋 Estado General

- **Frontend**: ✅ COMPLETADO - Todos los servicios implementados
- **Backend**: ⏳ PENDIENTE - Necesita implementar endpoints según especificación
- **Especificación**: Ver `/docs/API_ENDPOINTS_DOCUMENTATION.md`

---

## 🎯 Endpoints CRÍTICOS (Implementar Primero)

### 1. Autenticación (Alta Prioridad)
```
POST /api/auth/login
- Body: { username, password }
- Response: { token, user }
- Estado: ❌ NO IMPLEMENTADO
```

### 2. Usuarios
```
✅ Implementados en el backend según la documentación:
- GET /api/users
- GET /api/users/{userId}
- GET /api/users/{userId}/permissions
- POST /api/users/with-permissions
- PUT /api/users/{userId}
- PUT /api/users/{userId}/permissions
- PUT /api/users/{userId}/complete
- DELETE /api/users/{userId}
```

### 3. Betting Pools (CRÍTICO - Frontend implementado)
```
⚠️ Verificar implementación según especificación:

GET /api/betting-pools
- Query params: page, pageSize, search, zoneId, isActive
- Response: { success, data: [...], pagination: {...} }

GET /api/betting-pools/{id}
- Response: { success, data: {...} }

GET /api/betting-pools/next-code
- Response: { success, data: { nextCode: "B0001" } }

POST /api/betting-pools
- Body: Ver línea 142 de API_ENDPOINTS_DOCUMENTATION.md
- Validaciones:
  * bettingPoolName: requerido, 1-100 chars
  * branchCode: requerido, único, 1-20 chars
  * zoneId: requerido, debe existir
  * password: opcional, 6-100 chars si se proporciona userId

PUT /api/betting-pools/{id}
- Body: { bettingPoolName?, location?, reference?, comment? }
- NO permitir cambiar: branchCode, zoneId

DELETE /api/betting-pools/{id}
- Validar: Solo si no tiene usuarios (error 400 si tiene)

GET /api/betting-pools/{id}/users
- Response: { success, data: [...users] }
```

### 4. Zonas
```
✅ Implementados según documentación:
- GET /api/zones
- GET /api/zones/{id}
- GET /api/zones/{id}/bettingPools
- GET /api/zones/{id}/users
- GET /api/zones/stats
- POST /api/zones
- PUT /api/zones/{id}
- DELETE /api/zones/{id}
```

### 5. Permisos
```
✅ Implementados:
- GET /api/permissions
- GET /api/users/permissions/all
- GET /api/permissions/categories
- GET /api/permissions/{id}
- GET /api/permissions/{id}/roles
- GET /api/permissions/search
- GET /api/permissions/unassigned/{roleId}
- GET /api/permissions/stats
- POST /api/permissions
- PUT /api/permissions/{id}
- DELETE /api/permissions/{id}
```

### 6. Roles
```
✅ Implementados:
- GET /api/roles
- GET /api/roles/{id}
- GET /api/roles/{id}/permissions
- POST /api/roles
- PUT /api/roles/{id}
- POST /api/roles/{id}/permissions
- DELETE /api/roles/{id}/permissions/{permissionId}
- DELETE /api/roles/{id}
```

---

## 🔧 Configuraciones Requeridas

### CORS
```csharp
// En Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

app.UseCors("AllowAll");
```

### JWT Authentication
```csharp
// Configuración en appsettings.json
{
  "Jwt": {
    "Key": "your-secret-key-min-32-chars",
    "Issuer": "LotteryAPI",
    "Audience": "LotteryApp",
    "ExpiryInMinutes": 60
  }
}
```

### Puerto
```
API debe correr en: http://localhost:5000
Frontend corre en: http://localhost:4000 (configura proxy)
```

---

## 📐 Formato de Respuesta Estándar

Todos los endpoints deben retornar este formato:

### Éxito
```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "message": "Mensaje opcional"
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ] // Para errores de validación
}
```

### Paginación (para listas)
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

---

## 🔍 Validaciones Críticas

### Betting Pools
- ✅ `branchCode` debe ser único en toda la tabla
- ✅ `zoneId` debe existir en la tabla zones
- ✅ `bettingPoolName` requerido, 1-100 caracteres
- ✅ No permitir DELETE si tiene usuarios asociados

### Users
- ✅ `username` único
- ✅ `password` mínimo 6 caracteres
- ✅ Hash passwords con BCrypt
- ✅ `roleId` opcional, auto-asignar si no se proporciona
- ✅ `permissionIds` válidos y activos

### Zones
- ✅ `zoneName` único
- ✅ No permitir DELETE si tiene betting pools activos

---

## 🧪 Testing Recomendado

### Endpoint Testing
1. Usa Swagger UI en `http://localhost:5000/`
2. Health check: `http://localhost:5000/health`
3. API info: `http://localhost:5000/info`

### Postman Collection
```
Existe en: /LottoApi/Docs/Lottery_API_Complete_Collection.postman_collection.json
```

### Test Controller
```
Usar: GET /api/test/{entity}
Para verificar datos de prueba
```

---

## 📚 Referencias

| Documento | Ubicación | Propósito |
|-----------|-----------|-----------|
| **Especificación Completa** | `/docs/API_ENDPOINTS_DOCUMENTATION.md` | Todos los endpoints detallados |
| **Arquitectura Backend** | `/CLAUDE.md` | Tech stack, estructura, convenciones |
| **Schema Database** | `/LottoApi/Docs/complete_database_schema_v4.sql` | Estructura de BD |
| **Permisos System** | `/LottoApi/Docs/🎯 Sistema de Permisos Directos` | Sistema híbrido de permisos |

---

## 🚨 Problemas Conocidos del Frontend

### 1. branchCode vs bettingPoolCode
El frontend envía `branchCode` pero debería ser consistente con el naming.

### 2. Manejo de Errores
El frontend espera:
- Status 400: Error de validación
- Status 404: No encontrado
- Status 409: Conflicto (duplicado)
- Status 500: Error interno

### 3. Content-Type
El frontend valida `content-type: application/json` antes de parsear.
Asegúrate de que todos los endpoints retornen JSON válido.

---

## ✅ Checklist de Implementación

### Fase 1: Setup
- [ ] Configurar CORS
- [ ] Configurar JWT
- [ ] Verificar conexión a BD
- [ ] Puerto 5000 configurado

### Fase 2: Endpoints Críticos
- [ ] POST /api/auth/login
- [ ] Verificar todos los endpoints de betting-pools
- [ ] Verificar endpoint /betting-pools/next-code
- [ ] Validaciones de betting-pools

### Fase 3: Testing
- [ ] Probar con Postman collection
- [ ] Verificar respuestas JSON válidas
- [ ] Verificar códigos de status HTTP
- [ ] Probar validaciones

### Fase 4: Integración
- [ ] Levantar backend (puerto 5000)
- [ ] Levantar frontend (puerto 4000)
- [ ] Probar flujo completo de usuarios
- [ ] Probar flujo completo de betting pools

---

## 💬 Comunicación de Estado

**Para el agente del backend**: Cuando completes tareas, actualiza este archivo:

```markdown
## Estado de Implementación

### ✅ Completado (2025-10-22)
- [x] Usuarios CRUD
- [x] Zonas CRUD
- [x] Permisos CRUD
- [x] Roles CRUD

### 🔨 En Progreso
- [ ] Betting Pools endpoints

### ⏳ Pendiente
- [ ] Autenticación JWT
- [ ] Testing integración
```

---

**Última actualización**: 2025-10-22
**Creado por**: Agente Frontend
**Para**: Agente Backend
