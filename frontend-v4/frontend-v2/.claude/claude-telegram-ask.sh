#!/bin/bash
###############################################################################
# claude-telegram-ask.sh
#
# Script para que Claude Code haga preguntas vía Telegram y espere respuestas
#
# Uso:
#   ./claude-telegram-ask.sh "¿Pregunta?" '[{"label":"A","description":"..."}]'
#
# Autor: Claude Code
# Versión: 1.0.0
###############################################################################

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorio de estado
STATE_DIR="${HOME}/.claude-telegram"
PENDING_FILE="${STATE_DIR}/pending_questions.json"
RESPONSES_FILE="${STATE_DIR}/responses.json"

# Variables de entorno
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

# Validar jq instalado
if ! command -v jq &> /dev/null; then
  echo -e "${RED}❌ ERROR: jq no está instalado${NC}"
  echo -e "${CYAN}💡 Instala jq:${NC}"
  echo -e "   Ubuntu/Debian: sudo apt-get install jq"
  echo -e "   macOS: brew install jq"
  exit 1
fi

# Función para mostrar uso
show_usage() {
  echo "Uso: $0 <pregunta> <opciones_json> [timeout]"
  echo ""
  echo "Argumentos:"
  echo "  pregunta      - La pregunta a hacer"
  echo "  opciones_json - JSON array con opciones: [{\"label\":\"A\",\"description\":\"...\"}]"
  echo "  timeout       - Timeout en segundos (default: 300)"
  echo ""
  echo "Ejemplo:"
  echo "  $0 \"¿Qué prefieres?\" '[{\"label\":\"A\",\"description\":\"Opción A\"},{\"label\":\"B\",\"description\":\"Opción B\"}]'"
  echo ""
  echo "Variables de entorno:"
  echo "  TELEGRAM_CHAT_ID - Chat ID de Telegram (requerido)"
  exit 1
}

