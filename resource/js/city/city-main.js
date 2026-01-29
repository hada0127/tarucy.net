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
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

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

// Audio system for equalizer effect
import {
  initAudio,
  toggleAudio,
  isAudioPlaying,
  updateAudioAnalysis,
  getIntensityForPosition
} from './city-audio.js';

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

// GLB 파일 사용 여부 (true면 GLB 로드, false면 동적 생성)
// false로 접속 후 콘솔에서 exportSceneToGLB() → meshopt 압축 → true로 변경
const USE_GLB = true;
const GLB_PATH = 'https://pub-0c79382ed5a947839fede2eac510554d.r2.dev/city.glb';

/**
 * Scene을 GLB 파일로 내보내기 (개발용)
 * 브라우저 콘솔에서 exportSceneToGLB(scene) 호출
 */
function exportSceneToGLB(scene) {
  console.log('Preparing GLB export...');

  // 모든 캔버스 텍스처 업데이트 강제
  scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach(mat => {
        if (mat.map && mat.map.isCanvasTexture) {
          mat.map.needsUpdate = true;
        }
      });
    }
  });

  // 한 프레임 대기 후 내보내기 (텍스처 렌더링 보장)
  requestAnimationFrame(() => {
    const exporter = new GLTFExporter();

    // 동적 객체 제외한 scene 복사 (부모-자식 transform 보존)
    const exportScene = new THREE.Scene();
    scene.children.forEach(child => {
      // 동적 객체(차량, 보행자)와 조명은 제외
      if (child.userData.dynamic || child.isLight || child.isAmbientLight || child.isDirectionalLight || child.isHemisphereLight) return;
      exportScene.add(child.clone(true)); // deep clone
    });

    console.log('Exporting GLB...');
    exporter.parse(
      exportScene,
      (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'city.glb';
        link.click();
        URL.revokeObjectURL(url);
        console.log('GLB exported successfully!');
      },
      (error) => {
        console.error('GLB export failed:', error);
      },
      { binary: true }
    );
  });
}

// 전역으로 내보내기 함수 노출 (개발용)
window.exportSceneToGLB = null; // initCity에서 설정

// ============================================================
// WINDOW EQUALIZER SYSTEM (Audio-reactive window brightness)
// ============================================================

// 창문 색상 팔레트 (city-colors.js와 동일)
const WINDOW_COLORS = [
  0xff6090, 0xff5080, 0xe06088,  // 핑크/마젠타 계열
  0xff7098, 0xf05078, 0xe85090,
  0x50d0e0, 0x60c8d8, 0x70e0f0   // 시안 계열
];

// 창문 메시 저장소 (독립 material로 변환된)
const windowMeshes = [];

/**
 * GLB에서 창문 메시 발견 및 등록
 * 색상 기반으로 식별 (핑크/시안 계열 밝은 색상)
 */
function discoverWindowsFromGLB(scene) {
  let windowCount = 0;
  let checkedMeshes = 0;
  const foundColors = new Map(); // color -> count

  scene.traverse((obj) => {
    if (!obj.isMesh) return;
    checkedMeshes++;

    // Material 색상 확인
    const material = obj.material;
    if (!material || !material.color) return;

    // 색상을 sRGB로 변환하여 확인 (Three.js 색상 관리 대응)
    const color = material.color;
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    // 디버그: 발견된 색상 기록
    const hexStr = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    foundColors.set(hexStr, (foundColors.get(hexStr) || 0) + 1);

    // 창문 색상 패턴 확인 (핑크/마젠타 또는 시안)
    const isWindowColor = isWindowLikeColor(r, g, b);

    if (!isWindowColor) return;

    // 창문으로 등록
    // 개별 material로 변환 (공유 material에서 독립)
    const originalColor = material.color.clone();

    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map(m => m.clone());
    } else {
      obj.material = obj.material.clone();
    }

    // 원본 색상 저장 (clone된 material에서)
    obj.userData.originalColor = originalColor;
    obj.userData.isWindow = true;

    // world 좌표 저장 (X: 주파수 대역, Y: 이퀄라이저 높이)
    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);
    obj.userData.worldX = worldPos.x;
    obj.userData.worldY = worldPos.y;

    windowMeshes.push(obj);
    windowCount++;
  });

  console.log(`Discovered ${windowCount} window meshes from ${checkedMeshes} total meshes`);
  // 상위 20개 색상 출력
  const topColors = [...foundColors.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([c, n]) => `#${c}(${n})`);
  console.log('Top colors found:', topColors.join(', '));
}

/**
 * 창문과 유사한 색상인지 확인
 * GLB 선형 색상 공간 변환 후 색상:
 * - 핑크/빨강: #be1e3f, #de1430, #ff1437, #ce1447, #ff1e47, #ff2950
 * - 시안: #1e93af, #14a1be, #47bebe
 */
