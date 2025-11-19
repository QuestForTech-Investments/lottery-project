# Análisis de Pestañas de Ventas del Día

**Fecha:** 2025-11-19
**Aplicación Original:** https://la-numbers.apk.lol/#/sales/daily
**Componente V1:** `frontend-v1/src/components/DailySales.jsx`
**Componente V2:** `frontend-v2/src/components/features/sales/DailySales/index.jsx`

---

## Estado Actual

- ✅ **Tab 1 - General**: IMPLEMENTADO
- ❌ **Tab 2 - Banca por sorteo**: NO IMPLEMENTADO
- ❌ **Tab 3 - Por sorteo**: NO IMPLEMENTADO
- ❌ **Tab 4 - Combinaciones**: NO IMPLEMENTADO
- ❌ **Tab 5 - Por zona**: NO IMPLEMENTADO
- ❌ **Tab 6 - Categoría de Premios**: NO IMPLEMENTADO
- ❌ **Tab 7 - Categoría de Premios para Pale**: NO IMPLEMENTADO

---

## Tab 1: General ✅ (IMPLEMENTADO)

### Título
"Venta del día"

### Filtros
1. **Fecha** - DatePicker (default: hoy)
2. **Zonas** - Multi-select ("10 seleccionadas")
3. **Grupo** - Dropdown simple ("Seleccione")

### Botones de Acción
- VER VENTAS (turquesa)
- PDF (turquesa)
- CSV (turquesa)
- PROCESAR TICKETS DE HOY (turquesa)
- PROCESAR VENTAS DE AYER (turquesa)

### Subtítulo Dinámico
"Neto (banca/grupos/agentes): $0.00"

### Sub-Tabs
- **Bancas** (seleccionado por defecto)

### Filtros de Tabla
Radio buttons:
- Todos
- Con ventas (checked por defecto)
- Con premios
- Con tickets pendientes
- Con ventas netas negativas
- Con ventas netas positivas

### Quick Filter
Input de texto con icono de búsqueda

### Tabla Principal - 15 Columnas
1. Ref.
2. Código
3. P
4. L
5. W
6. Total
7. Venta
8. Comisiones
9. Descuentos
10. Premios
11. Neto
12. Caída
13. Final
14. Balance
15. Caida acumulada

### Fila de Totales
- Etiqueta: "Totales"
- Valores en cada columna (currency format)

### Footer
"Mostrando X entradas"

---

## Tab 2: Banca por sorteo ❌ (NO IMPLEMENTADO)

### Título
"Montos por sorteo y banca"

### Filtros - 4 campos
1. **Fecha inicial** - DatePicker (default: hoy)
2. **Fecha final** - DatePicker (default: hoy)
3. **Sorteos** - Multi-select ("69 seleccionadas")
4. **Zonas** - Multi-select ("10 seleccionadas")

### Botones
- VER VENTAS (turquesa)

### Subtítulo Dinámico
"Total neto: $0.00"

### Mensaje Sin Datos
"No hay entradas para el sorteo y la fecha elegidos"

### Tabla (cuando hay datos)
**Estructura esperada:**
- Tabla agrupada por banca y sorteo
- Columnas por definir (necesita datos para confirmar estructura exacta)
- Probablemente: Banca, Sorteo, Ventas, Premios, Neto

---

## Tab 3: Por sorteo ❌ (NO IMPLEMENTADO)

### Título
"Ventas por sorteo"

### Filtros - 2 campos
1. **Fecha** - DatePicker (default: hoy)
2. **Zonas** - Multi-select ("10 seleccionadas")

### Botones
- VER VENTAS (turquesa)

### Subtítulo Dinámico
"Total neto: $0.00"

### Mensaje Sin Datos
"No hay entradas para la fecha elegida"

### Tabla (cuando hay datos)
**Estructura esperada:**
- Tabla agrupada por sorteo
- Columnas por definir (necesita datos para confirmar estructura exacta)
- Probablemente: Sorteo, Ventas totales, Premios, Comisiones, Neto

---

## Tab 4: Combinaciones ❌ (NO IMPLEMENTADO)

### Título
"Combinaciones"

### Filtros - 4 campos
1. **Fecha** - DatePicker (default: hoy)
2. **Sorteos** - Multi-select ("69 seleccionadas")
3. **Zonas** - Multi-select ("10 seleccionadas")
4. **Bancas** - Multi-select ("Seleccione")

### Botones
- VER VENTAS (turquesa)

### Quick Filter
Input de texto con icono de búsqueda

### Tabla - 6 Columnas (Confirmado)
1. **Combinación** - Número de la combinación
2. **Total Vendido** - Currency
3. **Total comisiones** - Currency
4. **Total comisiones 2** - Currency
5. **Total premios** - Currency
6. **Balances** - Currency

