# Hong Kong Citypop Night City - Three.js Implementation Guide

## Overview

Create a 3D night city scene inspired by Hong Kong citypop aesthetics. The city features:
- Elevated residential area with traditional Korean-style houses (walls, gates, courtyards)
- Zigzag stairs connecting upper and lower areas
- Neon-lit shopping alley with street vendors and signs
- Main road with sidewalks, trees, and streetlights
- High-rise buildings on both sides and bottom
- Retaining walls and slopes at both ends (dead-end feeling)
- Fog effect for atmospheric depth

---

## Coordinate System

The 2D plan uses a **1000x720 viewBox**. Convert to 3D:
- X-axis: Width (0-1000 → -50 to 50 in Three.js, scale factor: 0.1)
- Y-axis (2D) → Z-axis (3D): Depth (0-720 → -36 to 36)
- Y-axis (3D): Height (elevation)

**Scale conversion**: `threeJS_coord = (svg_coord - 500) * 0.1` for X, `threeJS_coord = (svg_coord - 360) * -0.1` for Z

---

## Height Levels (Y-axis in Three.js)

```
Level 5: y = 12    // Residential area ground level (highest)
Level 4: y = 10    // Residential road
Level 3: y = 6     // Stairs middle platform
Level 2: y = 2     // Shopping area ground level
Level 1: y = 0     // Main road level (lowest ground)
Level 0: y = -2    // Below ground (foundations)
```

Building heights are ADDED to ground level.

---

## 1. Residential District (주택단지)

### Location
- SVG: x=50-940, y=15-140
- Three.js: x=-45 to 44, z=32 to 22, ground y=12

### Structure: Traditional Korean Houses with Connected Walls

