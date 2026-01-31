# Investigacion de Funcionalidad de LIMITES - Aplicacion Original

**Fecha:** 2026-01-30
**Aplicacion:** https://la-numbers.apk.lol
**Usuario de prueba:** oliver

---

## Resumen

La funcionalidad de Limites en la aplicacion original permite establecer restricciones de venta por montos en diferentes niveles (grupo, banca, zona, agentes externos) y por diferentes tipos de jugadas.

---

## Menu de Limites

La seccion de Limites tiene 5 opciones en el menu lateral:

| Opcion | Ruta | Descripcion |
|--------|------|-------------|
| Lista | `/limits` | Ver lista de limites existentes |
| Crear | `/limits/new` | Crear nuevos limites |
| Limites automaticos | `/limits/automatic` | Configurar limites automaticos |
| Eliminar | `/limits/destroy` | Eliminar limites en lote |
| Numeros calientes | `/limits/hot-numbers` | Gestionar numeros calientes y sus limites |

---

## Tipos de Limites (10 tipos)

1. **General para grupo** - Limite general aplicado a nivel de grupo
2. **General por numero para grupo** - Limite por numero especifico a nivel de grupo
3. **General para banca** - Limite general para bancas
4. **Por numero para banca (Linea)** - Limite por numero para bancas (linea)
5. **Local para banca** - Limite local para banca especifica
6. **General para zona** - Limite general para zonas
7. **Por numero para zona** - Limite por numero para zonas
8. **General para grupo externo** - Limite para grupos externos
9. **Por numero para grupo externo** - Limite por numero para grupos externos
10. **Absoluto** - Limite absoluto (maximo sin excepciones)

---

## 1. Lista de Limites (`/limits`)

### Filtros disponibles:
- **Tipo de Limite**: Dropdown con los 10 tipos + opcion "Todos"
- **Sorteos**: Dropdown para seleccionar sorteo(s)
- **Dias**: Dropdown para seleccionar dia(s) de la semana
- **Bancas**: Dropdown (aparece cuando el tipo es "para banca")

### Validaciones:
- Todos los campos son obligatorios para hacer una busqueda
- Mensajes de error en rojo debajo de cada campo

### Boton:
- **REFRESCAR**: Ejecuta la busqueda con los filtros seleccionados

---

## 2. Crear Limites (`/limits/new`)

### Estructura del formulario:

#### Seccion LIMITES (izquierda):
- **Tipo de Limite**: Dropdown obligatorio
- **Fecha de expiracion**: Campo de fecha con calendario
- **Sorteos**: Grid de checkboxes con todos los sorteos disponibles (~70 sorteos)
  - Boton "SELECCIONAR TODOS"
- **Bancas** (aparece segun tipo seleccionado):
  - Radio buttons: "Aplicar a todas", "Aplicar a una", "Aplicar a zonas"
- **Jugadas** (aparece para tipos "por numero"):
  - Checkboxes: DIRECTO, PALE, TRIPLETA, CASH3 STRAIGHT, CASH3 BOX, PLAY4 STRAIGHT, PLAY4 BOX, SUPER PALE, BOLITA 1, BOLITA 2, SINGULACION 1/2/3, PICK5 STRAIGHT, PICK5 BOX, PICK TWO, CASH3 FRONT STRAIGHT, CASH3 FRONT BOX, CASH3 BACK STRAIGHT, CASH3 BACK BOX, PICK TWO FRONT, PICK TWO BACK, PICK TWO MIDDLE, PANAMA
