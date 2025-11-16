# Investigación: Configuración Multi-Tabla para Bancas

## 📊 Resumen Ejecutivo

**Problema identificado**: El formulario de edición de bancas solo carga 30 de 168 campos.

**Causa probable**: La configuración viene de múltiples tablas separadas en la base de datos, pero el hook de edición solo está mapeando una tabla.

## 🔍 Estructura Actual del Formulario

El formulario completo tiene **8 pestañas** con **168 campos totales**:

### 1. General (Tab 0) - ✅ FUNCIONA
- Campos básicos: 10 campos
  - `bettingPoolName`, `branchCode`, `username`, `location`, `password`, `reference`, `confirmPassword`, `comment`, `zoneId`, `isActive`

### 2. Configuración (Tab 1) - ✅ FUNCIONA
- Configuración general: ~30 campos
  - `fallType`, `deactivationBalance`, `dailySaleLimit`, `todayBalanceLimit`
  - `enableTemporaryBalance`, `temporaryAdditionalBalance`, `creditLimit`
  - `winningTicketsControl`, `allowPassPot`, `enableRecharges`
  - `printTickets`, `printTicketCopy`, `smsOnly`, `printRechargeReceipt`
  - `minutesToCancelTicket`, `ticketsToCancelPerDay`, `maximumCancelTicketAmount`
  - `maxTicketAmount`, `dailyPhoneRechargeLimit`
  - `printerType`, `discountProvider`, `discountMode`, `allowPasswordChange`
  - `limitPreference`

### 3. Pies de Página (Tab 2) - ⚠️ PARCIALMENTE
- Campos de footer: 6 campos
  - `autoFooter`, `footerText1`, `footerText2`, `footerText3`, `footerText4`
  - `showBranchInfo`, `showDateTime`

### 4. Premios & Comisiones (Tab 3) - ❌ NO FUNCIONA
- Premios de lotería: ~60+ campos
  - **Pick 3**: `pick3FirstPayment`, `pick3SecondPayment`, `pick3ThirdPayment`, `pick3Doubles`
  - **Pick 3 Super**: `pick3SuperAllSequence`, `pick3SuperFirstPayment`, `pick3SuperSecondPayment`, `pick3SuperThirdPayment`
  - **Pick 4**: `pick4FirstPayment`, `pick4SecondPayment`
  - **Pick 4 Super**: `pick4SuperAllSequence`, `pick4SuperDoubles`
  - **Pick 3 NY**: `pick3NY_3Way2Identical`, `pick3NY_6Way3Unique`
  - **Pick 4 NY**: `pick4NY_AllSequence`, `pick4NY_Doubles`
  - **Pick 4 Extra**: `pick4_24Way4Unique`, `pick4_12Way2Identical`, `pick4_6Way2Identical`, `pick4_4Way3Identical`
  - **Pick 5 Mega**: `pick5MegaFirstPayment`
  - **Pick 5 NY**: `pick5NYFirstPayment`
  - **Pick 5 Bronx**: `pick5BronxFirstPayment`
  - **Pick 5 Brooklyn**: `pick5BrooklynFirstPayment`
  - **Pick 5 Queens**: `pick5QueensFirstPayment`
  - **Pick 5 Extra**: `pick5FirstPayment`
  - **Pick 5 Super**: `pick5SuperAllSequence`, `pick5SuperDoubles`
  - **Pick 5 Super Extra**: `pick5Super_5Way4Identical`, `pick5Super_10Way3Identical`, `pick5Super_20Way3Identical`, `pick5Super_30Way2Identical`, `pick5Super_60Way2Identical`, `pick5Super_120Way5Unique`
  - **Pick 6 Miami**: `pick6MiamiFirstPayment`, `pick6MiamiDoubles`
  - **Pick 6 California**: `pick6CaliforniaAllSequence`, `pick6CaliforniaTriples`
  - **Pick 6 NY**: `pick6NY_3Way2Identical`, `pick6NY_6Way3Unique`
  - **Pick 6 Extra**: `pick6AllSequence`, `pick6Triples`
  - **Pick 6 California Extra**: `pick6Cali_3Way2Identical`, `pick6Cali_6Way3Unique`
  - **Lotto Classic**: `lottoClassicFirstPayment`, `lottoClassicDoubles`
  - **Lotto Plus**: `lottoPlusFirstPayment`, `lottoPlusDoubles`
  - **Mega Millions**: `megaMillionsFirstPayment`, `megaMillionsDoubles`
  - **Powerball**: 12 campos (`powerball4NumbersFirstRound`, etc.)

