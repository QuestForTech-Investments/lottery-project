# 🔍 Hallazgos: API Multi-Tabla para Configuración de Bancas

**Fecha**: 2025-10-31
**Investigación**: Test manual del endpoint GET /api/betting-pools/{id}

---

## 📊 Resumen Ejecutivo

**Problema confirmado**: El formulario de edición solo carga 30 de 168 campos porque el backend NO devuelve toda la configuración en un solo endpoint.

**Solución encontrada**: Hay endpoints separados, pero SOLO algunos están implementados.

---

## 🎯 Endpoints Descubiertos

### 1. GET `/api/betting-pools/{id}` ✅ FUNCIONA
**Respuesta**: Solo campos básicos (14 campos)

```json
{
  "bettingPoolId": 9,
  "bettingPoolCode": "LAN-0009",
  "bettingPoolName": "admin",
  "zoneId": 4,
  "zoneName": "GRUPO ALEX $",
  "location": "Santiago 4",
  "reference": "RB003",
  "comment": "un comentario mas",
  "username": "0009",
  "isActive": true,
  "createdAt": "2025-10-28T11:02:12.844128",
  "updatedAt": "2025-10-30T10:58:35.654303"
}
```

### 2. GET `/api/betting-pools/{id}/config` ✅ FUNCIONA
**Respuesta**: Configuración COMPLETA incluyendo:

```json
{
  // ✅ Config general (~18 campos)
  "config": {
    "fallType": "COLLECTION",
    "deactivationBalance": 4995.00,
    "dailySaleLimit": 11000.00,
    "dailyBalanceLimit": 17888.00,
    "temporaryAdditionalBalance": null,
    "enableTemporaryBalance": true,
    "creditLimit": 0.00,
    "isActive": true,
    "controlWinningTickets": true,
    "allowJackpot": true,
    "enableRecharges": true,
    "allowPasswordChange": true,
    "cancelMinutes": 2,
    "dailyCancelTickets": 2,
    "maxCancelAmount": 12.00,
    "maxTicketAmount": 12.00,
    "maxDailyRecharge": 12.00,
    "paymentMode": "GROUP"
  },

  // ✅ Discount config (2 campos)
  "discountConfig": {
    "discountProvider": "SELLER",
    "discountMode": "CASH"
  },

  // ✅ Print config (5 campos)
  "printConfig": {
    "printMode": "GENERIC",
    "printEnabled": true,
    "printTicketCopy": true,
    "printRechargeReceipt": true,
    "smsOnly": true
  },

  // ✅ Footer config (5 campos)
  "footer": {
    "autoFooter": false,
    "footerLine1": "1",
    "footerLine2": "3",
    "footerLine3": "2",
    "footerLine4": "4"
  },

  // Todos los campos básicos también
  "bettingPoolId": 9,
  "bettingPoolCode": "LAN-0009",
  "bettingPoolName": "admin",
  "zoneId": 4,
  "zoneName": "GRUPO ALEX $",
  "location": "Santiago 4",
  "reference": "RB003",
  "comment": "un comentario mas",
  "username": "0009",
  "isActive": true,
  "createdAt": "2025-10-28T11:02:12.844128",
  "updatedAt": "2025-10-30T10:58:35.654303"
}
```

**Total de campos disponibles**: ~45 campos (básicos + config + discount + print + footer)

### 3. GET `/api/betting-pools/{id}/prizes` ❌ NO EXISTE

**Error 400**:
```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "prizeCommissionId": ["The value 'prizes' is not valid."]
  }
}
```

### 4. GET `/api/betting-pools/{id}/schedules` ❌ NO EXISTE

**Error 400**: Similar al de prizes

### 5. GET `/api/betting-pools/{id}/lotteries` ❓ NO PROBADO

### 6. GET `/api/betting-pools/{id}/styles` ❓ NO PROBADO

### 7. GET `/api/betting-pools/{id}/expenses` ❓ NO PROBADO

---

## 📋 Estado de los 168 Campos

### ✅ Disponibles en API (45 campos total)

| Tab | Campos | Endpoint | Estado |
|-----|--------|----------|--------|
| **General** | 10 | GET /betting-pools/{id} | ✅ Funciona |
| **Configuration** | 18 | GET /betting-pools/{id}/config | ✅ Funciona |
| **Discount Config** | 2 | GET /betting-pools/{id}/config | ✅ Funciona |
| **Print Config** | 5 | GET /betting-pools/{id}/config | ✅ Funciona |
| **Footers** | 5 | GET /betting-pools/{id}/config | ✅ Funciona |
| **Payment Mode** | 1 | GET /betting-pools/{id}/config | ✅ Funciona |

