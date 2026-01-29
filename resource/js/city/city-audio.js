/**
 * city-audio.js
 * Web Audio API 기반 오디오 분석 시스템
 * - 배경음악 재생 및 주파수 분석
 * - 5개 주파수 대역: bass, lowMid, mid, highMid, treble
 * - X 좌표에 따른 intensity 계산 (동쪽=고음, 서쪽=저음)
 */

let audioContext = null;
let analyser = null;
let audioSource = null;
let audioElement = null;
let isPlaying = false;
let frequencyData = null;

// 주파수 대역별 값 (0~1 범위)
const frequencyBands = {
  bass: 0,      // 20-150 Hz (저음)
  lowMid: 0,    // 150-400 Hz
  mid: 0,       // 400-1000 Hz (중음)
  highMid: 0,   // 1000-4000 Hz
  treble: 0     // 4000-20000 Hz (고음)
};

// 대역별 주파수 bin 범위 (44100Hz 샘플레이트, 2048 FFT 기준)
// bin = frequency * fftSize / sampleRate
const bandRanges = {
  bass: { start: 1, end: 7 },       // ~20-150 Hz
  lowMid: { start: 7, end: 19 },    // ~150-400 Hz
  mid: { start: 19, end: 47 },      // ~400-1000 Hz
  highMid: { start: 47, end: 186 }, // ~1000-4000 Hz
  treble: { start: 186, end: 512 }  // ~4000+ Hz
};

/**
 * 오디오 시스템 초기화
 */
export function initAudio() {
  if (audioContext) return; // 이미 초기화됨

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;

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
 * 주파수 대역별 평균값 계산
 */
function calculateBandAverage(startBin, endBin) {
  if (!frequencyData) return 0;

  let sum = 0;
  const count = endBin - startBin;
  for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }
  return (sum / count) / 255; // 0~1 범위로 정규화
}

/**
 * 매 프레임 주파수 분석 업데이트
 * animate 루프에서 호출
 */
export function updateAudioAnalysis() {
  if (!analyser || !isPlaying || !frequencyData) return;

  analyser.getByteFrequencyData(frequencyData);

  // 각 대역별 값 계산
  frequencyBands.bass = calculateBandAverage(bandRanges.bass.start, bandRanges.bass.end);
  frequencyBands.lowMid = calculateBandAverage(bandRanges.lowMid.start, bandRanges.lowMid.end);
  frequencyBands.mid = calculateBandAverage(bandRanges.mid.start, bandRanges.mid.end);
  frequencyBands.highMid = calculateBandAverage(bandRanges.highMid.start, bandRanges.highMid.end);
  frequencyBands.treble = calculateBandAverage(bandRanges.treble.start, bandRanges.treble.end);
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

  if (normalizedX < -0.3) {
    // 서쪽 (저음 반응)
    const t = (normalizedX + 1) / 0.7; // 0~1 블렌딩
    return frequencyBands.bass * 0.7 + frequencyBands.lowMid * 0.3;
  } else if (normalizedX > 0.3) {
    // 동쪽 (고음 반응)
    const t = (normalizedX - 0.3) / 0.7;
    return frequencyBands.treble * 0.6 + frequencyBands.highMid * 0.4;
  } else {
    // 중앙 (중음 반응)
    return frequencyBands.mid * 0.5 + frequencyBands.lowMid * 0.25 + frequencyBands.highMid * 0.25;
  }
}

/**
 * 현재 주파수 대역 값들 반환 (디버그용)
 */
export function getFrequencyBands() {
  return { ...frequencyBands };
}
