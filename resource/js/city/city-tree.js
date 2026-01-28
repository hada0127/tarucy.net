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
 * Create all trees (reduced to 2/3)
 */
function createAllTrees(scene) {
  const trees = [];

  // Upper sidewalk trees (near main road, y=0) - 6 trees (was 9)
  trees.push(createTree(scene, -40, -14, 0));
  trees.push(createTree(scene, -20, -14, 0));
  trees.push(createTree(scene, 0, -14, 0));
  trees.push(createTree(scene, 20, -14, 0));
  trees.push(createTree(scene, 40, -14, 0));
  trees.push(createTree(scene, 55, -14, 0));

  // Lower sidewalk trees - 6 trees (was 9)
  trees.push(createTree(scene, -35, -28, 0));
  trees.push(createTree(scene, -15, -28, 0));
  trees.push(createTree(scene, 5, -28, 0));
  trees.push(createTree(scene, 25, -28, 0));
  trees.push(createTree(scene, 45, -28, 0));
  trees.push(createTree(scene, 60, -28, 0));

  // South road - left sidewalk trees (x=-62) - 5 trees (was 8)
  trees.push(createTree(scene, -62, -60, 0));
  trees.push(createTree(scene, -62, -100, 0));
  trees.push(createTree(scene, -62, -140, 0));
  trees.push(createTree(scene, -62, -180, 0));
  trees.push(createTree(scene, -62, -220, 0));

  // South road - right sidewalk trees (x=-48) - 5 trees (was 8)
  trees.push(createTree(scene, -48, -70, 0));
  trees.push(createTree(scene, -48, -110, 0));
  trees.push(createTree(scene, -48, -150, 0));
  trees.push(createTree(scene, -48, -190, 0));
  trees.push(createTree(scene, -48, -230, 0));

  return trees;
}

export { createTree, createAllTrees, createForestTree, createForest };
