# Preparación del siguiente ciclo incremental

**Fecha:** 2025-12-19

## Objetivo
Preparar el siguiente ciclo de migración con foco en módulos críticos y validaciones mínimas de paridad.

## Alcance propuesto (prioridad alta)
1. VENDER (Crear Ticket)
2. [F8] Monitor
3. Sorteos (CRUD)
4. Límites

## Plan de trabajo incremental

1. **Análisis con Playwright (por módulo)**
   - Navegar a `https://la-numbers.apk.lol` con credenciales de referencia.
   - Capturar screenshots de estados clave (vacío, con datos, filtrado).
   - Documentar filtros, botones, columnas, formularios y layout.

2. **Definición de data mock y contratos API**
   - Validar endpoints existentes y gaps en `docs/API_ENDPOINTS_MAPPING.md`.
   - Actualizar mocks para reflejar estructura real.

3. **Implementación en frontend-v4**
   - Crear componentes y rutas en `App.tsx`.
   - Conectar rutas en `frontend-v4/src/constants/menuItems.ts`.
   - Alinear UI con `DESIGN_SYSTEM.md` (color turquesa, Montserrat).

4. **Checklist mínimo de comparación**
   - Verificar login, navegación, filtros, tabla y acciones principales.
   - Documentar resultados en release summary correspondiente.

5. **QA técnico**
   - Ejecutar `npm run lint` y `npm run build` en `frontend-v4`.
   - Documentar resultados en `docs/FIXES_HISTORY.md` y release summary.

## Dependencias
- Acceso a la app original (Vue.js) para comparación visual.
- Revisar configuración de credenciales y rutas activas.

