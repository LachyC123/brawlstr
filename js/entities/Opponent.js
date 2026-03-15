import { Player } from './Player.js';

export class Opponent extends Player {
  think(ball, dt, difficulty, sideBounds) {
    const centerX = (sideBounds.min + sideBounds.max) * 0.5;
    let targetX = centerX;

    if (ball.vy > 0 && ball.x > sideBounds.min - 20) targetX = ball.x;
    else targetX = centerX + Math.sin(performance.now() * 0.0015) * 30;

    const error = (1 - difficulty) * 45;
    targetX += (Math.random() - 0.5) * error;

    const dx = targetX - this.x;
    const dir = Math.abs(dx) < 10 ? 0 : Math.sign(dx);

    const shouldJump = ball.y < this.y - 60 && Math.abs(ball.x - this.x) < 65 && Math.random() > (1 - difficulty) * 0.85;
    const useSpecial = this.specialReady && Math.abs(ball.x - this.x) < 70 && ball.y < this.y - 30 && Math.random() > 0.75;

    this.update(dt, dir, shouldJump, useSpecial, 2100);
  }
}
