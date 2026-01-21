/**
 * city-main.js
 * 3D 밤의 도시 메인 진입점
 */

import * as THREE from 'three';
import { createScene, createRenderer, createCamera, createGround, createRoads, createCrosswalks, createLighting, handleResize } from './city-scene.js';
import { createAllBuildings, createAllTrees, createAllStreetLamps, createStandingSign } from './city-buildings.js';
import { createAllPeople, updateAllPeople } from './city-people.js';
import { createAllCars, updateAllCars, createParkedTruck } from './city-vehicles.js';
import { createAllContent, updateContent } from './city-content.js';
import { createScrollTracker, updateCamera } from './city-camera.js';

/**
 * 3D 도시 초기화
 */
export function initCity() {
  const container = document.getElementById('city-container');
  if (!container) {
    console.error('city-container not found');
    return;
  }

  // 씬, 렌더러, 카메라 생성
  const scene = createScene();
  const renderer = createRenderer(container);
  const camera = createCamera();

  // 초기 카메라 위치 (키프레임 0과 일치)
  camera.position.set(5, 16, -72);
  const initialLookAt = new THREE.Vector3(-9, 18, -72);
  camera.lookAt(initialLookAt);
  camera.userData.targetLookAt = initialLookAt.clone();

  // 조명 추가
  createLighting(scene);

  // 환경 생성
  createGround(scene);
  createRoads(scene);

  // 횡단보도 생성
  const crosswalkBounds = createCrosswalks(scene);

  // 도시 요소 생성
  createAllBuildings(scene);
  createAllTrees(scene);
  createAllStreetLamps(scene);

  // 골목 요소 생성
  // 정지된 트럭 (골목 입구)
  createParkedTruck(scene, -14, 25, Math.PI / 2);

  // 입간판 (골목 안)
  createStandingSign(scene, -16, 30, Math.PI / 4);

  // 사람 생성
  const people = createAllPeople(scene);

  // 자동차 생성
  const cars = createAllCars(scene);

  // 콘텐츠 생성
  const content = createAllContent(scene);

  // 스크롤 추적
  let scrollProgress = 0;
  const scrollTracker = createScrollTracker((progress) => {
    scrollProgress = progress;
  });

  // 리사이즈 핸들러
  handleResize(camera, renderer);

  // 애니메이션 상태
  let lastTime = 0;
  let time = 0;

  /**
   * 애니메이션 루프
   */
  function animate(currentTime) {
    requestAnimationFrame(animate);

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    time += deltaTime;

    // 스크롤 진행률 업데이트 (lerp 계속 적용)
    scrollTracker.update();

    // 카메라 업데이트
    updateCamera(camera, scrollProgress);

    // 사람 업데이트 (횡단보도 정보 전달)
    updateAllPeople(people, deltaTime, time, crosswalkBounds);

    // 자동차 업데이트 (사람, 횡단보도 정보 전달)
    updateAllCars(cars, deltaTime, people, crosswalkBounds);

    // 콘텐츠 업데이트 (카메라와 스크롤 진행률 전달)
    updateContent(content, time, camera, scrollProgress);

    // 렌더링
    renderer.render(scene, camera);
  }

  animate(0);

  return { scene, camera, renderer, content };
}

// DOM 준비되면 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCity);
} else {
  initCity();
}
