/**
 * city-shop.js
 * Hong Kong Citypop Night City - Shopping District & Vendor System
 *
 * Contains:
 * - Shop buildings with neon borders
 * - Vertical neon signs
 * - Shopping district layout (16 shops)
 * - Vendor stalls
 * - Standing signs
 */

import * as THREE from 'three';
import { colors, randomColor } from './city-colors.js';

// Sign texts for shops (18 items total)
const shopSignTexts = [
  // Upper row (9 shops)
  'Javascript', 'Typescript', 'PHP', 'Go', 'Python', 'JAVA', 'React', 'Vue', 'Svelte',
  // Lower row (9 shops)
  'Hono', 'Nest.js', 'React Native', 'Electron', 'PostgreSQL', 'MySQL', 'MariaDB', 'Cloudflare', 'AWS'
];

/**
 * Create a canvas texture with text for shop signs
 */
function createShopSignTexture(text, width, height, bgColor) {
  const canvas = document.createElement('canvas');
  const scale = 4; // Higher resolution
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');

  // Darken background color for better text visibility
  const r = Math.floor(((bgColor >> 16) & 0xff) * 0.25);
  const g = Math.floor(((bgColor >> 8) & 0xff) * 0.25);
  const b = Math.floor((bgColor & 0xff) * 0.25);
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text settings
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate optimal font size
  let fontSize = canvas.height * 0.7;
  ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

  // Measure text and adjust if needed
  let textWidth = ctx.measureText(text).width;
  const maxWidth = canvas.width * 0.9;

  if (textWidth > maxWidth) {
    fontSize = fontSize * (maxWidth / textWidth);
    ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  }

  // Draw text
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ============================================
// Shop Buildings
// ============================================

/**
 * Create a shop building with neon border
 * @param {boolean} config.skipText - If true, skip text panel (for GLB export)
 */
export function createShopBuilding(scene, x, z, groundY, config = {}) {
  const group = new THREE.Group();

  const width = config.width || 5;
  const depth = config.depth || 4;
  const height = config.height || (4 + Math.random() * 3);
  const neonColor = config.neonColor || colors.neon.pink;

  // Building body
  const buildingGeom = new THREE.BoxGeometry(width, height, depth);
  const buildingMat = new THREE.MeshBasicMaterial({ color: randomColor(colors.building) });
  const building = new THREE.Mesh(buildingGeom, buildingMat);
  building.position.y = height/2;
  group.add(building);


  // Shop entrance door (ground level)
  const doorWidth = 1.5;
  const doorHeight = 2.2;
  const doorMat = new THREE.MeshBasicMaterial({ color: 0x1a1a25 });
  const doorGeom = new THREE.PlaneGeometry(doorWidth, doorHeight);
  const door = new THREE.Mesh(doorGeom, doorMat);
  door.position.set(0, doorHeight/2, -depth/2 - 0.01);
  group.add(door);

  // Door frame with neon color
  const doorFrameMat = new THREE.MeshBasicMaterial({ color: neonColor });
  const doorFrameTop = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + 0.2, 0.1, 0.1), doorFrameMat);
  doorFrameTop.position.set(0, doorHeight + 0.05, -depth/2 - 0.05);
  group.add(doorFrameTop);
  const doorFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorHeight, 0.1), doorFrameMat);
  doorFrameLeft.position.set(-doorWidth/2 - 0.05, doorHeight/2, -depth/2 - 0.05);
  group.add(doorFrameLeft);
  const doorFrameRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorHeight, 0.1), doorFrameMat);
  doorFrameRight.position.set(doorWidth/2 + 0.05, doorHeight/2, -depth/2 - 0.05);
  group.add(doorFrameRight);

  // Door handle
  const handleGeom = new THREE.BoxGeometry(0.08, 0.3, 0.05);
  const handleMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
  const handle = new THREE.Mesh(handleGeom, handleMat);
  handle.position.set(doorWidth/2 - 0.2, doorHeight/2, -depth/2 - 0.02);
  group.add(handle);

  // Shop awning (colorful)
  const awningGeom = new THREE.BoxGeometry(width + 0.5, 0.2, 1.2);
  const awningMat = new THREE.MeshBasicMaterial({ color: neonColor });
  const awning = new THREE.Mesh(awningGeom, awningMat);
  awning.position.set(0, 2.8, -depth/2 - 0.5);
  group.add(awning);

  // Horizontal sign above awning (raised for better visibility)
  const signBgGeom = new THREE.BoxGeometry(width * 0.9, 1.0, 0.15);
  const signBgMat = new THREE.MeshBasicMaterial({ color: 0x151520 });
  const signBg = new THREE.Mesh(signBgGeom, signBgMat);
  signBg.position.set(0, 4.0, -depth/2 - 0.6);
  group.add(signBg);

  const signWidth = width * 0.8;
  const signHeight = 0.8;

  // Create sign panel - with or without text based on skipText flag
  if (!config.skipText && config.signText) {
    // Dynamic creation with canvas texture
    const signPanelGeom = new THREE.BoxGeometry(signWidth, signHeight, 0.18);
    const texture = createShopSignTexture(config.signText, signWidth * 100, signHeight * 100, neonColor);
    const signPanelMat = new THREE.MeshBasicMaterial({ map: texture });
    const signPanel = new THREE.Mesh(signPanelGeom, signPanelMat);
    signPanel.position.set(0, 4.0, -depth/2 - 0.62);
    group.add(signPanel);
  } else {
    // GLB export: solid color panel (text will be added dynamically later)
    const signPanelGeom = new THREE.BoxGeometry(signWidth, signHeight, 0.18);
    const signPanelMat = new THREE.MeshBasicMaterial({ color: neonColor });
    const signPanel = new THREE.Mesh(signPanelGeom, signPanelMat);
    signPanel.position.set(0, 4.0, -depth/2 - 0.62);
    group.add(signPanel);
  }

  // Display window (showcase) on ground floor sides of door
  const showcaseGeom = new THREE.PlaneGeometry(1.2, 1.8);
  const showcaseMat = new THREE.MeshBasicMaterial({ color: 0x2080a0, transparent: true, opacity: 0.7 });
  const showcaseLeft = new THREE.Mesh(showcaseGeom, showcaseMat);
  showcaseLeft.position.set(-width/2 + 0.8, 1.2, -depth/2 - 0.01);
  group.add(showcaseLeft);
  const showcaseRight = new THREE.Mesh(showcaseGeom, showcaseMat);
  showcaseRight.position.set(width/2 - 0.8, 1.2, -depth/2 - 0.01);
  group.add(showcaseRight);

  group.position.set(x, groundY, z);
  group.userData.buildingSize = { width, depth, height };
  group.userData.shopConfig = { width, depth, neonColor, signText: config.signText };
  scene.add(group);
  return group;
}

