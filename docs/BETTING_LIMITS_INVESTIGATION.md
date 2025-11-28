# Investigación: Sistema de Límites de Apuesta

**Fecha:** 2025-11-25
**Aplicación Original:** https://la-numbers.apk.lol
**Usuario de prueba:** oliver / oliver0597@

---

## 📋 Resumen Ejecutivo

La aplicación original Vue.js implementa un sistema completo y sofisticado de límites de apuesta con **10 tipos diferentes** de límites, configurables por sorteo, tipo de apuesta, día de semana y con fechas de expiración.

---

## 🎯 Tipos de Límites (10 Tipos)

El sistema maneja los siguientes tipos de límites en orden jerárquico:

1. **General para grupo** - Límite global para todo el grupo de bancas
2. **General por número para grupo** - Límite específico por número para todo el grupo
3. **General para banca** - Límite global aplicable a una banca específica
4. **Por número para banca (Línea)** - Límite por número específico para una banca
5. **Local para banca** - Límite local configurado por la banca misma
6. **General para zona** - Límite aplicable a toda una zona geográfica
7. **Por número para zona** - Límite por número para una zona
8. **General para grupo externo** - Límite para agentes externos
9. **Por número para grupo externo** - Límite por número para agentes externos
10. **Absoluto** - Límite absoluto (máxima restricción)

---

## 💰 Límites por Tipo de Apuesta

Cada límite puede configurar montos máximos para **24 tipos de apuesta diferentes**:

### Apuestas Estándar:
- **Directo** - Número directo
- **Pale** - Combinación de 2 números
- **Tripleta** - Combinación de 3 números

### Cash3 (Loterías de 3 dígitos):
- **Cash3 Straight** - Orden exacto
- **Cash3 Box** - Cualquier orden
- **Cash3 Front Straight** - 2 primeros dígitos en orden
- **Cash3 Front Box** - 2 primeros dígitos en cualquier orden
- **Cash3 Back Straight** - 2 últimos dígitos en orden
- **Cash3 Back Box** - 2 últimos dígitos en cualquier orden

### Play4 & Pick5 (Loterías de 4-5 dígitos):
- **Play4 Straight** - 4 dígitos orden exacto
- **Play4 Box** - 4 dígitos cualquier orden
- **Pick5 Straight** - 5 dígitos orden exacto
- **Pick5 Box** - 5 dígitos cualquier orden

### Pick Two (Variantes):
- **Pick Two** - 2 dígitos
- **Pick Two Front** - 2 primeros dígitos
- **Pick Two Back** - 2 últimos dígitos
- **Pick Two Middle** - 2 dígitos del medio

### Super Pale:
- **Super Pale** - Pale especial

### Bolitas y Singulaciones:
- **Bolita 1** - Primera bolita
- **Bolita 2** - Segunda bolita
- **Singulación 1** - Primera singulación
- **Singulación 2** - Segunda singulación
- **Singulación 3** - Tercera singulación

### Otros:
- **Panamá** - Lotería de Panamá
- **FL PICK2 AM/PM** - Florida Pick 2 mañana/tarde

---

## 📅 Configuración Temporal

Los límites se pueden configurar con:

### Fecha de Expiración
- Los límites pueden tener una fecha de vencimiento
- Después de la fecha, el límite deja de aplicarse automáticamente

### Día de Semana
Los límites son específicos por día:
- Lunes
- Martes
- Miércoles
- Jueves
- Viernes
- Sábado
- Domingo

**Función:** Botón "Seleccionar todos" para marcar todos los días rápidamente

---

## 🎲 Configuración por Sorteo

Los límites se aplican a sorteos específicos (~72 sorteos disponibles):

