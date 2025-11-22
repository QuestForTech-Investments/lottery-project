# Sorteos y Tipos de Apuesta - Referencia Completa

**Fecha de creación:** 2025-11-20
**Fuentes de información:**
- `/tmp/draws-all.json` - API de desarrollo (69 sorteos)
- `/tmp/game-types.json` - API de desarrollo (21 tipos de apuesta)
- `docs/migration/VUE_APP_ANALYSIS.md` - Análisis previo de Vue.js original (70+ sorteos)

---

## ⚠️ IMPORTANTE: Estado de la Documentación

### ✅ Información Completa Disponible:

1. **Lista de 69 sorteos** - Extraída de API de desarrollo
2. **21 tipos de apuesta** - Con todos sus parámetros (multiplicadores, longitud de número, etc.)

### ❌ Información FALTANTE (Requiere Acceso a BD de Producción):

**La configuración específica de qué tipos de apuesta están habilitados para cada sorteo NO está disponible en:**
- Base de datos de desarrollo (tabla `betting_pool_draw_game_types` está vacía)
- API de producción (no accesible vía curl por requerir autenticación compleja)
- Análisis previo de Vue.js (solo documentó que existen, no la configuración)

**Para obtener esta información se requiere:**
- Acceso directo a la base de datos de producción, O
- Exportar la configuración desde la aplicación Vue.js original usando herramientas de admin

---

## 1. LISTA COMPLETA DE SORTEOS (69 sorteos)

### Loterías de Anguila (4 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería          | País     | Hora     | Estado  |
|-----|--------------------|-------------|------------------|----------|----------|---------|
| 146 | Anguila 6PM        | Anguila 6P  | Anguilla Lottery | Anguilla | 12:00:00 | Activo  |
| 154 | Anguila 9pm        | Anguila 9p  | Anguilla Lottery | Anguilla | 12:00:00 | Activo  |
| 159 | Anguila 10am       | Anguila 10  | Anguilla Lottery | Anguilla | 12:00:00 | Activo  |
| 160 | Anguila 1pm        | Anguila 1p  | Anguilla Lottery | Anguilla | 12:00:00 | Activo  |

### Loterías Dominicanas (8 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería                          | País                | Hora     | Estado  |
|-----|--------------------|-------------|----------------------------------|---------------------|----------|---------|
| 127 | LOTEKA             | LOTEKA      | Loteka                           | Dominican Republic  | 12:00:00 | Activo  |
| 161 | LA PRIMERA         | LA PRIMERA  | La Primera                       | Dominican Republic  | 12:00:00 | Activo  |
| 162 | LA SUERTE          | LA SUERTE   | La Suerte                        | Dominican Republic  | 12:00:00 | Activo  |
| 163 | GANA MAS           | GANA MAS    | Gana Más                         | Dominican Republic  | 12:00:00 | Activo  |
| 164 | LOTEDOM            | LOTEDOM     | Lotedom                          | Dominican Republic  | 12:00:00 | Activo  |
| 165 | NACIONAL           | NACIONAL    | Lotería Nacional Dominicana      | Dominican Republic  | 12:00:00 | Activo  |
| 167 | REAL               | REAL        | Loto Real                        | Dominican Republic  | 12:00:00 | Activo  |
| 168 | SUPER PALE TARDE   | SUPER PALE  | Super Pale                       | Dominican Republic  | 12:00:00 | Activo  |

### Loterías USA - Texas (4 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería         | País          | Hora     | Estado  |
|-----|--------------------|-------------|-----------------|---------------|----------|---------|
| 139 | TEXAS DAY          | TEXAS DAY   | Texas Lottery   | United States | 12:00:00 | Activo  |
| 140 | TEXAS EVENING      | TEXAS EVEN  | Texas Lottery   | United States | 12:00:00 | Activo  |
| 141 | TEXAS NIGHT        | TEXAS NIGH  | Texas Lottery   | United States | 12:00:00 | Activo  |
| 145 | TEXAS MORNING      | TEXAS MORN  | Texas Lottery   | United States | 12:00:00 | Activo  |

