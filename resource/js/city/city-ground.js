/**
 * city-ground.js
 * Hong Kong Citypop Night City - All Ground Surfaces
 *
 * Height Levels (organized from lowest to highest):
 *
 * ═══════════════════════════════════════════════════════════════════════
 * LEVEL 0: Base Level (y ≤ 0)
 * ═══════════════════════════════════════════════════════════════════════
 *   y = -0.1   : Distant ground (radius 550 circle)
 *   y = -0.02  : Level 1 main road base
 *   y = 0.005  : South area ground
 *   y = 0.01   : Curve west forest ground, Hotel back forest ground
 *   y = 0.02   : Tunnel approach road
 *   y = 0.03   : Tunnel inside road
 *
 * ═══════════════════════════════════════════════════════════════════════
 * LEVEL 2: Shopping District (y = 2)
 * ═══════════════════════════════════════════════════════════════════════
 *   y = 2.0    : Level 2 shopping district base
 *   y = 2.01   : Shopping alley, Left park (playground), Right park (fountain)
 *   y = 2.02   : Park rubber surfaces, Park paths
 *
 * ═══════════════════════════════════════════════════════════════════════
 * LEVEL 10: Residential District (y = 10)
 * ═══════════════════════════════════════════════════════════════════════
 *   y = 9.99   : Forest behind residential
 *   y = 10.0   : Level 4 residential road base
 *   y = 10.01  : Level 5 residential district, Residential pedestrian path
 *   y = 10.02  : Left north hills ground
 *
 * ═══════════════════════════════════════════════════════════════════════
 * LEVEL 10~16: Sloped Area (y = 10 → 16)
 * ═══════════════════════════════════════════════════════════════════════
 *   y = 10.01~16    : Sloped road (BufferGeometry)
 *   y = 10.02~16.01 : Sloped residential ground (BufferGeometry)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * LEVEL 16: Flat Top Area (y = 16)
 * ═══════════════════════════════════════════════════════════════════════
 *   y = 16.01  : Flat top ground, Sloped area forest ground
 *   y = 16.02  : Flat top road
 */

import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════════════
// LEVEL 0: Base Level Grounds (y ≤ 0)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create distant ground (y = -0.1)
 * Large circle that extends to silhouette panels
 */
export function createDistantGround(scene) {
  const distantGroundGeometry = new THREE.CircleGeometry(550, 64);
  const distantGroundMaterial = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
  const distantGround = new THREE.Mesh(distantGroundGeometry, distantGroundMaterial);
  distantGround.rotation.x = -Math.PI / 2;
  distantGround.position.set(0, -0.1, 0);
  scene.add(distantGround);
}

/**
 * Create main road level base (y = -0.02)
 * Dark blue-gray sidewalk base
 */
export function createMainRoadBase(scene) {
  const level1Geometry = new THREE.PlaneGeometry(600, 320);
  const level1Material = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
  const level1 = new THREE.Mesh(level1Geometry, level1Material);
  level1.rotation.x = -Math.PI / 2;
  level1.position.set(-100, -0.02, 0);
  scene.add(level1);
}

/**
 * Create south area ground (y = 0.005)
 * Expanded ground plane for south buildings area
 */
export function createSouthAreaGround(scene) {
  const southGroundGeom = new THREE.PlaneGeometry(500, 130);
  const southGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a1a25 });
  const southGround = new THREE.Mesh(southGroundGeom, southGroundMat);
  southGround.rotation.x = -Math.PI / 2;
  southGround.position.set(-10, 0.005, -145);
  scene.add(southGround);
}

/**
 * Create curve west forest ground (y = 0.01)
 * Ground for forest west of curved road
 */
export function createCurveWestForestGround(scene) {
  const forestGroundGeom = new THREE.PlaneGeometry(150, 110);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2a20 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(-125, 0.01, -40);
  scene.add(forestGround);
}

/**
 * Create hotel back forest ground (y = 0.01)
 * Ground for forest behind the hotel
 */
export function createHotelBackForestGround(scene) {
  const forestGroundGeom = new THREE.PlaneGeometry(120, 80);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2a20 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(160, 0.01, 0);
  scene.add(forestGround);
}

