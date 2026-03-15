export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  tone(freq = 440, duration = 0.08, type = 'square', volume = 0.02) {
    if (!this.enabled) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  play(event) {
    const map = {
      click: () => this.tone(510, 0.05),
      serve: () => this.tone(300, 0.06, 'triangle'),
      spike: () => { this.tone(150, 0.1, 'sawtooth', 0.03); this.tone(120, 0.15, 'square', 0.02); },
      block: () => this.tone(190, 0.09, 'square'),
      score: () => { this.tone(700, 0.08); this.tone(910, 0.1); },
      reward: () => { this.tone(600, 0.08, 'triangle'); this.tone(820, 0.12, 'triangle'); },
      trophy: () => { this.tone(650, 0.08); this.tone(820, 0.08); this.tone(1030, 0.1); },
    };
    map[event]?.();
  }
}
