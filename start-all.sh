#!/bin/bash

# Script para iniciar todos los servicios del proyecto lottery
# Uso: ./start-all.sh

echo "🚀 Iniciando servicios del proyecto lottery..."

# Directorio base
BASE_DIR="/home/jorge/projects/lottery-project"

# 1. Iniciar API (.NET)
echo "📡 Iniciando API (.NET) en puerto 5000..."
cd "$BASE_DIR/api/src/LotteryApi"
nohup env DOTNET_ROOT=$HOME/.dotnet PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools dotnet run --urls "http://0.0.0.0:5000" > /tmp/lottery-api.log 2>&1 &
API_PID=$!
echo "API iniciada con PID: $API_PID"

# Esperar 3 segundos
sleep 3

# 2. Iniciar Frontend
echo "🎨 Iniciando Frontend en puerto 5173..."
cd "$BASE_DIR/frontend-v4"
nohup npm run dev > /tmp/lottery-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend iniciado con PID: $FRONTEND_PID"

# Esperar a que todos inicien
echo "⏳ Esperando 10 segundos para que los servicios inicien..."
sleep 10

# Verificar estado
echo ""
echo "📊 Estado de los servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

lsof -ti:5000 > /dev/null 2>&1 && echo "✅ API       -> http://localhost:5000 (PID: $(lsof -ti:5000))" || echo "❌ API detenida"
lsof -ti:5173 > /dev/null 2>&1 && echo "✅ Frontend  -> http://localhost:5173 (PID: $(lsof -ti:5173))" || echo "❌ Frontend detenido"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Logs disponibles en:"
echo "   - API:      tail -f /tmp/lottery-api.log"
echo "   - Frontend: tail -f /tmp/lottery-frontend.log"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "   ./stop-all.sh"
echo ""
echo "✨ Todos los servicios han sido iniciados en background"
echo "   Los servicios seguirán corriendo aunque cierres la sesión SSH"
