import * as THREE from 'three';

// ============================================
// Forest behind Residential District
// ============================================

/**
 * Create a forest tree (larger, varied)
 */
function createForestTree(scene, x, z, groundY) {
  const group = new THREE.Group();
  const scale = 1.0 + Math.random() * 1.5;
  const treeType = Math.floor(Math.random() * 3);

  // Trunk
  const trunkHeight = 3 * scale;
  const trunkGeom = new THREE.CylinderGeometry(0.2 * scale, 0.4 * scale, trunkHeight, 6);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3a3040 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = trunkHeight / 2;
  group.add(trunk);

  // Foliage colors (dark forest greens with slight variation)
  const foliageColors = [0x2a4050, 0x254545, 0x2a5045, 0x224040, 0x1f3838];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

  if (treeType === 0) {
    // Cone tree (pine-like)
    const foliageGeom = new THREE.ConeGeometry(2 * scale, 5 * scale, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 2.5 * scale;
    group.add(foliage);
  } else if (treeType === 1) {
    // Layered cone tree
    for (let i = 0; i < 3; i++) {
      const layerScale = 1 - i * 0.25;
      const layerGeom = new THREE.ConeGeometry(2.2 * scale * layerScale, 2 * scale, 6);
      const layer = new THREE.Mesh(layerGeom, foliageMat);
      layer.position.y = trunkHeight + 1 * scale + i * 1.5 * scale;
      group.add(layer);
    }
  } else {
    // Round tree (deciduous-like)
    const foliageGeom = new THREE.SphereGeometry(2.5 * scale, 8, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 2 * scale;
    group.add(foliage);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create forest behind residential district
 */
function createForest(scene) {
  const trees = [];
  const groundY = 10; // Same level as residential road

  // Forest area: z = 50 to 88, x = -60 to 60 (moved up +13)
  const forestMinZ = 50;
  const forestMaxZ = 88;
  const forestMinX = -65;
  const forestMaxX = 65;

  // Dense tree placement
  for (let z = forestMinZ; z < forestMaxZ; z += 3 + Math.random() * 2) {
    for (let x = forestMinX; x < forestMaxX; x += 3 + Math.random() * 2) {
      // Add some randomness to position
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetZ = (Math.random() - 0.5) * 2;

      // Skip some spots for natural look
      if (Math.random() > 0.15) {
        trees.push(createForestTree(scene, x + offsetX, z + offsetZ, groundY));
      }
    }
  }

  return trees;
}

// ============================================
// Street Trees
// ============================================

/**
 * Create a tree
 */
function createTree(scene, x, z, groundY) {
  const group = new THREE.Group();
  const scale = 1.0 + Math.random() * 0.5; // Taller base scale
  const treeType = Math.floor(Math.random() * 3); // 3 types: single cone, layered, round

  // Trunk (taller)
  const trunkHeight = 3 * scale;
  const trunkGeom = new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, trunkHeight, 6);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3a3040 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = trunkHeight / 2;
  group.add(trunk);

  // 3 foliage colors (dark green, teal, olive)
  const foliageColors = [0x1a4035, 0x2a4555, 0x354530];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });

  if (treeType === 0) {
    // Single cone tree (pine-like)
    const foliageGeom = new THREE.ConeGeometry(1.8 * scale, 4.5 * scale, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 2.2 * scale;
    group.add(foliage);
  } else if (treeType === 1) {
    // 2-tier layered tree
    for (let i = 0; i < 2; i++) {
      const layerScale = 1 - i * 0.3;
      const layerGeom = new THREE.ConeGeometry(2 * scale * layerScale, 2.5 * scale, 6);
      const layer = new THREE.Mesh(layerGeom, foliageMat);
      layer.position.y = trunkHeight + 1.2 * scale + i * 2 * scale;
      group.add(layer);
    }
  } else {
    // Round tree (deciduous-like)
    const foliageGeom = new THREE.SphereGeometry(2 * scale, 8, 6);
    const foliage = new THREE.Mesh(foliageGeom, foliageMat);
    foliage.position.y = trunkHeight + 1.8 * scale;
    group.add(foliage);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create all trees
 */
function createAllTrees(scene) {
  const trees = [];

  // Upper sidewalk trees (near main road, y=0) - moved down for wider road
  for (let i = 0; i < 9; i++) {
    trees.push(createTree(scene, -40 + i * 10, -14, 0));
  }

  // Lower sidewalk trees - moved down for wider road
  for (let i = 0; i < 9; i++) {
    trees.push(createTree(scene, -35 + i * 10, -28, 0));
  }

  // South road - left sidewalk trees (x=-62, forest side)
  const southLeftTreeZ = [-50, -75, -100, -125, -150, -175, -200, -225];
  southLeftTreeZ.forEach(z => {
    trees.push(createTree(scene, -62, z, 0));
  });

  // South road - right sidewalk trees (x=-48, building side)
  const southRightTreeZ = [-60, -85, -110, -135, -160, -185, -210, -235];
  southRightTreeZ.forEach(z => {
    trees.push(createTree(scene, -48, z, 0));
  });

  return trees;
}

export { createTree, createAllTrees, createForestTree, createForest };
