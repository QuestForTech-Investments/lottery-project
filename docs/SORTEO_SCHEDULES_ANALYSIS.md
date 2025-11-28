# Análisis de Configuración de Horarios de Sorteos

Análisis de cómo se configuran los horarios de sorteos en la aplicación original de lotería.

**Fecha de análisis:** 2025-11-24
**Aplicación analizada:** https://la-numbers.apk.lol
**Endpoint:** `https://api.lotocompany.com/api/v1/sortition-schedules-information?category=1`

---

## 📍 Ubicación en la Aplicación

**Navegación:** Menú lateral → Sorteos → Horario
**URL:** `https://la-numbers.apk.lol/#/sortition-schedules`
**Título de página:** "Horarios de sorteos"

---

## 🏗️ Estructura de la Interfaz

### Vista Principal (Lista de Loterías)

La página muestra una lista de botones turquesa, cada uno representando una lotería:

```
ANGUILA QUINIELA (AMERICA/SANTO_DOMINGO)
CALIFORNIA AM (AMERICA/NEW_YORK)
CALIFORNIA PM (AMERICA/NEW_YORK)
CHICAGO (AMERICA/NEW_YORK)
...
LOTERIA NACIONAL (AMERICA/SANTO_DOMINGO)
...
```

**Características:**
- Cada botón muestra el nombre de la lotería
- Entre paréntesis se muestra la zona horaria (timezone)
- Los botones son colapsables/expandibles
- Color: Turquesa (#51cbce)

---

## 🎯 Configuración de Horarios por Lotería

### Ejemplo: LOTERIA NACIONAL

Al hacer clic en "LOTERIA NACIONAL", se expande mostrando los sorteos (draws) de esa lotería:

#### Sorteo 1: GANA MAS (GM)

```yaml
Información del Sorteo:
  - Nombre: GANA MAS (campo deshabilitado)
  - Abreviación: GM (campo deshabilitado)
  - Color: Selector de color con preview
  - Logo: Imagen del sorteo (cargada desde S3)

Horarios por Día de la Semana:
  Lunes:
    - Hora inicio: 12:00 AM
    - Hora cierre: 02:34 PM
    - Botón eliminar (ícono de basura)

  Martes:
    - Hora inicio: 12:00 AM
    - Hora cierre: 02:34 PM
    - Botón eliminar

  Miércoles:
    - Hora inicio: 12:00 AM
    - Hora cierre: 02:34 PM
    - Botón eliminar

  Jueves:
    - Hora inicio: 12:00 AM
    - Hora cierre: 02:34 PM
    - Botón eliminar

  Viernes:
    - Hora inicio: 12:00 AM
    - Hora cierre: 02:34 PM
    - Botón eliminar

  Sábado:
    - Hora inicio: 12:00 AM
    - Hora cierre: 02:34 PM
    - Botón eliminar

  Domingo:
    - Hora inicio: 12:00 AM
    - Hora cierre: 02:34 PM
    - Botón eliminar
```

#### Sorteo 2: NACIONAL (LN)

```yaml
Información del Sorteo:
  - Nombre: NACIONAL (campo deshabilitado)
  - Abreviación: LN (campo deshabilitado)
  - Color: Selector de color con preview
  - Logo: Imagen del sorteo (cargada desde S3)

Horarios por Día de la Semana:
  Lunes a Sábado:
    - Hora inicio: 12:00 AM
    - Hora cierre: 08:55 PM
    - Botón eliminar

  Domingo:
    - Hora inicio: 12:00 AM
    - Hora cierre: 05:55 PM  ← Diferente del resto de días
    - Botón eliminar
```

**Botón de acción:**
- "ACTUALIZAR" (color turquesa, centrado) - Guarda todos los cambios

---

## 📊 Estructura de Datos

### Jerarquía

```
Lotería (Lottery)
  ├── Nombre: "LOTERIA NACIONAL"
  ├── Timezone: "America/Santo_Domingo"
  └── Sorteos (Draws) []
       ├── Sorteo 1
       │   ├── nombre: "GANA MAS"
       │   ├── abreviacion: "GM"
       │   ├── color: "#rrggbb"
       │   ├── logo_url: "https://s3.amazonaws.com/bancaflottery/..."
       │   └── horarios_semanales []
       │       ├── lunes: { inicio: "12:00 AM", cierre: "02:34 PM" }
       │       ├── martes: { inicio: "12:00 AM", cierre: "02:34 PM" }
       │       ├── miércoles: { inicio: "12:00 AM", cierre: "02:34 PM" }
       │       ├── jueves: { inicio: "12:00 AM", cierre: "02:34 PM" }
       │       ├── viernes: { inicio: "12:00 AM", cierre: "02:34 PM" }
       │       ├── sábado: { inicio: "12:00 AM", cierre: "02:34 PM" }
       │       └── domingo: { inicio: "12:00 AM", cierre: "02:34 PM" }
       │
       └── Sorteo 2
           ├── nombre: "NACIONAL"
           ├── abreviacion: "LN"
           ├── color: "#rrggbb"
           ├── logo_url: "https://s3.amazonaws.com/bancaflottery/..."
           └── horarios_semanales []
               ├── lunes: { inicio: "12:00 AM", cierre: "08:55 PM" }
               ├── martes: { inicio: "12:00 AM", cierre: "08:55 PM" }
               ├── miércoles: { inicio: "12:00 AM", cierre: "08:55 PM" }
               ├── jueves: { inicio: "12:00 AM", cierre: "08:55 PM" }
               ├── viernes: { inicio: "12:00 AM", cierre: "08:55 PM" }
               ├── sábado: { inicio: "12:00 AM", cierre: "08:55 PM" }
               └── domingo: { inicio: "12:00 AM", cierre: "05:55 PM" }
```

---

## 🔧 Campos y Controles

### Campos del Sorteo

| Campo | Tipo | Editable | Descripción |
|-------|------|----------|-------------|
| Nombre | Text Input | ❌ No | Nombre del sorteo (ej: "GANA MAS") |
| Abreviación | Text Input | ❌ No | Código corto (ej: "GM") |
| Color | Color Picker | ✅ Sí | Color para identificación visual |
| Logo | Image | 👁️ Solo vista | URL de S3 |

### Controles de Horario por Día

Cada día de la semana tiene:
1. **Label del día:** Lunes, Martes, Miércoles, etc.
2. **Input hora inicio:** Formato "HH:MM AM/PM"
3. **Ícono flecha:** (→) Separador visual
4. **Input hora cierre:** Formato "HH:MM AM/PM"
5. **Botón eliminar:** Ícono de basura (🗑️)

**Nota:** El botón eliminar probablemente permite desactivar ese día o eliminar el horario.

---

## 🎨 Características de Diseño

### Componentes UI (Element UI - Vue.js)

- **Botones de lotería:** `el-button` con estilo turquesa
- **Tarjetas de sorteo:** `el-card` con bordes y sombras
- **Formularios:** `el-form`, `el-form-item`
- **Inputs:** `el-input` con validación
- **Time pickers:** Inputs de texto con formato de hora
- **Color picker:** `el-color-picker`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Imagen Logo]  Nombre: GANA MAS                  │   │
│  │                Abreviación: GM                    │   │
│  │                Color: [■]                         │   │
│  └─────────────────────────────────────────────────┘   │
│  ─────────────────────────────────────────────────────  │
│  Lunes      [12:00 AM] → [02:34 PM]  [🗑️]            │
│  Martes     [12:00 AM] → [02:34 PM]  [🗑️]            │
│  Miércoles  [12:00 AM] → [02:34 PM]  [🗑️]            │
│  Jueves     [12:00 AM] → [02:34 PM]  [🗑️]            │
│  Viernes    [12:00 AM] → [02:34 PM]  [🗑️]            │
│  Sábado     [12:00 AM] → [02:34 PM]  [🗑️]            │
│  Domingo    [12:00 AM] → [02:34 PM]  [🗑️]            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Actualización

