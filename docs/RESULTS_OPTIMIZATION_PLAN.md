# Results.tsx - Plan de Optimización para Senior Developer

**Archivo:** `frontend-v4/src/components/features/results/Results.tsx`
**Tamaño actual:** 1,394 líneas
**Fecha:** 2025-12-11
**Prioridad:** Alta (componente crítico del negocio)

---

## 1. Resumen Ejecutivo

### Problemas Identificados

| Categoría | Severidad | Impacto |
|-----------|-----------|---------|
| Tamaño del archivo | 🔴 Alta | Difícil mantenimiento, ~1400 líneas |
| Re-renders innecesarios | 🔴 Alta | Performance degradada en tabla |
| Código duplicado | 🟡 Media | `getMaxLength` vs `getIndividualMaxLength` |
| Estilos inline | 🟡 Media | ~200 objetos `sx` recreados cada render |
| Sin separación de concerns | 🔴 Alta | Estado, lógica y UI mezclados |
| Sin custom hooks | 🟡 Media | Lógica no reutilizable |
| Sin memoización | 🔴 Alta | `renderInputCell` se recrea siempre |

### Métricas Objetivo

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Líneas por archivo | 1,394 | <300 |
| useState hooks | 15+ | 1 (useReducer) |
| Re-renders por input | ~65 (todas las filas) | 1 (solo la fila editada) |
| Archivos | 1 | 8-10 |

---

## 2. Arquitectura Propuesta

### 2.1 Nueva Estructura de Carpetas

```
frontend-v4/src/components/features/results/
├── Results.tsx                    # Componente principal (orquestador)
├── index.ts                       # Barrel export
├── types/
│   └── index.ts                   # Interfaces y tipos
├── hooks/
│   ├── useResultsState.ts         # Estado centralizado (useReducer)
│   ├── useResultsData.ts          # Fetching y cache de datos
│   ├── useAutoRefresh.ts          # Lógica de auto-refresh
│   ├── useFieldNavigation.ts      # Auto-advance entre inputs
│   └── useExternalResults.ts      # Comparación con externos
├── components/
│   ├── ResultsHeader.tsx          # Título y controles de fecha
│   ├── IndividualResultForm.tsx   # Formulario individual
│   ├── ResultsTable/
│   │   ├── ResultsTable.tsx       # Tabla principal
│   │   ├── ResultsTableRow.tsx    # Fila individual (memoizada)
│   │   ├── ResultsTableCell.tsx   # Celda con input (memoizada)
│   │   └── ResultsTableHeader.tsx # Encabezado de tabla
│   ├── ResultsActions.tsx         # Botones de acción
│   ├── ResultsLogs.tsx            # Tab de logs
│   ├── CompareDialog.tsx          # Dialog de comparación
│   └── ResultsSummary.tsx         # Resumen y auto-refresh toggle
├── constants/
│   └── index.ts                   # Constantes y estilos compartidos
└── utils/
    ├── validation.ts              # Funciones de validación
    ├── fieldConfig.ts             # getEnabledFields, getMaxLength
    └── formatters.ts              # Formateo de datos
```

---

## 3. Implementación Detallada

### 3.1 Types (types/index.ts)

