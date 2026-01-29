/**
 * city-vehicles.js
 * Hong Kong Citypop Night City - Vehicle System
 *
 * Right-hand traffic (우측 통행)
 * - Main road: z=-20 (z=-15 to z=-25), x=-40 to x=300
 * - South road: x=-55 (x=-60 to x=-50), z=-35 to z=-250
 * - Curve: center (-40, -35), radius 15
 */

import * as THREE from 'three';

// Callback for pedestrian stop check (set by city-main.js to avoid circular dependency)
let pedestrianStopChecker = null;

// Vehicle advertisement texts (solutions + skills)
const vehicleTexts = [
  // Solutions
  'Platform', 'Reservation', 'Font Cloud', 'Marketing System',
  'Media Art', 'IOT', 'Shopping Mall', 'Community',
  'CRM', 'LMS', 'ERP', 'Web Agency',
  'EMS', 'CMS', 'Kiosk', 'Cloud Service',
  'AI Lab', 'Mobile App', 'Windows App', 'MacOS App',
  '3D Web', 'Web MIDI',
  // Skills
  'Javascript', 'Typescript', 'PHP', 'Go', 'Python', 'JAVA',
  'React', 'Vue', 'Svelte', 'Hono', 'Nest.js', 'React Native',
  'Electron', 'PostgreSQL', 'MySQL', 'MariaDB', 'Cloudflare', 'AWS'
];

let vehicleTextIndex = 0;

/**
 * Get next vehicle text
 */
function getNextVehicleText() {
  const text = vehicleTexts[vehicleTextIndex];
  vehicleTextIndex = (vehicleTextIndex + 1) % vehicleTexts.length;
  return text;
}

/**
 * Create vehicle text texture (white bold text with black stroke)
 */
