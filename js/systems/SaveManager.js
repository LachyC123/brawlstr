import { STARTING_UNLOCKS } from '../data/characters.js';

const KEY = 'skyspike_legends_save_v1';

export class SaveManager {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Save parse failed', e);
    }
    return this.defaultData();
  }

  save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  defaultData() {
    return {
      profile: { name: 'Sky Rookie', trophies: 0, selectedCharacter: STARTING_UNLOCKS[0], league: 'Rookie Sky' },
      currencies: { coins: 250, gems: 20, packs: 1 },
      unlocks: [...STARTING_UNLOCKS],
      upgrades: {},
      shards: {},
      claimedRoad: [],
      missions: [],
      tutorialDone: false,
      lastDailyRefresh: Date.now(),
      lastReward: null,
    };
  }
}
