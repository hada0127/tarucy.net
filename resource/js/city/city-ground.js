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
 * LEVEL 0: Shopping District (y = 0, same as streets)
 * ═══════════════════════════════════════════════════════════════════════
 *   y = 0.01   : Shopping district base, parks
 *   y = 0.02   : Park rubber surfaces, Park paths
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
 * One large bright floor covering entire city area
 */
export function createMainRoadBase(scene) {
  const level1Material = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });

  // Single large floor covering everything
  // x: -300 to 300 (600 wide), z: -300 to 100 (400 deep)
  const level1Geometry = new THREE.PlaneGeometry(600, 400);
  const level1 = new THREE.Mesh(level1Geometry, level1Material);
  level1.rotation.x = -Math.PI / 2;
  level1.position.set(0, -0.02, -100);
  scene.add(level1);
}

/**
 * Create south area ground (y = 0.005)
 * Now covered by extended createMainRoadBase, so this is disabled
 */
export function createSouthAreaGround(scene) {
  // Disabled - now covered by extended main road base
}

/**
 * Create curve west forest ground (y = 0.01)
 * Ground for forest west of curved road
 * Disabled - now covered by main floor
 */
export function createCurveWestForestGround(scene) {
  // Disabled - covered by main floor
}

/**
 * Create hotel back forest ground (y = 0.01)
 * Ground for forest behind the hotel
 * Disabled - now covered by main floor
 */
export function createHotelBackForestGround(scene) {
  // Disabled - covered by main floor
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
// LEVEL 0: Shopping District Grounds (y = 0, same as streets)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create shopping district base (y = 0)
 * Extended to include parks on both sides
 * x: -52 ~ 47 (parks + shopping), z: -3 ~ 15
 */
export function createShoppingDistrictBase(scene) {
  // Main platform covering shopping district + both parks (lowered to y=0)
  // Left park: x=-52 to -28, Right park: x=23 to 47, Shopping: x=-22 to 22
  const level2Geometry = new THREE.PlaneGeometry(99, 18);
  const level2Material = new THREE.MeshBasicMaterial({ color: 0x40404f });
  const level2 = new THREE.Mesh(level2Geometry, level2Material);
  level2.rotation.x = -Math.PI / 2;
  level2.position.set(-2.5, 0.01, 6); // Lowered to y=0
  scene.add(level2);
}

/**
 * Create shopping alley (y = 0.01)
 * x: -22~22, z: 4~6
 * DISABLED - integrated into shopping district base floor
 */
export function createShoppingAlley(scene) {
  // Disabled - now part of shopping district base
}

/**
 * Create left park ground - Children's Playground (y = 0)
 * x: -51 ~ -29, z: -2 ~ 14
 */
export function createLeftParkGround(scene) {
  const groundY = 0;
  const parkMat = new THREE.MeshBasicMaterial({ color: 0x2a3a2a });
  const pathMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });
  const rubberMat = new THREE.MeshBasicMaterial({ color: 0x664422 });

  // Main playground ground (y = 0.01)
  const playgroundGeom = new THREE.PlaneGeometry(24, 18);
  const playground = new THREE.Mesh(playgroundGeom, parkMat);
  playground.rotation.x = -Math.PI / 2;
  playground.position.set(-40, groundY + 0.01, 6);
  scene.add(playground);

  // Rubber safety surfaces (y = 0.02)
  const rubberGeom = new THREE.PlaneGeometry(6, 6);
  const rubber1 = new THREE.Mesh(rubberGeom, rubberMat);
  rubber1.rotation.x = -Math.PI / 2;
  rubber1.position.set(-45, groundY + 0.02, 3);
  scene.add(rubber1);

  const rubber2 = new THREE.Mesh(rubberGeom, rubberMat);
  rubber2.rotation.x = -Math.PI / 2;
  rubber2.position.set(-35, groundY + 0.02, 9);
  scene.add(rubber2);

  // Paths (y = 0.02)
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
 * Create right park ground - Fountain Park (y = 0.01, 0.02)
 * x: 24 ~ 46, z: -2 ~ 14
 */
export function createRightParkGround(scene) {
  const groundY = 0;
  const parkMat = new THREE.MeshBasicMaterial({ color: 0x2a3a2a });
  const pathMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });

  // Main park ground (y = 0.01)
  const rightParkGeom = new THREE.PlaneGeometry(24, 18);
  const rightPark = new THREE.Mesh(rightParkGeom, parkMat);
  rightPark.rotation.x = -Math.PI / 2;
  rightPark.position.set(35, groundY + 0.01, 6);
  scene.add(rightPark);

  // Main path - vertical (y = 0.02)
  const rightPathV = new THREE.Mesh(new THREE.PlaneGeometry(2, 16), pathMat);
  rightPathV.rotation.x = -Math.PI / 2;
  rightPathV.position.set(35, groundY + 0.02, 6);
  scene.add(rightPathV);

  // Main path - horizontal (y = 0.02)
  const rightPathH = new THREE.Mesh(new THREE.PlaneGeometry(22, 2), pathMat);
  rightPathH.rotation.x = -Math.PI / 2;
  rightPathH.position.set(35, groundY + 0.02, 6);
  scene.add(rightPathH);

  // Circular path around fountain (y = 0.02)
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

  // ─── LEVEL 0: Shopping District (same as streets) ───
  createShoppingDistrictBase(scene);    // y = 0.01
  createShoppingAlley(scene);           // disabled
  createLeftParkGround(scene);          // y = 0.01, 0.02
  createRightParkGround(scene);         // y = 0.01, 0.02

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
