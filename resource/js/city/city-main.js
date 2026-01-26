/**
 * city-main.js
 * Hong Kong Citypop Night City - Main Entry Point
 *
 * Camera Controls:
 * - W/S: Move forward/backward
 * - A/D: Move left/right
 * - Arrow Up/Down: Look up/down (pitch)
 * - Arrow Left/Right: Rotate camera
 */

import * as THREE from 'three';

// Scene, sky, camera, renderer
import { createScene, createRenderer, createCamera, createLighting, handleResize } from './city-sky.js';

// Ground and roads
import { createGround } from './city-ground.js';
import { createRoads, createCrosswalks } from './city-road.js';

// Environment (hills, mountains, forests)
import {
  createSlopedAreaForest,
  createSlopedAreaEdgeHills,
  createLeftNorthHills,
  createCurveWestForestAndMountains,
  createHotelBackForestAndMountains
} from './city-environment.js';

// Buildings
import {
  createLeftBuildings,
  createRightBuildings,
  createCenterBuildings,
  createSouthBuildings,
  removeOverlappingBuildings
} from './city-building.js';

// Houses
import { createResidentialDistrict, createSlopedResidentialArea } from './city-house.js';

// Hotel
import { createPinkHotel } from './city-hotel.js';

// Shops
import { createShoppingDistrict, createVendorStalls } from './city-shop.js';

// Parks
import { createParks } from './city-park.js';

// Trees
import { createAllTrees, createForest } from './city-tree.js';

// Street lamps
import { createAllStreetLamps } from './city-streetlamp.js';

// Infrastructure (stairs, utility poles)
import { createZigzagStairs, createUtilitySystem } from './city-infrastructure.js';

// Street furniture (benches, bus stops, etc.)
import { createAllFurniture } from './city-furniture.js';

// Vehicles
import { initVehicles, updateVehicles } from './city-vehicles.js';

// Pedestrians
import { initPedestrians, updatePedestrians, visualizeWalkableZones } from './city-people.js';

/**
 * Create all buildings and structures
 */
function createAllBuildings(scene) {
  let buildings = [];

  // Residential district (25 houses)
  buildings.push(...createResidentialDistrict(scene));

  // Sloped residential area on right side
  buildings.push(...createSlopedResidentialArea(scene));

  // High-rise buildings (3 clusters - expanded)
  buildings.push(...createLeftBuildings(scene));
  buildings.push(...createRightBuildings(scene));
  buildings.push(...createCenterBuildings(scene));

  // South side buildings (fill empty area)
  buildings.push(...createSouthBuildings(scene));

  // Remove overlapping buildings (keep larger ones)
  buildings = removeOverlappingBuildings(scene, buildings);

  // Shopping district (16 shops) - added AFTER overlap removal to preserve all shops
  buildings.push(...createShoppingDistrict(scene));

  // Forest behind residential district
  createForest(scene);

  // Large forest and mountains behind hotel
  createHotelBackForestAndMountains(scene);

  // Forest behind sloped residential area
  createSlopedAreaForest(scene);

  // Natural hills around sloped residential area edges
  createSlopedAreaEdgeHills(scene);

  // Hills in left north area (replacing removed buildings above main road)
  createLeftNorthHills(scene);

  // Forest and mountains west of curved road
  createCurveWestForestAndMountains(scene);

  // Stairs
  createZigzagStairs(scene);

  // Utility poles & power lines
  createUtilitySystem(scene);

  // Vendor stalls
  createVendorStalls(scene);

  // Parks beside shopping district
  createParks(scene);

  // Pink hotel
  createPinkHotel(scene, 0);

  // Street furniture (benches, bus stops, trash cans, etc.)
  createAllFurniture(scene);

  return buildings;
}

/**
 * Initialize 3D City
 */
