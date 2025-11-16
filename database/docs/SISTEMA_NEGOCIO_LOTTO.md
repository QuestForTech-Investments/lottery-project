# 🎲 SISTEMA DE NEGOCIO - APLICACIÓN LOTTO
## Análisis Completo del Modelo de Negocio para Generación de Tickets

---

## 📋 RESUMEN EJECUTIVO

**Tipo de Negocio:** Sistema de Lotería Multi-Sorteo tipo "Bancas" (República Dominicana)  
**Modelo:** B2B2C - Casa matriz → Bancas → Clientes finales  
**Operación:** 70+ sorteos diarios, 21 tipos de jugadas, red distribuida de puntos de venta

---

## 🏢 ESTRUCTURA ORGANIZACIONAL

### Jerarquía del Sistema

```
CASA MATRIZ (Sistema Central)
    │
    ├── ZONAS (Agrupaciones Geográficas)
    │   └── Ejemplo: "GRUPO GILBERTO TL"
    │
    ├── BANCAS (Puntos de Venta)
    │   ├── Código: 010
    │   ├── Nombre: "LA CENTRAL 10"
    │   ├── Propietario: GILBERTO TL
    │   ├── Balance: $2,989.50
    │   └── USUARIOS (Vendedores/Cajeros)
    │       └── Roles: Vendedor, Supervisor, Admin
    │
    ├── COBRADORES (Gestores de Zona)
    │   └── Responsables de cobros y liquidaciones
    │
    └── AGENTES EXTERNOS (Subcontratados)
        └── Comisiones diferenciadas
```

### Entidades Clave

| Entidad | Descripción | Cantidad Típica |
|---------|-------------|-----------------|
| **Casa Matriz** | Sistema central operador | 1 |
| **Zonas** | Agrupaciones geográficas | 5-20 |
| **Bancas** | Puntos de venta autorizados | 50-500+ |
| **Usuarios** | Vendedores por banca | 1-5 por banca |
| **Cobradores** | Gestores de zona | 1 por zona |
| **Agentes Externos** | Red complementaria | Variable |

---

## 🎯 MODELO DE NEGOCIO DETALLADO

### 1. OPERACIÓN DE SORTEOS

#### 70+ Sorteos Diarios
El sistema maneja múltiples loterías simultáneas:

**Tipos de Sorteo:**
- **Tradicionales Dominicanas:** REAL, NACIONAL, LEIDSA, LOTEKA, PRIMERA, ANGUILLA, etc.
- **Internacionales:** NY, FL (Florida), KING LOTTERY
- **Modernos:** Cash3, Play4, Pick5, Quiniela, Pale, Tripleta

**Características:**
- Cada sorteo tiene horario específico (apertura/cierre/resultado)
- Algunos sorteos ocurren 2-3 veces al día
- Control por zona horaria (IANA timezone)
- Bloqueo automático al alcanzar hora de cierre

#### Ejemplo de Calendario Diario:
```
10:00 AM - REAL Primera (cierre)
12:00 PM - NACIONAL Mediodía
02:00 PM - LEIDSA Tarde
05:00 PM - REAL Segunda
07:00 PM - LOTEKA Noche
09:00 PM - REAL Nocturna
```

### 2. TIPOS DE JUGADAS (21 modalidades)

#### Categorías Principales:

**A. Jugadas Tradicionales (00-99)**
1. **Directo/Quiniela** - Acierta número exacto
   - Ejemplo: Apuestas "23" → Sale "23" = Gana
   - Premio típico: 60x-80x lo apostado

2. **Pale/Palé** - Acierta en cualquier posición
   - Ejemplo: Apuestas "23" → Sale "32" o "23" = Gana
   - Premio típico: 30x-40x lo apostado

3. **Tripleta** - Tres números en cualquier orden
   - Ejemplo: Apuestas "123" → Sale "321" = Gana
   - Premio típico: 500x-700x lo apostado

