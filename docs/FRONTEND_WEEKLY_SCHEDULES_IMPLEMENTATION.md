# Implementación de Horarios Semanales en el Frontend

Guía completa para implementar horarios semanales de sorteos en el frontend React + Material-UI.

**Fecha:** 2025-11-24
**Componente actual:** `DrawSchedules/index.jsx`
**Estado:** Mockup simple (solo un horario por sorteo)

---

## 📋 Índice

1. [Análisis del Componente Actual](#análisis-del-componente-actual)
2. [Opciones de Implementación](#opciones-de-implementación)
3. [Opción Recomendada: Horarios Semanales Completos](#opción-recomendada)
4. [Estructura de Datos](#estructura-de-datos)
5. [Componentes UI Necesarios](#componentes-ui-necesarios)
6. [Código de Implementación](#código-de-implementación)
7. [API Integration](#api-integration)

---

## 🔍 Análisis del Componente Actual

### Ubicación
```
frontend-v2/src/components/features/draws/DrawSchedules/index.jsx
```

### Estado Actual
- ✅ Lista de loterías con botones turquesa
- ✅ Modal para configurar horario
- ❌ Solo permite UN horario por sorteo
- ❌ No maneja horarios diferentes por día
- ❌ No muestra múltiples draws por lotería
- ❌ Datos hardcodeados (mockup)

### Lo que necesitamos agregar
1. Horarios diferentes por día de la semana
2. Múltiples sorteos (draws) por lotería
3. Hora de inicio y hora de cierre
4. Integración con API real
5. Validaciones de horarios

---

## 🎯 Opciones de Implementación

### Opción 1: Simple - Mantener como está
**Pros:**
- ✅ Ya implementado
- ✅ Fácil de usar
- ✅ Suficiente para sorteos con horario fijo

**Contras:**
- ❌ No permite horarios especiales (ej: domingo diferente)
- ❌ Menos flexible que el sistema original
- ❌ No cumple con los requisitos del análisis

**Recomendación:** ❌ No recomendado

---

### Opción 2: Horarios Semanales - Replicar app original
**Pros:**
- ✅ Máxima flexibilidad
- ✅ Permite horarios diferentes por día
- ✅ Coherente con sistema original
- ✅ Mejor experiencia de usuario

**Contras:**
- ⚠️ Más complejo de implementar
- ⚠️ Requiere cambios en API

**Recomendación:** ✅ **RECOMENDADO**

---

### Opción 3: Híbrida - Horario base + excepciones
**Pros:**
- ✅ Balance entre simplicidad y flexibilidad
- ✅ Fácil de usar para sorteos regulares
- ✅ Permite excepciones cuando sea necesario

**Contras:**
- ⚠️ UI puede ser confusa
- ⚠️ Requiere lógica adicional

**Recomendación:** 🟡 Viable

---

## ⭐ Opción Recomendada: Horarios Semanales Completos

### Vista de la Interfaz

```
┌─────────────────────────────────────────────────────────────┐
│                    Horarios de sorteos                       │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ LOTERIA NACIONAL (AMERICA/SANTO_DOMINGO)              │◄─┐│
│  └───────────────────────────────────────────────────────┘  ││
│                                                               ││
│  ┌─────────────────────────────────────────────────────────┐││
│  │ [Logo] GANA MAS (GM)                    Color: [■]      │││
│  │ ───────────────────────────────────────────────────────  │││
│  │ Lunes      [12:00 AM] → [02:34 PM]  [🗑️]              │││
│  │ Martes     [12:00 AM] → [02:34 PM]  [🗑️]              │││
│  │ Miércoles  [12:00 AM] → [02:34 PM]  [🗑️]              │││
│  │ Jueves     [12:00 AM] → [02:34 PM]  [🗑️]              │││
│  │ Viernes    [12:00 AM] → [02:34 PM]  [🗑️]              │││
│  │ Sábado     [12:00 AM] → [02:34 PM]  [🗑️]              │││
│  │ Domingo    [12:00 AM] → [02:34 PM]  [🗑️]              │││
│  └─────────────────────────────────────────────────────────┘││
│                                                               ││
│  ┌─────────────────────────────────────────────────────────┐││
│  │ [Logo] NACIONAL (LN)                    Color: [■]      │││
│  │ ───────────────────────────────────────────────────────  │││
│  │ Lunes      [12:00 AM] → [08:55 PM]  [🗑️]              │││
│  │ Martes     [12:00 AM] → [08:55 PM]  [🗑️]              │││
│  │ ...                                                       │││
│  │ Domingo    [12:00 AM] → [05:55 PM]  [🗑️]  ◄── Diferente│││
│  └─────────────────────────────────────────────────────────┘││
│                                                               ││
│                    [ACTUALIZAR]                              ││
└───────────────────────────────────────────────────────────────┘
                                                                │
    Botón expandible ──────────────────────────────────────────┘
```

---

## 📊 Estructura de Datos

### Estado del Componente

```javascript
const [lotteries, setLotteries] = useState([
  {
    lotteryId: 1,
    lotteryName: 'LOTERIA NACIONAL',
    timezone: 'America/Santo_Domingo',
    draws: [
      {
        drawId: 1,
        drawName: 'GANA MAS',
        abbreviation: 'GM',
        color: '#ff6b6b',
        logoUrl: 'https://s3.amazonaws.com/...',
        weeklySchedule: {
          monday: { startTime: '00:00', endTime: '14:34', enabled: true },
          tuesday: { startTime: '00:00', endTime: '14:34', enabled: true },
          wednesday: { startTime: '00:00', endTime: '14:34', enabled: true },
          thursday: { startTime: '00:00', endTime: '14:34', enabled: true },
          friday: { startTime: '00:00', endTime: '14:34', enabled: true },
          saturday: { startTime: '00:00', endTime: '14:34', enabled: true },
          sunday: { startTime: '00:00', endTime: '14:34', enabled: true }
        }
      },
      {
        drawId: 2,
        drawName: 'NACIONAL',
        abbreviation: 'LN',
        color: '#4ecdc4',
        logoUrl: 'https://s3.amazonaws.com/...',
        weeklySchedule: {
          monday: { startTime: '00:00', endTime: '20:55', enabled: true },
          // ... resto de días
          sunday: { startTime: '00:00', endTime: '17:55', enabled: true }
        }
      }
    ],
    expanded: false // Para controlar el colapso del acordeón
  }
]);
```

### Formato de Tiempo

**Frontend (input type="time"):**
```javascript
"14:34"  // Formato 24 horas para inputs HTML5
```

**Display (para el usuario):**
```javascript
"02:34 PM"  // Formato 12 horas con AM/PM
```

**Backend/API:**
```javascript
"14:34:00"  // Formato TIME de SQL Server
```

---

## 🎨 Componentes UI Necesarios

### 1. `DrawSchedules` (Principal)
```javascript
// Componente principal con lista de loterías
<DrawSchedules />
```

### 2. `LotteryAccordion` (Nuevo)
```javascript
// Acordeón expandible por lotería
<LotteryAccordion
  lottery={lottery}
  onUpdate={handleUpdateSchedule}
  expanded={expanded}
  onToggle={handleToggleExpand}
/>
```

### 3. `DrawScheduleCard` (Nuevo)
```javascript
// Tarjeta con horarios semanales de un sorteo
<DrawScheduleCard
  draw={draw}
  onScheduleChange={handleScheduleChange}
  onDelete={handleDeleteSchedule}
/>
```

### 4. `WeeklyScheduleInput` (Nuevo)
```javascript
// Input para configurar horarios de un día
<WeeklyScheduleInput
  dayName="Lunes"
  dayKey="monday"
  schedule={schedule.monday}
  onChange={handleDayChange}
  onDelete={handleDayDelete}
/>
```

### 5. `TimeRangePicker` (Nuevo)
```javascript
// Selector de rango de tiempo
<TimeRangePicker
  startTime="00:00"
  endTime="14:34"
  onChange={handleTimeChange}
  label="Lunes"
/>
```

---

## 💻 Código de Implementación

### Componente Principal Actualizado

```jsx
// frontend-v2/src/components/features/draws/DrawSchedules/index.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import DrawScheduleCard from './DrawScheduleCard';
import api from '@services/api';

const DrawSchedules = () => {
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  // Cargar datos al montar
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      // Agrupar draws por lottery
      const response = await api.get('/draws/schedules');

      // Transformar respuesta a estructura agrupada
      const groupedByLottery = groupDrawsByLottery(response.data);
      setLotteries(groupedByLottery);
    } catch (err) {
      console.error('Error loading schedules:', err);
      setError('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const groupDrawsByLottery = (draws) => {
    const grouped = {};

    draws.forEach(draw => {
      const lotteryId = draw.lotteryId;
      if (!grouped[lotteryId]) {
        grouped[lotteryId] = {
          lotteryId: draw.lotteryId,
          lotteryName: draw.lotteryName,
          timezone: draw.timezone || 'America/Santo_Domingo',
          draws: [],
          expanded: false
        };
      }
      grouped[lotteryId].draws.push(draw);
    });

    return Object.values(grouped);
  };

  const handleScheduleChange = (lotteryId, drawId, dayKey, field, value) => {
    setLotteries(prev => prev.map(lottery => {
      if (lottery.lotteryId !== lotteryId) return lottery;

      return {
        ...lottery,
        draws: lottery.draws.map(draw => {
          if (draw.drawId !== drawId) return draw;

          return {
            ...draw,
            weeklySchedule: {
              ...draw.weeklySchedule,
              [dayKey]: {
                ...draw.weeklySchedule[dayKey],
                [field]: value
              }
            }
          };
        })
      };
    }));
  };

  const handleToggleExpand = (lotteryId) => {
    setLotteries(prev => prev.map(lottery =>
      lottery.lotteryId === lotteryId
        ? { ...lottery, expanded: !lottery.expanded }
        : lottery
    ));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Recopilar todos los cambios
      const updates = lotteries.flatMap(lottery =>
        lottery.draws.map(draw => ({
          drawId: draw.drawId,
          weeklySchedule: draw.weeklySchedule
        }))
      );

      // Enviar al backend
      await api.patch('/draws/schedules', { schedules: updates });

      setSuccess('Horarios actualizados correctamente');

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error saving schedules:', err);
      setError('Error al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontSize: '24px',
              fontWeight: 500,
              color: '#2c2c2c'
            }}
          >
            Horarios de sorteos
          </Typography>

          {/* Mensajes */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* Lista de Loterías */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {lotteries.map(lottery => (
              <Accordion
                key={lottery.lotteryId}
                expanded={lottery.expanded}
                onChange={() => handleToggleExpand(lottery.lotteryId)}
                sx={{
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  border: 'none'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: '#51cbce',
                    color: 'white',
                    '&:hover': { bgcolor: '#45b8bb' },
                    textTransform: 'uppercase',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: lottery.expanded ? '4px 4px 0 0' : '4px'
                  }}
                >
                  {lottery.lotteryName} ({lottery.timezone.toUpperCase()})
                </AccordionSummary>

                <AccordionDetails sx={{ p: 3, bgcolor: '#fafafa' }}>
                  {/* Sorteos de esta lotería */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {lottery.draws.map(draw => (
                      <DrawScheduleCard
                        key={draw.drawId}
                        draw={draw}
                        onScheduleChange={(dayKey, field, value) =>
                          handleScheduleChange(lottery.lotteryId, draw.drawId, dayKey, field, value)
                        }
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Botón Actualizar */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleSaveAll}
              disabled={saving}
              sx={{
                bgcolor: '#51cbce',
                '&:hover': { bgcolor: '#45b8bb' },
                color: 'white',
                fontSize: '16px',
                textTransform: 'uppercase',
                fontWeight: 600,
                px: 6,
                py: 1.5
              }}
            >
              {saving ? 'Guardando...' : 'Actualizar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DrawSchedules;
```

---

### Componente DrawScheduleCard

```jsx
// frontend-v2/src/components/features/draws/DrawSchedules/DrawScheduleCard.jsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Avatar
} from '@mui/material';
import WeeklyScheduleInput from './WeeklyScheduleInput';

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const DrawScheduleCard = ({ draw, onScheduleChange }) => {
  return (
    <Card sx={{ boxShadow: 2 }}>
      <CardContent>
        {/* Header del sorteo */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Avatar
              src={draw.logoUrl}
              alt={draw.drawName}
              sx={{ width: 60, height: 60 }}
            />
          </Grid>
          <Grid item xs>
            <TextField
              label="Nombre"
              value={draw.drawName}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
              sx={{ mb: 1 }}
            />
            <TextField
              label="Abreviación"
              value={draw.abbreviation}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '12px', color: '#666' }}>
                Color
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: draw.color,
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  mt: 0.5
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Separador */}
        <Box sx={{ borderTop: '1px solid #ddd', mb: 2 }} />

        {/* Horarios semanales */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {DAYS.map(day => (
            <WeeklyScheduleInput
              key={day.key}
              dayKey={day.key}
              dayLabel={day.label}
              schedule={draw.weeklySchedule[day.key]}
              onChange={onScheduleChange}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DrawScheduleCard;
```

---

### Componente WeeklyScheduleInput

```jsx
// frontend-v2/src/components/features/draws/DrawSchedules/WeeklyScheduleInput.jsx
import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

const WeeklyScheduleInput = ({ dayKey, dayLabel, schedule, onChange }) => {
  const handleChange = (field, value) => {
    onChange(dayKey, field, value);
  };

  const handleDelete = () => {
    onChange(dayKey, 'enabled', false);
  };

  if (!schedule.enabled) {
    return null; // No mostrar si está deshabilitado
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1,
        px: 2,
        bgcolor: '#f9f9f9',
        borderRadius: '4px'
      }}
    >
      {/* Día de la semana */}
      <Typography
        sx={{
          minWidth: '90px',
          fontSize: '13px',
          color: '#666',
          fontWeight: 500
        }}
      >
        {dayLabel}
      </Typography>

      {/* Hora inicio */}
      <TextField
        type="time"
        value={schedule.startTime}
        onChange={(e) => handleChange('startTime', e.target.value)}
        size="small"
        InputProps={{
          sx: { fontSize: '13px' }
        }}
        sx={{ width: '130px' }}
      />

      {/* Flecha */}
      <ArrowIcon sx={{ color: '#999', fontSize: '20px' }} />

      {/* Hora cierre */}
      <TextField
        type="time"
        value={schedule.endTime}
        onChange={(e) => handleChange('endTime', e.target.value)}
        size="small"
        InputProps={{
          sx: { fontSize: '13px' }
        }}
        sx={{ width: '130px' }}
      />

      {/* Botón eliminar */}
      <IconButton
        size="small"
        onClick={handleDelete}
        sx={{
          ml: 'auto',
          color: '#999',
          '&:hover': { color: '#d32f2f' }
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default WeeklyScheduleInput;
```

---

## 🔌 API Integration

### Backend Endpoints Necesarios

```http
GET /api/draws/schedules
GET /api/draws/schedules?lotteryId=1
PATCH /api/draws/schedules
```

### Respuesta GET /api/draws/schedules

```json
{
  "success": true,
  "data": [
    {
      "drawId": 1,
      "drawName": "GANA MAS",
      "abbreviation": "GM",
      "lotteryId": 20,
      "lotteryName": "LOTERIA NACIONAL",
      "timezone": "America/Santo_Domingo",
      "color": "#ff6b6b",
      "logoUrl": "https://s3.amazonaws.com/...",
      "weeklySchedule": {
        "monday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "tuesday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "wednesday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "thursday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "friday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "saturday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "sunday": { "startTime": "00:00", "endTime": "14:34", "enabled": true }
      }
    }
  ]
}
```

### Request PATCH /api/draws/schedules

```json
{
  "schedules": [
    {
      "drawId": 1,
      "weeklySchedule": {
        "monday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "tuesday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "wednesday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "thursday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "friday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "saturday": { "startTime": "00:00", "endTime": "14:34", "enabled": true },
        "sunday": { "startTime": "00:00", "endTime": "14:34", "enabled": true }
      }
    }
  ]
}
```

---

## ✅ Validaciones Frontend

### Validación de Tiempos

```javascript
const validateSchedule = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  if (end <= start) {
    return 'La hora de cierre debe ser posterior a la hora de inicio';
  }

  return null;
};
```

### Validación antes de guardar

```javascript
const handleSaveAll = async () => {
  // Validar todos los horarios
  const errors = [];

  lotteries.forEach(lottery => {
    lottery.draws.forEach(draw => {
      Object.entries(draw.weeklySchedule).forEach(([day, schedule]) => {
        if (schedule.enabled) {
          const error = validateSchedule(schedule.startTime, schedule.endTime);
          if (error) {
            errors.push(`${draw.drawName} - ${day}: ${error}`);
          }
        }
      });
    });
  });

  if (errors.length > 0) {
    setError(errors.join('\n'));
    return;
  }

  // Continuar con guardado...
};
```

---

## 🎨 Utilidades de Formato

### Convertir formato 24h a 12h con AM/PM

```javascript
// utils/timeFormatters.js
export const formatTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
};

// Ejemplo: "14:34" → "02:34 PM"
```

### Convertir formato 12h a 24h

```javascript
export const formatTo24Hour = (time12) => {
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours, 10);

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

// Ejemplo: "02:34 PM" → "14:34"
```

---

## 📋 Checklist de Implementación

### Backend
- [ ] Crear tabla `draw_weekly_schedules`
- [ ] Endpoint GET `/api/draws/schedules`
- [ ] Endpoint PATCH `/api/draws/schedules`
- [ ] Migrar datos existentes
- [ ] Validaciones de horarios
- [ ] Tests unitarios

### Frontend
- [ ] Componente `DrawScheduleCard`
- [ ] Componente `WeeklyScheduleInput`
- [ ] Actualizar `DrawSchedules/index.jsx`
- [ ] Utilidades de formato de tiempo
- [ ] Validaciones frontend
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Tests E2E con Playwright

### Integración
- [ ] Conectar frontend con API
- [ ] Manejo de estados de carga
- [ ] Manejo de errores de red
- [ ] Confirmaciones de guardado
- [ ] Recargar datos después de guardar

---

## 🚀 Plan de Implementación

### Fase 1: Backend (1-2 días)
1. Crear tabla SQL
2. Crear DTOs
3. Implementar endpoints
4. Tests

### Fase 2: Frontend Básico (1 día)
1. Crear componentes base
2. Estructura de estado
3. UI mockup con datos hardcoded

### Fase 3: Integración (1 día)
1. Conectar con API
2. Manejo de estados
3. Validaciones

### Fase 4: Pulido (1 día)
1. Mejoras UI/UX
2. Tests E2E
3. Documentación

**Total estimado:** 4-5 días

---

## 💡 Mejoras Futuras

1. **Copiar horarios:** Botón para copiar horarios de un día a todos
2. **Plantillas:** Guardar configuraciones comunes
3. **Bulk edit:** Editar múltiples sorteos a la vez
4. **Vista calendario:** Visualizar horarios en formato calendario
5. **Historial:** Ver cambios anteriores de horarios
6. **Notificaciones:** Alertar cuando se acerca hora de cierre

---

## 📚 Referencias

- Análisis completo: `docs/SORTEO_SCHEDULES_ANALYSIS.md`
- Componente actual: `frontend-v2/src/components/features/draws/DrawSchedules/index.jsx`
- Sistema de diseño: `DESIGN_SYSTEM.md`

---

**Creado:** 2025-11-24
**Autor:** Claude Code
**Versión:** 1.0
**Estado:** Listo para implementar
