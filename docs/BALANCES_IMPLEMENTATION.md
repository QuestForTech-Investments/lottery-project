# Balances Module - Implementation Guide

**Date:** 2025-11-17
**Status:** Analysis Complete
**Purpose:** Documentation for implementing the Balances module in React frontends (V1 Bootstrap, V2 Material-UI)

---

## Overview

The Balances module provides financial balance views at different organizational levels. It is accessible from the main navigation under "Balances" and contains 4 distinct subsections.

### Routes Identified

| Subsection | Vue.js Route | Suggested V1 Route | Suggested V2 Route |
|------------|--------------|-------------------|-------------------|
| Betting Pools | `#/balances/betting-pools` | `/balances/bancas` | `/balances/betting-pools` |
| Banks | `#/balances/banks` | `/balances/bancos` | `/balances/banks` |
| Zones | `#/balances/zones` | `/balances/zonas` | `/balances/zones` |
| Groups | `#/balances/groups` | `/balances/grupos` | `/balances/groups` |

---

## Subsection 1: Balances de Bancas (Betting Pool Balances)

**Title:** "Balances de bancas"
**Route:** `/balances/betting-pools`

### Features

1. **Filters Section**
   - **Date Picker**: Select date for balance calculation (default: today)
   - **Zones Multi-Select**: Filter by zones (shows "X seleccionadas" when multiple selected)
   - **Balance Type Radio Buttons**:
     - TODOS (All) - default
     - POSITIVOS (Positive balances only)
     - NEGATIVOS (Negative balances only)

2. **Action Buttons**
   - REFRESCAR (Refresh) - Reload data
   - IMPRIMIR (Print) - Print report
   - PDF - Export to PDF

3. **Quick Filter**
   - Text input for filtering table rows (real-time search)

4. **Data Table Columns**
   - Número (Number) - Betting pool number
   - Nombre (Name) - Pool name
   - Usuarios (Users) - User count
   - Referencia (Reference) - Reference code
   - Zona (Zone) - Zone name
   - Balance - Financial balance with currency formatting ($X,XXX.XX)
   - Préstamos (Loans) - Loan amount

5. **Summary Footer**
   - Total Balance: Sum of all balances
   - Total Loans: Sum of all loans
   - Entry count: "Mostrando X entradas"

### Sample Data Structure

```javascript
{
  numero: 1,
  nombre: "LA CENTRAL 01",
  usuarios: "001",
  referencia: "GILBERTO ISLA GORDA TL",
  zona: "GRUPO GILBERTO TL",
  balance: 112.66,
  prestamos: 0.00
}
```

### API Endpoints (Expected)

```
GET /api/balances/betting-pools?date=YYYY-MM-DD&zones=1,2,3&type=all|positive|negative
```

---

## Subsection 2: Balances de Bancos (Bank Balances)

**Title:** "Balances de bancos"
**Route:** `/balances/banks`

### Features

1. **Quick Filter**
   - Text input for real-time filtering

2. **Data Table Columns**
   - Nombre (Name) - Bank name
   - Código (Code) - Bank code
   - Zona (Zone) - Zone name
   - Balance - Financial balance

3. **Summary Footer**
   - Total Balance
   - Entry count

### Sample Data Structure

```javascript
{
  nombre: "Bank Name",
  codigo: "BNK001",
  zona: "Zone Name",
  balance: 1000.00
}
```

### API Endpoints (Expected)

```
GET /api/balances/banks
```

---

## Subsection 3: Balances de Zonas (Zone Balances)

**Title:** "Balances de zonas"
**Route:** `/balances/zones`

### Features

1. **Quick Filter**
   - Text input for real-time filtering

2. **Data Table Columns**
   - Nombre (Name) - Zone name
   - Balance - Aggregated balance for the zone

3. **Summary Footer**
   - Total Balance
   - Entry count

### Sample Data Structure

```javascript
{
  nombre: "Zone Name",
  balance: 5000.00
}
```

### API Endpoints (Expected)

```
GET /api/balances/zones
```

---

## Subsection 4: Balances de Grupos (Group Balances)

**Title:** "Balances de grupos"
**Route:** `/balances/groups`

### Features

1. **Date Picker**
   - Select date for balance calculation

2. **Quick Filter**
   - Text input for real-time filtering

