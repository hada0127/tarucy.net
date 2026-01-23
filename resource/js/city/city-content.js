/**
 * city-content.js
 * Hong Kong Citypop Night City - Content Signs
 *
 * Content positioned within the new linear corridor layout:
 * - Residential area (y=12)
 * - Shopping district (y=2)
 * - Main road area (y=0)
 * - High-rise building area (y=0)
 */

import * as THREE from 'three';

// Content data - positioned within the new layout
const contentData = [
  // === Main Intro Sign (high visibility) ===
  {
    id: 'intro',
    title: 'hada0127',
    lines: ['DEVELOPER', 'STUDIO'],
    position: { x: 0, y: 18, z: 15 },
    rotation: { y: 0 },
    scale: 0.9,
    glowColor: 0xff00ff,
    type: 'main-sign'
  },

  // === Shopping District Signs (y=2 area) ===
  {
    id: 'profile',
    title: 'PROFILE',
    lines: ['Lee Eunkyu', 'Full-Stack Dev'],
    position: { x: -15, y: 8, z: 8 },
    rotation: { y: Math.PI / 6 },
    scale: 0.6,
    glowColor: 0xff4488,
    type: 'poster'
  },
  {
    id: 'solution',
    title: 'SOLUTION',
    lines: [
      '플랫폼 / 쇼핑몰',
      '숙박예약 / 수강신청',
      'ERP / CMS / API'
    ],
    position: { x: 12, y: 8, z: 8 },
    rotation: { y: -Math.PI / 6 },
    scale: 0.6,
    glowColor: 0x00ffff,
    type: 'sign'
  },
  {
    id: 'service',
    title: 'SERVICE',
    lines: [
      '웹사이트 제작',
      'IOT / KIOSK',
      '미디어 아트'
    ],
    position: { x: 0, y: 6, z: 4 },
    rotation: { y: 0 },
    scale: 0.55,
    glowColor: 0x00ffcc,
    type: 'poster'
  },

  // === Left Building Area Signs ===
  {
    id: 'frontend',
    title: 'FRONTEND',
    lines: [
      'React / Next.js',
      'TypeScript',
      'Svelte / GSAP'
    ],
    position: { x: -35, y: 20, z: -10 },
    rotation: { y: Math.PI / 4 },
    scale: 0.65,
    glowColor: 0xff0066,
    type: 'sign'
  },

  // === Right Building Area Signs ===
  {
    id: 'backend',
    title: 'BACKEND',
    lines: [
      'Node.js / Nest.js',
      'PostgreSQL',
      'AWS / Docker'
    ],
    position: { x: 35, y: 20, z: -10 },
    rotation: { y: -Math.PI / 4 },
    scale: 0.65,
    glowColor: 0x00ff88,
    type: 'sign'
  },

  // === Center High-Rise Area Signs ===
  {
    id: 'project',
    title: 'PROJECT',
    lines: ['포트폴리오', 'Gallery', 'Works'],
    position: { x: -8, y: 15, z: -20 },
    rotation: { y: Math.PI / 8 },
    scale: 0.6,
    glowColor: 0xff6699,
    type: 'sign'
  },
  {
    id: 'design',
    title: 'DESIGN',
    lines: ['UI/UX', 'Creative', 'Motion'],
    position: { x: 8, y: 15, z: -20 },
    rotation: { y: -Math.PI / 8 },
    scale: 0.6,
    glowColor: 0xff6699,
    type: 'wall-mural'
  },

  // === Main Road Area Signs ===
  {
    id: 'works',
    title: 'WORKS',
    lines: ['웹사이트', '앱 개발', '시스템'],
    position: { x: 20, y: 6, z: -5 },
    rotation: { y: -Math.PI / 5 },
    scale: 0.5,
    glowColor: 0xffffff,
    type: 'standing-sign'
  },
  {
    id: 'contact',
    title: 'CONTACT',
    lines: [
      '010-8454-0026',
      'work@tarucy.net',
      '@tarucy'
    ],
    position: { x: -20, y: 6, z: -5 },
    rotation: { y: Math.PI / 5 },
    scale: 0.55,
    glowColor: 0xffff00,
    type: 'sign'
  }
];

/**
 * Create neon sign texture - different styles per type
 */
