# Especificación: Formulario de Edición Masiva de Bancas

**Ruta original:** `#/betting-pools/mass-edit`
**Fecha análisis:** 2025-11-16

---

## 1. RESUMEN

Formulario que permite actualizar múltiples bancas simultáneamente. Seleccionas las bancas, sorteos y/o zonas, y aplicas cambios de configuración a todas a la vez.

---

## 2. ESTRUCTURA DE TABS

```
┌────────────────┬─────────────┬─────────────────────┬──────────┐
│ Configuración  │ Pies página │ Premios & Comisiones │ Sorteos │
└────────────────┴─────────────┴─────────────────────┴──────────┘
```

### Tab: Configuración (Principal)
- Configuración general de bancas
- Radio buttons con opción "No cambiar"

### Tab: Pies de página
- Textos de pie de página para tickets

### Tab: Premios & Comisiones
- Subtabs: Premios, Comisiones, Comisiones 2
- Configuración de multiplicadores

### Tab: Sorteos
- Configuración específica por sorteo

---

## 3. CAMPOS DEL FORMULARIO

### 3.1 Selectores de Entidades (Checkboxes múltiples)

#### Sorteos (70+ opciones)
```javascript
const sorteos = [
  "LA PRIMERA", "NEW YORK DAY", "NEW YORK NIGHT",
  "FLORIDA AM", "FLORIDA PM", "GANA MAS", "NACIONAL",
  "QUINIELA PALE", "REAL", "LOTEKA", "FL PICK2 AM",
  // ... más sorteos
];
// Incluye checkbox "Todos" para seleccionar/deseleccionar todos
```

#### Bancas (140+ opciones)
```javascript
const bancas = [
  { name: "GILBERTO ISLA GORDA TL", id: 1 },
  { name: "GILBERTO TL", id: 10 },
  { name: "CHINO TL", id: 16 },
  // ... más bancas
];
```

#### Zonas (10+ opciones)
```javascript
const zonas = [
  "GRUPO GUYANA (JHON)",
  "GRUPO KENDRICK TL",
  "GRUPO GILBERTO TL",
  // ... más zonas
];
```

---

### 3.2 Campos de Configuración

#### Zona (Dropdown)
```html
<div class="form-group">
  <label>Zona</label>
  <select class="form-control" multiple>
    <!-- Vue Multiselect component -->
  </select>
</div>
```

#### Tipo de Caída (Radio Group)
```javascript
const tiposCaida = [
  { value: 1, label: "Off" },
  { value: 2, label: "Cobro" },
  { value: 3, label: "Diaria" },
  { value: 4, label: "Mensual" },
  { value: 5, label: "Semanal con acumulado" },
  { value: 6, label: "Semanal sin acumulado" }
];
```

#### Balance de Desactivación (Number Input)
```html
<input type="text" class="form-control" placeholder="Balance de desactivacion">
```

#### Límite de Venta Diaria (Number Input)
```html
<input type="text" class="form-control" placeholder="Límite de venta diaria">
```

#### Campos Boolean con "No Cambiar"
Estos campos tienen 3 opciones: Encender, Apagar, No cambiar

```javascript
const booleanFields = [
  "Imprimir copia de ticket",
  "Activa",
  "Control de tickets ganadores",
  "Usar premios normalizados",
  "Permitir pasar bote",
  "Permitir cambiar contraseña"
];

// Valores posibles
const options = [
  { value: "on", label: "Encender" },
  { value: "off", label: "Apagar" },
  { value: "no_change", label: "No cambiar" } // Seleccionado por defecto
];
```

#### Minutos para Cancelar Tickets (Number Input)
```html
<input type="text" class="form-control">
```

#### Tickets a Cancelar por Día (Number Input/Spinner)
```html
<input type="number" class="form-control" min="0">
```

#### Idioma (Radio)
```javascript
const idiomas = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" }
];
```

#### Modo de Impresión (Radio)
```javascript
const modosImpresion = [
  { value: "driver", label: "Driver" },
  { value: "generic", label: "Genérico" }
];
```

#### Proveedor de Descuento (Radio)
```javascript
const proveedoresDescuento = [
  { value: "group", label: "Grupo" },
  { value: "rifero", label: "Rifero" }
];
```

