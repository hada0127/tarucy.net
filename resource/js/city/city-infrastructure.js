import * as THREE from 'three';

// ============================================
// Wall-Attached Stairs System
// ============================================

/**
 * Create stairs attached to the wall, running along X axis
 * Left stairs go from center to left (-X), right stairs go from center to right (+X)
 * One side of stairs is always against the wall (z=18)
 */
function createZigzagStairs(scene) {
  const group = new THREE.Group();
  const stairMat = new THREE.MeshBasicMaterial({ color: 0x4a4a5a });
  const railMat = new THREE.MeshBasicMaterial({ color: 0x656575 });

  // Parameters
  const topY = 10;
  const bottomY = 0; // Extended to ground level
  const heightDiff = topY - bottomY;
  const stepHeight = 0.2;
  const numSteps = Math.floor(heightDiff / stepHeight);
  const stepDepth = 3; // Depth toward shopping district (Z direction)
  const stepWidth = 0.5; // Width of each step (X direction)
  const wallZ = 18.5; // Wall position

  // Top landing platform at center
  const topLandingGeom = new THREE.BoxGeometry(6, 0.4, stepDepth);
  const topLanding = new THREE.Mesh(topLandingGeom, stairMat);
  topLanding.position.set(0, topY, wallZ - stepDepth / 2);
  group.add(topLanding);

  // Top landing front safety rail (outer side, away from wall)
  const topRailZ = wallZ - stepDepth - 0.1;

  // Left post
  const topLeftPostGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
  const topLeftPost = new THREE.Mesh(topLeftPostGeom, railMat);
  topLeftPost.position.set(-3, topY + 0.5, topRailZ);
  group.add(topLeftPost);

  // Right post
  const topRightPostGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
  const topRightPost = new THREE.Mesh(topRightPostGeom, railMat);
  topRightPost.position.set(3, topY + 0.5, topRailZ);
  group.add(topRightPost);

  // Horizontal rail connecting posts
  const topHorizRailGeom = new THREE.BoxGeometry(6, 0.08, 0.08);
  const topHorizRail = new THREE.Mesh(topHorizRailGeom, railMat);
  topHorizRail.position.set(0, topY + 0.95, topRailZ);
  group.add(topHorizRail);

  // Left stairs: from center (x=0) to left, attached to wall
  for (let i = 0; i < numSteps; i++) {
    const stepGeom = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeom, stairMat);
    step.position.set(
      -3 - i * stepWidth, // Moving left
      topY - i * stepHeight - stepHeight / 2,
      wallZ - stepDepth / 2
    );
    group.add(step);
  }

  // Left stairs - front railing (away from wall)
  for (let i = 0; i < numSteps; i += 5) {
    const postGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
    const post = new THREE.Mesh(postGeom, railMat);
    post.position.set(
      -3 - i * stepWidth,
      topY - i * stepHeight + 0.4,
      wallZ - stepDepth - 0.1
    );
    group.add(post);
  }

  // Left stairs - horizontal rail
  const leftRailLength = numSteps * stepWidth;
  const leftRailGeom = new THREE.BoxGeometry(leftRailLength, 0.08, 0.08);
  const leftRail = new THREE.Mesh(leftRailGeom, railMat);
  leftRail.position.set(
    -3 - leftRailLength / 2,
    (topY + bottomY) / 2 + 0.9,
    wallZ - stepDepth - 0.1
  );
  leftRail.rotation.z = Math.atan2(heightDiff, leftRailLength);
  group.add(leftRail);

  // Right stairs: from center (x=0) to right, attached to wall
  for (let i = 0; i < numSteps; i++) {
    const stepGeom = new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth);
    const step = new THREE.Mesh(stepGeom, stairMat);
    step.position.set(
      3 + i * stepWidth, // Moving right
      topY - i * stepHeight - stepHeight / 2,
      wallZ - stepDepth / 2
    );
    group.add(step);
  }

  // Right stairs - front railing (away from wall)
  for (let i = 0; i < numSteps; i += 5) {
    const postGeom = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
    const post = new THREE.Mesh(postGeom, railMat);
    post.position.set(
      3 + i * stepWidth,
      topY - i * stepHeight + 0.4,
      wallZ - stepDepth - 0.1
    );
    group.add(post);
  }

  // Right stairs - horizontal rail
  const rightRailGeom = new THREE.BoxGeometry(leftRailLength, 0.08, 0.08);
  const rightRail = new THREE.Mesh(rightRailGeom, railMat);
  rightRail.position.set(
    3 + leftRailLength / 2,
    (topY + bottomY) / 2 + 0.9,
    wallZ - stepDepth - 0.1
  );
  rightRail.rotation.z = -Math.atan2(heightDiff, leftRailLength);
  group.add(rightRail);

  // Fill below stairs (solid wall like retaining wall)
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x18181f });
  const pillarMat = new THREE.MeshBasicMaterial({ color: 0x141418 });

  // Left stairs fill - create sloped fill using multiple boxes
  const stairTotalWidth = numSteps * stepWidth;
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const xPos = -3 - t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const fillHeight = currentY - 0; // From ground (y=0) to stair bottom

    if (fillHeight > 0.5) {
      const fillGeom = new THREE.BoxGeometry(stairTotalWidth / 20 + 0.1, fillHeight, stepDepth);
      const fill = new THREE.Mesh(fillGeom, fillMat);
      fill.position.set(xPos, fillHeight / 2, wallZ - stepDepth / 2);
      group.add(fill);
    }
  }

  // Left stairs vertical pillars on front
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const xPos = -3 - t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const pillarHeight = currentY;

    if (pillarHeight > 1) {
      const pillarGeom = new THREE.BoxGeometry(0.4, pillarHeight, 0.2);
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(xPos, pillarHeight / 2, wallZ - stepDepth - 0.1);
      group.add(pillar);
    }
  }

  // Right stairs fill
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const xPos = 3 + t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const fillHeight = currentY - 0;

    if (fillHeight > 0.5) {
      const fillGeom = new THREE.BoxGeometry(stairTotalWidth / 20 + 0.1, fillHeight, stepDepth);
      const fill = new THREE.Mesh(fillGeom, fillMat);
      fill.position.set(xPos, fillHeight / 2, wallZ - stepDepth / 2);
      group.add(fill);
    }
  }

  // Right stairs vertical pillars on front
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const xPos = 3 + t * stairTotalWidth;
    const currentY = topY - t * heightDiff;
    const pillarHeight = currentY;

    if (pillarHeight > 1) {
      const pillarGeom = new THREE.BoxGeometry(0.4, pillarHeight, 0.2);
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(xPos, pillarHeight / 2, wallZ - stepDepth - 0.1);
      group.add(pillar);
    }
  }

  // Horizontal bands on stair fills (like retaining wall)
  const bandMat = new THREE.MeshBasicMaterial({ color: 0x1c1c24 });
  const bandGeom = new THREE.BoxGeometry(stairTotalWidth, 0.15, 0.15);

  // Left stair bands
  const leftBand1 = new THREE.Mesh(bandGeom, bandMat);
  leftBand1.position.set(-3 - stairTotalWidth / 2, 3, wallZ - stepDepth - 0.1);
  group.add(leftBand1);

  const leftBand2 = new THREE.Mesh(bandGeom, bandMat);
  leftBand2.position.set(-3 - stairTotalWidth / 2, 6, wallZ - stepDepth - 0.1);
  group.add(leftBand2);

  // Right stair bands
  const rightBand1 = new THREE.Mesh(bandGeom, bandMat);
  rightBand1.position.set(3 + stairTotalWidth / 2, 3, wallZ - stepDepth - 0.1);
  group.add(rightBand1);

  const rightBand2 = new THREE.Mesh(bandGeom, bandMat);
  rightBand2.position.set(3 + stairTotalWidth / 2, 6, wallZ - stepDepth - 0.1);
  group.add(rightBand2);

  scene.add(group);
  return group;
}

