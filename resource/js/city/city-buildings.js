/**
 * city-buildings.js
 * Hong Kong Citypop Night City - Building System
 *
 * Layout:
 * - Residential District: x=-45~44, z=22~36, y=12
 * - Shopping District: x=-22~22, z=-3.5~11, y=2
 * - High-Rise Buildings: Left/Right/Center clusters
 * - Stairs: x=-18~18, z=11~18, y=2~10
 * - Utility Poles: Along residential road
 * - Vendor Stalls: In shopping alley
 * - Dead Ends: x=-50~-47 and x=47~50
 */

import * as THREE from 'three';

// ============================================
// Color Palettes
// ============================================
const colors = {
  // Building body colors (dark blue-purple)
  building: [
    0x2a3050, 0x352848, 0x2d3555, 0x3a2850,
    0x303858, 0x3d3060, 0x283048, 0x352d55
  ],
  // Window colors (pink/magenta 70%, cyan 30%)
  window: [
    0xff6090, 0xff5080, 0xe06088,
    0xff7098, 0xf05078, 0xe85090,
    0x50d0e0, 0x60c8d8, 0x70e0f0
  ],
  // Neon sign colors (muted/desaturated, dimmer)
  neon: {
    pink: 0x905060,
    cyan: 0x508088,
    yellow: 0x908050,
    magenta: 0x805070,
    blue: 0x506088,
    green: 0x508060,
    red: 0x884848
  },
  // Wall/fence colors
  concrete: 0x4a4a5a,
  darkConcrete: 0x3a3a4a,
  wood: 0x5a4030
};

// ============================================
// Helper Functions
// ============================================

function randomColor(palette) {
  return palette[Math.floor(Math.random() * palette.length)];
}

// ============================================
// Residential District (31 Houses)
// ============================================

// House style types - all use standard gable roof now
const houseStyles = {
  STANDARD: 'standard',   // Standard 1-story with gable roof
  TWO_STORY: 'two_story'  // 2-story house with gable roof
};

/**
 * Create a single house with wall, building, and gate
 */
function createHouse(scene, x, z, groundY, config = {}) {
  const group = new THREE.Group();

  const wallWidth = config.width || 5.5;
  const wallDepth = config.depth || 5;
  const wallHeight = 2.5;
  const wallThickness = 0.2;

  // Randomly select house style
  const styleOptions = Object.values(houseStyles);
  const houseStyle = config.style || styleOptions[Math.floor(Math.random() * styleOptions.length)];

  // Decide if house has yard (2/3 have yard, 1/3 no yard)
  const hasYard = config.hasYard !== undefined ? config.hasYard : Math.random() > 0.33;

  // Decide if house has roof (2/3 have roof, 1/3 flat roof)
  const hasRoof = config.hasRoof !== undefined ? config.hasRoof : Math.random() > 0.33;

  // Wall (hollow box) - darker colors matching building/roof tones (only if has yard)
  const wallColors = [0x2a2535, 0x252030, 0x2d2838, 0x28232d, 0x302a3a, 0x232028];
  const wallColor = wallColors[Math.floor(Math.random() * wallColors.length)];
  const wallMat = new THREE.MeshBasicMaterial({ color: wallColor });

  // Yard walls and gate (only if has yard)
  if (hasYard) {
    // Front wall (with gate opening)
    const gateWidth = 1.2;
    const gateOffset = (config.gateLeft ? -1 : 1) * (wallWidth/2 - gateWidth/2 - 0.3);

    // Left part of front wall
    const frontLeftWidth = wallWidth/2 + gateOffset - gateWidth/2;
    if (frontLeftWidth > 0.1) {
      const frontLeftGeom = new THREE.BoxGeometry(frontLeftWidth, wallHeight, wallThickness);
      const frontLeft = new THREE.Mesh(frontLeftGeom, wallMat);
      frontLeft.position.set(-wallWidth/2 + frontLeftWidth/2, wallHeight/2, -wallDepth/2);
      group.add(frontLeft);
    }

    // Right part of front wall
    const frontRightWidth = wallWidth/2 - gateOffset - gateWidth/2;
    if (frontRightWidth > 0.1) {
      const frontRightGeom = new THREE.BoxGeometry(frontRightWidth, wallHeight, wallThickness);
      const frontRight = new THREE.Mesh(frontRightGeom, wallMat);
      frontRight.position.set(wallWidth/2 - frontRightWidth/2, wallHeight/2, -wallDepth/2);
      group.add(frontRight);
    }

    // Back wall
    const backGeom = new THREE.BoxGeometry(wallWidth, wallHeight, wallThickness);
    const back = new THREE.Mesh(backGeom, wallMat);
    back.position.set(0, wallHeight/2, wallDepth/2);
    group.add(back);

    // Left wall
    const sideGeom = new THREE.BoxGeometry(wallThickness, wallHeight, wallDepth);
    const leftWall = new THREE.Mesh(sideGeom, wallMat);
    leftWall.position.set(-wallWidth/2, wallHeight/2, 0);
    group.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(sideGeom, wallMat);
    rightWall.position.set(wallWidth/2, wallHeight/2, 0);
    group.add(rightWall);

    // Gate (brown wood double door)
    const gateMat = new THREE.MeshBasicMaterial({ color: colors.wood });
    const gateGeom = new THREE.BoxGeometry(gateWidth, wallHeight * 0.8, 0.1);
    const gate = new THREE.Mesh(gateGeom, gateMat);
    gate.position.set(gateOffset, wallHeight * 0.4, -wallDepth/2);
    group.add(gate);

    // Gate frame (darker)
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x3a2820 });
    const frameGeom = new THREE.BoxGeometry(gateWidth + 0.2, 0.15, 0.15);
    const topFrame = new THREE.Mesh(frameGeom, frameMat);
    topFrame.position.set(gateOffset, wallHeight * 0.85, -wallDepth/2);
    group.add(topFrame);
  }

  // Main building inside compound - larger if no yard
  const buildingWidth = hasYard ? wallWidth * 0.7 : wallWidth * 0.95;
  const buildingDepth = hasYard ? wallDepth * 0.5 : wallDepth * 0.9;
  const isTwoStory = houseStyle === houseStyles.TWO_STORY;
  const buildingHeight = isTwoStory ? 5 + Math.random() * 1 : 3 + Math.random() * 1.5;
  const buildingColor = randomColor(colors.building);

  const buildingGeom = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const buildingMat = new THREE.MeshBasicMaterial({ color: buildingColor });
  const building = new THREE.Mesh(buildingGeom, buildingMat);
  // Position building - centered if no yard, offset if has yard
  const buildingZ = hasYard ? wallDepth/4 : 0;
  building.position.set(0, buildingHeight/2, buildingZ);
  group.add(building);

  // Roof (only if hasRoof is true, otherwise flat roof)
  if (hasRoof) {
    // Roof colors
    const roofColors = [0x1a1210, 0x151010, 0x1c1412, 0x18120e, 0x140f0c, 0x1e1614];
    const roofColor = roofColors[Math.floor(Math.random() * roofColors.length)];
    const roofMat = new THREE.MeshBasicMaterial({ color: roofColor });

    // Create proper gable roof (two sloped rectangles meeting at ridge)
    const roofHeight = 1.2 + Math.random() * 0.5;
    const roofOverhang = 0.3;
    const roofThickness = 0.15;

    // Calculate roof slope dimensions
    const halfWidth = buildingWidth / 2 + roofOverhang;
    const roofSlope = Math.sqrt(roofHeight * roofHeight + halfWidth * halfWidth);
    const roofAngle = Math.atan2(roofHeight, halfWidth);
    const roofLength = buildingDepth + roofOverhang * 2;

    // Left roof slope
    const leftRoofGeom = new THREE.BoxGeometry(roofSlope, roofThickness, roofLength);
    const leftRoof = new THREE.Mesh(leftRoofGeom, roofMat);
    leftRoof.rotation.z = roofAngle;
    leftRoof.position.set(-halfWidth / 2 + roofOverhang / 2, buildingHeight + roofHeight / 2, buildingZ);
    group.add(leftRoof);

    // Right roof slope
    const rightRoofGeom = new THREE.BoxGeometry(roofSlope, roofThickness, roofLength);
    const rightRoof = new THREE.Mesh(rightRoofGeom, roofMat);
    rightRoof.rotation.z = -roofAngle;
    rightRoof.position.set(halfWidth / 2 - roofOverhang / 2, buildingHeight + roofHeight / 2, buildingZ);
    group.add(rightRoof);

    // Ridge cap
    const ridgeGeom = new THREE.BoxGeometry(0.2, 0.1, roofLength);
    const ridgeMat = new THREE.MeshBasicMaterial({ color: 0x3d2914 });
    const ridge = new THREE.Mesh(ridgeGeom, ridgeMat);
    ridge.position.set(0, buildingHeight + roofHeight + 0.05, buildingZ);
    group.add(ridge);

    // Gable end triangles
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-buildingWidth / 2, 0);
    gableShape.lineTo(0, roofHeight);
    gableShape.lineTo(buildingWidth / 2, 0);
    gableShape.lineTo(-buildingWidth / 2, 0);

    const gableGeom = new THREE.ShapeGeometry(gableShape);
    const gableMat = new THREE.MeshBasicMaterial({ color: buildingColor, side: THREE.DoubleSide });

    const frontGable = new THREE.Mesh(gableGeom, gableMat);
    frontGable.position.set(0, buildingHeight, buildingZ - buildingDepth / 2);
    group.add(frontGable);

    const backGable = new THREE.Mesh(gableGeom, gableMat);
    backGable.position.set(0, buildingHeight, buildingZ + buildingDepth / 2);
    backGable.rotation.y = Math.PI;
    group.add(backGable);
  } else {
    // Flat roof for houses without gable roof
    const flatRoofGeom = new THREE.BoxGeometry(buildingWidth + 0.2, 0.15, buildingDepth + 0.2);
    const flatRoofMat = new THREE.MeshBasicMaterial({ color: 0x252530 });
    const flatRoof = new THREE.Mesh(flatRoofGeom, flatRoofMat);
    flatRoof.position.set(0, buildingHeight + 0.075, buildingZ);
    group.add(flatRoof);
  }

  // Add balcony for two-story houses
  if (isTwoStory && Math.random() > 0.4) {
    const balconyWidth = 1.5;
    const balconyGeom = new THREE.BoxGeometry(balconyWidth, 0.1, 0.8);
    const balconyMat = new THREE.MeshBasicMaterial({ color: 0x404550 });
    const balcony = new THREE.Mesh(balconyGeom, balconyMat);
    balcony.position.set(Math.random() > 0.5 ? -buildingWidth/3 : buildingWidth/3, buildingHeight * 0.55, buildingZ - buildingDepth/2 - 0.4);
    group.add(balcony);

    // Balcony railing
    const railGeom = new THREE.BoxGeometry(balconyWidth, 0.4, 0.05);
    const railMat = new THREE.MeshBasicMaterial({ color: 0x353545 });
    const rail = new THREE.Mesh(railGeom, railMat);
    rail.position.set(balcony.position.x, buildingHeight * 0.55 + 0.25, buildingZ - buildingDepth/2 - 0.75);
    group.add(rail);
  }

  // Building entrance door (front)
  const doorWidth = 0.8;
  const doorHeight = 1.8;
  const doorMat = new THREE.MeshBasicMaterial({ color: 0x3a2520 });
  const doorGeom = new THREE.PlaneGeometry(doorWidth, doorHeight);
  const door = new THREE.Mesh(doorGeom, doorMat);
  door.position.set(0, doorHeight/2, buildingZ - buildingDepth/2 - 0.01);
  group.add(door);

  // Door frame
  const doorFrameMat = new THREE.MeshBasicMaterial({ color: 0x2a1a15 });
  const doorFrameGeom = new THREE.PlaneGeometry(doorWidth + 0.15, doorHeight + 0.1);
  const doorFrame = new THREE.Mesh(doorFrameGeom, doorFrameMat);
  doorFrame.position.set(0, doorHeight/2, buildingZ - buildingDepth/2 - 0.02);
  group.add(doorFrame);

  // Door light (small light above door)
  const doorLightGeom = new THREE.BoxGeometry(0.15, 0.15, 0.1);
  const doorLightMat = new THREE.MeshBasicMaterial({ color: 0xffcc80 });
  const doorLight = new THREE.Mesh(doorLightGeom, doorLightMat);
  doorLight.position.set(0, doorHeight + 0.2, buildingZ - buildingDepth/2 - 0.05);
  group.add(doorLight);

  // ===== Fixed Window Pattern for Houses =====
  const windowGeom = new THREE.PlaneGeometry(0.6, 0.8);
  const windowColors = [colors.window[0], colors.window[3], colors.window[6], colors.window[1]]; // Fixed color pattern

  // Front windows - 2 windows at fixed positions
  const frontWin1 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[0], side: THREE.DoubleSide }));
  frontWin1.position.set(-buildingWidth * 0.25, buildingHeight * 0.65, buildingZ - buildingDepth/2 - 0.01);
  group.add(frontWin1);

  const frontWin2 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[1], side: THREE.DoubleSide }));
  frontWin2.position.set(buildingWidth * 0.25, buildingHeight * 0.65, buildingZ - buildingDepth/2 - 0.01);
  group.add(frontWin2);

  // Back windows - 2 windows at fixed positions
  const backWin1 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[2], side: THREE.DoubleSide }));
  backWin1.position.set(-buildingWidth * 0.25, buildingHeight * 0.6, buildingZ + buildingDepth/2 + 0.01);
  group.add(backWin1);

  const backWin2 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[3], side: THREE.DoubleSide }));
  backWin2.position.set(buildingWidth * 0.25, buildingHeight * 0.6, buildingZ + buildingDepth/2 + 0.01);
  group.add(backWin2);

  // Left side windows - 2 windows vertically stacked
  const leftWin1 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[0], side: THREE.DoubleSide }));
  leftWin1.position.set(-buildingWidth/2 - 0.01, buildingHeight * 0.45, buildingZ);
  group.add(leftWin1);

  const leftWin2 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[1], side: THREE.DoubleSide }));
  leftWin2.position.set(-buildingWidth/2 - 0.01, buildingHeight * 0.75, buildingZ);
  group.add(leftWin2);

  // Right side windows - 2 windows vertically stacked
  const rightWin1 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[2], side: THREE.DoubleSide }));
  rightWin1.position.set(buildingWidth/2 + 0.01, buildingHeight * 0.45, buildingZ);
  group.add(rightWin1);

  const rightWin2 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[3], side: THREE.DoubleSide }));
  rightWin2.position.set(buildingWidth/2 + 0.01, buildingHeight * 0.75, buildingZ);
  group.add(rightWin2);

  // Second floor front windows (for 2-story houses)
  if (isTwoStory) {
    const floor2Win1 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[2], side: THREE.DoubleSide }));
    floor2Win1.position.set(-buildingWidth * 0.25, buildingHeight * 0.35, buildingZ - buildingDepth/2 - 0.01);
    group.add(floor2Win1);

    const floor2Win2 = new THREE.Mesh(windowGeom, new THREE.MeshBasicMaterial({ color: windowColors[3], side: THREE.DoubleSide }));
    floor2Win2.position.set(buildingWidth * 0.25, buildingHeight * 0.35, buildingZ - buildingDepth/2 - 0.01);
    group.add(floor2Win2);
  }

  // Yard floor (dark green grass - only if has yard)
  if (hasYard) {
    const yardGeom = new THREE.PlaneGeometry(wallWidth - 0.4, wallDepth - 0.4);
    const yardMat = new THREE.MeshBasicMaterial({ color: 0x2a3a2a }); // Dark green
    const yard = new THREE.Mesh(yardGeom, yardMat);
    yard.rotation.x = -Math.PI / 2;
    yard.position.y = 0.01;
    group.add(yard);
  }

  group.position.set(x, groundY, z);
  group.userData.buildingSize = { width: wallWidth, depth: wallDepth, height: buildingHeight };
  scene.add(group);
  return group;
}

/**
 * Create all residential houses (25 total - removed 3 from each row on left/playground side)
 */
