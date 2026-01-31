/**
 * city-building.js
 * Hong Kong Citypop Night City - Building Creation Functions
 *
 * Contains functions for creating main towers, small buildings,
 * and building clusters for different city areas.
 */

import * as THREE from 'three';
import { colors, randomColor } from './city-colors.js';

// ============================================
// Building Signs
// ============================================

const buildingSignTexts = [
  'Platform', 'Reservation', 'Font Cloud', 'Marketing System',
  'Media Art', 'IOT', 'Shopping Mall', 'Community',
  'CRM', 'LMS', 'ERP', 'Web Agency',
  'EMS', 'CMS', 'Kiosk', 'Cloud Service',
  'AI Lab', 'Mobile App', 'Windows App', 'MacOS App',
  '3D Web', 'Web MIDI'
];

const signFonts = [
  'Arial, Helvetica, sans-serif',
  'Georgia, "Times New Roman", serif',
  'Impact, "Arial Black", sans-serif',
  '"Courier New", Courier, monospace',
  '"Trebuchet MS", Arial, sans-serif',
  'Verdana, Geneva, sans-serif',
  'Tahoma, Geneva, sans-serif',
  '"Times New Roman", Times, serif',
  'Monaco, "Courier New", monospace',
  '"Marker Felt", "Comic Sans MS", cursive',
  'Palatino, "Palatino Linotype", serif',
  'Helvetica, Arial, sans-serif'
];

const signColors = [
  '#ff6090', '#60d0ff', '#ffcc00', '#90ff60',
  '#ff9060', '#c060ff', '#60ffcc', '#ff60c0',
  '#90c0ff', '#ffff60', '#60ff90', '#ff6060'
];

let signTextIndex = 0;

// Shuffled text indices for maximum variety
let shuffledTextIndices = [];
let currentShuffledIndex = 0;

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getNextTextIndex() {
  // Initialize or reshuffle when exhausted
  if (shuffledTextIndices.length === 0 || currentShuffledIndex >= shuffledTextIndices.length) {
    shuffledTextIndices = shuffleArray([...Array(buildingSignTexts.length).keys()]);
    currentShuffledIndex = 0;
  }
  return shuffledTextIndices[currentShuffledIndex++];
}

/**
 * Create a small entrance sign above the door
 */
function createEntranceSign(group, text, entranceWidth, entranceHeight, depth, isFront, font, textColor) {
  // Sign dimensions - visible but smaller than main signs
  const signWidth = Math.max(entranceWidth * 1.5, 5);
  const signHeight = 2;
  const aspectRatio = signWidth / signHeight;

  // Create texture
  const texture = createSignTexture(text, font, textColor, 'textWithStroke', aspectRatio);

  // Create sign mesh
  const signGeom = new THREE.PlaneGeometry(signWidth, signHeight);
  const signMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.FrontSide
  });
  const sign = new THREE.Mesh(signGeom, signMat);

  // Position above entrance
  const signY = entranceHeight + 1.5;
  const signZ = isFront ? -depth / 2 - 0.15 : depth / 2 + 0.15;
  // Front faces -z (toward viewer), Back faces +z (toward viewer from back)
  const rotationY = isFront ? Math.PI : 0;

  sign.position.set(0, signY, signZ);
  sign.rotation.y = rotationY;
  group.add(sign);
}

// Sign style types
const signStyles = [
  'textOnly',           // Just text, no background
  'textWithStroke',     // Text with stroke outline only
  'boxBackground',      // Dark box background with text
  'borderOnly',         // Border around text, transparent bg
  'gradientText',       // Gradient-like text effect
  'neonGlow'            // Neon glow style
];

/**
 * Get contrasting stroke color based on text color brightness
 */
