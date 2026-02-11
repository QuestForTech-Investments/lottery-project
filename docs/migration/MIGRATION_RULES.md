# MIGRATION_RULES.md - Reglas Críticas de Migración

**FECHA:** 2025-11-18
**AUTOR:** Claude Code
**PROPÓSITO:** Establecer reglas inquebrantables para la migración de Vue.js a React

---

## ⚠️ REGLA FUNDAMENTAL #1

### REPLICAR EXACTAMENTE LA APLICACIÓN ORIGINAL

**NUNCA INVENTES. NUNCA SIMPLIFIES. NUNCA OMITAS.**

Cuando migres un componente de la aplicación Vue.js original a React:

1. ✅ **USA PLAYWRIGHT** para navegar a la página original: `https://la-numbers.apk.lol`
   - Usuario: `oliver`
   - Contraseña: `oliver0597@`

2. ✅ **CAPTURA SCREENSHOTS** de la página que vas a replicar

3. ✅ **DOCUMENTA TODOS LOS ELEMENTOS**:
   - Filtros (dropdowns, textboxes, checkboxes, toggles)
   - Botones (labels, colores, iconos)
   - Tablas (columnas, headers, estructura)
   - Campos de formulario
   - Secciones y layout

4. ✅ **REPLICA EXACTAMENTE**:
   - Mismos filtros
   - Mismos botones
   - Misma estructura de tabla
   - Mismos nombres de campos
   - Mismo orden de elementos
   - Mismos colores y estilos (si es posible)

5. ❌ **NUNCA HAGAS ESTO**:
   - NO inventes filtros que no existen
   - NO simplifiques la estructura
   - NO omitas botones o controles
   - NO cambies nombres de campos
   - NO cambies el orden de columnas
   - NO asumas que algo "no es necesario"

---

## 📋 CHECKLIST ANTES DE IMPLEMENTAR

Antes de escribir código para un componente nuevo, SIEMPRE:

- [ ] 1. Navegar con Playwright a la página original
- [ ] 2. Tomar screenshot de la página completa
- [ ] 3. Listar TODOS los filtros visibles
- [ ] 4. Listar TODOS los botones de acción
- [ ] 5. Listar TODAS las columnas de la tabla
- [ ] 6. Documentar estructura de datos mockup
- [ ] 7. Verificar si hay elementos ocultos (toggles, accordions)
- [ ] 8. Crear el componente React replicando EXACTAMENTE

---

## 🔍 EJEMPLO: Lista de Transacciones

### ❌ IMPLEMENTACIÓN INCORRECTA (Lo que hicimos antes)

**Filtros implementados:**
- Fecha inicial ✅
- Fecha final ✅
- Usuario (textbox) ❌ - Debería ser "Creado por" (dropdown)
- Tipo de transacción (3 opciones) ⚠️ - Incompleto

**Filtros faltantes:**
- ❌ Tipo de entidad (dropdown)
- ❌ Entidad (dropdown)
- ❌ Mostrar notas (toggle)
- ❌ Botones CSV y PDF

**Tabla incorrecta:**
- Muestra 1 entidad ❌
- Debería mostrar 2 entidades (Entidad #1 y Entidad #2)
- Estructura de columnas completamente diferente

### ✅ IMPLEMENTACIÓN CORRECTA (Lo que debemos hacer)

**Proceso:**
1. Navegar con Playwright a `/accountable-transactions`
2. Screenshot de la página
3. Documentar:
   ```
   FILTROS:
   - Fecha inicial (date picker)
   - Fecha final (date picker)
   - Tipo de entidad (dropdown: Seleccione)
   - Entidad (dropdown: Seleccione)
   - Tipo de transacción (dropdown: Seleccione)
   - Creado por (dropdown: Seleccione)
   - Mostrar notas (toggle switch)

   BOTONES:
   - FILTRAR (turquesa)
   - CSV (turquesa)
   - PDF (turquesa)

   TABLA COLUMNAS:
   - Concepto
   - Fecha
   - Hora
   - Creado por
   - Entidad #1
   - Entidad #2
   - Saldo inicial de Entidad #1
   - Saldo inicial de Entidad #2
   - Débito
   - Crédito
   - Saldo final de Entidad #1
   - Saldo final de Entidad #2
   - Notas
   ```

4. Crear mockup data que se ajuste a esta estructura
5. Implementar componente React con EXACTAMENTE estos elementos

---

## 🚨 QUÉ HACER SI HAY DUDAS

Si encuentras algo en la aplicación original que no entiendes:

1. ❌ **NO ASUMAS** - No inventes la funcionalidad
2. ✅ **PREGUNTA AL USUARIO** - Pide aclaración
3. ✅ **DOCUMENTA** - Escribe lo que ves en la app original
4. ✅ **TOMA MÁS SCREENSHOTS** - Captura diferentes estados

---

## 📐 ORDEN DE MIGRACIÓN

Para cada nuevo módulo/componente:

1. **ANÁLISIS** (Playwright + Screenshots)
   - Navegar a la página original
   - Capturar todos los estados (vacío, con datos, filtrado)
   - Documentar elementos en un archivo `.md`

2. **PLANIFICACIÓN**
   - Crear estructura de mockup data
   - Definir estados de React necesarios
   - Listar todos los handlers de eventos

3. **IMPLEMENTACIÓN**
   - Implementar en frontend-v4 (React + TypeScript + MUI)
   - Agregar rutas en App.tsx
   - Agregar menu items en menuItems.ts

4. **TESTING**
   - Comparar lado a lado con Playwright
   - Verificar que todos los filtros funcionan
   - Verificar que la tabla muestra datos correctos

---

## 📝 ACTUALIZACIÓN DE CLAUDE.md

Cada vez que implementes un componente, actualiza `CLAUDE.md` con:
- Qué se implementó
- Screenshot de referencia
- Fecha de implementación
- Nota de que fue verificado contra la app original

---

## 🎯 CONSECUENCIAS DE NO SEGUIR ESTAS REGLAS

Si Claude Code NO sigue estas reglas:
- ❌ Componentes incompletos que no coinciden con la original
- ❌ Usuario debe corregir manualmente
- ❌ Pérdida de tiempo
- ❌ Confusión en el equipo de desarrollo
- ❌ Funcionalidad faltante en producción

Si Claude Code SÍ sigue estas reglas:
- ✅ Componentes completos y funcionales
- ✅ Migración precisa y confiable
- ✅ Usuario satisfecho
- ✅ Código que coincide con especificaciones reales
- ✅ Producción sin sorpresas

---

## 📌 RESUMEN EN UNA LÍNEA

**ANTES DE ESCRIBIR CÓDIGO: PLAYWRIGHT → SCREENSHOT → DOCUMENTAR → REPLICAR EXACTAMENTE**

---

**Este archivo debe ser leído por Claude Code al inicio de CADA sesión de migración.**
