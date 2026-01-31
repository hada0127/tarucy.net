/**
 * generate-textures.js
 * Pre-generate sign textures as PNG files for city scene
 *
 * Usage: node scripts/generate-textures.js
 * Requires: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../resource/img/signs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Neon colors (must match city-colors.js)
const neonColors = {
  pink: 0xff6b9d,
  cyan: 0x00ffff,
  yellow: 0xffff00,
  magenta: 0xff00ff,
  blue: 0x4d9fff,
  green: 0x39ff14
};

const neonPalette = [
  neonColors.pink, neonColors.cyan, neonColors.yellow,
  neonColors.magenta, neonColors.blue, neonColors.green
];

// Shop sign texts (18 items)
const shopSignTexts = [
  'Javascript', 'Typescript', 'PHP', 'Go', 'Python', 'JAVA', 'React', 'Vue', 'Svelte',
  'Hono', 'Nest.js', 'React Native', 'Electron', 'PostgreSQL', 'MySQL', 'MariaDB', 'Cloudflare', 'AWS'
];

// Vending machine texts
const vendingMachineSideTexts = [
  'github.com/hada0127',
  'tarucy@gmail.com'
];

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex) {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff
  };
}

/**
 * Generate shop sign texture
 */
function generateShopSignTexture(text, bgColor, index) {
  const width = 4.8 * 0.8 * 100; // signWidth * 100 = 384
  const height = 0.8 * 100;       // signHeight * 100 = 80
  const scale = 4;

  const canvas = createCanvas(width * scale, height * scale);
  const ctx = canvas.getContext('2d');

  // Darken background color (25% brightness)
  const rgb = hexToRgb(bgColor);
  const r = Math.floor(rgb.r * 0.25);
  const g = Math.floor(rgb.g * 0.25);
  const b = Math.floor(rgb.b * 0.25);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text settings
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate optimal font size
  let fontSize = canvas.height * 0.7;
  ctx.font = `bold ${fontSize}px Arial`;

  // Measure text and adjust if needed
  let textWidth = ctx.measureText(text).width;
  const maxWidth = canvas.width * 0.9;

  if (textWidth > maxWidth) {
    fontSize = fontSize * (maxWidth / textWidth);
    ctx.font = `bold ${fontSize}px Arial`;
  }

  // Draw text
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = `shop-${String(index).padStart(2, '0')}-${text.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
  console.log(`Generated: ${filename}`);

  return filename;
}

/**
 * Generate vending machine front texture (transparent bg, white text with black stroke)
 */
function generateVendingFrontTexture() {
  const width = 0.65 * 100; // 65
  const height = 0.25 * 100; // 25
  const scale = 8;

  const canvas = createCanvas(width * scale, height * scale);
  const ctx = canvas.getContext('2d');

  // Transparent background (already cleared)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Text settings
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate optimal font size for two lines
  let fontSize = canvas.height * 0.35;
  ctx.font = `bold ${fontSize}px Arial`;

  // Measure longest text and adjust to fit width
  const maxTextWidth = Math.max(
    ctx.measureText(vendingMachineSideTexts[0]).width,
    ctx.measureText(vendingMachineSideTexts[1]).width
  );
  const maxWidth = canvas.width * 0.9;

  if (maxTextWidth > maxWidth) {
    fontSize = fontSize * (maxWidth / maxTextWidth);
    ctx.font = `bold ${fontSize}px Arial`;
  }

  const lineHeight = fontSize * 1.2;
  const startY = canvas.height / 2 - lineHeight / 2;

  // Draw each line in white with black stroke
  vendingMachineSideTexts.forEach((text, i) => {
    const y = startY + i * lineHeight;

    // Black stroke
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = fontSize * 0.15;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, canvas.width / 2, y);

    // White fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, canvas.width / 2, y);
  });

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = 'vending-front.png';
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
  console.log(`Generated: ${filename}`);

  return filename;
}

/**
 * Generate phone booth flyer texture (white bg, black text)
 */
function generatePhoneBoothFlyerTexture() {
  const width = 0.35 * 100; // 35
  const height = 0.2 * 100; // 20
  const scale = 8;

  const canvas = createCanvas(width * scale, height * scale);
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text settings
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate optimal font size for two lines
  let fontSize = canvas.height * 0.3;
  ctx.font = `bold ${fontSize}px Arial`;

  // Measure longest text and adjust to fit width
  const maxTextWidth = Math.max(
    ctx.measureText(vendingMachineSideTexts[0]).width,
    ctx.measureText(vendingMachineSideTexts[1]).width
  );
  const maxWidth = canvas.width * 0.9;

  if (maxTextWidth > maxWidth) {
    fontSize = fontSize * (maxWidth / maxTextWidth);
    ctx.font = `bold ${fontSize}px Arial`;
  }

  const lineHeight = fontSize * 1.3;
  const startY = canvas.height / 2 - lineHeight / 2;

  // Draw each line in black
  vendingMachineSideTexts.forEach((text, i) => {
    const y = startY + i * lineHeight;
    ctx.fillStyle = '#000000';
    ctx.fillText(text, canvas.width / 2, y);
  });

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = 'phone-flyer.png';
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
  console.log(`Generated: ${filename}`);

  return filename;
}

/**
 * Generate hotel sign texture (cursive white text with dark pink stroke)
 */
function generateHotelSignTexture() {
  const canvas = createCanvas(512, 128);
  const ctx = canvas.getContext('2d');

  // Clear canvas (transparent)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Text settings - using a readable font (canvas doesn't have cursive by default)
  // We'll use italic style to simulate cursive
  ctx.font = 'italic 72px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw text stroke (border) in darker pink color
  ctx.strokeStyle = '#9b4055';
  ctx.lineWidth = 12;
  ctx.lineJoin = 'round';
  ctx.strokeText('Hada0127', canvas.width / 2, canvas.height / 2);

  // Draw text fill in white
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Hada0127', canvas.width / 2, canvas.height / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filename = 'hotel-sign.png';
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
  console.log(`Generated: ${filename}`);

  return filename;
}

// Main execution
console.log('Generating sign textures...\n');
console.log(`Output directory: ${OUTPUT_DIR}\n`);

// Generate shop signs (18)
console.log('--- Shop Signs (18) ---');
const shopFiles = [];
for (let i = 0; i < shopSignTexts.length; i++) {
  // Upper row uses palette indices 0-5, lower row uses (i+3)%6
  let colorIndex;
  if (i < 9) {
    colorIndex = i % 6;
  } else {
    colorIndex = ((i - 9) + 3) % 6;
  }
  const filename = generateShopSignTexture(shopSignTexts[i], neonPalette[colorIndex], i);
  shopFiles.push({ text: shopSignTexts[i], filename, colorIndex });
}

// Generate vending machine texture
console.log('\n--- Vending Machine ---');
generateVendingFrontTexture();

// Generate phone booth flyer
console.log('\n--- Phone Booth Flyer ---');
generatePhoneBoothFlyerTexture();

// Generate hotel sign
console.log('\n--- Hotel Sign ---');
generateHotelSignTexture();

console.log('\n=== All textures generated! ===');

// Generate a mapping file for reference
const mapping = {
  shopSigns: shopFiles,
  vendingFront: 'vending-front.png',
  phoneFlyer: 'phone-flyer.png',
  hotelSign: 'hotel-sign.png'
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'texture-mapping.json'),
  JSON.stringify(mapping, null, 2)
);
console.log('\nGenerated texture-mapping.json');