function getContrastColor(hexColor) {
  // Parse hex color
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate brightness (perceived luminance)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return dark color for light text, light color for dark text
  return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * Create a canvas texture for building sign
 */
function createSignTexture(text, fontFamily, textColor, style, aspectRatio = 4) {
  const canvas = document.createElement('canvas');
  // Match canvas aspect ratio to sign aspect ratio to prevent stretching
  canvas.height = 512;
  canvas.width = Math.round(512 * aspectRatio);
  const ctx = canvas.getContext('2d');

  // Get contrasting stroke color
  const strokeColor = getContrastColor(textColor);

  // Calculate optimal font size to fit text within canvas
  const maxWidth = canvas.width * 0.9;  // 90% of canvas width
  const maxHeight = canvas.height * 0.7; // 70% of canvas height

  // Start with a large font size and reduce until text fits
  let fontSize = Math.min(maxHeight, 400);
  let font = `bold ${fontSize}px ${fontFamily}`;
  ctx.font = font;

  while (ctx.measureText(text).width > maxWidth && fontSize > 40) {
    fontSize -= 10;
    font = `bold ${fontSize}px ${fontFamily}`;
    ctx.font = font;
  }

  // Proportional stroke width based on font size
  const strokeWidth = Math.max(8, Math.round(fontSize * 0.15));
  const glowBlur = Math.max(30, Math.round(fontSize * 0.35));

  // Apply different styles
  switch (style) {
    case 'textOnly':
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      break;

    case 'textWithStroke':
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = textColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      break;

    case 'boxBackground':
      ctx.fillStyle = 'rgba(20, 20, 40, 0.9)';
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      break;

    case 'borderOnly':
      ctx.strokeStyle = textColor;
      ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.04));
      ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      break;

    case 'gradientText':
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = textColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      break;

    case 'neonGlow':
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = textColor;
      ctx.shadowBlur = glowBlur;
      ctx.fillStyle = textColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      ctx.shadowBlur = glowBlur / 2;
      ctx.fillStyle = strokeColor;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Create building signs on all 4 sides and entrance signs
 * @param {THREE.Group} group - Building group
 * @param {number} width - Building width (x-axis)
 * @param {number} height - Building height (y-axis)
 * @param {number} depth - Building depth (z-axis)
 * @param {boolean} isMainTower - True for main tower, false for small building
 * @param {Object} entranceConfig - Optional entrance dimensions for entrance signs
 */
function createBuildingSign(group, width, height, depth, isMainTower = false, entranceConfig = null) {
  // Use shuffled array to ensure nearby buildings have different texts
  const textIdx = getNextTextIndex();
  const fontIdx = (signTextIndex * 11) % signFonts.length;
  const colorIdx = (signTextIndex * 13) % signColors.length;
  const styleIdx = (signTextIndex * 17) % signStyles.length;

  const text = buildingSignTexts[textIdx];
  const font = signFonts[fontIdx];
  const textColor = signColors[colorIdx];
  const style = signStyles[styleIdx];
  signTextIndex++;

  // Create entrance signs if config provided (same text as main sign)
  if (entranceConfig) {
    const { frontWidth, frontHeight, backWidth, backHeight } = entranceConfig;
    createEntranceSign(group, text, frontWidth, frontHeight, depth, true, font, textColor);
    createEntranceSign(group, text, backWidth, backHeight, depth, false, font, textColor);
  }

  // Calculate window layout to find top window position
  const winSpacingY = isMainTower ? 3 : 3.5;
  const windowHeight = isMainTower ? 2 : 1.8;
  const numRows = Math.max(1, Math.floor((height - 4) / winSpacingY));

  // Top window position
  const topWindowY = 2 + (numRows - 1) * winSpacingY;
  const windowTop = topWindowY + windowHeight / 2;

  // Sign position: above windows with small margin
  const margin = 0.5;
  const signStartY = windowTop + margin;
  const availableHeight = height - signStartY - 0.2;

  // Sign height - maximize within available space (min 2, max 6)
  const signHeight = Math.min(Math.max(availableHeight, 2), 6);
  const signCenterY = signStartY + signHeight / 2;

  // Sign configurations for 4 directions with matching aspect ratios
  const frontBackWidth = width * 0.95;
  const leftRightWidth = depth * 0.95;

  // Create textures with matching aspect ratios to prevent text distortion
  const frontBackAspect = frontBackWidth / signHeight;
  const leftRightAspect = leftRightWidth / signHeight;

  const textureFrontBack = createSignTexture(text, font, textColor, style, frontBackAspect);
  const textureLeftRight = createSignTexture(text, font, textColor, style, leftRightAspect);

  // Sign configurations for 4 directions
  const signConfigs = [
    { // Front (facing +z direction)
      signWidth: frontBackWidth,
      texture: textureFrontBack,
      position: [0, signCenterY, depth / 2 + 0.1],
      rotation: [0, 0, 0]
    },
    { // Back (facing -z direction)
      signWidth: frontBackWidth,
      texture: textureFrontBack,
      position: [0, signCenterY, -depth / 2 - 0.1],
      rotation: [0, Math.PI, 0]
    },
    { // Left (facing -x direction)
      signWidth: leftRightWidth,
      texture: textureLeftRight,
      position: [-width / 2 - 0.1, signCenterY, 0],
      rotation: [0, -Math.PI / 2, 0]
    },
    { // Right (facing +x direction)
      signWidth: leftRightWidth,
      texture: textureLeftRight,
      position: [width / 2 + 0.1, signCenterY, 0],
      rotation: [0, Math.PI / 2, 0]
    }
  ];

  // Create signs for all 4 directions
  signConfigs.forEach(config => {
    const signGeom = new THREE.PlaneGeometry(config.signWidth, signHeight);
    const signMat = new THREE.MeshBasicMaterial({
      map: config.texture,
      transparent: true,
      side: THREE.FrontSide
    });
    const sign = new THREE.Mesh(signGeom, signMat);
    sign.position.set(...config.position);
    sign.rotation.set(...config.rotation);
    group.add(sign);
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if two buildings overlap on the XZ plane
 */
export function checkBuildingOverlap(b1, b2) {
  const pos1 = b1.position;
  const pos2 = b2.position;

  // Get building dimensions from userData or estimate from bounding box
  const size1 = b1.userData.buildingSize || { width: 10, depth: 10, height: 20 };
  const size2 = b2.userData.buildingSize || { width: 10, depth: 10, height: 20 };

  const halfW1 = size1.width / 2;
  const halfD1 = size1.depth / 2;
  const halfW2 = size2.width / 2;
  const halfD2 = size2.depth / 2;

  // Check AABB overlap on XZ plane
  const overlapX = Math.abs(pos1.x - pos2.x) < (halfW1 + halfW2);
  const overlapZ = Math.abs(pos1.z - pos2.z) < (halfD1 + halfD2);

  return overlapX && overlapZ;
}

/**
 * Calculate building volume for comparison
 */
export function getBuildingVolume(building) {
  const size = building.userData.buildingSize || { width: 10, depth: 10, height: 20 };
  return size.width * size.depth * size.height;
}

/**
 * Remove overlapping buildings, keeping larger ones
 */
export function removeOverlappingBuildings(scene, buildings) {
  const toRemove = new Set();

  for (let i = 0; i < buildings.length; i++) {
    if (toRemove.has(i)) continue;

    for (let j = i + 1; j < buildings.length; j++) {
      if (toRemove.has(j)) continue;

      if (checkBuildingOverlap(buildings[i], buildings[j])) {
        const vol1 = getBuildingVolume(buildings[i]);
        const vol2 = getBuildingVolume(buildings[j]);

        // Remove smaller building
        if (vol1 >= vol2) {
          toRemove.add(j);
        } else {
          toRemove.add(i);
          break; // Building i is removed, stop checking against it
        }
      }
    }
  }

  // Remove from scene
  const removeIndices = Array.from(toRemove).sort((a, b) => b - a);
  removeIndices.forEach(idx => {
    scene.remove(buildings[idx]);
  });

  // Filter out removed buildings
  return buildings.filter((_, idx) => !toRemove.has(idx));
}

// ============================================
// High-Rise Buildings
// ============================================

/**
 * Create a main tower with window grid
 */
export function createMainTower(scene, x, z, groundY, config = {}) {
  const group = new THREE.Group();

  const width = config.width || 12;
  const depth = config.depth || 10;
  const height = config.height || 35;
  const neonColor = config.neonColor || colors.neon.pink;

  // Main building body
  const buildingGeom = new THREE.BoxGeometry(width, height, depth);
  const buildingMat = new THREE.MeshBasicMaterial({ color: randomColor(colors.building) });
  const building = new THREE.Mesh(buildingGeom, buildingMat);
  building.position.y = height/2;
  group.add(building);

  // ===== Fixed Window Grid Pattern for Main Tower =====
  // 남쪽 면(Back) 창문은 제거됨 - 카메라 동선에 없음
  const winGeom = new THREE.PlaneGeometry(1.4, 2);
  const winSpacingX = 2.5;  // Horizontal spacing
  const winSpacingY = 3;    // Vertical spacing
  const winMargin = 1.5;    // Margin from edge

  // Fixed color pattern (repeating)
  const towerWinColors = [
    colors.window[0], colors.window[3], colors.window[6], colors.window[1],
    colors.window[4], colors.window[7], colors.window[2], colors.window[5]
  ];

  // Calculate fixed grid dimensions
  const numCols = Math.max(1, Math.floor((width - winMargin * 2) / winSpacingX) + 1);
  const numRows = Math.max(1, Math.floor((height - 4) / winSpacingY));
  const numSideCols = Math.max(1, Math.floor((depth - winMargin * 2) / winSpacingX) + 1);

  // Entrance dimensions for collision check
  const entranceWidth = 4;
  const entranceHeight = 4;
  const backEntranceWidth = 3;
  const backEntranceHeight = 3.5;

  // Entrance sign dimensions for collision check
  const entranceSignWidth = Math.max(entranceWidth * 1.5, 5);

  // Front windows - fixed grid (skip windows overlapping with entrance and entrance sign)
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const winX = -width/2 + winMargin + col * winSpacingX;
      const winY = 2 + row * winSpacingY;
      // Skip if overlapping with front entrance or entrance sign area
      if (Math.abs(winX) < entranceSignWidth/2 + 1 && winY < entranceHeight + 4) {
        continue;
      }
      const colorIdx = (row + col) % towerWinColors.length;
      const win = new THREE.Mesh(winGeom, new THREE.MeshBasicMaterial({ color: towerWinColors[colorIdx], side: THREE.DoubleSide }));
      win.position.set(winX, winY, -depth/2 - 0.01);
      group.add(win);
    }
  }

  // Left side windows - fixed grid
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numSideCols; col++) {
      const colorIdx = (row + col + 2) % towerWinColors.length;
      const win = new THREE.Mesh(winGeom, new THREE.MeshBasicMaterial({ color: towerWinColors[colorIdx], side: THREE.DoubleSide }));
      win.rotation.y = Math.PI / 2;
      win.position.set(
        -width/2 - 0.01,
        2 + row * winSpacingY,
        -depth/2 + winMargin + col * winSpacingX
      );
      group.add(win);
    }
  }


  // Right side windows - fixed grid
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numSideCols; col++) {
      const colorIdx = (row + col + 4) % towerWinColors.length;
      const win = new THREE.Mesh(winGeom, new THREE.MeshBasicMaterial({ color: towerWinColors[colorIdx], side: THREE.DoubleSide }));
      win.rotation.y = -Math.PI / 2;
      win.position.set(
        width/2 + 0.01,
        2 + row * winSpacingY,
        -depth/2 + winMargin + col * winSpacingX
      );
      group.add(win);
    }
  }

  // Back windows (남쪽 면) - 제거됨: 카메라 동선에 없어서 최적화

  // Building entrance (white door) - FRONT
  const entranceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const entranceGeom = new THREE.PlaneGeometry(entranceWidth, entranceHeight);
  const entrance = new THREE.Mesh(entranceGeom, entranceMat);
  entrance.position.set(0, entranceHeight/2, -depth/2 - 0.01);
  group.add(entrance);

  // Back entrance (white door) - no frame
  const backEntranceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const backEntranceGeom = new THREE.PlaneGeometry(backEntranceWidth, backEntranceHeight);
  const backEntrance = new THREE.Mesh(backEntranceGeom, backEntranceMat);
  backEntrance.position.set(0, backEntranceHeight/2, depth/2 + 0.01);
  group.add(backEntrance);

  // Rooftop antenna (for tall buildings, 1/3 chance)
  if (height > 30 && Math.random() < 0.33) {
    const antennaGeom = new THREE.CylinderGeometry(0.15, 0.2, 8, 6);
    const antennaMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
    const antenna = new THREE.Mesh(antennaGeom, antennaMat);
    antenna.position.y = height + 4;
    group.add(antenna);

    // Red warning light
    const lightGeom = new THREE.SphereGeometry(0.3, 8, 6);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xff2020 });
    const light = new THREE.Mesh(lightGeom, lightMat);
    light.position.y = height + 8;
    group.add(light);
  }

  // Building sign (facing main road) and entrance signs
  createBuildingSign(group, width, height, depth, true, {
    frontWidth: entranceWidth,
    frontHeight: entranceHeight,
    backWidth: backEntranceWidth,
    backHeight: backEntranceHeight
  });

  group.position.set(x, groundY, z);
  group.userData.buildingSize = { width, depth, height };
  scene.add(group);
  return group;
}

