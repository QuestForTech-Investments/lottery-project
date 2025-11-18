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

# 2. Iniciar Frontend V1 (Bootstrap)
echo "🎨 Iniciando Frontend V1 (Bootstrap) en puerto 4200..."
cd "$BASE_DIR/frontend-v1"
nohup npm run dev > /tmp/lottery-v1.log 2>&1 &
V1_PID=$!
echo "V1 iniciado con PID: $V1_PID"

# 3. Iniciar Frontend V2 (Material-UI)
echo "🎨 Iniciando Frontend V2 (Material-UI) en puerto 4000..."
cd "$BASE_DIR/frontend-v2"
nohup npm run dev > /tmp/lottery-v2.log 2>&1 &
V2_PID=$!
echo "V2 iniciado con PID: $V2_PID"

# Esperar a que todos inicien
echo "⏳ Esperando 10 segundos para que los servicios inicien..."
sleep 10

# Verificar estado
echo ""
echo "📊 Estado de los servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

lsof -ti:5000 > /dev/null 2>&1 && echo "✅ API       -> http://localhost:5000 (PID: $(lsof -ti:5000))" || echo "❌ API detenida"
lsof -ti:4200 > /dev/null 2>&1 && echo "✅ V1        -> http://localhost:4200 (PID: $(lsof -ti:4200))" || echo "❌ V1 detenido"
lsof -ti:4000 > /dev/null 2>&1 && echo "✅ V2        -> http://localhost:4000 (PID: $(lsof -ti:4000))" || echo "❌ V2 detenido"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Logs disponibles en:"
echo "   - API: tail -f /tmp/lottery-api.log"
echo "   - V1:  tail -f /tmp/lottery-v1.log"
echo "   - V2:  tail -f /tmp/lottery-v2.log"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "   ./stop-all.sh"
echo ""
echo "✨ Todos los servicios han sido iniciados en background"
echo "   Los servicios seguirán corriendo aunque cierres la sesión SSH"
