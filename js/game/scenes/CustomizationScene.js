export class CustomizationScene {
  constructor(game) {
    this.game = game;
  }

  enter(characterId) {
    this.characterId = characterId || this.game.save.profile.selectedCharacter;
    this.game.ui.renderCustomization(this.characterId);
  }

  update() {}

  render(ctx) {
    this.game.drawArenaBackdrop(ctx, 0.12);
  }
}
