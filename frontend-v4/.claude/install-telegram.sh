#!/bin/bash
###############################################################################
# 🚀 Instalador de Telegram Bidireccional para Claude Code
#
# Copia el sistema de Telegram a cualquier proyecto
#
# Uso:
#   ./install-telegram.sh /ruta/al/proyecto
#   ./install-telegram.sh /ruta/al/proyecto --with-bot
#
# Opciones:
#   --with-bot    Copia y arranca el bot automáticamente
#   --help        Muestra esta ayuda
#
# Autor: Claude Code
# Versión: 1.0.0
###############################################################################

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
START_BOT=false

print_header() {
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo -e "${CYAN}🚀 Instalador de Telegram Bidireccional${NC}"
  echo "═══════════════════════════════════════════════════════════════"
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

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_usage() {
  cat << EOF
Uso:
  $0 /ruta/al/proyecto              Instalar solo archivos
  $0 /ruta/al/proyecto --with-bot   Instalar y arrancar bot
  $0 --help                         Mostrar esta ayuda

Ejemplos:
  # Instalar en otro proyecto
  $0 ~/projects/mi-app

  # Instalar y arrancar bot
  $0 ~/projects/mi-app --with-bot

  # Instalar en proyecto actual
  $0 .

¿Qué se instala?
  ✓ Cliente Node.js (claude-telegram-client.cjs)
  ✓ Bot de Telegram (telegram-bot.cjs)
  ✓ Scripts de bash (telegram-send.sh, claude-telegram-ask.sh)
  ✓ Scripts de test (test-telegram.cjs, test-telegram-send.cjs)
  ✓ Documentación (*.md)

Requisitos:
  • Node.js instalado
  • Variables en .env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

EOF
}

check_target_dir() {
  local target="$1"

  if [ ! -d "$target" ]; then
    print_error "Directorio no existe: $target"
    exit 1
  fi

  if [ ! -w "$target" ]; then
    print_error "No tienes permisos de escritura en: $target"
    exit 1
  fi
}

install_files() {
  local target="$1"
  local claude_dir="$target/.claude"

  echo -e "${BLUE}📦 Instalando archivos...${NC}"
  echo ""

  # Crear directorio .claude si no existe
  if [ ! -d "$claude_dir" ]; then
    mkdir -p "$claude_dir"
    print_success "Directorio .claude creado"
  else
    print_info "Directorio .claude ya existe"
  fi

  # Lista de archivos a copiar
  local files=(
    "claude-telegram-client.cjs"
    "telegram-bot.cjs"
    "telegram-send.sh"
    "claude-telegram-ask.sh"
    "test-telegram.cjs"
    "test-telegram-send.cjs"
  )

  local docs=(
    "TELEGRAM_BIDIRECCIONAL_SETUP.md"
    "TELEGRAM_BIDIRECCIONAL_ARQUITECTURA.md"
    "TELEGRAM_QUICK_START.md"
  )

  # Copiar archivos del sistema
  echo "📄 Copiando archivos del sistema..."
  for file in "${files[@]}"; do
    if [ -f "$SOURCE_DIR/$file" ]; then
      cp "$SOURCE_DIR/$file" "$claude_dir/"
      chmod +x "$claude_dir/$file" 2>/dev/null || true
      echo "  ✓ $file"
    else
      print_warning "Archivo no encontrado: $file"
    fi
  done
  echo ""

  # Copiar documentación
  echo "📚 Copiando documentación..."
  for doc in "${docs[@]}"; do
    local doc_path="$target/$doc"
    if [ -f "$doc_path" ]; then
      echo "  ⊘ $doc (ya existe, omitiendo)"
    else
      if [ -f "$SOURCE_DIR/../$doc" ]; then
        cp "$SOURCE_DIR/../$doc" "$target/"
        echo "  ✓ $doc"
      fi
    fi
  done
  echo ""
}

check_dependencies() {
  local target="$1"

  echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
  echo ""

  # Verificar Node.js
  if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado"
    echo ""
    print_info "Instala Node.js desde: https://nodejs.org/"
    exit 1
  fi
  print_success "Node.js instalado: $(node --version)"

  # Verificar npm
  if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
  fi
  print_success "npm instalado: $(npm --version)"

  # Verificar package.json
  if [ ! -f "$target/package.json" ]; then
    print_warning "No se encontró package.json en el proyecto"
    echo ""
    read -p "¿Crear package.json? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
      cd "$target"
      npm init -y
      print_success "package.json creado"
    fi
  else
    print_success "package.json encontrado"
  fi
  echo ""
}

install_npm_packages() {
  local target="$1"

  echo -e "${BLUE}📦 Instalando paquetes npm...${NC}"
  echo ""

  cd "$target"

  # Verificar si ya están instaladas
  local needs_install=false

  if [ ! -d "node_modules/node-telegram-bot-api" ]; then
    needs_install=true
  fi

  if [ ! -d "node_modules/dotenv" ]; then
    needs_install=true
  fi

  if [ "$needs_install" = true ]; then
    echo "Instalando: node-telegram-bot-api dotenv"
    npm install --save-dev node-telegram-bot-api dotenv
    echo ""
    print_success "Paquetes instalados"
  else
    print_success "Paquetes ya instalados"
  fi
  echo ""
}

check_env_file() {
  local target="$1"
  local env_file="$target/.env"

  echo -e "${BLUE}🔐 Verificando configuración...${NC}"
  echo ""

  if [ ! -f "$env_file" ]; then
    print_warning "Archivo .env no encontrado"
    echo ""
    echo "Creando .env de ejemplo..."
    cat > "$env_file" << 'EOF'
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Instrucciones:
# 1. Obtén tu token de @BotFather en Telegram
# 2. Obtén tu Chat ID ejecutando: node .claude/telegram-bot.cjs
#    y enviando /chatid en Telegram
EOF
    print_success ".env creado"
    echo ""
    print_warning "Debes configurar TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en .env"
  else
    # Verificar si tiene las variables
    if grep -q "TELEGRAM_BOT_TOKEN=" "$env_file" && grep -q "TELEGRAM_CHAT_ID=" "$env_file"; then
      print_success ".env ya configurado"
    else
      print_warning ".env existe pero no tiene las variables de Telegram"
      echo ""
      echo "Agrega estas líneas a tu .env:"
      echo ""
      echo "TELEGRAM_BOT_TOKEN=tu_token_aqui"
      echo "TELEGRAM_CHAT_ID=tu_chat_id_aqui"
    fi
  fi
  echo ""
}

start_bot() {
  local target="$1"

  echo -e "${BLUE}🤖 Iniciando bot...${NC}"
  echo ""

  cd "$target"

  # Verificar que las variables estén configuradas
  source "$target/.env" 2>/dev/null || true

  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    print_error "TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no están configurados en .env"
    echo ""
    print_info "Configúralos primero, luego ejecuta:"
    echo "  node .claude/telegram-bot.cjs"
    return 1
  fi

  # Iniciar bot en background
  nohup node .claude/telegram-bot.cjs > /tmp/telegram-bot.log 2>&1 &
  local bot_pid=$!

  echo ""
  print_success "Bot iniciado (PID: $bot_pid)"
  print_info "Logs en: /tmp/telegram-bot.log"
  echo ""
}

print_next_steps() {
  local target="$1"

  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo -e "${GREEN}✅ Instalación completada${NC}"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  echo -e "${CYAN}📋 Próximos pasos:${NC}"
  echo ""
  echo "1️⃣  Configura las variables en .env:"
  echo "   cd $target"
  echo "   nano .env"
  echo ""
  echo "2️⃣  Inicia el bot:"
  echo "   node .claude/telegram-bot.cjs"
  echo ""
  echo "3️⃣  Prueba el sistema:"
  echo "   node .claude/test-telegram.cjs"
  echo ""
  echo "4️⃣  Lee la documentación:"
  echo "   cat TELEGRAM_QUICK_START.md"
  echo ""
  echo -e "${CYAN}🎯 Uso rápido:${NC}"
  echo ""
  echo "   # Desde Node.js"
  echo "   const client = require('./.claude/claude-telegram-client.cjs');"
  echo ""
  echo "   # Desde Bash"
  echo "   ./.claude/telegram-send.sh \"Mensaje\""
  echo ""
  print_success "¡Sistema listo para usar!"
  echo ""
}

main() {
  print_header

  # Parsear argumentos
  if [ $# -eq 0 ]; then
    print_error "Debes especificar un directorio destino"
    echo ""
    print_usage
    exit 1
  fi

  case "$1" in
    --help|-h)
      print_usage
      exit 0
      ;;
  esac

  local target_dir="$1"
  shift

  # Parsear flags
  while [ $# -gt 0 ]; do
    case "$1" in
      --with-bot)
        START_BOT=true
        shift
        ;;
      *)
        print_error "Opción desconocida: $1"
        exit 1
        ;;
    esac
  done

  # Resolver ruta absoluta
  target_dir=$(cd "$target_dir" && pwd)

  echo "📂 Directorio destino: $target_dir"
  echo ""

  # Validaciones
  check_target_dir "$target_dir"

  # Instalación
  install_files "$target_dir"
  check_dependencies "$target_dir"
  install_npm_packages "$target_dir"
  check_env_file "$target_dir"

  # Arrancar bot si se solicitó
  if [ "$START_BOT" = true ]; then
    start_bot "$target_dir" || true
  fi

  # Mostrar próximos pasos
  print_next_steps "$target_dir"
}

main "$@"
