export class MenuScene {
  constructor(game) { this.game = game; }
  enter() {
    const data = this.game.getMenuData();
    this.game.ui.renderMenu(data);
  }
  update() {}
  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.2);
    this.game.drawHeroShowcase(ctx);
  }
}
