# 📊 Estructura del Tab "Premios & Comisiones"

**Fecha:** 19 de Octubre, 2025
**Componente:** CreateBanca.jsx - Tab Premios & Comisiones

---

## 🎯 Resumen Ejecutivo

El tab "Premios & Comisiones" tiene una **estructura jerárquica de 3 niveles de tabs anidados**:

```
Nivel 1: Tab Principal "Premios & Comisiones"
  └── Nivel 2: Sub-tabs (Premios, Comisiones, Comisiones 2)
       └── Nivel 3: Tabs de Loterías (70 loterías diferentes)
```

---

## 📑 Jerarquía Completa de Tabs

### Nivel 1: Tabs Principales (8 tabs)

| # | Tab | Estado | Descripción |
|---|-----|--------|-------------|
| 0 | General | ⚪ | Información básica de la banca |
| 1 | Configuración | ⚪ | Configuración operativa |
| 2 | Pies de página | ⚪ | Mensajes en tickets |
| 3 | **Premios & Comisiones** | 🔵 **Activo** | Configuración de premios y comisiones |
| 4 | Horarios de sorteos | ⚪ | Horarios de cada lotería |
| 5 | Sorteos | ⚪ | Sorteos disponibles |
| 6 | Estilos | ⚪ | Estilos visuales |
| 7 | Gastos automáticos | ⚪ | Gastos recurrentes |

---

### Nivel 2: Sub-tabs dentro de "Premios & Comisiones" (3 tabs)

| # | Sub-tab | Estado | Propósito |
|---|---------|--------|-----------|
| 0 | **Premios** | 🔵 **Activo** | Configuración de montos de premios por lotería |
| 1 | Comisiones | ⚪ | Configuración de comisiones (tipo 1) |
| 2 | Comisiones 2 | ⚪ | Configuración adicional de comisiones (tipo 2) |

---

### Nivel 3: Tabs de Loterías (70 loterías)

Dentro de cada sub-tab, hay **70 tabs individuales** para cada lotería:

#### Loterías Principales (12 primeras)

| # | Lotería | Región | Tipo |
|---|---------|--------|------|
| 0 | **General** | — | Configuración global |
| 1 | LA PRIMERA | República Dominicana | Nacional |
| 2 | NEW YORK DAY | Estados Unidos | Estado |
| 3 | NEW YORK NIGHT | Estados Unidos | Estado |
| 4 | FLORIDA AM | Estados Unidos | Estado |
| 5 | FLORIDA PM | Estados Unidos | Estado |
| 6 | GANA MAS | República Dominicana | Nacional |
| 7 | NACIONAL | República Dominicana | Nacional |
| 8 | QUINIELA PALE | República Dominicana | Nacional |
| 9 | REAL | República Dominicana | Nacional |
| 10 | LOTEKA | República Dominicana | Nacional |
| 11 | FL PICK2 AM | Estados Unidos | Estado |

#### Todas las Loterías (70 total)

<details>
<summary>Ver lista completa de 70 loterías</summary>

1. General
2. LA PRIMERA
3. NEW YORK DAY
4. NEW YORK NIGHT
5. FLORIDA AM
6. FLORIDA PM
7. GANA MAS
8. NACIONAL
9. QUINIELA PALE
10. REAL
11. LOTEKA
12. FL PICK2 AM
13. FL PICK2 PM
14. GEORGIA-MID AM
15. GEORGIA EVENING
16. GEORGIA NIGHT
17. NEW JERSEY AM
18. NEW JERSEY PM
19. CONNECTICUT AM
20. CONNECTICUT PM
21. CALIFORNIA AM
22. CALIFORNIA PM
23. CHICAGO AM
24. CHICAGO PM
25. PENN MIDDAY
26. PENN EVENING
27. INDIANA MIDDAY
28. INDIANA EVENING
29. DIARIA 11AM
30. DIARIA 3PM
31. DIARIA 9PM
32. SUPER PALE TARDE
33. SUPER PALE NOCHE
34. SUPER PALE NY-FL AM
35. SUPER PALE NY-FL PM
36. TEXAS MORNING
37. TEXAS DAY
38. TEXAS EVENING
39. TEXAS NIGHT
40. VIRGINIA AM
41. VIRGINIA PM
42. SOUTH CAROLINA AM
43. SOUTH CAROLINA PM
44. MARYLAND MIDDAY
45. MARYLAND EVENING
46. MASS AM
47. MASS PM
48. LA SUERTE
49. NORTH CAROLINA AM
50. NORTH CAROLINA PM
51. LOTEDOM
52. NY AM 6x1
53. NY PM 6x1
54. FL AM 6X1
55. FL PM 6X1
56. King Lottery AM
57. King Lottery PM
58. L.E. PUERTO RICO 2PM
59. L.E. PUERTO RICO 10PM
60. DELAWARE AM
61. DELAWARE PM
62. Anguila 1pm
63. Anguila 6PM
64. Anguila 9pm
65. Anguila 10am
66. LA CHICA
67. LA PRIMERA 8PM
68. PANAMA MIERCOLES
69. PANAMA DOMINGO
70. LA SUERTE 6:00pm

