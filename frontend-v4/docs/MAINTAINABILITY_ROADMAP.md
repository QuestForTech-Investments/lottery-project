# Frontend V4 - Roadmap de Mantenibilidad

**Creado:** 2025-11-29
**Objetivo:** Mejorar la mantenibilidad del código para facilitar onboarding de nuevos desarrolladores

---

## Resumen Ejecutivo

| Métrica | Valor Actual | Meta |
|---------|--------------|------|
| Componentes >500 líneas | 10 | 0 |
| TODOs/FIXMEs pendientes | 27 | 0 |
| Cobertura de tests | 0% | 80% (flujos críticos) |
| Componentes con custom hooks | ~30% | 100% |

---

## Prioridad 1: Componentes Críticos (Dividir)

Estos componentes son demasiado grandes y dificultan el mantenimiento:

| Componente | Líneas | Acción Sugerida |
|------------|--------|-----------------|
| `PrizesTab.tsx` | 1,237 | Dividir en: PrizeForm, PrizeList, PrizeValidation, usePrizes hook |
| `MassEditBettingPools/index.tsx` | 912 | Extraer: BulkEditForm, BulkEditTable, useBulkEdit hook |
| `HistoricalSales/index.tsx` | 875 | Separar: SalesFilters, SalesChart, SalesTable, useSalesData hook |
| `CreateTickets/index.tsx` | 865 | Dividir: TicketForm, BetList, TicketPreview, useTicketForm hook |
| `GroupConfiguration/index.tsx` | 782 | Extraer tabs en componentes separados |
| `ManageZones/index.tsx` | 764 | Separar: ZoneList, ZoneForm, useZones hook |
| `CreateTicket/index.tsx` | 745 | Consolidar con CreateTickets o eliminar duplicado |
| `CreateTicketsAdvanced.tsx` | 723 | Evaluar si es necesario o consolidar |
| `TicketMonitoring/index.tsx` | 708 | Extraer: TicketFilters, TicketTable, TicketStats, useTicketMonitoring hook |
| `DailySales/index.tsx` | 708 | Separar por tabs: cada tab en su propio componente |

### Patrón de Refactorización Recomendado

```
ComponenteGrande/
├── index.tsx              # Componente principal (solo composición, <200 líneas)
├── components/
│   ├── SubComponente1.tsx
│   ├── SubComponente2.tsx
│   └── SubComponente3.tsx
├── hooks/
│   └── useComponenteLogic.ts  # Toda la lógica de estado
├── types.ts               # Interfaces y tipos
├── constants.ts           # Constantes y configuración
└── utils.ts               # Funciones helper
```

---

## Prioridad 2: TODOs Pendientes (Resolver)

Archivos con deuda técnica documentada:

| Archivo | TODOs | Descripción |
|---------|-------|-------------|
| `useDashboard.ts` | 4 | Lógica de dashboard incompleta |
| `ExpenseCategories/index.tsx` | 3 | Funcionalidad de gastos |
| `BettingPoolsList/index.tsx` | 2 | Lista de bancas |
| `BettingPoolBalances/index.tsx` | 2 | Balances |
| `BettingPoolsWithoutSales/index.tsx` | 2 | Reporte de bancas sin ventas |
| Otros (13 archivos) | 1 c/u | Varios |

### Proceso para resolver TODOs

1. Buscar el TODO: `grep -r "// TODO" src/`
2. Evaluar si sigue siendo relevante
3. Implementar o eliminar si ya no aplica
4. Documentar decisión en commit

---

## Prioridad 3: Estandarización de Hooks

### Componentes que necesitan custom hooks

Actualmente algunos componentes tienen lógica inline. Estandarizar así:

```typescript
// ANTES (lógica mezclada en componente)
const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch data...
  }, []);

  const handleSubmit = () => { /* ... */ };

  return <div>...</div>;
};

// DESPUÉS (lógica en hook)
const MyComponent = () => {
  const { data, loading, handleSubmit } = useMyComponent();
  return <div>...</div>;
};
```

