# MI GRUPO > Configuración - Análisis Completo

**Fecha:** 2025-11-19
**Aplicación Original:** https://la-numbers.apk.lol/#/my-group/configuration
**Usuario:** oliver / oliver0597@

---

## Estructura General

El módulo "MI GRUPO > Configuración" es uno de los más complejos de la aplicación. Contiene configuración de valores por defecto para premios y comisiones de todos los tipos de juego.

### Título Principal
```
Actualizar grupo
```

### 3 Tabs Principales

1. **Valores por defecto** (seleccionado por defecto)
   - Sub-tab: **Premios** (seleccionado por defecto)
   - Sub-tab: **Comisiones**

2. **Valores permitidos**
   - Sistema de badges/chips clickeables con valores predefinidos

3. **Pie de página**
   - 12 botones de atajos para tipos de jugada
   - 4 campos de texto para pies de página

---

## Tab 1.1: Valores por defecto > Premios

**Título secundario:** "Comisiones y premios por defecto"

Este tab contiene **40+ tipos de jugada** con múltiples campos de premio cada uno. Los campos están organizados en un grid de múltiples columnas.

### Tipos de Jugada Identificados (40 total):

#### 1. Directo (4 campos)
- Primer Pago: `56`
- Segundo Pago: `12`
- Tercer Pago: `4`
- Dobles: `56`

#### 2. Pale (4 campos)
- Todos en secuencia: `1200`
- Primer Pago: `1200`
- Segundo Pago: `1200`
- Tercer Pago: `200`

#### 3. Tripleta (2 campos)
- Primer Pago: `10000`
- Segundo Pago: `100`

#### 4. Cash3 Straight (2 campos)
- Todos en secuencia: `700`
- Triples: `700`

#### 5. Cash3 Box (2 campos)
- 3-Way: 2 identicos: `232`
- 6-Way: 3 unicos: `116`

#### 6. Play4 Straight (2 campos)
- Todos en secuencia: `5000`
- Dobles: `5000`

#### 7. Play4 Box (4 campos)
- 24-Way: 4 unicos: `200`
- 12-Way: 2 identicos: `400`
- 6-Way: 2 identicos: `800`
- 4-Way: 3 identicos: `1200`

#### 8. Super Pale (1 campo)
- Primer Pago: `2000`

#### 9. Bolita 1 (1 campo)
- Primer Pago: `80`

#### 10. Bolita 2 (1 campo)
- Primer Pago: `80`

#### 11. Singulación 1 (1 campo)
- Primer Pago: `9`

#### 12. Singulación 2 (1 campo)
- Primer Pago: `9`

#### 13. Singulación 3 (1 campo)
- Primer Pago: `9`

#### 14. Pick5 Straight (2 campos)
- Todos en secuencia: `30000`
- Dobles: `30000`

#### 15. Pick5 Box (6 campos)
- 5-Way: 4 identicos: `10000`
- 10-Way: 3 identicos: `5000`
- 20-Way: 3 identicos: `2500`
- 30-Way: 2 identicos: `1660`
- 60-Way: 2 identicos: `830`
- 120-Way: 5 unicos: `416`

#### 16. Pick Two (2 campos)
- Primer Pago: `80`
- Dobles: `80`

#### 17. Cash3 Combo (3 campos)
- Primer Pago: `400`
- Segundo Pago: `200`
- Tercer Pago: `100`

#### 18. Play4 Combo (3 campos)
- Primer Pago: `3500`
- Segundo Pago: `1000`
- Tercer Pago: `500`

#### 19. Cash3 Front Straight (2 campos)
- Todos en secuencia: `700`
- Triples: `700`

#### 20. Cash3 Front Box (2 campos)
- 3-Way: 2 identicos: `232`
- 6-Way: 3 unicos: `116`

#### 21. Cash3 Back Straight (2 campos)
- Todos en secuencia: `700`
- Triples: `700`

#### 22. Cash3 Back Box (2 campos)
- 3-Way: 2 identicos: `232`
- 6-Way: 3 unicos: `116`

#### 23. Impar (1 campo)
- Acertado: _(vacío)_

#### 24. Par (1 campo)
- Acertado: _(vacío)_

#### 25. Primeros 50 (1 campo)
- Acertado: _(vacío)_

#### 26. Ultimos 50 (1 campo)
- Acertado: _(vacío)_

#### 27. Pick Two Front (2 campos)
- Primer Pago: _(vacío)_
- Dobles: _(vacío)_

#### 28. Pick Two Back (2 campos)
- Primer Pago: _(vacío)_
- Dobles: _(vacío)_

#### 29. Loto Pool (4 campos)
- Acertar 1 número: _(vacío)_
- Acertar 2 números: _(vacío)_
- Acertar 3 números: _(vacío)_
- Acertar 4 números: _(vacío)_

