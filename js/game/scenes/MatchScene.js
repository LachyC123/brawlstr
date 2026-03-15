import { Player } from '../../entities/Player.js';
import { Opponent } from '../../entities/Opponent.js';
import { Ball } from '../../entities/Ball.js';
import { Net } from '../../entities/Net.js';

export class MatchScene {
  constructor(game) {
    this.game = game;
    this.floorY = 1040;
    this.playerScore = 0;
    this.aiScore = 0;
    this.rally = 0;
    this.modeRanked = true;
    this.stats = { spikes: 0, specials: 0 };
    this.hitStop = 0;
    this.shake = 0;
    this.particles = [];
    this.ambient = [];
    this.celebrate = 0;
  }

  enter(modeRanked = true) {
    this.modeRanked = modeRanked;
    this.playerScore = 0;
    this.aiScore = 0;
    this.rally = 0;
    this.stats = { spikes: 0, specials: 0 };
    this.particles = [];
    this.ambient = Array.from({ length: 20 }, (_, i) => ({
      x: (i * 37) % this.game.width,
      y: 640 + (i * 17) % 350,
      speed: 8 + (i % 5) * 2,
      size: 2 + (i % 2),
    }));
    const selected = this.game.characterSystem.get(this.game.save.profile.selectedCharacter);
    const aiPool = this.game.characterSystem.list().filter((c) => c.unlocked);
    const aiChar = aiPool[(Math.random() * aiPool.length) | 0];
    this.player = new Player(170, this.floorY, selected);
    this.ai = new Opponent(540, this.floorY, aiChar, true);
    this.ball = new Ball(180, 820);
    this.net = new Net(360, this.floorY + 5);
    this.roundOver = false;
    this.celebrate = 0;
    this.difficulty = Math.min(0.92, 0.45 + this.game.save.profile.trophies / 900);
    this.ball.serve(true);
    this.game.audio.play('serve');
    this.game.ui.renderMatchHUD(this.hudState());
    this.game.ui.toast(this.modeRanked ? 'Trophy Clash' : 'Casual Rally');
  }

  hudState() {
    return { playerScore: this.playerScore, aiScore: this.aiScore, rally: this.rally, energy: this.player.energy };
  }

  update(dt) {
    if (this.roundOver) return;
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }

    const i = this.game.input.state;
    this.player.update(dt, (i.right ? 1 : 0) - (i.left ? 1 : 0), i.jump, i.special, 2050);
    if (this.player.justJumped) this.game.audio.play('jump');
    if (this.player.specialTimer > 0.52) this.game.audio.play('characterSpecial');

    this.ai.think(this.ball, dt, this.difficulty, { min: 380, max: 690 });

    this.player.x = Math.max(30, Math.min(330, this.player.x));
    this.ai.x = Math.max(390, Math.min(690, this.ai.x));

    this.ball.update(dt, 2050);
    this.handleCollisions();
    this.updateParticles(dt);

    if (this.ball.y + this.ball.radius > this.floorY + 2) {
      this.spawnBurst(this.ball.x, this.floorY - 8, '#b6d6ff', 12, 130);
      const playerLost = this.ball.x < 360;
      this.scorePoint(!playerLost);
    }

    if (this.ball.x < 10 || this.ball.x > this.game.width - 10) {
      this.ball.vx *= -0.88;
      this.ball.x = Math.max(10, Math.min(this.game.width - 10, this.ball.x));
      this.spawnBurst(this.ball.x, this.ball.y, '#cce6ff', 6, 90);
    }