**Sorteos observados incluyen:**
- Anguila 10am, 1pm, 6PM, 9pm
- REAL, GANA MAS, LA PRIMERA, LA SUERTE
- LOTEDOM, LOTEKA
- TEXAS MORNING/EVENING/DAY/NIGHT
- King Lottery AM/PM
- NEW YORK DAY/NIGHT
- FLORIDA AM/PM
- INDIANA MIDDAY/EVENING
- GEORGIA-MID AM/EVENING/NIGHT
- NEW JERSEY AM/PM
- L.E. PUERTO RICO 2PM/10PM
- DIARIA 11AM/3PM/9PM
- CONNECTICUT AM/PM
- PENN MIDDAY/EVENING
- NY AM 6x1, NY PM 6x1
- FL AM 6X1, FL PM 6X1
- MARYLAND MIDDAY/EVENING
- VIRGINIA AM/PM
- DELAWARE AM/PM
- LA CHICA
- SOUTH CAROLINA AM/PM
- CALIFORNIA AM/PM
- MASS AM/PM
- NORTH CAROLINA AM/PM
- CHICAGO AM/PM
- PANAMA MIERCOLES/DOMINGO
- SUPER PALE TARDE/NY-FL AM/NY-FL PM/NOCHE
- QUINIELA PALE
- NACIONAL
- FL PICK2 AM/PM

**Función:** Botón "Seleccionar todos" para marcar todos los sorteos

---

## 🔧 Funcionalidades Adicionales del Sistema de Límites

### Límites Automáticos
- Ruta: `#/limits/automatic`
- Sistema de configuración automática de límites

### Números Calientes
- Ruta: `#/limits/hot-numbers`
- Vista de números con alta actividad de juego
- Permite identificar números que requieren límites especiales

### Eliminar Límites
- Ruta: `#/limits/destroy`
- Función de eliminación masiva de límites

---

## 📱 Interfaz de Creación de Tickets

### Estructura del Formulario

```
┌─────────────────────────────────────────────┐
│ Banca: [Selector ▼]     [Logo Sorteo]      │
│                          Anguila 10am        │
├─────────────────────────────────────────────┤
│ Grid de Sorteos (72 sorteos clickeables)   │
│ [Anguila 10am] [REAL] [GANA MAS] ...       │
├─────────────────────────────────────────────┤
│ Estadísticas en Tiempo Real:               │
│ • Jugadas del día: 0                        │
│ • Vendido en grupo: $X,XXX                  │
│ • Vendido en banca: $X,XXX                  │
│ • Desc. [Toggle] Mult. lot [Toggle]        │
├─────────────────────────────────────────────┤
│ Campos de Entrada:                          │
│ [Jugada] [Tipo: N/A] [Monto]               │
│ Jugadas: 0    Total: $0.00                  │
├─────────────────────────────────────────────┤
│ 4 Secciones de Agrupación:                 │
│ ┌─ Directo ─────────────┐                  │
│ │ LOT | NUM | [🔍] [🗑️] │ TOTAL: $0.00    │
│ └───────────────────────┘                  │
│ ┌─ Pale & Tripleta ────┐                  │
│ │ LOT | NUM | [🔍] [🗑️] │ TOTAL: $0.00    │
│ └───────────────────────┘                  │
│ ┌─ Cash 3 ──────────────┐                  │
│ │ LOT | NUM | [🔍] [🗑️] │ TOTAL: $0.00    │
│ └───────────────────────┘                  │
│ ┌─ Play 4 & Pick 5 ────┐                  │
│ │ LOT | NUM | [🔍] [🗑️] │ TOTAL: $0.00    │
│ └───────────────────────┘                  │
├─────────────────────────────────────────────┤
│ [Duplicar] [Crear ticket] [Ayuda]          │
└─────────────────────────────────────────────┘
```

### Campos Observados:
- **Banca:** Selector de banca (combobox con autocomplete)
- **Sorteo actual:** Logo y nombre del sorteo seleccionado
- **Grid de sorteos:** Chips clickeables para seleccionar múltiples sorteos
- **Jugadas del día:** Contador en tiempo real
- **Vendido en grupo/banca:** Montos acumulados
- **Desc.:** Toggle para descuento
- **Mult. lot:** Toggle para multiplicador de lotería
- **4 secciones de agrupación** por tipo de apuesta con totales individuales

---

## 🔌 API Endpoints Identificados

### Crear Ticket - Parámetros
```
GET https://api.lotocompany.com/api/v1/tickets/params/create?category=1
Status: 200 OK
```

**Este endpoint probablemente devuelve:**
- Lista de bancas disponibles
- Sorteos activos y sus horarios
- Tipos de apuesta permitidos
- **Límites aplicables** (por banca, sorteo, tipo de apuesta)
- Descuentos y multiplicadores disponibles
- Estado de cierre de sorteos