function createVehicleTextTexture(text, width, height) {
  const canvas = document.createElement('canvas');
  const scale = 4;
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = canvas.height * 0.7;
  ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

  // Measure and adjust
  let textWidth = ctx.measureText(text).width;
  const maxWidth = canvas.width * 0.95;

  if (textWidth > maxWidth) {
    fontSize = fontSize * (maxWidth / textWidth);
    ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  }

  // Black stroke
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = fontSize * 0.15;
  ctx.lineJoin = 'round';
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

  // White fill
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Set the pedestrian stop checker callback
 * Called from city-main.js after both modules are loaded
 */
export function setPedestrianStopChecker(fn) {
  pedestrianStopChecker = fn;
}

// Realistic car colors
const carColors = [
  0xffffff,  // White
  0x1a1a1a,  // Black
  0xc0c0c0,  // Silver
  0x505050,  // Dark gray
  0x303030,  // Charcoal
  0x8b0000,  // Dark red
  0x1e3a5f,  // Navy blue
  0x2c4a1c,  // Dark green
  0xf5f5dc,  // Beige
  0x4a3728,  // Brown
  0x6b8e23,  // Olive
  0x87ceeb   // Light blue
];

// Bus colors
const busColors = [
  0x2e8b57,  // Sea green (city bus)
  0x1e3a5f,  // Navy (express bus)
  0xff8c00,  // Orange (school bus style)
  0x8b0000   // Dark red (tour bus)
];

// Truck colors
const truckColors = [
  0xffffff,  // White
  0x1e3a5f,  // Navy
  0x505050,  // Gray
  0x8b0000   // Dark red
];

// Delivery van colors (company colors)
const vanColors = [
  0xffffff,  // White
  0xffcc00,  // Yellow (postal)
  0x4169e1,  // Royal blue
  0x228b22   // Forest green
];

// Road configuration
const roadConfig = {
  mainRoad: {
    z: -20,
    width: 10,
    xMin: -40,
    xMax: 300
  },
  southRoad: {
    x: -55,
    width: 10,
    zMin: -250,
    zMax: -35
  },
  curve: {
    centerX: -40,
    centerZ: -35,
    radius: 15
  }
};

// Lane configuration (right-hand traffic / 우측통행)
// Main road at z=-20: south side (z=-17) for eastbound, north side (z=-23) for westbound
const lanes = {
  // Main road lanes (curve exit to tunnel)
  mainEast: { z: -17, xMin: -40, xMax: 280, direction: 1 },   // Going east (+x), south lane (right side)
  mainWest: { z: -23, xMin: -40, xMax: 280, direction: -1 },  // Going west (-x), north lane (right side)
  // South road lanes
  southDown: { x: -52, zMin: -240, zMax: -35, direction: -1 }, // Going south (-z), east lane (right side)
  southUp: { x: -58, zMin: -240, zMax: -35, direction: 1 }     // Going north (+z), west lane (right side)
};

// Curve configurations - positions must match lane positions exactly to avoid teleportation
// Road curve center: (-40, -35)

// mainWest → southDown: LEFT turn (counterclockwise)
// mainWest at z=-23 enters curve at x=-40
const curveWestToSouth = {
  centerX: -40,
  centerZ: -35,
  radius: 12,                // z=-23 = centerZ + radius = -35 + 12 ✓
  startAngle: Math.PI / 2,   // Entry: cos(π/2)=0, sin(π/2)=1 → (-40, -23)
  endAngle: Math.PI,         // Exit: cos(π)=-1, sin(π)=0 → (-52, -35)
  triggerX: -40              // Trigger exactly at curve entry x
};

// southUp → mainEast: RIGHT turn (clockwise)
// southUp at x=-58 enters curve at z=-35
const curveSouthToEast = {
  centerX: -40,
  centerZ: -35,
  radius: 18,                // x=-58 = centerX - radius = -40 - 18 ✓
  startAngle: Math.PI,       // Entry: cos(π)=-1, sin(π)=0 → (-58, -35)
  endAngle: Math.PI / 2,     // Exit: cos(π/2)=0, sin(π/2)=1 → (-40, -17)
  triggerZ: -35              // Trigger exactly at curve entry z
};

// Active vehicles
let vehicles = [];
let lastSpawnTime = 0;
const spawnInterval = 2.5; // Spawn new car every 2.5 seconds
const maxVehicles = 40;
const vehicleSpeed = 9; // Fixed speed for all vehicles (reduced for realism)

/**
 * Create sedan car
 */
function createSedanCar(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  // Body lower
  const bodyGeom = new THREE.BoxGeometry(2.2, 0.8, 4.5);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 0.5;
  group.add(body);

  // Cabin
  const cabinGeom = new THREE.BoxGeometry(1.8, 0.7, 2.2);
  const cabinMat = new THREE.MeshBasicMaterial({ color: 0x303050 });
  const cabin = new THREE.Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 1.2, -0.3);
  group.add(cabin);

  // Windows
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x60d0e0, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const frontWindowGeom = new THREE.PlaneGeometry(1.6, 0.6);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 1.2, 0.8);
  frontWindow.rotation.x = -0.3;
  group.add(frontWindow);

  // Side windows
  const sideWindowGeom = new THREE.PlaneGeometry(1.8, 0.5);
  const sideWindowL = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowL.position.set(-0.91, 1.2, -0.3);
  sideWindowL.rotation.y = Math.PI / 2;
  group.add(sideWindowL);
  const sideWindowR = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowR.position.set(0.91, 1.2, -0.3);
  sideWindowR.rotation.y = -Math.PI / 2;
  group.add(sideWindowR);

  // Rear window
  const rearWindowGeom = new THREE.PlaneGeometry(1.6, 0.5);
  const rearWindow = new THREE.Mesh(rearWindowGeom, windowMat);
  rearWindow.position.set(0, 1.2, -1.4);
  rearWindow.rotation.x = 0.3;
  rearWindow.rotation.y = Math.PI;
  group.add(rearWindow);

  // Headlights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.4, 0.3, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-0.7, 0.5, 2.26);
  group.add(headlightL);
  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(0.7, 0.5, 2.26);
  group.add(headlightR);

  // Taillights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.4, 0.25, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-0.7, 0.5, -2.26);
  group.add(taillightL);
  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(0.7, 0.5, -2.26);
  group.add(taillightR);

  addWheels(group, 0.35, 0.9, 1.3);

  // Add text below windows on both sides
  const adText = getNextVehicleText();
  const textWidth = 2.0;
  const textHeight = 0.25;
  const adTexture = createVehicleTextTexture(adText, textWidth * 100, textHeight * 100);
  const adGeom = new THREE.PlaneGeometry(textWidth, textHeight);
  const adMat = new THREE.MeshBasicMaterial({ map: adTexture, transparent: true });

  // Left side
  const adLeft = new THREE.Mesh(adGeom, adMat);
  adLeft.position.set(-1.11, 0.7, 0);
  adLeft.rotation.y = Math.PI / 2;
  group.add(adLeft);

  // Right side
  const adRight = new THREE.Mesh(adGeom, adMat);
  adRight.position.set(1.11, 0.7, 0);
  adRight.rotation.y = -Math.PI / 2;
  group.add(adRight);

  return group;
}