**B. Jugadas Modernas**
4. **Cash3** - 3 dígitos (000-999)
5. **Play4** - 4 dígitos (0000-9999)
6. **Pick5** - 5 números de un pool mayor
7. **Super Pale** - Variante mejorada de Pale
8. **Tripleta Pale** - Combinación Tripleta + Pale

**C. Jugadas Combinadas**
9-21. Variantes y combinaciones especiales por sorteo

#### Formato de Entrada de Jugadas:
```
LOT|NUM|$MONTO
Ejemplo: REAL|23|100
         ↓    ↓   ↓
      Sorteo Número Monto
```

### 3. PROCESO DE CREACIÓN DE TICKETS

#### Flujo Completo (Paso a Paso):

```
┌─────────────────────────────────────────────────────────────┐
│  PASO 1: INICIO DE SESIÓN                                   │
│  - Usuario se autentica en la banca                         │
│  - Sistema valida credenciales (JWT)                        │
│  - Carga configuración de la banca                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: SELECCIÓN DE BANCA Y SORTEOS                       │
│  - Usuario selecciona banca activa (si tiene múltiples)     │
│  - Selecciona uno o más sorteos (70+ disponibles)           │
│  - Sistema muestra horarios y estados de cada sorteo        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: CONFIGURACIÓN DE OPCIONES                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Toggle "Mult." - Multiplicador (ej: x2, x5, x10)   │   │
│  │ Toggle "Desc." - Descuento (ej: 5%, 10%, 15%)      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 4: INGRESO DE JUGADAS                                 │
│  - Formato: LOT|NUM|$MONTO                                  │
│  - Ejemplos:                                                │
│    REAL|23|100        → Directo al 23, $100                 │
│    REAL|23P|50        → Pale al 23, $50                     │
│    NACIONAL|456T|25   → Tripleta 456, $25                   │
│    LEIDSA|*|20        → Lucky Pick, $20                     │
│                                                              │
│  - Entrada rápida: múltiples líneas simultáneas             │
│  - Auto-completado de sorteos                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 5: VALIDACIÓN EN TIEMPO REAL                          │
│  API: POST /limits/validate                                 │
│                                                              │
│  Validaciones Ejecutadas:                                   │
│  ✓ Número no está bloqueado                                 │
│  ✓ No excede límite individual (ej: max $500 por número)    │
│  ✓ No excede límite global del sorteo                       │
│  ✓ Banca tiene balance suficiente                           │
│  ✓ Sorteo aún está abierto (no cerró)                       │
│  ✓ Monto mínimo/máximo por jugada                           │
│                                                              │
│  Si FALLA → Mensaje de error + No permite confirmar         │
│  Si OK → Continúa al siguiente paso                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 6: CÁLCULOS AUTOMÁTICOS                               │
│                                                              │
│  Para cada línea del ticket:                                │
│  1. Total Base = Σ(montos)                                  │
│  2. Descuento = Total * %desc (si aplica)                   │
│  3. Subtotal = Total - Descuento                            │
│  4. Multiplicador = Subtotal * multiplicador (si aplica)    │
│  5. Comisión Banca = Subtotal * %comisión_banca             │
│  6. Total Final = Multiplicador - Comisión                  │
│                                                              │
│  Ejemplo Real:                                              │
│  - Jugada: REAL|23|100                                      │
│  - Descuento 10%: -$10                                      │
│  - Subtotal: $90                                            │
│  - Multiplicador x2: $180                                   │
│  - Comisión 8%: -$14.40                                     │
│  - Total: $165.60                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 7: VISTA PREVIA (OPCIONAL)                            │
│  Botón: VISTA PREVIA                                        │
│  API: GET /tickets/{temp_id}/preview                        │
│                                                              │
│  Muestra:                                                   │
│  - Formato exacto del ticket impreso                        │
│  - Código de barras                                         │
│  - Desglose de montos                                       │
│  - Pie de página personalizado de la banca                  │
│  - Términos y condiciones                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 8: CONFIRMACIÓN Y CREACIÓN                            │
│  Botón: CONFIRMAR                                           │
│  API: POST /tickets                                         │
│                                                              │
│  Proceso Backend:                                           │
│  1. Generación de código único: LAN-20251007-0001           │
│  2. Creación de registro en tabla `ticket`                  │
│  3. Creación de líneas en tabla `ticket_line`               │
│  4. Actualización de acumulados de límites                  │
│  5. Registro en logs de auditoría                           │
│  6. Cálculo de premios potenciales                          │
│  7. Actualización de números calientes                      │
│  8. Trigger de alertas (si hay riesgo alto)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 9: IMPRESIÓN AUTOMÁTICA                               │
│                                                              │
│  Ticket Impreso Contiene:                                   │
│  ┌─────────────────────────────────────────┐               │
│  │  LA CENTRAL 10                          │               │
│  │  GILBERTO TL                            │               │
│  │  ────────────────────────────────       │               │
│  │  Ticket: LAN-20251007-0001             │               │
│  │  Fecha: 07/10/2025 10:30 AM            │               │
│  │  Vendedor: JUAN001                      │               │
│  │  ────────────────────────────────       │               │
│  │  REAL    23    $100.00                  │               │
│  │  REAL    23P   $50.00                   │               │
│  │  NACIONAL 456T  $25.00                  │               │
│  │  ────────────────────────────────       │               │
│  │  Subtotal:      $175.00                 │               │
│  │  Descuento 10%: -$17.50                 │               │
│  │  TOTAL:         $157.50                 │               │
│  │  ────────────────────────────────       │               │
│  │  [CÓDIGO DE BARRAS]                     │               │
│  │  ────────────────────────────────       │               │
│  │  Válido hasta: 07/10/2025 5:00 PM      │               │
│  │  ¡SUERTE!                               │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 10: ACTUALIZACIÓN DE BALANCES                         │
│                                                              │
│  Movimientos Financieros:                                   │
│  - Balance Banca: -$157.50 (venta registrada)              │
│  - Exposición: +$157.50 (riesgo acumulado)                 │
│  - Límite número "23": +$100 (consumo del límite)          │
│  - Comisión pendiente: +$12.60 (8% de $157.50)             │
│                                                              │
│  Todas las transacciones son ATÓMICAS                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PASO 11: MONITOREO POST-CREACIÓN                           │
│                                                              │
│  Sistema activa:                                            │
│  - Dashboard actualiza contadores en tiempo real            │
│  - Pizarra muestra estado del número "23"                   │
│  - Alertas si número llega a límite                         │
│  - Notificaciones a supervisores                            │
│  - Registro en ElasticSearch para analytics                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 MODELO FINANCIERO

### Flujo de Dinero

```
CLIENTE FINAL
    ↓ (paga $100)
