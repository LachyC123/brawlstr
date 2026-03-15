import { TROPHY_ROAD } from '../data/trophyRoad.js';

export class ProgressionSystem {
  constructor(saveData, characterSystem) {
    this.saveData = saveData;
    this.characterSystem = characterSystem;
  }

  ensureMissions(now = Date.now()) {
    const dayMs = 24 * 60 * 60 * 1000;
    if (!this.saveData.missions.length || now - this.saveData.lastDailyRefresh > dayMs) {
      this.saveData.lastDailyRefresh = now;
      this.saveData.missions = [
        { id: 'win3', text: 'Win 3 matches', goal: 3, progress: 0, reward: { coins: 120 } },
        { id: 'spike10', text: 'Land 10 spikes', goal: 10, progress: 0, reward: { coins: 80, gems: 4 } },
        { id: 'special5', text: 'Use specials 5 times', goal: 5, progress: 0, reward: { gems: 8 } },
      ];
    }
  }

  onMatchResult({ won, spikes, specials }) {
    this.saveData.profile.trophies = Math.max(0, this.saveData.profile.trophies + (won ? 9 : -5));
    this.saveData.currencies.coins += won ? 60 : 30;
    this.trackMission('win3', won ? 1 : 0);
    this.trackMission('spike10', spikes);
    this.trackMission('special5', specials);
  }

  trackMission(id, amount) {
    const m = this.saveData.missions.find((x) => x.id === id);
    if (!m) return;
    m.progress = Math.min(m.goal, m.progress + amount);
  }

  claimMission(id) {
    const m = this.saveData.missions.find((x) => x.id === id);
    if (!m || m.progress < m.goal || m.claimed) return false;
    this.saveData.currencies.coins += m.reward.coins || 0;
    this.saveData.currencies.gems += m.reward.gems || 0;
    m.claimed = true;
    return true;
  }

  roadState() {
    return TROPHY_ROAD.map((node, index) => {
      const claimed = this.saveData.claimedRoad.includes(index);
      const ready = this.saveData.profile.trophies >= node.trophies && !claimed;
      return { ...node, index, claimed, ready };
    });
  }

  claimRoad(index) {
    const node = TROPHY_ROAD[index];
    if (!node || this.saveData.claimedRoad.includes(index) || this.saveData.profile.trophies < node.trophies) return null;
    this.saveData.claimedRoad.push(index);

    if (node.type === 'coins') this.saveData.currencies.coins += node.amount;
    if (node.type === 'gems') this.saveData.currencies.gems += node.amount;
    if (node.type === 'pack') this.saveData.currencies.packs += node.amount;
    if (node.type === 'character' && !this.saveData.unlocks.includes(node.id)) this.saveData.unlocks.push(node.id);
    return node;
  }
}
