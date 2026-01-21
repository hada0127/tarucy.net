/**
 * city-content.js
 * 건물 벽면에 부착된 간판/포스터 형태의 콘텐츠
 */

import * as THREE from 'three';

// 콘텐츠 데이터 - 건물 벽면에 직접 부착
// 건물 중심 X: 왼쪽 약 -16~-18, 오른쪽 약 +18~22
// 건물 너비: 10~15, 높이: 20~55
// 간판은 건물보다 작게 (너비 8 이하)
const contentData = [
  // 인트로 - hada0127 메인 간판 (왼쪽 건물 측면)
  {
    id: 'intro',
    title: 'hada0127',
    lines: ['DEVELOPER', 'STUDIO'],
    position: { x: -9, y: 18, z: -72 },
    rotation: { y: Math.PI / 2 },
    scale: 0.7,
    glowColor: 0xff00ff,
    type: 'main-sign'
  },
  // Profile - 같은 건물 아래쪽
  {
    id: 'profile',
    title: 'PROFILE',
    lines: ['Lee Eunkyu', 'Full-Stack Dev'],
    position: { x: -11, y: 12, z: -78 },
    rotation: { y: Math.PI / 2 },
    scale: 0.6,
    glowColor: 0xff4488,
    type: 'poster'
  },
  // Solution - 오른쪽 건물 정면
  {
    id: 'solution',
    title: 'SOLUTION',
    lines: [
      '플랫폼 / 쇼핑몰',
      '숙박예약 / 수강신청',
      'ERP / CMS / API'
    ],
    position: { x: 13, y: 18, z: -5 },
    rotation: { y: -Math.PI / 2 },
    scale: 0.7,
    glowColor: 0x00ffff,
    type: 'sign'
  },
  // SERVICE - 같은 건물 아래쪽
  {
    id: 'solution-back',
    title: 'SERVICE',
    lines: [
      '웹사이트 제작',
      'IOT / KIOSK',
      '미디어 아트'
    ],
    position: { x: 13, y: 10, z: -5 },
    rotation: { y: -Math.PI / 2 },
    scale: 0.6,
    glowColor: 0x00ffcc,
    type: 'poster'
  },
  // Skill Frontend - 왼쪽 건물 (행 10-18과 25-33 사이 gap)
  {
    id: 'skill-frontend',
    title: 'FRONTEND',
    lines: [
      'React / Next.js',
      'TypeScript',
      'Svelte / GSAP'
    ],
    position: { x: -11, y: 18, z: 21 },
    rotation: { y: Math.PI / 2 },
    scale: 0.7,
    glowColor: 0xff0066,
    type: 'sign'
  },
  // 골목 - 트럭 짐칸 패널
  {
    id: 'alley-truck',
    title: 'PROJECT',
    lines: ['포트폴리오', 'Gallery'],
    position: { x: -12, y: 4, z: 25 },
    rotation: { y: 0 },
    scale: 0.55,
    glowColor: 0x888899,
    type: 'truck-panel'
  },
  // 골목 - 입간판
  {
    id: 'alley-sign',
    title: 'WORKS',
    lines: ['웹사이트', '앱 개발'],
    position: { x: -16, y: 4.5, z: 30 },
    rotation: { y: Math.PI / 4 },
    scale: 0.5,
    glowColor: 0xffffff,
    type: 'standing-sign'
  },
  // 골목 - 벽면 뮤럴
  {
    id: 'alley-wall',
    title: 'DESIGN',
    lines: ['UI/UX', 'Creative'],
    position: { x: -28, y: 8, z: 32 },
    rotation: { y: Math.PI / 2 },
    scale: 0.65,
    glowColor: 0xff6699,
    type: 'wall-mural'
  },
  // Backend - 대로 복귀 후 (오른쪽 건물)
  {
    id: 'skill-backend',
    title: 'BACKEND',
    lines: [
      'Node.js / Nest.js',
      'PostgreSQL',
      'AWS / Docker'
    ],
    position: { x: 12, y: 15, z: 36 },
    rotation: { y: -Math.PI / 2 },
    scale: 0.7,
    glowColor: 0x00ff88,
    type: 'sign'
  },
  // Contact - 오른쪽 건물 (BACKEND 다음, 건물 행 사이 gap에 배치)
  {
    id: 'contact',
    title: 'CONTACT',
    lines: [
      '010-8454-0026',
      'work@tarucy.net',
      '@tarucy'
    ],
    position: { x: 12, y: 14, z: 51 },
    rotation: { y: -Math.PI / 2 },
    scale: 0.7,
    glowColor: 0xffff00,
    type: 'sign'
  }
];

