export const MAPS = [
  { id: 'scrapyard', name: 'Desert Scrapyard', theme: '#c98f58', size: { w: 2400, h: 1400 }, walls: [
    { x: 720, y: 520, w: 140, h: 360 }, { x: 1540, y: 540, w: 160, h: 320 }, { x: 1100, y: 300, w: 220, h: 100 },
    { x: 1080, y: 980, w: 260, h: 110 }, { x: 340, y: 250, w: 200, h: 90 }, { x: 1880, y: 980, w: 220, h: 120 },
  ], brush: [{ x: 930, y: 620, w: 120, h: 180 }, { x: 1290, y: 620, w: 130, h: 180 }, { x: 420, y: 690, w: 170, h: 140 }],
    spawns: { A: [{ x: 260, y: 300 }, { x: 350, y: 700 }, { x: 250, y: 1100 }], B: [{ x: 2140, y: 260 }, { x: 2100, y: 720 }, { x: 2120, y: 1100 }] }, center: { x: 1200, y: 700 } },
  { id: 'neonblock', name: 'Neon City Block', theme: '#4ca6ff', size: { w: 2400, h: 1400 }, walls: [
    { x: 900, y: 460, w: 120, h: 500 }, { x: 1380, y: 440, w: 120, h: 520 }, { x: 1090, y: 180, w: 220, h: 120 },
    { x: 1080, y: 1110, w: 240, h: 100 }, { x: 520, y: 580, w: 190, h: 140 }, { x: 1710, y: 610, w: 190, h: 140 },
  ], brush: [{ x: 1040, y: 580, w: 90, h: 240 }, { x: 1270, y: 580, w: 90, h: 240 }, { x: 590, y: 920, w: 170, h: 120 }],
    spawns: { A: [{ x: 220, y: 300 }, { x: 310, y: 700 }, { x: 220, y: 1080 }], B: [{ x: 2170, y: 300 }, { x: 2080, y: 700 }, { x: 2170, y: 1080 }] }, center: { x: 1200, y: 700 } },
  { id: 'ruins', name: 'Overgrown Ruins', theme: '#63b16f', size: { w: 2400, h: 1400 }, walls: [], brush: [], spawns: { A: [{ x: 250, y: 700 }], B: [{ x: 2150, y: 700 }] }, center: { x: 1200, y: 700 } },
  { id: 'refinery', name: 'Lava Refinery', theme: '#e78052', size: { w: 2400, h: 1400 }, walls: [], brush: [], spawns: { A: [{ x: 250, y: 700 }], B: [{ x: 2150, y: 700 }] }, center: { x: 1200, y: 700 } },
  { id: 'outpost', name: 'Frozen Outpost', theme: '#7ac0d8', size: { w: 2400, h: 1400 }, walls: [], brush: [], spawns: { A: [{ x: 250, y: 700 }], B: [{ x: 2150, y: 700 }] }, center: { x: 1200, y: 700 } },
];

export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m]));
