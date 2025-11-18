# Estado de Migración - Módulo de Balances

**Fecha:** 2025-11-17
**Sistema:** Lottery Project - Migración Vue.js → React

---

## Aplicación Original (Vue.js)

### Credenciales de Acceso
- **URL:** https://la-numbers.apk.lol
- **Usuario:** `oliver`
- **Contraseña:** `oliver0597@`
- **Estado:** Producción, funcional

### Secciones de Balances Disponibles
1. **Bancas** - `/balances/bancas` ✅ COMPLETADO
2. **Bancos** - `/balances/bancos` ✅ COMPLETADO
3. **Zonas** - `/balances/zones` ✅ COMPLETADO
4. **Grupos** - `/balances/groups` ✅ COMPLETADO

---

## Frontend V1 (Bootstrap)

### URLs del Proyecto
- **Puerto:** http://localhost:4200
- **Ubicación:** `/home/jorge/projects/lottery-project/frontend-v1`
- **Framework:** React 18 + Vite + Bootstrap 5

### Secciones Implementadas

#### 1. Balances de Bancas ✅
- **Ruta:** `/balances/bancas`
- **Archivo:** `src/components/balances/BettingPoolBalances.jsx`
- **Características:**
  - Filtro de fecha
  - Filtro de zonas (multi-select)
  - Filtro de tipo de balance (TODOS, POSITIVOS, NEGATIVOS)
  - Tabla con columnas: Número, Nombre, Usuarios, Referencia, Zona, Balance, Préstamos
  - Ordenamiento por columnas
  - Paginación
  - Quick filter
  - Color coding (azul/rojo para positivos/negativos)
  - Fila de totales

#### 2. Balances de Bancos ✅
- **Ruta:** `/balances/bancos`
- **Archivo:** `src/components/balances/BankBalances.jsx`
- **Características:**
  - Tabla con columnas: Nombre, Código, Zona, Balance
  - Ordenamiento por columnas
  - Paginación
  - Quick filter
  - Color coding
  - Fila de totales
  - **Total Mock:** $60,762.15

#### 3. Balances de Zonas ✅
- **Ruta:** `/balances/zonas`
- **Archivo:** `src/components/balances/ZoneBalances.jsx`
- **Características:**
  - Tabla con columnas: Nombre, Balance
  - Ordenamiento por columnas
  - Paginación
  - Quick filter
  - Color coding
  - Fila de totales
  - **Total Mock:** $138,381.70
  - **Mock Data:** 5 zonas (NORTE, SUR, ESTE, OESTE, CENTRAL)

