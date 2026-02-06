# Fase 4 — Flujo de Pago de Premios

## Objetivo
Gestionar el ciclo de vida completo de un premio: desde que se identifica como ganador hasta que se marca como pagado.

## Entradas
- UI de ganadores mejorada (Fase 3)
- Tabla de jugadas ganadoras con datos
- Requisitos de negocio sobre aprobaciones

## Tareas

### 4.1 Extender modelo de datos
- [ ] Agregar campo `payment_status` (ENUM: pending, paid, cancelled)
- [ ] Agregar campo `paid_at` (datetime nullable)
- [ ] Agregar campo `paid_by_user_id` (FK a users)
- [ ] Agregar campo `payment_notes` (texto opcional)
- [ ] Crear migración de base de datos

### 4.2 Crear endpoint de pago
- [ ] `POST /api/winning-plays/{id}/pay`
- [ ] Validar que la jugada existe y está pendiente
- [ ] Validar permisos del usuario
- [ ] Actualizar status, paid_at, paid_by
- [ ] Retornar jugada actualizada

### 4.3 Crear endpoint de cancelación
- [ ] `POST /api/winning-plays/{id}/cancel`
- [ ] Requiere motivo obligatorio
- [ ] Solo admins pueden cancelar
- [ ] Registrar en auditoría

### 4.4 Implementar validaciones de negocio
- [ ] Verificar que el ticket no esté anulado
- [ ] Verificar que el sorteo ya cerró
- [ ] Verificar que los resultados están publicados
- [ ] Opcional: verificar límite de pago sin aprobación

### 4.5 Flujo de aprobación (opcional)
- [ ] Definir umbral de monto para aprobación
- [ ] Estado intermedio: `pending_approval`
- [ ] Endpoint de aprobación: `POST /api/winning-plays/{id}/approve`
- [ ] Notificación a aprobadores
- [ ] UI para cola de aprobaciones

### 4.6 Actualizar balance de banca
- [ ] Al marcar pagado, descontar de balance de banca
- [ ] Crear transacción contable asociada
- [ ] Manejar caso de balance insuficiente

### 4.7 Integrar con UI
- [ ] Conectar botón "Marcar Pagado" con endpoint
- [ ] Mostrar modal de confirmación
- [ ] Actualizar tabla al pagar
- [ ] Mostrar toast de éxito/error

## Decisiones a tomar
1. ¿Cuál es el monto máximo para pago sin aprobación?
2. ¿Quién puede aprobar pagos grandes?
3. ¿Se permite pago parcial?
4. ¿Se descuenta del balance o es informativo?

## Criterios de finalización
- [ ] Modelo de datos extendido
- [ ] Endpoint de pago funcionando
- [ ] Endpoint de cancelación funcionando
- [ ] Validaciones de negocio implementadas
- [ ] Balance de banca actualizado al pagar
- [ ] UI integrada con endpoints
- [ ] Flujo probado end-to-end

## Resultado
*(Se llenará al cerrar la fase)*