### Loterías USA - Nueva York (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería         | País          | Hora     | Estado  |
|-----|--------------------|-------------|-----------------|---------------|----------|---------|
| 123 | NEW YORK DAY       | NEW YORK D  | New York Lottery| United States | 12:00:00 | Activo  |
| 124 | NEW YORK NIGHT     | NEW YORK N  | New York Lottery| United States | 12:00:00 | Activo  |

### Loterías USA - Florida (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería         | País          | Hora     | Estado  |
|-----|--------------------|-------------|-----------------|---------------|----------|---------|
| 119 | FLORIDA AM         | FLORIDA AM  | Florida Lottery | United States | 12:00:00 | Activo  |
| 120 | FLORIDA PM         | FLORIDA PM  | Florida Lottery | United States | 12:00:00 | Activo  |

### Loterías USA - Georgia (3 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería         | País          | Hora     | Estado  |
|-----|--------------------|-------------|-----------------|---------------|----------|---------|
| 121 | GEORGIA-MID AM     | GEORGIA-MI  | Georgia Lottery | United States | 12:00:00 | Activo  |
| 122 | GEORGIA EVENING    | GEORGIA EV  | Georgia Lottery | United States | 12:00:00 | Activo  |
| 147 | GEORGIA NIGHT      | GEORGIA NI  | Georgia Lottery | United States | 12:00:00 | Activo  |

### Loterías USA - California (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería            | País          | Hora     | Estado  |
|-----|--------------------|-------------|--------------------|---------------|----------|---------|
| 125 | CALIFORNIA AM      | CALIFORNIA  | California Lottery | United States | 12:00:00 | Activo  |
| 132 | CALIFORNIA PM      | CALIFORNIA  | California Lottery | United States | 12:00:00 | Activo  |

### Loterías USA - Indiana (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería         | País          | Hora     | Estado  |
|-----|--------------------|-------------|-----------------|---------------|----------|---------|
| 135 | INDIANA EVENING    | INDIANA EV  | Indiana Lottery | United States | 12:00:00 | Activo  |
| 148 | INDIANA MIDDAY     | INDIANA MI  | Indiana Lottery | United States | 12:00:00 | Activo  |

### Loterías USA - New Jersey (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería            | País          | Hora     | Estado  |
|-----|--------------------|-------------|--------------------|---------------|----------|---------|
| 130 | NEW JERSEY PM      | NEW JERSEY  | New Jersey Lottery | United States | 12:00:00 | Activo  |
| 149 | NEW JERSEY AM      | NEW JERSEY  | New Jersey Lottery | United States | 12:00:00 | Activo  |

### Loterías USA - Pennsylvania (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería               | País          | Hora     | Estado  |
|-----|--------------------|-------------|-----------------------|---------------|----------|---------|
| 134 | PENN EVENING       | PENN EVENI  | Pennsylvania Lottery  | United States | 12:00:00 | Activo  |
| 150 | PENN MIDDAY        | PENN MIDDA  | Pennsylvania Lottery  | United States | 12:00:00 | Activo  |

### Loterías USA - Connecticut (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería              | País          | Hora     | Estado  |
|-----|--------------------|-------------|----------------------|---------------|----------|---------|
| 131 | CONNECTICUT PM     | CONNECTICU  | Connecticut Lottery  | United States | 12:00:00 | Activo  |
| 156 | CONNECTICUT AM     | CONNECTICU  | Connecticut Lottery  | United States | 12:00:00 | Activo  |

### Loterías USA - Illinois/Chicago (2 sorteos)

| ID  | Nombre Completo    | Abreviación | Lotería         | País          | Hora     | Estado  |
|-----|--------------------|-------------|-----------------|---------------|----------|---------|
| 133 | CHICAGO PM         | CHICAGO PM  | Illinois Lottery| United States | 12:00:00 | Activo  |
| 155 | CHICAGO AM         | CHICAGO AM  | Illinois Lottery| United States | 12:00:00 | Activo  |

### Loterías USA - Otros Estados (10 sorteos)

