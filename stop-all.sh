#!/bin/bash

# Script para detener todos los servicios del proyecto lottery
# Uso: ./stop-all.sh

echo "🛑 Deteniendo servicios del proyecto lottery..."
echo ""

# Detener API (puerto 5000)
API_PID=$(lsof -ti:5000)
if [ ! -z "$API_PID" ]; then
    echo "🔴 Deteniendo API (PID: $API_PID)..."
    kill $API_PID
    echo "   ✅ API detenida"
else
    echo "   ⚠️  API no estaba corriendo"
fi

# Detener Frontend (puerto 5173)
FRONTEND_PID=$(lsof -ti:5173)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "🔴 Deteniendo Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID
    echo "   ✅ Frontend detenido"
else
    echo "   ⚠️  Frontend no estaba corriendo"
fi

echo ""
echo "✨ Todos los servicios han sido detenidos"
