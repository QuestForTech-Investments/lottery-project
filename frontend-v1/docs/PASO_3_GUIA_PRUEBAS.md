# 🧪 Paso 3: Guía de Pruebas - Campos de Configuración

**Fecha:** 19 de Octubre, 2025
**Objetivo:** Probar que los 10 campos nuevos se guardan y recuperan correctamente

---

## 🚀 Opción 1: Testing Automatizado con PowerShell

### Prerrequisitos

1. **API corriendo** en `https://localhost:7001` o `http://localhost:7001`
2. **Usuario administrador** creado en el sistema

### Ejecutar el Script de Testing

```powershell
# Desde PowerShell (Windows)
cd H:\GIT\lottery-api\LotteryAPI
.\test-configuration-fields.ps1
```

**Parámetros opcionales:**
```powershell
.\test-configuration-fields.ps1 -ApiUrl "https://localhost:7001" -TestUsername "admin" -TestPassword "Admin123!"
```

### ¿Qué hace el script?

1. ✅ **Verifica conectividad** con la API
2. ✅ **Se autentica** usando credenciales admin
3. ✅ **Crea una banca de prueba** con todos los 10 campos nuevos:
   - `smsOnly = true`
   - `enableRecharges = true`
   - `printRechargeReceipt = false`
   - `allowPasswordChange = true`
   - `cancelMinutes = 45`
   - `dailyCancelTickets = 10`
   - `maxCancelAmount = 500.00`
   - `maxTicketAmount = 1000.00`
   - `maxDailyRecharge = 200.00`
   - `paymentMode = "BANCA"`
4. ✅ **Obtiene la banca** y verifica que todos los campos se retornan
5. ✅ **Actualiza algunos campos** con nuevos valores
6. ✅ **Verifica la actualización** fue exitosa

### Resultado Esperado

```
=== API Testing: Configuration Fields ===
API URL: https://localhost:7001

Step 1: Testing API connectivity...
✅ API is reachable

Step 2: Authenticating...
✅ Authentication successful

Step 3: Creating test branch with all configuration fields...
✅ Branch created successfully!
   Branch ID: 123
   Branch Code: TEST-5678

Step 4: Retrieving branch to verify all fields...
✅ Branch retrieved successfully!

=== VERIFYING NEW CONFIGURATION FIELDS ===

Additional Toggles:
  ✅ smsOnly: True
  ✅ enableRecharges: True
  ✅ printRechargeReceipt: False
  ✅ allowPasswordChange: True

Limits and Timeouts:
  ✅ cancelMinutes: 45
  ✅ dailyCancelTickets: 10
  ✅ maxCancelAmount: 500
  ✅ maxTicketAmount: 1000
  ✅ maxDailyRecharge: 200

Payment Configuration:
  ✅ paymentMode: BANCA

🎉 ALL REQUIRED FIELDS ARE PRESENT!

Step 5: Updating branch with modified configuration...
✅ Branch updated successfully!

Step 6: Verifying update...
Updated values:
  smsOnly: False (expected: False)
  enableRecharges: False (expected: False)
  cancelMinutes: 60 (expected: 60)
  maxTicketAmount: 2000 (expected: 2000)
  paymentMode: GRUPO (expected: GRUPO)

✅ All updates verified successfully!

=== TESTING COMPLETED ===
```

---

## 🖱️ Opción 2: Pruebas Manuales desde el Frontend

### Paso A: Iniciar la API

```bash
# Terminal 1: Iniciar API
cd H:\GIT\lottery-api\LotteryAPI
dotnet run
```

### Paso B: Iniciar el Frontend (si no está corriendo)

```bash
# Terminal 2: Iniciar Frontend
cd H:\GIT\LottoWebApp
npm run dev
```

### Paso C: Crear Banca con Configuración Completa

1. **Abrir el navegador** en `http://localhost:5173`
2. **Iniciar sesión** como administrador
3. **Ir a "Crear Banca"**
4. **Llenar Tab General:**
   - Nombre de Banca: "Banca de Prueba Config"
   - Código: "TEST-CONFIG-001"
   - Usuario: "testuser"
   - Contraseña: "TestPass123"
   - Zona: "Default"
   - Ubicación: "Dirección de prueba"
   - Referencia: "Referencia de prueba"
   - Comentario: "Probando campos de configuración"

