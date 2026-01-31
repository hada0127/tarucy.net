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

// Camera scroll animation
import { scrollKeyframes, updateCameraFromScroll, getSectionFromScroll } from './city-camera.js';

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
import { createPinkHotel, addHotelSignText } from './city-hotel.js';

// Shops
import { createShoppingDistrict, createShoppingDistrictBase, addShopSignTexts, createVendorStalls } from './city-shop.js';

// Parks
import { createParks } from './city-park.js';

// Trees
import { createAllTrees, createForest } from './city-tree.js';

// Street lamps
import { createAllStreetLamps } from './city-streetlamp.js';

// Infrastructure (stairs, utility poles)
import { createZigzagStairs, createUtilitySystem } from './city-infrastructure.js';

// Street furniture (benches, bus stops, etc.)
import { createAllFurniture, createAllFurnitureBase, addFurnitureTexts, createVendingMachine, createPhoneBooth } from './city-furniture.js';

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
  preloadAudio,
  playAudio,
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
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// GLB 파일 사용 여부 (true면 GLB 로드, false면 동적 생성)
// false로 접속 후 콘솔에서 exportSceneToGLB() → meshopt 압축 → true로 변경
const USE_GLB = false;
const GLB_PATH = 'https://pub-0c79382ed5a947839fede2eac510554d.r2.dev/city.glb';

/**
 * Scene을 GLB 파일로 내보내기 (개발용)
 * 브라우저 콘솔에서 exportSceneToGLB() 호출
 * 남쪽 빌딩 제외 (카메라 동선에 없음, 메모리 최적화)
 */
function exportSceneToGLB() {
  console.log('Creating GLB export scene (without south buildings)...');

  // GLB 내보내기용 새 scene 생성 (캔버스 텍스처 제외)
  const exportScene = new THREE.Scene();

  // 기본 구조물 생성 (forGLB=true로 텍스트 제외)
  createGround(exportScene);
  createRoads(exportScene);
  createCrosswalks(exportScene);

  // 건물과 가구 생성 (텍스트 없이)
  // 남쪽 빌딩(createSouthBuildings) 제외 - 카메라 동선에 없음
  let buildings = [];
  buildings.push(...createResidentialDistrict(exportScene));
  buildings.push(...createSlopedResidentialArea(exportScene));
  buildings.push(...createLeftBuildings(exportScene));
  buildings.push(...createRightBuildings(exportScene));
  buildings.push(...createCenterBuildings(exportScene));
  // createSouthBuildings 제외됨
  buildings = removeOverlappingBuildings(exportScene, buildings);

  // 상점가 (텍스트 없이)
  createShoppingDistrictBase(exportScene);

  // 환경
  createForest(exportScene);
  createHotelBackForestAndMountains(exportScene);
  createSlopedAreaForest(exportScene);
  createSlopedAreaEdgeHills(exportScene);
  createLeftNorthHills(exportScene);
  createCurveWestForestAndMountains(exportScene);
  createZigzagStairs(exportScene);
  createUtilitySystem(exportScene);
  createVendorStalls(exportScene);
  createParks(exportScene);
  createPinkHotel(exportScene, 0, true); // skipText for GLB

  // 가구 (텍스트 없이)
  createAllFurnitureBase(exportScene);

  // 나무와 가로등
  createAllTrees(exportScene);
  createAllStreetLamps(exportScene);

  // 메시 수 확인
  let meshCount = 0;
  exportScene.traverse(obj => { if (obj.isMesh) meshCount++; });
  console.log(`Export scene meshes: ${meshCount}`);

  // GLB 내보내기
  const exporter = new GLTFExporter();
  console.log('Exporting city.glb...');

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
      console.log('city.glb exported successfully!');
      console.log('다음 단계: gltf-transform optimize city.glb city-opt.glb --compress meshopt');
    },
    (error) => {
      console.error('GLB export failed:', error);
    },
    { binary: true }
  );
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

    // iOS에서는 남쪽 빌딩 창문 제외 (z < -40, 카메라 동선에 없음)
    if (isIOS && worldPos.z < -40) {
      return; // 남쪽 창문은 이퀄라이저 대상에서 제외
    }

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
 * 원본 색상 (city-colors.js):
 * - 핑크: 0xff6090, 0xff5080, 0xe06088, 0xff7098, 0xf05078, 0xe85090
 * - 시안: 0x50d0e0, 0x60c8d8, 0x70e0f0
 *
 * 주의: 흰색(#ffffff)은 창문이 아님! 간판 배경 등에 사용됨
 */
function isWindowLikeColor(r, g, b) {
  // 완전 흰색이나 검정은 제외
  if ((r > 250 && g > 250 && b > 250) || (r < 5 && g < 5 && b < 5)) {
    return false;
  }

  // 핑크/빨강 계열 (실제 색상: #be1e3f, #de1430, #ff1437, #ce1447, #ff1e47, #ff2950)
  // R > 180, G < 80, B: 30~150
  const isPink = r > 180 && g < 80 && b > 30 && b < 150;

  // 시안 계열 (실제 색상: #1e93af, #14a1be)
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


// ============================================================
// LOADING SCREEN SYSTEM
// ============================================================

const loadingMessages = [
  "Laying the foundation",
  "Installing roads",
  "Constructing buildings",
  "Planting trees",
  "Setting up street lamps",
  "Placing furniture",
  "Tuning the speakers",
  "Almost ready"
];

let currentMessageIndex = 0;
let dotCount = 1;
let messageInterval = null;
let dotInterval = null;

/**
 * Start loading animation (cycling messages with animated dots)
 */
function startLoadingAnimation() {
  const messageEl = document.getElementById('loading-message');
  if (!messageEl) return;

  // Cycle dots every 400ms
  dotInterval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;
    const dots = '.'.repeat(dotCount);
    messageEl.textContent = loadingMessages[currentMessageIndex] + dots;
  }, 400);

  // Cycle messages every 2 seconds
  messageInterval = setInterval(() => {
    currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
  }, 2000);
}