/**
 * 네온 간판 텍스처 생성 - 타입별 다른 스타일
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

  // 배경 - 타입별 다른 스타일
  if (type === 'main-sign') {
    // 메인 간판 - 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(20, 10, 30, 0.95)');
    gradient.addColorStop(1, 'rgba(10, 5, 20, 0.98)');
    ctx.fillStyle = gradient;
  } else if (type === 'poster') {
    // 포스터 - 살짝 밝은 배경
    ctx.fillStyle = 'rgba(25, 20, 40, 0.9)';
  } else if (type === 'truck-panel') {
    // 트럭 짐칸 - 무광 회색 배경
    ctx.fillStyle = 'rgba(60, 60, 75, 0.95)';
  } else if (type === 'standing-sign') {
    // 입간판 - 밝은 배경
    ctx.fillStyle = 'rgba(40, 35, 55, 0.92)';
  } else if (type === 'wall-mural') {
    // 벽면 뮤럴 - 반투명 배경
    ctx.fillStyle = 'rgba(20, 15, 30, 0.7)';
  } else {
    ctx.fillStyle = 'rgba(15, 15, 35, 0.95)';
  }
  ctx.fillRect(0, 0, width, height);

  // 테두리 스타일 - 타입별 다름
  if (type === 'truck-panel') {
    // 트럭 패널 - 흰색 실선 테두리, 글로우 없음
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, width - 24, height - 24);
  } else if (type === 'standing-sign') {
    // 입간판 - 둥근 테두리, 글로우 없음
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    const radius = 15;
    ctx.beginPath();
    ctx.roundRect(10, 10, width - 20, height - 20, radius);
    ctx.stroke();
  } else if (type === 'wall-mural') {
    // 뮤럴 - 테두리 없음, 약한 글로우
    ctx.shadowColor = glowColorStr;
    ctx.shadowBlur = 10;
  } else {
    // 기존 네온 스타일
    ctx.shadowColor = glowColorStr;
    ctx.shadowBlur = type === 'main-sign' ? 40 : 25;
    ctx.strokeStyle = glowColorStr;
    ctx.lineWidth = type === 'main-sign' ? 6 : 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }
  ctx.shadowBlur = 0;

  // 타이틀
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

  // 구분선 - 일부 타입만
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

  // 내용 텍스트
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
 * 네온 간판 메시 생성 - 타입별 다른 크기와 스타일
 */
function createNeonSign(data) {
  const group = new THREE.Group();
  const type = data.type || 'sign';

  const { texture, width: texW, height: texH } = createNeonSignTexture(
    data.title, data.lines, data.glowColor, type
  );

  // 타입별 실제 3D 크기
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

  // 간판 배경 프레임 (타입별 다른 스타일)
  if (type !== 'wall-mural') {
    // 뮤럴은 프레임 없음
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

  // 간판 본체
  const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // 타입별 글로우 효과
  if (type === 'main-sign') {
    // 메인 간판 - 강한 글로우
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
    // 뮤럴 - 약한 글로우
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
  // truck-panel, standing-sign은 글로우 없음

  // 위치 및 회전 설정
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
