# API de Creación de Tickets - Documentación Técnica

**Versión del API:** 1.0
**Endpoint Base:** `http://localhost:5020/api`
**Fecha de actualización:** Noviembre 2025
**Autor:** Equipo de Desarrollo Lottery API

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Endpoint de Creación](#endpoint-de-creación)
3. [Estructura de la Petición](#estructura-de-la-petición)
4. [Campos del Ticket](#campos-del-ticket)
5. [Campos de Línea de Apuesta](#campos-de-línea-de-apuesta)
6. [Validaciones](#validaciones)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Respuestas del Servidor](#respuestas-del-servidor)
9. [Códigos de Error](#códigos-de-error)
10. [Consideraciones Importantes](#consideraciones-importantes)

---

## Introducción

Este documento describe el proceso de creación de tickets de lotería a través del API REST. Un ticket representa una o más apuestas (líneas) realizadas por un cliente en uno o más sorteos.

El sistema soporta múltiples tipos de apuestas (Quiniela, Pale, Tripleta, etc.) y permite configurar parámetros como multiplicadores, descuentos y posiciones específicas.

---

## Endpoint de Creación

**Método HTTP:** `POST`
**Ruta:** `/api/tickets`
**Autenticación:** Requerida (Bearer Token)
**Content-Type:** `application/json`

### Encabezados Requeridos

```http
POST /api/tickets HTTP/1.1
Host: localhost:5020
Content-Type: application/json
Authorization: Bearer {token}
```

---

## Estructura de la Petición

El cuerpo de la petición debe contener un objeto JSON con la siguiente estructura:

```json
{
  "bettingPoolId": integer,
  "userId": integer,
  "lines": [
    {
      "drawId": integer,
      "betNumber": "string",
      "betTypeId": integer,
      "betAmount": decimal,
      "multiplier": decimal,
      "position": integer,
      "isLuckyPick": boolean,
      "notes": "string"
    }
  ],
  "globalMultiplier": decimal,
  "globalDiscount": decimal,
  "terminalId": "string",
  "ipAddress": "string",
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "customerIdNumber": "string",
  "notes": "string"
}
```

---

## Campos del Ticket

### Campos Obligatorios

#### bettingPoolId

- **Tipo:** Integer
- **Descripción:** Identificador único de la banca donde se genera el ticket
- **Ejemplo:** `9`
- **Validación:** Debe existir en el sistema y estar activa

#### userId

- **Tipo:** Integer
- **Descripción:** Identificador del usuario o vendedor que crea el ticket
- **Ejemplo:** `11`
- **Validación:** Debe existir en el sistema y tener permisos de venta

#### lines

- **Tipo:** Array de objetos
- **Descripción:** Lista de líneas de apuesta que componen el ticket
- **Longitud mínima:** 1
- **Longitud máxima:** Sin límite definido
- **Validación:** Debe contener al menos una línea válida

### Campos Opcionales

#### globalMultiplier

- **Tipo:** Decimal
- **Descripción:** Multiplicador que se aplica a todas las líneas del ticket
- **Valor por defecto:** `1.00`
- **Rango:** 0.01 - 999.99
- **Ejemplo:** `2.00` (todas las líneas valen el doble)

#### globalDiscount

- **Tipo:** Decimal
- **Descripción:** Descuento porcentual aplicado al total del ticket
- **Valor por defecto:** `0.00`
- **Rango:** 0.00 - 100.00
- **Ejemplo:** `5.00` (5% de descuento)

#### terminalId

- **Tipo:** String
- **Descripción:** Identificador del terminal o dispositivo donde se creó el ticket
- **Longitud máxima:** 50 caracteres
- **Ejemplo:** `"TERMINAL-001"`

#### ipAddress

- **Tipo:** String
- **Descripción:** Dirección IP desde donde se creó el ticket
- **Formato:** IPv4 o IPv6
- **Ejemplo:** `"192.168.1.100"`

#### customerName

- **Tipo:** String
- **Descripción:** Nombre completo del cliente que realiza la apuesta
- **Longitud máxima:** 200 caracteres
- **Ejemplo:** `"Juan Pérez García"`

#### customerPhone

- **Tipo:** String
- **Descripción:** Número de teléfono de contacto del cliente
- **Longitud máxima:** 20 caracteres
- **Ejemplo:** `"809-555-1234"`

#### customerEmail

- **Tipo:** String
- **Descripción:** Correo electrónico del cliente
- **Formato:** Email válido
- **Ejemplo:** `"juan.perez@example.com"`

#### customerIdNumber

- **Tipo:** String
- **Descripción:** Número de cédula o identificación del cliente
- **Longitud máxima:** 20 caracteres
- **Ejemplo:** `"001-1234567-8"`

#### notes

- **Tipo:** String
- **Descripción:** Notas o comentarios adicionales sobre el ticket
- **Longitud máxima:** 500 caracteres
- **Ejemplo:** `"Cliente frecuente, aplicar descuento especial"`

---

## Campos de Línea de Apuesta

Cada objeto en el array `lines` debe contener los siguientes campos:

### Campos Obligatorios de Línea

#### drawId

- **Tipo:** Integer
- **Descripción:** Identificador del sorteo al que se apuesta
- **Ejemplo:** `119`
- **Validación:** El sorteo debe existir y estar abierto para apuestas
- **Nota:** Puedes obtener los sorteos disponibles desde `/api/draws`

#### betNumber

- **Tipo:** String
- **Descripción:** Número o combinación apostada
- **Longitud máxima:** 20 caracteres
- **Formato:** Depende del tipo de apuesta
- **Ejemplos:**
  - Quiniela: `"25"`
  - Pale: `"25-37"`
  - Tripleta: `"25-37-48"`

#### betTypeId

- **Tipo:** Integer
- **Descripción:** Identificador del tipo de apuesta
- **Ejemplo:** `1` (Quiniela), `2` (Pale), `3` (Tripleta)
- **Validación:** Debe existir en el sistema
- **Nota:** Puedes obtener los tipos disponibles desde `/api/bet-types`

#### betAmount

- **Tipo:** Decimal
- **Descripción:** Monto apostado en esta línea
- **Rango:** 0.01 - 999,999.99
- **Formato:** Dos decimales
- **Ejemplo:** `100.00`
- **Validación:** No puede exceder los límites configurados para el número

### Campos Opcionales de Línea

#### multiplier

- **Tipo:** Decimal
- **Descripción:** Multiplicador específico para esta línea
- **Valor por defecto:** `1.00`
- **Rango:** 0.01 - 999.99
- **Uso:** Permite apostar el mismo número múltiples veces
- **Ejemplo:** `5.00` significa que el número se juega 5 veces
- **Cálculo:** Costo real = betAmount × multiplier

#### position

- **Tipo:** Integer (nullable)
- **Descripción:** Posición específica para la apuesta
- **Rango:** Depende del tipo de apuesta
- **Ejemplo:** `1` (primera posición), `2` (segunda posición)
- **Uso:** En apuestas posicionales donde importa el orden

#### isLuckyPick

- **Tipo:** Boolean
- **Descripción:** Indica si el número fue seleccionado aleatoriamente por el sistema
- **Valor por defecto:** `false`
- **Valores:**
  - `true`: Número generado automáticamente (Quick Pick)
  - `false`: Número elegido manualmente por el cliente
- **Uso:** Para estadísticas y análisis de preferencias de jugadores

#### notes

- **Tipo:** String (nullable)
- **Descripción:** Notas específicas sobre esta línea de apuesta
- **Longitud máxima:** 500 caracteres
- **Ejemplo:** `"Número de la suerte del cliente"`

---

## Validaciones

El sistema aplica las siguientes validaciones al crear un ticket:

### Validaciones de Ticket

1. **Banca activa:** La banca especificada debe existir y estar activa
2. **Usuario válido:** El usuario debe existir y tener permisos de venta
3. **Mínimo una línea:** El ticket debe contener al menos una línea de apuesta
4. **Multiplicador global:** Debe estar entre 0.01 y 999.99
5. **Descuento global:** Debe estar entre 0.00 y 100.00

### Validaciones de Línea

1. **Sorteo abierto:** El sorteo debe existir y estar abierto para apuestas
2. **Hora de cierre:** La apuesta debe realizarse antes de la hora de cierre del sorteo
3. **Formato de número:** El número debe cumplir con el formato del tipo de apuesta
4. **Longitud de dígitos:** El número debe tener la cantidad correcta de dígitos
5. **Rango de monto:** El monto debe estar entre 0.01 y 999,999.99
6. **Límites de apuesta:** El número no debe exceder los límites configurados
7. **Multiplicador:** Debe estar entre 0.01 y 999.99 si se especifica

### Validación de Límites

El sistema verifica automáticamente si el número apostado excede los límites configurados:

- **Límites globales:** Por tipo de apuesta y sorteo
- **Límites específicos:** Por número particular
- **Límites de banca:** Máximo permitido por la banca

Si se excede un límite, la línea se marca con `exceedsLimit: true` pero no se rechaza automáticamente. Un supervisor puede aprobar la apuesta mediante `limitOverride`.

---

## Ejemplos de Uso

### Ejemplo 1: Ticket Simple con Una Línea

Apuesta básica de $100 al número 25 en Quiniela:

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 100.00
    }
  ]
}
```

**Resultado:**
- 1 línea de apuesta
- Costo total: $100.00
- Sin multiplicador ni descuentos

### Ejemplo 2: Ticket con Múltiples Líneas

Cliente apuesta a tres números diferentes en el mismo sorteo:

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 50.00
    },
    {
      "drawId": 119,
      "betNumber": "37",
      "betTypeId": 1,
      "betAmount": 75.00
    },
    {
      "drawId": 119,
      "betNumber": "48",
      "betTypeId": 1,
      "betAmount": 100.00
    }
  ]
}
```

**Resultado:**
- 3 líneas de apuesta
- Costo total: $225.00

### Ejemplo 3: Ticket con Multiplicador

Cliente quiere jugar el número 25 cinco veces:

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 100.00,
      "multiplier": 5.00
    }
  ]
}
```

**Resultado:**
- 1 línea de apuesta (con multiplicador x5)
- Costo total: $500.00 (100 × 5)
- Si gana: Premio × 5

### Ejemplo 4: Ticket con Descuento Global

Aplicar 10% de descuento a todo el ticket:

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "globalDiscount": 10.00,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 100.00
    },
    {
      "drawId": 119,
      "betNumber": "37",
      "betTypeId": 1,
      "betAmount": 100.00
    }
  ]
}
```

**Resultado:**
- 2 líneas de apuesta
- Subtotal: $200.00
- Descuento (10%): -$20.00
- Total a pagar: $180.00

### Ejemplo 5: Ticket con Número Aleatorio (Lucky Pick)

Cliente pide un número de la suerte:

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "73",
      "betTypeId": 1,
      "betAmount": 100.00,
      "isLuckyPick": true,
      "notes": "Número generado automáticamente"
    }
  ]
}
```

**Resultado:**
- 1 línea marcada como selección aleatoria
- El frontend debe generar el número aleatorio antes de enviarlo

### Ejemplo 6: Ticket con Información de Cliente

Ticket con datos completos del cliente:

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "customerName": "María González Rodríguez",
  "customerPhone": "809-555-9876",
  "customerEmail": "maria.gonzalez@example.com",
  "customerIdNumber": "001-9876543-2",
  "terminalId": "TERMINAL-005",
  "ipAddress": "192.168.1.150",
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 1,
      "betAmount": 500.00,
      "multiplier": 2.00
    }
  ],
  "notes": "Cliente VIP - Aplicar atención preferencial"
}
```

