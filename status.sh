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

# V1
V1_PID=$(lsof -ti:4200)
if [ ! -z "$V1_PID" ]; then
    echo "✅ Frontend V1        -> http://localhost:4200"
    echo "   PID: $V1_PID"
    echo "   Log: tail -f /tmp/lottery-v1.log"
else
    echo "❌ Frontend V1        -> Detenido"
fi

echo ""

# V2
V2_PID=$(lsof -ti:4000)
if [ ! -z "$V2_PID" ]; then
    echo "✅ Frontend V2        -> http://localhost:4000"
    echo "   PID: $V2_PID"
    echo "   Log: tail -f /tmp/lottery-v2.log"
else
    echo "❌ Frontend V2        -> Detenido"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar si hay algún servicio corriendo
RUNNING=0
[ ! -z "$API_PID" ] && RUNNING=$((RUNNING+1))
[ ! -z "$V1_PID" ] && RUNNING=$((RUNNING+1))
[ ! -z "$V2_PID" ] && RUNNING=$((RUNNING+1))

if [ $RUNNING -eq 0 ]; then
    echo "💡 Ningún servicio está corriendo"
    echo "   Ejecuta: ./start-all.sh para iniciar todos"
elif [ $RUNNING -eq 3 ]; then
    echo "✨ Todos los servicios están corriendo correctamente"
else
    echo "⚠️  Solo $RUNNING de 3 servicios están corriendo"
    echo "   Ejecuta: ./start-all.sh para iniciar todos"
fi

echo ""