### 5. Horarios (Tab 4) - ❌ NO FUNCIONA
- Horarios por día: 14 campos (7 días x 2)
  - `domingoInicio`, `domingoFin`
  - `lunesInicio`, `lunesFin`
  - `martesInicio`, `martesFin`
  - `miercolesInicio`, `miercolesFin`
  - `juevesInicio`, `juevesFin`
  - `viernesInicio`, `viernesFin`
  - `sabadoInicio`, `sabadoFin`

### 6. Sorteos (Tab 5) - ❌ NO FUNCIONA
- Sorteos seleccionados: 2 campos
  - `selectedLotteries` (array)
  - `anticipatedClosing`

### 7. Estilos (Tab 6) - ❌ NO FUNCIONA
- Estilos visuales: 2 campos
  - `sellScreenStyles`
  - `ticketPrintStyles`

### 8. Gastos Automáticos (Tab 7) - ❌ NO FUNCIONA
- Gastos automáticos: 1 campo
  - `autoExpenses` (array)

## 🗄️ Estructura de Base de Datos Probable

Basado en tu comentario: **"la configuracion va por partes, hay varias tablas de configuracion, una por tab"**

### Posibles tablas en la base de datos:

1. **`branches`** o **`betting_pools`**
   - Información básica de la banca
   - Campos: id, name, code, username, location, reference, comment, zone_id, is_active, created_at, updated_at

2. **`branch_config`** o **`betting_pool_config`**
   - Configuración general
   - Campos: branch_id, fall_type, deactivation_balance, daily_sale_limit, credit_limit, etc.

3. **`branch_footers`** o **`betting_pool_footers`**
   - Configuración de pies de página
   - Campos: branch_id, auto_footer, footer_text_1, footer_text_2, footer_text_3, footer_text_4, show_branch_info, show_date_time

4. **`branch_prizes`** o **`betting_pool_prizes`**
   - Premios y comisiones
   - Campos: branch_id, pick3_first_payment, pick3_second_payment, ..., powerball_*

5. **`branch_schedules`** o **`betting_pool_schedules`**
   - Horarios por día de la semana
   - Campos: branch_id, sunday_start, sunday_end, monday_start, monday_end, ...

6. **`branch_lotteries`** o **`betting_pool_lotteries`**
   - Sorteos seleccionados (relación N:M)
   - Campos: branch_id, lottery_id, anticipated_closing

7. **`branch_styles`** o **`betting_pool_styles`**
   - Estilos visuales
   - Campos: branch_id, sell_screen_style, ticket_print_style

8. **`branch_expenses`** o **`betting_pool_expenses`**
   - Gastos automáticos
   - Campos: branch_id, expense_type, amount, frequency, etc.

## 📡 Endpoints API Necesarios

