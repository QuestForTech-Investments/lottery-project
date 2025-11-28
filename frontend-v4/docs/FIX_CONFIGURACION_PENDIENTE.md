# 🔧 FIX FINAL - Cargar Configuración al Entrar al Formulario

## ✅ Problema Identificado

**Guardado:**
- ✅ Usa DOS endpoints correctamente:
  - `PUT /api/betting-pools/9` → Datos básicos
  - `POST /api/betting-pools/9/config` → Configuración ✅

**Carga (PROBLEMA):**
- ❌ Solo usa `GET /api/betting-pools/9` → Solo datos básicos
- ❌ FALTA llamar `GET /api/betting-pools/9/config` → Configuración

**Resultado:** Los valores se guardan correctamente pero no se cargan cuando entras al formulario.

---

## 🛠️ Solución Aplicada Hasta Ahora

### 1. Servicio (COMPLETADO ✅)
**Archivo:** `src/services/bettingPoolService.js`

```javascript
// ✅ YA AGREGADA
export const getBettingPoolConfig = async (bettingPoolId) => {
  const response = await fetch(`${API_BASE_URL}/${bettingPoolId}/config`);
  // ... manejo de respuesta
  return { success: true, data: data };
};

// ✅ YA EN EL EXPORT
export default {
  getBettingPools,
  getBettingPoolById,
  getBettingPoolConfig, // ← NUEVA
  getNextBettingPoolCode,
  createBettingPool,
  updateBettingPool,
  updateBettingPoolConfig,
  deleteBettingPool,
  getBettingPoolUsers,
  handleBettingPoolError
};
```

### 2. Hook - Import (COMPLETADO ✅)
**Archivo:** `src/components/features/betting-pools/EditBettingPool/hooks/useEditBettingPoolForm.js:3`

```javascript
// ✅ YA ACTUALIZADO
import {
  getBettingPoolById,
  getBettingPoolConfig, // ← NUEVA
  updateBettingPool,
  updateBettingPoolConfig,
  handleBettingPoolError
} from '@/services/bettingPoolService';
```

---

## ⚠️ PENDIENTE: Actualizar la Carga de Datos

### 3. Hook - Función Helper (AGREGAR)

**Ubicación:** Después de la línea 219 (antes de `loadInitialData`)

```javascript
/**
 * Helper function to map backend config data to frontend form fields
 */
const mapConfigToFormData = (configResponse) => {
  if (!configResponse || (!configResponse.config && !configResponse.discountConfig && !configResponse.printConfig)) {
    return {};
  }

  const config = configResponse.config || {};
  const discountConfig = configResponse.discountConfig || {};
  const printConfig = configResponse.printConfig || {};
  const footer = configResponse.footer || {};

  // Reverse mapping for enums (backend → frontend select values)
  const fallTypeReverseMap = { 'OFF': '1', 'COLLECTION': '2', 'DAILY': '3', 'MONTHLY': '4', 'WEEKLY': '5' };
  const printModeReverseMap = { 'DRIVER': '1', 'GENERIC': '2' };
  const discountProviderReverseMap = { 'GROUP': '1', 'SELLER': '2' };
  const discountModeReverseMap = { 'OFF': '1', 'CASH': '2', 'FREE_TICKET': '3' };

  return {
    // Config fields
    fallType: fallTypeReverseMap[config.fallType] || '1',
    deactivationBalance: config.deactivationBalance || '',
    dailySaleLimit: config.dailySaleLimit || '',
    dailyBalanceLimit: config.dailyBalanceLimit || '',
    temporaryAdditionalBalance: config.temporaryAdditionalBalance || '',
    enableTemporaryBalance: config.enableTemporaryBalance || false,
    creditLimit: config.creditLimit || '',
    controlWinningTickets: config.controlWinningTickets || false,
    allowJackpot: config.allowJackpot !== undefined ? config.allowJackpot : true,
    enableRecharges: config.enableRecharges !== undefined ? config.enableRecharges : true,
    allowPasswordChange: config.allowPasswordChange !== undefined ? config.allowPasswordChange : true,
    minutesToCancelTicket: config.cancelMinutes || 30,
    ticketsToCancelPerDay: config.dailyCancelTickets || '',
    maximumCancelTicketAmount: config.maxCancelAmount || '',
    maxTicketAmount: config.maxTicketAmount || '',
    dailyPhoneRechargeLimit: config.maxDailyRecharge || '',

    // Discount config fields
    discountProvider: discountProviderReverseMap[discountConfig.discountProvider] || '1',
    discountMode: discountModeReverseMap[discountConfig.discountMode] || '1',

    // Print config fields
    printerType: printModeReverseMap[printConfig.printMode] || '1',
    printEnabled: printConfig.printEnabled !== undefined ? printConfig.printEnabled : true,
    printTicketCopy: printConfig.printTicketCopy !== undefined ? printConfig.printTicketCopy : true,
    printRechargeReceipt: printConfig.printRechargeReceipt !== undefined ? printConfig.printRechargeReceipt : true,
    smsOnly: printConfig.smsOnly || false,

    // Footer fields
    autoFooter: footer.autoFooter || false,
    footerLine1: footer.footerLine1 || '',
    footerLine2: footer.footerLine2 || '',
    footerLine3: footer.footerLine3 || '',
    footerLine4: footer.footerLine4 || ''
  };
};
```

