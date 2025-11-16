# Banca #9 (admin) - Sorteos Configurados

**Fecha de Análisis:** 2025-11-14
**Banca:** admin (LAN-0009)
**URL:** http://localhost:4000/betting-pools/edit/9

---

## 📊 Resumen Ejecutivo

La Banca #9 tiene **2 sorteos activos** de un total de **69 sorteos disponibles** en el sistema.

### Sorteos Activos ✅
1. **NACIONAL** 🟣
2. **LOTEKA** 🟣

### Configuración de Cierre Anticipado
- **Tiempo:** 30 minutos antes del sorteo
- **Sorteos afectados:** 5
  - FLORIDA AM
  - NACIONAL
  - QUINIELA PALE
  - LOTEKA
  - LOTEDOM

---

## 🎯 Lista Completa de Sorteos Disponibles (69 Total)

### Sorteos de Estados Unidos

#### Nueva York
- NEW YORK DAY
- NEW YORK NIGHT
- NY AM 6x1
- NY PM 6x1

#### Florida
- FLORIDA AM
- FLORIDA PM
- FL PICK2 AM
- FL PICK2 PM
- FL AM 6X1
- FL PM 6X1

#### Georgia
- GEORGIA-MID AM
- GEORGIA EVENING
- GEORGIA NIGHT

#### New Jersey
- NEW JERSEY AM
- NEW JERSEY PM

#### Connecticut
- CONNECTICUT AM
- CONNECTICUT PM

#### California
- CALIFORNIA AM
- CALIFORNIA PM

#### Chicago/Illinois
- CHICAGO AM
- CHICAGO PM

#### Pennsylvania
- PENN MIDDAY
- PENN EVENING

#### Indiana
- INDIANA MIDDAY
- INDIANA EVENING

#### Texas
- TEXAS MORNING
- TEXAS DAY
- TEXAS EVENING
- TEXAS NIGHT

#### Virginia
- VIRGINIA AM
- VIRGINIA PM

#### South Carolina
- SOUTH CAROLINA AM
- SOUTH CAROLINA PM

#### Maryland
- MARYLAND MIDDAY
- MARYLAND EVENING

#### Massachusetts
- MASS AM
- MASS PM

#### North Carolina
- NORTH CAROLINA AM
- NORTH CAROLINA PM

#### Delaware
- DELAWARE AM
- DELAWARE PM

### Sorteos Locales/Nacionales

#### República Dominicana
- **NACIONAL** ✅ (Activo)
- **LOTEKA** ✅ (Activo)
- LOTEDOM
- LA PRIMERA
- LA PRIMERA 8PM
- DIARIA 11AM
- DIARIA 3PM
- DIARIA 9PM
- GANA MAS
- REAL
- LA SUERTE
- LA SUERTE 6:00pm
- LA CHICA

#### Puerto Rico
- L.E. PUERTO RICO 2PM
- L.E. PUERTO RICO 10PM

#### Panamá
- PANAMA MIERCOLES
- PANAMA DOMINGO

#### Anguila
- Anguila 1pm
- Anguila 6PM
- Anguila 9pm
- Anguila 10am

### Sorteos Especiales

#### Quiniela/Pale
- QUINIELA PALE
- SUPER PALE TARDE
- SUPER PALE NOCHE
- SUPER PALE NY-FL AM
- SUPER PALE NY-FL PM

#### King Lottery
- King Lottery AM
- King Lottery PM

---

## ⚙️ Configuración Detallada

### Sección: Sorteos

**Descripción:** "Selecciona los sorteos de lotería que estarán disponibles en esta banca"

**Opciones:**
- ☑️ Checkbox individual para cada sorteo
- 🔵 Botón "TODOS" - Seleccionar/deseleccionar todos

**Estado Actual:** 2 de 69 sorteo(s) seleccionado(s)

### Configuración de Cierre Anticipado

**Campo:** Minutos de Cierre Anticipado
- **Valor:** 30
- **Descripción:** "Minutos antes del sorteo para cerrar las ventas"

**Aplicar cierre anticipado a:**
Los sorteos con cierre anticipado se muestran como chips morados con ⭕:
1. FLORIDA AM ⭕
2. NACIONAL ⭕
3. QUINIELA PALE ⭕
4. LOTEKA ⭕
5. LOTEDOM ⭕

**Total:** 5 sorteos seleccionados para cierre anticipado

---

## 🎨 Diseño de la Interfaz

### Tabs de Navegación
La página de edición tiene 8 tabs principales:

1. **General** - Información básica de la banca
2. **Configuración** - Configuración general
3. **Pies de Página** - Personalización de footer
4. **Premios & Comisiones** - Configuración de premios
5. **Horarios** - Horarios de operación
6. **Sorteos** ✅ (Actualmente activo) - Selección de sorteos
7. **Estilos** - Personalización visual
8. **Gastos Automáticos** - Configuración de gastos

### Elementos de la Sección Sorteos

**Chips de Sorteos:**
- 🟣 Morado: Sorteo seleccionado (NACIONAL, LOTEKA)
- ⚪ Gris: Sorteo no seleccionado
- ⭕ Chip con X: Sorteo con cierre anticipado configurado

