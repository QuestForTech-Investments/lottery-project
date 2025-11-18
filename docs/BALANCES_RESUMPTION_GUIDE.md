# Balances Module - Resumption Guide

**Date Created:** 2025-11-17
**Purpose:** Resume implementation of Balances module without prior context

---

## Quick Start

### What Was Completed

1. **Analysis** - Analyzed Vue.js app at https://la-numbers.apk.lol/#/balances/*
2. **Documentation** - Created comprehensive implementation guide
3. **GitHub Issues** - Created 6 issues for tracking work

### GitHub Issues Created

| Issue # | Title | Priority | Status |
|---------|-------|----------|--------|
| #22 | [Epic] Implement Balances Module | - | Open |
| #23 | Betting Pool Balances | HIGH | Open |
| #24 | Group Balances | MEDIUM | Open |
| #25 | Bank Balances | LOW | Open |
| #26 | Zone Balances | LOW | Open |
| #27 | Create Shared Components | - | Open |

**View all issues:** https://github.com/QuestForTech-Investments/lottery-project/issues

---

## Files Created

1. **Implementation Guide**
   ```
   /home/jorge/projects/lottery-project/docs/BALANCES_IMPLEMENTATION.md
   ```
   Contains: Full analysis of all 4 subsections, UI components, API contracts, file structure proposals.

2. **Screenshots (Reference)**
   ```
   /home/jorge/projects/.playwright-mcp/
   ├── balances-betting-pools.png
   ├── balances-banks.png
   ├── balances-zones.png
   └── balances-groups.png
   ```

---

## Recommended Starting Point

### Start with Shared Components (Issue #27)

```bash
# Navigate to project
cd /home/jorge/projects/lottery-project

# Create component directories
mkdir -p frontend-v1/src/components/balances/common
mkdir -p frontend-v2/src/components/features/balances/common
```

**First component to build:** Currency Formatter Utility

```javascript
// frontend-v1/src/utils/formatCurrency.js
// frontend-v2/src/utils/formatCurrency.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
```

### Then: Betting Pool Balances (Issue #23)

This is the most complex view and includes all features. Start here to establish patterns.

---

## API Contract (To Define)

You need to work with the backend team to create these endpoints:

```
GET /api/balances/betting-pools
  Query params: date, zones (comma-separated), type (all|positive|negative)

GET /api/balances/banks

GET /api/balances/zones

GET /api/balances/groups
  Query params: date
```

---

## Development Commands

```bash
# Start Frontend V1 (Bootstrap)
cd frontend-v1 && npm run dev
# Runs on http://localhost:4200

# Start Frontend V2 (Material-UI)
cd frontend-v2 && npm run dev
# Runs on http://localhost:4000 or 4002

# Start API
cd api/src/LotteryApi
dotnet run --urls "http://0.0.0.0:5000"
```

---

## Vue.js Reference App

**URL:** https://la-numbers.apk.lol
**Credentials:**
- User: oliver
- Password: oliver0597@

**Routes to inspect:**
- `#/balances/betting-pools` - Most complex
- `#/balances/banks`
- `#/balances/zones`
- `#/balances/groups` - Has color coding

---

## Key Implementation Details

### 1. Betting Pool Balances Features
- Date picker
- Zone multi-select (shows "X seleccionadas")
- Balance type radio (TODOS/POSITIVOS/NEGATIVOS)
- Buttons: REFRESCAR, IMPRIMIR, PDF
- Table: 7 columns (Número, Nombre, Usuarios, Referencia, Zona, Balance, Préstamos)
- Totals row

### 2. Group Balances Special Feature
- **Color coding:**
  - Positive balances: Light blue/green background
  - Negative balances: Light red/pink background

### 3. All Tables Share
- Sortable columns (click header)
- Quick filter (real-time search)
- Currency formatting ($X,XXX.XX)
- Entry count ("Mostrando X de Y entradas")

---

## File Structure to Create