BANCA (Punto de Venta)
    ↓ (retiene comisión: $8 = 8%)
    ↓ (remite: $92)
CASA MATRIZ
    ↓ (paga premio si gana: $6000 = 60x)
    ↓ (o retiene si pierde: $92)
RESULTADO NETO
```

### Ejemplo Financiero Real:

**Escenario: Apuesta Directa $100 al número "23"**

| Concepto | Cliente | Banca | Casa Matriz |
|----------|---------|-------|-------------|
| **Apuesta** | -$100 | +$100 | $0 |
| **Comisión Banca (8%)** | $0 | +$8 | -$8 |
| **Venta Neta** | $0 | -$92 | +$92 |
| **Si PIERDE** | -$100 | +$8 | +$92 |
| **Si GANA (60x)** | +$6000 | +$8 | -$6092 |

**Balance por Escenario:**

1. **Cliente Pierde (Probabilidad ~99%)**
   - Cliente: -$100
   - Banca: +$8 (ganancia)
   - Casa: +$92 (ganancia)

2. **Cliente Gana (Probabilidad ~1%)**
   - Cliente: +$5900 (neto: $6000 - $100)
   - Banca: +$8 (siempre gana comisión)
   - Casa: -$6000 (paga premio)

### Sistema de Comisiones

**Tabla Típica de Comisiones por Banca:**

| Tipo de Jugada | Comisión Banca | Comisión Casa | Total |
|----------------|----------------|---------------|-------|
| Directo | 8% | 92% | 100% |
| Pale | 10% | 90% | 100% |
| Tripleta | 12% | 88% | 100% |
| Cash3 | 7% | 93% | 100% |
| Play4 | 7% | 93% | 100% |

**Configuración Flexible:**
- Cada banca puede tener esquema diferente
- Se configura en tabla `commission_schema`
- Puede variar por sorteo, tipo de jugada y monto

---

## 🎯 SISTEMA DE LÍMITES Y CONTROL DE RIESGO

### ¿Por qué existen los límites?

**Problema a resolver:**  
Si 1000 personas apuestan al número "23" en REAL, la casa puede perder millones si sale ese número.

**Solución:**  
Sistema multinivel de límites que controla la exposición máxima.

### Jerarquía de Límites

```
1. LÍMITE GLOBAL DEL SISTEMA
   ↓ (ej: $1,000,000 por sorteo)
   
