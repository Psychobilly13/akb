const {resolve} = require('path');

const dotenvFileName = '.env';

const dotenvFilePath = resolve(process.cwd(), dotenvFileName);

require('dotenv').config({
  path: dotenvFilePath,
  override: true,
});

function env(key, placeholder) {
  const value = process.env[key];

  if (!value) {
    if (placeholder) {
      return placeholder;
    }

    throw new Error(`env.${key}.notFound`);
  }

  return value;
}

module.exports = env;
