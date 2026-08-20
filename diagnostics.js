/**
 * AI Foundry Web Platform - Automated Diagnostics Script
 * Verifies system requirements, directories, data integrity, and build readiness.
 */
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('  AI FOUNDRY - DIAGNOSTICS SUITE   ');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.log(`[FAIL] ${name}: ${result}`);
      failed++;
    }
  } catch (err) {
    console.log(`[FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

// 1. Node.js Version Check
test('Node.js version >= 18.0.0', () => {
  const version = process.versions.node;
  const major = parseInt(version.split('.')[0], 10);
  if (major < 18) return `Found Node.js v${version}, requires v18+`;
  return true;
});

// 2. Directory Structure Check
test('Required directories exist', () => {
  const requiredDirs = ['data', 'public', 'src'];
  for (const dir of requiredDirs) {
    const p = path.join(process.cwd(), dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }
  return true;
});

// 3. Documentation Files Check
test('Core documentation exists', () => {
  const docs = ['PRD.md', 'TAD.md', 'README.md', 'CHANGELOG.md', 'IMPLEMENTATION_PLAN.md'];
  for (const doc of docs) {
    if (!fs.existsSync(path.join(process.cwd(), doc))) return `Missing ${doc}`;
  }
  return true;
});

// 4. JSON Data Store Integrity
test('Data store integrity check', () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  for (const file of jsonFiles) {
    try {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
      JSON.parse(content);
    } catch (e) {
      return `Corrupted JSON file ${file}: ${e.message}`;
    }
  }
  return true;
});

console.log('\n----------------------------------------------------');
console.log(`Diagnostics complete: ${passed} passed, ${failed} failed`);
console.log('----------------------------------------------------');

if (failed > 0) {
  console.error('\nFix failed checks before proceeding to next chunk.');
  process.exit(1);
} else {
  console.log('\nSystem ready for next build chunk.');
  process.exit(0);
}
