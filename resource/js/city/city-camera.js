/**
 * city-camera.js
 * Scroll-Based Camera Animation System
 *
 * Camera follows predefined keyframes based on scroll progress.
 * Supports smooth interpolation between positions and rotations.
 */

import * as THREE from 'three';

// ============================================================
// SCROLL KEYFRAMES (19 viewpoints)
// ============================================================

/**
 * Scroll keyframe data - positions and rotations for camera animation
 * yaw/pitch are in radians (converted from degrees in the plan)
 */
export const scrollKeyframes = [
  // 시작시점 (intro)
  { section: 'intro', pos: {x: 27.81, y: 1.60, z: -3.28}, yaw: -1.650, pitch: 0.440 },
  // 스킬 시점 (6개)
  { section: 'skills', pos: {x: 35.21, y: 1.60, z: 0.28}, yaw: 1.980, pitch: -0.040 },
  { section: 'skills', pos: {x: 29.70, y: 1.60, z: 2.66}, yaw: 1.980, pitch: -0.040 },
  { section: 'skills', pos: {x: -23.42, y: 1.60, z: 5.13}, yaw: 2.011, pitch: -0.010 },
  { section: 'skills', pos: {x: -23.42, y: 1.60, z: 5.13}, yaw: 0.510, pitch: 0.051 },
  { section: 'skills', pos: {x: -23.42, y: 1.60, z: -5.66}, yaw: -2.040, pitch: 0.169 },
  { section: 'skills', pos: {x: 16.34, y: 1.60, z: -6.99}, yaw: -2.191, pitch: 0.410 },
  // 솔루션 시점 (6개)
  { section: 'solution', pos: {x: 27.46, y: 1.60, z: -8.80}, yaw: -0.901, pitch: 0.560 },
  { section: 'solution', pos: {x: 27.46, y: 1.60, z: -8.80}, yaw: -0.180, pitch: 0.710 },
  { section: 'solution', pos: {x: 27.46, y: 1.60, z: -8.80}, yaw: 0.571, pitch: 0.470 },
  { section: 'solution', pos: {x: -48.00, y: 1.60, z: -14.00}, yaw: -0.241, pitch: 0.319 },
  { section: 'solution', pos: {x: -73.85, y: 37.26, z: 12.14}, yaw: -0.150, pitch: -0.161 },
  { section: 'solution', pos: {x: -73.85, y: 37.26, z: 12.14}, yaw: -0.960, pitch: -0.161 },
  // 연락처 시점 (3개)
  { section: 'contact', pos: {x: -40.62, y: 1.34, z: -8.28}, yaw: -1.231, pitch: -0.161 },
  { section: 'contact', pos: {x: 42.78, y: 1.60, z: -8.80}, yaw: -0.059, pitch: 0.080 },
  { section: 'contact', pos: {x: 42.92, y: 1.60, z: -11.05}, yaw: -0.059, pitch: -0.040 },
  // 마지막 시점 (3개)
  { section: 'final', pos: {x: 31.03, y: 1.60, z: 16.33}, yaw: -4.529, pitch: 0.019 },
  { section: 'final', pos: {x: 3.36, y: 10.72, z: 16.85}, yaw: -4.649, pitch: 0.201 },
  { section: 'final', pos: {x: -1.90, y: 11.58, z: 23.99}, yaw: -1.140, pitch: 0.290 }
];

// ============================================================
// DISTANCE-BASED SCROLL WEIGHTING
// ============================================================

/**
 * Calculate angle difference (shortest path)
 */
function angleDiff(a, b) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff);
}

/**
 * Calculate segment distance (position + rotation)
 */
function calculateSegmentDistance(from, to) {
  // Position distance
  const dx = to.pos.x - from.pos.x;
  const dy = to.pos.y - from.pos.y;
  const dz = to.pos.z - from.pos.z;
  const posDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Rotation distance (scaled to be comparable to position)
  const yawDiff = angleDiff(from.yaw, to.yaw);
  const pitchDiff = Math.abs(to.pitch - from.pitch);
  const rotDistance = (yawDiff + pitchDiff) * 10; // Scale rotation to ~meters

  // Combined distance with minimum threshold
  return Math.max(posDistance + rotDistance, 5); // Minimum 5 units to avoid too fast transitions
}

/**
 * Build cumulative progress array based on distances
 * Returns array where cumulativeProgress[i] = progress at keyframe i (0 to 1)
 */
