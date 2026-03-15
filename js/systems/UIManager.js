import { RARITY_COLORS } from '../data/rewards.js';

export class UIManager {
  constructor(layer, game) {
    this.layer = layer;
    this.game = game;
  }

  clear() { this.layer.innerHTML = ''; }

  button(label, onClick, cls = '') {
    const b = document.createElement('button');
    b.className = `btn ${cls}`;
    b.textContent = label;
    b.addEventListener('click', () => {
      this.game.audio.play('click');
      onClick();
    });
    return b;
  }

  renderMenu(data) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `
      <div class="panel title">SkySpike Legends</div>
      <div class="panel currency-bar">
        <div class="pill">🏆 <span>${data.profile.trophies}</span></div>
        <div class="pill">🪙 <span>${data.currencies.coins}</span></div>
        <div class="pill">💎 <span>${data.currencies.gems}</span></div>
      </div>
      <div class="panel">
        <div style="font-weight:800; font-size:13px;">${data.profile.name}</div>
        <div style="font-size:12px; opacity:.85; margin-top:4px;">League: ${data.profile.league}</div>
        <div style="font-size:12px; opacity:.85;">Selected: ${data.selected?.name}</div>
      </div>
      <div class="btn-row"></div>
      <div class="btn-row"></div>
      <div class="panel" id="mission-panel"></div>
    `;
    const rows = wrap.querySelectorAll('.btn-row');
    rows[0].append(this.button('Quick Match', () => this.game.startMatch(false)));
    rows[0].append(this.button('Trophy Match', () => this.game.startMatch(true), 'secondary'));
    rows[1].append(this.button('Roster', () => this.game.changeScene('roster')));
    rows[1].append(this.button('Trophy Road', () => this.game.changeScene('road'), 'secondary'));
    const rows3 = document.createElement('div');
    rows3.className = 'btn-row';
    rows3.append(this.button(`Open Pack (${data.currencies.packs})`, () => this.game.changeScene('rewards')));
    rows3.append(this.button('Tutorial', () => this.game.changeScene('tutorial'), 'secondary'));
    wrap.insertBefore(rows3, wrap.lastElementChild);

    const missionPanel = wrap.querySelector('#mission-panel');
    missionPanel.innerHTML = `<div style="font-weight:800; margin-bottom:8px;">Daily Missions</div>`;
    data.missions.forEach((m) => {
      const done = m.progress >= m.goal;
      const row = document.createElement('div');
      row.className = 'meta-row';
      row.style.marginBottom = '7px';
      row.innerHTML = `<span>${m.text} (${m.progress}/${m.goal})</span><span>${done ? 'Ready' : ''}</span>`;
      if (done && !m.claimed) {
        const c = document.createElement('button');
        c.className = 'small-btn';
        c.textContent = 'Claim';
        c.addEventListener('click', () => this.game.claimMission(m.id));
        row.append(c);
      }
      missionPanel.append(row);
    });

