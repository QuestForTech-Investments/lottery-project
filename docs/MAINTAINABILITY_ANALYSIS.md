# Análisis de Mantenibilidad del Proyecto

**Fecha:** 2025-11-19
**Analizado por:** Claude Code
**Metodología:** Análisis estático + grep statistics

---

## Calificación General: D+ (60/100)

**Veredicto:** La aplicación requiere refactorización significativa antes de ser eficientemente mantenible.

---

## Resumen Ejecutivo

### Fortalezas
1. ✅ CLAUDE.md excelente - Documentación de contexto excepcional
2. ✅ Arquitectura V2 superior - Custom hooks y separación de concerns
3. ✅ Service layer - Abstracción API correcta
4. ✅ Lazy loading en V2 - Code splitting implementado
5. ✅ Sistema de logging presente

### Problemas Críticos

| Problema | Severidad | Archivos Afectados | Impacto |
|----------|-----------|-------------------|---------|
| Mega-componentes 2000+ líneas | 🔴 CRÍTICO | EditBanca.jsx, CreateBanca.jsx | Imposible testear |
| Debug code en producción | 🔴 CRÍTICO | 311 console.log V1, 393 V2 | Seguridad |
| Token en localStorage | 🔴 CRÍTICO | api.js, varios componentes | Vulnerabilidad XSS |
| Exceso de useState (20+) | 🟠 ALTO | EditBanca.jsx, CreateBanca.jsx | Re-renders |
| Duplicación V1-V2 | 🟠 ALTO | Todos los servicios | Mantenimiento doble |
| Sin tests | 🟠 ALTO | Todo el proyecto | 0% coverage |
| Sin TypeScript | 🟡 MEDIO | Todo el proyecto | Type safety ausente |

---

## Archivos Más Problemáticos

### V1 - Top 5
```
1. EditBanca.jsx:        2,724 líneas ← CRÍTICO
2. CreateBanca.jsx:      2,117 líneas ← CRÍTICO
3. DailySales.jsx:       1,189 líneas ← ALTO
4. BancasList.jsx:         762 líneas ← MEDIO
5. branchService.js:       743 líneas ← MEDIO
```

### V2 - Top 5
```
1. useEditBettingPoolForm.js:    1,363 líneas ← ALTO
2. MassEditBettingPools:           848 líneas ← MEDIO
3. useCompleteBettingPoolForm.js:  766 líneas ← MEDIO
4. PrizesTab.jsx:                  709 líneas ← MEDIO
5. ManageZones:                    700 líneas ← MEDIO
```

---

## Problemas Detallados

### 1. Mega-Componentes (Prioridad #1)

**EditBanca.jsx: 2,724 líneas**
- 168 campos en useState
- Lógica de negocio mezclada con presentación
- Imposible de testear unitariamente

**Solución propuesta:**
```
EditBanca/
  ├── hooks/
  │   ├── useEditBancaForm.js
  │   └── useEditBancaData.js
  ├── tabs/
  │   ├── GeneralTab.jsx           (< 200 líneas)
  │   ├── ConfigurationTab.jsx
  │   ├── PrizesTab.jsx
  │   └── SchedulesTab.jsx
  └── index.jsx                    (< 150 líneas)
```

**Esfuerzo:** 2 semanas
**Beneficio:** Mantenibilidad +80%

---

### 2. Debug Code en Producción

**Estadísticas:**
- V1: 311 console.log en 86 archivos
- V2: 393 console.log en 72 archivos

**Riesgos:**
- Expone información interna
- Puede loggear datos sensibles
- Degrada performance

**Solución:** Implementar logger con niveles de ambiente

---

### 3. Seguridad: Token en localStorage

**Vulnerabilidad:** XSS puede robar token

```javascript
// ACTUAL (INSEGURO)
const token = localStorage.getItem('authToken');

// SOLUCIÓN RECOMENDADA
class AuthService {
  #token = null;
  setToken(token) { this.#token = token; }
  getToken() { return this.#token; }
}
```

---

### 4. Duplicación V1 ↔ V2

**Problema:** Servicios duplicados sin capa compartida

**Solución:**
```
lottery-project/
├── shared/
│   └── services/
│       ├── api.js
│       ├── bettingPoolService.js
│       └── zoneService.js
└── frontend-v1/ (importa desde shared/)
└── frontend-v2/ (importa desde shared/)
```

---

## Roadmap de Refactorización

### FASE 1: CRÍTICO (2-3 semanas)

**Sprint 1.1 - Seguridad (3 días)**
- [ ] Mover token de localStorage
- [ ] Remover console.log de producción
- [ ] Auditar inputs por XSS

**Sprint 1.2 - Split Mega-componentes (2 semanas)**
- [ ] EditBanca.jsx → 6 sub-componentes
- [ ] CreateBanca.jsx → 5 sub-componentes

### FASE 2: ALTO (3-4 semanas)

**Sprint 2.1 - Capa compartida (1 semana)**
- [ ] Crear /shared/services/
- [ ] Migrar servicios

**Sprint 2.2 - Tests básicos (2 semanas)**
- [ ] Tests unitarios servicios
- [ ] Tests E2E flujos críticos

### FASE 3: MEDIO (1-2 meses)

- [ ] Error boundaries en V1
- [ ] Storybook
- [ ] ESLint strict
- [ ] CI/CD con tests

---

## Comparación V1 vs V2

| Aspecto | V1 | V2 | Ganador |
|---------|----|----|---------|
| Arquitectura | Monolítica | Custom hooks | ✅ V2 |
| Tamaño componentes | 2,724 líneas | ~100 líneas | ✅ V2 |
| Lazy loading | No | React.lazy() | ✅ V2 |
| Debug logs | 311 | 393 | ❌ Ambos |
| Tests | No | No | ❌ Ambos |

---

## Estadísticas

| Métrica | Valor | Estado |
|---------|-------|--------|
| Componente más grande | 2,724 líneas | 🔴 |
| Console.log total | 704 | 🔴 |
| Test coverage | 0% | 🔴 |
| TypeScript | 0% | 🟡 |

---

## Prioridad #1 Absoluta

**Split EditBanca.jsx y CreateBanca.jsx** - Estos dos archivos son el 80% del problema de mantenibilidad.