#### 30. Loto Four 1 (1 campo)
- Todos en secuencia: _(vacío)_

#### 31. Loto Four 2 (1 campo)
- Todos en secuencia: _(vacío)_

#### 32. Loto Four 3 (1 campo)
- Todos en secuencia: _(vacío)_

#### 33. Extra Five 1 (1 campo)
- Todos en secuencia: _(vacío)_

#### 34. Extra Five 2 (1 campo)
- Todos en secuencia: _(vacío)_

#### 35. Extra Five 3 (1 campo)
- Todos en secuencia: _(vacío)_

#### 36. Pick Two Middle (2 campos)
- Primer Pago: _(vacío)_
- Dobles: _(vacío)_

#### 37. Pick One (1 campo)
- Primer Pago: _(vacío)_

#### 38. Panamá (12 campos)
- 4 números primera ronda: _(vacío)_
- 3 números primera ronda: _(vacío)_
- 2 números primera ronda: _(vacío)_
- Último número primera ronda: _(vacío)_
- 4 números segunda ronda: _(vacío)_
- 3 números segunda ronda: _(vacío)_
- Últimos 2 números segunda ronda: _(vacío)_
- Último número segunda ronda: _(vacío)_
- 4 números tercera ronda: _(vacío)_
- 3 números tercera ronda: _(vacío)_
- Últimos 2 números tercera ronda: _(vacío)_
- Último número tercera ronda: _(vacío)_

#### 39. Panamá 1 Ronda (4 campos)
- 4 números primera ronda: _(vacío)_
- 3 números primera ronda: _(vacío)_
- 2 números primera ronda: _(vacío)_
- Último número primera ronda: _(vacío)_

#### 40. Pick Two (duplicado?) (2 campos)
- Primer Pago: _(vacío)_
- Dobles: _(vacío)_

#### 41. Pega 3 (5 campos)
- Triples: _(vacío)_
- 3-Way: 2 identicos en orden: _(vacío)_
- 3-Way: 2 identicos: _(vacío)_
- 6-Way: 3 unicos en orden: _(vacío)_
- 6-Way: 3 unicos: _(vacío)_

#### 42. Dobles (1 campo)
- Primer Pago: _(vacío)_

**Total de campos en tab Premios: ~100+ inputs**

---

## Tab 1.2: Valores por defecto > Comisiones

**Título secundario:** "Comisiones y premios por defecto"

Este tab contiene **1 campo por cada tipo de jugada** (42 tipos de jugada total). Layout en grid de 3 columnas.

### Campos de Comisiones:

| Tipo de Jugada | Valor Default |
|----------------|---------------|
| General | _(vacío)_ |
| Directo | 20 |
| Pale | 30 |
| Tripleta | 30 |
| Cash3 Straight | 20 |
| Cash3 Box | 20 |
| Play4 Straight | 20 |
| Play4 Box | 20 |
| Super Pale | 30 |
| Bolita 1 | 20 |
| Bolita 2 | 20 |
| Singulación 1 | 10 |
| Singulación 2 | 10 |
| Singulación 3 | 10 |
| Pick5 Straight | 20 |
| Pick5 Box | 20 |
| Pick Two | 20 |
| Cash3 Combo | 20 |
| Play4 Combo | 20 |
| Cash3 Front Straight | 20 |
| Cash3 Front Box | 20 |
| Cash3 Back Straight | 20 |
| Cash3 Back Box | 20 |
| Impar | 0 |
| Par | 0 |
| Primeros 50 | 0 |
| Ultimos 50 | 0 |
| Pick Two Front | 0 |
| Pick Two Back | 0 |
| Loto Pool | _(vacío)_ |
| Loto Four 1 | _(vacío)_ |
| Loto Four 2 | _(vacío)_ |
| Loto Four 3 | _(vacío)_ |
| Extra Five 1 | _(vacío)_ |
| Extra Five 2 | _(vacío)_ |
| Extra Five 3 | _(vacío)_ |
| Pick Two Middle | _(vacío)_ |
| Pick One | _(vacío)_ |
| Panamá | _(vacío)_ |
| Panamá 1 Ronda | _(vacío)_ |
| Pick Two | _(vacío)_ |
| Pega 3 | _(vacío)_ |
| Dobles | _(vacío)_ |

**Total: 43 campos de comisión**

---

## Tab 2: Valores permitidos

**Título:** "Valores permitidos"

Este tab permite configurar valores predefinidos que estarán disponibles como opciones rápidas para cada campo de premio.

### Funcionamiento:
- Cada tipo de jugada tiene sus campos
- Cada campo muestra un **textbox + badges clickeables** debajo
- Los badges son valores predefinidos que se pueden seleccionar
- Al hacer clic en un badge, su valor se copia al textbox

