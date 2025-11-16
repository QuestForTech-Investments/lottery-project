#!/bin/bash

# Lottery API - Run Script
# Ejecuta la API con todas las configuraciones necesarias

echo "======================================"
echo "  Lottery API - Starting Server"
echo "======================================"
echo ""

# Configurar PATH de .NET
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools

# Verificar que .NET esté instalado
if ! command -v dotnet &> /dev/null
then
    echo "❌ Error: .NET SDK no encontrado"
    echo "Por favor ejecuta:"
    echo "  source ~/.bashrc"
    echo "O reinstala .NET con:"
    echo "  ./dotnet-install.sh --channel 8.0"
    exit 1
fi

echo "✅ .NET SDK version: $(dotnet --version)"
echo ""

# Ir al directorio del proyecto
cd "$(dirname "$0")/src/LotteryApi"

echo "📦 Verificando dependencias..."
dotnet restore --verbosity quiet

echo ""
echo "🔨 Compilando proyecto..."
dotnet build --configuration Release --verbosity quiet

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación"
    exit 1
fi

echo ""
echo "✅ Compilación exitosa"
echo ""
echo "🚀 Iniciando servidor..."
echo ""

# Obtener IP de WSL
WSL_IP=$(hostname -I | awk '{print $1}')

echo "📡 Servidor escuchando en TODAS las interfaces (0.0.0.0)"
echo ""
echo "🌐 Acceso desde WSL/Linux:"
echo "  HTTP:  http://localhost:5000"
echo ""
echo "🪟 Acceso desde Windows:"
echo "  HTTP:  http://localhost:5000"
echo "  O con IP WSL: http://${WSL_IP}:5000"
echo ""
echo "📄 Swagger UI:"
echo "  http://localhost:5000/swagger"
echo "  http://localhost:5000"
echo ""
echo "📋 API Specifications:"
echo "  OpenAPI 3.0 JSON: http://localhost:5000/swagger/v1-openapi3/swagger.json"
echo "  OpenAPI 3.0 YAML: http://localhost:5000/swagger/v1-openapi3/swagger.yaml"
echo "  Swagger 2.0 JSON: http://localhost:5000/swagger/v1-swagger2/swagger.json"
echo "  Swagger 2.0 YAML: http://localhost:5000/swagger/v1-swagger2/swagger.yaml"
echo ""
echo "❤️ Health Check:"
echo "  http://localhost:5000/health"
echo ""
echo "💡 Tip: En Windows, abre tu navegador y visita http://localhost:5000/swagger"
echo ""
echo "⛔ Presiona Ctrl+C para detener el servidor"
echo "======================================"
echo ""

# Ejecutar la API en todas las interfaces
dotnet run --urls "http://0.0.0.0:5000"
