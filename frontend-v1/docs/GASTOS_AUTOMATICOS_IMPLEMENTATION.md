# Implementación del Tab "Gastos Automáticos" - Documentación Completa

## 1. Archivos Creados

### Configuración
- **`/mnt/h/GIT/LottoWebApp/src/config/expenseConfig.js`**
  - Constantes centralizadas para tipos de gastos
  - Opciones de frecuencia (Diario, Semanal, Quincenal, Mensual)
  - Días de la semana
  - Valores por defecto
  - Opciones de paginación
  - **Propósito:** Evitar hardcoding de datos en componentes

### Custom Hook
- **`/mnt/h/GIT/LottoWebApp/src/hooks/useExpenses.js`**
  - Lógica de negocio para gestión de gastos
  - Operaciones CRUD (Create, Read, Update, Delete)
  - Filtrado y búsqueda
  - Paginación
  - Validación de datos
  - Cálculo de totales
  - **Propósito:** Separar lógica de presentación, reutilizable

### Componentes Reutilizables
- **`/mnt/h/GIT/LottoWebApp/src/components/shared/FormField.jsx`**
  - Input genérico con label y manejo de errores
  - Soporta: text, number, email, password, date
  - Validación integrada
  - Accesibilidad (ARIA labels)
  - **Propósito:** DRY - Don't Repeat Yourself

- **`/mnt/h/GIT/LottoWebApp/src/components/shared/SelectField.jsx`**
  - Select genérico con label y manejo de errores
  - Soporta arrays simples y objetos
  - Configuración de keys personalizable
  - **Propósito:** Componente reutilizable para dropdowns

- **`/mnt/h/GIT/LottoWebApp/src/components/shared/ExpenseRow.jsx`**
  - Fila individual de gasto en la tabla
  - Optimizado con React.memo()
  - Callbacks memoizados con useCallback()
  - Campos dinámicos según frecuencia
  - **Propósito:** Single Responsibility - Una fila hace una cosa

- **`/mnt/h/GIT/LottoWebApp/src/components/shared/Pagination.jsx`**
  - Navegación entre páginas
  - Selector de items por página
  - Información de rango de items
  - Accesibilidad completa
  - **Propósito:** Componente reutilizable para paginación

### Componente Principal del Tab
- **`/mnt/h/GIT/LottoWebApp/src/components/tabs/GastosAutomaticosTab.jsx`**
  - Componente principal del tab
  - Integra todos los componentes y el hook
  - Maneja sincronización con formulario padre
  - Estado vacío elegante
  - Mensajes de error/éxito
  - **Propósito:** Orquestador del tab

### Estilos
- **`/mnt/h/GIT/LottoWebApp/src/assets/css/GastosAutomaticos.css`**
  - Estilos basados en configuracion-estilos.json
  - Responsive design (mobile-first)
  - Estados hover/active/disabled
  - Accesibilidad (focus-visible)
  - Print styles
  - **Propósito:** Diseño consistente y modular

### Documentación
- **`/mnt/h/GIT/LottoWebApp/src/components/tabs/README.md`**
  - Guía de arquitectura de tabs
  - Cómo agregar nuevos tabs
  - Mejores prácticas
  - **Propósito:** Onboarding para nuevos desarrolladores

### Archivos Modificados
- **`/mnt/h/GIT/LottoWebApp/src/components/CreateBanca.jsx`**
  - Import de GastosAutomaticosTab
  - Reemplazo de JSX inline por componente
  - Eliminación de funciones duplicadas
  - **Cambios:** ~70 líneas → 7 líneas en el tab

---

## 2. Estructura de Componentes (Árbol Jerárquico)

```
CreateBanca (1943 líneas → 1875 líneas)
│
└─── GastosAutomaticosTab (230 líneas)
     │
     ├─── ExpenseRow (140 líneas) [React.memo]
     │    │
     │    ├─── SelectField (tipo) [React.memo]
     │    ├─── FormField (descripción) [React.memo]
     │    ├─── SelectField (frecuencia) [React.memo]
     │    ├─── FormField (monto) [React.memo]
     │    ├─── SelectField/FormField (día - dinámico) [React.memo]
     │    └─── RemoveButton
     │
     └─── Pagination (110 líneas) [React.memo]
          ├─── ItemsPerPageSelector
          └─── PageNavigationButtons

Hooks Utilizados:
├─── useExpenses (custom - 185 líneas)
│    └─── useState, useCallback, useMemo
│
└─── React built-in hooks
     ├─── useState
     ├─── useCallback
     ├─── useMemo
     └─── useEffect

Configuración:
└─── expenseConfig.js (60 líneas)
     ├─── EXPENSE_TYPES (10 tipos)
     ├─── FREQUENCY_OPTIONS (4 opciones)
     ├─── WEEKDAYS (7 días)
     ├─── DEFAULT_EXPENSE
     └─── PAGINATION_OPTIONS
```

