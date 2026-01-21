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
 * 카메라 키프레임 - 건물 간판을 따라 이동
 */
export const cameraKeyframes = [
  // 0: 인트로 - hada0127 간판 (도로에서 왼쪽 건물 정면 바라보기)
  {
    pos: new THREE.Vector3(5, 16, -72),
    lookAt: new THREE.Vector3(-9, 18, -72),
    label: 'intro'
  },
  // 1: Profile 보기 (아래로)
  {
    pos: new THREE.Vector3(5, 12, -78),
    lookAt: new THREE.Vector3(-11, 12, -78),
    label: 'intro'
  },
  // 2: 앞으로 이동
  {
    pos: new THREE.Vector3(2, 10, -50),
    lookAt: new THREE.Vector3(0, 10, -30),
    label: 'profile'
  },
  // 3: 시선 전환
  {
    pos: new THREE.Vector3(0, 10, -25),
    lookAt: new THREE.Vector3(10, 14, -10),
    label: 'profile'
  },
  // 4: Solution 간판 (오른쪽 건물)
  {
    pos: new THREE.Vector3(-3, 14, -5),
    lookAt: new THREE.Vector3(13, 18, -5),
    label: 'solution'
  },
  // 5: SERVICE 간판
  {
    pos: new THREE.Vector3(-3, 10, -5),
    lookAt: new THREE.Vector3(13, 10, -5),
    label: 'solution'
  },
  // 6: 앞으로 이동
  {
    pos: new THREE.Vector3(0, 10, 10),
    lookAt: new THREE.Vector3(-5, 14, 20),
    label: 'skill'
  },
  // 7: Frontend 간판 (왼쪽 건물)
  {
    pos: new THREE.Vector3(5, 14, 21),
    lookAt: new THREE.Vector3(-11, 18, 21),
    label: 'skill'
  },
  // 8: 골목 입구 - 트럭 짐칸 콘텐츠 (왼쪽으로 진입)
  {
    pos: new THREE.Vector3(2, 8, 25),
    lookAt: new THREE.Vector3(-14, 4, 25),
    label: 'alley'
  },
  // 9: 골목 안 - 입간판
  {
    pos: new THREE.Vector3(-10, 5, 28),
    lookAt: new THREE.Vector3(-16, 4.5, 30),
    label: 'alley'
  },
  // 10: 골목 깊숙이 - 벽면 뮤럴
  {
    pos: new THREE.Vector3(-20, 6, 32),
    lookAt: new THREE.Vector3(-30, 8, 32),
    label: 'alley'
  },
  // 11: U턴 지점
  {
    pos: new THREE.Vector3(-25, 8, 35),
    lookAt: new THREE.Vector3(-15, 10, 30),
    label: 'alley'
  },
  // 12: 대로 복귀
  {
    pos: new THREE.Vector3(-10, 10, 34),
    lookAt: new THREE.Vector3(12, 15, 36),
    label: 'skill'
  },
  // 13: Backend 간판 (오른쪽 건물)
  {
    pos: new THREE.Vector3(-3, 12, 36),
    lookAt: new THREE.Vector3(12, 15, 36),
    label: 'skill'
  },
  // 14: Contact 간판 (마지막 - 오른쪽 건물)
  {
    pos: new THREE.Vector3(-3, 14, 51),
    lookAt: new THREE.Vector3(12, 14, 51),
    label: 'contact'
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
