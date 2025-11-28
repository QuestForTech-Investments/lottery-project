# Context - LottoWebApp

## ⚙️ Preferencias del Proyecto

### Workflow de Desarrollo
- **🚫 NO subir cambios a git automáticamente**: Solo hacer commits cuando el usuario lo solicite explícitamente
- **🤖 Usar frontend-developer agent por defecto**: Para todas las tareas de React/Frontend, invocar al frontend-developer agent a menos que el usuario especifique otra cosa
- **📋 Usar TodoWrite para tracking**: Siempre usar la herramienta TodoWrite para planificar y trackear progreso de tareas

### Agentes Disponibles
- `frontend-developer` - Para tareas de React, componentes UI, state management, arquitectura frontend
- `ui-ux-designer` - Para diseño de interfaces y experiencia de usuario

## Información del Proyecto

**Nombre**: LottoWebApp
**Tipo**: Sistema de gestión de loterías
**Stack**: React 18 + Vite
**UI**: Material-UI v7, Tailwind CSS (custom CSS para formularios)
**Ruta**: `/mnt/h/GIT/LottoWebApp/src`

## Arquitectura del Proyecto

### Estructura de Directorios
```
src/
├── components/
│   ├── CreateBanca.jsx         # Formulario crear banca (8 tabs)
│   ├── EditBanca.jsx           # Formulario editar banca
│   ├── UserAdministradores.jsx
│   ├── UserBancas.jsx
│   ├── UserIniciosSesion.jsx
│   ├── UserSesionesBloqueadas.jsx
│   └── modals/
│       └── LotteryHelpModal.jsx
├── assets/
│   └── css/
│       ├── FormStyles.css           # Sistema de estilos unificado
│       ├── CreateBranchGeneral.css  # Estilos legacy + deprecated
│       ├── create-banca.css
│       ├── edit-banca.css
│       ├── user-administradores.css
│       ├── user-bancas.css
│       └── user-list.css
└── utils/
    └── loggerSetup.js
```

## Sistema de Estilos Unificado

### FormStyles.css - Diseño Central
Creado para mantener **consistencia visual** en todos los formularios.

#### Variables CSS (Design Tokens)
```css
:root {
  /* Colores */
  --form-label-color: rgb(120, 120, 120);
  --form-input-text-color: rgb(60, 60, 60);
  --form-input-border-color: rgb(221, 221, 221);
  --form-input-focus-color: #51cbce;

  /* Tipografía */
  --form-font-family: Montserrat, "Helvetica Neue", Arial, sans-serif;
  --form-label-size: 12px;
  --form-label-bold-size: 14px;
  --form-input-size: 14px;

  /* Espaciado */
  --form-group-spacing: 8px;
  --form-label-width: 280px;
  --form-input-height: 31px;
  --form-button-height: 33px;
}
```

#### Clases Principales
- `.form-tab-container` - Contenedor de tab
- `.form-row` - Fila con columnas (flexbox)
- `.form-column` - Columna izquierda
- `.form-column-offset` - Columna derecha (con offset superior)
- `.form-group` - Grupo label + input
- `.form-label` - Label estándar
- `.form-label-bold` - Label en negrita
- `.form-input` - Input de texto
- `.form-select` - Select/dropdown
- `.form-textarea` - Textarea
- `.form-button-group` - Grupo de botones radio tipo Bootstrap
- `.form-radio-button` - Botón radio individual
- `.form-toggle` - Toggle switch
- `.form-toggle-slider` - Slider del toggle

### Migración de Estilos

#### Tabs Migrados
- ✅ **General** - Migrado a FormStyles.css
- ✅ **Configuración** - Migrado a FormStyles.css

#### Tabs Pendientes
- ⏳ Pies de página
- ⏳ Premios & Comisiones
- ⏳ Horarios de sorteos
- ⏳ Sorteos
- ⏳ Estilos
- ⏳ Gastos automáticos

## Componente CreateBanca

### Estructura de Tabs
1. **General** - Datos básicos de la banca
2. **Configuración** - Zonas, tipo de caída, balances, límites
3. **Pies de página** - Textos personalizados
4. **Premios & Comisiones** - Configuración de premios
5. **Horarios de sorteos** - Configuración de horarios
6. **Sorteos** - Gestión de sorteos
7. **Estilos** - Personalización visual
8. **Gastos automáticos** - Configuración de gastos