function createNeonSignTexture(title, lines, glowColor, type = 'sign') {
  const r = (glowColor >> 16) & 255;
  const g = (glowColor >> 8) & 255;
  const b = glowColor & 255;
  const glowColorStr = `rgb(${r}, ${g}, ${b})`;

  let width, height, titleSize, lineSize, lineSpacing;

  if (type === 'main-sign') {
    width = 600; height = 400; titleSize = 72; lineSize = 36; lineSpacing = 50;
  } else if (type === 'poster') {
    width = 400; height = 500; titleSize = 40; lineSize = 24; lineSpacing = 40;
  } else if (type === 'truck-panel') {
    width = 500; height = 280; titleSize = 52; lineSize = 30; lineSpacing = 42;
  } else if (type === 'standing-sign') {
    width = 380; height = 300; titleSize = 44; lineSize = 26; lineSpacing = 38;
  } else if (type === 'wall-mural') {
    width = 450; height = 350; titleSize = 60; lineSize = 32; lineSpacing = 45;
  } else {
    width = 512; height = 450; titleSize = 48; lineSize = 28; lineSpacing = 45;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background - different styles per type
  if (type === 'main-sign') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(20, 10, 30, 0.95)');
    gradient.addColorStop(1, 'rgba(10, 5, 20, 0.98)');
    ctx.fillStyle = gradient;
  } else if (type === 'poster') {
    ctx.fillStyle = 'rgba(25, 20, 40, 0.9)';
  } else if (type === 'truck-panel') {
    ctx.fillStyle = 'rgba(60, 60, 75, 0.95)';
  } else if (type === 'standing-sign') {
    ctx.fillStyle = 'rgba(40, 35, 55, 0.92)';
  } else if (type === 'wall-mural') {
    ctx.fillStyle = 'rgba(20, 15, 30, 0.7)';
  } else {
    ctx.fillStyle = 'rgba(15, 15, 35, 0.95)';
  }
  ctx.fillRect(0, 0, width, height);

  // Border style - different per type
  if (type === 'truck-panel') {
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, width - 24, height - 24);
  } else if (type === 'standing-sign') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    const radius = 15;
    ctx.beginPath();
    ctx.roundRect(10, 10, width - 20, height - 20, radius);
    ctx.stroke();
  } else if (type === 'wall-mural') {
    ctx.shadowColor = glowColorStr;
    ctx.shadowBlur = 10;
  } else {
    ctx.shadowColor = glowColorStr;
    ctx.shadowBlur = type === 'main-sign' ? 40 : 25;
    ctx.strokeStyle = glowColorStr;
    ctx.lineWidth = type === 'main-sign' ? 6 : 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }
  ctx.shadowBlur = 0;

  // Title
  ctx.fillStyle = '#ffffff';
  if (type !== 'truck-panel' && type !== 'standing-sign') {
    ctx.shadowColor = glowColorStr;
    ctx.shadowBlur = type === 'main-sign' ? 30 : (type === 'wall-mural' ? 8 : 15);
  }
  ctx.font = `bold ${titleSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const titleY = type === 'main-sign' ? 60 : (type === 'truck-panel' ? 35 : (type === 'wall-mural' ? 50 : 40));
  ctx.fillText(title, width / 2, titleY);

  // Separator line - some types only
  if (type !== 'wall-mural') {
    const lineY = titleY + titleSize + 15;
    ctx.beginPath();
    ctx.moveTo(40, lineY);
    ctx.lineTo(width - 40, lineY);
    ctx.strokeStyle = type === 'truck-panel' ? '#999999' : (type === 'standing-sign' ? '#aaaaaa' : glowColorStr);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Content text
  ctx.fillStyle = type === 'main-sign' ? '#ffffff' : (type === 'wall-mural' ? '#ffccdd' : '#cccccc');
  ctx.font = `${lineSize}px Arial, sans-serif`;
  if (type !== 'truck-panel' && type !== 'standing-sign') {
    ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
    ctx.shadowBlur = 3;
  }

  const contentStartY = titleY + titleSize + (type === 'wall-mural' ? 35 : 45);
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, contentStartY + i * lineSpacing);
  });

  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { texture, width, height };
}

/**
 * Create neon sign mesh - different sizes per type
 */
function createNeonSign(data) {
  const group = new THREE.Group();
  const type = data.type || 'sign';

  const { texture, width: texW, height: texH } = createNeonSignTexture(
    data.title, data.lines, data.glowColor, type
  );

  // 3D size per type
  let meshWidth, meshHeight;
  if (type === 'main-sign') {
    meshWidth = 14 * data.scale;
    meshHeight = 9 * data.scale;
  } else if (type === 'poster') {
    meshWidth = 6 * data.scale;
    meshHeight = 8 * data.scale;
  } else if (type === 'truck-panel') {
    meshWidth = 5.5 * data.scale;
    meshHeight = 3 * data.scale;
  } else if (type === 'standing-sign') {
    meshWidth = 3.2 * data.scale;
    meshHeight = 2.5 * data.scale;
  } else if (type === 'wall-mural') {
    meshWidth = 8 * data.scale;
    meshHeight = 6 * data.scale;
  } else {
    meshWidth = 10 * data.scale;
    meshHeight = 8 * data.scale;
  }

  // Background frame (not for wall-mural)
  if (type !== 'wall-mural') {
    const frameGeom = new THREE.BoxGeometry(meshWidth + 0.4, meshHeight + 0.4, 0.5);
    let frameColor = 0x151525;
    if (type === 'main-sign') frameColor = 0x0a0a15;
    else if (type === 'truck-panel') frameColor = 0x3a3a4a;
    else if (type === 'standing-sign') frameColor = 0x252535;

    const frameMat = new THREE.MeshBasicMaterial({ color: frameColor });
    const frame = new THREE.Mesh(frameGeom, frameMat);
    frame.position.z = -0.3;
    group.add(frame);
  }

  // Sign body
  const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // Glow effect per type
  if (type === 'main-sign') {
    const glowGeom = new THREE.PlaneGeometry(meshWidth + 1, meshHeight + 1);
    const glowMat = new THREE.MeshBasicMaterial({
      color: data.glowColor,
      transparent: true,
      opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.z = -0.1;
    group.add(glow);
  } else if (type === 'wall-mural') {
    const glowGeom = new THREE.PlaneGeometry(meshWidth + 0.5, meshHeight + 0.5);
    const glowMat = new THREE.MeshBasicMaterial({
      color: data.glowColor,
      transparent: true,
      opacity: 0.08
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    glow.position.z = -0.05;
    group.add(glow);
  }

  // Position and rotation
  group.position.set(data.position.x, data.position.y, data.position.z);
  if (data.rotation) {
    group.rotation.y = data.rotation.y || 0;
  }

  group.userData = {
    id: data.id,
    baseY: data.position.y,
    glowColor: data.glowColor,
    type: type
  };

  return group;
}

/**
 * Create all content signs
 */
export function createAllContent(scene) {
  const signs = [];

  contentData.forEach(data => {
    const sign = createNeonSign(data);
    scene.add(sign);
    signs.push(sign);
  });

  return { signs };
}

/**
 * Update content (fixed - no animation)
 */
export function updateContent(content, time, camera, scrollProgress) {
  // Signs are fixed to buildings, no update needed
}