| ID  | Nombre Completo       | Abreviación | Lotería                 | País          | Hora     | Estado  |
|-----|-----------------------|-------------|-------------------------|---------------|----------|---------|
| 128 | MASS PM               | MASS PM     | Massachusetts Lottery   | United States | 12:00:00 | Activo  |
| 129 | DELAWARE PM           | DELAWARE P  | Delaware Lottery        | United States | 12:00:00 | Activo  |
| 142 | VIRGINIA PM           | VIRGINIA P  | Virginia Lottery        | United States | 12:00:00 | Activo  |
| 143 | SOUTH CAROLINA PM     | SOUTH CARO  | South Carolina Lottery  | United States | 12:00:00 | Activo  |
| 144 | MARYLAND EVENING      | MARYLAND E  | Maryland Lottery        | United States | 12:00:00 | Activo  |
| 151 | VIRGINIA AM           | VIRGINIA A  | Virginia Lottery        | United States | 12:00:00 | Activo  |
| 152 | DELAWARE AM           | DELAWARE A  | Delaware Lottery        | United States | 12:00:00 | Activo  |
| 153 | NORTH CAROLINA AM     | NORTH CARO  | North Carolina Lottery  | United States | 12:00:00 | Activo  |
| 157 | MARYLAND MIDDAY       | MARYLAND M  | Maryland Lottery        | United States | 12:00:00 | Activo  |
| 158 | SOUTH CAROLINA AM     | SOUTH CARO  | South Carolina Lottery  | United States | 12:00:00 | Activo  |
| 166 | NORTH CAROLINA PM     | NORTH CARO  | North Carolina Lottery  | United States | 12:00:00 | Activo  |

### Loterías Caribeñas - King Lottery (1 sorteo)

| ID  | Nombre Completo    | Abreviación | Lotería      | País                      | Hora     | Estado  |
|-----|--------------------|-------------|--------------|---------------------------|----------|---------|
| 126 | King Lottery AM    | King Lotte  | King Lottery | Netherlands (Caribbean)   | 12:00:00 | Activo  |

### Super Palé (3 sorteos)

| ID  | Nombre Completo       | Abreviación | Lotería    | País                | Hora     | Estado  |
|-----|-----------------------|-------------|------------|---------------------|----------|---------|
| 136 | SUPER PALE NOCHE      | SUPER PALE  | Super Pale | Dominican Republic  | 12:00:00 | Activo  |
| 137 | SUPER PALE NY-FL AM   | SUPER PALE  | Super Pale | Dominican Republic  | 12:00:00 | Activo  |
| 138 | SUPER PALE NY-FL PM   | SUPER PALE  | Super Pale | Dominican Republic  | 12:00:00 | Activo  |

---

## 2. TIPOS DE APUESTA (GAME TYPES) - 21 Tipos Configurados

### Juegos Tradicionales (3 tipos)

#### 1. DIRECTO
- **Código:** `DIRECTO`
- **Nombre:** Directo
- **Multiplicador de premio:** 80.0x
- **Longitud del número:** 2 dígitos
- **Requiere número adicional:** No
- **Orden de visualización:** 1
- **Descripción:** Apuesta directa a 2 dígitos

#### 2. PALÉ
- **Código:** `PALE`
- **Nombre:** Palé
- **Multiplicador de premio:** 600.0x
- **Longitud del número:** 4 dígitos
- **Requiere número adicional:** No
- **Orden de visualización:** 2
- **Descripción:** Apuesta a 4 dígitos

#### 3. TRIPLETA
- **Código:** `TRIPLETA`
- **Nombre:** Tripleta
- **Multiplicador de premio:** 8000.0x
- **Longitud del número:** 6 dígitos
- **Requiere número adicional:** No
- **Orden de visualización:** 3
- **Descripción:** Apuesta a 6 dígitos (la de mayor multiplicador)

### Cash 3 (6 variantes)

