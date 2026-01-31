/**
 * City Environment Module
 * Contains functions for creating forests, hills, and mountains
 */

import * as THREE from 'three';

// ============================================
// Sloped Area Forest (behind sloped residential)
// ============================================

/**
 * Create forest behind the sloped residential area
 */
export function createSlopedAreaForest(scene) {
  const treeColors = [0x1a3a2a, 0x2a4a3a, 0x1a4a2a, 0x2a3a2a, 0x1a5a3a];

  // Forest area behind sloped houses: x = 45 to 130, z = 48 to 90
  // Ground height follows the slope (y=10 at x=50, y=16 at x=92+)
  const slopeStartX = 50;
  const slopeEndX = 92;
  const slopeStartY = 10;
  const slopeEndY = 16;

  // Create trees
  for (let x = 45; x < 135; x += 3.5 + Math.random() * 2.5) {
    for (let z = 48; z < 92; z += 3.5 + Math.random() * 2.5) {
      if (Math.random() > 0.12) {
        const offsetX = (Math.random() - 0.5) * 2;
        const offsetZ = (Math.random() - 0.5) * 2;
        const treeX = x + offsetX;
        const treeZ = z + offsetZ;

        // Calculate ground Y based on slope
        let groundY;
        if (treeX < slopeStartX) {
          groundY = slopeStartY;
        } else if (treeX > slopeEndX) {
          groundY = slopeEndY;
        } else {
          const ratio = (treeX - slopeStartX) / (slopeEndX - slopeStartX);
          groundY = slopeStartY + ratio * (slopeEndY - slopeStartY);
        }

        // Tree trunk
        const trunkHeight = 2.5 + Math.random() * 1.5;
        const trunkGeom = new THREE.CylinderGeometry(0.25, 0.4, trunkHeight, 6);
        const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.set(treeX, groundY + trunkHeight / 2, treeZ);
        scene.add(trunk);

        // Tree foliage
        const foliageColor = treeColors[Math.floor(Math.random() * treeColors.length)];
        const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

        // Bottom foliage layer
        const foliage1Geom = new THREE.ConeGeometry(2.5 + Math.random(), 4 + Math.random() * 1.5, 6);
        const foliage1 = new THREE.Mesh(foliage1Geom, foliageMat);
        foliage1.position.set(treeX, groundY + trunkHeight + 1.8, treeZ);
        scene.add(foliage1);

        // Top foliage layer
        const foliage2Geom = new THREE.ConeGeometry(1.8 + Math.random() * 0.5, 3 + Math.random(), 6);
        const foliage2 = new THREE.Mesh(foliage2Geom, foliageMat);
        foliage2.position.set(treeX, groundY + trunkHeight + 4.5 + Math.random() * 0.5, treeZ);
        scene.add(foliage2);
      }
    }
  }
}

/**
 * Create natural hills around the sloped residential area edges
 * Makes the terrain transition look more natural instead of abrupt cutoff
 */