Each house consists of:
1. **Outer Wall (담장)**: Gray concrete/brick wall surrounding property
2. **Building (건물)**: Main house structure inside wall
3. **Courtyard (마당)**: Optional dark ground area (some houses have, some don't)
4. **Gate (대문)**: Brown wooden double door in wall

### Row 1 Houses (15 houses)

```javascript
const row1Houses = [
  // { x, z, width, depth, hasCourtyard, wallColor, buildingColor }
  { x: -45, z: 32, w: 7, d: 6, courtyard: true, wall: '#3d3d3d', building: '#2d2d3d', buildingStroke: '#8080aa' },
  { x: -38, z: 32, w: 5.5, d: 6, courtyard: false, wall: '#3d3d3d', building: '#2d3d2d', buildingStroke: '#80aa80' },
  { x: -32.5, z: 32, w: 8, d: 6, courtyard: true, wall: '#3d3d3d', building: '#3d2d2d', buildingStroke: '#aa8080' },
  { x: -24.5, z: 32, w: 5, d: 6, courtyard: false, wall: '#3d3d3d', building: '#2d2d3d', buildingStroke: '#8080aa' },
  { x: -17, z: 32, w: 6.5, d: 6, courtyard: true, wall: '#3d3d3d', building: '#3d2d3d', buildingStroke: '#aa80aa' },
  { x: -10.5, z: 32, w: 5.5, d: 6, courtyard: false, wall: '#3d3d3d', building: '#2d3d2d', buildingStroke: '#80aa80' },
  { x: -5, z: 32, w: 7, d: 6, courtyard: true, wall: '#3d3d3d', building: '#2d2d3d', buildingStroke: '#8080aa' },
  { x: 2, z: 32, w: 5, d: 6, courtyard: false, wall: '#3d3d3d', building: '#3d2d2d', buildingStroke: '#aa8080' },
  { x: 7, z: 32, w: 7.5, d: 6, courtyard: true, wall: '#3d3d3d', building: '#2d3d3d', buildingStroke: '#80aaaa' },
  { x: 14.5, z: 32, w: 5.5, d: 6, courtyard: false, wall: '#3d3d3d', building: '#3d2d3d', buildingStroke: '#aa80aa' },
  { x: 20, z: 32, w: 6.5, d: 6, courtyard: true, wall: '#3d3d3d', building: '#2d2d3d', buildingStroke: '#8080aa' },
  { x: 26.5, z: 32, w: 5, d: 6, courtyard: false, wall: '#3d3d3d', building: '#2d3d2d', buildingStroke: '#80aa80' },
  { x: 31.5, z: 32, w: 7, d: 6, courtyard: true, wall: '#3d3d3d', building: '#3d2d2d', buildingStroke: '#aa8080' },
  { x: 38.5, z: 32, w: 5.5, d: 6, courtyard: false, wall: '#3d3d3d', building: '#2d2d3d', buildingStroke: '#8080aa' },
  { x: 44, z: 32, w: 5.5, d: 6, courtyard: true, wall: '#3d3d3d', building: '#3d2d3d', buildingStroke: '#aa80aa' },
];
```

### Row 2 Houses (16 houses)
Similar structure, z = 26 (SVG y=80-140)

### House Construction Function

```javascript
function createHouse(params) {
  const group = new THREE.Group();
  const { x, z, w, d, courtyard, wall, building, buildingStroke } = params;
  const groundY = 12; // Residential ground level
  
  // 1. Outer Wall (담장) - hollow box
  const wallHeight = 2;
  const wallThickness = 0.15;
  const wallGeometry = createHollowBox(w, wallHeight, d, wallThickness);
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: wall,
    roughness: 0.9
  });
  const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
  wallMesh.position.set(x, groundY + wallHeight/2, z);
  group.add(wallMesh);
  
  // 2. Building (건물)
  const buildingWidth = courtyard ? w * 0.5 : w * 0.85;
  const buildingDepth = courtyard ? d * 0.5 : d * 0.75;
  const buildingHeight = 2.5 + Math.random() * 1;
  const buildingGeo = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  const buildingMat = new THREE.MeshStandardMaterial({
    color: building,
    emissive: buildingStroke,
    emissiveIntensity: 0.1
  });
  const buildingMesh = new THREE.Mesh(buildingGeo, buildingMat);
  // Position building at back of lot if courtyard exists
  const buildingZ = courtyard ? z - d * 0.2 : z;
  buildingMesh.position.set(x, groundY + buildingHeight/2, buildingZ);
  group.add(buildingMesh);
  
  // 3. Courtyard (마당) - if exists
  if (courtyard) {
    const courtyardGeo = new THREE.PlaneGeometry(w * 0.8, d * 0.35);
    const courtyardMat = new THREE.MeshStandardMaterial({ 
      color: '#252525',
      roughness: 1
    });
    const courtyardMesh = new THREE.Mesh(courtyardGeo, courtyardMat);
    courtyardMesh.rotation.x = -Math.PI / 2;
    courtyardMesh.position.set(x, groundY + 0.01, z + d * 0.25);
    group.add(courtyardMesh);
  }
  
  // 4. Gate (대문)
  const gateWidth = 1.2;
  const gateHeight = 1.8;
  const gateGeo = new THREE.BoxGeometry(gateWidth, gateHeight, 0.15);
  const gateMat = new THREE.MeshStandardMaterial({ color: '#5a4030' });
  const gateMesh = new THREE.Mesh(gateGeo, gateMat);
  gateMesh.position.set(x, groundY + gateHeight/2, z + d/2);
  group.add(gateMesh);
  
  // Gate details (door panels, handles)
  // ... add door panel geometry and brass handles
  
  return group;
}
```

---

## 2. Residential Road (주택가 도로)

### Location
- SVG: x=25-975, y=145-180
- Three.js: x=-47.5 to 47.5, z=21.5 to 18, ground y=10

### Components

#### Road Surface
```javascript
const roadGeo = new THREE.PlaneGeometry(95, 3.5);
const roadMat = new THREE.MeshStandardMaterial({ 
  color: '#3a3a4a',
  roughness: 0.8
});
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 10, 19.75);
```

#### Red Boundary Line
```javascript
const boundaryGeo = new THREE.PlaneGeometry(95, 0.3);
const boundaryMat = new THREE.MeshStandardMaterial({ color: '#aa3333' });
const boundary = new THREE.Mesh(boundaryGeo, boundaryMat);
boundary.rotation.x = -Math.PI / 2;
boundary.position.set(0, 10.01, 18);
```

#### Utility Poles (전봇대) - 8 poles
```javascript
const polePositions = [-41, -29, -17, -5, 7, 19, 31, 43];

function createUtilityPole(x, z) {
  const group = new THREE.Group();
  
  // Main pole
  const poleGeo = new THREE.CylinderGeometry(0.15, 0.18, 8, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: '#4a4a4a' });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, 10 + 4, z);
  group.add(pole);
  
  // Cross arms
  const armGeo = new THREE.BoxGeometry(2, 0.1, 0.1);
  const arm1 = new THREE.Mesh(armGeo, poleMat);
  arm1.position.set(x, 10 + 7, z);
  group.add(arm1);
  
  const arm2 = new THREE.Mesh(armGeo, poleMat);
  arm2.position.set(x, 10 + 6, z);
  arm2.scale.x = 0.7;
  group.add(arm2);
  
  // Insulators (small spheres)
  const insulatorGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const insulatorMat = new THREE.MeshStandardMaterial({ color: '#666666' });
  // Add at arm ends...
  
  return group;
}
```

#### Power Lines (전선)
```javascript
function createPowerLine(startX, endX, z, y, sag = 0.3) {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(startX, y, z),
    new THREE.Vector3((startX + endX) / 2, y - sag, z),
    new THREE.Vector3(endX, y, z)
  );
  const points = curve.getPoints(20);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: '#333333' });
  return new THREE.Line(geometry, material);
}

// Create lines between poles
for (let i = 0; i < polePositions.length - 1; i++) {
  scene.add(createPowerLine(polePositions[i], polePositions[i+1], 19.5, 17, 0.3));
  scene.add(createPowerLine(polePositions[i], polePositions[i+1], 19.5, 16.5, 0.4));
}
```

#### Street Lamps (가로등) - 7 lamps
```javascript
const lampPositions = [-35, -23, -11, 1, 13, 25, 37];

function createStreetLamp(x, z, groundY) {
  const group = new THREE.Group();
  
  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 4, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: '#4a4a4a' });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, groundY + 2, z);
  group.add(pole);
  
  // Lamp housing
  const housingGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.3, 8);
  const housingMat = new THREE.MeshStandardMaterial({ color: '#3a3a3a' });
  const housing = new THREE.Mesh(housingGeo, housingMat);
  housing.position.set(x, groundY + 4.2, z);
  group.add(housing);
  
  // Light bulb (emissive)
  const bulbGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: '#ffeeaa',
    emissive: '#ffdd88',
    emissiveIntensity: 2
  });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(x, groundY + 4, z);
  group.add(bulb);
  
  // Point light
  const light = new THREE.PointLight('#ffdd88', 1, 8);
  light.position.set(x, groundY + 4, z);
  group.add(light);
  
  return group;
}
```

---

## 3. Zigzag Stairs (계단)

### Location
- SVG: x=320-680, y=180-250
- Three.js: x=-18 to 18, z=18 to 11, connecting y=10 to y=2

### Structure
```
Level 4 (y=10): Residential road
    ↓ Stair 1 (going right →)
Level 3.5 (y=8): Landing platform
    ↓ Stair 2 (going left ←)
Level 2 (y=2): Shopping area
```

```javascript
function createZigzagStairs() {
  const group = new THREE.Group();
  
  // Side walls
  const wallGeo = new THREE.BoxGeometry(1.2, 8, 7);
  const wallMat = new THREE.MeshStandardMaterial({ color: '#2a2a2a' });
  
  const leftWall = new THREE.Mesh(wallGeo, wallMat);
  leftWall.position.set(-18, 6, 14.5);
  group.add(leftWall);
  
  const rightWall = new THREE.Mesh(wallGeo, wallMat);
  rightWall.position.set(18, 6, 14.5);
  group.add(rightWall);
  
  // Stair 1: Right direction (y=10 to y=8)
  const stair1Steps = 10;
  const stepWidth = 20;
  const stepDepth = 0.4;
  const stepHeight = 0.2;
  const stepRise = 0.2;
  
  for (let i = 0; i < stair1Steps; i++) {
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const stepMat = new THREE.MeshStandardMaterial({ color: '#202028' });
    const step = new THREE.Mesh(stepGeo, stepMat);
    step.position.set(-8 + i * 2, 10 - i * stepRise, 17.5);
    group.add(step);
  }
  
  // Landing platform
  const platformGeo = new THREE.BoxGeometry(4.5, 0.3, 3.5);
  const platformMat = new THREE.MeshStandardMaterial({ color: '#252530' });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.set(13, 8, 16);
  group.add(platform);
  
  // Stair 2: Left direction (y=8 to y=2)
  const stair2Steps = 15;
  for (let i = 0; i < stair2Steps; i++) {
    const stepGeo = new THREE.BoxGeometry(21, stepHeight, stepDepth);
    const stepMat = new THREE.MeshStandardMaterial({ color: '#202028' });
    const step = new THREE.Mesh(stepGeo, stepMat);
    step.position.set(5 - i * 0.5, 8 - i * 0.4, 13);
    group.add(step);
  }
  
  // Handrails
  const railGeo = new THREE.CylinderGeometry(0.05, 0.05, 25, 8);
  const railMat = new THREE.MeshStandardMaterial({ color: '#555555' });
  // Position along stairs...
  
  return group;
}
```

---

## 4. Shopping District (상점가)

### Location
- SVG: x=280-720, y=250-395
- Three.js: x=-22 to 22, z=11 to -3.5, ground y=2

### Structure
- Upper shops (8 buildings)
- Main alley (horizontal) with vendors
- Lower shops (8 buildings)

### Shop Buildings

```javascript
const neonColors = [
  { base: '#4e1b3d', neon: '#ff0080' },  // Pink
  { base: '#1b4e4e', neon: '#00ffff' },  // Cyan
  { base: '#4e3d1b', neon: '#ffff00' },  // Yellow
  { base: '#2d1b4e', neon: '#ff00ff' },  // Magenta
  { base: '#1b2d4e', neon: '#0080ff' },  // Blue
  { base: '#1b4e3d', neon: '#00ff80' },  // Green
  { base: '#4e1b2d', neon: '#ff4040' },  // Red
];

const upperShops = [
  { x: -21.5, z: 9.5, w: 5, d: 4.2, colorIndex: 0 },
  { x: -16, z: 9.5, w: 4.5, d: 4.2, colorIndex: 1 },
  { x: -11, z: 9.5, w: 5.5, d: 4.2, colorIndex: 2 },
  { x: -5, z: 9.5, w: 4.5, d: 4.2, colorIndex: 3 },
  { x: 0, z: 9.5, w: 5, d: 4.2, colorIndex: 4 },
  { x: 5.5, z: 9.5, w: 4.5, d: 4.2, colorIndex: 5 },
  { x: 10.5, z: 9.5, w: 5, d: 4.2, colorIndex: 6 },
  { x: 16, z: 9.5, w: 5.5, d: 4.2, colorIndex: 0 },
];

function createShopBuilding(params) {
  const group = new THREE.Group();
  const { x, z, w, d, colorIndex } = params;
  const colors = neonColors[colorIndex];
  const groundY = 2;
  const height = 3 + Math.random() * 2;
  
  // Main building
  const buildingGeo = new THREE.BoxGeometry(w, height, d);
  const buildingMat = new THREE.MeshStandardMaterial({
    color: colors.base,
    roughness: 0.7
  });
  const building = new THREE.Mesh(buildingGeo, buildingMat);
  building.position.set(x, groundY + height/2, z);
  group.add(building);
  
  // Neon edge lights (using line segments or thin boxes with emissive)
  const edgeMat = new THREE.MeshStandardMaterial({
    color: colors.neon,
    emissive: colors.neon,
    emissiveIntensity: 1.5
  });
  
  // Top edge
  const topEdgeGeo = new THREE.BoxGeometry(w + 0.1, 0.1, 0.1);
  const topEdge = new THREE.Mesh(topEdgeGeo, edgeMat);
  topEdge.position.set(x, groundY + height, z + d/2);
  group.add(topEdge);
  
  // Side edges
  const sideEdgeGeo = new THREE.BoxGeometry(0.1, height, 0.1);
  const leftEdge = new THREE.Mesh(sideEdgeGeo, edgeMat);
  leftEdge.position.set(x - w/2, groundY + height/2, z + d/2);
  group.add(leftEdge);
  
  const rightEdge = new THREE.Mesh(sideEdgeGeo, edgeMat);
  rightEdge.position.set(x + w/2, groundY + height/2, z + d/2);
  group.add(rightEdge);
  
  // Neon point light
  const neonLight = new THREE.PointLight(colors.neon, 0.5, 5);
  neonLight.position.set(x, groundY + height/2, z + d/2 + 1);
  group.add(neonLight);
  
  return group;
}
```

### Vertical Signs (입간판)

```javascript
function createVerticalSign(x, z, groundY) {
  const group = new THREE.Group();
  
  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: '#4a4a4a' });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, groundY + 2.5, z);
  group.add(pole);
  
  // Sign board
  const signGeo = new THREE.BoxGeometry(0.8, 2, 0.15);
  const signMat = new THREE.MeshStandardMaterial({
    color: '#1a1a3a',
    emissive: '#ff0080',
    emissiveIntensity: 0.3
  });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(x, groundY + 4, z);
  group.add(sign);
  
  // Glowing sections on sign
  const glowColors = ['#ff0080', '#00ffff', '#ffff00'];
  glowColors.forEach((color, i) => {
    const glowGeo = new THREE.BoxGeometry(0.6, 0.4, 0.05);
    const glowMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(x, groundY + 4.5 - i * 0.6, z + 0.1);
    group.add(glow);
  });
  
  return group;
}

// Sign positions (in front of each shop)
const signPositions = [
  { x: -20, z: 7.3 }, { x: -14.5, z: 7.3 }, { x: -9, z: 7.3 }, { x: -3.5, z: 7.3 },
  { x: 2, z: 7.3 }, { x: 7.2, z: 7.3 }, { x: 12.5, z: 7.3 }, { x: 18, z: 7.3 },
];
```

### Main Alley (상점가 메인골목)

```javascript
// Alley floor
const alleyGeo = new THREE.PlaneGeometry(43, 3.8);
const alleyMat = new THREE.MeshStandardMaterial({ 
  color: '#0a0a12',
  roughness: 0.9
});
const alley = new THREE.Mesh(alleyGeo, alleyMat);
alley.rotation.x = -Math.PI / 2;
alley.position.set(0, 2.01, 4.35);
scene.add(alley);
```

### Street Vendors (좌판)

```javascript
function createVendorStall(x, z, groundY) {
  const group = new THREE.Group();
  
  // Table
  const tableGeo = new THREE.BoxGeometry(1.8, 0.8, 1);
  const tableMat = new THREE.MeshStandardMaterial({ color: '#4a3a2a' });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.set(x, groundY + 0.4, z);
  group.add(table);
  
  // Canopy poles
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: '#5a4a3a' });
  
  const pole1 = new THREE.Mesh(poleGeo, poleMat);
  pole1.position.set(x - 0.7, groundY + 1.4, z - 0.4);
  group.add(pole1);
  
  const pole2 = new THREE.Mesh(poleGeo, poleMat);
  pole2.position.set(x + 0.7, groundY + 1.4, z - 0.4);
  group.add(pole2);
  
  // Canopy
  const canopyGeo = new THREE.BoxGeometry(2, 0.1, 1.2);
  const canopyMat = new THREE.MeshStandardMaterial({ color: '#6a5a4a' });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(x, groundY + 2, z - 0.3);
  group.add(canopy);
  
  // Random goods on table
  const goodsColors = ['#ff6666', '#66ff66', '#6666ff', '#ffff66'];
  for (let i = 0; i < 5; i++) {
    const goodGeo = new THREE.BoxGeometry(0.2 + Math.random() * 0.2, 0.15, 0.2);
    const goodMat = new THREE.MeshStandardMaterial({ 
      color: goodsColors[Math.floor(Math.random() * goodsColors.length)] 
    });
    const good = new THREE.Mesh(goodGeo, goodMat);
    good.position.set(x - 0.6 + i * 0.3, groundY + 0.9, z);
    group.add(good);
  }
  
  return group;
}

// Vendor positions (2 rows in alley)
const vendorRow1 = []; // z = 5.5
const vendorRow2 = []; // z = 3.3
for (let i = 0; i < 11; i++) {
  vendorRow1.push({ x: -20.5 + i * 4, z: 5.5 });
  vendorRow2.push({ x: -20.5 + i * 4, z: 3.3 });
}
```

---

## 5. Main Road (메인 도로)

### Location
- SVG: x=25-975, y=400-456
- Three.js: x=-47.5 to 47.5, z=-4 to -9.6, ground y=0

### Components

#### Upper Sidewalk
```javascript
const upperSidewalkGeo = new THREE.PlaneGeometry(95, 1.2);
const sidewalkMat = new THREE.MeshStandardMaterial({ color: '#4a4a5a' });
const upperSidewalk = new THREE.Mesh(upperSidewalkGeo, sidewalkMat);
upperSidewalk.rotation.x = -Math.PI / 2;
upperSidewalk.position.set(0, 0.01, -4);
```

#### Road Surface
```javascript
const mainRoadGeo = new THREE.PlaneGeometry(95, 3.2);
const mainRoadMat = new THREE.MeshStandardMaterial({ 
  color: '#3a3a4a',
  roughness: 0.7
});
const mainRoad = new THREE.Mesh(mainRoadGeo, mainRoadMat);
mainRoad.rotation.x = -Math.PI / 2;
mainRoad.position.set(0, 0, -5.8);
```

#### Center Line (Yellow Dashed)
```javascript
function createCenterLine() {
  const group = new THREE.Group();
  const dashLength = 1.5;
  const gapLength = 1;
  const totalLength = 95;
  
  for (let x = -47; x < 47; x += dashLength + gapLength) {
    const dashGeo = new THREE.PlaneGeometry(dashLength, 0.2);
    const dashMat = new THREE.MeshStandardMaterial({ 
      color: '#ffff00',
      emissive: '#ffff00',
      emissiveIntensity: 0.3
    });
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x + dashLength/2, 0.02, -5.8);
    group.add(dash);
  }
  return group;
}
```

#### Lower Sidewalk
```javascript
const lowerSidewalkGeo = new THREE.PlaneGeometry(95, 1.2);
const lowerSidewalk = new THREE.Mesh(lowerSidewalkGeo, sidewalkMat);
lowerSidewalk.rotation.x = -Math.PI / 2;
lowerSidewalk.position.set(0, 0.01, -8.4);
```

#### Street Trees (가로수)

```javascript
function createTree(x, z, groundY) {
  const group = new THREE.Group();
  
  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a3020' });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(x, groundY + 0.75, z);
  group.add(trunk);
  
  // Foliage (multiple spheres for natural look)
  const foliageMat = new THREE.MeshStandardMaterial({ color: '#1a4a1a' });
  
  const foliage1 = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), foliageMat);
  foliage1.position.set(x, groundY + 2.2, z);
  foliage1.scale.set(1, 1.2, 1);
  group.add(foliage1);
  
  const foliage2Mat = new THREE.MeshStandardMaterial({ color: '#2a5a2a' });
  const foliage2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), foliage2Mat);
  foliage2.position.set(x - 0.4, groundY + 2, z);
  group.add(foliage2);
  
  const foliage3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), foliage2Mat);
  foliage3.position.set(x + 0.4, groundY + 2.1, z);
  group.add(foliage3);
  
  return group;
}

// Upper sidewalk trees (9 trees)
const upperTreePositions = [-41.5, -31.5, -21.5, -11.5, -1.5, 8.5, 18.5, 28.5, 38.5];

// Lower sidewalk trees (9 trees, offset)
const lowerTreePositions = [-36.5, -26.5, -16.5, -6.5, 3.5, 13.5, 23.5, 33.5, 43.5];
```

#### Street Lamps (10 lamps along road)
```javascript
const mainRoadLampPositions = [-44, -34, -24, -14, -4, 6, 16, 26, 36, 46];
// Use createStreetLamp function with groundY = 0
```

---

## 6. High-Rise Buildings (고층빌딩)

### Locations
- **Left cluster**: SVG x=50-295, spanning full height below road
- **Right cluster**: SVG x=710-940, spanning full height below road  
- **Bottom center cluster**: SVG x=310-700, y=466-705

### Building Data

```javascript
const leftBuildings = [
  // Lower section (y=185-395 in SVG, y=2-6 in 3D, ground y=2)
  { x: -45, z: 18, w: 6, d: 4.5, h: 8, color: '#2d2d4e', neon: '#6060aa' },
  { x: -38, z: 18, w: 7, d: 4.5, h: 9, color: '#1b3d4e', neon: '#4080aa' },
  { x: -30, z: 18, w: 5.5, d: 4.5, h: 7, color: '#3d2d4e', neon: '#8060aa' },
  { x: -45, z: 12, w: 8, d: 6, h: 12, color: '#1b1b4e', neon: '#0080ff' },
  { x: -36, z: 12, w: 6.5, d: 6, h: 11, color: '#2d1b4e', neon: '#ff00ff' },
  { x: -28.5, z: 12, w: 5.5, d: 6, h: 10, color: '#1b4e4e', neon: '#00ffff' },
  // ... more buildings
  
  // Main tower (large building with windows)
  { x: -43, z: -7, w: 9.5, d: 10.5, h: 25, color: '#1b1b4e', neon: '#0080ff', isMainTower: true },
];

const rightBuildings = [
  // Similar structure, mirrored positions
  { x: 42, z: -7, w: 9.5, d: 10.5, h: 25, color: '#4e1b4e', neon: '#ff00ff', isMainTower: true },
];

const centerBuildings = [
  // Bottom center cluster
  { x: -11, z: -15, w: 10, d: 11.5, h: 22, color: '#1b1b4e', neon: '#0080ff', isMainTower: true },
  { x: 0, z: -14, w: 8.5, d: 10.5, h: 20, color: '#4e1b4e', neon: '#ff00ff', isMainTower: true },
  // ... more buildings
];
```

### Main Tower with Windows

```javascript
function createMainTower(params) {
  const group = new THREE.Group();
  const { x, z, w, d, h, color, neon } = params;
  const groundY = 0;
  
  // Main building body
  const buildingGeo = new THREE.BoxGeometry(w, h, d);
  const buildingMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.6
  });
  const building = new THREE.Mesh(buildingGeo, buildingMat);
  building.position.set(x, groundY + h/2, z);
  group.add(building);
  
  // Neon outline
  const edgeMat = new THREE.MeshStandardMaterial({
    color: neon,
    emissive: neon,
    emissiveIntensity: 1.2
  });
  
  // Top edge
  const topEdge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.2, d + 0.2), edgeMat);
  topEdge.position.set(x, groundY + h, z);
  group.add(topEdge);
  
  // Vertical edges
  const cornerGeo = new THREE.BoxGeometry(0.15, h, 0.15);
  const corners = [
    [x - w/2, groundY + h/2, z - d/2],
    [x + w/2, groundY + h/2, z - d/2],
    [x - w/2, groundY + h/2, z + d/2],
    [x + w/2, groundY + h/2, z + d/2],
  ];
  corners.forEach(pos => {
    const corner = new THREE.Mesh(cornerGeo, edgeMat);
    corner.position.set(...pos);
    group.add(corner);
  });
  
  // Windows (grid pattern)
  const windowRows = Math.floor(h / 3);
  const windowCols = Math.floor(w / 2.5);
  const windowGeo = new THREE.BoxGeometry(1.5, 1.5, 0.1);
  const windowMat = new THREE.MeshStandardMaterial({
    color: '#0a0a20',
    emissive: neon,
    emissiveIntensity: 0.2
  });
  
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      const wx = x - w/2 + 1.5 + col * 2.2;
      const wy = groundY + 2 + row * 2.5;
      const wz = z + d/2 + 0.05;
      
      const window = new THREE.Mesh(windowGeo, windowMat);
      window.position.set(wx, wy, wz);
      group.add(window);
    }
  }
  
  // Building point light
  const buildingLight = new THREE.PointLight(neon, 0.8, 15);
  buildingLight.position.set(x, groundY + h * 0.7, z + d/2 + 2);
  group.add(buildingLight);
  
  return group;
}
```

---

## 7. Dead-End Elements (막다른 골목)

### Left End

```javascript
// Slope (gradient fade to darkness)
const leftSlopeGeo = new THREE.PlaneGeometry(6, 72);
const leftSlopeMat = new THREE.ShaderMaterial({
  uniforms: {
    color1: { value: new THREE.Color('#1a1a22') },
    color2: { value: new THREE.Color('#0a0a15') }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(mix(color1, color2, vUv.x), 1.0);
    }
  `
});
const leftSlope = new THREE.Mesh(leftSlopeGeo, leftSlopeMat);
leftSlope.rotation.x = -Math.PI / 2;
leftSlope.position.set(-50, 5, 0);
scene.add(leftSlope);

