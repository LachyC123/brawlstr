export const BALL_SKINS = [
  { id: 'sunburst', name: 'Sunburst', shell: ['#ffffff', '#fff3cd', '#e6c37b'], seam: '#9e6133', trail: '#a8e4ff', igniteTrail: '#ff9960' },
  { id: 'comet', name: 'Comet', shell: ['#f2fbff', '#b9ebff', '#5ebeff'], seam: '#2f5d8b', trail: '#8fe7ff', igniteTrail: '#8fd1ff' },
  { id: 'ember', name: 'Ember', shell: ['#fff0df', '#ffbe83', '#de6b46'], seam: '#7a3220', trail: '#ffc39a', igniteTrail: '#ff8b64' },
];

export const CHARACTER_COSMETICS = {
  flare: {
    palettes: [
      { id: 'classic', name: 'Solar Core', primary: '#cf4b2e', accent: '#ffcf6a', cardGradient: ['#4a2418', '#9a4d2f'] },
      { id: 'volcanic', name: 'Volcanic Rush', primary: '#b8392a', accent: '#ffc28f', cardGradient: ['#361a16', '#7c3127'] },
      { id: 'neon', name: 'Neon Sunset', primary: '#7d47cc', accent: '#ff95bf', cardGradient: ['#2f1d53', '#773f8e'] },
    ],
    outfits: [
      { id: 'ace', name: 'Ace Uniform', torso: '#cf4b2e', shoulder: '#ffb26e', legs: '#5e2f5d', shoes: '#fff09e' },
      { id: 'street', name: 'Street Spark', torso: '#e46a33', shoulder: '#ffc078', legs: '#44335f', shoes: '#ffe4a7' },
    ],
    accessories: [
      { id: 'comet', name: 'Comet Band', headgear: '#ffcf7f', band: '#ffcf6a', emblem: '✶' },
      { id: 'flareline', name: 'Flareline', headgear: '#ffd7a2', band: '#ff8b67', emblem: '☄' },
    ],
    ballSkins: ['sunburst', 'ember'],
  },
  mistral: {
    palettes: [
      { id: 'classic', name: 'Sky Drift', primary: '#2c6eb7', accent: '#d9ffff', cardGradient: ['#1f355f', '#376aa3'] },
      { id: 'arctic', name: 'Arctic Pulse', primary: '#3f7ad4', accent: '#b5fbff', cardGradient: ['#203d74', '#3e85ca'] },
      { id: 'storm', name: 'Stormline', primary: '#4c58b7', accent: '#96c8ff', cardGradient: ['#21295d', '#4a62a9'] },
    ],
    outfits: [
      { id: 'runner', name: 'Runner Rig', torso: '#2c6eb7', shoulder: '#7acdf3', legs: '#2e4f95', shoes: '#92f5ff' },
      { id: 'stratus', name: 'Stratus Kit', torso: '#3979ca', shoulder: '#95dfff', legs: '#30437c', shoes: '#bbf3ff' },
    ],
    accessories: [
      { id: 'zip', name: 'Zip Visor', headgear: '#7be6ff', band: '#d9ffff', emblem: '➤' },
      { id: 'cyclone', name: 'Cyclone Band', headgear: '#b6dbff', band: '#8ef2ff', emblem: '↯' },
    ],
    ballSkins: ['comet', 'sunburst'],
  },
  granite: {
    palettes: [
      { id: 'classic', name: 'Aegis Grey', primary: '#6c7f98', accent: '#9cb4cb', cardGradient: ['#2e3949', '#5d6f85'] },
      { id: 'iron', name: 'Iron Guard', primary: '#5e738f', accent: '#c7d8ea', cardGradient: ['#29313f', '#586579'] },
      { id: 'obsidian', name: 'Obsidian', primary: '#4c5a6c', accent: '#9ca9b8', cardGradient: ['#1f2730', '#495566'] },
    ],
    outfits: [
      { id: 'wall', name: 'Wallplate', torso: '#6c7f98', shoulder: '#c8d7e9', legs: '#475467', shoes: '#d8e7f8' },
      { id: 'bulwark', name: 'Bulwark', torso: '#5f748e', shoulder: '#d4dfeb', legs: '#3d4b5d', shoes: '#e7f1ff' },
    ],
    accessories: [
      { id: 'block', name: 'Block Mark', headgear: '#f8fbff', band: '#9cb4cb', emblem: '◼' },
      { id: 'fort', name: 'Fort Crest', headgear: '#dfeaf7', band: '#b4c8de', emblem: '⛨' },
    ],
    ballSkins: ['sunburst', 'comet'],
  },
  volt: {
    palettes: [
      { id: 'classic', name: 'Amp Gold', primary: '#d5b937', accent: '#ffd858', cardGradient: ['#493a19', '#907520'] },
      { id: 'arc', name: 'Arc Charge', primary: '#d2a42b', accent: '#fff49c', cardGradient: ['#4c3616', '#9a7d24'] },
      { id: 'night', name: 'Night Pulse', primary: '#7159c8', accent: '#d4bcff', cardGradient: ['#302552', '#5d48a6'] },
    ],
    outfits: [
      { id: 'kick', name: 'Kick Gear', torso: '#d5b937', shoulder: '#fff6b2', legs: '#616236', shoes: '#fdf58d' },
      { id: 'arcade', name: 'Arcade Flash', torso: '#c89428', shoulder: '#ffe8a6', legs: '#50584a', shoes: '#fff6b7' },
    ],
    accessories: [
      { id: 'spark', name: 'Spark Wrap', headgear: '#ffe7af', band: '#ffd858', emblem: '⚡' },
      { id: 'hyper', name: 'Hyper Stripe', headgear: '#fff1c7', band: '#f8bf3f', emblem: '✹' },
    ],
    ballSkins: ['ember', 'sunburst'],
  },
  echo: {
    palettes: [
      { id: 'classic', name: 'Phantom Violet', primary: '#8954cb', accent: '#f0c4ff', cardGradient: ['#38235c', '#7347a0'] },
      { id: 'lilac', name: 'Lilac Veil', primary: '#9660d8', accent: '#f5ceff', cardGradient: ['#412862', '#8655b6'] },
      { id: 'aurora', name: 'Aurora Fade', primary: '#4e73c5', accent: '#cda9ff', cardGradient: ['#2d3d73', '#6c56a6'] },
    ],
    outfits: [
      { id: 'trick', name: 'Trick Cloak', torso: '#8954cb', shoulder: '#cf9ef2', legs: '#5f3f81', shoes: '#d7b4fb' },
      { id: 'illusion', name: 'Illusion Cape', torso: '#7f4ab8', shoulder: '#ddb2ff', legs: '#553875', shoes: '#e2ccff' },
    ],
    accessories: [
      { id: 'glyph', name: 'Glyph Band', headgear: '#f0ccff', band: '#f0c4ff', emblem: '✦' },
      { id: 'oracle', name: 'Oracle Sigil', headgear: '#e4d6ff', band: '#b998ff', emblem: '✧' },
    ],
    ballSkins: ['comet', 'ember'],
  },
  reef: {
    palettes: [
      { id: 'classic', name: 'Tide Guard', primary: '#3fa083', accent: '#5ef7bb', cardGradient: ['#1e4743', '#2f8a72'] },
      { id: 'lagoon', name: 'Lagoon Drift', primary: '#3a9c97', accent: '#8cf8d4', cardGradient: ['#1f3f4d', '#328b84'] },
      { id: 'mint', name: 'Mint Rescue', primary: '#4cab7c', accent: '#aaf7d8', cardGradient: ['#224742', '#3e8f69'] },
    ],
    outfits: [
      { id: 'saver', name: 'Saver Suit', torso: '#3fa083', shoulder: '#95ebd2', legs: '#2f5f58', shoes: '#8cf8d4' },
      { id: 'harbor', name: 'Harbor Kit', torso: '#4aa594', shoulder: '#b0efe0', legs: '#325a56', shoes: '#a4ffe0' },
    ],
    accessories: [
      { id: 'core', name: 'Core Crest', headgear: '#acffe4', band: '#5ef7bb', emblem: '◉' },
      { id: 'wave', name: 'Wave Mark', headgear: '#d4ffe8', band: '#69f7d3', emblem: '◌' },
    ],
    ballSkins: ['comet', 'sunburst'],
  },
};
