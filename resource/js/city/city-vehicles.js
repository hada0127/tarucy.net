/**
 * city-vehicles.js
 * 도로 위를 달리는 자동차들
 */

import * as THREE from 'three';

// 자동차 색상 (네온 스타일)
const carColors = [
  0xff6090, 0x60d0e0, 0xe080c0, 0x80e0e0, 0xd090e0,
  0xff8080, 0x80c0ff, 0xffa060
];

// 도로 차선 정보 (세로 도로만 사용)
const lanes = {
  vertical: [
    { x: -3.5, zMin: -100, zMax: 100, direction: 1 },   // 위로 가는 차선
    { x: 3.5, zMin: -100, zMax: 100, direction: -1 }    // 아래로 가는 차선
  ]
};

// 교차로 영역 (차량이 서행/정지해야 하는 구간)
const intersectionZone = {
  xMin: -8,
  xMax: 8,
  zMin: -8,
  zMax: 8
};

/**
 * 세단형 자동차 생성
 */
function createSedanCar(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  // 차체 하단
  const bodyGeom = new THREE.BoxGeometry(2.2, 0.8, 4.5);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 0.5;
  group.add(body);

  // 차체 상단 (캐빈)
  const cabinGeom = new THREE.BoxGeometry(1.8, 0.7, 2.2);
  const cabinMat = new THREE.MeshBasicMaterial({ color: 0x303050 });
  const cabin = new THREE.Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 1.2, -0.3);
  group.add(cabin);

  // 창문 (밝은 시안)
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x60d0e0, transparent: true, opacity: 0.7 });

  // 앞 창문
  const frontWindowGeom = new THREE.PlaneGeometry(1.6, 0.6);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 1.2, 0.8);
  frontWindow.rotation.x = -0.3;
  group.add(frontWindow);

  // 헤드라이트
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.4, 0.3, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-0.7, 0.5, 2.26);
  group.add(headlightL);

  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(0.7, 0.5, 2.26);
  group.add(headlightR);

  // 테일라이트
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.4, 0.25, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-0.7, 0.5, -2.26);
  group.add(taillightL);

  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(0.7, 0.5, -2.26);
  group.add(taillightR);

  // 바퀴 (4개)
  addWheels(group, 0.35, 0.9, 1.3);

  return group;
}

/**
 * SUV/밴 형태 자동차 생성
 */
function createSUVCar(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  // 차체 하단 (더 높고 큼)
  const bodyGeom = new THREE.BoxGeometry(2.4, 1.0, 5.0);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 0.7;
  group.add(body);

  // 차체 상단 (더 높은 캐빈)
  const cabinGeom = new THREE.BoxGeometry(2.2, 1.0, 3.0);
  const cabinMat = new THREE.MeshBasicMaterial({ color: 0x252540 });
  const cabin = new THREE.Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 1.7, -0.5);
  group.add(cabin);

  // 창문
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x50c8d8, transparent: true, opacity: 0.7 });

  const frontWindowGeom = new THREE.PlaneGeometry(2.0, 0.8);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 1.7, 1.01);
  frontWindow.rotation.x = -0.2;
  group.add(frontWindow);

  // 헤드라이트 (더 큼)
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.5, 0.4, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-0.8, 0.7, 2.51);
  group.add(headlightL);

  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(0.8, 0.7, 2.51);
  group.add(headlightR);

  // 테일라이트
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.5, 0.3, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-0.8, 0.7, -2.51);
  group.add(taillightL);

  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(0.8, 0.7, -2.51);
  group.add(taillightR);

  // 바퀴 (더 큰 바퀴)
  addWheels(group, 0.45, 1.0, 1.6);

  return group;
}

/**
 * 스포츠카 형태 자동차 생성
 */
