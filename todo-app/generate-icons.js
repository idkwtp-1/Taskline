import fs from 'fs';
import path from 'path';

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple valid 1x1 blue PNG inflated/padded or a lightweight generated PNG data URI
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(base64Png, 'base64');

fs.writeFileSync(path.resolve('public/icons/pwa-192x192.png'), pngBuffer);
fs.writeFileSync(path.resolve('public/icons/pwa-512x512.png'), pngBuffer);
fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), pngBuffer);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="24" fill="#4C8EFF"/>
  <path d="M30 50L45 65L72 35" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync(path.resolve('public/favicon.svg'), svgContent);
console.log('Icons generated successfully.');