### Fila de Totales
- Etiqueta: "Totales"
- 5 columnas con valores currency ($0.00 cuando vacío)

### Mensaje Sin Datos
"No hay entradas disponibles"

### Footer
"Mostrando 0 de 0 entradas"

---

## Tab 5: Por zona ❌ (NO IMPLEMENTADO)

### Título
"Zonas"

### Filtros - 2 campos (grupos)
1. **Fecha** - DatePicker (default: hoy)
2. **Zonas** - Multi-select ("10 seleccionadas")

### Botones
- VER VENTAS (turquesa)
- PDF (turquesa)

### Subtítulo
"Total: $0.00"

### Filtros de Tabla
Radio buttons (idénticos a Tab 1):
- Todos
- Con ventas (checked por defecto)
- Con premios
- Con tickets pendientes
- Con ventas netas negativas
- Con ventas netas positivas

### Quick Filter
Input de texto con icono de búsqueda

### Tabla - 13 Columnas (Confirmado)
1. **Nombre** - Nombre de zona
2. **P** - Número
3. **L** - Número
4. **W** - Número
5. **Total** - Número
6. **Venta** - Currency
7. **Comisiones** - Currency
8. **Descuentos** - Currency
9. **Premios** - Currency
10. **Neto** - Currency
11. **Caída** - Currency
12. **Final** - Currency
13. **Balance** - Currency

### Fila de Totales
- Etiqueta: "Totales"
- 4 columnas numéricas + 8 columnas currency

### Mensaje Sin Datos
"No hay entradas disponibles"

### Footer
"Mostrando 0 de 0 entradas"

---

## Tab 6: Categoría de Premios ❌ (NO IMPLEMENTADO)

### Subtítulo
"Total: $0.00"

### Filtros - 1 campo
1. **Fecha** - DatePicker (default: hoy)

### Botones
- VER REPORTE (turquesa) - **Nota:** texto diferente

### Quick Filter
Input de texto con icono de búsqueda

### Tabla - 12 Columnas (Confirmado)
1. **Premio 1ra** - Categoría de premio
2. **P** - Número
3. **L** - Número
4. **W** - Número
5. **Total** - Número
6. **Venta** - Currency
7. **Comisiones** - Currency
8. **Premios** - Currency
9. **Neto** - Currency
10. **Recargas** - Currency
11. **Final** - Currency
12. **Balance** - Currency

### Fila de Totales
- Etiqueta: "Totales"
- 4 columnas vacías + 6 columnas currency

### Mensaje Sin Datos
"No hay entradas disponibles"

### Footer
"Mostrando 0 de 0 entradas"

---

## Tab 7: Categoría de Premios para Pale ❌ (NO IMPLEMENTADO)

### Estructura Idéntica a Tab 6

**Diferencias con Tab 6:**
- **Misma estructura de filtros** (1 campo: Fecha)
- **Mismo botón:** VER REPORTE
- **Misma tabla:** 12 columnas idénticas
- **Misma fila de totales**
- **Mismo mensaje sin datos**

**Diferencia Principal:**
- Los datos mostrados son específicos para premios de tipo "Palé" en lugar de todas las categorías

---

## Mockup Data Requerido

### Tab 2 - Banca por sorteo
```javascript
// Ejemplo de estructura esperada
{
  banca: "LA CENTRAL 01",
  sorteo: "Anguila 10am",
  totalVendido: 1500.00,
  premios: 800.00,
  neto: 700.00
}
```

### Tab 3 - Por sorteo
```javascript
// Ejemplo de estructura esperada
{
  sorteo: "Anguila 10am",
  totalVentas: 15000.00,
  totalPremios: 8000.00,
  totalComisiones: 1500.00,
  neto: 5500.00
}
```

### Tab 4 - Combinaciones
```javascript
{
  combinacion: "123",
  totalVendido: 500.00,
  totalComisiones: 50.00,
  totalComisiones2: 25.00,
  totalPremios: 200.00,
  balances: 225.00
}
```

### Tab 5 - Por zona
```javascript
{
  nombre: "Zona Norte",
  p: 10,
  l: 5,
  w: 2,
  total: 17,
  venta: 1500.00,
  comisiones: 150.00,
  descuentos: 50.00,
  premios: 800.00,
  neto: 500.00,
  caida: 100.00,
  final: 400.00,
  balance: 300.00
}
```

### Tab 6 - Categoría de Premios
```javascript
{
  premio1ra: "Directo",
  p: 50,
  l: 20,
  w: 5,
  total: 75,
  venta: 3750.00,
  comisiones: 375.00,
  premios: 2000.00,
  neto: 1375.00,
  recargas: 100.00,
  final: 1475.00,
  balance: 1200.00
}
```

