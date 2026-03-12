import { aabbContains } from '../utils.js';

export function initModeState(mode, map) {
  const base = { mode, timer: 180, scoreA: 0, scoreB: 0, winner: null, shardCountdown: 0, shardOwner: null, zone: { x: map.center.x - 120, y: map.center.y - 120, w: 240, h: 240 } };
  return base;
}

export function updateModeState(state, actors, pickups, dt) {
  state.timer -= dt;
  if (state.mode === 'skirmish') return;
  if (state.mode === 'shardRush') {
    const teamShards = { 0: 0, 1: 0 };
    for (const a of actors) if (!a.dead) teamShards[a.team] += a.score || 0;
    if (teamShards[0] >= 10 || teamShards[1] >= 10) {
      const lead = teamShards[0] >= 10 ? 0 : 1;
      if (state.shardOwner !== lead) state.shardCountdown = 18;
      state.shardOwner = lead;
      state.shardCountdown -= dt;
      if (state.shardCountdown <= 0) state.winner = lead;
    } else state.shardOwner = null;
  }
  if (state.mode === 'zoneHold') {
    const counts = [0, 0];
    for (const a of actors) if (!a.dead && aabbContains(state.zone, a)) counts[a.team] += 1;
    if (counts[0] > counts[1]) state.scoreA += dt * 7;
    if (counts[1] > counts[0]) state.scoreB += dt * 7;
    if (state.scoreA >= 100) state.winner = 0;
    if (state.scoreB >= 100) state.winner = 1;
  }
  if (state.timer <= 0 && state.winner == null) {
    if (state.mode === 'zoneHold') state.winner = state.scoreA >= state.scoreB ? 0 : 1;
    else state.winner = state.scoreA >= state.scoreB ? 0 : 1;
  }
}
