/**
 * city-furniture.js
 * Hong Kong Citypop Night City - Street Furniture
 *
 * Elements:
 * - Benches (street style)
 * - Mailboxes / Post boxes
 * - Bus stops with shelter
 * - Trash cans
 * - Vending machines
 * - Phone booths
 * - Planters
 * - Bollards
 * - Newspaper stands
 * - Bicycle racks
 */

import * as THREE from 'three';
import { colors } from './city-colors.js';

// Vending machine side texts (two lines)
const vendingMachineSideTexts = [
  'github.com/hada0127',
  'tarucy@gmail.com'
];

/**
 * Create a canvas texture with two-line text and black stroke for vending machine front
 */
function createVendingFrontTexture(width, height) {
  const canvas = document.createElement('canvas');
  const scale = 8; // Higher resolution for readability
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Text settings
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate optimal font size for two lines (30% of height for each line)
  let fontSize = canvas.height * 0.35;
  ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;

  // Measure longest text and adjust to fit width
  const maxTextWidth = Math.max(
    ctx.measureText(vendingMachineSideTexts[0]).width,
    ctx.measureText(vendingMachineSideTexts[1]).width
  );
  const maxWidth = canvas.width * 0.95;

  if (maxTextWidth > maxWidth) {
    fontSize = fontSize * (maxWidth / maxTextWidth);
    ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  }

  const lineHeight = fontSize * 1.2;
  const startY = canvas.height / 2 - lineHeight / 2;

  // Draw each line
  vendingMachineSideTexts.forEach((text, i) => {
    const y = startY + i * lineHeight;

    // Draw black stroke
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = fontSize * 0.2;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, canvas.width / 2, y);

    // Draw white fill
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, canvas.width / 2, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ════════════════════════════════════════════════════════════════════════════
// Street Bench
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a street bench
 */
function createStreetBench(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  // Bench seat
  const seatGeom = new THREE.BoxGeometry(2, 0.1, 0.6);
  const woodMat = new THREE.MeshBasicMaterial({ color: 0x5a4030 });
  const seat = new THREE.Mesh(seatGeom, woodMat);
  seat.position.set(0, 0.45, 0);
  group.add(seat);

  // Bench backrest
  const backGeom = new THREE.BoxGeometry(2, 0.5, 0.08);
  const back = new THREE.Mesh(backGeom, woodMat);
  back.position.set(0, 0.75, -0.26);
  back.rotation.x = 0.1;
  group.add(back);

  // Metal frame legs
  const metalMat = new THREE.MeshBasicMaterial({ color: 0x4a4a4a });
  const legGeom = new THREE.BoxGeometry(0.08, 0.45, 0.5);

  const leg1 = new THREE.Mesh(legGeom, metalMat);
  leg1.position.set(-0.8, 0.225, 0);
  group.add(leg1);

  const leg2 = new THREE.Mesh(legGeom, metalMat);
  leg2.position.set(0.8, 0.225, 0);
  group.add(leg2);

  // Armrests
  const armGeom = new THREE.BoxGeometry(0.08, 0.3, 0.5);
  const arm1 = new THREE.Mesh(armGeom, metalMat);
  arm1.position.set(-0.96, 0.6, 0);
  group.add(arm1);

  const arm2 = new THREE.Mesh(armGeom, metalMat);
  arm2.position.set(0.96, 0.6, 0);
  group.add(arm2);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Mailbox / Post Box
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a red post box (Hong Kong style)
 */
function createPostBox(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Main body (cylindrical)
  const bodyGeom = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 12);
  const redMat = new THREE.MeshBasicMaterial({ color: 0x8a3535 });
  const body = new THREE.Mesh(bodyGeom, redMat);
  body.position.set(0, 0.6, 0);
  group.add(body);

  // Top dome
  const topGeom = new THREE.SphereGeometry(0.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const top = new THREE.Mesh(topGeom, redMat);
  top.position.set(0, 1.2, 0);
  group.add(top);

  // Mail slot
  const slotGeom = new THREE.BoxGeometry(0.25, 0.04, 0.1);
  const blackMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  const slot = new THREE.Mesh(slotGeom, blackMat);
  slot.position.set(0, 0.9, 0.33);
  group.add(slot);

  // Base
  const baseGeom = new THREE.CylinderGeometry(0.4, 0.42, 0.15, 12);
  const base = new THREE.Mesh(baseGeom, redMat);
  base.position.set(0, 0.075, 0);
  group.add(base);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Bus Stop
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a bus stop with shelter
 */
function createBusStop(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshBasicMaterial({ color: 0x505050 });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x88aacc, transparent: true, opacity: 0.4 });

  // Poles (4 corners)
  const poleGeom = new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6);
  const polePositions = [
    [-1.5, 0], [1.5, 0], [-1.5, -0.8], [1.5, -0.8]
  ];
  polePositions.forEach(([px, pz]) => {
    const pole = new THREE.Mesh(poleGeom, metalMat);
    pole.position.set(px, 1.4, pz);
    group.add(pole);
  });

  // Roof
  const roofGeom = new THREE.BoxGeometry(3.4, 0.1, 1.2);
  const roof = new THREE.Mesh(roofGeom, metalMat);
  roof.position.set(0, 2.85, -0.4);
  group.add(roof);

  // Back glass panel
  const backGlassGeom = new THREE.BoxGeometry(3.2, 2, 0.05);
  const backGlass = new THREE.Mesh(backGlassGeom, glassMat);
  backGlass.position.set(0, 1.4, -0.95);
  group.add(backGlass);

  // Side glass panels
  const sideGlassGeom = new THREE.BoxGeometry(0.05, 2, 0.9);
  const leftGlass = new THREE.Mesh(sideGlassGeom, glassMat);
  leftGlass.position.set(-1.57, 1.4, -0.45);
  group.add(leftGlass);

  const rightGlass = new THREE.Mesh(sideGlassGeom, glassMat);
  rightGlass.position.set(1.57, 1.4, -0.45);
  group.add(rightGlass);

  // Bench inside
  const benchGeom = new THREE.BoxGeometry(2.8, 0.08, 0.4);
  const benchMat = new THREE.MeshBasicMaterial({ color: 0x404040 });
  const bench = new THREE.Mesh(benchGeom, benchMat);
  bench.position.set(0, 0.5, -0.7);
  group.add(bench);

  // Bench supports
  const supportGeom = new THREE.BoxGeometry(0.08, 0.5, 0.3);
  [-1.2, 0, 1.2].forEach(sx => {
    const support = new THREE.Mesh(supportGeom, metalMat);
    support.position.set(sx, 0.25, -0.7);
    group.add(support);
  });

  // Bus stop sign
  const signPoleGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6);
  const signPole = new THREE.Mesh(signPoleGeom, metalMat);
  signPole.position.set(2, 1.25, 0);
  group.add(signPole);

  const signGeom = new THREE.BoxGeometry(0.6, 0.8, 0.05);
  const signMat = new THREE.MeshBasicMaterial({ color: 0x2255aa });
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(2, 2.3, 0);
  group.add(sign);

  // "BUS" text background
  const textBgGeom = new THREE.BoxGeometry(0.5, 0.2, 0.06);
  const textBg = new THREE.Mesh(textBgGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  textBg.position.set(2, 2.4, 0.01);
  group.add(textBg);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Trash Can
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a street trash can
 */
function createTrashCan(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Main body
  const bodyGeom = new THREE.CylinderGeometry(0.25, 0.22, 0.8, 8);
  const greenMat = new THREE.MeshBasicMaterial({ color: 0x2a5a2a });
  const body = new THREE.Mesh(bodyGeom, greenMat);
  body.position.set(0, 0.4, 0);
  group.add(body);

  // Rim
  const rimGeom = new THREE.TorusGeometry(0.25, 0.03, 6, 12);
  const rim = new THREE.Mesh(rimGeom, greenMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.8, 0);
  group.add(rim);

  // Band with recycling symbol area
  const bandGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.15, 8);
  const bandMat = new THREE.MeshBasicMaterial({ color: 0x1a4a1a });
  const band = new THREE.Mesh(bandGeom, bandMat);
  band.position.set(0, 0.5, 0);
  group.add(band);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Vending Machine
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a vending machine
 */
function createVendingMachine(scene, x, z, groundY, rotation = 0, type = 'drink') {
  const group = new THREE.Group();

  // Main body (reduced brightness/saturation)
  const bodyGeom = new THREE.BoxGeometry(0.9, 1.8, 0.7);
  const bodyColor = type === 'drink' ? 0x6a3535 : 0x353560;
  const bodyMat = new THREE.MeshBasicMaterial({ color: bodyColor });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0, 0.9, 0);
  group.add(body);

  // Display window
  const windowGeom = new THREE.BoxGeometry(0.7, 0.9, 0.05);
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x556688, transparent: true, opacity: 0.7 });
  const window = new THREE.Mesh(windowGeom, windowMat);
  window.position.set(0, 1.15, 0.33);
  group.add(window);

  // Product display inside (visible through window)
  const displayMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
  const displayGeom = new THREE.BoxGeometry(0.65, 0.85, 0.02);
  const display = new THREE.Mesh(displayGeom, displayMat);
  display.position.set(0, 1.15, 0.28);
  group.add(display);

  // Product rows (reduced brightness/saturation)
  const productColors = type === 'drink'
    ? [0x8a4a4a, 0x4a7a4a, 0x4a4a7a, 0x8a8a4a]
    : [0x8a6030, 0x7a3060, 0x306a5a, 0x5a3070];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const prodGeom = new THREE.BoxGeometry(0.12, 0.2, 0.08);
      const prodMat = new THREE.MeshBasicMaterial({ color: productColors[col] });
      const prod = new THREE.Mesh(prodGeom, prodMat);
      prod.position.set(-0.24 + col * 0.16, 1.4 - row * 0.28, 0.3);
      group.add(prod);
    }
  }

  // Pickup slot
  const slotGeom = new THREE.BoxGeometry(0.4, 0.2, 0.1);
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  const slot = new THREE.Mesh(slotGeom, slotMat);
  slot.position.set(0, 0.25, 0.31);
  group.add(slot);

  // Coin slot area
  const coinAreaGeom = new THREE.BoxGeometry(0.15, 0.3, 0.05);
  const coinArea = new THREE.Mesh(coinAreaGeom, new THREE.MeshBasicMaterial({ color: 0x888888 }));
  coinArea.position.set(0.3, 1.0, 0.33);
  group.add(coinArea);

  // Front text panel (inside display window, 1/3 from top)
  const frontTextWidth = 0.65;
  const frontTextHeight = 0.25;
  const frontTexture = createVendingFrontTexture(frontTextWidth * 100, frontTextHeight * 100);
  const frontPanelGeom = new THREE.PlaneGeometry(frontTextWidth, frontTextHeight);
  const frontPanelMat = new THREE.MeshBasicMaterial({ map: frontTexture, transparent: true });
  const frontPanel = new THREE.Mesh(frontPanelGeom, frontPanelMat);
  // Display window is at y=1.15, height 0.9, so top is at 1.6, 1/3 from top is ~1.45
  frontPanel.position.set(0, 1.45, 0.34);
  group.add(frontPanel);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Phone Booth
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a phone booth
 */
