const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const storiesDir = __dirname;
const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.html') && f !== 'index.html');

console.log(`\n========================================`);
console.log(`🔍 1. Validating ${files.length} Web Stories with AMP Validator`);
console.log(`========================================\n`);

const fileArgs = files.map(f => `"${f}"`).join(' ');

try {
  const stdout = execSync(`npx --yes amphtml-validator ${fileArgs}`, {
    cwd: storiesDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  console.log(stdout.trim());
} catch (err) {
  console.error((err.stdout || '') + (err.stderr || err.message));
  console.error('\n❌ Some Web Stories failed AMP validation.');
  process.exit(1);
}

console.log(`\n========================================`);
console.log(`🔍 2. Verifying Google Search & Discover Metadata`);
console.log(`========================================\n`);

let metaErrors = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(storiesDir, file), 'utf8');
  const issues = [];

  if (!content.includes('rel="canonical"')) issues.push('Missing canonical tag');
  if (!content.includes('property="og:title"')) issues.push('Missing og:title');
  if (!content.includes('property="og:image"')) issues.push('Missing og:image');
  if (!content.includes('name="twitter:card"')) issues.push('Missing twitter:card');
  if (!content.includes('max-image-preview:large')) issues.push('Missing max-image-preview:large');
  if (!content.includes('application/ld+json')) issues.push('Missing Schema.org JSON-LD');

  const titleMatch = content.match(/<amp-story[^>]*\btitle="([^"]+)"/);
  if (!titleMatch) {
    issues.push('Missing amp-story title attribute');
  } else if (titleMatch[1].length > 70) {
    issues.push(`amp-story title too long (${titleMatch[1].length} > 70 chars)`);
  }

  if (issues.length > 0) {
    metaErrors++;
    console.error(`❌ [FAIL] ${file}: ${issues.join(', ')}`);
  } else {
    console.log(`✅ [PASS] ${file}`);
  }
}

console.log('\n----------------------------------------');
if (metaErrors === 0) {
  console.log(`🎉 100% SUCCESS: All ${files.length} Web Stories strictly follow Google Web Stories Appearance guidelines!\n`);
  process.exit(0);
} else {
  console.error(`⚠️ Found ${metaErrors} files with metadata issues.`);
  process.exit(1);
}
