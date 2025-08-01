#!/usr/bin/env node

// 🚨 Emergency startup debug script - ES Module version
console.log('🔥 DEBUG: Starting ClickUp MCP Server debug mode...');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Arch:', process.arch);
console.log('CWD:', process.cwd());

console.log('\n📁 Checking file structure...');
import fs from 'fs';
import path from 'path';

try {
  const distExists = fs.existsSync('./dist');
  console.log('dist/ exists:', distExists);
  
  if (distExists) {
    const distFiles = fs.readdirSync('./dist');
    console.log('dist/ contents:', distFiles);
  }
  
  const indexExists = fs.existsSync('./dist/index.js');
  console.log('dist/index.js exists:', indexExists);
  
  console.log('\n🔧 Environment variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('SERVER_MODE:', process.env.SERVER_MODE);
  console.log('CLICKUP_PERSONAL_TOKEN:', process.env.CLICKUP_PERSONAL_TOKEN ? 'SET' : 'MISSING');
  
  console.log('\n🚀 Attempting to load main module...');
  // Use dynamic import for ES modules
  await import('./dist/index.js');
  
} catch (error) {
  console.error('💥 CRITICAL ERROR:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