// Retaining wall (옹벽)
const retainingWallGeo = new THREE.BoxGeometry(2.5, 20, 31);
const retainingWallMat = new THREE.MeshStandardMaterial({ 
  color: '#2a2a2a',
  roughness: 0.95
});
const leftRetainingWall = new THREE.Mesh(retainingWallGeo, retainingWallMat);
leftRetainingWall.position.set(-48.5, 10, 4.5);
scene.add(leftRetainingWall);

// Wall texture lines
for (let i = 0; i < 5; i++) {
  const lineGeo = new THREE.BoxGeometry(0.05, 20, 0.05);
  const lineMat = new THREE.MeshStandardMaterial({ color: '#333333' });
  const line = new THREE.Mesh(lineGeo, lineMat);
  line.position.set(-47.3 + i * 0.5, 10, 20);
  scene.add(line);
}

// End buildings (blocking view)
const endBuildingData = [
  { x: -48, z: -4, w: 4, d: 5.6, h: 8, color: '#2d2d4e', neon: '#5050aa' },
  { x: -47.5, z: -10, w: 5, d: 10, h: 15, color: '#1b1b4e', neon: '#0080ff' },
  { x: -47.75, z: -20, w: 4.5, d: 8, h: 12, color: '#4e1b3d', neon: '#ff0080' },
  { x: -47.25, z: -28, w: 5.5, d: 5.5, h: 7, color: '#2d3d3d', neon: '#50aaaa' },
];
```

### Right End
Mirror of left end at x = +48 to +50

---

## 8. Fog Effect

```javascript
// Add fog to scene
scene.fog = new THREE.Fog('#0a0a15', 30, 80);