**Subtotal**: 41 campos únicos + algunos duplicados = ~45 campos disponibles

### ❌ NO Disponibles en API (123 campos)

| Tab | Campos Faltantes | Endpoint Necesario |
|-----|------------------|-------------------|
| **Footers Extra** | 2 (showBranchInfo, showDateTime) | - |
| **Prizes** | ~60 | GET /betting-pools/{id}/prizes |
| **Schedules** | 14 | GET /betting-pools/{id}/schedules |
| **Lotteries** | 2 | GET /betting-pools/{id}/lotteries |
| **Styles** | 2 | GET /betting-pools/{id}/styles |
| **Expenses** | 1 array | GET /betting-pools/{id}/expenses |

---

## 🔧 Solución Propuesta

### Opción 1: Mapear Solo lo Disponible (Rápido - 30 min) ⭐ RECOMENDADO

**Acción**: Actualizar `useEditBettingPoolForm.js` para usar el endpoint `/config` y mapear los 45 campos disponibles.

**Ventajas**:
- ✅ Rápido de implementar
- ✅ No requiere cambios en backend
- ✅ Mejora significativa (de 30 a 45 campos)
- ✅ Los tabs más importantes funcionarán (General, Config, Footers)

**Desventajas**:
- ⚠️ Faltan Prizes, Schedules, Lotteries, Styles, Expenses

**Implementación**:
```javascript
// En useEditBettingPoolForm.js
const loadInitialData = async () => {
  // Cambiar esto:
  const bettingPoolResponse = await getBettingPoolById(id);

  // Por esto:
  const bettingPoolResponse = await getBettingPoolConfig(id); // Nuevo endpoint

  if (bettingPoolResponse.success && bettingPoolResponse.data) {
    const branch = bettingPoolResponse.data;

    setFormData(prev => ({
      ...prev,
      // Básicos
      bettingPoolName: branch.bettingPoolName || '',
      branchCode: branch.bettingPoolCode || '',
      username: branch.username || '',
      location: branch.location || '',
      reference: branch.reference || '',
      comment: branch.comment || '',
      selectedZone: branch.zoneId || '',
      isActive: branch.isActive !== undefined ? branch.isActive : true,

      // Config
      fallType: mapFallType(branch.config?.fallType),
      deactivationBalance: branch.config?.deactivationBalance ? String(branch.config.deactivationBalance) : '',
      dailySaleLimit: branch.config?.dailySaleLimit ? String(branch.config.dailySaleLimit) : '',
      dailyBalanceLimit: branch.config?.dailyBalanceLimit ? String(branch.config.dailyBalanceLimit) : '',
      temporaryAdditionalBalance: branch.config?.temporaryAdditionalBalance ? String(branch.config.temporaryAdditionalBalance) : '',
      enableTemporaryBalance: branch.config?.enableTemporaryBalance !== undefined ? branch.config.enableTemporaryBalance : false,
      creditLimit: branch.config?.creditLimit ? String(branch.config.creditLimit) : '',
      controlWinningTickets: branch.config?.controlWinningTickets || false,
      allowPassPot: branch.config?.allowJackpot !== undefined ? branch.config.allowJackpot : true,
      enableRecharges: branch.config?.enableRecharges !== undefined ? branch.config.enableRecharges : true,
      allowPasswordChange: branch.config?.allowPasswordChange !== undefined ? branch.config.allowPasswordChange : true,
      minutesToCancelTicket: branch.config?.cancelMinutes ? String(branch.config.cancelMinutes) : '30',
      ticketsToCancelPerDay: branch.config?.dailyCancelTickets ? String(branch.config.dailyCancelTickets) : '',
      maximumCancelTicketAmount: branch.config?.maxCancelAmount ? String(branch.config.maxCancelAmount) : '',
      maxTicketAmount: branch.config?.maxTicketAmount ? String(branch.config.maxTicketAmount) : '',
      dailyPhoneRechargeLimit: branch.config?.maxDailyRecharge ? String(branch.config.maxDailyRecharge) : '',

      // Discount Config
      discountProvider: mapDiscountProvider(branch.discountConfig?.discountProvider),
      discountMode: mapDiscountMode(branch.discountConfig?.discountMode),

      // Print Config
      printerType: mapPrinterType(branch.printConfig?.printMode),
      printEnabled: branch.printConfig?.printEnabled !== undefined ? branch.printConfig.printEnabled : true,
      printTickets: branch.printConfig?.printEnabled !== undefined ? branch.printConfig.printEnabled : true,
      printTicketCopy: branch.printConfig?.printTicketCopy !== undefined ? branch.printConfig.printTicketCopy : true,
      printRechargeReceipt: branch.printConfig?.printRechargeReceipt !== undefined ? branch.printConfig.printRechargeReceipt : true,
      smsOnly: branch.printConfig?.smsOnly || false,

      // Footer
      autoFooter: branch.footer?.autoFooter || false,
      footerText1: branch.footer?.footerLine1 || '',
      footerText2: branch.footer?.footerLine2 || '',
      footerText3: branch.footer?.footerLine3 || '',
      footerText4: branch.footer?.footerLine4 || '',
    }));
  }
};
```

