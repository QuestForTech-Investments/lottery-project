#!/usr/bin/env node
/**
 * Import Results Script
 * Imports lottery results from a JSON file to the local API
 *
 * Usage: node import-results.js [results-file.json]
 */

const fs = require('fs');
const path = require('path');

const config = {
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  username: process.env.API_USERNAME || 'admin',
  password: process.env.API_PASSWORD || 'Admin123456'
};

async function getToken() {
  const response = await fetch(`${config.apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: config.username, password: config.password })
  });

  if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
  const data = await response.json();
  return data.token;
}

async function getDraws(token) {
  const response = await fetch(`${config.apiUrl}/api/draws?pageSize=200`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error(`Get draws failed: ${response.status}`);
  const data = await response.json();
  return data.items || data;
}

async function getExistingResults(token, date) {
  const response = await fetch(`${config.apiUrl}/api/results?date=${date}&pageSize=200`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) throw new Error(`Get results failed: ${response.status}`);
  const data = await response.json();
  return data.items || data;
}

async function createResult(token, drawId, winningNumber, date) {
  const response = await fetch(`${config.apiUrl}/api/results`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ drawId, winningNumber, resultDate: date })
  });
  return response.ok ? 'created' : 'error';
}

async function updateResult(token, resultId, drawId, winningNumber, date) {
  const response = await fetch(`${config.apiUrl}/api/results/${resultId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ drawId, winningNumber, resultDate: date })
  });
  return response.ok ? 'updated' : 'error';
}

async function main() {
  const resultsFile = process.argv[2] || '/tmp/original-results.json';

  console.log('🎰 Import Results Script');
  console.log('='.repeat(50));

  // Load results file
  if (!fs.existsSync(resultsFile)) {
    console.error(`File not found: ${resultsFile}`);
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  console.log(`📂 Loaded ${results.length} results from ${path.basename(resultsFile)}`);

  // Get API token
  console.log('\n🔑 Authenticating...');
  const token = await getToken();
  console.log('✓ Authenticated');

  // Get draws for mapping
  console.log('\n📊 Loading draws...');
  const draws = await getDraws(token);
  const drawMap = {};
  draws.forEach(d => {
    if (d.isActive) {
      drawMap[d.drawName.toUpperCase()] = d.drawId;
      if (d.abbreviation) drawMap[d.abbreviation.toUpperCase()] = d.drawId;
    }
  });
  console.log(`✓ Loaded ${Object.keys(drawMap).length} draw mappings`);

  // Get existing results for today
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n📅 Checking existing results for ${today}...`);
  const existing = await getExistingResults(token, today);
  const existingMap = {};
  existing.forEach(r => { existingMap[r.drawId] = r; });
  console.log(`✓ Found ${existing.length} existing results`);

  // Process each result
  console.log('\n🔄 Processing results...');
  const stats = { created: 0, updated: 0, unchanged: 0, skipped: 0, errors: 0 };

  for (const result of results) {
    const drawId = drawMap[result.name.toUpperCase()];
    const winningNumber = `${result.first}${result.second}${result.third}`;

    if (!drawId) {
      console.log(`⚠️ No mapping: ${result.name}`);
      stats.skipped++;
      continue;
    }

    const existingResult = existingMap[drawId];
    let status;

    if (existingResult) {
      if (existingResult.winningNumber === winningNumber) {
        console.log(`- ${result.name}: ${winningNumber} (unchanged)`);
        stats.unchanged++;
      } else {
        status = await updateResult(token, existingResult.resultId, drawId, winningNumber, today);
        console.log(`${status === 'updated' ? '✓' : '✗'} ${result.name}: ${existingResult.winningNumber} -> ${winningNumber}`);
        stats[status === 'updated' ? 'updated' : 'errors']++;
      }
    } else {
      status = await createResult(token, drawId, winningNumber, today);
      console.log(`${status === 'created' ? '✓' : '✗'} ${result.name}: ${winningNumber} (new)`);
      stats[status === 'created' ? 'created' : 'errors']++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📈 Import Summary:');
  console.log(`   Created:   ${stats.created}`);
  console.log(`   Updated:   ${stats.updated}`);
  console.log(`   Unchanged: ${stats.unchanged}`);
  console.log(`   Skipped:   ${stats.skipped}`);
  console.log(`   Errors:    ${stats.errors}`);
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