export function createSlopedAreaEdgeHills(scene) {
  const hillColor = 0x2a3a2a;      // Dark green hill base
  const hillColorLight = 0x3a4a3a; // Lighter green
  const hillColorDark = 0x1a2a1a;  // Darker for depth

  // Helper function to create a hill/mound
  function createHill(x, z, baseY, width, height, depth) {
    const group = new THREE.Group();

    // Main hill body (elongated cone)
    const hillGeom = new THREE.ConeGeometry(width, height, 8);
    const hillMat = new THREE.MeshBasicMaterial({ color: hillColor });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(0, height / 2, 0);
    hill.scale.set(1, 1, depth / width); // Stretch in Z direction
    group.add(hill);

    // Secondary smaller mound for natural look
    const mound2Geom = new THREE.ConeGeometry(width * 0.6, height * 0.7, 6);
    const mound2Mat = new THREE.MeshBasicMaterial({ color: hillColorLight });
    const mound2 = new THREE.Mesh(mound2Geom, mound2Mat);
    mound2.position.set(width * 0.4, height * 0.35, depth * 0.2);
    group.add(mound2);

    // Third smaller mound
    const mound3Geom = new THREE.ConeGeometry(width * 0.4, height * 0.5, 6);
    const mound3Mat = new THREE.MeshBasicMaterial({ color: hillColorDark });
    const mound3 = new THREE.Mesh(mound3Geom, mound3Mat);
    mound3.position.set(-width * 0.3, height * 0.25, -depth * 0.15);
    group.add(mound3);

    group.position.set(x, baseY, z);
    scene.add(group);
    return group;
  }

  // Helper function to get ground Y based on slope
  function getGroundY(x) {
    const slopeStartX = 50;
    const slopeEndX = 92;
    const slopeStartY = 10;
    const slopeEndY = 16;

    if (x < slopeStartX) return slopeStartY;
    if (x > slopeEndX) return slopeEndY;
    const ratio = (x - slopeStartX) / (slopeEndX - slopeStartX);
    return slopeStartY + ratio * (slopeEndY - slopeStartY);
  }

  // === Right edge hills (x = 125 ~ 145, beyond flat top) ===
  createHill(128, 35, 16, 8, 12, 10);
  createHill(135, 50, 16, 10, 15, 12);
  createHill(142, 38, 16, 7, 10, 9);
  createHill(130, 60, 16, 9, 14, 11);
  createHill(145, 55, 16, 8, 11, 10);
  createHill(138, 70, 16, 11, 16, 13);

  // === Far back edge hills (z = 85 ~ 100, behind forest) ===
  for (let x = 50; x <= 140; x += 15 + Math.random() * 10) {
    const groundY = getGroundY(x);
    const width = 8 + Math.random() * 6;
    const height = 10 + Math.random() * 10;
    createHill(x, 90 + Math.random() * 10, groundY, width, height, width * 1.2);
  }

  // === Side edge hills (transition from main residential to sloped area, x = 45 ~ 55) ===
  createHill(48, 55, 10, 6, 8, 8);
  createHill(46, 70, 10, 7, 10, 9);
  createHill(44, 85, 10, 8, 12, 10);

  // === Corner hills (far right back corner) ===
  createHill(148, 75, 16, 12, 18, 14);
  createHill(155, 65, 16, 10, 14, 12);
  createHill(152, 85, 16, 14, 20, 16);

  // === Small rolling hills along the right edge of flat top area ===
  for (let z = 30; z <= 75; z += 12 + Math.random() * 8) {
    const width = 5 + Math.random() * 4;
    const height = 6 + Math.random() * 6;
    createHill(125 + Math.random() * 5, z, 16, width, height, width * 0.9);
  }
}

/**
 * Create hills in the left north area (replacing removed buildings)
 * Area: x=-50 to -180, z=0 to 50 (above main road, playground side)
 */
