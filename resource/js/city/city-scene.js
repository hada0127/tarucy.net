/**
 * city-scene.js
 * Hong Kong Citypop Night City - Linear Corridor Layout
 *
 * Layout (top to bottom):
 * - Level 5 (y=12): Residential District ground
 * - Level 4 (y=10): Residential road
 * - Level 2 (y=2): Shopping district ground
 * - Level 1 (y=0): Main road
 *
 * Coordinate system:
 * - X: -50 ~ 50
 * - Z: -36 ~ 36
 */

import * as THREE from 'three';

/**
 * Vaporwave/Cyberpunk night sky texture for sky sphere
 */
function createNightSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Gradient sky - darker at top, reddish/warm glow at horizon (0.5 = horizon)
  const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
  gradient.addColorStop(0, '#050508');    // Very dark at top (zenith)
  gradient.addColorStop(0.15, '#08080f');
  gradient.addColorStop(0.25, '#0a0a14');
  gradient.addColorStop(0.35, '#0f0f1a');
  gradient.addColorStop(0.42, '#151520');
  gradient.addColorStop(0.46, '#1a1525');  // Transition to warm
  gradient.addColorStop(0.48, '#251828');
  gradient.addColorStop(0.5, '#352838');   // Horizon - reddish
  gradient.addColorStop(0.52, '#453040');  // Below horizon - warm reddish
  gradient.addColorStop(0.55, '#352838');
  gradient.addColorStop(0.6, '#1a1525');
  gradient.addColorStop(1, '#0a0a14');     // Below (mirror)

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2048, 1024);

  // Moon (pink/salmon) - positioned behind hotel (+X direction)
  const moonX = 1050; // Behind hotel direction
  const moonY = 380; // Upper sky, not too high to avoid distortion
  const moonRadius = 15; // Small moon

  const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius);
  moonGradient.addColorStop(0, '#ffb8a8');
  moonGradient.addColorStop(0.5, '#ff9080');
  moonGradient.addColorStop(0.85, '#e87878');
  moonGradient.addColorStop(1, 'rgba(200, 100, 120, 0)');

  ctx.fillStyle = moonGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Moon glow (pink) - subtle
  const glowGradient = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2);
  glowGradient.addColorStop(0, 'rgba(255, 150, 140, 0.12)');
  glowGradient.addColorStop(0.5, 'rgba(230, 120, 140, 0.04)');
  glowGradient.addColorStop(1, 'rgba(200, 100, 150, 0)');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Stars - many tiny stars spread across upper sky
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 650; // Upper portion of sky
    const size = Math.random() * 0.4 + 0.1; // Very tiny stars (0.1 ~ 0.5)
    const brightness = 0.1 + Math.random() * 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/**
 * Create sky sphere that surrounds the scene
 */
function createSkySphere(scene) {
  const skyGeometry = new THREE.SphereGeometry(1000, 64, 64);
  const skyTexture = createNightSkyTexture();

  const skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide, // Render inside of sphere
    fog: false, // Sky should not be affected by fog
    depthWrite: false
  });

  const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
  skySphere.renderOrder = -1; // Render first (behind everything)
  scene.add(skySphere);

  return skySphere;
}

/**
 * Create scene
 */
export function createScene() {
  const scene = new THREE.Scene();

  // Use sky sphere instead of fixed background
  createSkySphere(scene);

  // No scene.background - sky sphere handles it

  // Distant silhouettes (mountains north, buildings south)
  createDistantSilhouettes(scene);

  // Cyberpunk fog (only at edges, not center)
  scene.fog = new THREE.Fog(0x0a0a15, 100, 300);
  return scene;
}

/**
 * Renderer
 */
export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);
  return renderer;
}

/**
 * Camera
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1500
  );
  return camera;
}

/**
 * Lighting (MeshBasicMaterial doesn't need lights, but we add ambient for future use)
 */
export function createLighting(scene) {
  return {};
}

/**
 * Create ground levels
 */
