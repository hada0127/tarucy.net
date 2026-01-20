/**
 * city-content.js
 * 건물에 부착된 간판/포스터 형태의 콘텐츠
 * 카메라 경로에 따라 자연스럽게 보이도록 배치
 */

import * as THREE from 'three';

// 콘텐츠 데이터 (건물 간판으로 배치)
const contentData = [
  {
    id: 'profile',
    title: 'Profile',
    lines: ['Lee Eunkyu', 'Full-Stack Developer'],
    position: { x: -15, y: 18, z: -45 },
    rotation: { y: Math.PI * 0.15 },
    scale: 1.2,
    glowColor: 0xff00ff
  },
  {
    id: 'solution',
    title: 'Solution',
    lines: [
      '플랫폼 / 쇼핑몰',
      '숙박예약 / 수강신청',
      '홈페이지 / 마이크로사이트',
      'ERP / CMS / RMS',
      'Rest API 연동'
    ],
    position: { x: 15, y: 15, z: -15 },
    rotation: { y: -Math.PI * 0.1 },
    scale: 1.0,
    glowColor: 0x00ffff
  },
  {
    id: 'skill-frontend',
    title: 'Frontend',
    lines: [
      'React / Next.js',
      'Svelte / SvelteKit',
      'TypeScript / JavaScript',
      'SCSS / GSAP / D3',
      'Mobile & Desktop App'
    ],
    position: { x: -18, y: 16, z: 20 },
    rotation: { y: Math.PI * 0.2 },
    scale: 1.0,
    glowColor: 0xff0066
  },
  {
    id: 'skill-backend',
    title: 'Backend',
    lines: [
      'Node.js / Nest.js / hono',
      'PHP / Python / JAVA',
      'PostgreSQL / MongoDB',
      'AWS Infrastructure',
      'Docker / CI/CD'
    ],
    position: { x: 18, y: 14, z: 40 },
    rotation: { y: -Math.PI * 0.15 },
    scale: 1.0,
    glowColor: 0x00ff88
  },
  {
    id: 'contact',
    title: 'Contact',
    lines: [
      'Phone: 010-8454-0026',
      'Email: work@tarucy.net',
      'Kakao: @tarucy'
    ],
    position: { x: -12, y: 12, z: 65 },
    rotation: { y: Math.PI * 0.1 },
    scale: 1.1,
    glowColor: 0xffff00
  }
];

/**
 * 네온 간판 텍스처 생성
 */
function createNeonSignTexture(title, lines, glowColor, options = {}) {
  const {
    width = 512,
    height = 600,
    bgColor = 'rgba(15, 15, 35, 0.95)',
    titleColor = '#ffffff'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 배경 (약간 투명한 어두운 배경)
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // 글로우 색상을 CSS 색상으로 변환
  const r = (glowColor >> 16) & 255;
  const g = (glowColor >> 8) & 255;
  const b = glowColor & 255;
  const glowColorStr = `rgb(${r}, ${g}, ${b})`;

  // 외부 글로우 테두리
  ctx.shadowColor = glowColorStr;
  ctx.shadowBlur = 30;
  ctx.strokeStyle = glowColorStr;
  ctx.lineWidth = 4;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // 내부 테두리
  ctx.shadowBlur = 15;
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
  ctx.lineWidth = 2;
  ctx.strokeRect(25, 25, width - 50, height - 50);
  ctx.shadowBlur = 0;

  // 타이틀 (네온 효과)
  ctx.fillStyle = titleColor;
  ctx.shadowColor = glowColorStr;
  ctx.shadowBlur = 20;
  ctx.font = 'bold 52px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(title, width / 2, 45);

  // 구분선 (네온)
  ctx.beginPath();
  ctx.moveTo(50, 115);
  ctx.lineTo(width - 50, 115);
  ctx.strokeStyle = glowColorStr;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 내용 텍스트
  ctx.fillStyle = '#dddddd';
  ctx.font = '28px Arial, sans-serif';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 5;

  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 155 + i * 55);
  });

  ctx.shadowBlur = 0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * 네온 간판 메시 생성
 */
function createNeonSign(data) {
  const group = new THREE.Group();

  const texture = createNeonSignTexture(data.title, data.lines, data.glowColor);

  // 간판 크기 (내용에 따라 조정)
  const baseWidth = 10;
  const baseHeight = 12;
  const width = baseWidth * data.scale;
  const height = baseHeight * data.scale;

  // 간판 배경 프레임
  const frameGeom = new THREE.BoxGeometry(width + 0.5, height + 0.5, 0.3);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x111122,
    roughness: 0.3,
    metalness: 0.7,
    emissive: data.glowColor,
    emissiveIntensity: 0.1
  });
  const frame = new THREE.Mesh(frameGeom, frameMat);
  frame.position.z = -0.2;
  group.add(frame);

  // 간판 본체
  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // 네온 글로우 라이트
  const light = new THREE.PointLight(data.glowColor, 1.5, 30);
  light.position.z = 3;
  group.add(light);

  // 위치 및 회전 설정
  group.position.set(data.position.x, data.position.y, data.position.z);
  if (data.rotation) {
    group.rotation.y = data.rotation.y || 0;
  }

  group.userData = {
    id: data.id,
    baseY: data.position.y,
    glowColor: data.glowColor
  };

  return group;
}

/**
 * 모든 콘텐츠 간판 생성
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
 * 콘텐츠 업데이트 (고정 - 애니메이션 없음)
 */
export function updateContent(content, time, camera, scrollProgress) {
  // 간판은 건물에 고정되어 있으므로 업데이트 불필요
}
