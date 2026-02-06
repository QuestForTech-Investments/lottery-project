# Fase 6 — Auditoría y Trazabilidad

## Objetivo
Implementar trazabilidad completa de cambios en configuración de premios y pagos.

## Entradas
- Sistema de premios completo (Fases 0-5)
- Requisitos de compliance/auditoría
- Modelo de usuarios existente

## Tareas

### 6.1 Tabla de auditoría de configuración
- [ ] Crear tabla `prize_config_audit`
- [ ] Campos: id, table_name, record_id, field_name, old_value, new_value, changed_by, changed_at
- [ ] Trigger o interceptor para cambios en `banca_prize_configs`
- [ ] Trigger o interceptor para cambios en `draw_prize_configs`

### 6.2 Tabla de auditoría de pagos
- [ ] Crear tabla `prize_payment_audit`
- [ ] Campos: id, winning_play_id, action (pay/cancel/approve), performed_by, performed_at, notes
- [ ] Registrar automáticamente al pagar/cancelar
- [ ] Incluir IP del usuario si es posible

### 6.3 Servicio de auditoría
- [ ] Crear `AuditService`
- [ ] Método: `LogConfigChange(table, recordId, field, oldValue, newValue)`
- [ ] Método: `LogPaymentAction(winningPlayId, action, notes)`
- [ ] Inyectar en controladores relevantes

### 6.4 UI de historial de cambios
- [ ] Página: `/admin/audit/prize-config`
- [ ] Filtros: fecha, usuario, banca, tipo de cambio
- [ ] Tabla con detalle de cambios
- [ ] Exportable a Excel

### 6.5 UI de historial de pagos
- [ ] Página: `/admin/audit/prize-payments`
- [ ] Filtros: fecha, usuario, banca, acción
- [ ] Tabla con detalle de pagos
- [ ] Link a detalle de jugada ganadora

### 6.6 Alertas automáticas
- [ ] Alerta: cambio de multiplicador > X%
- [ ] Alerta: pago de premio > X monto
- [ ] Alerta: múltiples cambios en poco tiempo
- [ ] Notificación por email a admins

### 6.7 Retención de datos
- [ ] Definir política de retención (ej: 5 años)
- [ ] Job de archivado de datos antiguos
- [ ] Backup antes de archivar

## Decisiones a tomar
1. ¿Cuánto tiempo retener datos de auditoría?
2. ¿Qué cambios ameritan alerta inmediata?
3. ¿Quién recibe las alertas?
4. ¿Se requiere doble autenticación para cambios críticos?

## Criterios de finalización
- [ ] Tabla de auditoría de config creada y poblándose
- [ ] Tabla de auditoría de pagos creada y poblándose
- [ ] UI de historial de config funcionando
- [ ] UI de historial de pagos funcionando
- [ ] Alertas configuradas y enviándose
- [ ] Política de retención definida

## Resultado
*(Se llenará al cerrar la fase)*
