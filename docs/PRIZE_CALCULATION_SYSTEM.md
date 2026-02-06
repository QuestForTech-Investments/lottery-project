# Sistema de Cálculo de Premios

Documentación del sistema de premios del proyecto de lotería.

---

## 1. Arquitectura General

El sistema de premios tiene **3 niveles de configuración** en cascada:

```
┌─────────────────────────────────────────────────────────┐
│                    NIVEL 1: SISTEMA                      │
│              (prize_types.default_multiplier)            │
│                    Ejemplo: 56.00x                       │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    NIVEL 2: BANCA                        │
│           (banca_prize_configs.custom_value)             │
│              Override para toda la banca                 │
└─────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 NIVEL 3: SORTEO ESPECÍFICO               │
│           (draw_prize_configs.custom_value)              │
│         Override para un sorteo en una banca             │
└─────────────────────────────────────────────────────────┘
```

**Regla de Cascada:** `sorteo_específico > banca > sistema`

---

## 2. Tablas de Base de Datos

### 2.1 prize_types (Catálogo de Tipos de Premio)

Define los campos de pago disponibles por tipo de apuesta.

| Campo | Descripción |
|-------|-------------|
| `prize_type_id` | ID único (identity) |
| `bet_type_id` | FK al tipo de apuesta |
| `field_code` | Código único (ej: `DIRECTO_PRIMER_PAGO`) |
| `field_name` | Nombre visible (ej: "Directo - Primer Pago") |
| `default_multiplier` | Multiplicador por defecto del sistema |
| `min_multiplier` | Mínimo permitido |
| `max_multiplier` | Máximo permitido |
| `display_order` | Orden de visualización |
| `is_active` | Estado activo/inactivo |

### 2.2 banca_prize_configs (Configuración por Banca)

Override de premios a nivel de banca (aplica a todos los sorteos de esa banca).

| Campo | Descripción |
|-------|-------------|
| `config_id` | ID único |
| `betting_pool_id` | FK a la banca |
| `prize_type_id` | FK al tipo de premio |
| `custom_value` | Valor personalizado para esta banca |

**Índice único:** `betting_pool_id + prize_type_id`

### 2.3 draw_prize_configs (Configuración por Sorteo)

Override específico para un sorteo en una banca particular.

| Campo | Descripción |
|-------|-------------|
| `config_id` | ID único |
| `betting_pool_id` | FK a la banca |
| `draw_id` | FK al sorteo |
| `prize_type_id` | FK al tipo de premio |
| `custom_value` | Valor específico para este sorteo |

**Índice único:** `betting_pool_id + draw_id + prize_type_id`

---

## 3. Tipos de Apuestas y Premios

### 3.1 Loterías Dominicanas

#### DIRECTO (4 campos de pago)
| Campo | Código | Default |
|-------|--------|---------|
| Primer Pago | `DIRECTO_PRIMER_PAGO` | 56.00x |
| Segundo Pago | `DIRECTO_SEGUNDO_PAGO` | 18.00x |
| Tercer Pago | `DIRECTO_TERCER_PAGO` | 12.00x |
| Dobles | `DIRECTO_DOBLES` | Variable |

#### PALÉ (4 campos de pago)
| Campo | Código | Default |
|-------|--------|---------|
| Todos en secuencia | `PALE_TODOS` | Variable |
| Primer/Segundo | `PALE_PRIMER_SEGUNDO` | Variable |
| Primer/Tercero | `PALE_PRIMER_TERCERO` | Variable |
| Segundo/Tercero | `PALE_SEGUNDO_TERCERO` | Variable |

#### TRIPLETA (2 campos de pago)
| Campo | Código | Default |
|-------|--------|---------|
| Primer Pago | `TRIPLETA_PRIMER_PAGO` | Variable |
| Segundo Pago | `TRIPLETA_SEGUNDO_PAGO` | Variable |

### 3.2 Loterías USA

#### PICK 3
- **STRAIGHT** - 3 dígitos en orden exacto
- **BOX** - 3 dígitos en cualquier orden

#### PICK 4
- **STRAIGHT** - 4 dígitos en orden exacto
- **BOX** - 4 dígitos en cualquier orden
- **DOBLES** - Variantes con dígitos repetidos

#### PICK 5
- Similar a PICK 4 con 5 dígitos

### 3.3 Otros Tipos
- Cash3
- Play4
- Singulación
- Bolita
- Super Palé

---

## 4. Fórmula de Cálculo

### 4.1 Fórmula Base

```
Premio = Monto_Apostado × Multiplicador_Resuelto
```

### 4.2 Resolución del Multiplicador

```typescript
function resolveMultiplier(bettingPoolId, drawId, prizeTypeId) {
  // 1. Buscar config específica del sorteo
  const drawConfig = getDrawPrizeConfig(bettingPoolId, drawId, prizeTypeId);
  if (drawConfig) return drawConfig.customValue;

  // 2. Buscar config de la banca
  const bancaConfig = getBancaPrizeConfig(bettingPoolId, prizeTypeId);
  if (bancaConfig) return bancaConfig.customValue;

  // 3. Usar default del sistema
  const prizeType = getPrizeType(prizeTypeId);
  return prizeType.defaultMultiplier;
}
```

### 4.3 Ejemplo Práctico