- **Numeros** (para tipos "por numero"):
  - Campo de texto para ingresar numeros (formato ##)
  - Boton "AGREGAR DOBLES"

#### Seccion MONTO (derecha):
Campos de entrada para monto por tipo de jugada:
- Directo
- Pale
- Tripleta
- Cash3 Straight / Cash3 Box
- Play4 Straight / Play4 Box
- Super Pale
- Bolita 1 / Bolita 2
- Singulacion 1 / Singulacion 2 / Singulacion 3
- Pick5 Straight / Pick5 Box
- Pick Two
- Cash3 Front Straight / Cash3 Front Box
- Cash3 Back Straight / Cash3 Back Box
- Pick Two Front / Pick Two Back / Pick Two Middle
- Panama

#### Seccion DIA DE SEMANA:
- Botones toggle: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
- Boton "SELECCIONAR TODOS"

#### Boton de accion:
- **CREAR**: Crea el limite con los parametros seleccionados

---

## 3. Limites Automaticos (`/limits/automatic`)

### Tiene 2 tabs:

### Tab "General":
Dos secciones lado a lado:

**Controles automaticos generales por numero:**
- Habilitar directo (dia) - Toggle switch
- Monto directo - Campo numerico
- Habilitar pale (dia-mes) - Toggle switch
- Monto pale directo - Campo numerico
- Habilitar super pale (dia-mes) - Toggle switch
- Monto super pale - Campo numerico

**Controles automaticos de linea para bancas:**
- Mismos campos que la seccion anterior

- Boton **GUARDAR**

### Tab "Bloqueo Aleatorio":
- **Sorteos**: Grid de checkboxes con todos los sorteos
- **Bancas**: Combobox para seleccionar banca(s)
- **# de pales a bloquear**: Campo numerico
- Boton **ACTUALIZAR**

---

## 4. Eliminar Limites en Lote (`/limits/destroy`)

### Seccion LIMITES:
- **Tipo de Limite**: Dropdown (default: "General para grupo")
- **Eliminar todos los numeros con jugadas**: Grid de checkboxes con tipos de jugada
  - Boton "SELECCIONAR TODOS"
- **Loterias**: Dropdown
- **Sorteos**: Grid de checkboxes con todos los sorteos
  - Boton "SELECCIONAR TODOS"

### Seccion DIA DE SEMANA:
- Botones toggle: LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO
- Boton "SELECCIONAR TODOS"
- Boton **ELIMINAR** (rojo/coral)

---

## 5. Numeros Calientes (`/limits/hot-numbers`)

### Tiene 2 tabs:

### Tab "Numeros calientes":
- Grid visual de numeros del 00 al 99
- Cada numero es un checkbox con icono de fuego
- Numeros "calientes" (seleccionados) se muestran con:
  - Fondo naranja/amarillo
  - Icono de fuego en rojo
- Los numeros no calientes tienen fondo turquesa claro

### Tab "Limites":
**Tabla de limites por numero caliente:**
| Columna | Descripcion |
|---------|-------------|
| Sorteos | Nombre del sorteo |
| Directo | Monto limite directo |
| Pale 1 caliente | Monto pale con 1 numero caliente |
| Pale 2 caliente | Monto pale con 2 numeros calientes |
| Tripleta 1 caliente | Monto tripleta con 1 numero caliente |
| Tripleta 2 caliente | Monto tripleta con 2 numeros calientes |
| Tripleta 3 caliente | Monto tripleta con 3 numeros calientes |
| Acciones | Botones de accion |

**Formulario "Limite para numero caliente":**
- **Sorteos**: Dropdown (default: "Todos")
- **Directo**: Campo numerico
- **Pale 1 caliente**: Campo numerico
- **Pale 2 caliente**: Campo numerico
- **Tripleta 1 caliente**: Campo numerico
- **Tripleta 2 caliente**: Campo numerico
- **Tripleta 3 caliente**: Campo numerico
- Boton **GUARDAR**

---

## Sorteos Disponibles (~70)

Los sorteos estan organizados por horario y loteria:

### Loterias Dominicanas:
- REAL, GANA MAS, LA PRIMERA, LA SUERTE, LOTEDOM
- LA PRIMERA 7PM, NACIONAL, LOTEKA
- LA CHICA, DIARIA 11AM, DIARIA 3PM, DIARIA 9PM
- QUINIELA PALE

### Loterias de Anguila:
- Anguila 10am, Anguila 1pm, Anguila 6PM, Anguila 9pm

### King Lottery:
- King Lottery AM, King Lottery PM

### Loterias USA:
- NEW YORK DAY, NEW YORK NIGHT, NY AM 6x1, NY PM 6x1
- FLORIDA AM, FLORIDA PM, FL AM 6X1, FL PM 6X1, FL PICK2 AM, FL PICK2 PM
- TEXAS MORNING, TEXAS EVENING, TEXAS DAY, TEXAS NIGHT
- INDIANA MIDDAY, INDIANA EVENING
- GEORGIA-MID AM, GEORGIA EVENING, GEORGIA NIGHT
- NEW JERSEY AM, NEW JERSEY PM
- CONNECTICUT AM, CONNECTICUT PM
- PENN MIDDAY, PENN EVENING
- MARYLAND MIDDAY, MARYLAND EVENING
- VIRGINIA AM, VIRGINIA PM
- DELAWARE AM, DELAWARE PM
- SOUTH CAROLINA AM, SOUTH CAROLINA PM
- CALIFORNIA AM, CALIFORNIA PM
- MASS AM, MASS PM
- NORTH CAROLINA AM, NORTH CAROLINA PM
- CHICAGO AM, CHICAGO PM

### Loterias Puerto Rico:
- L.E. PUERTO RICO 2PM, L.E. PUERTO RICO 10PM
- LA SUERTE 6:00pm

### Super Pales:
- SUPER PALE TARDE, SUPER PALE NOCHE
- SUPER PALE NY-FL AM, SUPER PALE NY-FL PM

### Loterias Panama:
- PANAMA MIERCOLES, PANAMA DOMINGO

---

## Tipos de Jugadas (24 tipos)

1. **Directo** - Numero de 2 digitos
2. **Pale** - Combinacion de 2 numeros
3. **Tripleta** - Combinacion de 3 numeros
4. **Cash3 Straight** - 3 digitos exactos
5. **Cash3 Box** - 3 digitos cualquier orden
6. **Play4 Straight** - 4 digitos exactos
7. **Play4 Box** - 4 digitos cualquier orden
8. **Super Pale** - Pale especial
9. **Bolita 1** - Primera bolita
10. **Bolita 2** - Segunda bolita
11. **Singulacion 1** - Primera singulacion
12. **Singulacion 2** - Segunda singulacion
13. **Singulacion 3** - Tercera singulacion
14. **Pick5 Straight** - 5 digitos exactos
15. **Pick5 Box** - 5 digitos cualquier orden
16. **Pick Two** - 2 digitos
17. **Cash3 Front Straight** - 3 digitos frontal exacto
18. **Cash3 Front Box** - 3 digitos frontal cualquier orden
19. **Cash3 Back Straight** - 3 digitos posterior exacto
20. **Cash3 Back Box** - 3 digitos posterior cualquier orden
21. **Pick Two Front** - 2 digitos frontal
22. **Pick Two Back** - 2 digitos posterior
23. **Pick Two Middle** - 2 digitos medio
24. **Panama** - Jugada especial Panama

---

## Screenshots Capturados

| Archivo | Descripcion |
|---------|-------------|
| `original-limits-dashboard.png` | Dashboard mostrando menu |
| `original-limits-menu-expanded.png` | Menu de Limites expandido |
| `original-limits-list.png` | Pagina de lista de limites |
| `original-limits-type-dropdown-open.png` | Dropdown de tipos abierto |
| `original-limits-type-dropdown-all.png` | Todos los tipos de limite |
| `original-limits-create-form.png` | Formulario de creacion completo |
| `original-limits-general-para-banca.png` | Tipo "General para banca" |
| `original-limits-por-numero-banca.png` | Tipo "Por numero para banca" |
| `original-limits-automatic-general.png` | Tab General de automaticos |
| `original-limits-automatic-bloqueo-aleatorio.png` | Tab Bloqueo Aleatorio |
| `original-limits-hot-numbers.png` | Numeros calientes (grid) |
| `original-limits-hot-numbers-limites-tab.png` | Tab Limites de numeros calientes |
| `original-limits-delete.png` | Pagina de eliminacion en lote |
| `original-limits-list-filters.png` | Filtros de lista |
| `original-limits-list-validation.png` | Validacion de campos obligatorios |

---

## Entidades que pueden tener limites

1. **Grupo** - Nivel mas alto, afecta a todas las bancas del grupo
2. **Banca** - Nivel individual por banca
3. **Zona** - Afecta a todas las bancas de una zona
4. **Grupo Externo** - Para agentes externos

---

## Flujo de trabajo tipico

1. **Crear limite general**:
   - Ir a Crear
   - Seleccionar tipo (ej: "General para banca")
   - Seleccionar sorteos
   - Establecer montos por tipo de jugada
   - Seleccionar dias de la semana
   - Opcionalmente establecer fecha de expiracion
   - Click en CREAR

2. **Crear limite por numero**:
   - Ir a Crear
   - Seleccionar tipo "Por numero para banca (Linea)"
   - Seleccionar bancas, sorteos
   - Seleccionar tipos de jugada
   - Ingresar numeros especificos
   - Establecer montos
   - Click en CREAR

3. **Gestionar numeros calientes**:
   - Ir a Numeros calientes
   - Marcar/desmarcar numeros como calientes
   - En tab Limites, establecer montos reducidos para jugadas con numeros calientes

4. **Configurar limites automaticos**:
   - Ir a Limites automaticos
   - En tab General, habilitar y configurar montos
   - En tab Bloqueo Aleatorio, configurar bloqueo de pales aleatorios

5. **Eliminar limites en lote**:
   - Ir a Eliminar
   - Seleccionar tipo, jugadas, sorteos y dias
   - Click en ELIMINAR

---

## Notas Importantes

- Los limites pueden tener **fecha de expiracion**
- Los **numeros calientes** tienen limites especiales (generalmente mas bajos)
- El sistema permite **bloqueo aleatorio** de pales
- Los limites se aplican **por dia de la semana**
- Se puede aplicar a **todas las bancas**, **una banca especifica** o **por zonas**
- El tipo **Absoluto** es el limite maximo sin excepciones

---

## 🔍 ANÁLISIS GAP - Estado de Nuestro Sistema

### Estado Actual: ⚠️ PARCIALMENTE IMPLEMENTADO

---

### Base de Datos ✅ EXISTE (parcial)

#### Tabla `limit_rules` (17 columnas) - EXISTE
```
- limit_rule_id (PK)
- rule_name
- draw_id (FK a draws)
- game_type_id (FK a game_types/bet_types)
- bet_number_pattern
- max_bet_per_number
- max_bet_per_ticket
- max_bet_per_betting_pool
- max_bet_global
- is_active
- priority
- effective_from, effective_to
- created_at, created_by, updated_at, updated_by
```

#### Tabla `limit_consumption` (13 columnas) - EXISTE
```
- consumption_id (PK)
- limit_rule_id (FK)
- draw_id, draw_date
- bet_number
- betting_pool_id (FK)
- current_amount, bet_count
- last_bet_at
- is_near_limit, is_at_limit
- created_at, updated_at
```

#### ❌ Campos Faltantes en DB
| Campo | Necesidad |
|-------|-----------|
| limit_type | Diferenciar los 10 tipos de límite |
| zone_id | FK para límites por zona |
| group_id | FK para límites por grupo |
| external_group_id | FK para grupos externos |
| days_of_week | Bitmask para días de la semana |

---

### API ❌ NO EXISTE

| Componente | Estado |
|------------|--------|
| LimitsController | ❌ No existe |
| LimitService | ❌ No existe |
| LimitRepository | ❌ No existe |
| DTOs para límites | ❌ No existen |
| Validación al crear tickets | ❌ No implementada |

**Endpoints requeridos:**
- `GET /api/limits` - Listar con filtros
- `GET /api/limits/{id}` - Obtener por ID
- `POST /api/limits` - Crear límite
- `PUT /api/limits/{id}` - Actualizar
- `DELETE /api/limits/{id}` - Eliminar
- `GET /api/limits/hot-numbers` - Números calientes
- `POST /api/limits/hot-numbers` - Configurar números calientes
- `GET /api/limits/automatic` - Config automática
- `PUT /api/limits/automatic` - Actualizar config automática

---

### Frontend ⚠️ UI EXISTE - DATOS MOCK

| Componente | UI | API | Estado |
|------------|:--:|:---:|--------|
| LimitsList | ✅ | ❌ | Datos mock, no conectado |
| CreateLimit | ✅ | ❌ | alert() en lugar de API call |
| AutomaticLimits | ✅ | ❌ | alert() en lugar de API call |
| DeleteLimits | ✅ | ❌ | No implementado |
| HotNumbers | ✅ | ❌ | Datos mock, no conectado |
| limitService.ts | ❌ | - | No existe |

**Rutas en App.tsx:** ✅ Configuradas
**Menú lateral:** ✅ Configurado

---

### 🎯 PLAN DE IMPLEMENTACIÓN

#### Prioridad 1 - CRÍTICO 🔴
1. **Modificar esquema DB** - Agregar campos faltantes
2. **Crear LimitsController** + DTOs
3. **Crear LimitService** (backend)
4. **Integrar validación** en TicketsController

#### Prioridad 2 - IMPORTANTE 🟡
5. **Crear limitService.ts** (frontend)
6. **Conectar componentes** existentes con API

#### Prioridad 3 - MEJORAS 🟢
7. WebSocket para notificar límites en tiempo real
8. Dashboard de consumo con gráficos

---

### 📊 Modelo de Datos Propuesto

```sql
-- Agregar a limit_rules
ALTER TABLE limit_rules ADD
    limit_type INT NOT NULL DEFAULT 1,      -- Enum: 1-10 tipos
    zone_id INT NULL,                        -- FK a zones
    group_id INT NULL,                       -- FK a groups
    external_group_id INT NULL,              -- FK a external_groups
    betting_pool_id INT NULL,                -- FK a betting_pools
    days_of_week TINYINT NOT NULL DEFAULT 127; -- 1=Lun, 2=Mar, 4=Mie, 8=Jue, 16=Vie, 32=Sab, 64=Dom
```

```csharp
// Enum LimitType
public enum LimitType
{
    GeneralParaGrupo = 1,
    GeneralPorNumeroParaGrupo = 2,
    GeneralParaBanca = 3,
    PorNumeroParaBanca = 4,
    LocalParaBanca = 5,
    GeneralParaZona = 6,
    PorNumeroParaZona = 7,
    GeneralParaGrupoExterno = 8,
    PorNumeroParaGrupoExterno = 9,
    Absoluto = 10
}
```

---

### 📈 Resumen de Progreso

| Área | Progreso |
|------|----------|
| Base de datos | 70% (faltan columnas) |
| API Backend | 0% (no existe controller) |
| Frontend UI | 80% (componentes listos) |
| Frontend API | 0% (no hay servicio) |
| **TOTAL** | **~35%** |

---

*Última actualización: 2026-01-30*