/**
 * Create tunnel roads (y = 0.02, 0.03)
 * Inside tunnel road and approach road
 */
export function createTunnelRoads(scene) {
  const tunnelZ = -20;
  const tunnelRadius = 8;
  const mtnDepth = 40;
  const entranceX = 190;

  // Road inside tunnel (y = 0.03)
  const inRoadGeom = new THREE.PlaneGeometry(mtnDepth + 60, tunnelRadius * 2);
  const inRoadMat = new THREE.MeshBasicMaterial({ color: 0x1a1a22 });
  const inRoad = new THREE.Mesh(inRoadGeom, inRoadMat);
  inRoad.rotation.x = -Math.PI / 2;
  inRoad.rotation.z = Math.PI / 2;
  inRoad.position.set(entranceX + mtnDepth / 2 + 15, 0.03, tunnelZ);
  scene.add(inRoad);

  // Approach road (y = 0.02)
  const appRoadGeom = new THREE.PlaneGeometry(15, tunnelRadius * 2);
  const appRoadMat = new THREE.MeshBasicMaterial({ color: 0x252530 });
  const appRoad = new THREE.Mesh(appRoadGeom, appRoadMat);
  appRoad.rotation.x = -Math.PI / 2;
  appRoad.rotation.z = Math.PI / 2;
  appRoad.position.set(entranceX - 9, 0.02, tunnelZ);
  scene.add(appRoad);
}

// ════════════════════════════════════════════════════════════════════════════
// LEVEL 2: Shopping District Grounds (y = 2)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create shopping district base (y = 2)
 * Extended to include parks on both sides
 * x: -52 ~ 47 (parks + shopping), z: -3 ~ 15
 */
export function createShoppingDistrictBase(scene) {
  // Main platform covering shopping district + both parks
  // Left park: x=-52 to -28, Right park: x=23 to 47, Shopping: x=-22 to 22
  const level2Geometry = new THREE.PlaneGeometry(99, 18);
  const level2Material = new THREE.MeshBasicMaterial({ color: 0x40404f });
  const level2 = new THREE.Mesh(level2Geometry, level2Material);
  level2.rotation.x = -Math.PI / 2;
  level2.position.set(-2.5, 2, 6); // Center at x=-2.5 to cover -52 to 47
  scene.add(level2);

  // Retaining wall front (y=0 to y=2, z=-3)
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x2a2a32 });
  const frontWallGeom = new THREE.BoxGeometry(99, 2, 0.5);
  const frontWall = new THREE.Mesh(frontWallGeom, wallMat);
  frontWall.position.set(-2.5, 1, -3);
  scene.add(frontWall);

  // Retaining wall back (y=0 to y=2, z=15)
  const backWall = new THREE.Mesh(frontWallGeom, wallMat);
  backWall.position.set(-2.5, 1, 15);
  scene.add(backWall);

  // Left side wall
  const sideWallGeom = new THREE.BoxGeometry(0.5, 2, 18);
  const leftWall = new THREE.Mesh(sideWallGeom, wallMat);
  leftWall.position.set(-52, 1, 6);
  scene.add(leftWall);

  // Right side wall (up to hotel area)
  const rightWall = new THREE.Mesh(sideWallGeom, wallMat);
  rightWall.position.set(47, 1, 6);
  scene.add(rightWall);
}

/**
 * Create shopping alley (y = 2.01)
 * x: -22~22, z: 4~6
 */
export function createShoppingAlley(scene) {
  const alleyGeometry = new THREE.PlaneGeometry(44, 2);
  const alleyMaterial = new THREE.MeshBasicMaterial({ color: 0x2a2a35 });
  const alley = new THREE.Mesh(alleyGeometry, alleyMaterial);
  alley.rotation.x = -Math.PI / 2;
  alley.position.set(0, 2.01, 5);
  scene.add(alley);
}

/**
 * Create left park ground - Children's Playground (y = 2.01, 2.02)
 * x: -51 ~ -29, z: -2 ~ 14
 */