function isWindowLikeColor(r, g, b) {
  // 핑크/빨강 계열 (GLB 변환 후)
  // R > 180, G < 80, B > 30
  const isPink = r > 180 && g < 80 && b > 30 && b < 150;

  // 시안 계열 (GLB 변환 후)
  // R < 100, G > 140, B > 150
  const isCyan = r < 100 && g > 140 && b > 150;

  return isPink || isCyan;
}


// X 구역별 Y 범위 (각 건물 열별 독립 이퀄라이저)
const NUM_X_ZONES = 40; // X축을 40개 구역으로 나눔 (더 세밀한 이퀄라이저)
const xZoneYRanges = []; // 각 구역의 {yMin, yMax}
let globalXMin = Infinity;
let globalXMax = -Infinity;

/**
 * X 구역별 Y 범위 계산 (각 건물 열별 독립 이퀄라이저)
 */
function calculateWindowYRange() {
  // 먼저 전체 X 범위 계산
  for (const mesh of windowMeshes) {
    const x = mesh.userData.worldX || 0;
    if (x < globalXMin) globalXMin = x;
    if (x > globalXMax) globalXMax = x;
  }

  const xRange = globalXMax - globalXMin;
  const zoneWidth = xRange / NUM_X_ZONES;

  // 각 구역 초기화
  for (let i = 0; i < NUM_X_ZONES; i++) {
    xZoneYRanges[i] = { yMin: Infinity, yMax: -Infinity };
  }

  // 각 창문을 구역에 할당하고 Y 범위 계산
  for (const mesh of windowMeshes) {
    const x = mesh.userData.worldX || 0;
    const y = mesh.userData.worldY || 0;

    // X 좌표로 구역 결정
    let zoneIndex = Math.floor((x - globalXMin) / zoneWidth);
    zoneIndex = Math.max(0, Math.min(NUM_X_ZONES - 1, zoneIndex));

    // 해당 구역에 창문 인덱스 저장
    mesh.userData.xZoneIndex = zoneIndex;

    // 구역별 Y 범위 업데이트
    if (y < xZoneYRanges[zoneIndex].yMin) xZoneYRanges[zoneIndex].yMin = y;
    if (y > xZoneYRanges[zoneIndex].yMax) xZoneYRanges[zoneIndex].yMax = y;
  }

  console.log(`X range: ${globalXMin.toFixed(1)} ~ ${globalXMax.toFixed(1)}, ${NUM_X_ZONES} zones`);
}

// 기본으로 켜져있는 아래층 비율 (0~1)
const BASE_THRESHOLD = 0.15;

/**
 * 주파수 데이터에 따라 창문 밝기 업데이트 (이퀄라이저 효과)
 * - X 구역: 주파수 대역 결정 (서쪽=저음, 동쪽=고음)
 * - Y 좌표: 각 구역별 intensity에 따라 아래에서 위로 차오르는 효과
 * - 기본 상태: 아래층 15%는 항상 켜짐
 * - 활성화 시: 원래 밝은 창문 색상
 */
function updateWindowBrightness() {
  if (!isAudioPlaying()) return;

  for (const mesh of windowMeshes) {
    if (!mesh.userData.originalColor) continue;

    const worldX = mesh.userData.worldX || 0;
    const worldY = mesh.userData.worldY || 0;
    const zoneIndex = mesh.userData.xZoneIndex || 0;

    // 해당 구역의 Y 범위
    const zoneYRange = xZoneYRanges[zoneIndex];
    if (!zoneYRange || zoneYRange.yMax <= zoneYRange.yMin) continue;

    const yRange = zoneYRange.yMax - zoneYRange.yMin;

    // 해당 구역 내에서 Y 좌표 정규화 (0~1)
    const normalizedY = (worldY - zoneYRange.yMin) / yRange;

    // X 좌표로 주파수 대역별 intensity 계산
    const intensity = getIntensityForPosition(worldX);

    // 이퀄라이저 효과: 기본 threshold + intensity에 따라 추가
    // 아래층 15%는 항상 켜져 있음
    const threshold = BASE_THRESHOLD + intensity * (1 - BASE_THRESHOLD);

    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!material) continue;

    // 창문이 threshold 아래에 있으면 밝게 (이퀄라이저 활성)
    if (normalizedY <= threshold) {
      // 활성화: 원래 색상의 1.5배 밝기
      const fadeIn = 1.0 - (normalizedY / Math.max(threshold, 0.01));
      const brightness = 1.3 + fadeIn * 0.4; // 1.3 ~ 1.7배

      if (material.color) {
        material.color.copy(mesh.userData.originalColor);
        material.color.multiplyScalar(brightness);
      }

      // MeshStandardMaterial인 경우 emissive로 glow 효과
      if (material.isMeshStandardMaterial) {
        material.emissive.copy(mesh.userData.originalColor);
        material.emissiveIntensity = fadeIn * 0.5;
      }
    } else {
      // 비활성화: 원래 창문 색상의 0.4 밝기
      if (material.color) {
        material.color.copy(mesh.userData.originalColor);
        material.color.multiplyScalar(0.4);
      }

      // emissive 약하게
      if (material.isMeshStandardMaterial) {
        material.emissive.copy(mesh.userData.originalColor);
        material.emissive.multiplyScalar(0.15);
        material.emissiveIntensity = 0.3;
      }
    }
  }
}