export function createLeftNorthHills(scene) {
  const hillColor = 0x2a3a2a;
  const hillColorLight = 0x3a4a3a;
  const hillColorDark = 0x1a2a1a;
  const groundY = 0;

  // Helper function to create a natural hill
  function createHill(x, z, width, height, depth) {
    const group = new THREE.Group();

    // Main hill body
    const hillGeom = new THREE.ConeGeometry(width, height, 8);
    const hillMat = new THREE.MeshBasicMaterial({ color: hillColor });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(0, height / 2, 0);
    hill.scale.set(1, 1, depth / width);
    group.add(hill);

    // Secondary mound
    const mound2Geom = new THREE.ConeGeometry(width * 0.5, height * 0.6, 6);
    const mound2Mat = new THREE.MeshBasicMaterial({ color: hillColorLight });
    const mound2 = new THREE.Mesh(mound2Geom, mound2Mat);
    mound2.position.set(width * 0.35, height * 0.3, depth * 0.2);
    group.add(mound2);

    // Third smaller mound
    const mound3Geom = new THREE.ConeGeometry(width * 0.35, height * 0.4, 6);
    const mound3Mat = new THREE.MeshBasicMaterial({ color: hillColorDark });
    const mound3 = new THREE.Mesh(mound3Geom, mound3Mat);
    mound3.position.set(-width * 0.25, height * 0.2, -depth * 0.1);
    group.add(mound3);

    group.position.set(x, groundY, z);
    scene.add(group);
    return group;
  }

  // === Edge hills (moved further outside, x=-65 ~ -75) ===
  // Outer hills - moved away from playground
  createHill(-70, 20, 14, 14, 16);   // Tall outer hill
  createHill(-72, 35, 13, 15, 15);   // Tall outer hill
  createHill(-68, 48, 15, 14, 17);   // Tall outer hill near forest
  createHill(-73, 8, 12, 13, 14);    // Tall hill near road end
  createHill(-70, 55, 14, 15, 16);   // Tall hill toward forest
  createHill(-72, 28, 13, 14, 15);   // Additional coverage
  createHill(-68, 42, 12, 14, 14);   // Additional coverage
  createHill(-75, 15, 13, 15, 15);   // Extra back coverage

  // Forest edge hills (x=-55 ~ -65, z=60~90) - cover forest boundary
  createHill(-56, 65, 16, 16, 18);   // Large hill at forest edge
  createHill(-58, 72, 15, 17, 17);   // Large hill at forest edge
  createHill(-55, 78, 17, 16, 19);   // Large hill at forest edge
  createHill(-60, 68, 14, 16, 16);   // Cover forest edge
  createHill(-57, 85, 16, 17, 18);   // Far forest edge
  createHill(-62, 75, 15, 16, 17);   // Far forest edge
  createHill(-54, 70, 14, 15, 16);   // Additional forest coverage
  createHill(-59, 82, 15, 16, 17);   // Additional forest coverage
  // Extra coverage for remaining gaps
  createHill(-53, 75, 15, 16, 17);   // Fill gap
  createHill(-55, 88, 16, 17, 18);   // Far edge
  createHill(-61, 80, 14, 16, 16);   // Fill gap
  createHill(-57, 90, 15, 16, 17);   // Very far edge
  createHill(-63, 70, 13, 15, 15);   // Outer coverage
  createHill(-52, 82, 14, 15, 16);   // Inner far coverage

  // Forest corner coverage (moved further outside)
  createHill(-65, 53, 14, 18, 16);   // Front-left corner of forest
  createHill(-63, 57, 13, 17, 15);   // Front corner inner
  createHill(-68, 50, 12, 17, 14);   // Front corner outer
  createHill(-65, 92, 16, 17, 18);   // Back-left corner of forest
  createHill(-63, 88, 15, 16, 17);   // Back corner inner
  createHill(-69, 95, 17, 18, 19);   // Back corner far
  createHill(-61, 60, 12, 16, 14);   // Front corner close
  createHill(-67, 98, 15, 17, 17);   // Very back corner
  createHill(-63, 50, 13, 17, 15);   // Additional front corner coverage

  // Inner edge hills (moved to x=-60 ~ -65)
  createHill(-62, 22, 10, 11, 12);   // Inner hill
  createHill(-64, 38, 9, 11, 11);    // Inner hill
  createHill(-61, 50, 11, 11, 13);   // Inner hill
  createHill(-65, 12, 9, 11, 11);    // Inner hill
  createHill(-62, 60, 12, 12, 14);   // Inner hill near forest
  createHill(-64, 68, 11, 12, 13);   // Inner hill at forest edge

  // === Middle hill cluster (x=-90 to -130) ===
  createHill(-95, 10, 11, 16, 13);
  createHill(-105, 25, 9, 12, 11);
  createHill(-98, 40, 10, 14, 12);
  createHill(-115, 8, 8, 11, 10);
  createHill(-110, 35, 12, 18, 14);
  createHill(-125, 18, 9, 13, 11);
  createHill(-120, 42, 8, 10, 9);
  createHill(-108, 50, 7, 9, 8);

  // === Far hill cluster (x=-130 to -180) ===
  createHill(-135, 12, 10, 15, 12);
  createHill(-145, 28, 11, 17, 13);
  createHill(-140, 45, 9, 12, 11);
  createHill(-155, 8, 8, 11, 10);
  createHill(-150, 35, 12, 19, 15);
  createHill(-165, 20, 10, 14, 12);
  createHill(-160, 48, 8, 10, 9);
  createHill(-175, 15, 9, 13, 11);
  createHill(-170, 38, 11, 16, 13);
  createHill(-180, 25, 8, 11, 10);
  createHill(-178, 50, 7, 9, 8);

  // === Larger backdrop hills (further back, z=55 to 70) ===
  createHill(-60, 60, 14, 22, 16);
  createHill(-90, 65, 16, 25, 18);
  createHill(-120, 58, 13, 20, 15);
  createHill(-150, 62, 15, 23, 17);
  createHill(-180, 60, 12, 18, 14);
}

