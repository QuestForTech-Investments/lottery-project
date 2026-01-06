# Plan de Refactorización - Frontend V4

**Fecha de inicio:** 2026-01-06
**Última actualización:** 2026-01-06
**Branch:** `feature/refactoring-phase1`
**Objetivo:** Llevar el código a estándares de un desarrollador React Senior (10+ años)

---

## Resumen Ejecutivo

| Métrica | Antes | Después | Estado |
|---------|-------|---------|--------|
| Console.log statements | ~180 | ~20 | ✅ Completado |
| formatCurrency duplicados | 19 | 0 | ✅ Completado |
| Tipos centralizados | 0 | 1 archivo | ✅ Completado |
| Constantes centralizadas | dispersas | centralizadas | ✅ Completado |
| Hooks reutilizables | 2 | 6+ | ✅ Completado |
| Componentes comunes | básicos | +6 nuevos | ✅ Completado |
| Componentes >500 LOC | 15 archivos | 15 archivos | ⏳ Pendiente |
| Tests | 0 | 0 | ⏳ Pendiente |
| TODOs sin resolver | ~30 | ~30 | ⏳ Pendiente |

---

## ✅ FASE 1 - COMPLETADA

### 1. Tipos Centralizados
**Archivos creados:**
- `src/types/common.ts` - Tipos comunes (BettingPool, Lottery, SelectOption, etc.)
- `src/types/index.ts` - Barrel export

### 2. Constantes Centralizadas
**Archivos creados:**
- `src/constants/colors.ts` - Colores de marca y estilos de botones
- `src/constants/masterData.ts` - BET_TYPES, ZONES, TICKET_STATUS_MAP
- `src/constants/index.ts` - Barrel export

### 3. Custom Hooks Reutilizables
**Archivos creados:**
- `src/hooks/useDebounce.ts` - Debounce para inputs
- `src/hooks/useFetch.ts` - Fetch con loading/error states + useMutation
- `src/hooks/useLocalStorage.ts` - Persistencia en localStorage
- `src/hooks/usePagination.ts` - Lógica de paginación
- `src/hooks/index.ts` - Barrel export

### 4. Componentes Comunes
**Archivos creados:**
- `src/components/common/CurrencyDisplay.tsx` - Formato de moneda
- `src/components/common/StatusChip.tsx` - Chips de estado con colores automáticos
- `src/components/common/LoadingOverlay.tsx` - Indicadores de carga
- `src/components/common/ConfirmDialog.tsx` - Diálogos de confirmación
- `src/components/common/EmptyState.tsx` - Estados vacíos
- `src/components/common/PageHeader.tsx` - Headers de página consistentes
- `src/components/common/index.ts` - Barrel export

### 5. Eliminación de Console.logs
**Resultado:** ~150 console.log eliminados
**Script creado:** `scripts/remove-console-logs.cjs`

### 6. Centralización de formatCurrency
**Resultado:** 19 implementaciones duplicadas → 0
**Archivos modificados:** 23 componentes actualizados para usar `@/utils/formatCurrency`

---

## ⏳ FASE 2 - PENDIENTE

### 1. Dividir Componentes Grandes (>500 LOC)

| Componente | Líneas | Prioridad | Estrategia |
|------------|--------|-----------|------------|
| Results.tsx | 1,607 | Alta | Extraer tabs a componentes separados |
| PrizesTab.tsx | 1,412 | Alta | Extraer secciones de bet types |
| CreateTickets/index.tsx | 1,308 | Alta | Separar formulario, tabla, preview |
| HistoricalSales/index.tsx | 1,190 | Media | Extraer filtros y tabla |
| TicketMonitoring/index.tsx | 943 | Media | Ya tiene buena estructura |
| MassEditBettingPools | 918 | Media | Extraer formularios por sección |
| DailySales/index.tsx | 826 | Baja | Ya usa tabs |
| GroupConfiguration | 782 | Baja | Extraer secciones |
| ManageZones | 763 | Baja | Separar lista/formulario |
| CreateTicket | 744 | Media | Separar formulario/preview |

### 2. Resolver TODOs

**Ubicaciones principales:**
- `useDashboard.ts` - 4 TODOs (publicar resultados, bloquear números)
- `UserAdministrators` - 3 TODOs (cambio de contraseña, reset)
- `TicketMonitoring` - 3 TODOs (print, send, cancel)
- `PlayMonitoring/WinningPlays` - 2 TODOs (export PDF)

### 3. Agregar Tests

**Prioridad de testing:**
1. Custom hooks (useDebounce, useFetch, usePagination)
2. Componentes comunes (CurrencyDisplay, StatusChip, etc.)
3. Servicios críticos (ticketService, bettingPoolService)
4. Componentes de formulario

---

## Commits Realizados

```
e686f4b refactor: eliminate remaining formatCurrency duplicates
ea5facf refactor: centralize formatCurrency usage across components
d361321 refactor: remove ~150 console.log debug statements
9735f9b refactor(components): add reusable common UI components
dc7a804 refactor(TicketMonitoring): use centralized types, hooks, and constants
0206a5c refactor(hooks): add reusable custom hooks
10df1b1 refactor(constants): centralize constants and colors
21877f0 refactor(types): centralize common types
```

---

## Cómo Usar los Nuevos Componentes

```typescript
// Imports centralizados
import { BettingPool, TicketStatus, PaginatedResponse } from '@/types';
import { colors, buttonStyles, DEBOUNCE_DELAY, BET_TYPES } from '@/constants';
import { useDebounce, useFetch, usePagination, useLocalStorage } from '@/hooks';
import {
  CurrencyDisplay,
  StatusChip,
  LoadingOverlay,
  EmptyState,
  ConfirmDialog,
  PageHeader
} from '@/components/common';
import { formatCurrency } from '@/utils/formatCurrency';

// Ejemplos de uso
<CurrencyDisplay amount={1234.56} colorize />
<StatusChip status="Ganador" />
<LoadingOverlay isLoading={loading} message="Cargando..." />
<EmptyState message="No hay datos" actionText="Crear" onAction={handleCreate} />
```

---

## Scripts de Utilidad

```bash
# Eliminar console.logs de un archivo
node scripts/remove-console-logs.cjs <file>

# Ver guía de refactorización de formatCurrency
node scripts/refactor-format-currency.cjs
```

---

**Próximos pasos recomendados:**
1. Crear PR con los cambios de Fase 1
2. Agregar tests para hooks y componentes comunes
3. Planificar división de componentes grandes en sprints separados
