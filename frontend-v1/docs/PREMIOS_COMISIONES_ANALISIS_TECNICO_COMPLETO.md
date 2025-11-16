# 🔧 Análisis Técnico Completo: Premios & Comisiones

**Fecha:** 20 de Octubre, 2025
**Componentes:** Frontend (CreateBanca.jsx) + API + Base de Datos

---

## 📊 Resumen Ejecutivo

Existe una **inconsistencia de diseño** en tres niveles (Frontend, API, Base de Datos) para la funcionalidad de "Premios & Comisiones".

| Nivel | Diseño Actual | Diseño en Captura | Estado |
|-------|--------------|-------------------|--------|
| **Frontend** | Formulario plano con ~80 campos | 3 niveles de tabs (70 loterías) | ❌ No coincide |
| **Base de Datos** | Config por `game_type` global | Config por `lottery_id` específico | ❌ No soporta |
| **API** | No implementado | Endpoints faltantes | ❌ No existe |

---

## 🗂️ Análisis de Base de Datos (V4)

### Tablas Relevantes

#### 1. `branch_prizes_commissions` - Configuración de Premios/Comisiones

**Ubicación:** `/mnt/h/GIT/lottery-api/LotteryAPI/Docs/complete_database_schema_v4.sql` (líneas 263-275)

```sql
CREATE TABLE branch_prizes_commissions (
    prize_commission_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,
    game_type VARCHAR(50) NOT NULL,          -- ⚠️ Sin lottery_id
    prize_percentage DECIMAL(5,2),
    commission_percentage DECIMAL(5,2),
    max_prize_amount DECIMAL(10,2),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE(branch_id, game_type)              -- ⚠️ Un registro por branch + game_type
);
```

**Características:**
- ✅ Soporta múltiples tipos de juego (`game_type`)
- ✅ Configuración por banca (`branch_id`)
- ❌ **NO soporta configuración por lotería** (falta `lottery_id`)
- ❌ **NO permite premios diferentes para NY DAY vs FL DAY** del mismo game_type

**Limitaciones:**
```sql
-- ✅ POSIBLE: Configurar "Straight 4" globalmente para la banca
INSERT INTO branch_prizes_commissions (branch_id, game_type, prize_percentage)
VALUES (1, 'Straight 4', 50.00);

-- ❌ IMPOSIBLE: Configurar "Straight 4" diferente para NY vs FL
-- No hay forma de distinguir por lotería
```

#### 2. `lotteries` - Catálogo de Loterías

```sql
CREATE TABLE lotteries (
    lottery_id INT IDENTITY(1,1) PRIMARY KEY,
    country_id INT NOT NULL,
    lottery_name NVARCHAR(100) NOT NULL,     -- 'Florida Pick 4', 'New York Pick 4', etc.
    lottery_type NVARCHAR(50),                -- 'State', 'National', 'Local'
    description NVARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (country_id) REFERENCES countries(country_id)
);
```

**Loterías en Initial Data:**
- Florida Pick 4, Georgia Pick 4, New York Pick 4
- Florida Pick 3, Georgia Pick 3, New York Pick 3
- King Lottery, LOTEKA, Loto Pool, Loto Real
- **Total:** ~23 loterías en datos iniciales
- **Captura muestra:** 70 loterías

#### 3. `game_types` - Tipos de Juego

```sql
CREATE TABLE game_types (
    game_type_id INT IDENTITY(1,1) PRIMARY KEY,
    category_id INT NOT NULL,
    game_name NVARCHAR(100) NOT NULL,         -- 'Straight 4', 'Box 3', etc.
    description NVARCHAR(500),
    prize_multiplier DECIMAL(10,2) DEFAULT 1.00,
    requires_additional_number BIT DEFAULT 0,
    number_length INT DEFAULT 4,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES game_categories(category_id)
);
```

**Game Types en Initial Data:**
- Straight 4, Straight 3, Straight 2
- Box 4, Box 3, Box 2
- Combo 4, Combo 3
- Pick 4 Special, Pick 3 Special
- Bonus Ball, Super Ball, Double Bonus, Jackpot Bonus
- Mega Straight, Mega Box, Ultimate Straight, Ultimate Box
- **Total:** 24 tipos de juego

#### 4. `lottery_game_compatibility` - Relación Loterías ↔ Game Types

```sql
CREATE TABLE lottery_game_compatibility (
    compatibility_id INT IDENTITY(1,1) PRIMARY KEY,
    lottery_id INT NOT NULL,
    game_type_id INT NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id),
    UNIQUE(lottery_id, game_type_id)
);
```

**Propósito:** Define qué tipos de juego están disponibles para cada lotería.

**Ejemplo:**
```sql
-- Florida Pick 4 soporta: Straight 4, Box 4, Combo 4
-- New York Pick 4 soporta: Straight 4, Box 4, Pick 4 Special
```

