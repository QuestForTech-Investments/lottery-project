# Integración Backend API - Formulario Crear Banca

## Resumen

Se ha completado la integración del formulario "Crear Banca" con el backend API. El formulario ahora envía correctamente todos los campos de configuración (Tabs 1-7) al endpoint `POST /api/betting-pools`.

## Archivos Modificados

### 1. `/src/services/branchService.js`
**Cambios realizados:**
- Añadido import del logger: `import * as logger from '../utils/logger'`
- Reemplazados todos los `console.log` y `console.error` con el sistema de logging
- Agregadas funciones para premios y comisiones:
  - `getBranchPrizesCommissions(branchId, lotteryId, gameType)` - Obtener configuración
  - `saveBranchPrizesCommissions(branchId, lotteryId, configurations)` - Guardar configuración

**Funciones disponibles:**
```javascript
// Operaciones básicas de bancas
getBranches(params)              // Listar bancas con filtros
getBranchById(branchId)          // Obtener banca por ID
getNextBranchCode()              // Obtener próximo código disponible
createBranch(branchData)         // Crear nueva banca ✓
updateBranch(branchId, data)     // Actualizar banca
deleteBranch(branchId)           // Eliminar banca
getBranchUsers(branchId)         // Obtener usuarios de banca

// Premios y comisiones (Tab 8)
getBranchPrizesCommissions(branchId, lotteryId, gameType)
saveBranchPrizesCommissions(branchId, lotteryId, configurations)

// Utilidades
handleBranchError(error, operation) // Manejo de errores consistente
```

### 2. `/src/components/CreateBanca.jsx`
**Cambios realizados:**
- Añadido import: `import * as logger from '../utils/logger'`
- Añadido import: `saveBranchPrizesCommissions` del branchService
- Agregados campos faltantes al estado `formData`:
  - `commissionRate` - Tasa de comisión (0-100)
  - `creditLimit` - Límite de crédito
- Reescrita función `handleSubmit()` con lógica completa:
  - Validación de campos requeridos (solo `branchName` es obligatorio)
  - Construcción del objeto `branchData` con todos los campos mapeados correctamente
  - Llamada a `createBranch()` con manejo de errores robusto
  - Uso del logger para tracking de operaciones
  - Redirección automática a `/branches` después de 2 segundos
  - Reset del formulario con nuevo código de banca
- Agregada función helper `resetFormToDefaults(newCode)` para limpiar el formulario
- Reemplazados todos los `console.error` con `logger.error()`

## Estructura de Request al Backend

### POST /api/betting-pools
```json
{
  // ===== TAB 1: INFORMACIÓN BÁSICA =====
  "branchName": "Banca Centro",           // REQUERIDO
  "branchCode": "LAN-0519",
  "username": "user123",                  // Opcional
  "password": "password123",              // Opcional
  "zoneId": 6,                            // Default: 6
  "location": "Calle 123",                // Opcional
  "reference": "Ref ABC",                 // Opcional
  "comment": "Comentario",                // Opcional

  // ===== TAB 2: CONFIGURACIÓN FINANCIERA =====
  "commissionRate": 10.5,                 // 0-100
  "creditLimit": 50000.00,
  "deactivationBalance": 500.00,
  "dailySaleLimit": 5000.00,
  "dailyBalanceLimit": 3000.00,
  "temporaryAdditionalBalance": 1000.00,

  // ===== TAB 3: CONFIGURACIÓN DE CAÍDA =====
  "fallType": "OFF",                      // OFF, COBRO, DIARIA, MENSUAL, etc.

  // ===== TAB 4: CONFIGURACIÓN DE IMPRESIÓN =====
  "printMode": "DRIVER",                  // DRIVER, GENERICO
  "discountProvider": "GRUPO",            // GRUPO, RIFERO
  "discountMode": "OFF",                  // OFF, EFECTIVO, TICKET_GRATIS

  // ===== TAB 5: TOGGLES =====
  "isActive": true,
  "controlWinningTickets": false,
  "allowJackpot": true,
  "printEnabled": true,
  "printTicketCopy": true,
  "smsOnly": false,
  "enableRecharges": true,
  "printRechargeReceipt": true,
  "allowPasswordChange": true,

  // ===== TAB 6: LÍMITES =====
  "cancelMinutes": 30,                    // Default: 30
  "dailyCancelTickets": 10,
  "maxCancelAmount": 500.00,
  "maxTicketAmount": 1000.00,
  "maxDailyRecharge": 5000.00,

  // ===== TAB 7: MODO DE PAGO =====
  "paymentMode": "BANCA"                  // BANCA, ZONA, GRUPO, USAR_PREFERENCIA_GRUPO
}
```

