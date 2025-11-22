# 🎫 Implementación del Módulo de Tickets - Frontend

**Fecha:** 2025-11-20
**Versión:** 1.0
**Formato:** Impresora Térmica 80mm (basado en captura.jpg)

---

## 📋 Archivos Creados

### 1. **TicketPrintTemplate.jsx** (Template de impresión)
**Ruta:** `frontend-v1/src/components/tickets/TicketPrintTemplate.jsx`

**Propósito:** Componente que renderiza el ticket con el formato de impresora térmica 80mm.

**Características:**
- Header con logo LA CENTRAL
- Información del ticket (POS, código, fecha, serial)
- Líneas agrupadas por sorteo
- Total del ticket
- Información de premios
- Código de barras
- Datos del cliente y cajero

### 2. **TicketPrint.css** (Estilos de impresión)
**Ruta:** `frontend-v1/src/components/tickets/TicketPrint.css`

**Propósito:** Estilos CSS optimizados para impresora térmica de 80mm.

**Características:**
- Width: 302px (80mm @ 96dpi)
- Font: Courier New (monospace)
- Media queries para impresión
- Separadores y líneas
- Estilos de barcode

### 3. **TicketPrinter.jsx** (Componente de impresión)
**Ruta:** `frontend-v1/src/components/tickets/TicketPrinter.jsx`

**Propósito:** Componente que maneja la lógica de impresión y genera el código de barras.

**Características:**
- Integración con react-to-print
- Generación de código de barras con JsBarcode
- Vista previa del ticket
- Botones de imprimir y cerrar

### 4. **CreateTicket.jsx** (Formulario de creación)
**Ruta:** `frontend-v1/src/components/tickets/CreateTicket.jsx`

**Propósito:** Formulario completo para que la cajera cree tickets.

**Características:**
- Carga de sorteos y tipos de apuesta desde API
- Agregar múltiples líneas
- Datos opcionales del cliente
- Cálculo automático de totales
- Integración con API POST /api/tickets
- Vista previa e impresión automática

---

## 📦 Dependencias Requeridas

### Instalar Librerías

```bash
cd frontend-v1

# React Router (si no está instalado)
npm install react-router-dom

# Librería para impresión
npm install react-to-print

# Librería para código de barras
npm install jsbarcode
```

### Versiones Recomendadas

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "react-to-print": "^2.15.1",
    "jsbarcode": "^3.11.5"
  }
}
```

---

## 🔧 Configuración en App.jsx

### Agregar Rutas

**Archivo:** `frontend-v1/src/App.jsx`

```javascript
import CreateTicket from './components/tickets/CreateTicket';

// ... dentro del return de App:

<Routes>
  {/* ... otras rutas ... */}

  {/* TICKETS */}
  <Route path="/tickets/create" element={<CreateTicket />} />

  {/* ... más rutas ... */}
