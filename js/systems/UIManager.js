import { RARITY_COLORS } from '../data/rewards.js';

export class UIManager {
  constructor(layer, game) {
    this.layer = layer;
    this.game = game;
  }

  clear() { this.layer.innerHTML = ''; }

  button(label, onClick, cls = 'main-btn') {
    const b = document.createElement('button');
    b.className = cls;
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('pointerdown', () => b.classList.add('pressed'));
    b.addEventListener('pointerup', () => b.classList.remove('pressed'));
    b.addEventListener('pointercancel', () => b.classList.remove('pressed'));
    b.addEventListener('click', () => {
      this.game.audio.play('uiTap');
      onClick();
    });
    return b;
  }

  renderMenu(data) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `
      <div class="ambient-glow"></div>
      <div class="panel title">SkySpike Legends</div>
      <div class="panel currency-bar">
        <div class="pill">Trophies <span>${data.profile.trophies}</span></div>
        <div class="pill">Coins <span>${data.currencies.coins}</span></div>
        <div class="pill">Gems <span>${data.currencies.gems}</span></div>
      </div>
      <div class="panel profile-strip">
        <div>
          <div class="subtitle">Player</div>
          <div style="font-weight:800; font-size:14px;">${data.profile.name}</div>
          <div style="font-size:12px; color:var(--ink-soft)">${data.profile.league}</div>
        </div>
        <div style="text-align:right;">
          <div class="subtitle">Current Brawler</div>
          <div style="font-weight:800;">${data.selected?.name}</div>
          <button type="button" class="audio-toggle ${data.sfxEnabled ? 'on' : 'off'}">SFX ${data.sfxEnabled ? 'ON' : 'OFF'}</button>
        </div>
      </div>
      <div class="btn-row two" id="row-a"></div>
      <div class="btn-row two" id="row-b"></div>
      <div class="btn-row two" id="row-c"></div>
      <div class="panel" id="mission-panel"></div>
    `;

    wrap.querySelector('.audio-toggle').addEventListener('click', () => {
      this.game.audio.play('menuConfirm');
      this.game.setSfxEnabled(!data.sfxEnabled);
    });

    wrap.querySelector('#row-a').append(
      this.button('Play Casual', () => this.game.startMatch(false)),
      this.button('Trophy Clash', () => this.game.startMatch(true), 'main-btn alt')
    );

    wrap.querySelector('#row-b').append(
      this.button('Brawler Roster', () => this.game.changeScene('roster')),
      this.button('Trophy Path', () => this.game.changeScene('road'), 'main-btn alt')
    );

    wrap.querySelector('#row-c').append(
      this.button(`Open Pack (${data.currencies.packs})`, () => this.game.changeScene('rewards')),
      this.button('Quick Training', () => this.game.changeScene('tutorial'), 'main-btn alt')
    );

    const missionPanel = wrap.querySelector('#mission-panel');
    missionPanel.innerHTML = `<div style="font-weight:800; margin-bottom:8px;">Daily Missions</div>`;
    data.missions.forEach((m) => {
      const done = m.progress >= m.goal;
      const row = document.createElement('div');
      row.className = 'mission-row';
      row.innerHTML = `
        <div>
          <div style="font-size:12px; font-weight:700;">${m.text}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${(m.progress / m.goal) * 100}%"></div></div>
          <div style="font-size:11px; color:var(--ink-soft); margin-top:4px;">${m.progress}/${m.goal}</div>
        </div>
      `;
      if (done && !m.claimed) row.append(this.button('Claim', () => this.game.claimMission(m.id), 'small-btn'));
      else {
        const label = document.createElement('div');
        label.className = 'subtitle';
        label.textContent = m.claimed ? 'Claimed' : 'In progress';
        row.append(label);
      }
      missionPanel.append(row);
    });