### Opción A: Endpoint único que devuelve todo (actual)
```
GET /api/betting-pools/{id}
```
**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "bettingPoolName": "Banca Central",
    "branchCode": "BC001",
    "username": "admin",
    "location": "Calle Principal",
    "reference": "REF001",
    "comment": "Comentario",
    "zoneId": 5,
    "isActive": true,

    "config": {
      "fallType": "DAILY",
      "deactivationBalance": 1000,
      "dailySaleLimit": 5000,
      // ... más config
    },

    "footers": {
      "autoFooter": true,
      "footerText1": "Texto 1",
      "footerText2": "Texto 2",
      // ... más footers
    },

    "prizes": {
      "pick3FirstPayment": 500,
      "pick3SecondPayment": 100,
      // ... más premios
    },

    "schedules": {
      "sundayStart": "12:00 AM",
      "sundayEnd": "11:59 PM",
      // ... más horarios
    },

    "lotteries": [1, 3, 5, 7],

    "styles": {
      "sellScreenStyle": "estilo1",
      "ticketPrintStyle": "original"
    },

    "expenses": [
      { "type": "rent", "amount": 500 },
      { "type": "utilities", "amount": 200 }
    ]
  }
}
```

### Opción B: Múltiples endpoints (recomendado si las tablas son grandes)
```
GET /api/betting-pools/{id}                 # Info básica + config
GET /api/betting-pools/{id}/footers         # Pies de página
GET /api/betting-pools/{id}/prizes          # Premios
GET /api/betting-pools/{id}/schedules       # Horarios
GET /api/betting-pools/{id}/lotteries       # Sorteos
GET /api/betting-pools/{id}/styles          # Estilos
GET /api/betting-pools/{id}/expenses        # Gastos
```

## 🔧 Solución Propuesta

### Paso 1: Investigar API
Necesito saber qué estructura devuelve actualmente `GET /api/betting-pools/{id}`:

**Opciones para investigar**:
1. **Postman/Insomnia**: Hacer request directo a la API
2. **Browser DevTools**: Abrir formulario de edición y ver network tab
3. **Backend logs**: Ver qué está devolviendo el endpoint
4. **Código del backend**: Revisar el controller/service que maneja el endpoint

### Paso 2: Actualizar Hook de Edición
Una vez sepamos la estructura del API, actualizar `useEditBettingPoolForm.js` para mapear TODOS los campos:

```javascript
// En loadInitialData()
const bettingPoolResponse = await getBettingPoolById(id);
if (bettingPoolResponse.success && bettingPoolResponse.data) {
  const branch = bettingPoolResponse.data;

  setFormData(prev => ({
    ...prev,

    // Básico (ya existe) ✅
    bettingPoolName: branch.bettingPoolName || '',
    branchCode: branch.branchCode || '',
    // ...

    // Config (ya existe) ✅
    fallType: mapFallType(branch.config?.fallType),
    // ...

    // Footers (FALTA) ❌
    autoFooter: branch.footers?.autoFooter || false,
    footerText1: branch.footers?.footerText1 || '',
    // ...

    // Prizes (FALTA) ❌
    pick3FirstPayment: branch.prizes?.pick3FirstPayment || '',
    pick3SecondPayment: branch.prizes?.pick3SecondPayment || '',
    // ...

    // Schedules (FALTA) ❌
    domingoInicio: branch.schedules?.sundayStart || '12:00 AM',
    domingoFin: branch.schedules?.sundayEnd || '11:59 PM',
    // ...

    // Lotteries (FALTA) ❌
    selectedLotteries: branch.lotteries || [],
    anticipatedClosing: branch.anticipatedClosing || '',

    // Styles (FALTA) ❌
    sellScreenStyles: branch.styles?.sellScreenStyle || 'estilo1',
    ticketPrintStyles: branch.styles?.ticketPrintStyle || 'original',

    // Expenses (FALTA) ❌
    autoExpenses: branch.expenses || []
  }));
}
```

### Paso 3: Actualizar Servicio de API (si es necesario)
Si hay múltiples endpoints, actualizar `bettingPoolService.js`:

```javascript
export const getBettingPoolComplete = async (bettingPoolId) => {
  // Opción 1: Si API devuelve todo en un endpoint
  return await getBettingPoolById(bettingPoolId);

  // Opción 2: Si necesitamos múltiples requests
  const [basic, footers, prizes, schedules, lotteries, styles, expenses] = await Promise.all([
    fetch(`/api/betting-pools/${bettingPoolId}`),
    fetch(`/api/betting-pools/${bettingPoolId}/footers`),
    fetch(`/api/betting-pools/${bettingPoolId}/prizes`),
    fetch(`/api/betting-pools/${bettingPoolId}/schedules`),
    fetch(`/api/betting-pools/${bettingPoolId}/lotteries`),
    fetch(`/api/betting-pools/${bettingPoolId}/styles`),
    fetch(`/api/betting-pools/${bettingPoolId}/expenses`)
  ]);

  return {
    success: true,
    data: {
      ...basic.data,
      footers: footers.data,
      prizes: prizes.data,
      schedules: schedules.data,
      lotteries: lotteries.data,
      styles: styles.data,
      expenses: expenses.data
    }
  };
};
```

## 📝 Preguntas para ti

1. **¿Cómo está estructurada la base de datos?**
   - ¿Hay una tabla `branch_config`, `branch_prizes`, `branch_schedules`, etc.?
   - ¿O todo está en una sola tabla `branches` con muchas columnas?

2. **¿Qué devuelve actualmente el endpoint `GET /api/betting-pools/{id}`?**
   - ¿Devuelve todo en un solo objeto anidado?
   - ¿O solo devuelve info básica + config?

3. **¿Existen endpoints separados para cada tabla de configuración?**
   - `/api/betting-pools/{id}/prizes`
   - `/api/betting-pools/{id}/schedules`
   - etc.

4. **¿Quieres que investigue directamente el backend o prefieres darme esa información?**

## 🎯 Próximos Pasos

**Opción 1**: Si tienes acceso al backend
- Dame la estructura de respuesta del endpoint `GET /api/betting-pools/{id}`
- O dame acceso al código del backend para revisar el controller

**Opción 2**: Si el backend no está disponible/documentado
- Puedo hacer un test manual:
  - Correr el frontend en modo dev
  - Abrir la página de edición de una banca
  - Ver en DevTools qué devuelve el API
  - Documentar la estructura real

**Opción 3**: Si quieres que cree una estructura "best guess"
- Puedo crear el mapeo asumiendo una estructura razonable
- Lo probamos y ajustamos según errores

## 💡 Recomendación

Te sugiero **Opción 2**: Voy a hacer un test manual del endpoint para ver qué devuelve realmente el API. Esto nos dará la información exacta que necesitamos para completar el mapeo de datos.

¿Quieres que proceda con esto?