#### 4. Balances de Grupos ✅
- **Ruta:** `/balances/grupos`
- **Archivo:** `src/components/balances/GroupBalances.jsx`
- **Características:**
  - **Filtro de fecha** (diferencia clave vs Zonas)
  - Tabla con columnas: Nombre, Balance
  - Ordenamiento por columnas
  - Paginación
  - Quick filter
  - Color coding
  - Fila de totales
  - **Total Mock:** $8,451.91
  - **Mock Data:** 5 grupos (#Consorcio GS, JC, MP, RD, TA)

### Archivos de Estilo
- **CSS Principal:** `src/assets/css/balances.css`
- **Variables:**
  - Color turquesa: `#51cbce`
  - Positivos: `#e3f2fd` (fondo) + `#1565c0` (texto)
  - Negativos: `#ffebee` (fondo) + `#c62828` (texto)

### Configuración del Menú
- **Archivo:** `src/constants/menuItems.js`
- **Líneas 69-78:** Sección de BALANCES con 4 submenu items
  - Bancas: `/balances/bancas`
  - Bancos: `/balances/bancos`
  - Zonas: `/balances/zonas`
  - Grupos: `/balances/grupos`

---

## Frontend V2 (Material-UI)

### URLs del Proyecto
- **Puerto:** http://localhost:4000 (o 4002 si 4000 ocupado)
- **Ubicación:** `/home/jorge/projects/lottery-project/frontend-v2`
- **Framework:** React 18 + Vite + Material-UI

### Secciones Implementadas

#### 1. Balances de Bancas ✅
- **Ruta:** `/balances/betting-pools`
- **Archivo:** `src/components/features/balances/BettingPoolBalances/index.jsx`
- **Componentes Compartidos:**
  - `BalanceTable` - Tabla reutilizable
  - `QuickFilter` - Input de búsqueda
  - `DateFilter` - Selector de fecha
  - `ZoneFilter` - Multi-select de zonas
  - `BalanceTypeFilter` - Radio buttons para tipo

#### 2. Balances de Bancos ✅
- **Ruta:** `/balances/banks`
- **Archivo:** `src/components/features/balances/BankBalances/index.jsx`
- **Usa:** BalanceTable, QuickFilter
- **Total Mock:** $60,762.15 (mismo que V1)

#### 3. Balances de Zonas ✅
- **Ruta:** `/balances/zones`
- **Archivo:** `src/components/features/balances/ZoneBalances/index.jsx`
- **Usa:** BalanceTable, QuickFilter
- **Total Mock:** $138,381.70 (mismo que V1)

#### 4. Balances de Grupos ✅
- **Ruta:** `/balances/groups`
- **Archivo:** `src/components/features/balances/GroupBalances/index.jsx`
- **Usa:** BalanceTable, QuickFilter, DateFilter
- **Total Mock:** $8,451.91 (mismo que V1)

### Componentes Compartidos
**Ubicación:** `src/components/features/balances/common/`
- `BalanceTable.jsx` - Tabla con sorting y color coding
- `QuickFilter.jsx` - TextField con icono de búsqueda
- `DateFilter.jsx` - Date picker
- `ZoneFilter.jsx` - Multi-select dropdown
- `BalanceTypeFilter.jsx` - Radio button group

---

## Backend API

### URLs del API
- **Puerto:** http://localhost:5000
- **Ubicación:** `/home/jorge/projects/lottery-project/api/src/LotteryApi`
- **Framework:** .NET 8.0 + Entity Framework Core
- **Database:** SQL Server (Azure SQL)

### Endpoints Relevantes (Futuros)
```
GET /api/balances/betting-pools?date={date}&zones={zones}&type={type}
GET /api/balances/banks
GET /api/balances/zones
GET /api/balances/groups?date={date}
```

**Nota:** Actualmente todos los componentes usan datos mock. Los endpoints reales se implementarán en fase posterior.

---

## Screenshots Capturados

### Original (Vue.js)
- `original-banks-balances.png` - Sección de Bancos
- `original-zones-balances.png` - Sección de Zonas (vacía en original)
- `original-groups-balances.png` - Sección de Grupos con datos

### V1 (Bootstrap)
- `v1-betting-pool-balances.png` - Bancas
- `v1-bank-balances.png` - Bancos
- `v1-zone-balances.png` - Zonas
- `v1-group-balances.png` - Grupos

### V2 (Material-UI)
- `v2-betting-pool-balances.png` - Betting Pools
- `v2-bank-balances.png` - Banks
- `v2-zone-balances.png` - Zones
- `v2-group-balances.png` - Groups

**Ubicación:** `/home/jorge/projects/.playwright-mcp/`

---

## Comandos Útiles

### Iniciar Servidores de Desarrollo

```bash
# API Backend
cd /home/jorge/projects/lottery-project/api/src/LotteryApi
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet
dotnet run --urls "http://0.0.0.0:5000"

# Frontend V1
cd /home/jorge/projects/lottery-project/frontend-v1
npm run dev  # Puerto 4200

# Frontend V2
cd /home/jorge/projects/lottery-project/frontend-v2
npm run dev  # Puerto 4000 o 4002
```

### Verificar Puertos
```bash
lsof -ti:4200  # V1
lsof -ti:4000  # V2
lsof -ti:5000  # API
```

---

## Próximos Pasos - Sección COBROS / PAGOS

### Análisis Pendiente
1. Navegar a https://la-numbers.apk.lol/#/cobros-pagos
2. Identificar subsecciones
3. Documentar estructura de datos
4. Capturar screenshots
5. Definir componentes necesarios

### Componentes Estimados (basado en patrón)
- **V1:** `src/components/payments/`
- **V2:** `src/components/features/payments/`
- Reutilizar componentes comunes de Balances donde aplique

---

## Issues Conocidos

### V1 - Caché del Navegador
**Síntoma:** Botones de menú "Zonas" y "Grupos" muestran páginas en blanco
**Causa:** Caché del navegador no actualizado después de agregar nuevas rutas
**Solución:**
1. Hacer hard refresh: `Ctrl+F5` (Windows/Linux) o `Cmd+Shift+R` (Mac)
2. O limpiar caché del navegador:
   - Chrome/Edge: F12 → Application → Clear Storage → Clear site data
   - Firefox: Ctrl+Shift+Delete → Cached Web Content

---

## Notas Técnicas

### Patrón de Implementación
1. Analizar sección original con Playwright
2. Capturar screenshots
3. Identificar estructura de datos
4. Crear componente V2 (MUI) primero
5. Reutilizar componentes comunes cuando sea posible
6. Crear componente V1 (Bootstrap)
7. Agregar rutas en ambos App.jsx
8. Actualizar menuItems.js (si necesario)
9. Probar con Playwright
10. Capturar screenshots de verificación

### Convenciones de Naming
- **V1 Rutas:** español (`/balances/bancas`, `/balances/zonas`)
- **V2 Rutas:** inglés (`/balances/betting-pools`, `/balances/zones`)
- **Componentes V1:** Español + sufijo descriptivo (`BettingPoolBalances`, `ZoneBalances`)
- **Componentes V2:** Inglés + organización por features

---

**Última Actualización:** 2025-11-17 21:56 PM
**Estado General:** ✅ Módulo Balances 100% completado
**Siguiente Módulo:** Cobros / Pagos
