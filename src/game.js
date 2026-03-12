import { Input } from './input.js';
import { loadSave, persistSave } from './save.js';
import { AudioManager } from './audio.js';
import { MenuScene } from './scenes/menuScene.js';
import { CharacterSelectScene } from './scenes/characterSelectScene.js';
import { ProgressionScene } from './scenes/progressionScene.js';
import { BattleScene } from './scenes/battleScene.js';
import { ResultsScene } from './scenes/resultsScene.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.save = loadSave();
    this.audio = new AudioManager(this.save);
    this.pause = false;
    this.justClicked = false;
    this.tutorial = true;
    this.tutorialTime = 8;

    this.scenes = {
      menu: new MenuScene(this),
      heroSelect: new CharacterSelectScene(this),
      progression: new ProgressionScene(this),
      battle: null,
      results: new ResultsScene(this),
    };
    this.scene = this.scenes.menu;
    this.last = performance.now();
  }

  persist() { persistSave(this.save); }

  startMatch() {
    this.pause = false;
    this.scenes.battle = new BattleScene(this);
    this.scene = this.scenes.battle;
  }

  tick(now) {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.justClicked = this.input.mouse.left && !this.prevMouseLeft;
    this.prevMouseLeft = this.input.mouse.left;
    if (this.scene === this.scenes.battle) this.tutorialTime -= dt;

    this.scene.update(dt);
    this.scene.render(this.ctx);

    requestAnimationFrame((t) => this.tick(t));
  }
}
