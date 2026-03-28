const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get count of commits and add 1 for the commit currently being created
  const count = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10) + 1;
  const version = `0.${count}`;
  
  // Write it to lib/version.ts
  const versionFilePath = path.join(__dirname, '..', 'lib', 'version.ts');
  fs.writeFileSync(versionFilePath, `export const APP_VERSION = 'V${version}';\n`);
  
  console.log(`[Version Tracker] Updated application version to V${version}`);
} catch (e) {
  console.error('[Version Tracker] Failed to update version', e);
}
