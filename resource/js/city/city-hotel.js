import * as THREE from 'three';

/**
 * Create pink hotel
 * @param {boolean} skipText - If true, skip text panel (for GLB export)
 */
export function createPinkHotel(scene, groundY, skipText = false) {
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

  // === Hotel Sign Text "hada0127" === (only if not skipping text)
  if (!skipText) {
    // Create canvas for text texture
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 128;
    const ctx = textCanvas.getContext('2d');

    // Clear canvas (transparent)
    ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    // Text settings - cursive font
    ctx.font = 'italic 72px "Brush Script MT", "Segoe Script", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text stroke (border) in darker pink color
    ctx.strokeStyle = '#9b4055';
    ctx.lineWidth = 12;
    ctx.strokeText('Hada0127', textCanvas.width / 2, textCanvas.height / 2);

    // Draw text fill in white
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Hada0127', textCanvas.width / 2, textCanvas.height / 2);

    // Create texture from canvas
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.needsUpdate = true;

    // Create text plane (slightly protruding from sign)
    const textPlaneGeom = new THREE.PlaneGeometry(10, 2.5);
    const textPlaneMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const textPlane = new THREE.Mesh(textPlaneGeom, textPlaneMat);
    textPlane.position.set(mainX - mainWidth / 2 - 1.72, groundY + archHeight + 6.5, mainZ);
    textPlane.rotation.y = -Math.PI / 2;
    group.add(textPlane);
  }

  scene.add(group);
  return group;
}

/**
 * Add hotel sign text dynamically (after GLB load)
 */
export function addHotelSignText(scene) {
  // Hotel position constants (must match createPinkHotel)
  const mainX = 68;
  const mainZ = 1;
  const mainWidth = 18;
  const archHeight = 10;
  const groundY = 0;

  // Create canvas for text texture
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 512;
  textCanvas.height = 128;
  const ctx = textCanvas.getContext('2d');

  // Clear canvas (transparent)
  ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

  // Text settings - cursive font
  ctx.font = 'italic 72px "Brush Script MT", "Segoe Script", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw text stroke (border) in darker pink color
  ctx.strokeStyle = '#9b4055';
  ctx.lineWidth = 12;
  ctx.strokeText('Hada0127', textCanvas.width / 2, textCanvas.height / 2);

  // Draw text fill in white
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Hada0127', textCanvas.width / 2, textCanvas.height / 2);

  // Create texture from canvas
  const textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.needsUpdate = true;

  // Create text plane
  const textPlaneGeom = new THREE.PlaneGeometry(10, 2.5);
  const textPlaneMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide
  });
  const textPlane = new THREE.Mesh(textPlaneGeom, textPlaneMat);
  // 호텔 서쪽 면 바깥에 위치
  const posX = mainX - mainWidth / 2 - 1.72; // 57.28
  const posY = groundY + archHeight + 6.5;   // 16.5
  const posZ = mainZ;                         // 1
  textPlane.position.set(posX, posY, posZ);
  textPlane.rotation.y = -Math.PI / 2; // 서쪽(-X)을 바라봄
  scene.add(textPlane);
  console.log('Hotel sign text added at:', posX, posY, posZ);
}