### V1 (Bootstrap)
```
frontend-v1/src/
├── components/
│   └── balances/
│       ├── BettingPoolBalances.jsx
│       ├── BankBalances.jsx
│       ├── ZoneBalances.jsx
│       ├── GroupBalances.jsx
│       └── common/
│           ├── BalanceTable.jsx
│           ├── DateFilter.jsx
│           └── QuickFilter.jsx
├── assets/css/
│   └── balances.css
└── App.jsx (add routes)
```

### V2 (Material-UI)
```
frontend-v2/src/
├── components/features/
│   └── balances/
│       ├── BettingPoolBalances/
│       │   └── index.jsx
│       ├── BankBalances/
│       │   └── index.jsx
│       ├── ZoneBalances/
│       │   └── index.jsx
│       ├── GroupBalances/
│       │   └── index.jsx
│       └── common/
└── App.jsx (add routes)
```

---

## Routes to Add

### V1 (App.jsx)
```javascript
import BettingPoolBalances from '@components/balances/BettingPoolBalances';
import BankBalances from '@components/balances/BankBalances';
import ZoneBalances from '@components/balances/ZoneBalances';
import GroupBalances from '@components/balances/GroupBalances';

// Inside Routes:
<Route path="/balances/bancas" element={<BettingPoolBalances />} />
<Route path="/balances/bancos" element={<BankBalances />} />
<Route path="/balances/zonas" element={<ZoneBalances />} />
<Route path="/balances/grupos" element={<GroupBalances />} />
```

### V2 (App.jsx) - Lazy Loading
```javascript
const BettingPoolBalances = lazy(() => import('@components/features/balances/BettingPoolBalances'));
const BankBalances = lazy(() => import('@components/features/balances/BankBalances'));
const ZoneBalances = lazy(() => import('@components/features/balances/ZoneBalances'));
const GroupBalances = lazy(() => import('@components/features/balances/GroupBalances'));

// Inside Routes:
<Route path="/balances/betting-pools" element={<BettingPoolBalances />} />
<Route path="/balances/banks" element={<BankBalances />} />
<Route path="/balances/zones" element={<ZoneBalances />} />
<Route path="/balances/groups" element={<GroupBalances />} />
```

---

## Priority Order

1. **Shared Components** (Issue #27) - Build foundation first
2. **Betting Pool Balances** (Issue #23) - Most features, HIGH priority
3. **Group Balances** (Issue #24) - Color coding, MEDIUM priority
4. **Bank Balances** (Issue #25) - Simple, LOW priority
5. **Zone Balances** (Issue #26) - Simplest, LOW priority

---

## Sample Data for Testing

### Betting Pool Balance
```javascript
const mockData = [
  {
    numero: 1,
    nombre: "LA CENTRAL 01",
    usuarios: "001",
    referencia: "GILBERTO ISLA GORDA TL",
    zona: "GRUPO GILBERTO TL",
    balance: 112.66,
    prestamos: 0.00
  },
  // ... more entries
];
```

### Group Balance (with colors)
```javascript
const mockGroups = [
  { nombre: "#Consorcio Bronco", balance: 5995.47 },      // Positive - green
  { nombre: "#Consorcio GS", balance: -7955.85 },        // Negative - red
  { nombre: "#Consorcio MELI", balance: 135.75 },        // Positive - green
];
```

---

## Next Session Checklist

- [ ] Review `docs/BALANCES_IMPLEMENTATION.md` for full details
- [ ] Check GitHub issues (#22-#27) for task tracking
- [ ] Start with shared components (currency formatter, BalanceTable)
- [ ] Create directory structure
- [ ] Begin with BettingPoolBalances component
- [ ] Test with mock data initially
- [ ] Work with backend to define API contracts
- [ ] Add routes to App.jsx

---

## Questions to Consider

1. **API:** Are balance endpoints available in the existing .NET API?
2. **PDF:** Which library to use? (jsPDF, react-pdf?)
3. **Print:** Browser print dialog or custom?
4. **Navigation:** Should Balances have a submenu in sidebar?
5. **Permissions:** Who can access balance data?

---

**Good luck with the implementation!**