2. LÍMITE POR ZONA
   ↓ (ej: $100,000 para GRUPO GILBERTO TL)
   
3. LÍMITE POR BANCA
   ↓ (ej: $10,000 para LA CENTRAL 10)
   
4. LÍMITE POR NÚMERO
   ↓ (ej: $500 para el número "23")
   
5. LÍMITE POR TIPO DE JUGADA
   ↓ (ej: $200 Directo, $100 Pale)
```

### Tipos de Límites

#### 1. Límites Fijos
```json
{
  "lottery": "REAL",
  "number": "23",
  "playType": "Directo",
  "maxAmount": 500,
  "status": "active"
}
```

#### 2. Límites Automáticos
Sistema calcula límites dinámicamente:

```python
def calcular_limite_automatico(numero, sorteo):
    venta_total = obtener_venta_total(numero, sorteo)
    limite_base = 500
    
    if venta_total >= limite_base * 0.90:
        return BLOQUEADO  # Rojo
    elif venta_total >= limite_base * 0.70:
        return ADVERTENCIA  # Amarillo
    else:
        return NORMAL  # Verde
```

#### 3. Límites por Excedentes

**Concepto de "Excedente":**  
Permite ajustar límites para compensar ventas entre bancas.

**Ejemplo:**
```
Banca A vendió: $300 al número "23"
Banca B vendió: $200 al número "23"
Límite global: $500

Excedente Banca A: -$300 (reduce disponible)
Excedente Banca B: -$200 (reduce disponible)
Disponible para otras: $0 → BLOQUEADO
```

### Números Calientes (Hot Numbers)

**Definición:** Números que están cerca de alcanzar sus límites

**Visualización en Pizarra (00-99):**

```
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│ 00 │ 01 │ 02 │ 03 │ 04 │ 05 │ 06 │ 07 │ 08 │ 09 │
│ 🟢 │ 🟢 │ 🟡 │ 🟢 │ 🟢 │ 🟠 │ 🟢 │ 🔴 │ 🟢 │ 🟢 │
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │ 19 │
│ 🟢 │ 🟢 │ 🟢 │ 🟢 │ ⬛ │ 🟢 │ 🟡 │ 🟢 │ 🟢 │ 🟢 │
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘

Leyenda:
🟢 Verde: < 30% del límite (Normal)
🟡 Amarillo: 30-70% del límite (Precaución)
🟠 Naranja: 70-90% del límite (Advertencia)
🔴 Rojo: > 90% del límite (Crítico)
⬛ Negro: BLOQUEADO (No se acepta más)
```

---

## 🔄 CICLO DE VIDA DE UN TICKET

### Estados de Ticket

```
PENDIENTE → ACTIVO → [GANADOR | PERDEDOR] → PAGADO/CERRADO
```

**Diagrama de Flujo Completo:**

```
┌──────────────┐
│  CREADO      │  Estado inicial al confirmar
│  (Pendiente) │  code: LAN-20251007-0001
└──────┬───────┘
       │
       ↓ (sorteo aún abierto)