export function createLeftParkGround(scene) {
  const groundY = 2;
  const parkMat = new THREE.MeshBasicMaterial({ color: 0x2a3a2a });
  const pathMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });
  const rubberMat = new THREE.MeshBasicMaterial({ color: 0x664422 });

  // Main playground ground (y = 2.01)
  const playgroundGeom = new THREE.PlaneGeometry(24, 18);
  const playground = new THREE.Mesh(playgroundGeom, parkMat);
  playground.rotation.x = -Math.PI / 2;
  playground.position.set(-40, groundY + 0.01, 6);
  scene.add(playground);

  // Rubber safety surfaces (y = 2.02)
  const rubberGeom = new THREE.PlaneGeometry(6, 6);
  const rubber1 = new THREE.Mesh(rubberGeom, rubberMat);
  rubber1.rotation.x = -Math.PI / 2;
  rubber1.position.set(-45, groundY + 0.02, 3);
  scene.add(rubber1);

  const rubber2 = new THREE.Mesh(rubberGeom, rubberMat);
  rubber2.rotation.x = -Math.PI / 2;
  rubber2.position.set(-35, groundY + 0.02, 9);
  scene.add(rubber2);

  // Paths (y = 2.02)
  const pathGeom = new THREE.PlaneGeometry(22, 1.5);
  const mainPath = new THREE.Mesh(pathGeom, pathMat);
  mainPath.rotation.x = -Math.PI / 2;
  mainPath.position.set(-40, groundY + 0.02, 6);
  scene.add(mainPath);

  const sidePath = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 16), pathMat);
  sidePath.rotation.x = -Math.PI / 2;
  sidePath.position.set(-40, groundY + 0.02, 6);
  scene.add(sidePath);
}

/**
 * Create right park ground - Fountain Park (y = 2.01, 2.02)
 * x: 24 ~ 46, z: -2 ~ 14
 */
export function createRightParkGround(scene) {
  const groundY = 2;
  const parkMat = new THREE.MeshBasicMaterial({ color: 0x2a3a2a });
  const pathMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });

  // Main park ground (y = 2.01)
  const rightParkGeom = new THREE.PlaneGeometry(24, 18);
  const rightPark = new THREE.Mesh(rightParkGeom, parkMat);
  rightPark.rotation.x = -Math.PI / 2;
  rightPark.position.set(35, groundY + 0.01, 6);
  scene.add(rightPark);

  // Main path - vertical (y = 2.02)
  const rightPathV = new THREE.Mesh(new THREE.PlaneGeometry(2, 16), pathMat);
  rightPathV.rotation.x = -Math.PI / 2;
  rightPathV.position.set(35, groundY + 0.02, 6);
  scene.add(rightPathV);

  // Main path - horizontal (y = 2.02)
  const rightPathH = new THREE.Mesh(new THREE.PlaneGeometry(22, 2), pathMat);
  rightPathH.rotation.x = -Math.PI / 2;
  rightPathH.position.set(35, groundY + 0.02, 6);
  scene.add(rightPathH);

  // Circular path around fountain (y = 2.02)
  const circlePathGeom = new THREE.RingGeometry(4, 5, 24);
  const circlePath = new THREE.Mesh(circlePathGeom, pathMat);
  circlePath.rotation.x = -Math.PI / 2;
  circlePath.position.set(35, groundY + 0.02, 6);
  scene.add(circlePath);
}

// ════════════════════════════════════════════════════════════════════════════
// LEVEL 10: Residential District Grounds (y = 10)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create forest behind residential ground (y = 9.99)
 * Ground plane for forest behind residential district
 */
export function createResidentialForestGround(scene) {
  const groundY = 10;
  const forestGroundGeom = new THREE.PlaneGeometry(140, 50);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2520 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(0, groundY - 0.01, 69);
  scene.add(forestGround);
}

/**
 * Create residential road base (y = 10)
 * z: 18 ~ 28, x: -47.5 ~ 47.5
 */
