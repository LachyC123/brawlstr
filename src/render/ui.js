import { CONFIG } from '../config.js';

export function drawButton(ctx, x, y, w, h, text, active = false) {
  ctx.fillStyle = active ? '#2c4d6a' : '#182236';
  ctx.strokeStyle = '#355479';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#dce7ff';
  ctx.font = '20px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w / 2, y + h / 2 + 7);
}

export function drawHud(ctx, game) {
  const p = game.player;
  ctx.fillStyle = '#0d1527bb'; ctx.fillRect(20, 620, 500, 84);
  ctx.fillStyle = '#ff5e74'; ctx.fillRect(34, 642, 300 * (p.hp / p.maxHp), 15);
  ctx.strokeStyle = '#fff3'; ctx.strokeRect(34, 642, 300, 15);
  ctx.fillStyle = '#6ef0ff'; ctx.fillRect(34, 668, 300 * (p.superCharge / p.hero.super.charge), 10);
  ctx.fillStyle = '#fff'; ctx.font = '16px Inter';
  ctx.fillText(`${p.name}  HP ${Math.max(0, Math.round(p.hp))}/${p.maxHp}`, 34, 638);
  ctx.fillText(`Ammo: ${p.ammo}/${p.hero.ammoMax}  Gadget: ${p.gadgetCd <= 0 ? 'Ready' : p.gadgetCd.toFixed(1)}  Super: ${p.superReady ? 'READY' : Math.floor((p.superCharge / p.hero.super.charge)*100)+'%'}`, 34, 700);

  const m = game.modeState;
  ctx.fillStyle = '#0d1527cc'; ctx.fillRect(480, 20, 320, 72);
  ctx.textAlign = 'center';
  ctx.fillText(`${game.mode.name} - ${Math.ceil(m.timer)}s`, 640, 44);
  ctx.fillText(`Team A ${m.scoreA.toFixed(0)} : ${m.scoreB.toFixed(0)} Team B`, 640, 70);
  if (game.input.showScore) {
    ctx.fillStyle = '#030711d9'; ctx.fillRect(360, 120, 560, 420);
    ctx.fillStyle = '#fff'; ctx.fillText('SCOREBOARD', 640, 160);
    let y = 205;
    for (const a of game.actors) { ctx.fillText(`${a.team===0?'A':'B'}  ${a.name}  K:${a.kills||0} D:${a.deaths||0} Obj:${a.score||0}`, 640, y); y += 30; }
  }

  if (game.pause) { ctx.fillStyle = '#0008'; ctx.fillRect(0, 0, 1280, 720); ctx.fillStyle = '#fff'; ctx.font = '48px Inter'; ctx.fillText('PAUSED', 640, 360); }
  const rarity = CONFIG.rarityColors[p.hero.rarity] || '#fff';
  ctx.strokeStyle = rarity; ctx.lineWidth = 3; ctx.strokeRect(22, 622, 496, 80);
}