/**
 * Create a smaller building
 */
export function createSmallBuilding(scene, x, z, groundY, config = {}) {
  const group = new THREE.Group();

  const width = config.width || 8;
  const depth = config.depth || 6;
  const height = config.height || 15;

  // Building body
  const buildingGeom = new THREE.BoxGeometry(width, height, depth);
  const buildingMat = new THREE.MeshBasicMaterial({ color: randomColor(colors.building) });
  const building = new THREE.Mesh(buildingGeom, buildingMat);
  building.position.y = height/2;
  group.add(building);

  // ===== Fixed Window Grid Pattern for Small Building =====
  const winGeom = new THREE.PlaneGeometry(1.2, 1.8);
  const sideWinGeom = new THREE.PlaneGeometry(1.0, 1.5);
  const winSpacingX = 2.5;
  const winSpacingY = 3.5;
  const winMargin = 1.2;

  // Fixed color pattern
  const smallWinColors = [
    colors.window[0], colors.window[3], colors.window[6], colors.window[1],
    colors.window[4], colors.window[7], colors.window[2], colors.window[5]
  ];

  // Calculate fixed grid dimensions
  const numCols = Math.max(1, Math.floor((width - winMargin * 2) / winSpacingX) + 1);
  const numRows = Math.max(1, Math.floor((height - 4) / winSpacingY));
  const numSideCols = Math.max(1, Math.floor((depth - winMargin * 2) / winSpacingX) + 1);

  // Door dimensions for collision check
  const doorWidth = 2;
  const doorHeight = 3;
  const backDoorWidth = 1.8;
  const backDoorHeight = 2.8;

  // Entrance sign dimensions for collision check
  const doorSignWidth = Math.max(doorWidth * 1.5, 5);
  const backDoorSignWidth = Math.max(backDoorWidth * 1.5, 5);

  // Front Windows - fixed grid (skip windows overlapping with door and entrance sign)
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const winX = -width/2 + winMargin + col * winSpacingX;
      const winY = 2 + row * winSpacingY;
      // Skip if overlapping with front door or entrance sign area
      if (Math.abs(winX) < doorSignWidth/2 + 1 && winY < doorHeight + 4) {
        continue;
      }
      const colorIdx = (row + col) % smallWinColors.length;
      const win = new THREE.Mesh(winGeom, new THREE.MeshBasicMaterial({ color: smallWinColors[colorIdx], side: THREE.DoubleSide }));
      win.position.set(winX, winY, -depth/2 - 0.01);
      group.add(win);
    }
  }

  // Left Side Windows - fixed grid
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numSideCols; col++) {
      const colorIdx = (row + col + 2) % smallWinColors.length;
      const win = new THREE.Mesh(sideWinGeom, new THREE.MeshBasicMaterial({ color: smallWinColors[colorIdx], side: THREE.DoubleSide }));
      win.rotation.y = Math.PI / 2;
      win.position.set(
        -width/2 - 0.01,
        2 + row * winSpacingY,
        -depth/2 + winMargin + col * winSpacingX
      );
      group.add(win);
    }
  }

  // Right Side Windows - fixed grid
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numSideCols; col++) {
      const colorIdx = (row + col + 4) % smallWinColors.length;
      const win = new THREE.Mesh(sideWinGeom, new THREE.MeshBasicMaterial({ color: smallWinColors[colorIdx], side: THREE.DoubleSide }));
      win.rotation.y = -Math.PI / 2;
      win.position.set(
        width/2 + 0.01,
        2 + row * winSpacingY,
        -depth/2 + winMargin + col * winSpacingX
      );
      group.add(win);
    }
  }

  // Back Windows (남쪽 면) - 제거됨: 카메라 동선에 없어서 최적화

  // Entrance door - FRONT (white, no frame)
  const doorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const doorGeom = new THREE.PlaneGeometry(doorWidth, doorHeight);
  const door = new THREE.Mesh(doorGeom, doorMat);
  door.position.set(0, doorHeight/2, -depth/2 - 0.01);
  group.add(door);

  // Back entrance (white, no frame)
  const backDoorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const backDoorGeom = new THREE.PlaneGeometry(backDoorWidth, backDoorHeight);
  const backDoor = new THREE.Mesh(backDoorGeom, backDoorMat);
  backDoor.position.set(0, backDoorHeight/2, depth/2 + 0.01);
  group.add(backDoor);

  // Building sign (facing main road) and entrance signs
  createBuildingSign(group, width, height, depth, false, {
    frontWidth: doorWidth,
    frontHeight: doorHeight,
    backWidth: backDoorWidth,
    backHeight: backDoorHeight
  });

  group.position.set(x, groundY, z);
  group.userData.buildingSize = { width, depth, height };
  scene.add(group);
  return group;
}

