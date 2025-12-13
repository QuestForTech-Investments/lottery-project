#!/usr/bin/env node
/**
 * Database Reset Script
 *
 * Cleans the database and reseeds with minimal admin data.
 *
 * SAFETY: Only runs in DEV/STAGING environments.
 * Set ALLOW_DB_RESET=true and DB_ENV=dev|staging to execute.
 *
 * Usage:
 *   npm run db:reset
 *   # or
 *   ALLOW_DB_RESET=true DB_ENV=dev node db-reset.js
 */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  // Connection string from environment or default (dev)
  connectionString: process.env.DB_CONNECTION_STRING ||
    'Server=lottery-sql-1505.database.windows.net,1433;Initial Catalog=lottery-db;User ID=lotteryAdmin;Password=NewLottery2025;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;',

  // Safety flags
  allowReset: process.env.ALLOW_DB_RESET === 'true',
  environment: process.env.DB_ENV || 'unknown',

  // Allowed environments
  allowedEnvironments: ['dev', 'staging', 'development', 'test'],

  // Blocked environments (never allow reset)
  blockedEnvironments: ['prod', 'production', 'live'],
};

// =============================================================================
// Safety Checks
// =============================================================================

function performSafetyChecks() {
  console.log('');
  console.log('='.repeat(60));
  console.log('DATABASE RESET - SAFETY CHECKS');
  console.log('='.repeat(60));
  console.log('');

  // Check 1: ALLOW_DB_RESET flag
  if (!CONFIG.allowReset) {
    console.error('BLOCKED: ALLOW_DB_RESET is not set to "true"');
    console.error('');
    console.error('To enable reset, run:');
    console.error('  ALLOW_DB_RESET=true DB_ENV=dev npm run db:reset');
    console.error('');
    process.exit(1);
  }
  console.log('✓ ALLOW_DB_RESET=true');

  // Check 2: Environment
  const env = CONFIG.environment.toLowerCase();

  if (CONFIG.blockedEnvironments.includes(env)) {
    console.error(`BLOCKED: Cannot reset ${env.toUpperCase()} database!`);
    console.error('This operation is not allowed in production environments.');
    process.exit(1);
  }

  if (!CONFIG.allowedEnvironments.includes(env)) {
    console.error(`BLOCKED: Unknown environment "${env}"`);
    console.error(`Allowed environments: ${CONFIG.allowedEnvironments.join(', ')}`);
    console.error('');
    console.error('Set DB_ENV to one of the allowed values.');
    process.exit(1);
  }
  console.log(`✓ Environment: ${env}`);

  // Check 3: Connection string verification (no prod keywords)
  const connLower = CONFIG.connectionString.toLowerCase();
  const prodKeywords = ['prod', 'production', 'live'];

  for (const keyword of prodKeywords) {
    if (connLower.includes(keyword)) {
      console.error(`BLOCKED: Connection string contains "${keyword}"`);
      console.error('This might be a production database. Aborting.');
      process.exit(1);
    }
  }
  console.log('✓ Connection string checked (no prod keywords)');

  console.log('');
  console.log('All safety checks passed!');
  console.log('');
}

// =============================================================================
// Database Operations
// =============================================================================

async function executeReset() {
  console.log('Connecting to database...');

  const pool = await sql.connect(CONFIG.connectionString);

  try {
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'db-reset.sql'),
      'utf8'
    );

    console.log('Executing reset script...');
    console.log('');

    // Execute the script
    const result = await pool.request().query(sqlScript);

    // Print results
    if (result.recordsets && result.recordsets.length > 0) {
      console.log('');
      console.log('='.repeat(60));
      console.log('VERIFICATION RESULTS');
      console.log('='.repeat(60));

      result.recordsets.forEach((recordset, index) => {
        console.log('');
        console.log(`Result Set ${index + 1}:`);
        console.table(recordset);
      });
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('DATABASE RESET COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('');
    console.log('Admin credentials:');
    console.log('  Username: admin');
    console.log('  Password: Admin123456');
    console.log('  Betting Pool ID: 9');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('DATABASE RESET FAILED');
    console.error('='.repeat(60));
    console.error('');
    console.error('Error:', error.message);

    if (error.precedingErrors) {
      error.precedingErrors.forEach((e, i) => {
        console.error(`Preceding Error ${i + 1}:`, e.message);
      });
    }

    process.exit(1);
  } finally {
    await pool.close();
  }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           LOTTERY DATABASE RESET UTILITY                 ║');
  console.log('║                                                          ║');
  console.log('║  WARNING: This will DELETE all transactional data!      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // Perform safety checks
  performSafetyChecks();

  // Ask for confirmation in interactive mode
  if (process.stdin.isTTY) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question('Are you sure you want to reset the database? (type "RESET" to confirm): ', resolve);
    });
    rl.close();

    if (answer !== 'RESET') {
      console.log('');
      console.log('Reset cancelled.');
      process.exit(0);
    }
  }

  // Execute reset
  await executeReset();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
