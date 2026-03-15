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
      tutorial: {
        enter: () => this.ui.renderTutorial(this.tutorialStep),
        update: () => {},
        render: (ctx) => this.drawArenaBackdrop(ctx, 0.2),
      },
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

  start() {
    requestAnimationFrame(this.loop);
  }

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
      this.ui.toast('Upgrade complete');
      this.changeScene('roster');
    } else {
      this.ui.toast('Not enough coins');
    }
  }

  claimMission(id) {
    if (this.progression.claimMission(id)) {
      this.audio.play('reward');
      this.ui.toast('Mission reward claimed');
      this.changeScene('menu');
    }
  }

  claimRoad(index) {
    const reward = this.progression.claimRoad(index);
    if (!reward) return;
    this.audio.play('trophy');
    this.ui.toast('Path reward collected');
    this.changeScene('road');
  }

  openPack() {
    if (this.save.currencies.packs <= 0) return this.ui.toast('No capsules available');
    this.save.currencies.packs -= 1;
    const r = this.rollPackReward();

    if (r.type === 'coins') this.save.currencies.coins += r.amount;
    if (r.type === 'gems') this.save.currencies.gems += r.amount;

    if (r.type === 'shards') {
      const chars = this.characterSystem.list();
      const locked = chars.find((c) => !c.unlocked) || chars[0];
      const unlocked = this.characterSystem.addShards(locked.id, r.amount);
      this.save.lastReward = `${r.amount} shards for ${locked.name}${unlocked ? ' • Unlock!' : ''}`;
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
        return {
          type: item.type,
          amount: item.min + ((Math.random() * (item.max - item.min + 1)) | 0),
        };
      }
    }
    return { type: 'coins', amount: 80 };
  }

  nextTutorial() {
    this.tutorialStep += 1;
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
    const t = performance.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#335fae');
    gradient.addColorStop(0.4, '#1c346f');
    gradient.addColorStop(1, '#0d1737');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#93c6ff';
    for (let i = 0; i < 4; i += 1) {
      const x = 40 + i * 180 + Math.sin(t + i) * 5;
      const y = 120 + i * 45;
      ctx.fillRect(x, y, 70, 6);
      ctx.fillRect(x + 20, y - 8, 56, 6);
    }

    ctx.fillStyle = '#274883';
    for (let i = 0; i < 6; i += 1) {
      const y = 248 + i * 70;
      ctx.fillRect(0, y, this.width, 38);
    }

    ctx.fillStyle = '#1a2f5e';
    for (let i = 0; i < 32; i += 1) {
      const sway = Math.sin(i * 0.8 + t * 2.2) * 4;
      ctx.fillRect(i * 24, 780 + sway, 18, 34);
    }

    ctx.fillStyle = '#355d9f';
    ctx.fillRect(0, 915, this.width, 210);

    ctx.fillStyle = '#75b6ff';
    for (let i = 0; i < 16; i += 1) {
      const width = 22;
      const h = 6 + ((i % 3) * 2);
      ctx.fillRect(i * 48, 960 + Math.sin(t * 3 + i) * intensity * 4, width, h);
    }

    ctx.fillStyle = `rgba(255, 220, 130, ${0.55 * intensity})`;
    const pulse = (Math.sin(performance.now() * 0.004) * 0.5 + 0.5) * intensity;
    ctx.fillRect(0, 188, this.width * pulse, 6);
  }

  drawHeroShowcase(ctx) {
    const hero = this.characterSystem.get(this.save.profile.selectedCharacter);
    const t = performance.now() * 0.0025;
    const bob = Math.sin(t) * 4;
    ctx.save();
    ctx.translate(360, 878 + bob);

    ctx.fillStyle = '#0f1f49';
    ctx.fillRect(-138, -236, 276, 248);
    ctx.fillStyle = 'rgba(125, 170, 255, 0.35)';
    ctx.fillRect(-132, -230, 264, 12);

    ctx.fillStyle = hero.color;
    ctx.fillRect(-58, -170, 116, 144);
    ctx.fillStyle = '#ffedcb';
    ctx.fillRect(-40, -214, 80, 48);
    ctx.fillStyle = '#121a3a';
    ctx.fillRect(-22, -196, 10, 8);
    ctx.fillRect(12, -196, 10, 8);

    ctx.fillStyle = 'rgba(255, 250, 200, 0.4)';
    ctx.fillRect(70, -210, 14, 150);
    ctx.restore();
  }

  persist() {
    this.saveManager.save(this.save);
  }
}
