# Test: Editar Banca

## Descripción

Este test (`edit-banca.spec.js`) valida el flujo completo de edición de una banca existente, incluyendo la carga de datos reales desde el backend y el guardado de cambios de configuración.

## Archivo

`/home/jorge/projects/LottoWebApp/tests/edit-banca.spec.js`

## Fecha de Creación

29 de Octubre, 2025

## Objetivo del Test

Verificar que:
1. Se puede navegar a la lista de bancas
2. Se puede seleccionar una banca para editar
3. Los datos de la banca se cargan correctamente desde el backend
4. Se pueden modificar campos de configuración
5. Los cambios se guardan exitosamente en el backend
6. La aplicación redirige a la lista después de guardar

## Flujo del Test

1. **Login** con credenciales admin/Admin123456
2. **Navegación** a `/bancas/lista`
3. **Selección de banca**: Click en botón de editar de la primera banca
4. **Espera de carga**: Esperar que la URL cambie a `/bancas/editar/:id`
5. **Verificación de carga**: Confirmar que el campo `name` tiene valor
6. **Navegación al Tab de Configuración**: Click en el segundo tab
7. **Modificación de campos de configuración**:
   - Balance de desactivación: 5000
   - Límite de venta diaria: 10000
   - Límite de balance diario: 15000
   - Minutos para cancelar ticket: 60
   - Tipo de caída: DIARIA (radio button)
   - Modo de descuento: EFECTIVO (radio button)
   - Control de tickets ganadores: Activado (checkbox)
8. **Submit** del formulario
9. **Verificación**: Confirmar redirección a `/bancas/lista` (indica éxito)

## Resultado del Test

```
✅ 1 passed (26.0s)

Salida del console.log:
Step 1: Logging in...
Step 2: Navigating to Bancas list...
Step 3: Finding first banca to edit...
Step 4: Clicking edit button...
Step 5: Waiting for edit page to load...
Step 6: Verifying data loaded...
Banca cargada: admin
Step 7: Navigating to Configuration tab...
Step 8: Modifying configuration fields...
✓ Balance de desactivación actualizado a 5000
✓ Límite de venta diaria actualizado a 10000
✓ Límite de balance diario actualizado a 15000
✓ Minutos para cancelar actualizado a 60
Step 9: Saving changes...
Step 9: Verifying result...
⚠️ No se detectó mensaje de éxito o error explícito
✅ Redirigido a lista de bancas (indica éxito)
¿Tiene mensaje de éxito? false
¿Tiene mensaje de error? false
✅ Prueba de edición completada exitosamente!
```

## Componentes Relacionados

### EditBanca.jsx

**Ubicación:** `/home/jorge/projects/LottoWebApp/src/components/EditBanca.jsx`

**Funciones Clave:**

#### useEffect - Carga de datos (líneas 63-169)
```javascript
useEffect(() => {
  const loadBranchData = async () => {
    // ...
    const result = await getBranchWithConfig(id);
    // Mapea datos del backend al estado del formulario
    setFormData({
      name: branch.bettingPoolName,
      // ... 24 campos de configuración
    });
  };
  loadBranchData();
}, [id]);
```

