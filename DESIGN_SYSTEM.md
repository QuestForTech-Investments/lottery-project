# Sistema de Diseño - Lottery Project

Este documento define todos los tokens de diseño (colores, tipografía, espaciado, etc.) que DEBEN usarse en toda la aplicación para mantener coherencia visual.

**Generado:** 2025-11-18
**Última actualización:** 2025-11-18

---

## 🎨 Colores Corporativos

### Colores Principales

```css
/* Variables CSS recomendadas */
:root {
  /* Colores Primarios */
  --color-primary: #51cbce;          /* Turquesa - Botones principales, acciones primarias */
  --color-primary-hover: #45b7ba;    /* Turquesa oscuro - Hover de botones primarios */
  --color-primary-light: #e8f8f9;    /* Turquesa claro - Fondos sutiles */

  /* Colores de Estado */
  --color-success: #28a745;          /* Verde - Estados exitosos, confirmaciones */
  --color-warning: #ffc107;          /* Amarillo - Advertencias */
  --color-error: #dc3545;            /* Rojo - Errores, acciones destructivas */
  --color-info: #17a2b8;             /* Cyan - Información */

  /* Colores de Texto */
  --color-text-primary: #2c2c2c;     /* Negro - Texto principal */
  --color-text-secondary: #6c757d;   /* Gris - Texto secundario */
  --color-text-disabled: #adb5bd;    /* Gris claro - Texto deshabilitado */
  --color-text-inverse: #ffffff;     /* Blanco - Texto en fondos oscuros */

  /* Colores de Fondo */
  --color-background: #f5f5f5;       /* Gris claro - Fondo de página */
  --color-background-card: #ffffff;  /* Blanco - Fondo de tarjetas/modales */
  --color-background-hover: #f8f9fa; /* Gris muy claro - Hover de filas */

  /* Colores de Borde */
  --color-border: #dee2e6;           /* Gris - Bordes normales */
  --color-border-light: #e8e8e8;     /* Gris claro - Bordes sutiles */
  --color-border-dark: #ced4da;      /* Gris oscuro - Bordes enfatizados */
}
```

### Uso de Colores

| Color | Hex | Uso Principal | NO Usar Para |
|-------|-----|---------------|--------------|
| Turquesa | `#51cbce` | Botones principales, iconos activos, indicadores | Fondos de títulos ❌ |
| Verde | `#28a745` | Estados exitosos, botones FILTRAR | Estados de error |
| Negro | `#2c2c2c` | Texto de títulos, texto principal | Fondos |
| Gris claro | `#f5f5f5` | Fondo de página | Texto |

---

## 📝 Tipografía

### Font Family

```css
:root {
  --font-family-primary: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  --font-family-code: 'Courier New', Courier, monospace;
}
```

**Importar Montserrat:**
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

### Tamaños de Fuente

| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| **H1** | 32px | 600 | Títulos principales de página |
| **H2** | 28px | 600 | Subtítulos importantes |
| **H3** | 24px | 600 | Títulos de secciones |
| **H4** | 20px | 600 | Subtítulos de secciones |
| **Body** | 14px | 400 | Texto general, labels |
| **Small** | 12px | 400 | Texto secundario, ayudas |
| **Button** | 14px | 600 | Texto de botones |

```css
:root {
  --font-size-h1: 32px;
  --font-size-h2: 28px;
  --font-size-h3: 24px;
  --font-size-h4: 20px;
  --font-size-body: 14px;
  --font-size-small: 12px;
  --font-size-button: 14px;

  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

## 📐 Espaciado

Sistema de espaciado basado en múltiplos de 8px:

```css
:root {
  --spacing-xs: 4px;      /* 0.5 unidades */
  --spacing-sm: 8px;      /* 1 unidad */
  --spacing-md: 16px;     /* 2 unidades */
  --spacing-lg: 24px;     /* 3 unidades */
  --spacing-xl: 32px;     /* 4 unidades */
  --spacing-2xl: 48px;    /* 6 unidades */
  --spacing-3xl: 64px;    /* 8 unidades */
}
```

**Uso:**
- **4px**: Padding interno de badges, separación mínima
- **8px**: Padding de inputs, separación entre elementos cercanos
- **16px**: Padding de cards, separación entre secciones
- **24px**: Padding de contenedores principales
- **32px**: Separación entre bloques grandes

---

## 🔘 Componentes

### Botones

#### Botón Principal (Primary)
```css
.btn-primary {
  background-color: #51cbce;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #45b7ba;
}
```

#### Botón Secundario (Success/Green)
```css
.btn-success {
  background-color: #28a745;
  color: white;
  /* Resto igual que primary */
}
```

#### Tamaños
- **Small**: padding `8px 16px`, font-size `12px`
- **Medium**: padding `12px 24px`, font-size `14px` (default)
- **Large**: padding `16px 32px`, font-size `16px`

### Inputs

```css
.form-input {
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #51cbce;
  box-shadow: 0 0 0 3px rgba(81, 203, 206, 0.1);
}
```

### Títulos de Página

**IMPORTANTE:** Todos los títulos de formularios deben seguir este patrón:

```css
.page-title {
  color: #2c2c2c;              /* Texto negro */
  background: transparent;      /* SIN fondo de color */
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding: 20px;
  margin: 0;
}
```

**✅ Correcto:**
- Lista de bancas ← texto negro
- Balances de bancas ← texto negro con línea turquesa debajo
- Lista de usuarios ← texto negro

**❌ Incorrecto:**
- Título con fondo turquesa
- Título con fondo morado
- Título con gradiente

### Tablas

```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.table th {
  padding: 15px 12px;
  text-align: left;
  font-weight: 700;
  font-size: 14px;
  color: #2c2c2c;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  font-size: 14px;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
:root {
  --breakpoint-sm: 576px;   /* Teléfonos en landscape */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 992px;   /* Laptops pequeñas */
  --breakpoint-xl: 1200px;  /* Desktops */
  --breakpoint-2xl: 1400px; /* Pantallas grandes */
}

@media (min-width: 768px) {
  /* Estilos para tablet y desktop */
}

@media (min-width: 992px) {
  /* Estilos para desktop */
}
```

---

## 🎯 Shadows & Borders

```css
:root {
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}
```

**Uso:**
- **Cards**: `shadow-md`, `radius-md`
- **Modales**: `shadow-xl`, `radius-lg`
- **Botones**: `radius-md`
- **Badges**: `radius-sm`

---

## ✅ Checklist de Coherencia

Antes de crear/modificar un componente, verificar:

- [ ] Colores usados están en la paleta corporativa
- [ ] Tipografía usa Montserrat
- [ ] Tamaños de fuente siguen la escala definida
- [ ] Espaciado usa múltiplos de 8px
- [ ] Títulos NO tienen fondo de color (solo texto negro)
- [ ] Botones principales usan #51cbce
- [ ] Inputs tienen height: 40px
- [ ] Tablas siguen el estilo definido
- [ ] Responsive breakpoints correctos
- [ ] Shadows y borders consistentes

---

## 🔗 Referencias

- **CLAUDE.md**: Línea 809 - Coherencia de Diseño en Formularios
- **Fix 2025-11-18**: Corrección de título inconsistente en USUARIOS > Bancas
- **Variables CSS**: Considerar crear archivo central `design-tokens.css`

---

**Mantenido por:** Claude Code
**Última revisión:** 2025-11-18
