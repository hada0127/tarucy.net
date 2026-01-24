# Hong Kong Citypop Night City - 파일 및 함수 문서

## 파일 개요

| 파일명 | 역할 |
|--------|------|
| city-main.js | 메인 진입점, 씬 초기화 및 애니메이션 루프 |
| city-scene.js | 씬, 카메라, 렌더러, 지면, 도로, 하늘 생성 |
| city-buildings.js | 건물, 공원, 나무, 가로등, 언덕, 숲 등 구조물 생성 |
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
| `initCity()` | 씬, 카메라, 렌더러 초기화 및 모든 요소 생성, 애니메이션 시작 |

---

## city-scene.js
씬의 기본 구성요소 생성 (하늘, 지면, 도로, 조명).

| 함수 | 역할 |
|------|------|
| `createNightSkyTexture()` | 밤하늘 텍스처 생성 (별, 그라데이션) |
| `createSkySphere(scene)` | 하늘 구체 생성 |
| `createScene()` | Three.js 씬 생성 및 하늘 추가 |
| `createRenderer(container)` | WebGL 렌더러 생성 |
| `createCamera()` | 퍼스펙티브 카메라 생성 |
| `createLighting(scene)` | 조명 설정 (ambient, directional) |
| `createGround(scene)` | 다층 지면 생성 (Level 1~5: 도로, 쇼핑가, 주거지역) |
| `createRoad(scene, x, z, y, width, length, rotation)` | 도로 헬퍼 함수 |
| `createRoads(scene)` | 모든 도로 생성 (메인도로, 곡선도로, 남쪽도로, 횡단보도) |
| `createCrosswalks(scene)` | 횡단보도 생성 및 bounds 반환 |
| `createDistantSilhouettes(scene)` | 원거리 건물 실루엣 생성 |
| `handleResize(camera, renderer)` | 윈도우 리사이즈 핸들러 |

---

## city-buildings.js
건물, 공원, 자연환경 등 모든 구조물 생성.

### 유틸리티
| 함수 | 역할 |
|------|------|
| `randomColor(palette)` | 팔레트에서 랜덤 색상 선택 |

### 주거 건물
| 함수 | 역할 |
|------|------|
| `createHouse(scene, x, z, groundY, config)` | 개별 주택 생성 |
| `createResidentialDistrict(scene)` | 주거 지구 생성 (25채) |
| `createSlopedResidentialArea(scene)` | 경사진 주거 지역 생성 |

### 상업 건물
| 함수 | 역할 |
|------|------|
| `createShopBuilding(scene, x, z, groundY, config)` | 상점 건물 생성 |
| `createVerticalSign(scene, x, z, groundY)` | 세로 간판 생성 |
| `createShoppingDistrict(scene)` | 쇼핑 지구 생성 |
| `createPinkHotel(scene, groundY)` | 핑크 호텔 (그랜드 부다페스트 스타일) 생성 |

### 고층 건물
| 함수 | 역할 |
|------|------|
| `createMainTower(scene, x, z, groundY, config)` | 메인 타워 생성 |
| `createSmallBuilding(scene, x, z, groundY, config)` | 소형 건물 생성 |
| `createLeftBuildings(scene)` | 좌측 빌딩 그룹 생성 |
| `createRightBuildings(scene)` | 우측 빌딩 그룹 생성 |
| `createCenterBuildings(scene)` | 중앙 빌딩 그룹 생성 |
| `createSouthBuildings(scene)` | 남쪽 빌딩 그룹 생성 |

### 자연환경
| 함수 | 역할 |
|------|------|
| `createForestTree(scene, x, z, groundY)` | 숲 나무 생성 |
| `createForest(scene)` | 주거지역 뒤 숲 생성 |
| `createTree(scene, x, z, groundY)` | 가로수 생성 (3가지 타입) |
| `createAllTrees(scene)` | 모든 가로수 배치 |
| `createSlopedAreaForest(scene)` | 경사 지역 숲 생성 |
| `createSlopedAreaEdgeHills(scene)` | 경사 지역 가장자리 언덕 |
| `createLeftNorthHills(scene)` | 좌측 북쪽 언덕 (놀이터 주변) |
| `createCurveWestForestAndMountains(scene)` | 곡선도로 서쪽 숲과 산 |
| `createHotelBackForestAndMountains(scene)` | 호텔 뒤쪽 숲과 산 |

