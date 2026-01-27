/**
 * city-main.js
 * Hong Kong Citypop Night City - Main Entry Point
 *
 * Camera Controls:
 * - W/S: Move forward/backward (restricted to walkable zones)
 * - A/D: Rotate left/right
 * - Arrow Up/Down: Look up/down (pitch)
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
import {
  initPedestrians,
  updatePedestrians,
  visualizeWalkableZones,
  walkableZones,
  roadZones,
  obstacleZones,
  stairPaths,
  getZoneY
} from './city-people.js';

// ============================================================
// CAMERA MOVEMENT VALIDATION (Zone-based like pedestrians)
// ============================================================

/**
 * Check if camera position is inside a walkable zone
 */
function isPositionInWalkableZone(x, y, z) {
  const yTolerance = 3.0; // Larger tolerance for camera (eye level ~1.6m above ground)

  for (const zone of walkableZones) {
    // XZ range check
    if (x < zone.xMin || x > zone.xMax || z < zone.zMin || z > zone.zMax) {
      continue;
    }

    // Y level check
    if (zone.y === 'sloped') {
      const t = Math.max(0, Math.min(1, (x - zone.xMin) / (zone.xMax - zone.xMin)));
      const expectedY = zone.yStart + t * (zone.yEnd - zone.yStart);
      // Camera is at eye level (~1.6m above ground), so check against ground + eye level
      if (Math.abs(y - (expectedY + 1.6)) < yTolerance) {
        return { zone, groundY: expectedY };
      }
    } else {
      if (Math.abs(y - (zone.y + 1.6)) < yTolerance) {
        return { zone, groundY: zone.y };
      }
    }
  }
  return null;
}

/**
 * Check if camera position is on a road
 */
function isPositionOnRoad(x, z) {
  for (const road of roadZones) {
    if (x >= road.xMin && x <= road.xMax && z >= road.zMin && z <= road.zMax) {
      return true;
    }
  }
  return false;
}

/**
 * Check if camera position collides with an obstacle
 */
function collidesWithObstacleAt(x, z, y, margin = 0.5) {
  const groundY = y - 1.6; // Convert eye level to ground level
  for (const obs of obstacleZones) {
    if (obs.y !== undefined && Math.abs(groundY - obs.y) > 2) continue;
    if (x >= obs.xMin - margin && x <= obs.xMax + margin &&
        z >= obs.zMin - margin && z <= obs.zMax + margin) {
      return true;
    }
  }
  return false;
}

/**
 * Check if position is on stairs and get interpolated Y
 */
function getStairY(x, z) {
  for (const stair of stairPaths) {
    // Check if within stair Z range (stair width ~3m)
    if (Math.abs(z - stair.z) > 2) continue;

    // Check if within stair X range
    const xMin = Math.min(stair.xStart, stair.xEnd);
    const xMax = Math.max(stair.xStart, stair.xEnd);
    if (x < xMin || x > xMax) continue;

    // Calculate progress along stair
    const t = (x - stair.xStart) / (stair.xEnd - stair.xStart);
    const groundY = stair.yTop + t * (stair.yBottom - stair.yTop);
    return groundY + 1.6; // Return eye level
  }
  return null;
}

/**
 * Validate and adjust camera position
 * Returns adjusted position if valid, or null if movement should be blocked
 */