export function createResidentialRoadBase(scene) {
  const level4Geometry = new THREE.PlaneGeometry(95, 10);
  const level4Material = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
  const level4 = new THREE.Mesh(level4Geometry, level4Material);
  level4.rotation.x = -Math.PI / 2;
  level4.position.set(0, 10, 23);
  scene.add(level4);
}

/**
 * Create residential district ground (y = 10.01)
 * z: 28 ~ 50, x: -47.5 ~ 47.5
 */
export function createResidentialDistrictBase(scene) {
  const level5Geometry = new THREE.PlaneGeometry(95, 22);
  const level5Material = new THREE.MeshBasicMaterial({ color: 0x454555 });
  const level5 = new THREE.Mesh(level5Geometry, level5Material);
  level5.rotation.x = -Math.PI / 2;
  level5.position.set(0, 10.01, 39);
  scene.add(level5);
}

/**
 * Create residential pedestrian path (y = 10.01)
 * x: -47.5~47.5, width 95, length 8
 */
export function createResidentialPedestrianPath(scene) {
  const resPedestrianGeom = new THREE.PlaneGeometry(95, 8);
  const resPedestrianMat = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
  const resPedestrian = new THREE.Mesh(resPedestrianGeom, resPedestrianMat);
  resPedestrian.rotation.x = -Math.PI / 2;
  resPedestrian.position.set(0, 10.01, 24);
  scene.add(resPedestrian);
}

/**
 * Create left north hills ground (y = 10.02)
 * DISABLED - was causing floating ground issue near playground
 */
export function createLeftNorthHillsGround(scene) {
  // Disabled for now
}

// ════════════════════════════════════════════════════════════════════════════
// LEVEL 10~16: Sloped Area Grounds (y = 10 → 16)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create sloped road (y = 10.01 → 16)
 * Diagonal road using BufferGeometry
 */
export function createSlopedRoad(scene) {
  const slopeStartX = 47.5;
  const slopeEndX = 92.5;
  const slopeStartY = 10.01;
  const slopeEndY = 16;
  const roadFrontZ = 18;
  const roadBackZ = 28;

  const slopeRoadVertices = new Float32Array([
    // Triangle 1
    slopeStartX, slopeStartY, roadFrontZ,
    slopeEndX, slopeEndY, roadFrontZ,
    slopeStartX, slopeStartY, roadBackZ,
    // Triangle 2
    slopeEndX, slopeEndY, roadFrontZ,
    slopeEndX, slopeEndY, roadBackZ,
    slopeStartX, slopeStartY, roadBackZ,
  ]);

  const slopeRoadGeom = new THREE.BufferGeometry();
  slopeRoadGeom.setAttribute('position', new THREE.BufferAttribute(slopeRoadVertices, 3));
  slopeRoadGeom.computeVertexNormals();
  const slopeRoad = new THREE.Mesh(slopeRoadGeom, new THREE.MeshBasicMaterial({
    color: 0x3a3a4a,
    side: THREE.DoubleSide
  }));
  scene.add(slopeRoad);
}

/**
 * Create sloped residential ground (y = 10.02 → 16.01)
 * Diagonal ground behind sloped road
 */
export function createSlopedResidentialGround(scene) {
  const slopeStartX = 47.5;
  const slopeEndX = 92.5;
  const slopeStartY = 10.01;
  const slopeEndY = 16;
  const groundStartZ = 28;
  const groundEndZ = 48;

  const slopeGroundVertices = new Float32Array([
    // Triangle 1
    slopeStartX, slopeStartY + 0.01, groundStartZ,
    slopeEndX, slopeEndY + 0.01, groundStartZ,
    slopeStartX, slopeStartY + 0.01, groundEndZ,
    // Triangle 2
    slopeEndX, slopeEndY + 0.01, groundStartZ,
    slopeEndX, slopeEndY + 0.01, groundEndZ,
    slopeStartX, slopeStartY + 0.01, groundEndZ,
  ]);

  const slopeGroundGeom = new THREE.BufferGeometry();
  slopeGroundGeom.setAttribute('position', new THREE.BufferAttribute(slopeGroundVertices, 3));
  slopeGroundGeom.computeVertexNormals();
  const slopeGroundMat = new THREE.MeshBasicMaterial({ color: 0x454555, side: THREE.DoubleSide });
  const slopeGround = new THREE.Mesh(slopeGroundGeom, slopeGroundMat);
  scene.add(slopeGround);
}

