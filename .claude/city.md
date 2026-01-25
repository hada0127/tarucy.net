# Hong Kong Citypop Night City - 파일 및 함수 문서

## 파일 개요

### 핵심 파일
| 파일명 | 역할 |
|--------|------|
| city-main.js | 메인 진입점, 씬 초기화 및 애니메이션 루프 |
| city-colors.js | 공유 색상 팔레트 |
| city-sky.js | 씬, 카메라, 렌더러, 하늘, 조명, 실루엣 |
| city-ground.js | 다층 지면 레벨 |
| city-road.js | 도로, 횡단보도, 가드레일, 옹벽 |

### 건물 파일
| 파일명 | 역할 |
|--------|------|
| city-house.js | 주거 지역 주택 |
| city-hotel.js | 핑크 호텔 (그랜드 부다페스트 스타일) |
| city-building.js | 고층 빌딩 |
| city-shop.js | 상점가, 노점상 |

### 환경 파일
| 파일명 | 역할 |
|--------|------|
| city-park.js | 공원, 놀이터 |
| city-tree.js | 나무, 숲 |
| city-environment.js | 언덕, 산, 배경 숲 |

### 인프라 파일
| 파일명 | 역할 |
|--------|------|
| city-streetlamp.js | 가로등 |
| city-infrastructure.js | 계단, 전봇대, 전선 |
| city-furniture.js | 거리 가구 (벤치, 버스 정류장, 우체통 등) |

### 기타 파일
| 파일명 | 역할 |
|--------|------|
| city-camera.js | 카메라 경로 및 스크롤 기반 카메라 이동 |
| city-content.js | 네온 사인, 콘텐츠 표지판 생성 |
| city-people.js | 보행자 생성 및 이동 로직 |
| city-vehicles.js | 차량 생성 및 이동 로직 |
| city-utils.js | 유틸리티 함수 (텍스처, 와이어프레임, 이징) |

---

## city-main.js
메인 진입점. 전체 씬을 초기화하고 애니메이션 루프를 실행.

| 함수 | 역할 |
|------|------|
| `createAllBuildings(scene)` | 모든 건물 및 구조물 생성 (로컬 함수) |
| `initCity()` | 씬, 카메라, 렌더러 초기화 및 모든 요소 생성, 애니메이션 시작 |

---

## city-colors.js
공유 색상 팔레트 및 유틸리티.

| Export | 역할 |
|--------|------|
| `colors` | 색상 팔레트 객체 (building, window, neon, concrete 등) |
| `randomColor(palette)` | 팔레트에서 랜덤 색상 선택 |

---

## city-sky.js
씬의 기본 구성요소 생성 (하늘, 조명, 실루엣).

| 함수 | 역할 |
|------|------|
| `createScene()` | Three.js 씬 생성 및 하늘 추가 |
| `createRenderer(container)` | WebGL 렌더러 생성 |
| `createCamera()` | 퍼스펙티브 카메라 생성 |
| `createLighting(scene)` | 조명 설정 |
| `handleResize(camera, renderer)` | 윈도우 리사이즈 핸들러 |

---

## city-ground.js
모든 지면 및 바닥면 생성. 높이 순서대로 정리됨.

### LEVEL 0: Base Level (y ≤ 0)
| 함수 | 역할 | Y 높이 |
|------|------|--------|
| `createDistantGround(scene)` | 원거리 지면 (반경 550 원형) | -0.1 |
| `createMainRoadBase(scene)` | 메인 도로 레벨 베이스 | -0.02 |
| `createSouthAreaGround(scene)` | 남쪽 영역 지면 | 0.005 |
| `createCurveWestForestGround(scene)` | 곡선도로 서쪽 숲 지면 | 0.01 |
| `createHotelBackForestGround(scene)` | 호텔 뒤 숲 지면 | 0.01 |
| `createTunnelRoads(scene)` | 터널 내부/진입 도로 | 0.02, 0.03 |

### LEVEL 2: Shopping District (y = 2)
| 함수 | 역할 | Y 높이 |
|------|------|--------|
| `createShoppingDistrictBase(scene)` | 쇼핑 지구 베이스 | 2.0 |
| `createShoppingAlley(scene)` | 쇼핑 골목 | 2.01 |
| `createLeftParkGround(scene)` | 왼쪽 공원 (놀이터) 지면/경로 | 2.01, 2.02 |
| `createRightParkGround(scene)` | 오른쪽 공원 (분수대) 지면/경로 | 2.01, 2.02 |