**Botones:**
- 🔵 **TODOS** - Toggle para seleccionar/deseleccionar todos
- ⬅️ **Cancelar** - Descartar cambios
- 💾 **Guardar Cambios** - Aplicar configuración

**Nota Informativa:**
> "Los cambios se aplicarán inmediatamente después de guardar. Asegúrate de revisar todos los campos antes de actualizar la banca."

---

## 📡 API Endpoints Detectados

Durante la carga de la página de edición, se llamaron los siguientes endpoints:

```
1. GET /api/betting-pools/9
   - Datos básicos de la banca

2. GET /api/betting-pools/9/config
   - Configuración general de la banca

3. GET /api/betting-pools/9/schedules
   - Horarios configurados

4. GET /api/betting-pools/9/draws
   - Sorteos actualmente seleccionados

5. GET /api/draws?pageSize=1000
   - Lista completa de sorteos disponibles

6. GET /api/bet-types/with-fields
   - Tipos de apuesta disponibles

7. GET /api/betting-pools/9/prize-config
   - Configuración de premios
```

---

## 🎯 Selectores de Playwright

### Navegación a Edición de Sorteos

```javascript
// 1. Login
await page.locator('input[placeholder*="Usuario" i]').fill('admin');
await page.locator('input[placeholder*="Contraseña" i]').fill('Admin123456');
await page.locator('button:has-text("INICIAR SESIÓN")').click();

// 2. Ir a BANCAS → Lista
await page.locator('text=BANCAS').first().click();
await page.locator('text=Lista').first().click();

// 3. Click en botón de editar de banca #9
await page.locator('tr:has-text("admin") >> button[aria-label*="edit" i]').click();

// 4. Ir a tab de Sorteos
await page.locator('button:has-text("Sorteos")').click();
```

### Seleccionar Sorteos

```javascript
// Seleccionar un sorteo específico
await page.locator('button:has-text("NACIONAL")').click();
await page.locator('button:has-text("LOTEKA")').click();

// Seleccionar todos
await page.locator('button:has-text("TODOS")').click();

// Campo de minutos de cierre anticipado
await page.locator('input[name*="anticipado" i]').fill('30');

// Guardar cambios
await page.locator('button:has-text("Guardar Cambios")').click();
```

---

## 📈 Análisis Estadístico

| Categoría | Cantidad |
|-----------|----------|
| **Total de sorteos disponibles** | 69 |
| **Sorteos activos en Banca #9** | 2 |
| **Porcentaje de utilización** | 2.9% |
| **Sorteos con cierre anticipado** | 5 |
| **Tiempo de cierre anticipado** | 30 minutos |

### Distribución por Región

| Región | Cantidad de Sorteos |
|--------|---------------------|
| Estados Unidos | 39 |
| República Dominicana | 15 |
| Puerto Rico | 2 |
| Panamá | 2 |
| Anguila | 4 |
| Especiales (Quiniela/King) | 7 |
| **Total** | **69** |

---

## 💡 Observaciones

### Sorteos Activos
- Solo 2 sorteos están activos de 69 disponibles
- Ambos son sorteos nacionales de República Dominicana:
  - NACIONAL
  - LOTEKA

### Cierre Anticipado
- Se configuró un cierre anticipado de 30 minutos
- Aplica a 5 sorteos diferentes
- Incluye 4 sorteos que NO están activos actualmente (FLORIDA AM, QUINIELA PALE, LOTEDOM)
- Esto significa que si se activan esos sorteos, automáticamente tendrán el cierre anticipado configurado

### Oportunidades
- Hay 67 sorteos adicionales disponibles que podrían activarse
- Gran variedad de sorteos de diferentes estados de USA
- Múltiples horarios disponibles (AM, PM, Midday, Evening, Night)

---

## 🚀 Tests Sugeridos

### Test 1: Activar/Desactivar Sorteo
```javascript
// Activar un sorteo
await page.locator('button:has-text("DIARIA 11AM")').click();
await page.locator('button:has-text("Guardar Cambios")').click();
// Verificar que se guardó correctamente
```

### Test 2: Modificar Cierre Anticipado
```javascript
// Cambiar minutos de cierre
await page.locator('input[name*="anticipado"]').fill('60');
// Agregar sorteo a cierre anticipado
// Guardar y verificar
```

### Test 3: Seleccionar Todos los Sorteos
```javascript
await page.locator('button:has-text("TODOS")').click();
// Verificar que todos están seleccionados
await page.locator('button:has-text("Guardar Cambios")').click();
```

---

## 📝 Notas Técnicas

1. **URL Pattern:** `/betting-pools/edit/{id}`
2. **Banca ID:** 9
3. **Código de Banca:** LAN-0009
4. **Nombre:** admin
5. **Referencia:** RB003333

6. **Comportamiento de UI:**
   - Los sorteos se muestran como chips/badges
   - Color morado = seleccionado
   - Color gris = no seleccionado
   - Click en chip = toggle selección

7. **Validación:**
   - Los cambios se aplican inmediatamente al guardar
   - Hay una nota de advertencia para revisar antes de actualizar

---

**Documentación creada por:** Claude Code + Playwright
**Test ejecutado:** ✅ Exitoso
**Screenshots:** 5 capturados en `/tmp/`
**Última actualización:** 2025-11-14