/**
 * Create SUV car
 */
function createSUVCar(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  const bodyGeom = new THREE.BoxGeometry(2.4, 1.0, 5.0);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 0.7;
  group.add(body);

  const cabinGeom = new THREE.BoxGeometry(2.2, 1.0, 3.0);
  const cabinMat = new THREE.MeshBasicMaterial({ color: 0x252540 });
  const cabin = new THREE.Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 1.7, -0.5);
  group.add(cabin);

  const windowMat = new THREE.MeshBasicMaterial({ color: 0x50c8d8, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
  const frontWindowGeom = new THREE.PlaneGeometry(2.0, 0.8);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 1.7, 1.01);
  frontWindow.rotation.x = -0.2;
  group.add(frontWindow);

  // Side windows
  const sideWindowGeom = new THREE.PlaneGeometry(2.6, 0.8);
  const sideWindowL = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowL.position.set(-1.11, 1.7, -0.5);
  sideWindowL.rotation.y = Math.PI / 2;
  group.add(sideWindowL);
  const sideWindowR = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowR.position.set(1.11, 1.7, -0.5);
  sideWindowR.rotation.y = -Math.PI / 2;
  group.add(sideWindowR);

  // Rear window
  const rearWindowGeom = new THREE.PlaneGeometry(2.0, 0.7);
  const rearWindow = new THREE.Mesh(rearWindowGeom, windowMat);
  rearWindow.position.set(0, 1.7, -2.01);
  rearWindow.rotation.y = Math.PI;
  group.add(rearWindow);

  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.5, 0.4, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-0.8, 0.7, 2.51);
  group.add(headlightL);
  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(0.8, 0.7, 2.51);
  group.add(headlightR);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.5, 0.3, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-0.8, 0.7, -2.51);
  group.add(taillightL);
  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(0.8, 0.7, -2.51);
  group.add(taillightR);

  addWheels(group, 0.45, 1.0, 1.6);

  // Add text below windows on both sides
  const adText = getNextVehicleText();
  const textWidth = 2.4;
  const textHeight = 0.3;
  const adTexture = createVehicleTextTexture(adText, textWidth * 100, textHeight * 100);
  const adGeom = new THREE.PlaneGeometry(textWidth, textHeight);
  const adMat = new THREE.MeshBasicMaterial({ map: adTexture, transparent: true });

  // Left side
  const adLeft = new THREE.Mesh(adGeom, adMat);
  adLeft.position.set(-1.21, 1.0, -0.5);
  adLeft.rotation.y = Math.PI / 2;
  group.add(adLeft);

  // Right side
  const adRight = new THREE.Mesh(adGeom, adMat);
  adRight.position.set(1.21, 1.0, -0.5);
  adRight.rotation.y = -Math.PI / 2;
  group.add(adRight);

  return group;
}

/**
 * Create bus
 */
