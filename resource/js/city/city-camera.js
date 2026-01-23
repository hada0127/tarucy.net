/**
 * city-camera.js
 * Overhead Bird's Eye Camera System
 *
 * Camera orbits around the city from above, always looking at the center.
 * This provides a clear view of the entire layout structure.
 */

import * as THREE from 'three';

/**
 * Smooth easing function
 */
function smootherStep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Catmull-Rom spline interpolation
 */
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    )
  );
}

/**
 * Vector3 Catmull-Rom interpolation
 */
function catmullRomVector(v0, v1, v2, v3, t) {
  return new THREE.Vector3(
    catmullRom(v0.x, v1.x, v2.x, v3.x, t),
    catmullRom(v0.y, v1.y, v2.y, v3.y, t),
    catmullRom(v0.z, v1.z, v2.z, v3.z, t)
  );
}

/**
 * Overhead bird's eye camera keyframes
 * Camera orbits around the city from above, always looking at center
 */
export const cameraKeyframes = [
  // Start: Front right (positive X, positive Z)
  {
    pos: new THREE.Vector3(40, 45, 40),
    lookAt: new THREE.Vector3(0, 5, 0),
    label: 'intro'
  },
  // Front center (looking down at shopping district)
  {
    pos: new THREE.Vector3(0, 50, 50),
    lookAt: new THREE.Vector3(0, 5, 5),
    label: 'profile'
  },
  // Front left (negative X, positive Z)
  {
    pos: new THREE.Vector3(-40, 45, 40),
    lookAt: new THREE.Vector3(0, 5, 0),
    label: 'solution'
  },
  // Left side (looking at left buildings cluster)
  {
    pos: new THREE.Vector3(-50, 45, 0),
    lookAt: new THREE.Vector3(-10, 5, 0),
    label: 'service'
  },
  // Back left (negative X, negative Z)
  {
    pos: new THREE.Vector3(-40, 45, -30),
    lookAt: new THREE.Vector3(0, 5, -10),
    label: 'project'
  },
  // Back center (looking at high-rise buildings)
  {
    pos: new THREE.Vector3(0, 50, -40),
    lookAt: new THREE.Vector3(0, 10, -15),
    label: 'frontend'
  },
  // Back right (positive X, negative Z)
  {
    pos: new THREE.Vector3(40, 45, -30),
    lookAt: new THREE.Vector3(0, 5, -10),
    label: 'design'
  },
  // Right side (looking at right buildings cluster)
  {
    pos: new THREE.Vector3(50, 45, 0),
    lookAt: new THREE.Vector3(10, 5, 0),
    label: 'backend'
  },
  // Return to start for smooth loop
  {
    pos: new THREE.Vector3(45, 46, 35),
    lookAt: new THREE.Vector3(0, 5, 0),
    label: 'works'
  },
  // Final: close to start position (loop connection)
  {
    pos: new THREE.Vector3(42, 45, 38),
    lookAt: new THREE.Vector3(0, 5, 0),
    label: 'contact'
  }
];

/**
 * Get camera position based on scroll progress (Catmull-Rom spline)
 */
export function getCameraPosition(progress) {
  const numSegments = cameraKeyframes.length - 1;
  const scaledProgress = progress * numSegments;
  const segment = Math.min(Math.floor(scaledProgress), numSegments - 1);
  const segmentProgress = scaledProgress - segment;

  // Select 4 points for Catmull-Rom (with loop handling)
  const getIndex = (i) => {
    const len = cameraKeyframes.length;
    return ((i % len) + len) % len;
  };

  const i0 = getIndex(segment - 1);
  const i1 = getIndex(segment);
  const i2 = getIndex(segment + 1);
  const i3 = getIndex(segment + 2);

  const p0 = cameraKeyframes[i0];
  const p1 = cameraKeyframes[i1];
  const p2 = cameraKeyframes[i2];
  const p3 = cameraKeyframes[i3];

  const eased = smootherStep(segmentProgress);

  // Catmull-Rom spline for smooth curve interpolation
  const pos = catmullRomVector(p0.pos, p1.pos, p2.pos, p3.pos, eased);
  const lookAt = catmullRomVector(p0.lookAt, p1.lookAt, p2.lookAt, p3.lookAt, eased);

  return { pos, lookAt, currentSection: p1.label };
}

/**
 * Update camera position
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
 * Get current section label
 */
export function getCurrentSection(progress) {
  const numSegments = cameraKeyframes.length - 1;
  const segment = Math.min(Math.floor(progress * numSegments), numSegments - 1);
  return cameraKeyframes[segment].label;
}

/**
 * Create scroll tracker
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