### LEVEL 10: Residential District (y = 10)
| 함수 | 역할 | Y 높이 |
|------|------|--------|
| `createResidentialForestGround(scene)` | 주거지역 뒤 숲 지면 | 9.99 |
| `createResidentialRoadBase(scene)` | 주거지역 도로 베이스 | 10.0 |
| `createResidentialDistrictBase(scene)` | 주거지역 지구 지면 | 10.01 |
| `createResidentialPedestrianPath(scene)` | 주거지역 보행로 | 10.01 |
| `createLeftNorthHillsGround(scene)` | 좌측 북쪽 언덕 지면 | 10.02 |

### LEVEL 10~16: Sloped Area (y = 10 → 16)
| 함수 | 역할 | Y 높이 |
|------|------|--------|
| `createSlopedRoad(scene)` | 경사 도로 (BufferGeometry) | 10.01 → 16 |
| `createSlopedResidentialGround(scene)` | 경사 주거지역 지면 | 10.02 → 16.01 |

### LEVEL 16: Flat Top Area (y = 16)
| 함수 | 역할 | Y 높이 |
|------|------|--------|
| `createFlatTopGround(scene)` | 경사 상단 평지 | 16.01 |
| `createFlatTopRoad(scene)` | 경사 상단 도로 | 16.02 |
| `createSlopedAreaForestGround(scene)` | 경사 지역 숲 지면 | 16.01 |

### 메인 진입점
| 함수 | 역할 |
|------|------|
| `createGround(scene)` | 모든 지면 생성 (위 함수들 순서대로 호출) |

---

## city-road.js
도로 및 교통 인프라 (지면은 city-ground.js로 이동됨).

| 함수 | 역할 |
|------|------|
| `createRoads(scene)` | 도로, 가드레일, 옹벽 생성 (지면 제외) |
| `createCrosswalks(scene)` | 횡단보도 생성 |

---

## city-house.js
주거 지역 건물.

| 함수 | 역할 |
|------|------|
| `createHouse(scene, x, z, groundY, config)` | 개별 주택 생성 |
| `createResidentialDistrict(scene)` | 주거 지구 생성 (25채) |
| `createSlopedResidentialArea(scene)` | 경사진 주거 지역 생성 |

---

## city-hotel.js
호텔 건물.

| 함수 | 역할 |
|------|------|
| `createPinkHotel(scene, groundY)` | 핑크 호텔 (그랜드 부다페스트 스타일) 생성 |

---

## city-building.js
고층 빌딩 (남쪽 지면은 city-ground.js로 이동됨).

| 함수 | 역할 |
|------|------|
| `checkBuildingOverlap(b1, b2)` | 건물 겹침 검사 |
| `getBuildingVolume(building)` | 건물 부피 계산 |
| `removeOverlappingBuildings(scene, buildings)` | 겹치는 건물 제거 |
| `createMainTower(scene, x, z, groundY, config)` | 메인 타워 생성 |
| `createSmallBuilding(scene, x, z, groundY, config)` | 소형 건물 생성 |
| `createLeftBuildings(scene)` | 좌측 빌딩 그룹 생성 |
| `createRightBuildings(scene)` | 우측 빌딩 그룹 생성 |
| `createCenterBuildings(scene)` | 중앙 빌딩 그룹 생성 |
| `createSouthBuildings(scene)` | 남쪽 빌딩 그룹 생성 (가로등 포함) |
| `createDeadEnd(scene, side)` | 도로 막다른 길 생성 |

---

## city-shop.js
상업 시설.

| 함수 | 역할 |
|------|------|
| `createShopBuilding(scene, x, z, groundY, config)` | 상점 건물 생성 |
| `createVerticalSign(scene, x, z, groundY)` | 세로 간판 생성 |
| `createShoppingDistrict(scene)` | 쇼핑 지구 생성 |
| `createVendorStall(scene, x, z, groundY)` | 노점상 생성 |
| `createVendorStalls(scene)` | 모든 노점상 배치 |
| `createStandingSign(scene, x, z, rotation)` | 스탠딩 사인 생성 |

---

## city-park.js
공원 및 놀이터 (지면/경로는 city-ground.js로 이동됨).

| 함수 | 역할 |
|------|------|
| `createParks(scene)` | 공원 시설물 생성 (지면 제외) |

내부 함수: createParkTree, createParkBench, createFlowerBed, createFountain, createParkLampPost, createSwingSet, createSeesaw, createSandbox, createSlide, createSpringRider, createPlaygroundFence

