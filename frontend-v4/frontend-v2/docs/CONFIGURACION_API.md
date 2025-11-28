# ✅ Configuración Completa - Conexión a API

## 📡 Estado de la Configuración

### ✅ **TODO LISTO PARA CONECTAR A LA API**

---

## 🔧 Archivos Configurados

### **1. `.env` - Variables de Entorno** ✅
```env
VITE_API_BASE_URL=https://localhost:7001/api
```

**Ubicación:** Raíz del proyecto  
**Estado:** ✅ Creado y configurado  
**Nota:** Si cambias la URL de la API, edita este archivo y reinicia el servidor

---

### **2. `src/services/api.js` - Servicio Base** ✅

**Características configuradas:**
- ✅ Lee la URL de la API desde `.env`
- ✅ URL por defecto: `http://localhost:5000/api`
- ✅ Soporte para JWT tokens (automático desde localStorage)
- ✅ Manejo de errores HTTP (400, 401, 403, 404, 500)
- ✅ Manejo de errores de red
- ✅ Headers configurados: `Content-Type: application/json`
- ✅ Métodos: GET, POST, PUT, DELETE

**Ejemplo de uso:**
```javascript
import { api } from '@/services'

// GET request
const users = await api.get('/users')

// POST request
const newUser = await api.post('/users', userData)
```

---

### **3. Servicios Implementados** ✅

#### **userService.js**
```javascript
✅ getAllUsers(params)          // GET /users
✅ getUserById(userId)          // GET /users/{id}
✅ createUser(userData)         // POST /users
✅ updateUser(userId, data)     // PUT /users/{id}
✅ changePassword(userId, data) // PUT /users/{id}/password
✅ deactivateUser(userId)       // DELETE /users/{id}
```

#### **permissionService.js**
```javascript
✅ getAllPermissions()           // GET /permissions
✅ getPermissionCategories()     // GET /permissions/categories ← USADO EN FORMULARIO
✅ getPermissionById(id)         // GET /permissions/{id}
✅ searchPermissions(query)      // GET /permissions/search
```

#### **zoneService.js**
```javascript
✅ getAllZones()                 // GET /zones
✅ getActiveZones()              // GET /zones (filtrado) ← USADO EN FORMULARIO
✅ getZoneById(id)               // GET /zones/{id}
✅ getZoneBranches(zoneId)       // GET /zones/{id}/branches
```

#### **branchService.js**
```javascript
✅ getAllBranches()              // GET /branches
✅ getBranchesByZone(zoneId)     // GET /branches/by-zone/{id} ← USADO EN FORMULARIO
✅ getBranchById(id)             // GET /branches/{id}
```

---

## 🔌 Endpoints que Usa el Formulario

### **Al Cargar el Formulario:**
```
1. GET /api/permissions/categories
   → Carga los 61 permisos organizados en 9 categorías

2. GET /api/zones
   → Carga las zonas para el selector

Cuando se selecciona una zona:
3. GET /api/branches/by-zone/{zoneId}
   → Carga las sucursales de esa zona
```

### **Al Crear el Usuario:**
```
4. POST /api/users
   Body: {
     username: "...",
     password: "...",
     fullName: "...",
     email: "...",
     phone: "...",
     permissionIds: [1, 2, 3, ...],  ← Array de permisos
     zoneId: 1,
     branchId: 1,
     commissionRate: 2.50,
     isActive: true
   }
```

---

## 🔐 Autenticación (JWT)

### **Configurado y Listo:**
- ✅ El servicio `api.js` busca automáticamente el token en `localStorage.getItem('authToken')`
- ✅ Si existe token, lo incluye en headers: `Authorization: Bearer {token}`
- ✅ Si no existe token, hace requests sin autenticación

### **Para Guardar el Token (Login):**
```javascript
// Después del login exitoso:
localStorage.setItem('authToken', response.data.token)
```

### **Para Remover el Token (Logout):**
```javascript
localStorage.removeItem('authToken')
```

---

## 🌐 CORS - Configuración del Backend

### **Tu API debe permitir requests desde:**
```
http://localhost:3001  ← Puerto actual del frontend
```