**Resultado:**
- Ticket con información completa del cliente
- Útil para seguimiento y atención al cliente
- Total: $1,000.00 (500 × 2)

### Ejemplo 7: Apuesta a Pale (Dos Números)

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25-37",
      "betTypeId": 2,
      "betAmount": 200.00
    }
  ]
}
```

**Nota:** El formato del número depende del tipo de apuesta configurado en el sistema.

### Ejemplo 8: Apuesta Posicional

Apuesta en primera posición:

```json
{
  "bettingPoolId": 9,
  "userId": 11,
  "lines": [
    {
      "drawId": 119,
      "betNumber": "25",
      "betTypeId": 4,
      "betAmount": 150.00,
      "position": 1,
      "notes": "Apuesta en primera posición"
    }
  ]
}
```

---

## Respuestas del Servidor

### Respuesta Exitosa (201 Created)

Cuando el ticket se crea correctamente, el servidor responde con código 201 y el ticket completo:

```json
{
  "ticketId": 12345,
  "ticketCode": "TK-20251125-12345",
  "barcode": "7891234567890",
  "bettingPoolId": 9,
  "bettingPoolName": "Banca Central",
  "bettingPoolCode": "RB003333",
  "userId": 11,
  "userName": "Juan Vendedor",
  "createdAt": "2025-11-25T14:30:00Z",
  "totalLines": 1,
  "totalBetAmount": 100.00,
  "totalDiscount": 0.00,
  "totalSubtotal": 100.00,
  "totalWithMultiplier": 100.00,
  "totalCommission": 10.00,
  "totalNet": 90.00,
  "grandTotal": 100.00,
  "status": "active",
  "isCancelled": false,
  "isPaid": false,
  "lines": [
    {
      "lineId": 67890,
      "lineNumber": 1,
      "drawId": 119,
      "drawName": "DIARIA 11AM",
      "drawDate": "2025-11-25",
      "drawTime": "11:00:00",
      "betNumber": "25",
      "betTypeId": 1,
      "betTypeName": "Quiniela",
      "betAmount": 100.00,
      "multiplier": 1.00,
      "subtotal": 100.00,
      "totalWithMultiplier": 100.00,
      "lineStatus": "pending",
      "isWinner": false,
      "isLuckyPick": false
    }
  ]
}
```

### Campos Importantes de la Respuesta

- **ticketId:** Identificador único del ticket generado
- **ticketCode:** Código legible del ticket (para búsquedas)
- **barcode:** Código de barras para escaneo
- **grandTotal:** Monto total a pagar
- **lines:** Array con todas las líneas creadas y sus IDs

---

## Códigos de Error

### 400 Bad Request

Error de validación en los datos enviados.

**Ejemplo de respuesta:**

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "BettingPoolId": [
      "El ID de banca es requerido"
    ],
    "Lines": [
      "Debe incluir al menos una línea de apuesta"
    ],
    "Lines[0].BetAmount": [
      "El monto debe estar entre 0.01 y 999,999.99"
    ]
  }
}
```

