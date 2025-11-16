# ✅ Paso 1: Resultado de Verificación - Tabla Branches

**Fecha:** 19 de Octubre, 2025
**Archivo revisado:** `/lottery-api/LotteryAPI/Models/Entities.cs` (líneas 353-461)

---

## 📊 Resumen Ejecutivo

**Total de campos en modelo Branch:** 24 campos
**Campos que frontend envía:** 37 campos
**Campos que SÍ se guardan:** 22 campos (Tab General + Parcial Configuración)
**Campos que NO se guardan:** 15 campos (Faltan en modelo)

---

## ✅ Campos que YA EXISTEN en la BD (22)

### Tab General (8 campos) - 100% Existe

| Campo Frontend | Columna BD | Tipo BD | Estado |
|----------------|------------|---------|--------|
| branchName | branch_name | NVARCHAR(100) | ✅ Existe |
| branchCode | branch_name | NVARCHAR(100) | ✅ Existe |
| username | username | NVARCHAR(100) | ✅ Existe |
| location | location | NVARCHAR(255) | ✅ Existe |
| reference | reference | NVARCHAR(255) | ✅ Existe |
| comment | comment | TEXT | ✅ Existe |
| selectedZone | zone_id | INT | ✅ Existe |
| (bankId) | bank_id | INT | ✅ Existe |

### Tab Configuración - Campos Financieros (6 campos)

| Campo Frontend | Columna BD | Tipo BD | Estado |
|----------------|------------|---------|--------|
| (commissionRate) | commission_rate | DECIMAL(5,2) | ✅ Existe |
| creditLimit | credit_limit | DECIMAL(12,2) | ✅ Existe |
| deactivationBalance | deactivation_balance | DECIMAL(10,2) | ✅ Existe |
| dailySaleLimit | daily_sale_limit | DECIMAL(10,2) | ✅ Existe |
| dailyBalanceLimit | daily_balance_limit | DECIMAL(10,2) | ✅ Existe |
| temporaryAdditionalBalance | temporary_additional_balance | DECIMAL(10,2) | ✅ Existe |

### Tab Configuración - Enums (4 campos)

| Campo Frontend | Columna BD | Tipo BD | Estado |
|----------------|------------|---------|--------|
| fallType | fall_type | NVARCHAR(50) | ✅ Existe |
| printMode | print_mode | NVARCHAR(50) | ✅ Existe |
| discountProvider | discount_provider | NVARCHAR(50) | ✅ Existe |
| discountMode | discount_mode | NVARCHAR(50) | ✅ Existe |

### Tab Configuración - Toggles (4 de 9 campos)

| Campo Frontend | Columna BD | Tipo BD | Estado |
|----------------|------------|---------|--------|
| controlWinningTickets | control_winning_tickets | BIT | ✅ Existe |
| allowJackpot | allow_jackpot | BIT | ✅ Existe |
| printEnabled | print_enabled | BIT | ✅ Existe |
| printTicketCopy | print_ticket_copy | BIT | ✅ Existe |

---

## ❌ Campos que NO EXISTEN en la BD (15)

### Toggles Faltantes (5 campos)

| Campo Frontend | Columna Necesaria | Tipo Sugerido |
|----------------|-------------------|---------------|
| isActive | is_active | BIT | ⚠️ **EXISTE** pero no se usa en API |
| smsOnly | sms_only | BIT |
| enableRecharges | enable_recharges | BIT |
| printRechargeReceipt | print_recharge_receipt | BIT |
| allowPasswordChange | allow_password_change | BIT |

### Límites y Timeouts (5 campos)

| Campo Frontend | Columna Necesaria | Tipo Sugerido |
|----------------|-------------------|---------------|
| cancelMinutes | cancel_minutes | INT |
| dailyCancelTickets | daily_cancel_tickets | INT |
| maxCancelAmount | max_cancel_amount | DECIMAL(10,2) |
| maxTicketAmount | max_ticket_amount | DECIMAL(10,2) |
| maxDailyRecharge | max_daily_recharge | DECIMAL(10,2) |

