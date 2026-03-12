import { HEROES, HERO_BY_ID } from '../data/heroes.js';
import { MAPS } from '../data/maps.js';
import { MODES } from '../data/modes.js';
import { Bot } from '../entities/bot.js';
import { Player } from '../entities/player.js';
import { Projectile } from '../entities/projectile.js';
import { Pickup } from '../entities/pickup.js';
import { Camera } from '../render/camera.js';
import { drawHud } from '../render/ui.js';
import { renderEffects, updateEffects } from '../render/effects.js';
import { fireAttack, applyGadget, applySuper } from '../systems/combatSystem.js';
import { updateSuper } from '../systems/abilitySystem.js';
import { updateBotAI } from '../systems/botAISystem.js';
import { resolveMapCollision, projectileHits } from '../systems/collisionSystem.js';
import { initModeState, updateModeState } from '../systems/gameModeSystem.js';
import { circleHit, norm } from '../utils.js';
import { finalizeMatch } from '../systems/progressionSystem.js';

export class BattleScene {
  constructor(game) { this.game = game; this.setup(); }
  setup() {
    this.map = MAPS[Math.floor(Math.random() * 2)];
    this.mode = MODES[Math.floor(Math.random() * 3)];
    this.camera = new Camera(1280, 720);
    this.projectiles = Array.from({ length: 220 }, () => new Projectile());
    this.effects = [];
    this.zones = [];
    this.beams = [];
    this.pickups = [];
    this.modeState = initModeState(this.mode.id, this.map);
    this.shardSpawn = 2;

    this.player = new Player(HERO_BY_ID[this.game.save.selectedHero], this.map.spawns.A[0].x, this.map.spawns.A[0].y, true);
    this.player.team = 0;
    this.actors = [this.player];
    for (let i = 0; i < 2; i++) {
      const ally = new Bot(HEROES[(i + 3) % HEROES.length], this.map.spawns.A[Math.min(i + 1, this.map.spawns.A.length - 1)].x, this.map.spawns.A[Math.min(i + 1, this.map.spawns.A.length - 1)].y, this.game.save.settings.defaultDifficulty);
      ally.team = 0; this.actors.push(ally);
      const enemy = new Bot(HEROES[(i + 5) % HEROES.length], this.map.spawns.B[i].x, this.map.spawns.B[i].y, this.game.save.settings.defaultDifficulty);
      enemy.team = 1; this.actors.push(enemy);
    }
    const boss = new Bot(HEROES[7], this.map.spawns.B[2].x, this.map.spawns.B[2].y, this.game.save.settings.defaultDifficulty);
    boss.team = 1; this.actors.push(boss);
  }