---

## 3. Props de Cada Componente

### GastosAutomaticosTab
```javascript
PropTypes: {
  formData: PropTypes.shape({
    autoExpenses: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.string,
      description: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      frequency: PropTypes.string,
      day: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      date: PropTypes.string
    }))
  }).isRequired,
  onChange: PropTypes.func.isRequired,  // Callback para actualizar formData padre
  error: PropTypes.string,              // Mensaje de error
  success: PropTypes.string             // Mensaje de éxito
}
```

### ExpenseRow
```javascript
PropTypes: {
  expense: PropTypes.shape({
    type: PropTypes.string,             // ID del tipo de gasto
    description: PropTypes.string,      // Descripción
    amount: PropTypes.oneOfType([...]), // Monto numérico
    frequency: PropTypes.string,        // daily|weekly|biweekly|monthly
    day: PropTypes.oneOfType([...]),    // Día (1-31 o 0-6)
    date: PropTypes.string              // Fecha ISO
  }).isRequired,
  index: PropTypes.number.isRequired,   // Índice en el array
  onUpdate: PropTypes.func.isRequired,  // (index, field, value) => void
  onRemove: PropTypes.func.isRequired,  // (index) => void
  errors: PropTypes.object              // { field: errorMessage }
}
```

### FormField
```javascript
PropTypes: {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'number', 'email', 'password', 'date']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  min: PropTypes.oneOfType([...]),
  max: PropTypes.oneOfType([...]),
  step: PropTypes.oneOfType([...]),
  autoComplete: PropTypes.string
}
```

### SelectField
```javascript
PropTypes: {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
      value: PropTypes.oneOfType([...]),
      label: PropTypes.string
    })
  ])),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  valueKey: PropTypes.string,    // Para objetos: qué campo usar como value
  labelKey: PropTypes.string     // Para objetos: qué campo usar como label
}
```

### Pagination
```javascript
PropTypes: {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number)
}
```

---

## 4. Estado Manejado

### Estado Principal (formData.autoExpenses)
```javascript
// Vive en CreateBanca
formData: {
  autoExpenses: [
    {
      id: 1698765432123,           // Timestamp como ID único
      type: 'electricity',         // ID del tipo
      description: 'Luz oficina',  // Descripción del usuario
      amount: '150.00',            // String para evitar problemas de precision
      frequency: 'monthly',        // daily|weekly|biweekly|monthly
      day: '15',                   // Día del mes (1-31) o día de semana (0-6)
      date: '2025-10-19'           // Fecha ISO para gastos únicos
    }
  ]
}
```

### Estado Local (useExpenses hook)
```javascript
// Dentro del hook useExpenses
{
  expenses: [...],           // Array completo de gastos
  filter: '',                // String de búsqueda
  currentPage: 1,            // Página actual
  itemsPerPage: 20,          // Items por página

  // Computed (useMemo)
  filteredExpenses: [...],   // Gastos después de aplicar filtro
  paginatedExpenses: [...],  // Gastos de la página actual
  totalPages: 5,             // Total de páginas
  totalAmount: 1250.50       // Suma total de todos los gastos
}
```

### Flujo de Sincronización
```
1. Usuario agrega gasto
   ↓
2. useExpenses.addExpense() actualiza estado local
   ↓
3. Llama onUpdate(updatedExpenses)
   ↓
4. GastosAutomaticosTab recibe updatedExpenses
   ↓
5. Llama onChange({ target: { name: 'autoExpenses', value: updatedExpenses }})
   ↓
6. CreateBanca.handleInputChange actualiza formData
   ↓
7. Re-render con nuevo estado
   ↓
8. useExpenses recibe nuevos initialExpenses
```

---

## 5. Decisiones de Diseño Importantes

### a) Arquitectura Modular
**Decisión:** Separar en múltiples archivos pequeños vs. un archivo grande

**Razón:**
- Facilita mantenimiento
- Permite reutilización
- Mejora testing (unit tests más fáciles)
- Reduce acoplamiento

**Trade-off:** Más archivos, pero cada uno es simple y fácil de entender

---

### b) Custom Hook (useExpenses)
**Decisión:** Extraer lógica de negocio a un hook personalizado