### **En tu API .NET, verifica que tenga:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Y en el pipeline:
app.UseCors("AllowAll");
```

---

## 🧪 Cómo Probar la Conexión

### **1. Verifica que tu API esté corriendo:**
```bash
# Debe estar accesible en:
https://localhost:7001/api
```

### **2. Prueba un endpoint directamente:**
```bash
# En tu navegador o Postman:
GET https://localhost:7001/api/permissions/categories
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "category": "Acceso al sistema",
      "count": 3,
      "permissions": [...]
    }
  ]
}
```

### **3. Abre el formulario:**
```
http://localhost:3001/usuarios/crear
```

### **4. Abre DevTools (F12):**
- Ve a la pestaña **Network**
- Deberías ver requests a:
  - `permissions/categories`
  - `zones`
- Si ves errores **CORS**, configura el backend

---

## ⚠️ Troubleshooting

### **Problema 1: CORS Error**
```
Access to fetch at 'https://localhost:7001/api/...' from origin 
'http://localhost:3001' has been blocked by CORS policy
```

**Solución:**
- Configura CORS en tu API .NET (ver sección arriba)
- Asegúrate de que `AllowAnyOrigin()` esté configurado

---

### **Problema 2: SSL/Certificate Error**
```
net::ERR_CERT_AUTHORITY_INVALID
```

**Solución:**
- En el navegador, abre primero: `https://localhost:7001`
- Acepta el certificado autofirmado
- Luego vuelve a la aplicación

---

### **Problema 3: 404 Not Found**
```
GET https://localhost:7001/api/permissions/categories 404 (Not Found)
```

**Solución:**
- Verifica que el endpoint exista en tu API
- Revisa la documentación de tu API
- Verifica que la ruta sea correcta

---

### **Problema 4: Network Error**
```
Network Error
```

**Solución:**
- Verifica que la API esté corriendo
- Verifica la URL en `.env`
- Verifica que el puerto sea correcto (7001)

---

### **Problema 5: Variables de Entorno no Toman**
```
API URL sigue siendo http://localhost:5000/api
```

**Solución:**
1. Reinicia el servidor Vite (Ctrl+C y `npm run dev`)
2. Verifica que `.env` existe en la raíz
3. Verifica que la variable empiece con `VITE_`

---

## 📝 Checklist de Verificación

### **Frontend (Esta Aplicación):**
- [x] ✅ Archivo `.env` creado
- [x] ✅ URL de API configurada
- [x] ✅ Servicios implementados
- [x] ✅ Manejo de errores
- [x] ✅ Soporte para JWT
- [x] ✅ Formulario actualizado

### **Backend (Tu API .NET):**
- [ ] ⏳ API corriendo en `https://localhost:7001`
- [ ] ⏳ CORS configurado para localhost:3001
- [ ] ⏳ Endpoint `/api/permissions/categories` disponible
- [ ] ⏳ Endpoint `/api/zones` disponible
- [ ] ⏳ Endpoint `/api/branches/by-zone/{id}` disponible
- [ ] ⏳ Endpoint `/api/users` (POST) disponible

---

## 🚀 Siguientes Pasos

### **1. Inicia tu API Backend:**
```bash
cd H:\GIT\lottery-api\LotteryAPI
dotnet run
```

### **2. Verifica que esté corriendo:**
```
Debería mostrar algo como:
Now listening on: https://localhost:7001
Now listening on: http://localhost:5000
```

### **3. Abre el Frontend:**
```
http://localhost:3001/usuarios/crear
```

### **4. Observa la consola del navegador:**
- Deberías ver las requests a la API
- Si hay errores, aparecerán en la consola

---

## 📊 Estructura de Request/Response

### **Request al Crear Usuario:**
```json
POST https://localhost:7001/api/users
Content-Type: application/json

{
  "username": "testuser01",
  "password": "TestPass123!",
  "fullName": "Test User One",
  "email": "test@example.com",
  "phone": "809-555-0123",
  "permissionIds": [1, 2, 3, 17, 26],
  "zoneId": 1,
  "branchId": 1,
  "commissionRate": 2.50,
  "isActive": true
}
```

### **Response Esperada:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "username": "testuser01",
    "fullName": "Test User One",
    ...
  },
  "message": "User created successfully"
}
```

---

## ✅ Resumen

**TODO ESTÁ CONFIGURADO EN EL FRONTEND:**
- ✅ Archivo `.env` con URL de API
- ✅ Servicios para todos los endpoints
- ✅ Manejo de errores y autenticación
- ✅ Formulario integrado con API

**SOLO NECESITAS:**
1. ✅ Tener tu API corriendo
2. ✅ Configurar CORS en la API
3. ✅ Probar el formulario

---

**Fecha:** 13 de Octubre, 2025  
**Estado:** ✅ **CONFIGURACIÓN COMPLETA**  
**Próximo Paso:** Iniciar API Backend y Probar

