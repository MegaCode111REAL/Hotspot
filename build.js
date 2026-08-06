#!/usr/bin/env node
/**
 * build.js
 * Generates hotspot.esm.js and the minified builds from hotspot.js / hotspot.css.
 * Run with: node build.js
 * Requires devDependencies: terser, clean-css-cli (npm install)
 */
const fs = require('fs');
const { execSync } = require('child_process');

const src = fs.readFileSync('hotspot.js', 'utf8');

// Pull out the body of the UMD factory function: everything from
// "'use strict';" down to just before the closing "return api;\n}));"
const startMarker = "'use strict';";
const endMarker = 'var api = {';
const apiCloseMarker = '};';

const startIdx = src.indexOf(startMarker) + startMarker.length;
const apiStartIdx = src.indexOf(endMarker);
const apiCloseIdx = src.indexOf(apiCloseMarker, apiStartIdx) + apiCloseMarker.length;

if (startIdx < 0 || apiStartIdx < 0 || apiCloseIdx < 0) {
  throw new Error('build.js: could not locate factory body markers in hotspot.js — check markers still match.');
}

// Body up through the `var api = {...};` block, but WITHOUT the UMD's
// trailing `return api;` (ESM uses `export` instead of a return value).
const factoryBody = src.slice(startIdx, apiCloseIdx);

const esmHeader =
`/*!
 * Hotspot v1.0.0 — ES module build
 * Auto-generated from hotspot.js by build.js — do not edit directly.
 * Apache 2.0 License
 */
`;

const esmFooter = `

export {
  configure,
  makeHotspot,
  updateHotspot,
  removeHotspot,
  clearHotspots,
  getHotspot,
  makePopup
};
export default api;
`;

const esmOutput = esmHeader + factoryBody + esmFooter;
fs.writeFileSync('hotspot.esm.js', esmOutput);
console.log('Built hotspot.esm.js');

try {
  execSync('npx terser hotspot.js -o hotspot.min.js --compress --mangle --comments "/^!/"', { stdio: 'inherit' });
  console.log('Built hotspot.min.js');

  execSync('npx cleancss -o hotspot.min.css hotspot.css', { stdio: 'inherit' });
  console.log('Built hotspot.min.css');
} catch (e) {
  console.warn('Minification skipped (terser/clean-css-cli not installed). Run: npm install --save-dev terser clean-css-cli');
}
