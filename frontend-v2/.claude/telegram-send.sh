#!/bin/bash
###############################################################################
# 📤 Telegram Send - Enviar mensajes markdown a Telegram
#
# Envía contenido markdown o archivos .md a Telegram desde Bash
#
# Uso:
#   ./telegram-send.sh "Mensaje markdown"
#   ./telegram-send.sh --file ruta/archivo.md
#
# Autor: Claude Code
# Versión: 1.0.0
###############################################################################

set -euo pipefail

# ============================================
# CONFIGURACIÓN
# ============================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# FUNCIONES
# ============================================

print_header() {
  echo ""
  echo "════════════════════════════════════════════════"
  echo -e "${CYAN}📤 Telegram Send - Envío de Markdown${NC}"
  echo "════════════════════════════════════════════════"
  echo ""
}

print_error() {
  echo -e "${RED}❌ ERROR: $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
  echo -e "${BLUE}💡 $1${NC}"
}

print_usage() {
  cat << EOF
Uso:
  $0 "Mensaje markdown"              Enviar mensaje directo
  $0 --file ruta/archivo.md          Enviar contenido de archivo
  $0 -f ruta/archivo.md              Alias de --file
  $0 --help                          Mostrar esta ayuda

Ejemplos:
  # Mensaje simple
  $0 "**Hola** desde *bash*"

  # Con emojis
  $0 "🚀 Deploy completado ✅"

  # Con código
  $0 "\`\`\`bash
  echo 'Hola Mundo'
  \`\`\`"

  # Desde archivo
  $0 --file README.md

Variables de entorno requeridas:
  TELEGRAM_BOT_TOKEN    Token del bot
  TELEGRAM_CHAT_ID      ID del chat destino

EOF
}

check_dependencies() {
  if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo ""
    print_info "Instala Node.js desde: https://nodejs.org/"
    exit 1
  fi
}

load_env() {
  if [ ! -f "$ENV_FILE" ]; then
    print_error "Archivo .env no encontrado en $ENV_FILE"
    exit 1
  fi

  # Cargar .env
  export $(grep -v '^#' "$ENV_FILE" | xargs)

  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
    print_error "TELEGRAM_BOT_TOKEN no está configurado en .env"
    exit 1
  fi

  if [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    print_error "TELEGRAM_CHAT_ID no está configurado en .env"
    exit 1
  fi
}

send_message() {
  local content="$1"
  local is_file="${2:-false}"

  # Crear script Node.js temporal
  local temp_script=$(mktemp)

  cat > "$temp_script" << 'NODESCRIPT'
const ClaudeTelegramClient = require(process.argv[1]);

async function send() {
  const client = new ClaudeTelegramClient();
  await client.initialize();

  const content = process.argv[2];
  const isFile = process.argv[3] === 'true';

  const result = await client.sendMarkdown(content, {
    isFile: isFile,
    splitLong: true,
    maxLength: 4000
  });

  console.log('');
  console.log('✅ Mensaje encolado:');
  console.log(`   ID: ${result.messageId}`);
  console.log(`   Partes: ${result.parts}`);
  console.log(`   Caracteres: ${result.totalChars}`);
  console.log('');
  console.log('💡 El bot enviará el mensaje en los próximos 3 segundos');
}

send().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
NODESCRIPT

  # Ejecutar
  node "$temp_script" "$SCRIPT_DIR/claude-telegram-client.cjs" "$content" "$is_file"

  # Limpiar
  rm "$temp_script"
}

# ============================================
# MAIN
# ============================================

main() {
  print_header

  # Parsear argumentos
  if [ $# -eq 0 ]; then
    print_error "No se proporcionó mensaje o archivo"
    echo ""
    print_usage
    exit 1
  fi

  case "$1" in
    --help|-h)
      print_usage
      exit 0
      ;;
    --file|-f)
      if [ $# -lt 2 ]; then
        print_error "Debes especificar una ruta de archivo"
        exit 1
      fi

      local file_path="$2"

      if [ ! -f "$file_path" ]; then
        print_error "Archivo no encontrado: $file_path"
        exit 1
      fi

      check_dependencies
      load_env

      echo -e "${BLUE}📄 Enviando archivo: $file_path${NC}"
      echo ""

      send_message "$file_path" "true"
      ;;
    *)
      local message="$1"

      check_dependencies
      load_env

      echo -e "${BLUE}💬 Enviando mensaje...${NC}"
      echo ""

      send_message "$message" "false"
      ;;
  esac

  echo ""
  echo "════════════════════════════════════════════════"
  print_success "Envío completado"
  echo "════════════════════════════════════════════════"
  echo ""
  print_info "Revisa tu Telegram en unos segundos"
  echo ""
}

main "$@"