    this.layer.append(wrap);
  }

  renderRoster(chars, selectedId) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Brawler Roster</div><div class="panel card-grid"></div><div class="btn-row two"></div>`;

    const grid = wrap.querySelector('.card-grid');
    chars.forEach((c) => {
      const card = document.createElement('div');
      card.className = `char-card rarity-${c.rarity.toLowerCase()} ${c.id === selectedId ? 'selected' : ''}`;
      card.innerHTML = `<canvas class="portrait" width="64" height="64"></canvas>
      <div>
        <div class="char-name" style="color:${RARITY_COLORS[c.rarity] || '#fff'}">${c.name}${c.unlocked ? '' : ' • Locked'}</div>
        <div style="font-size:11px; margin-top:2px; color:var(--ink-soft)">Lv.${c.level} • ${c.rarity} • ${c.role}</div>
        <div class="meta-row"><span>${c.theme}</span></div>
        <div class="ability-icons"><span title="Passive">◇ ${c.passive.slice(0, 22)}...</span><span title="Active">✦ ${c.active.slice(0, 22)}...</span></div>
      </div>`;
      this.drawPortrait(card.querySelector('canvas'), c);

      if (c.unlocked) {
        const actions = document.createElement('div');
        actions.className = 'card-actions';
        const useBtn = this.button(c.id === selectedId ? 'Selected' : 'Set Active', () => this.game.selectCharacter(c.id), 'small-btn');
        useBtn.disabled = c.id === selectedId;
        const upBtn = this.button(`Upgrade ${this.game.characterSystem.upgradeCost(c.id)}c`, () => this.game.upgradeCharacter(c.id), 'ghost-btn');
        actions.append(useBtn, upBtn);
        card.append(actions);
      }
      grid.append(card);
    });

    wrap.querySelector('.btn-row').append(this.button('Back', () => this.game.changeScene('menu')));
    this.layer.append(wrap);
  }

  renderRoad(road, trophies) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Trophy Path</div>
      <div class="panel profile-strip"><span>Total Trophies</span><strong>${trophies}</strong></div>
      <div class="panel track-shell"><div class="trophy-track"></div></div>
      <div class="btn-row two"></div>`;
    const track = wrap.querySelector('.trophy-track');

    road.forEach((n) => {
      const node = document.createElement('div');
      node.className = `node ${n.claimed ? 'claimed' : n.ready ? 'ready' : ''}`;
      node.innerHTML = `<div style="font-weight:800">${n.trophies} trophies</div>
        <div style="font-size:11px; margin:6px 0">${this.rewardLabel(n)}</div>`;
      if (n.ready) node.append(this.button('Claim', () => this.game.claimRoad(n.index), 'small-btn'));
      else if (!n.claimed) {
        const tag = document.createElement('div');
        tag.className = 'subtitle';
        tag.textContent = 'Locked';
        node.append(tag);
      }
      track.append(node);
    });

    wrap.querySelector('.btn-row').append(this.button('Back', () => this.game.changeScene('menu')));
    this.layer.append(wrap);
  }

  rewardLabel(node) {
    if (node.type === 'character') return `Unlock: ${node.id}`;
    if (node.type === 'pack') return `Capsule x${node.amount}`;
    return `${node.type} x${node.amount}`;
  }

  renderRewards(lastReward, packs) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Capsule Bay</div>
      <div class="panel reward-panel">
        <div class="subtitle">Capsules Ready: ${packs}</div>
        <div class="reward-core"></div>
        <div class="reward-glow"></div>
        <div class="reward-copy">${lastReward || 'Tap OPEN to reveal your next drop.'}</div>
        <div style="font-size:11px; color:var(--ink-soft)">Rewards reveal coins, gems, shards, and unlocks.</div>
      </div>
      <div class="btn-row two"></div>`;

    const row = wrap.querySelector('.btn-row');
    row.append(this.button('Open', () => this.game.openPack()));
    row.append(this.button('Back', () => this.game.changeScene('menu'), 'main-btn alt'));
    this.layer.append(wrap);
  }

  renderTutorial(step, done = false) {
    this.clear();
    const tips = [
      'Touch left half to run. Touch right half to jump and special.',
      'Strike the ball at peak height for steep, fast spikes.',
      'Build 100 energy, then fire SPECIAL to swing rallies instantly.',
      'Long rallies increase pressure. Stay calm, read the bounce, finish strong.',
    ];

    const wrap = document.createElement('div');
    wrap.className = 'screen';
    wrap.innerHTML = `<div class="panel title">Training Notes</div>
      <div class="panel" style="min-height:220px; font-size:14px; line-height:1.6; display:grid; align-content:center;">${done ? 'You are match ready. Take the court and chase your next streak.' : tips[step]}</div>
      <div class="btn-row two"></div>`;

    const row = wrap.querySelector('.btn-row');
    if (!done) row.append(this.button('Next Tip', () => this.game.nextTutorial()));
    row.append(this.button(done ? 'Done' : 'Skip', () => this.game.finishTutorial(), 'main-btn alt'));
    this.layer.append(wrap);
  }

  renderMatchHUD(state) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'match-overlay';
    wrap.innerHTML = `
      <div class="hud-top">
        <div class="hud-bubble">YOU ${state.playerScore}</div>
        <div class="hud-bubble hud-center">RALLY ${state.rally}<br><span style="font-size:10px; color:var(--ink-soft);">Energy ${Math.floor(state.energy)}%</span></div>
        <div class="hud-bubble" style="text-align:right;">CPU ${state.aiScore}</div>
      </div>
      <div class="touch-controls">
        <div class="pad"><div class="ctrl">LEFT</div><div class="ctrl">RIGHT</div></div>
        <div class="pad"><div class="ctrl action">JUMP</div><div class="ctrl action">SPECIAL</div></div>
      </div>
    `;
    this.layer.append(wrap);
  }

  showResultBanner(won) {
    const banner = document.createElement('div');
    banner.className = `results-banner ${won ? 'win' : 'lose'}`;
    banner.textContent = won ? 'VICTORY' : 'DEFEAT';
    this.layer.append(banner);
    setTimeout(() => banner.remove(), 1200);
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
    const [a, b] = char.cardGradient;
    const g = ctx.createLinearGradient(0, 0, 64, 64);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);

    const v = char.visuals;
    const px = (x, y, w, h, c) => {
      ctx.fillStyle = v.outline;
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
    };

    px(23, 36, 7, 10, v.legs);
    px(33, 36, 7, 10, v.legs);
    px(23, 46, 7, 4, v.shoes);
    px(33, 46, 7, 4, v.shoes);
    px(20, 18, 24, 18, v.torso);
    px(17, 19, 6, 13, v.shoulder);
    px(41, 19, 6, 13, v.shoulder);
    px(22, 8, 20, 12, v.skin);
    px(20, 3, 24, 6, v.hair);
    px(26, 0, 12, 4, v.headgear);
    px(29, 23, 6, 8, v.band);

    ctx.fillStyle = v.band;
    ctx.font = 'bold 8px Inter';
    ctx.fillText(v.emblem, 29, 30);

    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillRect(4, 4, 15, 5);
  }
}