function createPhoneBooth(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshBasicMaterial({ color: 0x505050 });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x88aacc, transparent: true, opacity: 0.3 });

  // Frame
  const frameGeom = new THREE.BoxGeometry(0.08, 2.2, 0.08);
  const framePositions = [
    [-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]
  ];
  framePositions.forEach(([fx, fz]) => {
    const frame = new THREE.Mesh(frameGeom, metalMat);
    frame.position.set(fx, 1.1, fz);
    group.add(frame);
  });

  // Roof
  const roofGeom = new THREE.BoxGeometry(1.1, 0.1, 1.1);
  const roof = new THREE.Mesh(roofGeom, metalMat);
  roof.position.set(0, 2.25, 0);
  group.add(roof);

  // Glass panels (3 sides)
  const sideGlassGeom = new THREE.BoxGeometry(0.03, 1.8, 0.8);
  const frontGlassGeom = new THREE.BoxGeometry(0.8, 1.8, 0.03);

  const backGlass = new THREE.Mesh(frontGlassGeom, glassMat);
  backGlass.position.set(0, 1.1, -0.47);
  group.add(backGlass);

  const leftGlass = new THREE.Mesh(sideGlassGeom, glassMat);
  leftGlass.position.set(-0.47, 1.1, 0);
  group.add(leftGlass);

  const rightGlass = new THREE.Mesh(sideGlassGeom, glassMat);
  rightGlass.position.set(0.47, 1.1, 0);
  group.add(rightGlass);

  // Phone unit
  const phoneGeom = new THREE.BoxGeometry(0.3, 0.4, 0.15);
  const phoneMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
  const phone = new THREE.Mesh(phoneGeom, phoneMat);
  phone.position.set(0, 1.3, -0.35);
  group.add(phone);

  // Handset
  const handsetGeom = new THREE.BoxGeometry(0.08, 0.2, 0.05);
  const handset = new THREE.Mesh(handsetGeom, new THREE.MeshBasicMaterial({ color: 0x1a1a1a }));
  handset.position.set(-0.15, 1.35, -0.25);
  group.add(handset);

  // Light on top
  const lightGeom = new THREE.BoxGeometry(0.3, 0.08, 0.3);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffdd88 });
  const light = new THREE.Mesh(lightGeom, lightMat);
  light.position.set(0, 2.18, 0);
  group.add(light);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Planter
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a street planter with plants
 */
