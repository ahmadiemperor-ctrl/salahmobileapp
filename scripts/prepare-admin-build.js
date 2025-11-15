import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const adminHtmlPath = path.join(distPath, 'admin.html');
const indexHtmlPath = path.join(distPath, 'index.html');
const indexBackupPath = path.join(distPath, 'index.html.backup');

console.log('Preparing admin-only build for Android...');

// Check if admin.html exists
if (!fs.existsSync(adminHtmlPath)) {
  console.error('Error: admin.html not found in dist folder. Run "npm run build" first.');
  process.exit(1);
}

// Backup original index.html if it exists
if (fs.existsSync(indexHtmlPath)) {
  console.log('Backing up original index.html...');
  fs.copyFileSync(indexHtmlPath, indexBackupPath);
}

// Replace index.html with admin.html
console.log('Replacing index.html with admin.html...');
fs.copyFileSync(adminHtmlPath, indexHtmlPath);

console.log('✓ Admin build prepared successfully!');
console.log('The Android app will now use the admin panel as the main entry point.');
