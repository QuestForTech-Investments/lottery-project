# 📊 Reporte Completo: Integración API Crear/Editar Banca

**Fecha:** 19 de Octubre, 2025
**Proyecto:** LottoWebApp - Sistema de Gestión de Loterías
**Objetivo:** Análisis completo de datos necesarios para integración Frontend-Backend

---

## 📋 Resumen Ejecutivo

Este reporte documenta el análisis completo de los datos necesarios para implementar la funcionalidad completa de **Crear y Editar Bancas** en el sistema de lotería, incluyendo todos los 8 tabs del formulario frontend.

### Estado Actual

| Métrica | Valor Actual | Valor Objetivo | Gap |
|---------|--------------|----------------|-----|
| **Campos Soportados** | 37 (24%) | 154+ (100%) | 117+ campos |
| **Tabs Funcionales** | 2 de 8 (25%) | 8 de 8 (100%) | 6 tabs |
| **Tablas BD** | 1 tabla | 6 tablas | 5 nuevas tablas |
| **Endpoints API** | 7 endpoints | 15+ endpoints | 8+ nuevos |

---

## 📁 Archivos Generados

### 1. **Análisis de API** ✅
**Archivo:** Ver output del agente API arriba
**Contenido:**
- Mapeo completo de 154+ campos Frontend → API
- Status de soporte (✅ Soportado / ❌ Faltante)
- Estructura completa de Request/Response
- Plan de implementación por fases (6 fases)

### 2. **SQL Migration Script** ✅
**Archivo:** `/docs/SQL_MIGRATION_BRANCHES_EXPANSION.sql` (18 KB)
**Contenido:**
- ALTER TABLE branches (26 nuevas columnas)
- 5 nuevas tablas relacionadas
- 11 índices optimizados
- 5 triggers para updated_at
- Script ejecutable en SQL Server

### 3. **Field Mapping Documentation** ✅
**Archivo:** `/docs/FIELD_MAPPING_FRONTEND_TO_DATABASE.md` (17 KB)
**Contenido:**
- Mapeo completo por tab
- Tipos de datos
- Valores por defecto
- Valores enum

### 4. **Quick Reference Guide** ✅
**Archivo:** `/docs/QUICK_REFERENCE_DATABASE_EXPANSION.md` (8.6 KB)
**Contenido:**
- Resumen rápido
- Checklist de implementación
- Ejemplos de uso
- Consideraciones de performance

---

## 🎯 Datos Necesarios por Tab

### Tab 1: General (✅ 100% Soportado)

**8 campos - Todos funcionando:**

| Campo Frontend | Campo API | Tipo | Requerido |
|----------------|-----------|------|-----------|
| branchName | branchName | string (1-100) | ✅ Sí |
| branchCode | branchCode | string (1-20) | Auto-generado |
| username | username | string (1-100) | No |
| password | password | string (6-100) | Si username existe |
| location | location | string (255) | No |
| reference | reference | string (255) | No |
| comment | comment | string | No |
| selectedZone | zoneId | int | No (default: 6) |

---

### Tab 2: Configuración (✅ 96% Soportado)

**29 de 30 campos funcionando:**

#### Configuración Financiera
- `deactivationBalance` → `deactivation_balance` (DECIMAL(18,2))
- `dailySaleLimit` → `daily_sale_limit` (DECIMAL(18,2))
- `todayBalanceLimit` → `daily_balance_limit` (DECIMAL(18,2))
- `temporaryAdditionalBalance` → `temporary_additional_balance` (DECIMAL(18,2))
- ❌ **FALTANTE:** `creditLimit` → `credit_limit` (DECIMAL(18,2))

#### Configuración Operativa (Enums)
- `fallType` (1-6) → `fall_type` (OFF, COBRO, DIARIA, MENSUAL, SEMANAL)
- `printerType` (1-2) → `print_mode` (DRIVER, GENERICO)
- `discountProvider` (1-2) → `discount_provider` (GRUPO, RIFERO)
- `discountMode` (1-3) → `discount_mode` (OFF, EFECTIVO, TICKET_GRATIS)
- `limitPreference` (1-3/null) → `payment_mode` (BANCA, ZONA, GRUPO, USAR_PREFERENCIA_GRUPO)