**Razón:**
- Separation of Concerns
- Testeable independientemente
- Reutilizable en otros componentes
- Simplifica el componente de presentación

**Alternativa rechazada:** Poner toda la lógica en el componente (anti-pattern)

---

### c) React.memo() en Componentes
**Decisión:** Usar React.memo() en ExpenseRow, FormField, SelectField, Pagination

**Razón:**
- Previene re-renders innecesarios
- Mejora performance con listas grandes
- No hay costo si las props no cambian

**Cuándo NO usarlo:** Componentes que siempre cambian (como el tab principal)

---

### d) useCallback() para Handlers
**Decisión:** Wrappear funciones de manejo de eventos en useCallback()

**Razón:**
- Evita crear nuevas funciones en cada render
- Crucial para componentes memoizados
- Mejor performance en listas

**Ejemplo:**
```javascript
// ❌ MAL: Nueva función en cada render
<button onClick={() => removeExpense(index)}>Eliminar</button>

// ✅ BIEN: Función memoizada
const handleRemove = useCallback(() => {
  removeExpense(index);
}, [index, removeExpense]);

<button onClick={handleRemove}>Eliminar</button>
```

---

### e) useMemo() para Cálculos Costosos
**Decisión:** Usar useMemo() para filtrado, paginación y totales

**Razón:**
- Evita recalcular en cada render
- Mejora performance con datasets grandes
- Solo recalcula cuando dependencias cambian

**Ejemplos en useExpenses:**
```javascript
const filteredExpenses = useMemo(() => {
  // Solo se ejecuta cuando expenses o filter cambian
  return expenses.filter(e => e.description.includes(filter));
}, [expenses, filter]);

const totalAmount = useMemo(() => {
  // Solo se ejecuta cuando expenses cambia
  return expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
}, [expenses]);
```

---

### f) PropTypes vs TypeScript
**Decisión:** Usar PropTypes por ahora

**Razón:**
- Proyecto actual usa JavaScript
- PropTypes da type checking en desarrollo
- Menos setup que TypeScript

**Futuro:** Migrar a TypeScript cuando el proyecto esté listo

---

### g) Configuración Centralizada
**Decisión:** Crear expenseConfig.js con todas las constantes

**Razón:**
- Single source of truth
- Fácil de modificar (cambiar tipos de gasto sin tocar componentes)
- Facilita i18n en el futuro
- No magic numbers/strings en código

**Anti-pattern evitado:**
```javascript
// ❌ MAL: Hardcoded
<option value="daily">Diario</option>

// ✅ BIEN: Configuración
{FREQUENCY_OPTIONS.map(opt => (
  <option value={opt.value}>{opt.label}</option>
))}
```

---

### h) Accesibilidad (a11y)
**Decisión:** Implementar ARIA labels, keyboard navigation, focus states

**Razón:**
- Cumplir WCAG 2.1 AA
- Mejor UX para todos los usuarios
- SEO benefits
- Es lo correcto

**Implementaciones:**
- Labels asociados con IDs
- aria-invalid en campos con error
- aria-describedby para mensajes de error
- aria-label en botones sin texto
- role="alert" en mensajes
- Navegación por teclado funcional

---

### i) Diseño Responsive
**Decisión:** Mobile-first con breakpoints en 768px y 1024px

**Razón:**
- Mayoría de usuarios en móvil
- Mejor performance (cargar estilos móvil primero)
- Progresive enhancement

**Breakpoints:**
- < 768px: Stack vertical, tabla scrolleable
- 768px - 1024px: Layout híbrido
- > 1024px: Layout completo

---

### j) Estructura de Estado (Array vs Map)
**Decisión:** Usar Array para expenses

**Razón:**
- Orden importa (display en tabla)
- Fácil mapear en JSX
- Menos overhead que Map

**Trade-off:** Búsqueda O(n) vs O(1) en Map, pero no es problema con paginación

---

## 6. Optimizaciones de Performance

### 1. Paginación
- **Por qué:** Renderizar 1000 filas = lag
- **Solución:** Mostrar solo 20-50 por página
- **Beneficio:** Render time constante

### 2. React.memo()
- **Por qué:** Re-render de 50 filas cuando cambia 1
- **Solución:** Memoizar ExpenseRow
- **Beneficio:** Solo re-renderiza la fila que cambió

### 3. useCallback() para handlers
- **Por qué:** Nueva función = nueva referencia = re-render
- **Solución:** Memoizar funciones
- **Beneficio:** Props estables, menos re-renders