// ============================================
// Curved Road West Forest and Mountains
// ============================================

/**
 * Create forest and mountains west of the curved road to fill empty space
 */
export function createCurveWestForestAndMountains(scene) {
  const groundY = 0;
  const treeColors = [0x1a3a2a, 0x2a4a3a, 0x1a4a2a, 0x2a3a2a, 0x1a5a3a];
  const hillColor = 0x2a3a2a;
  const hillColorLight = 0x3a4a3a;

  // === Dense Forest Trees (between curve and mountains) ===
  // Area: x = -65 to -180, z = -95 to 5 (extended south to building boundary)
  for (let x = -65; x > -180; x -= 4 + Math.random() * 3) {
    for (let z = -95; z < 5; z += 4 + Math.random() * 3) {
      // Skip area too close to south road (x = -60 to -50)
      if (x > -65 && x < -45 && z > -45 && z < -30) continue;
      // Skip area around building at x=-68, z=-80 (width 11, depth 9)
      if (x > -78 && x < -58 && z > -90 && z < -70) continue;
      // Skip area around building at x=-35, z=-48
      if (x > -45 && x < -25 && z > -58 && z < -38) continue;
      // Skip area around building at x=-35, z=-70
      if (x > -45 && x < -25 && z > -80 && z < -60) continue;

      if (Math.random() > 0.12) {
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetZ = (Math.random() - 0.5) * 3;

        // Tree trunk
        const trunkHeight = 3 + Math.random() * 2;
        const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 6);
        const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.set(x + offsetX, groundY + trunkHeight / 2, z + offsetZ);
        scene.add(trunk);

        // Tree foliage
        const foliageColor = treeColors[Math.floor(Math.random() * treeColors.length)];
        const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

        // Bottom foliage layer
        const foliage1Geom = new THREE.ConeGeometry(2.5 + Math.random(), 4 + Math.random() * 2, 6);
        const foliage1 = new THREE.Mesh(foliage1Geom, foliageMat);
        foliage1.position.set(x + offsetX, groundY + trunkHeight + 2, z + offsetZ);
        scene.add(foliage1);

        // Top foliage layer
        const foliage2Geom = new THREE.ConeGeometry(1.5 + Math.random(), 3 + Math.random(), 6);
        const foliage2 = new THREE.Mesh(foliage2Geom, foliageMat);
        foliage2.position.set(x + offsetX, groundY + trunkHeight + 4.5 + Math.random(), z + offsetZ);
        scene.add(foliage2);
      }
    }
  }

  // === Helper function for creating hills ===
  function createHill(x, z, width, height, depth) {
    const group = new THREE.Group();

    const hillGeom = new THREE.ConeGeometry(width, height, 8);
    const hillMat = new THREE.MeshBasicMaterial({ color: hillColor });
    const hill = new THREE.Mesh(hillGeom, hillMat);
    hill.position.set(0, height / 2, 0);
    hill.scale.set(1, 1, depth / width);
    group.add(hill);

    // Secondary mound
    const mound2Geom = new THREE.ConeGeometry(width * 0.5, height * 0.6, 6);
    const mound2Mat = new THREE.MeshBasicMaterial({ color: hillColorLight });
    const mound2 = new THREE.Mesh(mound2Geom, mound2Mat);
    mound2.position.set(width * 0.35, height * 0.3, depth * 0.2);
    group.add(mound2);

    group.position.set(x, groundY, z);
    scene.add(group);
    return group;
  }

  // === Outer mountains (far west, x = -180 to -230) ===
  // Far south section (z = -70 to -95)
  createHill(-185, -75, 20, 30, 22);
  createHill(-200, -85, 22, 34, 24);
  createHill(-215, -70, 18, 28, 20);
  createHill(-190, -90, 19, 29, 21);
  createHill(-210, -80, 21, 32, 23);
  createHill(-225, -75, 20, 30, 22);
  createHill(-195, -65, 17, 26, 19);
  createHill(-220, -90, 23, 36, 25);

  // South section (z = -35 to -65)
  createHill(-185, -35, 18, 28, 20);
  createHill(-200, -25, 20, 32, 22);
  createHill(-215, -40, 22, 35, 24);
  createHill(-190, -50, 16, 25, 18);
  createHill(-210, -55, 18, 28, 20);
  createHill(-225, -30, 20, 30, 22);
  createHill(-195, -60, 17, 26, 19);
  createHill(-205, -45, 19, 29, 21);
  createHill(-220, -65, 21, 32, 23);

  // Middle section
  createHill(-185, -10, 17, 26, 19);
  createHill(-200, 0, 19, 30, 21);
  createHill(-215, -15, 21, 33, 23);
  createHill(-195, -20, 15, 24, 17);
  createHill(-220, 5, 18, 28, 20);
  createHill(-230, -20, 22, 36, 24);

  // North section
  createHill(-185, 15, 16, 25, 18);
  createHill(-200, 25, 18, 28, 20);
  createHill(-210, 10, 20, 32, 22);
  createHill(-220, 30, 17, 26, 19);
  createHill(-195, 35, 15, 23, 17);
  createHill(-230, 15, 19, 30, 21);

  // === Medium hills (transition zone, x = -160 to -185) ===
  // Extended south
  createHill(-165, -70, 15, 22, 17);
  createHill(-175, -80, 16, 24, 18);
  createHill(-160, -60, 14, 20, 16);
  createHill(-180, -75, 17, 25, 19);
  createHill(-170, -85, 15, 22, 17);
  createHill(-165, -55, 13, 19, 15);
  createHill(-175, -65, 14, 21, 16);
  createHill(-180, -90, 16, 24, 18);

  // Original middle zone
  createHill(-165, -30, 14, 20, 16);
  createHill(-175, -45, 15, 22, 17);
  createHill(-160, -20, 13, 18, 15);
  createHill(-180, -35, 16, 24, 18);
  createHill(-170, -10, 14, 20, 16);
  createHill(-165, 0, 12, 17, 14);
  createHill(-175, 10, 15, 22, 17);
  createHill(-180, -5, 13, 19, 15);

  // === Fill gaps near curve (x = -65 to -120) ===
  // Extended south coverage - avoiding building at x=-68, z=-80
  createHill(-70, -50, 11, 16, 13);
  createHill(-82, -60, 12, 18, 14);
  createHill(-90, -55, 13, 19, 15);
  // Moved away from building at -68, -80
  createHill(-85, -70, 11, 16, 13);
  createHill(-88, -78, 12, 17, 14);
  createHill(-95, -65, 14, 20, 16);
  // Removed hill at -70, -80 (overlaps building)
  createHill(-82, -88, 11, 16, 13);
  createHill(-92, -82, 12, 17, 14);

  // More south coverage (x = -100 to -150)
  createHill(-105, -70, 13, 19, 15);
  createHill(-115, -80, 14, 20, 16);
  createHill(-125, -75, 15, 22, 17);
  createHill(-135, -85, 14, 20, 16);
  createHill(-145, -70, 13, 19, 15);
  createHill(-110, -90, 12, 18, 14);
  createHill(-120, -65, 13, 19, 15);
  createHill(-130, -90, 14, 21, 16);
  createHill(-140, -80, 15, 22, 17);
  createHill(-150, -85, 14, 20, 16);

  // Original near curve
  createHill(-70, -25, 10, 14, 12);
  createHill(-80, -30, 11, 16, 13);
  createHill(-85, -20, 9, 13, 11);
  createHill(-75, -15, 10, 15, 12);
  createHill(-90, -25, 12, 17, 14);
  createHill(-68, -35, 8, 12, 10);
  createHill(-95, -40, 11, 16, 13);
  createHill(-100, -35, 12, 17, 14);
  createHill(-110, -45, 13, 18, 15);
  createHill(-120, -40, 12, 17, 14);
}