</details>

---

## 🎲 Tipos de Jugadas (Campos de Premios)

Según la captura, en el tab "Premios" > "General", se muestran diferentes **tipos de jugadas** con sus respectivos montos de premio:

### 1. DIRECTO
- **Primer Pago:** Monto para el primer ganador (ej: 56)
- **Segundo Pago:** Monto para el segundo ganador (ej: 12)

### 2. PALE
- **Todos en secuencia:** Premio para todos los números en secuencia (ej: 1200)
- **Primer Pago:** Premio del primer lugar (ej: 1200)

### 3. TRIPLETA
- **Primer Pago:** Premio del primer lugar (ej: 10000)
- **Segundo Pago:** Premio del segundo lugar (ej: 100)

### 4. CASH3 STRAIGHT
- **Todos en secuencia:** Premio para secuencia exacta (ej: 700)
- **Triples:** Premio para triples (ej: 700)

### 5. CASH3 BOX
- **3-Way: 2 idénticos:** Premio para combinación 3-way (ej: 232)
- **6-Way: 3 únicos:** Premio para combinación 6-way (ej: 116)

### 6. PLAY4 STRAIGHT
- **Todos en secuencia:** Premio para secuencia exacta (ej: 5000)
- **Dobles:** Premio para dobles (ej: 5000)

---

## 🏗️ Estructura de Datos Estimada

```javascript
{
  "premiosComisiones": {
    "premios": {
      "general": {
        "directo": {
          "primerPago": 56,
          "segundoPago": 12
        },
        "pale": {
          "todosEnSecuencia": 1200,
          "primerPago": 1200
        },
        "tripleta": {
          "primerPago": 10000,
          "segundoPago": 100
        },
        "cash3Straight": {
          "todosEnSecuencia": 700,
          "triples": 700
        },
        "cash3Box": {
          "threeWay": 232,
          "sixWay": 116
        },
        "play4Straight": {
          "todosEnSecuencia": 5000,
          "dobles": 5000
        }
      },
      "laPrimera": {
        // ... misma estructura
      },
      "newYorkDay": {
        // ... misma estructura
      }
      // ... para cada una de las 70 loterías
    },
    "comisiones": {
      // Estructura de comisiones tipo 1
    },
    "comisiones2": {
      // Estructura de comisiones tipo 2
    }
  }
}
```

---

## 📐 Diseño de Componente Propuesto

### Estructura de Componentes React

```
<PremiosComisionesTab>
  <SubTabs> {/* Nivel 2 */}
    <TabButton value="premios">Premios</TabButton>
    <TabButton value="comisiones">Comisiones</TabButton>
    <TabButton value="comisiones2">Comisiones 2</TabButton>
  </SubTabs>

  {activeSubTab === 'premios' && (
    <PremiosSection>
      <LotteriesTabs> {/* Nivel 3 - Scroll horizontal */}
        <TabButton value="general">General</TabButton>
        <TabButton value="laPrimera">LA PRIMERA</TabButton>
        <TabButton value="newYorkDay">NEW YORK DAY</TabButton>
        {/* ... 67 tabs más */}
      </LotteriesTabs>

      <PrizeFields lottery={activeLottery}>
        {/* Campos específicos según el tipo de jugada */}
        <DirectoFields />
        <PaleFields />
        <TripletaFields />
        <Cash3StraightFields />
        <Cash3BoxFields />
        <Play4StraightFields />
      </PrizeFields>
    </PremiosSection>
  )}

  {activeSubTab === 'comisiones' && (
    <ComisionesSection />
  )}

  {activeSubTab === 'comisiones2' && (
    <Comisiones2Section />
  )}
</PremiosComisionesTab>
```