export function createGround(scene) {
  // Distant ground - extends to silhouette panels (radius 500)
  const distantGroundGeometry = new THREE.CircleGeometry(550, 64);
  const distantGroundMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a12 });
  const distantGround = new THREE.Mesh(distantGroundGeometry, distantGroundMaterial);
  distantGround.rotation.x = -Math.PI / 2;
  distantGround.position.set(0, -0.1, 0);
  scene.add(distantGround);

  // Level 1: Main road level base (y=0) - dark blue-gray sidewalk (expanded left area 2x)
  const level1Geometry = new THREE.PlaneGeometry(500, 320);
  const level1Material = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
  const level1 = new THREE.Mesh(level1Geometry, level1Material);
  level1.rotation.x = -Math.PI / 2;
  level1.position.set(-50, -0.02, 0);
  scene.add(level1);

  // Level 2: Shopping district ground (y=2)
  // z: 4 ~ 11 (depth 7), x: -22 ~ 22 (width 44)
  const level2Geometry = new THREE.PlaneGeometry(44, 14.5);
  const level2Material = new THREE.MeshBasicMaterial({ color: 0x40404f });
  const level2 = new THREE.Mesh(level2Geometry, level2Material);
  level2.rotation.x = -Math.PI / 2;
  level2.position.set(0, 2, 7.25);
  scene.add(level2);

  // Level 4: Residential road area (y=10) - expanded width
  // z: 18 ~ 28 (depth 10), x: -47.5 ~ 47.5 (width 95)
  const level4Geometry = new THREE.PlaneGeometry(95, 10);
  const level4Material = new THREE.MeshBasicMaterial({ color: 0x3a3a4a });
  const level4 = new THREE.Mesh(level4Geometry, level4Material);
  level4.rotation.x = -Math.PI / 2;
  level4.position.set(0, 10, 23);
  scene.add(level4);

  // Level 5: Residential district ground (y=10) - same as road level
  // z: 28 ~ 50 (depth 22), x: -47.5 ~ 47.5 (width 95) - matches road width
  const level5Geometry = new THREE.PlaneGeometry(95, 22);
  const level5Material = new THREE.MeshBasicMaterial({ color: 0x454555 });
  const level5 = new THREE.Mesh(level5Geometry, level5Material);
  level5.rotation.x = -Math.PI / 2;
  level5.position.set(0, 10.01, 39);
  scene.add(level5);
}

/**
 * Create road helper
 */
function createRoad(scene, x, z, y, width, length, rotation = 0) {
  // Road (dark navy)
  const roadGeometry = new THREE.PlaneGeometry(width, length);
  const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x252530 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rotation;
  road.position.set(x, y + 0.01, z);
  scene.add(road);

  // Center line removed - using dashed yellow line for main road instead

  // Road edges (light pink)
  const edgeGeom = new THREE.PlaneGeometry(0.15, length);
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xddaaaa });

  const leftEdge = new THREE.Mesh(edgeGeom, edgeMat);
  leftEdge.rotation.x = -Math.PI / 2;
  leftEdge.rotation.z = rotation;
  if (rotation === 0) {
    leftEdge.position.set(x - width/2 + 0.2, y + 0.02, z);
  } else {
    leftEdge.position.set(x, y + 0.02, z - width/2 + 0.2);
  }
  scene.add(leftEdge);

  const rightEdge = new THREE.Mesh(edgeGeom, edgeMat);
  rightEdge.rotation.x = -Math.PI / 2;
  rightEdge.rotation.z = rotation;
  if (rotation === 0) {
    rightEdge.position.set(x + width/2 - 0.2, y + 0.02, z);
  } else {
    rightEdge.position.set(x, y + 0.02, z + width/2 - 0.2);
  }
  scene.add(rightEdge);
}

/**
 * Create roads - Main road + Residential road + Shopping alley
 */
