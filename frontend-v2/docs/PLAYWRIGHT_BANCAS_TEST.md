# Test de BANCAS - Lista y Selección

**Fecha:** 2025-11-14
**Estado:** ✅ VERIFICADO Y FUNCIONAL

---

## 📋 Resumen del Test

Test completo para navegar a la sección BANCAS → Lista y seleccionar una banca específica (Banca #9).

### Resultado del Test
- ✅ Login exitoso
- ✅ Navegación a BANCAS correcta
- ✅ Submenú "Lista" funcional
- ✅ Banca #9 seleccionada exitosamente
- ✅ 5 screenshots capturados
- ✅ 3 API calls documentados

---

## 🎯 Flujo del Test

### Paso 1: Login
```javascript
// Credenciales
Usuario: admin
Contraseña: Admin123456

// Selectores
'input[placeholder*="Usuario" i]'
'input[placeholder*="Contraseña" i]'
'button:has-text("INICIAR SESIÓN")'
```

### Paso 2: Navegación a BANCAS
```javascript
// Selector del menú BANCAS
'text=BANCAS'

// Comportamiento:
// Al hacer clic, se despliega submenú con opciones
```

### Paso 3: Submenú "Lista"
```javascript
// Selector
'text=Lista'

// URL resultante
http://localhost:4000/betting-pools/list
```

### Paso 4: Selección de Banca #9
```javascript
// Selector VERIFICADO
'text=/^9$/'

// Selector alternativo
'td:has-text("9")'
```

---

## 📊 Estructura de la Lista de Bancas

### Tabla Principal

La lista de bancas se muestra en una tabla con las siguientes columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **Número** ↑ | ID de la banca | 9, 10, 20, 21... |
| **Nombre** | Nombre de la banca | admin, LAN-0010, LAN-0020... |
| **Referencia** | Código de referencia | RB003333, L-0010, L-0020... |
| **Usuarios** | Icono + código | 🔑 0009, 🔑 0010... |
| **Activa** | Estado (toggle azul) | 🔵 Activo |
| **Zona** | Grupo asignado | GRUPO ALEX $, GRUPO JM MA ***... |
| **Balance** | Saldo actual | $0.00 |
| **Caída Acumulada** | Total acumulado | $0.00 |
| **Préstamos** | Préstamos | $0.00 |
| **Acciones** | Botón editar | ✏️ |

### Datos de Ejemplo (Bancas Visibles)

```
Número | Nombre     | Referencia | Usuarios | Zona              | Balance
-------|------------|------------|----------|-------------------|--------
9      | admin      | RB003333   | 🔑 0009  | GRUPO ALEX $      | $0.00
10     | LAN-0010   | L-0010     | 🔑 0010  | GRUPO JM MA ***   | $0.00
20     | LAN-0020   | L-0020     | 🔑 0020  | GRUPO JM AME ***  | $0.00
21     | LAN-0021   | L-0021     | 🔑 0021  | GRUPO JM AME ***  | $0.00
22     | LAN-0022   | L-0022     | 🔑 0022  | Test Zone With... | $0.00
23     | LAN-0023   | L-0023     | 🔑 0023  | GRUPO JONATHAN #  | $0.00
24     | LAN-0024   | L-0024     | 🔑 0024  | GRUPO PARACHE ^^  | $0.00
25     | LAN-38671  | L-38671    | 🔑 38671 | GRUPO JM AME ***  | $0.00
```

### Funcionalidades de la Lista

1. **Filtro de Zonas**
   - Selector: Dropdown "6 seleccionadas"
   - Permite filtrar bancas por zona

2. **Búsqueda Rápida**
   - Campo: "Búsqueda rápida..."
   - Busca en tiempo real

3. **Paginación**
   - Muestra: "8 de 8 pools"
   - Selector: "Filas por página: 10"
   - Navegación: "1-8 de 8" con flechas

4. **Ordenamiento**
   - Columna "Número" tiene flecha ↑
   - Ordenable por columnas

---

## 🔌 API Calls Ejecutados

### 1. Login
```
POST /api/auth/login

Body: { username: "admin", password: "..." }
Response: Token JWT + redirección
```

### 2. Zonas
```
GET /api/zones

Response: Lista de zonas disponibles para filtrado
```

### 3. Lista de Bancas (Betting Pools)
```
GET /api/betting-pools?page=1&pageSize=1000

Response: Array de bancas con toda la información
```

---

## 🎨 Selectores Útiles Documentados

### Menú BANCAS

```javascript
// Elemento principal del menú
'text=BANCAS'

// Submenú expandido (cuando BANCAS está seleccionado)
const submenuBancas = {
  lista: 'text=Lista',
  crear: 'text=Crear',
  edicionMasiva: 'text=Edicion masiva',
  acceso: 'text=Acceso',
  limpiarPendientes: 'text=Limpiar pendientes de pago',
  listaSinVentas: 'text=Lista sin ventas',
  reporteDias: 'text=Reporte de dias sin venta'
};
```

### Tabla de Bancas

```javascript
// Tabla principal
'table'

// Filas de bancas
'tr'

// Columnas (por header)
const columnas = {
  numero: 'th:has-text("Número")',
  nombre: 'th:has-text("Nombre")',
  referencia: 'th:has-text("Referencia")',
  usuarios: 'th:has-text("Usuarios")',
  activa: 'th:has-text("Activa")',
  zona: 'th:has-text("Zona")',
  balance: 'th:has-text("Balance")',
  caida: 'th:has-text("Caída Acumulada")',
  prestamos: 'th:has-text("Préstamos")',
  acciones: 'th:has-text("Acciones")'
};
```

### Seleccionar una Banca Específica

```javascript
// Por número exacto (método recomendado)
const bancaNumero = (num) => `text=/^${num}$/`;

// Ejemplos:
'text=/^9$/'   // Banca #9
'text=/^10$/'  // Banca #10
'text=/^20$/'  // Banca #20

// Por fila completa
`tr:has-text("admin")`  // Banca con nombre "admin"

// Por botón de editar
'button[aria-label*="edit"]'
'td:has(svg) button'  // Botón con ícono de edición
```

### Filtros y Búsqueda

```javascript
// Dropdown de zonas
'[class*="select"]:has-text("seleccionadas")'

// Campo de búsqueda
'input[placeholder*="Búsqueda rápida"]'

// Paginación
'[class*="pagination"]'
'button:has-text("10")'  // Selector de filas por página
```

---

## 📝 Script Completo

**Ubicación:** `tests/bancas-lista-banca9.spec.js`

**Ejecución:**
```bash
cd /home/jorge/.claude/skills/playwright-skill
node run.js /home/jorge/projects/Lottery-Project/LottoWebApp/tests/bancas-lista-banca9.spec.js
```

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Navegación a BANCAS → Lista
- ✅ Banca #9 seleccionada
- ✅ 5 screenshots en `/tmp/`
- ✅ 3 API calls documentados

---

## 📸 Screenshots Generados

1. **01-dashboard.png** - Dashboard después del login
2. **02-bancas-menu-clicked.png** - Menú BANCAS expandido
3. **03-bancas-lista.png** - Lista completa de bancas
4. **04-banca-9-selected.png** - Banca #9 seleccionada
5. **05-final-state.png** - Estado final del test

---

## 🔍 Observaciones Importantes

### Estructura del Menú BANCAS

El menú BANCAS es desplegable y contiene los siguientes items:

```
BANCAS (expandible)
├── L Lista ✅ VERIFICADO
├── C Crear
├── E Edicion masiva
├── A Acceso
├── L Limpiar pendientes de pago
├── L Lista sin ventas
└── R Reporte de dias sin venta
```

### Datos de las Bancas

Cada banca tiene:
- **Número único** (usado como ID)
- **Nombre descriptivo**
- **Referencia** (código interno)
- **Usuario asociado**
- **Estado activo/inactivo** (toggle)
- **Zona asignada**
- **Balances financieros**
- **Acción de edición**

### Notas Técnicas

1. **Selector Robusto:** El selector `text=/^9$/` busca el texto exacto "9", evitando matches con "19", "29", "90", etc.

2. **Paginación:** La lista soporta paginación. Por defecto muestra 10 items por página.

3. **Filtrado:** Se pueden filtrar bancas por zona usando el dropdown.

4. **Búsqueda:** El campo de búsqueda filtra en tiempo real.

5. **URL Pattern:** La ruta para la lista es `/betting-pools/list`, no `/bancas/list`.

---

## ✨ Plantilla para Seleccionar Otras Bancas

```javascript
// Plantilla genérica para seleccionar cualquier banca
async function seleccionarBanca(page, numeroBanca) {
  // Login
  await page.goto('http://localhost:4000');
  await page.locator('input[placeholder*="Usuario" i]').fill('admin');
  await page.locator('input[placeholder*="Contraseña" i]').fill('Admin123456');
  await page.locator('button:has-text("INICIAR SESIÓN")').click();
  await page.waitForTimeout(3000);

  // Ir a BANCAS → Lista
  await page.locator('text=BANCAS').first().click();
  await page.waitForTimeout(1500);
  await page.locator('text=Lista').first().click();
  await page.waitForTimeout(2000);

  // Seleccionar banca específica
  const selector = `text=/^${numeroBanca}$/`;
  await page.locator(selector).first().click();

  console.log(`✅ Banca #${numeroBanca} seleccionada`);
}

// Uso
await seleccionarBanca(page, 9);   // Banca #9
await seleccionarBanca(page, 10);  // Banca #10
await seleccionarBanca(page, 20);  // Banca #20
```

---

## 🚀 Próximos Tests Sugeridos

1. **Test de Edición de Banca**
   - Seleccionar banca
   - Hacer clic en el botón de editar (✏️)
   - Modificar campos
   - Guardar cambios

2. **Test de Creación de Banca**
   - BANCAS → Crear
   - Llenar formulario
   - Crear nueva banca

3. **Test de Filtrado por Zona**
   - Usar dropdown de zonas
   - Verificar que se filtran correctamente

4. **Test de Búsqueda**
   - Usar campo de búsqueda rápida
   - Verificar resultados

5. **Test de Paginación**
   - Cambiar cantidad de filas por página
   - Navegar entre páginas

---

**Documentación creada:** 2025-11-14
**Test verificado:** ✅ 100% Funcional
**Total bancas detectadas:** 8 (en página 1)
