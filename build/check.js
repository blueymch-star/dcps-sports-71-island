const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptMatches = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log('Found scripts:', scriptMatches.length);

let passed = true;
scriptMatches.forEach((s, idx) => {
  const code = s.replace(/<script\b[^>]*>/i, '').replace(/<\/script>/i, '');
  if (!code.trim()) return;
  if (s.includes('type="importmap"')) {
    try {
      JSON.parse(code);
      console.log(`Script ${idx} (importmap): Valid JSON`);
    } catch (err) {
      console.error(`Script ${idx} (importmap) JSON error:`, err.message);
      passed = false;
    }
    return;
  }
  const isModule = s.includes('type="module"');
  if (isModule) {
    const testFile = path.join(__dirname, `_test_mod_${idx}.mjs`);
    fs.writeFileSync(testFile, code, 'utf8');
    const { execSync } = require('child_process');
    try {
      execSync(`node -c "${testFile}"`);
      console.log(`Script ${idx} (ES Module): Valid Syntax`);
    } catch (err) {
      console.error(`Script ${idx} (ES Module) Syntax Error:`, err.message);
      passed = false;
    } finally {
      if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    }
  } else {
    try {
      new Function(code);
      console.log(`Script ${idx} (Classic Script): Valid Syntax`);
    } catch (err) {
      console.error(`Script ${idx} (Classic Script) Syntax Error:`, err.message);
      passed = false;
    }
  }
});

if (passed) {
  console.log('ALL SCRIPTS CHECK PASSED! index.html is fully healthy.');
} else {
  process.exit(1);
}