---

## 🚨 Validaciones y Cierres Observados

### Bloqueo Rápido de Números (Dashboard)

En el dashboard principal existe una sección de **"Bloqueo rápido de números"** con:
- Selector de Sorteo
- Selector de Tipo de jugada
- Campo de Jugada (número)
- Botones: [Agregar] [Bloquear]

**Función:** Permite bloquear números específicos en tiempo real para evitar ventas.

### Campos de Validación de Límites

Los formularios tienen validación obligatoria de:
- **Tipo de límite** - No puede estar vacío
- **Sorteos** - Debe seleccionar al menos uno
- **Día de semana** - Debe seleccionar al menos uno

**Error observado:** HTTP 422 (Unprocessable Entity) cuando faltan campos obligatorios

---

## 🎮 Flujo de Validación en Tiempo Real (Hipótesis)

Basado en la estructura observada, el flujo probable es:

### 1. Carga Inicial
```javascript
GET /api/v1/tickets/params/create?category=1
```
**Respuesta esperada:**
```json
{
  "bettingPools": [...],
  "sortitions": [...],
  "betTypes": [...],
  "limits": {
    "byBettingPool": {...},
    "bySortition": {...},
    "byBetType": {...},
    "byNumber": {...}
  },
  "closures": [...]
}
```

### 2. Al Digitar Apuesta

**Validaciones del frontend:**
- Verificar si el sorteo está cerrado
- Verificar límite absoluto para el número
- Verificar límite por tipo de apuesta
- Verificar límite por banca
- Verificar límite por grupo
- Verificar "vendido en grupo" vs límite grupo
- Verificar "vendido en banca" vs límite banca

**Posibles llamadas a API:**
```javascript
// Verificar límite para número específico
GET /api/v1/limits/check?
  sortitionId=X&
  betType=directo&
  number=00&
  amount=100
```

### 3. Al Crear Ticket

**Validación final del backend:**
- Revalidar todos los límites
- Verificar horarios de cierre
- Verificar saldo de banca
- Crear ticket si todo está OK
- Retornar error 422 si excede límites

---

## 📊 Información en Tiempo Real

### Estadísticas Mostradas Durante Entrada:
1. **Jugadas del día:** Contador total de apuestas del día
2. **Vendido en grupo:** Monto total vendido en todo el grupo
3. **Vendido en banca:** Monto total vendido en la banca seleccionada

**Uso:** Estas estadísticas permiten al cajero ver si está cerca de límites antes de crear el ticket.

---

## 🎯 Diferencias con Implementación Actual

### Nuestra Aplicación React vs Original Vue.js

| Aspecto | Vue.js Original | React V2 Actual | Estado |
|---------|----------------|-----------------|--------|
| **Tipos de límites** | 10 tipos diferentes | No implementado | ❌ Falta |
| **Límites por tipo de apuesta** | 24 tipos | No implementado | ❌ Falta |
| **Límites por día** | Configurables | No implementado | ❌ Falta |
| **Fecha expiración** | Soportado | No implementado | ❌ Falta |
| **Bloqueo rápido** | Dashboard | No existe | ❌ Falta |
| **Números calientes** | Vista dedicada | No existe | ❌ Falta |
| **Estadísticas en tiempo real** | 3 contadores | No implementado | ❌ Falta |
| **Grid de sorteos** | 72 sorteos | Implementado ✓ | ✅ OK |
| **4 secciones agrupación** | Directo/Pale/Cash3/Play4 | Implementado ✓ | ✅ OK |

---

## 🔑 Conclusiones y Recomendaciones

### Hallazgos Clave:

1. **Sistema jerárquico de límites** - 10 tipos diferentes desde absoluto hasta local
2. **Granularidad extrema** - Límites por sorteo, tipo de apuesta, día, número específico
3. **Validación multi-capa** - Frontend muestra estadísticas, backend valida límites
4. **API centralizada** - Endpoint `/tickets/params/create` devuelve toda la configuración
5. **Bloqueo en tiempo real** - Dashboard permite bloquear números instantáneamente

### Para Implementar en React V2:

