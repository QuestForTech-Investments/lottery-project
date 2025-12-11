# Results Module - Guía Completa para Mantenimiento

**Módulo:** Gestión de Resultados de Lotería
**Última actualización:** 2025-12-11

---

## 1. Visión General del Módulo

### Propósito
El módulo de Resultados permite:
1. **Ingresar resultados** de sorteos de lotería manualmente
2. **Auto-refrescar** la vista cada 60 segundos
3. **Comparar** con fuentes externas (actualmente deshabilitado)
4. **Auditar** cambios en el log de resultados

### Flujo de Negocio

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Sorteo ocurre  │ ──► │ Operador ingresa │ ──► │ Sistema guarda  │
│  (ej: 2:00 PM)  │     │ números ganadores│     │ en BD + log     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ Cálculo premios │
                                                 │ (otro módulo)   │
                                                 └─────────────────┘
```

---

## 2. Arquitectura Técnica

### Frontend (React + TypeScript)

```
frontend-v4/src/
├── components/features/results/
│   └── Results.tsx              # Componente principal (1394 líneas)
└── services/
    └── resultsService.ts        # API client
```

### Backend (.NET 8.0)

```
api/src/LotteryApi/
├── Controllers/
│   └── ResultsController.cs     # Endpoints REST
├── Models/
│   └── Result.cs                # Entidad de BD
├── DTOs/
│   └── ResultDto.cs             # Transfer objects
└── Services/ExternalResults/
    └── DominicanLotteryProvider.cs  # Sync externo (deshabilitado)
```

### Base de Datos (SQL Server)

```sql
-- Tabla principal
CREATE TABLE results (
    result_id INT IDENTITY(1,1) PRIMARY KEY,
    draw_id INT NOT NULL,              -- FK a draws
    result_date DATE NOT NULL,
    winning_number VARCHAR(20),        -- Ej: "123456" (num1+num2+num3)
    num1 VARCHAR(2),                   -- Primera (00-99)
    num2 VARCHAR(2),                   -- Segunda (00-99)
    num3 VARCHAR(2),                   -- Tercera (00-99)
    cash3 VARCHAR(3),                  -- Cash 3 (000-999)
    play4 VARCHAR(4),                  -- Play 4 (0000-9999)
    pick5 VARCHAR(5),                  -- Pick 5 (00000-99999)
    created_at DATETIME DEFAULT GETDATE(),
    created_by INT,                    -- FK a users
    UNIQUE(draw_id, result_date)
);

-- Tabla de auditoría
CREATE TABLE result_logs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    result_id INT,
    draw_id INT,
    action VARCHAR(20),               -- CREATE, UPDATE, DELETE
    old_values NVARCHAR(MAX),         -- JSON
    new_values NVARCHAR(MAX),         -- JSON
    created_at DATETIME DEFAULT GETDATE(),
    created_by INT
);
```

---

## 3. API Endpoints

### GET /api/results
Obtiene resultados para una fecha específica.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/results?date=2025-12-11"
```

**Response:**
```json
[
  {
    "resultId": 123,
    "drawId": 1,
    "drawName": "NACIONAL",
    "resultDate": "2025-12-11",
    "winningNumber": "074725",
    "num1": "07",
    "num2": "47",
    "num3": "25",
    "cash3": null,
    "play4": null,
    "pick5": null
  }
]
```

### GET /api/draws/for-results
Obtiene sorteos disponibles para ingresar resultados.

**Filtros automáticos:**
- Solo sorteos activos
- Solo sorteos programados para el día de la semana seleccionado
- Para hoy: solo sorteos cuya hora ya pasó

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/draws/for-results?date=2025-12-11"
```

### POST /api/results
Crea un nuevo resultado.

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"drawId": 1, "winningNumber": "074725", "resultDate": "2025-12-11"}' \
  "http://localhost:5000/api/results"
```

### PUT /api/results/{id}
Actualiza un resultado existente.

### DELETE /api/results/{id}
Elimina un resultado (soft delete o hard delete según config).

