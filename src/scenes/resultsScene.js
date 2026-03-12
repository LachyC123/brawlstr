export class ResultsScene {
  constructor(game) { this.game = game; this.data = null; }
  setData(data) { this.data = data; }
  update() {
    if (!this.game.justClicked) return;
    const { x, y } = this.game.input.mouse;
    if (x > 470 && x < 810 && y > 470 && y < 530) this.game.startMatch();
    if (x > 470 && x < 810 && y > 550 && y < 610) this.game.scene = this.game.scenes.menu;
  }
  render(ctx) {
    const d = this.data || { win: false, rewards: { xpGain: 0, creditGain: 0 } };
    ctx.fillStyle = '#090f1d'; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = d.win ? '#6dffbf' : '#ff8f9d'; ctx.font = '70px Inter'; ctx.textAlign = 'center';
    ctx.fillText(d.win ? 'VICTORY' : 'DEFEAT', 640, 190);
    ctx.fillStyle = '#fff'; ctx.font = '30px Inter';
    ctx.fillText(`XP +${d.rewards.xpGain}   Credits +${d.rewards.creditGain}`, 640, 270);
    ctx.fillText(`Level ${this.game.save.accountLevel} | Credits ${this.game.save.credits}`, 640, 320);
    ctx.fillStyle = '#1b2a42'; ctx.fillRect(470, 470, 340, 60); ctx.fillRect(470, 550, 340, 60);
    ctx.fillStyle = '#fff'; ctx.font = '28px Inter';
    ctx.fillText('Rematch', 640, 510); ctx.fillText('Main Menu', 640, 590);
  }
}