</Routes>
```

---

## 🗂️ Configuración en menuItems.js

### Agregar Menú de Tickets

**Archivo:** `frontend-v1/src/constants/menuItems.js`

```javascript
export const menuItems = [
  // ... otros items ...

  {
    id: 'tickets',
    label: 'TICKETS',
    icon: 'nc-single-copy-04',
    submenu: [
      {
        id: 'tickets-create',
        label: 'Crear Ticket',
        shortcut: 'C',
        path: '/tickets/create'
      },
      {
        id: 'tickets-list',
        label: 'Lista de Tickets',
        shortcut: 'L',
        path: '/tickets/list'
      }
    ]
  },

  // ... más items ...
];
```

---

## 🎯 Flujo de Uso

### 1. **Cajera Abre "Crear Ticket"**
- Navega a `/tickets/create`
- Se cargan sorteos disponibles y tipos de apuesta desde API

### 2. **Cajera Agrega Líneas**
- Selecciona sorteo (ej: NY 12pm)
- Ingresa número (ej: 25)
- Selecciona tipo (ej: Directo)
- Ingresa monto (ej: $100)
- Click en "AGREGAR LÍNEA"
- Repite para más líneas

### 3. **Datos Opcionales**
- Nombre del cliente
- Teléfono
- Multiplicador global
- Descuento global
- Notas

### 4. **Resumen y Crear**
- Verifica totales calculados
- Click en "CREAR TICKET"
- API crea el ticket → Response 201

### 5. **Impresión Automática**
- Vista previa del ticket en formato térmico
- Código de barras generado
- Click en "IMPRIMIR TICKET"
- Ticket se envía a impresora

### 6. **Después de Imprimir**
- Opción: ¿Crear otro ticket?
  - Sí → Limpia formulario
  - No → Navega a lista de tickets

---

## 🖨️ Configuración de Impresora

### Impresora Térmica Recomendada

- **Tipo:** Impresora térmica de recibos
- **Ancho:** 80mm (3.15 inches)
- **Conectividad:** USB o Ethernet
- **Driver:** ESC/POS compatible

### Marcas Compatibles

- Epson TM-T20
- Star TSP100
- Bixolon SRP-350
- Zebra GK420t
- Cualquier impresora ESC/POS 80mm

### Configuración en Windows

1. Instalar driver de la impresora
2. Configurar como impresora predeterminada (opcional)
3. Ajustar tamaño de papel: 80mm ancho
4. Probar impresión desde navegador

### Configuración en Linux

```bash
# Instalar CUPS
sudo apt-get install cups

# Agregar impresora
lpadmin -p thermal_printer -E -v usb://YourPrinter

# Configurar tamaño de papel
lpoptions -p thermal_printer -o media=Custom.80mmx297mm
```

---

## 🎨 Personalización del Diseño

### Cambiar Logo

**Archivo:** `TicketPrintTemplate.jsx` (línea ~60)

```javascript
<div className="logo-placeholder">
  LA CENTRAL
</div>
```

**Cambiar a:**
```javascript
<div className="logo-placeholder">
  <img src="/assets/images/logo.png" alt="Logo" style={{ maxWidth: '100%' }} />
</div>
```

### Cambiar Información de Premios

**Archivo:** `TicketPrintTemplate.jsx` (línea ~150)

```javascript
<div className="prize-info">
  <div>1ro$56 2do$12 3ro$4 Pick2 $75</div>
  <div>Palé $1000 Pick3$600 Win4$5000</div>
  <div>Super palé$2000 Tripleta$10,000</div>
  <div>x2 $100</div>
</div>
```

**Nota:** Idealmente esta información debería venir del backend (betting_pool_prize_config).

### Cambiar URL del Footer

**Archivo:** `TicketPrintTemplate.jsx` (línea ~160)

```javascript
<div className="ticket-website">
  QUICKMONEYNYC.COM
</div>
```

**Cambiar a tu URL:**
```javascript
<div className="ticket-website">
  {ticketData.bettingPoolWebsite || 'TUDOMINIO.COM'}
</div>
```

---

## 🐛 Troubleshooting

### Problema: Código de Barras No Se Genera

**Causa:** JsBarcode no está instalado o falta inicialización.

**Solución:**
```bash
npm install jsbarcode
```

Verificar en `TicketPrinter.jsx` que exista:
```javascript
import JsBarcode from 'jsbarcode';
```

### Problema: Impresión No Funciona

**Causa:** react-to-print no configurado correctamente.

**Solución:**
1. Verificar instalación: `npm list react-to-print`
2. Verificar import en `TicketPrinter.jsx`:
   ```javascript
   import { useReactToPrint } from 'react-to-print';
   ```
3. Probar en otro navegador (Chrome funciona mejor)

### Problema: Estilos No Se Aplican en Impresión

**Causa:** Media queries de impresión no funcionan.

**Solución:**

Agregar en `TicketPrint.css`:
```css
@media print {
  @page {
    size: 80mm auto;
    margin: 0;
  }
}
```

### Problema: Ticket Se Corta en Impresión

**Causa:** Ancho del papel mal configurado.

**Solución:**

1. Verificar configuración de impresora: debe ser 80mm
2. Ajustar CSS si es necesario:
   ```css
   .ticket-thermal {
     width: 302px; /* 80mm */
   }
   ```

---

## 📊 Ejemplo de Ticket Creado

### Request al API

```bash
curl -X POST http://localhost:5004/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bettingPoolId": 9,
    "userId": 11,
    "lines": [
      {
        "drawId": 123,
        "betNumber": "25",
        "betTypeId": 1,
        "betAmount": 100.00,
        "multiplier": 1.00
      }
    ],
    "globalMultiplier": 1.00,
    "globalDiscount": 0.00,
    "customerName": "Juan Pérez",
    "customerPhone": "809-555-1234"
  }'