### GET /api/results/logs
Obtiene logs de auditoría.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/results/logs?date=2025-12-11"
```

---

## 4. Categorías de Sorteos y Campos

El sistema soporta diferentes tipos de loterías con campos específicos:

| Categoría | Sorteos Ejemplo | Campos Habilitados |
|-----------|-----------------|-------------------|
| **DOMINICAN** | Nacional, Leidsa, Real | num1, num2, num3 |
| **ANGUILA** | Anguila AM/PM | num1, num2, num3 |
| **PANAMA** | Gordito, Lotería Nacional | num1, num2, num3 |
| **USA** | Texas, Florida | num1-3, cash3, play4, bolita1-2, singulaccion1-3 |
| **SUPER_PALE** | Super Palé | num1, num2 |

**Archivo de configuración:** `services/betTypeCompatibilityService.ts`

---

## 5. Funcionalidades Clave

### 5.1 Auto-Advance de Inputs

Cuando el usuario escribe el máximo de dígitos en un campo, el cursor avanza automáticamente al siguiente campo habilitado.

```typescript
// Configuración de longitudes máximas
const FIELD_MAX_LENGTHS = {
  num1: 2,    // 00-99
  num2: 2,    // 00-99
  num3: 2,    // 00-99
  cash3: 3,   // 000-999
  play4: 4,   // 0000-9999
  pick5: 5,   // 00000-99999
};

// Lógica en handleIndividualFormChange (línea 675)
if (sanitizedValue.length >= maxLength && enabledFieldsList) {
  const currentIndex = enabledFieldsList.indexOf(field);
  if (currentIndex < enabledFieldsList.length - 1) {
    const nextField = enabledFieldsList[currentIndex + 1];
    individualFormRefs.current[nextField]?.focus();
  }
}
```

### 5.2 Auto-Refresh

Cada 60 segundos, el sistema recarga los datos automáticamente.

```typescript
// Líneas 331-341
useEffect(() => {
  if (!autoRefreshEnabled) return;

  const interval = setInterval(async () => {
    await loadData();
    setLastRefresh(new Date());
  }, 60000); // 60 segundos

  return () => clearInterval(interval);
}, [autoRefreshEnabled, loadData]);
```

**Toggle:** El usuario puede activar/desactivar con el chip en la parte inferior.

### 5.3 Validación de Resultados

Antes de guardar, el sistema valida:

1. **Formato correcto:** Cada número debe ser exactamente 2 dígitos (00-99)
2. **Patrón de fecha:** Detecta si el resultado parece una fecha (ej: "202512")

```typescript
// Líneas 116-155
const isValidLotteryNumber = (value: string): boolean => {
  if (!value) return true;
  return /^\d{2}$/.test(value);
};

const hasDateLikePattern = (winningNumber: string): boolean => {
  if (/^202[45]\d{2}$/.test(winningNumber)) return true;  // YYYYMM
  return false;
};
```

### 5.4 Campos Dinámicos por Sorteo

Según el sorteo seleccionado, se habilitan solo los campos relevantes:

```typescript
// Líneas 174-217
const getEnabledFields = (drawName: string): EnabledFields => {
  const category = getDrawCategory(drawName);

  switch (category) {
    case 'DOMINICAN':
      return { num1: true, num2: true, num3: true, ...allOthersDisabled };
    case 'USA':
      return { num1: true, num2: true, num3: true, cash3: true, play4: true, ... };
    // ...
  }
};
```

---

## 6. Estados de la UI

### Tab "Manejar Resultados"

| Estado | Indicador Visual |
|--------|------------------|
| Sin resultado | Input vacío, fondo blanco |
| Con resultado | Input con valor, fondo verde claro (#c5f0f0) |
| Modificado sin guardar | `isDirty: true`, botón "ver" habilitado |
| Guardando | Spinner en botón |
| Campo deshabilitado | Muestra "-" en lugar de input |

### Tab "Logs de Resultados"

Muestra historial de cambios con:
- Nombre del sorteo
- Usuario que hizo el cambio
- Fecha del resultado
- Fecha/hora de registro
- Números ganadores

---

## 7. Problemas Conocidos y Soluciones

### 7.1 "No hay sorteos configurados"

**Causa:** No hay sorteos programados para el día seleccionado.

**Solución:**
1. Verificar en `/api/draws/schedules` qué días tiene cada sorteo
2. Seleccionar una fecha diferente
3. Verificar que el sorteo está activo (`is_active = 1`)

### 7.2 "Error al guardar resultado"

**Causas posibles:**
- Token expirado (401)
- Resultado duplicado para ese sorteo/fecha (409)
- Servidor caído (500)

**Diagnóstico:**
```bash
# Verificar API
curl http://localhost:5000/health

