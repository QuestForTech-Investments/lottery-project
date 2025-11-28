# ⚡ Telegram Bidireccional - Quick Start

## 🚀 Configuración en 5 Minutos

### Paso 1: Instalar dependencias (30 segundos)

```bash
cd /home/jorge/projects/Lottery-Project/LottoWebApp
npm install --save-dev node-telegram-bot-api dotenv
```

### Paso 2: Crear tu bot (2 minutos)

1. Abre Telegram
2. Busca **@BotFather**
3. Envía `/newbot`
4. Nombre: `Claude Code Bot`
5. Username: `mi_claude_bot` (debe terminar en `_bot`)
6. **Copia el token** que te da

### Paso 3: Configurar variables (1 minuto)

Edita el archivo `.env` y agrega:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=TU_TOKEN_AQUI
TELEGRAM_CHAT_ID=TU_CHAT_ID_AQUI
```

**¿No sabes tu Chat ID?** Continúa al paso 4.

### Paso 4: Obtener Chat ID (1 minuto)

**Terminal 1** - Inicia el bot:
```bash
node .claude/telegram-bot.js
```

**Telegram** - Abre tu bot y envía:
```
/start
/chatid
```

El bot te responderá con tu Chat ID. **Cópialo** y agrégalo al `.env`.

**Presiona Ctrl+C** en la terminal para detener el bot.

### Paso 5: Actualiza el `.env` con tu Chat ID

```bash
TELEGRAM_CHAT_ID=417821897  # Reemplaza con tu Chat ID
```

### Paso 6: ¡Prueba! (1 minuto)

**Terminal 1** - Inicia el bot:
```bash
node .claude/telegram-bot.js
```

**Terminal 2** - Ejecuta el test:
```bash
node .claude/test-telegram.js
```

**Telegram** - Verás una pregunta. ¡Responde!

---

## ✅ Si Todo Funciona

Verás en la terminal:

```
✅ TEST COMPLETADO EXITOSAMENTE

📥 Respuesta recibida: ✅ Sí, funciona perfecto

🎉 ¡Excelente! El sistema funciona correctamente.
```

---

## 📖 Uso Rápido

### Desde Node.js

```javascript
const ClaudeTelegramClient = require('./.claude/claude-telegram-client');

const client = new ClaudeTelegramClient();
await client.initialize();

const answer = await client.askQuestion(
  '¿Tu pregunta?',
  [
    { label: 'Opción A', description: 'Descripción A' },
    { label: 'Opción B', description: 'Descripción B' }
  ]
);

console.log(answer.label); // "Opción A" o "Opción B"
```

### Desde Bash

```bash
./.claude/claude-telegram-ask.sh \
  "¿Tu pregunta?" \
  '[{"label":"A","description":"..."},{"label":"B","description":"..."}]'
```

---

## 🎯 Uso Real

### Ejemplo 1: Confirmar Deployment

```javascript
const answer = await client.askQuestion(
  '¿Deploy a producción?',
  [
    { label: 'Sí', description: 'Deploy ahora' },
    { label: 'No', description: 'Cancelar' }
  ]
);

if (answer.label === 'Sí') {
  await deployToProduction();
}
```

### Ejemplo 2: Elegir Tecnología

```javascript
const framework = await client.askQuestion(
  '¿Qué framework de testing?',
  [
    { label: 'Jest', description: 'Rápido y completo' },
    { label: 'Vitest', description: 'Compatible con Vite' }
  ]
);

await setupTesting(framework.label);
```

---

## ❌ Troubleshooting

### Error: "TELEGRAM_BOT_TOKEN no está configurado"

```bash
# Verifica .env
cat .env | grep TELEGRAM

# Si no está, agrégalo:
echo "TELEGRAM_BOT_TOKEN=tu_token" >> .env
echo "TELEGRAM_CHAT_ID=tu_chat_id" >> .env
```

### Error: "Timeout"

**Solución:**

1. Verifica que el bot esté corriendo:
   ```bash
   ps aux | grep telegram-bot
   ```

2. Si no está, inícialo:
   ```bash
   node .claude/telegram-bot.js
   ```

3. Responde a tiempo en Telegram (default: 5 minutos)

### Error: "Cannot find module"

```bash
npm install --save-dev node-telegram-bot-api dotenv
```

---

## 📚 Documentación Completa

Lee `TELEGRAM_BIDIRECCIONAL_SETUP.md` para:
- API completa
- Más ejemplos
- Integración con Claude Code
- Casos de uso avanzados

---

## 🎉 ¡Listo!

Ahora puedes:
- ✅ Hacer preguntas desde Claude Code
- ✅ Recibir notificaciones en Telegram
- ✅ Responder desde tu móvil
- ✅ Claude continúa con tu decisión

**¡Disfruta!** 🚀
