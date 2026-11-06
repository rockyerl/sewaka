const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

for (const size of sizes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#5B132B"/>
  <text x="${size / 2}" y="${Math.round(size * 0.62)}" font-family="Georgia, serif" font-size="${Math.round(size * 0.5)}" font-weight="bold" fill="#D4AF37" text-anchor="middle">S</text>
</svg>`;
  
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg, 'utf-8');
  console.log(`✅ Created ${filename}`);
}

console.log('\n🎉 All icons generated!');
