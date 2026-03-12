export const GAME_TITLE = 'Neon Scrappers';

export const CONFIG = {
  world: { width: 2400, height: 1400, tileSize: 80 },
  player: { baseSpeed: 220, respawnTime: 3 },
  combat: { superGainFromDamage: 0.18, invulnAfterRespawn: 1.4 },
  modes: { shardRush: { winScore: 10, countdownSeconds: 18 }, skirmish: { targetScore: 15 }, zoneHold: { holdToWin: 100 } },
  rarityColors: {
    common: '#aab4d2', rare: '#69d8ff', epic: '#be73ff', mythic: '#ff7b9f', legendary: '#ffd369'
  },
};

export const DEFAULT_SETTINGS = {
  masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.8,
  screenShake: true, damageNumbers: true, defaultDifficulty: 'normal',
};
