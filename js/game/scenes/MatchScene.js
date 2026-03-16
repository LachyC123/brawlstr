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
    this.eventText = 'Match start';
    this.eventTimer = 0;
    this.serveFlash = 0;
  }

  enter(modeRanked = true, matchup = null) {
    this.modeRanked = modeRanked;
    this.playerScore = 0;
    this.aiScore = 0;
    this.rally = 0;
    this.stats = { spikes: 0, specials: 0 };
    this.particles = [];
    this.ambient = Array.from({ length: 34 }, (_, i) => ({
      x: (i * 29) % this.game.width,
      y: 640 + (i * 13) % 360,
      speed: 7 + (i % 6) * 2,
      size: 1 + (i % 3),
      drift: (i % 2 === 0 ? 1 : -1) * (6 + (i % 4) * 2),
    }));
    const selected = matchup?.player?.character || this.game.characterSystem.get(this.game.save.profile.selectedCharacter);
    const aiPool = this.game.characterSystem.list();
    const aiChar = matchup?.opponent?.character || aiPool[(Math.random() * aiPool.length) | 0];
    this.matchup = matchup;
    this.player = new Player(170, this.floorY, selected);
    this.ai = new Opponent(540, this.floorY, aiChar, true);
    this.ball = new Ball(180, 820);
    this.net = new Net(360, this.floorY + 5);
    this.roundOver = false;
    this.celebrate = 0;
    this.serveFlash = 0.35;
    this.eventText = 'Opening serve';
    this.eventTimer = 1;
    this.difficulty = Math.min(0.92, 0.45 + this.game.save.profile.trophies / 900);
    this.ball.serve(true);
    this.game.audio.play('serve');
    this.game.ui.renderMatchHUD(this.hudState());
    this.game.ui.showMatchIntro(this.modeRanked ? 'Trophy Clash' : 'Casual Rally');
  }

  hudState() {
    return {
      playerScore: this.playerScore,
      aiScore: this.aiScore,
      rally: this.rally,
      energy: this.player.energy,
      specialReady: this.player.specialReady,
      eventText: this.eventText,
    };
  }

  postEvent(text, timer = 1.1) {
    this.eventText = text;
    this.eventTimer = timer;
  }

  update(dt) {
    if (this.roundOver) return;
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }

    const i = this.game.input.state;
    this.player.update(dt, (i.right ? 1 : 0) - (i.left ? 1 : 0), i.jump, i.special, 2050);
    if (this.player.justJumped) {
      this.game.audio.play('jump');
      this.spawnBurst(this.player.x, this.player.y - 14, '#d7eeff', 6, 130, 'ring');
      this.postEvent('Jump challenge');
    }
    if (this.player.specialTimer > 0.52) {
      this.game.audio.play('characterSpecial');
      this.shake = 12;
      this.spawnBurst(this.player.x + 20, this.player.y - 62, this.player.character.fxColor, 20, 260, 'spark');
      this.postEvent('Special unleashed!', 1.25);
    }

    this.ai.think(this.ball, dt, this.difficulty, { min: 380, max: 690 });

    this.player.x = Math.max(30, Math.min(330, this.player.x));
    this.ai.x = Math.max(390, Math.min(690, this.ai.x));

    this.ball.update(dt, 2050);
    this.handleCollisions();
    this.updateParticles(dt);

    if (this.ball.y + this.ball.radius > this.floorY + 2) {
      this.spawnBurst(this.ball.x, this.floorY - 8, '#b6d6ff', 13, 160, 'dust');
      this.shake = 8;
      const playerLost = this.ball.x < 360;
      this.postEvent(playerLost ? 'Point lost' : 'Point scored', 0.9);
      this.scorePoint(!playerLost);
    }

    if (this.ball.x < 10 || this.ball.x > this.game.width - 10) {
      this.ball.vx *= -0.88;
      this.ball.x = Math.max(10, Math.min(this.game.width - 10, this.ball.x));
      this.spawnBurst(this.ball.x, this.ball.y, '#cce6ff', 6, 88, 'spark');
      this.postEvent('Wall ricochet', 0.5);
    }

    if (this.eventTimer > 0) this.eventTimer -= dt;
    else if (this.rally >= 5) this.eventText = 'Hot rally!';
    else this.eventText = this.player.specialReady ? 'Special ready' : 'Keep pressure high';

    this.shake *= 0.84;
    this.celebrate = Math.max(0, this.celebrate - dt);
    this.serveFlash = Math.max(0, this.serveFlash - dt);
    this.game.ui.renderMatchHUD(this.hudState());
  }

  updateParticles(dt) {
    this.particles = this.particles.filter((p) => p.life > 0);
    this.particles.forEach((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.vx *= 0.98;
    });

    this.ambient.forEach((p) => {
      p.y -= p.speed * dt;
      p.x += Math.sin(p.y * 0.01 + performance.now() * 0.0013) * p.drift * dt;
      if (p.y < 610) {
        p.y = 980;
        p.x = 14 + Math.random() * (this.game.width - 28);
      }
    });
  }

  spawnBurst(x, y, color, count = 8, speed = 120, style = 'spark') {
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const power = speed * (0.5 + Math.random() * 0.9);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * power,
        vy: Math.sin(a) * power - (style === 'dust' ? 40 : 10),
        color,
        life: 0.22 + Math.random() * 0.2,
        gravity: style === 'ring' ? 120 : style === 'dust' ? 540 : 360,
        style,
        size: style === 'spark' ? 2 + Math.random() * 2.4 : style === 'dust' ? 5 + Math.random() * 3 : 6,
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
        const strong = pwr > 1.02 || Math.abs(dx) > 26;
        this.ball.vx = side * (300 + Math.abs(dx) * 4.5 + pwr * 130 + aimBonus);
        this.ball.vy = -980 - pwr * 145;

        if (actor.specialTimer > 0) {
          this.stats.specials += 1;
          this.ball.vx *= 1.35;
          this.ball.vy *= 1.07;
          this.ball.ignite = actor.character.id === 'flare' ? 1.2 : 0.4;
          if (actor.character.id === 'granite') this.ball.vx *= -1;
          this.shake = 14;
          this.spawnBurst(this.ball.x, this.ball.y, actor.character.fxColor, 22, 260, 'spark');
          this.postEvent('Special impact!', 1);
          this.game.audio.play('spikeHit');
        } else {
          this.spawnBurst(this.ball.x, this.ball.y, strong ? '#ffd3a2' : '#d8f0ff', strong ? 10 : 6, strong ? 160 : 105, 'spark');
          this.postEvent(strong ? 'Power spike!' : 'Clean touch', 0.55);
          this.game.audio.play(strong ? 'spikeHit' : 'serve');
        }

        actor.triggerHitPose();
        actor.gainEnergy(strong ? 12 : 10);
        actor.touches += 1;
        this.stats.spikes += 1;
        this.rally += 1;
        this.hitStop = this.rally > 6 ? 0.02 : 0.012;
      }
    };

    hit(this.player, 1);
    hit(this.ai, -1);

    const topY = this.net.floorY - this.net.height;
    if (Math.abs(this.ball.x - this.net.x) < this.net.width / 2 + this.ball.radius && this.ball.y > topY - 10) {
      this.ball.vx *= -0.83;
      this.ball.x += Math.sign(this.ball.vx) * 6;
      this.spawnBurst(this.net.x, this.ball.y, '#d8efff', 8, 108, 'spark');
      this.player.triggerBlockPose();
      this.ai.triggerBlockPose();
      this.shake = 6;
      this.postEvent('Net block!', 0.7);
      this.game.audio.play('block');
    }
  }

  scorePoint(playerScored) {
    if (playerScored) this.playerScore += 1;
    else this.aiScore += 1;
    this.rally = 0;
    this.celebrate = 0.55;
    this.game.audio.play('score');

    const clutch = Math.max(this.playerScore, this.aiScore) === 4;
    if (clutch) {
      this.postEvent('Match point pressure!', 1.2);
      this.shake = 10;
    }

    if (this.playerScore >= 5 || this.aiScore >= 5) {
      const won = this.playerScore > this.aiScore;
      const beforeTrophies = this.game.save.profile.trophies;
      let trophyDelta = 0;
      const earnedCoins = won ? 60 : 30;

      if (this.modeRanked) trophyDelta = this.game.progression.onMatchResult({ won, spikes: this.stats.spikes, specials: this.stats.specials });
      else this.game.save.currencies.coins += earnedCoins;

      const afterTrophies = this.game.save.profile.trophies;
      const roadProgress = this.game.progression.evaluateRoadProgress(beforeTrophies, afterTrophies) || {
        crossedMilestones: [],
        nextMilestone: { trophies: afterTrophies },
        previousMilestone: { trophies: afterTrophies },
        progress: 0,
      };

      const matchBonus = won ? { type: 'pack', amount: 1, label: 'Victory Capsule' } : { type: 'coins', amount: 30, label: 'Match Coins' };
      if (won) this.game.save.currencies.packs += 1;
      this.game.save.lastReward = won ? 'Win bonus: +1 capsule' : 'Match bonus: +30 coins';
      this.roundOver = true;
      this.player.setResultPose(won);
      this.ai.setResultPose(!won);
      this.game.audio.play(won ? 'victory' : 'defeat');

      setTimeout(() => {
        this.game.showMatchResults({
          won,
          ranked: this.modeRanked,
          playerScore: this.playerScore,
          aiScore: this.aiScore,
          spikes: this.stats.spikes,
          specials: this.stats.specials,
          trophyDelta,
          beforeTrophies,
          afterTrophies,
          roadProgress,
          earnedCoins,
          matchBonus,
          matchup: this.matchup,
        });
      }, 420);
      return;
    }

    this.ball = new Ball(playerScored ? 180 : 540, 820);
    this.ball.serve(playerScored);
    this.serveFlash = 0.35;
    this.postEvent('Serve restart', 0.65);
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

    const courtGradient = ctx.createLinearGradient(0, this.floorY - 10, 0, this.game.height);
    courtGradient.addColorStop(0, '#2f6297');
    courtGradient.addColorStop(1, '#1c3761');
    ctx.fillStyle = courtGradient;
    ctx.fillRect(0, this.floorY, this.game.width, this.game.height - this.floorY);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, this.floorY + 28, this.game.width, 16);
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

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 40, this.floorY + 2);
      ctx.lineTo(i * 40 + 24, this.floorY + 18);
      ctx.stroke();
    }

    this.ambient.forEach((p) => {
      ctx.fillStyle = `rgba(180, 228, 255, ${0.1 + p.size * 0.08})`;
      ctx.fillRect(p.x, p.y, p.size + 1, p.size + 1);
    });

    for (let i = 0; i < 9; i += 1) {
      const glow = 0.14 + Math.sin(performance.now() * 0.004 + i) * 0.06;
      ctx.fillStyle = `rgba(255, 228, 146, ${glow})`;
      ctx.fillRect(36 + i * 82, this.floorY - 204 + (i % 2) * 12, 34, 6);
    }

    ctx.fillStyle = 'rgba(6, 12, 34, 0.24)';
    ctx.fillRect(this.player.x - 30, this.floorY - 2, 60, 6);
    ctx.fillRect(this.ai.x - 30, this.floorY - 2, 60, 6);

    this.net.draw(ctx);
    this.player.draw(ctx);
    this.ai.draw(ctx);
    this.ball.draw(ctx);

    this.particles.forEach((p) => {
      const alpha = Math.max(0, p.life * (p.style === 'spark' ? 2.4 : 1.9));
      ctx.globalAlpha = alpha;
      if (p.style === 'dust') {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size, p.y - 2, p.size * 2, 3);
      } else if (p.style === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x - 3, p.y - 3, 6, 6);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, Math.max(1.5, p.size * 0.7));
      }
      ctx.globalAlpha = 1;
    });

    if (this.shake > 0.3) ctx.restore();

    if (this.celebrate > 0) {
      ctx.fillStyle = `rgba(255,238,173,${this.celebrate * 0.5})`;
      ctx.fillRect(0, 220, this.game.width, 14);
    }

    if (this.serveFlash > 0) {
      ctx.fillStyle = `rgba(150,215,255,${this.serveFlash * 0.28})`;
      ctx.fillRect(0, 0, this.game.width, this.game.height);
    }

    const matchVignette = ctx.createLinearGradient(0, 0, 0, this.game.height);
    matchVignette.addColorStop(0, 'rgba(2, 6, 18, 0.26)');
    matchVignette.addColorStop(0.25, 'rgba(2, 6, 18, 0)');
    matchVignette.addColorStop(0.8, 'rgba(2, 6, 18, 0)');
    matchVignette.addColorStop(1, 'rgba(2, 6, 18, 0.3)');
    ctx.fillStyle = matchVignette;
    ctx.fillRect(0, 0, this.game.width, this.game.height);

    ctx.fillStyle = '#ffe2a3';
    ctx.font = '14px "Press Start 2P"';
    const tension = this.rally > 6 ? 'Hot Rally!' : this.player.specialReady ? 'Special Ready!' : ' ';
    ctx.fillText(tension, 24, 100);
  }
}
