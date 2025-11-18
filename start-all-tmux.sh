#!/bin/bash

# Script para iniciar todos los servicios usando tmux
# Los servicios seguirán corriendo aunque cierres SSH
# Uso: ./start-all-tmux.sh

SESSION_NAME="lottery"

echo "🚀 Iniciando servicios del proyecto lottery con tmux..."

# Verificar si la sesión ya existe
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "⚠️  La sesión tmux '$SESSION_NAME' ya existe"
    echo "   Opciones:"
    echo "   1. Adjuntar a la sesión: tmux attach -t $SESSION_NAME"
    echo "   2. Detener servicios primero: ./stop-all-tmux.sh"
    exit 1
fi

# Crear nueva sesión tmux con la API
echo "📡 Creando sesión tmux y iniciando API (.NET)..."
tmux new-session -d -s $SESSION_NAME -n "API" "cd /home/jorge/projects/lottery-project/api/src/LotteryApi && export DOTNET_ROOT=$HOME/.dotnet && export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools && dotnet run --urls 'http://0.0.0.0:5000'"

# Crear ventana para V1
echo "🎨 Iniciando Frontend V1 (Bootstrap)..."
tmux new-window -t $SESSION_NAME: -n "V1" "cd /home/jorge/projects/lottery-project/frontend-v1 && npm run dev"

# Crear ventana para V2
echo "🎨 Iniciando Frontend V2 (Material-UI)..."
tmux new-window -t $SESSION_NAME: -n "V2" "cd /home/jorge/projects/lottery-project/frontend-v2 && npm run dev"

# Esperar a que inicien
echo "⏳ Esperando 10 segundos para que los servicios inicien..."
sleep 10

# Verificar estado
echo ""
echo "📊 Estado de los servicios:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

lsof -ti:5000 > /dev/null 2>&1 && echo "✅ API       -> http://localhost:5000 (PID: $(lsof -ti:5000))" || echo "❌ API detenida (puede tardar en iniciar)"
lsof -ti:4200 > /dev/null 2>&1 && echo "✅ V1        -> http://localhost:4200 (PID: $(lsof -ti:4200))" || echo "❌ V1 detenido (puede tardar en iniciar)"
lsof -ti:4000 > /dev/null 2>&1 && echo "✅ V2        -> http://localhost:4000 (PID: $(lsof -ti:4000))" || echo "❌ V2 detenido (puede tardar en iniciar)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Sesión tmux creada: $SESSION_NAME"
echo ""
echo "📺 Comandos útiles:"
echo "   - Ver servicios:       tmux attach -t $SESSION_NAME"
echo "   - Verificar estado:    ./status.sh"
echo "   - Detener servicios:   ./stop-all-tmux.sh"
echo ""
echo "💡 Navegar entre ventanas tmux:"
echo "   - Ctrl+b n  (siguiente ventana)"
echo "   - Ctrl+b p  (ventana anterior)"
echo "   - Ctrl+b 0  (ventana API)"
echo "   - Ctrl+b 1  (ventana V1)"
echo "   - Ctrl+b 2  (ventana V2)"
echo "   - Ctrl+b d  (desconectar sin detener)"
echo ""
echo "✨ Los servicios seguirán corriendo aunque cierres SSH"
