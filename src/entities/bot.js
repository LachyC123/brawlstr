import { Player } from './player.js';
export class Bot extends Player {
  constructor(hero, x, y, difficulty) {
    super(hero, x, y, false);
    this.difficulty = difficulty;
    this.strafeTimer = 0;
    this.ai = { tx: x, ty: y, fire: false, useGadget: false, useSuper: false };
  }
}