// ============================================
// Building Clusters
// ============================================

/**
 * Create left side buildings cluster (expanded 2x area - extended to x=-160)
 */
export function createLeftBuildings(scene) {
  const buildings = [];
  const groundY = 0;
  const neonPalette = [colors.neon.pink, colors.neon.magenta, colors.neon.cyan, colors.neon.blue];

  // Main towers (multiple) - original area - moved down for wider road
  // Removed: createMainTower at -38, -35 - overlaps curve area/mountains
  // Removed: createMainTower at -55, -45 - on south road
  // Removed: createMainTower at -70, -30 - overlaps curve area/mountains
  // Removed: createMainTower at -45, -65 - overlaps south road
  // Removed: createMainTower at -65, -70 - overlaps south road

  // Extended area main towers (x=-85 to -160) - removed due to overlap with mountains near curve
  // Removed: createMainTower at -95, -25
  // Removed: createMainTower at -110, -40
  // Removed: createMainTower at -125, -20
  // Removed: createMainTower at -100, -60
  // Removed: createMainTower at -140, -35
  // Removed: createMainTower at -130, -65
  // Removed: createMainTower at -150, -50

  // LEFT SIDE NORTH AREA - removed, replaced with hills (see createLeftNorthHills)

  // Secondary buildings (many more) - original area - moved down for wider road
  // Removed buildings overlapping with main road (z=-25 to z=-15) and south road (x=-60 to -50)
  const secondaryPositions = [
    // Removed: { x: -32, z: -38 } - overlaps curve area/mountains
    // Removed: { x: -42, z: -32 } - overlaps curve area/mountains
    { x: -35, z: -48, w: 12, d: 10, h: 30 },
    // Removed: { x: -50, z: -35 } - on south road
    // Removed: { x: -75, z: -40 } - overlaps with mountains near curve
    // Removed: { x: -48, z: -55 } - on south road
    // Removed: { x: -58, z: -60 } - on south road
    // Removed: { x: -72, z: -55 } - overlaps with mountains near curve
    // Removed: { x: -80, z: -35 } - overlaps with mountains near curve
    { x: -68, z: -80, w: 11, d: 9, h: 32 },
    // Removed: { x: -50, z: -75 } - on south road
    { x: -35, z: -70, w: 10, d: 8, h: 28 },
    // Removed: { x: -78, z: -65 } - overlaps with mountains near curve
    // Removed: { x: -62, z: -28 } - overlaps curve area/mountains
    // Extended area secondary buildings (x=-85 to -160) - ALL REMOVED due to overlap with mountains
    // Removed: { x: -92, z: -45 }
    // Removed: { x: -102, z: -52 }
    // Removed: { x: -118, z: -58 }
    // Removed: { x: -108, z: -72 }
    // Removed: { x: -122, z: -45 }
    // Removed: { x: -138, z: -55 }
    // Removed: { x: -142, z: -70 }
    // Removed: { x: -155, z: -60 }
    // Removed: { x: -152, z: -42 }
    // Removed: { x: -128, z: -78 }
    // Removed: { x: -145, z: -80 }
    // LEFT SIDE NORTH secondary buildings removed - replaced with hills
  ];

  secondaryPositions.forEach(pos => {
    buildings.push(createSmallBuilding(scene, pos.x, pos.z, groundY, {
      width: pos.w, depth: pos.d, height: pos.h
    }));
  });

  // Street lamps for left north area removed - area now has hills

  return buildings;
}

