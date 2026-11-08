/**
 * add-audio.js
 * 為大庄國小 71 週年校慶「七一大庄、五力飛揚」動態島 (sports-quest-island) 增加背景音樂系統：
 * 1. 內建 3 首不同風格音樂（熱血運動會進行曲、香山海風舒緩律動、8-Bit 像素闖關曲）
 * 2. 解決瀏覽器 Autoplay 限制，任何手勢自動非同步解鎖 AudioContext
 * 3. 頂部品牌列增加音訊開關、地標闖關卡內嵌音訊切換、右下角浮動音樂盒（帶跳動音波視覺）
 * 4. 完整的闖關音效 SFX（蓄力上升音、階梯和弦、答對和弦、錯誤警示音、勝利號角）
 */
const fs = require('fs');
const path = require('path');

const buildJsPath = path.join(__dirname, 'build.js');
let code = fs.readFileSync(buildJsPath, 'utf8');

// 1. 在頂部品牌列 sportsBrandHeader 增加音訊按鈕
const oldBrandActions = `<div class="sq-brand-actions" id="sq-brand-actions">
          <button type="button" class="sq-brand-pill is-gold" id="sq-btn-cert" title="查看五力集章進度與領取金牌證書">🏅 五力護照 <span id="sq-progress-txt">0/5章</span></button>
          <button type="button" class="sq-brand-pill" id="sq-btn-schedule" title="查看當日 08:00–13:00 完整 32 項程序表">📅 程序表(32)</button>
          <button type="button" class="sq-brand-pill" id="sq-btn-pre" title="查看 10/21–11/25 賽前已完賽個人賽與大隊接力戰報">🏃 賽前戰報</button>
          <button type="button" class="sq-brand-pill" id="sq-btn-athlete" title="設定運動員姓名與參賽身分"><span id="sq-athlete-icon">🐯</span> <span id="sq-athlete-label">選手設定</span></button>
        </div>`;

const newBrandActions = `<div class="sq-brand-actions" id="sq-brand-actions">
          <button type="button" class="sq-brand-pill is-gold" id="sq-btn-cert" title="查看五力集章進度與領取金牌證書">🏅 五力護照 <span id="sq-progress-txt">0/5章</span></button>
          <button type="button" class="sq-brand-pill" id="sq-btn-schedule" title="查看當日 08:00–13:00 完整 32 項程序表">📅 程序表(32)</button>
          <button type="button" class="sq-brand-pill" id="sq-btn-pre" title="查看 10/21–11/25 賽前已完賽個人賽與大隊接力戰報">🏃 賽前戰報</button>
          <button type="button" class="sq-brand-pill is-audio" id="sq-btn-audio" title="切換闖關背景音樂">🎵 闖關音樂🔊</button>
          <button type="button" class="sq-brand-pill" id="sq-btn-athlete" title="設定運動員姓名與參賽身分"><span id="sq-athlete-icon">🐯</span> <span id="sq-athlete-label">選手設定</span></button>
        </div>`;

if (!code.includes('id="sq-btn-audio"')) {
  code = code.replace(oldBrandActions, newBrandActions);
}