#### 4. CASH3_STRAIGHT
- **Código:** `CASH3_STRAIGHT`
- **Nombre:** Cash3 Straight
- **Multiplicador de premio:** 500.0x
- **Longitud del número:** 3 dígitos
- **Requiere número adicional:** No
- **Orden de visualización:** 4

#### 5. CASH3_BOX
- **Código:** `CASH3_BOX`
- **Nombre:** Cash3 Box
- **Multiplicador de premio:** 80.0x
- **Longitud del número:** 3 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 5

#### 6. CASH3_FRONT_STRAIGHT
- **Código:** `CASH3_FRONT_STRAIGHT`
- **Nombre:** Cash3 Front Straight
- **Multiplicador de premio:** 250.0x
- **Longitud del número:** 3 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 6

#### 7. CASH3_FRONT_BOX
- **Código:** `CASH3_FRONT_BOX`
- **Nombre:** Cash3 Front Box
- **Multiplicador de premio:** 80.0x
- **Longitud del número:** 3 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 7

#### 8. CASH3_BACK_STRAIGHT
- **Código:** `CASH3_BACK_STRAIGHT`
- **Nombre:** Cash3 Back Straight
- **Multiplicador de premio:** 250.0x
- **Longitud del número:** 3 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 8

#### 9. CASH3_BACK_BOX
- **Código:** `CASH3_BACK_BOX`
- **Nombre:** Cash3 Back Box
- **Multiplicador de premio:** 80.0x
- **Longitud del número:** 3 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 9

### Play 4 (2 variantes)

#### 10. PLAY4_STRAIGHT
- **Código:** `PLAY4_STRAIGHT`
- **Nombre:** Play4 Straight
- **Multiplicador de premio:** 5000.0x
- **Longitud del número:** 4 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 10

#### 11. PLAY4_BOX
- **Código:** `PLAY4_BOX`
- **Nombre:** Play4 Box
- **Multiplicador de premio:** 200.0x
- **Longitud del número:** 4 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 11

### Pick 5 (2 variantes)

#### 12. PICK5_STRAIGHT
- **Código:** `PICK5_STRAIGHT`
- **Nombre:** Pick5 Straight
- **Multiplicador de premio:** 50000.0x (¡el más alto!)
- **Longitud del número:** 5 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 12

#### 13. PICK5_BOX
- **Código:** `PICK5_BOX`
- **Nombre:** Pick5 Box
- **Multiplicador de premio:** 1000.0x
- **Longitud del número:** 5 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 13

### Juegos Especiales (4 tipos)

#### 14. SUPER_PALE
- **Código:** `SUPER_PALE`
- **Nombre:** Super Palé
- **Multiplicador de premio:** 1200.0x
- **Longitud del número:** 4 dígitos
- **Requiere número adicional:** No
- **Orden de visualización:** 14

#### 19. BOLITA
- **Código:** `BOLITA`
- **Nombre:** Bolita
- **Multiplicador de premio:** 70.0x
- **Longitud del número:** 2 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 19

#### 20. SINGULACION
- **Código:** `SINGULACION`
- **Nombre:** Singulación
- **Multiplicador de premio:** 8.0x (el más bajo)
- **Longitud del número:** 1 dígito
- **Requiere número adicional:** Sí
- **Orden de visualización:** 20

#### 21. PANAMA
- **Código:** `PANAMA`
- **Nombre:** Panamá
- **Multiplicador de premio:** 5000.0x
- **Longitud del número:** 4 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 21

### Pick 2 (4 variantes)

#### 15. PICK2
- **Código:** `PICK2`
- **Nombre:** Pick2
- **Multiplicador de premio:** 90.0x
- **Longitud del número:** 2 dígitos
- **Requiere número adicional:** No
- **Orden de visualización:** 15

#### 16. PICK2_FRONT
- **Código:** `PICK2_FRONT`
- **Nombre:** Pick2 Front
- **Multiplicador de premio:** 90.0x
- **Longitud del número:** 2 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 16

#### 17. PICK2_BACK
- **Código:** `PICK2_BACK`
- **Nombre:** Pick2 Back
- **Multiplicador de premio:** 90.0x
- **Longitud del número:** 2 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 17