```typescript
// Tipos existentes consolidados y mejorados

export interface DrawResultRow {
  drawId: number;
  drawName: string;
  abbreviation: string;
  color?: string;
  resultId: number | null;
  num1: string;
  num2: string;
  num3: string;
  cash3: string;
  play4: string;
  pick5: string;
  bolita1: string;
  bolita2: string;
  singulaccion1: string;
  singulaccion2: string;
  singulaccion3: string;
  hasResult: boolean;
  isDirty: boolean;
  isSaving: boolean;
  // External comparison
  externalNum1?: string;
  externalNum2?: string;
  externalNum3?: string;
  hasExternalResult?: boolean;
  matchesExternal?: boolean;
}

export interface IndividualResultForm {
  selectedDrawId: number | null;
  num1: string;
  num2: string;
  num3: string;
  cash3: string;
  pickFour: string;
  pickFive: string;
  bolita1: string;
  bolita2: string;
  singulaccion1: string;
  singulaccion2: string;
  singulaccion3: string;
}

export interface EnabledFields {
  num1: boolean;
  num2: boolean;
  num3: boolean;
  cash3: boolean;
  play4: boolean;
  pick5: boolean;
  bolita1: boolean;
  bolita2: boolean;
  singulaccion1: boolean;
  singulaccion2: boolean;
  singulaccion3: boolean;
}

// Field names as union type for type safety
export type ResultFieldName =
  | 'num1' | 'num2' | 'num3'
  | 'cash3' | 'play4' | 'pick5'
  | 'bolita1' | 'bolita2'
  | 'singulaccion1' | 'singulaccion2' | 'singulaccion3';

// Action types for reducer
export type ResultsAction =
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TAB'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_DRAW_RESULTS'; payload: DrawResultRow[] }
  | { type: 'UPDATE_FIELD'; payload: { drawId: number; field: string; value: string } }
  | { type: 'SET_SAVING'; payload: { drawId: number; isSaving: boolean } }
  | { type: 'MARK_SAVED'; payload: { drawId: number; resultId: number } }
  | { type: 'SET_INDIVIDUAL_FORM'; payload: Partial<IndividualResultForm> }
  | { type: 'RESET_INDIVIDUAL_FORM' }
  | { type: 'SET_EXTERNAL_RESULTS'; payload: ExternalResultDto[] }
  | { type: 'SET_LOGS'; payload: ResultLogDto[] };

export interface ResultsState {
  selectedDate: string;
  activeTab: number;
  logsFilterDate: string;
  drawResults: DrawResultRow[];
  logsData: ResultLogDto[];
  externalResults: ExternalResultDto[];
  individualForm: IndividualResultForm;
  loading: boolean;
  fetchingExternal: boolean;
  comparing: boolean;
  savingIndividual: boolean;
  error: string | null;
  successMessage: string | null;
  autoRefreshEnabled: boolean;
  lastRefresh: Date;
  showCompareDialog: boolean;
}
```

### 3.2 Custom Hook: useResultsState (hooks/useResultsState.ts)

```typescript
import { useReducer, useCallback } from 'react';
import type { ResultsState, ResultsAction, IndividualResultForm } from '../types';

const emptyIndividualForm: IndividualResultForm = {
  selectedDrawId: null,
  num1: '', num2: '', num3: '',
  cash3: '', pickFour: '', pickFive: '',
  bolita1: '', bolita2: '',
  singulaccion1: '', singulaccion2: '', singulaccion3: '',
};

const initialState: ResultsState = {
  selectedDate: new Date().toISOString().split('T')[0],
  activeTab: 0,
  logsFilterDate: '',
  drawResults: [],
  logsData: [],
  externalResults: [],
  individualForm: emptyIndividualForm,
  loading: false,
  fetchingExternal: false,
  comparing: false,
  savingIndividual: false,
  error: null,
  successMessage: null,
  autoRefreshEnabled: true,
  lastRefresh: new Date(),
  showCompareDialog: false,
};

function resultsReducer(state: ResultsState, action: ResultsAction): ResultsState {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };

    case 'SET_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload };

    case 'SET_DRAW_RESULTS':
      return { ...state, drawResults: action.payload, lastRefresh: new Date() };

    case 'UPDATE_FIELD':
      return {
        ...state,
        drawResults: state.drawResults.map((row) =>
          row.drawId === action.payload.drawId
            ? { ...row, [action.payload.field]: action.payload.value, isDirty: true }
            : row
        ),
      };

    case 'SET_SAVING':
      return {
        ...state,
        drawResults: state.drawResults.map((row) =>
          row.drawId === action.payload.drawId
            ? { ...row, isSaving: action.payload.isSaving }
            : row
        ),
      };

    case 'MARK_SAVED':
      return {
        ...state,
        drawResults: state.drawResults.map((row) =>
          row.drawId === action.payload.drawId
            ? { ...row, resultId: action.payload.resultId, hasResult: true, isDirty: false, isSaving: false }
            : row
        ),
      };

    case 'SET_INDIVIDUAL_FORM':
      return { ...state, individualForm: { ...state.individualForm, ...action.payload } };

    case 'RESET_INDIVIDUAL_FORM':
      return { ...state, individualForm: emptyIndividualForm };

    case 'SET_LOGS':
      return { ...state, logsData: action.payload };

    default:
      return state;
  }
}

export function useResultsState() {
  const [state, dispatch] = useReducer(resultsReducer, initialState);

  // Memoized action creators
  const setDate = useCallback((date: string) =>
    dispatch({ type: 'SET_DATE', payload: date }), []);

  const setTab = useCallback((tab: number) =>
    dispatch({ type: 'SET_TAB', payload: tab }), []);

  const setError = useCallback((error: string | null) =>
    dispatch({ type: 'SET_ERROR', payload: error }), []);

  const setSuccess = useCallback((message: string | null) =>
    dispatch({ type: 'SET_SUCCESS', payload: message }), []);

  const updateField = useCallback((drawId: number, field: string, value: string) =>
    dispatch({ type: 'UPDATE_FIELD', payload: { drawId, field, value } }), []);

  const setSaving = useCallback((drawId: number, isSaving: boolean) =>
    dispatch({ type: 'SET_SAVING', payload: { drawId, isSaving } }), []);

  const markSaved = useCallback((drawId: number, resultId: number) =>
    dispatch({ type: 'MARK_SAVED', payload: { drawId, resultId } }), []);

  return {
    state,
    dispatch,
    actions: {
      setDate,
      setTab,
      setError,
      setSuccess,
      updateField,
      setSaving,
      markSaved,
    },
  };
}
```

