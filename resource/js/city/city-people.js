/**
 * city-people.js
 * 밤 도시에 어울리는 걸어다니는 사람들
 * 인도와 횡단보도를 걷고, 서로 충돌하지 않음
 */

import * as THREE from 'three';

// 사람 색상 (핑크, 시안 계열)
const personColors = [0xff80a0, 0x80d0e0, 0xe080c0, 0x90e0e0, 0xd090e0];

// 인도 경로 (도로 양옆)
// 세로 도로 폭 14, 가로 도로 폭 12
// 건물 시작 x = ±18
// 인도: 도로 가장자리(±7) ~ 건물 앞(±15)
export const sidewalkPaths = {
  // 세로 방향 인도 (세로 도로 양옆)
  vertical: [
    { x: -10, zMin: -80, zMax: -15 },   // 왼쪽 인도 (남쪽 구간)
    { x: -10, zMin: 15, zMax: 80 },     // 왼쪽 인도 (북쪽 구간)
    { x: 10, zMin: -80, zMax: -15 },    // 오른쪽 인도 (남쪽 구간)
    { x: 10, zMin: 15, zMax: 80 }       // 오른쪽 인도 (북쪽 구간)
  ],
  // 가로 방향 인도 (가로 도로 양옆)
  horizontal: [
    { z: -9, xMin: -80, xMax: -15 },    // 위쪽 인도 (서쪽 구간)
    { z: -9, xMin: 15, xMax: 80 },      // 위쪽 인도 (동쪽 구간)
    { z: 9, xMin: -80, xMax: -15 },     // 아래쪽 인도 (서쪽 구간)
    { z: 9, xMin: 15, xMax: 80 }        // 아래쪽 인도 (동쪽 구간)
  ]
};

// 횡단보도 경로
export const crosswalkPaths = [
  // 북쪽 횡단보도 (z=12)
  { type: 'horizontal', z: 12, xMin: -5, xMax: 5 },
  // 남쪽 횡단보도 (z=-12)
  { type: 'horizontal', z: -12, xMin: -5, xMax: 5 },
  // 동쪽 횡단보도 (x=12)
  { type: 'vertical', x: 12, zMin: -4, zMax: 4 },
  // 서쪽 횡단보도 (x=-12)
  { type: 'vertical', x: -12, zMin: -4, zMax: 4 }
];

// 건물 충돌 영역 (대략적인 위치)
const buildingZones = [];

// 초기화 시 건물 영역 설정
function initBuildingZones() {
  // 메인 도로 양쪽 건물
  for (let z = -80; z <= 100; z += 15) {
    buildingZones.push({ xMin: -28, xMax: -13, zMin: z - 8, zMax: z + 8 });
    buildingZones.push({ xMin: 13, xMax: 28, zMin: z - 8, zMax: z + 8 });
  }
}

initBuildingZones();

/**
 * 사람 생성 (네온 스타일)
 */
export function createPerson(scene, x, z, pathType, pathIndex = 0) {
  const group = new THREE.Group();
  const color = personColors[Math.floor(Math.random() * personColors.length)];

  // 공통 재질 (면만, 와이어프레임 없음)
  const mat = new THREE.MeshBasicMaterial({ color: color });

  // 머리
  const headGeom = new THREE.BoxGeometry(0.5, 0.55, 0.5);
  const head = new THREE.Mesh(headGeom, mat);
  head.position.y = 1.75;
  group.add(head);

  // 몸통
  const bodyGeom = new THREE.BoxGeometry(0.6, 0.8, 0.35);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 1.1;
  group.add(body);

  // 다리
  const legGeom = new THREE.BoxGeometry(0.22, 0.75, 0.22);

  const leftLeg = new THREE.Mesh(legGeom, mat);
  leftLeg.position.set(-0.15, 0.38, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeom, mat);
  rightLeg.position.set(0.15, 0.38, 0);
  group.add(rightLeg);

  // 팔
  const armGeom = new THREE.BoxGeometry(0.18, 0.6, 0.18);

  const leftArm = new THREE.Mesh(armGeom, mat);
  leftArm.position.set(-0.42, 1.1, 0);
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeom, mat);
  rightArm.position.set(0.42, 1.1, 0);
  group.add(rightArm);

  group.position.set(x, 0, z);

  // 걷기 데이터
  group.userData = {
    walkOffset: Math.random() * Math.PI * 2,
    walkSpeed: 1.5 + Math.random() * 1.5,
    animSpeed: 4 + Math.random() * 2,
    pathType: pathType,
    pathIndex: pathIndex,
    direction: Math.random() > 0.5 ? 1 : -1,
    offset: (Math.random() - 0.5) * 2,
    state: 'walking', // walking, crossing, waiting
    targetCrosswalk: null,
    crossingProgress: 0
  };

  scene.add(group);
  return group;
}