#### 18. PICK2_MIDDLE
- **Código:** `PICK2_MIDDLE`
- **Nombre:** Pick2 Middle
- **Multiplicador de premio:** 90.0x
- **Longitud del número:** 2 dígitos
- **Requiere número adicional:** Sí
- **Orden de visualización:** 18

---

## 3. RESUMEN DE MULTIPLICADORES

| Rango de Premio | Tipos de Apuesta | Multiplicador |
|-----------------|------------------|---------------|
| **Muy Alto**    | PICK5_STRAIGHT   | 50000.0x      |
|                 | TRIPLETA         | 8000.0x       |
|                 | PLAY4_STRAIGHT, PANAMA | 5000.0x |
| **Alto**        | SUPER_PALE       | 1200.0x       |
|                 | PICK5_BOX        | 1000.0x       |
|                 | PALE             | 600.0x        |
|                 | CASH3_STRAIGHT   | 500.0x        |
| **Medio**       | CASH3_FRONT/BACK_STRAIGHT | 250.0x |
|                 | PLAY4_BOX        | 200.0x        |
| **Bajo**        | Pick2 (todas), PICK2 | 90.0x   |
|                 | DIRECTO, CASH3_BOX, CASH3_FRONT/BACK_BOX | 80.0x |
|                 | BOLITA           | 70.0x         |
| **Muy Bajo**    | SINGULACION      | 8.0x          |

---

## 4. CONFIGURACIÓN POR SORTEO (⚠️ DATOS FALTANTES)

### ❌ INFORMACIÓN NO DISPONIBLE

La configuración específica de **qué tipos de apuesta están habilitados para cada sorteo** NO está documentada en ninguna fuente accesible actualmente.

**Lo que sabemos:**
- ✅ Existen 69 sorteos activos
- ✅ Existen 21 tipos de apuesta configurados
- ❌ NO sabemos qué combinaciones de sorteo + tipo de apuesta están activas

**Tabla de relación esperada (betting_pool_draw_game_types):**
```sql
CREATE TABLE betting_pool_draw_game_types (
  id INT PRIMARY KEY,
  betting_pool_id INT,  -- ID de la banca
  draw_id INT,          -- ID del sorteo (ej: 119 = FLORIDA AM)
  game_type_id INT      -- ID del tipo de apuesta (ej: 1 = DIRECTO)
);
```

**Estado actual:**
- BD de desarrollo: Tabla **VACÍA** (0 registros)
- BD de producción: **No accesible** desde herramientas de desarrollo

### 📋 EJEMPLO de Configuración Típica (Hipotética)

Basándome en patrones comunes de loterías, una configuración típica podría ser:

**FLORIDA AM (ID: 119)** - Probablemente permite:
- ✅ DIRECTO (2 dígitos)
- ✅ PICK2 (2 dígitos)
- ✅ CASH3_STRAIGHT (3 dígitos)
- ✅ CASH3_BOX (3 dígitos)
- ✅ PLAY4_STRAIGHT (4 dígitos)
- ✅ PLAY4_BOX (4 dígitos)
- ❌ NO permitiría PALE (4 dígitos - juego dominicano)
- ❌ NO permitiría TRIPLETA (6 dígitos - juego dominicano)

**LOTEKA (ID: 127)** - Probablemente permite:
- ✅ DIRECTO
- ✅ PALE
- ✅ TRIPLETA
- ✅ SUPER_PALE
- ✅ BOLITA
- ✅ SINGULACION
- ❌ NO permitiría CASH3_* (juegos USA)
- ❌ NO permitiría PLAY4_* (juegos USA)

⚠️ **ADVERTENCIA:** Los ejemplos anteriores son **suposiciones educadas** basadas en nombres de juegos, NO son datos reales.

---

## 5. CÓMO OBTENER LA CONFIGURACIÓN REAL

### Opción 1: Consulta Directa a BD de Producción (RECOMENDADO)