// ============================================
// Utility Poles & Power Lines
// ============================================

/**
 * Create a single utility pole
 */
function createUtilityPole(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  // Main pole
  const poleGeom = new THREE.CylinderGeometry(0.12, 0.15, 8, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = 4;
  group.add(pole);

  // Cross arm 1 (upper)
  const armGeom = new THREE.BoxGeometry(3, 0.15, 0.15);
  const armMat = new THREE.MeshBasicMaterial({ color: 0x656575 });
  const arm1 = new THREE.Mesh(armGeom, armMat);
  arm1.position.y = 7.5;
  group.add(arm1);

  // Cross arm 2 (lower)
  const arm2 = new THREE.Mesh(armGeom, armMat);
  arm2.position.y = 6.5;
  group.add(arm2);

  // Insulators
  const insGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.3, 6);
  const insMat = new THREE.MeshBasicMaterial({ color: 0x206080 });

  [-1.2, 0, 1.2].forEach(offset => {
    const ins1 = new THREE.Mesh(insGeom, insMat);
    ins1.position.set(offset, 7.7, 0);
    group.add(ins1);

    const ins2 = new THREE.Mesh(insGeom, insMat);
    ins2.position.set(offset, 6.7, 0);
    group.add(ins2);
  });

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

/**
 * Create power line between two poles
 */
function createPowerLine(scene, startX, endX, z, y, sag = 0.5) {
  const points = [];
  const segments = 20;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = startX + (endX - startX) * t;
    // Catenary approximation with sag
    const sagY = sag * Math.sin(Math.PI * t);
    points.push(new THREE.Vector3(x, y - sagY, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.02, 4, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x202020 });
  const wire = new THREE.Mesh(tubeGeom, tubeMat);
  scene.add(wire);
  return wire;
}

/**
 * Create all utility poles and power lines
 */
function createUtilitySystem(scene) {
  const poles = [];
  const wires = [];
  const groundY = 10;
  const z = 28; // House side (near residential district)

  // Pole positions - reduced to half (4 poles)
  const poleXPositions = [-35, -11, 13, 37];

  poleXPositions.forEach(x => {
    poles.push(createUtilityPole(scene, x, z, groundY, Math.PI / 2));
  });

  // Power lines between poles
  for (let i = 0; i < poleXPositions.length - 1; i++) {
    // Upper wire
    wires.push(createPowerLine(scene, poleXPositions[i], poleXPositions[i + 1], z, groundY + 7.5, 0.3));
    // Lower wire
    wires.push(createPowerLine(scene, poleXPositions[i], poleXPositions[i + 1], z, groundY + 6.5, 0.4));
  }

  // === Extended poles along slope and flat top ===
  // Slope parameters: x=47.5~92.5, y=10~16
  const slopeStartX = 47.5;
  const slopeEndX = 92.5;
  const slopeStartY = 10;
  const slopeEndY = 16;
  const slopeLength = slopeEndX - slopeStartX;

  // Poles on slope (3 poles)
  const slopePolePositions = [55, 70, 85];
  slopePolePositions.forEach(x => {
    const t = (x - slopeStartX) / slopeLength;
    const y = slopeStartY + t * (slopeEndY - slopeStartY);
    poles.push(createUtilityPole(scene, x, z, y, Math.PI / 2));
  });

  // Poles on flat top (2 poles) - y=16
  const flatPolePositions = [100, 115];
  flatPolePositions.forEach(x => {
    poles.push(createUtilityPole(scene, x, z, slopeEndY, Math.PI / 2));
  });

  // Connect last main pole to first slope pole
  wires.push(createPowerLine(scene, 37, 55, z, groundY + 7.5, 0.3));
  wires.push(createPowerLine(scene, 37, 55, z, groundY + 6.5, 0.4));

  return { poles, wires };
}

export { createZigzagStairs, createUtilityPole, createPowerLine, createUtilitySystem };
