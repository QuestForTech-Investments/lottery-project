# Análisis: Bet Types vs Game Types

## 🔍 Problema Identificado

Hay **DOS sistemas paralelos** para manejar tipos de apuestas en la base de datos:

### 1. `game_types` (Sistema Viejo - 21 tipos)
- **Propósito**: Tipos de juegos para tickets
- **Características**:
  - Tiene un solo `prizeMultiplier` por tipo
  - Usado en `ticket_lines` para registrar apuestas
  - Relacionado con `lotteries` a través de `lottery_game_compatibility` (275 registros)
  - Endpoint: `GET /api/game-types`

**Ejemplo**:
```json
{
  "gameTypeId": 1,
  "gameTypeCode": "DIRECTO",
  "gameName": "Directo",
  "prizeMultiplier": 80.0,
  "numberLength": 2
}
```

### 2. `bet_types` (Sistema Nuevo - 23 tipos)
- **Propósito**: Configuración de premios para bancas
- **Características**:
  - Tiene múltiples `prize_fields` por tipo (64 campos en total)
  - DIRECTO tiene 4 campos: Primer Pago, Segundo Pago, Tercer Pago, Dobles
  - NO tiene relación directa con `lotteries` en la BD
  - Endpoint: `GET /api/bet-types/with-fields`

**Ejemplo**:
```json
{
  "betTypeId": 1,
  "betTypeCode": "DIRECTO",
  "betTypeName": "Directo",
  "prizeFields": [
    {"fieldName": "Directo - Primer Pago", "defaultMultiplier": 56.0},
    {"fieldName": "Directo - Segundo Pago", "defaultMultiplier": 12.0},
    {"fieldName": "Directo - Tercer Pago", "defaultMultiplier": 4.0},
    {"fieldName": "Directo - Dobles", "defaultMultiplier": 56.0}
  ]
}
```

---

## 🚨 El Problema Principal

**La lotería "LA PRIMERA" solo tiene 3 tipos de apuestas habilitados:**
1. Directo
2. Palé
3. Tripleta

Pero el frontend V2 muestra TODOS los 23 `bet_types` para todas las loterías porque:
- ❌ NO existe tabla `lottery_bet_type_compatibility` en la base de datos
- ❌ NO hay endpoint `GET /api/lotteries/{id}/bet-types`
- ❌ El endpoint actual `GET /api/bet-types/with-fields` devuelve TODOS los tipos sin filtro

---

## 📊 Comparación de Sistemas

| Característica | `game_types` | `bet_types` |
|----------------|--------------|-------------|
| Total de tipos | 21 | 23 |
| Multiplicadores | 1 por tipo | Múltiples (1-6 campos) |
| Relación con lotteries | ✅ `lottery_game_compatibility` | ❌ No existe |
| Usado en tickets | ✅ Sí | ❌ No |
| Usado en configuración | ❌ No | ✅ Sí (premios de bancas) |
| Filtrado por lotería | ✅ Posible | ❌ No implementado |

---

## 💡 Soluciones Posibles

### Opción 1: Crear Tabla de Relación (Recomendado) ⭐
**Crear `lottery_bet_type_compatibility`**

```sql
CREATE TABLE lottery_bet_type_compatibility (
    compatibility_id INT IDENTITY(1,1) PRIMARY KEY,
    lottery_id INT NOT NULL,
    bet_type_id INT NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (bet_type_id) REFERENCES bet_types(bet_type_id),
    UNIQUE (lottery_id, bet_type_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX IX_lottery_bet_type_lottery ON lottery_bet_type_compatibility(lottery_id);
```

**Ventajas**:
- ✅ Arquitectura limpia y escalable
- ✅ Control granular por lotería
- ✅ Fácil de mantener
- ✅ Consistente con el patrón actual

**Desventajas**:
- ❌ Requiere migración de datos
- ❌ Necesita endpoint nuevo en la API

---

### Opción 2: Mapear game_types → bet_types
**Crear un mapeo en el backend o frontend**

```javascript
// En el frontend
const GAME_TYPE_TO_BET_TYPE_MAP = {
  'DIRECTO': 1,     // bet_type_id para Directo
  'PALÉ': 2,        // bet_type_id para Palé
  'TRIPLETA': 3,    // bet_type_id para Tripleta
  // ...
};

// Filtrar bet_types basándose en lottery_game_compatibility
async function getBetTypesForLottery(lotteryId) {
  // 1. Obtener game_types de la lotería
  const gameTypes = await fetch(`/api/lotteries/${lotteryId}/game-types`);

  // 2. Mapear a bet_types
  const betTypeIds = gameTypes.map(gt => GAME_TYPE_TO_BET_TYPE_MAP[gt.gameTypeCode]);

  // 3. Filtrar bet_types
  const allBetTypes = await fetch('/api/bet-types/with-fields');
  return allBetTypes.filter(bt => betTypeIds.includes(bt.betTypeId));
}
```

