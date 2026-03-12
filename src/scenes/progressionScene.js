export class ProgressionScene {
  constructor(game) { this.game = game; }
  update() { if (this.game.justClicked && this.game.input.mouse.x < 170 && this.game.input.mouse.y < 90) this.game.scene = this.game.scenes.menu; }
  render(ctx) {
    const s = this.game.save.stats;
    ctx.fillStyle = '#0a1020'; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#fff'; ctx.font = '42px Inter'; ctx.fillText('Progression', 45, 80);
    ctx.font = '24px Inter';
    ctx.fillText(`Account Level: ${this.game.save.accountLevel}`, 70, 150);
    ctx.fillText(`XP: ${this.game.save.xp}`, 70, 190);
    ctx.fillText(`Credits: ${this.game.save.credits}`, 70, 230);
    ctx.fillText(`Wins / Losses: ${s.wins} / ${s.losses}`, 70, 290);
    ctx.fillText(`Best Streak: ${s.bestStreak}`, 70, 330);
    ctx.fillText('Mode Plays:', 70, 390);
    let y = 430;
    for (const [k, v] of Object.entries(s.modes)) { ctx.fillText(`${k}: ${v}`, 100, y); y += 34; }
    ctx.fillStyle = '#1a2640'; ctx.fillRect(35, 35, 130, 50); ctx.fillStyle = '#fff'; ctx.fillText('Back', 75, 68);
  }
}
