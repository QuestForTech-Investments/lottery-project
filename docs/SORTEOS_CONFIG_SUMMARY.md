# Resumen de Configuración de Sorteos - Para Completar Manualmente

**Fecha:** 2025-11-20
**Objetivo:** Documentar qué tipos de apuesta están habilitados para cada sorteo

---

## ✅ Información Ya Documentada

1. **69 Sorteos activos** - Lista completa en `DRAWS_GAME_TYPES_COMPLETE_REFERENCE.md`
2. **21 Tipos de Apuesta** - Especificaciones completas con multiplicadores

---

## ⚠️ Información Faltante

**Configuración de qué tipos de apuesta están habilitados para cada sorteo**

### Simplificación Según Info del Usuario:

**"Las loterías dominicanas tienen todas la misma configuración"**

Esto significa que solo necesitamos documentar:
1. **Configuración estándar para loterías dominicanas** (8 sorteos)
2. **Configuración para cada lotería de USA** (puede variar por estado)
3. **Configuración para loterías caribeñas** (King Lottery, Anguila)

---

## 📋 Template de Configuración a Completar

### Loterías Dominicanas (8 sorteos - MISMA CONFIG)

**Sorteos que aplican:**
- LOTEKA
- LA PRIMERA
- LA SUERTE
- GANA MAS
- LOTEDOM
- NACIONAL
- REAL
- SUPER PALE TARDE

**Tipos de apuesta habilitados:** (COMPLETAR)
```
[ ] DIRECTO (2 dígitos - 80x)
[ ] PALE (4 dígitos - 600x)
[ ] TRIPLETA (6 dígitos - 8000x)
[ ] SUPER_PALE (4 dígitos - 1200x)
[ ] BOLITA (2 dígitos - 70x)
[ ] SINGULACION (1 dígito - 8x)
[ ] PICK2 (2 dígitos - 90x)
[ ] PICK2_FRONT (2 dígitos - 90x)
[ ] PICK2_BACK (2 dígitos - 90x)
[ ] PICK2_MIDDLE (2 dígitos - 90x)
[ ] CASH3_STRAIGHT (3 dígitos - 500x)
[ ] CASH3_BOX (3 dígitos - 80x)
[ ] CASH3_FRONT_STRAIGHT (3 dígitos - 250x)
[ ] CASH3_FRONT_BOX (3 dígitos - 80x)
[ ] CASH3_BACK_STRAIGHT (3 dígitos - 250x)
[ ] CASH3_BACK_BOX (3 dígitos - 80x)
[ ] PLAY4_STRAIGHT (4 dígitos - 5000x)
[ ] PLAY4_BOX (4 dígitos - 200x)
[ ] PICK5_STRAIGHT (5 dígitos - 50000x)
[ ] PICK5_BOX (5 dígitos - 1000x)
[ ] PANAMA (4 dígitos - 5000x)
```

### Florida Lottery (2 sorteos)

**Sorteos:** FLORIDA AM, FLORIDA PM

**Tipos de apuesta habilitados:** (COMPLETAR)
```
[ ] DIRECTO
[ ] PALE
[ ] TRIPLETA
[ ] CASH3_STRAIGHT
[ ] CASH3_BOX
[ ] CASH3_FRONT_STRAIGHT
[ ] CASH3_FRONT_BOX
[ ] CASH3_BACK_STRAIGHT
[ ] CASH3_BACK_BOX
[ ] PLAY4_STRAIGHT
[ ] PLAY4_BOX
[ ] PICK2
[ ] PICK2_FRONT
[ ] PICK2_BACK
[ ] PICK2_MIDDLE
... (marcar los que aplican)
```

### New York Lottery (2 sorteos)

**Sorteos:** NEW YORK DAY, NEW YORK NIGHT

**Tipos de apuesta habilitados:** (COMPLETAR)
```
... (marcar los que aplican)
```

### Texas Lottery (4 sorteos)