function createPlanter(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Concrete planter box
  const boxGeom = new THREE.BoxGeometry(1.2, 0.5, 1.2);
  const concreteMat = new THREE.MeshBasicMaterial({ color: 0x606060 });
  const box = new THREE.Mesh(boxGeom, concreteMat);
  box.position.set(0, 0.25, 0);
  group.add(box);

  // Soil
  const soilGeom = new THREE.BoxGeometry(1.1, 0.1, 1.1);
  const soilMat = new THREE.MeshBasicMaterial({ color: 0x3a2a1a });
  const soil = new THREE.Mesh(soilGeom, soilMat);
  soil.position.set(0, 0.45, 0);
  group.add(soil);

  // Plants (small bushes)
  const plantColors = [0x2a5a2a, 0x3a6a3a, 0x2a6a2a];
  for (let i = 0; i < 5; i++) {
    const plantGeom = new THREE.SphereGeometry(0.2 + Math.random() * 0.15, 6, 5);
    const plantMat = new THREE.MeshBasicMaterial({
      color: plantColors[Math.floor(Math.random() * plantColors.length)]
    });
    const plant = new THREE.Mesh(plantGeom, plantMat);
    plant.position.set(
      (Math.random() - 0.5) * 0.7,
      0.55 + Math.random() * 0.2,
      (Math.random() - 0.5) * 0.7
    );
    plant.scale.y = 0.8 + Math.random() * 0.4;
    group.add(plant);
  }

  // Flowers
  const flowerColors = [0xff6688, 0xffaa44, 0xff44aa, 0xffff66];
  for (let i = 0; i < 8; i++) {
    const flowerGeom = new THREE.SphereGeometry(0.05, 4, 4);
    const flowerMat = new THREE.MeshBasicMaterial({
      color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
    });
    const flower = new THREE.Mesh(flowerGeom, flowerMat);
    flower.position.set(
      (Math.random() - 0.5) * 0.8,
      0.7 + Math.random() * 0.3,
      (Math.random() - 0.5) * 0.8
    );
    group.add(flower);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Bollard
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a bollard
 */
function createBollard(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Main post
  const postGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8);
  const metalMat = new THREE.MeshBasicMaterial({ color: 0x505050 });
  const post = new THREE.Mesh(postGeom, metalMat);
  post.position.set(0, 0.4, 0);
  group.add(post);

  // Top cap
  const capGeom = new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  const cap = new THREE.Mesh(capGeom, metalMat);
  cap.position.set(0, 0.8, 0);
  group.add(cap);

  // Reflective band
  const bandGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 8);
  const bandMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const band = new THREE.Mesh(bandGeom, bandMat);
  band.position.set(0, 0.65, 0);
  group.add(band);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Newspaper Stand
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a newspaper stand
 */
function createNewspaperStand(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  // Main box
  const boxGeom = new THREE.BoxGeometry(0.8, 1.2, 0.5);
  const blueMat = new THREE.MeshBasicMaterial({ color: 0x2255aa });
  const box = new THREE.Mesh(boxGeom, blueMat);
  box.position.set(0, 0.6, 0);
  group.add(box);

  // Window
  const windowGeom = new THREE.BoxGeometry(0.6, 0.5, 0.05);
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xaaccff, transparent: true, opacity: 0.6 });
  const window = new THREE.Mesh(windowGeom, windowMat);
  window.position.set(0, 0.9, 0.23);
  group.add(window);

  // Newspaper inside
  const paperGeom = new THREE.BoxGeometry(0.5, 0.4, 0.02);
  const paperMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  const paper = new THREE.Mesh(paperGeom, paperMat);
  paper.position.set(0, 0.85, 0.15);
  group.add(paper);

  // Headline area
  const headlineGeom = new THREE.BoxGeometry(0.4, 0.1, 0.025);
  const headlineMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const headline = new THREE.Mesh(headlineGeom, headlineMat);
  headline.position.set(0, 0.95, 0.16);
  group.add(headline);

  // Coin slot
  const slotGeom = new THREE.BoxGeometry(0.15, 0.08, 0.05);
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x888888 });
  const slot = new THREE.Mesh(slotGeom, slotMat);
  slot.position.set(0.25, 0.5, 0.23);
  group.add(slot);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Bicycle Rack
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a bicycle rack
 */
