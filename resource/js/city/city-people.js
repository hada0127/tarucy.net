/**
 * city-people.js
 * 밤 도시에 어울리는 걸어다니는 사람들
 */

import * as THREE from 'three';

// 사람 색상 (핑크, 시안 계열)
const personColors = [0xff80a0, 0x80d0e0, 0xe080c0, 0x90e0e0, 0xd090e0];

// 도로 경로
export const paths = {
  vertical: [
    { x: 0, zMin: -80, zMax: 80 },
  ],
  horizontal: [
    { z: 0, xMin: -80, xMax: 80 },
  ]
};

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
    walkSpeed: 2 + Math.random() * 2,
    animSpeed: 4 + Math.random() * 2,
    pathType: pathType,
    pathIndex: pathIndex,
    direction: Math.random() > 0.5 ? 1 : -1,
    offset: (Math.random() - 0.5) * 4
  };

  scene.add(group);
  return group;
}

/**
 * 모든 사람 생성
 */
export function createAllPeople(scene) {
  const people = [];

  // 메인 도로 (세로)
  for (let i = 0; i < 10; i++) {
    const z = -70 + Math.random() * 140;
    const person = createPerson(scene, 0, z, 'vertical', 0);
    people.push(person);
  }

  // 가로 도로
  for (let i = 0; i < 8; i++) {
    const x = -70 + Math.random() * 140;
    const person = createPerson(scene, x, 0, 'horizontal', 0);
    people.push(person);
  }

  return people;
}

/**
 * 사람 위치 업데이트
 */
export function updatePerson(person, deltaTime) {
  const data = person.userData;
  const speed = data.walkSpeed * deltaTime;

  if (data.pathType === 'vertical') {
    const path = paths.vertical[data.pathIndex];

    person.position.z += speed * data.direction;
    person.position.x = path.x + data.offset;

    if (person.position.z > path.zMax) {
      person.position.z = path.zMax;
      data.direction = -1;
    } else if (person.position.z < path.zMin) {
      person.position.z = path.zMin;
      data.direction = 1;
    }

    person.rotation.y = data.direction > 0 ? 0 : Math.PI;

  } else if (data.pathType === 'horizontal') {
    const path = paths.horizontal[data.pathIndex];

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
}

/**
 * 걷기 애니메이션
 */
export function animateWalk(person, time) {
  const data = person.userData;
  const t = time * data.animSpeed + data.walkOffset;

  // 바운스
  person.position.y = Math.abs(Math.sin(t * 2)) * 0.1;

  // 다리 (인덱스 2, 3 - 와이어프레임 제거 후)
  if (person.children[2] && person.children[3]) {
    person.children[2].rotation.x = Math.sin(t) * 0.6;
    person.children[3].rotation.x = Math.sin(t + Math.PI) * 0.6;
  }

  // 팔 (인덱스 4, 5 - 와이어프레임 제거 후)
  if (person.children[4] && person.children[5]) {
    person.children[4].rotation.x = Math.sin(t + Math.PI) * 0.5;
    person.children[5].rotation.x = Math.sin(t) * 0.5;
  }
}

/**
 * 모든 사람 업데이트
 */
export function updateAllPeople(people, deltaTime, time) {
  people.forEach(person => {
    updatePerson(person, deltaTime);
    animateWalk(person, time);
  });
}
