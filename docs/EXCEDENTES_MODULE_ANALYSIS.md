# Módulo EXCEDENTES - Análisis Completo

**Fecha de análisis:** 2025-11-18
**Aplicación original:** https://la-numbers.apk.lol/#/excesses
**Usuario:** oliver / oliver0597@

---

## 📊 Resumen

El módulo Excedentes permite gestionar y reportar excedentes de jugadas por tipo de apuesta y sorteo. Consta de 2 subsecciones principales.

---

## 🗂️ Estructura del Módulo

### Subsecciones

1. **Manejar** → `#/excesses`
2. **Reporte** → `#/excesses-report`

---

## 📱 SECCIÓN 1: Manejar Excedentes

**Ruta:** `#/excesses`
**Screenshot:** `/home/jorge/projects/.playwright-mcp/vue-excedentes-manejar.png`

### Componentes UI

#### 1. Título
- **Texto:** "Manejar excedentes"
- **Estilo:** Heading 3, centrado, color negro

#### 2. Filtro de Sorteo
- **Label:** "Sorteo"
- **Tipo:** Dropdown/Select
- **Valor por defecto:** "General"
- **Opciones:** Lista de sorteos (General + sorteos específicos)

#### 3. Botón "BORRAR TODO"
- **Color:** Turquesa (#51cbce)
- **Posición:** Derecha, alineado con dropdown de Sorteo
- **Función:** Limpiar todos los campos del formulario

#### 4. Formulario de Excedentes (25 campos)

**Layout:** Grid de 3 columnas, campos numéricos

| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| General | Directo | Pale |
| Cash3 Straight | Cash3 Box | Play4 Straight |
| Play4 Box | Super Pale | Bolita 1 |
| Bolita 2 | Singulación 1 | Singulación 2 |
| Singulación 3 | Pick5 Straight | Pick5 Box |
| Pick Two | Cash3 Front Straight | Cash3 Front Box |
| Cash3 Back Straight | Cash3 Back Box | Pick Two Front |
| Pick Two Back | Pick Two Middle | Panamá |
| Tripleta | | |

**Características de los campos:**
- **Tipo:** Text input (numérico)
- **Formato:** Aceptan decimales
- **Placeholder:** Vacío
- **Validación:** Opcional (pueden quedar vacíos)

#### 5. Botón "CREAR"
- **Color:** Turquesa (#51cbce)
- **Posición:** Izquierda, debajo del formulario
- **Función:** Guardar los excedentes configurados

#### 6. Sección "Lista de excedentes"
- **Título:** "Lista de excedentes" (Heading 3, centrado)
- **Componente:** Tabla (no visible en screenshot, probablemente se carga después de crear excedentes)

---

## 📱 SECCIÓN 2: Reporte de Excedentes

**Ruta:** `#/excesses-report`
**Screenshot:** `/home/jorge/projects/.playwright-mcp/vue-excedentes-reporte.png`

### Componentes UI

#### 1. Título
- **Texto:** "Reporte de excedentes"
- **Estilo:** Heading 3, centrado, color negro

#### 2. Filtros

**Filtro 1: Sorteo**
- **Label:** "Sorteo"
- **Tipo:** Multi-select dropdown
- **Indicador:** "69 seleccionadas" (muestra cantidad seleccionada)
- **Placeholder:** "Seleccione"
- **Función:** Filtrar por múltiples sorteos

**Filtro 2: Tipo de jugada**
- **Label:** "Tipo de jugada"
- **Tipo:** Multi-select dropdown
- **Indicador:** "24 seleccionadas"
- **Placeholder:** "Seleccione"
- **Función:** Filtrar por múltiples tipos de apuesta

#### 3. Botón "REFRESCAR"
- **Color:** Turquesa (#51cbce)
- **Posición:** Izquierda, debajo de los filtros
- **Función:** Recargar datos de la tabla

#### 4. Tabla de Reporte

**Estructura:**
- **Quick filter:** Input "Filtrado rápido" (derecha, con icono de búsqueda)
- **Estado vacío:** "No hay entradas disponibles" (cuando no hay datos)
- **Columnas:** No visibles en screenshot (tabla vacía)
- **Footer:** "Mostrando 0 de 0 entradas"

**Características esperadas:**
- Tabla sortable
- Paginación
- Quick filter busca en todas las columnas
- Columnas probables:
  - Sorteo
  - Tipo de jugada
  - Excedente configurado
  - Fecha de creación
  - Usuario
  - Acciones (Editar/Eliminar)

---

## 🎨 Patrones de Diseño

### Colores Corporativos
- **Primario:** Turquesa #51cbce (botones principales)
- **Texto:** Negro #2c2c2c (títulos)
- **Fondo:** Blanco #ffffff (cards)
- **Fondo secundario:** Gris claro #f5f5f5 (formularios)

### Tipografía
- **Títulos (h3):** 24px, centrado, Montserrat
- **Labels:** 12px, gris #787878
- **Inputs:** 14px, altura 31px

### Espaciado
- **Margen entre secciones:** 20px
- **Padding de cards:** 30px
- **Gap entre campos:** 12px (horizontal y vertical)

---

## 📁 Archivos a Crear

### Frontend V1 (Bootstrap)

```
frontend-v1/src/components/excedentes/
├── ManageExcesses.jsx          # Manejar excedentes
└── ExcessesReport.jsx          # Reporte de excedentes
```

### Frontend V2 (Material-UI)

```
frontend-v2/src/components/features/excesses/
├── ManageExcesses/
│   └── index.jsx              # Manejar excedentes (MUI)
└── ExcessesReport/
    └── index.jsx              # Reporte de excedentes (MUI)
```

---

## 🔗 Rutas

### V1 (Bootstrap)
- `/excedentes/manejar` → ManageExcesses
- `/excedentes/reporte` → ExcessesReport

### V2 (Material-UI)
- `/excesses/manage` → ManageExcesses
- `/excesses/report` → ExcessesReport

---

## 📝 API Endpoints (Expected)

### Obtener excedentes por sorteo
```
GET /api/excesses?drawId={drawId}

Response:
{
  drawId: 1,
  drawName: "General",
  excesses: {
    directo: 1000.00,
    pale: 500.00,
    tripleta: 300.00,
    // ... resto de tipos
  },
  createdAt: "2025-11-18T10:00:00Z",
  createdBy: "admin"
}
```

### Crear/Actualizar excedentes
```
POST /api/excesses
{
  drawId: 1,
  excesses: {
    directo: 1000.00,
    pale: 500.00,
    tripleta: null,  // null = sin límite
    // ... resto de tipos
  }
}

Response:
{
  id: 123,
  drawId: 1,
  excesses: { ... },
  createdAt: "2025-11-18T10:00:00Z"
}
```

### Obtener reporte de excedentes
```
GET /api/excesses/report?drawIds=1,2,3&betTypeIds=1,2,3&page=1&pageSize=50

Response:
{
  items: [
    {
      id: 1,
      drawName: "Anguila 10am",
      betTypeName: "Directo",
      excessValue: 1000.00,
      createdAt: "2025-11-18",
      createdBy: "admin"
    }
  ],
  totalCount: 150,
  pageNumber: 1,
  pageSize: 50
}
```

---

## ✅ Criterios de Aceptación

### Sección 1: Manejar

- [ ] Título "Manejar excedentes" centrado
- [ ] Dropdown "Sorteo" con lista de sorteos
- [ ] Botón "BORRAR TODO" funcional (limpia todos los campos)
- [ ] 25 campos numéricos organizados en grid 3 columnas
- [ ] Campos permiten decimales
- [ ] Campos pueden quedar vacíos (null = sin límite)
- [ ] Botón "CREAR" turquesa
- [ ] Al seleccionar sorteo, cargar excedentes existentes (si hay)
- [ ] Al hacer clic en "CREAR", guardar excedentes
- [ ] Mostrar mensaje de éxito/error
- [ ] Sección "Lista de excedentes" (tabla con excedentes guardados)
- [ ] Ruta conectada al menú de navegación

### Sección 2: Reporte

- [ ] Título "Reporte de excedentes" centrado
- [ ] Multi-select "Sorteo" con indicador "X seleccionadas"
- [ ] Multi-select "Tipo de jugada" con indicador "X seleccionadas"
- [ ] Botón "REFRESCAR" turquesa
- [ ] Quick filter funcional
- [ ] Tabla con datos de excedentes
- [ ] Columnas sortables
- [ ] Paginación funcional
- [ ] Footer con contador de entradas
- [ ] Empty state: "No hay entradas disponibles"
- [ ] Filtros actualizan la tabla
- [ ] Ruta conectada al menú de navegación

---

## 🧪 Mockup Data

### Excedentes por Sorteo (ejemplo)

```javascript
const excessesData = {
  drawId: 1,
  drawName: "General",
  excesses: {
    general: 5000.00,
    directo: 1000.00,
    pale: 500.00,
    tripleta: 300.00,
    cash3Straight: 200.00,
    cash3Box: 150.00,
    play4Straight: 400.00,
    play4Box: 300.00,
    superPale: 250.00,
    bolita1: 100.00,
    bolita2: 100.00,
    singulacion1: 75.00,
    singulacion2: 75.00,
    singulacion3: 75.00,
    pick5Straight: 500.00,
    pick5Box: 350.00,
    pickTwo: 80.00,
    cash3FrontStraight: 120.00,
    cash3FrontBox: 90.00,
    cash3BackStraight: 120.00,
    cash3BackBox: 90.00,
    pickTwoFront: 60.00,
    pickTwoBack: 60.00,
    pickTwoMiddle: 60.00,
    panama: 200.00
  }
};
```

### Reporte de Excedentes (ejemplo)

```javascript
const reportData = [
  { id: 1, drawName: "Anguila 10am", betType: "Directo", excess: 1000.00, created: "18/11/2025", user: "admin" },
  { id: 2, drawName: "Anguila 10am", betType: "Pale", excess: 500.00, created: "18/11/2025", user: "admin" },
  { id: 3, drawName: "General", betType: "Directo", excess: 1000.00, created: "17/11/2025", user: "admin" },
  { id: 4, drawName: "NY 12pm", betType: "Tripleta", excess: 300.00, created: "17/11/2025", user: "admin" },
  { id: 5, drawName: "FL 1pm", betType: "Pick Two", excess: 80.00, created: "16/11/2025", user: "admin" }
];
```

---

## 📊 Complejidad

| Aspecto | Complejidad | Notas |
|---------|-------------|-------|
| UI Layout | Media | Grid de 3 columnas, multi-selects |
| Lógica de negocio | Media | Manejo de 25 campos, validaciones |
| API Integration | Baja | CRUD simple |
| Estado | Media | Manejo de formulario complejo |

**Tiempo estimado por frontend:**
- V1 (Bootstrap): 4-6 horas
- V2 (Material-UI): 4-6 horas

**Total estimado:** 8-12 horas para ambos frontends

---

## 🔗 Referencias

- Screenshot Manejar: `/home/jorge/projects/.playwright-mcp/vue-excedentes-manejar.png`
- Screenshot Reporte: `/home/jorge/projects/.playwright-mcp/vue-excedentes-reporte.png`
- CLAUDE.md: Documentación del proyecto
- DESIGN_SYSTEM.md: Sistema de diseño corporativo

---

**Generado:** 2025-11-18
**Analista:** Claude Code
**Status:** ✅ Análisis completo - Listo para implementación