### Configuración de Pago (1 campo)

| Campo Frontend | Columna Necesaria | Tipo Sugerido |
|----------------|-------------------|---------------|
| paymentMode | payment_mode | NVARCHAR(50) |

---

## 🔧 Plan de Acción - Agregar 15 Columnas Faltantes

### Paso 2: Agregar Columnas a la BD

**Archivo a crear:** `add_missing_configuration_columns.sql`

```sql
USE [LottoTest];
GO

-- ===== TOGGLES FALTANTES (4 columnas) =====
ALTER TABLE branches ADD sms_only BIT DEFAULT 0;
ALTER TABLE branches ADD enable_recharges BIT DEFAULT 1;
ALTER TABLE branches ADD print_recharge_receipt BIT DEFAULT 1;
ALTER TABLE branches ADD allow_password_change BIT DEFAULT 1;

-- ===== LÍMITES Y TIMEOUTS (5 columnas) =====
ALTER TABLE branches ADD cancel_minutes INT DEFAULT 30;
ALTER TABLE branches ADD daily_cancel_tickets INT NULL;
ALTER TABLE branches ADD max_cancel_amount DECIMAL(10,2) NULL;
ALTER TABLE branches ADD max_ticket_amount DECIMAL(10,2) NULL;
ALTER TABLE branches ADD max_daily_recharge DECIMAL(10,2) NULL;

-- ===== CONFIGURACIÓN DE PAGO (1 columna) =====
ALTER TABLE branches ADD payment_mode NVARCHAR(50) DEFAULT 'BANCA';

PRINT 'Se agregaron 10 columnas faltantes a la tabla branches';
GO
```

### Paso 3: Actualizar Modelo C# (Branch.cs / Entities.cs)

Agregar después de la línea 451 (después de `PrintTicketCopy`):

```csharp
// ===== TOGGLES ADICIONALES =====
[Column("sms_only")]
public bool SmsOnly { get; set; } = false;

[Column("enable_recharges")]
public bool EnableRecharges { get; set; } = true;

[Column("print_recharge_receipt")]
public bool PrintRechargeReceipt { get; set; } = true;

[Column("allow_password_change")]
public bool AllowPasswordChange { get; set; } = true;

// ===== LÍMITES Y TIMEOUTS =====
[Column("cancel_minutes")]
public int CancelMinutes { get; set; } = 30;

[Column("daily_cancel_tickets")]
public int? DailyCancelTickets { get; set; }

[Column("max_cancel_amount", TypeName = "decimal(10,2)")]
public decimal? MaxCancelAmount { get; set; }

[Column("max_ticket_amount", TypeName = "decimal(10,2)")]
public decimal? MaxTicketAmount { get; set; }

[Column("max_daily_recharge", TypeName = "decimal(10,2)")]
public decimal? MaxDailyRecharge { get; set; }

// ===== CONFIGURACIÓN DE PAGO =====
[Column("payment_mode")]
[StringLength(50)]
public string PaymentMode { get; set; } = "BANCA";
```

### Paso 4: Actualizar CreateBranchRequest.cs (DTOs.cs)

Agregar después de línea 314:

```csharp
// ===== TOGGLES ADICIONALES =====
public bool? SmsOnly { get; set; } = false;
public bool? EnableRecharges { get; set; } = true;
public bool? PrintRechargeReceipt { get; set; } = true;
public bool? AllowPasswordChange { get; set; } = true;

// ===== LÍMITES Y TIMEOUTS =====
[Range(0, int.MaxValue, ErrorMessage = "Cancel minutes must be positive")]
public int? CancelMinutes { get; set; } = 30;

[Range(0, int.MaxValue, ErrorMessage = "Daily cancel tickets must be positive")]
public int? DailyCancelTickets { get; set; }

[Range(0, double.MaxValue, ErrorMessage = "Max cancel amount must be positive")]
public decimal? MaxCancelAmount { get; set; }

[Range(0, double.MaxValue, ErrorMessage = "Max ticket amount must be positive")]
public decimal? MaxTicketAmount { get; set; }

[Range(0, double.MaxValue, ErrorMessage = "Max daily recharge must be positive")]
public decimal? MaxDailyRecharge { get; set; }

// ===== CONFIGURACIÓN DE PAGO =====
[StringLength(50, ErrorMessage = "Payment mode cannot exceed 50 characters")]
public string? PaymentMode { get; set; } = "BANCA";
```

