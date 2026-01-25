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
 * Create all street lamps (reduced to 2/3)
 */
function createAllStreetLamps(scene) {
  const lamps = [];

  // Main road - T-shaped lamps on upper sidewalk (z=-14) - 7 lamps (was 10)
  lamps.push(createTStreetLamp(scene, -45, -14, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, -25, -14, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, -5, -14, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 15, -14, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 35, -14, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 50, -14, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 65, -14, 0, Math.PI / 2));

  // Main road - T-shaped lamps on lower sidewalk (z=-28) - 7 lamps (was 10)
  lamps.push(createTStreetLamp(scene, -40, -28, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, -20, -28, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 0, -28, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 20, -28, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 40, -28, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 55, -28, 0, Math.PI / 2));
  lamps.push(createTStreetLamp(scene, 70, -28, 0, Math.PI / 2));

  // Residential road lamps (y=10) - 7 lamps (was 10)
  lamps.push(createStreetLamp(scene, -35, 20, 10, -Math.PI / 2));
  lamps.push(createStreetLamp(scene, -15, 20, 10, -Math.PI / 2));
  lamps.push(createStreetLamp(scene, 5, 20, 10, -Math.PI / 2));
  lamps.push(createStreetLamp(scene, 25, 20, 10, -Math.PI / 2));
  lamps.push(createStreetLamp(scene, 45, 20, 10, -Math.PI / 2));
  lamps.push(createStreetLamp(scene, 60, 20, 10, -Math.PI / 2));
  lamps.push(createStreetLamp(scene, 75, 20, 10, -Math.PI / 2));

  // Sloped road lamps - 2 lamps (was 3)
  lamps.push(createStreetLamp(scene, 55, 20, 11, -Math.PI / 2));
  lamps.push(createStreetLamp(scene, 85, 20, 15, -Math.PI / 2));

  // Flat top road lamps (y=16) - 1 lamp (was 2)
  lamps.push(createStreetLamp(scene, 107, 20, 16, -Math.PI / 2));

  // South road - left sidewalk (x=-62) - 5 lamps (was 8)
  lamps.push(createTStreetLamp(scene, -62, -55, 0, 0));
  lamps.push(createTStreetLamp(scene, -62, -95, 0, 0));
  lamps.push(createTStreetLamp(scene, -62, -135, 0, 0));
  lamps.push(createTStreetLamp(scene, -62, -175, 0, 0));
  lamps.push(createTStreetLamp(scene, -62, -215, 0, 0));

  // South road - right sidewalk (x=-48) - 5 lamps (was 8)
  lamps.push(createTStreetLamp(scene, -48, -65, 0, 0));
  lamps.push(createTStreetLamp(scene, -48, -105, 0, 0));
  lamps.push(createTStreetLamp(scene, -48, -145, 0, 0));
  lamps.push(createTStreetLamp(scene, -48, -185, 0, 0));
  lamps.push(createTStreetLamp(scene, -48, -225, 0, 0));

  // Curved road area - 2 lamps (was 3)
  const curveCenter = { x: -40, z: -35 };
  const outerRadius = 22;
  [Math.PI * 0.6, Math.PI * 0.85].forEach(angle => {
    const lampX = curveCenter.x + outerRadius * Math.cos(angle);
    const lampZ = curveCenter.z + outerRadius * Math.sin(angle);
    lamps.push(createTStreetLamp(scene, lampX, lampZ, 0, angle));
  });

  return lamps;
}

export { createStreetLamp, createTStreetLamp, createAllStreetLamps };
