const DEFAULT_BUS = {
  master: 0.72,
  ui: 0.45,
  reward: 0.65,
  gameplay: 0.62,
  result: 0.68,
};

export class AudioManager {
  constructor(settings = {}) {
    this.ctx = null;
    this.enabled = settings.enabled ?? true;
    this.sampleMap = settings.sampleMap || {};
    this.buffers = new Map();
    this.bus = { ...DEFAULT_BUS, ...(settings.volume || {}) };
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  setBus(bus, value) {
    if (this.bus[bus] != null) this.bus[bus] = Math.max(0, Math.min(1, value));
  }

  ensureContext() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  createBusGain(category, volume = 1) {
    const gain = this.ctx.createGain();
    const bus = this.bus[category] ?? 0.6;
    gain.gain.value = bus * this.bus.master * volume;
    gain.connect(this.ctx.destination);
    return gain;
  }

  layerTone(opts = {}) {
    const {
      freq = 440,
      duration = 0.12,
      type = 'triangle',
      volume = 0.2,
      category = 'ui',
      attack = 0.004,
      decay = duration,
      endFreq,
      detune = 0,
    } = opts;

    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const out = this.createBusGain(category, volume);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + duration);
    if (detune) osc.detune.setValueAtTime(detune, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(1, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  layerNoise(opts = {}) {
    const {
      duration = 0.08,
      volume = 0.18,
      category = 'gameplay',
      highpass = 800,
      lowpass = 8000,
      attack = 0.001,
      decay = duration,
    } = opts;

    this.ensureContext();
    const now = this.ctx.currentTime;
    const size = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / size);

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = highpass;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lowpass;

    const gain = this.ctx.createGain();
    const out = this.createBusGain(category, volume);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(1, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    src.connect(hp).connect(lp).connect(gain).connect(out);
    src.start(now);
    src.stop(now + duration + 0.01);
  }

  async playSample(url, category, volume = 1) {
    if (!url) return false;
    this.ensureContext();
    let buffer = this.buffers.get(url);
    if (!buffer) {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      buffer = await this.ctx.decodeAudioData(arr);
      this.buffers.set(url, buffer);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.createBusGain(category, volume));
    src.start();
    return true;
  }

  play(event) {
    if (!this.enabled) return;

    const sample = this.sampleMap[event];
    if (sample) {
      this.playSample(sample, 'ui').catch(() => {});
      return;
    }

    const map = {
      uiTap: () => {
        this.layerTone({ freq: 680, endFreq: 520, duration: 0.05, volume: 0.22, category: 'ui', type: 'triangle' });
      },
      menuConfirm: () => {
        this.layerTone({ freq: 420, endFreq: 620, duration: 0.12, volume: 0.23, category: 'ui', type: 'sine' });
        this.layerTone({ freq: 840, endFreq: 720, duration: 0.1, volume: 0.14, category: 'ui', type: 'triangle', detune: 5 });
      },
      rewardReveal: () => {
        this.layerTone({ freq: 520, endFreq: 920, duration: 0.2, volume: 0.28, category: 'reward', type: 'triangle' });
        this.layerTone({ freq: 780, endFreq: 1260, duration: 0.24, volume: 0.2, category: 'reward', type: 'sine' });
        this.layerNoise({ duration: 0.11, volume: 0.09, category: 'reward', highpass: 1700 });
      },
      coinGain: () => {
        this.layerTone({ freq: 980, endFreq: 1320, duration: 0.09, volume: 0.25, category: 'reward', type: 'square' });
        this.layerTone({ freq: 1520, endFreq: 1780, duration: 0.07, volume: 0.16, category: 'reward', type: 'triangle' });
      },
      trophyMilestone: () => {
        this.layerTone({ freq: 500, endFreq: 760, duration: 0.15, volume: 0.23, category: 'reward', type: 'triangle' });
        this.layerTone({ freq: 760, endFreq: 1040, duration: 0.16, volume: 0.2, category: 'reward', type: 'triangle' });
        this.layerTone({ freq: 1040, endFreq: 1320, duration: 0.2, volume: 0.16, category: 'reward', type: 'sine' });
      },
      jump: () => {
        this.layerTone({ freq: 360, endFreq: 520, duration: 0.09, volume: 0.16, category: 'gameplay', type: 'triangle' });
      },
      spikeHit: () => {
        this.layerNoise({ duration: 0.07, volume: 0.2, category: 'gameplay', highpass: 900, lowpass: 6000 });
        this.layerTone({ freq: 190, endFreq: 110, duration: 0.12, volume: 0.3, category: 'gameplay', type: 'sawtooth' });
      },
      block: () => {
        this.layerTone({ freq: 300, endFreq: 240, duration: 0.08, volume: 0.22, category: 'gameplay', type: 'square' });
        this.layerNoise({ duration: 0.045, volume: 0.09, category: 'gameplay', highpass: 2000 });
      },
      serve: () => {
        this.layerTone({ freq: 260, endFreq: 380, duration: 0.08, volume: 0.18, category: 'gameplay', type: 'triangle' });
      },
      score: () => {
        this.layerTone({ freq: 720, endFreq: 980, duration: 0.14, volume: 0.22, category: 'result', type: 'triangle' });
        this.layerTone({ freq: 980, endFreq: 1320, duration: 0.15, volume: 0.16, category: 'result', type: 'sine' });
      },
      victory: () => {
        this.layerTone({ freq: 420, endFreq: 640, duration: 0.15, volume: 0.2, category: 'result', type: 'triangle' });
        this.layerTone({ freq: 640, endFreq: 960, duration: 0.2, volume: 0.22, category: 'result', type: 'triangle' });
        this.layerTone({ freq: 960, endFreq: 1280, duration: 0.24, volume: 0.2, category: 'result', type: 'sine' });
      },
      defeat: () => {
        this.layerTone({ freq: 430, endFreq: 270, duration: 0.2, volume: 0.2, category: 'result', type: 'sawtooth' });
        this.layerTone({ freq: 270, endFreq: 170, duration: 0.22, volume: 0.16, category: 'result', type: 'triangle' });
      },
      characterSpecial: () => {
        this.layerTone({ freq: 520, endFreq: 780, duration: 0.1, volume: 0.25, category: 'gameplay', type: 'square' });
        this.layerTone({ freq: 780, endFreq: 620, duration: 0.14, volume: 0.18, category: 'gameplay', type: 'triangle' });
        this.layerNoise({ duration: 0.09, volume: 0.11, category: 'gameplay', highpass: 1200 });
      },
    };

    map[event]?.();
  }
}