# Verificar token
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/results
```

### 7.3 Auto-advance no funciona

**Causa:** El siguiente campo está deshabilitado para ese tipo de sorteo.

**Solución:** Verificar `getEnabledFields()` para el sorteo seleccionado.

### 7.4 Resultados externos deshabilitados

**Estado actual:** La sincronización con `api.lotocompany.com` está deshabilitada.

**Razón:** La API externa bloquea acceso directo (403 Forbidden).

**Alternativa:** Usar web scraping de https://la-numbers.apk.lol (ver CLAUDE.md)

---

## 8. Testing Manual

### Flujo básico de prueba

1. **Login:** `admin` / `Admin123456`
2. **Navegar:** Resultados en menú lateral
3. **Seleccionar fecha:** Hoy o fecha pasada
4. **Verificar sorteos:** Deben aparecer sorteos para ese día
5. **Ingresar resultado:**
   - Seleccionar sorteo sin resultado
   - Escribir "07" en 1ra → cursor debe avanzar a 2da
   - Escribir "47" en 2da → cursor debe avanzar a 3ra
   - Escribir "25" en 3ra
   - Click "PUBLICAR RESULTADO"
6. **Verificar guardado:** Fila debe mostrar fondo verde
7. **Verificar log:** Ir a tab "Logs de resultados"

### Verificar auto-refresh

1. Abrir consola del navegador
2. Buscar logs `[Auto-refresh] Refreshing results data...`
3. Deben aparecer cada 60 segundos si está habilitado

---

## 9. Dependencias Críticas

### Frontend

```json
{
  "@mui/material": "^5.x",
  "@mui/icons-material": "^5.x",
  "react": "^18.x",
  "typescript": "^5.x"
}
```

### Backend

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
```

### Servicios Externos

- **SQL Server:** Azure SQL o local
- **Lotocompany API:** Deshabilitada (403)

---

## 10. Contacto y Recursos

- **Repositorio:** Este monorepo
- **CLAUDE.md:** Instrucciones generales del proyecto
- **RESULTS_OPTIMIZATION_PLAN.md:** Plan de refactorización
- **API Swagger:** http://localhost:5000/swagger

---

## Apéndice A: Diagrama de Componentes Actual

```
Results.tsx (1394 líneas)
├── State Management (15+ useState)
│   ├── selectedDate
│   ├── activeTab
│   ├── drawResults[]
│   ├── logsData[]
│   ├── individualForm
│   ├── loading/error/success
│   └── autoRefresh states
│
├── Data Fetching
│   ├── loadData() - draws + results
│   ├── loadLogs() - audit logs
│   └── fetchExternalResults() - deshabilitado
│
├── Event Handlers
│   ├── handleFieldChange() - table inputs
│   ├── handleIndividualFormChange() - form inputs
│   ├── handleSaveResult() - guardar individual
│   ├── handlePublishAll() - guardar todos
│   └── handleDeleteResult()
│
└── Render
    ├── Snackbars (error/success)
    ├── Tabs (Manejar/Logs)
    ├── IndividualResultForm
    ├── ActionButtons
    ├── ResultsTable
    │   └── TableRow × N (con inputs inline)
    ├── ResultsSummary
    └── CompareDialog
```

---

**Autor:** Claude
**Versión:** 1.0
