# Historial de Fixes y Cambios

Este archivo contiene el historial detallado de fixes, implementaciones y cambios realizados en el proyecto.

> **Nota:** Este archivo se separó de CLAUDE.md para mantenerlo conciso. Para instrucciones actuales, ver [CLAUDE.md](../CLAUDE.md).

---

## Índice

- [2025-11-20](#2025-11-20)
- [2025-11-19](#2025-11-19)
- [2025-11-18](#2025-11-18)
- [2025-11-16](#2025-11-16)
- [2025-11-14](#2025-11-14)

---

## 2025-11-20

### Implementación: Advanced Betting Form (Formulario Avanzado de Apuestas)

**Objetivo:** Migrar el sistema de apuestas de la aplicación Vue.js original a React + Material-UI, replicando el formulario keyboard-driven con detección automática de tipos de apuesta.

**Archivos Creados:**
- `frontend-v2/src/hooks/useBetDetection.js` (427 líneas) - Detección automática de 21+ tipos
- `frontend-v2/src/hooks/useKeyboardShortcuts.js` (82 líneas) - Atajos de teclado
- `frontend-v2/src/utils/betGenerators.js` (159 líneas) - Generadores de combinaciones
- `frontend-v2/src/components/features/tickets/BetSection.jsx` (118 líneas)
- `frontend-v2/src/components/features/tickets/CreateTicketsAdvanced.jsx` (669 líneas)

**Características:**
- Grid de sorteos clickeable con chips turquesa (#51cbce)
- Detección automática de tipos sin dropdowns
- 5 generadores automáticos: `q`, `.`, `d`, `-10`, `+xyz`
- Keyboard-driven (ENTER avanza entre campos)
- 4 secciones de agrupación con totales

**Lección Aprendida:** Custom hooks permiten reutilizar lógica compleja. useMemo es crítico para evitar re-cálculos.

---

## 2025-11-19

### Fix: Route Mismatch for Entidades Contables in V2

**Problema:** Componente no cargaba, mostraba "Cargando..." indefinidamente.

**Causa:** menuItems.js usaba `/entities/list`, App.jsx tenía `/accountable-entities`.

**Solución:** Corregido path en App.jsx:
```javascript
// DESPUÉS (correcto)
<Route path="/entities/list" element={<AccountableEntitiesMUI />} />
```

**Lección:** SIEMPRE verificar que paths en App.jsx coincidan EXACTAMENTE con menuItems.js.

---

### Fix: Missing Create Accountable Entity Component

**Problema:** Opción "Crear" en menú no tenía componente.

**Archivos Creados:**
- `frontend-v1/src/components/entidades/CreateAccountableEntity.jsx`
- `frontend-v2/src/components/features/accountable-entities/CreateAccountableEntity/index.jsx`

**Lección:** Al implementar módulo con menú, verificar TODAS las opciones del submenú.

---

### Fix: Color Coherence in V2 Loans and Excesses Modules

**Problema:** Botones no mantenían coherencia de colores.

**Solución:** Estandarización a:
```javascript
sx={{
  bgcolor: '#51cbce',
  '&:hover': { bgcolor: '#45b8bb' },
  color: 'white',
  textTransform: 'none',
}}
```

**Archivos:** CreateLoan, LoansList, ManageExcesses, ExcessesReport

---

### Análisis: Mapeo de API Endpoints Vue.js Original

**Resultado:** 13+ endpoints documentados en `docs/API_ENDPOINTS_MAPPING.md`

**Patrones observados:**
- API Base URL: `https://api.lotocompany.com/api/v1/`
- Autenticación: Bearer token
- Paginación: `{ items, pageNumber, pageSize, totalCount }`

---

### Propuesta: TicketsController en API .NET

**Documento creado:** `docs/TICKETS_CONTROLLER_IMPLEMENTATION.md`

**Endpoints propuestos:**
- `GET /api/tickets/params/create`
- `POST /api/tickets`
- `GET /api/tickets`
- `GET /api/tickets/{id}`
- `PATCH /api/tickets/{id}/cancel`
- `PATCH /api/tickets/{id}/pay`

---

## 2025-11-18

### Fix: Documentación Obligatoria de Todos los Fixes

**Problema:** Pérdida de contexto entre sesiones por falta de documentación.

**Solución:** Establecido proceso obligatorio de documentación con formato estándar.

---

### Fix: Rutas Creadas Sin Conexión al Menú

**Problema:** Rutas en App.jsx no coincidían con menuItems.js.

**Archivos Modificados:**
- `frontend-v1/src/constants/menuItems.js`
- `frontend-v2/src/constants/menuItems.js`

**Lección:** Proceso de 3 pasos obligatorio: Componente → Ruta → Menú.

---

### Fix: Inconsistencia de Color en Título USUARIOS > Bancas

**Problema:** Título tenía fondo turquesa, otros formularios no.

**Solución:** Removido fondo, cambiado texto a negro (#2c2c2c).

**Archivo:** `frontend-v1/src/assets/css/user-bancas.css`

---

### Loans Module Implementation

**Archivos Creados V1:**
- `frontend-v1/src/components/loans/CreateLoan.jsx`
- `frontend-v1/src/components/loans/LoansList.jsx`

**Archivos Creados V2:**
- `frontend-v2/src/components/features/loans/CreateLoan/index.jsx`
- `frontend-v2/src/components/features/loans/LoansList/index.jsx`

**Rutas:**
- V1: `/prestamos/crear`, `/prestamos/lista`
- V2: `/loans/new`, `/loans/list`

---

### Excesses Module Implementation

**Archivos Creados V1:**
- `frontend-v1/src/components/excedentes/ManageExcesses.jsx`
- `frontend-v1/src/components/excedentes/ExcessesReport.jsx`

**Archivos Creados V2:**
- `frontend-v2/src/components/features/excesses/ManageExcesses/index.jsx`
- `frontend-v2/src/components/features/excesses/ExcessesReport/index.jsx`

**Rutas:**
- V1: `/excedentes/manejar`, `/excedentes/reporte`
- V2: `/surpluses/manage`, `/surpluses/report`

---

## 2025-11-16

### Mass Edit Betting Pools / Edición Masiva de Bancas

**Commit:** `5017ba3`

**Archivos Creados V1:**
- `frontend-v1/src/components/MassEditBancas.jsx`
- `frontend-v1/src/components/common/form/` (ToggleButtonGroup, IPhoneToggle, SelectableBadgeGroup)

**Archivos Creados V2:**
- `frontend-v2/src/components/features/betting-pools/MassEditBettingPools/index.jsx`

**Rutas:**
- V1: `/bancas/edicion-masiva`
- V2: `/betting-pools/mass-edit`

---

## 2025-11-14

### Fix Principal: Missing Prize Input Fields

**Problema:** Inputs de premios no se mostraban en tab "Premios & Comisiones".

**Causa:** API devuelve `prizeTypes`, frontend espera `prizeFields`.

**Solución V1:** (`frontend-v1/src/services/prizeFieldService.js`)
```javascript
if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
  betType.prizeFields = betType.prizeTypes;
}
```

**Solución V2:** (`frontend-v2/src/services/prizeService.js`)
```javascript
data.forEach(betType => {
  if (betType.prizeTypes && Array.isArray(betType.prizeTypes)) {
    betType.prizeFields = betType.prizeTypes;
    betType.prizeFields.sort((a, b) => a.displayOrder - b.displayOrder);
  }
});
```

**Commits:**
- V1: `5211df7`
- V2: `cadb56c`
- API: `e644337`

---

## Formato para Nuevos Fixes

```markdown
### Fix: [Título] (YYYY-MM-DD)

**Problema:** [descripción]

**Causa Raíz:** [por qué ocurrió]

**Archivos Modificados:**
- `ruta/archivo.ext`

**Solución:**
[código o explicación]

**Lección Aprendida:** [prevención futura]
```