### 3.3 Componente Memoizado: ResultsTableRow (components/ResultsTable/ResultsTableRow.tsx)

```typescript
import React, { memo, useCallback } from 'react';
import { TableRow, TableCell, TextField, Typography, IconButton, Tooltip, Button, CircularProgress } from '@mui/material';
import { Edit as EditIcon, Warning as WarningIcon } from '@mui/icons-material';
import type { DrawResultRow, EnabledFields } from '../../types';
import { getEnabledFields } from '../../utils/fieldConfig';
import { TABLE_CELL_STYLES, INPUT_STYLES } from '../../constants';

interface ResultsTableRowProps {
  row: DrawResultRow;
  onFieldChange: (drawId: number, field: string, value: string, inputEl?: HTMLInputElement) => void;
  onSave: (drawId: number) => void;
  onEdit: (row: DrawResultRow) => void;
}

// Memoized comparison function - only re-render if row data changes
const arePropsEqual = (prev: ResultsTableRowProps, next: ResultsTableRowProps): boolean => {
  const p = prev.row;
  const n = next.row;
  return (
    p.drawId === n.drawId &&
    p.num1 === n.num1 &&
    p.num2 === n.num2 &&
    p.num3 === n.num3 &&
    p.cash3 === n.cash3 &&
    p.play4 === n.play4 &&
    p.pick5 === n.pick5 &&
    p.isDirty === n.isDirty &&
    p.isSaving === n.isSaving &&
    p.hasResult === n.hasResult &&
    p.matchesExternal === n.matchesExternal
  );
};

export const ResultsTableRow = memo<ResultsTableRowProps>(({
  row,
  onFieldChange,
  onSave,
  onEdit
}) => {
  const enabledFields = getEnabledFields(row.drawName);

  // Stable handler that includes input element for auto-advance
  const handleChange = useCallback((field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(row.drawId, field, e.target.value, e.target);
    }, [row.drawId, onFieldChange]);

  const handleSave = useCallback(() => onSave(row.drawId), [row.drawId, onSave]);
  const handleEdit = useCallback(() => onEdit(row), [row, onEdit]);

  return (
    <TableRow hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
      {/* Draw Name Cell */}
      <TableCell sx={TABLE_CELL_STYLES.drawName}>
        {row.drawName}
        {row.matchesExternal === false && (
          <Tooltip title="No coincide con externo">
            <WarningIcon sx={{ ml: 1, fontSize: 14, color: '#ff9800', verticalAlign: 'middle' }} />
          </Tooltip>
        )}
      </TableCell>

      {/* Number Input Cells */}
      <ResultInputCell
        value={row.num1}
        enabled={enabledFields.num1}
        isSaving={row.isSaving}
        maxLength={2}
        width={40}
        onChange={handleChange('num1')}
      />
      <ResultInputCell
        value={row.num2}
        enabled={enabledFields.num2}
        isSaving={row.isSaving}
        maxLength={2}
        width={40}
        onChange={handleChange('num2')}
      />
      <ResultInputCell
        value={row.num3}
        enabled={enabledFields.num3}
        isSaving={row.isSaving}
        maxLength={2}
        width={40}
        onChange={handleChange('num3')}
      />
      <ResultInputCell
        value={row.cash3}
        enabled={enabledFields.cash3}
        isSaving={row.isSaving}
        maxLength={3}
        width={50}
        onChange={handleChange('cash3')}
      />
      <ResultInputCell
        value={row.play4}
        enabled={enabledFields.play4}
        isSaving={row.isSaving}
        maxLength={4}
        width={55}
        onChange={handleChange('play4')}
      />
      <ResultInputCell
        value={row.pick5}
        enabled={enabledFields.pick5}
        isSaving={row.isSaving}
        maxLength={5}
        width={60}
        onChange={handleChange('pick5')}
      />

      {/* Action Cells */}
      <TableCell align="center" sx={{ p: 0.5 }}>
        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          disabled={!row.isDirty || row.isSaving}
          sx={TABLE_CELL_STYLES.saveButton}
        >
          {row.isSaving ? <CircularProgress size={12} color="inherit" /> : 'ver'}
        </Button>
      </TableCell>
      <TableCell align="center" sx={{ p: 0.5 }}>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={handleEdit} sx={{ color: '#37b9f9' }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}, arePropsEqual);

ResultsTableRow.displayName = 'ResultsTableRow';
```

