/**
 * city-buildings.js
 * 사이버펑크 스타일 밤의 도시 - 네온 간판, 밝은 창문
 */

import * as THREE from 'three';

// 바포웨이브/사이버펑크 건물 색상 (청보라 계열, 밝기 상향)
const buildingColors = [
  0x2a3050, 0x352848, 0x2d3555, 0x3a2850,
  0x303858, 0x3d3060, 0x283048, 0x352d55
];

// 네온 색상 (핑크/마젠타 위주)
const neonColors = [
  0xff4080, 0xff5090, 0xff3070, 0xf04888,  // 핑크/마젠타
  0xff6098, 0xe85080, 0xff7090, 0xf06088   // 핑크 변형
];

const signTexts = ['CAFE', 'BAR', 'SHOP', '24H', 'OPEN', 'HOTEL', 'GYM', 'CLUB'];

/**
 * 사이버펑크 건물
 */
function createCyberpunkBuilding(scene, x, z, w, d, h) {
  const group = new THREE.Group();
  const buildingColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
  const neonColor = neonColors[Math.floor(Math.random() * neonColors.length)];

  // 건물 본체 (MeshBasicMaterial - 조명 영향 없이 불투명)
  const geom = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshBasicMaterial({
    color: buildingColor
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = h / 2;
  group.add(mesh);

  // 밝은 창문들
  addBrightWindows(group, w, d, h);

  // 네온 간판 (높은 건물에만)
  if (h > 25 && Math.random() > 0.3) {
    addNeonSign(group, w, d, h);
  }

  // 옥상 조명 (PointLight 제거 - uniform 제한 초과 방지)

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

/**
 * 밝은 창문 추가
 */
function addBrightWindows(group, w, d, h) {
  // 창문 색상 (핑크/마젠타 70%, 시안 30% - 참고 이미지 톤)
  const windowColors = [
    0xff6090, 0xff5080, 0xe06088,  // 핑크/마젠타
    0xff7098, 0xf05078, 0xe85090,  // 핑크
    0x50d0e0, 0x60c8d8, 0x70e0f0   // 시안 (소수)
  ];
  const rows = Math.floor(h / 3.5);
  const cols = Math.max(1, Math.floor(w / 2.5));

  // 정면 창문
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() > 0.3) { // 70% 확률로 불 켜짐
        const wColor = windowColors[Math.floor(Math.random() * windowColors.length)];
        const wGeom = new THREE.PlaneGeometry(1.2, 1.8);
        const wMat = new THREE.MeshBasicMaterial({
          color: wColor
        });
        const win = new THREE.Mesh(wGeom, wMat);
        win.position.set(
          -w/2 + 1.2 + col * 2.5,
          2 + row * 3.5,
          d/2 + 0.05
        );
        group.add(win);
      }
    }
  }

  // 후면 창문
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.random() > 0.4) {
        const wColor = windowColors[Math.floor(Math.random() * windowColors.length)];
        const wGeom = new THREE.PlaneGeometry(1.2, 1.8);
        const wMat = new THREE.MeshBasicMaterial({ color: wColor });
        const win = new THREE.Mesh(wGeom, wMat);
        win.position.set(
          -w/2 + 1.2 + col * 2.5,
          2 + row * 3.5,
          -d/2 - 0.05
        );
        win.rotation.y = Math.PI;
        group.add(win);
      }
    }
  }

  // 좌측 창문
  const sideCols = Math.max(1, Math.floor(d / 2.5));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < sideCols; col++) {
      if (Math.random() > 0.4) {
        const wColor = windowColors[Math.floor(Math.random() * windowColors.length)];
        const wGeom = new THREE.PlaneGeometry(1.2, 1.8);
        const wMat = new THREE.MeshBasicMaterial({ color: wColor });
        const win = new THREE.Mesh(wGeom, wMat);
        win.position.set(
          -w/2 - 0.05,
          2 + row * 3.5,
          -d/2 + 1.2 + col * 2.5
        );
        win.rotation.y = -Math.PI / 2;
        group.add(win);
      }
    }
  }

  // 우측 창문
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < sideCols; col++) {
      if (Math.random() > 0.4) {
        const wColor = windowColors[Math.floor(Math.random() * windowColors.length)];
        const wGeom = new THREE.PlaneGeometry(1.2, 1.8);
        const wMat = new THREE.MeshBasicMaterial({ color: wColor });
        const win = new THREE.Mesh(wGeom, wMat);
        win.position.set(
          w/2 + 0.05,
          2 + row * 3.5,
          -d/2 + 1.2 + col * 2.5
        );
        win.rotation.y = Math.PI / 2;
        group.add(win);
      }
    }
  }
}

