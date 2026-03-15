import { CONFIG } from '../config.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { MatchScene } from './scenes/MatchScene.js';
import { TrophyRoadScene } from './scenes/TrophyRoadScene.js';
import { RosterScene } from './scenes/RosterScene.js';
import { RewardsScene } from './scenes/RewardsScene.js';
import { SaveManager } from '../systems/SaveManager.js';
import { InputManager } from '../systems/InputManager.js';
import { AudioManager } from '../systems/AudioManager.js';
import { UIManager } from '../systems/UIManager.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { CharacterSystem } from '../systems/CharacterSystem.js';
import { PACK_TABLE } from '../data/rewards.js';

export class Game {
  constructor(canvas, uiLayer) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = CONFIG.game.width;
    this.height = CONFIG.game.height;
    this.saveManager = new SaveManager();
    this.save = this.saveManager.load();

    this.input = new InputManager(canvas, uiLayer);
    this.audio = new AudioManager();
    this.ui = new UIManager(uiLayer, this);
    this.characterSystem = new CharacterSystem(this.save);
    this.progression = new ProgressionSystem(this.save, this.characterSystem);
    this.progression.ensureMissions();

    this.tutorialStep = 0;
    this.scenes = {
      boot: new BootScene(this),
      menu: new MenuScene(this),
      match: new MatchScene(this),
      road: new TrophyRoadScene(this),
      roster: new RosterScene(this),
      rewards: new RewardsScene(this),
      tutorial: { enter: () => this.ui.renderTutorial(this.tutorialStep), update: () => {}, render: (ctx) => this.drawArenaBackdrop(ctx, 0.18) },
    };
    this.currentScene = this.scenes.boot;
    this.currentScene.enter();
    this.last = performance.now();
  }

  loop = (now) => {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.currentScene.update(dt);
    this.currentScene.render(this.ctx);
    requestAnimationFrame(this.loop);
  };

  start() { requestAnimationFrame(this.loop); }

  changeScene(key, ...args) {
    this.currentScene = this.scenes[key];
    this.currentScene.enter?.(...args);
    this.persist();
  }

  startMatch(ranked) {
    this.changeScene('match', ranked);
  }

  getMenuData() {
    return {
      profile: this.save.profile,
      currencies: this.save.currencies,
      missions: this.save.missions,
      selected: this.characterSystem.get(this.save.profile.selectedCharacter),
    };
  }

  selectCharacter(id) {
    if (!this.save.unlocks.includes(id)) return;
    this.save.profile.selectedCharacter = id;
    this.changeScene('roster');
  }

  upgradeCharacter(id) {
    if (this.characterSystem.upgrade(id)) {
      this.audio.play('reward');
      this.ui.toast('Upgrade successful');
      this.changeScene('roster');
    } else this.ui.toast('Not enough coins');
  }

  claimMission(id) {
    if (this.progression.claimMission(id)) {
      this.audio.play('reward');
      this.ui.toast('Mission claimed!');
      this.changeScene('menu');
    }
  }

  claimRoad(index) {
    const reward = this.progression.claimRoad(index);
    if (!reward) return;
    this.audio.play('trophy');
    this.ui.toast(`Claimed ${reward.type}`);
    this.changeScene('road');
  }

  openPack() {
    if (this.save.currencies.packs <= 0) return this.ui.toast('No capsules left');
    this.save.currencies.packs -= 1;
    const r = this.rollPackReward();
    if (r.type === 'coins') this.save.currencies.coins += r.amount;
    if (r.type === 'gems') this.save.currencies.gems += r.amount;
    if (r.type === 'shards') {
      const locked = this.characterSystem.list().find((c) => !c.unlocked) || this.characterSystem.list()[0];
      const unlocked = this.characterSystem.addShards(locked.id, r.amount);
      this.save.lastReward = `${r.amount} ${locked.name} shards${unlocked ? ' • Unlocked!' : ''}`;
      this.audio.play('reward');
      this.changeScene('rewards');
      return;
    }
    this.save.lastReward = `${r.amount} ${r.type}`;
    this.audio.play('reward');
    this.changeScene('rewards');
  }

  rollPackReward() {
    const total = PACK_TABLE.reduce((a, b) => a + b.weight, 0);
    let roll = Math.random() * total;
    for (const item of PACK_TABLE) {
      roll -= item.weight;
      if (roll <= 0) {
        return { type: item.type, amount: item.min + ((Math.random() * (item.max - item.min + 1)) | 0) };
      }
    }
    return { type: 'coins', amount: 80 };
  }

  nextTutorial() {
    this.tutorialStep++;
    if (this.tutorialStep > 3) return this.finishTutorial();
    this.ui.renderTutorial(this.tutorialStep);
  }

  finishTutorial() {
    this.save.tutorialDone = true;
    this.tutorialStep = 0;
    this.ui.renderTutorial(0, true);
    setTimeout(() => this.changeScene('menu'), 600);
  }

  drawArenaBackdrop(ctx, intensity = 1) {
    ctx.fillStyle = '#2c4a8e';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#243d77';
    for (let i = 0; i < 6; i++) ctx.fillRect(0, 220 + i * 70, this.width, 40);
    ctx.fillStyle = '#1a2e5b';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect(i * 26, 760 + Math.sin(i) * 6, 18, 34);
    }
    ctx.fillStyle = '#ffd67a';
    const pulse = (Math.sin(performance.now() * 0.004) * 0.5 + 0.5) * intensity;
    ctx.fillRect(0, 180, this.width * pulse, 6);
  }

  drawHeroShowcase(ctx) {
    const hero = this.characterSystem.get(this.save.profile.selectedCharacter);
    ctx.save();
    ctx.translate(360, 860);
    ctx.fillStyle = '#10204c';
    ctx.fillRect(-120, -220, 240, 240);
    ctx.fillStyle = hero.color;
    ctx.fillRect(-56, -170, 112, 140);
    ctx.fillStyle = '#ffedcb';
    ctx.fillRect(-40, -210, 80, 45);
    ctx.fillStyle = '#10152f';
    ctx.fillRect(-23, -194, 10, 8);
    ctx.fillRect(13, -194, 10, 8);
    ctx.restore();
  }

  persist() { this.saveManager.save(this.save); }
}
