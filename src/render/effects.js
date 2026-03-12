export function updateEffects(effects, dt) {
  for (const e of effects) e.t -= dt;
  return effects.filter((e) => e.t > 0);
}

export function renderEffects(ctx, effects) {
  for (const e of effects) {
    if (e.type === 'muzzle') {
      ctx.globalAlpha = e.t * 7;
      ctx.fillStyle = e.color;
      ctx.beginPath(); ctx.arc(e.x, e.y, 18, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (e.type === 'super') {
      ctx.globalAlpha = e.t * 2;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(e.x, e.y, 60 * (1.6 - e.t), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
