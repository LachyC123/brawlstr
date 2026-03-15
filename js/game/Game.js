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
    this.save.settings = this.save.settings || { audio: { sfxEnabled: true } };
    this.save.settings.audio = this.save.settings.audio || { sfxEnabled: true };

    this.input = new InputManager(canvas, uiLayer);
    this.audio = new AudioManager({ enabled: this.save.settings.audio.sfxEnabled });
    this.ui = new UIManager(uiLayer, this);
    this.characterSystem = new CharacterSystem(this.save);
    this.progression = new ProgressionSystem(this.save, this.characterSystem);
    this.progression.ensureMissions();

    this.tutorialStep = 0;
    this.isPaused = false;
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
    if (!this.isPaused) this.currentScene.update(dt);
    this.currentScene.render(this.ctx);
    requestAnimationFrame(this.loop);
  };

  start() {
    requestAnimationFrame(this.loop);
  }

  changeScene(key, ...args) {
    this.isPaused = false;
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
      sfxEnabled: this.save.settings.audio.sfxEnabled,
    };
  }

  setSfxEnabled(enabled) {
    this.save.settings.audio.sfxEnabled = enabled;
    this.audio.setEnabled(enabled);
    this.ui.toast(enabled ? 'SFX On' : 'SFX Off');
    this.changeScene('menu');
  }

  selectCharacter(id) {
    if (!this.save.unlocks.includes(id)) return;
    this.save.profile.selectedCharacter = id;
    this.audio.play('menuConfirm');
    this.changeScene('roster');
  }

  upgradeCharacter(id) {
    if (this.characterSystem.upgrade(id)) {
      this.audio.play('coinGain');
      this.ui.toast('Upgrade complete');
      this.changeScene('roster');
    } else {
      this.ui.toast('Not enough coins');
    }
  }

  claimMission(id) {
    if (this.progression.claimMission(id)) {
      this.audio.play('rewardReveal');
      this.ui.toast('Mission reward claimed');
      this.changeScene('menu');
    }
  }

  claimRoad(index) {
    const reward = this.progression.claimRoad(index);
    if (!reward) return;
    this.audio.play('trophyMilestone');
    this.ui.toast('Path reward collected');
    this.changeScene('road');
  }

  openPack() {
    if (this.save.currencies.packs <= 0) return this.ui.toast('No capsules available');
    this.save.currencies.packs -= 1;
    const r = this.rollPackReward();

    if (r.type === 'coins') {
      this.save.currencies.coins += r.amount;
      this.audio.play('coinGain');
    }
    if (r.type === 'gems') this.save.currencies.gems += r.amount;

    if (r.type === 'shards') {
      const chars = this.characterSystem.list();
      const locked = chars.find((c) => !c.unlocked) || chars[0];
      const unlocked = this.characterSystem.addShards(locked.id, r.amount);
      this.save.lastReward = `${r.amount} shards for ${locked.name}${unlocked ? ' • Unlock!' : ''}`;
      this.audio.play('rewardReveal');
      this.changeScene('rewards');
      return;
    }

    this.save.lastReward = `${r.amount} ${r.type}`;
    this.audio.play('rewardReveal');
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
    this.isPaused = false;
    this.ui.renderTutorial(0, true);
    setTimeout(() => this.changeScene('menu'), 600);
  }

  drawArenaBackdrop(ctx, intensity = 1) {
    const t = performance.now() * 0.001;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#345ca6');
    gradient.addColorStop(0.35, '#1b3064');
    gradient.addColorStop(1, '#0b1330');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    for (let i = 0; i < 8; i += 1) {
      const alpha = 0.15 + Math.sin(t * 1.5 + i) * 0.05;
      ctx.fillStyle = `rgba(173,208,255,${alpha * intensity})`;
      ctx.fillRect(40 + i * 90, 90 + (i % 2) * 35, 70, 8);
    }

    ctx.fillStyle = '#274883';
    for (let i = 0; i < 6; i += 1) ctx.fillRect(0, 248 + i * 70, this.width, 38);

    for (let i = 0; i < 36; i += 1) {
      const sway = Math.sin(i * 0.8 + t * 2.2) * 4;
      ctx.fillStyle = i % 3 === 0 ? '#16284f' : '#1d3567';
      ctx.fillRect(i * 20, 770 + sway, 16, 46);
      ctx.fillStyle = 'rgba(243, 203, 112, 0.25)';
      ctx.fillRect(i * 20 + 5, 758 + sway * 0.4, 6, 6);
    }

    for (let i = 0; i < 7; i += 1) {
      const bx = 34 + i * 102;
      const wave = Math.sin(t * 2 + i) * 6;
      ctx.fillStyle = '#d5545f';
      ctx.fillRect(bx, 666 + wave, 50, 8);
      ctx.fillStyle = '#ffd7a5';
      ctx.fillRect(bx + 4, 674 + wave, 20, 4);
      ctx.fillStyle = '#86b9ff';
      ctx.fillRect(bx + 26, 674 + wave, 20, 4);
    }

    ctx.fillStyle = '#355d9f';
    ctx.fillRect(0, 915, this.width, 210);

    ctx.strokeStyle = 'rgba(193,225,255,0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 940 + i * 20);
      ctx.lineTo(this.width, 940 + i * 20 + Math.sin(t + i) * 4);
      ctx.stroke();
    }

    for (let i = 0; i < 20; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${0.08 + (i % 2) * 0.04})`;
      ctx.fillRect(24 + i * 34, 970 + Math.sin(t * 3 + i) * intensity * 5, 10, 10);
    }

    ctx.fillStyle = `rgba(255, 220, 130, ${0.55 * intensity})`;
    const pulse = (Math.sin(performance.now() * 0.004) * 0.5 + 0.5) * intensity;
    ctx.fillRect(0, 188, this.width * pulse, 6);
  }

  drawCharacterSprite(ctx, hero, x, y, scale = 1.8) {
    const v = hero.visuals;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const px = (x0, y0, w, h, color) => {
      ctx.fillStyle = v.outline;
      ctx.fillRect(x0 - 1, y0 - 1, w + 2, h + 2);
      ctx.fillStyle = color;
      ctx.fillRect(x0, y0, w, h);
    };

    px(-10, -16, 9, 12, v.legs);
    px(2, -16, 9, 12, v.legs);
    px(-10, -4, 9, 5, v.shoes);
    px(2, -4, 9, 5, v.shoes);
    px(-15, -52, 30, 36, v.torso);
    px(-20, -50, 8, 22, v.shoulder);
    px(12, -50, 8, 22, v.shoulder);
    px(-20, -32, 8, 6, v.gloves);
    px(12, -32, 8, 6, v.gloves);
    px(-12, -68, 24, 18, v.skin);
    px(-15, -76, 30, 8, v.hair);
    px(-7, -80, 14, 4, v.headgear);
    px(-3, -42, 6, 10, v.band);

    ctx.fillStyle = v.band;
    ctx.font = 'bold 8px Inter';
    ctx.fillText(v.emblem, -3, -35);
    ctx.restore();
  }

  drawHeroShowcase(ctx) {
    const hero = this.characterSystem.get(this.save.profile.selectedCharacter);
    const t = performance.now() * 0.0025;
    const bob = Math.sin(t) * 4;
    ctx.save();
    ctx.translate(360, 880 + bob);

    ctx.fillStyle = '#0f1f49';
    ctx.fillRect(-146, -242, 292, 262);
    const cg = ctx.createLinearGradient(-120, -220, 120, -20);
    cg.addColorStop(0, hero.cardGradient[0]);
    cg.addColorStop(1, hero.cardGradient[1]);
    ctx.fillStyle = cg;
    ctx.fillRect(-136, -232, 272, 230);
    ctx.fillStyle = 'rgba(214,232,255,0.2)';
    ctx.fillRect(-136, -232, 272, 18);

    this.drawCharacterSprite(ctx, hero, 0, -18, 3.6);

    ctx.fillStyle = hero.fxColor;
    ctx.fillRect(-114, -46, 228, 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 16px Inter';
    ctx.fillText(hero.name, -116, -58);
    ctx.fillStyle = '#d2e5ff';
    ctx.font = '700 11px Inter';
    ctx.fillText(`${hero.role} • ${hero.rarity}`, -116, -78);
    ctx.restore();
  }


  togglePause() {
    if (this.currentScene !== this.scenes.match) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) this.ui.showPauseMenu();
    else this.ui.renderMatchHUD(this.currentScene.hudState());
  }

  quitMatchToMenu() {
    this.isPaused = false;
    this.changeScene('menu');
  }

  persist() {
    this.saveManager.save(this.save);
  }
}