---

## 🎨 Características de UI

### Estilos de Tabs (según JSON extraído)

```css
.el-tabs__item {
  background-color: rgba(0, 0, 0, 0);
  color: rgb(81, 203, 206); /* Turquesa */
  padding: 0px 20px;
  margin: 0px;
  border-bottom: 1.11111px solid rgb(255, 255, 255);
  border-radius: 0px;
  font-size: 14px;
  font-weight: 500;
  font-family: Montserrat, "Helvetica Neue", Arial, sans-serif;
  transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}
```

### Navegación de Tabs Nivel 3 (Loterías)

- **Scroll horizontal:** Para manejar las 70 loterías
- **Flechas de navegación:** Izquierda/Derecha para desplazarse
- **Indicador visual:** El tab activo se resalta

---

## 🔢 Complejidad Total

### Cantidad de Campos

Si cada lotería tiene **6 tipos de jugadas** y cada tipo tiene **~2 campos** en promedio:

```
70 loterías × 6 tipos × 2 campos = 840 campos de premios
```

### Tabs Totales

```
Nivel 1: 8 tabs principales
Nivel 2: 3 sub-tabs en "Premios & Comisiones"
Nivel 3: 70 tabs de loterías por cada sub-tab
Total combinaciones: 8 × 3 × 70 = 1,680 posibles vistas
```

---

## 🚀 Recomendaciones de Implementación

### Fase 1: Estructura Básica
1. ✅ Crear componente `PremiosComisionesTab` con sub-tabs
2. ✅ Implementar navegación nivel 2 (Premios, Comisiones, Comisiones 2)
3. ✅ Agregar scroll horizontal para tabs de loterías (nivel 3)

### Fase 2: Tab "Premios"
4. ⏳ Crear formulario para "General" con todos los tipos de jugadas
5. ⏳ Implementar campos dinámicos por tipo de jugada
6. ⏳ Agregar validación de montos (números positivos, decimales)

### Fase 3: Datos Dinámicos
7. ⏳ Cargar lista de loterías desde API
8. ⏳ Guardar/recuperar configuración por lotería
9. ⏳ Implementar "copiar configuración" de General a otras loterías

### Fase 4: Tabs "Comisiones"
10. ⏳ Implementar formulario de Comisiones
11. ⏳ Implementar formulario de Comisiones 2

### Fase 5: Optimización
12. ⏳ Lazy loading de tabs de loterías
13. ⏳ Virtualización para mejorar performance
14. ⏳ Caché de datos por lotería

---

## 📊 Mapeo a Base de Datos

### Tabla Propuesta: `lottery_prizes`

```sql
CREATE TABLE lottery_prizes (
    prize_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    lottery_id INT NOT NULL,
    prize_type VARCHAR(50) NOT NULL, -- 'directo', 'pale', 'tripleta', etc.
    prize_subtype VARCHAR(50), -- 'primerPago', 'segundoPago', etc.
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    UNIQUE KEY unique_prize (branch_id, lottery_id, prize_type, prize_subtype)
);
```

### Ejemplo de Datos

```sql
-- Premios para "General" en Banca 1
INSERT INTO lottery_prizes (branch_id, lottery_id, prize_type, prize_subtype, amount) VALUES
(1, 0, 'directo', 'primerPago', 56.00),
(1, 0, 'directo', 'segundoPago', 12.00),
(1, 0, 'pale', 'todosEnSecuencia', 1200.00),
(1, 0, 'pale', 'primerPago', 1200.00),
(1, 0, 'tripleta', 'primerPago', 10000.00),
(1, 0, 'tripleta', 'segundoPago', 100.00);
```

---

## 🎯 Siguiente Paso Recomendado

¿Qué te gustaría hacer primero?

**Opción A:** Implementar la estructura básica de tabs anidados (Nivel 1 + Nivel 2 + Nivel 3)

**Opción B:** Analizar el código actual del componente para ver qué ya existe

**Opción C:** Diseñar el formulario de campos para el tab "Premios" > "General"

**Opción D:** Definir la estructura de la API/Base de datos para guardar estos datos

---

**Actualizado:** 19 de Octubre, 2025
**Estado:** Análisis completado - Listo para implementación
