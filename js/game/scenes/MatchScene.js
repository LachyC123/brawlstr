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
  }

  enter(modeRanked = true) {
    this.modeRanked = modeRanked;
    this.playerScore = 0;
    this.aiScore = 0;
    this.rally = 0;
    this.stats = { spikes: 0, specials: 0 };
    const selected = this.game.characterSystem.get(this.game.save.profile.selectedCharacter);
    const aiPool = this.game.characterSystem.list().filter((c) => c.unlocked);
    const aiChar = aiPool[(Math.random() * aiPool.length) | 0];
    this.player = new Player(170, this.floorY, selected);
    this.ai = new Opponent(540, this.floorY, aiChar, true);
    this.ball = new Ball(180, 820);
    this.net = new Net(360, this.floorY + 5);
    this.serverPlayer = true;
    this.serveTimer = 0.8;
    this.roundOver = false;
    this.difficulty = Math.min(0.92, 0.45 + this.game.save.profile.trophies / 900);
    this.ball.serve(true);
    this.game.ui.renderMatchHUD(this.hudState());
    this.game.ui.toast(this.modeRanked ? 'Trophy Match!' : 'Quick Match');
  }

  hudState() {
    return { playerScore: this.playerScore, aiScore: this.aiScore, rally: this.rally };
  }

  update(dt) {
    if (this.roundOver) return;
    if (this.hitStop > 0) { this.hitStop -= dt; return; }

    const i = this.game.input.state;
    this.player.update(dt, (i.right ? 1 : 0) - (i.left ? 1 : 0), i.jump, i.special, 2100);
    this.ai.think(this.ball, dt, this.difficulty, { min: 380, max: 690 });

    this.player.x = Math.max(30, Math.min(330, this.player.x));
    this.ai.x = Math.max(390, Math.min(690, this.ai.x));

    this.ball.update(dt, 2100);
    this.handleCollisions();

    if (this.ball.y + this.ball.radius > this.floorY + 2) {
      const playerLost = this.ball.x < 360;
      this.scorePoint(!playerLost);
    }

    if (this.ball.x < 10 || this.ball.x > this.game.width - 10) {
      this.ball.vx *= -0.9;
      this.ball.x = Math.max(10, Math.min(this.game.width - 10, this.ball.x));
    }

    this.game.ui.renderMatchHUD(this.hudState());
  }

  handleCollisions() {
    const hit = (actor, side) => {
      const dx = this.ball.x - actor.x;
      const dy = this.ball.y - (actor.y - 45);
      if (Math.abs(dx) < 48 && Math.abs(dy) < 46 && this.ball.vy > -800) {
        const pwr = actor.character.stats.power * this.game.characterSystem.statMultiplier(actor.character.id);
        this.ball.vx = side * (280 + Math.abs(dx) * 5 + pwr * 120);
        this.ball.vy = -920 - pwr * 140;
        if (actor.specialTimer > 0) {
          this.stats.specials++;
          this.ball.vx *= 1.28;
          this.ball.vy *= 1.05;
          this.ball.ignite = actor.character.id === 'flare' ? 1.1 : 0;
          if (actor.character.id === 'granite') this.ball.vx *= -1;
          this.shake = 12;
          this.game.audio.play('spike');
        } else {
          this.game.audio.play('serve');
        }
        actor.gainEnergy(10);
        actor.touches++;
        this.stats.spikes++;
        this.rally++;
        this.hitStop = 0.015;
      }
    };

    hit(this.player, 1);
    hit(this.ai, -1);

    const topY = this.net.floorY - this.net.height;
    if (Math.abs(this.ball.x - this.net.x) < this.net.width / 2 + this.ball.radius && this.ball.y > topY - 10) {
      this.ball.vx *= -0.8;
      this.ball.x += Math.sign(this.ball.vx) * 6;
      this.game.audio.play('block');
    }
  }

  scorePoint(playerScored) {
    if (playerScored) this.playerScore++; else this.aiScore++;
    this.rally = 0;
    this.game.audio.play('score');

    if (this.playerScore >= 5 || this.aiScore >= 5) {
      const won = this.playerScore > this.aiScore;
      if (this.modeRanked) this.game.progression.onMatchResult({ won, spikes: this.stats.spikes, specials: this.stats.specials });
      this.game.save.currencies.packs += won ? 1 : 0;
      this.game.save.lastReward = won ? 'Victory bonus: +1 capsule' : 'Defeat bonus: +30 coins';
      this.roundOver = true;
      this.game.ui.toast(won ? 'VICTORY!' : 'DEFEAT');
      setTimeout(() => this.game.changeScene('menu'), 1300);
      return;
    }

    this.ball = new Ball(playerScored ? 180 : 540, 820);
    this.ball.serve(playerScored);
    this.player.reset(170);
    this.ai.reset(540);
  }

  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 1);
    if (this.shake > 0) {
      this.shake *= 0.8;
      ctx.save();
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }

    ctx.fillStyle = '#3f8bca';
    ctx.fillRect(0, this.floorY, this.game.width, this.game.height - this.floorY);
    this.net.draw(ctx);
    this.player.draw(ctx);
    this.ai.draw(ctx);
    this.ball.draw(ctx);

    if (this.shake > 0) ctx.restore();

    ctx.fillStyle = '#ffc56f';
    ctx.font = '18px "Press Start 2P"';
    ctx.fillText(`Energy ${Math.floor(this.player.energy)}%`, 28, 70);
  }
}