    this.layer.append(wrap);
  }

  renderRoster(chars, selectedId) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Roster & Upgrades</div><div class="card-grid panel"></div><div class="btn-row"></div>`;
    const grid = wrap.querySelector('.card-grid');
    chars.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.innerHTML = `<canvas class="portrait" width="54" height="54"></canvas>
      <div>
        <div style="font-weight:800; color:${RARITY_COLORS[c.rarity] || '#fff'}">${c.name} ${c.unlocked ? '' : '🔒'}</div>
        <div style="font-size:11px; opacity:.85">Lv.${c.level} • ${c.passive}</div>
        <div class="meta-row"><span>${c.theme}</span><span>${c.rarity}</span></div>
      </div>`;
      this.drawPortrait(card.querySelector('canvas'), c);
      if (c.unlocked) {
        card.addEventListener('click', () => this.game.selectCharacter(c.id));
        if (c.id === selectedId) card.style.outline = '3px solid #ffd67a';

        const actions = document.createElement('div');
        actions.style.gridColumn = '1 / span 2';
        actions.style.display = 'flex';
        actions.style.gap = '6px';
        const useBtn = document.createElement('button');
        useBtn.className = 'small-btn';
        useBtn.textContent = c.id === selectedId ? 'Selected' : 'Use';
        useBtn.disabled = c.id === selectedId;
        useBtn.addEventListener('click', (e) => { e.stopPropagation(); this.game.selectCharacter(c.id); });
        const upBtn = document.createElement('button');
        upBtn.className = 'small-btn';
        upBtn.textContent = `Upgrade ${this.game.characterSystem.upgradeCost(c.id)}c`;
        upBtn.addEventListener('click', (e) => { e.stopPropagation(); this.game.upgradeCharacter(c.id); });
        actions.append(useBtn, upBtn);
        card.append(actions);
      }
      grid.append(card);
    });

    const row = wrap.querySelector('.btn-row');
    row.append(this.button('Back', () => this.game.changeScene('menu')));
    this.layer.append(wrap);
  }

  renderRoad(road, trophies) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Trophy Road • ${trophies}🏆</div><div class="panel trophy-track"></div><div class="btn-row"></div>`;
    const track = wrap.querySelector('.trophy-track');
    road.forEach((n) => {
      const node = document.createElement('div');
      node.className = `node ${n.claimed ? 'claimed' : n.ready ? 'ready' : ''}`;
      node.innerHTML = `<div style="font-weight:800">${n.trophies}🏆</div><div style="font-size:11px">${n.type}${n.amount ? ' x'+n.amount : n.id ? ': '+n.id : ''}</div>`;
      if (n.ready) {
        const b = document.createElement('button');
        b.className = 'small-btn';
        b.textContent = 'Claim';
        b.addEventListener('click', () => this.game.claimRoad(n.index));
        node.append(b);
      }
      track.append(node);
    });
    wrap.querySelector('.btn-row').append(this.button('Back', () => this.game.changeScene('menu')));
    this.layer.append(wrap);
  }

  renderRewards(lastReward, packs) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Reward Capsules</div>
      <div class="panel" style="display:grid; place-items:center; min-height:220px;">
        <div style="font-size:12px; opacity:.8">Packs Available: ${packs}</div>
        <div style="font-size:17px; font-weight:800; margin-top:12px;">${lastReward || 'Tap OPEN to crack a capsule!'}</div>
      </div>
      <div class="btn-row"></div>`;
    const row = wrap.querySelector('.btn-row');
    row.append(this.button('Open', () => this.game.openPack()));
    row.append(this.button('Back', () => this.game.changeScene('menu'), 'secondary'));
    this.layer.append(wrap);
  }

  renderTutorial(step, done = false) {
    this.clear();
    const tips = [
      'Hold left side to move. Right side to jump.',
      'Meet the ball at the highest point for clean spikes.',
      'Build energy and tap SPECIAL for your hero move.',
      'Win rallies fast to pressure AI mistakes.',
    ];
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Quick Tutorial</div>
      <div class="panel" style="min-height:200px; font-size:14px; line-height:1.6;">${done ? 'You are ready for ranked rallies. Good luck!' : tips[step]}</div>
      <div class="btn-row"></div>`;
    const row = wrap.querySelector('.btn-row');
    if (!done) row.append(this.button('Next', () => this.game.nextTutorial()));
    row.append(this.button(done ? 'Done' : 'Skip', () => this.game.finishTutorial(), 'secondary'));
    this.layer.append(wrap);
  }

  renderMatchHUD(state) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'match-overlay';
    wrap.innerHTML = `
      <div class="hud-top">
        <div class="hud-bubble">YOU ${state.playerScore}</div>
        <div class="hud-bubble">RALLY ${state.rally}</div>
        <div class="hud-bubble">CPU ${state.aiScore}</div>
      </div>
      <div class="touch-controls">
        <div class="pad"><div class="ctrl">LEFT</div><div class="ctrl">RIGHT</div></div>
        <div class="pad"><div class="ctrl action">JUMP</div><div class="ctrl action">SPECIAL</div></div>
      </div>
    `;
    this.layer.append(wrap);
  }

  toast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    this.layer.append(t);
    setTimeout(() => t.remove(), 1300);
  }

  drawPortrait(canvas, char) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#12224d';
    ctx.fillRect(0, 0, 54, 54);
    ctx.fillStyle = char.color;
    ctx.fillRect(15, 14, 24, 28);
    ctx.fillStyle = '#fff';
    ctx.fillRect(18, 22, 5, 5);
    ctx.fillRect(31, 22, 5, 5);
    ctx.fillStyle = '#001';
    ctx.fillRect(20, 24, 2, 2);
    ctx.fillRect(33, 24, 2, 2);
  }
}
