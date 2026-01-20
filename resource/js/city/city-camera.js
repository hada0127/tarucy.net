/**
 * city-camera.js
 * 부드러운 카메라 이동
 */

import * as THREE from 'three';

/**
 * 부드러운 이징
 */
function smootherStep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * 카메라 키프레임 - S자 곡선으로 구불구불 이동, 항상 앞을 바라봄
 */
export const cameraKeyframes = [
  // 0: 인트로 - 높이서 도시 전경
  {
    pos: new THREE.Vector3(0, 20, -80),
    lookAt: new THREE.Vector3(0, 8, -60),
    label: 'intro'
  },
  // 1: Profile - 오른쪽으로 휘어짐
  {
    pos: new THREE.Vector3(15, 10, -50),
    lookAt: new THREE.Vector3(10, 8, -30),
    label: 'profile'
  },
  // 2: Solution - 왼쪽으로 휘어짐
  {
    pos: new THREE.Vector3(-12, 8, -15),
    lookAt: new THREE.Vector3(-5, 6, 10),
    label: 'solution'
  },
  // 3: Skill - 오른쪽으로 휘어짐
  {
    pos: new THREE.Vector3(15, 10, 25),
    lookAt: new THREE.Vector3(8, 8, 50),
    label: 'skill'
  },
  // 4: Contact - 왼쪽으로 휘어짐
  {
    pos: new THREE.Vector3(-10, 7, 55),
    lookAt: new THREE.Vector3(-3, 5, 80),
    label: 'contact'
  },
  // 5: 엔딩 - 중앙으로 돌아오며 앞을 바라봄
  {
    pos: new THREE.Vector3(0, 12, 85),
    lookAt: new THREE.Vector3(0, 8, 110),
    label: 'ending'
  }
];

/**
 * 스크롤 진행률에 따른 카메라 위치
 */
export function getCameraPosition(progress) {
  const numSegments = cameraKeyframes.length - 1;
  const scaledProgress = progress * numSegments;
  const segment = Math.min(Math.floor(scaledProgress), numSegments - 1);
  const segmentProgress = scaledProgress - segment;

  const start = cameraKeyframes[segment];
  const end = cameraKeyframes[Math.min(segment + 1, cameraKeyframes.length - 1)];

  const eased = smootherStep(segmentProgress);

  const pos = new THREE.Vector3().lerpVectors(start.pos, end.pos, eased);
  const lookAt = new THREE.Vector3().lerpVectors(start.lookAt, end.lookAt, eased);

  return { pos, lookAt, currentSection: start.label };
}

/**
 * 카메라 업데이트
 */
export function updateCamera(camera, progress, lerpFactor = 0.08) {
  const { pos, lookAt } = getCameraPosition(progress);

  camera.position.lerp(pos, lerpFactor);

  if (!camera.userData.targetLookAt) {
    camera.userData.targetLookAt = lookAt.clone();
  }
  camera.userData.targetLookAt.lerp(lookAt, lerpFactor);
  camera.lookAt(camera.userData.targetLookAt);
}

/**
 * 현재 섹션
 */
export function getCurrentSection(progress) {
  const numSegments = cameraKeyframes.length - 1;
  const segment = Math.min(Math.floor(progress * numSegments), numSegments - 1);
  return cameraKeyframes[segment].label;
}

/**
 * 스크롤 트래커
 */
export function createScrollTracker(onProgressChange) {
  let scrollProgress = 0;
  const progressBar = document.getElementById('progress');
  const scrollHint = document.querySelector('.scroll-hint');

  function updateScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

    scrollProgress += (targetProgress - scrollProgress) * 0.25;

    if (progressBar) {
      progressBar.style.width = (scrollProgress * 100) + '%';
    }

    if (scrollHint) {
      scrollHint.style.opacity = scrollProgress > 0.02 ? '0' : '0.8';
    }

    if (onProgressChange) {
      onProgressChange(scrollProgress);
    }
  }

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  return {
    update: updateScroll,
    getProgress: () => scrollProgress
  };
}
