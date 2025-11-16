# 🎰 Guía Completa para Probar el Sistema de Bancas de Lotería

## 📋 **Estado Actual del Sistema**

### ✅ **Servidores Activos:**
- **API REST:** `http://localhost:5000` ✅ FUNCIONANDO
- **Formulario React:** `http://localhost:5174` ✅ FUNCIONANDO  
- **LottoWebApp:** `http://localhost:3000` ✅ DISPONIBLE

---

## 🚀 **Métodos para Probar el Sistema**

### **1. 🌐 Prueba desde el Navegador (Recomendado)**

#### **Opción A: Formulario React Completo**
```
URL: http://localhost:5174
```
- **Características:** 8 pestañas completas, idéntico a la-numbers.apk.lol
- **Funcionalidades:** Auto-generación de códigos, plantillas, validaciones

#### **Opción B: LottoWebApp Empresarial**
```
URL: http://localhost:3000
```
- **Características:** Aplicación web completa con múltiples módulos
- **Incluye:** Dashboard, gestión de usuarios, administración de bancas

---

### **2. 🔧 Prueba desde Terminal/API (Para Desarrolladores)**

#### **A. Verificar Estado de la API:**
```bash
curl http://localhost:5000/api/test/health
```

#### **B. Crear Banca Directamente:**
```bash
curl -X POST http://localhost:5000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "branchName": "Mi Banca de Prueba",
    "branchCode": "LAN-TEST-999",
    "zoneId": 1,
    "assignedUserId": 1,
    "location": "Mi Ubicación",
    "reference": "REF-001",
    "comment": "Banca de prueba desde API"
  }'
```

#### **C. Listar Bancas Existentes:**
```bash
curl http://localhost:5000/api/branches
```

#### **D. Ver Usuarios Disponibles:**
```bash
curl http://localhost:5000/api/users
```

---

### **3. 📱 Prueba Paso a Paso del Formulario**

#### **Paso 1: Abrir el Formulario**
1. Ir a `http://localhost:5174`
2. Verás el título "Crear banca 'LAN-XXXX'" con código auto-generado

#### **Paso 2: Llenar la Pestaña General**
- **Nombre:** Escribir nombre de la banca
- **Número:** Auto-generado (LAN-XXXX)
- **Usuario:** Seleccionar de la lista desplegable
- **Ubicación:** Dirección física
- **Contraseña:** Si asignas usuario
- **Referencia:** Información adicional
- **Comentario:** Notas opcionales

#### **Paso 3: Explorar Otras Pestañas**
- **Configuración:** Límites y comisiones
- **Pies de página:** Textos para tickets
- **Premios & Comisiones:** Configuración de premios
- **Horarios de sorteos:** Horarios operacionales
- **Sorteos:** Seleccionar loterías activas
- **Estilos:** Colores y personalización
- **Gastos automáticos:** Gestión de gastos

#### **Paso 4: Usar Plantilla (Opcional)**
1. Scroll hacia abajo hasta "Copiar de banca plantilla"
2. Seleccionar una banca existente
3. Elegir campos a copiar
4. Hacer clic en "Copiar Configuración"

#### **Paso 5: Crear la Banca**
1. Hacer clic en el botón "CREAR"
2. Ver mensaje de éxito
3. El formulario se limpia automáticamente
4. Se genera nuevo código para la próxima banca

---

### **4. 🧪 Casos de Prueba Específicos**

#### **Caso 1: Creación Básica**
- Llenar solo campos obligatorios (Nombre)
- Verificar que se crea exitosamente

#### **Caso 2: Creación con Usuario**
- Asignar un usuario disponible
- Configurar contraseña
- Verificar asignación correcta

#### **Caso 3: Uso de Plantilla**
- Seleccionar banca existente como plantilla
- Copiar configuraciones específicas
- Verificar que los datos se copien correctamente

#### **Caso 4: Validaciones**
- Intentar crear sin nombre (debe mostrar error)
- Contraseñas que no coinciden
- Verificar mensajes de error

---

### **5. 🔍 Verificación de Resultados**

#### **A. Desde la API:**
```bash
# Ver la banca recién creada
curl http://localhost:5000/api/branches | jq '.data | sort_by(.branchId) | .[-1]'
```

#### **B. Desde la Base de Datos:**
- Las bancas se guardan en Azure SQL Database
- Cada banca tiene ID único auto-incrementado
- Se asigna automáticamente a la zona "Santo Domingo"

---

### **6. 🛠️ Solución de Problemas**

#### **Si el formulario no carga:**
```bash
# Reiniciar servidor React
cd /home/ubuntu/create-branch-form
npm run dev -- --port 5174 --host 0.0.0.0
```

#### **Si la API no responde:**
```bash
# Verificar estado de la API
curl http://localhost:5000/api/test/health
```

#### **Si hay errores de CORS:**
- La API está configurada para aceptar requests desde localhost
- Verificar que estés usando los puertos correctos

---

### **7. 📊 Datos de Prueba Disponibles**

#### **Usuarios Disponibles para Asignar:**
- cliente1 (ID: 1)
- test02 (ID: 4) 
- test999 (ID: 6)
- jorge2 (ID: 7)
- Y más... (ver con API /users)

#### **Bancas Existentes para Plantilla:**
- Banca Centro Santo Domingo
- Banca de Prueba
- Banca Test
- Y más... (ver con API /branches)

---

### **8. 🎯 Resultados Esperados**

#### **Después de Crear una Banca:**
- ✅ Mensaje de éxito verde
- ✅ Formulario se limpia automáticamente
- ✅ Nuevo código LAN-XXXX generado
- ✅ Banca visible en la base de datos
- ✅ Usuario asignado (si se seleccionó)

---

## 🎉 **¡Listo para Probar!**

El sistema está completamente funcional. Puedes usar cualquiera de estos métodos para probarlo. **Recomiendo empezar con el navegador en `http://localhost:5174` para la experiencia completa.**

### **URLs Principales:**
- **Formulario Completo:** http://localhost:5174
- **API REST:** http://localhost:5000/api
- **LottoWebApp:** http://localhost:3000

¡Disfruta probando el sistema! 🚀
