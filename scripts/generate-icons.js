const fs = require('fs');
const path = require('path');

// Simple PNG generator using Node.js Canvas API
// This creates simple placeholder icons with Sewaka branding

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate a simple PNG icon using Node.js
// We'll create a minimal valid PNG with the Sewaka brand colors
function generatePng(size) {
  // Create a simple 1x1 pixel PNG and scale it
  // This is a minimal PNG structure
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdrChunk = createChunk('IHDR', ihdrData, ihdrCrc);
  
  // Image data - solid color (#5B132B = 91, 19, 43)
  const rawData = Buffer.alloc(size * size * 4 + size + 1);
  rawData[0] = 0; // filter byte
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = 1 + y * (size * 4 + 1) + x * 4;
      // Create gradient effect
      const ratio = (x + y) / (size * 2);
      rawData[offset] = Math.floor(91 - ratio * 17);     // R
      rawData[offset + 1] = Math.floor(19 - ratio * 5);   // G
      rawData[offset + 2] = Math.floor(43 - ratio * 10);  // B
      rawData[offset + 3] = 255;                          // A
    }
  }
  
  // Compress with zlib
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  const idatChunk = createChunk('IDAT', compressed, idatCrc);
  
  // IEND chunk
  const iendCrc = crc32(Buffer.from('IEND'));
  const iendChunk = createChunk('IEND', Buffer.alloc(0), iendCrc);
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data, crc) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = getCrcTable();
  for (let i = 0; i < buf.length; i++) {
    crc = (crc ^ buf[i]) & 0xFFFFFFFF;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? table[(crc ^ buf[i]) & 0xFF] : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function getCrcTable() {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

// Generate all icon sizes
for (const size of sizes) {
  const png = generatePng(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Generated ${filename} (${size}x${size})`);
}

console.log('All icons generated successfully!');