// Or exponential fog for more gradual falloff
scene.fog = new THREE.FogExp2('#0a0a15', 0.015);
```

---

## 9. Lighting Setup

```javascript
// Ambient light (very dim for night scene)
const ambientLight = new THREE.AmbientLight('#1a1a2e', 0.3);
scene.add(ambientLight);

// Directional light (moonlight, subtle)
const moonLight = new THREE.DirectionalLight('#4444aa', 0.2);
moonLight.position.set(10, 30, 10);
scene.add(moonLight);

// Hemisphere light (sky/ground)
const hemiLight = new THREE.HemisphereLight('#1a1a3a', '#0a0a15', 0.4);
scene.add(hemiLight);

// Note: Individual point lights are added by street lamps, neon signs, and buildings
```

---

## 10. Post-Processing (Bloom for Neon Glow)

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.8,    // strength
  0.4,    // radius
  0.85    // threshold
);
composer.addPass(bloomPass);

// In animation loop, use composer.render() instead of renderer.render()
```

---

## 11. Wet Road Reflections (Optional)

```javascript
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

// Replace road plane with reflector
const wetRoadGeo = new THREE.PlaneGeometry(95, 3.2);
const wetRoad = new Reflector(wetRoadGeo, {
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: '#3a3a4a'
});
wetRoad.rotation.x = -Math.PI / 2;
wetRoad.position.set(0, 0, -5.8);
scene.add(wetRoad);
```