// 2. 在 customStyles 注入音訊按鈕、跳動音波與浮動音樂盒 CSS
const audioCss = `
/* ====== 闖關背景音樂浮動播放盒與跳動音波 ====== */
.sq-brand-pill.is-audio {
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
  border-color: #a855f7;
  color: #7e22ce;
}
.sq-brand-pill.is-audio:hover {
  background: #e9d5ff;
  color: #6b21a8;
  transform: translateY(-1px);
}
.sq-brand-pill.is-audio.is-muted {
  background: rgba(241, 245, 249, 0.95);
  border-color: #cbd5e1;
  color: #64748b;
}

.sq-bq-audio-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f3e8ff;
  border: 1px solid #c084fc;
  color: #7e22ce;
  border-radius: 9999px;
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
}
.sq-bq-audio-btn:hover {
  background: #e9d5ff;
  transform: scale(1.03);
}
.sq-bq-audio-btn.is-muted {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #64748b;
}

.sq-eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
  margin-left: 4px;
  vertical-align: middle;
}
.sq-eq i {
  width: 2.5px;
  height: 100%;
  background: currentColor;
  border-radius: 1px;
  animation: sqEq 0.75s ease-in-out infinite alternate;
}
.sq-eq i:nth-child(2) { animation-delay: 0.18s; height: 70%; }
.sq-eq i:nth-child(3) { animation-delay: 0.36s; height: 90%; }
.sq-eq i:nth-child(4) { animation-delay: 0.12s; height: 50%; }
@keyframes sqEq {
  0% { height: 25%; }
  100% { height: 100%; }
}
.is-muted .sq-eq i {
  animation: none !important;
  height: 25% !important;
  opacity: 0.35;
}

.sq-music-widget {
  position: fixed;
  right: 18px;
  bottom: max(env(safe-area-inset-bottom, 0px) + 72px, 72px);
  z-index: 25;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-family: inherit;
  pointer-events: auto;
}
@media (min-width: 901px) {
  .sq-music-widget {
    bottom: 22px;
  }
}
.sq-music-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid #a855f7;
  box-shadow: 0 4px 18px rgba(168, 85, 247, 0.25);
  color: #7e22ce;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}
.sq-music-toggle-btn:hover {
  transform: translateY(-2px) scale(1.02);
  background: #faf5ff;
  border-color: #9333ea;
  box-shadow: 0 6px 22px rgba(168, 85, 247, 0.35);
}
.sq-music-toggle-btn.is-muted {
  background: rgba(248, 250, 252, 0.92);
  border-color: #cbd5e1;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.sq-music-pop {
  width: 260px;
  background: rgba(255, 255, 255, 0.96);
  border: 1.5px solid rgba(168, 85, 247, 0.35);
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: sqPopIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.sq-music-pop[hidden] {
  display: none !important;
}
@keyframes sqPopIn {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.sq-mp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 900;
  font-size: 13px;
  color: #6b21a8;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f3e8ff;
}
.sq-mp-close {
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
}
.sq-mp-close:hover { background: #fee2e2; color: #ef4444; }
.sq-mp-tracks {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}
.sq-mp-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid #e9d5ff;
  background: #faf5ff;
  color: #581c87;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}
.sq-mp-track:hover {
  background: #f3e8ff;
  border-color: #c084fc;
  transform: translateX(2px);
}
.sq-mp-track.is-active {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  border-color: #6d28d9;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(124, 58, 237, 0.25);
}
.sq-mp-vol {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #475569;
  font-weight: 700;
}
.sq-mp-vol-btn {
  flex: 1;
  padding: 4px 6px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.sq-mp-vol-btn.is-active {
  background: #e0e7ff;
  border-color: #6366f1;
  color: #3730a3;
  font-weight: 800;
}
`;

if (!code.includes('.sq-music-widget')) {
  code = code.replace(
    '.sq-brand-pill.is-gold {',
    audioCss + '\n.sq-brand-pill.is-gold {'
  );
}

// 3. 在 customHtml 注入浮動音樂盒
const musicHtml = `
<!-- 浮動闖關音樂播放盒 -->
<div class="sq-music-widget" id="sq-music-widget">
  <div class="sq-music-pop" id="sq-music-pop" hidden>
    <div class="sq-mp-head">
      <span>🎼 闖關背景音樂曲目</span>
      <button type="button" class="sq-mp-close" id="sq-mp-close" aria-label="關閉音樂選單">✕</button>
    </div>
    <div class="sq-mp-tracks">
      <button type="button" class="sq-mp-track is-active" data-track="0">🏃 熱血運動會進行曲 <span>▶</span></button>
      <button type="button" class="sq-mp-track" data-track="1">🌊 香山海風舒緩律動 <span>▶</span></button>
      <button type="button" class="sq-mp-track" data-track="2">👾 8-Bit 像素闖關曲 <span>▶</span></button>
    </div>
    <div class="sq-mp-vol">
      <span>🔊 音量：</span>
      <button type="button" class="sq-mp-vol-btn" data-vol="0.18">微風 20%</button>
      <button type="button" class="sq-mp-vol-btn is-active" data-vol="0.38">標準 50%</button>
      <button type="button" class="sq-mp-vol-btn" data-vol="0.75">熱血 100%</button>
    </div>
  </div>
  <button type="button" class="sq-music-toggle-btn" id="sq-music-main-btn" title="切換闖關背景音樂 (點擊展開曲目選單)">
    <span class="sq-music-icon">🎵</span>
    <span class="sq-music-name" id="sq-music-name">熱血進行曲</span>
    <span class="sq-eq" id="sq-music-eq"><i></i><i></i><i></i><i></i></span>
  </button>
</div>
`;