function createResidentialDistrict(scene) {
  const houses = [];
  const groundY = 10;

  // Row 1: 12 houses at z=45 (back row) - removed 3 leftmost houses
  const row1StartX = -24;  // Was -42, shifted right by 18 (3 houses * 6 spacing)
  const row1Spacing = 6;
  for (let i = 0; i < 12; i++) {
    const house = createHouse(scene, row1StartX + i * row1Spacing, 45, groundY, {
      width: 5.5,
      depth: 5,
      gateLeft: i % 2 === 0
    });
    houses.push(house);
  }

  // Row 2: 13 houses at z=36 (front row, offset) - removed 3 leftmost houses
  const row2StartX = -27.6;  // Was -45, shifted right by 17.4 (3 houses * 5.8 spacing)
  const row2Spacing = 5.8;
  for (let i = 0; i < 13; i++) {
    const house = createHouse(scene, row2StartX + i * row2Spacing, 36, groundY, {
      width: 5.2,
      depth: 4.5,
      gateLeft: i % 2 === 1
    });
    houses.push(house);
  }

  // === Village end guardrail (vertical, at road end connecting to horizontal guardrail) ===
  const railX = -47.5;    // Left edge of road (matches horizontal guardrail end)
  const railStartZ = 18.5; // Connect to horizontal guardrail at z=18.5
  const railEndZ = 48;     // End just before forest
  const railY = groundY;

  const railMat = new THREE.MeshBasicMaterial({ color: 0x656575 });
  const postMat = new THREE.MeshBasicMaterial({ color: 0x555565 });

  // Vertical guardrail bars (running along Z axis)
  const railLength = railEndZ - railStartZ;
  const railBarGeom = new THREE.BoxGeometry(0.08, 0.12, railLength);

  const railBar1 = new THREE.Mesh(railBarGeom, railMat);
  railBar1.position.set(railX, railY + 0.7, (railStartZ + railEndZ) / 2);
  scene.add(railBar1);

  const railBar2 = new THREE.Mesh(railBarGeom, railMat);
  railBar2.position.set(railX, railY + 0.4, (railStartZ + railEndZ) / 2);
  scene.add(railBar2);

  // Guardrail posts along the vertical rail
  const numPosts = Math.floor(railLength / 3) + 1;
  for (let i = 0; i < numPosts; i++) {
    const postZ = railStartZ + i * 3;
    if (postZ <= railEndZ) {
      const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
      const post = new THREE.Mesh(postGeom, postMat);
      post.position.set(railX, railY + 0.4, postZ);
      scene.add(post);
    }
  }

  return houses;
}

/**
 * Create houses on the right sloped extension area
 * Slope: x=47.5~92.5, y=10~16
 * Flat top: x=92.5~122.5, y=16
 */
function createSlopedResidentialArea(scene) {
  const houses = [];

  // Slope parameters
  const slopeStartX = 50;
  const slopeLength = 42;
  const slopeStartY = 10;
  const slopeEndY = 16;
  const slopeRatio = (slopeEndY - slopeStartY) / slopeLength;

  // Houses on the slope (2 rows)
  // Back row (z=42)
  for (let i = 0; i < 6; i++) {
    const x = slopeStartX + 4 + i * 7;
    const y = slopeStartY + (x - slopeStartX + 4) * slopeRatio; // Same level as road
    const house = createHouse(scene, x, 42, y, {
      width: 5,
      depth: 4.5,
      gateLeft: i % 2 === 0
    });
    houses.push(house);
  }

  // Front row (z=34)
  for (let i = 0; i < 5; i++) {
    const x = slopeStartX + 7 + i * 7;
    const y = slopeStartY + (x - slopeStartX + 7) * slopeRatio; // Same level as road
    const house = createHouse(scene, x, 34, y, {
      width: 4.8,
      depth: 4,
      gateLeft: i % 2 === 1
    });
    houses.push(house);
  }

  // Flat top area houses (x=95~120, y=16) - same level as road
  const flatY = slopeEndY;

  // Back row on flat top (z=42)
  for (let i = 0; i < 4; i++) {
    const house = createHouse(scene, 97 + i * 7, 42, flatY, {
      width: 5.2,
      depth: 4.5,
      gateLeft: i % 2 === 0
    });
    houses.push(house);
  }

  // Front row on flat top (z=34)
  for (let i = 0; i < 4; i++) {
    const house = createHouse(scene, 95 + i * 7, 34, flatY, {
      width: 5,
      depth: 4,
      gateLeft: i % 2 === 1
    });
    houses.push(house);
  }

  return houses;
}

// ============================================
// Shopping District (16 Shops)
// ============================================

/**
 * Create a shop building with neon border
 */
function createShopBuilding(scene, x, z, groundY, config = {}) {
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

  // ===== Fixed Window Grid Pattern for Shop Building =====
  const shopWinGeom = new THREE.PlaneGeometry(0.8, 1);
  const shopSideWinGeom = new THREE.PlaneGeometry(0.7, 0.9);
  const shopWinSpacingX = 1.8;
  const shopWinSpacingY = 2;
  const shopWinMargin = 1;

  // Fixed color pattern
  const shopWinColors = [
    colors.window[0], colors.window[3], colors.window[6], colors.window[1],
    colors.window[4], colors.window[7], colors.window[2], colors.window[5]
  ];

  // Calculate fixed grid dimensions
  const shopNumCols = Math.max(1, Math.floor((width - shopWinMargin * 2) / shopWinSpacingX) + 1);
  const shopNumRows = Math.max(1, Math.floor((height - 2.5) / shopWinSpacingY));
  const shopNumSideCols = Math.max(1, Math.floor((depth - shopWinMargin * 2) / shopWinSpacingX) + 1);

  // Front Windows - fixed grid (above door)
  for (let row = 0; row < shopNumRows; row++) {
    for (let col = 0; col < shopNumCols; col++) {
      const colorIdx = (row + col) % shopWinColors.length;
      const win = new THREE.Mesh(shopWinGeom, new THREE.MeshBasicMaterial({ color: shopWinColors[colorIdx], side: THREE.DoubleSide }));
      win.position.set(
        -width/2 + shopWinMargin + col * shopWinSpacingX,
        3 + row * shopWinSpacingY,
        -depth/2 - 0.01
      );
      group.add(win);
    }
  }

  // Back Windows - fixed grid
  for (let row = 0; row < shopNumRows + 1; row++) {
    for (let col = 0; col < shopNumCols; col++) {
      const colorIdx = (row + col + 2) % shopWinColors.length;
      const win = new THREE.Mesh(shopWinGeom, new THREE.MeshBasicMaterial({ color: shopWinColors[colorIdx], side: THREE.DoubleSide }));
      win.position.set(
        -width/2 + shopWinMargin + col * shopWinSpacingX,
        1.5 + row * shopWinSpacingY,
        depth/2 + 0.01
      );
      group.add(win);
    }
  }

  // Shop awning (colorful)
  const awningGeom = new THREE.BoxGeometry(width + 0.5, 0.2, 1.2);
  const awningMat = new THREE.MeshBasicMaterial({ color: neonColor });
  const awning = new THREE.Mesh(awningGeom, awningMat);
  awning.position.set(0, 2.8, -depth/2 - 0.5);
  group.add(awning);

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
  scene.add(group);
  return group;
}

/**
 * Create vertical neon sign (standing sign)
 */
function createVerticalSign(scene, x, z, groundY) {
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

/**
 * Create all shopping district buildings
 */
function createShoppingDistrict(scene) {
  const shops = [];
  const groundY = 2;
  const neonPalette = [
    colors.neon.pink, colors.neon.cyan, colors.neon.yellow,
    colors.neon.magenta, colors.neon.blue, colors.neon.green
  ];

  // Upper row shops (8 shops at z=13, closer to stairs)
  const upperStartX = -19;
  for (let i = 0; i < 8; i++) {
    const shop = createShopBuilding(scene, upperStartX + i * 5.2, 13, groundY, {
      width: 4.8,
      depth: 4,
      height: 5 + Math.random() * 2,
      neonColor: neonPalette[i % neonPalette.length]
    });
    shops.push(shop);
  }

  // Lower row shops (8 shops at z=0)
  const lowerStartX = -19;
  for (let i = 0; i < 8; i++) {
    const shop = createShopBuilding(scene, lowerStartX + i * 5.2, 0, groundY, {
      width: 4.8,
      depth: 3.5,
      height: 4 + Math.random() * 2,
      neonColor: neonPalette[(i + 3) % neonPalette.length]
    });
    shops.push(shop);
  }

  // Vertical signs - split into upper and lower rows
  // Upper row (near upper shops)
  for (let i = 0; i < 7; i++) {
    createVerticalSign(scene, upperStartX + 2.5 + i * 5.2, 10, groundY);
  }
  // Lower row (near lower shops)
  for (let i = 0; i < 7; i++) {
    createVerticalSign(scene, upperStartX + 2.5 + i * 5.2, 3, groundY);
  }

  return shops;
}

// ============================================
// High-Rise Buildings
// ============================================

/**
 * Create a main tower with window grid
 */
function createMainTower(scene, x, z, groundY, config = {}) {
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

  // Front windows - fixed grid (skip windows overlapping with entrance)
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const winX = -width/2 + winMargin + col * winSpacingX;
      const winY = 2 + row * winSpacingY;
      // Skip if overlapping with front entrance (center, y=0 to entranceHeight)
      if (Math.abs(winX) < entranceWidth/2 + 1.5 && winY < entranceHeight + 2) {
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

  // Back windows - fixed grid (skip windows overlapping with back entrance)
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const winX = -width/2 + winMargin + col * winSpacingX;
      const winY = 2 + row * winSpacingY;
      // Skip if overlapping with back entrance (center, y=0 to backEntranceHeight)
      if (Math.abs(winX) < backEntranceWidth/2 + 1.5 && winY < backEntranceHeight + 2) {
        continue;
      }
      const colorIdx = (row + col + 6) % towerWinColors.length;
      const win = new THREE.Mesh(winGeom, new THREE.MeshBasicMaterial({ color: towerWinColors[colorIdx], side: THREE.DoubleSide }));
      win.position.set(winX, winY, depth/2 + 0.01);
      group.add(win);
    }
  }

  // Building entrance (white door) - FRONT
  const entranceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const entranceGeom = new THREE.PlaneGeometry(entranceWidth, entranceHeight);
  const entrance = new THREE.Mesh(entranceGeom, entranceMat);
  entrance.position.set(0, entranceHeight/2, -depth/2 - 0.01);
  group.add(entrance);

  // Entrance canopy - FRONT (no frame)
  const canopyGeom = new THREE.BoxGeometry(entranceWidth + 2, 0.3, 2);
  const canopyMat = new THREE.MeshBasicMaterial({ color: 0x252535 });
  const canopy = new THREE.Mesh(canopyGeom, canopyMat);
  canopy.position.set(0, entranceHeight + 0.3, -depth/2 - 1);
  group.add(canopy);

  // Back entrance (white door) - no frame
  const backEntranceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const backEntranceGeom = new THREE.PlaneGeometry(backEntranceWidth, backEntranceHeight);
  const backEntrance = new THREE.Mesh(backEntranceGeom, backEntranceMat);
  backEntrance.position.set(0, backEntranceHeight/2, depth/2 + 0.01);
  group.add(backEntrance);

  // Rooftop antenna (for tall buildings)
  if (height > 30) {
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

  group.position.set(x, groundY, z);
  group.userData.buildingSize = { width, depth, height };
  scene.add(group);
  return group;
}

/**
 * Create a smaller building
 */
function createSmallBuilding(scene, x, z, groundY, config = {}) {
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

  // Front Windows - fixed grid (skip windows overlapping with door)
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const winX = -width/2 + winMargin + col * winSpacingX;
      const winY = 2 + row * winSpacingY;
      // Skip if overlapping with front door
      if (Math.abs(winX) < doorWidth/2 + 1.5 && winY < doorHeight + 2) {
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

  // Back Windows - fixed grid (skip windows overlapping with back door)
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const winX = -width/2 + winMargin + col * winSpacingX;
      const winY = 2 + row * winSpacingY;
      // Skip if overlapping with back door
      if (Math.abs(winX) < backDoorWidth/2 + 1.5 && winY < backDoorHeight + 2) {
        continue;
      }
      const colorIdx = (row + col + 6) % smallWinColors.length;
      const win = new THREE.Mesh(sideWinGeom, new THREE.MeshBasicMaterial({ color: smallWinColors[colorIdx], side: THREE.DoubleSide }));
      win.position.set(winX, winY, depth/2 + 0.01);
      group.add(win);
    }
  }

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

  group.position.set(x, groundY, z);
  group.userData.buildingSize = { width, depth, height };
  scene.add(group);
  return group;
}

/**
 * Create left side buildings cluster (expanded 2x area - extended to x=-160)
 */