**Causas comunes:**
- Campos requeridos faltantes
- Valores fuera de rango
- Formato incorrecto de datos

### 401 Unauthorized

Token de autenticación inválido o expirado.

```json
{
  "message": "Token inválido o expirado"
}
```

**Solución:** Renovar el token mediante `/api/auth/login`

### 403 Forbidden

Usuario sin permisos suficientes para crear tickets.

```json
{
  "message": "No tiene permisos para crear tickets"
}
```

### 404 Not Found

Recurso referenciado no existe.

```json
{
  "message": "Sorteo con ID 999 no encontrado"
}
```

**Causas comunes:**
- DrawId inválido
- BettingPoolId inexistente
- BetTypeId no encontrado

### 409 Conflict

Conflicto de negocio (sorteo cerrado, límite excedido, etc.)

```json
{
  "message": "El sorteo ha cerrado. No se aceptan más apuestas.",
  "details": {
    "drawId": 119,
    "cutoffTime": "2025-11-25T10:45:00Z",
    "currentTime": "2025-11-25T11:00:00Z"
  }
}
```

**Causas comunes:**
- Sorteo ya cerrado
- Hora de corte pasada
- Límite de apuesta excedido sin aprobación

### 500 Internal Server Error

Error interno del servidor.

```json
{
  "message": "Error interno del servidor. Contacte al administrador."
}
```