/**
 * 모든 사람 생성
 */
export function createAllPeople(scene) {
  const people = [];

  // 세로 인도에 사람 배치
  sidewalkPaths.vertical.forEach((path, idx) => {
    for (let i = 0; i < 3; i++) {
      const z = path.zMin + Math.random() * (path.zMax - path.zMin);
      const person = createPerson(scene, path.x, z, 'vertical', idx);
      people.push(person);
    }
  });

  // 가로 인도에 사람 배치
  sidewalkPaths.horizontal.forEach((path, idx) => {
    for (let i = 0; i < 3; i++) {
      const x = path.xMin + Math.random() * (path.xMax - path.xMin);
      const person = createPerson(scene, x, path.z, 'horizontal', idx);
      people.push(person);
    }
  });

  return people;
}

/**
 * 앞에 다른 사람이 있는지 체크 (진행 방향 기준)
 */
function checkPersonAhead(person, allPeople) {
  const data = person.userData;
  const lookAhead = 2.0; // 전방 감지 거리

  for (const other of allPeople) {
    if (other === person) continue;
    // 같은 경로 타입이 아니면 스킵 (다른 인도)
    if (other.userData.pathType !== data.pathType) continue;

    const dx = other.position.x - person.position.x;
    const dz = other.position.z - person.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > lookAhead) continue;

    // 진행 방향에 있는지 체크
    if (data.pathType === 'vertical') {
      const ahead = dz * data.direction;
      if (ahead > 0 && ahead < lookAhead && Math.abs(dx) < 1.5) {
        return true;
      }
    } else {
      const ahead = dx * data.direction;
      if (ahead > 0 && ahead < lookAhead && Math.abs(dz) < 1.5) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 사람 위치 업데이트
 */
export function updatePerson(person, deltaTime, allPeople, crosswalkBounds) {
  const data = person.userData;
  const speed = data.walkSpeed * deltaTime;

  if (data.state === 'crossing') {
    // 횡단보도 건너는 중
    updateCrossingPerson(person, deltaTime);
    return;
  }

  // 앞에 사람이 있으면 잠시 대기하거나 추월
  const blocked = checkPersonAhead(person, allPeople);
  if (blocked) {
    // 옆으로 살짝 비켜서 추월 시도
    if (data.pathType === 'vertical') {
      data.offset += (Math.random() - 0.5) * 0.5;
      data.offset = Math.max(-2.5, Math.min(2.5, data.offset));
    } else {
      data.offset += (Math.random() - 0.5) * 0.5;
      data.offset = Math.max(-2.5, Math.min(2.5, data.offset));
    }
  }

  if (data.pathType === 'vertical') {
    const path = sidewalkPaths.vertical[data.pathIndex];

    person.position.z += speed * data.direction;
    person.position.x = path.x + data.offset;

    // 경계 도달 시 방향 전환
    if (person.position.z > path.zMax) {
      person.position.z = path.zMax;
      data.direction = -1;
    } else if (person.position.z < path.zMin) {
      person.position.z = path.zMin;
      data.direction = 1;
    }

    person.rotation.y = data.direction > 0 ? 0 : Math.PI;

  } else if (data.pathType === 'horizontal') {
    const path = sidewalkPaths.horizontal[data.pathIndex];

    person.position.x += speed * data.direction;
    person.position.z = path.z + data.offset;

    if (person.position.x > path.xMax) {
      person.position.x = path.xMax;
      data.direction = -1;
    } else if (person.position.x < path.xMin) {
      person.position.x = path.xMin;
      data.direction = 1;
    }

    person.rotation.y = data.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  // 가끔 횡단보도로 이동 시도
  if (Math.random() < 0.001 && crosswalkBounds) {
    tryStartCrossing(person, crosswalkBounds);
  }
}

/**
 * 횡단보도 건너기 시작
 */
function tryStartCrossing(person, crosswalkBounds) {
  const data = person.userData;

  // 횡단보도 근처인지 확인
  for (let i = 0; i < crosswalkPaths.length; i++) {
    const cw = crosswalkPaths[i];
    const bounds = crosswalkBounds[i];

    if (cw.type === 'horizontal' && data.pathType === 'vertical') {
      // 세로 인도에서 가로 횡단보도로
      if (Math.abs(person.position.z - cw.z) < 5 && Math.abs(person.position.x) < 12) {
        data.state = 'crossing';
        data.targetCrosswalk = i;
        data.crossingProgress = 0;
        data.crossingStart = { x: person.position.x, z: person.position.z };
        data.crossingEnd = { x: -person.position.x, z: cw.z };
        return;
      }
    } else if (cw.type === 'vertical' && data.pathType === 'horizontal') {
      // 가로 인도에서 세로 횡단보도로
      if (Math.abs(person.position.x - cw.x) < 5 && Math.abs(person.position.z) < 10) {
        data.state = 'crossing';
        data.targetCrosswalk = i;
        data.crossingProgress = 0;
        data.crossingStart = { x: person.position.x, z: person.position.z };
        data.crossingEnd = { x: cw.x, z: -person.position.z };
        return;
      }
    }
  }
}

/**
 * 횡단보도 건너는 중 업데이트
 */
function updateCrossingPerson(person, deltaTime) {
  const data = person.userData;
  data.crossingProgress += deltaTime * data.walkSpeed * 0.3;

  if (data.crossingProgress >= 1) {
    // 건너기 완료
    data.state = 'walking';
    person.position.x = data.crossingEnd.x;
    person.position.z = data.crossingEnd.z;

    // 새 인도 경로 찾기
    findNewSidewalkPath(person);
    return;
  }

  // 선형 보간으로 이동
  const t = data.crossingProgress;
  person.position.x = data.crossingStart.x + (data.crossingEnd.x - data.crossingStart.x) * t;
  person.position.z = data.crossingStart.z + (data.crossingEnd.z - data.crossingStart.z) * t;

  // 이동 방향으로 회전
  const dx = data.crossingEnd.x - data.crossingStart.x;
  const dz = data.crossingEnd.z - data.crossingStart.z;
  person.rotation.y = Math.atan2(dx, dz);
}

/**
 * 새 인도 경로 찾기
 */
function findNewSidewalkPath(person) {
  const data = person.userData;
  const x = person.position.x;
  const z = person.position.z;

  // 세로 인도 확인
  for (let i = 0; i < sidewalkPaths.vertical.length; i++) {
    const path = sidewalkPaths.vertical[i];
    if (Math.abs(x - path.x) < 5 && z >= path.zMin - 5 && z <= path.zMax + 5) {
      data.pathType = 'vertical';
      data.pathIndex = i;
      data.offset = (Math.random() - 0.5) * 2;
      return;
    }
  }

  // 가로 인도 확인
  for (let i = 0; i < sidewalkPaths.horizontal.length; i++) {
    const path = sidewalkPaths.horizontal[i];
    if (Math.abs(z - path.z) < 5 && x >= path.xMin - 5 && x <= path.xMax + 5) {
      data.pathType = 'horizontal';
      data.pathIndex = i;
      data.offset = (Math.random() - 0.5) * 2;
      return;
    }
  }

  // 못 찾으면 기본값
  data.pathType = 'vertical';
  data.pathIndex = 0;
}

/**
 * 걷기 애니메이션
 */
export function animateWalk(person, time) {
  const data = person.userData;
  const t = time * data.animSpeed + data.walkOffset;

  // 바운스
  person.position.y = Math.abs(Math.sin(t * 2)) * 0.1;

  // 다리 (인덱스 2, 3)
  if (person.children[2] && person.children[3]) {
    person.children[2].rotation.x = Math.sin(t) * 0.6;
    person.children[3].rotation.x = Math.sin(t + Math.PI) * 0.6;
  }

  // 팔 (인덱스 4, 5)
  if (person.children[4] && person.children[5]) {
    person.children[4].rotation.x = Math.sin(t + Math.PI) * 0.5;
    person.children[5].rotation.x = Math.sin(t) * 0.5;
  }
}

/**
 * 모든 사람 업데이트
 */
export function updateAllPeople(people, deltaTime, time, crosswalkBounds) {
  people.forEach(person => {
    updatePerson(person, deltaTime, people, crosswalkBounds);
    animateWalk(person, time);
  });
}

// 이전 버전 호환을 위한 paths export
export const paths = {
  vertical: sidewalkPaths.vertical.map(p => ({ x: p.x, zMin: p.zMin, zMax: p.zMax })),
  horizontal: sidewalkPaths.horizontal.map(p => ({ z: p.z, xMin: p.xMin, xMax: p.xMax }))
};