function createLeftBuildings(scene) {
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
function createRightBuildings(scene) {
  const buildings = [];
  const groundY = 0;

  // Main towers (multiple) - moved down for wider road
  buildings.push(createMainTower(scene, 38, -35, groundY, {
    width: 14, depth: 12, height: 43, neonColor: colors.neon.cyan
  }));
  buildings.push(createMainTower(scene, 55, -45, groundY, {
    width: 16, depth: 14, height: 52, neonColor: colors.neon.yellow
  }));
  buildings.push(createMainTower(scene, 70, -30, groundY, {
    width: 12, depth: 10, height: 40, neonColor: colors.neon.green
  }));
  buildings.push(createMainTower(scene, 45, -65, groundY, {
    width: 14, depth: 12, height: 48, neonColor: colors.neon.cyan
  }));
  buildings.push(createMainTower(scene, 65, -70, groundY, {
    width: 15, depth: 13, height: 46, neonColor: colors.neon.pink
  }));

  // Secondary buildings (many more) - moved down for wider road
  // Removed buildings overlapping with main road (z=-25 to z=-15)
  const secondaryPositions = [
    { x: 32, z: -38, w: 10, d: 8, h: 22 },
    { x: 42, z: -32, w: 8, d: 6, h: 18 },
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
    { x: 78, z: -65, w: 8, d: 7, h: 16 },
    { x: 62, z: -28, w: 7, d: 6, h: 14 }
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
function createCenterBuildings(scene) {
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
function createSouthBuildings(scene) {
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

  // Ground plane for south area (expanded for far left/right)
  const southGroundGeom = new THREE.PlaneGeometry(500, 130);
  const southGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a1a25 });
  const southGround = new THREE.Mesh(southGroundGeom, southGroundMat);
  southGround.rotation.x = -Math.PI / 2;
  southGround.position.set(-10, 0.005, -145);
  scene.add(southGround);

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
// Forest behind Residential District
// ============================================

/**
 * Create a forest tree (larger, varied)
 */
function createForestTree(scene, x, z, groundY) {
  const group = new THREE.Group();
  const scale = 1.0 + Math.random() * 1.5;
  const treeType = Math.floor(Math.random() * 3);

  // Trunk
  const trunkHeight = 3 * scale;
  const trunkGeom = new THREE.CylinderGeometry(0.2 * scale, 0.4 * scale, trunkHeight, 6);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3a3040 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = trunkHeight / 2;
  group.add(trunk);

  // Foliage colors (dark forest greens with slight variation)
  const foliageColors = [0x2a4050, 0x254545, 0x2a5045, 0x224040, 0x1f3838];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

  if (treeType === 0) {
    // Cone tree (pine-like)
    const foliageGeom = new THREE.ConeGeometry(2 * scale, 5 * scale, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 2.5 * scale;
    group.add(foliage);
  } else if (treeType === 1) {
    // Layered cone tree
    for (let i = 0; i < 3; i++) {
      const layerScale = 1 - i * 0.25;
      const layerGeom = new THREE.ConeGeometry(2.2 * scale * layerScale, 2 * scale, 6);
      const layer = new THREE.Mesh(layerGeom, foliageMat);
      layer.position.y = trunkHeight + 1 * scale + i * 1.5 * scale;
      group.add(layer);
    }
  } else {
    // Round tree (deciduous-like)
    const foliageGeom = new THREE.SphereGeometry(2.5 * scale, 8, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 2 * scale;
    group.add(foliage);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create forest behind residential district
 */
function createForest(scene) {
  const trees = [];
  const groundY = 10; // Same level as residential road

  // Forest area: z = 50 to 88, x = -60 to 60 (moved up +13)
  const forestMinZ = 50;
  const forestMaxZ = 88;
  const forestMinX = -65;
  const forestMaxX = 65;

  // Dense tree placement
  for (let z = forestMinZ; z < forestMaxZ; z += 3 + Math.random() * 2) {
    for (let x = forestMinX; x < forestMaxX; x += 3 + Math.random() * 2) {
      // Add some randomness to position
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetZ = (Math.random() - 0.5) * 2;

      // Skip some spots for natural look
      if (Math.random() > 0.15) {
        trees.push(createForestTree(scene, x + offsetX, z + offsetZ, groundY));
      }
    }
  }

  // Add ground plane for forest (moved up +13)
  const forestGroundGeom = new THREE.PlaneGeometry(140, 50);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2520 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(0, groundY - 0.01, 69);
  scene.add(forestGround);

  return trees;
}

// ============================================
// Wall-Attached Stairs System
// ============================================

/**
 * Create stairs attached to the wall, running along X axis
 * Left stairs go from center to left (-X), right stairs go from center to right (+X)
 * One side of stairs is always against the wall (z=18)
 */
function createZigzagStairs(scene) {
  const group = new THREE.Group();
  const stairMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });
  const railMat = new THREE.MeshBasicMaterial({ color: 0x656575 });

  // Parameters
  const topY = 10;
  const bottomY = 0; // Extended to ground level
  const heightDiff = topY - bottomY;
  const stepHeight = 0.2;
  const numSteps = Math.floor(heightDiff / stepHeight);
  const stepDepth = 3; // Depth toward shopping district (Z direction)
  const stepWidth = 0.5; // Width of each step (X direction)
  const wallZ = 18.5; // Wall position

  // Top landing platform at center
  const topLandingGeom = new THREE.BoxGeometry(6, 0.4, stepDepth);
  const topLanding = new THREE.Mesh(topLandingGeom, stairMat);
  topLanding.position.set(0, topY, wallZ - stepDepth / 2);
  group.add(topLanding);

  // Top landing front safety rail (outer side, away from wall)
  const topRailZ = wallZ - stepDepth - 0.1;

  // Left post
  const topLeftPostGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
  const topLeftPost = new THREE.Mesh(topLeftPostGeom, railMat);
  topLeftPost.position.set(-3, topY + 0.5, topRailZ);
  group.add(topLeftPost);

  // Right post
  const topRightPostGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
  const topRightPost = new THREE.Mesh(topRightPostGeom, railMat);
  topRightPost.position.set(3, topY + 0.5, topRailZ);
  group.add(topRightPost);

  // Horizontal rail connecting posts
  const topHorizRailGeom = new THREE.BoxGeometry(6, 0.08, 0.08);
  const topHorizRail = new THREE.Mesh(topHorizRailGeom, railMat);
  topHorizRail.position.set(0, topY + 0.95, topRailZ);
  group.add(topHorizRail);

  // Left stairs: from center (x=0) to left, attached to wall
  for (let i = 0; i < numSteps; i++) {
    const stepGeom = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeom, stairMat);
    step.position.set(
      -3 - i * stepWidth, // Moving left
      topY - i * stepHeight - stepHeight / 2,
      wallZ - stepDepth / 2
    );
    group.add(step);
  }

  // Left stairs - front railing (away from wall)
  for (let i = 0; i < numSteps; i += 5) {
    const postGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
    const post = new THREE.Mesh(postGeom, railMat);
    post.position.set(
      -3 - i * stepWidth,
      topY - i * stepHeight + 0.4,
      wallZ - stepDepth - 0.1
    );
    group.add(post);
  }

  // Left stairs - horizontal rail
  const leftRailLength = numSteps * stepWidth;
  const leftRailGeom = new THREE.BoxGeometry(leftRailLength, 0.08, 0.08);
  const leftRail = new THREE.Mesh(leftRailGeom, railMat);
  leftRail.position.set(
    -3 - leftRailLength / 2,
    (topY + bottomY) / 2 + 0.9,
    wallZ - stepDepth - 0.1
  );
  leftRail.rotation.z = Math.atan2(heightDiff, leftRailLength);
  group.add(leftRail);

  // Right stairs: from center (x=0) to right, attached to wall
  for (let i = 0; i < numSteps; i++) {
    const stepGeom = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeom, stairMat);
    step.position.set(
      3 + i * stepWidth, // Moving right
      topY - i * stepHeight - stepHeight / 2,
      wallZ - stepDepth / 2
    );
    group.add(step);
  }

  // Right stairs - front railing (away from wall)
  for (let i = 0; i < numSteps; i += 5) {
    const postGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
    const post = new THREE.Mesh(postGeom, railMat);
    post.position.set(
      3 + i * stepWidth,
      topY - i * stepHeight + 0.4,
      wallZ - stepDepth - 0.1
    );
    group.add(post);
  }

  // Right stairs - horizontal rail
  const rightRailGeom = new THREE.BoxGeometry(leftRailLength, 0.08, 0.08);
  const rightRail = new THREE.Mesh(rightRailGeom, railMat);
  rightRail.position.set(
    3 + leftRailLength / 2,
    (topY + bottomY) / 2 + 0.9,
    wallZ - stepDepth - 0.1
  );
  rightRail.rotation.z = -Math.atan2(heightDiff, leftRailLength);
  group.add(rightRail);

  // Fill below stairs (solid wall like retaining wall)
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x18181f });
  const pillarMat = new THREE.MeshBasicMaterial({ color: 0x141418 });

  // Left stairs fill - create sloped fill using multiple boxes
  const stairTotalWidth = numSteps * stepWidth;
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const xPos = -3 - t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const fillHeight = currentY - 0; // From ground (y=0) to stair bottom

    if (fillHeight > 0.5) {
      const fillGeom = new THREE.BoxGeometry(stairTotalWidth / 20 + 0.1, fillHeight, stepDepth);
      const fill = new THREE.Mesh(fillGeom, fillMat);
      fill.position.set(xPos, fillHeight / 2, wallZ - stepDepth / 2);
      group.add(fill);
    }
  }

  // Left stairs vertical pillars on front
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const xPos = -3 - t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const pillarHeight = currentY;

    if (pillarHeight > 1) {
      const pillarGeom = new THREE.BoxGeometry(0.4, pillarHeight, 0.2);
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(xPos, pillarHeight / 2, wallZ - stepDepth - 0.1);
      group.add(pillar);
    }
  }

  // Right stairs fill
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const xPos = 3 + t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const fillHeight = currentY - 0;

    if (fillHeight > 0.5) {
      const fillGeom = new THREE.BoxGeometry(stairTotalWidth / 20 + 0.1, fillHeight, stepDepth);
      const fill = new THREE.Mesh(fillGeom, fillMat);
      fill.position.set(xPos, fillHeight / 2, wallZ - stepDepth / 2);
      group.add(fill);
    }
  }

  // Right stairs vertical pillars on front
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const xPos = 3 + t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const pillarHeight = currentY;

    if (pillarHeight > 1) {
      const pillarGeom = new THREE.BoxGeometry(0.4, pillarHeight, 0.2);
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(xPos, pillarHeight / 2, wallZ - stepDepth - 0.1);
      group.add(pillar);
    }
  }

  // Horizontal bands on stair fills (like retaining wall)
  const bandMat = new THREE.MeshBasicMaterial({ color: 0x1c1c24 });
  const bandGeom = new THREE.BoxGeometry(stairTotalWidth, 0.15, 0.15);

  // Left stair bands
  const leftBand1 = new THREE.Mesh(bandGeom, bandMat);
  leftBand1.position.set(-3 - stairTotalWidth / 2, 3, wallZ - stepDepth - 0.1);
  group.add(leftBand1);

  const leftBand2 = new THREE.Mesh(bandGeom, bandMat);
  leftBand2.position.set(-3 - stairTotalWidth / 2, 6, wallZ - stepDepth - 0.1);
  group.add(leftBand2);

  // Right stair bands
  const rightBand1 = new THREE.Mesh(bandGeom, bandMat);
  rightBand1.position.set(3 + stairTotalWidth / 2, 3, wallZ - stepDepth - 0.1);
  group.add(rightBand1);

  const rightBand2 = new THREE.Mesh(bandGeom, bandMat);
  rightBand2.position.set(3 + stairTotalWidth / 2, 6, wallZ - stepDepth - 0.1);
  group.add(rightBand2);

  scene.add(group);
  return group;
}

// ============================================
// Utility Poles & Power Lines
// ============================================

/**
 * Create a single utility pole
 */