export function initCity() {
  const container = document.getElementById('city-container');
  if (!container) {
    console.error('city-container not found');
    return;
  }

  // Create scene, renderer, camera
  const scene = createScene();
  const renderer = createRenderer(container);
  const camera = createCamera();

  // Initial camera position (overview of the city)
  camera.position.set(0, 50, 80);
  camera.lookAt(0, 0, 0);

  // Add lighting
  createLighting(scene);

  // Create environment
  createGround(scene);
  createRoads(scene);

  // Create crosswalks
  createCrosswalks(scene);

  // Create city elements
  createAllBuildings(scene);
  createAllTrees(scene);
  createAllStreetLamps(scene);

  // Initialize vehicles
  initVehicles(scene);

  // Initialize pedestrians
  initPedestrians(scene);

  // Visualize walkable zones (debug)
  visualizeWalkableZones(scene);

  // Resize handler
  handleResize(camera, renderer);

  // === Keyboard Camera Controls ===
  const keys = {
    w: false, s: false, a: false, d: false,
    ArrowUp: false, ArrowDown: false,
    ArrowLeft: false, ArrowRight: false
  };

  // Camera movement state
  const cameraState = {
    yaw: 0,      // Horizontal rotation (radians)
    pitch: -0.5, // Vertical angle (looking slightly down)
    speed: 1.5,  // Movement speed
    rotSpeed: 0.03 // Rotation speed
  };

  // Key event handlers
  window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
      keys[e.key] = true;
      e.preventDefault();
    }
    // Also handle lowercase
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
      keys[e.key.toLowerCase()] = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
      keys[e.key] = false;
    }
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
      keys[e.key.toLowerCase()] = false;
    }
  });

  // Hide scroll hint if exists
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    scrollHint.style.display = 'none';
  }

  // Add control instructions
  const instructions = document.createElement('div');
  instructions.id = 'camera-instructions';
  instructions.innerHTML = `
    <div style="position: fixed; bottom: 20px; left: 20px; color: white; font-family: monospace; font-size: 14px; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 8px; z-index: 1000;">
      <div style="margin-bottom: 8px; font-weight: bold; color: #ff66aa;">Camera Controls</div>
      <div>W/S - Forward / Backward</div>
      <div>A/D - Left / Right</div>
      <div>↑/↓ - Look Up / Down</div>
      <div>←/→ - Rotate</div>
    </div>
  `;
  document.body.appendChild(instructions);

  // Animation state
  let lastTime = 0;

  /**
   * Update camera based on keyboard input
   */
  function updateCameraControls(deltaTime) {
    const speed = cameraState.speed * deltaTime * 60;
    const rotSpeed = cameraState.rotSpeed;

    // Rotation (Arrow Left/Right)
    if (keys.ArrowLeft) {
      cameraState.yaw += rotSpeed;
    }
    if (keys.ArrowRight) {
      cameraState.yaw -= rotSpeed;
    }

    // Calculate forward and right vectors based on yaw
    const forward = new THREE.Vector3(
      -Math.sin(cameraState.yaw),
      0,
      -Math.cos(cameraState.yaw)
    );
    const right = new THREE.Vector3(
      Math.cos(cameraState.yaw),
      0,
      -Math.sin(cameraState.yaw)
    );

    // Movement (WASD)
    if (keys.w) {
      camera.position.addScaledVector(forward, speed);
    }
    if (keys.s) {
      camera.position.addScaledVector(forward, -speed);
    }
    if (keys.a) {
      camera.position.addScaledVector(right, -speed);
    }
    if (keys.d) {
      camera.position.addScaledVector(right, speed);
    }

    // Pitch (Arrow Up/Down) - Look up/down
    if (keys.ArrowUp) {
      cameraState.pitch += rotSpeed;
      // Limit pitch to prevent flipping
      if (cameraState.pitch > Math.PI / 2 - 0.1) cameraState.pitch = Math.PI / 2 - 0.1;
    }
    if (keys.ArrowDown) {
      cameraState.pitch -= rotSpeed;
      // Limit pitch to prevent flipping
      if (cameraState.pitch < -Math.PI / 2 + 0.1) cameraState.pitch = -Math.PI / 2 + 0.1;
    }

    // Update camera look direction
    const lookTarget = new THREE.Vector3(
      camera.position.x + forward.x * 10,
      camera.position.y + Math.sin(cameraState.pitch) * 10,
      camera.position.z + forward.z * 10
    );
    camera.lookAt(lookTarget);
  }

  /**
   * Animation loop
   */
  function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    // Update camera based on keyboard input
    updateCameraControls(deltaTime);

    // Update vehicles
    updateVehicles(scene, deltaTime);

    // Update pedestrians
    updatePedestrians(deltaTime, currentTime / 1000);

    // Render
    renderer.render(scene, camera);
  }

  animate(0);

  return { scene, camera, renderer };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCity);
} else {
  initCity();
}