#### Prioridad Alta:
1. **Endpoint de parámetros**
   ```typescript
   GET /api/tickets/params/create
   // Debe devolver: bancas, sorteos, límites, cierres
   ```

2. **Servicio de validación de límites**
   ```typescript
   checkLimit(sortitionId, betType, number, amount): {
     allowed: boolean,
     reason?: string,
     limitType?: string,
     remaining?: number
   }
   ```

3. **Estadísticas en tiempo real**
   - Vendido en grupo (actualizar cada X segundos)
   - Vendido en banca
   - Jugadas del día

#### Prioridad Media:
4. **CRUD de límites**
   - Crear límites (10 tipos)
   - Listar límites (con filtros)
   - Editar límites
   - Eliminar límites
   - Límites automáticos

5. **Bloqueo rápido de números**
   - Componente en dashboard
   - API para bloquear/desbloquear números

#### Prioridad Baja:
6. **Números calientes**
   - Vista de análisis de números más jugados
   - Sugerencias automáticas de límites

---

## 📸 Screenshots Capturados

1. **limits-page.png** - Página de lista de límites con filtros
2. **limits-types.png** - Dropdown mostrando los 10 tipos de límites con grid de sorteos y sección de montos

---

## 🔗 URLs Relevantes

- **Dashboard:** https://la-numbers.apk.lol/#/dashboard
- **Crear límites:** https://la-numbers.apk.lol/#/limits/new
- **Lista de límites:** https://la-numbers.apk.lol/#/limits
- **Límites automáticos:** https://la-numbers.apk.lol/#/limits/automatic
- **Números calientes:** https://la-numbers.apk.lol/#/limits/hot-numbers
- **Crear tickets:** https://la-numbers.apk.lol/#/tickets/create
- **API Base:** https://api.lotocompany.com/api/v1/

---

## 📝 Notas Adicionales

### Preguntas Pendientes:

1. ¿Cómo se validan los límites exactamente cuando se digita? ¿En tiempo real o al crear?
2. ¿Qué contiene exactamente la respuesta de `/tickets/params/create`?
3. ¿Hay un WebSocket para actualizar estadísticas en tiempo real?
4. ¿Cómo se manejan los límites cuando hay conflicto entre tipos? (ej: límite grupo vs límite banca)
5. ¿Los cierres de sorteo son automáticos por horario o manuales?

### Próximos Pasos:

1. ✅ Documentar hallazgos (COMPLETADO)
2. ❌ Hacer llamada directa a API `/tickets/params/create` (Token expirado)
3. ⏳ Crear ticket de prueba pequeño (Requiere banca pre-seleccionada)
4. ⏳ Monitorear llamadas de red durante creación de ticket
5. ⏳ Proponer modelo de datos para límites en API .NET
6. ⏳ Diseñar componentes React para gestión de límites

---

## 📝 Resumen Final de la Investigación

### Hallazgos Principales:

**1. Sistema Jerárquico de 10 Tipos de Límites**
La aplicación implementa un sistema sofisticado con límites desde nivel absoluto (global) hasta nivel banca individual, permitiendo control granular sobre las ventas.

**2. Validación Multi-Capa**
- **Frontend:** Muestra estadísticas en tiempo real (vendido en grupo/banca)
- **Backend:** Valida límites antes de crear el ticket (HTTP 422 si excede)

**3. Granularidad Extrema**
- Por sorteo (72 sorteos diferentes)
- Por tipo de apuesta (24 tipos)
- Por día de semana (7 días)
- Por número específico
- Con fechas de expiración

**4. Integración en Tiempo Real**
- WebSocket conectado para actualizaciones en vivo
- Contadores de "vendido en grupo" y "vendido en banca"
- Bloqueo rápido de números desde dashboard

### Retos Identificados:

1. **Complejidad de Implementación**: 10 tipos de límites requieren un sistema robusto
2. **Jerarquía de Validación**: Determinar qué límite aplica cuando hay conflictos
3. **Rendimiento**: Validar límites en tiempo real sin afectar UX
4. **Sincronización**: Mantener estadísticas actualizadas entre múltiples usuarios

### Recomendaciones para Implementación en React V2:

