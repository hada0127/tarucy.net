/**
 * city-audio.js
 * Web Audio API 기반 오디오 분석 시스템
 * - 배경음악 재생 및 주파수 분석
 * - 5개 주파수 대역: bass, lowMid, mid, highMid, treble
 * - X 좌표에 따른 intensity 계산 (동쪽=고음, 서쪽=저음)
 * - 자동 게인 조절 (AGC)로 모든 대역이 균일하게 반응
 */

let audioContext = null;
let analyser = null;
let audioSource = null;
let audioElement = null;
let isPlaying = false;
let frequencyData = null;

// 주파수 대역별 raw 값 (0~1 범위)
const frequencyBands = {
  bass: 0,      // 20-150 Hz (저음)
  lowMid: 0,    // 150-400 Hz
  mid: 0,       // 400-1000 Hz (중음)
  highMid: 0,   // 1000-4000 Hz
  treble: 0     // 4000-20000 Hz (고음)
};

// 정규화된 값 (AGC 적용 후, 0~1 범위)
const normalizedBands = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0
};

// 각 대역의 피크값 추적 (AGC용)
const bandPeaks = {
  bass: 0.3,
  lowMid: 0.3,
  mid: 0.3,
  highMid: 0.3,
  treble: 0.3
};

// 각 대역의 최소값 추적 (AGC용)
const bandMins = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0
};

// 대역별 주파수 bin 범위 (44100Hz 샘플레이트, 1024 FFT 기준)
const bandRanges = {
  bass: { start: 1, end: 4 },       // ~20-150 Hz
  lowMid: { start: 4, end: 10 },    // ~150-400 Hz
  mid: { start: 10, end: 24 },      // ~400-1000 Hz
  highMid: { start: 24, end: 93 },  // ~1000-4000 Hz
  treble: { start: 93, end: 256 }   // ~4000+ Hz
};

// AGC 설정
const AGC_ATTACK = 0.1;    // 피크 상승 속도 (빠르게)
const AGC_DECAY = 0.0005;  // 피크 하강 속도 (더 천천히)
const MIN_PEAK = 0.4;      // 최소 피크값 (높여서 덜 차오르게)
const SMOOTHING = 0.6;     // 출력 스무딩
const OUTPUT_SCALE = 0.7;  // 출력 스케일 (전체적으로 낮추기)

/**
 * 오디오 시스템 초기화
 */
export function initAudio() {
  if (audioContext) return; // 이미 초기화됨

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;  // 더 빠른 반응을 위해 작은 FFT
    analyser.smoothingTimeConstant = 0.6;  // 약간의 스무딩

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

  // 브라우저 autoplay 정책: 사용자 인터랙션 후 resume 필요
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
 * 주파수 대역별 평균값 계산 (RMS 방식으로 더 정확한 에너지 측정)
 */
function calculateBandEnergy(startBin, endBin) {
  if (!frequencyData) return 0;

  let sum = 0;
  const count = endBin - startBin;
  for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
    const val = frequencyData[i] / 255;
    sum += val * val;  // RMS를 위한 제곱
  }
  return Math.sqrt(sum / count);  // RMS
}

/**
 * 매 프레임 주파수 분석 업데이트
 * animate 루프에서 호출
 */