---

## city-tree.js
나무 및 숲 (지면은 city-ground.js로 이동됨).

| 함수 | 역할 |
|------|------|
| `createTree(scene, x, z, groundY)` | 가로수 생성 (3가지 타입) |
| `createAllTrees(scene)` | 모든 가로수 배치 |
| `createForestTree(scene, x, z, groundY)` | 숲 나무 생성 |
| `createForest(scene)` | 주거지역 뒤 숲 생성 (나무만) |

---

## city-streetlamp.js
가로등.

| 함수 | 역할 |
|------|------|
| `createStreetLamp(scene, x, z, groundY, rotation)` | 일반 가로등 생성 |
| `createTStreetLamp(scene, x, z, groundY, rotation)` | T자형 가로등 생성 |
| `createAllStreetLamps(scene)` | 모든 가로등 배치 |

---

## city-infrastructure.js
기반시설.

| 함수 | 역할 |
|------|------|
| `createZigzagStairs(scene)` | 지그재그 계단 생성 (y=10 → y=0) |
| `createUtilityPole(scene, x, z, groundY, rotation)` | 전봇대 생성 |
| `createPowerLine(scene, startX, endX, z, y, sag)` | 전선 생성 |
| `createUtilitySystem(scene)` | 전력 시스템 전체 생성 |

---

## city-furniture.js
거리 가구 및 시설물.

| 함수 | 역할 |
|------|------|
| `createStreetBench(scene, x, z, groundY, rotation)` | 거리 벤치 |
| `createPostBox(scene, x, z, groundY)` | 우체통 (홍콩 스타일) |
| `createBusStop(scene, x, z, groundY, rotation)` | 버스 정류장 (쉘터 포함) |
| `createTrashCan(scene, x, z, groundY)` | 쓰레기통 |
| `createVendingMachine(scene, x, z, groundY, rotation, type)` | 자판기 (음료/스낵) |
| `createPhoneBooth(scene, x, z, groundY, rotation)` | 전화 부스 |
| `createPlanter(scene, x, z, groundY)` | 화분/플랜터 |
| `createBollard(scene, x, z, groundY)` | 볼라드 |
| `createNewspaperStand(scene, x, z, groundY, rotation)` | 신문 가판대 |
| `createBicycleRack(scene, x, z, groundY, rotation)` | 자전거 거치대 |
| `createAllFurniture(scene)` | 모든 거리 가구 배치 |

---

## city-environment.js
자연환경 (언덕, 산, 배경 숲) - 지면은 city-ground.js로 이동됨.

| 함수 | 역할 |
|------|------|
| `createSlopedAreaForest(scene)` | 경사 지역 숲 (나무만) |
| `createSlopedAreaEdgeHills(scene)` | 경사 지역 가장자리 언덕 |
| `createLeftNorthHills(scene)` | 좌측 북쪽 언덕 (놀이터 주변) |
| `createCurveWestForestAndMountains(scene)` | 곡선도로 서쪽 숲과 산 (나무, 언덕만) |
| `createHotelBackForestAndMountains(scene)` | 호텔 뒤쪽 숲과 산 (나무, 터널, 산만) |

---

## city-camera.js
카메라 경로 및 스크롤 기반 이동 제어.

| 함수 | 역할 |
|------|------|
| `smootherStep(t)` | 부드러운 보간 함수 |
| `catmullRom(p0, p1, p2, p3, t)` | Catmull-Rom 스플라인 (스칼라) |
| `catmullRomVector(v0, v1, v2, v3, t)` | Catmull-Rom 스플라인 (벡터) |
| `getCameraPosition(progress)` | 진행도에 따른 카메라 위치/타겟 반환 |
| `updateCamera(camera, progress, lerpFactor)` | 카메라 위치 업데이트 |
| `getCurrentSection(progress)` | 현재 섹션 인덱스 반환 |
| `createScrollTracker(onProgressChange)` | 스크롤 추적기 생성 |

---

## city-content.js
네온 사인 및 콘텐츠 표지판 생성.

| 함수 | 역할 |
|------|------|
| `createNeonSignTexture(title, lines, glowColor, type)` | 네온 사인 텍스처 생성 |
| `createNeonSign(data)` | 네온 사인 메시 생성 |
| `createAllContent(scene)` | 모든 콘텐츠 사인 생성 |
| `updateContent(content, time, camera, scrollProgress)` | 콘텐츠 업데이트 (현재 비활성) |

---

