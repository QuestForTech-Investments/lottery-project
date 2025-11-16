# Resumen Ejecutivo: Sistema de Gestión de Sorteos y Tipos de Premios

**Proyecto:** Lottery Management System B2B2C
**Fecha:** 2025-11-06
**Preparado por:** React Performance Optimizer Agent

---

## TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Estado Actual vs. Estado Propuesto](#estado-actual-vs-estado-propuesto)
3. [Arquitectura Propuesta](#arquitectura-propuesta)
4. [Roadmap de Implementación](#roadmap-de-implementación)
5. [Recursos Necesarios](#recursos-necesarios)
6. [Riesgos y Mitigaciones](#riesgos-y-mitigaciones)
7. [Criterios de Éxito](#criterios-de-éxito)
8. [Próximos Pasos Inmediatos](#próximos-pasos-inmediatos)

---

## VISIÓN GENERAL

### Problema Actual

El sistema de gestión de loterías tiene dos limitaciones críticas:

1. **No existe interfaz para crear/editar sorteos (draws)**
   - Los sorteos están hardcoded en el código
   - Imposible agregar nuevos sorteos sin deployment
   - No se pueden modificar horarios o propiedades

2. **Falta configuración granular de premios por sorteo**
   - Los tipos de premio (bet_types) se heredan de la lotería
   - No hay forma de activar/desactivar tipos específicos por sorteo
   - Imposible copiar configuraciones entre sorteos similares

### Solución Propuesta

Implementar dos funcionalidades integradas:

1. **CRUD completo de Sorteos**
   - Crear, editar, activar/desactivar sorteos
   - Validación de horarios duplicados
   - Interfaz intuitiva con filtros avanzados

2. **Configurador de Tipos de Premio por Sorteo**
   - Activar/desactivar tipos individuales
   - Copiar configuración entre sorteos
   - Herencia automática desde la lotería

### Impacto en el Negocio

- **Agilidad:** Nuevos sorteos en minutos (vs. horas de development)
- **Flexibilidad:** Configuración personalizada por sorteo
- **Calidad:** Menos errores por cambios manuales en código
- **Escalabilidad:** Soporte para 200+ sorteos sin degradación

---

## ESTADO ACTUAL VS. ESTADO PROPUESTO

### ANTES

```
┌────────────────────────────────────────────────────────┐
│ SISTEMA ACTUAL                                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Sorteos (draws):                                       │
│ ✗ Hardcoded en SorteosTab.jsx                         │
│ ✗ Cambios requieren deployment                        │
│ ✗ Sin validación de duplicados                        │
│ ✗ Backend existe pero NO hay UI                       │
│                                                        │
│ Tipos de Premio:                                       │
│ ✗ Solo herencia desde lotería                         │
│ ✗ No se pueden desactivar tipos por sorteo            │
│ ✗ Sin opción de copiar entre sorteos                  │
│                                                        │
│ TIEMPO para agregar sorteo: 2-4 horas                 │
│ ERRORES potenciales: ALTO (cambios manuales)          │
└────────────────────────────────────────────────────────┘
```

### DESPUÉS

```
┌────────────────────────────────────────────────────────┐
│ SISTEMA PROPUESTO                                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Sorteos (draws):                                       │
│ ✓ UI completa: DrawsList + DrawModal                  │
│ ✓ CRUD en tiempo real                                 │
│ ✓ Validación automática de duplicados                 │
│ ✓ Filtros: lotería, estado, búsqueda                  │
│ ✓ Paginación para 200+ sorteos                        │
│                                                        │
│ Tipos de Premio:                                       │
│ ✓ Configuración granular por sorteo                   │
│ ✓ Toggle individual de bet_types                      │
│ ✓ Copiar config entre sorteos                         │
│ ✓ Herencia automática + override manual               │
│                                                        │
│ TIEMPO para agregar sorteo: 2-5 minutos               │
│ ERRORES potenciales: BAJO (validaciones automáticas)  │
└────────────────────────────────────────────────────────┘
```

---

## ARQUITECTURA PROPUESTA

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  /draws                                                         │
│  ├── DrawsList/                  (Vista principal)             │
│  │   ├── index.jsx                                             │
│  │   ├── DrawsTable.jsx           (Tabla con acciones)         │
│  │   ├── DrawsFilters.jsx         (Filtros avanzados)          │
│  │   └── hooks/                                                │
│  │       └── useDrawsList.js      (Estado + lógica)            │
│  │                                                              │
│  ├── DrawModal/                   (Crear/Editar sorteo)        │
│  │   ├── index.jsx                                             │
│  │   └── hooks/                                                │
│  │       └── useDrawModal.js                                   │
│  │                                                              │
│  └── DrawForm/                    (Config de premios)          │
│      ├── DrawFormFields.jsx                                    │
│      ├── DrawBetTypesConfig.jsx   (Tipos de premio)            │
│      └── hooks/                                                │
│          ├── useDrawForm.js                                    │
│          └── useDrawBetTypes.js   (Gestión bet_types)          │
│                                                                 │
│  SERVICIOS:                                                     │
│  └── drawService.js               (API calls)                  │
│      ├── getAllDraws()                                         │
│      ├── createDraw()                                          │
│      ├── updateDraw()                                          │
│      ├── getDrawBetTypes()                                     │
│      ├── updateDrawBetTypes()                                  │
│      └── copyDrawBetTypesConfig()                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (.NET Core 8)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CONTROLLERS:                                                   │
│  ├── DrawsController.cs           (✅ YA EXISTE)                │
│  │   ├── GET    /api/draws                                     │
│  │   ├── GET    /api/draws/{id}                                │
│  │   ├── POST   /api/draws                                     │
│  │   ├── PUT    /api/draws/{id}                                │
│  │   └── DELETE /api/draws/{id}                                │
│  │                                                              │
│  └── DrawBetTypeConfigController.cs  (⚠️ NUEVO)                │
│      ├── GET    /api/draws/{id}/bet-types                      │
│      ├── GET    /api/draws/{id}/available-bet-types            │
│      ├── PUT    /api/draws/{id}/bet-types                      │
│      └── POST   /api/draws/{id}/bet-types/copy                 │
│                                                                 │
│  STORED PROCEDURES:                                             │
│  ├── sp_CreateDrawWithBetTypes    (Auto-herencia)              │
│  └── sp_CopyDrawBetTypeConfig     (Copiar config)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (Azure SQL Server)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TABLAS EXISTENTES:                                             │
│  ├── lotteries                    (69 registros)               │
│  ├── draws                         (116 registros)              │
│  ├── bet_types                     (33 registros)               │
│  └── lottery_bet_type_compatibility (275 registros)            │
│                                                                 │
│  TABLA NUEVA:                                                   │
│  └── draw_bet_type_config         (⚠️ A CREAR)                 │
│      ├── config_id (PK)                                        │
│      ├── draw_id (FK → draws)                                  │
│      ├── bet_type_id (FK → bet_types)                          │
│      ├── is_active                                             │
│      ├── custom_multiplier                                     │
│      └── display_order                                         │
│                                                                 │
│  RELACIONES:                                                    │
│  lotteries (1) ←→ (N) draws                                    │
│  lotteries (N) ←→ (N) bet_types  (via lottery_bet_type_compat)│
│  draws (1) ←→ (N) draw_bet_type_config                         │
│  bet_types (1) ←→ (N) draw_bet_type_config                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
CREAR SORTEO:
───────────────
Usuario → DrawModal → drawService.createDraw()
  ↓
Backend: DrawsController.Create()
  ↓
SQL: INSERT INTO draws + sp_CreateDrawWithBetTypes
  ↓
Auto-populate: draw_bet_type_config (hereda de lottery_bet_type_compatibility)
  ↓
Response → Frontend actualiza lista


CONFIGURAR TIPOS DE PREMIO:
────────────────────────────
Usuario → DrawBetTypesConfig → useDrawBetTypes.saveBetTypes()
  ↓
Backend: DrawBetTypeConfigController.Update()
  ↓
Validación: ¿Hay tickets activos con tipos a desactivar?
  ├─ SÍ → Error 400 (bloqueo)
  └─ NO → UPDATE draw_bet_type_config
  ↓
Response → Frontend actualiza estado


COPIAR CONFIGURACIÓN:
──────────────────────
Usuario selecciona sorteo origen → copyFromDraw()
  ↓
Backend: DrawBetTypeConfigController.Copy()
  ↓
Validación: Ambos sorteos de la misma lotería
  ↓
SQL: sp_CopyDrawBetTypeConfig
  ├─ DELETE config actual del sorteo destino
  └─ INSERT config copiada del sorteo origen
  ↓
Response → Frontend recarga bet_types
```

---

## ROADMAP DE IMPLEMENTACIÓN

### FASE 1: Backend API (Prioridad: CRÍTICA)
**Duración:** 2-3 días
**Responsable:** Backend Developer

**Tareas:**

1. **Crear tabla `draw_bet_type_config`**
   - [x] Escribir script SQL de migración
   - [ ] Ejecutar en base de datos de desarrollo
   - [ ] Verificar constraints y foreign keys
   - [ ] Ejecutar en staging
   - [ ] Ejecutar en producción

2. **Crear stored procedures**
   - [ ] `sp_CreateDrawWithBetTypes` - Auto-herencia
   - [ ] `sp_CopyDrawBetTypeConfig` - Copiar config

3. **Implementar `DrawBetTypeConfigController.cs`**
   - [ ] Endpoint: GET /api/draws/{id}/bet-types
   - [ ] Endpoint: GET /api/draws/{id}/available-bet-types
   - [ ] Endpoint: PUT /api/draws/{id}/bet-types
   - [ ] Endpoint: POST /api/draws/{id}/bet-types/copy
   - [ ] DTOs: DrawBetTypeDto, UpdateDrawBetTypesRequest, etc.
   - [ ] Validaciones: tickets activos, misma lotería

4. **Testing Backend**
   - [ ] Unit tests para controller (10+ tests)
   - [ ] Integration tests con base de datos
   - [ ] Test de validaciones (tickets activos)
   - [ ] Test de stored procedures

**Entregables:**
- ✅ Script SQL: `create_draw_bet_type_config.sql`
- ⬜ Controller: `DrawBetTypeConfigController.cs`
- ⬜ Tests: `DrawBetTypeConfigControllerTests.cs`
- ⬜ Swagger actualizado

**Criterios de Aceptación:**
- Todos los endpoints responden correctamente
- Validaciones funcionan (bloqueo de tickets activos)
- Coverage de tests >= 80%
- Documentación Swagger completa

---

### FASE 2: Frontend - Servicios y Hooks (Prioridad: CRÍTICA)
**Duración:** 1-2 días
**Responsable:** Frontend Developer

**Tareas:**

1. **Crear `drawService.js`**
   - [ ] getAllDraws(params) - Con paginación
   - [ ] getDrawById(id)
   - [ ] getDrawsByLottery(lotteryId)
   - [ ] createDraw(drawData)
   - [ ] updateDraw(id, drawData)
   - [ ] deleteDraw(id)
   - [ ] getDrawBetTypes(drawId)
   - [ ] updateDrawBetTypes(drawId, betTypeIds)
   - [ ] copyDrawBetTypesConfig(sourceDrawId, targetDrawId)

2. **Crear hooks personalizados**
   - [ ] `useDrawsList.js` - Estado de lista, filtros, paginación
   - [ ] `useDrawForm.js` - Formulario crear/editar
   - [ ] `useDrawBetTypes.js` - Gestión de tipos de premio

3. **Testing de servicios y hooks**
   - [ ] Unit tests para drawService (8+ tests)
   - [ ] Unit tests para useDrawsList (5+ tests)
   - [ ] Unit tests para useDrawForm (6+ tests)
   - [ ] Unit tests para useDrawBetTypes (8+ tests)

**Entregables:**
- ⬜ `/src/services/drawService.js`
- ⬜ `/src/components/features/draws/DrawsList/hooks/useDrawsList.js`
- ⬜ `/src/components/features/draws/DrawForm/hooks/useDrawForm.js`
- ⬜ `/src/components/features/draws/DrawForm/hooks/useDrawBetTypes.js`
- ⬜ Tests: `__tests__/*.test.js`

**Criterios de Aceptación:**
- Todos los servicios consumen API correctamente
- Hooks manejan estado sin errores
- Coverage de tests >= 75%
- No memory leaks

---

### FASE 3: Frontend - Componentes UI (Prioridad: ALTA)
**Duración:** 2-3 días
**Responsable:** Frontend Developer

**Tareas:**

1. **DrawsList/** (Vista principal)
   - [ ] `index.jsx` - Componente principal
   - [ ] `DrawsTable.jsx` - Tabla con acciones (ver/editar/eliminar)
   - [ ] `DrawsFilters.jsx` - Filtros avanzados
   - [ ] Integración con `useDrawsList` hook

2. **DrawModal/** (Modal crear/editar)
   - [ ] `index.jsx` - Modal reutilizable
   - [ ] Formulario con validaciones
   - [ ] Integración con `useDrawForm` hook

3. **DrawForm/** (Config de premios)
   - [ ] `DrawFormFields.jsx` - Campos del formulario
   - [ ] `DrawBetTypesConfig.jsx` - Configurador de tipos de premio
   - [ ] Integración con `useDrawBetTypes` hook

4. **Componentes comunes**
   - [ ] `LotterySelector.jsx` - Selector de loterías
   - [ ] `TimeRangePicker.jsx` - Selector de horarios (opcional)

5. **Estilos y responsividad**
   - [ ] Material-UI consistency
   - [ ] Responsive design (mobile, tablet, desktop)
   - [ ] Accessibility (ARIA labels, keyboard navigation)

**Entregables:**
- ⬜ 8 archivos .jsx
- ⬜ Componentes con React.memo optimizados
- ⬜ Storybook stories (opcional)

**Criterios de Aceptación:**
- UI consistente con resto del sistema
- Responsive en todos los dispositivos
- Performance: <100ms render time
- Accessibility score >= 90%

---

### FASE 4: Integración y Testing (Prioridad: ALTA)
**Duración:** 2 días
**Responsable:** QA + Developer

**Tareas:**

1. **Testing end-to-end**
   - [ ] Playwright: Crear sorteo completo
   - [ ] Playwright: Editar sorteo existente
   - [ ] Playwright: Eliminar sorteo
   - [ ] Playwright: Configurar tipos de premio
   - [ ] Playwright: Copiar configuración entre sorteos

2. **Testing de validaciones**
   - [ ] Horarios duplicados (warning)
   - [ ] Tickets activos (bloqueo)
   - [ ] Formulario incompleto
   - [ ] Copiar entre loterias diferentes (error)

3. **Testing de performance**
   - [ ] 100+ sorteos en lista
   - [ ] Búsqueda y filtros (debounce)
   - [ ] Paginación
   - [ ] Memory profiling

4. **Testing de UX**
   - [ ] Mensajes de error claros
   - [ ] Loading states apropiados
   - [ ] Success feedback visible
   - [ ] Confirmación antes de eliminar

**Entregables:**
- ⬜ 12+ tests E2E en Playwright
- ⬜ Checklist de QA completo
- ⬜ Bug tracking en GitHub Issues
- ⬜ Performance report

**Criterios de Aceptación:**
- 0 bugs críticos
- Performance score >= 90
- Todos los flujos E2E pasan
- Loading time < 2 segundos

---

### FASE 5: Documentación y Deployment (Prioridad: MEDIA)
**Duración:** 1 día
**Responsable:** Tech Lead

**Tareas:**

1. **Documentación de usuario**
   - [ ] README: Cómo usar la funcionalidad
   - [ ] Screenshots de UI
   - [ ] Video tutorial (opcional)

2. **Documentación técnica**
   - [ ] Swagger annotations completas
   - [ ] Postman collection actualizada
   - [ ] ER diagram actualizado
   - [ ] JSDoc en todos los hooks

3. **Deployment**
   - [ ] Code review y merge a `main`
   - [ ] Deploy backend a staging
   - [ ] Deploy frontend a staging
   - [ ] Smoke tests en staging
   - [ ] Deploy a producción

4. **Rollback plan**
   - [ ] Documentar procedimiento de rollback
   - [ ] Backup de base de datos antes de migración
   - [ ] Feature flag para habilitar/deshabilitar (opcional)

**Entregables:**
- ⬜ `/docs/DRAWS_MANAGEMENT_USER_GUIDE.md`
- ⬜ `/docs/API_DRAWS_ENDPOINTS.md`
- ⬜ Postman collection actualizado
- ⬜ Deployment checklist

**Criterios de Aceptación:**
- Documentación completa y clara
- Deployment exitoso sin downtime
- Rollback plan probado

---

## RECURSOS NECESARIOS

### Equipo

| Rol | Responsabilidad | Tiempo Estimado |
|-----|----------------|-----------------|
| **Backend Developer** | Fase 1: API, stored procedures, tests | 2-3 días |
| **Frontend Developer** | Fase 2 y 3: Servicios, hooks, UI | 3-5 días |
| **QA Engineer** | Fase 4: Testing E2E, validaciones | 2 días |
| **Tech Lead** | Fase 5: Docs, deployment, code review | 1 día |

**Total:** 8-11 días de desarrollo

### Infraestructura

- **Base de datos:**
  - Azure SQL Server (existente)
  - 1 nueva tabla: `draw_bet_type_config`
  - 2 nuevos stored procedures

- **Backend:**
  - 1 nuevo controller
  - 4 nuevos endpoints
  - 5 nuevos DTOs

- **Frontend:**
  - 12 nuevos archivos (componentes + hooks)
  - 1 nuevo servicio
  - 25+ tests unitarios

### Herramientas

- **Development:**
  - Visual Studio Code
  - Azure Data Studio / SSMS
  - Postman / Swagger

- **Testing:**
  - Jest (unit tests)
  - React Testing Library
  - Playwright (E2E)

- **Deployment:**
  - GitHub Actions (CI/CD)
  - Azure DevOps

---

## RIESGOS Y MITIGACIONES

### RIESGO 1: Validación de Tickets Activos
**Nivel:** ALTO
**Impacto:** Bloqueo al desactivar bet_types con apuestas activas

**Mitigación:**
- Implementar validación robusta en backend
- Mostrar mensajes claros en UI
- Permitir forzar desactivación solo para admins (opcional)
- Agregar feature flag para habilitar/deshabilitar validación

### RIESGO 2: Performance con 100+ Sorteos
**Nivel:** MEDIO
**Impacto:** UI lenta, timeouts en API

**Mitigación:**
- Paginación real en backend (no virtual scroll)
- Índices en tabla `draws` por `lottery_id` y `is_active`
- Debounce en búsqueda (300ms)
- Cache de loterías en localStorage
- Lazy loading de detalles

### RIESGO 3: Horarios Duplicados
**Nivel:** BAJO
**Impacto:** Confusión al tener múltiples sorteos a la misma hora

**Mitigación:**
- Warning en UI (no bloqueante)
- Permitir duplicados pero mostrar claramente
- Sugerir horarios alternativos
- Validación opcional configurable

### RIESGO 4: Migración de Datos
**Nivel:** MEDIO
**Impacto:** Pérdida de datos si migración falla

**Mitigación:**
- Backup completo de base de datos antes de migración
- Script SQL idempotente (puede ejecutarse múltiples veces)
- Rollback plan documentado
- Testing exhaustivo en staging antes de producción

### RIESGO 5: Breaking Changes en Frontend
**Nivel:** BAJO
**Impacto:** SorteosTab existente puede tener conflictos

**Mitigación:**
- No modificar SorteosTab inicialmente
- Crear nueva ruta `/draws-management`
- Migración gradual después de estabilidad
- Feature flag para habilitar nueva UI

---

## CRITERIOS DE ÉXITO

### Métricas Técnicas

| Métrica | Target | Método de Medición |
|---------|--------|-------------------|
| **Backend Coverage** | >= 80% | Unit tests + integration tests |
| **Frontend Coverage** | >= 75% | Jest + React Testing Library |
| **E2E Tests** | 100% pass | Playwright suite completo |
| **Performance (API)** | < 200ms | GET /api/draws response time |
| **Performance (UI)** | < 100ms | Render time de DrawsList |
| **Bundle Size** | < 50KB | Impact de nuevos componentes |
| **Memory Leaks** | 0 | Chrome DevTools profiling |

### Métricas de Negocio

| Métrica | Target | Método de Medición |
|---------|--------|-------------------|
| **Tiempo de creación de sorteo** | < 3 min | Time tracking en producción |
| **Errores por sorteo creado** | < 5% | Error tracking + logging |
| **Adopción de usuarios** | >= 80% | Analytics (usuarios activos) |
| **Satisfacción de usuario** | >= 4/5 | Survey post-implementación |

### Métricas de Calidad

- **0 bugs críticos** en producción
- **0 downtime** durante deployment
- **100% documentación** completa
- **Código revisado** por al menos 1 desarrollador senior

---

## PRÓXIMOS PASOS INMEDIATOS

### Semana 1: Preparación y Backend

**Lunes:**
- [x] Revisar y aprobar este documento
- [ ] Crear branch: `feature/draw-management`
- [ ] Crear issues en GitHub para tracking
- [ ] Asignar recursos (backend developer)

**Martes-Miércoles:**
- [ ] Ejecutar migración SQL en desarrollo
- [ ] Implementar `DrawBetTypeConfigController.cs`
- [ ] Escribir unit tests para controller
- [ ] Code review de backend

**Jueves-Viernes:**
- [ ] Testing de integración backend
- [ ] Deploy a staging
- [ ] Smoke tests en staging
- [ ] Documentar Swagger

---

### Semana 2: Frontend y Testing

**Lunes-Martes:**
- [ ] Implementar `drawService.js`
- [ ] Implementar hooks: `useDrawsList`, `useDrawForm`, `useDrawBetTypes`
- [ ] Unit tests para servicios y hooks

**Miércoles-Jueves:**
- [ ] Implementar componentes UI: DrawsList, DrawModal, DrawBetTypesConfig
- [ ] Integración de componentes con hooks
- [ ] Testing de componentes

**Viernes:**
- [ ] Testing E2E con Playwright
- [ ] Performance profiling
- [ ] Bug fixing

---

### Semana 3: Documentación y Deploy

**Lunes:**
- [ ] Documentación de usuario
- [ ] Documentación técnica
- [ ] Actualizar Postman collection

**Martes:**
- [ ] Code review final
- [ ] Merge a `main`
- [ ] Deploy a staging

**Miércoles:**
- [ ] Smoke tests en staging
- [ ] User acceptance testing (UAT)

**Jueves:**
- [ ] Deploy a producción
- [ ] Monitoring post-deploy

**Viernes:**
- [ ] Retrospectiva del proyecto
- [ ] Documentar lecciones aprendidas

---

## CONTACTO Y APROBACIONES

### Equipo de Desarrollo

| Rol | Nombre | Email |
|-----|--------|-------|
| Tech Lead | [TBD] | tech.lead@lottery.com |
| Backend Developer | [TBD] | backend.dev@lottery.com |
| Frontend Developer | [TBD] | frontend.dev@lottery.com |
| QA Engineer | [TBD] | qa@lottery.com |

### Aprobaciones Necesarias

- [ ] **Tech Lead** - Arquitectura propuesta
- [ ] **Product Owner** - Funcionalidades y UX
- [ ] **DevOps** - Plan de deployment
- [ ] **QA Lead** - Plan de testing

---

## ANEXOS

### Documentos Relacionados

1. **ANALISIS_ARQUITECTURA_DRAWS_MANAGEMENT.md**
   - Análisis detallado del código existente
   - Propuesta de arquitectura completa
   - Flujos de usuario (UX)
   - Consideraciones especiales

2. **CODIGO_EJEMPLO_DRAWS_MANAGEMENT.md**
   - Script SQL completo con migración
   - Controller C# completo
   - Componentes React completos
   - Tests unitarios de ejemplo

### Referencias Técnicas

- **Database Schema:** `/Lottery-Database/docs/database_schema_documentation.md`
- **API Documentation:** `/Lottery-Apis/CLAUDE.md`
- **Frontend Patterns:** `/LottoWebApp/docs/PLAN_REFACTORIZACION_FRONTEND.md`

---

**Fin del documento**

*Preparado por: React Performance Optimizer Agent*
*Fecha: 2025-11-06*
*Versión: 1.0*

---

## APROBACIONES

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Tech Lead | __________ | __________ | ___/___/___ |
| Product Owner | __________ | __________ | ___/___/___ |
| DevOps | __________ | __________ | ___/___/___ |
| QA Lead | __________ | __________ | ___/___/___ |
