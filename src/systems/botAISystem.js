import { dist, norm, rand } from '../utils.js';

export function updateBotAI(bot, state, dt) {
  const enemies = state.actors.filter((a) => a.team !== bot.team && !a.dead);
  const target = enemies.sort((a, b) => dist(bot, a) - dist(bot, b))[0];
  if (!target) return;
  const d = dist(bot, target);
  const dir = norm(target.x - bot.x, target.y - bot.y);
  bot.strafeTimer -= dt;
  if (bot.strafeTimer <= 0) {
    bot.strafeTimer = rand(0.4, 1.2);
    bot.ai.strafeX = rand(-1, 1);
    bot.ai.strafeY = rand(-1, 1);
  }
  const low = bot.hp / bot.maxHp < 0.35;
  const retreat = low ? -1 : 1;
  const prefer = bot.difficulty === 'hard' ? 1.2 : bot.difficulty === 'easy' ? 0.7 : 1;
  bot.ai.tx = bot.x + (dir.x * retreat + bot.ai.strafeX * 0.7) * 120;
  bot.ai.ty = bot.y + (dir.y * retreat + bot.ai.strafeY * 0.7) * 120;
  bot.ai.fire = d < bot.hero.attack.range * (0.95 + 0.1 * prefer);
  bot.ai.useGadget = low && Math.random() < 0.015 * prefer;
  bot.ai.useSuper = bot.superReady && (d < 280 || Math.random() < 0.005 * prefer);
  bot.ai.aim = { x: target.x, y: target.y };
}