### 3.4 Componente Memoizado: ResultInputCell

```typescript
import React, { memo } from 'react';
import { TableCell, TextField, Typography } from '@mui/material';
import { INPUT_STYLES } from '../../constants';

interface ResultInputCellProps {
  value: string;
  enabled: boolean;
  isSaving: boolean;
  maxLength: number;
  width: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ResultInputCell = memo<ResultInputCellProps>(({
  value,
  enabled,
  isSaving,
  maxLength,
  width,
  onChange,
}) => {
  const hasValue = Boolean(value);

  if (!enabled) {
    return (
      <TableCell align="center" sx={{ p: 0.5, bgcolor: '#fff', borderRight: '1px solid #e0e0e0' }}>
        <Typography variant="body2" sx={{ color: '#ccc', fontSize: '12px' }}>-</Typography>
      </TableCell>
    );
  }

  return (
    <TableCell
      align="center"
      sx={{
        p: 0.5,
        bgcolor: hasValue ? '#c5f0f0' : '#fff',
        borderRight: '1px solid #e0e0e0'
      }}
    >
      <TextField
        value={value}
        onChange={onChange}
        disabled={isSaving}
        size="small"
        inputProps={{
          maxLength,
          style: INPUT_STYLES.input,
        }}
        sx={{
          width,
          ...INPUT_STYLES.textField,
        }}
      />
    </TableCell>
  );
});

ResultInputCell.displayName = 'ResultInputCell';
```

### 3.5 Constants (constants/index.ts)

```typescript
// Centralized styles to avoid object recreation on each render

export const TABLE_CELL_STYLES = {
  drawName: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontSize: '12px',
    bgcolor: '#f5f5f5',
    color: '#333',
    borderRight: '1px solid #e0e0e0',
  },
  header: {
    fontWeight: 600,
    bgcolor: '#f5f5f5',
    fontSize: '13px',
    color: '#555',
  },
  saveButton: {
    bgcolor: '#37b9f9',
    '&:hover': { bgcolor: '#2da8e8' },
    '&.Mui-disabled': { bgcolor: '#b0e0e6', color: '#fff' },
    textTransform: 'none',
    minWidth: 40,
    fontWeight: 500,
    fontSize: '11px',
    py: 0.3,
    px: 1,
  },
} as const;

export const INPUT_STYLES = {
  input: {
    textAlign: 'center' as const,
    padding: '4px 6px',
    fontWeight: 700,
    fontSize: '13px',
    color: '#333',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'transparent',
      '& fieldset': { border: '1px solid #ddd' },
      '&:hover fieldset': { border: '1px solid #bbb' },
      '&.Mui-focused fieldset': { border: '1px solid #37b9f9' },
    },
  },
} as const;

export const BUTTON_STYLES = {
  publishAll: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' },
    textTransform: 'uppercase',
    fontWeight: 700,
    fontSize: '13px',
    px: 3,
    py: 1.5,
    borderRadius: 6,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#fff',
  },
  unlock: {
    background: '#f5d623 !important',
    '&:hover': { background: '#e6c700 !important' },
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '12px',
    color: '#333 !important',
    px: 2,
    py: 1,
    borderRadius: 6,
  },
  external: {
    green: {
      bgcolor: '#4caf50',
      '&:hover': { bgcolor: '#45a049' },
      textTransform: 'none',
      fontWeight: 600,
    },
    blue: {
      bgcolor: '#2196f3',
      '&:hover': { bgcolor: '#1976d2' },
      textTransform: 'none',
      fontWeight: 600,
    },
  },
} as const;

export const AUTO_REFRESH_INTERVAL = 60_000; // 60 seconds

export const FIELD_MAX_LENGTHS: Record<string, number> = {
  num1: 2,
  num2: 2,
  num3: 2,
  bolita1: 2,
  bolita2: 2,
  singulaccion1: 2,
  singulaccion2: 2,
  singulaccion3: 2,
  cash3: 3,
  play4: 4,
  pickFour: 4,
  pick5: 5,
  pickFive: 5,
};

export const FIELD_ORDER = ['num1', 'num2', 'num3', 'cash3', 'play4', 'pick5'];

export const INDIVIDUAL_FIELD_ORDER = [
  'num1', 'num2', 'num3', 'cash3', 'pickFour',
  'bolita1', 'bolita2', 'singulaccion1', 'singulaccion2', 'singulaccion3'
];
```

