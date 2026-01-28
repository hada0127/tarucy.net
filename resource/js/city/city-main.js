/**
 * city-main.js
 * Hong Kong Citypop Night City - Main Entry Point
 *
 * Camera Controls:
 * - W/S: Move forward/backward (restricted to walkable zones)
 * - A/D, Arrow Left/Right: Rotate left/right
 * - Arrow Up/Down: Look up/down (pitch)
 * - Mobile: Dual analog joysticks (left=move/rotate, right=look/rotate)
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

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
import { initVehicles, updateVehicles, setPedestrianStopChecker } from './city-vehicles.js';

// Pedestrians
import {
  initPedestrians,
  updatePedestrians,
  visualizeWalkableZones,
  walkableZones,
  roadZones,
  obstacleZones,
  stairPaths,
  getZoneY,
  shouldVehicleStop
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
function collidesWithObstacleAt(x, z, y, margin = 1.0) {
  const groundY = y - 1.6; // Convert eye level to ground level
  for (const obs of obstacleZones) {
    if (obs.y !== undefined && Math.abs(groundY - obs.y) > 2) continue;

    // Circular obstacle check
    if (obs.type === 'circle') {
      const dx = x - obs.cx;
      const dz = z - obs.cz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < obs.radius + margin) {
        return true;
      }
    } else {
      // Rectangular obstacle check
      if (x >= obs.xMin - margin && x <= obs.xMax + margin &&
          z >= obs.zMin - margin && z <= obs.zMax + margin) {
        return true;
      }
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
  // Check obstacle collision FIRST (shops, hotel, fountain, buildings)
  if (collidesWithObstacleAt(newX, newZ, newY)) {
    return null;
  }

  // Check stairs (they connect different Y levels)
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

// iOS/모바일 감지
const isIOSorMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

/**
 * Geometry를 position과 color만 남기고 정규화 (non-indexed로 변환)
 * mergeGeometries는 모든 geometry가 같은 attributes를 가져야 함
 * index도 있거나 없거나 통일되어야 함 → 모두 non-indexed로 변환
 */
function normalizeGeometry(geo) {
  // indexed geometry면 non-indexed로 변환
  let workGeo = geo;
  if (geo.index) {
    workGeo = geo.toNonIndexed();
  }

  const position = workGeo.attributes.position;
  const color = workGeo.attributes.color;

  // 새 geometry 생성 (position과 color만, index 없음)
  const newGeo = new THREE.BufferGeometry();
  newGeo.setAttribute('position', position.clone());
  if (color) {
    newGeo.setAttribute('color', color.clone());
  }

  // userData 복사
  newGeo.userData = geo.userData;

  // 임시 geometry 정리
  if (workGeo !== geo) {
    workGeo.dispose();
  }

  return newGeo;
}

/**
 * Scene 최적화 - Vertex Colors를 사용하여 모든 geometry를 하나로 합침
 * Draw call을 5000+ → 10개 미만으로 줄여 iOS Safari 성능 개선
 */