### Proceso de Guardado

1. Usuario modifica horarios en los campos
2. Hace clic en botón "ACTUALIZAR"
3. Sistema envía datos al endpoint:
   - Método: PATCH/PUT
   - Endpoint: `/api/v1/sortition-schedules-information`
   - Body: JSON con horarios actualizados
4. Backend valida y guarda cambios
5. Sistema muestra confirmación

### Validaciones Esperadas

- ✅ Hora de inicio debe ser antes que hora de cierre
- ✅ Formato de hora válido (HH:MM AM/PM)
- ✅ No puede haber solapamiento de horarios en el mismo día
- ✅ Timezone debe coincidir con la lotería

---

## 📡 API Endpoints

### GET - Obtener Horarios

```http
GET /api/v1/sortition-schedules-information?category=1
Authorization: Bearer {token}
```

**Parámetros:**
- `category`: ID de la lotería

**Respuesta esperada:**
```json
{
  "lotteryId": 1,
  "lotteryName": "LOTERIA NACIONAL",
  "timezone": "America/Santo_Domingo",
  "draws": [
    {
      "drawId": 1,
      "name": "GANA MAS",
      "abbreviation": "GM",
      "color": "#ff6b6b",
      "logoUrl": "https://s3.amazonaws.com/bancaflottery/...",
      "weeklySchedule": {
        "monday": { "startTime": "12:00 AM", "endTime": "02:34 PM" },
        "tuesday": { "startTime": "12:00 AM", "endTime": "02:34 PM" },
        "wednesday": { "startTime": "12:00 AM", "endTime": "02:34 PM" },
        "thursday": { "startTime": "12:00 AM", "endTime": "02:34 PM" },
        "friday": { "startTime": "12:00 AM", "endTime": "02:34 PM" },
        "saturday": { "startTime": "12:00 AM", "endTime": "02:34 PM" },
        "sunday": { "startTime": "12:00 AM", "endTime": "02:34 PM" }
      }
    },
    {
      "drawId": 2,
      "name": "NACIONAL",
      "abbreviation": "LN",
      "color": "#4ecdc4",
      "logoUrl": "https://s3.amazonaws.com/bancaflottery/...",
      "weeklySchedule": {
        "monday": { "startTime": "12:00 AM", "endTime": "08:55 PM" },
        "tuesday": { "startTime": "12:00 AM", "endTime": "08:55 PM" },
        "wednesday": { "startTime": "12:00 AM", "endTime": "08:55 PM" },
        "thursday": { "startTime": "12:00 AM", "endTime": "08:55 PM" },
        "friday": { "startTime": "12:00 AM", "endTime": "08:55 PM" },
        "saturday": { "startTime": "12:00 AM", "endTime": "08:55 PM" },
        "sunday": { "startTime": "12:00 AM", "endTime": "05:55 PM" }
      }
    }
  ]
}
```