### 3.6 Utils Consolidados (utils/fieldConfig.ts)

```typescript
import { getDrawCategory } from '@services/betTypeCompatibilityService';
import type { EnabledFields } from '../types';
import { FIELD_MAX_LENGTHS } from '../constants';

// Single source of truth for max lengths
export const getMaxLength = (field: string): number => {
  return FIELD_MAX_LENGTHS[field] ?? 2;
};

// Alias for backward compatibility
export const getIndividualMaxLength = getMaxLength;

// Default all fields disabled
const ALL_DISABLED: EnabledFields = {
  num1: false, num2: false, num3: false,
  cash3: false, play4: false, pick5: false,
  bolita1: false, bolita2: false,
  singulaccion1: false, singulaccion2: false, singulaccion3: false,
};

// Memoize enabled fields by draw name to avoid recalculation
const enabledFieldsCache = new Map<string, EnabledFields>();

export const getEnabledFields = (drawName: string): EnabledFields => {
  // Check cache first
  const cached = enabledFieldsCache.get(drawName);
  if (cached) return cached;

  const category = getDrawCategory(drawName);
  let result: EnabledFields;

  switch (category) {
    case 'DOMINICAN':
    case 'ANGUILA':
    case 'PANAMA':
      result = { ...ALL_DISABLED, num1: true, num2: true, num3: true };
      break;

    case 'USA':
      result = {
        ...ALL_DISABLED,
        num1: true, num2: true, num3: true,
        cash3: true, play4: true, pick5: false,
        bolita1: true, bolita2: true,
        singulaccion1: true, singulaccion2: true, singulaccion3: true,
      };
      break;

    case 'SUPER_PALE':
      result = { ...ALL_DISABLED, num1: true, num2: true };
      break;

    case 'GENERAL':
    default:
      result = {
        num1: true, num2: true, num3: true,
        cash3: true, play4: true, pick5: true,
        bolita1: true, bolita2: true,
        singulaccion1: true, singulaccion2: true, singulaccion3: true,
      };
  }

  // Cache the result
  enabledFieldsCache.set(drawName, result);
  return result;
};
```

---

## 4. Problemas Específicos y Soluciones

### 4.1 Re-renders Innecesarios (CRÍTICO)

**Problema actual (líneas 379-414):**
```typescript
// Cada cambio en cualquier input causa re-render de TODAS las filas
const handleFieldChange = useCallback((drawId: number, field: string, value: string) => {
  setDrawResults((prev) =>
    prev.map((row) => {  // ← Recrea todo el array
      if (row.drawId !== drawId) return row;
      return { ...row, [field]: sanitizedValue, isDirty: true };
    })
  );
}, []);
```

**Solución:**
- Usar `React.memo` con custom comparison en `ResultsTableRow`
- Solo re-renderizar la fila que cambió
- Usar `useReducer` para updates inmutables más eficientes

### 4.2 Estilos Inline Recreados (líneas 1069-1204)