┌──────────────┐
│  ACTIVO      │  Ticket válido, esperando resultado
│              │  Puede cancelarse (con restricciones)
└──────┬───────┘
       │
       ↓ (se publican resultados)
       │
   ┌───┴────┐
   │        │
   ↓        ↓
┌──────┐ ┌──────────┐
│PERDEDOR│ │ GANADOR  │
│        │ │Premio: $X │
└───┬────┘ └────┬─────┘
    │           │
    ↓           ↓
┌────────┐  ┌──────────┐
│CERRADO │  │ PENDIENTE│
│Auto    │  │ DE PAGO  │
└────────┘  └────┬─────┘
                 │
                 ↓ (cliente cobra)
            ┌─────────┐
            │ PAGADO  │
            │Liquidado│
            └─────────┘
```

### Cancelación de Tickets

**Reglas de Cancelación:**

```
SI sorteo NO ha cerrado:
  ✓ Puede cancelarse libremente
  ✓ Se devuelve dinero al balance de la banca
  ✓ Se liberan límites consumidos
  
SI sorteo YA cerró:
  ✗ NO puede cancelarse (genera anomalía)
  ✓ Solo con permiso SUPERADMIN
  ✓ Requiere justificación
  ✓ Se audita en ticket_cancel_log
```

---

## 📊 PROCESAMIENTO DE RESULTADOS

### Publicación de Resultados

**Flujo:**

```
1. Sorteo Real ocurre (ej: 5:00 PM)
   ↓
2. Sistema recibe números ganadores
   API: POST /results
   {
     "lottery": "REAL",
     "draw_date": "2025-10-07",
     "draw_time": "17:00",
     "first": "23",
     "second": "45",
     "third": "67"
   }
   ↓
3. Sistema busca todos los tickets activos
   Query: SELECT * FROM ticket 
          WHERE lottery = 'REAL' 
          AND status = 'active'
   ↓
4. Para cada ticket, evalúa cada línea:
   - ¿Número coincide con first/second/third?
   - ¿Tipo de jugada aplica? (Directo, Pale, etc.)
   - Calcula premio según tabla
   ↓
5. Actualiza estado de tickets:
   - Ganadores → status='winner', prize_amount=X
   - Perdedores → status='loser', prize_amount=0
   ↓
6. Calcula balances por banca:
   Balance = Balance - Ventas + Premios
   ↓
7. Genera reportes automáticos
   ↓
8. Envía notificaciones:
   - Email a supervisores
   - Alertas en dashboard
   - SMS a ganadores grandes (opcional)
```

### Cálculo de Premios

**Tabla de Premios Típica:**

| Tipo Jugada | Acierto | Multiplicador | Ejemplo $100 |
|-------------|---------|---------------|--------------|
| **Directo** | Exacto en 1ra posición | 60x | $6,000 |
| **Directo** | Exacto en 2da posición | 40x | $4,000 |
| **Directo** | Exacto en 3ra posición | 20x | $2,000 |
| **Pale** | En cualquier posición | 30x | $3,000 |
| **Tripleta** | Tres números cualquier orden | 600x | $60,000 |
| **Cash3** | Tres dígitos exactos | 500x | $50,000 |
| **Play4** | Cuatro dígitos exactos | 5000x | $500,000 |

**Configuración por Banca:**
Cada banca puede tener tabla diferente de premios configurada en `commission_schema`.

---

## 🛡️ CONTROLES Y SEGURIDAD

### Auditoría Completa

**Eventos Auditados:**

1. **Creación de Tickets**
   - Usuario, IP, timestamp
   - Hash de las líneas del ticket
   - Balance antes/después

2. **Cancelaciones**
   - Motivo de cancelación
   - Usuario autorizador
   - Estado del sorteo al momento

3. **Publicación de Resultados**
   - Números publicados
   - Usuario que publicó
   - Cambios posteriores (si hay)

4. **Modificación de Límites**
   - Límite anterior/nuevo
   - Justificación
   - Usuario

5. **Transacciones Financieras**
   - Cobros, pagos, préstamos
   - Aprobadores
   - Montos

### Detección de Anomalías

**Sistema de Alertas Automáticas:**

```python
ANOMALÍAS DETECTABLES:

