# Reglas de Trabajo

## Idioma del Código
```
✅ CORRECTO                    ❌ INCORRECTO
───────────────────────────────────────────
bettingPoolId                  bancaId
commissionDiscount             descuentoComision
handleSubmit                   manejarEnvio
CreateBettingPool              CrearBanca
```

**Regla:** Todo el código en inglés. Solo UI visible en español.

## Estructura de Componentes
```
components/features/module-name/
├── ComponentName/
│   ├── index.tsx           # Componente principal
│   ├── hooks/
│   │   └── useComponentName.ts
│   ├── components/         # Sub-componentes
│   └── types.ts            # Tipos locales
```

## Nomenclatura
| Contexto | Convención | Ejemplo |
|----------|------------|---------|
| DB tables | snake_case | betting_pool_prize_config |
| C# Models | PascalCase | BettingPoolId |
| TypeScript | camelCase | getPrizeFields |
| React Components | PascalCase | PrizesTab.tsx |

## API Response Pattern
```typescript
// api.get() retorna DATA directamente
const data = await api.get('/endpoint');  // Ya es data, no response.data

// Para paginadas:
const items = response.items || response;
```

## Proceso de Rutas (3 Pasos)
1. Crear componente en `src/components/features/`
2. Agregar lazy import y ruta en `App.tsx`
3. **Conectar en `menuItems.ts`** ← NO OLVIDAR

## Colores Corporativos
```css
--primary: #51cbce;        /* Turquesa - botones */
--primary-hover: #45b8bb;  /* Hover */
--success: #28a745;        /* Verde */
--font: Montserrat;
```

## Antes de Modificar Código
1. LEER el archivo existente primero
2. VERIFICAR patrones en archivos similares
3. NO agregar features no solicitadas
4. NO sobre-ingeniar

## Testing
- Usar Playwright para verificar UI
- Comparar con app original cuando sea relevante

## Documentación
- Decisiones importantes → `docs/FIXES_HISTORY.md`
- Estado del proyecto → `gsd/state.md`
- NO crear READMEs innecesarios

## Git
- Commits descriptivos en inglés
- Co-Authored-By en commits de Claude
- NO push --force sin confirmación
- NO amend commits anteriores

---

**Referencia completa:** `/CLAUDE.md`
