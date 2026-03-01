#!/usr/bin/env node

/**
 * Favicon Generation Script
 * Converts favicon.svg to various formats using sharp library
 * 
 * Requirements:
 * - npm install sharp
 * - Node.js 14+
 * 
 * Usage:
 * npm install sharp
 * node generate-favicons.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Favicon Generation Guide');
console.log('=====================================\n');

console.log('To generate all favicon formats, you can use online tools or the following approaches:\n');

console.log('1️⃣ Online Favicon Generators:');
console.log('   - Website: https://realfavicongenerator.net/');
console.log('   - Upload: public/favicon.svg');
console.log('   - Download all formats to public/ folder\n');

console.log('2️⃣ Using ImageMagick (if installed):');
console.log('   convert public/favicon.svg -resize 16x16 public/favicon-16x16.png');
console.log('   convert public/favicon.svg -resize 32x32 public/favicon-32x32.png');
console.log('   convert public/favicon.svg -resize 180x180 public/apple-touch-icon-180x180.png');
console.log('   convert public/favicon.svg -resize 152x152 public/apple-touch-icon-152x152.png');
console.log('   convert public/favicon.svg -resize 144x144 public/favicon-144x144.png\n');

console.log('3️⃣ Using Node.js sharp library:');
console.log('   npm install sharp');
console.log('   node generate-favicons.js\n');

console.log('📋 Required Favicon Files:');
const requiredFiles = [
  'public/favicon.svg - SVG favicon (scalable)',
  'public/favicon.ico - ICO format for browsers',
  'public/favicon-16x16.png - 16x16 PNG',
  'public/favicon-32x32.png - 32x32 PNG',
  'public/apple-touch-icon.png - 180x180 PNG for iOS',
  'public/apple-touch-icon-180x180.png - iOS home screen',
  'public/apple-touch-icon-152x152.png - iPad home screen',
  'public/favicon-144x144.png - Windows tiles'
];

requiredFiles.forEach((file, i) => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
});

console.log('\n🚀 Next Steps:');
console.log('1. Generate favicon files using one of the methods above');
console.log('2. Place them in the public/ folder');
console.log('3. Run: npm run build');
console.log('4. Deploy to production\n');

console.log('📝 Favicon already in place:');
const svgPath = path.join(__dirname, 'public/favicon.svg');
if (fs.existsSync(svgPath)) {
  console.log('✅ public/favicon.svg - Modern browser fallback ready\n');
} else {
  console.log('❌ public/favicon.svg - NOT FOUND\n');
}

console.log('💡 Quick Solutions:');
console.log('Option A: Use Real Favicon Generator');
console.log('  1. Visit: https://realfavicongenerator.net/');
console.log('  2. Upload public/favicon.svg');
console.log('  3. Generate');
console.log('  4. Download and extract to public/ folder\n');

console.log('Option B: Use Online PNG Converter');
console.log('  1. Upload favicon.svg to https://convertio.co/svg-png/');
console.log('  2. Generate different sizes');
console.log('  3. Download and place in public/ folder\n');

console.log('Option C: If sharp is installed, run:');
console.log('  npx sharp-cli public/favicon.svg -o public/favicon-32x32.png');
