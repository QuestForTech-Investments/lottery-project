# Tickets Module Migration Work Plan

## Overview

This document compares the Vue.js original app (https://la-numbers.apk.lol) Tickets module with the frontend-v4 implementation to identify gaps and create a detailed work plan.

**Screenshots Location:** `frontend-v2/.playwright-mcp/tickets-*.png`

---

## Module Structure Comparison

| # | Section (Vue.js) | URL | Frontend-v4 Component | Status |
|---|------------------|-----|----------------------|--------|
| 1 | Crear | `#/tickets/create` | `CreateTickets/index.tsx` | Needs Review |
| 2 | Monitoreo | `#/tickets` | `TicketMonitoring/index.tsx` | Needs Review |
| 3 | Monitoreo agentes externos | `#/external-tickets` | `ExternalAgentsMonitoring/index.tsx` | Needs Review |
| 4 | Jugadas | `#/play-amounts` | `PlayMonitoring/index.tsx` | Needs Review |
| 5 | Jugadas ganadoras | `#/winning-plays` | `WinningPlays/index.tsx` | Needs Review |
| 6 | Pizarra | `#/blackboard` | `Blackboard/index.tsx` | Needs Review |
| 7 | Bote importado | `#/imported-plays` | `ImportedPool/index.tsx` | Needs Review |
| 8 | Bote Exportado | `#/exported-plays` | `ExportedPool/index.tsx` | Needs Review |
| 9 | Anomalías | `#/anomalies` | `TicketAnomalies/index.tsx` | Needs Review |

---

## Detailed Section Analysis

### 1. Crear Ticket (`#/tickets/create` → `CreateTickets`)

**Vue.js Original Features:**
- Banca selector dropdown
- 69 sorteos in grid with images
- Stats display: Jugadas del día, Vendido en grupo, Vendido en banca
- Toggle switches: Desc., Mult. lot
- Input fields: Jugada, N/A, Monto
- 4 bet columns: Directo, Pale & Tripleta, Cash 3, Play 4 & Pick 5
- Buttons: Duplicar, Crear ticket, Ayuda
- Keyboard shortcuts support

**Frontend-v4 Files:**
```
CreateTickets/
├── index.tsx
├── HelpModal.tsx
├── hooks/
│   └── useCreateTickets.ts
└── components/
    └── PlayTable.tsx
```

**Action Items:**
- [ ] Compare grid layout (69 sorteos with images)
- [ ] Verify all 4 bet column types are implemented
- [ ] Check toggle switches (Desc., Mult. lot)
- [ ] Verify stats display (Jugadas del día, etc.)
- [ ] Test Duplicar functionality
- [ ] Test Ayuda modal content matches original
- [ ] Verify keyboard shortcuts

---

### 2. Monitoreo (`#/tickets` → `TicketMonitoring`)

**Vue.js Original Features:**
- Filter form:
  - Fecha (date picker)
  - Banca (dropdown)
  - Lotería (dropdown)
  - Tipo de jugada (dropdown)
  - Número (text input)
  - Pendientes de pago (checkbox)
  - Sólo tickets ganadores (checkbox)
  - Zonas (multi-select)
- Radio buttons: Todos, Ganadores, Pendientes, Perdedores, Cancelado
- Summary totals: Monto total, Total de premios
- Data table columns: Número, Fecha, Usuario, Monto, Premio, Fecha cancelación, Estado, Acciones
- Pagination with entries per page selector
- Quick filter search

**Action Items:**
- [ ] Verify all filter fields are implemented
- [ ] Check radio button filtering (status filter)
- [ ] Verify summary totals display
- [ ] Check table columns match original
- [ ] Test pagination and entries per page
- [ ] Verify quick filter functionality
- [ ] Test ticket actions (view, cancel, etc.)

---

### 3. Monitoreo de Agentes Externos (`#/external-tickets` → `ExternalAgentsMonitoring`)

**Vue.js Original Features:**
- Same as Monitoreo but with additional:
  - Agente (agent dropdown)
- All other features same as Monitoreo

**Action Items:**
- [ ] Verify Agente filter dropdown
- [ ] Compare with regular Monitoreo
- [ ] Ensure data is filtered by external agents

---

### 4. Jugadas (`#/play-amounts` → `PlayMonitoring`)

**Vue.js Original Features:**
- Filter form:
  - Fecha (date picker)
  - Sorteos (multi-select)
  - Zonas (multi-select)
  - Banca (dropdown)
- Action buttons: Refrescar, PDF, Imprimir
- Data table with play amounts

**Action Items:**
- [ ] Verify all filter fields
- [ ] Test Refrescar functionality
- [ ] Test PDF export
- [ ] Test Print functionality
- [ ] Verify table data matches original

---

### 5. Jugadas Ganadoras (`#/winning-plays` → `WinningPlays`)

**Vue.js Original Features:**
- Filter form:
  - Fecha inicial (date picker)
  - Fecha final (date picker)
  - Sorteo (dropdown)
  - Zonas (multi-select)
- Action buttons: Filtrar, PDF
- Data table columns: Tipo de jugada, Jugada, Venta, Premio, Total

**Action Items:**
- [ ] Verify date range filter
- [ ] Check Sorteo dropdown
- [ ] Verify Zonas multi-select
- [ ] Test Filtrar button
- [ ] Test PDF export
- [ ] Verify table columns and data

---

### 6. Pizarra (`#/blackboard` → `Blackboard`)

**Vue.js Original Features:**
- Similar to Jugadas
- Auto-refresh toggle
- Real-time updates

**Action Items:**
- [ ] Verify auto-refresh toggle
- [ ] Test real-time update functionality
- [ ] Compare layout with Jugadas

---

### 7. Bote Importado (`#/imported-plays` → `ImportedPool`)

**Vue.js Original Features:**
- Simple filter form:
  - Fecha (date picker)
- Action buttons: Refrescar, PDF
- Data table for imported plays

**Action Items:**
- [ ] Verify date filter
- [ ] Test Refrescar button
- [ ] Test PDF export
- [ ] Verify table structure

---

### 8. Bote Exportado (`#/exported-plays` → `ExportedPool`)

**Vue.js Original Features:**
- Same structure as Bote Importado
- Filter by date
- Refrescar and PDF buttons

**Action Items:**
- [ ] Verify date filter
- [ ] Test Refrescar button
- [ ] Test PDF export
- [ ] Verify table structure

---

### 9. Anomalías (`#/anomalies` → `TicketAnomalies`)

**Vue.js Original Features:**
- Date filter
- TWO separate data tables:
  1. **Tickets table:**
     - Columns: Número, Fecha, Usuario, Monto, Premio, Fecha de cancelación, Estado
     - Pagination
     - Quick filter
     - Entries per page selector
  2. **Cambios de resultados table:**
     - Columns: Grupos, Sorteo, Fecha, Cambios, Usuario, Última actualización
     - Pagination
     - Quick filter
     - Entries per page selector

**Action Items:**
- [ ] Verify date filter
- [ ] Check BOTH tables are implemented
- [ ] Verify Tickets table columns
- [ ] Verify Cambios de resultados table columns
- [ ] Test pagination on both tables
- [ ] Test quick filter on both tables

---

## Common UI Components to Verify

All pages should have consistent styling with frontend-v4 design system:

- [ ] Date pickers use MUI DatePicker
- [ ] Dropdowns use MUI Select or Autocomplete
- [ ] Multi-select uses proper MUI component
- [ ] Tables use consistent styling
- [ ] Pagination uses MUI Pagination
- [ ] Buttons use turquoise (#51cbce) color scheme
- [ ] Font is Montserrat
- [ ] Spanish UI text throughout

---

## Priority Order

**Phase 1 - Core Functionality (High Priority):**
1. CreateTickets - Main ticket creation form
2. TicketMonitoring - Core monitoring functionality
3. PlayMonitoring (Jugadas) - Play amount monitoring

**Phase 2 - Reports (Medium Priority):**
4. WinningPlays - Winning plays report
5. Blackboard - Real-time monitoring
6. TicketAnomalies - Anomaly detection

**Phase 3 - Secondary Features (Lower Priority):**
7. ExternalAgentsMonitoring - External agents
8. ImportedPool - Imported plays
9. ExportedPool - Exported plays

---

## Next Steps

1. Start with Phase 1 components
2. For each component:
   - Open Vue.js original and frontend-v4 side by side
   - Use Playwright to capture screenshots of both
   - Document any differences
   - Implement missing features
   - Test with real data

---

## Screenshots Reference

| File | Description |
|------|-------------|
| `tickets-create.png` | Original Vue.js Create Ticket form |
| `tickets-monitoring.png` | Original Vue.js Ticket Monitoring |
| `tickets-jugadas.png` | Original Vue.js Jugadas (Play amounts) |
| `tickets-winning-plays.png` | Original Vue.js Winning Plays |
| `tickets-blackboard.png` | Original Vue.js Blackboard |
| `tickets-bote-importado.png` | Original Vue.js Imported Pool |
| `tickets-bote-exportado.png` | Original Vue.js Exported Pool |
| `tickets-anomalias.png` | Original Vue.js Anomalies |
| `tickets-external-monitoring.png` | Original Vue.js External Agents Monitoring |

---

**Document Created:** 2025-11-30
**Status:** Ready for implementation
