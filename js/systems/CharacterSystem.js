import { CHARACTERS } from '../data/characters.js';
import { CHARACTER_COSMETICS, BALL_SKINS } from '../data/cosmetics.js';

export class CharacterSystem {
  constructor(saveData) {
    this.saveData = saveData;
  }

  list() {
    return CHARACTERS.map((c) => this.decorateCharacter(c));
  }

  get(id) {
    const base = CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
    return this.decorateCharacter(base);
  }

  decorateCharacter(char) {
    const customized = this.applyCustomization(char);
    return { ...customized, unlocked: this.saveData.unlocks.includes(char.id), level: this.levelOf(char.id) };
  }

  getOptions(id) {
    return CHARACTER_COSMETICS[id] || { palettes: [], outfits: [], accessories: [], ballSkins: [] };
  }

  getCustomization(id) {
    const opts = this.getOptions(id);
    const saved = this.saveData.customizations?.[id] || {};
    return {
      palette: saved.palette || opts.palettes[0]?.id || 'base',
      outfit: saved.outfit || opts.outfits[0]?.id || 'base',
      accessory: saved.accessory || opts.accessories[0]?.id || 'base',
      ballSkin: saved.ballSkin || opts.ballSkins[0] || BALL_SKINS[0].id,
    };
  }

  setCustomization(id, partial) {
    this.saveData.customizations = this.saveData.customizations || {};
    const curr = this.getCustomization(id);
    this.saveData.customizations[id] = { ...curr, ...partial };
    return this.saveData.customizations[id];
  }

  resetCustomization(id) {
    this.saveData.customizations = this.saveData.customizations || {};
    delete this.saveData.customizations[id];
  }

  applyCustomization(character) {
    const options = this.getOptions(character.id);
    const selected = this.getCustomization(character.id);
    const palette = options.palettes.find((x) => x.id === selected.palette) || null;
    const outfit = options.outfits.find((x) => x.id === selected.outfit) || null;
    const accessory = options.accessories.find((x) => x.id === selected.accessory) || null;

    const visuals = { ...character.visuals };
    if (palette) {
      visuals.torso = palette.primary;
      visuals.band = palette.accent;
    }
    if (outfit) {
      visuals.torso = outfit.torso;
      visuals.shoulder = outfit.shoulder;
      visuals.legs = outfit.legs;
      visuals.shoes = outfit.shoes;
    }
    if (accessory) {
      visuals.headgear = accessory.headgear;
      visuals.band = accessory.band;
      visuals.emblem = accessory.emblem;
    }

    const ballSkin = BALL_SKINS.find((x) => x.id === selected.ballSkin) || BALL_SKINS[0];
    const cardGradient = palette?.cardGradient || character.cardGradient;

    return {
      ...character,
      visuals,
      cardGradient,
      color: palette?.primary || character.color,
      fxColor: palette?.accent || character.fxColor,
      customization: selected,
      customizationOptions: options,
      ballSkin,
    };
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
