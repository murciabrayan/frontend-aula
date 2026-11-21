const fs = require('node:fs');
const path = require('node:path');
module.exports = (project, configuredOrigin) => {
  let origin = configuredOrigin ?? process.env.AULA_API_ORIGIN ?? process.env.VITE_API_URL;
  // Only read this public configuration key; never copy other env values.
  if (origin === undefined) {
    origin = '';
    for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
      const file = path.join(project, name);
      if (!fs.existsSync(file)) continue;
      const match = fs.readFileSync(file, 'utf8').match(/^\s*(?:export\s+)?VITE_API_URL\s*=\s*([^\r\n]*)/m);
      if (match) origin = match[1].trim().replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  if (origin && (!/^https?:\/\//.test(origin) || new URL(origin).username || new URL(origin).password)) throw Error('VITE_API_URL must be a public HTTP(S) API origin.');
  return `'use strict';\nwindow.AULA_CONFIG = ${JSON.stringify({ apiOrigin: origin.replace(/\/+$/, '') })};\n`;
};