// ============================================
// Hotel Back Forest and Mountains
// ============================================

/**
 * Create large forest and mountains behind the hotel
 * 최적화: 카메라에서 안 보이는 나무/언덕 대폭 제거
 */
export function createHotelBackForestAndMountains(scene) {
  const groundY = 0;

  // === 숲 나무 - 도로 근처만 남김 (x = 85 ~ 130, 밀도 낮춤) ===
  const treeColors = [0x1a3a2a, 0x2a4a3a, 0x1a4a2a, 0x2a3a2a, 0x1a5a3a];

  // 도로 양쪽에만 나무 배치 (z = -35 ~ -28, z = -12 ~ 10)
  for (let x = 85; x < 130; x += 6 + Math.random() * 4) {
    for (let z = -35; z < 10; z += 6 + Math.random() * 4) {
      // 도로 위는 스킵 (z = -28 to -12)
      if (z > -28 && z < -12) continue;

      if (Math.random() > 0.3) { // 70%만 생성 (밀도 감소)
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetZ = (Math.random() - 0.5) * 3;

        // Tree trunk
        const trunkHeight = 3 + Math.random() * 2;
        const trunkGeom = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 6);
        const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.set(x + offsetX, groundY + trunkHeight / 2, z + offsetZ);
        scene.add(trunk);

        // Tree foliage
        const foliageColor = treeColors[Math.floor(Math.random() * treeColors.length)];
        const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

        // Bottom foliage layer
        const foliage1Geom = new THREE.ConeGeometry(3 + Math.random(), 5 + Math.random() * 2, 6);
        const foliage1 = new THREE.Mesh(foliage1Geom, foliageMat);
        foliage1.position.set(x + offsetX, groundY + trunkHeight + 2, z + offsetZ);
        scene.add(foliage1);

        // Top foliage layer
        const foliage2Geom = new THREE.ConeGeometry(2 + Math.random(), 4 + Math.random(), 6);
        const foliage2 = new THREE.Mesh(foliage2Geom, foliageMat);
        foliage2.position.set(x + offsetX, groundY + trunkHeight + 5 + Math.random(), z + offsetZ);
        scene.add(foliage2);
      }
    }
  }

  // === Triangle mountain with arch tunnel (ExtrudeGeometry) ===
  const tunnelX = 230;
  const tunnelZ = -20;
  const tunnelRadius = 5;
  const mtnWidth = 25;   // Half-width of triangle base (z-axis)
  const mtnDepth = 40;   // Depth/length of mountain (x-axis)
  const mtnHeight = 35;
  const tunnelMtnColor = 0x1a4a2a;

  // Entrance position
  const entranceX = tunnelX;

  // Create triangular mountain profile with tunnel hole
  const mtnShape = new THREE.Shape();
  mtnShape.moveTo(-mtnWidth, 0);        // Bottom-left
  mtnShape.lineTo(0, mtnHeight);        // Peak
  mtnShape.lineTo(mtnWidth, 0);         // Bottom-right
  mtnShape.closePath();

  // Add tunnel hole (semi-circle at bottom)
  const hole = new THREE.Path();
  hole.absarc(0, 0, tunnelRadius, 0, Math.PI, false);
  mtnShape.holes.push(hole);

  // Extrude the shape
  const mtnGeom = new THREE.ExtrudeGeometry(mtnShape, {
    steps: 1,
    depth: mtnDepth,
    bevelEnabled: false
  });
  const mtnMat = new THREE.MeshBasicMaterial({ color: tunnelMtnColor, side: THREE.DoubleSide });
  const mtn = new THREE.Mesh(mtnGeom, mtnMat);
  mtn.rotation.y = -Math.PI / 2;
  mtn.position.set(entranceX, 0, tunnelZ);
  scene.add(mtn);

  // Tunnel interior (dark semi-cylinder)
  const intShape = new THREE.Shape();
  intShape.absarc(0, 0, tunnelRadius - 0.1, 0, Math.PI, false);
  intShape.closePath();
  const intGeom = new THREE.ExtrudeGeometry(intShape, {
    steps: 1,
    depth: mtnDepth,
    bevelEnabled: false
  });
  const intMat = new THREE.MeshBasicMaterial({ color: 0x080810, side: THREE.BackSide });
  const tunnelInt = new THREE.Mesh(intGeom, intMat);
  tunnelInt.rotation.y = -Math.PI / 2;
  tunnelInt.position.set(entranceX, 0, tunnelZ);
  scene.add(tunnelInt);

  // Stone arch frame at tunnel entrance (extends into tunnel)
  const archStartX = 190;
  const archLength = 15; // Length extending into tunnel
  const archMat = new THREE.MeshBasicMaterial({ color: 0x3a3a42 }); // Dark gray
  const archRadius = tunnelRadius + 0.15;
  const frameSegments = 24;

  // Create arch that extends into tunnel
  for (let layer = 0; layer < 3; layer++) {
    const layerX = archStartX + layer * (archLength / 2);
    for (let i = 0; i <= frameSegments; i++) {
      const ang = (i / frameSegments) * Math.PI;
      const fz = Math.cos(ang) * archRadius;
      const fy = Math.sin(ang) * archRadius;
      const frameGeom = new THREE.BoxGeometry(archLength / 2 + 1, 0.55, 0.55);
      const frame = new THREE.Mesh(frameGeom, archMat);
      frame.position.set(layerX, fy, tunnelZ + fz);
      scene.add(frame);
    }
  }

  // === Mountains surrounding all forest areas ===
  const mountainColors = [0x2a3a4a, 0x3a4a5a, 0x4a5a6a, 0x3a4a55];

  // Helper function to create a mountain
  function createMountain(x, z, width, height) {
    const color = mountainColors[Math.floor(Math.random() * mountainColors.length)];
    const mountainMat = new THREE.MeshBasicMaterial({ color: color });

    const mountainGeom = new THREE.ConeGeometry(width / 2, height, 6);
    const mountain = new THREE.Mesh(mountainGeom, mountainMat);
    mountain.position.set(x, groundY + height / 2, z);
    scene.add(mountain);

    // Snow cap on taller mountains
    if (height > 50) {
      const snowCapGeom = new THREE.ConeGeometry(width / 6, height / 5, 6);
      const snowCapMat = new THREE.MeshBasicMaterial({ color: 0xeeeeff });
      const snowCap = new THREE.Mesh(snowCapGeom, snowCapMat);
      snowCap.position.set(x, groundY + height - height / 10, z);
      scene.add(snowCap);
    }
  }

  // === Hills covering road area between tunnel and back mountains ===
  // Hills placed on the road (z=-20) to fill empty space after tunnel
  createMountain(240, -20, 25, 30);
  createMountain(250, -15, 22, 28);
  createMountain(245, -25, 20, 25);
  createMountain(255, -22, 24, 32);
  createMountain(248, -18, 18, 22);
  createMountain(260, -20, 26, 35);

  // === Mountains at road end to completely cover the road ===
  createMountain(280, -20, 40, 50);
  createMountain(290, -15, 35, 45);
  createMountain(285, -25, 38, 48);
  createMountain(295, -20, 42, 55);
  createMountain(300, -18, 45, 60);

  // === 터널 주변 산 (최소화) ===
  createMountain(265, -35, 30, 40);
  createMountain(270, 10, 35, 45);

  // === Back mountains (behind hotel, +X direction) ===
  createMountain(250, -55, 50, 60);
  createMountain(245, 45, 55, 70);
  createMountain(270, 20, 45, 90);
  createMountain(280, -60, 50, 65);
  createMountain(285, 50, 55, 75);
  createMountain(300, 10, 60, 100);
  createMountain(310, -50, 45, 70);
  createMountain(315, 35, 50, 85);

  // === Right side mountains (behind sloped residential forest, +Z direction) ===
  createMountain(50, 110, 50, 70);
  createMountain(75, 115, 55, 85);
  createMountain(100, 120, 60, 95);
  createMountain(125, 115, 50, 75);
  createMountain(150, 110, 55, 80);
  createMountain(175, 115, 60, 90);
  createMountain(200, 110, 50, 70);

  // Second row (further back)
  createMountain(60, 140, 55, 90);
  createMountain(90, 145, 60, 100);
  createMountain(120, 150, 65, 110);
  createMountain(150, 145, 55, 85);
  createMountain(180, 140, 60, 95);

  // === Back-left mountains (behind original forest, +Z direction at negative X) ===
  createMountain(-50, 110, 55, 75);
  createMountain(-25, 115, 60, 85);
  createMountain(0, 120, 65, 95);
  createMountain(25, 115, 55, 80);

  // Second row
  createMountain(-40, 145, 60, 95);
  createMountain(-10, 150, 65, 105);
  createMountain(20, 145, 55, 90);

  // === 왼쪽 산 (최소화) ===
  createMountain(-110, 50, 55, 75);
  createMountain(-130, 65, 55, 85);

  // === 코너 산 (최소화) ===
  createMountain(210, 60, 55, 75);
  createMountain(-80, 95, 55, 70);

  // === 작은 언덕들 제거됨 (최적화) ===
  // 배경 산만 유지, 작은 언덕 루프 제거
}