// ════════════════════════════════════════════════════════════════════════════
// LEVEL 16: Flat Top Area Grounds (y = 16)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create flat top ground (y = 16.01)
 * Flat area at top of slope
 */
export function createFlatTopGround(scene) {
  const slopeEndX = 92.5;
  const slopeEndY = 16;
  const slopeGroundMat = new THREE.MeshBasicMaterial({ color: 0x454555, side: THREE.DoubleSide });

  const flatTopGeom = new THREE.PlaneGeometry(30, 20);
  const flatTop = new THREE.Mesh(flatTopGeom, slopeGroundMat);
  flatTop.rotation.x = -Math.PI / 2;
  flatTop.position.set(slopeEndX + 15, slopeEndY + 0.01, 38);
  scene.add(flatTop);
}

/**
 * Create flat top road (y = 16.02)
 * Road at top of slope
 */
export function createFlatTopRoad(scene) {
  const slopeEndX = 92.5;
  const slopeEndY = 16;
  const resPedestrianMat = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });

  const flatRoadGeom = new THREE.PlaneGeometry(30, 10);
  const flatRoad = new THREE.Mesh(flatRoadGeom, resPedestrianMat);
  flatRoad.rotation.x = -Math.PI / 2;
  flatRoad.position.set(slopeEndX + 15, slopeEndY + 0.02, 23);
  scene.add(flatRoad);
}

/**
 * Create sloped area forest ground (y = 16.01)
 * Ground for forest behind sloped residential area
 */
export function createSlopedAreaForestGround(scene) {
  const slopeEndY = 16;
  const forestGroundGeom = new THREE.PlaneGeometry(90, 45);
  const forestGroundMat = new THREE.MeshBasicMaterial({ color: 0x1a2a20 });
  const forestGround = new THREE.Mesh(forestGroundGeom, forestGroundMat);
  forestGround.rotation.x = -Math.PI / 2;
  forestGround.position.set(87, slopeEndY + 0.01, 70);
  scene.add(forestGround);
}

// ════════════════════════════════════════════════════════════════════════════
// Main Entry Point - Create All Grounds
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create all ground surfaces (organized by height)
 * This is the main entry point for ground creation
 */
export function createGround(scene) {
  // ─── LEVEL 0: Base Level (y ≤ 0) ───
  createDistantGround(scene);           // y = -0.1
  createMainRoadBase(scene);            // y = -0.02
  createSouthAreaGround(scene);         // y = 0.005
  createCurveWestForestGround(scene);   // y = 0.01
  createHotelBackForestGround(scene);   // y = 0.01
  createTunnelRoads(scene);             // y = 0.02, 0.03

  // ─── LEVEL 2: Shopping District (y = 2) ───
  createShoppingDistrictBase(scene);    // y = 2
  createShoppingAlley(scene);           // y = 2.01
  createLeftParkGround(scene);          // y = 2.01, 2.02
  createRightParkGround(scene);         // y = 2.01, 2.02

  // ─── LEVEL 10: Residential District (y = 10) ───
  createResidentialForestGround(scene); // y = 9.99
  createResidentialRoadBase(scene);     // y = 10
  createResidentialDistrictBase(scene); // y = 10.01
  createResidentialPedestrianPath(scene); // y = 10.01
  createLeftNorthHillsGround(scene);    // y = 10.02

  // ─── LEVEL 10~16: Sloped Area (y = 10 → 16) ───
  createSlopedRoad(scene);              // y = 10.01 → 16
  createSlopedResidentialGround(scene); // y = 10.02 → 16.01

  // ─── LEVEL 16: Flat Top Area (y = 16) ───
  createFlatTopGround(scene);           // y = 16.01
  createFlatTopRoad(scene);             // y = 16.02
  createSlopedAreaForestGround(scene);  // y = 16.01
}
