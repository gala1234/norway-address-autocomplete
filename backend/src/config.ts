import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 8080),

  // DATA_PATH: from environment or default to ./data/addresses.json
  DATA_PATH:
    process.env.DATA_PATH ??
    path.resolve(process.cwd(), 'data', 'addresses.json'),
};

export default config;