#### Toggles (9 booleanos)
- `isActive`, `winningTicketsControl`, `allowPassPot`, `printTickets`
- `printTicketCopy`, `smsOnly`, `enableRecharges`, `printRechargeReceipt`, `allowPasswordChange`

#### Límites y Timeouts
- `minutesToCancelTicket`, `ticketsToCancelPerDay`, `maximumCancelTicketAmount`
- `maxTicketAmount`, `dailyPhoneRechargeLimit`

---

### Tab 3: Pies de Página (❌ 0% Soportado)

**7 campos - NUEVA TABLA REQUERIDA: `branch_footers`**

```sql
CREATE TABLE branch_footers (
    branch_id INT PRIMARY KEY,
    auto_footer BIT DEFAULT 0,
    footer_text_1 NVARCHAR(255),
    footer_text_2 NVARCHAR(255),
    footer_text_3 NVARCHAR(255),
    footer_text_4 NVARCHAR(255),
    show_branch_info BIT DEFAULT 1,
    show_date_time BIT DEFAULT 1,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
```

---

### Tab 4: Premios & Comisiones (❌ 0% Soportado)

**90+ campos - NUEVA TABLA REQUERIDA: `branch_prize_configurations`**

**Tipos de lotería cubiertos:**
- Pick 3 (4 campos)
- Pick 3 Super (4 campos)
- Pick 3 NY (2 campos)
- Pick 4 (2 campos)
- Pick 4 Super (2 campos)
- Pick 4 NY (2 campos)
- Pick 4 Extra (4 campos)
- Pick 5 Mega, NY, Bronx, Brooklyn, Queens (5 campos)
- Pick 5 Super (2 campos)
- Pick 5 Super Extra (6 campos)
- Pick 6 Miami, California, NY (6 campos)
- Pick 6 Extra, California Extra (4 campos)
- Lotto Classic, Lotto Plus (4 campos)
- Mega Millions (2 campos)
- Powerball (12 campos: 3 rondas × 4 premios)

```sql
CREATE TABLE branch_prize_configurations (
    branch_id INT NOT NULL,
    -- Pick 3
    pick3_first_payment DECIMAL(18,2),
    pick3_second_payment DECIMAL(18,2),
    pick3_third_payment DECIMAL(18,2),
    pick3_doubles DECIMAL(18,2),
    -- Pick 3 Super
    pick3_super_all_sequence DECIMAL(18,2),
    pick3_super_first_payment DECIMAL(18,2),
    pick3_super_second_payment DECIMAL(18,2),
    pick3_super_third_payment DECIMAL(18,2),
    -- ... (80+ más campos)
    PRIMARY KEY (branch_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
```

---

### Tab 5: Horarios de Sorteos (❌ 0% Soportado)

**14 campos (7 días × 2 horas) - NUEVA TABLA: `branch_schedules`**

```sql
CREATE TABLE branch_schedules (
    schedule_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,
    day_of_week INT NOT NULL, -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    day_name NVARCHAR(20) NOT NULL, -- 'Monday', 'Tuesday', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE (branch_id, day_of_week)
);
```

**Datos por banca:** 7 filas (una por día)

---

### Tab 6: Sorteos (❌ 0% Soportado)

**2 campos - NUEVA TABLA: `branch_lotteries`**

