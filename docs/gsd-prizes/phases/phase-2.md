# Fase 2 — Cálculo Automático de Premios

## Objetivo
Cuando se publican resultados de un sorteo, calcular automáticamente los premios de todas las jugadas ganadoras.

## Entradas
- Lógica de cálculo testeada (Fase 1)
- Entendimiento del flujo de resultados (Fase 0)
- Modelo de datos de tickets/jugadas

## Tareas

### 2.1 Diseñar almacenamiento de ganadores
- [ ] Decidir: ¿tabla nueva o campos en tabla existente?
- [ ] Diseñar estructura de `winning_plays` (si es nueva)
- [ ] Crear migración de base de datos
- [ ] Crear entidad/modelo en .NET

### 2.2 Identificar evento de publicación
- [ ] Encontrar método que publica resultados
- [ ] Decidir: ¿trigger DB, evento .NET, o endpoint separado?
- [ ] Diseñar flujo de activación

### 2.3 Crear servicio de cálculo
- [ ] Crear `PrizeCalculationService`
- [ ] Método: `CalculatePrizesForDraw(drawId, date)`
- [ ] Obtener todos los tickets del sorteo/fecha
- [ ] Obtener resultados publicados
- [ ] Comparar jugadas con resultados
- [ ] Calcular premio de cada jugada ganadora
- [ ] Almacenar en tabla de ganadores

### 2.4 Implementar lógica de matching
- [ ] DIRECTO: número = primer/segundo/tercer lugar
- [ ] PALÉ: dos números en resultados
- [ ] TRIPLETA: tres números en resultados
- [ ] PICK3/4/5: matching según tipo
- [ ] Documentar reglas de matching por tipo

### 2.5 Manejar idempotencia
- [ ] Verificar si ya se calcularon premios para sorteo/fecha
- [ ] Opción: UPSERT (actualizar si existe)
- [ ] Opción: DELETE + INSERT (recalcular completo)
- [ ] Registrar timestamp de último cálculo

### 2.6 Crear endpoint de recálculo manual
- [ ] `POST /api/prizes/recalculate`
- [ ] Parámetros: drawId, date
- [ ] Solo admins pueden ejecutar
- [ ] Retornar resumen de cambios

### 2.7 Integrar con publicación de resultados
- [ ] Llamar `CalculatePrizesForDraw` al publicar
- [ ] Manejar errores sin bloquear publicación
- [ ] Loguear resultado del cálculo

## Decisiones a tomar
1. ¿Cálculo síncrono o asíncrono (background job)?
2. ¿Qué hacer si falla el cálculo?
3. ¿Notificar a alguien cuando hay ganadores grandes?
4. ¿Límite de monto para alertas?

## Criterios de finalización
- [ ] Tabla de ganadores creada
- [ ] Servicio de cálculo funcionando
- [ ] Matching correcto por tipo de apuesta
- [ ] Idempotencia verificada
- [ ] Endpoint de recálculo disponible
- [ ] Integrado con publicación de resultados
- [ ] Probado con datos reales (banca de prueba)

## Resultado
*(Se llenará al cerrar la fase)*