## city-people.js
보행자 생성 및 이동 로직.

| 함수 | 역할 |
|------|------|
| `initBuildingZones()` | 건물 영역 초기화 |
| `createPerson(scene, x, z, pathType, pathIndex)` | 개별 보행자 생성 |
| `createAllPeople(scene)` | 모든 보행자 생성 |
| `checkPersonAhead(person, allPeople)` | 앞에 다른 보행자 있는지 검사 |
| `updatePerson(person, deltaTime, allPeople, crosswalkBounds)` | 보행자 상태 업데이트 |
| `tryStartCrossing(person, crosswalkBounds)` | 횡단보도 건너기 시도 |
| `updateCrossingPerson(person, deltaTime)` | 횡단 중인 보행자 업데이트 |
| `findNewSidewalkPath(person)` | 새 인도 경로 찾기 |
| `animateWalk(person, time)` | 걷기 애니메이션 |
| `updateAllPeople(people, deltaTime, time, crosswalkBounds)` | 모든 보행자 업데이트 |

---

## city-vehicles.js
차량 생성 및 이동 로직.

| 함수 | 역할 |
|------|------|
| `createSedanCar(color)` | 세단 차량 생성 |
| `createSUVCar(color)` | SUV 차량 생성 |
| `createSportsCar(color)` | 스포츠카 생성 |
| `createParkedTruck(scene, x, z, rotation)` | 주차된 트럭 생성 |
| `addWheels(group, radius, xOffset, zOffset)` | 차량에 바퀴 추가 |
| `createCar(scene, x, z, laneType, laneIndex)` | 차량 생성 (타입 랜덤) |
| `createAllCars(scene)` | 모든 차량 생성 |
| `updateBoundingBox(car)` | 차량 바운딩 박스 업데이트 |
| `isInIntersection(x, z)` | 교차로 내부인지 검사 |
| `checkCarCollision(car, allCars)` | 차량 충돌 검사 |
| `updateCar(car, deltaTime, allCars, people, crosswalkBounds)` | 차량 상태 업데이트 |
| `checkCrosswalkZone(car, crosswalkBounds)` | 횡단보도 영역 검사 |
| `isPersonOnCrosswalk(person, crosswalkBounds)` | 보행자가 횡단보도 위인지 검사 |
| `updateAllCars(cars, deltaTime, people, crosswalkBounds)` | 모든 차량 업데이트 |

---

## city-utils.js
공통 유틸리티 함수.

| 함수 | 역할 |
|------|------|
| `createOccludedWireframe(geometry, color, opacity)` | 가려지는 와이어프레임 생성 |
| `createTextTexture(text, options)` | 텍스트 텍스처 생성 |
| `easeInOutCubic(t)` | 이징 함수 (cubic) |
| `lerp(start, end, t)` | 선형 보간 함수 |

---

## 렌더링 순서 (city-main.js 내)

1. `createScene()` - 씬, 하늘
2. `createLighting()` - 조명
3. `createGround()` - 지면
4. `createRoads()` - 도로
5. `createCrosswalks()` - 횡단보도
6. `createAllBuildings()` 내부:
   - 주거 지역 (createResidentialDistrict, createSlopedResidentialArea)
   - 고층 빌딩 (createLeftBuildings 등)
   - 쇼핑 지구 (createShoppingDistrict)
   - 숲 및 환경 (createForest, createHotelBackForestAndMountains 등)
   - 계단 (createZigzagStairs)
   - 전력 시스템 (createUtilitySystem)
   - 노점상 (createVendorStalls)
   - 공원 (createParks)
   - 호텔 (createPinkHotel)
7. `createAllTrees()` - 가로수
8. `createAllStreetLamps()` - 가로등

---

## 좌표 시스템

### Y 레벨 (높이)
- `y = 0`: 메인 도로 레벨
- `y = 2`: 쇼핑 지구 레벨
- `y = 10`: 주거 지역 레벨
- `y = 16`: 경사 지역 최상단

### 주요 위치
- **메인 도로**: z = -20
- **남쪽 도로**: x = -55 (z = -35 ~ -250)
- **곡선 도로**: x = -40 중심, 반지름 15
- **쇼핑 지구**: x = -47.5 ~ 47.5, z = -20 ~ 18
- **주거 지역**: x = -47.5 ~ 47.5, z = 18 ~ 50
- **놀이터**: x = -40 중심, z = 6
- **분수 공원**: x = 35 중심, z = 6
- **핑크 호텔**: x = 68, z = 1