**69 sorteos disponibles:**
LA PRIMERA, NEW YORK DAY, FLORIDA AM, FLORIDA EVENING, KING MORNING, KING DAY, KING EVENING, LOTEKA EVENING, LA SUERTE DAY, LA SUERTE EVENING, LEIDSA MORNING, LEIDSA DAY, LEIDSA EVENING, MEGA CHANCES MORNING, MEGA CHANCES EVENING, REAL EVENING, NEW YORK EVENING, FLORIDA DAY, FLORIDA NIGHT, LOTEKA DAY, GANA MAS MORNING, GANA MAS EVENING, ANGUILLA MID DAY, ANTIGUA DAY, ANTIGUA EVENING, ST. LUCIA DAY, ST. LUCIA EVENING, GANA MAS DAY, DOMINICA DAY, DOMINICA EVENING, ST. VINCENT DAY, ST. VINCENT EVENING, GRENADA DAY, GRENADA EVENING, LEIDSA NIGHT, NEW YORK NIGHT, KING NIGHT, LOTEKA NIGHT, ST. KITTS MID DAY, ST. KITTS NIGHT, BARBADOS DAY, BARBADOS NIGHT, MONTSERRAT DAY, MONTSERRAT NIGHT, GUYANA MORNING, GUYANA DAY, GUYANA NIGHT, REAL DAY, LA SUERTE NIGHT, REAL NIGHT, FLORIDA PM, JAMAICA MORNING, JAMAICA DAY, JAMAICA NIGHT, HAITI MORNING, HAITI DAY, HAITI NIGHT, CUBA MORNING, CUBA DAY, CUBA NIGHT, BAHAMAS MORNING, BAHAMAS DAY, BAHAMAS NIGHT, TRINIDAD MORNING, TRINIDAD DAY, TRINIDAD NIGHT, KING LOTTERY, NEW YORK PICK, FLORIDA PICK

```sql
CREATE TABLE branch_lotteries (
    branch_id INT NOT NULL,
    lottery_id INT NOT NULL,
    anticipated_closing NVARCHAR(20), -- '5min', '10min', '15min', '20min', '30min', '1hour'
    anticipated_closing_minutes INT DEFAULT 0,
    is_active BIT DEFAULT 1,
    PRIMARY KEY (branch_id, lottery_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id)
);
```

---

### Tab 7: Estilos (❌ 0% Soportado)

**2 campos - NUEVAS COLUMNAS en `branches`:**

```sql
ALTER TABLE branches
ADD sell_screen_style NVARCHAR(50) DEFAULT 'estilo1',
    ticket_print_style NVARCHAR(50) DEFAULT 'original';
```

**Valores posibles:**
- `sellScreenStyles`: estilo1, estilo2, estilo3, estilo4
- `ticketPrintStyles`: original, compact, detailed

---

### Tab 8: Gastos Automáticos (❌ 0% Soportado)

**Array dinámico - NUEVA TABLA: `branch_expenses`**

```sql
CREATE TABLE branch_expenses (
    expense_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,
    expense_name NVARCHAR(255) NOT NULL,
    expense_amount DECIMAL(18,2) NOT NULL,
    is_recurring BIT DEFAULT 1,
    recurrence_type NVARCHAR(20), -- 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY'
    is_active BIT DEFAULT 1,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE
);
```

---

## 🔧 Cambios Necesarios en la API

### Fase 1: Quick Wins (1-2 días)

**Agregar a `branches` tabla:**
```sql
ALTER TABLE branches
ADD credit_limit DECIMAL(18,2) DEFAULT 0.00,
    sell_screen_style NVARCHAR(50) DEFAULT 'estilo1',
    ticket_print_style NVARCHAR(50) DEFAULT 'original';
```

**Actualizar endpoints existentes:**
- POST /api/branches - Aceptar 3 nuevos campos
- PUT /api/branches/{id} - Aceptar 3 nuevos campos
- GET /api/branches/{id} - Retornar 3 nuevos campos

---

### Fase 2: Footers (1 semana)

**Nueva tabla:** `branch_footers`

**Nuevos endpoints:**
- POST /api/branches - Aceptar objeto `footers`
- PUT /api/branches/{id} - Actualizar objeto `footers`
- GET /api/branches/{id} - Retornar objeto `footers` anidado

