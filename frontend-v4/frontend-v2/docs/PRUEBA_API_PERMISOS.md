# 🧪 Página de Prueba - API de Permisos

## ✅ Componente Creado: TestPermissions

---

## 🎯 ¿Qué hace?

Una página completa de prueba que:
- ✅ Llama a la API: `GET /api/permissions/categories`
- ✅ Muestra el estado de la llamada (Loading/Success/Error)
- ✅ Muestra la respuesta RAW de la API
- ✅ Renderiza un **botón por cada permiso**
- ✅ Permite seleccionar/deseleccionar permisos (click en botones)
- ✅ Muestra contador de permisos seleccionados
- ✅ Guarda logs automáticamente en el Debug Panel
- ✅ Tiene botón de retry si falla

---

## 🚀 Cómo Acceder

### **URL de la Página de Prueba:**
```
http://localhost:3002/test/permissions
```

O navegando:
```
http://localhost:3002
(navega manualmente a) /test/permissions
```

---

## 📊 Lo que Verás

### **1. Header con Estado:**
```
🧪 Permissions API Test
Testing: GET /api/permissions/categories

┌─────────────────────────────────────┐
│ ✅ Success                          │
│ Categories: 9                       │
│ Total Permissions: 61               │
│ Selected: 0                         │
└─────────────────────────────────────┘
```

### **2. Raw API Response (Colapsable):**
```
📄 Raw API Response (click to expand)
▼ 
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

### **3. Permisos por Categoría:**

```
Acceso al sistema (3 permissions)
┌──────────────────────────────────────────┐
│ [Acceso al sistema] [Dashboard admin]   │
│ [Ver dashboard operativo]                │
└──────────────────────────────────────────┘

Transacciones (10 permissions)
┌──────────────────────────────────────────┐
│ [Crear ajustes] [Crear cobros]          │
│ [Crear pagos] [Manejar transacciones]   │
│ ... etc                                  │
└──────────────────────────────────────────┘

... (9 categorías en total)
```

### **4. Resumen de Selección:**
Cuando seleccionas permisos (click en botones):
```
✅ Selected Permissions (3)
Permission IDs: [1, 2, 3]

[Show Selected in Console]
```

---

## 🎨 Interactividad

### **Botones de Permiso:**
- **Estado Normal:** Borde azul, fondo transparente, texto gris
- **Hover:** Fondo azul, texto blanco
- **Seleccionado:** Fondo azul, texto blanco (permanente)

### **Click en un Botón:**
1. Botón cambia de color (se activa/desactiva)
2. Se agrega/quita el ID del array de seleccionados
3. Se actualiza el contador
4. Se registra en el log del Debug Panel

---

## 🐛 Debug & Logs

### **Logs Automáticos:**

Cuando abres la página:
```
[INFO] TEST_PERMISSIONS
Testing API: GET /permissions/categories

[SUCCESS] TEST_PERMISSIONS
✅ Loaded 61 permissions in 9 categories
```

Cuando seleccionas un permiso:
```
[INFO] TEST_PERMISSIONS
Selected: Acceso al sistema
{ permissionId: 1 }
```

Cuando deseleccionas:
```
[DEBUG] TEST_PERMISSIONS
Deselected: Acceso al sistema
{ permissionId: 1 }
```

---

## ✅ Casos de Prueba

### **Caso 1: API Funciona Correctamente**
```
Estado: ✅ Success
Ver: 
- Categories: 9
- Total Permissions: 61
- Todos los botones renderizados
- Click funciona
```

### **Caso 2: API No Responde**
```
Estado: ❌ Error
Ver: 
- Mensaje de error en rojo
- Botón "🔄 Retry"
- Logs en Debug Panel con detalles del error
```

### **Caso 3: CORS Error**
```
Estado: ❌ Error
Ver en Debug Panel:
[ERROR] NETWORK_ERROR
Failed to fetch
```

### **Caso 4: 404 Not Found**
```
Estado: ❌ Error
Ver en Debug Panel:
[ERROR] API_ERROR
404 /permissions/categories
```

---

## 📋 Checklist de Verificación

Cuando uses esta página:

- [ ] 1. Abre http://localhost:3002/test/permissions
- [ ] 2. Abre Debug Panel (🐛 botón)
- [ ] 3. Verifica estado: ¿Success o Error?
- [ ] 4. Si Success:
  - [ ] ¿Se muestran 9 categorías?
  - [ ] ¿Se muestran 61 permisos en total?
  - [ ] ¿Los botones se pueden clickear?
  - [ ] ¿Cambian de color al seleccionar?
  - [ ] ¿El contador actualiza?
- [ ] 5. Si Error:
  - [ ] Lee el mensaje de error
  - [ ] Revisa logs en Debug Panel
  - [ ] Identifica el problema (API, CORS, 404, etc.)
  - [ ] Corrige según el error
  - [ ] Click en "🔄 Retry"

---

## 🔍 Interpretación de Resultados

### **✅ TODO BIEN:**
```
Estado: ✅ Success
Categories: 9
Total Permissions: 61
```
**Significa:** 
- API está corriendo
- Endpoint existe
- CORS configurado
- Datos correctos

**Próximo paso:**
- Probar el formulario de crear usuario
- Los permisos deberían cargar allí también

---

### **❌ ERROR: Network Error**
```
Estado: ❌ Error
Message: Failed to fetch