### 4. Hook - Actualizar loadInitialData (MODIFICAR líneas 238-241)

**CAMBIAR:**
```javascript
// ❌ ANTES - Solo carga betting pool básico
const [zonesResponse, bettingPoolResponse] = await Promise.all([
  getAllZones(),
  getBettingPoolById(id)
]);
```

**POR:**
```javascript
// ✅ DESPUÉS - Carga betting pool + configuración en paralelo
const [zonesResponse, bettingPoolResponse, configResponse] = await Promise.all([
  getAllZones(),
  getBettingPoolById(id),
  getBettingPoolConfig(id) // ← NUEVA
]);
```

### 5. Hook - Agregar Mapeo de Configuración (líneas 256-276)

**DESPUÉS de:**
```javascript
const basicFormData = {
  bettingPoolName: branch.bettingPoolName || '',
  branchCode: branch.bettingPoolCode || branch.branchCode || '',
  username: branch.username || '',
  location: branch.location || '',
  reference: branch.reference || '',
  comment: branch.comment || '',
  selectedZone: branch.zoneId || '',
  isActive: branch.isActive !== undefined ? branch.isActive : true
};
```

**AGREGAR:**
```javascript
// ✅ NUEVO: Mapear datos de configuración
let configFormData = {};
if (configResponse && configResponse.success && configResponse.data) {
  configFormData = mapConfigToFormData(configResponse.data);
  console.log('✅ Loaded configuration data');
}
```

### 6. Hook - Actualizar setFormData (líneas 267-276)

**CAMBIAR:**
```javascript
// ❌ ANTES - Solo básicos
setFormData(prev => ({
  ...prev,
  ...basicFormData
}));

setInitialFormData({
  ...formData,
  ...basicFormData
});
```

**POR:**
```javascript
// ✅ DESPUÉS - Básicos + configuración
const completeFormData = {
  ...formData,
  ...basicFormData,
  ...configFormData
};

setFormData(completeFormData);

setInitialFormData(completeFormData);
```

---

## 🧪 Cómo Probar

1. Abrir: `http://localhost:4000/bettingPools/edit/9`
2. Ir a tab **"Configuración"**
3. Cambiar **"Límite de Venta Diaria"** a `99999`
4. Hacer clic en **"Guardar Cambios"**
5. Esperar mensaje: "✅ Banca actualizada exitosamente"
6. **Refrescar la página (F5)**
7. Ir al tab **"Configuración"** de nuevo
8. **✅ VERIFICAR:** "Límite de Venta Diaria" debe mostrar `99999`

---

## 📊 Resultado Esperado

**ANTES (❌):**
```
Editar → Cambiar valor → Guardar → Refrescar → ❌ Valor revierte
```

**DESPUÉS (✅):**
```
Editar → Cambiar valor → Guardar → Refrescar → ✅ Valor persiste
```

---

## 🔧 Archivos Modificados

1. ✅ **bettingPoolService.js** - Agregada función `getBettingPoolConfig`
2. ✅ **useEditBettingPoolForm.js:3** - Import actualizado
3. ⏳ **useEditBettingPoolForm.js:~220** - PENDIENTE: Agregar `mapConfigToFormData`
4. ⏳ **useEditBettingPoolForm.js:238-276** - PENDIENTE: Actualizar `loadInitialData`

---

**Status:** 50% completado - Necesita aplicar pasos 3-6 en el hook