**Sorteos:** TEXAS DAY, TEXAS EVENING, TEXAS NIGHT, TEXAS MORNING

**Tipos de apuesta habilitados:** (COMPLETAR)
```
... (marcar los que aplican)
```

### Anguila Lottery (4 sorteos)

**Sorteos:** Anguila 6PM, Anguila 9pm, Anguila 10am, Anguila 1pm

**Tipos de apuesta habilitados:** (COMPLETAR)
```
... (marcar los que aplican)
```

---

## 🎯 Cómo Completar Esta Información

### Opción 1: Desde la Aplicación Vue.js (RECOMENDADO)

1. Acceder a https://la-numbers.apk.lol
2. Login como administrador
3. Ir a **Bancas → Lista**
4. Abrir **cualquier banca** para editar
5. Ir al tab **"Premios & Comisiones"**
6. Seleccionar un sorteo del dropdown (ej: "LOTEKA")
7. Ver qué tipos de apuesta aparecen disponibles en los inputs
8. Marcar en la lista de arriba los tipos que tienen campo de input
9. Repetir para un sorteo de cada grupo (Florida, New York, Texas, etc.)

### Opción 2: Query SQL a Producción

```sql
-- Ver configuración de LOTEKA (sorteo dominicano)
SELECT
  gt.game_type_code,
  gt.game_name,
  gt.prize_multiplier
FROM betting_pool_draw_game_types bpdgt
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
JOIN draws d ON bpdgt.draw_id = d.draw_id
WHERE d.draw_name = 'LOTEKA'
ORDER BY gt.display_order;

-- Resultado esperado: 6-10 filas mostrando los tipos habilitados para LOTEKA
```

### Opción 3: Captura de Pantalla

1. Abrir el tab "Premios & Comisiones" de una banca
2. Hacer screenshot de la sección completa
3. Identificar visualmente qué tipos de apuesta tienen inputs/campos

---

## 📊 Formato de Salida Esperado

Una vez completado, el formato final sería:

```json
{
  "draws": [
    {
      "drawName": "LOTEKA",
      "category": "Dominican",
      "enabledGameTypes": [
        "DIRECTO",
        "PALE",
        "TRIPLETA",
        "SUPER_PALE",
        "BOLITA",
        "SINGULACION"
      ]
    },
    {
      "drawName": "FLORIDA AM",
      "category": "USA-Florida",
      "enabledGameTypes": [
        "PICK2",
        "CASH3_STRAIGHT",
        "CASH3_BOX",
        "PLAY4_STRAIGHT",
        "PLAY4_BOX"
      ]
    }
    // ... más sorteos
  ]
}
```

---

## 🔄 Siguiente Paso

**Usuario:** Por favor, completa la configuración para:
1. **Un sorteo dominicano** (ej: LOTEKA) - esto aplicará a los 8 sorteos dominicanos
2. **FLORIDA AM** - ejemplo de lotería USA
3. **NEW YORK DAY** - otro ejemplo USA
4. **Anguila 10am** - ejemplo caribeño

Con estos 4 ejemplos podré:
- Crear patrones para el resto de sorteos similares
- Generar la configuración completa de la base de datos
- Poblar `betting_pool_draw_game_types` en BD de desarrollo

---

## 📝 Ejemplo de Cómo Documentar

```
LOTEKA (Lotería Dominicana):
✅ DIRECTO
✅ PALE
✅ TRIPLETA
✅ SUPER_PALE
✅ BOLITA
✅ SINGULACION
❌ CASH3_* (estos son solo para USA)
❌ PLAY4_* (estos son solo para USA)
❌ PICK5_* (estos son solo para USA)
✅ PICK2
✅ PICK2_FRONT
✅ PICK2_BACK
✅ PICK2_MIDDLE
❌ PANAMA (si no aplica)
```

**Total esperado para LOTEKA: 10-12 tipos de apuesta habilitados de los 21 disponibles**

---

**Última actualización:** 2025-11-20
**Estado:** Esperando información del usuario para completar
