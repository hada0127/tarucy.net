/**
 * city-audio.js
 * Web Audio API 기반 오디오 분석 시스템
 * - 배경음악 재생 및 주파수 분석
 * - 음악 파일 사전 분석으로 대역별 통계 계산
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

// 사전 분석된 대역별 통계 (아래에서 분석 후 채움)
const bandStats = {
  bass: { min: 0, max: 1, avg: 0.5 },
  lowMid: { min: 0, max: 1, avg: 0.5 },
  mid: { min: 0, max: 1, avg: 0.5 },
  highMid: { min: 0, max: 1, avg: 0.5 },
  treble: { min: 0, max: 1, avg: 0.5 }
};

// 분석 완료 여부
let analysisComplete = false;

// 대역별 주파수 bin 범위 (44100Hz 샘플레이트, 2048 FFT 기준)
const bandRanges = {
  bass: { start: 1, end: 7 },       // ~20-150 Hz
  lowMid: { start: 7, end: 19 },    // ~150-400 Hz
  mid: { start: 19, end: 47 },      // ~400-1000 Hz
  highMid: { start: 47, end: 186 }, // ~1000-4000 Hz
  treble: { start: 186, end: 512 }  // ~4000+ Hz
};

// 설정
const SMOOTHING = 0.4;     // 출력 스무딩 (낮을수록 빠른 반응)
const OUTPUT_SCALE = 0.85; // 출력 스케일

/**
 * 오디오 시스템 초기화
 */
export function initAudio() {
  if (audioContext) return;

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.5;

    frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // 오디오 엘리먼트 생성
    audioElement = new Audio('resource/sound/city-drive.mp3');
    audioElement.loop = true;
    audioElement.crossOrigin = 'anonymous';

    // 오디오 소스 연결
    audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    // 음악 파일 사전 분석 시작
    analyzeAudioFile();

    console.log('Audio system initialized');
  } catch (e) {
    console.error('Audio initialization failed:', e);
  }
}

/**
 * 음악 파일 전체 분석 (오프라인)
 * 각 대역별 min, max, avg 계산
 */
async function analyzeAudioFile() {
  try {
    console.log('Starting audio file analysis...');

    // 파일 fetch
    const response = await fetch('resource/sound/city-drive.mp3');
    const arrayBuffer = await response.arrayBuffer();

    // 오프라인 컨텍스트로 디코딩
    const offlineContext = new OfflineAudioContext(2, 44100 * 300, 44100); // 최대 5분
    const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);

    console.log(`Audio duration: ${audioBuffer.duration.toFixed(1)}s`);

    // 분석용 데이터 추출
    const channelData = audioBuffer.getChannelData(0); // 모노로 분석
    const sampleRate = audioBuffer.sampleRate;
    const fftSize = 2048;
    const hopSize = fftSize / 2; // 50% 오버랩

    // 각 대역별 값 수집
    const bandValues = {
      bass: [],
      lowMid: [],
      mid: [],
      highMid: [],
      treble: []
    };

    // FFT 분석 (간단한 구현)
    const numFrames = Math.floor((channelData.length - fftSize) / hopSize);
    const tempArray = new Float32Array(fftSize);

    for (let frame = 0; frame < numFrames; frame += 10) { // 10프레임마다 샘플링 (속도)
      const startSample = frame * hopSize;

      // 윈도우 적용 및 복사
      for (let i = 0; i < fftSize; i++) {
        const windowValue = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / fftSize); // Hann window
        tempArray[i] = channelData[startSample + i] * windowValue;
      }

      // 간단한 에너지 계산 (대역별)
      // 실제 FFT 대신 대역 필터링된 에너지 추정
      const energies = estimateBandEnergies(tempArray, sampleRate);

      bandValues.bass.push(energies.bass);
      bandValues.lowMid.push(energies.lowMid);
      bandValues.mid.push(energies.mid);
      bandValues.highMid.push(energies.highMid);
      bandValues.treble.push(energies.treble);
    }

    // 통계 계산
    for (const band of Object.keys(bandStats)) {
      const values = bandValues[band];
      if (values.length === 0) continue;

      values.sort((a, b) => a - b);

      // 하위 5%와 상위 95% 사용 (아웃라이어 제거)
      const lowIdx = Math.floor(values.length * 0.05);
      const highIdx = Math.floor(values.length * 0.95);

      bandStats[band].min = values[lowIdx];
      bandStats[band].max = values[highIdx];
      bandStats[band].avg = values.reduce((a, b) => a + b, 0) / values.length;

      // 범위가 너무 작으면 보정
      if (bandStats[band].max - bandStats[band].min < 0.01) {
        bandStats[band].max = bandStats[band].min + 0.1;
      }
    }

    analysisComplete = true;

    console.log('Audio analysis complete:');
    for (const band of Object.keys(bandStats)) {
      const s = bandStats[band];
      console.log(`  ${band}: min=${s.min.toFixed(3)}, max=${s.max.toFixed(3)}, avg=${s.avg.toFixed(3)}`);
    }

  } catch (e) {
    console.error('Audio analysis failed:', e);
    // 실패 시 기본값 사용
    analysisComplete = true;
  }
}

/**
 * 대역별 에너지 추정 (간단한 필터 기반)
 */
function estimateBandEnergies(samples, sampleRate) {
  const n = samples.length;

  // 각 대역의 주파수 범위에 해당하는 에너지 추정
  // 간단한 방법: 샘플의 변화율로 주파수 추정

  let bass = 0, lowMid = 0, mid = 0, highMid = 0, treble = 0;

  // 저역 통과 필터 시뮬레이션 (bass)
  let lpSum = 0;
  for (let i = 1; i < n; i++) {
    lpSum += Math.abs(samples[i] * 0.1 + samples[i - 1] * 0.9 - samples[Math.max(0, i - 2)] * 0.9);
  }
  bass = lpSum / n;

  // 대역별 변화율 기반 에너지
  for (let i = 4; i < n - 4; i++) {
    const diff1 = Math.abs(samples[i] - samples[i - 1]); // 고주파 성분
    const diff2 = Math.abs(samples[i] - samples[i - 2]);
    const diff4 = Math.abs(samples[i] - samples[i - 4]);

    treble += diff1 * diff1;
    highMid += diff2 * diff2;
    mid += diff4 * diff4;
  }

  treble = Math.sqrt(treble / n);
  highMid = Math.sqrt(highMid / n);
  mid = Math.sqrt(mid / n);
  lowMid = (bass + mid) / 2;

  return { bass, lowMid, mid, highMid, treble };
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

  // 통계 기반 정규화
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
    stats: { ...bandStats },
    analysisComplete
  };
}