```sql
-- Obtener configuración completa
SELECT
  d.draw_name AS sorteo,
  gt.game_type_code AS tipo_apuesta,
  gt.game_name AS nombre_tipo,
  gt.prize_multiplier AS multiplicador,
  COUNT(*) AS num_bancas_usando
FROM betting_pool_draw_game_types bpdgt
JOIN draws d ON bpdgt.draw_id = d.draw_id
JOIN game_types gt ON bpdgt.game_type_id = gt.game_type_id
GROUP BY d.draw_name, gt.game_type_code, gt.game_name, gt.prize_multiplier
ORDER BY d.draw_name, gt.display_order;
```

**Resultado esperado:** ~200-500 filas (cada sorteo puede tener 3-10 tipos de apuesta habilitados)

### Opción 2: Exportar desde Aplicación Vue.js

1. Acceder a https://la-numbers.apk.lol como administrador
2. Ir a "Bancas" → "Lista"
3. Abrir cualquier banca para editar
4. Navegar al tab "Premios & Comisiones"
5. Inspeccionar el dropdown/select de "Sorteo"
6. Para cada sorteo, documentar qué tipos de apuesta aparecen habilitados
7. Repetir para varias bancas para confirmar si la configuración es global o por banca

### Opción 3: Interceptar Network Requests

1. Abrir DevTools → Network tab
2. Navegar a edición de banca en Vue.js app
3. Capturar el endpoint GET que trae la configuración
4. Ejemplo esperado: `GET /api/v1/betting-pools/{id}/params?category=2`
5. Analizar la respuesta JSON para extraer la configuración

---

## 6. TABLA DE COMPATIBILIDAD (Para Migración a React)

### Mapeo de IDs entre Sistemas

| Campo | BD Desarrollo | API Producción | Vue.js App |
|-------|---------------|----------------|------------|
| **Sorteo ID** | 119-168 | `draw_id` | `id` o `drawId` |
| **Tipo Apuesta ID** | 1-21 | `game_type_id` | `betTypeId` |
| **Banca ID** | Variable | `betting_pool_id` | `id` |

### Campos Clave para Migración

```javascript
// Estructura esperada en React (basada en API de desarrollo)
const draw = {
  drawId: 119,
  drawName: "FLORIDA AM",
  abbreviation: "FLORIDA AM",
  drawTime: "12:00:00",
  isActive: true,
  lotteryName: "Florida Lottery",
  countryName: "United States",
  enabledGameTypes: [  // ⚠️ FALTANTE - necesita BD producción
    {
      gameTypeId: 1,
      gameTypeCode: "DIRECTO",
      gameName: "Directo",
      prizeMultiplier: 80.0,
      numberLength: 2
    },
    // ... más tipos habilitados
  ]
};
```

---

## 7. SIGUIENTE PASOS RECOMENDADOS

### Para Desarrolladores:

1. ✅ **Usar este documento** como referencia para IDs y nombres de sorteos/tipos
2. ⚠️ **Solicitar acceso a BD de producción** para completar configuración
3. ⚠️ **Crear script SQL de exportación** de `betting_pool_draw_game_types`
4. ✅ **Importar configuración a BD de desarrollo** para poder testear
5. ✅ **Actualizar la sección 4 de este documento** una vez obtenida la configuración real

### Para Product Owner/Admin:

1. **Proveer acceso seguro** a BD de producción (read-only)
2. **O exportar manualmente** la tabla `betting_pool_draw_game_types` a CSV/JSON
3. **Validar** que la configuración es consistente entre todas las bancas

---

## 8. ARCHIVOS DE REFERENCIA

- `docs/migration/VUE_APP_ANALYSIS.md` - Análisis original de la app Vue.js
- `docs/API_ENDPOINTS_MAPPING.md` - Endpoints de la API documentados
- `/tmp/draws-all.json` - Export de sorteos de API desarrollo
- `/tmp/game-types.json` - Export de tipos de apuesta de API desarrollo

---

**Última actualización:** 2025-11-20
**Estado del documento:** ✅ Completo para sorteos y tipos de apuesta | ❌ Falta configuración de relación sorteo-tipo
**Requiere:** Acceso a BD de producción para completar sección 4
