# Análisis: Cobros & Pagos

**Fecha:** 2025-11-18
**Issue:** #28
**Sistema:** Lottery Project - Migración Vue.js → React

---

## Ubicación en la Aplicación Original

**URL:** https://la-numbers.apk.lol/#/dashboard

**Importante:** "Cobros & Pagos" NO es una página separada. Es un **widget/panel en el Dashboard principal**.

---

## Estructura del Componente

### Panel Principal: "Cobros & pagos"

#### 1. Selector de Tipo (Radio Buttons)
- **COBRO** (seleccionado por defecto)
- **PAGO**

#### 2. Campos del Formulario

| Campo | Tipo | Placeholder/Default | Requerido |
|-------|------|---------------------|-----------|
| Código de banca | Dropdown | "Seleccione" | ✅ |
| Banco | Dropdown | "Seleccione" | ✅ |
| Monto | Number Input | - | ✅ |

#### 3. Botón de Acción
- **Botón:** "Crear"
- **Color:** Turquesa
- **Acción:** Crear nuevo cobro o pago según tipo seleccionado

---

## Flujo de Uso

```
1. Usuario selecciona tipo: COBRO o PAGO
2. Selecciona código de banca del dropdown
3. Selecciona banco del dropdown
4. Ingresa monto
5. Click en "Crear"
6. Sistema crea el registro de cobro/pago
```

---

## Endpoints de API (Estimados)

Basándome en el patrón de la aplicación:

```
POST /api/collections      # Para COBROS
POST /api/payments         # Para PAGOS

# O posiblemente unificado:
POST /api/transactions     # Con campo "type": "collection" | "payment"
```

**Payload esperado:**
```json
{
  "type": "collection",  // o "payment"
  "bettingPoolCode": "RB001",
  "bankId": 1,
  "amount": 1000.00
}
```

---

## Análisis de Navegación

El item "Cobros / Pagos" en el menú lateral:
- **URL en menú:** `href="#"`
- **Comportamiento:** Probablemente despliega un submenu o navega al dashboard
- **Estado actual:** No tiene ruta dedicada (404 cuando se intenta acceder a `/#/cobros-pagos`)

---

## Otros Paneles Visibles en el Dashboard

Además de "Cobros & pagos", el dashboard tiene:

1. **Jugadas por sorteo**
   - Dropdown: Sorteo (ej: "Anguila 10am")
   - Tabla: Tipo de jugada | Jugada | Monto

2. **Publicación rápida de resultados**
   - Dropdown: Selección de sorteo
   - Botón: "Publicar"

3. **Bloqueo rápido de números**
   - Dropdown: Sorteo
   - Dropdown: Tipo de jugada
   - Input: Jugada
   - Botones: "Agregar", "Bloquear"

---

## Datos Recopilados de la App Original

### Dropdown: Código de banca
- **Total opciones:** 100+ bancas
- **Formato:** LAN-XXXX (ej: LAN-0001, LAN-0010, LAN-0016...)
- **Fuente:** Probablemente endpoint `/api/betting-pools`

### Dropdown: Banco
- **Estado encontrado:** Lista vacía ("List is empty")
- **Posibles razones:**
  - No hay bancos configurados en el sistema de prueba
  - Depende de la banca seleccionada
  - Requiere configuración adicional

### Campo: Monto
- **Tipo:** Número (spinbutton)
- **Validación:** Probablemente mayor a 0

---

## Hallazgos Clave

1. ✅ "Cobros / Pagos" es un **widget del dashboard**, NO una página separada
2. ✅ La ruta `/#/cobros-pagos` NO existe (retorna 404)
3. ✅ El menú lateral "Cobros / Pagos" tiene `href="#"` (sin ruta específica)
4. ✅ Hay 100+ bancas disponibles en el sistema
5. ⚠️ Lista de bancos estaba vacía en el ambiente de prueba

---

## Pendientes de Investigación

- [ ] ¿Hay una vista de lista de cobros/pagos históricos?
- [ ] ¿Existe funcionalidad de edición/eliminación?
- [ ] ¿Hay reportes de cobros/pagos?
- [ ] ¿Se pueden filtrar por fecha, banca, banco?
- [ ] ¿El menú "Cobros / Pagos" despliega un submenu?
- [ ] ¿Qué sucede al crear un cobro/pago exitosamente?

---

## Recomendaciones de Implementación

### Opción 1: Widget en Dashboard (Como original)
- Implementar como componente `CollectionsPayments` en Dashboard
- Mantiene la misma UX que la app original
- Más simple de implementar

### Opción 2: Página Dedicada + Widget
- Widget resumido en Dashboard
- Página completa con historial, filtros, reportes
- Mejor separación de responsabilidades
- Permite futuras expansiones

**Recomendación:** Empezar con Opción 1 (widget) y luego expandir si se necesita.

---

## Plan de Implementación

### Frontend V1 (Bootstrap)

**Archivo:** `src/components/dashboard/CollectionsPaymentsWidget.jsx`

```jsx
import { useState, useEffect } from 'react';

const CollectionsPaymentsWidget = () => {
  const [type, setType] = useState('collection'); // 'collection' | 'payment'
  const [bettingPoolCode, setBettingPoolCode] = useState('');
  const [bankId, setBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [bettingPools, setBettingPools] = useState([]);
  const [banks, setBanks] = useState([]);

  useEffect(() => {
    // Load betting pools
    fetchBettingPools();
    // Load banks
    fetchBanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call to create collection/payment
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6>Cobros & pagos</h6>
        {/* Radio buttons: Cobro / Pago */}
        {/* Dropdown: Código de banca */}
        {/* Dropdown: Banco */}
        {/* Input: Monto */}
        {/* Button: Crear */}
      </div>
    </div>
  );
};
```

### Frontend V2 (Material-UI)

**Archivo:** `src/components/features/dashboard/CollectionsPaymentsWidget/index.jsx`

```jsx
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';

const CollectionsPaymentsWidget = () => {
  const [type, setType] = useState('collection');
  const [bettingPoolCode, setBettingPoolCode] = useState('');
  const [bankId, setBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [bettingPools, setBettingPools] = useState([]);
  const [banks, setBanks] = useState([]);

  // Implementation...

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Cobros & pagos</Typography>
        <ToggleButtonGroup value={type} exclusive onChange={...}>
          <ToggleButton value="collection">Cobro</ToggleButton>
          <ToggleButton value="payment">Pago</ToggleButton>
        </ToggleButtonGroup>
        {/* Rest of form */}
      </CardContent>
    </Card>
  );
};
```

### API Endpoints (Del backend existente - solo consumir)

**Nota:** El backend ya existe en la app original. Solo necesitamos identificar y consumir los endpoints.

```
GET  /api/betting-pools              # Ya existe - Lista de bancas
GET  /api/banks                      # A verificar - Lista de bancos
POST /api/collections                # A verificar - Crear cobro
POST /api/payments                   # A verificar - Crear pago
```

**Tarea:** Interceptar llamadas de API de la app original para identificar endpoints exactos.

---

## Screenshots

- `dashboard-cobros-pagos-panel.png` - Panel completo visible en dashboard

---

## Próximos Pasos

1. ✅ Analizar estructura del componente
2. ⏳ Verificar si existe submenu o página dedicada
3. ⏳ Interceptar llamadas de API al crear un cobro/pago
4. ⏳ Documentar campos de dropdown (bancas, bancos)
5. ⏳ Crear componentes para V1 y V2

---

**Última actualización:** 2025-11-18
**Estado:** En análisis