function createBus(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  // Main body (longer and taller)
  const bodyGeom = new THREE.BoxGeometry(2.8, 2.5, 10);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 1.8;
  group.add(body);

  // Windows (multiple on sides)
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const windowGeom = new THREE.PlaneGeometry(1.4, 1.2);
    // Left side windows
    const windowL = new THREE.Mesh(windowGeom, windowMat);
    windowL.position.set(-1.41, 2.2, 3.5 - i * 1.8);
    windowL.rotation.y = Math.PI / 2;
    group.add(windowL);
    // Right side windows
    const windowR = new THREE.Mesh(windowGeom, windowMat);
    windowR.position.set(1.41, 2.2, 3.5 - i * 1.8);
    windowR.rotation.y = -Math.PI / 2;
    group.add(windowR);
  }

  // Front windshield
  const frontWindowGeom = new THREE.PlaneGeometry(2.4, 1.8);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 2.4, 5.01);
  group.add(frontWindow);

  // Headlights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.5, 0.4, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-1.0, 1.0, 5.01);
  group.add(headlightL);
  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(1.0, 1.0, 5.01);
  group.add(headlightR);

  // Taillights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.6, 0.4, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-1.0, 1.0, -5.01);
  group.add(taillightL);
  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(1.0, 1.0, -5.01);
  group.add(taillightR);

  addWheels(group, 0.55, 1.2, 3.5);

  // Add text below windows on both sides
  const adText = getNextVehicleText();
  const textWidth = 8.0;
  const textHeight = 0.6;
  const adTexture = createVehicleTextTexture(adText, textWidth * 100, textHeight * 100);
  const adGeom = new THREE.PlaneGeometry(textWidth, textHeight);
  const adMat = new THREE.MeshBasicMaterial({ map: adTexture, transparent: true });

  // Left side
  const adLeft = new THREE.Mesh(adGeom, adMat);
  adLeft.position.set(-1.41, 1.2, 0);
  adLeft.rotation.y = Math.PI / 2;
  group.add(adLeft);

  // Right side
  const adRight = new THREE.Mesh(adGeom, adMat);
  adRight.position.set(1.41, 1.2, 0);
  adRight.rotation.y = -Math.PI / 2;
  group.add(adRight);

  return group;
}

/**
 * Create truck (cargo truck)
 */
function createTruck(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  // Cab (driver section)
  const cabGeom = new THREE.BoxGeometry(2.4, 1.8, 2.5);
  const cab = new THREE.Mesh(cabGeom, mat);
  cab.position.set(0, 1.4, 3.0);
  group.add(cab);

  // Cab roof
  const cabRoofGeom = new THREE.BoxGeometry(2.4, 0.3, 2.5);
  const cabRoof = new THREE.Mesh(cabRoofGeom, mat);
  cabRoof.position.set(0, 2.45, 3.0);
  group.add(cabRoof);

  // Cargo container
  const cargoMat = new THREE.MeshBasicMaterial({ color: 0x404040 });
  const cargoGeom = new THREE.BoxGeometry(2.6, 2.8, 6.0);
  const cargo = new THREE.Mesh(cargoGeom, cargoMat);
  cargo.position.set(0, 1.9, -1.0);
  group.add(cargo);

  // Cab windows
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const frontWindowGeom = new THREE.PlaneGeometry(2.0, 1.2);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 1.8, 4.26);
  group.add(frontWindow);

  // Cab side windows
  const sideWindowGeom = new THREE.PlaneGeometry(2.0, 1.0);
  const sideWindowL = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowL.position.set(-1.21, 1.8, 3.0);
  sideWindowL.rotation.y = Math.PI / 2;
  group.add(sideWindowL);
  const sideWindowR = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowR.position.set(1.21, 1.8, 3.0);
  sideWindowR.rotation.y = -Math.PI / 2;
  group.add(sideWindowR);

  // Headlights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.5, 0.4, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-0.8, 0.8, 4.26);
  group.add(headlightL);
  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(0.8, 0.8, 4.26);
  group.add(headlightR);

  // Taillights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.5, 0.4, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-1.0, 1.0, -4.01);
  group.add(taillightL);
  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(1.0, 1.0, -4.01);
  group.add(taillightR);

  addWheels(group, 0.5, 1.1, 3.0);
  // Add extra rear wheels for truck
  const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12);
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  const rearWheelL = new THREE.Mesh(wheelGeom, wheelMat);
  rearWheelL.rotation.z = Math.PI / 2;
  rearWheelL.position.set(-1.1, 0.5, -1.5);
  group.add(rearWheelL);
  const rearWheelR = new THREE.Mesh(wheelGeom, wheelMat);
  rearWheelR.rotation.z = Math.PI / 2;
  rearWheelR.position.set(1.1, 0.5, -1.5);
  group.add(rearWheelR);

  // Add text on cargo container sides
  const adText = getNextVehicleText();
  const textWidth = 5.0;
  const textHeight = 1.2;
  const adTexture = createVehicleTextTexture(adText, textWidth * 100, textHeight * 100);
  const adGeom = new THREE.PlaneGeometry(textWidth, textHeight);
  const adMat = new THREE.MeshBasicMaterial({ map: adTexture, transparent: true });

  // Left side of cargo
  const adLeft = new THREE.Mesh(adGeom, adMat);
  adLeft.position.set(-1.31, 2.0, -1.0);
  adLeft.rotation.y = Math.PI / 2;
  group.add(adLeft);

  // Right side of cargo
  const adRight = new THREE.Mesh(adGeom, adMat);
  adRight.position.set(1.31, 2.0, -1.0);
  adRight.rotation.y = -Math.PI / 2;
  group.add(adRight);

  return group;
}

