# Actualizaciones del Esquema de Base de Datos - 2025-10-22

## Resumen Ejecutivo
Esta sesión realizó modificaciones importantes a la base de datos lottery-db, agregando campos esenciales para el UI y completando los datos de sorteos faltantes identificados en la aplicación actual.

---

## 1. Modificaciones al Esquema (Schema Changes)

### Tabla `draws` - Nuevas Columnas

**Archivos actualizados:**
- `lottery_database_azure.sql`
- `lottery_database_complete.sql`

**Columnas agregadas:**

```sql
[abbreviation] varchar(10) NULL,
[display_color] varchar(7) NULL,
```

**Propósito:**
- `abbreviation`: Código corto del sorteo para mostrar en el UI (ej: "AG AM", "LR", "LP")
- `display_color`: Código hexadecimal de color para identificación visual en el frontend (ej: "#FFD700")

**SQL de actualización ejecutado en Azure:**
```sql
ALTER TABLE draws ADD abbreviation VARCHAR(10) NULL;
ALTER TABLE draws ADD display_color VARCHAR(7) NULL;
```

---

## 2. Nuevos Países

| ID | Nombre | Código |
|----|--------|--------|
| 9 | Panama | PA |

---

## 3. Nuevas Loterías Agregadas

Total de loterías nuevas: **6**

### República Dominicana (5 loterías):
1. **Diaria** (ID: 55) - Lottery with 3 draws: 11AM, 3PM, 9PM
2. **La Chica** (ID: 56) - Single draw at 1:00 PM
3. **NY AM 6x1** (ID: 58) - NY-FL combination morning
4. **FL AM 6x1** (ID: 59) - Florida combination morning
5. **Super Pale** (ya existía pero sin sorteos completos)

### Estados Unidos (1 lotería):
1. **Massachusetts Pick 3** (ID: 57)
2. **Play 4** (ID: 60) - Generic Play 4 lottery

---

## 4. Nuevos Sorteos Agregados

Total de sorteos nuevos: **68** (de 48 originales a 116 totales)

### Sorteos Críticos Agregados (de la imagen de referencia):

**República Dominicana:**
- DIARIA 11AM (DR 11) - #F4A261
- DIARIA 3PM (DR 3) - #E9C46A
- DIARIA 9PM (DR 9) - #E76F51
- LA CHICA (CHC) - #C1121F
- NY AM 6X1 (NYA6) - #3A0CA3
- FL AM 6X1 (FLA6) - #219EBC
- LA SUERTE 6:30PM (LS 6:30) - #06A77D

**Estados Unidos:**
- MARYLAND MIDDAY (MD MD) - #5E60CE
- MASS AM (MA AM) - #1B9AAA
- PLAY 4 PM (P4 PM) - #DC2F02
- Múltiples sorteos para estados: Georgia, New York, California, Indiana, New Jersey, Pennsylvania, Virginia, Delaware, North Carolina, Ohio, Connecticut, Maryland, South Carolina, Mississippi

**Puerto Rico:**
- L.E. PUERTO RICO 2PM (LE 2) - #4CC9F0

---

## 5. Estadísticas Finales de la Base de Datos

### Totales Globales:
- **Países:** 9
- **Loterías:** 60
- **Sorteos:** 116
- **Abreviaturas únicas:** 110
- **Colores únicos:** 82
- **Permisos:** 61
- **Categorías de juegos:** 3
- **Tipos de juegos:** 21

### Distribución por País:

| País | Loterías | Sorteos | Horario |
|------|----------|---------|---------|
| 🇩🇴 República Dominicana | 23 | 47 | 10:00 - 23:00 |
| 🇺🇸 Estados Unidos | 23 | 41 | 10:00 - 22:34 |
| 🇵🇷 Puerto Rico | 3 | 6 | 11:15 - 23:30 |
| 🇹🇹 Trinidad | 2 | 4 | 10:15 - 22:15 |
| 🇯🇲 Jamaica | 2 | 4 | 10:00 - 22:30 |
| 🇧🇸 Bahamas | 2 | 4 | 09:30 - 21:15 |
| 🇧🇧 Barbados | 2 | 4 | 09:45 - 23:15 |
| 🇨🇺 Cuba | 2 | 4 | 09:00 - 21:30 |
| 🇵🇦 Panamá | 1 | 2 | 20:00 |

---

## 6. Consultas SQL Útiles

