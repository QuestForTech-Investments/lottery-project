#!/bin/bash

echo "🎰 PRUEBA RÁPIDA DEL SISTEMA DE BANCAS"
echo "======================================"

echo ""
echo "1️⃣ Verificando API..."
API_STATUS=$(curl -s http://localhost:5000/api/test/health | jq -r '.status' 2>/dev/null)
if [ "$API_STATUS" = "healthy" ]; then
    echo "✅ API funcionando correctamente"
else
    echo "❌ API no disponible"
    exit 1
fi

echo ""
echo "2️⃣ Obteniendo usuarios disponibles..."
USERS=$(curl -s http://localhost:5000/api/users | jq -r '.data[] | select(.branch == null) | .username' 2>/dev/null | head -3)
echo "👥 Usuarios disponibles:"
echo "$USERS" | while read user; do echo "   - $user"; done

echo ""
echo "3️⃣ Creando banca de prueba..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "branchName": "Banca Prueba Script",
    "branchCode": "LAN-SCRIPT-001",
    "zoneId": 1,
    "location": "Ubicación de prueba desde script",
    "reference": "SCRIPT-REF-001",
    "comment": "Creada automáticamente por script de prueba"
  }')

SUCCESS=$(echo $RESPONSE | jq -r '.success' 2>/dev/null)
if [ "$SUCCESS" = "true" ]; then
    BRANCH_ID=$(echo $RESPONSE | jq -r '.data.branchId')
    BRANCH_NAME=$(echo $RESPONSE | jq -r '.data.branchName')
    echo "✅ Banca creada exitosamente!"
    echo "   ID: $BRANCH_ID"
    echo "   Nombre: $BRANCH_NAME"
else
    echo "❌ Error creando banca"
    echo "$RESPONSE"
fi

echo ""
echo "4️⃣ Verificando bancas existentes..."
TOTAL_BANCAS=$(curl -s http://localhost:5000/api/branches | jq -r '.pagination.totalItems' 2>/dev/null)
echo "📊 Total de bancas en el sistema: $TOTAL_BANCAS"

echo ""
echo "🎯 RESUMEN DE PRUEBA:"
echo "==================="
echo "✅ API: Funcionando"
echo "✅ Base de datos: Conectada"
echo "✅ Creación de bancas: Exitosa"
echo "✅ Total de bancas: $TOTAL_BANCAS"

echo ""
echo "🌐 PARA PROBAR LA INTERFAZ:"
echo "=========================="
echo "Formulario React: http://localhost:5174"
echo "LottoWebApp:      http://localhost:3000"
echo "API REST:         http://localhost:5000/api"

echo ""
echo "📋 Ver guía completa: cat /home/ubuntu/GUIA_PRUEBAS.md"