1. Cancelación Post-Sorteo
   IF ticket_cancel_time > draw_close_time:
      ALERT("Cancelación tardía", severity=HIGH)

2. Monto Atípico
   IF ticket_amount > average_ticket * 5:
      ALERT("Ticket sospechoso", severity=MEDIUM)

3. Duplicados
   IF hash(ticket_lines) == existing_ticket:
      ALERT("Posible duplicado", severity=LOW)

4. Cambios Sin Autorización
   IF result_modified AND user_role != 'SUPERADMIN':
      ALERT("Modificación no autorizada", severity=CRITICAL)

5. Exposición Alta
   IF total_exposure > limit * 1.5:
      ALERT("Exceso de exposición", severity=HIGH)
```

---

## 🔌 INTEGRACIONES EXTERNAS

### Bote Importado/Exportado

**Concepto:**  
Compartir riesgo con otros sistemas de lotería.

**Ejemplo de Exportación:**
```
Banca tiene mucha venta en "23" ($800)
Límite interno: $500
Excedente: $300

Sistema EXPORTA $300 a otro operador:
- Recibe comisión por export (ej: 2%)
- Transfiere riesgo
- Si "23" sale, el otro operador paga parte del premio
```

**Flujo Técnico:**

```
1. Sistema detecta exceso
   ↓
2. API: POST /pots/export
   {
     "lottery": "REAL",
     "number": "23",
     "amount": 300,
     "destination": "EXTERNAL_OPERATOR_X"
   }
   ↓
3. Sistema externo confirma recepción
   ↓
4. Se registra en tabla bote_export
   ↓
5. Si hay premio, se divide proporcionalmente
```

---

## 📱 INTERFACES DE USUARIO

### Dashboard Principal

**Información en Tiempo Real:**

```
┌─────────────────────────────────────────────────────────┐
│  DASHBOARD LOTTO - LA CENTRAL 10                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 MÉTRICAS DEL DÍA                                    │
│  ├─ Ventas: $15,450.00    ↑ 12% vs ayer               │
│  ├─ Tickets: 234          ↑ 8% vs ayer                 │
│  ├─ Premios: $2,340.00    ↓ 5% vs ayer                 │
│  └─ Balance: $2,989.50    🟢 Positivo                   │
│                                                          │
│  🎯 SORTEOS ACTIVOS (Próximos)                          │
│  ├─ REAL Segunda: Cierra en 1h 23m                      │
│  ├─ NACIONAL: Cierra en 2h 15m                          │
│  └─ LOTEKA: Cierra en 4h 45m                            │
│                                                          │
│  🔥 NÚMEROS CALIENTES                                    │
│  Top 10 más vendidos hoy:                               │
│  1. 23 🔴 (95% límite)                                   │
│  2. 07 🟠 (78% límite)                                   │
│  3. 45 🟡 (65% límite)                                   │
│  ...                                                     │
│                                                          │
│  ⚠️ ALERTAS                                              │
│  • Número 23 cerca del límite en REAL                   │
│  • Ticket grande: $500 (ID: LAN-001234)                 │
│                                                          │
│  ⚡ ACCIONES RÁPIDAS                                     │
│  [Crear Ticket] [Ver Ventas] [Bloquear Número]         │
└─────────────────────────────────────────────────────────┘
```

### Módulo de Creación de Tickets

**Pantalla Principal:**

```
┌─────────────────────────────────────────────────────────┐
│  CREAR TICKET                                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Banca: [LA CENTRAL 10 ▼]    Usuario: JUAN001          │
│                                                          │
│  Opciones: [✓] Mult. x2    [✗] Desc. 10%               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SORTEOS DISPONIBLES (70)                         │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ [REAL] [NACIONAL] [LEIDSA] [LOTEKA] [PRIMERA]   │  │
│  │ [NY] [FL] [ANGUILLA] [KING] [Cash3] [Play4]     │  │
│  │ ... (scroll para más)                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ JUGADAS (Formato: LOT|NUM|$MONTO)                │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 1. REAL|23|100                                   │  │
│  │ 2. REAL|23P|50                                   │  │
│  │ 3. NACIONAL|456T|25                              │  │
│  │ 4. _________________________________             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Subtotal: $175.00                                      │
│  Descuento: $0.00                                       │
│  Multiplicador: x1                                      │
│  ──────────────                                         │
│  TOTAL: $175.00                                         │
│                                                          │
│  [DUPLICAR] [LIMPIAR] [VISTA PREVIA] [CONFIRMAR]       │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 CASOS DE USO TÍPICOS