// ============================================
// Vertical Signs
// ============================================

/**
 * Create vertical neon sign (standing sign)
 */
export function createVerticalSign(scene, x, z, groundY) {
  const group = new THREE.Group();
  const neonColors = Object.values(colors.neon);
  const color = neonColors[Math.floor(Math.random() * neonColors.length)];

  // Pole
  const poleGeom = new THREE.CylinderGeometry(0.08, 0.1, 6, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x454555 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = 3;
  group.add(pole);

  // Sign panel
  const signGeom = new THREE.BoxGeometry(0.8, 4, 0.15);
  const signMat = new THREE.MeshBasicMaterial({ color: color });
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(0.5, 4, 0);
  group.add(sign);

  // Sign background
  const bgGeom = new THREE.BoxGeometry(1, 4.2, 0.2);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x151520 });
  const bg = new THREE.Mesh(bgGeom, bgMat);
  bg.position.set(0.5, 4, 0.1);
  group.add(bg);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

// ============================================
// Shopping District
// ============================================

// Store shop positions for dynamic text addition
const shopPositions = [];

/**
 * Create all shopping district buildings (for GLB export - no text)
 */
export function createShoppingDistrictBase(scene) {
  const shops = [];
  const groundY = 0;
  const neonPalette = [
    colors.neon.pink, colors.neon.cyan, colors.neon.yellow,
    colors.neon.magenta, colors.neon.blue, colors.neon.green
  ];

  shopPositions.length = 0; // Clear previous

  // Upper row shops (9 shops at z=13, closer to stairs)
  const upperStartX = -19;
  for (let i = 0; i < 9; i++) {
    const x = upperStartX + i * 5.2;
    const z = 13;
    const width = 4.8;
    const depth = 4;
    const height = 5 + Math.random() * 2;
    const neonColor = neonPalette[i % neonPalette.length];

    const shop = createShopBuilding(scene, x, z, groundY, {
      width, depth, height, neonColor,
      skipText: true // No canvas texture for GLB
    });
    shops.push(shop);

    // Store position info for dynamic text
    shopPositions.push({ x, z, groundY, width, depth, neonColor, signText: shopSignTexts[i] });
  }

  // Lower row shops (9 shops at z=0)
  const lowerStartX = -19;
  for (let i = 0; i < 9; i++) {
    const x = lowerStartX + i * 5.2;
    const z = 0;
    const width = 4.8;
    const depth = 3.5;
    const height = 4 + Math.random() * 2;
    const neonColor = neonPalette[(i + 3) % neonPalette.length];

    const shop = createShopBuilding(scene, x, z, groundY, {
      width, depth, height, neonColor,
      skipText: true // No canvas texture for GLB
    });
    shops.push(shop);

    // Store position info for dynamic text
    shopPositions.push({ x, z, groundY, width, depth, neonColor, signText: shopSignTexts[9 + i] });
  }

  return shops;
}