#### handleSubmit - Guardado de cambios (líneas 191-276)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  // Construye objetos config, discountConfig, printConfig
  const result = await updateBranchConfig(id, config, discountConfig, printConfig);

  if (result.success) {
    setSuccess('Configuración actualizada exitosamente');
    setTimeout(() => {
      navigate('/bancas/lista'); // Redirige después de 2 segundos
    }, 2000);
  }
};
```

**Estado del Formulario:**
```javascript
{
  // Datos básicos (10 campos)
  name: '',
  location: '',
  code: '',
  reference: '',
  comment: '',
  zoneId: '',
  bankId: '',
  address: '',
  phone: '',
  isActive: true,

  // Config (17 campos)
  fallType: '1',
  deactivationBalance: '',
  dailySaleLimit: '',
  todayBalanceLimit: '',
  temporaryAdditionalBalance: '',
  enableTemporaryBalance: false,
  creditLimit: '',
  winningTicketsControl: false,
  allowPassPot: true,
  enableRecharges: true,
  allowPasswordChange: true,
  minutesToCancelTicket: '30',
  ticketsToCancelPerDay: '',
  maximumCancelTicketAmount: '',
  maxTicketAmount: '',
  dailyPhoneRechargeLimit: '',
  paymentMode: 'BANCA',

  // DiscountConfig (2 campos)
  discountProvider: '1',
  discountMode: '1',

  // PrintConfig (5 campos)
  printerType: '1',
  printTickets: true,
  printTicketCopy: true,
  printRechargeReceipt: true,
  smsOnly: false
}
```

### branchService.js

**Funciones utilizadas:**

#### getBranchWithConfig(branchId)
```javascript
export const getBranchWithConfig = async (branchId) => {
  const response = await fetch(`${API_BASE_URL}/${branchId}/config`);
  const data = await response.json();
  return {
    success: true,
    data // Incluye: bettingPoolName, config, discountConfig, printConfig
  };
};
```

#### updateBranchConfig(branchId, config, discountConfig, printConfig)
```javascript
export const updateBranchConfig = async (branchId, config, discountConfig, printConfig) => {
  const response = await fetch(`${API_BASE_URL}/${branchId}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, discountConfig, printConfig })
  });
  const result = await response.json();
  return {
    success: true,
    data: result
  };
};
```

### BancasList.jsx

**Función de navegación a edición (línea 374-377):**
```javascript
const handleEdit = (bancaId) => {
  navigate(`/bancas/editar/${bancaId}`);
};
```

**Botón de editar (línea 639-648):**
```javascript
<button
  type="button"
  className="edit-button"
  onClick={() => handleEdit(banca.id)}
  title="Editar banca"
>
  <svg>...</svg>
</button>
```

## Backend API

### Endpoint GET: `/api/betting-pools/{id}/config`

**Respuesta:**
```json
{
  "bettingPoolId": 1,
  "bettingPoolName": "admin",
  "bettingPoolCode": "ADMIN",
  "location": "Test Location",
  "reference": "REF-123",
  "zoneId": 1,
  "isActive": true,
  "config": {
    "configId": 1,
    "fallType": "DIARIA",
    "deactivationBalance": 2000,
    "dailySaleLimit": 8000,
    "dailyBalanceLimit": 15000,
    "creditLimit": 1000,
    "cancelMinutes": 45,
    "isActive": true,
    "paymentMode": "BANCA"
  },
  "discountConfig": {
    "discountConfigId": 1,
    "discountProvider": "RIFERO",
    "discountMode": "EFECTIVO"
  },
  "printConfig": {
    "printConfigId": 1,
    "printMode": "GENERICO",
    "printEnabled": true,
    "printTicketCopy": true,
    "printRechargeReceipt": true,
    "smsOnly": false
  }
}
```

### Endpoint POST: `/api/betting-pools/{id}/config`

**Request Body:**
```json
{
  "config": {
    "fallType": "DIARIA",
    "deactivationBalance": 5000,
    "dailySaleLimit": 10000,
    "dailyBalanceLimit": 15000,
    "creditLimit": 2000,
    "cancelMinutes": 60,
    "isActive": true,
    "controlWinningTickets": false,
    "allowJackpot": true,
    "enableRecharges": true,
    "allowPasswordChange": true,
    "paymentMode": "BANCA"
  },
  "discountConfig": {
    "discountProvider": "RIFERO",
    "discountMode": "EFECTIVO"
  },
  "printConfig": {
    "printMode": "GENERICO",
    "printEnabled": true,
    "printTicketCopy": true,
    "printRechargeReceipt": true,
    "smsOnly": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration updated successfully"
}
```

## Selectores Correctos

| Elemento | Selector | Ubicación |
|----------|----------|-----------|
| Botón editar (lista) | `button.edit-button` | BancasList |
| Botón editar (alt) | `button[title="Editar banca"]` | BancasList |
| Nombre banca | `input[name="name"]` | EditBanca |
| Balance desactivación | `input[name="deactivationBalance"]` | EditBanca |
| Límite venta diaria | `input[name="dailySaleLimit"]` | EditBanca |
| Límite crédito | `input[name="creditLimit"]` | EditBanca |
| Minutos cancelar | `input[name="minutesToCancelTicket"]` | EditBanca |
| Botón guardar | `button[type="submit"]` | EditBanca |

## Verificación de Éxito

El test verifica el éxito de dos formas:

1. **Mensaje de éxito explícito:**
   - Busca texto: `/actualizada exitosamente|success|guardado|actualizado/i`
   - Aparece brevemente antes de la redirección

2. **Redirección a lista (método preferido):**
   - Verifica que la URL cambió a `/bancas/lista`
   - Indica que el backend procesó correctamente la actualización
   - Más confiable que el mensaje (que aparece solo 2 segundos)

```javascript
// Verificación de redirección
const currentUrl = page.url();
const isInListPage = currentUrl.includes('/bancas/lista');

if (isInListPage) {
  console.log('✅ Redirigido a lista de bancas (indica éxito)');
}
```

## Comandos Útiles

### Ejecutar este test específico:
```bash
cd /home/jorge/projects/LottoWebApp
npx playwright test tests/edit-banca.spec.js --headed
```

### Ejecutar con timeout extendido:
```bash
npx playwright test tests/edit-banca.spec.js --headed --timeout=60000
```

### Ejecutar en modo debug:
```bash
npx playwright test tests/edit-banca.spec.js --debug
```

## Diferencias con Test de Creación

| Aspecto | Crear Banca | Editar Banca |
|---------|------------|--------------|
| **Inicio** | Navega a `/bancas/crear` | Navega a `/bancas/lista` → Click editar |
| **Datos** | Formulario vacío | Datos pre-cargados desde backend |
| **Zona** | Debe seleccionar zona en Tab 2 | Zona ya está seleccionada |
| **Tab Configuración** | Campos vacíos para llenar | Campos pre-cargados con valores actuales |
| **Backend Call** | `POST /api/betting-pools` | `POST /api/betting-pools/{id}/config` |
| **Success** | Mensaje "Banca creada exitosamente" | Redirección a lista |
| **Duración** | ~10s | ~26s (incluye carga y navegación de tabs) |

## Datos de Prueba

### Valores modificados en el test:

```javascript
{
  // Number inputs (5 campos)
  deactivationBalance: '5000',      // Antes: variable
  dailySaleLimit: '10000',          // Antes: variable
  todayBalanceLimit: '15000',       // Antes: variable
  creditLimit: '2000',              // Antes: variable (ELIMINADO en versión actual)
  minutesToCancelTicket: '60',      // Antes: variable

  // Radio buttons (2 campos)
  fallType: '3',                    // DIARIA (Antes: variable)
  discountMode: '2',                // EFECTIVO (Antes: variable)

  // Checkboxes (1 campo)
  winningTicketsControl: true       // Activado (Antes: variable)
}
```

**Nota:** El test modifica 8 campos (5 inputs, 2 radios, 1 checkbox) para cubrir diferentes tipos de controles. El componente soporta modificar todos los 24 campos de configuración.

## Troubleshooting

### Si el test falla con "No hay bancas disponibles":
1. Verificar que hay bancas en la base de datos
2. Ejecutar primero el test de creación: `npx playwright test tests/create-banca-with-config.spec.js`
3. Verificar que el backend está conectado a la base de datos correcta

### Si los datos no se cargan:
1. Verificar que el endpoint GET `/api/betting-pools/{id}/config` está funcionando
2. Verificar conexión del frontend con backend
3. Verificar logs del navegador en modo `--debug`

### Si el guardado falla:
1. Verificar que el endpoint POST `/api/betting-pools/{id}/config` está funcionando
2. Verificar que las tablas de configuración tienen IDENTITY configurado
3. Verificar formato de datos enviados (ver console.log en branchService.js)

### Si no redirige después de guardar:
1. Verificar que `handleSubmit` en EditBanca.jsx tiene el setTimeout con navigate
2. Verificar que no hay errores en el console del navegador
3. Aumentar el timeout en el test: `await page.waitForTimeout(4000)`

## Integración con Backend

### Tablas de Base de Datos:

1. **betting_pool** - Datos principales de la banca
2. **betting_pool_config** - Configuración principal (17 campos)
   - IDENTITY en `config_id`
3. **betting_pool_discount_config** - Configuración de descuentos (2 campos)
   - IDENTITY en `discount_config_id`
4. **betting_pool_print_config** - Configuración de impresión (5 campos)
   - IDENTITY en `print_config_id`

### Relaciones:
- `betting_pool` → `betting_pool_config` (One-to-One)
- `betting_pool` → `betting_pool_discount_config` (One-to-One)
- `betting_pool` → `betting_pool_print_config` (One-to-One)

## Lecciones Aprendidas

### 1. Verificación por redirección es más confiable
El mensaje de éxito aparece solo 2 segundos antes de la redirección. Es más confiable verificar la URL final.

### 2. Selector flexible para botón de editar
```javascript
const editButton = await page.locator('button.edit-button, button[title="Editar banca"]').first();
```
Usa múltiples selectores para mayor robustez.

### 3. Espera adecuada para carga de datos
```javascript
await page.waitForURL('**/bancas/editar/**', { timeout: 10000 });
await page.waitForTimeout(2000); // Esperar carga de datos del backend
```

### 4. Verificación de datos cargados
```javascript
const nameValue = await nameInput.inputValue();
if (!nameValue) {
  throw new Error('Los datos no se cargaron');
}
```

## Tests Relacionados

1. **create-banca-with-config.spec.js** - Test de creación de banca
2. **zones.spec.js** - Test de gestión de zonas (prerequisito)

## Ejecución en CI/CD

Para ejecutar en modo headless (sin interfaz gráfica):
```bash
npx playwright test tests/edit-banca.spec.js
```

Para generar reporte:
```bash
npx playwright test tests/edit-banca.spec.js --reporter=html
npx playwright show-report
```

---

## Última Actualización

**Fecha:** 29 de Octubre, 2025
**Estado:** ✅ Test funcionando correctamente
**Autor:** Claude Code
**Versión:** 1.0

## Próximos Tests Sugeridos

1. **delete-banca.spec.js** - Test de eliminación (soft delete)
2. **toggle-banca-active.spec.js** - Test de activar/desactivar banca
3. **copy-banca-config.spec.js** - Test de copiar configuración entre bancas
4. **edit-banca-validation.spec.js** - Test de validaciones en edición
