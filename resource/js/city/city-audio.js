/**
 * city-audio.js
 * Web Audio API 기반 오디오 분석 시스템
 * - 배경음악 재생 및 주파수 분석
 * - 사전 분석된 통계로 균일한 이퀄라이저 반응
 *
 * 통계는 analyze-audio.js로 분석됨 (city-drive.mp3 기준)
 */

let audioContext = null;
let analyser = null;
let audioSource = null;
let audioElement = null;
let isPlaying = false;
let frequencyData = null;

// 주파수 대역별 실시간 값 (0~1 범위)
const frequencyBands = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0
};

// 정규화된 값 (0~1 범위)
const normalizedBands = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0
};

// ============================================
// 사전 분석된 대역별 통계 (city-drive.mp3)
// analyze-audio.js로 분석됨
// P10-P90 범위 사용 (아웃라이어 제거)
// ============================================
const bandStats = {
  bass: { min: 0.6431, max: 0.9004 },
  lowMid: { min: 0.6701, max: 0.8135 },
  mid: { min: 0.5975, max: 0.7385 },
  highMid: { min: 0.4919, max: 0.6586 },
  treble: { min: 0.2472, max: 0.4839 },
};

// 대역별 주파수 bin 범위 (48000Hz 샘플레이트, 2048 FFT 기준)
const bandRanges = {
  bass: { start: 1, end: 8 },
  lowMid: { start: 8, end: 21 },
  mid: { start: 21, end: 51 },
  highMid: { start: 51, end: 202 },
  treble: { start: 202, end: 512 }
};

// 설정
const SMOOTHING = 0.6;     // 출력 스무딩 (높을수록 부드러움)
const OUTPUT_SCALE = 0.95; // 출력 스케일

/**
 * 오디오 시스템 초기화
 */
export function initAudio() {
  if (audioContext) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.7; // FFT 스무딩 (높을수록 부드러움)

    frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // 오디오 엘리먼트 생성
    audioElement = new Audio('resource/sound/city-drive.mp3');
    audioElement.loop = true;
    audioElement.crossOrigin = 'anonymous';

    // 오디오 소스 연결
    audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    console.log('Audio system initialized');
    console.log('Using pre-analyzed band statistics for city-drive.mp3');
  } catch (e) {
    console.error('Audio initialization failed:', e);
  }
}

/**
 * 오디오 재생/일시정지 토글
 */
export function toggleAudio() {
  if (!audioContext) {
    initAudio();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
  } else {
    audioElement.play().catch(e => {
      console.error('Audio play failed:', e);
    });
    isPlaying = true;
  }

  return isPlaying;
}

/**
 * 오디오 재생 상태 반환
 */
export function isAudioPlaying() {
  return isPlaying;
}

/**
 * 주파수 대역별 에너지 계산 (RMS)
 */
function calculateBandEnergy(startBin, endBin) {
  if (!frequencyData) return 0;

  let sum = 0;
  const count = endBin - startBin;
  for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
    const val = frequencyData[i] / 255; // 0~1 범위로 정규화
    sum += val * val;
  }
  return Math.sqrt(sum / count);
}

/**
 * 사전 분석된 통계 기반 정규화
 */
function normalizeWithStats(band, value) {
  const stats = bandStats[band];
  const range = stats.max - stats.min;

  if (range <= 0) return 0.5;

  // min-max 정규화
  let normalized = (value - stats.min) / range;

  // 0~1 클램핑
  normalized = Math.max(0, Math.min(1, normalized));

  // 출력 스케일 적용
  normalized *= OUTPUT_SCALE;

  // 스무딩
  const prev = normalizedBands[band] || 0;
  return prev * SMOOTHING + normalized * (1 - SMOOTHING);
}

/**
 * 매 프레임 주파수 분석 업데이트
 */
export function updateAudioAnalysis() {
  if (!analyser || !isPlaying || !frequencyData) return;

  analyser.getByteFrequencyData(frequencyData);

  // 각 대역별 raw 값 계산
  frequencyBands.bass = calculateBandEnergy(bandRanges.bass.start, bandRanges.bass.end);
  frequencyBands.lowMid = calculateBandEnergy(bandRanges.lowMid.start, bandRanges.lowMid.end);
  frequencyBands.mid = calculateBandEnergy(bandRanges.mid.start, bandRanges.mid.end);
  frequencyBands.highMid = calculateBandEnergy(bandRanges.highMid.start, bandRanges.highMid.end);
  frequencyBands.treble = calculateBandEnergy(bandRanges.treble.start, bandRanges.treble.end);

  // 사전 분석된 통계 기반 정규화
  normalizedBands.bass = normalizeWithStats('bass', frequencyBands.bass);
  normalizedBands.lowMid = normalizeWithStats('lowMid', frequencyBands.lowMid);
  normalizedBands.mid = normalizeWithStats('mid', frequencyBands.mid);
  normalizedBands.highMid = normalizeWithStats('highMid', frequencyBands.highMid);
  normalizedBands.treble = normalizeWithStats('treble', frequencyBands.treble);
}

/**
 * X 좌표에 따른 intensity 반환
 */
export function getIntensityForPosition(x) {
  if (!isPlaying) return 0;

  const normalizedX = Math.max(-1, Math.min(1, x / 100));

  // 5개 구역으로 나누어 각 대역에 매핑
  // 서쪽(-1) = bass, 동쪽(+1) = treble
  if (normalizedX < -0.6) {
    return normalizedBands.bass;
  } else if (normalizedX < -0.2) {
    const t = (normalizedX + 0.6) / 0.4;
    return normalizedBands.bass * (1 - t) + normalizedBands.lowMid * t;
  } else if (normalizedX < 0.2) {
    const t = (normalizedX + 0.2) / 0.4;
    return normalizedBands.lowMid * (1 - t) + normalizedBands.mid * t;
  } else if (normalizedX < 0.6) {
    const t = (normalizedX - 0.2) / 0.4;
    return normalizedBands.mid * (1 - t) + normalizedBands.highMid * t;
  } else {
    const t = (normalizedX - 0.6) / 0.4;
    return normalizedBands.highMid * (1 - t) + normalizedBands.treble * t;
  }
}

/**
 * 현재 주파수 대역 값들 반환 (디버그용)
 */
export function getFrequencyBands() {
  return {
    raw: { ...frequencyBands },
    normalized: { ...normalizedBands },
    stats: bandStats
  };
}
