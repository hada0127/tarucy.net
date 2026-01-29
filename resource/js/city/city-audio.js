/**
 * city-audio.js
 * Web Audio API 기반 오디오 분석 시스템
 * - 배경음악 재생 및 주파수 분석
 * - 재생 초기 10초간 실시간 FFT 데이터로 통계 수집
 * - 통계 기반 정규화로 균일한 이퀄라이저 반응
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

// 정규화된 값 (통계 기반, 0~1 범위)
const normalizedBands = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0
};

// 대역별 통계 (calibration 중 수집)
const bandStats = {
  bass: { min: 0, max: 0.5, samples: [] },
  lowMid: { min: 0, max: 0.5, samples: [] },
  mid: { min: 0, max: 0.5, samples: [] },
  highMid: { min: 0, max: 0.5, samples: [] },
  treble: { min: 0, max: 0.5, samples: [] }
};

// Calibration 상태
let calibrationStartTime = 0;
let isCalibrating = false;
let calibrationComplete = false;
const CALIBRATION_DURATION = 15000; // 15초간 수집

// 대역별 주파수 bin 범위 (44100Hz 샘플레이트, 2048 FFT 기준)
const bandRanges = {
  bass: { start: 1, end: 7 },       // ~20-150 Hz
  lowMid: { start: 7, end: 19 },    // ~150-400 Hz
  mid: { start: 19, end: 47 },      // ~400-1000 Hz
  highMid: { start: 47, end: 186 }, // ~1000-4000 Hz
  treble: { start: 186, end: 512 }  // ~4000+ Hz
};

// 설정
const SMOOTHING = 0.3;     // 출력 스무딩 (낮을수록 빠른 반응)
const OUTPUT_SCALE = 0.9;  // 출력 스케일

/**
 * 오디오 시스템 초기화
 */
export function initAudio() {
  if (audioContext) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.4;

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

    // Calibration 시작 (아직 완료되지 않은 경우)
    if (!calibrationComplete && !isCalibrating) {
      startCalibration();
    }
  }

  return isPlaying;
}

/**
 * Calibration 시작
 */
function startCalibration() {
  isCalibrating = true;
  calibrationStartTime = performance.now();

  // 샘플 배열 초기화
  for (const band of Object.keys(bandStats)) {
    bandStats[band].samples = [];
  }

  console.log('Starting calibration (collecting FFT data for 15 seconds)...');
}

/**
 * Calibration 완료 - 통계 계산
 */
function finishCalibration() {
  isCalibrating = false;
  calibrationComplete = true;

  for (const band of Object.keys(bandStats)) {
    const samples = bandStats[band].samples;
    if (samples.length === 0) continue;

    // 정렬
    samples.sort((a, b) => a - b);

    // 하위 10%와 상위 90% 사용 (아웃라이어 제거)
    const lowIdx = Math.floor(samples.length * 0.1);
    const highIdx = Math.floor(samples.length * 0.9);

    bandStats[band].min = samples[lowIdx];
    bandStats[band].max = samples[highIdx];

    // 범위가 너무 작으면 보정
    if (bandStats[band].max - bandStats[band].min < 0.05) {
      bandStats[band].max = bandStats[band].min + 0.15;
    }

    // 샘플 배열 메모리 해제
    bandStats[band].samples = [];
  }

  console.log('Calibration complete (real-time FFT stats):');
  for (const band of Object.keys(bandStats)) {
    const s = bandStats[band];
    console.log(`  ${band}: min=${s.min.toFixed(3)}, max=${s.max.toFixed(3)}`);
  }
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
    const val = frequencyData[i] / 255;
    sum += val * val;
  }
  return Math.sqrt(sum / count);
}

/**
 * 통계 기반 정규화
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

  // Calibration 중이면 샘플 수집
  if (isCalibrating) {
    const elapsed = performance.now() - calibrationStartTime;

    if (elapsed < CALIBRATION_DURATION) {
      // 샘플 추가
      for (const band of Object.keys(bandStats)) {
        bandStats[band].samples.push(frequencyBands[band]);
      }
    } else {
      // Calibration 완료
      finishCalibration();
    }
  }

  // 통계 기반 정규화 (calibration 완료 여부와 무관하게 항상 적용)
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
  if (normalizedX < -0.6) {
    return normalizedBands.bass;
  } else if (normalizedX < -0.2) {
    const t = (normalizedX + 0.6) / 0.4;
    return normalizedBands.bass * (1 - t) + normalizedBands.lowMid * t;
  } else if (normalizedX < 0.2) {
    const t = (normalizedX + 0.2) / 0.4;
    return normalizedBands.lowMid * (1 - t) + normalizedBands.highMid * t;
  } else if (normalizedX < 0.6) {
    const t = (normalizedX - 0.2) / 0.4;
    return normalizedBands.highMid * (1 - t) + normalizedBands.treble * t;
  } else {
    return normalizedBands.treble;
  }
}

/**
 * 현재 주파수 대역 값들 반환 (디버그용)
 */
export function getFrequencyBands() {
  return {
    raw: { ...frequencyBands },
    normalized: { ...normalizedBands },
    stats: {
      bass: { min: bandStats.bass.min, max: bandStats.bass.max },
      lowMid: { min: bandStats.lowMid.min, max: bandStats.lowMid.max },
      mid: { min: bandStats.mid.min, max: bandStats.mid.max },
      highMid: { min: bandStats.highMid.min, max: bandStats.highMid.max },
      treble: { min: bandStats.treble.min, max: bandStats.treble.max }
    },
    calibrationComplete,
    isCalibrating
  };
}