Logs:
[ERROR] NETWORK_ERROR
Cannot connect to https://localhost:7001/api/permissions/categories
```
**Significa:**
- API no está corriendo O
- URL incorrecta O
- Certificado SSL no aceptado

**Solución:**
1. Verificar API esté corriendo en https://localhost:7001
2. Verificar .env tiene URL correcta
3. Aceptar certificado SSL en navegador

---

### **❌ ERROR: CORS**
```
Estado: ❌ Error

Console (F12):
Access to fetch at 'https://localhost:7001/...' from origin 
'http://localhost:3002' has been blocked by CORS policy
```
**Significa:**
- API no tiene CORS configurado para localhost:3002

**Solución:**
Configurar CORS en la API .NET

---

### **❌ ERROR: 404**
```
Estado: ❌ Error

Logs:
[ERROR] API_ERROR
404 /permissions/categories
```
**Significa:**
- Endpoint no existe en la API

**Solución:**
- Verificar que el endpoint esté implementado
- Verificar la ruta sea correcta

---

## 🎯 Ejemplo de Uso Completo

### **Paso 1:** Abre la página de prueba
```
http://localhost:3002/test/permissions
```

### **Paso 2:** Observa el estado
```
Si ves "✅ Success" → Continúa
Si ves "❌ Error" → Revisa logs y corrige
```

### **Paso 3:** Expande "Raw API Response"
```
Click en "📄 Raw API Response"
Verifica la estructura de datos
```

### **Paso 4:** Prueba selección
```
Click en varios botones de permisos
Observa que cambian de color
Verifica que el contador actualiza
```

### **Paso 5:** Abre Debug Panel
```
Click en 🐛 Debug
Filtra por "TEST_PERMISSIONS"
Ve todos los logs de esta página
```

### **Paso 6:** Exporta logs si necesitas
```
Debug Panel → Export
Se descarga archivo con todos los logs
```

---

## 💡 Ventajas de Esta Página

✅ **Visual:** Ves inmediatamente si funciona o no  
✅ **Detallada:** Raw response + logs completos  
✅ **Interactiva:** Puedes probar selección de permisos  
✅ **Debug:** Logs automáticos de todo  
✅ **Isolada:** No afecta otras partes de la app  
✅ **Retry:** Fácil volver a intentar si falla  

---

## 📝 Datos que Obtendrás

Si la API funciona, verás:

```json
{
  "success": true,
  "data": [
    {
      "category": "Acceso al sistema",
      "count": 3,
      "permissions": [
        {
          "permissionId": 1,
          "permissionCode": "ACCESS_SYSTEM",
          "permissionName": "Acceso al sistema",
          "name": "Acceso al sistema"
        },
        ...
      ]
    },
    {
      "category": "Transacciones",
      "count": 10,
      "permissions": [...]
    },
    ...
  ]
}
```

---

## 🚀 Después de Probar

Si esta página funciona correctamente:

✅ **Significa que:**
- La API responde
- El servicio `permissionService` funciona
- La conexión está bien
- CORS está configurado

✅ **Próximo paso:**
- Ir al formulario de crear usuario: `/usuarios/crear`
- Debería cargar los mismos permisos
- Si no carga, revisar logs del componente CreateUser

---

## 🎨 Vista Previa

```
┌─────────────────────────────────────────────────────┐
│  🧪 Permissions API Test                            │
│  Testing: GET /api/permissions/categories           │
│                                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ ✅ Success                                    │ │
│  │ Categories: 9                                 │ │
│  │ Total Permissions: 61                         │ │
│  │ Selected: 3                                   │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
│  📄 Raw API Response (click to expand)             │
│  ▼ { "success": true, "data": [...] }              │
│                                                      │
│  ───────────────────────────────────────────────────│
│                                                      │
│  Acceso al sistema (3 permissions)                  │
│  ┌───────────────────────────────────────────────┐ │
│  │ [Acceso al sistema] [Dashboard admin]        │ │
│  │ [Ver dashboard operativo]                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
│  Transacciones (10 permissions)                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ [Crear ajustes] [Crear cobros] [Crear pagos] │ │
│  │ [Manejar transacciones] ...                   │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
│  ... (7 categorías más)                             │
│                                                      │
│  ✅ Selected Permissions (3)                        │
│  Permission IDs: [1, 2, 3]                          │
│  [Show Selected in Console]                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

**Página Creada:** ✅  
**Ruta:** `/test/permissions`  
**URL Completa:** `http://localhost:3002/test/permissions`  
**Estado:** ✅ **LISTA PARA USAR**

---

**¡Abre la página ahora y ve qué pasa!** 🚀