5. **Ir a Tab Configuración y llenar:**

   **Configuración Financiera:**
   - Límite de Crédito: 5000
   - Balance Desactivación: 100
   - Límite Venta Diaria: 10000
   - Límite Balance Diario: 15000
   - Balance Adicional Temporal: 500

   **Configuración Operativa:**
   - Tipo de Caída: OFF
   - Modo de Impresión: DRIVER
   - Proveedor de Descuento: GRUPO
   - Modo de Descuento: OFF

   **Toggles:**
   - ✅ Control de Tickets Ganadores
   - ✅ Permitir Jackpot
   - ✅ Impresión Habilitada
   - ❌ Imprimir Copia de Ticket
   - **✅ SMS Only** ⭐
   - **✅ Habilitar Recargas** ⭐
   - **❌ Imprimir Recibo de Recarga** ⭐
   - **✅ Permitir Cambio de Contraseña** ⭐

   **Límites y Timeouts:**
   - **Minutos para Cancelar: 45** ⭐
   - **Tickets Cancelables por Día: 10** ⭐
   - **Monto Máximo a Cancelar: 500** ⭐
   - **Monto Máximo por Ticket: 1000** ⭐
   - **Límite Recarga Telefónica Diaria: 200** ⭐

   **Configuración de Pago:**
   - **Preferencia de Límite: BANCA** ⭐

6. **Guardar la banca**

### Paso D: Verificar en la Base de Datos

Ejecutar el script de verificación:

```powershell
cd H:\GIT\lottery-api\LotteryAPI
.\verify_branches_columns.ps1
```

O usar SQL directamente:

```sql
-- Ver la banca recién creada
SELECT
    branch_id,
    branch_name,
    sms_only,
    enable_recharges,
    print_recharge_receipt,
    allow_password_change,
    cancel_minutes,
    daily_cancel_tickets,
    max_cancel_amount,
    max_ticket_amount,
    max_daily_recharge,
    payment_mode
FROM branches
WHERE branch_name = 'TEST-CONFIG-001';
```

### Paso E: Editar y Verificar Actualización

1. **Abrir la banca** para editar
2. **Verificar que se carguen todos los valores** correctamente en el formulario
3. **Modificar algunos campos:**
   - SMS Only: ❌ (desactivar)
   - Minutos para Cancelar: 60
   - Monto Máximo por Ticket: 2000
   - Preferencia de Límite: GRUPO
4. **Guardar cambios**
5. **Reabrir para verificar** que los cambios se guardaron

---

## 🔍 Opción 3: Pruebas con Postman/Insomnia

### Test 1: Crear Banca

**Request:**
```http
POST https://localhost:7001/api/branches
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "branchName": "Banca Test Config",
  "branchCode": "TEST-9999",
  "username": "testuser",
  "password": "TestPass123",
  "zoneId": 6,
  "location": "Test Location",
  "reference": "Test Reference",
  "comment": "Testing configuration fields",

  "creditLimit": 5000.00,
  "deactivationBalance": 100.00,
  "dailySaleLimit": 10000.00,
  "dailyBalanceLimit": 15000.00,
  "temporaryAdditionalBalance": 500.00,

  "fallType": "OFF",
  "printMode": "DRIVER",
  "discountProvider": "GRUPO",
  "discountMode": "OFF",

  "controlWinningTickets": true,
  "allowJackpot": true,
  "printEnabled": true,
  "printTicketCopy": false,

  "smsOnly": true,
  "enableRecharges": true,
  "printRechargeReceipt": false,
  "allowPasswordChange": true,

  "cancelMinutes": 45,
  "dailyCancelTickets": 10,
  "maxCancelAmount": 500.00,
  "maxTicketAmount": 1000.00,
  "maxDailyRecharge": 200.00,

  "paymentMode": "BANCA"
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "branchId": 123,
    "branchCode": "TEST-9999",
    "message": "Branch created successfully"
  }
}
```

### Test 2: Obtener Banca

**Request:**
```http
GET https://localhost:7001/api/branches/123
Authorization: Bearer {TOKEN}
```

**Respuesta Esperada (fragmento):**
```json
{
  "success": true,
  "data": {
    "branchId": 123,
    "branchName": "Banca Test Config",
    "branchCode": "TEST-9999",

    "smsOnly": true,
    "enableRecharges": true,
    "printRechargeReceipt": false,
    "allowPasswordChange": true,

    "cancelMinutes": 45,
    "dailyCancelTickets": 10,
    "maxCancelAmount": 500.00,
    "maxTicketAmount": 1000.00,
    "maxDailyRecharge": 200.00,

    "paymentMode": "BANCA"
  }
}
```