**Ejemplo Request:**
```json
{
  "branchName": "Banca Centro",
  "footers": {
    "autoFooter": false,
    "footerText1": "Gracias por su compra",
    "footerText2": "¡Buena suerte!",
    "footerText3": "Válido 30 días",
    "footerText4": "No reembolsable",
    "showBranchInfo": true,
    "showDateTime": true
  }
}
```

---

### Fase 3: Schedules (1 semana)

**Nueva tabla:** `branch_schedules`

**Nuevos endpoints:**
- POST /api/branches - Aceptar array `schedules`
- PUT /api/branches/{id} - Actualizar array `schedules`
- GET /api/branches/{id} - Retornar array `schedules`

**Ejemplo Request:**
```json
{
  "branchName": "Banca Centro",
  "schedules": [
    {
      "dayOfWeek": 0,
      "dayName": "Sunday",
      "startTime": "00:00:00",
      "endTime": "23:59:00"
    },
    {
      "dayOfWeek": 1,
      "dayName": "Monday",
      "startTime": "00:00:00",
      "endTime": "23:59:00"
    }
    // ... 5 días más
  ]
}
```

---

### Fase 4: Lotteries (1 semana)

**Nueva tabla:** `branch_lotteries`

**Nuevos endpoints:**
- POST /api/branches - Aceptar array `lotteries`
- PUT /api/branches/{id} - Actualizar array `lotteries`
- GET /api/branches/{id} - Retornar array `lotteries`
- POST /api/branches/{id}/lotteries - Bulk update

**Ejemplo Request:**
```json
{
  "branchName": "Banca Centro",
  "lotteries": [
    {
      "lotteryId": 1,
      "anticipatedClosing": "15min",
      "anticipatedClosingMinutes": 15
    },
    {
      "lotteryId": 2,
      "anticipatedClosing": "15min",
      "anticipatedClosingMinutes": 15
    }
    // ... hasta 69 sorteos
  ]
}
```

---

### Fase 5: Prizes (2 semanas)

**Nueva tabla:** `branch_prize_configurations`

**Nuevos endpoints:**
- POST /api/branches - Aceptar objeto `prizes`
- PUT /api/branches/{id} - Actualizar objeto `prizes`
- GET /api/branches/{id} - Retornar objeto `prizes`
- PUT /api/branches/{id}/prizes - Actualizar solo premios

**Ejemplo Request:**
```json
{
  "branchName": "Banca Centro",
  "prizes": {
    "pick3FirstPayment": 500.00,
    "pick3SecondPayment": 300.00,
    "pick3ThirdPayment": 200.00,
    "pick3Doubles": 100.00,
    // ... 86+ campos más
  }
}
```

---

### Fase 6: Expenses (1 semana)

**Nueva tabla:** `branch_expenses`

**Nuevos endpoints:**
- POST /api/branches - Aceptar array `expenses`
- GET /api/branches/{id}/expenses - Listar gastos
- POST /api/branches/{id}/expenses - Crear gasto
- PUT /api/branches/{id}/expenses/{expenseId} - Actualizar gasto
- DELETE /api/branches/{id}/expenses/{expenseId} - Eliminar gasto

**Ejemplo Request:**
```json
{
  "branchName": "Banca Centro",
  "expenses": [
    {
      "expenseName": "Alquiler mensual",
      "expenseAmount": 500.00,
      "isRecurring": true,
      "recurrenceType": "MONTHLY"
    },
    {
      "expenseName": "Limpieza diaria",
      "expenseAmount": 20.00,
      "isRecurring": true,
      "recurrenceType": "DAILY"
    }
  ]
}
```

---

## 🗄️ Resumen de Cambios en Base de Datos

### Tablas Modificadas
- **branches:** +26 columnas (configuración completa)

### Tablas Nuevas
1. **branch_footers** (1:1 con branches)
2. **branch_schedules** (1:7 con branches - 7 días)
3. **branch_lotteries** (1:N con branches - múltiples sorteos)
4. **branch_prize_configurations** (1:1 con branches - 90+ campos)
5. **branch_expenses** (1:N con branches - múltiples gastos)