**Problema actual:**
```typescript
// Cada render crea nuevos objetos
<TableCell sx={{ p: 0.5, bgcolor: row.num1 ? '#c5f0f0' : '#fff' }}>
  <TextField sx={{ width: 40, '& .MuiOutlinedInput-root': { ... } }} />
</TableCell>
```

**Solución:**
- Mover estilos a `constants/index.ts`
- Usar `useMemo` para estilos dinámicos
- Crear componentes especializados que encapsulen estilos

### 4.3 Funciones Duplicadas (líneas 361-376 y 653-673)

**Problema actual:**
```typescript
// Dos funciones casi idénticas
const getMaxLength = (field: string): number => { ... };
const getIndividualMaxLength = (field: string): number => { ... };
```

**Solución:**
- Una única función en `utils/fieldConfig.ts`
- Lookup table en lugar de switch statement

### 4.4 Lógica Compleja en JSX (líneas 874-933)

**Problema actual:**
```typescript
{individualForm.selectedDrawId && (() => {
  const selectedDraw = drawResults.find(...);
  const enabledFields = selectedDraw ? getEnabledFields(...) : defaultEnabled;
  const primaryFields = [...].filter(f => f.enabled);
  return (
    <Box>...</Box>
  );
})()}
```

**Solución:**
- Extraer a componente separado `IndividualResultForm.tsx`
- Usar `useMemo` para `primaryFields` y `enabledFields`

---

## 5. Checklist de Implementación

### Fase 1: Preparación (1-2 horas)
- [ ] Crear estructura de carpetas
- [ ] Mover tipos a `types/index.ts`
- [ ] Mover constantes a `constants/index.ts`
- [ ] Crear `utils/fieldConfig.ts` con funciones consolidadas
- [ ] Crear `utils/validation.ts`

### Fase 2: Custom Hooks (2-3 horas)
- [ ] Implementar `useResultsState` con useReducer
- [ ] Implementar `useResultsData` para fetching
- [ ] Implementar `useAutoRefresh`
- [ ] Implementar `useFieldNavigation` para auto-advance

### Fase 3: Componentes (3-4 horas)
- [ ] Crear `ResultsTableRow` memoizado
- [ ] Crear `ResultInputCell` memoizado
- [ ] Crear `ResultsTableHeader`
- [ ] Crear `ResultsTable` contenedor
- [ ] Crear `IndividualResultForm`
- [ ] Crear `ResultsActions`
- [ ] Crear `ResultsLogs`
- [ ] Crear `CompareDialog`
- [ ] Crear `ResultsSummary`

### Fase 4: Integración (1-2 horas)
- [ ] Refactorizar `Results.tsx` como orquestador
- [ ] Verificar que todo funciona
- [ ] Tests manuales de auto-advance
- [ ] Tests manuales de guardado

### Fase 5: Optimización Final (1 hora)
- [ ] Verificar con React DevTools Profiler
- [ ] Ajustar memoización si es necesario
- [ ] Limpiar código no utilizado

---

## 6. Métricas de Éxito

### Performance
- [ ] Input en tabla no causa re-render de otras filas
- [ ] Auto-refresh no bloquea UI
- [ ] Tiempo de interacción < 100ms

### Mantenibilidad
- [ ] Ningún archivo > 300 líneas
- [ ] Cada componente tiene una sola responsabilidad
- [ ] Hooks reutilizables en otros módulos

### Código
- [ ] 0 duplicaciones de lógica
- [ ] Estilos centralizados
- [ ] Tipos completos y correctos

---

## 7. Notas para el Senior Developer

1. **Prioridad de implementación:** Empezar por hooks (`useResultsState`) antes de componentes

2. **No romper funcionalidad:** Mantener backup del archivo original, hacer cambios incrementales

3. **Auto-advance:** La lógica actual usa DOM queries (`querySelectorAll`). Considerar usar refs por fila para mejor control

4. **Testing:** Probar especialmente:
   - Auto-advance entre campos
   - Guardado individual y masivo
   - Auto-refresh no interrumpe edición en curso
   - Logs muestran datos reales de API

5. **Convenciones del proyecto:**
   - Variables en inglés, UI en español
   - Nombres de archivo en PascalCase para componentes
   - Usar barrel exports (`index.ts`)

---

**Autor:** Claude (Optimización)
**Revisado:** Pendiente
**Estado:** Plan listo para implementación
