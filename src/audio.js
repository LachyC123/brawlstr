export class AudioManager {
  constructor(save) {
    this.save = save;
  }
  playSfx() {}
  playMusic() {}
  stopMusic() {}
  click() { this.playSfx('click'); }
  hit() { this.playSfx('hit'); }
  shoot() { this.playSfx('shoot'); }
}