function validateCameraPosition(newX, newY, newZ, currentY) {
  // Check stairs first (they connect different Y levels)
  const stairY = getStairY(newX, newZ);
  if (stairY !== null) {
    return { x: newX, y: stairY, z: newZ };
  }

  // Check if in a walkable zone
  const zoneResult = isPositionInWalkableZone(newX, newY, newZ);
  if (zoneResult) {
    // Valid position in a walkable zone
    return { x: newX, y: zoneResult.groundY + 1.6, z: newZ };
  }

  // Check if on road (not allowed)
  if (isPositionOnRoad(newX, newZ)) {
    return null;
  }

  // Check obstacle collision
  if (collidesWithObstacleAt(newX, newZ, newY)) {
    return null;
  }

  // Try to find a valid zone at the current Y level
  // This handles edge cases where camera might be slightly outside zone bounds
  for (const zone of walkableZones) {
    if (zone.y === 'sloped') continue;
    if (Math.abs(currentY - (zone.y + 1.6)) > 2) continue;

    // Allow small overflow if mostly inside
    const overflowTolerance = 1.0;
    if (newX >= zone.xMin - overflowTolerance && newX <= zone.xMax + overflowTolerance &&
        newZ >= zone.zMin - overflowTolerance && newZ <= zone.zMax + overflowTolerance) {
      // Clamp to zone bounds
      const clampedX = Math.max(zone.xMin, Math.min(zone.xMax, newX));
      const clampedZ = Math.max(zone.zMin, Math.min(zone.zMax, newZ));
      return { x: clampedX, y: zone.y + 1.6, z: clampedZ };
    }
  }

  return null;
}

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

  // Initial camera position (stairs top, human eye level ~1.6m above ground)
  // stairsTopPlatform: y=10, center at x=0, z=18
  camera.position.set(0, 11.6, 18);
  camera.lookAt(0, 5, -20);  // Looking toward the city center

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

  // Visualize walkable zones (debug) - disabled
  // visualizeWalkableZones(scene);

  // Resize handler
  handleResize(camera, renderer);

  // === Keyboard Camera Controls ===
  const keys = {
    w: false, s: false, a: false, d: false,
    ArrowUp: false, ArrowDown: false
  };

  // Camera movement state
  const cameraState = {
    yaw: 0,      // Horizontal rotation (radians)
    pitch: 0.2,  // Vertical angle (looking slightly up)
    speed: 0.375, // Movement speed (slow walking pace)
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
      <div>A/D - Rotate</div>
      <div>↑/↓ - Look Up / Down</div>
    </div>
  `;
  document.body.appendChild(instructions);

  // Animation state
  let lastTime = 0;

  /**
   * Update camera based on keyboard input (zone-restricted like pedestrians)
   */
  function updateCameraControls(deltaTime) {
    const speed = cameraState.speed * deltaTime * 60;
    const rotSpeed = cameraState.rotSpeed;

    // Calculate forward vector based on yaw (horizontal movement only)
    const forward = new THREE.Vector3(
      -Math.sin(cameraState.yaw),
      0,
      -Math.cos(cameraState.yaw)
    );

    // Calculate desired new position
    let newX = camera.position.x;
    let newZ = camera.position.z;

    // Movement (WS)
    if (keys.w) {
      newX += forward.x * speed;
      newZ += forward.z * speed;
    }
    if (keys.s) {
      newX -= forward.x * speed;
      newZ -= forward.z * speed;
    }

    // Validate and apply movement
    if (newX !== camera.position.x || newZ !== camera.position.z) {
      const validPos = validateCameraPosition(newX, camera.position.y, newZ, camera.position.y);
      if (validPos) {
        camera.position.x = validPos.x;
        camera.position.z = validPos.z;
        // Smoothly interpolate Y for slopes/stairs
        const yDiff = validPos.y - camera.position.y;
        if (Math.abs(yDiff) > 0.01) {
          camera.position.y += yDiff * 0.3; // Smooth transition
        } else {
          camera.position.y = validPos.y;
        }
      } else {
        // Try moving only in X or Z direction
        const validX = validateCameraPosition(newX, camera.position.y, camera.position.z, camera.position.y);
        const validZ = validateCameraPosition(camera.position.x, camera.position.y, newZ, camera.position.y);

        if (validX) {
          camera.position.x = validX.x;
          camera.position.y += (validX.y - camera.position.y) * 0.3;
        }
        if (validZ) {
          camera.position.z = validZ.z;
          camera.position.y += (validZ.y - camera.position.y) * 0.3;
        }
      }
    }

    // A/D for rotation (yaw)
    if (keys.a) {
      cameraState.yaw += rotSpeed;
    }
    if (keys.d) {
      cameraState.yaw -= rotSpeed;
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