function buildCumulativeProgress() {
  const distances = [];
  let totalDistance = 0;

  // Calculate distances between consecutive keyframes
  for (let i = 0; i < scrollKeyframes.length - 1; i++) {
    const dist = calculateSegmentDistance(scrollKeyframes[i], scrollKeyframes[i + 1]);
    distances.push(dist);
    totalDistance += dist;
  }

  // Build cumulative progress array
  const cumulative = [0]; // First keyframe at progress 0
  let accumulated = 0;

  for (let i = 0; i < distances.length; i++) {
    accumulated += distances[i];
    cumulative.push(accumulated / totalDistance);
  }

  return cumulative;
}

// Pre-calculate cumulative progress
const cumulativeProgress = buildCumulativeProgress();

/**
 * Convert linear scroll progress (0-1) to weighted progress based on distances
 * Uses binary search to find the correct segment
 */
export function getWeightedProgress(linearProgress) {
  const p = Math.max(0, Math.min(1, linearProgress));

  // Find which segment we're in
  let segmentIndex = 0;
  for (let i = 0; i < cumulativeProgress.length - 1; i++) {
    if (p >= cumulativeProgress[i] && p <= cumulativeProgress[i + 1]) {
      segmentIndex = i;
      break;
    }
  }

  // Calculate local progress within segment
  const segmentStart = cumulativeProgress[segmentIndex];
  const segmentEnd = cumulativeProgress[segmentIndex + 1];
  const segmentLength = segmentEnd - segmentStart;

  const localProgress = segmentLength > 0 ? (p - segmentStart) / segmentLength : 0;

  return {
    segment: segmentIndex,
    localProgress: Math.max(0, Math.min(1, localProgress)),
    from: scrollKeyframes[segmentIndex],
    to: scrollKeyframes[Math.min(segmentIndex + 1, scrollKeyframes.length - 1)]
  };
}

/**
 * Lerp angle with shortest path (handles wrap-around)
 */
export function lerpAngle(a, b, t) {
  // Normalize angles to -PI to PI range
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  while (b > Math.PI) b -= Math.PI * 2;
  while (b < -Math.PI) b += Math.PI * 2;

  let diff = b - a;

  // Take shortest path
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;

  return a + diff * t;
}

/**
 * Get scroll segment info from progress (0-1)
 * Returns segment index, local progress within segment, and keyframes
 */
export function getScrollSegment(progress) {
  const numSegments = scrollKeyframes.length - 1;
  const scaledProgress = Math.max(0, Math.min(1, progress)) * numSegments;
  const segment = Math.min(Math.floor(scaledProgress), numSegments - 1);
  const localProgress = scaledProgress - segment;

  return {
    segment,
    localProgress,
    from: scrollKeyframes[segment],
    to: scrollKeyframes[Math.min(segment + 1, scrollKeyframes.length - 1)]
  };
}

/**
 * Update camera position and rotation based on scroll progress
 * @param {THREE.Camera} camera - The camera to update
 * @param {Object} cameraState - Camera state object with yaw/pitch
 * @param {number} progress - Scroll progress (0-1)
 */
export function updateCameraFromScroll(camera, cameraState, progress) {
  // Use distance-weighted progress for natural scroll speed
  const { localProgress, from, to } = getWeightedProgress(progress);

  // Smooth easing function
  const eased = smootherStep(localProgress);

  // Interpolate position
  const x = from.pos.x + (to.pos.x - from.pos.x) * eased;
  const y = from.pos.y + (to.pos.y - from.pos.y) * eased;
  const z = from.pos.z + (to.pos.z - from.pos.z) * eased;

  camera.position.set(x, y, z);

  // Interpolate rotation (yaw/pitch)
  cameraState.yaw = lerpAngle(from.yaw, to.yaw, eased);
  cameraState.pitch = from.pitch + (to.pitch - from.pitch) * eased;

  // Apply rotation to camera
  const forward = new THREE.Vector3(
    -Math.sin(cameraState.yaw),
    0,
    -Math.cos(cameraState.yaw)
  );

  const lookTarget = new THREE.Vector3(
    camera.position.x + forward.x * 10,
    camera.position.y + Math.sin(cameraState.pitch) * 10,
    camera.position.z + forward.z * 10
  );

  camera.lookAt(lookTarget);

  return {
    section: from.section,
    progress
  };
}

/**
 * Get current section from scroll progress
 */
export function getSectionFromScroll(progress) {
  const { from } = getScrollSegment(progress);
  return from.section;
}

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
