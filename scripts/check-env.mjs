import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const required = ['ADMIN_EMAIL', 'AUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'DATABASE_URL', 'BLOB_READ_WRITE_TOKEN'];
const missing = required.filter(key => !process.env[key]?.trim());
if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length < 32) missing.push('AUTH_SECRET (minimum 32 characters)');
if (missing.length) {
  console.error(`Missing or invalid configuration: ${missing.join(', ')}`); process.exitCode = 1;
} else console.log('Required keys are present. No values were printed. Live connections still need verification.');