function createSportsCar(color) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  // 차체 (낮고 날렵함)
  const bodyGeom = new THREE.BoxGeometry(2.0, 0.6, 4.8);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 0.4;
  group.add(body);

  // 차체 상단 (낮은 캐빈)
  const cabinGeom = new THREE.BoxGeometry(1.6, 0.5, 1.8);
  const cabinMat = new THREE.MeshBasicMaterial({ color: 0x202038 });
  const cabin = new THREE.Mesh(cabinGeom, cabinMat);
  cabin.position.set(0, 0.95, -0.4);
  group.add(cabin);

  // 앞 경사면
  const hoodGeom = new THREE.BoxGeometry(1.8, 0.3, 1.5);
  const hood = new THREE.Mesh(hoodGeom, mat);
  hood.position.set(0, 0.55, 1.5);
  hood.rotation.x = -0.15;
  group.add(hood);

  // 창문
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x70e0f0, transparent: true, opacity: 0.7 });

  const frontWindowGeom = new THREE.PlaneGeometry(1.4, 0.4);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 0.95, 0.51);
  frontWindow.rotation.x = -0.5;
  group.add(frontWindow);

  // 헤드라이트 (날카로움)
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
  const headlightGeom = new THREE.BoxGeometry(0.6, 0.15, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-0.6, 0.35, 2.41);
  group.add(headlightL);

  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(0.6, 0.35, 2.41);
  group.add(headlightR);

  // 테일라이트 (가로로 긴 형태)
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(1.6, 0.15, 0.1);
  const taillight = new THREE.Mesh(taillightGeom, tailMat);
  taillight.position.set(0, 0.4, -2.41);
  group.add(taillight);

  // 바퀴 (낮은 바퀴)
  addWheels(group, 0.3, 0.85, 1.5);

  return group;
}

/**
 * 정지된 트럭 생성 (골목용)
 */
export function createParkedTruck(scene, x, z, rotation = 0) {
  const group = new THREE.Group();
  const truckColor = 0x3a3a50; // 어두운 회색-남색

  // 운전석
  const cabGeom = new THREE.BoxGeometry(2.8, 2.5, 3);
  const cabMat = new THREE.MeshBasicMaterial({ color: truckColor });
  const cab = new THREE.Mesh(cabGeom, cabMat);
  cab.position.set(0, 1.5, 2.5);
  group.add(cab);

  // 운전석 창문
  const windowMat = new THREE.MeshBasicMaterial({ color: 0x50c8d8, transparent: true, opacity: 0.7 });
  const frontWindowGeom = new THREE.PlaneGeometry(2.2, 1.2);
  const frontWindow = new THREE.Mesh(frontWindowGeom, windowMat);
  frontWindow.position.set(0, 2.0, 4.01);
  group.add(frontWindow);

  // 짐칸 (BoxGeometry)
  const cargoGeom = new THREE.BoxGeometry(3, 3.5, 6);
  const cargoMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3d });
  const cargo = new THREE.Mesh(cargoGeom, cargoMat);
  cargo.position.set(0, 2, -2);
  group.add(cargo);

  // 짐칸 측면 패널 (콘텐츠 부착 영역) - 오른쪽
  const panelGeomR = new THREE.PlaneGeometry(5.5, 3);
  const panelMatR = new THREE.MeshBasicMaterial({
    color: 0x4a4a60,
    transparent: true,
    opacity: 0.95
  });
  const panelR = new THREE.Mesh(panelGeomR, panelMatR);
  panelR.position.set(1.51, 2, -2);
  panelR.rotation.y = Math.PI / 2;
  group.add(panelR);

  // 짐칸 측면 패널 - 왼쪽
  const panelGeomL = new THREE.PlaneGeometry(5.5, 3);
  const panelMatL = new THREE.MeshBasicMaterial({
    color: 0x4a4a60,
    transparent: true,
    opacity: 0.95
  });
  const panelL = new THREE.Mesh(panelGeomL, panelMatL);
  panelL.position.set(-1.51, 2, -2);
  panelL.rotation.y = -Math.PI / 2;
  group.add(panelL);

  // 헤드라이트
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const headlightGeom = new THREE.BoxGeometry(0.5, 0.4, 0.1);
  const headlightL = new THREE.Mesh(headlightGeom, lightMat);
  headlightL.position.set(-1, 1, 4.01);
  group.add(headlightL);

  const headlightR = new THREE.Mesh(headlightGeom, lightMat);
  headlightR.position.set(1, 1, 4.01);
  group.add(headlightR);

  // 테일라이트
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff3030 });
  const taillightGeom = new THREE.BoxGeometry(0.6, 0.3, 0.1);
  const taillightL = new THREE.Mesh(taillightGeom, tailMat);
  taillightL.position.set(-1, 1, -5.01);
  group.add(taillightL);

  const taillightR = new THREE.Mesh(taillightGeom, tailMat);
  taillightR.position.set(1, 1, -5.01);
  group.add(taillightR);

  // 바퀴 (큰 바퀴)
  const wheelGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 12);
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

  const wheelPositions = [
    { x: -1.4, z: 2 },   // 앞 왼쪽
    { x: 1.4, z: 2 },    // 앞 오른쪽
    { x: -1.4, z: -3.5 }, // 뒤 왼쪽
    { x: 1.4, z: -3.5 }   // 뒤 오른쪽
  ];

  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, 0.6, pos.z);
    group.add(wheel);
  });

  group.position.set(x, 0, z);
  group.rotation.y = rotation;

  // contentSurface로 참조 (오른쪽 패널)
  group.userData.contentSurfaceRight = panelR;
  group.userData.contentSurfaceLeft = panelL;
  group.userData.type = 'parked-truck';

  scene.add(group);
  return group;
}

