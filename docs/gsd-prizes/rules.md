# Reglas de Trabajo: Sistema de Cálculo de Premios

## Reglas Generales

### 1. Precisión es crítica
- Un error de cálculo puede costar dinero real
- Siempre verificar con casos de prueba antes de producción
- Preferir lógica simple y auditable sobre optimizaciones complejas

### 2. Nomenclatura
| Elemento | Idioma | Ejemplo |
|----------|--------|---------|
| Variables, funciones, clases | Inglés | `calculatePrize()` |
| Textos UI | Español | "Jugadas Ganadoras" |
| Nombres de tablas DB | snake_case inglés | `winning_plays` |

### 3. Cascada de configuración
```
Prioridad: sorteo_específico > banca > sistema

SIEMPRE resolver en este orden:
1. Buscar en draw_prize_configs
2. Si no existe, buscar en banca_prize_configs
3. Si no existe, usar prize_types.default_multiplier
```

### 4. Idempotencia
- Recalcular premios para un sorteo/fecha debe dar el mismo resultado
- Antes de insertar, verificar si ya existe
- Usar UPSERT cuando sea posible

### 5. Auditoría
- Registrar quién y cuándo modifica configuración de premios
- Registrar quién y cuándo marca un premio como pagado
- Nunca eliminar registros de pagos, solo marcar como anulados

---

## Reglas de Código

### Backend (.NET)

```csharp
// Usar decimal para montos, NUNCA double o float
public decimal CalculatePrize(decimal betAmount, decimal multiplier)
{
    return betAmount * multiplier;
}

// Validar multiplicador antes de calcular
if (multiplier <= 0 || multiplier > MAX_MULTIPLIER)
    throw new InvalidOperationException("Invalid multiplier");
```

### Frontend (TypeScript)

```typescript
// Usar number para cálculos, formatear al mostrar
const prize = betAmount * multiplier;
const formatted = prize.toLocaleString('es-DO', {
  style: 'currency',
  currency: 'DOP'
});
```

### Base de Datos

```sql
-- Siempre usar DECIMAL(18,2) para montos
ALTER TABLE winning_plays
ADD prize_amount DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Índices para consultas frecuentes
CREATE INDEX IX_winning_plays_date_draw
ON winning_plays(draw_date, draw_id);
```

---

## Reglas de Testing

### Casos obligatorios
1. Premio con multiplicador default (sin override)
2. Premio con override de banca
3. Premio con override de sorteo
4. Premio $0 (apuesta sin match)
5. Recálculo (idempotencia)

### Datos de prueba
- Banca de prueba: ID 9 (admin)
- Usar fechas pasadas para no afectar datos reales
- Limpiar datos de prueba después de cada test

---

## Reglas de Deploy

1. **Nunca** desplegar cambios de cálculo un viernes
2. Probar en banca de prueba antes de producción
3. Tener script de rollback listo
4. Monitorear primeros 30 minutos después de deploy

---

## Definiciones

| Término | Significado |
|---------|-------------|
| Jugada | Una apuesta individual dentro de un ticket |
| Jugada ganadora | Jugada que coincide con resultado publicado |
| Premio | Monto a pagar = monto apostado × multiplicador |
| Multiplicador | Factor de pago configurado por tipo/banca/sorteo |
| Cascada | Sistema de resolución de configuración por prioridad |