#### Fase 1 - MVP (Mínimo Viable):
1. Implementar límites básicos (General para grupo, General para banca)
2. Estadísticas simples (vendido hoy)
3. Validación backend en creación de ticket

#### Fase 2 - Intermedio:
4. Límites por tipo de apuesta
5. Límites por día de semana
6. Sistema de bloqueo rápido

#### Fase 3 - Completo:
7. Todos los 10 tipos de límites
8. Límites automáticos
9. Números calientes
10. WebSocket para actualización en tiempo real

---

## 🎯 Conclusión

El sistema de límites de la aplicación original es **extremadamente robusto y complejo**. Implementa:

- **10 tipos diferentes de límites** con jerarquía clara
- **24 tipos de apuesta** con configuración independiente
- **Validación multi-capa** (frontend + backend)
- **Actualización en tiempo real** vía WebSocket
- **Bloqueo instantáneo** de números

Para nuestra implementación en React V2, se recomienda un **enfoque incremental**:
1. Comenzar con límites básicos (grupo y banca)
2. Agregar validación backend robusta
3. Implementar estadísticas en tiempo real
4. Expandir gradualmente a los 10 tipos

**Tiempo estimado de implementación completa:** 3-4 semanas de desarrollo.

---

## 🚫 Comportamiento de Sorteos Cerrados

### Hallazgo Clave: NO hay Indicación Visual

**Pregunta investigada:** ¿Los sorteos cerrados tienen botones deshabilitados?

**Respuesta:** **NO** - La aplicación original NO deshabilita visualmente los sorteos cerrados.

### Evidencia:

1. **Todos los chips son clickeables:**
   - Los 72 sorteos se muestran con `cursor: pointer`
   - No hay diferencia visual entre sorteos abiertos y cerrados
   - No hay atributos `disabled` en ningún chip

2. **Pruebas realizadas:**
   - ✅ Click en "LOTEKA" - Selección exitosa
   - ✅ Click en "PANAMA DOMINGO" (solo domingos) - Selección exitosa
   - ✅ No hay mensajes de error en consola
   - ✅ Cambio de sorteo actual funciona sin validación

3. **Implicaciones de UX:**

   **La validación de cierres ocurre en etapas posteriores, NO al seleccionar el sorteo:**

   - **Etapa 1 - Selección de Sorteo:** ✅ Permitido siempre (sin validación)
   - **Etapa 2 - Selección de Banca:** Posible validación (pendiente confirmar)
   - **Etapa 3 - Ingreso de Jugada:** Posible bloqueo de input (pendiente confirmar)
   - **Etapa 4 - Crear Ticket (Backend):** Validación definitiva con HTTP 422

### Ventajas de este Enfoque:

1. **UX más fluida** - Usuario puede navegar libremente entre sorteos
2. **Información contextual** - Usuario puede ver estadísticas del sorteo aunque esté cerrado
3. **Validación centralizada** - Backend es la fuente de verdad
4. **Menor complejidad frontend** - No se necesita sincronizar estado de cierre en UI

### Desventajas:

1. **Feedback tardío** - Usuario no sabe que sorteo está cerrado hasta intentar apostar
2. **Confusión potencial** - ¿Por qué puedo seleccionar un sorteo cerrado?
3. **Necesita mensajes claros** - Error debe explicar que sorteo está cerrado

### Recomendación para React V2:

**Opción A (Replicar original):**
```jsx
// Permitir selección de todos los sorteos
// Validar solo al intentar crear apuesta
onClick={() => setSelectedDraw(draw)}
```

**Opción B (UX mejorada):**
```jsx
// Agregar indicador visual sutil
<Chip
  label={draw.name}
  onClick={() => setSelectedDraw(draw)}
  sx={{
    opacity: draw.isClosed ? 0.6 : 1,
    filter: draw.isClosed ? 'grayscale(50%)' : 'none'
  }}
/>
// Mostrar badge "CERRADO" si aplica
{draw.isClosed && <Chip label="CERRADO" size="small" color="error" />}
```

**Decisión:** Validar con usuario si prefiere UX original o mejorada.

---

**Última actualización:** 2025-11-25
**Investigado por:** Claude Code + Playwright
**Estado:** Investigación Completada - Documentación Lista para Implementación