### Ejemplos de hooks bien estructurados (usar como referencia)

- `src/components/features/users/UserSessions/hooks/useUserSessions.ts`
- `src/components/features/users/UserBlockedSessions/hooks/useUserBlockedSessions.ts`

---

## Prioridad 4: Testing

### Tests E2E Críticos a Implementar

| Flujo | Archivo Sugerido | Prioridad |
|-------|------------------|-----------|
| Login/Logout | `e2e/auth.spec.ts` | Alta |
| Crear Ticket | `e2e/create-ticket.spec.ts` | Alta |
| Monitor de Tickets | `e2e/ticket-monitoring.spec.ts` | Alta |
| CRUD Bancas | `e2e/betting-pools.spec.ts` | Media |
| Reportes de Ventas | `e2e/sales-reports.spec.ts` | Media |

### Configuración de Playwright

```bash
cd frontend-v4
npm install -D @playwright/test
npx playwright install
```

### Template de Test E2E

```typescript
// e2e/create-ticket.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Crear Ticket', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:4200');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('debe crear un ticket con una jugada', async ({ page }) => {
    await page.goto('http://localhost:4200/tickets/create');
    // ... assertions
  });
});
```

---

## Prioridad 5: Documentación Inline

### Agregar JSDoc a funciones clave

```typescript
/**
 * Filtra tickets por fecha y banca seleccionada
 * @param filters - Parámetros de filtrado
 * @returns Lista paginada de tickets
 * @example
 * const tickets = await filterTickets({ date: '2025-01-15', bettingPoolId: 9 });
 */
export const filterTickets = async (filters: TicketFilterParams): Promise<TicketFilterResponse> => {
  // ...
};
```

### Archivos prioritarios para documentar

1. `src/services/ticketService.ts` - Operaciones de tickets
2. `src/services/api.ts` - Cliente HTTP base
3. `src/hooks/useBetDetection.ts` - Detección de jugadas
4. `src/utils/apiErrorHandler.ts` - Manejo de errores

---

## Cronograma Sugerido

### Semana 1: Preparación
- [ ] Revisar y cerrar TODOs obsoletos
- [ ] Documentar servicios principales (JSDoc)
- [ ] Configurar Playwright

### Semana 2: Componente más crítico
- [ ] Refactorizar `PrizesTab.tsx` (1,237 líneas)
- [ ] Crear test E2E para configuración de premios

### Semana 3: Tickets
- [ ] Refactorizar `CreateTickets/index.tsx`
- [ ] Refactorizar `TicketMonitoring/index.tsx`
- [ ] Tests E2E para flujo de tickets

### Semana 4: Reportes y Bancas
- [ ] Refactorizar `HistoricalSales/index.tsx`
- [ ] Refactorizar `MassEditBettingPools/index.tsx`

### Semana 5+: Resto de componentes
- [ ] Componentes restantes >500 líneas
- [ ] Estandarización de hooks
- [ ] Documentación final

---

## Métricas de Éxito

Al completar este roadmap:

| Métrica | Antes | Después |
|---------|-------|---------|
| Tiempo de onboarding | ~3 semanas | ~1 semana |
| Componente más grande | 1,237 líneas | <500 líneas |
| Tests E2E | 0 | 5+ flujos críticos |
| TODOs pendientes | 27 | 0 |

---

## Comandos Útiles

```bash
# Buscar componentes grandes
find src -name "*.tsx" -exec wc -l {} \; | sort -rn | head -20

# Buscar TODOs
grep -r "// TODO\|// FIXME\|// HACK" src/ --include="*.ts" --include="*.tsx"

# Verificar tipos
npx tsc --noEmit

# Lint
npm run lint

# Tests E2E
npx playwright test
```

---

*Última actualización: 2025-11-29*