/**
 * Create delivery van
 */
function createDeliveryVan(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  // Main body (box shape)
  const bodyGeom = new THREE.BoxGeometry(2.2, 2.0, 5.5);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 1.4;
  group.add(body);

  // Cab section (slightly lower roof)
  const cabGeom = new THREE.BoxGeometry(2.2, 0.3, 1.5);
  const cab = new THREE.Mesh(cabGeom, mat);
  cab.position.set(0, 2.55, 2.0);
  group.add(cab);

  // Front windshield
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const frontWindowGeom = new THREE.PlaneGeometry(1.8, 1.2);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 1.8, 2.76);
  frontWindow.rotation.x = -0.1;
  group.add(frontWindow);

  // Side windows (front section only)
  const sideWindowGeom = new THREE.PlaneGeometry(0.8, 0.8);
  const sideWindowL = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowL.position.set(-1.11, 1.8, 1.8);
  sideWindowL.rotation.y = Math.PI / 2;
  group.add(sideWindowL);
  const sideWindowR = new THREE.Mesh(sideWindowGeom, windowMat);
  sideWindowR.position.set(1.11, 1.8, 1.8);
  sideWindowR.rotation.y = -Math.PI / 2;
  group.add(sideWindowR);

  // Headlights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.4, 0.4, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-0.7, 0.8, 2.76);
  group.add(headlightL);
  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(0.7, 0.8, 2.76);
  group.add(headlightR);

  // Taillights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.4, 0.3, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-0.7, 0.8, -2.76);
  group.add(taillightL);
  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(0.7, 0.8, -2.76);
  group.add(taillightR);

  addWheels(group, 0.4, 0.95, 1.8);

  // Add text on cargo area sides
  const adText = getNextVehicleText();
  const textWidth = 3.5;
  const textHeight = 0.6;
  const adTexture = createVehicleTextTexture(adText, textWidth * 100, textHeight * 100);
  const adGeom = new THREE.PlaneGeometry(textWidth, textHeight);
  const adMat = new THREE.MeshBasicMaterial({ map: adTexture, transparent: true });

  // Left side
  const adLeft = new THREE.Mesh(adGeom, adMat);
  adLeft.position.set(-1.11, 1.0, -0.5);
  adLeft.rotation.y = Math.PI / 2;
  group.add(adLeft);

  // Right side
  const adRight = new THREE.Mesh(adGeom, adMat);
  adRight.position.set(1.11, 1.0, -0.5);
  adRight.rotation.y = -Math.PI / 2;
  group.add(adRight);

  return group;
}

/**
 * Add wheels helper
 */
function addWheels(group, radius, xOffset, zOffset) {
  const wheelGeom = new THREE.CylinderGeometry(radius, radius, 0.3, 12);
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

  const positions = [
    { x: -xOffset, z: zOffset },
    { x: xOffset, z: zOffset },
    { x: -xOffset, z: -zOffset },
    { x: xOffset, z: -zOffset }
  ];

  positions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, radius, pos.z);
    group.add(wheel);
  });
}

/**
 * Create a random vehicle
 * Distribution: Sedan 30%, SUV 30%, Bus 10%, Truck 15%, Delivery Van 15%
 */