# Validar argumentos
if [ $# -lt 2 ]; then
  show_usage
fi

QUESTION="$1"
OPTIONS_JSON="$2"
TIMEOUT="${3:-300}"  # Default 5 minutos

# Validar Chat ID
if [ -z "$TELEGRAM_CHAT_ID" ]; then
  echo -e "${RED}❌ ERROR: TELEGRAM_CHAT_ID no está configurado${NC}"
  echo -e "${CYAN}💡 Configúralo en el archivo .env o exporta la variable:${NC}"
  echo -e "   export TELEGRAM_CHAT_ID=\"tu_chat_id\""
  echo -e ""
  echo -e "${CYAN}💡 Para obtener tu Chat ID:${NC}"
  echo -e "   1. Inicia el bot: node .claude/telegram-bot.js"
  echo -e "   2. Envía /chatid en Telegram"
  exit 1
fi

# Validar JSON de opciones
if ! echo "$OPTIONS_JSON" | jq empty 2>/dev/null; then
  echo -e "${RED}❌ ERROR: OPTIONS_JSON no es un JSON válido${NC}"
  exit 1
fi

# Crear directorio si no existe
mkdir -p "$STATE_DIR"

# Inicializar archivos si no existen
if [ ! -f "$PENDING_FILE" ]; then
  echo "{}" > "$PENDING_FILE"
fi

if [ ! -f "$RESPONSES_FILE" ]; then
  echo "{}" > "$RESPONSES_FILE"
fi

# Generar ID único para la pregunta
QUESTION_ID="q_$(date +%s)_$$_${RANDOM}"

echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${CYAN}📤 Enviando pregunta a Telegram...${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}❓ Pregunta:${NC} $QUESTION"
echo -e "${YELLOW}🆔 Question ID:${NC} $QUESTION_ID"
echo -e "${YELLOW}💬 Chat ID:${NC} $TELEGRAM_CHAT_ID"
echo -e "${YELLOW}⏱️  Timeout:${NC} ${TIMEOUT}s"
echo ""

# Leer archivo actual
PENDING=$(cat "$PENDING_FILE")

# Agregar nueva pregunta usando jq
NEW_PENDING=$(echo "$PENDING" | jq \
  --arg id "$QUESTION_ID" \
  --arg chat "$TELEGRAM_CHAT_ID" \
  --arg q "$QUESTION" \
  --argjson opts "$OPTIONS_JSON" \
  --arg created "$(date -Iseconds)" \
  '.[$id] = {
    telegram_chat_id: $chat,
    question: $q,
    options: $opts,
    status: "pending",
    created_at: $created
  }')

# Guardar
echo "$NEW_PENDING" > "$PENDING_FILE"

echo -e "${GREEN}✅ Pregunta creada exitosamente${NC}"
echo -e "${CYAN}⏳ Esperando respuesta del usuario...${NC}"
echo ""

# Polling hasta obtener respuesta
ELAPSED=0
INTERVAL=2
DOT_COUNT=0

while [ $ELAPSED -lt $TIMEOUT ]; do
  # Verificar si hay respuesta
  if [ -f "$RESPONSES_FILE" ]; then
    RESPONSE=$(cat "$RESPONSES_FILE" | jq -r --arg id "$QUESTION_ID" '.[$id].answer // empty')

    if [ ! -z "$RESPONSE" ]; then
      # Leer datos completos de la respuesta
      SELECTED_OPTION=$(cat "$RESPONSES_FILE" | jq --arg id "$QUESTION_ID" '.[$id].selected_option')
      ANSWERED_AT=$(cat "$RESPONSES_FILE" | jq -r --arg id "$QUESTION_ID" '.[$id].answered_at')
      USER_INFO=$(cat "$RESPONSES_FILE" | jq --arg id "$QUESTION_ID" '.[$id].telegram_user')

      echo ""
      echo -e "${GREEN}✅ ¡Respuesta recibida!${NC}"
      echo ""
      echo -e "${BLUE}════════════════════════════════════════════════${NC}"
      echo -e "${GREEN}📥 Respuesta:${NC} $RESPONSE"
      echo -e "${YELLOW}⏱️  Tiempo de espera:${NC} ${ELAPSED}s"
      echo -e "${YELLOW}🕒 Respondida:${NC} $ANSWERED_AT"
      echo -e "${BLUE}════════════════════════════════════════════════${NC}"
      echo ""

      # Limpiar pregunta y respuesta
      PENDING=$(cat "$PENDING_FILE" | jq --arg id "$QUESTION_ID" 'del(.[$id])')
      echo "$PENDING" > "$PENDING_FILE"

      RESPONSES=$(cat "$RESPONSES_FILE" | jq --arg id "$QUESTION_ID" 'del(.[$id])')
      echo "$RESPONSES" > "$RESPONSES_FILE"

      # Output JSON para Claude Code (última línea)
      echo "$SELECTED_OPTION" | jq -c '.'

      exit 0
    fi
  fi

  # Dormir
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))

  # Mostrar progreso (dots animados)
  DOT_COUNT=$(( (DOT_COUNT + 1) % 4 ))
  DOTS=$(printf '.%.0s' $(seq 1 $DOT_COUNT))
  printf "\r${CYAN}⏳ Esperando${DOTS}%-3s ${NC}[%3ds / %3ds]" "" "$ELAPSED" "$TIMEOUT"

  # Mostrar recordatorio cada 30 segundos
  if [ $((ELAPSED % 30)) -eq 0 ] && [ $ELAPSED -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}💡 Revisa tu Telegram para responder${NC}"
  fi
done

# Timeout alcanzado
echo ""
echo ""
echo -e "${RED}════════════════════════════════════════════════${NC}"
echo -e "${RED}❌ TIMEOUT: No se recibió respuesta en ${TIMEOUT}s${NC}"
echo -e "${RED}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}💡 Posibles causas:${NC}"
echo -e "   • El bot no está ejecutándose"
echo -e "   • El usuario no respondió a tiempo"
echo -e "   • Chat ID incorrecto"
echo ""
echo -e "${CYAN}🔧 Troubleshooting:${NC}"
echo -e "   1. Verifica que el bot esté corriendo: ps aux | grep telegram-bot"
echo -e "   2. Verifica tu Chat ID: echo \$TELEGRAM_CHAT_ID"
echo -e "   3. Revisa los logs del bot"
echo ""

# Limpiar pregunta sin respuesta
PENDING=$(cat "$PENDING_FILE" | jq --arg id "$QUESTION_ID" 'del(.[$id])')
echo "$PENDING" > "$PENDING_FILE"

exit 1