## Mapeo de Valores Frontend → Backend

El formulario usa valores numéricos (radio buttons) que se mapean a valores string del backend:

### Tipo de Caída (fallType)
```javascript
'1' → 'OFF'
'2' → 'COBRO'
'3' → 'DIARIA'
'4' → 'MENSUAL'
'5' → 'SEMANAL CON ACUMULADO'
'6' → 'SEMANAL SIN ACUMULADO'
```

### Modo de Impresión (printMode)
```javascript
'1' → 'DRIVER'
'2' → 'GENERICO'
```

### Proveedor de Descuento (discountProvider)
```javascript
'1' → 'GRUPO'
'2' → 'RIFERO'
```

### Modo de Descuento (discountMode)
```javascript
'1' → 'OFF'
'2' → 'EFECTIVO'
'3' → 'TICKET_GRATIS'
```

### Modo de Pago (paymentMode)
```javascript
'1'   → 'BANCA'
'2'   → 'ZONA'
'3'   → 'GRUPO'
null  → 'USAR_PREFERENCIA_GRUPO'
```

## Flujo de Creación de Banca

1. **Usuario completa el formulario** en cualquiera de los 8 tabs
2. **Click en botón "Guardar"** (disponible en cada tab)
3. **Validación:**
   - Solo `branchName` es obligatorio
   - Otros campos opcionales se envían como `null`
4. **Construcción del request:**
   - Se mapean valores del formulario a formato API
   - Campos vacíos se convierten a `null`
   - Números se parsean correctamente (`parseInt`, `parseFloat`)
5. **Envío al backend:**
   - `POST /api/betting-pools` con el objeto completo
   - Logger registra la operación
6. **Respuesta exitosa:**
   - Se muestra mensaje de éxito
   - Se obtiene el siguiente código de banca
   - Formulario se resetea a valores por defecto
   - Se redirige a `/branches` después de 2 segundos
7. **Respuesta con error:**
   - Se muestra mensaje de error descriptivo
   - Logger registra el error
   - Formulario permanece con los datos ingresados

## Sistema de Logging

Todas las operaciones se registran usando el logger:

```javascript
// Éxito
logger.success('CREATE_BANCA', 'Banca creada exitosamente', { branchId });

// Error
logger.error('CREATE_BANCA', 'Error en handleSubmit', { error: error.message });

// Info
logger.info('BRANCH_SERVICE', 'Creando nueva banca', { branchName, branchCode });

// Debug
logger.debug('BRANCH_SERVICE', 'Respuesta de la API', { status, statusText });
```

**Atajos de teclado:**
- `Ctrl+Shift+L` - Exportar logs a archivo
- `Ctrl+Shift+C` - Limpiar logs
- `Ctrl+Shift+D` - Mostrar logs en consola

## Campos Pendientes de Implementar

Los siguientes tabs NO se guardan actualmente (se implementarán en fase posterior):

### Tab 3: Pies de Página
- `footerText1`, `footerText2`, `footerText3`, `footerText4`
- `autoFooter`, `showBranchInfo`, `showDateTime`

### Tab 4: Premios & Comisiones
- Configuraciones de premios por lotería
- Configuraciones de comisiones por lotería
- Funciones ya creadas: `getBranchPrizesCommissions`, `saveBranchPrizesCommissions`

### Tab 5: Horarios de Sorteos
- Horarios por día de la semana
- `lunesInicio`, `lunesFin`, etc.

### Tab 6: Sorteos
- `selectedLotteries` - Array de IDs de loterías seleccionadas
- `anticipatedClosing` - Cierre anticipado

