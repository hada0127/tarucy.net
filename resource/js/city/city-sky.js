/**
 * city-sky.js
 * Hong Kong Citypop Night City - Sky, Scene, Renderer, Camera, Lighting
 *
 * Contains:
 * - Night sky texture generation
 * - Sky sphere creation
 * - Scene, renderer, camera setup
 * - Lighting configuration
 * - Distant silhouettes (mountains north, buildings south)
 * - Resize handler
 */

import * as THREE from 'three';

/**
 * Vaporwave/Cyberpunk night sky texture for sky sphere
 */
function createNightSkyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Gradient sky - darker at top, reddish/warm glow at horizon (0.5 = horizon)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#050508');    // Very dark at top (zenith)
  gradient.addColorStop(0.15, '#08080f');
  gradient.addColorStop(0.25, '#0a0a14');
  gradient.addColorStop(0.35, '#0f0f1a');
  gradient.addColorStop(0.42, '#151520');
  gradient.addColorStop(0.46, '#1a1525');  // Transition to warm
  gradient.addColorStop(0.48, '#251828');
  gradient.addColorStop(0.5, '#352838');   // Horizon - reddish
  gradient.addColorStop(0.52, '#453040');  // Below horizon - warm reddish
  gradient.addColorStop(0.55, '#352838');
  gradient.addColorStop(0.6, '#1a1525');
  gradient.addColorStop(1, '#0a0a14');     // Below (mirror)

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Moon (pink/salmon) - positioned behind hotel (+X direction)
  const moonX = canvas.width * 0.513; // Behind hotel direction (1050/2048)
  const moonY = canvas.height * 0.371; // Upper sky (380/1024)
  const moonRadius = 15;

  const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius);
  moonGradient.addColorStop(0, '#ffb8a8');
  moonGradient.addColorStop(0.5, '#ff9080');
  moonGradient.addColorStop(0.85, '#e87878');
  moonGradient.addColorStop(1, 'rgba(200, 100, 120, 0)');

  ctx.fillStyle = moonGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Moon glow (pink) - subtle
  const glowGradient = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2);
  glowGradient.addColorStop(0, 'rgba(255, 150, 140, 0.12)');
  glowGradient.addColorStop(0.5, 'rgba(230, 120, 140, 0.04)');
  glowGradient.addColorStop(1, 'rgba(200, 100, 150, 0)');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Stars - many tiny stars spread across upper sky
  const starCount = 4500;
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.635; // Upper portion of sky (650/1024)
    const size = Math.random() * 0.4 + 0.1; // Very tiny stars (0.1 ~ 0.5)
    const brightness = 0.1 + Math.random() * 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/**
 * Create sky sphere that surrounds the scene
 */
function createSkySphere(scene) {
  const skyGeometry = new THREE.SphereGeometry(1000, 64, 64);
  const skyTexture = createNightSkyTexture();

  const skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide, // Render inside of sphere
    fog: false, // Sky should not be affected by fog
    depthWrite: false
  });

  const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
  skySphere.renderOrder = -1; // Render first (behind everything)
  scene.add(skySphere);

  return skySphere;
}

/**
 * Create distant silhouette panels around the city
 * North: Triangle panels (mountains)
 * South: Rectangle panels (buildings)
 */
function createDistantSilhouettes(scene) {
  const silhouetteMat = new THREE.MeshBasicMaterial({
    color: 0x080810,
    side: THREE.DoubleSide,
    fog: false
  });

  const radius = 400; // Distance from center
  const numPanels = 60;

  for (let i = 0; i < numPanels; i++) {
    const angle = (i / numPanels) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Determine if north (z > 0) or south (z < 0)
    const isNorth = z > 0;

    // Random height variation
    const baseHeight = 30 + Math.random() * 50;
    const width = 30 + Math.random() * 20;

    let mesh;

    if (isNorth) {
      // Mountain shape - triangle with narrower base
      const shape = new THREE.Shape();
      const height = baseHeight + Math.random() * 40;
      const baseWidth = height * (0.6 + Math.random() * 0.4); // Base proportional to height
      const halfBase = baseWidth / 2;

      shape.moveTo(-halfBase, 0);
      shape.lineTo(halfBase, 0);
      shape.lineTo((Math.random() - 0.5) * baseWidth * 0.15, height);
      shape.closePath();

      const geometry = new THREE.ShapeGeometry(shape);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
    } else {
      // Rectangle (building)
      const height = baseHeight + Math.random() * 30;
      const geometry = new THREE.PlaneGeometry(width, height);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
      mesh.position.y = height / 2;
    }

    // Position and rotate to face center
    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = -angle + Math.PI / 2;

    if (isNorth) {
      mesh.position.y = 0;
    }

    scene.add(mesh);
  }

  // Add additional layer for depth

  const radius2 = 500;
  const numPanels2 = 40;

  for (let i = 0; i < numPanels2; i++) {
    const angle = (i / numPanels2) * Math.PI * 2 + 0.05;
    const x = Math.cos(angle) * radius2;
    const z = Math.sin(angle) * radius2;

    const isNorth = z > 0;
    const baseHeight = 50 + Math.random() * 80;
    const width = 40 + Math.random() * 30;

    let mesh;

    if (isNorth) {
      const shape = new THREE.Shape();
      const height = baseHeight + Math.random() * 60;
      const baseWidth = height * (0.5 + Math.random() * 0.4);
      const halfBase = baseWidth / 2;

      shape.moveTo(-halfBase, 0);
      shape.lineTo(halfBase, 0);
      shape.lineTo((Math.random() - 0.5) * baseWidth * 0.15, height);
      shape.closePath();

      const geometry = new THREE.ShapeGeometry(shape);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
    } else {
      const height = baseHeight + Math.random() * 50;
      const geometry = new THREE.PlaneGeometry(width, height);
      mesh = new THREE.Mesh(geometry, silhouetteMat);
      mesh.position.y = height / 2;
    }

    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = -angle + Math.PI / 2;

    if (isNorth) {
      mesh.position.y = 0;
    }

    scene.add(mesh);
  }
}

/**
 * Create scene with sky and fog
 */
export function createScene() {
  const scene = new THREE.Scene();

  // Use sky sphere instead of fixed background
  createSkySphere(scene);

  // No scene.background - sky sphere handles it

  // Distant silhouettes (mountains north, buildings south)
  createDistantSilhouettes(scene);

  // Cyberpunk fog (only at edges, not center)
  scene.fog = new THREE.Fog(0x0a0a15, 100, 300);
  return scene;
}

/**
 * Create WebGL renderer
 */
export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // WebGL context lost 이벤트 처리
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL context lost. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  return renderer;
}

/**
 * Create perspective camera
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1500
  );
  return camera;
}

/**
 * Create lighting (MeshBasicMaterial doesn't need lights, but we add ambient for future use)
 */
export function createLighting(scene) {
  return {};
}

/**
 * Window resize handler
 */
export function handleResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