**Funciones de mapeo necesarias**:
```javascript
// Mapear valores del API (inglés) a valores del form (números)
const mapFallType = (apiValue) => {
  const map = {
    'OFF': '1',
    'COLLECTION': '2',
    'DAILY': '3',
    'MONTHLY': '4',
    'WEEKLY': '5'
  };
  return map[apiValue] || '1';
};

const mapDiscountProvider = (apiValue) => {
  const map = {
    'GROUP': '1',
    'SELLER': '2'
  };
  return map[apiValue] || '2';
};

const mapDiscountMode = (apiValue) => {
  const map = {
    'OFF': '1',
    'CASH': '2',
    'FREE_TICKET': '3'
  };
  return map[apiValue] || '1';
};

const mapPrinterType = (apiValue) => {
  const map = {
    'DRIVER': '1',
    'GENERIC': '2'
  };
  return map[apiValue] || '1';
};
```

---

### Opción 2: Implementar Endpoints Faltantes en Backend (Largo - 5-10 días)

**Acción**: Crear endpoints en el backend para:
- GET /betting-pools/{id}/prizes
- GET /betting-pools/{id}/schedules
- GET /betting-pools/{id}/lotteries
- GET /betting-pools/{id}/styles
- GET /betting-pools/{id}/expenses

**Ventajas**:
- ✅ Solución completa (168 campos)
- ✅ Arquitectura limpia y escalable

**Desventajas**:
- ⏰ Requiere mucho tiempo
- ⚠️ Requiere modificar backend
- ⚠️ Necesita crear/modificar tablas en BD
- ⚠️ Requiere testing extenso

---

### Opción 3: Híbrido - Mapear lo Disponible Ahora + Backend Después

**Fase 1 (Ahora - 30 min)**: Implementar Opción 1
**Fase 2 (Después - 5-10 días)**: Implementar Opción 2

---

## 📝 Actualización de Servicio API

Crear nuevo método en `bettingPoolService.js`:

```javascript
/**
 * Obtener configuración completa de betting pool por ID
 * @param {number} bettingPoolId - ID del betting pool
 * @returns {Promise<Object>} Datos completos del betting pool con configuración
 */
export const getBettingPoolConfig = async (bettingPoolId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${bettingPoolId}/config`);

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Error parseando JSON en getBettingPoolConfig:', parseError);
          throw new Error('Respuesta inválida del servidor');
        }
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Betting pool no encontrado');
      }
      throw new Error(data?.message || 'Error al obtener configuración del betting pool');
    }

    // Envolver en formato success si no viene así
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error en getBettingPoolConfig:', error);
    throw error;
  }
};
```

---

## ✅ Recomendación Final

**Implementar Opción 3 (Híbrido)**:

1. **Ahora (30 min)**: Usar el endpoint `/config` y mapear los 45 campos disponibles
   - Esto mejora inmediatamente la experiencia de usuario
   - Los tabs principales (General, Config, Footers) funcionarán completos

2. **Después (cuando tengas tiempo)**: Implementar endpoints faltantes en backend
   - Prizes, Schedules, Lotteries, Styles, Expenses
   - Actualizar frontend cuando estén listos

---

## 🎯 Próximo Paso Inmediato

¿Quieres que implemente la **Opción 1** ahora? (30 min)

Esto haría que el formulario de edición cargue **45 de 168 campos** en lugar de solo 30, mejorando significativamente la funcionalidad sin tocar el backend.

Los tabs que funcionarán completos:
- ✅ General
- ✅ Configuración
- ✅ Pies de Página

Los tabs que quedarán pendientes (por falta de endpoints):
- ⏳ Premios & Comisiones
- ⏳ Horarios
- ⏳ Sorteos
- ⏳ Estilos
- ⏳ Gastos Automáticos
