import { HEROES } from '../data/heroes.js';
import { CONFIG } from '../config.js';

export class CharacterSelectScene {
  constructor(game) { this.game = game; }
  update() {
    if (!this.game.justClicked) return;
    const { x, y } = this.game.input.mouse;
    let i = 0;
    for (const h of HEROES) {
      const cx = 130 + (i % 4) * 280; const cy = 180 + Math.floor(i / 4) * 220;
      if (x > cx && x < cx + 240 && y > cy && y < cy + 180) {
        if (this.game.save.unlockedHeroes.includes(h.id)) {
          this.game.save.selectedHero = h.id;
          this.game.persist();
        } else if (this.game.save.credits >= 120) {
          this.game.save.credits -= 120; this.game.save.unlockedHeroes.push(h.id); this.game.persist();
        }
      }
      i++;
    }
    if (x > 35 && x < 165 && y > 35 && y < 85) this.game.scene = this.game.scenes.menu;
  }
  render(ctx) {
    ctx.fillStyle = '#070d18'; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#fff'; ctx.font = '44px Inter'; ctx.textAlign = 'left';
    ctx.fillText('Hero Roster', 45, 88);
    ctx.font = '16px Inter';
    let i = 0;
    for (const h of HEROES) {
      const x = 130 + (i % 4) * 280; const y = 180 + Math.floor(i / 4) * 220;
      const unlocked = this.game.save.unlockedHeroes.includes(h.id);
      ctx.fillStyle = '#131f33'; ctx.fillRect(x, y, 240, 180);
      ctx.strokeStyle = CONFIG.rarityColors[h.rarity]; ctx.lineWidth = 3; ctx.strokeRect(x, y, 240, 180);
      ctx.fillStyle = h.color; ctx.beginPath(); ctx.arc(x + 50, y + 55, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(`${h.name} (${h.role})`, x + 84, y + 44);
      ctx.fillStyle = '#b5c8ef'; ctx.fillText(h.desc, x + 20, y + 92);
      ctx.fillStyle = unlocked ? '#57e28e' : '#ffd369';
      const txt = unlocked ? (this.game.save.selectedHero === h.id ? 'Selected' : 'Click to Select') : 'Unlock 120c';
      ctx.fillText(txt, x + 20, y + 150);
      i++;
    }
    ctx.fillStyle = '#1a2640'; ctx.fillRect(35, 35, 130, 50); ctx.fillStyle = '#fff'; ctx.fillText('Back', 75, 66);
  }
}
