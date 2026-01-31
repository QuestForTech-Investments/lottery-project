# Preguntas Pendientes para el Cliente

## Comisiones

### 1. ¿Las comisiones se calculan de todos los tickets o solo de los resueltos?

**Fecha:** 2026-01-28

**Contexto:**
Actualmente las comisiones se calculan al **momento de crear el ticket**, independientemente de si el ticket está pendiente, ganador o perdedor.

**Pregunta:**
¿Las comisiones de venta deben sacarse de:
- **Opción A:** Todos los tickets (como está ahora) - La banca recibe comisión al momento de la venta
- **Opción B:** Solo tickets resueltos (ganadores + perdedores) - La comisión se aplica después de conocer resultados
- **Opción C:** Solo tickets perdedores - La comisión solo aplica cuando el ticket no ganó

**Implicación:**
- Si es Opción A: No hay cambios necesarios
- Si es Opción B o C: Los reportes de ventas deben filtrar por `ticket_state != 'P'` (pendiente) al calcular comisiones

---

## Otras Preguntas

_(Agregar más preguntas aquí según surjan)_
