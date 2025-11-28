#!/usr/bin/env node
/**
 * 🧪 Script de Prueba - Telegram Bidireccional
 *
 * Prueba básica del sistema de preguntas vía Telegram
 *
 * Uso:
 *   node .claude/test-telegram.js
 */

const ClaudeTelegramClient = require('./claude-telegram-client.cjs');

console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('🧪 TEST: Telegram Bidireccional para Claude Code');
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
    console.error('💡 Para obtener tu Chat ID:');
    console.error('   1. Inicia el bot: node .claude/telegram-bot.js');
    console.error('   2. Envía /chatid en Telegram');
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

    console.log('════════════════════════════════════════════════════════════');
    console.log('📤 ENVIANDO PREGUNTA DE PRUEBA');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Revisa tu Telegram para responder');
    console.log('');

    const answer = await client.askQuestion(
      '¿Funciona el sistema de Telegram Bidireccional?',
      [
        {
          label: '✅ Sí, funciona perfecto',
          description: 'El sistema está funcionando correctamente'
        },
        {
          label: '⚠️ Funciona con problemas',
          description: 'Hay algunos problemas menores'
        },
        {
          label: '❌ No funciona',
          description: 'El sistema tiene errores'
        }
      ],
      120000 // 2 minutos timeout
    );

    console.log('');
    console.log('════════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETADO EXITOSAMENTE');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📥 Respuesta recibida: ${answer.label}`);
    console.log(`📝 Descripción: ${answer.description}`);
    console.log('');

    if (answer.label.includes('✅')) {
      console.log('🎉 ¡Excelente! El sistema funciona correctamente.');
    } else if (answer.label.includes('⚠️')) {
      console.log('⚠️  Hay algunos problemas. Revisa los logs del bot.');
    } else {
      console.log('❌ El sistema tiene errores. Revisa la configuración.');
    }

    console.log('');
    console.log('💡 Próximos pasos:');
    console.log('   • Lee TELEGRAM_BIDIRECCIONAL_SETUP.md para más ejemplos');
    console.log('   • Prueba desde scripts bash con .claude/claude-telegram-ask.sh');
    console.log('   • Integra en tus hooks de Claude Code');
    console.log('');

  } catch (err) {
    console.error('');
    console.error('════════════════════════════════════════════════════════════');
    console.error('❌ TEST FALLIDO');
    console.error('════════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', err.message);
    console.error('');

    if (err.message.includes('Timeout')) {
      console.error('💡 Posibles causas:');
      console.error('   • El bot no está ejecutándose');
      console.error('   • No respondiste a tiempo');
      console.error('   • Chat ID incorrecto');
      console.error('');
      console.error('🔧 Solución:');
      console.error('   1. Verifica que el bot esté corriendo:');
      console.error('      ps aux | grep telegram-bot');
      console.error('');
      console.error('   2. Si no está corriendo, inícialo:');
      console.error('      node .claude/telegram-bot.js');
      console.error('');
      console.error('   3. Vuelve a ejecutar este test:');
      console.error('      node .claude/test-telegram.js');
      console.error('');
    }

    process.exit(1);
  }
}

// Ejecutar test
runTest();
