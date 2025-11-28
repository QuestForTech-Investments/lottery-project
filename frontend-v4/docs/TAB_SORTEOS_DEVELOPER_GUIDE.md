# Tab Sorteos - Guía para Desarrolladores

## Introducción

Esta guía documenta la implementación del tab "Sorteos" en el componente `CreateBanca.jsx`. El tab permite seleccionar múltiples sorteos disponibles y aplicar configuraciones de cierre anticipado.

---

## Arquitectura

### Estructura de Datos

```javascript
// Estado en formData
{
  selectedLotteries: [], // Array de IDs de sorteos seleccionados
  anticipatedClosing: '' // String con el valor de cierre anticipado
}
```

### Lista Completa de Sorteos

```javascript
const lotteries = [
  { id: 1, name: 'LA PRIMERA' },
  { id: 2, name: 'NEW YORK DAY' },
  // ... 67 sorteos más
  { id: 1432, name: 'LA SUERTE 6:00pm' }
];
```

**Total**: 69 sorteos únicos

---

## Funciones Principales

### 1. handleLotteryToggle(lotteryId)

**Propósito**: Toggle de un sorteo individual

**Parámetros**:
- `lotteryId` (number): ID del sorteo a toggle

**Comportamiento**:
```javascript
const handleLotteryToggle = (lotteryId) => {
  setFormData(prev => ({
    ...prev,
    selectedLotteries: prev.selectedLotteries.includes(lotteryId)
      ? prev.selectedLotteries.filter(id => id !== lotteryId) // Quitar
      : [...prev.selectedLotteries, lotteryId] // Agregar
  }));
};
```

**Ejemplo de uso**:
```javascript
// Usuario hace click en "LA PRIMERA" (ID: 1)
handleLotteryToggle(1);

// Estado antes: selectedLotteries = []
// Estado después: selectedLotteries = [1]

// Usuario hace click nuevamente en "LA PRIMERA"
handleLotteryToggle(1);
// Estado después: selectedLotteries = []
```

---

### 2. handleToggleAllLotteries()

**Propósito**: Seleccionar/deseleccionar todos los sorteos

**Parámetros**: Ninguno

**Comportamiento**:
```javascript
const handleToggleAllLotteries = () => {
  const allLotteries = [1, 2, 3, ..., 1432]; // 69 IDs

  setFormData(prev => ({
    ...prev,
    selectedLotteries: prev.selectedLotteries.length === allLotteries.length
      ? [] // Si todos están seleccionados, deseleccionar
      : allLotteries // Si no, seleccionar todos
  }));
};
```

**Ejemplo de uso**:
```javascript
// Usuario hace click en botón "TODOS"
handleToggleAllLotteries();

// Estado antes: selectedLotteries = [1, 2, 3]
// Estado después: selectedLotteries = [1, 2, 3, ..., 1432] (todos)

// Usuario hace click nuevamente
handleToggleAllLotteries();
// Estado después: selectedLotteries = []
```

---

## Componentes UI

### Botón de Sorteo Individual

```jsx
<label
  key={lottery.id}
  className={`sorteo-btn-label ${formData.selectedLotteries.includes(lottery.id) ? 'active' : ''}`}
  style={index === 0 ? { borderRadius: '3.2px 0px 0px 3.2px', marginLeft: 0 } : {}}
>
  <input
    type="checkbox"
    checked={formData.selectedLotteries.includes(lottery.id)}
    onChange={() => handleLotteryToggle(lottery.id)}
  />
  {lottery.name}
</label>
```

**Clases CSS**:
- `.sorteo-btn-label`: Clase base del botón
- `.active`: Aplicada cuando el sorteo está seleccionado

**Estados**:
- **Activo**: Background #51cbce, texto blanco
- **Inactivo**: Background transparente, texto #51cbce, border #51cbce

---

### Botón "TODOS"

```jsx
<label
  className={`sorteo-todos-btn ${allSelected ? 'active' : ''}`}
  onClick={handleToggleAllLotteries}
>
  <input
    type="checkbox"
    checked={allSelected}
    onChange={handleToggleAllLotteries}
  />
  Todos
</label>
```

**Lógica de Estado**:
```javascript
const allLotteryIds = lotteries.map(l => l.id);
const allSelected = allLotteryIds.every(id =>
  formData.selectedLotteries.includes(id)
);
```

---

### Selector de Cierre Anticipado

```jsx
<select
  id="anticipatedClosing"
  name="anticipatedClosing"
  value={formData.anticipatedClosing}
  onChange={handleInputChange}
  className="cierre-anticipado-select"
>
  <option value="">Seleccione</option>
  <option value="5min">5 minutos</option>
  <option value="10min">10 minutos</option>
  <option value="15min">15 minutos</option>
  <option value="20min">20 minutos</option>
  <option value="30min">30 minutos</option>
  <option value="1hour">1 hora</option>
</select>
```

**Valores Posibles**:
- `""` (vacío): No hay cierre anticipado
- `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`