```
Escenario:
- Banca: "La Fortuna" (ID: 15)
- Sorteo: "Lotería Nacional Noche" (ID: 42)
- Apuesta: $100 en DIRECTO
- Número ganador en Primera posición

Configuración:
- Sistema: DIRECTO_PRIMER_PAGO = 56.00x
- Banca 15: DIRECTO_PRIMER_PAGO = 50.00x (override)
- Sorteo 42 en Banca 15: No existe config

Resolución:
1. ¿Existe draw_prize_config para (15, 42, DIRECTO_PRIMER_PAGO)? NO
2. ¿Existe banca_prize_config para (15, DIRECTO_PRIMER_PAGO)? SÍ → 50.00x

Cálculo:
Premio = $100 × 50.00 = $5,000
```

---

## 5. API Endpoints

### 5.1 Configuración por Banca

```
GET    /api/betting-pools/{id}/prize-config
POST   /api/betting-pools/{id}/prize-config
PATCH  /api/betting-pools/{id}/prize-config  (optimizado)
DELETE /api/betting-pools/{id}/prize-config
```

### 5.2 Configuración por Sorteo

```
GET    /api/betting-pools/{id}/draws/{drawId}/prize-config
GET    /api/betting-pools/{id}/draws/{drawId}/prize-config/resolved
POST   /api/betting-pools/{id}/draws/{drawId}/prize-config
DELETE /api/betting-pools/{id}/draws/{drawId}/prize-config
```

### 5.3 Jugadas Ganadoras

```
GET    /api/winning-plays
GET    /api/winning-plays/params
```

---

## 6. Servicios Frontend

### 6.1 prizeFieldService.ts

```typescript
// Configuración por banca
saveBancaPrizeConfig(bettingPoolId, configs)
patchBancaPrizeConfig(bettingPoolId, configs)  // Optimizado
getBancaPrizeConfig(bettingPoolId)
deleteBancaPrizeConfig(bettingPoolId)

// Configuración por sorteo
saveDrawPrizeConfig(bettingPoolId, drawId, configs)
getDrawPrizeConfig(bettingPoolId, drawId)
getResolvedDrawPrizeConfig(bettingPoolId, drawId)  // Con cascada
deleteDrawPrizeConfig(bettingPoolId, drawId)

// Catálogo
getPrizeFields()
getBetTypes()
```

### 6.2 winningPlayService.ts

```typescript
getWinningPlaysParams()  // Filtros disponibles
getWinningPlays(filter)  // Listado con totales
```

---

## 7. Componentes UI

### 7.1 PrizesTab (en CreateBettingPool/EditBettingPool)

Estructura de 3 niveles de tabs:

```
Tab "Premios & Comisiones"
├── Sub-tab "Premios"
│   ├── Tab "General" (config de banca)
│   ├── Tab "Lotería Nacional"
│   ├── Tab "La Primera"
│   └── Tab ... (~70 sorteos)
└── Sub-tab "Comisiones"
    └── (similar estructura)
```

### 7.2 WinningPlays (/tickets/winners)

- Filtros: Fecha, Sorteo, Zonas
- Tabla: Tipo, Número, Venta, Premio, Total
- Totales: Registros, Ventas, Premios, Neto

---

## 8. Estado de Implementación

### ✅ Implementado

- [x] CRUD configuración por banca
- [x] CRUD configuración por sorteo
- [x] Resolución en cascada
- [x] API endpoints completos
- [x] UI de configuración (PrizesTab)
- [x] Listado de jugadas ganadoras
- [x] PATCH optimizado (95-98% más rápido)
- [x] Caché frontend (5 min)
- [x] Carga lazy de bet types

### ⚠️ Parcial / En Progreso

- [ ] Exportación PDF de jugadas ganadoras
- [ ] Integración completa de comisiones en UI

### ❌ No Implementado

- [ ] Cálculo automático de premios al crear ticket
- [ ] Marcado de tickets como pagados
- [ ] Auditoría de cambios en configuración
- [ ] Límites de pago por número caliente

---

## 9. Archivos Clave

### Backend (.NET)

```
api/src/LotteryApi/
├── Models/
│   ├── PrizeType.cs
│   ├── BancaPrizeConfig.cs
│   └── DrawPrizeConfig.cs
├── Controllers/
│   ├── BancaPrizeConfigController.cs
│   ├── DrawPrizeConfigController.cs
│   └── WinningPlaysController.cs
└── DTOs/
    ├── BancaPrizeConfigDto.cs
    └── DrawPrizeConfigDto.cs
```

### Frontend (React + TypeScript)

```
frontend-v4/src/
├── services/
│   ├── prizeFieldService.ts
│   ├── prizeService.ts
│   └── winningPlayService.ts
└── components/features/
    ├── betting-pools/CreateBettingPool/tabs/PrizesTab/
    ├── tickets/WinningPlays/
    └── sales/PlayTypePrizes/
```

---

## 10. Preguntas Abiertas

1. **¿Cómo se determina qué número ganó?** - ¿Se sincroniza con resultados externos?
2. **¿Cuándo se calcula el premio?** - ¿Al publicar resultados o al consultar?
3. **¿Cómo se marca un premio como pagado?** - ¿Flujo de aprobación?
4. **¿Existe límite de pago por número?** - ¿Integración con sistema de límites?

---

**Última actualización:** 2026-02-06