### Caso 1: Venta Normal

**Escenario:** Cliente quiere jugar al número "23" en REAL

```
1. Vendedor abre módulo "Crear Ticket"
2. Selecciona banca y sorteo REAL
3. Ingresa: REAL|23|100
4. Sistema valida:
   ✓ Sorteo abierto
   ✓ Número no bloqueado
   ✓ Límite no excedido ($400/$500)
5. Cliente paga $100
6. Vendedor confirma
7. Sistema imprime ticket: LAN-20251007-0001
8. Cliente recibe ticket físico
```

### Caso 2: Número en Límite

**Escenario:** Número "23" ya llegó al 95% del límite

```
1. Vendedor intenta ingresar: REAL|23|100
2. Sistema valida límites
3. API responde: {
     "status": "ERROR",
     "message": "Número 23 en límite crítico",
     "available": "$25",
     "limit": "$500",
     "sold": "$475"
   }
4. Sistema muestra error: "Solo puede apostar $25 más al 23"
5. Vendedor ofrece alternativas:
   - Jugar con monto menor ($25)
   - Jugar número diferente
   - Esperar próximo sorteo
```

### Caso 3: Ganador Grande

**Escenario:** Sale el número "23" en REAL, cliente apostó $100

```
1. Sorteo REAL cierra a las 5:00 PM
2. A las 5:05 PM se publican resultados: "23"
3. Sistema procesa automáticamente:
   - Busca todos los tickets con "23" en REAL
   - Encuentra ticket LAN-20251007-0001
   - Calcula premio: $100 x 60 = $6,000
   - Marca ticket como GANADOR
4. Cliente llega a la banca con ticket
5. Vendedor escanea código de barras
6. Sistema muestra:
   ✓ GANADOR
   Premio: $6,000.00
   Estado: PENDIENTE DE PAGO
7. Vendedor paga $6,000
8. Registra pago en sistema
9. Sistema actualiza:
   - Ticket → PAGADO
   - Balance banca: -$6,000
   - Se notifica a casa matriz
```

### Caso 4: Cancelación de Ticket

**Escenario:** Cliente se equivocó y quiere cancelar

```
CASO A: Sorteo AÚN ABIERTO
1. Vendedor busca ticket: LAN-20251007-0001
2. Presiona botón CANCELAR
3. Sistema verifica:
   ✓ Sorteo aún no cerró
   ✓ Usuario tiene permiso
4. Se devuelve dinero: $100
5. Balance banca: +$100
6. Límites se liberan
7. Estado ticket: CANCELADO

CASO B: Sorteo YA CERRÓ
1. Vendedor intenta cancelar
2. Sistema rechaza:
   ✗ "Sorteo cerrado, no se puede cancelar"
   ✗ "Solo SuperAdmin puede cancelar"
3. Se genera alerta de anomalía
4. Supervisor debe aprobar
```

---

## 📈 REPORTES Y ANÁLISIS

### Reportes Principales

