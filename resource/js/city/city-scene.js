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
  // 안개 없음 (건물이 투명하게 보이지 않도록)
  // scene.fog = new THREE.FogExp2(0x0a0a20, 0.005);
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
  // 바닥 (인도 - 어두운 남색 계열)
  const groundGeometry = new THREE.PlaneGeometry(300, 300);
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
 * 리사이즈
 */
export function handleResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
