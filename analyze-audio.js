/**
 * 오디오 파일 주파수 분석 스크립트
 * Node.js로 MP3 파일을 분석하여 각 대역별 min/max 통계 계산
 */

const fs = require('fs');
const path = require('path');

async function analyzeAudio() {
  try {
    // ESM 모듈 동적 import
    const { default: decode } = await import('audio-decode');

    const filePath = path.join(__dirname, 'resource/sound/city-drive.mp3');
    console.log('Loading audio file:', filePath);

    const buffer = fs.readFileSync(filePath);
    const audioBuffer = await decode(buffer);

    console.log('Sample rate:', audioBuffer.sampleRate);
    console.log('Duration:', audioBuffer.duration.toFixed(2), 'seconds');
    console.log('Channels:', audioBuffer.numberOfChannels);

    // 모노로 변환 (첫 번째 채널 사용)
    const samples = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // FFT 설정
    const fftSize = 2048;
    const hopSize = fftSize / 2;

    // 대역별 bin 범위 (44100Hz 기준, 다른 샘플레이트면 조정)
    const binScale = sampleRate / 44100;
    const bandRanges = {
      bass: { start: Math.round(1 * binScale), end: Math.round(7 * binScale) },
      lowMid: { start: Math.round(7 * binScale), end: Math.round(19 * binScale) },
      mid: { start: Math.round(19 * binScale), end: Math.round(47 * binScale) },
      highMid: { start: Math.round(47 * binScale), end: Math.round(186 * binScale) },
      treble: { start: Math.round(186 * binScale), end: Math.round(512 * binScale) }
    };

    console.log('\nBand ranges (adjusted for sample rate):');
    for (const [band, range] of Object.entries(bandRanges)) {
      console.log(`  ${band}: bins ${range.start}-${range.end}`);
    }

    // 각 대역별 에너지 값 수집
    const bandValues = {
      bass: [],
      lowMid: [],
      mid: [],
      highMid: [],
      treble: []
    };

    // 간단한 DFT 기반 분석 (실제 FFT 라이브러리 없이)
    const numFrames = Math.floor((samples.length - fftSize) / hopSize);
    console.log(`\nAnalyzing ${numFrames} frames...`);

    for (let frame = 0; frame < numFrames; frame++) {
      const startSample = frame * hopSize;

      // 윈도우 적용
      const windowed = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) {
        const windowValue = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / fftSize);
        windowed[i] = samples[startSample + i] * windowValue;
      }

      // DFT로 주파수 대역 에너지 계산
      const magnitudes = computeMagnitudes(windowed, fftSize);

      // 각 대역별 RMS 에너지 계산
      for (const [band, range] of Object.entries(bandRanges)) {
        let sum = 0;
        let count = 0;
        for (let i = range.start; i < range.end && i < magnitudes.length; i++) {
          sum += magnitudes[i] * magnitudes[i];
          count++;
        }
        const rms = count > 0 ? Math.sqrt(sum / count) : 0;
        bandValues[band].push(rms);
      }

      // 진행 상황 표시
      if (frame % 1000 === 0) {
        process.stdout.write(`\rProgress: ${Math.round(frame / numFrames * 100)}%`);
      }
    }

    console.log('\rProgress: 100%');

    // 통계 계산
    console.log('\n=== FREQUENCY BAND STATISTICS ===\n');

    const stats = {};

    for (const [band, values] of Object.entries(bandValues)) {
      values.sort((a, b) => a - b);

      const p10 = values[Math.floor(values.length * 0.10)];
      const p90 = values[Math.floor(values.length * 0.90)];
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = values[0];
      const max = values[values.length - 1];

      stats[band] = { min: p10, max: p90, avg };

      console.log(`${band}:`);
      console.log(`  Absolute: min=${min.toFixed(4)}, max=${max.toFixed(4)}`);
      console.log(`  P10-P90:  min=${p10.toFixed(4)}, max=${p90.toFixed(4)}`);
      console.log(`  Average:  ${avg.toFixed(4)}`);
      console.log();
    }

    // 코드에 사용할 형식으로 출력
    console.log('=== CODE TO USE ===\n');
    console.log('const bandStats = {');
    for (const [band, s] of Object.entries(stats)) {
      console.log(`  ${band}: { min: ${s.min.toFixed(4)}, max: ${s.max.toFixed(4)} },`);
    }
    console.log('};');

  } catch (e) {
    console.error('Error:', e.message);
    console.log('\nPlease install required packages:');
    console.log('  npm install audio-decode');
  }
}

/**
 * 간단한 DFT 기반 magnitude 계산
 * Web Audio API의 getByteFrequencyData와 유사한 출력을 위해
 * dB 스케일로 변환 후 0-1 범위로 정규화
 */
function computeMagnitudes(samples, fftSize) {
  const magnitudes = new Float32Array(fftSize / 2);

  // 주요 bin만 계산 (속도를 위해 512개까지만)
  const maxBin = Math.min(fftSize / 2, 512);

  // Web Audio API 기본값
  const minDecibels = -100;
  const maxDecibels = -30;
  const dbRange = maxDecibels - minDecibels;

  for (let k = 0; k < maxBin; k++) {
    let real = 0;
    let imag = 0;

    for (let n = 0; n < fftSize; n++) {
      const angle = -2 * Math.PI * k * n / fftSize;
      real += samples[n] * Math.cos(angle);
      imag += samples[n] * Math.sin(angle);
    }

    // Magnitude 계산
    const mag = Math.sqrt(real * real + imag * imag) / fftSize;

    // dB로 변환 (Web Audio API 방식)
    const db = 20 * Math.log10(Math.max(mag, 1e-10));

    // 0-1 범위로 정규화 (Web Audio API의 getByteFrequencyData / 255와 동일)
    const normalized = (db - minDecibels) / dbRange;
    magnitudes[k] = Math.max(0, Math.min(1, normalized));
  }

  return magnitudes;
}

analyzeAudio();