/**
 * Stop loading animation
 */
function stopLoadingAnimation() {
  if (dotInterval) {
    clearInterval(dotInterval);
    dotInterval = null;
  }
  if (messageInterval) {
    clearInterval(messageInterval);
    messageInterval = null;
  }
}

/**
 * Show explore button (hide loading message)
 */
function showExploreButton() {
  stopLoadingAnimation();

  const messageEl = document.getElementById('loading-message');
  if (messageEl) {
    messageEl.style.display = 'none';
  }

  const btn = document.getElementById('explore-btn');
  if (btn) {
    btn.style.display = 'inline-block';
  }
}

/**
 * Hide loading overlay with fade-out animation
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.remove();
    }, 1000);
  }
}

/**
 * GLB 파일에서 Scene 로드
 */
function loadSceneFromGLB(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    // meshopt 압축 지원
    loader.setMeshoptDecoder(MeshoptDecoder);
    console.log(`Loading GLB: ${GLB_PATH}`);

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

/**
 * Create all buildings (for dynamic generation or GLB export)
 * @param {boolean} forGLB - If true, use base versions without canvas textures
 */
function createAllBuildings(scene, forGLB = false) {
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

  // 상점가 - GLB용은 텍스트 없이, 그 외는 텍스트 포함
  if (forGLB) {
    createShoppingDistrictBase(scene);
  } else {
    createShoppingDistrict(scene);
  }

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

  // 호텔 - GLB용은 텍스트 없이
  createPinkHotel(scene, 0, forGLB);

  // 가구류 - GLB용은 텍스트 없이, 그 외는 텍스트 포함
  if (forGLB) {
    createAllFurnitureBase(scene);
  } else {
    createAllFurniture(scene);
  }

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

  // Start loading animation
  startLoadingAnimation();

  // Create scene, renderer, camera
  const scene = createScene();
  const renderer = createRenderer(container);
  const camera = createCamera();

  // ============================================================
  // CAMERA MODE SYSTEM
  // ============================================================
  const CameraMode = { SCROLL: 'scroll', WALKING: 'walking', TRANSITIONING: 'transitioning' };
  let currentMode = CameraMode.SCROLL;
  let scrollProgress = 0;
  let lastScrollProgress = 0;

  // Transition state for smooth camera movement when exiting walking mode
  const transitionState = {
    startPos: new THREE.Vector3(),
    startYaw: 0,
    startPitch: 0,
    progress: 0,
    duration: 1.0 // seconds
  };

  // Camera state for yaw/pitch
  const cameraState = {
    yaw: scrollKeyframes[0].yaw,
    pitch: scrollKeyframes[0].pitch,
    speed: 0.375,
    rotSpeed: 0.03
  };

  // Initial camera position from first keyframe
  const firstKeyframe = scrollKeyframes[0];
  camera.position.set(firstKeyframe.pos.x, firstKeyframe.pos.y, firstKeyframe.pos.z);

  // Apply initial rotation
  const initialForward = new THREE.Vector3(
    -Math.sin(cameraState.yaw),
    0,
    -Math.cos(cameraState.yaw)
  );
  camera.lookAt(
    camera.position.x + initialForward.x * 10,
    camera.position.y + Math.sin(cameraState.pitch) * 10,
    camera.position.z + initialForward.z * 10
  );

  // Add lighting
  createLighting(scene);

  // Load GLB and audio in parallel
  let glbLoaded = false;
  let audioLoaded = false;

  const checkAndShowExplore = () => {
    if (glbLoaded && audioLoaded) {
      showExploreButton();
    }
  };

  // Start audio preloading
  preloadAudio().then(() => {
    audioLoaded = true;
    console.log('Audio loaded!');
    checkAndShowExplore();
  }).catch(e => {
    console.error('Audio preload failed:', e);
    audioLoaded = true; // Continue anyway
    checkAndShowExplore();
  });

  if (USE_GLB) {
    // GLB 파일에서 정적 scene 로드
    console.log('Loading city from GLB...');
    try {
      await loadSceneFromGLB(scene);
      console.log('GLB loaded!');

      // GLB 로드 후 동적 텍스트 추가
      addShopSignTexts(scene);
      addFurnitureTexts(scene);
      addHotelSignText(scene);
      console.log('Dynamic texts added!');
      glbLoaded = true;
      checkAndShowExplore();
    } catch (e) {
      console.error('GLB load failed, falling back to dynamic generation:', e);
      // 실패 시 동적 생성으로 폴백
      createGround(scene);
      createRoads(scene);
      createCrosswalks(scene);
      createAllBuildings(scene, false);
      if (!isIOSorMobile) {
        createAllTrees(scene);
        createAllStreetLamps(scene);
      }
      glbLoaded = true;
      checkAndShowExplore();
    }
  } else {
    // 동적 생성 (기존 방식)
    createGround(scene);
    createRoads(scene);
    createCrosswalks(scene);
    createAllBuildings(scene, false);
    if (!isIOSorMobile) {
      createAllTrees(scene);
      createAllStreetLamps(scene);
    }
    glbLoaded = true;
    checkAndShowExplore();
  }

  // mesh 수 확인
  let meshCount = 0;
  scene.traverse(obj => { if (obj.isMesh) meshCount++; });
  console.log(`Total meshes: ${meshCount}`);

  // 창문 발견 및 이퀄라이저 시스템 준비 (GLB/동적 생성 모두 지원)
  discoverWindowsFromGLB(scene);
  calculateWindowYRange();

  // GLB 내보내기 함수를 전역으로 노출 (개발용)
  window.exportSceneToGLB = exportSceneToGLB;
  if (!USE_GLB) {
    console.log('GLB 내보내기: 콘솔에서 exportSceneToGLB() 호출');
    console.log('(캔버스 텍스처 제외, 텍스트는 GLB 로드 후 동적 추가됨)');
  }

  // 오디오 시스템 초기화 (already preloaded)
  initAudio();

  // Set up explore button click handler
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      // Hide loading overlay with fade-out
      hideLoadingOverlay();
      // Start playing music
      playAudio();
    });
  }

  // 동적 객체 추가 (차량, 보행자)
  // 상점가, 자판기, 공중전화의 기본 지오메트리는 이제 GLB에 포함됨
  // 텍스트만 동적으로 추가됨 (addShopSignTexts, addFurnitureTexts)

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

  // 걷기 모드 zone 제한 (Walking 모드에서만 적용)
  let walkingModeZoneRestricted = true;

  // 현재 카메라 상태 출력 함수 (전역으로 노출)
  window.logCameraState = () => {
    const pos = camera.position;
    const yaw = cameraState.yaw;
    const pitch = cameraState.pitch;
    console.log(`Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
    console.log(`Yaw: ${(yaw * 180 / Math.PI).toFixed(3)}, Pitch: ${(pitch * 180 / Math.PI).toFixed(3)}`);
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

  // Key event handlers (only active in Walking mode)
  window.addEventListener('keydown', (e) => {
    // 키보드 컨트롤은 Walking 모드에서만 동작
    if (currentMode !== CameraMode.WALKING) return;

    const key = e.key.toLowerCase();

    if (keys.hasOwnProperty(e.key)) {
      keys[e.key] = true;
      e.preventDefault();
    }
    // Also handle lowercase
    if (keys.hasOwnProperty(key)) {
      keys[key] = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(e.key)) {
      keys[e.key] = false;
    }
    if (keys.hasOwnProperty(key)) {
      keys[key] = false;
    }
  });

  // Hide scroll hint if exists
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    scrollHint.style.display = 'none';
  }

  // ============================================================
  // SCROLL EVENT HANDLER
  // ============================================================
  const progressBar = document.getElementById('progress');
  const walkingModeBtn = document.getElementById('walking-mode-btn');
  const exitWalkingBtn = document.getElementById('exit-walking-btn');
  const controlHints = document.getElementById('control-hints');

  function updateScrollProgress() {
    if (currentMode !== CameraMode.SCROLL) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    // Smooth interpolation
    scrollProgress += (targetProgress - scrollProgress) * 0.15;

    // Update progress bar
    if (progressBar) {
      progressBar.style.width = (scrollProgress * 100) + '%';
    }

    // Show Walking Mode button when near the end (>= 95% of actual scroll)
    if (targetProgress >= 0.95 && walkingModeBtn) {
      walkingModeBtn.classList.add('visible');
    } else if (walkingModeBtn) {
      walkingModeBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  // ============================================================
  // MODE TRANSITION FUNCTIONS
  // ============================================================

  /**
   * Enter Walking Mode from last scroll position
   */
  function enterWalkingMode() {
    if (currentMode === CameraMode.WALKING) return;

    currentMode = CameraMode.WALKING;
    lastScrollProgress = scrollProgress;

    // Hide Walking Mode button, show Exit button and control hints
    if (walkingModeBtn) walkingModeBtn.classList.remove('visible');
    if (exitWalkingBtn) exitWalkingBtn.classList.add('visible');
    if (controlHints) controlHints.classList.add('visible');
    if (progressBar) progressBar.style.opacity = '0';

    // Block scrolling in walking mode
    document.body.style.overflow = 'hidden';

    // Show mobile joysticks (if on mobile)
    if (window.virtualControllerElement) {
      window.virtualControllerElement.classList.add('visible');
    }

    console.log('Entered Walking Mode');
  }

  /**
   * Exit Walking Mode, smoothly transition to scroll position
   */
  function exitWalkingMode() {
    if (currentMode !== CameraMode.WALKING) return;

    // Start transition mode
    currentMode = CameraMode.TRANSITIONING;

    // Store current camera state as transition start
    transitionState.startPos.copy(camera.position);
    transitionState.startYaw = cameraState.yaw;
    transitionState.startPitch = cameraState.pitch;
    transitionState.progress = 0;

    // Reset all keys
    Object.keys(keys).forEach(k => keys[k] = false);
    joystickState.moveX = 0;
    joystickState.moveY = 0;
    rightJoystickState.lookX = 0;
    rightJoystickState.lookY = 0;

    // Hide Exit button, control hints, and mobile joysticks
    if (exitWalkingBtn) exitWalkingBtn.classList.remove('visible');
    if (controlHints) controlHints.classList.remove('visible');
    if (progressBar) progressBar.style.opacity = '1';

    // Keep scrolling blocked during transition (will be restored when transition completes)

    // Hide mobile joysticks
    if (window.virtualControllerElement) {
      window.virtualControllerElement.classList.remove('visible');
    }

    // Return camera to last scroll position (will be animated)
    scrollProgress = lastScrollProgress;

    console.log('Transitioning back to Scroll Mode...');
  }

  // Button event listeners
  if (walkingModeBtn) {
    walkingModeBtn.addEventListener('click', enterWalkingMode);
  }
  if (exitWalkingBtn) {
    exitWalkingBtn.addEventListener('click', exitWalkingMode);
  }

  // ============================================================
  // GAMEPAD SUPPORT
  // ============================================================
  let gamepadIndex = null;
  let gamepadPollingId = null;

  function startGamepadPolling() {
    if (gamepadPollingId !== null) return;
    gamepadPollingId = setInterval(pollGamepad, 16); // ~60fps
  }

  function stopGamepadPolling() {
    if (gamepadPollingId !== null) {
      clearInterval(gamepadPollingId);
      gamepadPollingId = null;
    }
  }

  function pollGamepad() {
    // Only active in Walking mode
    if (currentMode !== CameraMode.WALKING) return;

    const gamepads = navigator.getGamepads();
    if (!gamepads || gamepadIndex === null) return;

    const gp = gamepads[gamepadIndex];
    if (!gp) return;

    const deadzone = 0.15;

    // Left stick: Move/Rotate
    const leftX = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
    const leftY = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

    joystickState.moveX = leftX;
    joystickState.moveY = leftY;

    // Right stick: Look
    const rightX = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
    const rightY = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;

    rightJoystickState.lookX = rightX;
    rightJoystickState.lookY = rightY;
  }

  window.addEventListener('gamepadconnected', (e) => {
    console.log('Gamepad connected:', e.gamepad.id);
    gamepadIndex = e.gamepad.index;
    startGamepadPolling();
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    console.log('Gamepad disconnected:', e.gamepad.id);
    if (e.gamepad.index === gamepadIndex) {
      gamepadIndex = null;
      stopGamepadPolling();
    }
  });

  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   ('ontouchstart' in window) ||
                   (window.innerWidth <= 768);

  if (isMobile) {
    // Add virtual controller for mobile (hidden by default, shown in Walking mode)
    const virtualController = document.createElement('div');
    virtualController.id = 'virtual-controller';
    virtualController.innerHTML = `
      <style>
        #virtual-controller {
          display: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        #virtual-controller.visible {
          display: block;
          opacity: 1;
        }
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

    // Store reference for mode switching
    window.virtualControllerElement = virtualController;

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

    // Touch events for left joystick (only in Walking mode)
    joystick.addEventListener('touchstart', (e) => {
      if (currentMode !== CameraMode.WALKING) return;
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

    // Touch events for right joystick (only in Walking mode)
    joystickRight.addEventListener('touchstart', (e) => {
      if (currentMode !== CameraMode.WALKING) return;
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

    // Mouse events for both joysticks (for desktop testing, only in Walking mode)
    let activeMouseJoystick = null;

    joystick.addEventListener('mousedown', (e) => {
      if (currentMode !== CameraMode.WALKING) return;
      e.preventDefault();
      joystickActive = true;
      activeMouseJoystick = 'left';
      joystick.classList.add('active');
      updateJoystick(e.clientX, e.clientY);
    });

    joystickRight.addEventListener('mousedown', (e) => {
      if (currentMode !== CameraMode.WALKING) return;
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

  // 마지막 로그 출력 시간 (너무 잦은 출력 방지)
  let lastLogTime = 0;
  const LOG_INTERVAL = 500; // 0.5초마다 출력

  /**
   * Update camera based on keyboard/joystick input (zone-restricted like pedestrians)
   * Only active in Walking mode
   */
  function updateCameraControls(deltaTime) {
    // Only process controls in Walking mode
    if (currentMode !== CameraMode.WALKING) return;

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

    // 위치 이동 여부 추적
    let positionChanged = false;

    // Validate and apply movement
    if (newX !== camera.position.x || newZ !== camera.position.z) {
      if (walkingModeZoneRestricted) {
        // Zone 제한 적용
        const validPos = validateCameraPosition(newX, camera.position.y, newZ, camera.position.y);
        if (validPos) {
          camera.position.x = validPos.x;
          camera.position.z = validPos.z;
          positionChanged = true;
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
            positionChanged = true;
          }
          if (validZ) {
            camera.position.z = validZ.z;
            camera.position.y += (validZ.y - camera.position.y) * 0.3;
            positionChanged = true;
          }
        }
      } else {
        // 자유 이동 모드: zone 제한 없음
        camera.position.x = newX;
        camera.position.z = newZ;
        positionChanged = true;
      }
    }

    // 회전 여부 추적
    let rotationChanged = false;

    // Apply rotation from left joystick/keyboard A/D
    if (rotateAmount !== 0) {
      cameraState.yaw += rotSpeed * rotateAmount;
      rotationChanged = true;
    }

    // Arrow Left/Right for rotation (keyboard)
    if (keys.ArrowLeft) {
      cameraState.yaw += rotSpeed;
      rotationChanged = true;
    }
    if (keys.ArrowRight) {
      cameraState.yaw -= rotSpeed;
      rotationChanged = true;
    }

    // Right joystick X axis for rotation (proportional)
    if (rightJoystickState.lookX !== 0) {
      cameraState.yaw -= rotSpeed * rightJoystickState.lookX;
      rotationChanged = true;
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
      rotationChanged = true;
    }

    // 콘솔에 위치/방향 출력 (이동 또는 회전 시)
    const now = performance.now();
    if ((positionChanged || rotationChanged) && now - lastLogTime > LOG_INTERVAL) {
      const pos = camera.position;
      const yawRad = cameraState.yaw.toFixed(3);
      const pitchRad = cameraState.pitch.toFixed(3);
      console.log(`Pos: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}) | Yaw: ${yawRad} Pitch: ${pitchRad}`);
      lastLogTime = now;
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

    // Camera update based on mode
    if (currentMode === CameraMode.SCROLL) {
      // Scroll mode: update camera from scroll progress
      updateCameraFromScroll(camera, cameraState, scrollProgress);
    } else if (currentMode === CameraMode.TRANSITIONING) {
      // Transitioning mode: smoothly interpolate from walking position to scroll position
      transitionState.progress += deltaTime / transitionState.duration;

      if (transitionState.progress >= 1.0) {
        // Transition complete
        transitionState.progress = 1.0;
        currentMode = CameraMode.SCROLL;
        updateCameraFromScroll(camera, cameraState, scrollProgress);

        // Restore scrolling after transition
        document.body.style.overflow = '';
        console.log('Transition complete, now in Scroll Mode');
      } else {
        // Get target position from scroll
        const targetCameraState = { yaw: 0, pitch: 0 };
        const tempCamera = camera.clone();
        updateCameraFromScroll(tempCamera, targetCameraState, scrollProgress);

        // Smooth easing (ease-out cubic)
        const t = 1 - Math.pow(1 - transitionState.progress, 3);

        // Interpolate position
        camera.position.lerpVectors(transitionState.startPos, tempCamera.position, t);

        // Interpolate yaw and pitch
        cameraState.yaw = transitionState.startYaw + (targetCameraState.yaw - transitionState.startYaw) * t;
        cameraState.pitch = transitionState.startPitch + (targetCameraState.pitch - transitionState.startPitch) * t;

        // Update camera look direction
        const forward = new THREE.Vector3(
          -Math.sin(cameraState.yaw),
          0,
          -Math.cos(cameraState.yaw)
        );
        const lookTarget = new THREE.Vector3(
          camera.position.x + forward.x * 10,
          camera.position.y + Math.sin(cameraState.pitch) * 10,
          camera.position.z + forward.z * 10
        );
        camera.lookAt(lookTarget);
      }
    } else {
      // Walking mode: poll gamepad and update camera controls
      pollGamepad();
      updateCameraControls(deltaTime);
    }

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