3. **Data Table Columns**
   - Nombre (Name) - Group name (prefixed with #)
   - Balance - Group balance (with **color coding**)

4. **Color Coding**
   - **Positive balances**: Light blue/green background
   - **Negative balances**: Light red/pink background

5. **Summary Footer**
   - Total Balance
   - Entry count

### Sample Data Structure

```javascript
[
  { nombre: "#Consorcio Bronco", balance: 5995.47 },
  { nombre: "#Consorcio GS", balance: -7955.85 },  // Negative - red
  { nombre: "#Consorcio MELI", balance: 135.75 },
  { nombre: "#Consorcio Passtime", balance: 10267.44 },
  { nombre: "#Consorcio Peter (lsnumber)", balance: 9.10 }
]
```

### API Endpoints (Expected)

```
GET /api/balances/groups?date=YYYY-MM-DD
```

---

## Common UI Components

### 1. Balance Table Component

All 4 subsections share a common table pattern:
- Sortable columns (click to sort ascending/descending)
- Quick filter input
- Totals row at bottom
- Entry count display
- Currency formatting ($X,XXX.XX)

### 2. Date Picker Component

Used in:
- Betting Pools (with zones and balance type)
- Groups (standalone)

### 3. Multi-Select Component

Used in:
- Betting Pools (for zones)

Shows "X seleccionadas" when multiple items selected.

### 4. Radio Button Group

Used in:
- Betting Pools (for balance type: All/Positive/Negative)

---

## Implementation Strategy

### Phase 1: Core Components

1. Create shared `BalanceTable` component
2. Create `DateFilter` component
3. Create `QuickFilter` component
4. Create `BalanceTypeSwitcher` (radio buttons)

### Phase 2: Individual Pages

1. **BettingPoolBalances** - Most complex, start here
2. **GroupBalances** - Second most complex (date + color coding)
3. **BankBalances** - Simple table
4. **ZoneBalances** - Simple table

### Phase 3: API Integration

1. Define API contract with backend team
2. Create balance service layer
3. Implement data transformation
4. Add loading states and error handling

### Phase 4: Enhancement

1. PDF export functionality
2. Print functionality
3. Multi-zone selection persistence
4. Balance type filtering

---

## File Structure (Proposed)

### Frontend V1 (Bootstrap)

```
frontend-v1/src/components/
├── balances/
│   ├── BettingPoolBalances.jsx
│   ├── BankBalances.jsx
│   ├── ZoneBalances.jsx
│   ├── GroupBalances.jsx
│   └── common/
│       ├── BalanceTable.jsx
│       ├── DateFilter.jsx
│       └── QuickFilter.jsx
└── assets/css/
    └── balances.css
```

### Frontend V2 (Material-UI)

```
frontend-v2/src/components/features/balances/
├── BettingPoolBalances/
│   ├── index.jsx
│   └── hooks/
│       └── useBettingPoolBalances.js
├── BankBalances/
│   └── index.jsx
├── ZoneBalances/
│   └── index.jsx
├── GroupBalances/
│   └── index.jsx
└── common/
    ├── BalanceTable.jsx
    ├── DateFilter.jsx
    └── QuickFilter.jsx
```

---

## Screenshots Reference

Location: `/home/jorge/projects/.playwright-mcp/`

1. `balances-betting-pools.png` - Full betting pool balance view
2. `balances-banks.png` - Bank balances table
3. `balances-zones.png` - Zone balances table
4. `balances-groups.png` - Group balances with color coding

---

## Priority Order

1. **HIGH**: Betting Pool Balances (most used, most features)
2. **MEDIUM**: Group Balances (date picker + color coding)
3. **LOW**: Bank Balances (simple table)
4. **LOW**: Zone Balances (simple table)

---

## Dependencies

- React date picker library
- Multi-select component (for zones)
- PDF generation library (jsPDF or similar)
- Print functionality
- Currency formatting utility

---

## Notes

- All tables support client-side sorting
- Quick filter works on all visible columns
- Currency formatting uses US format ($X,XXX.XX)
- Negative balances show with minus sign and red background
- API should support date filtering for accurate balance calculation
- Consider caching strategy for frequently accessed balance data

---

**Next Steps:**
1. Create GitHub issues for each component
2. Review API requirements with backend team
3. Start implementation with BettingPoolBalances
4. Create unit tests for balance calculations