**Ventajas**:
- ✅ No requiere cambios en la BD
- ✅ Rápido de implementar

**Desventajas**:
- ❌ Requiere mantener mapeo manualmente
- ❌ Asume que códigos coinciden perfectamente
- ❌ Frágil ante cambios

---

### Opción 3: Endpoint Nuevo en la API
**Crear `GET /api/lotteries/{id}/bet-types`**

```csharp
[HttpGet("lotteries/{id}/bet-types")]
public async Task<ActionResult<List<BetTypeWithFieldsDto>>> GetBetTypesByLottery(int id)
{
    // 1. Obtener game_types compatibles con la lotería
    var gameTypes = await _context.LotteryGameCompatibilities
        .Where(lgc => lgc.LotteryId == id && lgc.IsActive)
        .Include(lgc => lgc.GameType)
        .Select(lgc => lgc.GameType.GameTypeCode)
        .ToListAsync();

    // 2. Mapear game_types → bet_types
    var betTypes = await _context.BetTypes
        .Where(bt => gameTypes.Contains(bt.BetTypeCode))
        .Include(bt => bt.PrizeFields.Where(pf => pf.IsActive))
        .OrderBy(bt => bt.BetTypeId)
        .ToListAsync();

    // 3. Retornar con prize_fields
    return Ok(MapToBetTypeWithFieldsDto(betTypes));
}
```

**Ventajas**:
- ✅ Solución en el backend (lugar correcto)
- ✅ No requiere tabla nueva
- ✅ Usa relación existente

**Desventajas**:
- ❌ Asume que game_types y bet_types tienen mismos códigos
- ❌ No funciona si hay diferencias en los códigos

---

## 🎯 Recomendación

**Usar Opción 1 + Opción 3 combinadas:**

1. **Corto plazo** (AHORA):
   - Implementar **Opción 3** (endpoint nuevo)
   - Mapear `game_types` → `bet_types` por código
   - Actualizar frontend para usar `/api/lotteries/{id}/bet-types`

2. **Mediano plazo** (próxima sprint):
   - Crear tabla `lottery_bet_type_compatibility` (**Opción 1**)
   - Migrar datos desde `lottery_game_compatibility`
   - Actualizar endpoint para usar nueva tabla
   - Deprecar `game_types` (unificar todo en `bet_types`)

---

## 🔧 Cambios Requeridos en el Frontend

### En `PrizesTab.jsx`:

```javascript
// ANTES (carga todos los bet_types)
const loadInitialData = async () => {
  const betTypesData = await getAllBetTypesWithFields();
  setBetTypes(betTypesData);
};

// DESPUÉS (carga bet_types filtrados por lotería)
const loadBetTypesForLottery = async (lotteryId) => {
  if (lotteryId === 'general') {
    // Para "General" carga todos
    const betTypesData = await getAllBetTypesWithFields();
    setBetTypes(betTypesData);
  } else {
    // Para lotería específica, filtra por lotería
    const actualLotteryId = lotteryId.replace('lottery_', '');
    const response = await fetch(`/api/lotteries/${actualLotteryId}/bet-types`);
    const betTypesData = await response.json();
    setBetTypes(betTypesData);
  }
};

// Recargar bet_types cuando cambia la lotería activa
useEffect(() => {
  if (activeLottery) {
    loadBetTypesForLottery(activeLottery);
  }
}, [activeLottery]);
```

---

## 📝 Notas Adicionales

1. **LA PRIMERA (lotería dominicana)** solo tiene:
   - Directo (4 prize_fields)
   - Palé (4 prize_fields)
   - Tripleta (2 prize_fields)
   - **Total: 10 prize_fields**

2. **Frontend actual** muestra:
   - 23 bet_types para todas las loterías
   - **Total: 60+ prize_fields** (innecesarios)

3. **Impacto en UX**:
   - Usuario ve tipos de apuestas que no puede usar
   - Confusión al configurar premios
   - Formulario innecesariamente largo

---

## ✅ Conclusión

Para resolver el problema de "LA PRIMERA solo tiene 3 tipos de apuestas":

1. **Backend**: Crear endpoint `GET /api/lotteries/{id}/bet-types`
2. **Frontend**: Modificar `PrizesTab.jsx` para cargar bet_types dinámicamente por lotería
3. **Futuro**: Crear tabla `lottery_bet_type_compatibility` para arquitectura limpia

**Tiempo estimado**:
- Backend: 2-3 horas
- Frontend: 1-2 horas
- Testing: 1 hora
- **Total: 4-6 horas**