### Test 3: Actualizar Banca

**Request:**
```http
PUT https://localhost:7001/api/branches/123
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "smsOnly": false,
  "cancelMinutes": 60,
  "maxTicketAmount": 2000.00,
  "paymentMode": "GRUPO"
}
```

---

## ✅ Checklist de Validación

Después de ejecutar las pruebas, verifica lo siguiente:

### Crear Banca
- [ ] La banca se crea sin errores
- [ ] Se retorna un `branchId` válido
- [ ] El código de banca es único

### Campos se Guardan Correctamente
- [ ] `smsOnly` se guarda con el valor correcto
- [ ] `enableRecharges` se guarda con el valor correcto
- [ ] `printRechargeReceipt` se guarda con el valor correcto
- [ ] `allowPasswordChange` se guarda con el valor correcto
- [ ] `cancelMinutes` se guarda con el valor correcto
- [ ] `dailyCancelTickets` se guarda con el valor correcto
- [ ] `maxCancelAmount` se guarda con el valor correcto
- [ ] `maxTicketAmount` se guarda con el valor correcto
- [ ] `maxDailyRecharge` se guarda con el valor correcto
- [ ] `paymentMode` se guarda con el valor correcto

### GET Retorna Campos
- [ ] El endpoint GET retorna todos los 10 campos nuevos
- [ ] Los valores coinciden con los enviados en el POST
- [ ] Los campos nullable retornan `null` correctamente si no se enviaron

### Actualización Funciona
- [ ] El endpoint PUT acepta los 10 campos nuevos
- [ ] Los valores se actualizan correctamente en la BD
- [ ] Un GET posterior muestra los valores actualizados

### Base de Datos
- [ ] Ejecutar query SQL y verificar que los valores están en la BD
- [ ] Los tipos de datos son correctos (BIT, INT, DECIMAL, NVARCHAR)

---

## 🐛 Troubleshooting

### Error: "API is not reachable"
**Solución:**
1. Verificar que la API esté corriendo:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like '*dotnet*'}
   ```
2. Iniciar la API:
   ```bash
   cd H:\GIT\lottery-api\LotteryAPI
   dotnet run
   ```

### Error: "Authentication failed"
**Solución:**
1. Verificar credenciales de admin en la base de datos
2. Crear superusuario si es necesario:
   ```powershell
   .\create-superuser.ps1
   ```

### Error: "Column does not exist"
**Solución:**
1. Verificar que las 10 columnas existan en la BD:
   ```powershell
   .\verify_branches_columns.ps1
   ```
2. Si faltan columnas, ejecutar el script de migración:
   ```sql
   -- En SQL Server Management Studio
   USE LottoTest;
   GO
   -- Ejecutar: add_missing_configuration_columns.sql
   ```

### Error: "Property not found in model"
**Solución:**
1. Verificar que el backend esté actualizado
2. Recompilar la API:
   ```bash
   cd H:\GIT\lottery-api\LotteryAPI
   dotnet clean
   dotnet build
   ```

### Campos no aparecen en el frontend
**Solución:**
1. Verificar que el frontend esté actualizado (CreateBanca.jsx)
2. Limpiar cache del navegador (Ctrl+Shift+Del)
3. Reiniciar el servidor de desarrollo:
   ```bash
   cd H:\GIT\LottoWebApp
   npm run dev
   ```

---

## 📊 Resultados Esperados

Después de las pruebas exitosas, deberías ver:

1. **Backend:** ✅ Acepta los 10 campos nuevos sin errores
2. **Base de Datos:** ✅ Guarda los 10 campos correctamente
3. **API GET:** ✅ Retorna los 10 campos en la respuesta
4. **API PUT:** ✅ Actualiza los 10 campos correctamente
5. **Frontend:** ✅ Carga y muestra los valores al editar

---

## 🎯 Siguiente Paso

Una vez validado que todo funciona correctamente:

1. **Eliminar bancas de prueba** si fueron creadas con códigos de test
2. **Actualizar documentación** de la API si es necesario
3. **Notificar al equipo** que la funcionalidad está lista
4. **Cerrar el ticket** o issue relacionado

---

**Actualizado:** 19 de Octubre, 2025