    this.shake *= 0.84;
    this.celebrate = Math.max(0, this.celebrate - dt);
    this.game.ui.renderMatchHUD(this.hudState());
  }

  updateParticles(dt) {
    this.particles = this.particles.filter((p) => p.life > 0);
    this.particles.forEach((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
    });

    this.ambient.forEach((p) => {
      p.y -= p.speed * dt;
      if (p.y < 610) {
        p.y = 980;
        p.x = 14 + Math.random() * (this.game.width - 28);
      }
    });
  }

  spawnBurst(x, y, color, count = 8, speed = 120) {
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const power = speed * (0.5 + Math.random() * 0.9);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * power,
        vy: Math.sin(a) * power - 30,
        color,
        life: 0.32 + Math.random() * 0.18,
      });
    }
  }

  handleCollisions() {
    const hit = (actor, side) => {
      const dx = this.ball.x - actor.x;
      const dy = this.ball.y - (actor.y - 45);
      if (Math.abs(dx) < 48 && Math.abs(dy) < 46 && this.ball.vy > -900) {
        const pwr = actor.character.stats.power * this.game.characterSystem.statMultiplier(actor.character.id);
        const aimBonus = Math.max(0, Math.min(110, Math.abs(dx) * 2));
        this.ball.vx = side * (300 + Math.abs(dx) * 4.5 + pwr * 130 + aimBonus);
        this.ball.vy = -980 - pwr * 145;

        if (actor.specialTimer > 0) {
          this.stats.specials += 1;
          this.ball.vx *= 1.35;
          this.ball.vy *= 1.07;
          this.ball.ignite = actor.character.id === 'flare' ? 1.2 : 0.35;
          if (actor.character.id === 'granite') this.ball.vx *= -1;
          this.shake = 14;
          this.spawnBurst(this.ball.x, this.ball.y, actor.character.fxColor, 14, 220);
          this.game.audio.play('spikeHit');
        } else {
          this.spawnBurst(this.ball.x, this.ball.y, '#f0f6ff', 7, 120);
          this.game.audio.play('serve');
        }

        actor.triggerHitPose();
        actor.gainEnergy(10);
        actor.touches += 1;
        this.stats.spikes += 1;
        this.rally += 1;
        this.hitStop = this.rally > 6 ? 0.017 : 0.012;
      }
    };

    hit(this.player, 1);
    hit(this.ai, -1);

    const topY = this.net.floorY - this.net.height;
    if (Math.abs(this.ball.x - this.net.x) < this.net.width / 2 + this.ball.radius && this.ball.y > topY - 10) {
      this.ball.vx *= -0.83;
      this.ball.x += Math.sign(this.ball.vx) * 6;
      this.spawnBurst(this.net.x, this.ball.y, '#d8efff', 6, 90);
      this.player.triggerBlockPose();
      this.ai.triggerBlockPose();
      this.game.audio.play('block');
    }
  }

  scorePoint(playerScored) {
    if (playerScored) this.playerScore += 1;
    else this.aiScore += 1;
    this.rally = 0;
    this.celebrate = 0.45;
    this.game.audio.play('score');

    if (this.playerScore >= 5 || this.aiScore >= 5) {
      const won = this.playerScore > this.aiScore;
      if (this.modeRanked) {
        this.game.progression.onMatchResult({ won, spikes: this.stats.spikes, specials: this.stats.specials });
      }
      this.game.save.currencies.packs += won ? 1 : 0;
      this.game.save.lastReward = won ? 'Win bonus: +1 capsule' : 'Match bonus: +30 coins';
      this.roundOver = true;
      this.player.setResultPose(won);
      this.ai.setResultPose(!won);
      this.game.audio.play(won ? 'victory' : 'defeat');
      this.game.ui.showResultBanner(won);
      this.game.ui.toast(won ? 'Crowd goes wild!' : 'Reset and run it back');
      setTimeout(() => this.game.changeScene('menu'), 1300);
      return;
    }

    this.ball = new Ball(playerScored ? 180 : 540, 820);
    this.ball.serve(playerScored);
    this.game.audio.play('serve');
    this.player.reset(170);
    this.ai.reset(540);
  }

  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 1);
    if (this.shake > 0.3) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake * 0.6);
    }

    ctx.fillStyle = '#346ea5';
    ctx.fillRect(0, this.floorY, this.game.width, this.game.height - this.floorY);
    ctx.strokeStyle = 'rgba(205,231,255,0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, this.floorY + 12);
    ctx.lineTo(this.game.width - 20, this.floorY + 12);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(155,210,255,0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i += 1) {
      ctx.beginPath();
      ctx.moveTo(15 + i * 58, this.floorY + 14);
      ctx.lineTo(44 + i * 58, this.floorY + 26);
      ctx.stroke();
    }

    this.ambient.forEach((p) => {
      ctx.fillStyle = 'rgba(180, 228, 255, 0.2)';
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    this.net.draw(ctx);
    this.player.draw(ctx);
    this.ai.draw(ctx);
    this.ball.draw(ctx);

    this.particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life * 2.2);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
      ctx.globalAlpha = 1;
    });

    if (this.shake > 0.3) ctx.restore();

    if (this.celebrate > 0) {
      ctx.fillStyle = `rgba(255,238,173,${this.celebrate * 0.5})`;
      ctx.fillRect(0, 220, this.game.width, 14);
    }

    ctx.fillStyle = '#ffe2a3';
    ctx.font = '14px "Press Start 2P"';
    const tension = this.rally > 6 ? 'Hot Rally!' : ' '; 
    ctx.fillText(tension, 24, 100);
  }
}