/**
 * 오디오 토글 버튼 생성
 */
function createAudioButton() {
  const button = document.createElement('button');
  button.id = 'audio-toggle-btn';
  button.innerHTML = '🎵 Music';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    font-size: 16px;
    font-family: monospace;
    background: rgba(255, 102, 170, 0.8);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.2s ease;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(255, 102, 170, 1)';
    button.style.transform = 'scale(1.05)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = isAudioPlaying() ?
      'rgba(64, 224, 208, 0.8)' : 'rgba(255, 102, 170, 0.8)';
    button.style.transform = 'scale(1)';
  });

  button.addEventListener('click', () => {
    const playing = toggleAudio();
    button.innerHTML = playing ? '🎵 Playing' : '🎵 Music';
    button.style.background = playing ?
      'rgba(64, 224, 208, 0.8)' : 'rgba(255, 102, 170, 0.8)';
  });

  document.body.appendChild(button);
}

/**
 * GLB 파일에서 Scene 로드
 */
function loadSceneFromGLB(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    // meshopt 압축 지원
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      GLB_PATH,
      (gltf) => {
        // scene 전체를 추가 (부모-자식 transform 보존)
        scene.add(gltf.scene);
        console.log('GLB loaded successfully!');
        resolve();
      },
      (progress) => {
        if (progress.total) {
          console.log('Loading GLB:', Math.round(progress.loaded / progress.total * 100) + '%');
        }
      },
      (error) => {
        console.error('GLB load failed:', error);
        reject(error);
      }
    );
  });
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
export async function initCity() {
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

  if (USE_GLB) {
    // GLB 파일에서 정적 scene 로드
    console.log('Loading city from GLB...');
    try {
      await loadSceneFromGLB(scene);
      console.log('GLB loaded!');
    } catch (e) {
      console.error('GLB load failed, falling back to dynamic generation:', e);
      // 실패 시 동적 생성으로 폴백
      createGround(scene);
      createRoads(scene);
      createCrosswalks(scene);
      createAllBuildings(scene);
      if (!isIOSorMobile) {
        createAllTrees(scene);
        createAllStreetLamps(scene);
      }
    }
  } else {
    // 동적 생성 (기존 방식)
    createGround(scene);
    createRoads(scene);
    createCrosswalks(scene);
    createAllBuildings(scene);
    if (!isIOSorMobile) {
      createAllTrees(scene);
      createAllStreetLamps(scene);
    }
  }

  // mesh 수 확인
  let meshCount = 0;
  scene.traverse(obj => { if (obj.isMesh) meshCount++; });
  console.log(`Total meshes: ${meshCount}`);

  // 창문 발견 및 이퀄라이저 시스템 준비 (GLB/동적 생성 모두 지원)
  discoverWindowsFromGLB(scene);
  calculateWindowYRange();

  // GLB 내보내기 함수를 전역으로 노출 (개발용)
  window.exportSceneToGLB = () => exportSceneToGLB(scene);
  if (!USE_GLB) {
    console.log('GLB 내보내기: 콘솔에서 exportSceneToGLB() 호출');
  }

  // 오디오 시스템 초기화 및 버튼 생성
  initAudio();
  createAudioButton();

  // 동적 객체 추가 (GLB에는 포함되지 않음)
  initVehicles(scene);
  setPedestrianStopChecker(shouldVehicleStop);
  initPedestrians(scene);

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
    updateVehicles(scene, deltaTime);
    updatePedestrians(deltaTime, currentTime / 1000);

    // 오디오 분석 및 창문 이퀄라이저 업데이트
    updateAudioAnalysis();
    updateWindowBrightness();

    renderer.render(scene, camera);
  }

  animate(0);

  return { scene, camera, renderer };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCity().catch(e => {
      console.error('initCity ERROR:', e);
      alert('initCity ERROR: ' + e.message);
    });
  });
} else {
  initCity().catch(e => {
    console.error('initCity ERROR:', e);
    alert('initCity ERROR: ' + e.message);
  });
}