---

## Estilos CSS

### Variables de Color

```css
/* Color primario */
--primary-color: rgb(81, 203, 206);
--primary-border: 1.11111px solid rgb(81, 203, 206);

/* Texto */
--text-active: rgba(255, 255, 255, 0.8);
--text-inactive: rgb(81, 203, 206);

/* Backgrounds */
--bg-active: rgb(81, 203, 206);
--bg-inactive: rgba(0, 0, 0, 0); /* transparente */
```

### Clases Principales

#### .sorteo-btn-label
```css
.sorteo-btn-label {
  font-family: Montserrat, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  background-color: rgb(81, 203, 206);
  border: 1.11111px solid rgb(81, 203, 206);
  padding: 4px 8px;
  height: 31px;
  border-radius: 0px;
  margin: 0 1px 10px -3px;
}

.sorteo-btn-label:first-child {
  border-radius: 3.2px 0px 0px 3.2px;
  margin-left: 0;
}

.sorteo-btn-label:not(.active) {
  background-color: rgba(0, 0, 0, 0);
  color: rgb(81, 203, 206);
}
```

#### .sorteo-todos-btn
```css
.sorteo-todos-btn {
  width: 75px;
  height: 28px;
  border-radius: 3.2px;
  /* Resto igual a sorteo-btn-label */
}
```

#### .cierre-anticipado-select
```css
.cierre-anticipado-select {
  width: 469px;
  height: 40px;
  border: 2px solid rgb(232, 232, 232);
  border-radius: 5px;
  padding: 8px 40px 8px 8px;
  /* Dropdown arrow personalizada */
}
```

---

## Responsive Design

### Breakpoints

```css
/* Desktop large (>1400px) */
@media (max-width: 1400px) {
  .sorteo-btn-label {
    font-size: 13px;
    min-width: 50px;
  }
}

/* Desktop (1200-1400px) */
@media (max-width: 1200px) {
  .sorteo-btn-label {
    font-size: 12px;
    min-width: 45px;
  }
}

/* Tablet (992-1200px) */
@media (max-width: 992px) {
  .sorteo-btn-label {
    font-size: 11px;
    height: 28px;
  }
  .cierre-anticipado-select-wrapper {
    width: 100%;
  }
}

/* Mobile (768-992px) */
@media (max-width: 768px) {
  .sorteo-btn-label {
    font-size: 10px;
    height: 26px;
  }
}

/* Mobile small (<576px) */
@media (max-width: 576px) {
  .sorteo-btn-label {
    font-size: 9px;
    height: 24px;
  }
}
```

---

## Integración con Backend

### Formato de Envío

Cuando el usuario hace submit del formulario, los datos de sorteos se envían como:

```javascript
// Payload al backend
{
  // ... otros campos de formData
  selectedLotteries: [1, 2, 3, 4, 5, 6, 7], // Array de IDs
  anticipatedClosing: "15min" // String
}
```

### Validaciones Sugeridas (Backend)

1. **selectedLotteries**:
   - Tipo: Array de números enteros
   - Validar que cada ID existe en la base de datos
   - Opcional: Al menos 1 sorteo requerido

2. **anticipatedClosing**:
   - Tipo: String
   - Valores válidos: "", "5min", "10min", "15min", "20min", "30min", "1hour"
   - Puede ser vacío (sin cierre anticipado)

### Ejemplo de Validación (Joi/Yup)

```javascript
const schema = {
  selectedLotteries: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1) // Al menos 1 sorteo
    .required(),
  anticipatedClosing: Joi.string()
    .allow('')
    .valid('', '5min', '10min', '15min', '20min', '30min', '1hour')
};
```

---

## Testing

### Tests Unitarios

```javascript
describe('Tab Sorteos', () => {
  test('handleLotteryToggle agrega sorteo', () => {
    const initialState = { selectedLotteries: [] };
    handleLotteryToggle(1);
    expect(formData.selectedLotteries).toEqual([1]);
  });

  test('handleLotteryToggle quita sorteo', () => {
    const initialState = { selectedLotteries: [1] };
    handleLotteryToggle(1);
    expect(formData.selectedLotteries).toEqual([]);
  });

  test('handleToggleAllLotteries selecciona todos', () => {
    const initialState = { selectedLotteries: [] };
    handleToggleAllLotteries();
    expect(formData.selectedLotteries.length).toBe(69);
  });

  test('handleToggleAllLotteries deselecciona todos', () => {
    const initialState = { selectedLotteries: allLotteryIds };
    handleToggleAllLotteries();
    expect(formData.selectedLotteries).toEqual([]);
  });
});
```

### Tests de Integración