---

## Consideraciones Importantes

### Zona Horaria

Todos los timestamps se devuelven en formato UTC (ISO 8601). El cliente debe convertir a la zona horaria local según sea necesario.

### Transacciones

La creación de un ticket es una operación transaccional. Si alguna línea falla la validación, todo el ticket se rechaza. No se crean tickets parciales.

### Límites de Apuesta

El sistema verifica automáticamente los límites configurados. Las apuestas que excedan límites requieren aprobación de un supervisor mediante el campo `limitOverride`.

### Comisiones

Las comisiones se calculan automáticamente según la configuración de la banca. No es necesario especificarlas en la petición.

### Números Bloqueados

Si un número está bloqueado temporalmente, la apuesta se rechazará con código 409. Consultar `/api/blocks` para verificar bloqueos activos.

### Generación de Códigos

El sistema genera automáticamente:
- Código de ticket único
- Código de barras para impresión
- Números de línea secuenciales

### Impresión de Tickets

Después de crear el ticket, usar el endpoint `/api/tickets/{ticketId}/print` para registrar impresiones y obtener formato de impresión.

### Cancelaciones

Los tickets solo pueden cancelarse antes del sorteo. Usar `/api/tickets/{ticketId}/cancel` con la razón de cancelación.

### Pagos de Premios

Los tickets ganadores deben pagarse mediante `/api/tickets/{ticketId}/pay` con los datos del cajero que realiza el pago.

---

## Soporte Técnico

Para consultas técnicas o reportar problemas:

**Email:** soporte@lotteryapi.com
**Teléfono:** +1 (809) 555-0100
**Horario:** Lunes a Viernes, 8:00 AM - 6:00 PM (AST)

---

**Fin del documento**