### Índices Nuevos
- 11 índices optimizados para consultas rápidas

### Triggers Nuevos
- 5 triggers para actualización automática de `updated_at`

### Foreign Keys
- 5 relaciones con `ON DELETE CASCADE`

---

## 📊 Estructura Completa de Request/Response

### Complete POST /api/branches Request

```json
{
  "branchName": "Banca Centro Comercial",
  "branchCode": "LAN-0520",
  "username": "admin_centro",
  "password": "SecurePass123",
  "location": "Centro Comercial Plaza",
  "reference": "REF-001",
  "comment": "Banca principal",
  "zoneId": 1,

  "deactivationBalance": 500.00,
  "dailySaleLimit": 5000.00,
  "dailyBalanceLimit": 2000.00,
  "temporaryAdditionalBalance": 1000.00,
  "creditLimit": 10000.00,

  "fallType": "DIARIA",
  "printMode": "DRIVER",
  "discountProvider": "GRUPO",
  "discountMode": "EFECTIVO",
  "paymentMode": "BANCA",

  "isActive": true,
  "controlWinningTickets": true,
  "allowJackpot": true,
  "printEnabled": true,
  "printTicketCopy": false,
  "smsOnly": false,
  "enableRecharges": true,
  "printRechargeReceipt": true,
  "allowPasswordChange": true,

  "cancelMinutes": 30,
  "dailyCancelTickets": 10,
  "maxCancelAmount": 1000.00,
  "maxTicketAmount": 500.00,
  "maxDailyRecharge": 2000.00,

  "sellScreenStyle": "estilo1",
  "ticketPrintStyle": "original",

  "footers": {
    "autoFooter": false,
    "footerText1": "Gracias por su compra",
    "footerText2": "¡Buena suerte!",
    "footerText3": "Válido 30 días",
    "footerText4": "No reembolsable",
    "showBranchInfo": true,
    "showDateTime": true
  },

  "schedules": [
    { "dayOfWeek": 0, "dayName": "Sunday", "startTime": "00:00:00", "endTime": "23:59:00" },
    { "dayOfWeek": 1, "dayName": "Monday", "startTime": "00:00:00", "endTime": "23:59:00" },
    { "dayOfWeek": 2, "dayName": "Tuesday", "startTime": "00:00:00", "endTime": "23:59:00" },
    { "dayOfWeek": 3, "dayName": "Wednesday", "startTime": "00:00:00", "endTime": "23:59:00" },
    { "dayOfWeek": 4, "dayName": "Thursday", "startTime": "00:00:00", "endTime": "23:59:00" },
    { "dayOfWeek": 5, "dayName": "Friday", "startTime": "00:00:00", "endTime": "23:59:00" },
    { "dayOfWeek": 6, "dayName": "Saturday", "startTime": "00:00:00", "endTime": "23:59:00" }
  ],

  "lotteries": [
    { "lotteryId": 1, "anticipatedClosing": "15min", "anticipatedClosingMinutes": 15 },
    { "lotteryId": 2, "anticipatedClosing": "15min", "anticipatedClosingMinutes": 15 }
    // ... hasta 69 sorteos
  ],

  "prizes": {
    "pick3FirstPayment": 500.00,
    "pick3SecondPayment": 300.00,
    // ... 88+ campos más
  },

  "expenses": [
    {
      "expenseName": "Alquiler mensual",
      "expenseAmount": 500.00,
      "isRecurring": true,
      "recurrenceType": "MONTHLY"
    }
  ]
}
```

---

## ✅ Checklist de Implementación

### Para el Equipo de Base de Datos

- [ ] Revisar script SQL completo (`SQL_MIGRATION_BRANCHES_EXPANSION.sql`)
- [ ] Ejecutar en entorno de desarrollo
- [ ] Verificar todas las tablas creadas
- [ ] Verificar todos los índices creados
- [ ] Verificar todos los triggers funcionando
- [ ] Probar con datos de prueba
- [ ] Ejecutar en staging
- [ ] Ejecutar en producción (con backup previo)

