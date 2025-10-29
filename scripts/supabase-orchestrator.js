#!/usr/bin/env node
/*
  Unified Supabase Scripts Orchestrator
  Usage:
    - npm run supabase:menu
    - npm run supabase:clean
    - npm run supabase:diagnostic
    - npm run supabase:fix-fk
    - npm run supabase:migrate-simple
*/

const { spawnSync } = require('child_process');
const path = require('path');

function runNodeScript(scriptRelPath, args = []) {
  const scriptPath = path.resolve(__dirname, scriptRelPath);
  const result = spawnSync(process.execPath, [scriptPath, ...args], { stdio: 'inherit' });
  process.exitCode = result.status || 0;
}

function runBatchScript(batchRelPath, args = []) {
  const isWin = process.platform === 'win32';
  const batchPath = path.resolve(__dirname, batchRelPath);
  if (!isWin) {
    console.log('This step is Windows-specific. Please open the .bat file manually:');
    console.log(batchPath);
    return;
  }
  const result = spawnSync('cmd.exe', ['/c', batchPath, ...args], { stdio: 'inherit' });
  process.exitCode = result.status || 0;
}

function showMenu() {
  console.log('\nBarConnect · Supabase Orchestrator');
  console.log('----------------------------------');
  console.log('Available commands:');
  console.log('  supabase:clean              -> Clean and seed database (scripts/clean-database.js)');
  console.log('  supabase:clean-transactional -> Clean only transactional data (database/clean-transactional-data.js)');
  console.log('  supabase:diagnostic         -> Run DB diagnostics (scripts/diagnostic-database.js)');
  console.log('  supabase:fix-fk             -> Fix foreign keys (scripts/fix-foreign-keys.js)');
  console.log('  supabase:migrate-simple     -> Open simple migration guide (scripts/migrate-simple.bat)');
  console.log('\nExamples:');
  console.log('  npm run supabase:clean-transactional  # Remove apenas vendas/transações');
  console.log('  npm run supabase:clean                # Limpa tudo e reseta');
  console.log('  npm run supabase:migrate-simple');
}

const cmd = process.argv[2];

switch (cmd) {
  case 'clean':
    runNodeScript('../scripts/clean-database.js');
    break;
  case 'clean-transactional':
    runNodeScript('../database/clean-transactional-data.js');
    break;
  case 'diagnostic':
    runNodeScript('../scripts/diagnostic-database.js');
    break;
  case 'fix-fk':
    runNodeScript('../scripts/fix-foreign-keys.js');
    break;
  case 'migrate-simple':
    runBatchScript('../scripts/migrate-simple.bat');
    break;
  case 'help':
  case undefined:
    showMenu();
    break;
  default:
    console.log(`Unknown command: ${cmd}`);
    showMenu();
}