#### Modo de Descuento (Radio)
```javascript
const modosDescuento = [
  { value: "off", label: "Off" },
  { value: "cash", label: "Efectivo" },
  { value: "free_ticket", label: "Ticket Gratis" }
];
```

---

## 4. ESTRUCTURA HTML (Bootstrap)

### Layout General
```html
<div class="container-fluid">
  <h3>Actualizar banca</h3>

  <div class="card">
    <!-- Tabs -->
    <ul class="nav nav-tabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-toggle="tab" href="#config">
          Configuración
        </a>
      </li>
      <!-- Más tabs -->
    </ul>

    <div class="tab-content">
      <!-- Tab Configuración -->
      <div class="tab-pane active" id="config">
        <div class="row">
          <!-- Columna izquierda: Campos de configuración -->
          <div class="col-md-6">
            <!-- Campos aquí -->
          </div>

          <!-- Columna derecha: Selección de entidades -->
          <div class="col-md-6">
            <!-- Checkboxes de sorteos, bancas, zonas -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <button class="btn btn-primary">Actualizar</button>
</div>
```

### Radio Button Group (Bootstrap)
```html
<div class="form-group">
  <label>Tipo de caída</label>
  <div class="btn-group btn-group-toggle btn-group-sm" data-toggle="buttons">
    <label class="btn btn-outline-primary">
      <input type="radio" name="fallType" value="1"> Off
    </label>
    <label class="btn btn-outline-primary">
      <input type="radio" name="fallType" value="2"> Cobro
    </label>
    <label class="btn btn-outline-primary">
      <input type="radio" name="fallType" value="3"> Diaria
    </label>
    <!-- Más opciones -->
  </div>
</div>
```

### Checkbox Group (Para Sorteos/Bancas)
```html
<div class="form-group">
  <label>Sorteos</label>
  <div class="checkbox-list" style="max-height: 400px; overflow-y: auto;">
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="all" id="allSorteos">
      <label class="form-check-label" for="allSorteos">
        <strong>Todos</strong>
      </label>
    </div>
    <hr>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="1" id="sorteo1">
      <label class="form-check-label" for="sorteo1">
        LA PRIMERA
      </label>
    </div>
    <!-- Más checkboxes -->
  </div>
</div>
```

---

## 5. LÓGICA DE NEGOCIO

### Comportamiento del "No cambiar"
```javascript
const buildUpdatePayload = (formData) => {
  const payload = {
    betting_pool_ids: formData.selectedBancas,
    sortition_ids: formData.selectedSorteos,
    zone_ids: formData.selectedZonas
  };

  // Solo incluir campos que NO sean "no_change"
  if (formData.printCopy !== 'no_change') {
    payload.print_copy = formData.printCopy === 'on';
  }

  if (formData.isActive !== 'no_change') {
    payload.is_active = formData.isActive === 'on';
  }

  // Para campos numéricos, solo incluir si tienen valor
  if (formData.deactivationBalance) {
    payload.deactivation_balance = parseFloat(formData.deactivationBalance);
  }

  if (formData.dailySaleLimit) {
    payload.daily_sale_limit = parseFloat(formData.dailySaleLimit);
  }

  return payload;
};
```

### Seleccionar Todos
```javascript
const handleSelectAll = (type, isChecked) => {
  if (type === 'sorteos') {
    setSelectedSorteos(isChecked ? allSorteos.map(s => s.id) : []);
  } else if (type === 'bancas') {
    setSelectedBancas(isChecked ? allBancas.map(b => b.id) : []);
  } else if (type === 'zonas') {
    setSelectedZonas(isChecked ? allZonas.map(z => z.id) : []);
  }
};
```

---

## 6. API ENDPOINT REQUERIDO