### Ejemplo - Directo > Primer Pago:
```
Textbox: ___________
Badges: [56] [70] [75] [72] [65] [60] [55] [50] [80]
```

### Ejemplo - Pale > Todos en secuencia:
```
Textbox: ___________
Badges: [1200] [1300] [1100] [800] [700] [0] [1400] [1500] [1000] [2000] [900] [1800]
```

### Ejemplo - Cash3 Box > 3-Way: 2 identicos:
```
Textbox: ___________
Badges: [200] [266.66] [264] [232] [233.33] [266.67] [166.66] [100]
```

**Total de badges: Varía por campo, entre 2 y 12 badges por campo**

**Características visuales:**
- Badges con fondo turquesa (#51cbce)
- Texto blanco
- Border radius pequeño
- Padding: 4px 8px
- Font size: 11px
- Inline block, wrappeable

---

## Tab 3: Pie de página

**Título:** "Pie de página"

### Botones de Atajos (12 total)
Botones turquesa clickeables en 2 filas:

**Fila 1:**
1. 1RA [1]
2. 2DA [2]
3. 3RA [3]
4. DOBLES [4]
5. PALE [5]
6. SUPER PALE [6]

**Fila 2:**
7. TRIPLETA [7]
8. CASH 3 [8]
9. TRIPLES [9]
10. PLAY 4 [10]
11. PICK 5 [11]
12. PICK 2 [12]

### Campos de Texto (4 total)

| Campo | Valor Default |
|-------|---------------|
| Primer pie de pagina | Revise su Ticket Al Recibirlo |
| Segundo pie de pagina | Jugadas Combinada se Paga una sola vez |
| Tercer pie de pagina | Buena Suerte en sus Jugadas ! |
| Cuarto pie de pagina | LACENTRALRD.COM |

---

## Botón Principal

Al final del formulario:
```
ACTUALIZAR (botón turquesa centrado, full-width)
```

---

## Resumen de Complejidad

### Total de Elementos:

| Elemento | Cantidad |
|----------|----------|
| Tabs principales | 3 |
| Sub-tabs | 2 |
| Tipos de jugada (Premios) | 42 |
| Campos de premio | ~100+ |
| Campos de comisión | 43 |
| Campos con valores permitidos | ~100+ (mismos que premios) |
| Badges de valores permitidos | ~500+ (varía 2-12 por campo) |
| Botones de atajo (Pie de página) | 12 |
| Campos de pie de página | 4 |

### Estimación de Complejidad:
- **MUY ALTA** - Este es el formulario más complejo de toda la aplicación
- Requiere manejo de estado para ~250+ campos de input
- Sistema de badges clickeables dinámico
- Layout responsive en grid de múltiples columnas
- Validación de valores numéricos y decimales

---

## Decisión de Implementación

### Opciones:

**Opción A - Implementación Completa:**
- Implementar todos los 42 tipos de jugada
- Todos los ~100+ campos de premio
- Sistema completo de valores permitidos con badges
- **Estimación:** 10-15 horas de desarrollo
- **Riesgo:** Alto (complejidad de estado, validaciones)

**Opción B - Implementación Simplificada:**
- Implementar 10-15 tipos de jugada más comunes (Directo, Pale, Tripleta, Cash3, Play4, Pick2, Bolitas, Singulaciones)
- Sistema de valores permitidos con badges
- Documentar que faltan tipos de jugada menos usados
- **Estimación:** 4-6 horas de desarrollo
- **Riesgo:** Medio

**Opción C - MVP:**
- Implementar solo tab "Valores por defecto > Premios" con 5-7 tipos principales
- Omitir sistema de valores permitidos (badges)
- Omitir tab "Pie de página"
- **Estimación:** 2-3 horas de desarrollo
- **Riesgo:** Bajo
- **Limitación:** No funcional para producción

---

## Recomendación

**Implementar Opción B (Simplificada)** con posibilidad de expandir después:

1. Implementar estructura completa de tabs
2. Implementar 15 tipos de jugada más usados
3. Incluir sistema de badges en valores permitidos
4. Incluir tab completo de "Pie de página"
5. Documentar tipos de jugada pendientes como TODO

**Beneficios:**
- Funcional para la mayoría de casos de uso
- Código extensible para agregar más tipos después
- Complejidad manejable
- Tiempo de desarrollo razonable

---

## Screenshots de Referencia

Capturados en `/home/jorge/projects/.playwright-mcp/`:
- `mi-grupo-comisiones-tab.png` - Tab Comisiones
- `mi-grupo-valores-permitidos-tab.png` - Tab Valores permitidos (badges)
- `mi-grupo-pie-pagina-tab.png` - Tab Pie de página

**Tab Premios:** Se necesitaría scroll completo para capturar todos los ~100+ campos.