```

### Response

```json
{
  "ticketId": 7,
  "ticketCode": "20251120-0002",
  "barcode": "MjAyNTExMjAtMDAwMg==",
  "status": "pending",
  "bettingPoolName": "admin",
  "userName": "Admin User",
  "customerName": "Juan Pérez",
  "customerPhone": "809-555-1234",
  "totalBetAmount": 100.00,
  "totalCommission": 10.00,
  "grandTotal": 90.00,
  "lines": [
    {
      "lineId": 1,
      "lotteryName": "New York Lottery",
      "drawName": "NEW YORK DAY",
      "betNumber": "25",
      "betTypeName": "Directo",
      "betAmount": 100.00,
      "netAmount": 90.00
    }
  ]
}
```

### Ticket Impreso

```
        LA CENTRAL

POS: admin 9
Ticket: 20251120-0002
Fecha: 11/20/2025, 10:45 AM
Serial: MjAyNTExMjAtMDAwMg==
================================

      NEW YORK DAY: $90.00

JUGADA  MONTO   JUGADA  MONTO
25      100.00

================================
     TOTAL TICKET: $90.00
================================

1ro$56 2do$12 3ro$4 Pick2 $75
Palé $1000 Pick3$600 Win4$5000
Super palé$2000 Tripleta$10,000
x2 $100

    QUICKMONEYNYC.COM

   ||||||||||||||||||||||||

--------------------------------
Cliente: Juan Pérez
Tel: 809-555-1234
--------------------------------
Cajero: Admin User
================================
¡Gracias por su preferencia!
Guarde este ticket
```

---

## 🚀 Próximos Pasos (Mejoras Futuras)

### 1. **Impresión Directa a Térmica (Sin Diálogo)**

Usar librerías ESC/POS para enviar comandos directos:
```bash
npm install escpos
npm install escpos-usb
```

### 2. **Reimpresión de Tickets**

Crear endpoint GET `/api/tickets/{id}` y botón "Reimprimir" en lista de tickets.

### 3. **Imprimir Múltiples Copias**

Agregar opción en configuración de banca:
```javascript
const copies = bettingPool.printCopies || 1;
for (let i = 0; i < copies; i++) {
  handlePrint();
}
```

### 4. **Verificar Ticket por Barcode**

Agregar lector de código de barras para:
- Cancelar tickets
- Pagar premios
- Verificar resultados

### 5. **Logo Dinámico**

Cargar logo desde configuración de banca:
```javascript
<img src={ticketData.bettingPoolLogo} alt="Logo" />
```

---

## 📝 Changelog

### Version 1.0 (2025-11-20)

✅ **Implementado:**
- Componente TicketPrintTemplate (formato térmico 80mm)
- Componente TicketPrinter (con react-to-print)
- Componente CreateTicket (formulario completo)
- Estilos CSS para impresora térmica
- Generación de código de barras con JsBarcode
- Cálculo automático de totales y comisiones
- Integración con API POST /api/tickets
- Agrupación de líneas por sorteo
- Datos opcionales del cliente

⏳ **Pendiente:**
- Impresión directa ESC/POS (sin diálogo de impresión)
- Reimpresión de tickets
- Verificación por barcode
- Logo dinámico desde configuración
- Información de premios desde API

---

**Documentación generada:** 2025-11-20
**Autor:** Claude Code
**Basado en:** captura.jpg (tickets de LA CENTRAL)
**Status:** ✅ Listo para usar (requiere instalar dependencias)