/**
 * Create right side buildings cluster (expanded 5x area)
 */
export function createRightBuildings(scene) {
  const buildings = [];
  const groundY = 0;

  // Main towers (multiple) - moved down for wider road
  // Removed: main tower next to street lamp (x=35)
  // buildings.push(createMainTower(scene, 38, -35, groundY, {
  //   width: 14, depth: 12, height: 43, neonColor: colors.neon.cyan
  // }));
  buildings.push(createMainTower(scene, 55, -45, groundY, {
    width: 16, depth: 14, height: 52, neonColor: colors.neon.yellow
  }));
  // Removed: building between hotel and crosswalk
  // buildings.push(createMainTower(scene, 70, -30, groundY, {
  //   width: 12, depth: 10, height: 40, neonColor: colors.neon.green
  // }));
  buildings.push(createMainTower(scene, 45, -65, groundY, {
    width: 14, depth: 12, height: 48, neonColor: colors.neon.cyan
  }));
  buildings.push(createMainTower(scene, 65, -70, groundY, {
    width: 15, depth: 13, height: 46, neonColor: colors.neon.pink
  }));

  // Secondary buildings (many more) - moved down for wider road
  // Removed buildings overlapping with main road (z=-25 to z=-15)
  const secondaryPositions = [
    { x: 32, z: -38, w: 14, d: 12, h: 40 },  // Enlarged building
    // Removed: { x: 42, z: -32, w: 8, d: 6, h: 18 }, - between hotel and crosswalk
    { x: 35, z: -48, w: 12, d: 10, h: 28 },
    { x: 50, z: -35, w: 9, d: 7, h: 24 },
    { x: 75, z: -40, w: 10, d: 8, h: 22 },
    { x: 48, z: -55, w: 8, d: 7, h: 20 },
    { x: 58, z: -60, w: 10, d: 8, h: 24 },
    { x: 72, z: -55, w: 9, d: 7, h: 20 },
    { x: 80, z: -35, w: 8, d: 6, h: 18 },
    { x: 68, z: -80, w: 11, d: 9, h: 30 },
    { x: 50, z: -75, w: 9, d: 8, h: 26 },
    { x: 35, z: -70, w: 10, d: 8, h: 26 },
    { x: 78, z: -65, w: 8, d: 7, h: 16 }
    // Removed: { x: 62, z: -28, w: 7, d: 6, h: 14 } - between hotel and crosswalk
  ];

  secondaryPositions.forEach(pos => {
    buildings.push(createSmallBuilding(scene, pos.x, pos.z, groundY, {
      width: pos.w, depth: pos.d, height: pos.h
    }));
  });

  return buildings;
}

/**
 * Create center bottom buildings cluster (expanded area)
 */
export function createCenterBuildings(scene) {
  const buildings = [];
  const groundY = 0;

  // Main towers at center bottom - moved down for wider road
  buildings.push(createMainTower(scene, -10, -45, groundY, {
    width: 12, depth: 10, height: 38, neonColor: colors.neon.magenta
  }));
  buildings.push(createMainTower(scene, 10, -45, groundY, {
    width: 12, depth: 10, height: 42, neonColor: colors.neon.yellow
  }));
  buildings.push(createMainTower(scene, 0, -65, groundY, {
    width: 14, depth: 12, height: 50, neonColor: colors.neon.pink
  }));
  buildings.push(createMainTower(scene, -18, -75, groundY, {
    width: 13, depth: 11, height: 44, neonColor: colors.neon.cyan
  }));
  buildings.push(createMainTower(scene, 18, -75, groundY, {
    width: 13, depth: 11, height: 46, neonColor: colors.neon.green
  }));

  // Secondary buildings - moved down for wider road
  const secondaryPositions = [
    { x: 0, z: -50, w: 10, d: 8, h: 28 },
    { x: -25, z: -55, w: 9, d: 7, h: 24 },
    { x: 25, z: -55, w: 9, d: 7, h: 22 },
    { x: -8, z: -80, w: 10, d: 8, h: 26 },
    { x: 8, z: -80, w: 10, d: 8, h: 28 },
    { x: 0, z: -90, w: 11, d: 9, h: 32 },
    { x: -20, z: -90, w: 8, d: 7, h: 20 },
    { x: 20, z: -90, w: 8, d: 7, h: 18 },
    { x: -30, z: -80, w: 9, d: 8, h: 24 },
    { x: 30, z: -80, w: 9, d: 8, h: 22 }
  ];

  secondaryPositions.forEach(pos => {
    buildings.push(createSmallBuilding(scene, pos.x, pos.z, groundY, {
      width: pos.w, depth: pos.d, height: pos.h
    }));
  });

  return buildings;
}

/**
 * Create south side buildings (fill far south area)
 */