if (!code.includes('id="sq-music-widget"')) {
  code = code.replace(
    '</dialog>\n`;\n\nrep(\'<script type="importmap">\', customHtml',
    '</dialog>\n' + musicHtml + '\n`;\n\nrep(\'<script type="importmap">\', customHtml'
  );
}

// 4. 在 customLogic 中注入 soundEngine 引擎
const soundEngineCode = `
  // ====== 闖關 Web Audio 引擎（多曲風背景音樂 BGM ＆ 闖關音效 SFX） ======
  const soundEngine = (() => {
    let audioCtx = null;
    let bgmSource = null;
    let bgmGain = null;
    let sfxGain = null;
    let isPlaying = false;
    let muted = false;
    let curVol = 0.38;
    let curTrack = 0;
    const bgmBuffers = [null, null, null];

    const TRACK_NAMES = ['🏃 熱血運動會進行曲', '🌊 香山海風舒緩律動', '👾 8-Bit 像素闖關曲'];

    try {
      muted = localStorage.getItem('sq-bgm-muted') === '1';
      const savedVol = parseFloat(localStorage.getItem('sq-bgm-vol') || '0.38');
      if (!isNaN(savedVol) && savedVol >= 0 && savedVol <= 1) curVol = savedVol;
      const savedTrack = parseInt(localStorage.getItem('sq-bgm-track') || '0', 10);
      if (!isNaN(savedTrack) && savedTrack >= 0 && savedTrack < 3) curTrack = savedTrack;
    } catch(e) {}

    const initContext = () => {
      if (audioCtx) return audioCtx;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      try {
        audioCtx = new AudioContextClass();
        bgmGain = audioCtx.createGain();
        bgmGain.gain.setValueAtTime(muted ? 0 : curVol, audioCtx.currentTime);
        bgmGain.connect(audioCtx.destination);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.setValueAtTime(muted ? 0 : 0.45, audioCtx.currentTime);
        sfxGain.connect(audioCtx.destination);
      } catch(e) {
        audioCtx = null;
      }
      return audioCtx;
    };

    const noteFreq = {
      'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
      'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
      'C6': 1046.50, '-': 0
    };

    // 生成曲目 0: 熱血運動會進行曲
    const buildTrack0 = (ctx) => {
      const sampleRate = 22050;
      const bpm = 126;
      const sSec = (60 / bpm) / 4;
      const chords = [
        ['F3','A3','C4','F4'], ['C3','E3','G3','C4'], ['D3','F3','A3','D4'], ['Bb2','D3','F3','Bb3'],
        ['F3','A3','C4','F4'], ['G3','Bb3','D4','G4'], ['C3','E3','G3','C4'], ['F3','A3','C4','F4']
      ];
      const bassNotes = ['F2','C3','D2','Bb2','F2','G2','C3','F2'];
      const melNotes = [
        'F4','-','A4','-','C5','-','D5','-','C5','-','A4','-','F4','-','G4','-',
        'G4','-','A4','-','G4','-','E4','-','C4','-','D4','-','E4','-','G4','-',
        'A4','-','C5','-','D5','-','F5','-','E5','-','D5','-','C5','-','A4','-',
        'Bb4','-','C5','-','D5','-','F5','-','G5','-','F5','-','D5','-','C5','-',
        'A5','-','-','-','F5','-','-','-','C5','-','-','-','A4','-','C5','-',
        'Bb4','-','C5','-','D5','-','F5','-','G5','-','A5','-','G5','-','F5','-',
        'E5','-','F5','-','G5','-','Bb5','-','A5','-','G5','-','E5','-','G4','-',
        'F4','-','A4','-','C5','-','F5','-','F5','-','-','-','-','-','-','-'
      ];
      const totalSamples = Math.floor(128 * sSec * sampleRate);
      const audioBuf = ctx.createBuffer(1, totalSamples, sampleRate);
      const pcm = audioBuf.getChannelData(0);
      let melPhase = 0, arpPhase = 0, bassPhase = 0;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const step = Math.floor(t / sSec);
        const bar = Math.floor(step / 16) % 8;
        const stepInBar = step % 16;
        const stepFrac = (t % sSec) / sSec;

        const mFreq = noteFreq[melNotes[step % melNotes.length]] || 0;
        let mSample = 0;
        if (mFreq > 0) {
          melPhase += mFreq / sampleRate;
          const pulse = (melPhase % 1) < 0.35 ? 1 : -1;
          mSample = pulse * Math.exp(-stepFrac * 2.8) * 0.32;
        }
        const chord = chords[bar];
        const arpIdx = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3][stepInBar];
        const aFreq = noteFreq[chord[arpIdx]] || 0;
        let aSample = 0;
        if (aFreq > 0) {
          arpPhase += aFreq / sampleRate;
          aSample = (2 * Math.abs(2 * (arpPhase % 1) - 1) - 1) * Math.exp(-stepFrac * 4.5) * 0.18;
        }
        const bFreq = (noteFreq[bassNotes[bar]] || 87.31) * (stepInBar % 8 < 4 ? 1 : 1.5);
        bassPhase += bFreq / sampleRate;
        const bSample = (2 * Math.abs(2 * (bassPhase % 1) - 1) - 1) * Math.exp(-((t % (sSec * 2)) / (sSec * 2)) * 3.2) * 0.24;

        let dSample = 0;
        const beatFrac = (t % (sSec * 4)) / (sSec * 4);
        const beatInBar = Math.floor(stepInBar / 4);
        if (beatInBar === 0 || beatInBar === 2) {
          const kFreq = Math.max(45, 140 * Math.exp(-beatFrac * 25));
          dSample += Math.sin(2 * Math.PI * kFreq * t) * Math.exp(-beatFrac * 18) * 0.38;
        }
        if (beatInBar === 1 || beatInBar === 3) {
          const noise = (Math.random() * 2 - 1) * Math.exp(-beatFrac * 14);
          dSample += (noise * 0.28 + Math.sin(2 * Math.PI * 180 * t) * 0.2) * 0.45;
        }
        if (stepInBar % 2 === 1) {
          dSample += (Math.random() * 2 - 1) * Math.exp(-stepFrac * 30) * 0.10;
        }
        pcm[i] = Math.tanh(mSample + aSample + bSample + dSample);
      }
      return audioBuf;
    };

    // 生成曲目 1: 香山海風舒緩律動
    const buildTrack1 = (ctx) => {
      const sampleRate = 22050;
      const bpm = 112;
      const sSec = (60 / bpm) / 4;
      const melNotes = [
        'C5','-','D5','-','E5','-','G5','-','A5','-','G5','-','E5','-','D5','-',
        'C5','-','E5','-','G5','-','A5','-','C6','-','A5','-','G5','-','E5','-',
        'D5','-','E5','-','G5','-','E5','-','D5','-','C5','-','A4','-','C5','-',
        'D5','-','-','-','E5','-','-','-','C5','-','-','-','-','-','-','-'
      ];
      const bassNotes = ['C3', 'A2', 'F2', 'G2'];
      const totalSamples = Math.floor(64 * sSec * sampleRate);
      const audioBuf = ctx.createBuffer(1, totalSamples, sampleRate);
      const pcm = audioBuf.getChannelData(0);
      let melPhase = 0, bassPhase = 0;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const step = Math.floor(t / sSec);
        const bar = Math.floor(step / 16) % 4;
        const stepFrac = (t % sSec) / sSec;

        const mFreq = noteFreq[melNotes[step % melNotes.length]] || 0;
        let mSample = 0;
        if (mFreq > 0) {
          melPhase += mFreq / sampleRate;
          mSample = (Math.sin(2 * Math.PI * (melPhase % 1)) * 0.7 + Math.sin(4 * Math.PI * (melPhase % 1)) * 0.3) * Math.exp(-stepFrac * 5.0) * 0.34;
        }
        const bFreq = noteFreq[bassNotes[bar]] || 130.81;
        bassPhase += bFreq / sampleRate;
        const bSample = Math.sin(2 * Math.PI * (bassPhase % 1)) * Math.exp(-((t % (sSec * 4)) / (sSec * 4)) * 2.5) * 0.25;

        let dSample = 0;
        const beatFrac = (t % (sSec * 4)) / (sSec * 4);
        if (Math.floor((step % 16) / 4) === 0) {
          dSample += Math.sin(2 * Math.PI * 65 * t) * Math.exp(-beatFrac * 12) * 0.28;
        }
        if ((step % 4) === 2) {
          dSample += (Math.random() * 2 - 1) * Math.exp(-stepFrac * 25) * 0.08;
        }
        pcm[i] = Math.tanh(mSample + bSample + dSample);
      }
      return audioBuf;
    };

    // 生成曲目 2: 8-Bit 像素闖關曲
    const buildTrack2 = (ctx) => {
      const sampleRate = 22050;
      const bpm = 138;
      const sSec = (60 / bpm) / 4;
      const melNotes = [
        'E5','E5','-','E5','-','C5','E5','-','G5','-','-','-','G4','-','-','-',
        'C5','-','-','G4','-','-','E4','-','-','A4','-','B4','-','Bb4','A4','-',
        'G4','E5','G5','A5','-','F5','G5','-','E5','-','C5','D5','B4','-','-','-',
        'C5','-','-','G4','-','-','E4','-','-','A4','-','B4','-','Bb4','A4','-'
      ];
      const bassNotes = ['C3', 'G2', 'A2', 'F2'];
      const totalSamples = Math.floor(64 * sSec * sampleRate);
      const audioBuf = ctx.createBuffer(1, totalSamples, sampleRate);
      const pcm = audioBuf.getChannelData(0);
      let melPhase = 0, bassPhase = 0;
      for (let i = 0; i < totalSamples; i++) {
        const t = i / sampleRate;
        const step = Math.floor(t / sSec);
        const bar = Math.floor(step / 16) % 4;
        const stepFrac = (t % sSec) / sSec;

        const mFreq = noteFreq[melNotes[step % melNotes.length]] || 0;
        let mSample = 0;
        if (mFreq > 0) {
          melPhase += mFreq / sampleRate;
          const pulse = (melPhase % 1) < 0.5 ? 1 : -1;
          mSample = pulse * Math.exp(-stepFrac * 3.5) * 0.30;
        }
        const bFreq = noteFreq[bassNotes[bar]] || 130.81;
        bassPhase += bFreq / sampleRate;
        const bSample = (2 * Math.abs(2 * (bassPhase % 1) - 1) - 1) * Math.exp(-((t % (sSec * 2)) / (sSec * 2)) * 3.0) * 0.25;

        let dSample = 0;
        const beatFrac = (t % (sSec * 4)) / (sSec * 4);
        if ((step % 4) === 0) {
          dSample += (Math.random() * 2 - 1) * Math.exp(-beatFrac * 20) * 0.35;
        }
        pcm[i] = Math.tanh(mSample + bSample + dSample);
      }
      return audioBuf;
    };

    const getTrackBuffer = (ctx, trackIdx) => {
      const idx = trackIdx % 3;
      if (!bgmBuffers[idx]) {
        if (idx === 0) bgmBuffers[0] = buildTrack0(ctx);
        else if (idx === 1) bgmBuffers[1] = buildTrack1(ctx);
        else bgmBuffers[2] = buildTrack2(ctx);
      }
      return bgmBuffers[idx];
    };

    const startBgm = async (targetTrack) => {
      const actx = initContext();
      if (!actx) return;
      if (actx.state === 'suspended') {
        try { await actx.resume(); } catch(e) {}
      }
      if (typeof targetTrack === 'number') {
        curTrack = targetTrack % 3;
        try { localStorage.setItem('sq-bgm-track', String(curTrack)); } catch(e) {}
      }
      if (isPlaying && bgmSource) {
        try { bgmSource.stop(); } catch(e) {}
        bgmSource.disconnect();
        bgmSource = null;
        isPlaying = false;
      }
      if (muted) {
        updateButtons();
        return;
      }
      try {
        const buf = getTrackBuffer(actx, curTrack);
        bgmSource = actx.createBufferSource();
        bgmSource.buffer = buf;
        bgmSource.loop = true;
        bgmSource.connect(bgmGain);
        bgmGain.gain.setValueAtTime(curVol, actx.currentTime);
        bgmSource.start();
        isPlaying = true;
      } catch(e) {
        isPlaying = false;
      }
      updateButtons();
    };

    const stopBgm = () => {
      if (!isPlaying || !bgmSource) {
        isPlaying = false;
        updateButtons();
        return;
      }
      try {
        if (bgmGain && audioCtx) {
          bgmGain.gain.setValueAtTime(0, audioCtx.currentTime);
        }
        bgmSource.stop();
        bgmSource.disconnect();
      } catch(e) {}
      bgmSource = null;
      isPlaying = false;
      updateButtons();
    };

    const toggleMute = () => {
      muted = !muted;
      try { localStorage.setItem('sq-bgm-muted', muted ? '1' : '0'); } catch(e) {}
      if (muted) {
        stopBgm();
        if (sfxGain && audioCtx) sfxGain.gain.setValueAtTime(0, audioCtx.currentTime);
      } else {
        if (sfxGain && audioCtx) sfxGain.gain.setValueAtTime(0.45, audioCtx.currentTime);
        startBgm(curTrack);
      }
      updateButtons();
    };

    const nextTrack = () => {
      curTrack = (curTrack + 1) % 3;
      try { localStorage.setItem('sq-bgm-track', String(curTrack)); } catch(e) {}
      if (!muted) {
        startBgm(curTrack);
      } else {
        updateButtons();
      }
    };

    const setVolume = (v) => {
      curVol = Math.max(0, Math.min(1, v));
      try { localStorage.setItem('sq-bgm-vol', String(curVol)); } catch(e) {}
      if (!muted && bgmGain && audioCtx) {
        bgmGain.gain.setValueAtTime(curVol, audioCtx.currentTime);
      }
      updateButtons();
    };

    const unlock = async () => {
      const actx = initContext();
      if (actx && actx.state === 'suspended') {
        try { await actx.resume(); } catch(e) {}
      }
      if (!isPlaying && !muted) {
        startBgm(curTrack);
      }
    };

    const playSfx = (type, param) => {
      if (muted) return;
      const actx = initContext();
      if (!actx) return;
      if (actx.state === 'suspended') {
        actx.resume().catch(() => {});
      }
      const now = actx.currentTime;
      try {
        if (type === 'tap') {
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'triangle';
          const p = Math.min(8, param || 0);
          osc.frequency.setValueAtTime(380 + p * 45, now);
          osc.frequency.exponentialRampToValueAtTime(760 + p * 60, now + 0.08);
          g.gain.setValueAtTime(0.35, now);
          g.gain.linearRampToValueAtTime(0.01, now + 0.08);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'step') {
          const scale = [349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 659.25, 698.46];
          const freq = scale[Math.min(scale.length - 1, param || 0)];
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.4, now);
          g.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.17);
        } else if (type === 'wrong') {
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.22);
          g.gain.setValueAtTime(0.3, now);
          g.gain.linearRampToValueAtTime(0.01, now + 0.22);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.23);
        } else if (type === 'correct') {
          const freqs = [349.23, 440.00, 523.25, 698.46];
          freqs.forEach((f, idx) => {
            const osc = actx.createOscillator();
            const g = actx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + idx * 0.07);
            g.gain.setValueAtTime(0, now + idx * 0.07);
            g.gain.linearRampToValueAtTime(0.35, now + idx * 0.07 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.32);
            osc.connect(g);
            g.connect(sfxGain);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 0.34);
          });
        } else if (type === 'fanfare') {
          const fanNotes = [
            { f: 349.23, t: 0, d: 0.12 },
            { f: 440.00, t: 0.12, d: 0.12 },
            { f: 523.25, t: 0.24, d: 0.15 },
            { f: 698.46, t: 0.40, d: 0.55 }
          ];
          fanNotes.forEach(n => {
            const osc = actx.createOscillator();
            const g = actx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(n.f, now + n.t);
            g.gain.setValueAtTime(0.28, now + n.t);
            g.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);
            osc.connect(g);
            g.connect(sfxGain);
            osc.start(now + n.t);
            osc.stop(now + n.t + n.d + 0.02);
          });
        } else if (type === 'gun') {
          const osc = actx.createOscillator();
          const g = actx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.exponentialRampToValueAtTime(2800, now + 0.2);
          g.gain.setValueAtTime(0.45, now);
          g.gain.linearRampToValueAtTime(0.01, now + 0.25);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now);
          osc.stop(now + 0.26);
        }
      } catch(e) {}
    };

    const updateButtons = () => {
      const eqHtml = '<span class="sq-eq"><i></i><i></i><i></i><i></i></span>';
      const topBtn = document.getElementById('sq-btn-audio');
      if (topBtn) {
        if (muted) {
          topBtn.className = 'sq-brand-pill is-audio is-muted';
          topBtn.innerHTML = '🔇 音樂(靜音)';
          topBtn.title = '點擊開啟闖關背景音樂 (可切換 3 首熱血曲風)';
        } else if (isPlaying) {
          topBtn.className = 'sq-brand-pill is-audio is-playing';
          topBtn.innerHTML = '🎵 ' + TRACK_NAMES[curTrack] + ' ' + eqHtml;
          topBtn.title = '正在播放：' + TRACK_NAMES[curTrack] + ' (點擊切換曲目或展開控制盒)';
        } else {
          topBtn.className = 'sq-brand-pill is-audio';
          topBtn.innerHTML = '🎵 開啟闖關音樂';
          topBtn.title = '點擊播放闖關背景音樂';
        }
      }
      const bqBtn = document.getElementById('sq-bq-audio-toggle');
      if (bqBtn) {
        if (muted) {
          bqBtn.className = 'sq-bq-audio-btn is-muted';
          bqBtn.innerHTML = '🔇 音樂已靜音';
        } else if (isPlaying) {
          bqBtn.className = 'sq-bq-audio-btn is-playing';
          bqBtn.innerHTML = '🎵 ' + TRACK_NAMES[curTrack] + ' ' + eqHtml;
        } else {
          bqBtn.className = 'sq-bq-audio-btn';
          bqBtn.innerHTML = '🎵 播放闖關音樂';
        }
      }
      const widgetBtn = document.getElementById('sq-music-main-btn');
      const widgetName = document.getElementById('sq-music-name');
      const widgetEq = document.getElementById('sq-music-eq');
      if (widgetBtn) {
        widgetBtn.classList.toggle('is-muted', muted);
        widgetBtn.classList.toggle('is-playing', isPlaying);
      }
      if (widgetName) {
        widgetName.textContent = muted ? '音樂靜音' : (isPlaying ? TRACK_NAMES[curTrack] : '點擊播放');
      }
      if (widgetEq) {
        widgetEq.style.display = (isPlaying && !muted) ? 'inline-flex' : 'none';
      }
      document.querySelectorAll('.sq-mp-track').forEach(btn => {
        const tIdx = parseInt(btn.dataset.track || '0', 10);
        btn.classList.toggle('is-active', tIdx === curTrack);
      });
      document.querySelectorAll('.sq-mp-vol-btn').forEach(btn => {
        const v = parseFloat(btn.dataset.vol || '0.38');
        btn.classList.toggle('is-active', Math.abs(v - curVol) < 0.1);
      });
    };

    return {
      initContext,
      startBgm,
      stopBgm,
      toggleMute,
      nextTrack,
      setVolume,
      unlock,
      playSfx,
      updateButtons,
      isMuted: () => muted,
      isPlaying: () => isPlaying,
      getTrackName: () => TRACK_NAMES[curTrack],
      getTrackIndex: () => curTrack
    };
  })();
`;

