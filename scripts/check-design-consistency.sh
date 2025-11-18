#!/bin/bash

# Script para verificar consistencia de diseño en formularios
# Busca uso de colores no autorizados, tamaños inconsistentes, etc.

echo "🎨 Verificando coherencia de diseño..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

WARNINGS=0

# Verificar colores no autorizados (excepto en comentarios)
echo -e "${YELLOW}Verificando uso de colores corporativos...${NC}"

# Colores prohibidos (no están en el sistema de diseño)
FORBIDDEN_COLORS=(
  "#667eea"  # Morado (fix 2025-11-18)
  "#764ba2"  # Morado oscuro
  "#ff0000"  # Rojo puro
  "#00ff00"  # Verde puro
  "purple"
  "violet"
)

for color in "${FORBIDDEN_COLORS[@]}"; do
  FOUND=$(grep -r "$color" frontend-v1/src frontend-v2/src --include="*.css" --include="*.jsx" --include="*.js" 2>/dev/null | grep -v "node_modules" | grep -v "//" || true)

  if [ ! -z "$FOUND" ]; then
    echo -e "${YELLOW}⚠️  Color no autorizado encontrado: $color${NC}"
    echo "$FOUND"
    WARNINGS=$((WARNINGS + 1))
  fi
done

# Verificar uso de Montserrat font
echo -e "\n${YELLOW}Verificando uso de tipografía...${NC}"

WRONG_FONTS=$(grep -r "font-family.*Arial" frontend-v1/src frontend-v2/src --include="*.css" 2>/dev/null | grep -v "Montserrat" | grep -v "node_modules" || true)

if [ ! -z "$WRONG_FONTS" ]; then
  echo -e "${YELLOW}⚠️  Archivos sin Montserrat en font-family:${NC}"
  echo "$WRONG_FONTS"
  WARNINGS=$((WARNINGS + 1))
fi

# Resultado
echo ""
if [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ Diseño consistente con el sistema de diseño${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Se encontraron $WARNINGS advertencias de diseño${NC}"
  echo -e "${YELLOW}💡 Revisa DESIGN_SYSTEM.md para los colores y fuentes autorizados${NC}"
  exit 0  # No fallar, solo advertir
fi