export function createSouthBuildings(scene) {
  const buildings = [];
  const groundY = 0;
  const neonPalette = [colors.neon.pink, colors.neon.magenta, colors.neon.cyan, colors.neon.blue, colors.neon.yellow, colors.neon.green];

  // Far south main towers (z = -100 to -180)
  // Removed buildings on south road (x=-60 to -50, z=-35 to -150)
  const mainTowerPositions = [
    // Left-center area
    // Removed: { x: -60, z: -110 } - on south road
    { x: -40, z: -125, w: 14, d: 12, h: 48 },
    { x: -80, z: -130, w: 15, d: 13, h: 52 },
    // Removed: { x: -55, z: -145 } - on south road
    { x: -100, z: -115, w: 16, d: 14, h: 58 },
    { x: -120, z: -135, w: 15, d: 13, h: 54 },
    { x: -90, z: -155, w: 14, d: 12, h: 46 },
    { x: -140, z: -120, w: 14, d: 12, h: 50 },

    // Center area
    { x: -15, z: -110, w: 14, d: 12, h: 52 },
    { x: 15, z: -115, w: 15, d: 13, h: 56 },
    { x: 0, z: -130, w: 16, d: 14, h: 60 },
    { x: -25, z: -145, w: 14, d: 12, h: 48 },
    { x: 25, z: -140, w: 14, d: 12, h: 50 },
    { x: 0, z: -160, w: 15, d: 13, h: 54 },
    { x: -10, z: -175, w: 14, d: 12, h: 46 },
    { x: 10, z: -170, w: 14, d: 12, h: 48 },

    // Right-center area
    { x: 50, z: -105, w: 15, d: 13, h: 52 },
    { x: 70, z: -120, w: 16, d: 14, h: 58 },
    { x: 45, z: -135, w: 14, d: 12, h: 48 },
    { x: 85, z: -140, w: 15, d: 13, h: 54 },
    { x: 60, z: -155, w: 14, d: 12, h: 50 },
    { x: 100, z: -125, w: 14, d: 12, h: 46 },
    { x: 75, z: -170, w: 15, d: 13, h: 52 },

    // === FAR LEFT SOUTH (x = -150 to -200) ===
    { x: -160, z: -100, w: 15, d: 13, h: 52 },
    { x: -175, z: -115, w: 16, d: 14, h: 58 },
    { x: -155, z: -130, w: 14, d: 12, h: 48 },
    { x: -190, z: -105, w: 14, d: 12, h: 50 },
    { x: -170, z: -145, w: 15, d: 13, h: 54 },
    { x: -185, z: -135, w: 16, d: 14, h: 56 },
    { x: -160, z: -160, w: 14, d: 12, h: 46 },
    { x: -200, z: -120, w: 15, d: 13, h: 52 },
    { x: -195, z: -150, w: 14, d: 12, h: 48 },
    { x: -175, z: -170, w: 15, d: 13, h: 50 },
    { x: -210, z: -140, w: 14, d: 12, h: 46 },
    { x: -190, z: -165, w: 16, d: 14, h: 54 },

    // === FAR RIGHT SOUTH (x = 110 to 180) ===
    { x: 120, z: -100, w: 15, d: 13, h: 52 },
    { x: 140, z: -115, w: 16, d: 14, h: 58 },
    { x: 115, z: -130, w: 14, d: 12, h: 48 },
    { x: 160, z: -105, w: 14, d: 12, h: 50 },
    { x: 135, z: -145, w: 15, d: 13, h: 54 },
    { x: 155, z: -135, w: 16, d: 14, h: 56 },
    { x: 125, z: -160, w: 14, d: 12, h: 46 },
    { x: 175, z: -120, w: 15, d: 13, h: 52 },
    { x: 165, z: -150, w: 14, d: 12, h: 48 },
    { x: 145, z: -170, w: 15, d: 13, h: 50 },
    { x: 180, z: -140, w: 14, d: 12, h: 46 },
    { x: 170, z: -165, w: 16, d: 14, h: 54 },

    // === GAP BETWEEN ORIGINAL SOUTH AND HOTEL BACK (x = 88 to 115, z = -40 to -100) ===
    { x: 92, z: -45, w: 14, d: 12, h: 48 },
    { x: 105, z: -50, w: 15, d: 13, h: 52 },
    { x: 88, z: -60, w: 14, d: 12, h: 46 },
    { x: 100, z: -65, w: 16, d: 14, h: 55 },
    { x: 112, z: -58, w: 14, d: 12, h: 50 },
    { x: 95, z: -78, w: 15, d: 13, h: 54 },
    { x: 108, z: -75, w: 14, d: 12, h: 48 },
    { x: 90, z: -88, w: 16, d: 14, h: 56 },
    { x: 102, z: -85, w: 14, d: 12, h: 50 },
    { x: 115, z: -82, w: 15, d: 13, h: 52 },
    { x: 95, z: -95, w: 14, d: 12, h: 46 },
    { x: 108, z: -92, w: 15, d: 13, h: 50 },

    // === HOTEL BACK FOREST SOUTH (x = 110 to 200, z = -40 to -95) ===
    { x: 115, z: -45, w: 15, d: 13, h: 50 },
    { x: 135, z: -50, w: 16, d: 14, h: 56 },
    { x: 155, z: -45, w: 14, d: 12, h: 48 },
    { x: 175, z: -50, w: 15, d: 13, h: 52 },
    { x: 195, z: -48, w: 14, d: 12, h: 46 },
    { x: 125, z: -65, w: 16, d: 14, h: 58 },
    { x: 145, z: -60, w: 14, d: 12, h: 50 },
    { x: 165, z: -68, w: 15, d: 13, h: 54 },
    { x: 185, z: -62, w: 14, d: 12, h: 48 },
    { x: 118, z: -80, w: 15, d: 13, h: 52 },
    { x: 138, z: -75, w: 14, d: 12, h: 46 },
    { x: 158, z: -82, w: 16, d: 14, h: 56 },
    { x: 178, z: -78, w: 14, d: 12, h: 50 },
    { x: 198, z: -75, w: 15, d: 13, h: 48 },
    { x: 128, z: -92, w: 14, d: 12, h: 46 },
    { x: 148, z: -88, w: 15, d: 13, h: 52 },
    { x: 168, z: -95, w: 16, d: 14, h: 54 },
    { x: 188, z: -90, w: 14, d: 12, h: 48 },
  ];

  mainTowerPositions.forEach((pos, idx) => {
    buildings.push(createMainTower(scene, pos.x, pos.z, groundY, {
      width: pos.w, depth: pos.d, height: pos.h,
      neonColor: neonPalette[idx % neonPalette.length]
    }));
  });

  // Far south secondary/smaller buildings
  // Removed buildings on south road (x=-60 to -50, z=-35 to -150)
  const secondaryPositions = [
    // Fill gaps with smaller buildings
    // Left side
    // Removed: { x: -50, z: -100 } - on south road
    { x: -70, z: -105, w: 9, d: 7, h: 24 },
    // Removed: { x: -45, z: -118 } - near south road
    // Removed: { x: -65, z: -140 } - overlaps south road
    { x: -85, z: -145, w: 9, d: 8, h: 24 },
    { x: -75, z: -160, w: 10, d: 8, h: 28 },
    { x: -110, z: -105, w: 10, d: 8, h: 26 },
    { x: -95, z: -125, w: 9, d: 7, h: 22 },
    { x: -130, z: -110, w: 10, d: 8, h: 28 },
    { x: -115, z: -150, w: 11, d: 9, h: 30 },
    { x: -135, z: -145, w: 9, d: 8, h: 24 },
    { x: -105, z: -165, w: 10, d: 8, h: 26 },

    // Center
    { x: -5, z: -100, w: 9, d: 7, h: 24 },
    { x: 5, z: -105, w: 10, d: 8, h: 26 },
    { x: -20, z: -120, w: 10, d: 8, h: 28 },
    { x: 20, z: -125, w: 9, d: 7, h: 24 },
    { x: -30, z: -135, w: 10, d: 8, h: 26 },
    { x: 30, z: -130, w: 11, d: 9, h: 30 },
    { x: -15, z: -155, w: 9, d: 8, h: 24 },
    { x: 15, z: -150, w: 10, d: 8, h: 28 },
    { x: 0, z: -145, w: 10, d: 8, h: 26 },
    { x: -25, z: -165, w: 9, d: 7, h: 22 },
    { x: 25, z: -160, w: 10, d: 8, h: 26 },
    { x: 0, z: -180, w: 11, d: 9, h: 28 },

    // Right side
    { x: 40, z: -100, w: 10, d: 8, h: 26 },
    { x: 60, z: -108, w: 9, d: 7, h: 22 },
    { x: 55, z: -125, w: 10, d: 8, h: 28 },
    { x: 80, z: -130, w: 11, d: 9, h: 30 },
    { x: 95, z: -110, w: 9, d: 8, h: 24 },
    { x: 70, z: -145, w: 10, d: 8, h: 26 },
    { x: 90, z: -155, w: 10, d: 8, h: 28 },
    { x: 50, z: -160, w: 9, d: 7, h: 22 },
    { x: 65, z: -175, w: 10, d: 8, h: 26 },
    { x: 85, z: -170, w: 11, d: 9, h: 30 },

    // Extra dense fill
    { x: -35, z: -155, w: 8, d: 7, h: 20 },
    { x: 35, z: -150, w: 8, d: 7, h: 22 },
    // Removed: { x: -50, z: -165 } - near south road extension
    { x: 50, z: -170, w: 9, d: 8, h: 26 },
    { x: -70, z: -175, w: 10, d: 8, h: 28 },
    { x: 40, z: -180, w: 8, d: 7, h: 22 },
    { x: -40, z: -180, w: 9, d: 8, h: 24 },
    { x: -20, z: -185, w: 10, d: 8, h: 26 },
    { x: 20, z: -185, w: 9, d: 7, h: 24 },

    // === FAR LEFT SOUTH secondary buildings ===
    { x: -152, z: -105, w: 10, d: 8, h: 28 },
    { x: -168, z: -108, w: 9, d: 7, h: 24 },
    { x: -182, z: -112, w: 10, d: 8, h: 26 },
    { x: -158, z: -122, w: 11, d: 9, h: 30 },
    { x: -178, z: -128, w: 9, d: 8, h: 24 },
    { x: -195, z: -118, w: 10, d: 8, h: 28 },
    { x: -165, z: -138, w: 10, d: 8, h: 26 },
    { x: -188, z: -142, w: 9, d: 7, h: 22 },
    { x: -152, z: -148, w: 10, d: 8, h: 28 },
    { x: -205, z: -132, w: 11, d: 9, h: 30 },
    { x: -175, z: -155, w: 9, d: 8, h: 24 },
    { x: -198, z: -158, w: 10, d: 8, h: 26 },
    { x: -162, z: -172, w: 10, d: 8, h: 28 },
    { x: -185, z: -175, w: 9, d: 7, h: 22 },
    { x: -210, z: -155, w: 10, d: 8, h: 26 },
    { x: -200, z: -172, w: 11, d: 9, h: 28 },
    { x: -155, z: -185, w: 9, d: 8, h: 24 },
    { x: -178, z: -182, w: 10, d: 8, h: 26 },

    // === FAR RIGHT SOUTH secondary buildings ===
    { x: 112, z: -105, w: 10, d: 8, h: 28 },
    { x: 128, z: -108, w: 9, d: 7, h: 24 },
    { x: 148, z: -112, w: 10, d: 8, h: 26 },
    { x: 118, z: -122, w: 11, d: 9, h: 30 },
    { x: 152, z: -128, w: 9, d: 8, h: 24 },
    { x: 168, z: -118, w: 10, d: 8, h: 28 },
    { x: 130, z: -138, w: 10, d: 8, h: 26 },
    { x: 162, z: -142, w: 9, d: 7, h: 22 },
    { x: 112, z: -148, w: 10, d: 8, h: 28 },
    { x: 178, z: -132, w: 11, d: 9, h: 30 },
    { x: 148, z: -155, w: 9, d: 8, h: 24 },
    { x: 172, z: -158, w: 10, d: 8, h: 26 },
    { x: 128, z: -172, w: 10, d: 8, h: 28 },
    { x: 158, z: -175, w: 9, d: 7, h: 22 },
    { x: 182, z: -155, w: 10, d: 8, h: 26 },
    { x: 175, z: -172, w: 11, d: 9, h: 28 },
    { x: 118, z: -185, w: 9, d: 8, h: 24 },
    { x: 142, z: -182, w: 10, d: 8, h: 26 },

    // === GAP BETWEEN ORIGINAL SOUTH AND HOTEL BACK secondary buildings ===
    { x: 88, z: -48, w: 10, d: 8, h: 26 },
    { x: 98, z: -52, w: 9, d: 7, h: 22 },
    { x: 110, z: -48, w: 10, d: 8, h: 28 },
    { x: 92, z: -55, w: 9, d: 7, h: 24 },
    { x: 85, z: -68, w: 10, d: 8, h: 26 },
    { x: 95, z: -70, w: 11, d: 9, h: 30 },
    { x: 105, z: -68, w: 9, d: 8, h: 24 },
    { x: 88, z: -82, w: 10, d: 8, h: 28 },
    { x: 100, z: -78, w: 9, d: 7, h: 22 },
    { x: 112, z: -75, w: 10, d: 8, h: 26 },
    { x: 92, z: -90, w: 10, d: 8, h: 28 },
    { x: 85, z: -95, w: 9, d: 7, h: 22 },
    { x: 105, z: -88, w: 11, d: 9, h: 30 },
    { x: 98, z: -98, w: 10, d: 8, h: 26 },
    { x: 110, z: -95, w: 9, d: 8, h: 24 },

    // === HOTEL BACK FOREST SOUTH secondary buildings ===
    { x: 112, z: -48, w: 10, d: 8, h: 26 },
    { x: 128, z: -52, w: 9, d: 7, h: 22 },
    { x: 148, z: -48, w: 10, d: 8, h: 28 },
    { x: 168, z: -52, w: 11, d: 9, h: 30 },
    { x: 188, z: -55, w: 9, d: 8, h: 24 },
    { x: 118, z: -58, w: 10, d: 8, h: 26 },
    { x: 138, z: -55, w: 9, d: 7, h: 22 },
    { x: 158, z: -58, w: 10, d: 8, h: 28 },
    { x: 178, z: -55, w: 10, d: 8, h: 26 },
    { x: 198, z: -60, w: 9, d: 7, h: 22 },
    { x: 112, z: -72, w: 11, d: 9, h: 30 },
    { x: 132, z: -68, w: 10, d: 8, h: 26 },
    { x: 152, z: -72, w: 9, d: 8, h: 24 },
    { x: 172, z: -70, w: 10, d: 8, h: 28 },
    { x: 192, z: -68, w: 10, d: 8, h: 26 },
    { x: 122, z: -85, w: 9, d: 7, h: 22 },
    { x: 142, z: -82, w: 10, d: 8, h: 28 },
    { x: 162, z: -88, w: 11, d: 9, h: 30 },
    { x: 182, z: -85, w: 9, d: 8, h: 24 },
    { x: 202, z: -82, w: 10, d: 8, h: 26 },
    { x: 115, z: -95, w: 10, d: 8, h: 28 },
    { x: 135, z: -92, w: 9, d: 7, h: 22 },
    { x: 155, z: -98, w: 10, d: 8, h: 26 },
    { x: 175, z: -95, w: 11, d: 9, h: 30 },
    { x: 195, z: -92, w: 9, d: 8, h: 24 },
  ];

  secondaryPositions.forEach(pos => {
    buildings.push(createSmallBuilding(scene, pos.x, pos.z, groundY, {
      width: pos.w, depth: pos.d, height: pos.h
    }));
  });

  // Add some street lights in south area (expanded range)
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffdd88 });
  for (let x = -200; x <= 180; x += 25) {
    for (let z = -100; z >= -185; z -= 28) {
      // Lamp pole
      const poleGeom = new THREE.CylinderGeometry(0.15, 0.2, 8, 6);
      const poleMat = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
      const pole = new THREE.Mesh(poleGeom, poleMat);
      pole.position.set(x, 4, z);
      scene.add(pole);

      // Lamp head
      const lampGeom = new THREE.SphereGeometry(0.5, 8, 6);
      const lamp = new THREE.Mesh(lampGeom, lampMat);
      lamp.position.set(x, 8.2, z);
      scene.add(lamp);
    }
  }

  return buildings;
}