### PATCH /api/betting-pools/mass-update
```javascript
// Request
{
  "betting_pool_ids": [1, 10, 16, 63],      // IDs de bancas a actualizar
  "sortition_ids": [1, 2, 3],               // Sorteos a habilitar/deshabilitar
  "zone_ids": [5, 6],                        // Zonas afectadas (filtro)

  // Campos de configuración (solo los que cambian)
  "zone_id": 5,                              // Nueva zona
  "fall_type": 3,                            // Tipo de caída
  "deactivation_balance": -1000,             // Balance de desactivación
  "daily_sale_limit": 50000,                 // Límite diario
  "print_copy": true,                        // Imprimir copia
  "is_active": true,                         // Activa
  "winner_control": true,                    // Control tickets ganadores
  "use_normalized_prizes": false,            // Premios normalizados
  "allow_pot_pass": true,                    // Permitir pasar bote
  "cancel_minutes": 30,                      // Minutos para cancelar
  "daily_cancel_limit": 10,                  // Tickets a cancelar por día
  "language": "es",                          // Idioma
  "print_mode": "driver",                    // Modo impresión
  "discount_provider": "group",              // Proveedor descuento
  "discount_mode": "cash",                   // Modo descuento
  "allow_password_change": true              // Permitir cambiar contraseña
}

// Response
{
  "success": true,
  "updated_count": 4,
  "updated_pools": [1, 10, 16, 63],
  "message": "4 bancas actualizadas exitosamente"
}
```

---

## 7. COMPONENTES REACT NECESARIOS

### Para V1 (Bootstrap)
```
src/components/bancas/
├── MassEdit/
│   ├── MassEditBancas.jsx          # Contenedor principal
│   ├── ConfigurationTab.jsx         # Tab de configuración
│   ├── FootersTab.jsx               # Tab de pies de página
│   ├── PrizesCommissionsTab.jsx     # Tab de premios
│   ├── SorteosTab.jsx               # Tab de sorteos
│   ├── BooleanRadioGroup.jsx        # Radio con "No cambiar"
│   ├── CheckboxList.jsx             # Lista de checkboxes con scroll
│   └── MultiSelectDropdown.jsx      # Dropdown múltiple
└── services/
    └── massEditService.js           # Llamadas API
```

### Para V2 (Material-UI)
```
src/components/features/betting-pools/
├── MassEdit/
│   ├── index.jsx                    # Contenedor
│   ├── ConfigurationTab.jsx
│   ├── components/
│   │   ├── TriStateSwitch.jsx       # Switch con 3 estados
│   │   ├── CheckboxGroup.jsx        # Grupo de checkboxes MUI
│   │   └── TabPanel.jsx             # Panel de tabs
│   └── hooks/
│       └── useMassEdit.js           # Lógica de formulario
```

---

## 8. ESTILOS CSS ESPECÍFICOS

### Para V1 (Bootstrap adicional)
```css
/* Checkbox list con scroll */
.checkbox-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
}

/* Radio buttons tipo botones */
.btn-group-toggle .btn {
  font-size: 0.875rem;
}

.btn-group-toggle .btn.active {
  background-color: #007bff;
  color: white;
}

/* Separador en checkbox list */
.checkbox-list hr {
  margin: 8px 0;
}

/* Label destacado para "Todos" */
.checkbox-list .form-check:first-child label {
  font-weight: bold;
}
```

### Para V2 (Material-UI overrides)
```css
/* Scroll en lista de checkboxes */
.MuiFormGroup-root.scrollable {
  max-height: 400px;
  overflow-y: auto;
}

/* Tabs compactos */
.MuiTabs-root .MuiTab-root {
  min-width: 120px;
}
```

---

## 9. VALIDACIONES

1. **Al menos una entidad seleccionada:** Debe haber al menos una banca, sorteo o zona seleccionada
2. **Valores numéricos válidos:** Balance y límites deben ser números válidos
3. **Confirmación antes de actualizar:** Dialog de confirmación mostrando cuántas bancas se actualizarán
4. **Permisos:** Usuario debe tener permiso de edición masiva

---

## 10. IMPLEMENTACIÓN RECOMENDADA

### Orden de implementación:
1. **API Endpoint** - PATCH /api/betting-pools/mass-update
2. **V1 Bootstrap** - Más fácil por similitud de framework
3. **V2 Material-UI** - Adaptar componentes

### Tiempo estimado:
- API Endpoint: 4-6 horas
- Frontend V1: 8-12 horas
- Frontend V2: 10-14 horas

**Total: 22-32 horas**

---

**Documento generado por Claude Code**
**Para replicar formulario de edición masiva**
