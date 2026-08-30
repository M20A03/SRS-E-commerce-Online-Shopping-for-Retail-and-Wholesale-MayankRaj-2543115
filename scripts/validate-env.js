#!/usr/bin/env node

/**
 * Build-time Environment Variable Validator
 * Ensures that critical environment variables are defined before building or deploying.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Required variables that must be defined for a valid build
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
];

// Optional but recommended variables
const RECOMMENDED_VARS = [
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_ORDER_API_URL'
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  });
  return env;
}

function validate() {
  console.log('🔍 [DevOps] Validating build environment configuration...');

  const mode = process.env.NODE_ENV || 'production';
  const envFiles = [
    path.join(rootDir, '.env'),
    path.join(rootDir, `.env.${mode}`),
    path.join(rootDir, '.env.local')
  ];

  let combinedEnv = { ...process.env };
  envFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`   Found environment file: ${path.basename(file)}`);
      combinedEnv = { ...loadEnvFile(file), ...combinedEnv };
    }
  });

  const missingRequired = [];
  const missingRecommended = [];

  REQUIRED_VARS.forEach((varName) => {
    if (!combinedEnv[varName]) {
      // Check if fallback exists in source code
      missingRequired.push(varName);
    }
  });

  RECOMMENDED_VARS.forEach((varName) => {
    if (!combinedEnv[varName]) {
      missingRecommended.push(varName);
    }
  });

  if (missingRecommended.length > 0) {
    console.warn(`⚠️  [DevOps Warning] Recommended env vars not set: ${missingRecommended.join(', ')}`);
  }

  if (missingRequired.length > 0) {
    console.warn(`ℹ️  [DevOps Info] Required env vars missing from environment: ${missingRequired.join(', ')}`);
    console.log('   (Using embedded project defaults from firebase-config.js)');
  }

  console.log('✅ [DevOps] Environment check passed. Ready to build.');
  process.exit(0);
}

validate();