/**
 * 네온 간판 추가
 */
function addNeonSign(group, w, d, h) {
  const signColor = neonColors[Math.floor(Math.random() * neonColors.length)];
  const signHeight = 3 + Math.random() * 2;
  const signWidth = Math.min(w * 0.8, 6);
  const signY = h * (0.3 + Math.random() * 0.4);

  // 간판 배경 (어두운 남색)
  const bgGeom = new THREE.BoxGeometry(signWidth + 0.5, signHeight + 0.3, 0.3);
  const bgMat = new THREE.MeshBasicMaterial({
    color: 0x0d0d18
  });
  const bg = new THREE.Mesh(bgGeom, bgMat);
  bg.position.set(0, signY, d/2 + 0.3);
  group.add(bg);

  // 간판 글로우
  const signGeom = new THREE.PlaneGeometry(signWidth, signHeight);
  const signMat = new THREE.MeshBasicMaterial({
    color: signColor,
    transparent: true,
    opacity: 0.9
  });
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(0, signY, d/2 + 0.5);
  group.add(sign);
  // PointLight 제거 - uniform 제한 초과 방지
}

/**
 * 세로형 네온 간판 (건물 측면)
 */
function createVerticalSign(scene, x, z, height) {
  const group = new THREE.Group();
  const color = neonColors[Math.floor(Math.random() * neonColors.length)];

  // 간판 본체
  const geom = new THREE.BoxGeometry(1.5, height, 0.5);
  const mat = new THREE.MeshBasicMaterial({ color: color });
  const sign = new THREE.Mesh(geom, mat);
  sign.position.y = height / 2 + 5;
  group.add(sign);
  // PointLight 제거 - uniform 제한 초과 방지

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

/**
 * 광고판 빌보드
 */
function createBillboard(scene, x, z, height) {
  const group = new THREE.Group();
  const color = neonColors[Math.floor(Math.random() * neonColors.length)];

  // 기둥 (어두운 남색)
  const poleGeom = new THREE.CylinderGeometry(0.3, 0.4, height, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x1a1a28 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = height / 2;
  group.add(pole);

  // 광고판
  const boardGeom = new THREE.BoxGeometry(8, 5, 0.5);
  const boardMat = new THREE.MeshBasicMaterial({ color: color });
  const board = new THREE.Mesh(boardGeom, boardMat);
  board.position.y = height + 2.5;
  group.add(board);
  // PointLight 제거 - uniform 제한 초과 방지

  group.position.set(x, 0, z);
  group.rotation.y = Math.random() * Math.PI * 0.5 - Math.PI * 0.25;
  scene.add(group);
  return group;
}

/**
 * 모든 건물 생성
 */
export function createAllBuildings(scene) {
  const buildings = [];

  // === 메인 도로 양쪽 ===
  for (let z = -80; z <= 100; z += 15) {
    const h = 20 + Math.random() * 35;
    buildings.push(createCyberpunkBuilding(scene, -18 + Math.random() * 4, z + Math.random() * 8, 10 + Math.random() * 5, 10 + Math.random() * 5, h));
    buildings.push(createCyberpunkBuilding(scene, 18 + Math.random() * 4, z + Math.random() * 8, 10 + Math.random() * 5, 10 + Math.random() * 5, h));
  }

  // === 2열 ===
  for (let z = -90; z <= 110; z += 18) {
    buildings.push(createCyberpunkBuilding(scene, -40 + Math.random() * 8, z, 12 + Math.random() * 6, 12 + Math.random() * 6, 25 + Math.random() * 40));
    buildings.push(createCyberpunkBuilding(scene, 40 + Math.random() * 8, z, 12 + Math.random() * 6, 12 + Math.random() * 6, 25 + Math.random() * 40));
  }

  // === 3열 (스카이라인) ===
  for (let z = -100; z <= 120; z += 15) {
    buildings.push(createCyberpunkBuilding(scene, -65 + Math.random() * 10, z, 14 + Math.random() * 8, 14 + Math.random() * 8, 35 + Math.random() * 50));
    buildings.push(createCyberpunkBuilding(scene, 65 + Math.random() * 10, z, 14 + Math.random() * 8, 14 + Math.random() * 8, 35 + Math.random() * 50));
  }

  // === 4열 (배경) ===
  for (let z = -100; z <= 120; z += 12) {
    buildings.push(createCyberpunkBuilding(scene, -90 + Math.random() * 10, z, 16 + Math.random() * 10, 16 + Math.random() * 10, 45 + Math.random() * 55));
    buildings.push(createCyberpunkBuilding(scene, 90 + Math.random() * 10, z, 16 + Math.random() * 10, 16 + Math.random() * 10, 45 + Math.random() * 55));
  }

  // === 5열 (외곽) ===
  for (let z = -110; z <= 130; z += 10) {
    buildings.push(createCyberpunkBuilding(scene, -115 + Math.random() * 8, z, 18 + Math.random() * 12, 18 + Math.random() * 12, 50 + Math.random() * 60));
    buildings.push(createCyberpunkBuilding(scene, 115 + Math.random() * 8, z, 18 + Math.random() * 12, 18 + Math.random() * 12, 50 + Math.random() * 60));
  }

  // === 도로 끝 ===
  for (let x = -100; x <= 100; x += 15) {
    if (Math.abs(x) > 12) {
      buildings.push(createCyberpunkBuilding(scene, x, -95 + Math.random() * 10, 14 + Math.random() * 8, 16 + Math.random() * 8, 30 + Math.random() * 40));
      buildings.push(createCyberpunkBuilding(scene, x, 105 + Math.random() * 10, 14 + Math.random() * 8, 16 + Math.random() * 8, 30 + Math.random() * 40));
    }
  }

  // === 코너 건물들 ===
  buildings.push(createCyberpunkBuilding(scene, -100, -100, 20, 20, 60 + Math.random() * 30));
  buildings.push(createCyberpunkBuilding(scene, 100, -100, 20, 20, 60 + Math.random() * 30));
  buildings.push(createCyberpunkBuilding(scene, -100, 100, 20, 20, 60 + Math.random() * 30));
  buildings.push(createCyberpunkBuilding(scene, 100, 100, 20, 20, 60 + Math.random() * 30));

  // === 빌보드 & 세로 간판 ===
  for (let z = -60; z <= 80; z += 40) {
    createBillboard(scene, -25 + Math.random() * 5, z, 12 + Math.random() * 5);
    createBillboard(scene, 25 + Math.random() * 5, z + 20, 12 + Math.random() * 5);
    createVerticalSign(scene, -16, z + 10, 8 + Math.random() * 4);
    createVerticalSign(scene, 16, z + 30, 8 + Math.random() * 4);
  }

  return buildings;
}

/**
 * 나무
 */
export function createAllTrees(scene) {
  const trees = [];
  for (let z = -70; z <= 90; z += 18) {
    trees.push(createTree(scene, -9, z));
    trees.push(createTree(scene, 9, z + 9));
  }
  return trees;
}

function createTree(scene, x, z) {
  const group = new THREE.Group();
  const scale = 0.6 + Math.random() * 0.4;

  // 나무 줄기 (어두운 보라 계열)
  const trunkGeom = new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, 2.5 * scale, 6);
  const trunkMat = new THREE.MeshBasicMaterial({ color: 0x2a2030 });
  const trunk = new THREE.Mesh(trunkGeom, trunkMat);
  trunk.position.y = 1.25 * scale;
  group.add(trunk);

  // 나뭇잎 (어두운 청록 계열)
  const foliageGeom = new THREE.ConeGeometry(1.8 * scale, 3.5 * scale, 6);
  const foliageMat = new THREE.MeshBasicMaterial({ color: 0x1a3040 });
  const foliage = new THREE.Mesh(foliageGeom, foliageMat);
  foliage.position.y = 4 * scale;
  group.add(foliage);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

/**
 * 가로등
 */
export function createAllStreetLamps(scene) {
  const lamps = [];

  for (let z = -65; z <= 85; z += 18) {
    lamps.push(createStreetLamp(scene, -8, z));
    lamps.push(createStreetLamp(scene, 8, z + 9));
  }

  return lamps;
}

function createStreetLamp(scene, x, z) {
  const group = new THREE.Group();
  // 가로등 색상 (핑크/시안 계열)
  const color = Math.random() > 0.5 ? 0xffc0d0 : 0xc0ffff;

  // 기둥 (어두운 남색)
  const poleGeom = new THREE.CylinderGeometry(0.12, 0.18, 7, 6);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x202030 });
  const pole = new THREE.Mesh(poleGeom, poleMat);
  pole.position.y = 3.5;
  group.add(pole);

  const lampGeom = new THREE.SphereGeometry(0.5, 8, 6);
  const lampMat = new THREE.MeshBasicMaterial({ color: color });
  const lamp = new THREE.Mesh(lampGeom, lampMat);
  lamp.position.y = 7.2;
  group.add(lamp);

  group.position.set(x, 0, z);
  scene.add(group);
  return group;
}

export function createAllBenches(scene) {
  return [];
}