// 插入 soundEngine 到 customLogic 開頭（在 const STORAGE_KEY = 'sq-passport-v1'; 之後）
const markerStorage = "const STORAGE_KEY = 'sq-passport-v1';";
if (!code.includes('const soundEngine =')) {
  code = code.replace(
    markerStorage,
    markerStorage + '\n' + soundEngineCode + '\n' + `
  // 監聽頁面任何互動手勢，第一時間解鎖 Web Audio 並啟動熱血闖關音樂
  const onUserGestureUnlock = () => {
    soundEngine.unlock();
  };
  ['pointerdown', 'click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, onUserGestureUnlock, { passive: true });
  });`
  );
}

// 5. 在 renderHud() 呼叫 soundEngine.updateButtons()
if (!code.includes('soundEngine.updateButtons();')) {
  code = code.replace(
    "if (prEl) prEl.textContent = stampedCount + '/5章';",
    "if (prEl) prEl.textContent = stampedCount + '/5章';\n    soundEngine.updateButtons();"
  );
}

// 6. 綁定音訊控制事件與浮動音樂盒
const audioEventCode = `
  // 音樂控制面板與頂部按鈕事件
  document.getElementById('sq-btn-audio')?.addEventListener('click', () => {
    const pop = document.getElementById('sq-music-pop');
    if (pop && pop.hidden) {
      pop.hidden = false;
    } else if (soundEngine.isMuted()) {
      soundEngine.toggleMute();
      showToast('🎵 闖關背景音樂：' + soundEngine.getTrackName());
    } else {
      soundEngine.nextTrack();
      showToast('🎼 已切換曲目：' + soundEngine.getTrackName());
    }
  });

  const musicPop = document.getElementById('sq-music-pop');
  document.getElementById('sq-music-main-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (musicPop) {
      musicPop.hidden = !musicPop.hidden;
    }
  });
  document.getElementById('sq-mp-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (musicPop) musicPop.hidden = true;
  });
  document.addEventListener('click', (e) => {
    if (musicPop && !musicPop.hidden && !e.target.closest('#sq-music-widget') && !e.target.closest('#sq-btn-audio')) {
      musicPop.hidden = true;
    }
  });

  document.querySelectorAll('.sq-mp-track').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackIdx = parseInt(btn.dataset.track || '0', 10);
      soundEngine.startBgm(trackIdx);
      showToast('🎼 切換曲目：' + soundEngine.getTrackName());
    });
  });

  document.querySelectorAll('.sq-mp-vol-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vol = parseFloat(btn.dataset.vol || '0.38');
      soundEngine.setVolume(vol);
      showToast('🔊 音量調整：' + Math.round(vol * 100) + '%');
    });
  });
`;

