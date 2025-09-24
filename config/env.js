const fs = require('fs');
const path = require('path');

let loaded = false;

function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }
  const delimiterIndex = trimmed.indexOf('=');
  if (delimiterIndex === -1) {
    return null;
  }
  const key = trimmed.slice(0, delimiterIndex).trim();
  let value = trimmed.slice(delimiterIndex + 1).trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadEnv() {
  if (loaded) {
    return;
  }

  const envPath = path.resolve(__dirname, '..', '.env');
  if (!process.env.SKIP_DOTENV && fs.existsSync(envPath)) {
    const contents = fs.readFileSync(envPath, 'utf8');
    contents
      .split(/\r?\n/)
      .map(parseLine)
      .filter(Boolean)
      .forEach(({ key, value }) => {
        if (typeof process.env[key] === 'undefined') {
          process.env[key] = value;
        }
      });
  }

  loaded = true;
}

module.exports = {
  loadEnv,
};
