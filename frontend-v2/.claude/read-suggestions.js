#!/usr/bin/env node
/**
 * 📖 Script para que Claude Code lea sugerencias del usuario desde Telegram
 */

const fs = require('fs').promises;
const path = require('path');

const STATE_DIR = path.join(process.env.HOME, '.claude-telegram');
const SUGGESTIONS_FILE = path.join(STATE_DIR, 'suggestions.json');

async function readSuggestions() {
  try {
    // Leer archivo de sugerencias
    const content = await fs.readFile(SUGGESTIONS_FILE, 'utf8');
    const suggestions = JSON.parse(content);

    // Filtrar sugerencias no leídas
    const unread = Object.values(suggestions).filter(s => !s.read);

    if (unread.length === 0) {
      console.log('ℹ️  No hay sugerencias nuevas');
      return [];
    }

    console.log(`📬 ${unread.length} sugerencia(s) nueva(s):\n`);

    unread.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.timestamp}] ${s.username}:`);
      console.log(`   "${s.text}"\n`);
    });

    // Marcar como leídas
    for (const s of unread) {
      suggestions[s.id].read = true;
    }

    await fs.writeFile(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2));
    console.log('✅ Sugerencias marcadas como leídas');

    return unread;

  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('ℹ️  No hay archivo de sugerencias aún');
      return [];
    }
    throw err;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  readSuggestions().catch(console.error);
}

module.exports = readSuggestions;