function optimizeScene(scene) {
  const geometriesToMerge = [];
  const texturedGeometries = []; // texture가 있는 geometry는 별도 처리
  const meshesToRemove = [];

  // 1. 모든 mesh 수집 및 vertex color 적용
  scene.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry || !obj.material) return;
    // 동적 객체(차량, 보행자)는 제외 - userData로 표시된 경우
    if (obj.userData && obj.userData.dynamic) return;
    // Group의 noMerge 플래그 확인
    if (obj.parent && obj.parent.isGroup && obj.parent.userData.noMerge) return;

    const mat = obj.material;

    // texture가 있는 material은 별도 처리 (merge하지 않음)
    if (mat.map) {
      texturedGeometries.push({ mesh: obj, material: mat });
      return;
    }

    // geometry를 world 좌표로 변환
    const geo = obj.geometry.clone();
    obj.updateMatrixWorld();
    geo.applyMatrix4(obj.matrixWorld);

    // vertex color 적용
    const color = mat.color ? mat.color.clone() : new THREE.Color(0xffffff);
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // transparent 처리를 위해 opacity 저장
    geo.userData = {
      transparent: mat.transparent || false,
      opacity: mat.opacity !== undefined ? mat.opacity : 1
    };

    // position과 color만 남기도록 정규화
    const normalizedGeo = normalizeGeometry(geo);
    geo.dispose();

    geometriesToMerge.push(normalizedGeo);
    meshesToRemove.push(obj);
  });

  // 2. 기존 mesh 제거
  meshesToRemove.forEach(mesh => {
    if (mesh.parent) mesh.parent.remove(mesh);
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material && !mesh.material.map) mesh.material.dispose();
  });

  // 3. Opaque geometry와 transparent geometry 분리
  const opaqueGeos = geometriesToMerge.filter(g => !g.userData.transparent || g.userData.opacity >= 0.99);
  const transparentGeos = geometriesToMerge.filter(g => g.userData.transparent && g.userData.opacity < 0.99);

  let mergedCount = 0;

  // 4. Opaque geometry 합치기 (단일 mesh)
  if (opaqueGeos.length > 0) {
    try {
      const mergedGeo = mergeGeometries(opaqueGeos, false);
      if (mergedGeo) {
        const mergedMat = new THREE.MeshBasicMaterial({
          vertexColors: true,
          side: THREE.DoubleSide  // world matrix로 인해 뒤집힌 면도 보이도록
        });
        const mergedMesh = new THREE.Mesh(mergedGeo, mergedMat);
        scene.add(mergedMesh);
        mergedCount++;
        console.log('Opaque merge success:', opaqueGeos.length, 'geometries');
      } else {
        console.warn('Opaque merge returned null');
      }
    } catch (e) {
      console.warn('Opaque merge failed:', e);
    }
    opaqueGeos.forEach(geo => geo.dispose());
  }

  // 5. Transparent geometry를 opacity별로 그룹화하여 합치기
  const transparentByOpacity = new Map();
  transparentGeos.forEach(geo => {
    const key = Math.round(geo.userData.opacity * 100);
    if (!transparentByOpacity.has(key)) {
      transparentByOpacity.set(key, []);
    }
    transparentByOpacity.get(key).push(geo);
  });

  transparentByOpacity.forEach((geos, opacityKey) => {
    if (geos.length === 0) return;
    try {
      const mergedGeo = mergeGeometries(geos, false);
      if (mergedGeo) {
        const mergedMat = new THREE.MeshBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: opacityKey / 100,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const mergedMesh = new THREE.Mesh(mergedGeo, mergedMat);
        scene.add(mergedMesh);
        mergedCount++;
        console.log('Transparent merge success for opacity', opacityKey, ':', geos.length, 'geometries');
      }
    } catch (e) {
      console.warn('Transparent merge failed for opacity', opacityKey, ':', e);
    }
    geos.forEach(geo => geo.dispose());
  });

  console.log('Optimization: merged into', mergedCount, 'meshes');
  return mergedCount;
}

/**
 * Create all buildings and structures
 */