function createRandomCar() {
  const rand = Math.random() * 100;

  if (rand < 30) {
    // Sedan (30%)
    const color = carColors[Math.floor(Math.random() * carColors.length)];
    return createSedanCar(color);
  } else if (rand < 60) {
    // SUV (30%)
    const color = carColors[Math.floor(Math.random() * carColors.length)];
    return createSUVCar(color);
  } else if (rand < 70) {
    // Bus (10%)
    const color = busColors[Math.floor(Math.random() * busColors.length)];
    return createBus(color);
  } else if (rand < 85) {
    // Truck (15%)
    const color = truckColors[Math.floor(Math.random() * truckColors.length)];
    return createTruck(color);
  } else {
    // Delivery Van (15%)
    const color = vanColors[Math.floor(Math.random() * vanColors.length)];
    return createDeliveryVan(color);
  }
}

/**
 * Check if spawn position is clear
 */
function isSpawnClear(x, z, laneName) {
  const minSpawnDistance = 25; // Minimum distance between spawned vehicles
  for (const car of vehicles) {
    // Check all cars, not just same lane
    const dx = car.position.x - x;
    const dz = car.position.z - z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < minSpawnDistance) {
      return false;
    }
  }
  return true;
}

/**
 * Spawn a vehicle on main road (only mainWest spawns directly)
 */
function spawnMainRoadVehicle(scene, goingEast) {
  // Only spawn mainWest cars - mainEast cars come from curve
  if (goingEast) return null;

  const lane = lanes.mainWest;

  // Start position at tunnel end (far east)
  const startX = lane.xMax + 10; // x = 290

  // Check if spawn position is clear
  if (!isSpawnClear(startX, lane.z, 'mainWest')) {
    return null;
  }

  const car = createRandomCar();
  car.position.set(startX, 0, lane.z);
  car.rotation.y = -Math.PI / 2; // Facing -x (west)

  car.userData = {
    type: 'mainRoad',
    lane: 'mainWest',
    speed: vehicleSpeed,
    direction: lane.direction,
    state: 'straight'
  };

  scene.add(car);
  vehicles.push(car);
  return car;
}

/**
 * Spawn a vehicle on south road (only southUp spawns directly)
 */
function spawnSouthRoadVehicle(scene, goingSouth) {
  // Only spawn southUp cars - southDown cars come from curve
  if (goingSouth) return null;

  const lane = lanes.southUp;

  // Start position at far south end
  const startZ = lane.zMin - 10; // z = -250

  // Check if spawn position is clear
  if (!isSpawnClear(lane.x, startZ, 'southUp')) {
    return null;
  }

  const car = createRandomCar();
  car.position.set(lane.x, 0, startZ);
  car.rotation.y = 0; // Facing +z (north)

  car.userData = {
    type: 'southRoad',
    lane: 'southUp',
    speed: vehicleSpeed,
    direction: lane.direction,
    state: 'straight'
  };

  scene.add(car);
  vehicles.push(car);
  return car;
}

/**
 * Check distance to car ahead (only for straight roads, not during curves)
 * Returns: distance to car ahead, or Infinity if no car ahead
 */
function getDistanceToCarAhead(car, allVehicles) {
  const data = car.userData;

  // No collision detection during curves - let cars flow through
  if (data.state === 'curving') {
    return Infinity;
  }

  let minAheadDistance = Infinity;

  for (const other of allVehicles) {
    if (other === car) continue;

    // Skip cars that are curving
    if (other.userData.state === 'curving') continue;

    // Only check cars in the same lane
    if (other.userData.lane !== data.lane) continue;

    const dx = other.position.x - car.position.x;
    const dz = other.position.z - car.position.z;

    if (data.type === 'mainRoad') {
      // Check if other car is ahead in x direction
      const ahead = dx * data.direction;
      if (ahead > 0 && ahead < minAheadDistance) {
        minAheadDistance = ahead;
      }
    } else if (data.type === 'southRoad') {
      // Check if other car is ahead in z direction
      const ahead = dz * data.direction;
      if (ahead > 0 && ahead < minAheadDistance) {
        minAheadDistance = ahead;
      }
    }
  }
  return minAheadDistance;
}