---

## 12. Camera Setup

```javascript
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);

// Initial position: overlooking the scene
camera.position.set(0, 25, 40);
camera.lookAt(0, 5, 0);

// Or for walking perspective
camera.position.set(0, 3, 20);
camera.lookAt(0, 3, 0);
```

---

## 13. Animation Loop

```javascript
function animate() {
  requestAnimationFrame(animate);
  
  // Animate neon lights (flickering)
  neonLights.forEach(light => {
    light.intensity = 0.8 + Math.sin(Date.now() * 0.005 + light.userData.offset) * 0.2;
  });
  
  // Animate signs (subtle movement)
  signs.forEach(sign => {
    sign.rotation.y = Math.sin(Date.now() * 0.001) * 0.02;
  });
  
  composer.render();
}
animate();
```

---

## Summary Checklist

- [ ] Residential houses with walls, gates, courtyards
- [ ] Utility poles with power lines
- [ ] Street lamps on both roads
- [ ] Zigzag stairs connecting levels
- [ ] Neon-lit shop buildings
- [ ] Vertical signs with glow
- [ ] Vendor stalls in alley
- [ ] Main road with sidewalks, trees, center line
- [ ] High-rise buildings with windows
- [ ] Retaining walls and slopes at ends
- [ ] Fog effect
- [ ] Bloom post-processing
- [ ] Proper lighting setup
- [ ] Optional: wet road reflections

---

## Color Palette Reference

```javascript
const palette = {
  // Background/Ground
  background: '#0a0a15',
  road: '#3a3a4a',
  sidewalk: '#4a4a5a',
  alley: '#0a0a12',
  stairs: '#202028',
  
  // Residential
  wall: '#3d3d3d',
  courtyard: '#252525',
  gate: '#5a4030',
  
  // Neon colors
  pink: '#ff0080',
  cyan: '#00ffff',
  yellow: '#ffff00',
  magenta: '#ff00ff',
  blue: '#0080ff',
  green: '#00ff80',
  red: '#ff4040',
  
  // Building bases
  darkBlue: '#1b1b4e',
  darkPurple: '#2d1b4e',
  darkTeal: '#1b4e4e',
  darkPink: '#4e1b3d',
  
  // Utilities
  pole: '#4a4a4a',
  wire: '#333333',
  lampLight: '#ffdd88',
  
  // Retaining wall
  retainingWall: '#2a2a2a',
};
```