### Tab 7: Estilos
- `sellScreenStyles` - Estilo punto de venta
- `ticketPrintStyles` - Estilo de impresión

### Tab 8: Gastos Automáticos
- `autoExpenses` - Array de gastos automáticos

## Validaciones Actuales

Solo se valida que `branchName` no esté vacío. Todas las demás validaciones son opcionales.

### Validaciones Recomendadas (Futuras)
- `commissionRate`: 0-100
- `zoneId`: Debe existir en la tabla zones
- `username`: Único si se proporciona
- `password`: Mínimo 6 caracteres si se proporciona
- Porcentajes: Entre 0-100
- Montos: Positivos o null

## Manejo de Errores

El servicio `branchService.js` incluye la función `handleBranchError()` que mapea errores comunes:

- **NetworkError / fetch failed** → "Error de conexión. Verifica tu internet..."
- **409 / duplicado** → "El código de banca ya existe..."
- **404 / no encontrada** → "La banca no existe o ha sido eliminada"
- **400 / validación** → "Datos inválidos. Verifica la información..."
- **403 / Forbidden** → "No tienes permisos para realizar esta acción"
- **401 / Unauthorized** → "Sesión expirada. Inicia sesión nuevamente"

## Testing

Para probar la integración:

1. **Iniciar el backend:**
   ```bash
   cd /mnt/h/GIT/lottery-api/LotteryAPI
   dotnet run
   ```

2. **Iniciar el frontend:**
   ```bash
   cd /mnt/h/GIT/LottoWebApp
   npm run dev
   ```

3. **Navegar a:**
   ```
   http://localhost:5173/branches/create
   ```

4. **Completar el formulario:**
   - Nombre de banca (requerido)
   - Otros campos opcionales

5. **Verificar logs:**
   - Presionar `Ctrl+Shift+D` para ver logs en consola
   - Verificar que la banca se creó en la base de datos

## Base de Datos

La tabla `branches` incluye todos los campos enviados. Verificar con:

```sql
SELECT TOP 1 * FROM branches ORDER BY branch_id DESC;
```

## URLs del API

- **Base URL local:** `http://localhost:5108`
- **Endpoint crear banca:** `POST /api/betting-pools`
- **Endpoint próximo código:** `GET /api/betting-pools/next-code`
- **Endpoint premios/comisiones:** `POST /api/betting-pools/{branchId}/prizes-commissions`

## Notas Importantes

1. **ZoneId por defecto:** Si no se selecciona zona, se usa `zoneId: 6`
2. **Campos null:** Todos los campos opcionales se envían como `null` si están vacíos
3. **Redirección:** Después de crear exitosamente, se redirige a `/branches` en 2 segundos
4. **Logging:** Todas las operaciones se registran con el logger (NO console.log)
5. **Error handling:** Se usa `handleBranchError()` para mensajes consistentes

## Próximos Pasos

1. **Implementar guardado de Premios & Comisiones (Tab 4)**
   - Extraer datos del PremiosComisionesTab
   - Llamar a `saveBranchPrizesCommissions()`
   - Manejar múltiples loterías

2. **Implementar guardado de otros tabs**
   - Pies de página
   - Horarios de sorteos
   - Sorteos seleccionados
   - Estilos
   - Gastos automáticos

3. **Agregar validaciones adicionales**
   - Validación de rangos (0-100 para porcentajes)
   - Validación de formatos
   - Validación de dependencias

4. **Mejorar UX**
   - Mostrar progress spinner durante guardado
   - Toast notifications en lugar de mensajes simples
   - Confirmación antes de salir si hay cambios sin guardar

## Estado Actual

✅ **COMPLETADO:**
- Integración básica con API (Tabs 1-7)
- Sistema de logging
- Mapeo de valores
- Validación básica
- Manejo de errores
- Reset de formulario
- Redirección post-creación

⏳ **PENDIENTE:**
- Guardado de Premios & Comisiones (Tab 4)
- Guardado de otros tabs (3, 5, 6, 7, 8)
- Validaciones avanzadas
- Mejoras de UX

---

**Fecha de actualización:** 2025-10-20
**Versión:** 1.0
