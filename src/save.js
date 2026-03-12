import { DEFAULT_SETTINGS } from './config.js';

const KEY = 'neon_scrappers_save_v1';

const baseSave = () => ({
  accountLevel: 1, xp: 0, credits: 200,
  unlockedHeroes: ['volt'], selectedHero: 'volt',
  heroStats: {}, settings: { ...DEFAULT_SETTINGS },
  stats: { wins: 0, losses: 0, streak: 0, bestStreak: 0, modes: {} },
});

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return baseSave();
    return { ...baseSave(), ...JSON.parse(raw) };
  } catch {
    return baseSave();
  }
}

export function persistSave(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function addRewards(save, { win, mode, heroId, trophiesDelta = 0 }) {
  const xpGain = win ? 35 : 18;
  const creditGain = win ? 40 : 22;
  save.xp += xpGain;
  save.credits += creditGain;
  save.stats[win ? 'wins' : 'losses'] += 1;
  save.stats.streak = win ? save.stats.streak + 1 : 0;
  save.stats.bestStreak = Math.max(save.stats.bestStreak, save.stats.streak);
  save.stats.modes[mode] = (save.stats.modes[mode] || 0) + 1;
  save.heroStats[heroId] = save.heroStats[heroId] || { trophies: 0, mastery: 0, plays: 0, wins: 0 };
  const hs = save.heroStats[heroId];
  hs.trophies = Math.max(0, hs.trophies + trophiesDelta);
  hs.mastery += xpGain;
  hs.plays += 1;
  if (win) hs.wins += 1;
  while (save.xp >= save.accountLevel * 100) {
    save.xp -= save.accountLevel * 100;
    save.accountLevel += 1;
  }
  persistSave(save);
  return { xpGain, creditGain };
}
