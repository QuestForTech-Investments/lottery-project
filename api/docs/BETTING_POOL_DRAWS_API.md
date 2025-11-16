# API de Sorteos por Banca (Betting Pool Draws)

Documentación completa de los endpoints para gestionar los sorteos configurados en cada banca.

---

## 📋 Tabla de Contenidos

- [Conceptos Importantes](#conceptos-importantes)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
  - [GET - Obtener todos los sorteos de una banca](#get---obtener-todos-los-sorteos-de-una-banca)
  - [GET - Obtener un sorteo específico](#get---obtener-un-sorteo-específico)
  - [POST - Agregar un sorteo a una banca](#post---agregar-un-sorteo-a-una-banca)
  - [PUT - Actualizar configuración de sorteo](#put---actualizar-configuración-de-sorteo)
  - [DELETE - Eliminar sorteo de una banca](#delete---eliminar-sorteo-de-una-banca)
- [Modelos de Datos](#modelos-de-datos)
- [Códigos de Error](#códigos-de-error)

---

## Conceptos Importantes

### Jerarquía de Datos

```
Country (País)
  └── Lottery (Lotería - organización)
       └── Draw (Sorteo - evento específico)
            └── Game Types (Tipos de juego disponibles)
```

**Ejemplo:**
- **Country**: Dominican Republic
- **Lottery**: Lotería Nacional Dominicana
- **Draw**: NACIONAL (sorteo que ocurre a las 12:00 PM)
- **Game Types**: Quiniela, Pale, Tripleta, etc.

### Relación con Bancas

Cada **banca** (betting pool) puede configurar:
- Qué **sorteos** (draws) acepta
- Qué **tipos de juego** (game types) habilita para cada sorteo
- Minutos de cierre anticipado por sorteo

---

## Autenticación

Todos los endpoints requieren un token JWT en el header:

```http
Authorization: Bearer {token}
```

---

## Endpoints

### GET - Obtener todos los sorteos de una banca

Retorna todos los sorteos configurados para una banca específica con información completa.

#### Endpoint
```
GET /api/betting-pools/{bettingPoolId}/draws
```

#### Parámetros de Ruta
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bettingPoolId` | integer | ID de la banca |

#### Response (200 OK)

```json
[
  {
    "bettingPoolDrawId": 1,
    "bettingPoolId": 9,
    "drawId": 165,
    "drawName": "NACIONAL",
    "drawTime": "12:00:00",
    "lotteryId": 1,
    "lotteryName": "Lotería Nacional Dominicana",
    "countryName": "Dominican Republic",
    "isActive": true,
    "anticipatedClosingMinutes": 10,
    "enabledGameTypes": [
      {
        "gameTypeId": 1,
        "gameTypeCode": "QUINIELA",
        "gameName": "Quiniela",
        "prizeMultiplier": 70.0,
        "numberLength": 2,
        "requiresAdditionalNumber": false,
        "displayOrder": 1
      },
      {
        "gameTypeId": 2,
        "gameTypeCode": "PALE",
        "gameName": "Pale",
        "prizeMultiplier": 17.0,
        "numberLength": 2,
        "requiresAdditionalNumber": false,
        "displayOrder": 2
      }
    ],
    "availableGameTypes": [
      {
        "gameTypeId": 1,
        "gameTypeCode": "QUINIELA",
        "gameName": "Quiniela",
        "prizeMultiplier": 70.0,
        "numberLength": 2,
        "requiresAdditionalNumber": false,
        "displayOrder": 1
      },
      {
        "gameTypeId": 2,
        "gameTypeCode": "PALE",
        "gameName": "Pale",
        "prizeMultiplier": 17.0,
        "numberLength": 2,
        "requiresAdditionalNumber": false,
        "displayOrder": 2
      },
      {
        "gameTypeId": 3,
        "gameTypeCode": "TRIPLETA",
        "gameName": "Tripleta",
        "prizeMultiplier": 500.0,
        "numberLength": 3,
        "requiresAdditionalNumber": false,
        "displayOrder": 3
      }
    ]
  }
]
```

#### Descripción de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `bettingPoolDrawId` | integer | ID único de la configuración |
| `bettingPoolId` | integer | ID de la banca |
| `drawId` | integer | ID del sorteo |
| `drawName` | string | Nombre del sorteo (ej: "NACIONAL") |
| `drawTime` | string | Hora del sorteo (formato: "HH:mm:ss") |
| `lotteryId` | integer | ID de la lotería |
| `lotteryName` | string | Nombre de la lotería |
| `countryName` | string | Nombre del país |
| `isActive` | boolean | Si el sorteo está activo en esta banca |
| `anticipatedClosingMinutes` | integer | Minutos antes de cerrar el sorteo (puede ser null) |
| `enabledGameTypes` | array | Tipos de juego habilitados para este sorteo en esta banca |
| `availableGameTypes` | array | Todos los tipos de juego disponibles para este sorteo |

#### Ejemplo de Uso

```javascript
// JavaScript/TypeScript
const response = await fetch(`/api/betting-pools/9/draws`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const draws = await response.json();
console.log(`Banca tiene ${draws.length} sorteos configurados`);
```

---

### GET - Obtener un sorteo específico

Obtiene los detalles de un sorteo específico configurado en una banca.

#### Endpoint
```
GET /api/betting-pools/{bettingPoolId}/draws/{bettingPoolDrawId}
```

#### Parámetros de Ruta
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bettingPoolId` | integer | ID de la banca |
| `bettingPoolDrawId` | integer | ID de la configuración del sorteo |

#### Response (200 OK)

Retorna un objeto `BettingPoolDrawDto` con la misma estructura que el GET de lista.

#### Ejemplo de Uso

```javascript
const response = await fetch(`/api/betting-pools/9/draws/1`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const draw = await response.json();
console.log(`Sorteo: ${draw.drawName} - ${draw.lotteryName}`);
```

---

### POST - Agregar un sorteo a una banca

Configura un nuevo sorteo para una banca.

#### Endpoint
```
POST /api/betting-pools/{bettingPoolId}/draws
```

#### Parámetros de Ruta
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bettingPoolId` | integer | ID de la banca |

#### Request Body

```json
{
  "drawId": 165,
  "isActive": true,
  "anticipatedClosingMinutes": 10,
  "enabledGameTypeIds": [1, 2, 3]
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `drawId` | integer | ✅ Sí | ID del sorteo a agregar |
| `isActive` | boolean | ❌ No | Si está activo (default: true) |
| `anticipatedClosingMinutes` | integer | ❌ No | Minutos de cierre anticipado |
| `enabledGameTypeIds` | array | ❌ No | IDs de game types a habilitar |

#### Response (201 Created)

```json
{
  "bettingPoolDrawId": 10,
  "bettingPoolId": 9,
  "drawId": 165,
  "drawName": "NACIONAL",
  "drawTime": "12:00:00",
  "lotteryId": 1,
  "lotteryName": "Lotería Nacional Dominicana",
  "countryName": "Dominican Republic",
  "isActive": true,
  "anticipatedClosingMinutes": 10,
  "enabledGameTypes": [...],
  "availableGameTypes": [...]
}
```

#### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `400` | Sorteo no encontrado o ya existe en la banca |
| `404` | Banca no encontrada |

#### Ejemplo de Uso

```javascript
const newDraw = {
  drawId: 165,
  isActive: true,
  anticipatedClosingMinutes: 10,
  enabledGameTypeIds: [1, 2, 3] // Quiniela, Pale, Tripleta
};

const response = await fetch(`/api/betting-pools/9/draws`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newDraw)
});

if (response.ok) {
  const created = await response.json();
  console.log(`Sorteo ${created.drawName} agregado exitosamente`);
}
```

---

### PUT - Actualizar configuración de sorteo

Actualiza la configuración de un sorteo existente en una banca.

#### Endpoint
```
PUT /api/betting-pools/{bettingPoolId}/draws/{bettingPoolDrawId}
```

#### Parámetros de Ruta
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bettingPoolId` | integer | ID de la banca |
| `bettingPoolDrawId` | integer | ID de la configuración del sorteo |

#### Request Body

```json
{
  "isActive": false,
  "anticipatedClosingMinutes": 15,
  "enabledGameTypeIds": [1, 2]
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `isActive` | boolean | ❌ No | Activar/desactivar sorteo |
| `anticipatedClosingMinutes` | integer | ❌ No | Actualizar minutos de cierre |
| `enabledGameTypeIds` | array | ❌ No | Actualizar game types habilitados |

**Importante:**
- Todos los campos son opcionales
- Solo se actualizan los campos enviados
- Si envías `enabledGameTypeIds`, **reemplaza completamente** la lista anterior

#### Response (200 OK)

Retorna el `BettingPoolDrawDto` actualizado con la misma estructura que GET.

#### Ejemplo de Uso

```javascript
// Desactivar un sorteo
const update = {
  isActive: false
};

const response = await fetch(`/api/betting-pools/9/draws/1`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(update)
});

// Actualizar game types habilitados
const updateGameTypes = {
  enabledGameTypeIds: [1, 2, 3, 4] // Agregar un nuevo game type
};

await fetch(`/api/betting-pools/9/draws/1`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateGameTypes)
});
```

---

### DELETE - Eliminar sorteo de una banca

Elimina la configuración de un sorteo de una banca.

#### Endpoint
```
DELETE /api/betting-pools/{bettingPoolId}/draws/{bettingPoolDrawId}
```

#### Parámetros de Ruta
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bettingPoolId` | integer | ID de la banca |
| `bettingPoolDrawId` | integer | ID de la configuración del sorteo |

#### Response (200 OK)

```json
{
  "message": "Sorteo eliminado exitosamente"
}
```

#### Ejemplo de Uso

```javascript
const response = await fetch(`/api/betting-pools/9/draws/1`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  console.log('Sorteo eliminado de la banca');
}
```

---

## Modelos de Datos

### BettingPoolDrawDto

```typescript
interface BettingPoolDrawDto {
  bettingPoolDrawId: number;
  bettingPoolId: number;
  drawId: number;
  drawName?: string;
  drawTime?: string;        // "HH:mm:ss"
  lotteryId?: number;
  lotteryName?: string;
  countryName?: string;
  isActive: boolean;
  anticipatedClosingMinutes?: number;
  enabledGameTypes: GameTypeDto[];
  availableGameTypes: GameTypeDto[];
}
```

### GameTypeDto

```typescript
interface GameTypeDto {
  gameTypeId: number;
  gameTypeCode: string;      // "QUINIELA", "PALE", etc.
  gameName: string;          // "Quiniela", "Pale", etc.
  prizeMultiplier: number;   // Multiplicador de premio
  numberLength: number;      // Longitud del número (2, 3, 4)
  requiresAdditionalNumber: boolean;
  displayOrder?: number;
}
```

### CreateBettingPoolDrawDto

```typescript
interface CreateBettingPoolDrawDto {
  drawId: number;
  isActive?: boolean;
  anticipatedClosingMinutes?: number;
  enabledGameTypeIds?: number[];
}
```

### UpdateBettingPoolDrawDto

```typescript
interface UpdateBettingPoolDrawDto {
  isActive?: boolean;
  anticipatedClosingMinutes?: number;
  enabledGameTypeIds?: number[];
}
```

---

## Códigos de Error

### Códigos HTTP

| Código | Descripción |
|--------|-------------|
| `200` | Operación exitosa |
| `201` | Recurso creado exitosamente |
| `400` | Request inválido (validación fallida) |
| `401` | No autenticado (token inválido o expirado) |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |

### Estructura de Error

```json
{
  "message": "Descripción del error"
}
```

---

## Endpoint Legacy (Deprecated)

### GET /api/betting-pools/{bettingPoolId}/sortitions

**⚠️ DEPRECATED** - Usar `/draws` en su lugar

Este endpoint mantiene compatibilidad hacia atrás pero retorna datos en formato legacy:

```json
{
  "sortitionId": 1,
  "lotteryId": 1,
  "lotteryName": "Lotería Nacional Dominicana",
  "sortitionType": "Lotería Nacional Dominicana",
  "isEnabled": true,
  "anticipatedClosing": 10,
  "enabledGameTypeIds": [1, 2, 3],  // ⚠️ Solo IDs, no objetos completos
  "availableGameTypes": [...],
  "specificConfig": null
}
```

**Diferencias con `/draws`:**
- No incluye `drawId`, `drawName`, `drawTime`
- No incluye `countryName`
- `enabledGameTypeIds` es array de IDs, no objetos completos
- Usa `isEnabled` en vez de `isActive`

**Recomendación:** Migrar a `/draws` para tener información completa del sorteo.

---

## Ejemplos de Uso Completo

### React/TypeScript Example

```typescript
import { useState, useEffect } from 'react';

interface BettingPoolDrawDto {
  bettingPoolDrawId: number;
  drawId: number;
  drawName: string;
  lotteryName: string;
  isActive: boolean;
  anticipatedClosingMinutes?: number;
  enabledGameTypes: GameTypeDto[];
  availableGameTypes: GameTypeDto[];
}

interface GameTypeDto {
  gameTypeId: number;
  gameName: string;
  prizeMultiplier: number;
}

function BettingPoolDraws({ bettingPoolId, token }: Props) {
  const [draws, setDraws] = useState<BettingPoolDrawDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar sorteos
  useEffect(() => {
    fetchDraws();
  }, [bettingPoolId]);

  const fetchDraws = async () => {
    try {
      const response = await fetch(
        `/api/betting-pools/${bettingPoolId}/draws`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Error al cargar sorteos');

      const data = await response.json();
      setDraws(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar nuevo sorteo
  const addDraw = async (drawId: number) => {
    try {
      const response = await fetch(
        `/api/betting-pools/${bettingPoolId}/draws`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            drawId,
            isActive: true,
            anticipatedClosingMinutes: 10,
            enabledGameTypeIds: [1, 2] // Quiniela y Pale por defecto
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      await fetchDraws(); // Recargar lista
    } catch (error) {
      console.error('Error al agregar sorteo:', error);
    }
  };

  // Actualizar sorteo
  const updateDraw = async (
    bettingPoolDrawId: number,
    updates: Partial<UpdateBettingPoolDrawDto>
  ) => {
    try {
      const response = await fetch(
        `/api/betting-pools/${bettingPoolId}/draws/${bettingPoolDrawId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        }
      );

      if (!response.ok) throw new Error('Error al actualizar');

      await fetchDraws(); // Recargar lista
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Activar/Desactivar sorteo
  const toggleDraw = async (draw: BettingPoolDrawDto) => {
    await updateDraw(draw.bettingPoolDrawId, {
      isActive: !draw.isActive
    });
  };

  // Eliminar sorteo
  const deleteDraw = async (bettingPoolDrawId: number) => {
    if (!confirm('¿Eliminar este sorteo de la banca?')) return;

    try {
      const response = await fetch(
        `/api/betting-pools/${bettingPoolId}/draws/${bettingPoolDrawId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error al eliminar');

      await fetchDraws(); // Recargar lista
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Sorteos Configurados</h2>
      {draws.map(draw => (
        <div key={draw.bettingPoolDrawId}>
          <h3>{draw.drawName} - {draw.lotteryName}</h3>
          <p>Estado: {draw.isActive ? 'Activo' : 'Inactivo'}</p>
          <p>Cierre anticipado: {draw.anticipatedClosingMinutes || 'No configurado'} min</p>

          <h4>Game Types Habilitados:</h4>
          <ul>
            {draw.enabledGameTypes.map(gt => (
              <li key={gt.gameTypeId}>
                {gt.gameName} (x{gt.prizeMultiplier})
              </li>
            ))}
          </ul>

          <button onClick={() => toggleDraw(draw)}>
            {draw.isActive ? 'Desactivar' : 'Activar'}
          </button>
          <button onClick={() => deleteDraw(draw.bettingPoolDrawId)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Notas Importantes

1. **Arquitectura Draw-Centric**: El sistema usa `draw_id` como referencia principal, no `lottery_id`. Los draws son eventos específicos dentro de una lotería.

2. **Game Types**: Cada draw tiene:
   - `availableGameTypes`: Todos los game types que el sorteo soporta
   - `enabledGameTypes`: Los que la banca ha habilitado para ese sorteo

3. **Cierre Anticipado**: El campo `anticipatedClosingMinutes` permite que cada banca cierre las apuestas X minutos antes de la hora oficial del sorteo.

4. **Actualización de Game Types**: Al actualizar `enabledGameTypeIds`, se **reemplaza completamente** la lista anterior. Si quieres agregar un game type, debes incluir los IDs existentes + el nuevo.

---

**Última actualización:** 2025-11-14