function createBicycleRack(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  const metalMat = new THREE.MeshBasicMaterial({ color: 0x606060 });

  // Create multiple U-shaped racks
  for (let i = 0; i < 4; i++) {
    const rackGroup = new THREE.Group();

    // U-shape using torus
    const uGeom = new THREE.TorusGeometry(0.35, 0.03, 6, 12, Math.PI);
    const uRack = new THREE.Mesh(uGeom, metalMat);
    uRack.rotation.x = Math.PI / 2;
    uRack.rotation.z = Math.PI / 2;
    uRack.position.set(0, 0.35, 0);
    rackGroup.add(uRack);

    // Legs
    const legGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6);
    const leg1 = new THREE.Mesh(legGeom, metalMat);
    leg1.position.set(0, 0.175, 0.35);
    rackGroup.add(leg1);

    const leg2 = new THREE.Mesh(legGeom, metalMat);
    leg2.position.set(0, 0.175, -0.35);
    rackGroup.add(leg2);

    rackGroup.position.set(i * 0.8 - 1.2, 0, 0);
    group.add(rackGroup);
  }

  // Base bar
  const baseGeom = new THREE.BoxGeometry(3.5, 0.06, 0.1);
  const base = new THREE.Mesh(baseGeom, metalMat);
  base.position.set(0, 0.03, 0);
  group.add(base);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