### PATCH/PUT - Actualizar Horarios

```http
PATCH /api/v1/sortition-schedules-information
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "lotteryId": 1,
  "draws": [
    {
      "drawId": 1,
      "color": "#ff6b6b",
      "weeklySchedule": {
        "monday": { "startTime": "12:00 AM", "endTime": "02:34 PM" },
        ...
      }
    }
  ]
}
```

---

## 💡 Insights y Observaciones

### Diferencias con el Sistema Actual

| Aspecto | App Original | Sistema Nuevo |
|---------|--------------|---------------|
| **Nivel de configuración** | Por día de semana | Por sorteo individual |
| **Horarios** | Inicio + Cierre | Solo hora de sorteo |
| **Múltiples horarios** | Posible (con botón +) | Un horario por sorteo |
| **Timezone** | Por lotería | Asumido por servidor |
| **Color personalizado** | Sí | Sí (en API) |

### Ventajas del Enfoque de Horarios Semanales

1. **Flexibilidad:** Permite horarios diferentes por día
2. **Horarios especiales:** Domingo puede tener hora diferente
3. **Cierre de ventas:** Usa "hora de cierre" en vez de "hora de sorteo"
4. **Múltiples slots:** Puede agregar varios horarios por día
5. **Timezone explícito:** Evita confusiones con zonas horarias

### Posibles Mejoras para Implementar

1. **Agregar horarios semanales** a la tabla `draws`
2. **Tabla nueva:** `draw_weekly_schedules`
   - draw_id
   - day_of_week (0-6 o enum)
   - start_time
   - end_time
   - is_active
3. **Validación de cutoff** usando hora de cierre
4. **API endpoint** para gestionar horarios semanales
5. **UI component** para configurar horarios por día

---

## 📋 Recomendaciones para Migración

### Opción 1: Horarios Simples (Actual)

**Mantener:**
- Un solo horario por sorteo
- `DrawTime` en tabla `draws`
- `CutoffMinutes` para cierre de ventas

**Ventaja:** Simplicidad
**Desventaja:** Menos flexible

### Opción 2: Horarios Semanales (Como Original)

**Implementar:**
```sql
CREATE TABLE draw_weekly_schedules (
    schedule_id INT IDENTITY(1,1) PRIMARY KEY,
    draw_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0=Domingo, 1=Lunes, ..., 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2,
    FOREIGN KEY (draw_id) REFERENCES draws(draw_id),
    CONSTRAINT UQ_draw_day UNIQUE (draw_id, day_of_week)
);
```

**Ventaja:** Máxima flexibilidad
**Desventaja:** Mayor complejidad

### Opción 3: Híbrida (Recomendada)

1. Mantener `DrawTime` para sorteos regulares
2. Agregar `draw_weekly_schedules` para excepciones
3. Lógica: Si existe horario semanal para el día, usarlo; sino, usar `DrawTime`

---

## 🎯 Conclusiones

### Características Clave del Sistema Original

1. ✅ **Horarios por día de semana:** Cada sorteo puede tener horarios diferentes según el día
2. ✅ **Inicio y cierre:** Define ventana de ventas explícitamente
3. ✅ **Timezone por lotería:** Maneja múltiples zonas horarias
4. ✅ **Color y logo:** Identificación visual de sorteos
5. ✅ **Interfaz intuitiva:** Fácil modificación de horarios
6. ✅ **Actualización masiva:** Un solo botón para guardar todo

### Próximos Pasos Sugeridos

1. **Decidir enfoque:** Simple vs Semanal vs Híbrido
2. **Diseñar API:** Endpoints para gestionar horarios
3. **Crear componente UI:** Replicar funcionalidad de horarios semanales
4. **Migrar datos:** Script para convertir horarios actuales
5. **Testing:** Validar con diferentes timezones y casos edge

---

**Documentado por:** Claude Code
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** Análisis completo
