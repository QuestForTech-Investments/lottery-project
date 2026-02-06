# Roadmap - Lottery System

## Visión General
Sistema de 23 módulos identificados. Progreso actual: ~65% completado.

---

## Fase 1: Core Business ✅ COMPLETADO
**Objetivo:** Funcionalidad básica de ventas y reportes

### Módulos:
- [x] Dashboard (Inicio)
- [x] Ventas (7 subsecciones)
- [x] Tickets (8 subsecciones)
- [x] Resultados
- [x] Balances (4 tipos)

---

## Fase 2: Gestión Financiera ✅ COMPLETADO
**Objetivo:** Control de dinero y transacciones

### Módulos:
- [x] Cobros / Pagos
- [x] Transacciones (6 subsecciones)
- [x] Préstamos

---

## Fase 3: Configuración de Bancas 🟡 EN PROGRESO
**Objetivo:** CRUD completo de bancas y configuración

### Módulos:
- [x] Lista de bancas
- [x] Crear banca (con comisiones - FIX 2026-02-06)
- [x] Editar banca (premios, comisiones, horarios, sorteos)
- [ ] Edición masiva de bancas
- [x] Horarios de sorteos (DrawSchedules)

### Bugs corregidos:
- [x] Comisiones no se guardaban al crear banca (b3b2dcd)
- [x] Autocompletado de navegador en formularios
- [x] Creación automática de usuario POS

---

## Fase 4: Límites y Control ❌ PENDIENTE
**Objetivo:** Control de apuestas y límites

### Módulos:
- [ ] Límites (lista, crear, automáticos)
- [ ] Números calientes
- [ ] Excedentes (manejar, reporte)

---

## Fase 5: Usuarios y Permisos 🟡 PARCIAL
**Objetivo:** Gestión completa de usuarios

### Módulos:
- [x] Lista de usuarios por banca
- [x] Cambio de contraseña
- [ ] Crear usuario (UI existe, revisar)
- [ ] Editar usuario
- [ ] Permisos granulares

---

## Fase 6: Operaciones ❌ PENDIENTE
**Objetivo:** Gestión operativa diaria

### Módulos:
- [ ] Cobradores
- [ ] Manejo de cobradores
- [ ] Agentes externos (CRUD)
- [ ] Monitor F8 (tiempo real)

---

## Fase 7: Configuración Global ❌ PENDIENTE
**Objetivo:** Administración del sistema

### Módulos:
- [ ] Zonas (CRUD completo)
- [ ] Sorteos (CRUD global)
- [ ] Mi Grupo (configuración)
- [ ] Entidades contables
- [ ] Notificaciones
- [ ] Receptores de correo

---

## Priorización Actual

| Prioridad | Módulo | Estado |
|-----------|--------|--------|
| ALTA | Crear Ticket (TPV) | En análisis |
| ALTA | Monitor F8 | Pendiente |
| MEDIA | Límites | Pendiente |
| MEDIA | Excedentes | Issues creados |
| BAJA | Mi Grupo | Pendiente |

---

**Última actualización:** 2026-02-06
