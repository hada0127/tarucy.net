/**
 * city-scene.js
 * 사이버펑크/네온 스타일 밤 도시
 */

import * as THREE from 'three';

/**
 * 바포웨이브/사이버펑크 밤하늘 + 달
 */
function createNightSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // 그라데이션 하늘 (짙은 남색 → 보라)
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#0d0d1a');
  gradient.addColorStop(0.2, '#141428');
  gradient.addColorStop(0.4, '#1a1a35');
  gradient.addColorStop(0.6, '#252040');
  gradient.addColorStop(0.8, '#2d2848');
  gradient.addColorStop(1, '#352850');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  // 큰 달 (분홍/살몬색)
  const moonGradient = ctx.createRadialGradient(256, 200, 0, 256, 200, 70);
  moonGradient.addColorStop(0, '#ffb8a8');
  moonGradient.addColorStop(0.4, '#ff9080');
  moonGradient.addColorStop(0.8, '#e87878');
  moonGradient.addColorStop(1, 'rgba(200, 100, 120, 0)');

  ctx.fillStyle = moonGradient;
  ctx.beginPath();
  ctx.arc(256, 200, 70, 0, Math.PI * 2);
  ctx.fill();

  // 달 glow (분홍색)
  const glowGradient = ctx.createRadialGradient(256, 200, 50, 256, 200, 140);
  glowGradient.addColorStop(0, 'rgba(255, 150, 140, 0.25)');
  glowGradient.addColorStop(0.5, 'rgba(230, 120, 140, 0.1)');
  glowGradient.addColorStop(1, 'rgba(200, 100, 150, 0)');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(256, 200, 140, 0, Math.PI * 2);
  ctx.fill();

  // 별들
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 300;
    const size = Math.random() * 1.5;
    const brightness = 0.3 + Math.random() * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * 씬 생성
 */
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = createNightSky();
  // 사이버펑크 안개 (먼 곳이 어둡게 사라지는 효과)
  scene.fog = new THREE.Fog(0x0a0a18, 60, 180);
  return scene;
}

/**
 * 렌더러
 */
export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);
  return renderer;
}

/**
 * 카메라
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  return camera;
}

/**
 * 조명 (모든 재질이 MeshBasicMaterial이므로 조명 불필요)
 * 함수는 호환성을 위해 유지하되 빈 객체 반환
 */
export function createLighting(scene) {
  // 모든 재질이 MeshBasicMaterial이므로 조명이 필요 없음
  // uniform 제한 초과 방지를 위해 모든 광원 제거
  return {};
}

/**
 * 바닥
 */
export function createGround(scene) {
  // 바닥 (인도 - 어두운 남색 계열) - 확장된 크기
  const groundGeometry = new THREE.PlaneGeometry(400, 400);
  const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a28 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);
}

/**
 * 도로
 */
export function createRoads(scene) {
  function createRoad(x, z, width, length, rotation = 0) {
    // 도로 (어두운 남색)
    const roadGeometry = new THREE.PlaneGeometry(width, length);
    const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x12121e });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = rotation;
    road.position.set(x, 0.01, z);
    scene.add(road);

    // 중앙선 (연한 분홍)
    const lineGeom = new THREE.PlaneGeometry(0.3, length);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xff8888 });
    const centerLine = new THREE.Mesh(lineGeom, lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.rotation.z = rotation;
    centerLine.position.set(x, 0.02, z);
    scene.add(centerLine);

    // 도로 가장자리 (연한 핑크)
    const edgeGeom = new THREE.PlaneGeometry(0.2, length);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xddaaaa });

    const leftEdge = new THREE.Mesh(edgeGeom, edgeMat);
    leftEdge.rotation.x = -Math.PI / 2;
    leftEdge.rotation.z = rotation;
    if (rotation === 0) {
      leftEdge.position.set(x - width/2 + 0.3, 0.02, z);
    } else {
      leftEdge.position.set(x, 0.02, z - width/2 + 0.3);
    }
    scene.add(leftEdge);

    const rightEdge = new THREE.Mesh(edgeGeom, edgeMat);
    rightEdge.rotation.x = -Math.PI / 2;
    rightEdge.rotation.z = rotation;
    if (rotation === 0) {
      rightEdge.position.set(x + width/2 - 0.3, 0.02, z);
    } else {
      rightEdge.position.set(x, 0.02, z + width/2 - 0.3);
    }
    scene.add(rightEdge);
  }

  createRoad(0, 0, 14, 300);
  createRoad(0, 0, 300, 12, Math.PI / 2);
}

/**
 * 횡단보도 생성
 */
export function createCrosswalks(scene) {
  const crosswalks = [];

  // 횡단보도 줄무늬 색상
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });

  // 교차로 기준 4방향 횡단보도
  const crosswalkPositions = [
    { x: 0, z: 12, rotation: 0, width: 10, length: 4 },    // 북쪽 (세로도로 위)
    { x: 0, z: -12, rotation: 0, width: 10, length: 4 },   // 남쪽 (세로도로 아래)
    { x: 12, z: 0, rotation: Math.PI / 2, width: 8, length: 4 },   // 동쪽 (가로도로 오른쪽)
    { x: -12, z: 0, rotation: Math.PI / 2, width: 8, length: 4 }   // 서쪽 (가로도로 왼쪽)
  ];

  crosswalkPositions.forEach(pos => {
    const stripeCount = 8;
    const stripeWidth = pos.width / (stripeCount * 2 - 1);

    for (let i = 0; i < stripeCount; i++) {
      const stripeGeom = new THREE.PlaneGeometry(stripeWidth * 0.9, pos.length);
      const stripe = new THREE.Mesh(stripeGeom, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.rotation.z = pos.rotation;

      if (pos.rotation === 0) {
        stripe.position.set(
          pos.x - pos.width / 2 + stripeWidth / 2 + i * stripeWidth * 2,
          0.025,
          pos.z
        );
      } else {
        stripe.position.set(
          pos.x,
          0.025,
          pos.z - pos.width / 2 + stripeWidth / 2 + i * stripeWidth * 2
        );
      }
      scene.add(stripe);
    }

    // 횡단보도 경계 정보 저장
    const halfW = pos.width / 2;
    const halfL = pos.length / 2;
    if (pos.rotation === 0) {
      crosswalks.push({
        xMin: pos.x - halfW,
        xMax: pos.x + halfW,
        zMin: pos.z - halfL,
        zMax: pos.z + halfL
      });
    } else {
      crosswalks.push({
        xMin: pos.x - halfL,
        xMax: pos.x + halfL,
        zMin: pos.z - halfW,
        zMax: pos.z + halfW
      });
    }
  });

  return crosswalks;
}

/**
 * 리사이즈
 */
export function handleResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