if (!code.includes('document.getElementById(\'sq-music-main-btn\')')) {
  code = code.replace(
    "document.getElementById('sq-btn-athlete')?.addEventListener('click', () => {",
    audioEventCode + "\n  document.getElementById('sq-btn-athlete')?.addEventListener('click', () => {"
  );
}

// 7. 在 mountBuildingChallenge 中啟動 BGM 並在各互動點播放 SFX
const oldMountHead = `function mountBuildingChallenge(itemId) {
    const mount = document.getElementById('sq-item-quest-mount');
    if (!mount) return;`;

const newMountHead = `function mountBuildingChallenge(itemId) {
    const mount = document.getElementById('sq-item-quest-mount');
    if (!mount) return;
    soundEngine.startBgm();
    soundEngine.updateButtons();`;

if (!code.includes('soundEngine.startBgm();')) {
  code = code.replace(oldMountHead, newMountHead);
}

// 在關卡卡片頭部加入 sq-bq-audio-toggle 按鈕
const oldBqHead = `'<span class="sq-bq-diff-badge ' + diff.tagClass + '">' + diff.star + ' ' + curRole + '（' + diff.name + '）</span>' +
          '</div>' +`;

const newBqHead = `'<span class="sq-bq-diff-badge ' + diff.tagClass + '">' + diff.star + ' ' + curRole + '（' + diff.name + '）</span>' +
            '<button type="button" class="sq-bq-audio-btn ' + (soundEngine.isMuted() ? 'is-muted' : '') + '" id="sq-bq-audio-toggle" title="切換闖關背景音樂">' +
              (soundEngine.isMuted() ? '🔇 音樂已靜音' : '🎵 闖關熱血音樂🔊') +
            '</button>' +
          '</div>' +`;

