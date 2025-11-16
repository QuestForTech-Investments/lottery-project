# 📝 Dudas para Reunión con el Equipo

**Fecha de Creación:** 2025-10-18
**Proyecto:** LottoWebApp - Sistema de Gestión de Loterías
**Objetivo:** Documentar dudas y aclaraciones necesarias sobre la integración Frontend-Backend

---

## 🏦 **1. Gestión de Bancas - ID vs Número**

### **Contexto:**
Al crear una banca, el formulario muestra un código como `LAN-0001`, pero en el listado de bancas solo se muestra el número `1` en la columna "Número".

### **Duda:**
- ¿Se guarda en la base de datos el ID completo (`LAN-0001`) y luego se extrae solo el número para mostrarlo en el listado?
- ¿O son dos campos separados en la base de datos?
  - `branchId` (int): ID autonumérico (1, 2, 3...)
  - `branchCode` (string): Código alfanumérico ("LAN-0001", "LAN-0002"...)

### **Comportamiento Observado:**
- **Formulario Crear Banca:** Muestra `LAN-0001` como código de banca
- **Listado de Bancas:** Columna "Número" muestra solo `1`

### **Comportamiento Actual en Frontend:**
```javascript
// El frontend está extrayendo solo los dígitos del branchCode
const numericCode = branch.branchCode.replace(/\D/g, ''); // "LAN-0001" -> "0001"
const numero = parseInt(numericCode); // "0001" -> 1
```

### **Pregunta para el Equipo:**
1. ¿Es correcto extraer solo los números del `branchCode`?
2. ¿Existe un campo numérico separado en la BD que deberíamos usar?
3. ¿Qué pasa si hay bancas con códigos como "BC-0001" y "LAN-0001"? ¿Ambos mostrarían `1`?

### **Estado:** ⏳ Pendiente de Aclaración

---

## ⚙️ **2. Configuración de Horarios de Sorteos**

### **Contexto:**
En el formulario de crear banca, existe un tab "Horarios de sorteos" donde se configuran horarios de inicio y fin para cada día de la semana (Lunes a Domingo).

### **Duda:**
¿Para qué sirve exactamente esta configuración de horarios?

### **Preguntas Específicas:**
1. ¿Define el horario de operación de la banca para vender tickets?
2. ¿Define cuándo se pueden vender tickets para cada sorteo específico?
3. ¿Se usa para bloquear ventas fuera de estos horarios?
4. ¿Afecta a todos los sorteos o solo a algunos específicos?
5. ¿Cómo interactúa con la configuración de "Horarios de sorteos" vs "Sorteos"?

### **Comportamiento Observado:**
- Cada día tiene un horario de inicio y fin (ej: "12:00 AM" - "11:59 PM")
- Formato de 12 horas con AM/PM
- Hay un botón para copiar un horario a todos los días
- Los datos se guardan en el formData como: `lunesInicio`, `lunesFin`, etc.

### **Estado:** ⏳ Pendiente de Aclaración

---

## 🎰 **3. Configuración de Sorteos - Multiselect y Cierre Anticipado**

### **Contexto:**
En el formulario de crear banca, existe un tab "Sorteos" con un multiselect de 69 sorteos disponibles (LA PRIMERA, NEW YORK DAY, FLORIDA AM, etc.) y un selector de "Aplicar cierre anticipado a" con opciones de tiempo (5min, 10min, 15min, 20min, 30min, 1 hora).

### **Duda:**
¿Para qué sirve exactamente esta configuración de sorteos con cierre anticipado?

### **Preguntas Específicas:**
1. **Selección de sorteos**: ¿Qué significa seleccionar un sorteo en este tab?
   - ¿Define qué sorteos están disponibles para vender en esta banca?
   - ¿Define qué sorteos se muestran en la interfaz de venta?
   - ¿Es un filtro de sorteos activos por banca?

2. **Cierre anticipado**: ¿Qué hace exactamente el cierre anticipado?
   - ¿Cierra la venta del sorteo X minutos antes del sorteo oficial?
   - ¿Se aplica a TODOS los sorteos seleccionados o se puede configurar individualmente?
   - ¿Es obligatorio seleccionar un tiempo de cierre anticipado?

3. **Relación con otros tabs**:
   - ¿Cómo se relaciona con el tab "Horarios de sorteos" que ya preguntamos?
   - ¿Los horarios del tab anterior afectan estos sorteos o son configuraciones independientes?

4. **Comportamiento del sistema**:
   - Si NO selecciono ningún sorteo, ¿la banca puede vender todos los sorteos del sistema?
   - Si selecciono algunos sorteos, ¿solo esos estarán disponibles para venta?

### **Comportamiento Observado:**
- 69 sorteos disponibles organizados en 7 filas
- Botón "TODOS" para seleccionar/deseleccionar todos
- Dropdown con 6 opciones de tiempo de cierre anticipado
- Los datos se guardan como:
  - `selectedLotteries`: Array de IDs de sorteos (ej: [1, 2, 3, 4...])
  - `anticipatedClosing`: String con el tiempo (ej: "5min", "10min", "1hour")

### **Estado:** ⏳ Pendiente de Aclaración

---

## 📋 **Plantilla para Nuevas Dudas**

```markdown
## 🔢 **[Número]. [Título de la Duda]**

### **Contexto:**
[Descripción del escenario donde surge la duda]

### **Duda:**
[Pregunta específica]

### **Comportamiento Observado:**
[Qué está pasando actualmente]

### **Pregunta para el Equipo:**
1. [Pregunta 1]
2. [Pregunta 2]

### **Estado:** ⏳ Pendiente de Aclaración / ✅ Resuelta / 🚫 Bloqueante
```

---

## 📊 **Resumen de Dudas**

| # | Tema | Estado | Prioridad |
|---|------|--------|-----------|
| 1 | ID vs Número de Banca | ⏳ Pendiente | Media |
| 2 | Configuración de Horarios de Sorteos | ⏳ Pendiente | Alta |
| 3 | Sorteos - Multiselect y Cierre Anticipado | ⏳ Pendiente | Alta |

---

## ✅ **Dudas Resueltas**

*(Mover aquí las dudas una vez resueltas con la respuesta del equipo)*

---

**Última Actualización:** 2025-10-19
**Próxima Reunión:** [Fecha por definir]
