# Guía de Clonación de UI con Playwright MCP

## Objetivo
Clonar la interfaz de la aplicación original (la-numbers.apk.lol) a nuestra aplicación (lottobook.net) de forma pixel-perfect, manteniendo coherencia con el sistema de diseño.

## Requisitos
- Playwright MCP Server configurado y funcionando
- Acceso a la aplicación original
- Credenciales: `oliver` / `oliver0597@`

---

## Proceso de Clonación (5 Pasos)

### Paso 1: Navegar y Autenticar

```javascript
// 1. Navegar a la app original
mcp__playwright__browser_navigate({ url: "https://la-numbers.apk.lol" })

// 2. Llenar formulario de login
mcp__playwright__browser_fill_form({
  fields: [
    { name: "Usuario", type: "textbox", ref: "e14", value: "oliver" },
    { name: "Password", type: "textbox", ref: "e20", value: "oliver0597@" }
  ]
})

// 3. Click en botón login
mcp__playwright__browser_click({ ref: "e21", element: "Login button" })
```

### Paso 2: Navegar al Módulo Target

```javascript
// Navegar directamente a la página del módulo
mcp__playwright__browser_navigate({ url: "https://la-numbers.apk.lol/limits" })

// O usar el menú
mcp__playwright__browser_click({ ref: "menuRef", element: "LÍMITES menu" })
```

### Paso 3: Capturar Screenshot de Referencia

```javascript
mcp__playwright__browser_take_screenshot({
  type: "png",
  filename: "original-limits-list.png",
  fullPage: true
})
```

### Paso 4: Extraer Estilos CSS

Usar `browser_run_code` para ejecutar JavaScript que extrae estilos:

```javascript
mcp__playwright__browser_run_code({
  code: `
    async function extractStyles() {
      const elements = {
        button: document.querySelector('.btn-refresh'),
        card: document.querySelector('.card'),
        input: document.querySelector('select'),
        chip: document.querySelector('.chip-selected')
      };

      const result = {};
      for (const [name, el] of Object.entries(elements)) {
        if (el) {
          const style = window.getComputedStyle(el);
          result[name] = {
            backgroundColor: style.backgroundColor,
            color: style.color,
            borderRadius: style.borderRadius,
            padding: style.padding,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            boxShadow: style.boxShadow,
            border: style.border
          };
        }
      }
      return result;
    }
    return await extractStyles();
  `
})
```

### Paso 5: Adaptar a Sistema de Diseño

| Color Original | Color Sistema | Uso |
|----------------|---------------|-----|
| `#51bcda` | `#51cbce` | Primary (botones, bordes) |
| `#45a8c4` | `#45b8bb` | Hover |
| `#fbc658` | `#fbc658` | Selección (mantener) |
| `#ef8157` | `#ef8157` | Días seleccionados (mantener) |

---

## Patrones de Estilos MUI

### Botón Turquesa (Refresh/Submit)
```typescript
const buttonStyles = {
  bgcolor: '#51cbce',
  color: 'white',
  borderRadius: '30px',        // Pill shape
  padding: '11px 23px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  boxShadow: 'none',
  border: 'none',
  '&:hover': {
    bgcolor: '#45b8bb'
  },
  '&:disabled': {
    bgcolor: '#ccc',
    color: 'white'
  }
};
```

### Card Container
```typescript
const cardStyles = {
  bgcolor: 'white',
  borderRadius: '12px',
  boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 10px -4px',
  border: 'none',
  mb: '20px'
};
```

### Labels
```typescript
const labelStyles = {
  color: '#9a9a9a',
  fontSize: '12px',
  fontWeight: 400,
  mb: 0.5,
  display: 'block'
};
```

### Chip Seleccionable (Sorteos)
```typescript
const chipStyles = {
  // No seleccionado
  unselected: {
    border: '1px solid #51cbce',
    borderRadius: '16px',
    backgroundColor: 'transparent',
    color: '#51cbce',
    cursor: 'pointer'
  },
  // Seleccionado
  selected: {
    backgroundColor: '#51cbce',
    color: 'white',
    border: '1px solid #51cbce'
  }
};
```

### Chip de Días (Naranja cuando seleccionado)
```typescript
const dayChipStyles = {
  selected: {
    backgroundColor: '#ef8157',
    color: 'white',
    border: '1px solid #ef8157'
  }
};
```

### Celda de Número (Hot Numbers)
```typescript
const numberCellStyles = {
  // No seleccionado
  unselected: {
    border: '2px solid #51cbce',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    width: '50px',
    height: '50px'
  },
  // Seleccionado (caliente)
  selected: {
    border: '2px solid #fbc658',
    backgroundColor: '#fbc658',
    color: 'white'
  }
};
```

### Icono de Fuego
```typescript
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

// Activo (número caliente)
<LocalFireDepartmentIcon sx={{ color: '#ff6b35', fontSize: '16px' }} />

// Inactivo
<LocalFireDepartmentIcon sx={{ color: '#9a9a9a', fontSize: '16px' }} />
```

---

## Ejemplo Completo: Clonar LimitsList

### Antes (Nuestra App)
- 6 filtros multi-select
- Tabs por día de semana
- Chips de filtrado
- Botón púrpura

### Después (Clonado de Original)
- 3 dropdowns simples (Tipo, Sorteo, Día)
- Sin tabs
- Sin chips de filtrado
- Botón turquesa pill-shape

### Código Resultante

```typescript
// styles object
const styles = {
  container: {
    p: 3,
    bgcolor: '#f5f5f5',
    minHeight: '100vh'
  },
  title: {
    textAlign: 'center',
    mb: 3,
    fontSize: '28px',
    fontWeight: 400,
    color: '#2c2c2c',
    fontFamily: 'Montserrat, "Helvetica Neue", Arial, sans-serif'
  },
  card: {
    bgcolor: 'white',
    borderRadius: '12px',
    boxShadow: 'rgba(0, 0, 0, 0.15) 0px 6px 10px -4px',
    mb: '20px',
    border: 'none'
  },
  refreshButton: {
    bgcolor: '#51cbce',
    color: 'white',
    borderRadius: '30px',
    padding: '11px 23px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    '&:hover': { bgcolor: '#45b8bb' }
  }
};
```

---

## Módulos a Clonar (Pendientes)

| Módulo | Ruta Original | Prioridad |
|--------|---------------|-----------|
| Ventas Diarias | /sales/day | Alta |
| Crear Ticket | /tickets/new | Alta |
| Resultados | /results | Media |
| Bancas Lista | /betting-pools | Media |
| Usuarios | /users | Baja |

---

## Checklist de Clonación

- [ ] Screenshot de referencia capturado
- [ ] Estilos CSS extraídos con browser_run_code
- [ ] Colores adaptados al sistema de diseño
- [ ] Layout replicado (grid, flex, spacing)
- [ ] Componentes MUI configurados con sx props
- [ ] Estados interactivos (hover, selected, disabled)
- [ ] Responsive breakpoints verificados
- [ ] Comparación visual lado a lado

---

## Tips

1. **No copiar colores exactos** - Adaptar al sistema de diseño (#51cbce)
2. **Usar sx props** - Más flexible que styled-components para ajustes rápidos
3. **Capturar múltiples estados** - Normal, hover, selected, disabled
4. **Verificar en móvil** - La app original tiene breakpoints diferentes
5. **Iconos** - Usar Material Icons equivalentes (@mui/icons-material)

---

**Fecha de creación:** 2026-02-06
**Última actualización:** 2026-02-06
