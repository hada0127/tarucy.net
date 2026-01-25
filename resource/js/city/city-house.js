/**
 * city-house.js
 * Hong Kong Citypop Night City - House System
 *
 * Residential houses with yards, gates, and various styles.
 */

import * as THREE from 'three';
import { colors, randomColor } from './city-colors.js';

// ============================================
// House Styles
// ============================================

// House style types - all use standard gable roof now
const houseStyles = {
  STANDARD: 'standard',   // Standard 1-story with gable roof
  TWO_STORY: 'two_story'  // 2-story house with gable roof
};

// ============================================
// House Creation Functions
// ============================================

/**
 * Create a single house with wall, building, and gate
 */
export function createHouse(scene, x, z, groundY, config = {}) {
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
export function createResidentialDistrict(scene) {
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
export function createSlopedResidentialArea(scene) {
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
