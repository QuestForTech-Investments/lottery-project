const fs = require('fs');
const path = process.argv[2];

if (!path) {
  console.log('Usage: node remove-console-logs.js <file>');
  process.exit(1);
}

const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
const result = [];
let removedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip lines that are only console.log statements (complete statement on one line)
  if (trimmed.startsWith('console.log(') && trimmed.endsWith(');')) {
    removedCount++;
    continue;
  }

  // Skip lines that are only console.log with template literals
  if (trimmed.startsWith('console.log(`') && trimmed.endsWith('`);')) {
    removedCount++;
    continue;
  }

  // Keep console.error, console.warn, and everything else
  result.push(line);
}

fs.writeFileSync(path, result.join('\n'));
console.log('Removed ' + removedCount + ' console.log lines from ' + path);
