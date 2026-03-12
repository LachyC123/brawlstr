export const MODES = [
  { id: 'shardRush', name: 'Shard Rush', desc: 'Grab center shards. Hold 10 to start victory countdown.' },
  { id: 'skirmish', name: 'Team Skirmish', desc: 'First team to 15 eliminations wins.' },
  { id: 'zoneHold', name: 'Zone Hold', desc: 'Stand in center zone to score control points.' },
  { id: 'payload', name: 'Payload Escort', desc: 'Scaffolded for phase 2.' },
  { id: 'soloSurvival', name: 'Solo Survival', desc: 'Scaffolded for phase 2.' },
];
export const MODE_BY_ID = Object.fromEntries(MODES.map((m) => [m.id, m]));
