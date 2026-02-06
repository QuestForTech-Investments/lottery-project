# Fase 1 — Fundamentos del Cálculo

## Objetivo
Asegurar que el modelo de datos y la lógica core de cálculo estén correctos y testeados.

## Entradas
- Análisis completado en Fase 0
- Diagrama ER de tablas
- Lista de gaps identificados

## Tareas

### 1.1 Verificar modelo de datos
- [ ] Confirmar estructura de `prize_types`
- [ ] Confirmar estructura de `banca_prize_configs`
- [ ] Confirmar estructura de `draw_prize_configs`
- [ ] Crear migraciones si faltan campos

### 1.2 Implementar lógica de resolución
- [ ] Crear método `ResolvePrizeMultiplier(bettingPoolId, drawId, prizeTypeId)`
- [ ] Implementar cascada correctamente
- [ ] Manejar caso de tipo de premio no encontrado
- [ ] Cachear resultados si es necesario

### 1.3 Implementar lógica de cálculo
- [ ] Crear método `CalculatePrize(betAmount, multiplier)`
- [ ] Validar inputs (monto > 0, multiplicador válido)
- [ ] Usar `decimal` para precisión
- [ ] Manejar edge cases (0, negativos, overflow)

### 1.4 Documentar fórmulas por tipo
- [ ] DIRECTO: fórmula y campos
- [ ] PALÉ: fórmula y campos
- [ ] TRIPLETA: fórmula y campos
- [ ] PICK3/4/5: fórmulas y campos
- [ ] Otros tipos

### 1.5 Crear tests unitarios
- [ ] Test: multiplicador default (sin override)
- [ ] Test: multiplicador con override de banca
- [ ] Test: multiplicador con override de sorteo
- [ ] Test: cálculo correcto con multiplicador
- [ ] Test: validación de inputs inválidos

## Decisiones a tomar
1. ¿Crear stored procedure o lógica en C#?
2. ¿Cachear multiplicadores resueltos?
3. ¿Qué hacer si no existe prize_type para un bet_type?

## Criterios de finalización
- [ ] Modelo de datos verificado/corregido
- [ ] Lógica de resolución implementada
- [ ] Lógica de cálculo implementada
- [ ] Fórmulas documentadas por tipo
- [ ] Tests pasando al 100%

## Resultado
*(Se llenará al cerrar la fase)*
