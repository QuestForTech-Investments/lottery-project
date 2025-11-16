# Guía de Estilos Unificados para Formularios

## 📋 Problema Actual

Cada tab del formulario usa clases CSS diferentes:
- Tab "Configuración" → `.config-*`
- Otros tabs → `.form-*` (estilos antiguos)

Esto causa **inconsistencia visual**: diferentes fuentes, tamaños, colores y espaciados.

## ✅ Solución: Sistema de Diseño Unificado

Se creó `/src/assets/css/FormStyles.css` con:
- **Variables CSS** para todos los tokens de diseño
- **Clases reutilizables** para todos los tabs
- **Responsive** y consistente

## 🎨 Variables CSS Disponibles

```css
/* Colores */
--form-label-color: rgb(120, 120, 120)
--form-input-text-color: rgb(60, 60, 60)
--form-input-border-color: rgb(221, 221, 221)
--form-input-focus-color: #51cbce

/* Tipografía */
--form-font-family: Montserrat, "Helvetica Neue", Arial, sans-serif
--form-label-size: 12px
--form-label-bold-size: 14px
--form-input-size: 14px

/* Espaciado */
--form-group-spacing: 6px
--form-label-width: 280px
--form-input-height: 31px
```

## 📚 Clases CSS Unificadas

### Contenedores
```jsx
<div className="form-tab-container">
  <div className="form-row">
    <div className="form-column">...</div>
    <div className="form-column-offset">...</div> {/* Para columna derecha */}
  </div>
</div>
```

### Grupos de Formulario
```jsx
<div className="form-group">
  <label className="form-label">Etiqueta Normal</label>
  <input className="form-input" />
</div>

<div className="form-group">
  <label className="form-label form-label-bold">Etiqueta Negrita</label>
  <input className="form-input" />
</div>
```

### Inputs
```jsx
{/* Input normal */}
<input className="form-input" type="text" />

{/* Input pequeño */}
<input className="form-input form-input-small" type="number" />

{/* Select */}
<select className="form-select">...</select>

{/* Textarea */}
<textarea className="form-textarea">...</textarea>
```

### Botones Radio Tipo Bootstrap
```jsx
<div className="form-button-group">
  <label className={`form-radio-button ${value === '1' ? 'active' : ''}`}>
    <input type="radio" name="campo" value="1" />
    OPCIÓN 1
  </label>
  <label className={`form-radio-button ${value === '2' ? 'active' : ''}`}>
    <input type="radio" name="campo" value="2" />
    OPCIÓN 2
  </label>
</div>
```

### Toggle Switches
```jsx
<label className="form-toggle">
  <input type="checkbox" checked={value} onChange={handler} />
  <span className="form-toggle-slider"></span>
</label>
```

## 🔄 Migración de Tabs Existentes

### Paso 1: Importar CSS en CreateBanca.jsx
```jsx
import '../assets/css/FormStyles.css';
```

### Paso 2: Reemplazar Clases Antiguas

#### Tab "General" (línea ~457)
**Antes:**
```jsx
<div className="form-container">
  <div className="form-grid">
    <label className="form-label">...</label>
    <input className="form-input input-blue" />
  </div>
</div>
```

**Después:**
```jsx
<div className="form-tab-container">
  <div className="form-row">
    <div className="form-column">
      <div className="form-group">
        <label className="form-label">...</label>
        <input className="form-input" />
      </div>
    </div>
  </div>
</div>
```

#### Tab "Configuración" (línea ~576) - Ya implementado
```jsx
<div className="form-tab-container">
  <div className="form-row">
    <div className="form-column">
      <div className="form-group">
        <label className="form-label">Zona</label>
        <select className="form-select">...</select>
      </div>
    </div>
    <div className="form-column-offset">...</div>
  </div>
</div>
```

### Paso 3: Eliminar Colores Personalizados

**Antes:**
```jsx
<input className="form-input input-blue" />
<input className="form-input input-pink" />
```

**Después:**
```jsx
<input className="form-input" />
<input className="form-input" />
```

❌ **Eliminar estas clases antiguas:**
- `.input-blue`
- `.input-pink`
- `.input-purple`
- `.input-green`
- `.input-light-pink`

✅ **Todos los inputs ahora usan el mismo estilo consistente**

## 📝 Checklist de Migración

- [ ] Importar `FormStyles.css` en `CreateBanca.jsx`
- [ ] Migrar tab "General"
- [ ] Migrar tab "Pies de página"
- [ ] Migrar tab "Premios & Comisiones"
- [ ] Migrar tab "Horarios de sorteos"
- [ ] Migrar tab "Sorteos"
- [ ] Migrar tab "Estilos"
- [ ] Migrar tab "Gastos automáticos"
- [ ] Actualizar tab "Configuración" para usar clases nuevas
- [ ] Eliminar clases `.config-*` antiguas de `CreateBranchGeneral.css`
- [ ] Eliminar clases `.input-blue/pink/purple/green` de `CreateBranchGeneral.css`

## 🎯 Resultado Final

✅ **Todos los tabs tendrán:**
- Misma fuente: Montserrat 12px (labels normales), 14px (labels bold)
- Mismo color: rgb(120, 120, 120) para labels
- Mismo espaciado: 6px entre grupos
- Mismos inputs: 31px altura, 14px fuente, rgb(60, 60, 60) texto
- Mismo comportamiento responsive

## 📌 Nota Importante

**NO modifiques `FormStyles.css` directamente en cada tab.**

Si necesitas cambiar un estilo globalmente:
1. Actualiza la variable CSS en `:root`
2. El cambio se aplicará automáticamente a todos los tabs

Ejemplo:
```css
/* Para hacer todos los labels más grandes */
:root {
  --form-label-size: 13px; /* Era 12px */
}
```