// ════════════════════════════════════════════════════════════════════════════
// Main function to place all furniture
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create all street furniture
 *
 * Trees/Lamps at 2/3:
 * Trees upper (z=-14): x = -40, -20, 0, 20, 40, 55
 * Trees lower (z=-28): x = -35, -15, 5, 25, 45, 60
 * Lamps upper (z=-14): x = -45, -25, -5, 15, 35, 50, 65
 * Lamps lower (z=-28): x = -40, -20, 0, 20, 40, 55, 70
 *
 * Road layout:
 * - Main road: z=-25 to z=-15
 * - South road: x=-60 to x=-50
 * - Curve area: around (-40, -35)
 */
export function createAllFurniture(scene) {
  const furniture = [];

  // === Upper sidewalk (z=-12, north of main road) ===
  // Safe x gaps: -30~-26, -15~-6, 5~14, 25~34, 42~49, 57~64

  // Bus stops
  furniture.push(createBusStop(scene, 75, -12, 0, 0));     // Far right

  // Benches
  furniture.push(createStreetBench(scene, -28, -12, 0, 0));
  furniture.push(createStreetBench(scene, -10, -12, 0, 0));
  furniture.push(createStreetBench(scene, 8, -12, 0, 0));
  furniture.push(createStreetBench(scene, 28, -12, 0, 0));
  furniture.push(createStreetBench(scene, 45, -12, 0, 0));
  furniture.push(createStreetBench(scene, 60, -12, 0, 0));

  // Post boxes
  furniture.push(createPostBox(scene, -12, -12, 0));
  furniture.push(createPostBox(scene, 47, -12, 0));

  // Trash cans
  furniture.push(createTrashCan(scene, -27, -12, 0));
  furniture.push(createTrashCan(scene, 6, -12, 0));
  furniture.push(createTrashCan(scene, 30, -12, 0));
  furniture.push(createTrashCan(scene, 62, -12, 0));

  // Vending machines
  furniture.push(createVendingMachine(scene, 10, -12, 0, 0, 'drink'));
  furniture.push(createVendingMachine(scene, 11, -12, 0, 0, 'snack'));
  furniture.push(createVendingMachine(scene, 58, -12, 0, 0, 'drink'));

  // Phone booths
  furniture.push(createPhoneBooth(scene, -8, -12, 0, 0));
  furniture.push(createPhoneBooth(scene, 43, -12, 0, 0));

  // Planters
  furniture.push(createPlanter(scene, -14, -12, 0));
  furniture.push(createPlanter(scene, 26, -12, 0));
  furniture.push(createPlanter(scene, 48, -12, 0));

  // Newspaper stands
  furniture.push(createNewspaperStand(scene, 32, -12, 0, 0));

  // Bicycle racks
  furniture.push(createBicycleRack(scene, 78, -12, 0, 0));

  // === Lower sidewalk (z=-30, south of main road) ===
  // Safe x gaps: -30~-21, -10~-1, 8~19, 28~39, 47~54, 62~69

  // Benches
  furniture.push(createStreetBench(scene, -25, -30, 0, Math.PI));
  furniture.push(createStreetBench(scene, -5, -30, 0, Math.PI));
  furniture.push(createStreetBench(scene, 12, -30, 0, Math.PI));
  furniture.push(createStreetBench(scene, 32, -30, 0, Math.PI));
  furniture.push(createStreetBench(scene, 50, -30, 0, Math.PI));
  furniture.push(createStreetBench(scene, 65, -30, 0, Math.PI));

  // Post boxes
  furniture.push(createPostBox(scene, -8, -30, 0));
  furniture.push(createPostBox(scene, 52, -30, 0));

  // Trash cans
  furniture.push(createTrashCan(scene, -28, -30, 0));
  furniture.push(createTrashCan(scene, 10, -30, 0));
  furniture.push(createTrashCan(scene, 35, -30, 0));
  furniture.push(createTrashCan(scene, 67, -30, 0));

  // Vending machines
  furniture.push(createVendingMachine(scene, 15, -30, 0, Math.PI, 'drink'));
  furniture.push(createVendingMachine(scene, 36, -30, 0, Math.PI, 'snack'));

  // Phone booth
  furniture.push(createPhoneBooth(scene, -3, -30, 0, Math.PI));

  // Planters
  furniture.push(createPlanter(scene, -22, -30, 0));
  furniture.push(createPlanter(scene, 30, -30, 0));
  furniture.push(createPlanter(scene, 48, -30, 0));

  // Newspaper stand
  furniture.push(createNewspaperStand(scene, 38, -30, 0, Math.PI));

  // Bicycle rack
  furniture.push(createBicycleRack(scene, 75, -30, 0, 0));

  // === South road sidewalks ===
  // Left sidewalk (x=-62): trees at z=-60,-100,-140,-180,-220, lamps at z=-55,-95,-135,-175,-215
  // Right sidewalk (x=-48): trees at z=-70,-110,-150,-190,-230, lamps at z=-65,-105,-145,-185,-225

  // Left sidewalk (x=-62) - west side, facing buildings
  furniture.push(createStreetBench(scene, -62, -75, 0, Math.PI / 2));
  furniture.push(createStreetBench(scene, -62, -115, 0, Math.PI / 2));
  furniture.push(createStreetBench(scene, -62, -155, 0, Math.PI / 2));
  furniture.push(createStreetBench(scene, -62, -195, 0, Math.PI / 2));

  furniture.push(createTrashCan(scene, -62, -80, 0));
  furniture.push(createTrashCan(scene, -62, -120, 0));
  furniture.push(createTrashCan(scene, -62, -160, 0));
  furniture.push(createTrashCan(scene, -62, -200, 0));

  furniture.push(createPlanter(scene, -62, -85, 0));
  furniture.push(createPlanter(scene, -62, -165, 0));

  furniture.push(createPostBox(scene, -62, -125, 0));

  // Right sidewalk (x=-48) - east side, facing forest
  furniture.push(createStreetBench(scene, -48, -85, 0, -Math.PI / 2));
  furniture.push(createStreetBench(scene, -48, -125, 0, -Math.PI / 2));
  furniture.push(createStreetBench(scene, -48, -165, 0, -Math.PI / 2));
  furniture.push(createStreetBench(scene, -48, -205, 0, -Math.PI / 2));

  furniture.push(createTrashCan(scene, -48, -90, 0));
  furniture.push(createTrashCan(scene, -48, -130, 0));
  furniture.push(createTrashCan(scene, -48, -170, 0));
  furniture.push(createTrashCan(scene, -48, -210, 0));

  furniture.push(createVendingMachine(scene, -48, -95, 0, -Math.PI / 2, 'drink'));
  furniture.push(createVendingMachine(scene, -48, -175, 0, -Math.PI / 2, 'snack'));

  furniture.push(createPhoneBooth(scene, -48, -135, 0, -Math.PI / 2));

  furniture.push(createPlanter(scene, -48, -100, 0));
  furniture.push(createPlanter(scene, -48, -180, 0));

  furniture.push(createBusStop(scene, -48, -50, 0, -Math.PI / 2));

  furniture.push(createNewspaperStand(scene, -48, -140, 0, -Math.PI / 2));

  return furniture;
}

// Export individual functions for custom placement
export {
  createStreetBench,
  createPostBox,
  createBusStop,
  createTrashCan,
  createVendingMachine,
  createPhoneBooth,
  createPlanter,
  createBollard,
  createNewspaperStand,
  createBicycleRack
};
