# Preferencias del Proyecto - LottoWebApp

## 🎯 Workflow de Desarrollo

### 1. Git y Commits
**🚫 NO subir cambios automáticamente al repositorio**
- Solo hacer `git add` y `git commit` cuando el usuario lo solicite EXPLÍCITAMENTE
- No asumir que después de implementar algo se debe hacer commit
- Esperar confirmación del usuario antes de cualquier operación git

### 2. Agente por Defecto
**🤖 Usar `frontend-developer` agent para todas las tareas de React/Frontend**
- A menos que el usuario especifique otra cosa, invocar al `frontend-developer` agent para:
  - Implementación de componentes React
  - Modificación de componentes existentes
  - Gestión de estado (useState, useEffect, context)
  - Arquitectura de componentes
  - Optimización de rendimiento
  - Estilos CSS/Tailwind
  - Integración con APIs desde el frontend

### 3. Tracking de Tareas
**📋 Siempre usar TodoWrite**
- Usar TodoWrite para planificar tareas antes de empezar
- Mantener el todo list actualizado durante la implementación
- Marcar tareas como completadas inmediatamente al terminarlas

## 🔧 Agentes Disponibles

### frontend-developer
- **Cuándo usar**: Tareas de React, componentes UI, state management
- **Herramientas**: Read, Write, Edit, Bash
- **Especialización**: Frontend moderno, arquitectura de componentes, optimización

### ui-ux-designer
- **Cuándo usar**: Diseño de interfaces, mejoras de UX
- **Especialización**: Diseño visual, accesibilidad, experiencia de usuario

## 📝 Notas

- Estas preferencias se leen al inicio de cada conversación desde `src/context.md`
- Si el usuario pide explícitamente usar Claude Code directamente, no invocar agentes
- Siempre preguntar si hay dudas sobre qué agente usar