---

## 🎨 Análisis del Frontend

### Implementación Actual (CreateBanca.jsx)

**Ubicación:** `/mnt/h/GIT/LottoWebApp/src/components/CreateBanca.jsx` (líneas 1253-1363)

**Estructura:**
```jsx
// Tab "Premios & Comisiones" - UN SOLO NIVEL
<div className="premios-comisiones-container">
  <div className="premios-grid">
    <div className="premios-column">
      <input name="pick3FirstPayment" ... />
      <input name="pick3SecondPayment" ... />
      <input name="pick4FirstPayment" ... />
      {/* ... ~80 campos más ... */}
    </div>
  </div>
</div>
```

**Campos en formData (líneas 59-144):**
```javascript
{
  // Pick 3 (4 campos)
  pick3FirstPayment: '',
  pick3SecondPayment: '',
  pick3ThirdPayment: '',
  pick3Doubles: '',

  // Pick 4 (2 campos)
  pick4FirstPayment: '',
  pick4SecondPayment: '',

  // Pick 5 variantes (7 campos)
  pick5MegaFirstPayment: '',
  pick5NYFirstPayment: '',
  // ...

  // Powerball (12 campos)
  powerball4NumbersFirstRound: '',
  powerball3NumbersFirstRound: '',
  // ...

  // Total: ~80 campos de premios
}
```

**Características:**
- ✅ Formulario funcional con inputs
- ✅ Grid de 6 columnas
- ❌ Sin estructura de tabs anidados
- ❌ Sin separación por lotería
- ❌ Campos no se envían a la API (no están en handleSubmit)

### Diseño en Captura (Original)

**Estructura de 3 Niveles:**

```
┌─────────────────────────────────────────────────┐
│ Nivel 1: "Premios & Comisiones" (Tab principal)│
└─────────────────┬───────────────────────────────┘
                  │
    ┌─────────────┴──────────────┬─────────────────┐
    │                            │                 │
┌───▼────────┐        ┌─────────▼─────┐  ┌───────▼────────┐
│  Premios   │        │  Comisiones   │  │  Comisiones 2  │
│  (Activo)  │        │               │  │                │
└───┬────────┘        └───────────────┘  └────────────────┘
    │
    │ Nivel 3: Tabs horizontales con scroll
    │
    ┌────────┬──────────┬─────────┬─────────┬─────────┐
    │General │LA PRIMERA│NY DAY   │NY NIGHT │FL AM    │ ...
    └────────┴──────────┴─────────┴─────────┴─────────┘
     (70 tabs de loterías)
```

**Tipos de Premio en Captura (Tab: Premios > General):**

```
DIRECTO                 PALE                    TRIPLETA
├─ Primer Pago: 56     ├─ Todos en seq: 1200  ├─ Primer Pago: 10000
└─ Segundo Pago: 12    └─ Primer Pago: 1200   └─ Segundo Pago: 100

CASH3 STRAIGHT         CASH3 BOX               PLAY4 STRAIGHT
├─ Todos en seq: 700   ├─ 3-Way: 232          ├─ Todos en seq: 5000
└─ Triples: 700        └─ 6-Way: 116          └─ Dobles: 5000
```

**Nomenclatura Diferente:**

| Captura (Español) | DB game_types (Inglés) | Coincide |
|-------------------|------------------------|----------|
| DIRECTO | Straight 4/3/2 | ⚠️ Similar |
| PALE | Box 4/3/2 | ⚠️ Similar |
| TRIPLETA | Combo 4/3 | ⚠️ Similar |
| CASH3 STRAIGHT | Straight 3 | ✅ Coincide |
| CASH3 BOX | Box 3 | ✅ Coincide |
| PLAY4 STRAIGHT | Straight 4 | ✅ Coincide |

---

## 🔄 Gap Analysis

### 1. Base de Datos → Diseño Original

| Característica | DB Actual | Diseño Original | Gap |
|---------------|-----------|-----------------|-----|
| **Granularidad** | Por `game_type` global | Por `lottery_id` + `game_type` | ❌ Falta `lottery_id` |
| **Tabla requerida** | `branch_prizes_commissions` | Necesita refactorización | ❌ Schema cambio |
| **Datos ejemplo** | 24 game types | 70 loterías × 6 tipos = 420 combos | ⚠️ Escala 17x |

**Schema Propuesto para BD:**