// ============================================
// Dead End Areas
// ============================================

/**
 * Create a dead end at the left or right side of the city
 */
export function createDeadEnd(scene, side) {
  const group = new THREE.Group();
  const x = side === 'left' ? -48.5 : 48.5;
  const sign = side === 'left' ? -1 : 1;

  // Retaining wall (vertical)
  const wallGeom = new THREE.BoxGeometry(1, 15, 40);
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });
  const wall = new THREE.Mesh(wallGeom, wallMat);
  wall.position.set(x, 7.5, 5);
  group.add(wall);

  // Wall texture lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x454555 });
  for (let i = 0; i < 5; i++) {
    const lineGeom = new THREE.BoxGeometry(0.05, 15, 0.3);
    const line = new THREE.Mesh(lineGeom, lineMat);
    line.position.set(x - sign * 0.4, 7.5, -12 + i * 8);
    group.add(line);
  }

  // End buildings (blocking view)
  const buildingMat = new THREE.MeshBasicMaterial({ color: randomColor(colors.building) });

  const bldg1Geom = new THREE.BoxGeometry(6, 25, 15);
  const bldg1 = new THREE.Mesh(bldg1Geom, buildingMat);
  bldg1.position.set(x + sign * 3, 12.5, -5);
  group.add(bldg1);

  const bldg2Geom = new THREE.BoxGeometry(5, 18, 12);
  const bldg2 = new THREE.Mesh(bldg2Geom, new THREE.MeshBasicMaterial({ color: randomColor(colors.building) }));
  bldg2.position.set(x + sign * 2.5, 9, 15);
  group.add(bldg2);

  // Add some windows to end buildings
  for (let i = 0; i < 6; i++) {
    const winMat = new THREE.MeshBasicMaterial({ color: randomColor(colors.window) });
    const winGeom = new THREE.PlaneGeometry(1.2, 1.8);
    const win = new THREE.Mesh(winGeom, winMat);
    win.rotation.y = -sign * Math.PI / 2;
    win.position.set(x + sign * 0.01, 5 + Math.floor(i / 2) * 5, -8 + (i % 2) * 6);
    group.add(win);
  }

  scene.add(group);
  return group;
}