```javascript
describe('Tab Sorteos Integration', () => {
  test('Click en sorteo actualiza UI', () => {
    render(<CreateBanca />);
    const sorteoBtn = screen.getByText('LA PRIMERA');

    fireEvent.click(sorteoBtn);
    expect(sorteoBtn).toHaveClass('active');

    fireEvent.click(sorteoBtn);
    expect(sorteoBtn).not.toHaveClass('active');
  });

  test('Click en TODOS selecciona todos los sorteos', () => {
    render(<CreateBanca />);
    const todosBtn = screen.getByText('Todos');

    fireEvent.click(todosBtn);

    const sorteoBtns = screen.getAllByRole('checkbox', { name: /LA|NEW|FLORIDA/i });
    sorteoBtns.forEach(btn => {
      expect(btn).toBeChecked();
    });
  });
});
```

---

## Troubleshooting

### Problema: Sorteos no se seleccionan

**Causa**: handleLotteryToggle no está vinculada correctamente

**Solución**:
```javascript
// Verificar que onChange apunta a la función correcta
<input
  onChange={() => handleLotteryToggle(lottery.id)} // Correcto
  onChange={handleLotteryToggle} // Incorrecto (falta parámetro)
/>
```

### Problema: Estado no persiste al cambiar tabs

**Causa**: Estado local en lugar de formData

**Solución**:
```javascript
// Incorrecto
const [selectedLotteries, setSelectedLotteries] = useState([]);

// Correcto
const [formData, setFormData] = useState({
  selectedLotteries: []
});
```

### Problema: Botón TODOS no funciona

**Causa**: Lista de IDs incompleta o incorrecta

**Solución**:
```javascript
// Verificar que allLotteries incluye los 69 IDs
const allLotteries = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  24, 25, 30, 31, 34, 35, 38, 39, 40, 53, 54, 55, 56, 61, 62, 63, 64, 65, 66,
  73, 74, 75, 76, 82, 83, 211, 244, 245, 277, 376, 377, 411, 412, 541, 542,
  607, 608, 609, 610, 673, 674, 675, 970, 1036, 1168, 1300, 1366, 1432
];

console.log(allLotteries.length); // Debe ser 69
```

---

## Performance

### Optimizaciones Implementadas

1. **React Keys Únicos**: Cada sorteo usa `lottery.id` como key
2. **Estado Centralizado**: Un solo `formData` para todo el formulario
3. **Memoización No Necesaria**: Solo 69 elementos, render es rápido
4. **CSS Eficiente**: Clases reutilizables, sin animaciones pesadas

### Métricas Esperadas

- **Render Inicial**: < 50ms
- **Toggle Individual**: < 10ms
- **Toggle Todos (69 sorteos)**: < 100ms
- **Cambio de Tab**: < 20ms

---

## Accesibilidad (a11y)

### Features Implementadas

1. **Labels Semánticos**: Cada checkbox tiene un label asociado
2. **Keyboard Navigation**: Tab entre sorteos, Enter/Space para seleccionar
3. **Focus Visible**: Estados de focus claramente visibles
4. **Screen Reader Support**: Labels legibles por screen readers

### ARIA Attributes (Opcional)

```jsx
<label
  role="checkbox"
  aria-checked={formData.selectedLotteries.includes(lottery.id)}
  aria-label={`Seleccionar sorteo ${lottery.name}`}
>
  {/* ... */}
</label>
```

---

## Mejoras Futuras

### 1. Búsqueda de Sorteos
```jsx
<input
  type="text"
  placeholder="Buscar sorteo..."
  onChange={(e) => setSearchTerm(e.target.value)}
/>

{lotteries
  .filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
  .map(lottery => /* render */)}
```

### 2. Grupos de Sorteos
```jsx
<div className="lottery-groups">
  <button onClick={() => selectByRegion('NY')}>New York</button>
  <button onClick={() => selectByRegion('FL')}>Florida</button>
  <button onClick={() => selectByRegion('TX')}>Texas</button>
</div>
```

### 3. Preview de Selección
```jsx
<div className="selection-preview">
  <span>{formData.selectedLotteries.length} de {lotteries.length} sorteos seleccionados</span>
</div>
```

### 4. Persistencia en LocalStorage
```javascript
useEffect(() => {
  const saved = localStorage.getItem('selectedLotteries');
  if (saved) {
    setFormData(prev => ({ ...prev, selectedLotteries: JSON.parse(saved) }));
  }
}, []);

useEffect(() => {
  localStorage.setItem('selectedLotteries', JSON.stringify(formData.selectedLotteries));
}, [formData.selectedLotteries]);
```

---

## Recursos Adicionales

- **Diseño Original**: `/mnt/c/Users/jorge/Downloads/Captura.PNG`
- **JSON de Configuración**: `/mnt/c/Users/jorge/Downloads/configuracion-componentes.json`
- **CSS Sorteos**: `/mnt/h/GIT/LottoWebApp/src/assets/css/Sorteos.css`
- **Componente**: `/mnt/h/GIT/LottoWebApp/src/components/CreateBanca.jsx`

---

**Última actualización**: 2025-10-19
**Versión**: 1.0
**Mantenedor**: Equipo de Frontend