function createUtilityPole(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  // Main pole
  const poleGeom = new THREE.CylinderGeometry(0.12, 0.15, 8, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = 4;
  group.add(pole);

  // Cross arm 1 (upper)
  const armGeom = new THREE.BoxGeometry(3, 0.15, 0.15);
  const armMat = new THREE.MeshBasicMaterial({ color: 0x656575 });
  const arm1 = new THREE.Mesh(armGeom, armMat);
  arm1.position.y = 7.5;
  group.add(arm1);

  // Cross arm 2 (lower)
  const arm2 = new THREE.Mesh(armGeom, armMat);
  arm2.position.y = 6.5;
  group.add(arm2);

  // Insulators
  const insGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.3, 6);
  const insMat = new THREE.MeshBasicMaterial({ color: 0x206080 });

  [-1.2, 0, 1.2].forEach(offset => {
    const ins1 = new THREE.Mesh(insGeom, insMat);
    ins1.position.set(offset, 7.7, 0);
    group.add(ins1);

    const ins2 = new THREE.Mesh(insGeom, insMat);
    ins2.position.set(offset, 6.7, 0);
    group.add(ins2);
  });

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

/**
 * Create power line between two poles
 */
function createPowerLine(scene, startX, endX, z, y, sag = 0.5) {
  const points = [];
  const segments = 20;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = startX + (endX - startX) * t;
    // Catenary approximation with sag
    const sagY = sag * Math.sin(Math.PI * t);
    points.push(new THREE.Vector3(x, y - sagY, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.02, 4, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x202020 });
  const wire = new THREE.Mesh(tubeGeom, tubeMat);
  scene.add(wire);
  return wire;
}

/**
 * Create all utility poles and power lines
 */
function createUtilitySystem(scene) {
  const poles = [];
  const wires = [];
  const groundY = 10;
  const z = 28; // House side (near residential district)

  // Pole positions - reduced to half (4 poles)
  const poleXPositions = [-35, -11, 13, 37];

  poleXPositions.forEach(x => {
    poles.push(createUtilityPole(scene, x, z, groundY, Math.PI / 2));
  });

  // Power lines between poles
  for (let i = 0; i < poleXPositions.length - 1; i++) {
    // Upper wire
    wires.push(createPowerLine(scene, poleXPositions[i], poleXPositions[i + 1], z, groundY + 7.5, 0.3));
    // Lower wire
    wires.push(createPowerLine(scene, poleXPositions[i], poleXPositions[i + 1], z, groundY + 6.5, 0.4));
  }

  // === Extended poles along slope and flat top ===
  // Slope parameters: x=47.5~92.5, y=10~16
  const slopeStartX = 47.5;
  const slopeEndX = 92.5;
  const slopeStartY = 10;
  const slopeEndY = 16;
  const slopeLength = slopeEndX - slopeStartX;

  // Poles on slope (3 poles)
  const slopePolePositions = [55, 70, 85];
  slopePolePositions.forEach(x => {
    const t = (x - slopeStartX) / slopeLength;
    const y = slopeStartY + t * (slopeEndY - slopeStartY);
    poles.push(createUtilityPole(scene, x, z, y, Math.PI / 2));
  });

  // Poles on flat top (2 poles) - y=16
  const flatPolePositions = [100, 115];
  flatPolePositions.forEach(x => {
    poles.push(createUtilityPole(scene, x, z, slopeEndY, Math.PI / 2));
  });

  // Connect last main pole to first slope pole
  wires.push(createPowerLine(scene, 37, 55, z, groundY + 7.5, 0.3));
  wires.push(createPowerLine(scene, 37, 55, z, groundY + 6.5, 0.4));

  return { poles, wires };
}

// ============================================
// Vendor Stalls
// ============================================

/**
 * Create a single vendor stall
 */
function createVendorStall(scene, x, z, groundY) {
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
function createVendorStalls(scene) {
  const stalls = [];
  const groundY = 2;

  // Upper row (closer to upper shops at z=13): 11 stalls
  for (let i = 0; i < 11; i++) {
    stalls.push(createVendorStall(scene, -18 + i * 3.6, 9, groundY));
  }

  // Lower row (closer to lower shops at z=0): 11 stalls
  for (let i = 0; i < 11; i++) {
    stalls.push(createVendorStall(scene, -16.2 + i * 3.6, 2, groundY));
  }

  return stalls;
}

// ============================================
// Trees & Street Lamps
// ============================================

/**
 * Create a tree
 */
function createTree(scene, x, z, groundY) {
  const group = new THREE.Group();
  const scale = 1.0 + Math.random() * 0.5; // Taller base scale
  const treeType = Math.floor(Math.random() * 3); // 3 types: single cone, layered, round

  // Trunk (taller)
  const trunkHeight = 3 * scale;
  const trunkGeom = new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, trunkHeight, 6);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3a3040 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = trunkHeight / 2;
  group.add(trunk);

  // 3 foliage colors (dark green, teal, olive)
  const foliageColors = [0x1a4035, 0x2a4555, 0x354530];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

  if (treeType === 0) {
    // Single cone tree (pine-like)
    const foliageGeom = new THREE.ConeGeometry(1.8 * scale, 4.5 * scale, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 2.2 * scale;
    group.add(foliage);
  } else if (treeType === 1) {
    // 2-tier layered tree
    for (let i = 0; i < 2; i++) {
      const layerScale = 1 - i * 0.3;
      const layerGeom = new THREE.ConeGeometry(2 * scale * layerScale, 2.5 * scale, 6);
      const layer = new THREE.Mesh(layerGeom, foliageMat);
      layer.position.y = trunkHeight + 1.2 * scale + i * 2 * scale;
      group.add(layer);
    }
  } else {
    // Round tree (deciduous-like)
    const foliageGeom = new THREE.SphereGeometry(2 * scale, 8, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 1.8 * scale;
    group.add(foliage);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a street lamp
 * @param {number} rotation - Optional rotation in radians (0 = arm extends in +X, Math.PI/2 = arm extends in +Z)
 */
function createStreetLamp(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();
  const lampColors = [0xffd0e0, 0xd0ffff, 0xffe0a0, 0xffffff];
  const lampColor = lampColors[Math.floor(Math.random() * lampColors.length)];

  // Pole (taller)
  const poleHeight = 6;
  const poleGeom = new THREE.CylinderGeometry(0.1, 0.15, poleHeight, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = poleHeight / 2;
  group.add(pole);

  // Arm
  const armGeom = new THREE.BoxGeometry(1.5, 0.12, 0.12);
  const arm = new THREE.Mesh(armGeom, poleMat);
  arm.position.set(0.65, poleHeight, 0);
  group.add(arm);

  // Lamp head (box style)
  const headGeom = new THREE.BoxGeometry(0.5, 0.3, 0.4);
  const headMat = new THREE.MeshBasicMaterial({ color: 0x353545 });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(1.3, poleHeight - 0.15, 0);
  group.add(head);

  // Lamp bulb (bright)
  const lampGeom = new THREE.SphereGeometry(0.25, 8, 6);
  const lampMat = new THREE.MeshBasicMaterial({ color: lampColor });
  const lamp = new THREE.Mesh(lampGeom, lampMat);
  lamp.position.set(1.3, poleHeight - 0.35, 0);
  group.add(lamp);

  // Lamp glow (larger, more visible)
  const glowGeom = new THREE.SphereGeometry(0.8, 8, 6);
  const glowMat = new THREE.MeshBasicMaterial({
    color: lampColor,
    transparent: true,
    opacity: 0.25,
    depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  glow.position.set(1.3, poleHeight - 0.35, 0);
  group.add(glow);

  // Ground light pool effect (further from pole) - warm yellow
  const poolGeom = new THREE.CircleGeometry(3.5, 16);
  const poolMat = new THREE.MeshBasicMaterial({
    color: 0xffcc44,
    transparent: true,
    opacity: 0.12,
    depthWrite: false
  });
  const pool = new THREE.Mesh(poolGeom, poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(6, 0.02, 0);
  group.add(pool);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation; // Apply rotation to face different directions
  scene.add(group);
  return group;
}

/**
 * Create T-shaped street lamp (illuminates both sidewalk and road)
 */
function createTStreetLamp(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();
  const lampColors = [0xffd0e0, 0xd0ffff, 0xffe0a0, 0xffffff];
  const lampColor = lampColors[Math.floor(Math.random() * lampColors.length)];

  // Pole (taller)
  const poleHeight = 6.5;
  const poleGeom = new THREE.CylinderGeometry(0.12, 0.18, poleHeight, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = poleHeight / 2;
  group.add(pole);

  // T-shaped horizontal bar
  const barGeom = new THREE.BoxGeometry(3.5, 0.15, 0.15);
  const bar = new THREE.Mesh(barGeom, poleMat);
  bar.position.set(0, poleHeight, 0);
  group.add(bar);

  const headMat = new THREE.MeshBasicMaterial({ color: 0x353545 });
  const lampMat = new THREE.MeshBasicMaterial({ color: lampColor });
  const glowMat = new THREE.MeshBasicMaterial({
    color: lampColor,
    transparent: true,
    opacity: 0.25,
    depthWrite: false
  });
  const poolMat = new THREE.MeshBasicMaterial({
    color: 0xffcc44,
    transparent: true,
    opacity: 0.1,
    depthWrite: false
  });

  // Create lamp heads on both sides
  [-1, 1].forEach(side => {
    // Lamp head (box style)
    const headGeom = new THREE.BoxGeometry(0.5, 0.3, 0.4);
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.set(side * 1.5, poleHeight - 0.15, 0);
    group.add(head);

    // Lamp bulb (bright)
    const lampGeom = new THREE.SphereGeometry(0.25, 8, 6);
    const lamp = new THREE.Mesh(lampGeom, lampMat);
    lamp.position.set(side * 1.5, poleHeight - 0.35, 0);
    group.add(lamp);

    // Lamp glow
    const glowGeom = new THREE.SphereGeometry(0.7, 8, 6);
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.set(side * 1.5, poleHeight - 0.35, 0);
    group.add(glow);

    // Ground light pool effect
    const poolGeom = new THREE.CircleGeometry(3, 16);
    const pool = new THREE.Mesh(poolGeom, poolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(side * 4, 0.02, 0);
    group.add(pool);
  });

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

/**
 * Create all trees
 */
function createAllTrees(scene) {
  const trees = [];

  // Upper sidewalk trees (near main road, y=0) - moved down for wider road
  for (let i = 0; i < 9; i++) {
    trees.push(createTree(scene, -40 + i * 10, -14, 0));
  }

  // Lower sidewalk trees - moved down for wider road
  for (let i = 0; i < 9; i++) {
    trees.push(createTree(scene, -35 + i * 10, -28, 0));
  }

  // South road - left sidewalk trees (x=-62, forest side)
  const southLeftTreeZ = [-50, -75, -100, -125, -150, -175, -200, -225];
  southLeftTreeZ.forEach(z => {
    trees.push(createTree(scene, -62, z, 0));
  });

  // South road - right sidewalk trees (x=-48, building side)
  const southRightTreeZ = [-60, -85, -110, -135, -160, -185, -210, -235];
  southRightTreeZ.forEach(z => {
    trees.push(createTree(scene, -48, z, 0));
  });

  return trees;
}

/**
 * Create all street lamps
 */
function createAllStreetLamps(scene) {
  const lamps = [];

  // Main road - T-shaped lamps on upper sidewalk (z=-14)
  // T-bar perpendicular to road: one head toward road (-Z), one toward sidewalk (+Z)
  for (let i = 0; i < 10; i++) {
    lamps.push(createTStreetLamp(scene, -45 + i * 10, -14, 0, Math.PI / 2));
  }

  // Main road - T-shaped lamps on lower sidewalk (z=-28)
  // T-bar perpendicular to road: one head toward road (+Z), one toward sidewalk (-Z)
  for (let i = 0; i < 10; i++) {
    lamps.push(createTStreetLamp(scene, -40 + i * 10, -28, 0, Math.PI / 2));
  }

  // Residential road lamps (y=10) - regular lamps facing toward houses
  for (let i = 0; i < 10; i++) {
    lamps.push(createStreetLamp(scene, -45 + i * 10, 20, 10, -Math.PI / 2));
  }

  // Sloped road lamps - y increases with x
  const slopeStartX = 47.5;
  const slopeEndX = 92.5;
  const slopeStartY = 10;
  const slopeEndY = 16;
  const slopeLength = slopeEndX - slopeStartX;

  const slopeLampPositions = [55, 70, 85];
  slopeLampPositions.forEach(x => {
    const t = (x - slopeStartX) / slopeLength;
    const y = slopeStartY + t * (slopeEndY - slopeStartY);
    lamps.push(createStreetLamp(scene, x, 20, y, -Math.PI / 2));
  });

  // Flat top road lamps (y=16)
  const flatLampPositions = [100, 115];
  flatLampPositions.forEach(x => {
    lamps.push(createStreetLamp(scene, x, 20, slopeEndY, -Math.PI / 2));
  });

  // South road - T-shaped lamps on sidewalks (not on road)
  // Road at x=-55, left sidewalk x=-62, right sidewalk x=-48
  // T-bar perpendicular to road (rotation=0): heads point toward road and away

  // Left sidewalk (x=-62) - forest side (8 lamps)
  const southLeftLampZ = [-45, -70, -95, -120, -145, -170, -195, -220];
  southLeftLampZ.forEach(z => {
    lamps.push(createTStreetLamp(scene, -62, z, 0, 0));
  });

  // Right sidewalk (x=-48) - building side (8 lamps)
  const southRightLampZ = [-55, -80, -105, -130, -155, -180, -205, -230];
  southRightLampZ.forEach(z => {
    lamps.push(createTStreetLamp(scene, -48, z, 0, 0));
  });

  // Curved road area - T-shaped lamps on outer edge of curve
  // Curve center at x=-40, z=-35, road radius=15, outer edge radius=20
  const curveCenter = { x: -40, z: -35 };
  const outerRadius = 22; // Outside the road curve
  const curveAngles = [Math.PI * 0.55, Math.PI * 0.75, Math.PI * 0.92];
  curveAngles.forEach(angle => {
    const lampX = curveCenter.x + outerRadius * Math.cos(angle);
    const lampZ = curveCenter.z + outerRadius * Math.sin(angle);
    // T-bar tangent to curve, heads point toward road (inward) and outward
    lamps.push(createTStreetLamp(scene, lampX, lampZ, 0, angle));
  });

  return lamps;
}

// ============================================
// Parks (beside Shopping District)
// ============================================

/**
 * Create a park tree (smaller decorative tree)
 */
function createParkTree(scene, x, z, groundY) {
  const group = new THREE.Group();
  const scale = 0.5 + Math.random() * 0.4;

  // Trunk
  const trunkGeom = new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, 1.5 * scale, 6);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3a3040 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = 0.75 * scale;
  group.add(trunk);

  // Foliage (round shape)
  const foliageColors = [0x2a4a40, 0x254540, 0x2a5545, 0x224538];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  const foliageGeom = new THREE.SphereGeometry(1.2 * scale, 8, 6);
  const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });
  const foliage = new THREE.Mesh(foliageGeom, foliageMat);
  foliage.position.y = 2 * scale;
  group.add(foliage);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a park bench
 */
function createParkBench(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  // Seat
  const seatGeom = new THREE.BoxGeometry(1.5, 0.1, 0.5);
  const woodMat = new THREE.MeshBasicMaterial({ color: 0x4a3528 });
  const seat = new THREE.Mesh(seatGeom, woodMat);
  seat.position.y = 0.45;
  group.add(seat);

  // Backrest
  const backGeom = new THREE.BoxGeometry(1.5, 0.5, 0.08);
  const back = new THREE.Mesh(backGeom, woodMat);
  back.position.set(0, 0.7, -0.22);
  back.rotation.x = -0.1;
  group.add(back);

  // Legs
  const legGeom = new THREE.BoxGeometry(0.08, 0.45, 0.4);
  const metalMat = new THREE.MeshBasicMaterial({ color: 0x303038 });
  const leg1 = new THREE.Mesh(legGeom, metalMat);
  leg1.position.set(-0.6, 0.225, 0);
  group.add(leg1);
  const leg2 = new THREE.Mesh(legGeom, metalMat);
  leg2.position.set(0.6, 0.225, 0);
  group.add(leg2);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

/**
 * Create a flower bed
 */
function createFlowerBed(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Bed border
  const borderGeom = new THREE.BoxGeometry(2, 0.2, 2);
  const borderMat = new THREE.MeshBasicMaterial({ color: 0x3a3530 });
  const border = new THREE.Mesh(borderGeom, borderMat);
  border.position.y = 0.1;
  group.add(border);

  // Soil
  const soilGeom = new THREE.BoxGeometry(1.8, 0.15, 1.8);
  const soilMat = new THREE.MeshBasicMaterial({ color: 0x3a3530 });
  const soil = new THREE.Mesh(soilGeom, soilMat);
  soil.position.y = 0.18;
  group.add(soil);

  // Flowers (small colorful spheres)
  const flowerColors = [0xff6090, 0xffff50, 0xff50ff, 0x50ffff, 0xff9050];
  for (let i = 0; i < 8; i++) {
    const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const flowerGeom = new THREE.SphereGeometry(0.12, 6, 4);
    const flowerMat = new THREE.MeshBasicMaterial({ color: flowerColor });
    const flower = new THREE.Mesh(flowerGeom, flowerMat);
    flower.position.set(
      -0.6 + Math.random() * 1.2,
      0.35,
      -0.6 + Math.random() * 1.2
    );
    group.add(flower);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a fountain
 */
function createFountain(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Base pool (circular)
  const poolGeom = new THREE.CylinderGeometry(3, 3.5, 0.5, 24);
  const poolMat = new THREE.MeshBasicMaterial({ color: 0x2a3a4a });
  const pool = new THREE.Mesh(poolGeom, poolMat);
  pool.position.y = 0.25;
  group.add(pool);

  // Water surface
  const waterGeom = new THREE.CircleGeometry(2.8, 24);
  const waterMat = new THREE.MeshBasicMaterial({
    color: 0x3060a0,
    transparent: true,
    opacity: 0.7
  });
  const water = new THREE.Mesh(waterGeom, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.45;
  group.add(water);

  // Center pedestal
  const pedestalGeom = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 12);
  const pedestalMat = new THREE.MeshBasicMaterial({ color: 0x505560 });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
  pedestal.position.y = 1;
  group.add(pedestal);

  // Upper bowl
  const bowlGeom = new THREE.CylinderGeometry(1.2, 0.5, 0.4, 16);
  const bowl = new THREE.Mesh(bowlGeom, pedestalMat);
  bowl.position.y = 1.9;
  group.add(bowl);

  // Water in upper bowl
  const upperWaterGeom = new THREE.CircleGeometry(1, 16);
  const upperWater = new THREE.Mesh(upperWaterGeom, waterMat);
  upperWater.rotation.x = -Math.PI / 2;
  upperWater.position.y = 2.05;
  group.add(upperWater);

  // Water spout (center)
  const spoutGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
  const spoutMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6
  });
  const spout = new THREE.Mesh(spoutGeom, spoutMat);
  spout.position.y = 2.8;
  group.add(spout);

  // Water spray effect (cone)
  const sprayGeom = new THREE.ConeGeometry(0.3, 0.8, 8);
  const sprayMat = new THREE.MeshBasicMaterial({
    color: 0xaaddff,
    transparent: true,
    opacity: 0.4
  });
  const spray = new THREE.Mesh(sprayGeom, sprayMat);
  spray.position.y = 3.8;
  spray.rotation.x = Math.PI; // Upside down
  group.add(spray);

  // Falling water streams (around the bowl)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const streamGeom = new THREE.CylinderGeometry(0.03, 0.05, 1.4, 6);
    const stream = new THREE.Mesh(streamGeom, spoutMat);
    stream.position.set(
      Math.cos(angle) * 0.9,
      1.2,
      Math.sin(angle) * 0.9
    );
    stream.rotation.z = Math.cos(angle) * 0.3;
    stream.rotation.x = Math.sin(angle) * 0.3;
    group.add(stream);
  }

  // Pool edge decoration
  const edgeGeom = new THREE.TorusGeometry(3.2, 0.15, 8, 32);
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x606570 });
  const edge = new THREE.Mesh(edgeGeom, edgeMat);
  edge.rotation.x = Math.PI / 2;
  edge.position.y = 0.5;
  group.add(edge);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a decorative lamp post for parks
 */
function createParkLampPost(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Ornate pole
  const poleGeom = new THREE.CylinderGeometry(0.08, 0.12, 3, 8);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x3a3a45 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = 1.5;
  group.add(pole);

  // Decorative base
  const baseGeom = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8);
  const base = new THREE.Mesh(baseGeom, poleMat);
  base.position.y = 0.15;
  group.add(base);

  // Lamp housing
  const housingGeom = new THREE.SphereGeometry(0.25, 8, 6);
  const housingMat = new THREE.MeshBasicMaterial({ color: 0xffeecc });
  const housing = new THREE.Mesh(housingGeom, housingMat);
  housing.position.y = 3.2;
  group.add(housing);

  // Lamp glow
  const glowGeom = new THREE.SphereGeometry(0.4, 8, 6);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffdd88,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  glow.position.y = 3.2;
  group.add(glow);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a swing set
 */
function createSwingSet(scene, x, z, groundY) {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const chainMat = new THREE.MeshBasicMaterial({ color: 0x606060 });
  const seatMat = new THREE.MeshBasicMaterial({ color: 0x2244aa });

  // A-frame posts
  const postGeom = new THREE.CylinderGeometry(0.08, 0.1, 3, 6);

  // Left A-frame
  const leftPost1 = new THREE.Mesh(postGeom, frameMat);
  leftPost1.position.set(-1.5, 1.5, -0.4);
  leftPost1.rotation.z = 0.15;
  group.add(leftPost1);

  const leftPost2 = new THREE.Mesh(postGeom, frameMat);
  leftPost2.position.set(-1.5, 1.5, 0.4);
  leftPost2.rotation.z = 0.15;
  group.add(leftPost2);

  // Right A-frame
  const rightPost1 = new THREE.Mesh(postGeom, frameMat);
  rightPost1.position.set(1.5, 1.5, -0.4);
  rightPost1.rotation.z = -0.15;
  group.add(rightPost1);

  const rightPost2 = new THREE.Mesh(postGeom, frameMat);
  rightPost2.position.set(1.5, 1.5, 0.4);
  rightPost2.rotation.z = -0.15;
  group.add(rightPost2);

  // Top bar
  const topBarGeom = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
  const topBar = new THREE.Mesh(topBarGeom, frameMat);
  topBar.rotation.z = Math.PI / 2;
  topBar.position.y = 2.9;
  group.add(topBar);

  // Swings (2)
  for (let i = -1; i <= 1; i += 2) {
    // Chains
    const chainGeom = new THREE.CylinderGeometry(0.02, 0.02, 2, 4);
    const chain1 = new THREE.Mesh(chainGeom, chainMat);
    chain1.position.set(i * 0.6, 1.9, -0.15);
    group.add(chain1);
    const chain2 = new THREE.Mesh(chainGeom, chainMat);
    chain2.position.set(i * 0.6, 1.9, 0.15);
    group.add(chain2);

    // Seat
    const seatGeom = new THREE.BoxGeometry(0.5, 0.05, 0.3);
    const seat = new THREE.Mesh(seatGeom, seatMat);
    seat.position.set(i * 0.6, 0.9, 0);
    group.add(seat);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a seesaw
 */
function createSeesaw(scene, x, z, groundY) {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const plankMat = new THREE.MeshBasicMaterial({ color: 0xdd4444 });
  const handleMat = new THREE.MeshBasicMaterial({ color: 0x444444 });

  // Base/fulcrum
  const baseGeom = new THREE.ConeGeometry(0.3, 0.5, 8);
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.25;
  group.add(base);

  // Plank
  const plankGeom = new THREE.BoxGeometry(3, 0.1, 0.4);
  const plank = new THREE.Mesh(plankGeom, plankMat);
  plank.position.y = 0.55;
  plank.rotation.z = 0.1; // Slight tilt
  group.add(plank);

  // Handles
  const handleGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
  const handle1 = new THREE.Mesh(handleGeom, handleMat);
  handle1.position.set(-1.2, 0.75, 0);
  group.add(handle1);
  const handle2 = new THREE.Mesh(handleGeom, handleMat);
  handle2.position.set(1.2, 0.55, 0);
  group.add(handle2);

  // Seats
  const seatGeom = new THREE.BoxGeometry(0.3, 0.05, 0.35);
  const seat1 = new THREE.Mesh(seatGeom, new THREE.MeshBasicMaterial({ color: 0x2255cc }));
  seat1.position.set(-1.2, 0.62, 0);
  group.add(seat1);
  const seat2 = new THREE.Mesh(seatGeom, new THREE.MeshBasicMaterial({ color: 0x22cc55 }));
  seat2.position.set(1.2, 0.48, 0);
  group.add(seat2);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a sandbox
 */
function createSandbox(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Frame
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const frameGeom = new THREE.BoxGeometry(3, 0.3, 0.2);

  const frame1 = new THREE.Mesh(frameGeom, frameMat);
  frame1.position.set(0, 0.15, 1.4);
  group.add(frame1);
  const frame2 = new THREE.Mesh(frameGeom, frameMat);
  frame2.position.set(0, 0.15, -1.4);
  group.add(frame2);

  const sideFrameGeom = new THREE.BoxGeometry(0.2, 0.3, 3);
  const frame3 = new THREE.Mesh(sideFrameGeom, frameMat);
  frame3.position.set(1.4, 0.15, 0);
  group.add(frame3);
  const frame4 = new THREE.Mesh(sideFrameGeom, frameMat);
  frame4.position.set(-1.4, 0.15, 0);
  group.add(frame4);

  // Sand
  const sandGeom = new THREE.PlaneGeometry(2.6, 2.6);
  const sandMat = new THREE.MeshBasicMaterial({ color: 0xdec68b });
  const sand = new THREE.Mesh(sandGeom, sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = 0.05;
  group.add(sand);

  // Small bucket and shovel decorations
  const bucketGeom = new THREE.CylinderGeometry(0.1, 0.08, 0.15, 8);
  const bucketMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
  const bucket = new THREE.Mesh(bucketGeom, bucketMat);
  bucket.position.set(0.5, 0.12, 0.3);
  group.add(bucket);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a slide
 */
function createSlide(scene, x, z, groundY) {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x4444aa });
  const slideMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  const ladderMat = new THREE.MeshBasicMaterial({ color: 0x888888 });

  // Platform
  const platformGeom = new THREE.BoxGeometry(1.2, 0.1, 1.2);
  const platform = new THREE.Mesh(platformGeom, frameMat);
  platform.position.set(0, 2, 0);
  group.add(platform);

  // Support posts
  const postGeom = new THREE.CylinderGeometry(0.08, 0.1, 2, 6);
  const positions = [[-0.5, -0.5], [-0.5, 0.5], [0.5, -0.5], [0.5, 0.5]];
  positions.forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeom, frameMat);
    post.position.set(px, 1, pz);
    group.add(post);
  });

  // Slide chute
  const slideGeom = new THREE.BoxGeometry(0.8, 0.05, 2.5);
  const slide = new THREE.Mesh(slideGeom, slideMat);
  slide.position.set(0, 1.1, -1.8);
  slide.rotation.x = 0.4;
  group.add(slide);

  // Slide sides
  const sideGeom = new THREE.BoxGeometry(0.05, 0.2, 2.5);
  const side1 = new THREE.Mesh(sideGeom, slideMat);
  side1.position.set(-0.4, 1.2, -1.8);
  side1.rotation.x = 0.4;
  group.add(side1);
  const side2 = new THREE.Mesh(sideGeom, slideMat);
  side2.position.set(0.4, 1.2, -1.8);
  side2.rotation.x = 0.4;
  group.add(side2);

  // Ladder
  const ladderPostGeom = new THREE.CylinderGeometry(0.04, 0.04, 2, 6);
  const ladderPost1 = new THREE.Mesh(ladderPostGeom, ladderMat);
  ladderPost1.position.set(-0.25, 1, 0.8);
  ladderPost1.rotation.x = -0.2;
  group.add(ladderPost1);
  const ladderPost2 = new THREE.Mesh(ladderPostGeom, ladderMat);
  ladderPost2.position.set(0.25, 1, 0.8);
  ladderPost2.rotation.x = -0.2;
  group.add(ladderPost2);

  // Ladder rungs
  const rungGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6);
  for (let i = 0; i < 5; i++) {
    const rung = new THREE.Mesh(rungGeom, ladderMat);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, 0.4 + i * 0.4, 0.6 + i * 0.15);
    group.add(rung);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a spring rider (bouncy animal)
 */
function createSpringRider(scene, x, z, groundY, color = 0xff6600) {
  const group = new THREE.Group();

  // Spring
  const springMat = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const springGeom = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
  const spring = new THREE.Mesh(springGeom, springMat);
  spring.position.y = 0.25;
  group.add(spring);

  // Body (simple animal shape)
  const bodyMat = new THREE.MeshBasicMaterial({ color: color });
  const bodyGeom = new THREE.BoxGeometry(0.6, 0.4, 0.3);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0, 0.7, 0);
  group.add(body);

  // Head
  const headGeom = new THREE.SphereGeometry(0.2, 8, 6);
  const head = new THREE.Mesh(headGeom, bodyMat);
  head.position.set(0.35, 0.85, 0);
  group.add(head);

  // Handles
  const handleMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
  const handleGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
  const handle1 = new THREE.Mesh(handleGeom, handleMat);
  handle1.position.set(0.1, 0.95, -0.2);
  group.add(handle1);
  const handle2 = new THREE.Mesh(handleGeom, handleMat);
  handle2.position.set(0.1, 0.95, 0.2);
  group.add(handle2);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create playground fence
 */
function createPlaygroundFence(scene, x, z, groundY, length, rotation = 0) {
  const group = new THREE.Group();
  const fenceMat = new THREE.MeshBasicMaterial({ color: 0x44aa44 });

  const numPosts = Math.floor(length / 0.8);
  for (let i = 0; i <= numPosts; i++) {
    const postGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.8, 6);
    const post = new THREE.Mesh(postGeom, fenceMat);
    post.position.set(i * 0.8 - length / 2, 0.4, 0);
    group.add(post);
  }

  // Top rail
  const railGeom = new THREE.BoxGeometry(length, 0.06, 0.06);
  const rail = new THREE.Mesh(railGeom, fenceMat);
  rail.position.y = 0.75;
  group.add(rail);

  // Bottom rail
  const rail2 = new THREE.Mesh(railGeom, fenceMat);
  rail2.position.y = 0.3;
  group.add(rail2);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

/**
 * Create parks on both sides of shopping district
 */
function createParks(scene) {
  const parks = [];
  const groundY = 2;

  // Left park - Children's Playground (x=-51 ~ -29, z=-2 ~ 14)
  // Playground ground (grass)
  const playgroundGeom = new THREE.PlaneGeometry(24, 18);
  const parkMat = new THREE.MeshBasicMaterial({ color: 0x2a3a2a });
  const playground = new THREE.Mesh(playgroundGeom, parkMat);
  playground.rotation.x = -Math.PI / 2;
  playground.position.set(-40, groundY + 0.01, 6);
  scene.add(playground);

  // Rubber safety surface under equipment
  const rubberMat = new THREE.MeshBasicMaterial({ color: 0x664422 });
  const rubberGeom = new THREE.PlaneGeometry(6, 6);
  const rubber1 = new THREE.Mesh(rubberGeom, rubberMat);
  rubber1.rotation.x = -Math.PI / 2;
  rubber1.position.set(-45, groundY + 0.02, 3);
  scene.add(rubber1);
  const rubber2 = new THREE.Mesh(rubberGeom, rubberMat);
  rubber2.rotation.x = -Math.PI / 2;
  rubber2.position.set(-35, groundY + 0.02, 9);
  scene.add(rubber2);

  // Paths
  const pathMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });
  const pathGeom = new THREE.PlaneGeometry(22, 1.5);
  const mainPath = new THREE.Mesh(pathGeom, pathMat);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(-40, groundY + 0.02, 6);
  scene.add(mainPath);

  const sidePath = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 16), pathMat);
  sidePath.rotation.x = -Math.PI / 2;
  sidePath.position.set(-40, groundY + 0.02, 6);
  scene.add(sidePath);

  // === Playground Equipment ===

  // Swing set
  parks.push(createSwingSet(scene, -45, 3, groundY));

  // Seesaw
  parks.push(createSeesaw(scene, -37, 3, groundY));

  // Sandbox
  parks.push(createSandbox(scene, -45, 10, groundY));

  // Slide
  parks.push(createSlide(scene, -35, 10, groundY));

  // Spring riders (bouncy animals)
  parks.push(createSpringRider(scene, -41, 1, groundY, 0xff6600)); // Orange
  parks.push(createSpringRider(scene, -39, 1, groundY, 0x44aa44)); // Green
  parks.push(createSpringRider(scene, -43, 12, groundY, 0x4488ff)); // Blue

  // Fences around playground
  parks.push(createPlaygroundFence(scene, -40, -2, groundY, 20, 0));
  parks.push(createPlaygroundFence(scene, -40, 14, groundY, 20, 0));
  parks.push(createPlaygroundFence(scene, -51, 6, groundY, 16, Math.PI / 2));

  // Benches for parents
  parks.push(createParkBench(scene, -31, 3, groundY, -Math.PI / 2));
  parks.push(createParkBench(scene, -31, 9, groundY, -Math.PI / 2));
  parks.push(createParkBench(scene, -49, 6, groundY, Math.PI / 2));

  // Trees around the playground
  parks.push(createParkTree(scene, -51, 0, groundY));
  parks.push(createParkTree(scene, -51, 12, groundY));
  parks.push(createParkTree(scene, -30, 0, groundY));
  parks.push(createParkTree(scene, -30, 12, groundY));
  parks.push(createParkTree(scene, -40, 14, groundY));

  // Street lamps at corners, facing toward center (-40, 6)
  parks.push(createStreetLamp(scene, -49, 0, groundY, Math.atan2(-6, 9)));      // Bottom-left corner
  parks.push(createStreetLamp(scene, -49, 12, groundY, Math.atan2(6, 9)));      // Top-left corner
  parks.push(createStreetLamp(scene, -31, 0, groundY, Math.atan2(-6, -9)));     // Bottom-right corner
  parks.push(createStreetLamp(scene, -31, 12, groundY, Math.atan2(-6, -9)));     // Top-right corner

  // Right park - Fountain Park (x=24 ~ 46, z=-2 ~ 14)
  // Large park ground
  const rightParkGeom = new THREE.PlaneGeometry(24, 18);
  const rightPark = new THREE.Mesh(rightParkGeom, parkMat);
  rightPark.rotation.x = -Math.PI / 2;
  rightPark.position.set(35, groundY + 0.01, 6);
  scene.add(rightPark);

  // Main path (cross shaped)
  const rightPathV = new THREE.Mesh(new THREE.PlaneGeometry(2, 16), pathMat);
  rightPathV.rotation.x = -Math.PI / 2;
  rightPathV.position.set(35, groundY + 0.02, 6);
  scene.add(rightPathV);

  const rightPathH = new THREE.Mesh(new THREE.PlaneGeometry(22, 2), pathMat);
  rightPathH.rotation.x = -Math.PI / 2;
  rightPathH.position.set(35, groundY + 0.02, 6);
  scene.add(rightPathH);

  // Circular path around fountain
  const circlePathGeom = new THREE.RingGeometry(4, 5, 24);
  const circlePath = new THREE.Mesh(circlePathGeom, pathMat);
  circlePath.rotation.x = -Math.PI / 2;
  circlePath.position.set(35, groundY + 0.02, 6);
  scene.add(circlePath);

  // === FOUNTAIN in center ===
  parks.push(createFountain(scene, 35, 6, groundY));

  // === Trees around the park (varied sizes) ===
  parks.push(createParkTree(scene, 25, 0, groundY));
  parks.push(createParkTree(scene, 45, 0, groundY));
  parks.push(createParkTree(scene, 25, 12, groundY));
  parks.push(createParkTree(scene, 45, 12, groundY));
  parks.push(createParkTree(scene, 29, 2, groundY));
  parks.push(createParkTree(scene, 41, 2, groundY));
  parks.push(createParkTree(scene, 29, 10, groundY));
  parks.push(createParkTree(scene, 41, 10, groundY));

  // === Benches facing fountain ===
  parks.push(createParkBench(scene, 30, 6, groundY, Math.PI / 2));
  parks.push(createParkBench(scene, 40, 6, groundY, -Math.PI / 2));
  parks.push(createParkBench(scene, 35, 1, groundY, 0));
  parks.push(createParkBench(scene, 35, 11, groundY, Math.PI));

  // === Flower beds ===
  parks.push(createFlowerBed(scene, 26, 0, groundY));
  parks.push(createFlowerBed(scene, 44, 0, groundY));
  parks.push(createFlowerBed(scene, 26, 12, groundY));
  parks.push(createFlowerBed(scene, 44, 12, groundY));

  // === Street lamps at corners ===
  parks.push(createStreetLamp(scene, 26, 0, groundY, Math.atan2(-6, 9)));
  parks.push(createStreetLamp(scene, 26, 12, groundY, Math.atan2(6, 9)));
  parks.push(createStreetLamp(scene, 44, 0, groundY, Math.atan2(-6, -9)));
  parks.push(createStreetLamp(scene, 44, 12, groundY, Math.atan2(6, -9)));

  // === Pink Hotel (Grand Budapest / Da Nang Cathedral style) ===
  createPinkHotel(scene, groundY);

  return parks;
}

/**
 * Create Pink Hotel - Grand Budapest Hotel / Da Nang Pink Cathedral inspired
 * Position: Right side of fountain park, entrance facing park
 */
function createPinkHotel(scene, groundY) {
  const group = new THREE.Group();

  // Colors
  const pinkMain = 0xf5a0b0;      // Main pink
  const pinkLight = 0xffc0c8;     // Light pink for accents
  const pinkDark = 0xd88090;      // Dark pink for depth
  const cream = 0xfff5e8;         // Cream white for trim
  const gold = 0xd4a84b;          // Gold accents
  const windowWhite = 0xffffff;   // White window color
  const windowGlow = 0xffffee;    // Warm white glow

  // === Main Building (facing park) - moved right & expanded to fill sidewalk ===
  const mainWidth = 18;
  const mainDepth = 26;           // Expanded to fill sidewalk (z=-12 to z=14)
  const mainHeight = 20;
  const mainX = 68;               // Moved right, away from park
  const mainZ = 1;                // Center position (moved south to avoid upper road overlap)

  // Main body
  const mainGeom = new THREE.BoxGeometry(mainWidth, mainHeight, mainDepth);
  const mainMat = new THREE.MeshBasicMaterial({ color: pinkMain });
  const mainBody = new THREE.Mesh(mainGeom, mainMat);
  mainBody.position.set(mainX, groundY + mainHeight / 2, mainZ);
  group.add(mainBody);

  // Decorative horizontal bands
  const bandMat = new THREE.MeshBasicMaterial({ color: cream });
  for (let i = 0; i < 5; i++) {
    const bandGeom = new THREE.BoxGeometry(mainWidth + 0.4, 0.35, mainDepth + 0.4);
    const band = new THREE.Mesh(bandGeom, bandMat);
    band.position.set(mainX, groundY + 3.5 + i * 3.8, mainZ);
    group.add(band);
  }

  // Roof cornice
  const corniceGeom = new THREE.BoxGeometry(mainWidth + 1, 0.8, mainDepth + 1);
  const cornice = new THREE.Mesh(corniceGeom, bandMat);
  cornice.position.set(mainX, groundY + mainHeight + 0.4, mainZ);
  group.add(cornice);

  // Roof (pink with slight slope effect)
  const roofGeom = new THREE.BoxGeometry(mainWidth - 1, 2, mainDepth - 1);
  const roofMat = new THREE.MeshBasicMaterial({ color: pinkDark });
  const roof = new THREE.Mesh(roofGeom, roofMat);
  roof.position.set(mainX, groundY + mainHeight + 1.5, mainZ);
  group.add(roof);

  // === Large Arch Entrance (facing park, -X direction) - expanded ===
  const archWidth = 8;
  const archHeight = 10;
  const archDepth = 3;

  // Arch frame
  const archFrameMat = new THREE.MeshBasicMaterial({ color: cream });
  const goldMat = new THREE.MeshBasicMaterial({ color: gold });

  // Left pillar
  const pillarGeom = new THREE.BoxGeometry(1.5, archHeight, archDepth);
  const leftPillar = new THREE.Mesh(pillarGeom, archFrameMat);
  leftPillar.position.set(mainX - mainWidth / 2 - 1, groundY + archHeight / 2, mainZ + archWidth / 2 - 0.8);
  group.add(leftPillar);

  // Right pillar
  const rightPillar = new THREE.Mesh(pillarGeom, archFrameMat);
  rightPillar.position.set(mainX - mainWidth / 2 - 1, groundY + archHeight / 2, mainZ - archWidth / 2 + 0.8);
  group.add(rightPillar);

  // Pillar decorative capitals
  const capitalGeom = new THREE.BoxGeometry(2, 1, archDepth + 0.5);
  const leftCapital = new THREE.Mesh(capitalGeom, archFrameMat);
  leftCapital.position.set(mainX - mainWidth / 2 - 1, groundY + archHeight + 0.5, mainZ + archWidth / 2 - 0.8);
  group.add(leftCapital);
  const rightCapital = new THREE.Mesh(capitalGeom, archFrameMat);
  rightCapital.position.set(mainX - mainWidth / 2 - 1, groundY + archHeight + 0.5, mainZ - archWidth / 2 + 0.8);
  group.add(rightCapital);

  // Arch top (semicircle approximation)
  const archTopGeom = new THREE.BoxGeometry(2, 3, archWidth);
  const archTop = new THREE.Mesh(archTopGeom, archFrameMat);
  archTop.position.set(mainX - mainWidth / 2 - 1, groundY + archHeight + 2.5, mainZ);
  group.add(archTop);

  // Arch curved detail (multiple boxes to simulate curve)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 4) * Math.PI;
    const curveGeom = new THREE.BoxGeometry(1.8, 0.8, 1);
    const curve = new THREE.Mesh(curveGeom, archFrameMat);
    const radius = archWidth / 2 - 0.5;
    curve.position.set(
      mainX - mainWidth / 2 - 1,
      groundY + archHeight + 1 + Math.sin(angle) * 2,
      mainZ - radius * Math.cos(angle) + radius / 2
    );
    group.add(curve);
  }

  // Arch canopy
  const canopyGeom = new THREE.BoxGeometry(4, 0.4, archWidth + 3);
  const canopyMat = new THREE.MeshBasicMaterial({ color: pinkDark });
  const canopy = new THREE.Mesh(canopyGeom, canopyMat);
  canopy.position.set(mainX - mainWidth / 2 - 2, groundY + archHeight + 4, mainZ);
  group.add(canopy);

  // Gold arch decorations
  const archDecoGeom = new THREE.BoxGeometry(0.4, 4, archWidth - 2);
  const archDeco = new THREE.Mesh(archDecoGeom, goldMat);
  archDeco.position.set(mainX - mainWidth / 2 - 1, groundY + archHeight + 3.5, mainZ);
  group.add(archDeco);

  // Gold ornament above arch
  const ornamentGeom = new THREE.BoxGeometry(0.5, 0.5, 2);
  const ornament = new THREE.Mesh(ornamentGeom, goldMat);
  ornament.position.set(mainX - mainWidth / 2 - 1, groundY + archHeight + 5.5, mainZ);
  group.add(ornament);

  // Entrance floor (red carpet effect)
  const carpetGeom = new THREE.PlaneGeometry(6, archWidth);
  const carpetMat = new THREE.MeshBasicMaterial({ color: 0x8b2942 });
  const carpet = new THREE.Mesh(carpetGeom, carpetMat);
  carpet.rotation.x = -Math.PI / 2;
  carpet.rotation.z = Math.PI / 2;
  carpet.position.set(mainX - mainWidth / 2 - 3, groundY + 0.02, mainZ);
  group.add(carpet);

  // === White Entrance Door ===
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Main entrance back wall (white)
  const entranceBackGeom = new THREE.PlaneGeometry(archWidth - 2, archHeight - 1);
  const entranceBack = new THREE.Mesh(entranceBackGeom, whiteMat);
  entranceBack.rotation.y = Math.PI / 2;
  entranceBack.position.set(mainX - mainWidth / 2 + 0.1, groundY + (archHeight - 1) / 2 + 0.5, mainZ);
  group.add(entranceBack);

  // Double door frame (white)
  const doorFrameGeom = new THREE.BoxGeometry(0.3, 7, 5);
  const doorFrame = new THREE.Mesh(doorFrameGeom, whiteMat);
  doorFrame.position.set(mainX - mainWidth / 2 - 0.5, groundY + 3.5, mainZ);
  group.add(doorFrame);

  // Left door (white with gold handle)
  const doorGeom = new THREE.BoxGeometry(0.2, 6, 2);
  const leftDoor = new THREE.Mesh(doorGeom, whiteMat);
  leftDoor.position.set(mainX - mainWidth / 2 - 0.8, groundY + 3, mainZ + 1.2);
  group.add(leftDoor);

  // Right door (white with gold handle)
  const rightDoor = new THREE.Mesh(doorGeom, whiteMat);
  rightDoor.position.set(mainX - mainWidth / 2 - 0.8, groundY + 3, mainZ - 1.2);
  group.add(rightDoor);

  // Door handles (gold)
  const handleGeom = new THREE.BoxGeometry(0.15, 0.8, 0.1);
  const leftHandle = new THREE.Mesh(handleGeom, goldMat);
  leftHandle.position.set(mainX - mainWidth / 2 - 0.95, groundY + 3.5, mainZ + 0.3);
  group.add(leftHandle);

  const rightHandle = new THREE.Mesh(handleGeom, goldMat);
  rightHandle.position.set(mainX - mainWidth / 2 - 0.95, groundY + 3.5, mainZ - 0.3);
  group.add(rightHandle);

  // Door top transom window (white frame with glass effect)
  const transomGeom = new THREE.BoxGeometry(0.15, 1.5, 4.5);
  const transomMat = new THREE.MeshBasicMaterial({ color: 0xccddff });
  const transom = new THREE.Mesh(transomGeom, transomMat);
  transom.position.set(mainX - mainWidth / 2 - 0.8, groundY + 6.8, mainZ);
  group.add(transom);

  // === Windows on front facade (flat style) ===
  const windowMat = new THREE.MeshBasicMaterial({ color: windowWhite, side: THREE.DoubleSide });

  // 4 floors x 8 windows - FRONT facade (facing park)
  // Skip windows near entrance (w=2,3,4,5 are near the arch entrance and sign)
  for (let floor = 0; floor < 4; floor++) {
    for (let w = 0; w < 8; w++) {
      // Skip entrance/sign area (center windows)
      if (w >= 2 && w <= 5) continue;

      const winX = mainX - mainWidth / 2 - 0.1;
      const winY = groundY + 5.4 + floor * 3.8;
      const winZ = mainZ - 10.5 + w * 3;

      const winGeom = new THREE.PlaneGeometry(2, 2.2);
      const win = new THREE.Mesh(winGeom, windowMat);
      win.rotation.y = Math.PI / 2;
      win.position.set(winX, winY, winZ);
      group.add(win);
    }
  }

  // 4 floors x 5 windows - LEFT side facade
  for (let floor = 0; floor < 4; floor++) {
    for (let w = 0; w < 5; w++) {
      const winX = mainX - 6 + w * 3;
      const winY = groundY + 5.4 + floor * 3.8;
      const winZ = mainZ - mainDepth / 2 - 0.1;

      const winGeom = new THREE.PlaneGeometry(2, 2.2);
      const win = new THREE.Mesh(winGeom, windowMat);
      win.position.set(winX, winY, winZ);
      group.add(win);
    }
  }

  // 4 floors x 5 windows - RIGHT side facade
  for (let floor = 0; floor < 4; floor++) {
    for (let w = 0; w < 5; w++) {
      const winX = mainX - 6 + w * 3;
      const winY = groundY + 5.4 + floor * 3.8;
      const winZ = mainZ + mainDepth / 2 + 0.1;

      const winGeom = new THREE.PlaneGeometry(2, 2.2);
      const win = new THREE.Mesh(winGeom, windowMat);
      win.rotation.y = Math.PI;
      win.position.set(winX, winY, winZ);
      group.add(win);
    }
  }

  // 4 floors x 8 windows - BACK facade
  for (let floor = 0; floor < 4; floor++) {
    for (let w = 0; w < 8; w++) {
      const winX = mainX + mainWidth / 2 + 0.1;
      const winY = groundY + 5.4 + floor * 3.8;
      const winZ = mainZ - 10.5 + w * 3;

      const winGeom = new THREE.PlaneGeometry(2, 2.2);
      const win = new THREE.Mesh(winGeom, windowMat);
      win.rotation.y = -Math.PI / 2;
      win.position.set(winX, winY, winZ);
      group.add(win);
    }
  }

  // === Extended Wing (to the right/back, +X direction) - expanded ===
  const wingWidth = 28;           // Longer wing
  const wingDepth = 24;           // Expanded depth to match
  const wingHeight = 16;
  const wingX = mainX + mainWidth / 2 + wingWidth / 2 - 3;

  const wingGeom = new THREE.BoxGeometry(wingWidth, wingHeight, wingDepth);
  const wingMat = new THREE.MeshBasicMaterial({ color: pinkLight });
  const wing = new THREE.Mesh(wingGeom, wingMat);
  wing.position.set(wingX, groundY + wingHeight / 2, mainZ);
  group.add(wing);

  // Wing roof
  const wingRoofGeom = new THREE.BoxGeometry(wingWidth + 0.5, 1, wingDepth + 0.5);
  const wingRoof = new THREE.Mesh(wingRoofGeom, roofMat);
  wingRoof.position.set(wingX, groundY + wingHeight + 0.5, mainZ);
  group.add(wingRoof);

  // Wing windows - front side (flat style)
  for (let floor = 0; floor < 2; floor++) {
    for (let w = 0; w < 9; w++) {
      const winX = wingX - wingWidth / 2 + 2 + w * 3;
      const winY = groundY + 5.5 + floor * 5;
      const winZ = mainZ - wingDepth / 2 - 0.1;

      const winGeom = new THREE.PlaneGeometry(1.8, 2);
      const win = new THREE.Mesh(winGeom, windowMat);
      win.position.set(winX, winY, winZ);
      group.add(win);
    }
  }

  // Wing windows - back side (flat style)
  for (let floor = 0; floor < 2; floor++) {
    for (let w = 0; w < 9; w++) {
      const winX = wingX - wingWidth / 2 + 2 + w * 3;
      const winY = groundY + 5.5 + floor * 5;
      const winZ = mainZ + wingDepth / 2 + 0.1;

      const winGeom = new THREE.PlaneGeometry(1.8, 2);
      const win = new THREE.Mesh(winGeom, windowMat);
      win.rotation.y = Math.PI;
      win.position.set(winX, winY, winZ);
      group.add(win);
    }
  }

  // Wing windows - right end side (flat style)
  for (let floor = 0; floor < 2; floor++) {
    for (let w = 0; w < 7; w++) {
      const winX = wingX + wingWidth / 2 + 0.1;
      const winY = groundY + 5.5 + floor * 5;
      const winZ = mainZ - wingDepth / 2 + 2 + w * 3;

      const winGeom = new THREE.PlaneGeometry(1.8, 2);
      const win = new THREE.Mesh(winGeom, windowMat);
      win.rotation.y = -Math.PI / 2;
      win.position.set(winX, winY, winZ);
      group.add(win);
    }
  }

  // Wing decorative bands
  for (let i = 0; i < 3; i++) {
    const wingBandGeom = new THREE.BoxGeometry(wingWidth + 0.4, 0.25, wingDepth + 0.4);
    const wingBand = new THREE.Mesh(wingBandGeom, bandMat);
    wingBand.position.set(wingX, groundY + 3 + i * 5, mainZ);
    group.add(wingBand);
  }

  // Wing roof balustrade
  const balustradeGeom = new THREE.BoxGeometry(wingWidth, 1, 0.2);
  const balustrade1 = new THREE.Mesh(balustradeGeom, bandMat);
  balustrade1.position.set(wingX, groundY + wingHeight + 1, mainZ - wingDepth / 2);
  group.add(balustrade1);
  const balustrade2 = new THREE.Mesh(balustradeGeom, bandMat);
  balustrade2.position.set(wingX, groundY + wingHeight + 1, mainZ + wingDepth / 2);
  group.add(balustrade2);

  // === Towers (connected to main building corners) ===
  const towerWidth = 6;
  const towerHeight = 32;

  // Tower positions - both corners of main building (back side)
  const towerPositions = [
    { x: mainX + mainWidth / 2 - 1, z: mainZ + mainDepth / 2 - 1 },   // Back-right
    { x: mainX + mainWidth / 2 - 1, z: mainZ - mainDepth / 2 + 1 }    // Back-left (front side)
  ];

  towerPositions.forEach((tPos, idx) => {
    const towerX = tPos.x;
    const towerZ = tPos.z;

    // Tower body
    const towerGeom = new THREE.BoxGeometry(towerWidth, towerHeight, towerWidth);
    const towerMat = new THREE.MeshBasicMaterial({ color: pinkMain });
    const tower = new THREE.Mesh(towerGeom, towerMat);
    tower.position.set(towerX, groundY + towerHeight / 2, towerZ);
    group.add(tower);

    // Tower decorative bands
    for (let i = 0; i < 6; i++) {
      const tBandGeom = new THREE.BoxGeometry(towerWidth + 0.4, 0.3, towerWidth + 0.4);
      const tBand = new THREE.Mesh(tBandGeom, bandMat);
      tBand.position.set(towerX, groundY + 4 + i * 5, towerZ);
      group.add(tBand);
    }

    // Tower windows (flat style) - 4 sides
    for (let i = 0; i < 5; i++) {
      const tWinY = groundY + 6.5 + i * 5;

      // Front side (-X direction, facing park)
      const winGeom = new THREE.PlaneGeometry(1.5, 2);
      const win1 = new THREE.Mesh(winGeom, windowMat);
      win1.rotation.y = Math.PI / 2;
      win1.position.set(towerX - towerWidth / 2 - 0.1, tWinY, towerZ);
      group.add(win1);

      // Back side (+X direction)
      const win2 = new THREE.Mesh(winGeom, windowMat);
      win2.rotation.y = -Math.PI / 2;
      win2.position.set(towerX + towerWidth / 2 + 0.1, tWinY, towerZ);
      group.add(win2);

      // Left side (-Z direction)
      const win3 = new THREE.Mesh(winGeom, windowMat);
      win3.position.set(towerX, tWinY, towerZ - towerWidth / 2 - 0.1);
      group.add(win3);

      // Right side (+Z direction)
      const win4 = new THREE.Mesh(winGeom, windowMat);
      win4.rotation.y = Math.PI;
      win4.position.set(towerX, tWinY, towerZ + towerWidth / 2 + 0.1);
      group.add(win4);
    }

    // Tower spire top
    const spireBaseGeom = new THREE.BoxGeometry(towerWidth + 1, 1.5, towerWidth + 1);
    const spireBase = new THREE.Mesh(spireBaseGeom, bandMat);
    spireBase.position.set(towerX, groundY + towerHeight + 0.75, towerZ);
    group.add(spireBase);

    // Spire (pyramid)
    const spireGeom = new THREE.ConeGeometry(2.5, 8, 4);
    const spireMat = new THREE.MeshBasicMaterial({ color: pinkDark });
    const spire = new THREE.Mesh(spireGeom, spireMat);
    spire.position.set(towerX, groundY + towerHeight + 5.5, towerZ);
    spire.rotation.y = Math.PI / 4;
    group.add(spire);

    // Gold spire tip
    const tipGeom = new THREE.ConeGeometry(0.4, 3, 8);
    const tip = new THREE.Mesh(tipGeom, goldMat);
    tip.position.set(towerX, groundY + towerHeight + 11, towerZ);
    group.add(tip);
  });

  // === Small decorative turrets on main building front corners ===
  const turretPositions = [
    [mainX - mainWidth / 2 + 1, mainZ - mainDepth / 2 + 1],
    [mainX - mainWidth / 2 + 1, mainZ + mainDepth / 2 - 1],
    [mainX - mainWidth / 2 + 1, mainZ]  // Center turret above entrance
  ];

  turretPositions.forEach(([tx, tz]) => {
    const turretGeom = new THREE.CylinderGeometry(0.8, 1, 4, 8);
    const turret = new THREE.Mesh(turretGeom, new THREE.MeshBasicMaterial({ color: pinkLight }));
    turret.position.set(tx, groundY + mainHeight + 2, tz);
    group.add(turret);

    const turretCapGeom = new THREE.ConeGeometry(1, 2.5, 8);
    const turretCap = new THREE.Mesh(turretCapGeom, roofMat);
    turretCap.position.set(tx, groundY + mainHeight + 5.25, tz);
    group.add(turretCap);

    // Gold ball on top
    const ballGeom = new THREE.SphereGeometry(0.25, 8, 6);
    const ball = new THREE.Mesh(ballGeom, goldMat);
    ball.position.set(tx, groundY + mainHeight + 6.75, tz);
    group.add(ball);
  });

  // === Hotel Sign ===
  const signGeom = new THREE.BoxGeometry(12, 2, 0.4);
  const signMat = new THREE.MeshBasicMaterial({ color: gold });
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(mainX - mainWidth / 2 - 1.5, groundY + archHeight + 6.5, mainZ);
  sign.rotation.y = Math.PI / 2;
  group.add(sign);

  // Sign backing (pink)
  const signBackGeom = new THREE.BoxGeometry(13, 2.5, 0.3);
  const signBack = new THREE.Mesh(signBackGeom, new THREE.MeshBasicMaterial({ color: pinkDark }));
  signBack.position.set(mainX - mainWidth / 2 - 1.3, groundY + archHeight + 6.5, mainZ);
  signBack.rotation.y = Math.PI / 2;
  group.add(signBack);

  scene.add(group);
  return group;
}

// ============================================
// Dead Ends
// ============================================

/**
 * Create dead end with slope and retaining wall
 */
function createDeadEnd(scene, side) {
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

// ============================================
// Sloped Area Forest (behind sloped residential)
// ============================================

/**
 * Create forest behind the sloped residential area
 */
function createSlopedAreaForest(scene) {
  const treeColors = [0x1a3a2a, 0x2a4a3a, 0x1a4a2a, 0x2a3a2a, 0x1a5a3a];

  // Forest area behind sloped houses: x = 45 to 130, z = 48 to 90
  // Ground height follows the slope (y=10 at x=50, y=16 at x=92+)
  const slopeStartX = 50;
  const slopeEndX = 92;
  const slopeStartY = 10;
  const slopeEndY = 16;

  // Forest ground plane
  const forestGroundGeom = new THREE.PlaneGeometry(90, 45);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2a20 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(87, slopeEndY + 0.01, 70);
  scene.add(forestGround);

  // Create trees
  for (let x = 45; x < 135; x += 3.5 + Math.random() * 2.5) {
    for (let z = 48; z < 92; z += 3.5 + Math.random() * 2.5) {
      if (Math.random() > 0.12) {
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetZ = (Math.random() - 0.5) * 2;
        const treeX = x + offsetX;
        const treeZ = z + offsetZ;

        // Calculate ground Y based on slope
        let groundY;
        if (treeX < slopeStartX) {
          groundY = slopeStartY;
        } else if (treeX > slopeEndX) {
          groundY = slopeEndY;
        } else {
          const ratio = (treeX - slopeStartX) / (slopeEndX - slopeStartX);
          groundY = slopeStartY + ratio * (slopeEndY - slopeStartY);
        }

        // Tree trunk
        const trunkHeight = 2.5 + Math.random() * 1.5;
        const trunkGeom = new THREE.CylinderGeometry(0.25, 0.4, trunkHeight, 6);
        const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.set(treeX, groundY + trunkHeight / 2, treeZ);
        scene.add(trunk);

        // Tree foliage
        const foliageColor = treeColors[Math.floor(Math.random() * treeColors.length)];
        const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

        // Bottom foliage layer
        const foliage1Geom = new THREE.ConeGeometry(2.5 + Math.random(), 4 + Math.random() * 1.5, 6);
        const foliage1 = new THREE.Mesh(foliage1Geom, foliageMat);
        foliage1.position.set(treeX, groundY + trunkHeight + 1.8, treeZ);
        scene.add(foliage1);

        // Top foliage layer
        const foliage2Geom = new THREE.ConeGeometry(1.8 + Math.random() * 0.5, 3 + Math.random(), 6);
        const foliage2 = new THREE.Mesh(foliage2Geom, foliageMat);
        foliage2.position.set(treeX, groundY + trunkHeight + 4.5 + Math.random() * 0.5, treeZ);
        scene.add(foliage2);
      }
    }
  }
}

/**
 * Create natural hills around the sloped residential area edges
 * Makes the terrain transition look more natural instead of abrupt cutoff
 */
function createSlopedAreaEdgeHills(scene) {
  const hillColor = 0x2a3a2a;      // Dark green hill base
  const hillColorLight = 0x3a4a3a; // Lighter green
  const hillColorDark = 0x1a2a1a;  // Darker for depth

  // Helper function to create a hill/mound
  function createHill(x, z, baseY, width, height, depth) {
    const group = new THREE.Group();

    // Main hill body (elongated cone)
    const hillGeom = new THREE.ConeGeometry(width, height, 8);
    const hillMat = new THREE.MeshBasicMaterial({ color: hillColor });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(0, height / 2, 0);
    hill.scale.set(1, 1, depth / width); // Stretch in Z direction
    group.add(hill);

    // Secondary smaller mound for natural look
    const mound2Geom = new THREE.ConeGeometry(width * 0.6, height * 0.7, 6);
    const mound2Mat = new THREE.MeshBasicMaterial({ color: hillColorLight });
    const mound2 = new THREE.Mesh(mound2Geom, mound2Mat);
    mound2.position.set(width * 0.4, height * 0.35, depth * 0.2);
    group.add(mound2);

    // Third smaller mound
    const mound3Geom = new THREE.ConeGeometry(width * 0.4, height * 0.5, 6);
    const mound3Mat = new THREE.MeshBasicMaterial({ color: hillColorDark });
    const mound3 = new THREE.Mesh(mound3Geom, mound3Mat);
    mound3.position.set(-width * 0.3, height * 0.25, -depth * 0.15);
    group.add(mound3);

    group.position.set(x, baseY, z);
    scene.add(group);
    return group;
  }

  // Helper function to get ground Y based on slope
  function getGroundY(x) {
    const slopeStartX = 50;
    const slopeEndX = 92;
    const slopeStartY = 10;
    const slopeEndY = 16;

    if (x < slopeStartX) return slopeStartY;
    if (x > slopeEndX) return slopeEndY;
    const ratio = (x - slopeStartX) / (slopeEndX - slopeStartX);
    return slopeStartY + ratio * (slopeEndY - slopeStartY);
  }

  // === Right edge hills (x = 125 ~ 145, beyond flat top) ===
  createHill(128, 35, 16, 8, 12, 10);
  createHill(135, 50, 16, 10, 15, 12);
  createHill(142, 38, 16, 7, 10, 9);
  createHill(130, 60, 16, 9, 14, 11);
  createHill(145, 55, 16, 8, 11, 10);
  createHill(138, 70, 16, 11, 16, 13);

  // === Far back edge hills (z = 85 ~ 100, behind forest) ===
  for (let x = 50; x <= 140; x += 15 + Math.random() * 10) {
    const groundY = getGroundY(x);
    const width = 8 + Math.random() * 6;
    const height = 10 + Math.random() * 10;
    createHill(x, 90 + Math.random() * 10, groundY, width, height, width * 1.2);
  }

  // === Side edge hills (transition from main residential to sloped area, x = 45 ~ 55) ===
  createHill(48, 55, 10, 6, 8, 8);
  createHill(46, 70, 10, 7, 10, 9);
  createHill(44, 85, 10, 8, 12, 10);

  // === Corner hills (far right back corner) ===
  createHill(148, 75, 16, 12, 18, 14);
  createHill(155, 65, 16, 10, 14, 12);
  createHill(152, 85, 16, 14, 20, 16);

  // === Small rolling hills along the right edge of flat top area ===
  for (let z = 30; z <= 75; z += 12 + Math.random() * 8) {
    const width = 5 + Math.random() * 4;
    const height = 6 + Math.random() * 6;
    createHill(125 + Math.random() * 5, z, 16, width, height, width * 0.9);
  }
}

/**
 * Create hills in the left north area (replacing removed buildings)
 * Area: x=-50 to -180, z=0 to 50 (above main road, playground side)
 */
function createLeftNorthHills(scene) {
  const hillColor = 0x2a3a2a;
  const hillColorLight = 0x3a4a3a;
  const hillColorDark = 0x1a2a1a;
  const groundY = 0;

  // Helper function to create a natural hill
  function createHill(x, z, width, height, depth) {
    const group = new THREE.Group();

    // Main hill body
    const hillGeom = new THREE.ConeGeometry(width, height, 8);
    const hillMat = new THREE.MeshBasicMaterial({ color: hillColor });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(0, height / 2, 0);
    hill.scale.set(1, 1, depth / width);
    group.add(hill);

    // Secondary mound
    const mound2Geom = new THREE.ConeGeometry(width * 0.5, height * 0.6, 6);
    const mound2Mat = new THREE.MeshBasicMaterial({ color: hillColorLight });
    const mound2 = new THREE.Mesh(mound2Geom, mound2Mat);
    mound2.position.set(width * 0.35, height * 0.3, depth * 0.2);
    group.add(mound2);

    // Third smaller mound
    const mound3Geom = new THREE.ConeGeometry(width * 0.35, height * 0.4, 6);
    const mound3Mat = new THREE.MeshBasicMaterial({ color: hillColorDark });
    const mound3 = new THREE.Mesh(mound3Geom, mound3Mat);
    mound3.position.set(-width * 0.25, height * 0.2, -depth * 0.1);
    group.add(mound3);

    group.position.set(x, groundY, z);
    scene.add(group);
    return group;
  }

  // === Edge hills (moved further outside, x=-65 ~ -75) ===
  // Outer hills - moved away from playground
  createHill(-70, 20, 14, 14, 16);   // Tall outer hill
  createHill(-72, 35, 13, 15, 15);   // Tall outer hill
  createHill(-68, 48, 15, 14, 17);   // Tall outer hill near forest
  createHill(-73, 8, 12, 13, 14);    // Tall hill near road end
  createHill(-70, 55, 14, 15, 16);   // Tall hill toward forest
  createHill(-72, 28, 13, 14, 15);   // Additional coverage
  createHill(-68, 42, 12, 14, 14);   // Additional coverage
  createHill(-75, 15, 13, 15, 15);   // Extra back coverage

  // Forest edge hills (x=-55 ~ -65, z=60~90) - cover forest boundary
  createHill(-56, 65, 16, 16, 18);   // Large hill at forest edge
  createHill(-58, 72, 15, 17, 17);   // Large hill at forest edge
  createHill(-55, 78, 17, 16, 19);   // Large hill at forest edge
  createHill(-60, 68, 14, 16, 16);   // Cover forest edge
  createHill(-57, 85, 16, 17, 18);   // Far forest edge
  createHill(-62, 75, 15, 16, 17);   // Far forest edge
  createHill(-54, 70, 14, 15, 16);   // Additional forest coverage
  createHill(-59, 82, 15, 16, 17);   // Additional forest coverage
  // Extra coverage for remaining gaps
  createHill(-53, 75, 15, 16, 17);   // Fill gap
  createHill(-55, 88, 16, 17, 18);   // Far edge
  createHill(-61, 80, 14, 16, 16);   // Fill gap
  createHill(-57, 90, 15, 16, 17);   // Very far edge
  createHill(-63, 70, 13, 15, 15);   // Outer coverage
  createHill(-52, 82, 14, 15, 16);   // Inner far coverage

  // Forest corner coverage (moved further outside)
  createHill(-65, 53, 14, 18, 16);   // Front-left corner of forest
  createHill(-63, 57, 13, 17, 15);   // Front corner inner
  createHill(-68, 50, 12, 17, 14);   // Front corner outer
  createHill(-65, 92, 16, 17, 18);   // Back-left corner of forest
  createHill(-63, 88, 15, 16, 17);   // Back corner inner
  createHill(-69, 95, 17, 18, 19);   // Back corner far
  createHill(-61, 60, 12, 16, 14);   // Front corner close
  createHill(-67, 98, 15, 17, 17);   // Very back corner
  createHill(-63, 50, 13, 17, 15);   // Additional front corner coverage

  // Inner edge hills (moved to x=-60 ~ -65)
  createHill(-62, 22, 10, 11, 12);   // Inner hill
  createHill(-64, 38, 9, 11, 11);    // Inner hill
  createHill(-61, 50, 11, 11, 13);   // Inner hill
  createHill(-65, 12, 9, 11, 11);    // Inner hill
  createHill(-62, 60, 12, 12, 14);   // Inner hill near forest
  createHill(-64, 68, 11, 12, 13);   // Inner hill at forest edge

  // === Middle hill cluster (x=-90 to -130) ===
  createHill(-95, 10, 11, 16, 13);
  createHill(-105, 25, 9, 12, 11);
  createHill(-98, 40, 10, 14, 12);
  createHill(-115, 8, 8, 11, 10);
  createHill(-110, 35, 12, 18, 14);
  createHill(-125, 18, 9, 13, 11);
  createHill(-120, 42, 8, 10, 9);
  createHill(-108, 50, 7, 9, 8);

  // === Far hill cluster (x=-130 to -180) ===
  createHill(-135, 12, 10, 15, 12);
  createHill(-145, 28, 11, 17, 13);
  createHill(-140, 45, 9, 12, 11);
  createHill(-155, 8, 8, 11, 10);
  createHill(-150, 35, 12, 19, 15);
  createHill(-165, 20, 10, 14, 12);
  createHill(-160, 48, 8, 10, 9);
  createHill(-175, 15, 9, 13, 11);
  createHill(-170, 38, 11, 16, 13);
  createHill(-180, 25, 8, 11, 10);
  createHill(-178, 50, 7, 9, 8);

  // === Larger backdrop hills (further back, z=55 to 70) ===
  createHill(-60, 60, 14, 22, 16);
  createHill(-90, 65, 16, 25, 18);
  createHill(-120, 58, 13, 20, 15);
  createHill(-150, 62, 15, 23, 17);
  createHill(-180, 60, 12, 18, 14);

  // === Ground cover plane for hill area ===
  const groundGeom = new THREE.PlaneGeometry(140, 70);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x1a2a1a });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(-115, groundY + 0.02, 35);
  scene.add(ground);
}

// ============================================
// Curved Road West Forest and Mountains
// ============================================

/**
 * Create forest and mountains west of the curved road to fill empty space
 */
function createCurveWestForestAndMountains(scene) {
  const groundY = 0;
  const treeColors = [0x1a3a2a, 0x2a4a3a, 0x1a4a2a, 0x2a3a2a, 0x1a5a3a];
  const hillColor = 0x2a3a2a;
  const hillColorLight = 0x3a4a3a;

  // === Ground for the area (extended south) ===
  const forestGroundGeom = new THREE.PlaneGeometry(150, 110);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2a20 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(-125, groundY + 0.01, -40);
  scene.add(forestGround);

  // === Dense Forest Trees (between curve and mountains) ===
  // Area: x = -65 to -180, z = -95 to 5 (extended south to building boundary)
  for (let x = -65; x > -180; x -= 4 + Math.random() * 3) {
    for (let z = -95; z < 5; z += 4 + Math.random() * 3) {
      // Skip area too close to south road (x = -60 to -50)
      if (x > -65 && x < -45 && z > -45 && z < -30) continue;
      // Skip area around building at x=-68, z=-80 (width 11, depth 9)
      if (x > -78 && x < -58 && z > -90 && z < -70) continue;
      // Skip area around building at x=-35, z=-48
      if (x > -45 && x < -25 && z > -58 && z < -38) continue;
      // Skip area around building at x=-35, z=-70
      if (x > -45 && x < -25 && z > -80 && z < -60) continue;

      if (Math.random() > 0.12) {
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetZ = (Math.random() - 0.5) * 3;

        // Tree trunk
        const trunkHeight = 3 + Math.random() * 2;
        const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 6);
        const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.set(x + offsetX, groundY + trunkHeight / 2, z + offsetZ);
        scene.add(trunk);

        // Tree foliage
        const foliageColor = treeColors[Math.floor(Math.random() * treeColors.length)];
        const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

        // Bottom foliage layer
        const foliage1Geom = new THREE.ConeGeometry(2.5 + Math.random(), 4 + Math.random() * 2, 6);
        const foliage1 = new THREE.Mesh(foliage1Geom, foliageMat);
        foliage1.position.set(x + offsetX, groundY + trunkHeight + 2, z + offsetZ);
        scene.add(foliage1);

        // Top foliage layer
        const foliage2Geom = new THREE.ConeGeometry(1.5 + Math.random(), 3 + Math.random(), 6);
        const foliage2 = new THREE.Mesh(foliage2Geom, foliageMat);
        foliage2.position.set(x + offsetX, groundY + trunkHeight + 4.5 + Math.random(), z + offsetZ);
        scene.add(foliage2);
      }
    }
  }

  // === Helper function for creating hills ===
  function createHill(x, z, width, height, depth) {
    const group = new THREE.Group();

    const hillGeom = new THREE.ConeGeometry(width, height, 8);
    const hillMat = new THREE.MeshBasicMaterial({ color: hillColor });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(0, height / 2, 0);
    hill.scale.set(1, 1, depth / width);
    group.add(hill);

    // Secondary mound
    const mound2Geom = new THREE.ConeGeometry(width * 0.5, height * 0.6, 6);
    const mound2Mat = new THREE.MeshBasicMaterial({ color: hillColorLight });
    const mound2 = new THREE.Mesh(mound2Geom, mound2Mat);
    mound2.position.set(width * 0.35, height * 0.3, depth * 0.2);
    group.add(mound2);

    group.position.set(x, groundY, z);
    scene.add(group);
    return group;
  }

  // === Outer mountains (far west, x = -180 to -230) ===
  // Far south section (z = -70 to -95)
  createHill(-185, -75, 20, 30, 22);
  createHill(-200, -85, 22, 34, 24);
  createHill(-215, -70, 18, 28, 20);
  createHill(-190, -90, 19, 29, 21);
  createHill(-210, -80, 21, 32, 23);
  createHill(-225, -75, 20, 30, 22);
  createHill(-195, -65, 17, 26, 19);
  createHill(-220, -90, 23, 36, 25);

  // South section (z = -35 to -65)
  createHill(-185, -35, 18, 28, 20);
  createHill(-200, -25, 20, 32, 22);
  createHill(-215, -40, 22, 35, 24);
  createHill(-190, -50, 16, 25, 18);
  createHill(-210, -55, 18, 28, 20);
  createHill(-225, -30, 20, 30, 22);
  createHill(-195, -60, 17, 26, 19);
  createHill(-205, -45, 19, 29, 21);
  createHill(-220, -65, 21, 32, 23);

  // Middle section
  createHill(-185, -10, 17, 26, 19);
  createHill(-200, 0, 19, 30, 21);
  createHill(-215, -15, 21, 33, 23);
  createHill(-195, -20, 15, 24, 17);
  createHill(-220, 5, 18, 28, 20);
  createHill(-230, -20, 22, 36, 24);

  // North section
  createHill(-185, 15, 16, 25, 18);
  createHill(-200, 25, 18, 28, 20);
  createHill(-210, 10, 20, 32, 22);
  createHill(-220, 30, 17, 26, 19);
  createHill(-195, 35, 15, 23, 17);
  createHill(-230, 15, 19, 30, 21);

  // === Medium hills (transition zone, x = -160 to -185) ===
  // Extended south
  createHill(-165, -70, 15, 22, 17);
  createHill(-175, -80, 16, 24, 18);
  createHill(-160, -60, 14, 20, 16);
  createHill(-180, -75, 17, 25, 19);
  createHill(-170, -85, 15, 22, 17);
  createHill(-165, -55, 13, 19, 15);
  createHill(-175, -65, 14, 21, 16);
  createHill(-180, -90, 16, 24, 18);

  // Original middle zone
  createHill(-165, -30, 14, 20, 16);
  createHill(-175, -45, 15, 22, 17);
  createHill(-160, -20, 13, 18, 15);
  createHill(-180, -35, 16, 24, 18);
  createHill(-170, -10, 14, 20, 16);
  createHill(-165, 0, 12, 17, 14);
  createHill(-175, 10, 15, 22, 17);
  createHill(-180, -5, 13, 19, 15);

  // === Fill gaps near curve (x = -65 to -120) ===
  // Extended south coverage - avoiding building at x=-68, z=-80
  createHill(-70, -50, 11, 16, 13);
  createHill(-82, -60, 12, 18, 14);
  createHill(-90, -55, 13, 19, 15);
  // Moved away from building at -68, -80
  createHill(-85, -70, 11, 16, 13);
  createHill(-88, -78, 12, 17, 14);
  createHill(-95, -65, 14, 20, 16);
  // Removed hill at -70, -80 (overlaps building)
  createHill(-82, -88, 11, 16, 13);
  createHill(-92, -82, 12, 17, 14);

  // More south coverage (x = -100 to -150)
  createHill(-105, -70, 13, 19, 15);
  createHill(-115, -80, 14, 20, 16);
  createHill(-125, -75, 15, 22, 17);
  createHill(-135, -85, 14, 20, 16);
  createHill(-145, -70, 13, 19, 15);
  createHill(-110, -90, 12, 18, 14);
  createHill(-120, -65, 13, 19, 15);
  createHill(-130, -90, 14, 21, 16);
  createHill(-140, -80, 15, 22, 17);
  createHill(-150, -85, 14, 20, 16);

  // Original near curve
  createHill(-70, -25, 10, 14, 12);
  createHill(-80, -30, 11, 16, 13);
  createHill(-85, -20, 9, 13, 11);
  createHill(-75, -15, 10, 15, 12);
  createHill(-90, -25, 12, 17, 14);
  createHill(-68, -35, 8, 12, 10);
  createHill(-95, -40, 11, 16, 13);
  createHill(-100, -35, 12, 17, 14);
  createHill(-110, -45, 13, 18, 15);
  createHill(-120, -40, 12, 17, 14);
}

// ============================================
// Hotel Back Forest and Mountains
// ============================================

/**
 * Create large forest and mountains behind the hotel
 */
function createHotelBackForestAndMountains(scene) {
  const groundY = 0;

  // === Ground for forest area ===
  const forestGroundGeom = new THREE.PlaneGeometry(120, 80);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2a20 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(160, groundY + 0.01, 0);
  scene.add(forestGround);

  // === Dense Forest Trees ===
  const treeColors = [0x1a3a2a, 0x2a4a3a, 0x1a4a2a, 0x2a3a2a, 0x1a5a3a];

  // Forest area: x = 110 to 200, z = -40 to 40
  // Skip trees near road (z = -28 to -12)
  for (let x = 110; x < 200; x += 4 + Math.random() * 3) {
    for (let z = -35; z < 35; z += 4 + Math.random() * 3) {
      // Skip road area
      if (z > -28 && z < -12) continue;

      if (Math.random() > 0.1) {
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetZ = (Math.random() - 0.5) * 3;

        // Tree trunk
        const trunkHeight = 3 + Math.random() * 2;
        const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 6);
        const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.set(x + offsetX, groundY + trunkHeight / 2, z + offsetZ);
        scene.add(trunk);

        // Tree foliage (multiple layers for dense look)
        const foliageColor = treeColors[Math.floor(Math.random() * treeColors.length)];
        const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

        // Bottom foliage layer
        const foliage1Geom = new THREE.ConeGeometry(3 + Math.random(), 5 + Math.random() * 2, 6);
        const foliage1 = new THREE.Mesh(foliage1Geom, foliageMat);
        foliage1.position.set(x + offsetX, groundY + trunkHeight + 2, z + offsetZ);
        scene.add(foliage1);

        // Top foliage layer
        const foliage2Geom = new THREE.ConeGeometry(2 + Math.random(), 4 + Math.random(), 6);
        const foliage2 = new THREE.Mesh(foliage2Geom, foliageMat);
        foliage2.position.set(x + offsetX, groundY + trunkHeight + 5 + Math.random(), z + offsetZ);
        scene.add(foliage2);
      }
    }
  }

  // === Triangle mountain with arch tunnel (ExtrudeGeometry) ===
  const tunnelX = 230;
  const tunnelZ = -20;
  const tunnelRadius = 5;
  const mtnWidth = 25;   // Half-width of triangle base (z-axis)
  const mtnDepth = 40;   // Depth/length of mountain (x-axis)
  const mtnHeight = 35;
  const tunnelMtnColor = 0x1a4a2a;

  // Entrance position
  const entranceX = tunnelX;

  // Create triangular mountain profile with tunnel hole
  const mtnShape = new THREE.Shape();
  mtnShape.moveTo(-mtnWidth, 0);        // Bottom-left
  mtnShape.lineTo(0, mtnHeight);        // Peak
  mtnShape.lineTo(mtnWidth, 0);         // Bottom-right
  mtnShape.closePath();

  // Add tunnel hole (semi-circle at bottom)
  const hole = new THREE.Path();
  hole.absarc(0, 0, tunnelRadius, 0, Math.PI, false);
  mtnShape.holes.push(hole);

  // Extrude the shape
  const mtnGeom = new THREE.ExtrudeGeometry(mtnShape, {
    steps: 1,
    depth: mtnDepth,
    bevelEnabled: false
  });
  const mtnMat = new THREE.MeshBasicMaterial({ color: tunnelMtnColor, side: THREE.DoubleSide });
  const mtn = new THREE.Mesh(mtnGeom, mtnMat);
  mtn.rotation.y = -Math.PI / 2;
  mtn.position.set(entranceX, 0, tunnelZ);
  scene.add(mtn);

  // Tunnel interior (dark semi-cylinder)
  const intShape = new THREE.Shape();
  intShape.absarc(0, 0, tunnelRadius - 0.1, 0, Math.PI, false);
  intShape.closePath();
  const intGeom = new THREE.ExtrudeGeometry(intShape, {
    steps: 1,
    depth: mtnDepth,
    bevelEnabled: false
  });
  const intMat = new THREE.MeshBasicMaterial({ color: 0x080810, side: THREE.BackSide });
  const tunnelInt = new THREE.Mesh(intGeom, intMat);
  tunnelInt.rotation.y = -Math.PI / 2;
  tunnelInt.position.set(entranceX, 0, tunnelZ);
  scene.add(tunnelInt);

  // Road inside tunnel (extended well beyond tunnel length)
  const inRoadGeom = new THREE.PlaneGeometry(mtnDepth + 60, tunnelRadius * 2);
  const inRoadMat = new THREE.MeshBasicMaterial({ color: 0x1a1a22 });
  const inRoad = new THREE.Mesh(inRoadGeom, inRoadMat);
  inRoad.rotation.x = -Math.PI / 2;
  inRoad.rotation.z = Math.PI / 2;
  inRoad.position.set(entranceX + mtnDepth / 2 + 15, 0.03, tunnelZ);
  scene.add(inRoad);

  // Stone arch frame at tunnel entrance (extends into tunnel)
  const archStartX = 190;
  const archLength = 15; // Length extending into tunnel
  const archMat = new THREE.MeshBasicMaterial({ color: 0x3a3a42 }); // Dark gray
  const archRadius = tunnelRadius + 0.15;
  const frameSegments = 24;

  // Create arch that extends into tunnel
  for (let layer = 0; layer < 3; layer++) {
    const layerX = archStartX + layer * (archLength / 2);
    for (let i = 0; i <= frameSegments; i++) {
      const ang = (i / frameSegments) * Math.PI;
      const fz = Math.cos(ang) * archRadius;
      const fy = Math.sin(ang) * archRadius;
      const frameGeom = new THREE.BoxGeometry(archLength / 2 + 1, 0.55, 0.55);
      const frame = new THREE.Mesh(frameGeom, archMat);
      frame.position.set(layerX, fy, tunnelZ + fz);
      scene.add(frame);
    }
  }

  // Approach road
  const appRoadGeom = new THREE.PlaneGeometry(15, tunnelRadius * 2);
  const appRoadMat = new THREE.MeshBasicMaterial({ color: 0x252530 });
  const appRoad = new THREE.Mesh(appRoadGeom, appRoadMat);
  appRoad.rotation.x = -Math.PI / 2;
  appRoad.rotation.z = Math.PI / 2;
  appRoad.position.set(entranceX - 9, 0.02, tunnelZ);
  scene.add(appRoad);

  // === Mountains surrounding all forest areas ===
  const mountainColors = [0x2a3a4a, 0x3a4a5a, 0x4a5a6a, 0x3a4a55];

  // Helper function to create a mountain
  function createMountain(x, z, width, height) {
    const color = mountainColors[Math.floor(Math.random() * mountainColors.length)];
    const mountainMat = new THREE.MeshBasicMaterial({ color: color });

    const mountainGeom = new THREE.ConeGeometry(width / 2, height, 6);
    const mountain = new THREE.Mesh(mountainGeom, mountainMat);
    mountain.position.set(x, groundY + height / 2, z);
    scene.add(mountain);

    // Snow cap on taller mountains
    if (height > 50) {
      const snowCapGeom = new THREE.ConeGeometry(width / 6, height / 5, 6);
      const snowCapMat = new THREE.MeshBasicMaterial({ color: 0xeeeeff });
      const snowCap = new THREE.Mesh(snowCapGeom, snowCapMat);
      snowCap.position.set(x, groundY + height - height / 10, z);
      scene.add(snowCap);
    }
  }

  // === Hills covering road area between tunnel and back mountains ===
  // Hills placed on the road (z=-20) to fill empty space after tunnel
  createMountain(240, -20, 25, 30);
  createMountain(250, -15, 22, 28);
  createMountain(245, -25, 20, 25);
  createMountain(255, -22, 24, 32);
  createMountain(248, -18, 18, 22);
  createMountain(260, -20, 26, 35);

  // === Mountains at road end to completely cover the road ===
  createMountain(280, -20, 40, 50);
  createMountain(290, -15, 35, 45);
  createMountain(285, -25, 38, 48);
  createMountain(295, -20, 42, 55);
  createMountain(300, -18, 45, 60);

  // === Fill remaining gap on opposite side of tunnel ===
  createMountain(265, -35, 30, 40);
  createMountain(270, -45, 35, 45);
  createMountain(275, -30, 28, 38);
  createMountain(265, 0, 30, 40);
  createMountain(270, 10, 35, 45);
  createMountain(275, -5, 28, 38);

  // === Closer to tunnel ===
  createMountain(235, -40, 25, 30);
  createMountain(240, -50, 28, 35);
  createMountain(235, 5, 25, 30);
  createMountain(240, 15, 28, 35);
  createMountain(245, -45, 22, 28);
  createMountain(245, 10, 22, 28);

  // === Back mountains (behind hotel, +X direction) ===
  createMountain(250, -55, 50, 60);
  createMountain(245, 45, 55, 70);
  createMountain(270, 20, 45, 90);
  createMountain(280, -60, 50, 65);
  createMountain(285, 50, 55, 75);
  createMountain(300, 10, 60, 100);
  createMountain(310, -50, 45, 70);
  createMountain(315, 35, 50, 85);

  // === Right side mountains (behind sloped residential forest, +Z direction) ===
  createMountain(50, 110, 50, 70);
  createMountain(75, 115, 55, 85);
  createMountain(100, 120, 60, 95);
  createMountain(125, 115, 50, 75);
  createMountain(150, 110, 55, 80);
  createMountain(175, 115, 60, 90);
  createMountain(200, 110, 50, 70);

  // Second row (further back)
  createMountain(60, 140, 55, 90);
  createMountain(90, 145, 60, 100);
  createMountain(120, 150, 65, 110);
  createMountain(150, 145, 55, 85);
  createMountain(180, 140, 60, 95);

  // === Back-left mountains (behind original forest, +Z direction at negative X) ===
  createMountain(-50, 110, 55, 75);
  createMountain(-25, 115, 60, 85);
  createMountain(0, 120, 65, 95);
  createMountain(25, 115, 55, 80);

  // Second row
  createMountain(-40, 145, 60, 95);
  createMountain(-10, 150, 65, 105);
  createMountain(20, 145, 55, 90);

  // === Left side mountains (-X direction) ===
  createMountain(-100, 80, 50, 65);
  createMountain(-110, 50, 55, 75);
  createMountain(-105, 20, 50, 70);
  createMountain(-115, -10, 55, 80);
  createMountain(-100, -35, 50, 60);

  // Second row (further left)
  createMountain(-130, 65, 55, 85);
  createMountain(-140, 35, 60, 95);
  createMountain(-135, 5, 55, 80);
  createMountain(-145, -25, 60, 90);

  // === Corner mountains (connecting ranges) ===
  // Back-right corner (connects back and right ranges)
  createMountain(210, 60, 55, 75);
  createMountain(220, 85, 60, 85);
  createMountain(200, 95, 50, 70);

  // Back-left corner
  createMountain(-80, 95, 55, 70);
  createMountain(-95, 105, 50, 65);

  // === Additional smaller hills in front of mountains ===
  // Skip tunnel area (x: 180-290, z: -50 to 10)
  for (let i = 0; i < 25; i++) {
    const hillX = 180 + Math.random() * 40;
    const hillZ = -40 + Math.random() * 100;

    // Skip tunnel area (expanded to account for hill sizes)
    if (hillX > 180 && hillX < 290 && hillZ > -50 && hillZ < 10) {
      continue;
    }

    const hillSize = 10 + Math.random() * 15;
    const hillHeight = 15 + Math.random() * 25;

    const hillGeom = new THREE.ConeGeometry(hillSize, hillHeight, 5);
    const hillMat = new THREE.MeshBasicMaterial({
      color: treeColors[Math.floor(Math.random() * treeColors.length)]
    });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(hillX, groundY + hillHeight / 2, hillZ);
    scene.add(hill);
  }

  // Hills on right side (z direction)
  for (let i = 0; i < 20; i++) {
    const hillX = 40 + Math.random() * 140;
    const hillZ = 95 + Math.random() * 20;
    const hillSize = 10 + Math.random() * 12;
    const hillHeight = 12 + Math.random() * 20;

    const hillGeom = new THREE.ConeGeometry(hillSize, hillHeight, 5);
    const hillMat = new THREE.MeshBasicMaterial({
      color: treeColors[Math.floor(Math.random() * treeColors.length)]
    });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(hillX, groundY + hillHeight / 2, hillZ);
    scene.add(hill);
  }

  // Hills on left side (-x direction)
  for (let i = 0; i < 15; i++) {
    const hillX = -85 + Math.random() * 20;
    const hillZ = -30 + Math.random() * 100;
    const hillSize = 8 + Math.random() * 12;
    const hillHeight = 12 + Math.random() * 18;

    const hillGeom = new THREE.ConeGeometry(hillSize, hillHeight, 5);
    const hillMat = new THREE.MeshBasicMaterial({
      color: treeColors[Math.floor(Math.random() * treeColors.length)]
    });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(hillX, groundY + hillHeight / 2, hillZ);
    scene.add(hill);
  }
}

// ============================================
// Main Export Functions
// ============================================

/**
 * Create all buildings and structures
 */
/**
 * Check if two buildings overlap (2D check on XZ plane)
 */
function checkBuildingOverlap(b1, b2) {
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
function getBuildingVolume(building) {
  const size = building.userData.buildingSize || { width: 10, depth: 10, height: 20 };
  return size.width * size.depth * size.height;
}

/**
 * Remove overlapping buildings, keeping larger ones
 */
function removeOverlappingBuildings(scene, buildings) {
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

export function createAllBuildings(scene) {
  let buildings = [];

  // Residential district (31 houses)
  buildings.push(...createResidentialDistrict(scene));

  // Sloped residential area on right side
  buildings.push(...createSlopedResidentialArea(scene));

  // High-rise buildings (3 clusters - expanded)
  buildings.push(...createLeftBuildings(scene));
  buildings.push(...createRightBuildings(scene));
  buildings.push(...createCenterBuildings(scene));

  // South side buildings (fill empty area)
  buildings.push(...createSouthBuildings(scene));

  // Remove overlapping buildings (keep larger ones)
  buildings = removeOverlappingBuildings(scene, buildings);

  // Shopping district (16 shops) - added AFTER overlap removal to preserve all shops
  buildings.push(...createShoppingDistrict(scene));

  // Forest behind residential district
  createForest(scene);

  // Large forest and mountains behind hotel
  createHotelBackForestAndMountains(scene);

  // Forest behind sloped residential area
  createSlopedAreaForest(scene);

  // Natural hills around sloped residential area edges
  createSlopedAreaEdgeHills(scene);

  // Hills in left north area (replacing removed buildings above main road)
  createLeftNorthHills(scene);

  // Forest and mountains west of curved road
  createCurveWestForestAndMountains(scene);

  // Stairs
  createZigzagStairs(scene);

  // Utility poles & power lines
  createUtilitySystem(scene);

  // Vendor stalls
  createVendorStalls(scene);

  // Parks beside shopping district
  createParks(scene);

  return buildings;
}

/**
 * Create all trees
 */
export function createAllTreesExport(scene) {
  return createAllTrees(scene);
}

/**
 * Create all street lamps
 */
export function createAllStreetLampsExport(scene) {
  return createAllStreetLamps(scene);
}

// For backward compatibility with city-main.js
export { createAllTrees as createAllTrees };
export { createAllStreetLamps as createAllStreetLamps };

/**
 * Standing sign (for content placement)
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

export function createAllBenches(scene) {
  return [];
}