/**
 * 바퀴 추가 헬퍼
 */
function addWheels(group, radius, xOffset, zOffset) {
  const wheelGeom = new THREE.CylinderGeometry(radius, radius, 0.3, 12);
  const wheelMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });

  const positions = [
    { x: -xOffset, z: zOffset },   // 앞 왼쪽
    { x: xOffset, z: zOffset },    // 앞 오른쪽
    { x: -xOffset, z: -zOffset },  // 뒤 왼쪽
    { x: xOffset, z: -zOffset }    // 뒤 오른쪽
  ];

  positions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, radius, pos.z);
    group.add(wheel);
  });
}

/**
 * 자동차 생성 (타입 랜덤, 세로 도로 전용)
 */
export function createCar(scene, x, z, laneType, laneIndex) {
  const color = carColors[Math.floor(Math.random() * carColors.length)];
  const carType = Math.floor(Math.random() * 3);

  let car;
  switch (carType) {
    case 0:
      car = createSedanCar(color);
      break;
    case 1:
      car = createSUVCar(color);
      break;
    case 2:
      car = createSportsCar(color);
      break;
  }

  car.position.set(x, 0, z);

  const lane = lanes.vertical[laneIndex];

  // 차량 방향 설정 (세로 도로)
  car.rotation.y = lane.direction > 0 ? 0 : Math.PI;

  car.userData = {
    laneIndex,
    speed: 6 + Math.random() * 4,  // 6-10 속도 (약간 느리게)
    direction: lane.direction,
    carType,
    boundingBox: new THREE.Box3(),
    waiting: false,
    waitTime: 0
  };

  scene.add(car);
  return car;
}

/**
 * 모든 자동차 생성 (세로 도로만)
 */
export function createAllCars(scene) {
  const cars = [];

  // 세로 도로 차량 (각 차선에 4대씩)
  for (let laneIdx = 0; laneIdx < 2; laneIdx++) {
    const lane = lanes.vertical[laneIdx];
    for (let i = 0; i < 4; i++) {
      // 교차로 피해서 배치 (-100~-15, 15~100)
      let z;
      if (i < 2) {
        z = -90 + i * 35 + Math.random() * 10;  // 남쪽 구간
      } else {
        z = 20 + (i - 2) * 35 + Math.random() * 10;  // 북쪽 구간
      }
      const car = createCar(scene, lane.x, z, 'vertical', laneIdx);
      cars.push(car);
    }
  }

  return cars;
}

/**
 * 바운딩 박스 업데이트
 */
function updateBoundingBox(car) {
  car.userData.boundingBox.setFromObject(car);
}

/**
 * 교차로 내부인지 체크
 */
function isInIntersection(x, z) {
  return x >= intersectionZone.xMin && x <= intersectionZone.xMax &&
         z >= intersectionZone.zMin && z <= intersectionZone.zMax;
}

