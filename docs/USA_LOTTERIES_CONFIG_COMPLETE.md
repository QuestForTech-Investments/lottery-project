# ✅ CONFIGURACIÓN COMPLETA DE LOTERÍAS USA

**Fecha:** 2025-11-20
**Estado:** COMPLETADO EXITOSAMENTE

---

## 📋 Resumen de lo Implementado

### 1. **Solución al Problema de `bet_types` vs `game_types`**

**Problema encontrado:**
- La tabla `bet_types` solo tenía 3 registros (DIRECTO, PALÉ, TRIPLETA)
- La tabla `game_types` tenía todos los 21 tipos (incluidos USA)
- `prize_types` tiene FK a `bet_types`, NO a `game_types`
- Esto causaba errores al intentar insertar prize_types para bet_type_id 4-21

**Solución aplicada:**
- ✅ Poblamos `bet_types` con TODOS los tipos de `game_types`
- ✅ Usamos `SET IDENTITY_INSERT` para mantener IDs consistentes
- ✅ Ahora `bet_types` tiene 21 registros (1-21)

**Script ejecutado:**
```
/home/jorge/projects/lottery-project/api/SqlRunner/populate-bet-types-from-game-types.sql
```

---

### 2. **Configuración de Prize Types USA**

Se configuraron **37 sub-campos** para las loterías de USA:

| Bet Type | Sub-campos | Multiplicadores |
|----------|------------|-----------------|
| **Cash3 Straight** (4) | 2 | Todos en secuencia: 600, Triples: 600 |
| **Cash3 Box** (5) | 2 | 3-Way: 100, 6-Way: 100 |
| **Cash3 Front Straight** (6) | 2 | Todos en secuencia: 600, Triples: 600 |
| **Cash3 Front Box** (7) | 2 | 3-Way: 100, 6-Way: 100 |
| **Cash3 Back Straight** (8) | 2 | Todos en secuencia: 600, Triples: 600 |
| **Cash3 Back Box** (9) | 2 | 3-Way: 100, 6-Way: 100 |
| **Play4 Straight** (10) | 2 | Todos en secuencia: 5000, Dobles: 5000 |
| **Play4 Box** (11) | 4 | 24-Way: 200, 12-Way: 200, 6-Way: 200, 4-Way: 200 |
| **Pick5 Straight** (12) | 2 | Todos en secuencia: 30000, Dobles: 30000 |
| **Pick5 Box** (13) | 6 | 5-Way: 10000, 10-Way: 5000, 20-Way: 2500, 30-Way: 1660, 60-Way: 830, 120-Way: 416 |
| **Pick Two Front** (16) | 2 | Primer Pago: 75, Dobles: 75 |
| **Pick Two Back** (17) | 2 | Primer Pago: 75, Dobles: 75 |
| **Pick Two Middle** (18) | 2 | Primer Pago: 75, Dobles: 75 |
| **Bolita** (19) | 2 | Bolita 1: 75, Bolita 2: 75 |
| **Singulación** (20) | 3 | Sing. 1: 9, Sing. 2: 9, Sing. 3: 9 |

**Script ejecutado:**
```
/home/jorge/projects/lottery-project/api/SqlRunner/configure-usa-lotteries-clean.sql
```

---

### 3. **Configuración Previa de Loterías Dominicanas**

Ya se había configurado previamente **10 sub-campos** para loterías dominicanas:

| Bet Type | Sub-campos | Multiplicadores |
|----------|------------|-----------------|
| **DIRECTO** (1) | 4 | Primer Pago: 56, Segundo: 12, Tercer: 4, Dobles: 56 |
| **PALÉ** (2) | 4 | Todos en secuencia: 1100, Primer: 1100, Segundo: 1100, Tercer: 100 |
| **TRIPLETA** (3) | 2 | Primer Pago: 10000, Segundo: 100 |

**Scripts ejecutados previamente:**
```
/home/jorge/projects/lottery-project/api/SqlRunner/configure-dominican-lotteries-fixed.sql
/home/jorge/projects/lottery-project/api/SqlRunner/configure-dominican-all-bancas.sql
```

**Relaciones creadas:** 330 (10 bancas × 11 sorteos × 3 tipos)

---

## 📊 Estado Final de la Base de Datos

### Tabla: `bet_types`
- **Total de registros:** 21
- **Rango de IDs:** 1-21
- **Origen:** Copiados desde `game_types`

### Tabla: `prize_types`
- **Total de sub-campos:** 47
  - **Dominicanas:** 10 sub-campos (bet_type_id 1-3)
  - **USA:** 37 sub-campos (bet_type_id 4-21)

### Tabla: `betting_pool_draw_game_types`
- **Relaciones DOM:** 330 (10 bancas × 11 sorteos × 3 tipos)
- **Relaciones USA:** Pendiente (próximo paso)

---

## 📂 Archivos SQL Generados

| Archivo | Propósito |
|---------|-----------|
| `check-bet-types.sql` | Verificar contenido de bet_types |
| `check-game-types-ids.sql` | Ver todos los game_types |
| `populate-bet-types-from-game-types.sql` | Poblar bet_types desde game_types |
| `configure-dominican-lotteries-fixed.sql` | Configurar prize_types DOM |
| `configure-dominican-all-bancas.sql` | Habilitar tipos DOM en bancas |
| `configure-usa-lotteries-clean.sql` | Configurar prize_types USA |
| `verify-complete-configuration.sql` | Verificar configuración completa |

---

## 🔄 Próximos Pasos (Opcional)

Si deseas **habilitar los tipos de USA en sorteos y bancas específicas**, necesitarás:

1. **Identificar sorteos USA** (ej: Florida, New York, Texas)
2. **Crear script similar a** `configure-dominican-all-bancas.sql`
3. **Insertar en** `betting_pool_draw_game_types`:
   ```sql
   INSERT INTO betting_pool_draw_game_types (betting_pool_id, draw_id, game_type_id)
   SELECT bp.betting_pool_id, draws.draw_id, game_types.game_type_id
   FROM betting_pools bp
   CROSS JOIN (
     SELECT draw_id FROM draws WHERE lottery_id IN (/* IDs de USA */)
   ) draws
   CROSS JOIN (
     SELECT game_type_id FROM game_types WHERE game_type_id >= 4
   ) game_types
   WHERE bp.is_active = 1;
   ```

---

## ✅ Verificación

Para verificar la configuración completa, ejecutar:

```bash
cd /home/jorge/projects/lottery-project/api/SqlRunner
export DOTNET_ROOT=$HOME/.dotnet && export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet run verify-complete-configuration.sql
```

---

## 📝 Notas Importantes

1. **Duplicación controlada:** Ahora tenemos datos en ambas tablas (`bet_types` y `game_types`), pero esto mantiene la compatibilidad con el código C# existente.

2. **FK Constraints:** La tabla `prize_types` mantiene su FK a `bet_types`, por lo que cualquier cambio debe hacerse en ambas tablas si es necesario.

3. **Modelo C#:** Los modelos `BetType.cs` y `GameType.cs` siguen funcionando correctamente sin cambios.

4. **API Endpoints:** Los endpoints existentes (`/api/bet-types/with-fields`) funcionarán correctamente con esta configuración.

---

**Configuración completada por:** Claude Code
**Documentado en:** `/home/jorge/projects/lottery-project/docs/USA_LOTTERIES_CONFIG_COMPLETE.md`