### Tab 7 - Categoría de Premios para Pale
```javascript
// Misma estructura que Tab 6, pero solo premios de tipo "Palé"
{
  premio1ra: "Pale",
  p: 30,
  l: 15,
  w: 3,
  total: 48,
  venta: 2400.00,
  comisiones: 240.00,
  premios: 1200.00,
  neto: 960.00,
  recargas: 50.00,
  final: 1010.00,
  balance: 850.00
}
```

---

## Patrones Comunes Identificados

### Botones
- Color primario: **#51cbce** (turquesa)
- Todos centrados
- Font: Montserrat, 14px

### Filtros de Fecha
- DatePicker con formato MM/DD/YYYY
- Default: fecha actual

### Multi-Select
- Muestra "X seleccionadas" cuando hay selección múltiple
- Placeholder: "Seleccione"

### Tablas
- Todas tienen columnas sortables (Click to sort Ascending)
- Todas tienen fila de "Totales" al final
- Formato currency: $X,XXX.XX
- Mensaje sin datos: "No hay entradas disponibles" o variantes

### Quick Filter
- Input de texto
- Icono de búsqueda a la derecha
- Placeholder: "Filtrado rápido"

### Footer
- "Mostrando X de Y entradas" o "Mostrando X entradas"

---

## Próximos Pasos de Implementación

### 1. Crear Componentes Base (Reutilizables)
- DailySalesFilters.jsx - Filtros comunes
- DailySalesTable.jsx - Tabla con totales
- QuickFilter.jsx - Ya existe, reutilizar

### 2. Implementar Tab 2: Banca por sorteo
- 4 filtros (Fecha inicial, Fecha final, Sorteos, Zonas)
- Tabla agrupada por banca/sorteo
- Subtítulo con total neto

### 3. Implementar Tab 3: Por sorteo
- 2 filtros (Fecha, Zonas)
- Tabla agrupada por sorteo
- Subtítulo con total neto

### 4. Implementar Tab 4: Combinaciones
- 4 filtros (Fecha, Sorteos, Zonas, Bancas)
- Tabla de 6 columnas
- Quick filter
- 8 combinaciones mockup

### 5. Implementar Tab 5: Por zona
- 2 filtros (Fecha, Zonas)
- Tabla de 13 columnas
- Radio buttons de filtro
- Quick filter
- 5 zonas mockup

### 6. Implementar Tab 6: Categoría de Premios
- 1 filtro (Fecha)
- Botón "VER REPORTE"
- Tabla de 12 columnas
- Quick filter
- 6 categorías mockup

### 7. Implementar Tab 7: Categoría de Premios para Pale
- Duplicar estructura de Tab 6
- Filtrar solo premios de tipo "Palé"
- 3 categorías mockup

---

## Estimación de Tiempo

| Tab | Complejidad | Estimación | Mockup Data |
|-----|-------------|------------|-------------|
| Tab 2 | Media | 3 horas | 10 registros |
| Tab 3 | Baja | 2 horas | 8 sorteos |
| Tab 4 | Media | 2.5 horas | 8 combinaciones |
| Tab 5 | Alta | 3.5 horas | 5 zonas |
| Tab 6 | Media | 3 horas | 6 categorías |
| Tab 7 | Baja | 1 hora | 3 categorías (duplicar Tab 6) |
| **Total** | - | **15 horas** | **40 registros** |

**Nota:** Estimación por frontend (V1 o V2). Total para ambos: ~30 horas.

---

## Notas Técnicas

### V1 (Bootstrap)
- Usar `react-bootstrap` components: `Form`, `Table`, `Button`
- DatePicker: react-datepicker
- Multi-select: react-select
- Estilos: `/assets/css/DailySales.css`

### V2 (Material-UI)
- Usar MUI components: `TextField`, `Select`, `Table`, `Button`
- DatePicker: `@mui/x-date-pickers`
- Multi-select: `Select` con `multiple` prop
- Quick filter: `TextField` con `InputAdornment`

### API Endpoints (Futuros)
```
GET /api/sales/daily/general?date=YYYY-MM-DD&zones=1,2,3
GET /api/sales/daily/by-draw-and-pool?startDate=...&endDate=...&draws=...&zones=...
GET /api/sales/daily/by-draw?date=...&zones=...
GET /api/sales/daily/combinations?date=...&draws=...&zones=...&pools=...
GET /api/sales/daily/by-zone?date=...&zones=...
GET /api/sales/daily/prize-categories?date=...
GET /api/sales/daily/prize-categories-pale?date=...
```

---

**Documentado por:** Claude Code
**Verificado con:** Playwright en aplicación Vue.js original