/**
 * Add shop sign texts dynamically (after GLB load)
 */
export function addShopSignTexts(scene) {
  const neonPalette = [
    colors.neon.pink, colors.neon.cyan, colors.neon.yellow,
    colors.neon.magenta, colors.neon.blue, colors.neon.green
  ];

  // Upper row
  const upperStartX = -19;
  for (let i = 0; i < 9; i++) {
    const x = upperStartX + i * 5.2;
    const z = 13;
    const width = 4.8;
    const depth = 4;
    const neonColor = neonPalette[i % neonPalette.length];

    addSignTextPanel(scene, x, z, 0, width, depth, neonColor, shopSignTexts[i]);
  }

  // Lower row
  const lowerStartX = -19;
  for (let i = 0; i < 9; i++) {
    const x = lowerStartX + i * 5.2;
    const z = 0;
    const width = 4.8;
    const depth = 3.5;
    const neonColor = neonPalette[(i + 3) % neonPalette.length];

    addSignTextPanel(scene, x, z, 0, width, depth, neonColor, shopSignTexts[9 + i]);
  }
}

/**
 * Add a single sign text panel
 */
function addSignTextPanel(scene, x, z, groundY, width, depth, neonColor, signText) {
  const signWidth = width * 0.8;
  const signHeight = 0.8;

  const texture = createShopSignTexture(signText, signWidth * 100, signHeight * 100, neonColor);
  const signPanelGeom = new THREE.PlaneGeometry(signWidth, signHeight);
  const signPanelMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const signPanel = new THREE.Mesh(signPanelGeom, signPanelMat);
  signPanel.renderOrder = 1;
  signPanel.position.set(x, groundY + 4.0, z - depth/2 - 0.72);
  // 상점이 -Z 방향을 바라보므로 플레인도 -Z 방향으로 회전
  signPanel.rotation.y = Math.PI;
  scene.add(signPanel);
}

/**
 * Create all shopping district buildings (full version with text)
 */
export function createShoppingDistrict(scene) {
  const shops = [];
  const groundY = 0;
  const neonPalette = [
    colors.neon.pink, colors.neon.cyan, colors.neon.yellow,
    colors.neon.magenta, colors.neon.blue, colors.neon.green
  ];

  // Upper row shops (9 shops at z=13, closer to stairs)
  const upperStartX = -19;
  for (let i = 0; i < 9; i++) {
    const shop = createShopBuilding(scene, upperStartX + i * 5.2, 13, groundY, {
      width: 4.8,
      depth: 4,
      height: 5 + Math.random() * 2,
      neonColor: neonPalette[i % neonPalette.length],
      signText: shopSignTexts[i]
    });
    shops.push(shop);
  }

  // Lower row shops (9 shops at z=0)
  const lowerStartX = -19;
  for (let i = 0; i < 9; i++) {
    const shop = createShopBuilding(scene, lowerStartX + i * 5.2, 0, groundY, {
      width: 4.8,
      depth: 3.5,
      height: 4 + Math.random() * 2,
      neonColor: neonPalette[(i + 3) % neonPalette.length],
      signText: shopSignTexts[9 + i]
    });
    shops.push(shop);
  }

  return shops;
}

