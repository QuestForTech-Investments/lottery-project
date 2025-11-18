#!/bin/bash

# Script para detener todos los servicios (tmux)
# Uso: ./stop-all-tmux.sh

SESSION_NAME="lottery"

echo "🛑 Deteniendo servicios del proyecto lottery (tmux)..."
echo ""

# Verificar si la sesión existe
if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "⚠️  La sesión tmux '$SESSION_NAME' no existe"
    echo "   Verificando servicios en puertos..."
    echo ""

    # Intentar detener por puertos
    API_PID=$(lsof -ti:5000)
    V1_PID=$(lsof -ti:4200)
    V2_PID=$(lsof -ti:4000)

    [ ! -z "$API_PID" ] && echo "🔴 Deteniendo API (PID: $API_PID)..." && kill $API_PID && echo "   ✅ API detenida"
    [ ! -z "$V1_PID" ] && echo "🔴 Deteniendo V1 (PID: $V1_PID)..." && kill $V1_PID && echo "   ✅ V1 detenido"
    [ ! -z "$V2_PID" ] && echo "🔴 Deteniendo V2 (PID: $V2_PID)..." && kill $V2_PID && echo "   ✅ V2 detenido"

    echo ""
    echo "✨ Limpieza completada"
    exit 0
fi

# Matar sesión tmux (detiene todos los procesos)
echo "🔴 Deteniendo sesión tmux '$SESSION_NAME'..."
tmux kill-session -t $SESSION_NAME

echo "   ✅ Sesión tmux detenida"
echo ""
echo "✨ Todos los servicios han sido detenidos"