/**
 * 자동차 충돌 체크
 */
function checkCarCollision(car, allCars) {
  updateBoundingBox(car);
  const data = car.userData;

  // 앞쪽 감지 영역 계산
  const lookAhead = 10; // 전방 감지 거리
  let frontZ = car.position.z + lookAhead * data.direction;

  // 같은 차선에서 앞차와의 충돌 체크
  for (const otherCar of allCars) {
    if (otherCar === car) continue;
    if (otherCar.userData.laneIndex !== data.laneIndex) continue;

    // 같은 차선에서 앞차와의 거리
    const distZ = (otherCar.position.z - car.position.z) * data.direction;
    if (distZ > 0 && distZ < lookAhead) {
      return true;
    }
  }

  // 교차로 진입 전 체크: 다른 차선의 차가 교차로에 있으면 대기
  const approachingIntersection =
    (data.direction > 0 && car.position.z < intersectionZone.zMin && frontZ >= intersectionZone.zMin) ||
    (data.direction < 0 && car.position.z > intersectionZone.zMax && frontZ <= intersectionZone.zMax);

  if (approachingIntersection) {
    // 반대 차선 차량이 교차로에 있는지 체크
    for (const otherCar of allCars) {
      if (otherCar === car) continue;
      if (otherCar.userData.laneIndex === data.laneIndex) continue;  // 같은 차선은 스킵

      if (isInIntersection(otherCar.position.x, otherCar.position.z)) {
        return true;  // 반대 차선 차량이 교차로에 있으면 대기
      }
    }
  }

  return false;
}

/**
 * 자동차 위치 업데이트
 */
export function updateCar(car, deltaTime, allCars, people, crosswalkBounds) {
  const data = car.userData;
  let shouldStop = false;

  // 횡단보도 근처에서 보행자 체크
  if (crosswalkBounds) {
    const inCrosswalkZone = checkCrosswalkZone(car, crosswalkBounds);
    if (inCrosswalkZone) {
      for (const person of people) {
        if (isPersonOnCrosswalk(person, crosswalkBounds)) {
          shouldStop = true;
          break;
        }
      }
    }
  }

  // 다른 차량과의 충돌 체크
  if (!shouldStop) {
    shouldStop = checkCarCollision(car, allCars);
  }

  if (shouldStop) {
    data.waiting = true;
    return;
  }

  data.waiting = false;
  const speed = data.speed * deltaTime;

  const lane = lanes.vertical[data.laneIndex];
  car.position.z += speed * data.direction;

  // 경계 도달 시 반대편으로 텔레포트
  if (car.position.z > lane.zMax) {
    car.position.z = lane.zMin;
  } else if (car.position.z < lane.zMin) {
    car.position.z = lane.zMax;
  }
}

/**
 * 횡단보도 영역 체크 (세로 도로 차량용)
 */
function checkCrosswalkZone(car, crosswalkBounds) {
  const margin = 8; // 횡단보도 전 정지 거리
  const data = car.userData;

  for (const bounds of crosswalkBounds) {
    const approachZ = car.position.z + margin * data.direction;
    if (Math.abs(car.position.x) < 8) {
      if ((data.direction > 0 && car.position.z < bounds.zMax && approachZ >= bounds.zMin) ||
          (data.direction < 0 && car.position.z > bounds.zMin && approachZ <= bounds.zMax)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 보행자가 횡단보도 위에 있는지 체크
 */
function isPersonOnCrosswalk(person, crosswalkBounds) {
  for (const bounds of crosswalkBounds) {
    if (person.position.x >= bounds.xMin && person.position.x <= bounds.xMax &&
        person.position.z >= bounds.zMin && person.position.z <= bounds.zMax) {
      return true;
    }
  }
  return false;
}

/**
 * 모든 자동차 업데이트
 */
export function updateAllCars(cars, deltaTime, people, crosswalkBounds) {
  cars.forEach(car => {
    updateCar(car, deltaTime, cars, people, crosswalkBounds);
  });
}

export { lanes, intersectionZone };
