#!/bin/bash

# Script para verificar el estado de todos los servicios
# Uso: ./status.sh

echo "📊 Estado de los servicios del proyecto lottery"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# API
API_PID=$(lsof -ti:5000)
if [ ! -z "$API_PID" ]; then
    echo "✅ API (.NET)         -> http://localhost:5000"
    echo "   PID: $API_PID"
    echo "   Log: tail -f /tmp/lottery-api.log"
else
    echo "❌ API (.NET)         -> Detenida"
fi

echo ""

# Frontend
FRONTEND_PID=$(lsof -ti:5173)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "✅ Frontend           -> http://localhost:5173"
    echo "   PID: $FRONTEND_PID"
    echo "   Log: tail -f /tmp/lottery-frontend.log"
else
    echo "❌ Frontend           -> Detenido"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si hay algún servicio corriendo
RUNNING=0
[ ! -z "$API_PID" ] && RUNNING=$((RUNNING+1))
[ ! -z "$FRONTEND_PID" ] && RUNNING=$((RUNNING+1))

if [ $RUNNING -eq 0 ]; then
    echo "💡 Ningún servicio está corriendo"
    echo "   Ejecuta: ./start-all.sh para iniciar todos"
elif [ $RUNNING -eq 2 ]; then
    echo "✨ Todos los servicios están corriendo correctamente"
else
    echo "⚠️  Solo $RUNNING de 2 servicios están corriendo"
    echo "   Ejecuta: ./start-all.sh para iniciar todos"
fi

echo ""