### Tab Configuración - Implementación Actual

#### Columna Izquierda
- **Zona** (select)
- **Tipo de caída** (6 botones radio tipo Bootstrap)
- **Balance de desactivación** (input text)
- **Límite de venta diaria** (input text)
- **Balance límite al día** (input text)

#### Columna Derecha
- **Modo Impresión** (3 botones radio)
- **Copia automática** (toggle switch)
- **Imprimir al eliminar ticket** (toggle switch)
- **Imprimir log al eliminar ticket** (toggle switch)
- **Imprimir resultados** (toggle switch)
- **Utilizar impresora externa** (toggle switch)

### Sección "Copiar de banca plantilla"
Ubicada después del formulario principal. Permite copiar configuración desde otra banca existente.

**Estilo actual**:
- Fondo blanco limpio
- Fuente: 22px (actualizado recientemente)
- Font-family: Arial, Helvetica, sans-serif

## Cambios Recientes

### 2025-10-17
1. **Ajuste de espaciado en formularios**
   - Aumentado spacing entre grupos: 6px → 8px
   - Añadido height fijo a labels (31px) para alineación vertical
   - Padding de labels: `0px 10px 0px 0px` (solo derecha)
   - Eliminado margin-bottom de button groups

2. **Aumento de fuente "Copiar de banca plantilla"**
   - Tamaño: 16px → 18px → 22px
   - Archivo: `CreateBranchGeneral.css:555`

3. **Implementación sistema unificado de estilos**
   - Creado `FormStyles.css` con variables CSS
   - Migrados tabs "General" y "Configuración"
   - Documentado en `GUIA_ESTILOS_FORMULARIOS.md`

## Git - Estado Actual

**Branch**: main
**Commits recientes**:
- `2c04e92` - Multiselect de zonas y asignación de banca
- `5dbcbd8` - Formulario edición de usuarios completo
- `7800fd5` - Formulario editar usuario con permisos
- `abd79d2` - Simplificación CreateUser form
- `1749754` - Sistema completo de gestión de usuarios

**Archivos modificados** (sin commit):
- `CREATE_BANCA_README.md`
- `EDITAR_USUARIO_IMPLEMENTADO.md`
- `PROMPT_ENDPOINT_LOGS_API.md`
- `SISTEMA_LOGS_CENTRALIZADO.md`
- `create-banca-demo.html`
- `assets/css/*` (varios archivos CSS)
- `components/*` (varios componentes)
- `utils/loggerSetup.js`

**Archivos sin seguimiento**:
- `docs/` (directorio nuevo)

## Referencias de Diseño

### Archivos JSON de Especificación
- `configuracion-componentes.json` - Estructura de componentes del tab Configuración
- `configuracion-estilos.json` - Estilos extraídos del diseño original

Estos archivos se usaron como referencia para implementar pixel-perfect el tab de Configuración.

## Notas de Desarrollo

### Principios de Diseño
1. **Consistencia**: Todos los formularios deben usar FormStyles.css
2. **Responsive**: Layout adaptable sin overflow
3. **Pixel-perfect**: Respetar dimensiones exactas del diseño original
4. **Accesibilidad**: Labels descriptivos, focus states claros

### Convenciones de Código
- Usar CSS variables de FormStyles.css, no valores hardcoded
- Preferir clases `.form-*` sobre clases custom
- Mantener estructura HTML: `form-group > label + input`
- Labels: 280px de ancho fijo para alineación

### Testing
- Verificar responsive en diferentes tamaños de ventana
- Probar todos los toggles y radio buttons
- Validar que no haya elementos que se salgan del contenedor
- Refrescar con Ctrl+F5 después de cambios CSS

## Documentación Adicional

- `GUIA_ESTILOS_FORMULARIOS.md` - Guía completa del sistema de estilos
- `CREATE_BANCA_README.md` - Documentación específica de CreateBanca
- `EDITAR_USUARIO_IMPLEMENTADO.md` - Implementación formulario editar usuario

## Documentación de la API

**Ruta**: `H:\GIT\lottery-api\LotteryAPI\Docs\🔌 Documentación Completa de la API - Sistema de Lotería.md`

Documentación completa de todos los endpoints del backend de la API del sistema de lotería.