/**
 * Update vehicle position with curve handling
 */
function updateVehicle(car, deltaTime, allVehicles) {
  const data = car.userData;

  // Initialize state if not set
  if (!data.state) {
    data.state = 'straight';
  }

  // Handle curving state (no collision detection during curves)
  if (data.state === 'curving') {
    // Full speed during curves
    const currentSpeed = data.speed;
    const angularSpeed = (currentSpeed / data.curveRadius) * deltaTime;

    if (data.curveTarget === 'southDown') {
      // Counterclockwise turn: angle increases from π/2 to π
      data.curveAngle += angularSpeed;

      // Clamp angle to end
      if (data.curveAngle >= curveWestToSouth.endAngle) {
        data.curveAngle = curveWestToSouth.endAngle;
      }

      // Update position along curve
      car.position.x = curveWestToSouth.centerX + Math.cos(data.curveAngle) * data.curveRadius;
      car.position.z = curveWestToSouth.centerZ + Math.sin(data.curveAngle) * data.curveRadius;

      // Update rotation (tangent to curve)
      car.rotation.y = -data.curveAngle;

      // Check if curve is complete
      if (data.curveAngle >= curveWestToSouth.endAngle) {
        // Transition to south road - position is already at exit point
        data.state = 'straight';
        data.type = 'southRoad';
        data.lane = 'southDown';
        data.direction = -1;
        car.rotation.y = Math.PI; // Facing -z (south)
      }
    } else if (data.curveTarget === 'mainEast') {
      // Clockwise turn: angle decreases from π to π/2
      data.curveAngle -= angularSpeed;

      // Clamp angle to end
      if (data.curveAngle <= curveSouthToEast.endAngle) {
        data.curveAngle = curveSouthToEast.endAngle;
      }

      // Update position along curve
      car.position.x = curveSouthToEast.centerX + Math.cos(data.curveAngle) * data.curveRadius;
      car.position.z = curveSouthToEast.centerZ + Math.sin(data.curveAngle) * data.curveRadius;

      // Update rotation (tangent to curve)
      car.rotation.y = -data.curveAngle + Math.PI;

      // Check if curve is complete
      if (data.curveAngle <= curveSouthToEast.endAngle) {
        // Transition to main road - position is already at exit point
        data.state = 'straight';
        data.type = 'mainRoad';
        data.lane = 'mainEast';
        data.direction = 1;
        car.rotation.y = Math.PI / 2; // Facing +x (east)
      }
    }

    return false; // Keep
  }

  // Straight movement - check distance to car ahead
  const distanceAhead = getDistanceToCarAhead(car, allVehicles);
  const stopDistance = 8;      // Complete stop distance
  const slowDistance = 15;     // Start slowing down distance

  // Check for pedestrians on crosswalks
  const shouldStopForPedestrian = pedestrianStopChecker ? pedestrianStopChecker(car.position.x, car.position.z, data.lane) : false;

  let currentSpeed = data.speed;
  if (shouldStopForPedestrian) {
    // Stop for pedestrians crossing
    currentSpeed = 0;
  } else if (distanceAhead < stopDistance) {
    // Too close - complete stop
    currentSpeed = 0;
  } else if (distanceAhead < slowDistance) {
    // Gradually slow down based on distance
    const ratio = (distanceAhead - stopDistance) / (slowDistance - stopDistance);
    currentSpeed = data.speed * ratio;
  }
  const speed = currentSpeed * deltaTime;

  if (data.type === 'mainRoad') {
    // Move first
    car.position.x += speed * data.direction;

    // Check if mainWest car should start curving (after moving)
    if (data.lane === 'mainWest' && car.position.x <= curveWestToSouth.triggerX) {
      // Start curve at current position (no teleport)
      data.state = 'curving';
      data.curveRadius = curveWestToSouth.radius;
      data.curveAngle = curveWestToSouth.startAngle;
      data.curveTarget = 'southDown';
      // Position is already close to entry, just ensure it's on the curve
      car.position.x = curveWestToSouth.centerX + Math.cos(data.curveAngle) * data.curveRadius;
      return false;
    }

    const lane = lanes[data.lane];
    // Check if out of bounds
    if (data.direction > 0 && car.position.x > lane.xMax + 20) {
      return true; // Remove
    }
    if (data.direction < 0 && car.position.x < lane.xMin - 30) {
      return true; // Remove
    }
  } else if (data.type === 'southRoad') {
    // Move first
    car.position.z += speed * data.direction;

    // Check if southUp car should start curving (after moving)
    if (data.lane === 'southUp' && car.position.z >= curveSouthToEast.triggerZ) {
      // Start curve at current position (no teleport)
      data.state = 'curving';
      data.curveRadius = curveSouthToEast.radius;
      data.curveAngle = curveSouthToEast.startAngle;
      data.curveTarget = 'mainEast';
      // Position is already close to entry, just ensure it's on the curve
      car.position.z = curveSouthToEast.centerZ + Math.sin(data.curveAngle) * data.curveRadius;
      return false;
    }

    const lane = lanes[data.lane];
    // Check if out of bounds
    if (data.direction > 0 && car.position.z > lane.zMax + 30) {
      return true; // Remove
    }
    if (data.direction < 0 && car.position.z < lane.zMin - 20) {
      return true; // Remove
    }
  }

  return false; // Keep
}

