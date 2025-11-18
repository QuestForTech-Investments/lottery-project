#!/bin/bash

# Script para verificar que NO haya nombres en español en el código
# Ejecutar antes de commits importantes

echo "🔍 Verificando nombres de archivos y componentes..."

# Colores
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Palabras en español comunes que NO deberían estar en nombres de archivos/componentes
SPANISH_WORDS=(
  "Lista"
  "Crear"
  "Editar"
  "Eliminar"
  "Buscar"
  "Filtro"
  "Boton"
  "Formulario"
  "Tabla"
  "Pagina"
  "Usuario"
  "Banca"
  "Zona"
  "Sorteo"
  "Premio"
)

# Buscar en nombres de archivos
echo -e "${YELLOW}Verificando nombres de archivos JSX/JS...${NC}"

for word in "${SPANISH_WORDS[@]}"; do
  FILES=$(find frontend-v1/src frontend-v2/src -type f \( -name "*.jsx" -o -name "*.js" \) 2>/dev/null | grep -i "$word" || true)

  if [ ! -z "$FILES" ]; then
    echo -e "${RED}❌ Archivos con nombres en español encontrados (palabra: $word):${NC}"
    echo "$FILES"
    ERRORS=$((ERRORS + 1))
  fi
done

# Buscar nombres de componentes en español (PascalCase)
echo -e "\n${YELLOW}Verificando nombres de componentes...${NC}"

for word in "${SPANISH_WORDS[@]}"; do
  COMPONENTS=$(grep -r "const ${word}\|function ${word}\|class ${word}" frontend-v1/src frontend-v2/src 2>/dev/null | grep -v "node_modules" || true)

  if [ ! -z "$COMPONENTS" ]; then
    echo -e "${RED}❌ Componentes con nombres en español encontrados (palabra: $word):${NC}"
    echo "$COMPONENTS"
    ERRORS=$((ERRORS + 1))
  fi
done

# Resultado final
echo ""
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ No se encontraron nombres en español en el código${NC}"
  exit 0
else
  echo -e "${RED}❌ Se encontraron $ERRORS problemas de nomenclatura${NC}"
  echo -e "${YELLOW}💡 Recuerda: Todo el código debe estar en INGLÉS (ver CLAUDE.md línea 666)${NC}"
  exit 1
fi