### 인프라
| 함수 | 역할 |
|------|------|
| `createZigzagStairs(scene)` | 지그재그 계단 생성 (y=10 → y=0) |
| `createUtilityPole(scene, x, z, groundY, rotation)` | 전봇대 생성 |
| `createPowerLine(scene, startX, endX, z, y, sag)` | 전선 생성 |
| `createUtilitySystem(scene)` | 전력 시스템 전체 생성 |
| `createStreetLamp(scene, x, z, groundY, rotation)` | 일반 가로등 생성 |
| `createTStreetLamp(scene, x, z, groundY, rotation)` | T자형 가로등 생성 |
| `createAllStreetLamps(scene)` | 모든 가로등 배치 |
| `createDeadEnd(scene, side)` | 도로 막다른 길 생성 |

### 상업 시설
| 함수 | 역할 |
|------|------|
| `createVendorStall(scene, x, z, groundY)` | 노점상 생성 |
| `createVendorStalls(scene)` | 모든 노점상 배치 |

### 공원 및 놀이터
| 함수 | 역할 |
|------|------|
| `createParkTree(scene, x, z, groundY)` | 공원 나무 생성 |
| `createParkBench(scene, x, z, groundY, rotation)` | 공원 벤치 생성 |
| `createFlowerBed(scene, x, z, groundY)` | 화단 생성 |
| `createFountain(scene, x, z, groundY)` | 분수대 생성 |
| `createParkLampPost(scene, x, z, groundY)` | 공원 가로등 생성 |
| `createSwingSet(scene, x, z, groundY)` | 그네 생성 |
| `createSeesaw(scene, x, z, groundY)` | 시소 생성 |
| `createSandbox(scene, x, z, groundY)` | 모래놀이터 생성 |
| `createSlide(scene, x, z, groundY)` | 미끄럼틀 생성 |
| `createSpringRider(scene, x, z, groundY, color)` | 스프링 라이더 생성 |
| `createPlaygroundFence(scene, x, z, groundY, length, rotation)` | 놀이터 펜스 생성 |
| `createParks(scene)` | 공원 및 놀이터 전체 생성 |

### 내보내기 함수
| 함수 | 역할 |
|------|------|
| `createAllBuildings(scene)` | 모든 건물 생성 (메인 export) |
| `createAllTreesExport(scene)` | 나무 export 래퍼 |
| `createAllStreetLampsExport(scene)` | 가로등 export 래퍼 |
| `createStandingSign(scene, x, z, rotation)` | 스탠딩 사인 생성 |
| `createAllBenches(scene)` | 모든 벤치 생성 |

### 유틸리티 (빌딩 관리)
| 함수 | 역할 |
|------|------|
| `checkBuildingOverlap(b1, b2)` | 건물 겹침 검사 |
| `getBuildingVolume(building)` | 건물 부피 계산 |
| `removeOverlappingBuildings(scene, buildings)` | 겹치는 건물 제거 |

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

## 좌표 시스템

### Y 레벨 (높이)
- `y = 0`: 메인 도로 레벨
- `y = 2`: 쇼핑 지구 레벨
- `y = 10`: 주거 지역 레벨

### 주요 위치
- **메인 도로**: z = -20
- **남쪽 도로**: x = -55 (z = -35 ~ -250)
- **곡선 도로**: x = -35 중심, 반지름 20
- **쇼핑 지구**: x = -47.5 ~ 47.5, z = -20 ~ 18
- **주거 지역**: x = -47.5 ~ 47.5, z = 18 ~ 50
- **놀이터**: x = -40 중심, z = 6
- **분수 공원**: x = 35 중심, z = 6
- **핑크 호텔**: x = 68, z = 1
