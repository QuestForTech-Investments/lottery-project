#!/usr/bin/env node
/**
 * 🧪 Script de Prueba - Envío de Markdown a Telegram
 *
 * Prueba básica del sistema de envío de mensajes markdown
 *
 * Uso:
 *   node .claude/test-telegram-send.cjs
 */

const ClaudeTelegramClient = require('./claude-telegram-client.cjs');
const path = require('path');

console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('🧪 TEST: Envío de Markdown a Telegram');
console.log('════════════════════════════════════════════════════════════');
console.log('');

async function runTest() {
  console.log('📝 Verificando configuración...');
  console.log('');

  // Verificar variables de entorno
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ ERROR: TELEGRAM_BOT_TOKEN no está configurado');
    console.error('');
    console.error('💡 Configúralo en .env:');
    console.error('   TELEGRAM_BOT_TOKEN=tu_token');
    console.error('');
    process.exit(1);
  }

  if (!process.env.TELEGRAM_CHAT_ID) {
    console.error('❌ ERROR: TELEGRAM_CHAT_ID no está configurado');
    console.error('');
    console.error('💡 Configúralo en .env:');
    console.error('   TELEGRAM_CHAT_ID=tu_chat_id');
    console.error('');
    process.exit(1);
  }

  console.log(`✅ TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 20)}...`);
  console.log(`✅ TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID}`);
  console.log('');

  console.log('🔧 Inicializando cliente...');
  const client = new ClaudeTelegramClient();

  try {
    await client.initialize();
    console.log('');

    // Test 1: Mensaje simple
    console.log('════════════════════════════════════════════════════════════');
    console.log('📤 TEST 1: Mensaje Simple');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');

    const simpleMessage = `
🎉 **¡Hola desde Claude Code!**

Este es un mensaje de prueba con formato *Markdown*.

**Características:**
- ✅ Texto en **negrita**
- ✅ Texto en *cursiva*
- ✅ Emojis 🚀
- ✅ Listas con viñetas

\`\`\`javascript
// También código
console.log('¡Funciona!');
\`\`\`

_Enviado con el sistema de Telegram Bidireccional_
`;

    await client.sendMarkdown(simpleMessage);

    console.log('⏳ Esperando 5 segundos para ver el mensaje...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 2: Enviar archivo .md
    console.log('');
    console.log('════════════════════════════════════════════════════════════');
    console.log('📤 TEST 2: Enviar Archivo .md');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');

    const testFilePath = path.join(__dirname, '..', 'TELEGRAM_QUICK_START.md');

    await client.sendMarkdown(testFilePath, {
      isFile: true,
      maxLength: 4000  // Telegram permite max 4096, dejamos margen
    });

    console.log('⏳ Esperando 5 segundos para ver el archivo...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test 3: Mensaje largo (multi-parte)
    console.log('');
    console.log('════════════════════════════════════════════════════════════');
    console.log('📤 TEST 3: Mensaje Largo (Multi-parte)');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');

    const longMessage = `
# 📋 Reporte de Test - Parte Larga

${Array(100).fill('Esta es una línea de prueba con texto suficiente para generar un mensaje largo. ').join('\n')}

## Conclusión

Este mensaje fue dividido automáticamente en múltiples partes.
`;

    await client.sendMarkdown(longMessage, {
      splitLong: true,
      maxLength: 2000  // Forzar división
    });

    console.log('');
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ TODOS LOS TESTS COMPLETADOS');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📱 Revisa tu Telegram para ver los mensajes');
    console.log('');
    console.log('💡 Próximos pasos:');
    console.log('   • Integra sendMarkdown() en tus scripts');
    console.log('   • Envía reportes automáticos a Telegram');
    console.log('   • Notifica cuando completes tareas importantes');
    console.log('');

  } catch (err) {
    console.error('');
    console.error('════════════════════════════════════════════════════════════');
    console.error('❌ TEST FALLIDO');
    console.error('════════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', err.message);
    console.error('');

    if (err.message.includes('ENOENT')) {
      console.error('💡 Archivo no encontrado. Verifica la ruta.');
      console.error('');
    } else {
      console.error('💡 Posibles causas:');
      console.error('   • El bot no está ejecutándose');
      console.error('   • Token o Chat ID incorrectos');
      console.error('   • Problema de permisos en archivos');
      console.error('');
      console.error('🔧 Solución:');
      console.error('   1. Verifica que el bot esté corriendo:');
      console.error('      ps aux | grep telegram-bot');
      console.error('');
      console.error('   2. Si no está corriendo, inícialo:');
      console.error('      node .claude/telegram-bot.cjs');
      console.error('');
    }

    process.exit(1);
  }
}

// Ejecutar test
runTest();