function createAllBuildings(scene) {
  let buildings = [];

  if (isIOSorMobile) {
    // iOS/모바일: 경량 모드 - 점진적 추가 테스트
    buildings.push(...createResidentialDistrict(scene));
    buildings.push(...createCenterBuildings(scene));
    createPinkHotel(scene, 0);
    return buildings;
  }

  // 데스크톱: 전체
  buildings.push(...createResidentialDistrict(scene));
  buildings.push(...createSlopedResidentialArea(scene));
  buildings.push(...createLeftBuildings(scene));
  buildings.push(...createRightBuildings(scene));
  buildings.push(...createCenterBuildings(scene));
  buildings.push(...createSouthBuildings(scene));
  buildings = removeOverlappingBuildings(scene, buildings);
  buildings.push(...createShoppingDistrict(scene));

  createForest(scene);
  createHotelBackForestAndMountains(scene);
  createSlopedAreaForest(scene);
  createSlopedAreaEdgeHills(scene);
  createLeftNorthHills(scene);
  createCurveWestForestAndMountains(scene);
  createZigzagStairs(scene);
  createUtilitySystem(scene);
  createVendorStalls(scene);
  createParks(scene);
  createPinkHotel(scene, 0);
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
  camera.position.set(0, 11.6, 18);
  camera.lookAt(0, 5, -20);

  // Add lighting
  createLighting(scene);

  // Create environment
  createGround(scene);
  createRoads(scene);
  createCrosswalks(scene);

  // Create city elements
  createAllBuildings(scene);

  if (!isIOSorMobile) {
    createAllTrees(scene);
    createAllStreetLamps(scene);
  }

  // mesh 수 확인
  let meshCountBefore = 0;
  scene.traverse(obj => { if (obj.isMesh) meshCountBefore++; });

  // Scene 최적화 - vertex colors + geometry merge로 draw call 대폭 감소
  const mergedCount = optimizeScene(scene);

  let meshCountAfter = 0;
  scene.traverse(obj => { if (obj.isMesh) meshCountAfter++; });
  console.log(`Optimization: ${meshCountBefore} meshes → ${meshCountAfter} meshes`);

  // 동적 객체는 최적화 후에 추가 (merge 대상에서 제외됨)
  if (!isIOSorMobile) {
    initVehicles(scene);
    setPedestrianStopChecker(shouldVehicleStop);
    initPedestrians(scene);
  }

  // Visualize walkable zones (debug) - disabled
  // visualizeWalkableZones(scene);

  // Resize handler
  handleResize(camera, renderer);

  // === Keyboard Camera Controls ===
  const keys = {
    w: false, s: false, a: false, d: false,
    ArrowUp: false, ArrowDown: false,
    ArrowLeft: false, ArrowRight: false
  };

  // Joystick analog values (0 to 1 for proportional control)
  const joystickState = {
    moveY: 0,  // -1 (forward) to 1 (backward)
    moveX: 0   // -1 (left) to 1 (right)
  };

  // Right joystick for look/rotate
  const rightJoystickState = {
    lookY: 0,  // -1 (look up) to 1 (look down)
    lookX: 0   // -1 (rotate left) to 1 (rotate right)
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

  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   ('ontouchstart' in window) ||
                   (window.innerWidth <= 768);

  if (!isMobile) {
    // Add control instructions for desktop
    const instructions = document.createElement('div');
    instructions.id = 'camera-instructions';
    instructions.innerHTML = `
      <div style="position: fixed; bottom: 20px; left: 20px; color: white; font-family: monospace; font-size: 14px; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 8px; z-index: 1000;">
        <div style="margin-bottom: 8px; font-weight: bold; color: #ff66aa;">Camera Controls</div>
        <div>W/S - Forward / Backward</div>
        <div>A/D, ←/→ - Rotate</div>
        <div>↑/↓ - Look Up / Down</div>
      </div>
    `;
    document.body.appendChild(instructions);
  } else {
    // Add virtual controller for mobile
    const virtualController = document.createElement('div');
    virtualController.id = 'virtual-controller';
    virtualController.innerHTML = `
      <style>
        .vc-joystick {
          position: fixed;
          bottom: 40px;
          left: 30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 102, 170, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.6);
          z-index: 1000;
          touch-action: none;
        }
        .vc-joystick-knob {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 102, 170, 0.8);
          border: 3px solid rgba(255, 255, 255, 0.9);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: background 0.1s;
        }
        .vc-joystick.active .vc-joystick-knob {
          background: rgba(255, 102, 170, 1);
        }
        .vc-joystick-right {
          position: fixed;
          bottom: 40px;
          right: 30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(128, 200, 255, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.6);
          z-index: 1000;
          touch-action: none;
        }
        .vc-joystick-right .vc-joystick-knob {
          background: rgba(128, 200, 255, 0.8);
          border: 3px solid rgba(255, 255, 255, 0.9);
        }
        .vc-joystick-right.active .vc-joystick-knob {
          background: rgba(128, 200, 255, 1);
        }
      </style>
      <!-- Left side: Analog Joystick for Movement & Rotation -->
      <div class="vc-joystick" id="vc-joystick">
        <div class="vc-joystick-knob" id="vc-knob"></div>
      </div>
      <!-- Right side: Analog Joystick for Look/Rotate -->
      <div class="vc-joystick-right" id="vc-joystick-right">
        <div class="vc-joystick-knob" id="vc-knob-right"></div>
      </div>
    `;
    document.body.appendChild(virtualController);

    // Joystick state
    const joystick = document.getElementById('vc-joystick');
    const knob = document.getElementById('vc-knob');
    const joystickRadius = 60; // Half of joystick size
    const knobMaxDistance = 35; // Max distance knob can move from center
    let joystickActive = false;
    let joystickTouchId = null;

    function updateJoystick(clientX, clientY) {
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + joystickRadius;
      const centerY = rect.top + joystickRadius;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Clamp to max distance
      if (distance > knobMaxDistance) {
        dx = (dx / distance) * knobMaxDistance;
        dy = (dy / distance) * knobMaxDistance;
      }

      // Update knob position
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

      // Calculate normalized values (-1 to 1)
      const normalizedX = dx / knobMaxDistance;
      const normalizedY = dy / knobMaxDistance;

      // Apply deadzone (0.2) and store analog values
      const deadzone = 0.2;

      // Forward/Backward (Y axis: up = forward, so negate)
      if (Math.abs(normalizedY) > deadzone) {
        // Remap from deadzone-1 to 0-1 range
        const sign = normalizedY < 0 ? -1 : 1;
        joystickState.moveY = sign * (Math.abs(normalizedY) - deadzone) / (1 - deadzone);
      } else {
        joystickState.moveY = 0;
      }

      // Rotate Left/Right (X axis)
      if (Math.abs(normalizedX) > deadzone) {
        const sign = normalizedX < 0 ? -1 : 1;
        joystickState.moveX = sign * (Math.abs(normalizedX) - deadzone) / (1 - deadzone);
      } else {
        joystickState.moveX = 0;
      }
    }

    function resetJoystick() {
      knob.style.transform = 'translate(-50%, -50%)';
      joystickState.moveX = 0;
      joystickState.moveY = 0;
      joystickActive = false;
      joystickTouchId = null;
      joystick.classList.remove('active');
    }

    // Touch events for left joystick
    joystick.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (joystickTouchId === null) {
        joystickActive = true;
        joystickTouchId = e.changedTouches[0].identifier;
        joystick.classList.add('active');
        updateJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: false });

    // === Right Joystick (Look/Rotate) ===
    const joystickRight = document.getElementById('vc-joystick-right');
    const knobRight = document.getElementById('vc-knob-right');
    let rightJoystickActive = false;
    let rightJoystickTouchId = null;

    function updateRightJoystick(clientX, clientY) {
      const rect = joystickRight.getBoundingClientRect();
      const centerX = rect.left + joystickRadius;
      const centerY = rect.top + joystickRadius;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Clamp to max distance
      if (distance > knobMaxDistance) {
        dx = (dx / distance) * knobMaxDistance;
        dy = (dy / distance) * knobMaxDistance;
      }

      // Update knob position
      knobRight.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

      // Calculate normalized values (-1 to 1)
      const normalizedX = dx / knobMaxDistance;
      const normalizedY = dy / knobMaxDistance;

      // Apply deadzone (0.2) and store analog values
      const deadzone = 0.2;

      // Look Up/Down (Y axis)
      if (Math.abs(normalizedY) > deadzone) {
        const sign = normalizedY < 0 ? -1 : 1;
        rightJoystickState.lookY = sign * (Math.abs(normalizedY) - deadzone) / (1 - deadzone);
      } else {
        rightJoystickState.lookY = 0;
      }

      // Rotate Left/Right (X axis)
      if (Math.abs(normalizedX) > deadzone) {
        const sign = normalizedX < 0 ? -1 : 1;
        rightJoystickState.lookX = sign * (Math.abs(normalizedX) - deadzone) / (1 - deadzone);
      } else {
        rightJoystickState.lookX = 0;
      }
    }

    function resetRightJoystick() {
      knobRight.style.transform = 'translate(-50%, -50%)';
      rightJoystickState.lookX = 0;
      rightJoystickState.lookY = 0;
      rightJoystickActive = false;
      rightJoystickTouchId = null;
      joystickRight.classList.remove('active');
    }

    // Touch events for right joystick
    joystickRight.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (rightJoystickTouchId === null) {
        rightJoystickActive = true;
        rightJoystickTouchId = e.changedTouches[0].identifier;
        joystickRight.classList.add('active');
        updateRightJoystick(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    }, { passive: false });

    // Combined touch move handler for both joysticks
    window.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
          e.preventDefault();
          updateJoystick(touch.clientX, touch.clientY);
        }
        if (touch.identifier === rightJoystickTouchId) {
          e.preventDefault();
          updateRightJoystick(touch.clientX, touch.clientY);
        }
      }
    }, { passive: false });

    // Combined touch end handler
    window.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
          resetJoystick();
        }
        if (touch.identifier === rightJoystickTouchId) {
          resetRightJoystick();
        }
      }
    });

    window.addEventListener('touchcancel', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId) {
          resetJoystick();
        }
        if (touch.identifier === rightJoystickTouchId) {
          resetRightJoystick();
        }
      }
    });

    // Mouse events for both joysticks (for desktop testing)
    let activeMouseJoystick = null;

    joystick.addEventListener('mousedown', (e) => {
      e.preventDefault();
      joystickActive = true;
      activeMouseJoystick = 'left';
      joystick.classList.add('active');
      updateJoystick(e.clientX, e.clientY);
    });

    joystickRight.addEventListener('mousedown', (e) => {
      e.preventDefault();
      rightJoystickActive = true;
      activeMouseJoystick = 'right';
      joystickRight.classList.add('active');
      updateRightJoystick(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (activeMouseJoystick === 'left') {
        updateJoystick(e.clientX, e.clientY);
      } else if (activeMouseJoystick === 'right') {
        updateRightJoystick(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      if (activeMouseJoystick === 'left') {
        resetJoystick();
      } else if (activeMouseJoystick === 'right') {
        resetRightJoystick();
      }
      activeMouseJoystick = null;
    });
  }

  // Animation state
  let lastTime = 0;

  /**
   * Update camera based on keyboard/joystick input (zone-restricted like pedestrians)
   */
  function updateCameraControls(deltaTime) {
    const baseSpeed = cameraState.speed * deltaTime * 60;
    const rotSpeed = cameraState.rotSpeed;

    // Calculate forward vector based on yaw (horizontal movement only)
    const forward = new THREE.Vector3(
      -Math.sin(cameraState.yaw),
      0,
      -Math.cos(cameraState.yaw)
    );

    // Calculate movement input (keyboard = 1.0, joystick = 0-1 proportional)
    let moveForward = 0;
    let rotateAmount = 0;

    // Keyboard input (full speed)
    if (keys.w) moveForward = 1;
    if (keys.s) moveForward = -1;
    if (keys.a) rotateAmount = 1;
    if (keys.d) rotateAmount = -1;

    // Joystick input (proportional, overrides keyboard if active)
    if (joystickState.moveY !== 0) {
      moveForward = -joystickState.moveY; // Negative because Y up = forward
    }
    if (joystickState.moveX !== 0) {
      rotateAmount = -joystickState.moveX;
    }

    // Apply movement
    const speed = baseSpeed * Math.abs(moveForward);
    let newX = camera.position.x;
    let newZ = camera.position.z;

    if (moveForward !== 0) {
      const dir = moveForward > 0 ? 1 : -1;
      newX += forward.x * speed * dir;
      newZ += forward.z * speed * dir;
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

    // Apply rotation from left joystick/keyboard A/D
    if (rotateAmount !== 0) {
      cameraState.yaw += rotSpeed * rotateAmount;
    }

    // Arrow Left/Right for rotation (keyboard)
    if (keys.ArrowLeft) {
      cameraState.yaw += rotSpeed;
    }
    if (keys.ArrowRight) {
      cameraState.yaw -= rotSpeed;
    }

    // Right joystick X axis for rotation (proportional)
    if (rightJoystickState.lookX !== 0) {
      cameraState.yaw -= rotSpeed * rightJoystickState.lookX;
    }

    // Pitch (Arrow Up/Down) - Look up/down
    let pitchAmount = 0;
    if (keys.ArrowUp) pitchAmount = 1;
    if (keys.ArrowDown) pitchAmount = -1;

    // Right joystick Y axis for pitch (proportional)
    if (rightJoystickState.lookY !== 0) {
      pitchAmount = -rightJoystickState.lookY; // Negative because Y down = look down
    }

    if (pitchAmount !== 0) {
      cameraState.pitch += rotSpeed * pitchAmount;
      // Limit pitch to prevent flipping
      if (cameraState.pitch > Math.PI / 2 - 0.1) cameraState.pitch = Math.PI / 2 - 0.1;
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

    updateCameraControls(deltaTime);
    if (!isIOSorMobile) {
      updateVehicles(scene, deltaTime);
      updatePedestrians(deltaTime, currentTime / 1000);
    }
    renderer.render(scene, camera);
  }

  animate(0);

  return { scene, camera, renderer };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initCity();
    } catch(e) {
      alert('initCity ERROR: ' + e.message);
    }
  });
} else {
  try {
    initCity();
  } catch(e) {
    alert('initCity ERROR: ' + e.message);
  }
}
