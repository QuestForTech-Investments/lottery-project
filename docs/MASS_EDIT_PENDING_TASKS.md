# Mass Edit Betting Pools - Tareas Pendientes

**Fecha:** 2025-11-16
**Estado:** En progreso
**Archivos:**
- V1: `/frontend-v1/src/components/MassEditBancas.jsx`
- V2: `/frontend-v2/src/components/features/betting-pools/MassEditBettingPools/index.jsx`

---

## Tabs del Mass Edit (4 total)

### ✅ Tab 1: Configuración
**Status:** COMPLETADO
**Contenido:**
- Sección 1 (full-width):
  - Zona (dropdown)
  - Tipo de caída (6 botones en una línea)
  - Balance de desactivación (input)
  - Límite diario de venta (input)
- Sección 2 (dos columnas):
  - Columna izquierda: Minutos cancelación, Tickets a cancelar, Imprimir copia, Activa
  - Columna derecha: Control tickets, Premios normalizados, Permitir jugadas, Cambiar contraseña
- Sección 3:
  - Sorteos (badges seleccionables)
  - Bancas (badges seleccionables)
  - Zonas (badges seleccionables)
  - Switch "Actualizar valores generales"

### 🔄 Tab 2: Pies de Página (SIGUIENTE)
**Status:** PENDIENTE
**Prioridad:** ALTA - Próximo a implementar

**Funcionalidad esperada:**
- Configuración de pies de página para tickets
- Textos personalizados por banca
- Vista previa del pie de página
- Opciones de formato

**Referencia:** Analizar la app Vue.js original para ver la estructura exacta

---

### ⏳ Tab 3: Premios & Comisiones
**Status:** PENDIENTE
**Prioridad:** MEDIA

**Funcionalidad esperada:**
- Configuración masiva de premios por tipo de apuesta
- Similar al tab de Premios & Comisiones en EditBanca
- Multiplicadores por defecto para todas las bancas seleccionadas

---

### ⏳ Tab 4: Sorteos
**Status:** PENDIENTE
**Prioridad:** MEDIA

**Funcionalidad esperada:**
- Asignación masiva de sorteos a bancas
- Activar/desactivar sorteos
- Configuración de horarios

---

## Contexto Técnico

### Layout Requerido
- Viewport mínimo: 1400px para layout óptimo
- "Tipo de caída" 6 botones en UNA línea (sin wrap)
- Labels y controles centrados verticalmente (`alignItems: 'center'`)

### Componentes Reutilizables (V1)
```javascript
import {
  ToggleButtonGroup,  // Botones rectangulares (ENCENDER/APAGAR/NO CAMBIAR)
  IPhoneToggle,       // Switch estilo iPhone
  SelectableBadgeGroup, // Badges clickeables
  COLORS              // Constantes de colores
} from '@components/common/form';
```

### Componentes MUI (V2)
```javascript
import {
  ToggleButtonGroup,
  ToggleButton,
  Chip,              // Para badges
  Switch,            // Para toggles
  Stack,             // Para layout
  TextField,
  Select
} from '@mui/material';
```

### State Management
```javascript
const [activeTab, setActiveTab] = useState('Configuración');
const [formData, setFormData] = useState({
  // ... configuración general
  // TODO: agregar campos para Pies de página
  // TODO: agregar campos para Premios & Comisiones
  // TODO: agregar campos para Sorteos
});
```

---

## Próximos Pasos

1. **Analizar Vue.js app** para ver estructura exacta del tab "Pies de página"
   - URL: https://la-numbers.apk.lol
   - Credenciales: oliver / oliver0597@
   - Usar Playwright para navegar y capturar estructura

2. **Implementar Tab 2 (Pies de página)**
   - Crear campos de formulario
   - Agregar state management
   - Implementar en V1 primero, luego replicar en V2

3. **Continuar con Tab 3 y 4**

---

## Rutas

- **V1:** http://localhost:4200/bancas/edicion-masiva
- **V2:** http://localhost:4000/betting-pools/mass-edit

---

**Última actualización:** 2025-11-16 20:10