### Para el Equipo de Backend/API

- [ ] **Fase 1:** Agregar 3 campos simples (creditLimit, sellScreenStyle, ticketPrintStyle)
- [ ] **Fase 2:** Implementar tabla branch_footers y endpoints
- [ ] **Fase 3:** Implementar tabla branch_schedules y endpoints
- [ ] **Fase 4:** Implementar tabla branch_lotteries y endpoints
- [ ] **Fase 5:** Implementar tabla branch_prize_configurations y endpoints
- [ ] **Fase 6:** Implementar tabla branch_expenses y endpoints completos
- [ ] Actualizar DTOs para todos los nuevos campos
- [ ] Implementar validaciones (start_time < end_time, amounts > 0, etc.)
- [ ] Crear tests unitarios
- [ ] Crear tests de integración

### Para el Equipo de Frontend

- [ ] Actualizar función de mapeo de datos en CreateBanca.jsx
- [ ] Implementar envío de datos anidados (footers, prizes, schedules, etc.)
- [ ] Implementar manejo de arrays (lotteries, expenses, schedules)
- [ ] Actualizar validaciones del formulario
- [ ] Probar creación completa de banca (8 tabs)
- [ ] Probar edición completa de banca (8 tabs)
- [ ] Verificar que todos los datos se persisten correctamente
- [ ] Implementar manejo de errores por campo

---

## 📈 Métricas de Progreso

| Fase | Campos | Tablas | Endpoints | Tiempo Estimado | Estado |
|------|--------|--------|-----------|-----------------|--------|
| **Actual** | 37 (24%) | 1 | 7 | - | ✅ Completado |
| **Fase 1** | 40 (26%) | 1 | 7 | 1-2 días | ⏳ Pendiente |
| **Fase 2** | 47 (31%) | 2 | 7 | 1 semana | ⏳ Pendiente |
| **Fase 3** | 61 (40%) | 3 | 7 | 1 semana | ⏳ Pendiente |
| **Fase 4** | 63 (41%) | 4 | 9 | 1 semana | ⏳ Pendiente |
| **Fase 5** | 153 (99%) | 5 | 10 | 2 semanas | ⏳ Pendiente |
| **Fase 6** | 154+ (100%) | 6 | 15+ | 1 semana | ⏳ Pendiente |

**Tiempo Total Estimado:** 6-8 semanas

---

## 🎯 Próximos Pasos Inmediatos

1. **Reunión con Equipo de Backend** (Esta semana)
   - Revisar este reporte completo
   - Validar estructura de datos propuesta
   - Confirmar plan de implementación por fases
   - Asignar responsabilidades

2. **Ejecución Fase 1** (Próxima semana)
   - Ejecutar migración SQL para 3 campos
   - Actualizar API para 3 campos
   - Probar en desarrollo
   - Desplegar a staging

3. **Planificación Fases 2-6** (Siguiente sprint)
   - Estimar esfuerzo detallado por fase
   - Asignar desarrolladores
   - Definir fechas de entrega
   - Configurar ambiente de pruebas

---

## 📞 Contacto y Soporte

**Documentos de Referencia:**
- `/docs/SQL_MIGRATION_BRANCHES_EXPANSION.sql` - Script SQL completo
- `/docs/FIELD_MAPPING_FRONTEND_TO_DATABASE.md` - Mapeo detallado de campos
- `/docs/QUICK_REFERENCE_DATABASE_EXPANSION.md` - Guía rápida

**Para Consultas:**
- Revisar documentación de API V4.0
- Revisar documentación de Base de Datos
- Consultar dudas en `/docs/DUDAS_REUNION_EQUIPO.md`

---

**Generado por:** Claude Code
**Fecha:** 19 de Octubre, 2025
**Versión:** 1.0
**Estado:** ✅ Listo para Revisión del Equipo