### 4. useMemo() para cálculos
- **Por qué:** Filtrar/sumar en cada render = CPU waste
- **Solución:** Memoizar resultados
- **Beneficio:** Solo recalcula cuando necesario

### 5. Debouncing en filtro (futuro)
- **Por qué:** Filtrar en cada keystroke = lag
- **Solución:** Debounce 300ms
- **Beneficio:** Menos operaciones

---

## 7. Testing Strategy (Para Implementar)

### Unit Tests

**useExpenses.test.js**
```javascript
describe('useExpenses', () => {
  it('should add expense', () => {});
  it('should remove expense', () => {});
  it('should filter expenses', () => {});
  it('should calculate total amount', () => {});
  it('should paginate correctly', () => {});
});
```

**expenseConfig.test.js**
```javascript
describe('expenseConfig', () => {
  it('should have valid expense types', () => {});
  it('should have valid frequency options', () => {});
});
```

### Component Tests

**FormField.test.jsx**
```javascript
describe('FormField', () => {
  it('should render with label', () => {});
  it('should show error message', () => {});
  it('should call onChange', () => {});
  it('should be accessible', () => {});
});
```

**ExpenseRow.test.jsx**
```javascript
describe('ExpenseRow', () => {
  it('should render all fields', () => {});
  it('should call onUpdate', () => {});
  it('should call onRemove', () => {});
  it('should show conditional fields', () => {});
});
```

### Integration Tests

**GastosAutomaticosTab.test.jsx**
```javascript
describe('GastosAutomaticosTab', () => {
  it('should add expense', () => {});
  it('should remove expense', () => {});
  it('should filter expenses', () => {});
  it('should paginate', () => {});
  it('should sync with parent', () => {});
});
```

---

## 8. Checklist de Buenas Prácticas

- [✓] Componentes en archivos separados
- [✓] Cada componente < 250 líneas
- [✓] Props documentadas con PropTypes
- [✓] Custom hooks para lógica compleja
- [✓] No hardcodear datos (usar expenseConfig)
- [✓] React.memo() donde tiene sentido
- [✓] useCallback() para funciones en props
- [✓] useMemo() para cálculos costosos
- [✓] Nombres descriptivos y consistentes
- [✓] Separación de concerns
- [✓] CSS modular (archivo separado)
- [✓] Accesibilidad (labels, aria-*, keyboard)
- [✓] Responsive design
- [✓] Error handling
- [✓] Loading states
- [✓] Empty states
- [✓] PropTypes para type checking
- [✓] Comentarios donde necesario
- [✓] No console.logs
- [✓] No código comentado

---

## 9. Mejoras Futuras

### Prioridad Alta
1. [ ] Agregar tests unitarios e integración
2. [ ] Validación de formulario más robusta
3. [ ] Confirmación antes de eliminar gasto
4. [ ] Ordenamiento de columnas

### Prioridad Media
5. [ ] Export a CSV/Excel
6. [ ] Drag & drop para reordenar
7. [ ] Categorías de gastos
8. [ ] Gráficos de gastos

### Prioridad Baja
9. [ ] Migrar a TypeScript
10. [ ] Agregar Storybook
11. [ ] Internacionalización (i18n)
12. [ ] Dark mode

---

## 10. Cómo Usar

### Agregar Nuevo Gasto
1. Click "Agregar nuevo gasto"
2. Seleccionar tipo
3. Escribir descripción
4. Seleccionar frecuencia
5. Ingresar monto
6. Seleccionar día (si aplica)

### Filtrar Gastos
1. Escribir en campo "Filtrado rápido"
2. Se filtra automáticamente
3. Click X para limpiar

### Paginar
1. Cambiar "Entradas por página"
2. Usar botones << < > >>

### Eliminar Gasto
1. Click icono de basura
2. (Futuro: confirmación)

---

## 11. Troubleshooting

### Problema: Los cambios no se guardan
**Solución:** Verificar que onChange esté conectado correctamente

### Problema: Performance lento con muchos gastos
**Solución:** Reducir itemsPerPage o implementar virtualización

### Problema: Errores de PropTypes en consola
**Solución:** Verificar que formData.autoExpenses sea un array válido

---

## 12. Referencias

- React Documentation: https://react.dev
- PropTypes: https://www.npmjs.com/package/prop-types
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- React Performance: https://react.dev/learn/render-and-commit

---

**Implementado por:** Claude Code
**Fecha:** 2025-10-19
**Versión:** 1.0.0
**Estado:** ✅ Completado - Listo para testing
