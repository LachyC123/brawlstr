import { CHARACTERS } from '../data/characters.js';

export class CharacterSystem {
  constructor(saveData) {
    this.saveData = saveData;
  }

  list() {
    return CHARACTERS.map((c) => ({ ...c, unlocked: this.saveData.unlocks.includes(c.id), level: this.levelOf(c.id) }));
  }

  get(id) {
    return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
  }

  levelOf(id) {
    return this.saveData.upgrades[id]?.level || 1;
  }

  statMultiplier(id) {
    const level = this.levelOf(id);
    return 1 + (level - 1) * 0.06;
  }

  upgradeCost(id) {
    const lvl = this.levelOf(id);
    return 80 + lvl * 45;
  }

  upgrade(id) {
    const cost = this.upgradeCost(id);
    if ((this.saveData.currencies.coins || 0) < cost) return false;
    this.saveData.currencies.coins -= cost;
    this.saveData.upgrades[id] = { level: this.levelOf(id) + 1 };
    return true;
  }

  addShards(id, amount) {
    this.saveData.shards[id] = (this.saveData.shards[id] || 0) + amount;
    if (!this.saveData.unlocks.includes(id) && this.saveData.shards[id] >= 40) {
      this.saveData.unlocks.push(id);
      return true;
    }
    return false;
  }
}
