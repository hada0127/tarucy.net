/**
 * city-park.js
 * Hong Kong Citypop Night City - Park System
 *
 * Parks (beside Shopping District):
 * - Left park: Children's Playground (x=-51 ~ -29, z=-2 ~ 14)
 * - Right park: Fountain Park (x=24 ~ 46, z=-2 ~ 14)
 */

import * as THREE from 'three';
import { createStreetLamp } from './city-streetlamp.js';

// ============================================
// Parks (beside Shopping District)
// ============================================

/**
 * Create a park tree (smaller decorative tree)
 */
function createParkTree(scene, x, z, groundY) {
  const group = new THREE.Group();
  const scale = 0.5 + Math.random() * 0.4;

  // Trunk
  const trunkGeom = new THREE.CylinderGeometry(0.1 * scale, 0.15 * scale, 1.5 * scale, 6);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x3a3040 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = 0.75 * scale;
  group.add(trunk);

  // Foliage (round shape)
  const foliageColors = [0x2a4a40, 0x254540, 0x2a5545, 0x224538];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  const foliageGeom = new THREE.SphereGeometry(1.2 * scale, 8, 6);
  const foliageMat = new THREE.MeshBasicMaterial({ color: foliageColor });
  const foliage = new THREE.Mesh(foliageGeom, foliageMat);
  foliage.position.y = 2 * scale;
  group.add(foliage);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a park bench
 */
function createParkBench(scene, x, z, groundY, rotation = 0) {
  const group = new THREE.Group();

  // Seat
  const seatGeom = new THREE.BoxGeometry(1.5, 0.1, 0.5);
  const woodMat = new THREE.MeshBasicMaterial({ color: 0x4a3528 });
  const seat = new THREE.Mesh(seatGeom, woodMat);
  seat.position.y = 0.45;
  group.add(seat);

  // Backrest
  const backGeom = new THREE.BoxGeometry(1.5, 0.5, 0.08);
  const back = new THREE.Mesh(backGeom, woodMat);
  back.position.set(0, 0.7, -0.22);
  back.rotation.x = -0.1;
  group.add(back);

  // Legs
  const legGeom = new THREE.BoxGeometry(0.08, 0.45, 0.4);
  const metalMat = new THREE.MeshBasicMaterial({ color: 0x303038 });
  const leg1 = new THREE.Mesh(legGeom, metalMat);
  leg1.position.set(-0.6, 0.225, 0);
  group.add(leg1);
  const leg2 = new THREE.Mesh(legGeom, metalMat);
  leg2.position.set(0.6, 0.225, 0);
  group.add(leg2);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

/**
 * Create a flower bed
 */
function createFlowerBed(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Bed border
  const borderGeom = new THREE.BoxGeometry(2, 0.2, 2);
  const borderMat = new THREE.MeshBasicMaterial({ color: 0x3a3530 });
  const border = new THREE.Mesh(borderGeom, borderMat);
  border.position.y = 0.1;
  group.add(border);

  // Soil
  const soilGeom = new THREE.BoxGeometry(1.8, 0.15, 1.8);
  const soilMat = new THREE.MeshBasicMaterial({ color: 0x3a3530 });
  const soil = new THREE.Mesh(soilGeom, soilMat);
  soil.position.y = 0.18;
  group.add(soil);

  // Flowers (small colorful spheres)
  const flowerColors = [0xff6090, 0xffff50, 0xff50ff, 0x50ffff, 0xff9050];
  for (let i = 0; i < 8; i++) {
    const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const flowerGeom = new THREE.SphereGeometry(0.12, 6, 4);
    const flowerMat = new THREE.MeshBasicMaterial({ color: flowerColor });
    const flower = new THREE.Mesh(flowerGeom, flowerMat);
    flower.position.set(
      -0.6 + Math.random() * 1.2,
      0.35,
      -0.6 + Math.random() * 1.2
    );
    group.add(flower);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a fountain
 */
function createFountain(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Base pool (circular)
  const poolGeom = new THREE.CylinderGeometry(3, 3.5, 0.5, 24);
  const poolMat = new THREE.MeshBasicMaterial({ color: 0x2a3a4a });
  const pool = new THREE.Mesh(poolGeom, poolMat);
  pool.position.y = 0.25;
  group.add(pool);

  // Water surface
  const waterGeom = new THREE.CircleGeometry(2.8, 24);
  const waterMat = new THREE.MeshBasicMaterial({
    color: 0x3060a0,
    transparent: true,
    opacity: 0.7
  });
  const water = new THREE.Mesh(waterGeom, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.45;
  group.add(water);

  // Center pedestal
  const pedestalGeom = new THREE.CylinderGeometry(0.4, 0.6, 1.5, 12);
  const pedestalMat = new THREE.MeshBasicMaterial({ color: 0x505560 });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
  pedestal.position.y = 1;
  group.add(pedestal);

  // Upper bowl
  const bowlGeom = new THREE.CylinderGeometry(1.2, 0.5, 0.4, 16);
  const bowl = new THREE.Mesh(bowlGeom, pedestalMat);
  bowl.position.y = 1.9;
  group.add(bowl);

  // Water in upper bowl
  const upperWaterGeom = new THREE.CircleGeometry(1, 16);
  const upperWater = new THREE.Mesh(upperWaterGeom, waterMat);
  upperWater.rotation.x = -Math.PI / 2;
  upperWater.position.y = 2.05;
  group.add(upperWater);

  // Water spout (center)
  const spoutGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
  const spoutMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6
  });
  const spout = new THREE.Mesh(spoutGeom, spoutMat);
  spout.position.y = 2.8;
  group.add(spout);

  // Water spray effect (cone)
  const sprayGeom = new THREE.ConeGeometry(0.3, 0.8, 8);
  const sprayMat = new THREE.MeshBasicMaterial({
    color: 0xaaddff,
    transparent: true,
    opacity: 0.4
  });
  const spray = new THREE.Mesh(sprayGeom, sprayMat);
  spray.position.y = 3.8;
  spray.rotation.x = Math.PI; // Upside down
  group.add(spray);

  // Falling water streams (around the bowl)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const streamGeom = new THREE.CylinderGeometry(0.03, 0.05, 1.4, 6);
    const stream = new THREE.Mesh(streamGeom, spoutMat);
    stream.position.set(
      Math.cos(angle) * 0.9,
      1.2,
      Math.sin(angle) * 0.9
    );
    stream.rotation.z = Math.cos(angle) * 0.3;
    stream.rotation.x = Math.sin(angle) * 0.3;
    group.add(stream);
  }

  // Pool edge decoration
  const edgeGeom = new THREE.TorusGeometry(3.2, 0.15, 8, 32);
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x606570 });
  const edge = new THREE.Mesh(edgeGeom, edgeMat);
  edge.rotation.x = Math.PI / 2;
  edge.position.y = 0.5;
  group.add(edge);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a decorative lamp post for parks
 */
function createParkLampPost(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Ornate pole
  const poleGeom = new THREE.CylinderGeometry(0.08, 0.12, 3, 8);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x3a3a45 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = 1.5;
  group.add(pole);

  // Decorative base
  const baseGeom = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8);
  const base = new THREE.Mesh(baseGeom, poleMat);
  base.position.y = 0.15;
  group.add(base);

  // Lamp housing
  const housingGeom = new THREE.SphereGeometry(0.25, 8, 6);
  const housingMat = new THREE.MeshBasicMaterial({ color: 0xffeecc });
  const housing = new THREE.Mesh(housingGeom, housingMat);
  housing.position.y = 3.2;
  group.add(housing);

  // Lamp glow
  const glowGeom = new THREE.SphereGeometry(0.4, 8, 6);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffdd88,
    transparent: true,
    opacity: 0.3,
    depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  glow.position.y = 3.2;
  group.add(glow);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a swing set
 */
function createSwingSet(scene, x, z, groundY) {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const chainMat = new THREE.MeshBasicMaterial({ color: 0x606060 });
  const seatMat = new THREE.MeshBasicMaterial({ color: 0x2244aa });

  // A-frame posts
  const postGeom = new THREE.CylinderGeometry(0.08, 0.1, 3, 6);

  // Left A-frame
  const leftPost1 = new THREE.Mesh(postGeom, frameMat);
  leftPost1.position.set(-1.5, 1.5, -0.4);
  leftPost1.rotation.z = 0.15;
  group.add(leftPost1);

  const leftPost2 = new THREE.Mesh(postGeom, frameMat);
  leftPost2.position.set(-1.5, 1.5, 0.4);
  leftPost2.rotation.z = 0.15;
  group.add(leftPost2);

  // Right A-frame
  const rightPost1 = new THREE.Mesh(postGeom, frameMat);
  rightPost1.position.set(1.5, 1.5, -0.4);
  rightPost1.rotation.z = -0.15;
  group.add(rightPost1);

  const rightPost2 = new THREE.Mesh(postGeom, frameMat);
  rightPost2.position.set(1.5, 1.5, 0.4);
  rightPost2.rotation.z = -0.15;
  group.add(rightPost2);

  // Top bar
  const topBarGeom = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
  const topBar = new THREE.Mesh(topBarGeom, frameMat);
  topBar.rotation.z = Math.PI / 2;
  topBar.position.y = 2.9;
  group.add(topBar);

  // Swings (2)
  for (let i = -1; i <= 1; i += 2) {
    // Chains
    const chainGeom = new THREE.CylinderGeometry(0.02, 0.02, 2, 4);
    const chain1 = new THREE.Mesh(chainGeom, chainMat);
    chain1.position.set(i * 0.6, 1.9, -0.15);
    group.add(chain1);
    const chain2 = new THREE.Mesh(chainGeom, chainMat);
    chain2.position.set(i * 0.6, 1.9, 0.15);
    group.add(chain2);

    // Seat
    const seatGeom = new THREE.BoxGeometry(0.5, 0.05, 0.3);
    const seat = new THREE.Mesh(seatGeom, seatMat);
    seat.position.set(i * 0.6, 0.9, 0);
    group.add(seat);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a seesaw
 */
function createSeesaw(scene, x, z, groundY) {
  const group = new THREE.Group();
  const baseMat = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const plankMat = new THREE.MeshBasicMaterial({ color: 0xdd4444 });
  const handleMat = new THREE.MeshBasicMaterial({ color: 0x444444 });

  // Base/fulcrum
  const baseGeom = new THREE.ConeGeometry(0.3, 0.5, 8);
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 0.25;
  group.add(base);

  // Plank
  const plankGeom = new THREE.BoxGeometry(3, 0.1, 0.4);
  const plank = new THREE.Mesh(plankGeom, plankMat);
  plank.position.y = 0.55;
  plank.rotation.z = 0.1; // Slight tilt
  group.add(plank);

  // Handles
  const handleGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
  const handle1 = new THREE.Mesh(handleGeom, handleMat);
  handle1.position.set(-1.2, 0.75, 0);
  group.add(handle1);
  const handle2 = new THREE.Mesh(handleGeom, handleMat);
  handle2.position.set(1.2, 0.55, 0);
  group.add(handle2);

  // Seats
  const seatGeom = new THREE.BoxGeometry(0.3, 0.05, 0.35);
  const seat1 = new THREE.Mesh(seatGeom, new THREE.MeshBasicMaterial({ color: 0x2255cc }));
  seat1.position.set(-1.2, 0.62, 0);
  group.add(seat1);
  const seat2 = new THREE.Mesh(seatGeom, new THREE.MeshBasicMaterial({ color: 0x22cc55 }));
  seat2.position.set(1.2, 0.48, 0);
  group.add(seat2);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a sandbox
 */
function createSandbox(scene, x, z, groundY) {
  const group = new THREE.Group();

  // Frame
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
  const frameGeom = new THREE.BoxGeometry(3, 0.3, 0.2);

  const frame1 = new THREE.Mesh(frameGeom, frameMat);
  frame1.position.set(0, 0.15, 1.4);
  group.add(frame1);
  const frame2 = new THREE.Mesh(frameGeom, frameMat);
  frame2.position.set(0, 0.15, -1.4);
  group.add(frame2);

  const sideFrameGeom = new THREE.BoxGeometry(0.2, 0.3, 3);
  const frame3 = new THREE.Mesh(sideFrameGeom, frameMat);
  frame3.position.set(1.4, 0.15, 0);
  group.add(frame3);
  const frame4 = new THREE.Mesh(sideFrameGeom, frameMat);
  frame4.position.set(-1.4, 0.15, 0);
  group.add(frame4);

  // Sand
  const sandGeom = new THREE.PlaneGeometry(2.6, 2.6);
  const sandMat = new THREE.MeshBasicMaterial({ color: 0xdec68b });
  const sand = new THREE.Mesh(sandGeom, sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = 0.05;
  group.add(sand);

  // Small bucket and shovel decorations
  const bucketGeom = new THREE.CylinderGeometry(0.1, 0.08, 0.15, 8);
  const bucketMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
  const bucket = new THREE.Mesh(bucketGeom, bucketMat);
  bucket.position.set(0.5, 0.12, 0.3);
  group.add(bucket);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a slide
 */
function createSlide(scene, x, z, groundY) {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x4444aa });
  const slideMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  const ladderMat = new THREE.MeshBasicMaterial({ color: 0x888888 });

  // Platform
  const platformGeom = new THREE.BoxGeometry(1.2, 0.1, 1.2);
  const platform = new THREE.Mesh(platformGeom, frameMat);
  platform.position.set(0, 2, 0);
  group.add(platform);

  // Support posts
  const postGeom = new THREE.CylinderGeometry(0.08, 0.1, 2, 6);
  const positions = [[-0.5, -0.5], [-0.5, 0.5], [0.5, -0.5], [0.5, 0.5]];
  positions.forEach(([px, pz]) => {
    const post = new THREE.Mesh(postGeom, frameMat);
    post.position.set(px, 1, pz);
    group.add(post);
  });

  // Slide chute
  const slideGeom = new THREE.BoxGeometry(0.8, 0.05, 2.5);
  const slide = new THREE.Mesh(slideGeom, slideMat);
  slide.position.set(0, 1.1, -1.8);
  slide.rotation.x = 0.4;
  group.add(slide);

  // Slide sides
  const sideGeom = new THREE.BoxGeometry(0.05, 0.2, 2.5);
  const side1 = new THREE.Mesh(sideGeom, slideMat);
  side1.position.set(-0.4, 1.2, -1.8);
  side1.rotation.x = 0.4;
  group.add(side1);
  const side2 = new THREE.Mesh(sideGeom, slideMat);
  side2.position.set(0.4, 1.2, -1.8);
  side2.rotation.x = 0.4;
  group.add(side2);

  // Ladder
  const ladderPostGeom = new THREE.CylinderGeometry(0.04, 0.04, 2, 6);
  const ladderPost1 = new THREE.Mesh(ladderPostGeom, ladderMat);
  ladderPost1.position.set(-0.25, 1, 0.8);
  ladderPost1.rotation.x = -0.2;
  group.add(ladderPost1);
  const ladderPost2 = new THREE.Mesh(ladderPostGeom, ladderMat);
  ladderPost2.position.set(0.25, 1, 0.8);
  ladderPost2.rotation.x = -0.2;
  group.add(ladderPost2);

  // Ladder rungs
  const rungGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6);
  for (let i = 0; i < 5; i++) {
    const rung = new THREE.Mesh(rungGeom, ladderMat);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, 0.4 + i * 0.4, 0.6 + i * 0.15);
    group.add(rung);
  }

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create a spring rider (bouncy animal)
 */
function createSpringRider(scene, x, z, groundY, color = 0xff6600) {
  const group = new THREE.Group();

  // Spring
  const springMat = new THREE.MeshBasicMaterial({ color: 0x666666 });
  const springGeom = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
  const spring = new THREE.Mesh(springGeom, springMat);
  spring.position.y = 0.25;
  group.add(spring);

  // Body (simple animal shape)
  const bodyMat = new THREE.MeshBasicMaterial({ color: color });
  const bodyGeom = new THREE.BoxGeometry(0.6, 0.4, 0.3);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0, 0.7, 0);
  group.add(body);

  // Head
  const headGeom = new THREE.SphereGeometry(0.2, 8, 6);
  const head = new THREE.Mesh(headGeom, bodyMat);
  head.position.set(0.35, 0.85, 0);
  group.add(head);

  // Handles
  const handleMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
  const handleGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
  const handle1 = new THREE.Mesh(handleGeom, handleMat);
  handle1.position.set(0.1, 0.95, -0.2);
  group.add(handle1);
  const handle2 = new THREE.Mesh(handleGeom, handleMat);
  handle2.position.set(0.1, 0.95, 0.2);
  group.add(handle2);

  group.position.set(x, groundY, z);
  scene.add(group);
  return group;
}

/**
 * Create playground fence
 */
function createPlaygroundFence(scene, x, z, groundY, length, rotation = 0) {
  const group = new THREE.Group();
  const fenceMat = new THREE.MeshBasicMaterial({ color: 0x3a5a3a });

  const numPosts = Math.floor(length / 0.8);
  for (let i = 0; i <= numPosts; i++) {
    const postGeom = new THREE.CylinderGeometry(0.04, 0.05, 0.8, 6);
    const post = new THREE.Mesh(postGeom, fenceMat);
    post.position.set(i * 0.8 - length / 2, 0.4, 0);
    group.add(post);
  }

  // Top rail
  const railGeom = new THREE.BoxGeometry(length, 0.06, 0.06);
  const rail = new THREE.Mesh(railGeom, fenceMat);
  rail.position.y = 0.75;
  group.add(rail);

  // Bottom rail
  const rail2 = new THREE.Mesh(railGeom, fenceMat);
  rail2.position.y = 0.3;
  group.add(rail2);

  group.position.set(x, groundY, z);
  group.rotation.y = rotation;
  scene.add(group);
  return group;
}

/**
 * Create parks on both sides of shopping district
 */
export function createParks(scene) {
  const parks = [];
  const groundY = 0;

  // Left park - Children's Playground (x=-51 ~ -29, z=-2 ~ 14)
  // === Playground Equipment ===

  // Swing set
  parks.push(createSwingSet(scene, -45, 3, groundY));

  // Seesaw
  parks.push(createSeesaw(scene, -37, 3, groundY));

  // Sandbox
  parks.push(createSandbox(scene, -45, 10, groundY));

  // Slide
  parks.push(createSlide(scene, -35, 10, groundY));

  // Spring riders (bouncy animals)
  parks.push(createSpringRider(scene, -41, 1, groundY, 0xff6600)); // Orange
  parks.push(createSpringRider(scene, -39, 1, groundY, 0x3a5a3a)); // Green
  parks.push(createSpringRider(scene, -43, 12, groundY, 0x4488ff)); // Blue

  // Fences around playground
  parks.push(createPlaygroundFence(scene, -40, -2, groundY, 20, 0));
  parks.push(createPlaygroundFence(scene, -40, 14, groundY, 20, 0));
  parks.push(createPlaygroundFence(scene, -51, 6, groundY, 16, Math.PI / 2));

  // Benches for parents
  parks.push(createParkBench(scene, -31, 3, groundY, -Math.PI / 2));
  parks.push(createParkBench(scene, -31, 9, groundY, -Math.PI / 2));
  parks.push(createParkBench(scene, -49, 6, groundY, Math.PI / 2));

  // Trees around the playground
  parks.push(createParkTree(scene, -51, 0, groundY));
  parks.push(createParkTree(scene, -51, 12, groundY));
  parks.push(createParkTree(scene, -30, 0, groundY));
  parks.push(createParkTree(scene, -30, 12, groundY));
  parks.push(createParkTree(scene, -40, 14, groundY));

  // Street lamps at corners, facing toward center (-40, 6)
  parks.push(createStreetLamp(scene, -49, 0, groundY, Math.atan2(-6, 9)));      // Bottom-left corner
  parks.push(createStreetLamp(scene, -49, 12, groundY, Math.atan2(6, 9)));      // Top-left corner
  parks.push(createStreetLamp(scene, -31, 0, groundY, Math.atan2(-6, -9)));     // Bottom-right corner
  parks.push(createStreetLamp(scene, -31, 12, groundY, Math.atan2(-6, -9)));     // Top-right corner

  // Right park - Fountain Park (x=24 ~ 46, z=-2 ~ 14)
  // === FOUNTAIN in center ===
  parks.push(createFountain(scene, 35, 6, groundY));

  // === Trees around the park (varied sizes) ===
  parks.push(createParkTree(scene, 25, 0, groundY));
  parks.push(createParkTree(scene, 45, 0, groundY));
  parks.push(createParkTree(scene, 25, 12, groundY));
  parks.push(createParkTree(scene, 45, 12, groundY));
  parks.push(createParkTree(scene, 29, 2, groundY));
  parks.push(createParkTree(scene, 41, 2, groundY));
  parks.push(createParkTree(scene, 29, 10, groundY));
  parks.push(createParkTree(scene, 41, 10, groundY));

  // === Benches facing fountain ===
  parks.push(createParkBench(scene, 30, 6, groundY, Math.PI / 2));
  parks.push(createParkBench(scene, 40, 6, groundY, -Math.PI / 2));
  parks.push(createParkBench(scene, 35, 1, groundY, 0));
  parks.push(createParkBench(scene, 35, 11, groundY, Math.PI));

  // === Flower beds ===
  parks.push(createFlowerBed(scene, 26, 0, groundY));
  parks.push(createFlowerBed(scene, 44, 0, groundY));
  parks.push(createFlowerBed(scene, 26, 12, groundY));
  parks.push(createFlowerBed(scene, 44, 12, groundY));

  // === Street lamps at corners ===
  parks.push(createStreetLamp(scene, 26, 0, groundY, Math.atan2(-6, 9)));
  parks.push(createStreetLamp(scene, 26, 12, groundY, Math.atan2(6, 9)));
  parks.push(createStreetLamp(scene, 44, 0, groundY, Math.atan2(-6, -9)));
  parks.push(createStreetLamp(scene, 44, 12, groundY, Math.atan2(6, -9)));

  return parks;
}
