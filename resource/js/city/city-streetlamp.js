import * as THREE from 'three';

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

export { createStreetLamp, createTStreetLamp, createAllStreetLamps };