// ============================================
// Vendor Stalls
// ============================================

/**
 * Create a single vendor stall
 */
export function createVendorStall(scene, x, z, groundY) {
  const group = new THREE.Group();
  const neonColors = Object.values(colors.neon);
  const stallColor = neonColors[Math.floor(Math.random() * neonColors.length)];

  // Table
  const tableGeom = new THREE.BoxGeometry(1.8, 0.1, 1);
  const tableMat = new THREE.MeshBasicMaterial({ color: 0x4a4035 });
  const table = new THREE.Mesh(tableGeom, tableMat);
  table.position.y = 0.8;
  group.add(table);

  // Table legs
  const legGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
  const legMat = new THREE.MeshBasicMaterial({ color: 0x3a3025 });
  [[-0.8, -0.4], [-0.8, 0.4], [0.8, -0.4], [0.8, 0.4]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(lx, 0.4, lz);
    group.add(leg);
  });

  // Canopy poles
  const poleGeom = new THREE.CylinderGeometry(0.04, 0.04, 2, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x757585 });
  [[-0.85, -0.45], [-0.85, 0.45], [0.85, -0.45], [0.85, 0.45]].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(poleGeom, poleMat);
    pole.position.set(px, 1.8, pz);
    group.add(pole);
  });

  // Canopy
  const canopyGeom = new THREE.BoxGeometry(2, 0.08, 1.2);
  const canopyMat = new THREE.MeshBasicMaterial({ color: stallColor });
  const canopy = new THREE.Mesh(canopyGeom, canopyMat);
  canopy.position.y = 2.8;
  group.add(canopy);

  // Products on table (small boxes)
  for (let i = 0; i < 3; i++) {
    const prodGeom = new THREE.BoxGeometry(0.3 + Math.random() * 0.2, 0.2 + Math.random() * 0.15, 0.3);
    const prodMat = new THREE.MeshBasicMaterial({
      color: neonColors[Math.floor(Math.random() * neonColors.length)]
    });
    const prod = new THREE.Mesh(prodGeom, prodMat);
    prod.position.set(-0.5 + i * 0.5, 0.95, 0);
    group.add(prod);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create all vendor stalls
 */
export function createVendorStalls(scene) {
  const stalls = [];
  const groundY = 0;

  // Lower row only (closer to lower shops at z=0): 11 stalls
  for (let i = 0; i < 11; i++) {
    stalls.push(createVendorStall(scene, -16.2 + i * 3.6, 2, groundY));
  }

  return stalls;
}

// ============================================
// Standing Signs
// ============================================

/**
 * Create a standing sign with panel
 */
export function createStandingSign(scene, x, z, rotation = 0) {
  const group = new THREE.Group();
  const neonColors = Object.values(colors.neon);
  const color = neonColors[Math.floor(Math.random() * neonColors.length)];

  const poleGeom = new THREE.CylinderGeometry(0.15, 0.2, 3.5, 8);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x2a2a38 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = 1.75;
  group.add(pole);

  const baseGeom = new THREE.BoxGeometry(1.2, 0.2, 1.2);
  const baseMat = new THREE.MeshBasicMaterial({ color: 0x252535 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.1;
  group.add(base);

  const panelBgGeom = new THREE.BoxGeometry(3.5, 2.8, 0.15);
  const panelBgMat = new THREE.MeshBasicMaterial({ color: 0x0d0d18 });
  const panelBg = new THREE.Mesh(panelBgGeom, panelBgMat);
  panelBg.position.y = 4.5;
  group.add(panelBg);

  const panelGeom = new THREE.PlaneGeometry(3.2, 2.5);
  const panelMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.9
  });
  const panel = new THREE.Mesh(panelGeom, panelMat);
  panel.position.set(0, 4.5, 0.1);
  group.add(panel);

  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  group.userData.contentSurface = panel;
  group.userData.type = 'standing-sign';

  scene.add(group);
  return group;
}