```sql
-- OPCIÓN A: Agregar lottery_id (Recomendado)
ALTER TABLE branch_prizes_commissions
ADD lottery_id INT NULL;  -- NULL = configuración global, NOT NULL = específico

ALTER TABLE branch_prizes_commissions
ADD FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id);

-- NUEVA CONSTRAINT: Único por branch + lottery + game_type
ALTER TABLE branch_prizes_commissions
DROP CONSTRAINT UQ_branch_game_type;  -- Eliminar constraint antiguo

ALTER TABLE branch_prizes_commissions
ADD CONSTRAINT UQ_branch_lottery_game
UNIQUE(branch_id, lottery_id, game_type);

-- OPCIÓN B: Crear tabla nueva (Alternativa)
CREATE TABLE branch_lottery_prizes (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    branch_id INT NOT NULL,
    lottery_id INT NOT NULL,  -- Siempre requerido
    game_type VARCHAR(50) NOT NULL,
    prize_amount DECIMAL(10,2),
    commission_percentage DECIMAL(5,2),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    FOREIGN KEY (lottery_id) REFERENCES lotteries(lottery_id),
    UNIQUE(branch_id, lottery_id, game_type)
);
```

### 2. Frontend → Base de Datos

| Aspecto | Frontend Actual | DB Necesita | Gap |
|---------|----------------|-------------|-----|
| **Estructura de datos** | Flat object con 80 campos | Estructura anidada por lotería | ❌ Rediseño completo |
| **Envío a API** | No se envían premios | Endpoint POST/PUT faltante | ❌ No implementado |
| **Carga desde API** | No se cargan premios | Endpoint GET faltante | ❌ No implementado |

**Estado Propuesto para Frontend:**

```javascript
// De esto (actual):
formData: {
  pick3FirstPayment: '56',
  pick4FirstPayment: '10000',
  // ... 78 campos más
}

// A esto (diseño propuesto):
formData: {
  premiosComisiones: {
    activeSubTab: 'premios',  // 'premios' | 'comisiones' | 'comisiones2'
    activeLotteryTab: 'general',  // 'general' | 'laPrimera' | 'newYorkDay' | ...

    premios: {
      general: {
        directo: { primerPago: 56, segundoPago: 12 },
        pale: { todosEnSecuencia: 1200, primerPago: 1200 },
        tripleta: { primerPago: 10000, segundoPago: 100 },
        cash3Straight: { todosEnSecuencia: 700, triples: 700 },
        cash3Box: { threeWay: 232, sixWay: 116 },
        play4Straight: { todosEnSecuencia: 5000, dobles: 5000 }
      },
      laPrimera: {
        directo: { primerPago: 56, segundoPago: 12 },
        pale: { todosEnSecuencia: 1200, primerPago: 1200 },
        // ... misma estructura
      },
      newYorkDay: {
        // ... 68 loterías más
      }
    },

    comisiones: {
      general: { /* ... */ },
      laPrimera: { /* ... */ },
      // ...
    },

    comisiones2: {
      general: { /* ... */ },
      laPrimera: { /* ... */ },
      // ...
    }
  }
}
```

### 3. API Endpoints Faltantes

**Endpoints Necesarios:**

```
GET    /api/betting-pools/{branchId}/prizes-commissions
       └─ Retorna configuración de premios/comisiones por lotería

GET    /api/betting-pools/{branchId}/prizes-commissions/lottery/{lotteryId}
       └─ Retorna configuración de una lotería específica

POST   /api/betting-pools/{branchId}/prizes-commissions
       └─ Crea/actualiza configuración de premios/comisiones

POST   /api/betting-pools/{branchId}/prizes-commissions/copy
       └─ Copia configuración de una lotería a otra(s)
       Body: { sourceLotteryId: 0, targetLotteryIds: [1,2,3,...] }

GET    /api/lotteries
       └─ Lista de loterías disponibles (ya existe probablemente)

GET    /api/game-types
       └─ Lista de tipos de juego disponibles
```

---

## 🎯 Recomendaciones de Implementación

### Estrategia Recomendada: **Híbrido Incremental**

#### **Fase 1: Estructura de Tabs (Semana 1-2) - FRONTEND**

**Objetivo:** Implementar navegación de 3 niveles sin cambiar backend

**Tareas:**
1. Crear componente `PremiosComisionesTab.jsx`
2. Implementar nivel 2: Sub-tabs (Premios, Comisiones, Comisiones 2)
3. Implementar nivel 3: Tabs de loterías con scroll horizontal
4. Mantener campos actuales temporalmente
5. Agregar navegación entre tabs

**Estado al final de Fase 1:**
- ✅ Navegación funcional entre 70 loterías
- ✅ Tabs: Premios, Comisiones, Comisiones 2
- ⏳ Datos aún globales (no por lotería)
- ⏳ No se guarda en BD

#### **Fase 2: Backend y Base de Datos (Semana 3-4) - API + BD**

**Objetivo:** Soportar configuración por lotería