### Paso 5: Actualizar BranchesController.cs

En el método `CreateBranch()`, agregar después de línea 245:

```csharp
// ===== TOGGLES ADICIONALES =====
SmsOnly = request.SmsOnly ?? false,
EnableRecharges = request.EnableRecharges ?? true,
PrintRechargeReceipt = request.PrintRechargeReceipt ?? true,
AllowPasswordChange = request.AllowPasswordChange ?? true,

// ===== LÍMITES Y TIMEOUTS =====
CancelMinutes = request.CancelMinutes ?? 30,
DailyCancelTickets = request.DailyCancelTickets,
MaxCancelAmount = request.MaxCancelAmount,
MaxTicketAmount = request.MaxTicketAmount,
MaxDailyRecharge = request.MaxDailyRecharge,

// ===== CONFIGURACIÓN DE PAGO =====
PaymentMode = request.PaymentMode ?? "BANCA"
```

También actualizar `UpdateBranch()` si existe.

---

## 📝 Checklist de Implementación

### [ ] Paso 2: Base de Datos
- [ ] Ejecutar script SQL para agregar 10 columnas
- [ ] Verificar que se agregaron correctamente
- [ ] Probar INSERT manual para confirmar

### [ ] Paso 3: Modelo C#
- [ ] Agregar 10 propiedades a clase `Branch` en `Entities.cs`
- [ ] Compilar para verificar sin errores

### [ ] Paso 4: DTO
- [ ] Agregar 10 propiedades a `CreateBranchRequest` en `DTOs.cs`
- [ ] Agregar 10 propiedades a `UpdateBranchRequest` en `DTOs.cs`
- [ ] Compilar para verificar sin errores

### [ ] Paso 5: Controller
- [ ] Actualizar método `CreateBranch()` para asignar 10 nuevos campos
- [ ] Actualizar método `UpdateBranch()` para actualizar 10 nuevos campos
- [ ] Actualizar método `GetBranch()` para retornar 10 nuevos campos
- [ ] Compilar para verificar sin errores

### [ ] Paso 6: Pruebas
- [ ] Probar crear banca nueva con todos los campos
- [ ] Verificar en BD que se guardaron los 10 campos nuevos
- [ ] Probar editar banca y actualizar los campos
- [ ] Probar GET para confirmar que se retornan

---

## 🎯 Próximo Paso Inmediato

**OPCIÓN A: Ejecutar script SQL primero** (Recomendado)
1. Copiar el script SQL de arriba
2. Conectarse a Azure SQL Database
3. Ejecutar el script
4. Confirmar que se agregaron las columnas

**OPCIÓN B: Crear endpoint de verificación**
1. Agregar endpoint temporal a la API (ver PASO_1_ALTERNATIVA_API.md)
2. Ejecutar endpoint para ver columnas actuales
3. Confirmar lo que falta

---

## 📊 Resumen de Compatibilidad

| Tab | Campos Totales | Existen en BD | Faltan | % Completo |
|-----|---------------|---------------|--------|------------|
| General | 8 | 8 | 0 | 100% |
| Configuración | 29 | 14 | 15 | 48% |
| **TOTAL** | **37** | **22** | **15** | **59%** |

**Después de agregar las 10 columnas:**
- Tab Configuración: 29/29 (100%)
- Total: 37/37 (100%)

---

¿Quieres que te ayude a ejecutar el script SQL o prefieres primero crear el endpoint de verificación?