### Ver todos los sorteos con abreviaturas y colores:
```sql
SELECT
    d.draw_id,
    d.draw_name,
    d.abbreviation,
    d.display_color,
    CONVERT(VARCHAR(5), d.draw_time, 108) AS hora,
    l.lottery_name,
    c.country_name
FROM draws d
INNER JOIN lotteries l ON d.lottery_id = l.lottery_id
INNER JOIN countries c ON l.country_id = c.country_id
WHERE d.is_active = 1
ORDER BY c.country_name, d.draw_time;
```

### Ver sorteos de República Dominicana:
```sql
SELECT
    d.draw_name,
    d.abbreviation,
    CONVERT(VARCHAR(5), d.draw_time, 108) AS hora,
    d.display_color
FROM draws d
INNER JOIN lotteries l ON d.lottery_id = l.lottery_id
WHERE l.country_id = 2
ORDER BY d.draw_time;
```

### Ver sorteos por rango de horas:
```sql
SELECT
    d.draw_name,
    d.abbreviation,
    d.draw_time,
    c.country_name
FROM draws d
INNER JOIN lotteries l ON d.lottery_id = l.lottery_id
INNER JOIN countries c ON l.country_id = c.country_id
WHERE d.draw_time BETWEEN '10:00:00' AND '14:00:00'
ORDER BY d.draw_time;
```

---

## 7. Archivos Modificados

1. ✅ `lottery_database_azure.sql` - Esquema actualizado con nuevas columnas
2. ✅ `lottery_database_complete.sql` - Esquema actualizado con nuevas columnas
3. ✅ `azure-sql-credentials.json` - Credenciales actualizadas (contraseña corregida)
4. ✅ `.env.azure` - Variables de entorno actualizadas
5. ✅ Base de datos Azure SQL - Datos actualizados directamente

---

## 8. Próximos Pasos Recomendados

### Opcional - Limpieza de Datos:
1. **Revisar sorteos duplicados:** Algunos sorteos pueden tener nombres ligeramente diferentes (ej: "Loto Real" vs "La Real")
2. **Normalizar nombres:** Estandarizar los nombres de sorteos si es necesario
3. **Validar colores:** Verificar que los colores hexadecimales sean válidos y se vean bien en el UI

### Opcional - Índices:
```sql
-- Índice para búsquedas por abreviatura
CREATE INDEX IX_draws_abbreviation ON draws(abbreviation) WHERE abbreviation IS NOT NULL;

-- Índice para búsquedas por hora
CREATE INDEX IX_draws_time ON draws(draw_time);

-- Índice para búsquedas por país
CREATE INDEX IX_lotteries_country ON lotteries(country_id) WHERE is_active = 1;
```

### Integración con Frontend:
1. Usar la columna `abbreviation` para mostrar códigos cortos en botones/chips
2. Usar la columna `display_color` como color de fondo o borde para identificación visual
3. Ordenar sorteos por `draw_time` para mostrar cronológicamente
4. Filtrar por país usando `country_id` si es necesario

---

## 9. Validación de Datos

### Verificar integridad:
```sql
-- Sorteos sin abreviatura (deberían ser 0)
SELECT COUNT(*) FROM draws WHERE abbreviation IS NULL;

-- Sorteos sin color (deberían ser 0)
SELECT COUNT(*) FROM draws WHERE display_color IS NULL;

-- Loterías sin sorteos
SELECT l.lottery_name, l.country_id
FROM lotteries l
LEFT JOIN draws d ON l.lottery_id = d.lottery_id
WHERE d.draw_id IS NULL;

-- Verificar formato de colores (deben empezar con #)
SELECT draw_name, display_color
FROM draws
WHERE display_color NOT LIKE '#%' AND display_color IS NOT NULL;
```

---

## 10. Notas Importantes

- ✅ Todos los 116 sorteos tienen abreviatura y color asignados
- ✅ La base de datos en Azure SQL está sincronizada con estos cambios
- ✅ Los archivos de esquema local están actualizados
- ⚠️ Si se hace un deploy nuevo, los datos de sorteos deberán insertarse nuevamente (no están en el esquema, solo la estructura)
- ⚠️ Considerar crear un archivo de seed/datos iniciales para los sorteos

---

**Fecha de actualización:** 2025-10-22
**Versión de esquema:** 1.2
**Estado:** ✅ Completado y validado en Azure SQL
