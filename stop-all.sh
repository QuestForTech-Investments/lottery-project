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

# Detener V1 (puerto 4200)
V1_PID=$(lsof -ti:4200)
if [ ! -z "$V1_PID" ]; then
    echo "🔴 Deteniendo V1 (PID: $V1_PID)..."
    kill $V1_PID
    echo "   ✅ V1 detenido"
else
    echo "   ⚠️  V1 no estaba corriendo"
fi

# Detener V2 (puerto 4000)
V2_PID=$(lsof -ti:4000)
if [ ! -z "$V2_PID" ]; then
    echo "🔴 Deteniendo V2 (PID: $V2_PID)..."
    kill $V2_PID
    echo "   ✅ V2 detenido"
else
    echo "   ⚠️  V2 no estaba corriendo"
fi

echo ""
echo "✨ Todos los servicios han sido detenidos"