/**
 * Initialize vehicle system
 */
export function initVehicles(scene) {
  vehicles = [];
  lastSpawnTime = 0;

  // Spawn initial vehicles on main road (only mainWest - mainEast cars come from curve)
  for (let i = 0; i < 4; i++) {
    const car = createRandomCar();
    const lane = lanes.mainWest;

    // Spread along the road (well away from curve at x=-40)
    // x from 20 to 220 (at least 60 units from curve trigger)
    const x = 20 + Math.random() * 200;
    car.position.set(x, 0, lane.z);
    car.rotation.y = -Math.PI / 2; // Facing -x (west)

    car.userData = {
      type: 'mainRoad',
      lane: 'mainWest',
      speed: vehicleSpeed,
      direction: lane.direction,
      state: 'straight'
    };

    scene.add(car);
    vehicles.push(car);
  }

  // Initial south road vehicles (only southUp - southDown cars come from curve)
  for (let i = 0; i < 2; i++) {
    const car = createRandomCar();
    const lane = lanes.southUp;

    // Spread along the south road (well away from curve at z=-35)
    // z from -240 to -80 (at least 45 units from curve trigger)
    const z = -240 + Math.random() * 160;
    car.position.set(lane.x, 0, z);
    car.rotation.y = 0; // Facing +z (north)

    car.userData = {
      type: 'southRoad',
      lane: 'southUp',
      speed: vehicleSpeed,
      direction: lane.direction,
      state: 'straight'
    };

    scene.add(car);
    vehicles.push(car);
  }

  return vehicles;
}

/**
 * Update all vehicles
 */
export function updateVehicles(scene, deltaTime) {
  // Update existing vehicles
  const toRemove = [];
  vehicles.forEach((car, index) => {
    if (updateVehicle(car, deltaTime, vehicles)) {
      toRemove.push(index);
    }
  });

  // Remove vehicles that are out of bounds
  for (let i = toRemove.length - 1; i >= 0; i--) {
    const car = vehicles[toRemove[i]];
    scene.remove(car);
    vehicles.splice(toRemove[i], 1);
  }

  // Spawn new vehicles
  lastSpawnTime += deltaTime;
  if (lastSpawnTime >= spawnInterval && vehicles.length < maxVehicles) {
    lastSpawnTime = 0;

    // Randomly choose road and direction
    // Traffic flow: mainWest → southDown (via curve), southUp → mainEast (via curve)
    // Only spawn at entry points: mainWest (tunnel) and southUp (south end)
    const roadChoice = Math.random();
    if (roadChoice < 0.6) {
      // Main road west - spawn at tunnel, turn onto southDown via curve
      spawnMainRoadVehicle(scene, false);
    } else {
      // South road up - spawn at south, turn onto mainEast via curve
      spawnSouthRoadVehicle(scene, false);
    }
  }
}

/**
 * Get all vehicles
 */
export function getVehicles() {
  return vehicles;
}

export { lanes, roadConfig };