export function updateAudioAnalysis() {
  if (!analyser || !isPlaying || !frequencyData) return;

  analyser.getByteFrequencyData(frequencyData);

  // 각 대역별 raw 값 계산
  const rawBass = calculateBandEnergy(bandRanges.bass.start, bandRanges.bass.end);
  const rawLowMid = calculateBandEnergy(bandRanges.lowMid.start, bandRanges.lowMid.end);
  const rawMid = calculateBandEnergy(bandRanges.mid.start, bandRanges.mid.end);
  const rawHighMid = calculateBandEnergy(bandRanges.highMid.start, bandRanges.highMid.end);
  const rawTreble = calculateBandEnergy(bandRanges.treble.start, bandRanges.treble.end);

  // raw 값 저장
  frequencyBands.bass = rawBass;
  frequencyBands.lowMid = rawLowMid;
  frequencyBands.mid = rawMid;
  frequencyBands.highMid = rawHighMid;
  frequencyBands.treble = rawTreble;

  // AGC: 피크값 업데이트
  updatePeak('bass', rawBass);
  updatePeak('lowMid', rawLowMid);
  updatePeak('mid', rawMid);
  updatePeak('highMid', rawHighMid);
  updatePeak('treble', rawTreble);

  // 정규화된 값 계산 (0~1 범위로 스케일링)
  normalizedBands.bass = normalizeValue('bass', rawBass);
  normalizedBands.lowMid = normalizeValue('lowMid', rawLowMid);
  normalizedBands.mid = normalizeValue('mid', rawMid);
  normalizedBands.highMid = normalizeValue('highMid', rawHighMid);
  normalizedBands.treble = normalizeValue('treble', rawTreble);
}

/**
 * AGC: 피크값 업데이트
 */
function updatePeak(band, value) {
  // 현재 값이 피크보다 크면 빠르게 상승
  if (value > bandPeaks[band]) {
    bandPeaks[band] += (value - bandPeaks[band]) * AGC_ATTACK;
  } else {
    // 피크 천천히 하강
    bandPeaks[band] -= AGC_DECAY;
  }

  // 최소 피크값 보장
  bandPeaks[band] = Math.max(MIN_PEAK, bandPeaks[band]);
}

/**
 * 값을 피크 기준으로 정규화
 */
function normalizeValue(band, value) {
  const peak = bandPeaks[band];
  const normalized = value / peak;

  // 출력 스케일 적용 후 0~1 범위로 클램핑
  const scaled = normalized * OUTPUT_SCALE;
  const clamped = Math.min(1, Math.max(0, scaled));
  const prev = normalizedBands[band] || 0;

  // 스무딩 적용 (급격한 변화 방지)
  return prev * SMOOTHING + clamped * (1 - SMOOTHING);
}

/**
 * X 좌표에 따른 intensity 반환
 * - X < 0 (서쪽): 저음(bass, lowMid) 반응
 * - X > 0 (동쪽): 고음(highMid, treble) 반응
 * - 중앙 부근: mid 반응
 *
 * @param {number} x - 월드 X 좌표
 * @returns {number} 0~1 범위의 intensity
 */
export function getIntensityForPosition(x) {
  if (!isPlaying) return 0;

  // X 좌표를 -100 ~ +100 범위로 가정
  // 왼쪽(-) = 저음, 오른쪽(+) = 고음
  const normalizedX = Math.max(-1, Math.min(1, x / 100));

  // 5개 구역으로 나누어 각 대역에 매핑
  if (normalizedX < -0.6) {
    // 가장 서쪽: bass
    return normalizedBands.bass;
  } else if (normalizedX < -0.2) {
    // 서쪽: bass + lowMid 블렌드
    const t = (normalizedX + 0.6) / 0.4;
    return normalizedBands.bass * (1 - t) + normalizedBands.lowMid * t;
  } else if (normalizedX < 0.2) {
    // 중앙: lowMid + mid + highMid 블렌드
    const t = (normalizedX + 0.2) / 0.4;
    if (t < 0.5) {
      return normalizedBands.lowMid * (1 - t * 2) + normalizedBands.mid * (t * 2);
    } else {
      return normalizedBands.mid * (1 - (t - 0.5) * 2) + normalizedBands.highMid * ((t - 0.5) * 2);
    }
  } else if (normalizedX < 0.6) {
    // 동쪽: highMid + treble 블렌드
    const t = (normalizedX - 0.2) / 0.4;
    return normalizedBands.highMid * (1 - t) + normalizedBands.treble * t;
  } else {
    // 가장 동쪽: treble
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
    peaks: { ...bandPeaks }
  };
}