  update(dt) {
    const input = this.game.input;
    if (input.pressed('escape')) this.game.pause = true;
    if (this.game.pause && input.pressed('p')) this.game.pause = false;
    if (this.game.pause) return;

    const mouseWorld = { x: input.mouse.x + this.camera.x, y: input.mouse.y + this.camera.y };
    const move = input.axis();
    this.player.move(move, dt, this.map.size);
    resolveMapCollision(this.player, this.map);
    if (input.mouse.left) fireAttack(this.player, mouseWorld, this.projectiles, this.effects);
    const aimDir = norm(mouseWorld.x - this.player.x, mouseWorld.y - this.player.y);
    if (input.mouse.right) applyGadget(this.player, { aimDir, zones: this.zones, effects: this.effects });
    if (input.pressed(' ')) applySuper(this.player, mouseWorld, this);

    for (const a of this.actors) {
      a.update(dt);
      if (a.dead) continue;
      if (a !== this.player) {
        updateBotAI(a, this, dt);
        a.move({ x: a.ai.tx - a.x, y: a.ai.ty - a.y }, dt, this.map.size);
        resolveMapCollision(a, this.map);
        if (a.ai.fire) fireAttack(a, a.ai.aim, this.projectiles, this.effects);
        if (a.ai.useGadget) applyGadget(a, { aimDir: norm(a.ai.aim.x - a.x, a.ai.aim.y - a.y), zones: this.zones, effects: this.effects });
        if (a.ai.useSuper) applySuper(a, a.ai.aim, this);
      }
      updateSuper(a);
    }

    for (const p of this.projectiles) {
      p.update(dt);
      if (!p.active) continue;
      if (p.x < 0 || p.y < 0 || p.x > this.map.size.w || p.y > this.map.size.h) { p.active = false; continue; }
      const hit = projectileHits(p, this.actors);
      if (hit) {
        const shield = hit.effects.find((e) => e.type === 'shield');
        hit.hp -= shield ? p.damage * (1 - shield.power) : p.damage;
        if (p.dot) hit.effects.push({ type: 'dot', t: 3, tick: 0, power: p.dot });
        if (p.slow) hit.effects.push({ type: 'slow', t: p.slow, tick: 0, power: 0 });
        p.owner.superCharge += p.damage * 0.18;
        if (hit.hp <= 0) {
          hit.dead = true;
          p.owner.kills = (p.owner.kills || 0) + 1;
          hit.deaths = (hit.deaths || 0) + 1;
          if (this.mode.id === 'skirmish') p.owner.team === 0 ? this.modeState.scoreA++ : this.modeState.scoreB++;
          this.camera.shake = 0.9;
        }
        p.active = false;
      }
    }

    for (const z of this.zones) {
      z.t -= dt;
      for (const a of this.actors) if (!a.dead && circleHit({ ...z, radius: z.radius }, a) && a.team !== z.team) {
        if (z.burst && !z.done) { a.hp -= z.burst; }
        if (z.damage) a.hp -= z.damage * dt;
        if (z.slow) a.effects.push({ type: 'slow', t: 0.3, tick: 0, power: 0 });
      }
      z.done = true;
    }
    this.zones = this.zones.filter((z) => z.t > 0);

    for (const b of this.beams) {
      b.t -= dt;
      for (const a of this.actors) if (!a.dead && a.team !== b.team && Math.abs((b.y2 - b.y1) * a.x - (b.x2 - b.x1) * a.y + b.x2 * b.y1 - b.y2 * b.x1) / Math.hypot(b.y2 - b.y1, b.x2 - b.x1) < a.radius + 8) a.hp -= b.damage * dt * 4;
    }
    this.beams = this.beams.filter((b) => b.t > 0);

    if (this.mode.id === 'shardRush') {
      this.shardSpawn -= dt;
      if (this.shardSpawn <= 0) { this.shardSpawn = 3.2; this.pickups.push(new Pickup('shard', this.map.center.x + (Math.random() - 0.5) * 160, this.map.center.y + (Math.random() - 0.5) * 160)); }
      for (const pk of this.pickups) for (const a of this.actors) if (!a.dead && pk.active && circleHit(pk, a)) { pk.active = false; a.score = (a.score || 0) + 1; }
      this.pickups = this.pickups.filter((p) => p.active);
    }

    for (const a of this.actors) if (a.dead) {
      a.respawn = (a.respawn || 3) - dt;
      if (a.respawn <= 0) {
        const spawn = a.team === 0 ? this.map.spawns.A[Math.floor(Math.random() * this.map.spawns.A.length)] : this.map.spawns.B[Math.floor(Math.random() * this.map.spawns.B.length)];
        a.x = spawn.x; a.y = spawn.y; a.dead = false; a.hp = a.maxHp; a.invuln = 1.4; a.respawn = 3; a.score = Math.max(0, (a.score || 0) - 1);
      }
    }

    updateModeState(this.modeState, this.actors, this.pickups, dt);
    this.modeState.scoreA ||= 0; this.modeState.scoreB ||= 0;
    this.effects = updateEffects(this.effects, dt);
    this.camera.update(this.player, dt, this.map.size, this.game.save.settings);

    if (this.modeState.winner != null) {
      const win = this.modeState.winner === 0;
      const rewards = finalizeMatch(this.game.save, { win, mode: this.mode.id, heroId: this.player.hero.id });
      this.game.persist();
      this.game.scenes.results.setData({ win, rewards });
      this.game.scene = this.game.scenes.results;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.map.theme + '22'; ctx.fillRect(0, 0, 1280, 720);
    this.camera.begin(ctx);
    ctx.fillStyle = '#101b2d'; ctx.fillRect(0, 0, this.map.size.w, this.map.size.h);
    for (let x = 0; x < this.map.size.w; x += 80) { ctx.strokeStyle = '#ffffff08'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.map.size.h); ctx.stroke(); }
    for (const b of this.map.brush) { ctx.fillStyle = '#2d7644aa'; ctx.fillRect(b.x, b.y, b.w, b.h); }
    for (const w of this.map.walls) { ctx.fillStyle = '#4d5d79'; ctx.fillRect(w.x, w.y, w.w, w.h); }
    if (this.mode.id === 'zoneHold') { const z = this.modeState.zone; ctx.strokeStyle = '#70d4ff'; ctx.lineWidth = 4; ctx.strokeRect(z.x, z.y, z.w, z.h); }

    for (const p of this.pickups) { ctx.fillStyle = '#57dbff'; ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.fill(); }
    for (const z of this.zones) { ctx.fillStyle = '#69d2ff33'; ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill(); }
    for (const b of this.beams) { ctx.strokeStyle = '#fff3'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); }

    for (const p of this.projectiles) if (p.active) { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); }

    for (const a of this.actors) {
      if (a.dead) continue;
      ctx.fillStyle = a.team === 0 ? '#58b8ff' : '#ff6c8a';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = a.hero.color; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#0008'; ctx.fillRect(a.x - 26, a.y - 34, 52, 7);
      ctx.fillStyle = '#7bffac'; ctx.fillRect(a.x - 26, a.y - 34, 52 * (a.hp / a.maxHp), 7);
    }
    renderEffects(ctx, this.effects);
    this.camera.end(ctx);

    drawHud(ctx, this);
    if (this.game.tutorial && this.game.tutorialTime > 0) {
      ctx.fillStyle = '#040915d8'; ctx.fillRect(260, 120, 760, 160);
      ctx.fillStyle = '#fff'; ctx.font = '24px Inter'; ctx.textAlign = 'center';
      ctx.fillText('WASD move • Mouse aim • LMB attack • RMB gadget • SPACE super • TAB scoreboard', 640, 190);
      ctx.fillText('Collect objectives and eliminate enemy bots to win.', 640, 230);
    }
  }
}