if (!code.includes('id="sq-bq-audio-toggle"')) {
  code = code.replace(oldBqHead, newBqHead);
}

// 綁定 sq-bq-audio-toggle 點擊事件
const oldStage1Events = `// 綁定第一階段互動事件
    const msgEl = document.getElementById('sq-bq-stage1-msg');`;

const newStage1Events = `// 綁定第一階段互動事件
    document.getElementById('sq-bq-audio-toggle')?.addEventListener('click', () => {
      soundEngine.toggleMute();
      showToast(soundEngine.isMuted() ? '🔇 闖關背景音樂已靜音' : '🎵 闖關熱血音樂播放中！');
    });
    const msgEl = document.getElementById('sq-bq-stage1-msg');`;

if (!code.includes("document.getElementById('sq-bq-audio-toggle')")) {
  code = code.replace(oldStage1Events, newStage1Events);
}

// 連擊音效 tapCount
if (!code.includes("soundEngine.playSfx('tap'")) {
  code = code.replace(
    "actBtn?.addEventListener('click', () => {\n        tapCount = Math.min(target, tapCount + 1);",
    "actBtn?.addEventListener('click', () => {\n        soundEngine.playSfx('tap');\n        tapCount = Math.min(target, tapCount + 1);"
  );
}

// 步驟音效 seqBtns
if (!code.includes("soundEngine.playSfx('step'")) {
  code = code.replace(
    "btn.classList.add('is-done');\n            seqIdx++;",
    "btn.classList.add('is-done');\n            soundEngine.playSfx('step', seqIdx);\n            seqIdx++;"
  );
  code = code.replace(
    "btn.classList.add('is-wrong');",
    "soundEngine.playSfx('wrong');\n            btn.classList.add('is-wrong');"
  );
}

// 答對過關和弦與蓋章號角
if (!code.includes("soundEngine.playSfx('fanfare')")) {
  code = code.replace(
    "if (state.celebrated) {\n            showToast('🎉 已集齊大庄五力！中央「七一耀動聖火台」正施放 3D 勝利煙火！');\n          }",
    "soundEngine.playSfx('fanfare');\n          if (state.celebrated) {\n            showToast('🎉 已集齊大庄五力！中央「七一耀動聖火台」正施放 3D 勝利煙火！');\n          }"
  );
}

fs.writeFileSync(buildJsPath, code, 'utf8');
console.log('Successfully updated sports-quest-island/build/build.js with audio engine!');
