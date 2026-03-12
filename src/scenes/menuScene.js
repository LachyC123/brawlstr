import { GAME_TITLE } from '../config.js';
import { drawButton } from '../render/ui.js';

export class MenuScene {
  constructor(game) { this.game = game; this.buttons = []; }
  update() {
    const { mouse } = this.game.input;
    this.buttons = [
      { id: 'quick', x: 520, y: 260, w: 240, h: 58, label: 'Quick Play' },
      { id: 'heroes', x: 520, y: 336, w: 240, h: 58, label: 'Hero Roster' },
      { id: 'progress', x: 520, y: 412, w: 240, h: 58, label: 'Progression' },
    ];
    if (this.game.justClicked) {
      const b = this.buttons.find((it) => mouse.x > it.x && mouse.x < it.x + it.w && mouse.y > it.y && mouse.y < it.y + it.h);
      if (!b) return;
      if (b.id === 'quick') this.game.startMatch();
      if (b.id === 'heroes') this.game.scene = this.game.scenes.heroSelect;
      if (b.id === 'progress') this.game.scene = this.game.scenes.progression;
    }
  }
  render(ctx) {
    ctx.fillStyle = '#0a1020'; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#57dbff'; ctx.font = '68px Inter'; ctx.textAlign = 'center';
    ctx.fillText(GAME_TITLE, 640, 170);
    ctx.font = '24px Inter'; ctx.fillStyle = '#c6d9ff';
    ctx.fillText('Original arcade hero arena shooter', 640, 210);
    for (const b of this.buttons) drawButton(ctx, b.x, b.y, b.w, b.h, b.label);
    ctx.fillStyle = '#9fb3de'; ctx.font = '18px Inter';
    ctx.fillText(`Level ${this.game.save.accountLevel}  Credits ${this.game.save.credits}`, 640, 520);
  }
}