**Tareas:**
1. Migración de BD: Agregar `lottery_id` a `branch_prizes_commissions`
2. Actualizar modelos en C# (`BranchPrizeCommission`)
3. Crear DTOs: `PrizeCommissionConfigDto`, `CopyConfigRequest`
4. Implementar endpoints en `BettingPoolsController`
5. Testing de API con PowerShell scripts

**Estado al final de Fase 2:**
- ✅ BD soporta configuración por lotería
- ✅ API expone endpoints de premios/comisiones
- ✅ Endpoints de copiar configuración
- ⏳ Frontend aún no consume API

#### **Fase 3: Integración Frontend ↔ API (Semana 5) - INTEGRACIÓN**

**Objetivo:** Conectar frontend con backend

**Tareas:**
1. Crear servicio `prizesCommissionsService.js`
2. Implementar carga de datos desde API
3. Implementar guardado de cambios
4. Agregar validaciones de formulario
5. Testing end-to-end

**Estado al final de Fase 3:**
- ✅ Formulario funcional completo
- ✅ Guardar/cargar premios por lotería
- ✅ Copiar configuración entre loterías
- ⏳ Solo tab "Premios" implementado

#### **Fase 4: Comisiones (Semana 6) - FEATURE COMPLETA**

**Objetivo:** Implementar tabs Comisiones y Comisiones 2

**Tareas:**
1. Diseñar campos de Comisiones
2. Implementar formularios
3. Integrar con API
4. Testing

**Estado al final de Fase 4:**
- ✅ Feature completa
- ✅ 3 sub-tabs funcionando
- ✅ 70 loterías configurables
- ✅ Guardado en BD por lotería

---

## 📦 Entregables por Fase

### Fase 1 (2 semanas)
- [ ] Componente `PremiosComisionesTab.jsx`
- [ ] CSS para tabs anidados (`PremiosComisiones.css` actualizado)
- [ ] Navegación funcional entre 70 loterías
- [ ] Documentación de componentes

### Fase 2 (2 semanas)
- [ ] Script de migración SQL
- [ ] Modelos C# actualizados
- [ ] 5 endpoints nuevos implementados
- [ ] Script de testing PowerShell
- [ ] Documentación API actualizada

### Fase 3 (1 semana)
- [ ] Servicio `prizesCommissionsService.js`
- [ ] Integración completa frontend ↔ backend
- [ ] Validaciones y manejo de errores
- [ ] Testing E2E

### Fase 4 (1 semana)
- [ ] Sub-tabs Comisiones implementados
- [ ] Feature completa y probada
- [ ] Documentación de usuario

---

## ⚠️ Riesgos y Consideraciones

### 1. Migración de Datos Existentes

**Problema:** Si ya existen datos en `branch_prizes_commissions`, ¿cómo se migran?

**Solución:**
```sql
-- Opción: Duplicar config global para todas las loterías
INSERT INTO branch_prizes_commissions (branch_id, lottery_id, game_type, prize_percentage, commission_percentage)
SELECT
    bpc.branch_id,
    l.lottery_id,  -- Para cada lotería
    bpc.game_type,
    bpc.prize_percentage,
    bpc.commission_percentage
FROM branch_prizes_commissions bpc
CROSS JOIN lotteries l
WHERE bpc.lottery_id IS NULL;  -- Solo configuraciones globales
```

### 2. Escala de Datos

**Cálculo:**
- 100 bancas × 70 loterías × 6 tipos de juego = **42,000 registros**

**Consideraciones:**
- Índices en `branch_id`, `lottery_id`, `game_type`
- Paginación en endpoints API
- Lazy loading en frontend

### 3. Compatibilidad hacia atrás

**Problema:** ¿Qué pasa con bancas creadas con sistema antiguo?

**Solución:**
- Mantener `lottery_id = NULL` para configuración global
- Frontend muestra config global si no hay específica por lotería
- Migración gradual: primero nuevas bancas, luego antiguas

---

## 📊 Comparativa de Opciones

| Opción | Tiempo | Complejidad | Escalabilidad | Flexible | Recomendado |
|--------|--------|-------------|---------------|----------|-------------|
| **A: Mantener actual** | 0 semanas | Baja | ❌ | ❌ | ❌ |
| **B: Migración completa** | 6 semanas | Alta | ✅ | ✅ | ⚠️ |
| **C: Híbrido incremental** | 6 semanas | Media | ✅ | ✅ | ✅ **RECOMENDADO** |

---

## ✅ Próximos Pasos Inmediatos

1. **Validar con usuario:** Confirmar que el diseño de 3 niveles (captura) es el correcto
2. **Revisar loterías:** Confirmar lista de 70 loterías que deben estar disponibles
3. **Decidir estrategia:** ¿Implementar Fase 1 primero o esperar?

---

**Actualizado:** 20 de Octubre, 2025
**Estado:** ✅ Análisis completo - Listo para decisión de implementación