**1. Venta del Día**
- Total vendido por banca
- Desglose por sorteo
- Comisiones generadas
- Balance neto

**2. Números Más Jugados**
- Top 100 números del día
- Exposición por número
- Tendencias históricas

**3. Balance de Bancas**
- Saldo actual de cada banca
- Ventas vs Premios
- Préstamos pendientes
- Caída acumulada

**4. Premios Pagados**
- Total de premios del día
- Desglose por tipo de jugada
- Ratio Premio/Venta
- Bancas con mayor pago

**5. Anomalías**
- Cancelaciones tardías
- Montos atípicos
- Cambios no autorizados

---

## 🎓 GLOSARIO DE TÉRMINOS

| Término | Definición |
|---------|------------|
| **Banca** | Punto de venta autorizado para vender tickets de lotería |
| **Casa/Matriz** | Operador central del sistema de lotería |
| **Directo/Quiniela** | Apuesta al número exacto en posición específica |
| **Pale** | Apuesta donde el número puede salir en cualquier posición |
| **Tripleta** | Apuesta a tres números en cualquier orden |
| **Límite** | Monto máximo que se puede apostar a un número/sorteo |
| **Excedente** | Ajuste para compensar ventas entre bancas |
| **Caída** | Pérdidas acumuladas de una banca |
| **Comisión** | Porcentaje que retiene la banca por cada venta |
| **Bote** | Jugada completa que se exporta/importa entre sistemas |
| **Hot Number** | Número que está cerca de su límite máximo |
| **Zona** | Agrupación geográfica de bancas |
| **Cobrador** | Persona responsable de cobros en una zona |

---

## 🔗 ARQUITECTURA TÉCNICA

### Stack Tecnológico Recomendado

```
┌─────────────────────────────────────────┐
│  FRONTEND (Web/Mobile)                  │
│  - React.js / Next.js                   │
│  - TypeScript                           │
│  - Tailwind CSS                         │
│  - Socket.io (tiempo real)              │
└────────────┬────────────────────────────┘
             │
             ↓ (HTTPS/WSS)
┌─────────────────────────────────────────┐
│  API LAYER (REST + WebSocket)           │
│  - Node.js + Express / NestJS           │
│  - JWT Authentication                   │
│  - Rate Limiting                        │
│  - API Gateway                          │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  BUSINESS LOGIC                         │
│  - Validación de límites                │
│  - Cálculo de premios                   │
│  - Procesamiento de tickets             │
│  - Gestión de balances                  │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  DATABASE                               │
│  - SQL Server 2022 / Azure SQL          │
│  - Redis (cache + sessions)             │
│  - ElasticSearch (logs + analytics)     │
└─────────────────────────────────────────┘
```

---

## ✅ CONCLUSIÓN

### El Sistema de Negocio en Resumen

**AplicaciÃ³n Lotto es:**

1. **Un Sistema B2B2C** que conecta:
   - Casa matriz (operador)
   - Bancas (distribuidores)
   - Clientes finales (apostadores)

2. **Una Plataforma Multi-Sorteo** con:
   - 70+ sorteos diarios
   - 21 tipos de jugadas
   - Miles de tickets por día

3. **Un Sistema de Gestión de Riesgo** que controla:
   - Límites multinivel
   - Exposición por número
   - Balances financieros
   - Comisiones y premios

4. **Una Red Distribuida** con:
   - Múltiples puntos de venta
   - Operación autónoma de bancas
   - Sincronización en tiempo real
   - Reportería centralizada

### Características Clave del Modelo:

✅ **Escalable** - Soporta cientos de bancas  
✅ **Seguro** - Auditoría completa, roles, límites  
✅ **Flexible** - Configurable por banca/zona/sorteo  
✅ **Rentable** - Sistema de comisiones automatizado  
✅ **Confiable** - Transacciones atómicas, backup automático  

---

**Documento generado:** Octubre 2025  
**Basado en:** docDefinitiva.md  
**Propósito:** Diseño de base de datos y desarrollo del sistema