export function createRoads(scene) {
  // Main road (y=0): 2-lane road, extended to tunnel entrance, centered at x=0
  createRoad(scene, 0, -20, 0, 600, 10);

  // === Main road markings ===
  const roadY = 0.03;
  const roadZ = -20;
  const roadLength = 600;
  const roadWidth = 10;
  const roadCenterX = 0;

  // Dashed yellow center line
  const dashLength = 3;
  const dashGap = 2;
  const numDashes = Math.floor(roadLength / (dashLength + dashGap));
  const centerLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

  for (let i = 0; i < numDashes; i++) {
    const dashGeom = new THREE.PlaneGeometry(dashLength, 0.2);
    const dash = new THREE.Mesh(dashGeom, centerLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(roadCenterX - roadLength/2 + dashLength/2 + i * (dashLength + dashGap), roadY, roadZ);
    scene.add(dash);
  }

  // Yellow no-parking lines on both sides
  const noStopLineMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const sideLineGeom = new THREE.PlaneGeometry(roadLength, 0.15);

  const leftSideLine = new THREE.Mesh(sideLineGeom, noStopLineMat);
  leftSideLine.rotation.x = -Math.PI / 2;
  leftSideLine.position.set(roadCenterX, roadY, roadZ - roadWidth/2 + 0.8);
  scene.add(leftSideLine);

  const rightSideLine = new THREE.Mesh(sideLineGeom, noStopLineMat);
  rightSideLine.rotation.x = -Math.PI / 2;
  rightSideLine.position.set(roadCenterX, roadY, roadZ + roadWidth/2 - 0.8);
  scene.add(rightSideLine);

  // Crosswalks (zebra crossings) - 2 crosswalks
  const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  const crosswalkPositions = [-25, 25]; // X positions for crosswalks

  crosswalkPositions.forEach(xPos => {
    // Each crosswalk has multiple stripes running along X axis
    const stripeLength = 4; // Length along X
    const stripeWidth = 0.5; // Width along Z
    const stripeGap = 0.4;
    const numStripes = 10; // Fit within road width

    for (let i = 0; i < numStripes; i++) {
      const stripeGeom = new THREE.PlaneGeometry(stripeLength, stripeWidth);
      const stripe = new THREE.Mesh(stripeGeom, crosswalkMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(
        xPos,
        roadY + 0.01,
        roadZ - roadWidth/2 + 1 + i * (stripeWidth + stripeGap)
      );
      scene.add(stripe);
    }
  });

  // Residential pedestrian path (y=10): x=-47.5~47.5 (width 95, length 8) - sidewalk style, no center line
  const resPedestrianGeom = new THREE.PlaneGeometry(95, 8);
  const resPedestrianMat = new THREE.MeshBasicMaterial({ color: 0x3a3a4a }); // Same as sidewalk
  const resPedestrian = new THREE.Mesh(resPedestrianGeom, resPedestrianMat);
  resPedestrian.rotation.x = -Math.PI / 2;
  resPedestrian.position.set(0, 10.01, 24);
  scene.add(resPedestrian);

  // === Right side sloped road extension (smooth diagonal using BufferGeometry) ===
  const slopeStartX = 47.5;
  const slopeEndX = 92.5;
  const slopeStartY = 10.01;
  const slopeEndY = 16;
  const roadFrontZ = 18; // Match Level 4 front edge (z=18) to reach guardrail
  const roadBackZ = 28;  // Match Level 4 back edge

  // Create sloped road using BufferGeometry with explicit vertices
  const slopeRoadVertices = new Float32Array([
    // Triangle 1
    slopeStartX, slopeStartY, roadFrontZ,  // bottom-left-front
    slopeEndX, slopeEndY, roadFrontZ,      // bottom-right-front
    slopeStartX, slopeStartY, roadBackZ,   // bottom-left-back
    // Triangle 2
    slopeEndX, slopeEndY, roadFrontZ,      // bottom-right-front
    slopeEndX, slopeEndY, roadBackZ,       // bottom-right-back
    slopeStartX, slopeStartY, roadBackZ,   // bottom-left-back
  ]);

  const slopeRoadGeom = new THREE.BufferGeometry();
  slopeRoadGeom.setAttribute('position', new THREE.BufferAttribute(slopeRoadVertices, 3));
  slopeRoadGeom.computeVertexNormals();
  const slopeRoad = new THREE.Mesh(slopeRoadGeom, new THREE.MeshBasicMaterial({
    color: 0x3a3a4a,
    side: THREE.DoubleSide
  }));
  scene.add(slopeRoad);

  // Sloped ground behind the road (residential area) - same level as road
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

  // Flat area at top of slope (y=16, x=92.5~122.5) - same level as road
  const flatTopGeom = new THREE.PlaneGeometry(30, 20);
  const flatTop = new THREE.Mesh(flatTopGeom, slopeGroundMat);
  flatTop.rotation.x = -Math.PI / 2;
  flatTop.position.set(slopeEndX + 15, slopeEndY + 0.01, 38);
  scene.add(flatTop);

  // Flat road at top (connected to slope) - width 10 to match Level 4 (z=18 to z=28)
  const flatRoadGeom = new THREE.PlaneGeometry(30, 10);
  const flatRoad = new THREE.Mesh(flatRoadGeom, resPedestrianMat);
  flatRoad.rotation.x = -Math.PI / 2;
  flatRoad.position.set(slopeEndX + 15, slopeEndY + 0.02, 23); // Center at z=23 for z=18~28
  scene.add(flatRoad);

  // === Guardrails along slope and flat top (z=18.5 to match main road guardrail) ===
  const guardZ = 18.5;
  const slopeRailMat = new THREE.MeshBasicMaterial({ color: 0x656575 });
  const slopePostMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  const slopeRise = slopeEndY - slopeStartY;
  const slopeHorizontalLength = slopeEndX - slopeStartX;

  // Sloped guardrail posts (every 3 units along slope)
  const numSlopePosts = 15;
  for (let i = 0; i <= numSlopePosts; i++) {
    const t = i / numSlopePosts;
    const postX = slopeStartX + t * slopeHorizontalLength;
    const postY = slopeStartY + t * slopeRise;

    const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const post = new THREE.Mesh(postGeom, slopePostMat);
    post.position.set(postX, postY + 0.4, guardZ);
    scene.add(post);
  }

  // Sloped guardrail bars (using BufferGeometry)
  const slopeRailVertices1 = new Float32Array([
    slopeStartX, slopeStartY + 0.7, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.7, guardZ - 0.04,
    slopeStartX, slopeStartY + 0.7, guardZ + 0.04,
    slopeEndX, slopeEndY + 0.7, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.7, guardZ + 0.04,
    slopeStartX, slopeStartY + 0.7, guardZ + 0.04,
  ]);
  const slopeRailGeom1 = new THREE.BufferGeometry();
  slopeRailGeom1.setAttribute('position', new THREE.BufferAttribute(slopeRailVertices1, 3));
  const slopeRail1 = new THREE.Mesh(slopeRailGeom1, new THREE.MeshBasicMaterial({ color: 0x656575, side: THREE.DoubleSide }));
  scene.add(slopeRail1);

  const slopeRailVertices2 = new Float32Array([
    slopeStartX, slopeStartY + 0.4, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.4, guardZ - 0.04,
    slopeStartX, slopeStartY + 0.4, guardZ + 0.04,
    slopeEndX, slopeEndY + 0.4, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.4, guardZ + 0.04,
    slopeStartX, slopeStartY + 0.4, guardZ + 0.04,
  ]);
  const slopeRailGeom2 = new THREE.BufferGeometry();
  slopeRailGeom2.setAttribute('position', new THREE.BufferAttribute(slopeRailVertices2, 3));
  const slopeRail2 = new THREE.Mesh(slopeRailGeom2, new THREE.MeshBasicMaterial({ color: 0x656575, side: THREE.DoubleSide }));
  scene.add(slopeRail2);

  // Flat top guardrail
  const flatRailBarGeom = new THREE.BoxGeometry(30, 0.12, 0.08);
  const flatRailBar1 = new THREE.Mesh(flatRailBarGeom, slopeRailMat);
  flatRailBar1.position.set(slopeEndX + 15, slopeEndY + 0.7, guardZ);
  scene.add(flatRailBar1);
  const flatRailBar2 = new THREE.Mesh(flatRailBarGeom, slopeRailMat);
  flatRailBar2.position.set(slopeEndX + 15, slopeEndY + 0.4, guardZ);
  scene.add(flatRailBar2);

  // Flat top guardrail posts
  for (let i = 0; i < 10; i++) {
    const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const post = new THREE.Mesh(postGeom, slopePostMat);
    post.position.set(slopeEndX + 1.5 + i * 3, slopeEndY + 0.4, guardZ);
    scene.add(post);
  }

  // Thick retaining wall below residential road (from y=0 to y=9.9, at z=20)
  const retainingWallGeom = new THREE.BoxGeometry(95, 9.9, 2); // width 95, height 9.9, depth 2
  const retainingWallMat = new THREE.MeshBasicMaterial({ color: 0x2a2a32 }); // Darker than road
  const retainingWall = new THREE.Mesh(retainingWallGeom, retainingWallMat);
  retainingWall.position.set(0, 4.95, 19); // Center at y=4.95 (from y=0 to y=9.9), z=19
  scene.add(retainingWall);

  // Vertical pillar segments on retaining wall for texture
  const pillarMat = new THREE.MeshBasicMaterial({ color: 0x252528 });
  for (let i = 0; i < 16; i++) {
    const pillarGeom = new THREE.BoxGeometry(0.8, 9.9, 0.3);
    const pillar = new THREE.Mesh(pillarGeom, pillarMat);
    pillar.position.set(-42 + i * 6, 4.95, 18);
    scene.add(pillar);
  }

  // Horizontal bands on wall
  const bandMat = new THREE.MeshBasicMaterial({ color: 0x303038 });
  const band1Geom = new THREE.BoxGeometry(95, 0.2, 0.2);
  const band1 = new THREE.Mesh(band1Geom, bandMat);
  band1.position.set(0, 3, 18);
  scene.add(band1);
  const band2 = new THREE.Mesh(band1Geom, bandMat);
  band2.position.set(0, 7, 18);
  scene.add(band2);

  // === Sloped retaining wall extension (from x=47.5 to x=92.5) ===
  // Wall extends along the slope to match guardrail end position
  const slopeWallZ = 19;
  const slopeWallFrontZ = 18;
  const wallBottomY = 0;
  const wallTopStartY = 9.9;  // Matches main wall height at start
  const wallTopEndY = 15.9;   // Follows slope (6 units rise over 45 units)

  // Sloped retaining wall using BufferGeometry (trapezoidal cross-section when viewed from side)
  const slopeWallVertices = new Float32Array([
    // Front face (z=18)
    // Triangle 1: bottom-left, bottom-right, top-left
    slopeStartX, wallBottomY, slopeWallFrontZ,
    slopeEndX, wallBottomY, slopeWallFrontZ,
    slopeStartX, wallTopStartY, slopeWallFrontZ,
    // Triangle 2: bottom-right, top-right, top-left
    slopeEndX, wallBottomY, slopeWallFrontZ,
    slopeEndX, wallTopEndY, slopeWallFrontZ,
    slopeStartX, wallTopStartY, slopeWallFrontZ,
    // Back face (z=20)
    // Triangle 1
    slopeStartX, wallBottomY, slopeWallZ + 1,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    slopeEndX, wallBottomY, slopeWallZ + 1,
    // Triangle 2
    slopeEndX, wallBottomY, slopeWallZ + 1,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    slopeEndX, wallTopEndY, slopeWallZ + 1,
    // Top face (sloped)
    // Triangle 1
    slopeStartX, wallTopStartY, slopeWallFrontZ,
    slopeEndX, wallTopEndY, slopeWallFrontZ,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    // Triangle 2
    slopeEndX, wallTopEndY, slopeWallFrontZ,
    slopeEndX, wallTopEndY, slopeWallZ + 1,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    // Bottom face
    // Triangle 1
    slopeStartX, wallBottomY, slopeWallFrontZ,
    slopeStartX, wallBottomY, slopeWallZ + 1,
    slopeEndX, wallBottomY, slopeWallFrontZ,
    // Triangle 2
    slopeEndX, wallBottomY, slopeWallFrontZ,
    slopeStartX, wallBottomY, slopeWallZ + 1,
    slopeEndX, wallBottomY, slopeWallZ + 1,
  ]);

  const slopeWallGeom = new THREE.BufferGeometry();
  slopeWallGeom.setAttribute('position', new THREE.BufferAttribute(slopeWallVertices, 3));
  slopeWallGeom.computeVertexNormals();
  const slopeWall = new THREE.Mesh(slopeWallGeom, new THREE.MeshBasicMaterial({
    color: 0x2a2a32,
    side: THREE.DoubleSide
  }));
  scene.add(slopeWall);

  // Vertical pillar segments on sloped retaining wall
  const slopePillarMat = new THREE.MeshBasicMaterial({ color: 0x252528 });
  const slopeWallLength = slopeEndX - slopeStartX;
  const numSlopePillars = 8; // 8 pillars along the slope
  for (let i = 0; i < numSlopePillars; i++) {
    const t = (i + 0.5) / numSlopePillars;
    const pillarX = slopeStartX + t * slopeWallLength;
    const pillarTopY = wallTopStartY + t * (wallTopEndY - wallTopStartY);
    const pillarHeight = pillarTopY - wallBottomY;
    const pillarCenterY = pillarHeight / 2;

    const slopePillarGeom = new THREE.BoxGeometry(0.8, pillarHeight, 0.3);
    const slopePillar = new THREE.Mesh(slopePillarGeom, slopePillarMat);
    slopePillar.position.set(pillarX, pillarCenterY, slopeWallFrontZ);
    scene.add(slopePillar);
  }

  // Horizontal bands on sloped wall (using BufferGeometry for angled bands)
  const slopeBandMat = new THREE.MeshBasicMaterial({ color: 0x303038, side: THREE.DoubleSide });

  // Lower band (at y=3 start, following slope proportionally)
  const band1StartY = 3;
  const band1EndY = 3 + (wallTopEndY - wallTopStartY) * (3 / wallTopStartY);
  const slopeBand1Vertices = new Float32Array([
    slopeStartX, band1StartY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band1EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band1StartY + 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band1EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band1EndY + 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band1StartY + 0.1, slopeWallFrontZ - 0.1,
  ]);
  const slopeBand1Geom = new THREE.BufferGeometry();
  slopeBand1Geom.setAttribute('position', new THREE.BufferAttribute(slopeBand1Vertices, 3));
  const slopeBand1 = new THREE.Mesh(slopeBand1Geom, slopeBandMat);
  scene.add(slopeBand1);

  // Upper band (at y=7 start, following slope proportionally)
  const band2StartY = 7;
  const band2EndY = 7 + (wallTopEndY - wallTopStartY) * (7 / wallTopStartY);
  const slopeBand2Vertices = new Float32Array([
    slopeStartX, band2StartY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band2EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band2StartY + 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band2EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band2EndY + 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band2StartY + 0.1, slopeWallFrontZ - 0.1,
  ]);
  const slopeBand2Geom = new THREE.BufferGeometry();
  slopeBand2Geom.setAttribute('position', new THREE.BufferAttribute(slopeBand2Vertices, 3));
  const slopeBand2 = new THREE.Mesh(slopeBand2Geom, slopeBandMat);
  scene.add(slopeBand2);

  // Guardrail on outer side of lamps/poles (toward shopping district, z=18.5)
  // Main rail bar
  const railMat = new THREE.MeshBasicMaterial({ color: 0x656575 });
  const railBarGeom = new THREE.BoxGeometry(95, 0.12, 0.08);
  const railBar1 = new THREE.Mesh(railBarGeom, railMat);
  railBar1.position.set(0, 10.7, 18.5);
  scene.add(railBar1);
  const railBar2 = new THREE.Mesh(railBarGeom, railMat);
  railBar2.position.set(0, 10.4, 18.5);
  scene.add(railBar2);

  // Guardrail posts
  const postMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  for (let i = 0; i < 32; i++) {
    const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const post = new THREE.Mesh(postGeom, postMat);
    post.position.set(-46.5 + i * 3, 10.4, 18.5);
    scene.add(post);
  }

  // Shopping alley (y=2): x=-22~22, z=4~6 (width 44, length 2)
  // This is narrower, more like a pedestrian path
  const alleyGeometry = new THREE.PlaneGeometry(44, 2);
  const alleyMaterial = new THREE.MeshBasicMaterial({ color: 0x2a2a35 });
  const alley = new THREE.Mesh(alleyGeometry, alleyMaterial);
  alley.rotation.x = -Math.PI / 2;
  alley.position.set(0, 2.01, 5);
  scene.add(alley);
}

/**
 * Create crosswalks (simplified for new layout)
 */
export function createCrosswalks(scene) {
  const crosswalks = [];
  // No crosswalks in this linear layout for now
  return crosswalks;
}

/**
 * Create distant silhouette panels around the city
 * North: Triangle panels (mountains)
 * South: Rectangle panels (buildings)
 */
function createDistantSilhouettes(scene) {
  const silhouetteMat = new THREE.MeshBasicMaterial({
    color: 0x080810,
    side: THREE.DoubleSide,
    fog: false
  });

  const radius = 400; // Distance from center
  const numPanels = 60; // Number of panels around circle

  for (let i = 0; i < numPanels; i++) {
    const angle = (i / numPanels) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Determine if north (z > 0) or south (z < 0)
    const isNorth = z > 0;

    // Random height variation
    const baseHeight = 30 + Math.random() * 50;
    const width = 30 + Math.random() * 20;

    let mesh;

    if (isNorth) {
      // Mountain shape - triangle with narrower base
      const shape = new THREE.Shape();
      const height = baseHeight + Math.random() * 40;
      const baseWidth = height * (0.6 + Math.random() * 0.4); // Base proportional to height
      const halfBase = baseWidth / 2;

      shape.moveTo(-halfBase, 0);
      shape.lineTo(halfBase, 0);
      shape.lineTo((Math.random() - 0.5) * baseWidth * 0.15, height);
      shape.closePath();

      const geometry = new THREE.ShapeGeometry(shape);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
    } else {
      // Rectangle (building)
      const height = baseHeight + Math.random() * 30;
      const geometry = new THREE.PlaneGeometry(width, height);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
      mesh.position.y = height / 2;
    }

    // Position and rotate to face center
    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = -angle + Math.PI / 2;

    if (isNorth) {
      mesh.position.y = 0;
    }

    scene.add(mesh);
  }

  // Add additional layer for depth
  const radius2 = 500;
  const numPanels2 = 40;

  for (let i = 0; i < numPanels2; i++) {
    const angle = (i / numPanels2) * Math.PI * 2 + 0.05;
    const x = Math.cos(angle) * radius2;
    const z = Math.sin(angle) * radius2;

    const isNorth = z > 0;
    const baseHeight = 50 + Math.random() * 80;
    const width = 40 + Math.random() * 30;

    let mesh;

    if (isNorth) {
      const shape = new THREE.Shape();
      const height = baseHeight + Math.random() * 60;
      const baseWidth = height * (0.5 + Math.random() * 0.4);
      const halfBase = baseWidth / 2;

      shape.moveTo(-halfBase, 0);
      shape.lineTo(halfBase, 0);
      shape.lineTo((Math.random() - 0.5) * baseWidth * 0.15, height);
      shape.closePath();

      const geometry = new THREE.ShapeGeometry(shape);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
    } else {
      const height = baseHeight + Math.random() * 50;
      const geometry = new THREE.PlaneGeometry(width, height);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
      mesh.position.y = height / 2;
    }

    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = -angle + Math.PI / 2;

    if (isNorth) {
      mesh.position.y = 0;
    }

    scene.add(mesh);
  }
}

/**
 * Resize handler
 */
export function handleResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
