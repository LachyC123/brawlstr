import { RARITY_COLORS } from '../data/rewards.js';

export class UIManager {
  constructor(layer, game) {
    this.layer = layer;
    this.game = game;
    this.lastHudState = null;
  }

  clear() { this.layer.innerHTML = ''; }

  button(label, onClick, cls = 'main-btn') {
    const b = document.createElement('button');
    b.className = cls;
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('pointerdown', () => b.classList.add('pressed'));
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((evt) => b.addEventListener(evt, () => b.classList.remove('pressed')));
    b.addEventListener('click', () => {
      this.game.audio.play('uiTap');
      onClick();
    });
    return b;
  }

  screenShell(title, subtitle, flavor = '') {
    const shell = document.createElement('div');
    shell.className = 'screen';
    shell.innerHTML = `
      <div class="ambient-glow"></div>
      <div class="ambient-shards"></div>
      <header class="panel premium-header">
        <div class="subtitle">${subtitle}</div>
        <div class="title">${title}</div>
        <div class="header-flavor">${flavor}</div>
      </header>
    `;
    return shell;
  }

  renderMenu(data) {
    this.clear();
    const wrap = this.screenShell('SkySpike Legends', 'Arena Hub', 'Build momentum. Collect brawlers. Own the court.');

    const hero = document.createElement('section');
    hero.className = 'panel hero-panel';
    hero.innerHTML = `
      <div class="hero-backdrop"></div>
      <div class="hero-copy">
        <div class="subtitle">Featured Brawler</div>
        <h2>${data.selected?.name || 'Rookie'}</h2>
        <p>${data.selected?.active || 'Master timing, unleash specials, and dominate rallies.'}</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="main-btn pulse">Play Casual</button>
        <button type="button" class="main-btn alt">Trophy Clash</button>
      </div>
    `;
    hero.querySelector('.main-btn.pulse').addEventListener('click', () => this.game.startMatch(false));
    hero.querySelector('.main-btn.alt').addEventListener('click', () => this.game.startMatch(true));

    const topBar = document.createElement('section');
    topBar.className = 'panel currency-bar premium';
    topBar.innerHTML = `
      <div class="pill trophy"><span>Trophies</span><strong>${data.profile.trophies}</strong></div>
      <div class="pill"><span>Coins</span><strong>${data.currencies.coins}</strong></div>
      <div class="pill"><span>Gems</span><strong>${data.currencies.gems}</strong></div>
      <div class="pill"><span>Capsules</span><strong>${data.currencies.packs}</strong></div>
    `;

    const profile = document.createElement('section');
    profile.className = 'panel profile-strip premium';
    profile.innerHTML = `
      <div>
        <div class="subtitle">Commander</div>
        <div class="profile-name">${data.profile.name}</div>
        <div class="profile-league">${data.profile.league}</div>
      </div>
      <div style="text-align:right;">
        <div class="subtitle">Current Brawler</div>
        <div class="profile-name">${data.selected?.name}</div>
        <button type="button" class="audio-toggle ${data.sfxEnabled ? 'on' : 'off'}">SFX ${data.sfxEnabled ? 'ON' : 'OFF'}</button>
      </div>
    `;

    profile.querySelector('.audio-toggle').addEventListener('click', () => {
      this.game.audio.play('menuConfirm');
      this.game.setSfxEnabled(!data.sfxEnabled);
    });

    const nav = document.createElement('div');
    nav.className = 'btn-row two';
    nav.append(
      this.button('Brawler Roster', () => this.game.changeScene('roster'), 'main-btn alt'),
      this.button('Trophy Road', () => this.game.changeScene('road'), 'main-btn alt'),
      this.button('Open Capsule', () => this.game.changeScene('rewards')),
      this.button('Quick Training', () => this.game.changeScene('tutorial'), 'ghost-btn')
    );

    const missionPanel = document.createElement('section');
    missionPanel.className = 'panel mission-panel';
    missionPanel.innerHTML = '<div class="section-label">Daily Missions</div>';
    data.missions.forEach((m) => {
      const done = m.progress >= m.goal;
      const row = document.createElement('div');
      row.className = `mission-row ${done ? 'ready' : ''}`;
      row.innerHTML = `
        <div>
          <div class="mission-title">${m.text}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, (m.progress / m.goal) * 100)}%"></div></div>
          <div class="mission-meta">${m.progress}/${m.goal}</div>
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

    wrap.append(topBar, profile, hero, nav, missionPanel);
    this.layer.append(wrap);
  }

  renderRoster(chars, selectedId) {
    this.clear();
    const selected = chars.find((c) => c.id === selectedId) || chars[0];
    const wrap = this.screenShell('Brawler Roster', 'Collection', 'Choose your headliner and upgrade your signature playstyle.');

    const showcase = document.createElement('section');
    showcase.className = 'panel selected-showcase';
    showcase.innerHTML = `
      <canvas class="portrait big" width="88" height="88"></canvas>
      <div>
        <div class="subtitle">Selected</div>
        <div class="char-name" style="color:${RARITY_COLORS[selected.rarity] || '#fff'}">${selected.name}</div>
        <div class="mission-meta">${selected.rarity} • Lv.${selected.level} • ${selected.role}</div>
        <div class="ability-line"><span>Passive:</span> ${selected.passive}</div>
        <div class="ability-line"><span>Active:</span> ${selected.active}</div>
      </div>
    `;
    this.drawPortrait(showcase.querySelector('canvas'), selected);

    const grid = document.createElement('section');
    grid.className = 'panel card-grid';
    chars.forEach((c) => {
      const card = document.createElement('div');
      card.className = `char-card rarity-${c.rarity.toLowerCase()} ${c.id === selectedId ? 'selected' : ''}`;
      card.innerHTML = `<canvas class="portrait" width="64" height="64"></canvas>
      <div>
        <div class="char-name" style="color:${RARITY_COLORS[c.rarity] || '#fff'}">${c.name}${c.unlocked ? '' : ' • Locked'}</div>
        <div class="mission-meta">Lv.${c.level} • ${c.rarity} • ${c.role}</div>
        <div class="meta-row"><span>${c.theme}</span></div>
        <div class="ability-icons"><span>◇ ${c.passive.slice(0, 30)}${c.passive.length > 30 ? '…' : ''}</span><span>✦ ${c.active.slice(0, 30)}${c.active.length > 30 ? '…' : ''}</span></div>
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

    const row = document.createElement('div');
    row.className = 'btn-row two';
    row.append(this.button('Back', () => this.game.changeScene('menu')));
    wrap.append(showcase, grid, row);
    this.layer.append(wrap);
  }

  renderRoad(road, trophies) {
    this.clear();
    const wrap = this.screenShell('Trophy Road', 'Progression', 'Claim milestones and unlock your next signature power-up.');
    wrap.innerHTML += '';

    const top = document.createElement('section');
    top.className = 'panel profile-strip premium';
    top.innerHTML = `<span>Total Trophies</span><strong class="profile-name">${trophies}</strong>`;

    const shell = document.createElement('section');
    shell.className = 'panel track-shell';
    const track = document.createElement('div');
    track.className = 'trophy-track';
    road.forEach((n) => {
      const node = document.createElement('div');
      const state = n.claimed ? 'claimed' : n.ready ? 'ready' : (trophies + 70 >= n.trophies ? 'near' : 'locked');
      node.className = `node ${state}`;
      node.innerHTML = `<div class="subtitle">${state === 'near' ? 'Almost there' : state}</div>
        <div class="node-title">${n.trophies}</div>
        <div class="mission-meta">${this.rewardLabel(n)}</div>`;
      if (n.ready) node.append(this.button('Claim', () => this.game.claimRoad(n.index), 'small-btn'));
      track.append(node);
    });
    shell.append(track);

    const row = document.createElement('div');
    row.className = 'btn-row two';
    row.append(this.button('Back', () => this.game.changeScene('menu')));
    wrap.append(top, shell, row);
    this.layer.append(wrap);
  }

  rewardLabel(node) {
    if (node.type === 'character') return `Unlock: ${node.id}`;
    if (node.type === 'pack') return `Capsule x${node.amount}`;
    return `${node.type} x${node.amount}`;
  }

  renderRewards(lastReward, packs) {
    this.clear();
    const wrap = this.screenShell('Capsule Bay', 'Reward Reveal', 'Tap to crack open the spotlight drop.');

    const panel = document.createElement('section');
    panel.className = 'panel reward-panel';
    panel.innerHTML = `
      <div class="subtitle">Capsules Ready: ${packs}</div>
      <div class="reward-stage">
        <div class="reward-core"></div>
        <div class="reward-ring"></div>
      </div>
      <div class="reward-glow"></div>
      <div class="reward-copy">${lastReward || 'Tap OPEN to reveal your next drop.'}</div>
      <div class="mission-meta">Rewards reveal coins, gems, shards, and unlocks.</div>
    `;

    const row = document.createElement('div');
    row.className = 'btn-row two';
    row.append(this.button('Open Capsule', () => this.game.openPack()));
    row.append(this.button('Back', () => this.game.changeScene('menu'), 'main-btn alt'));
    wrap.append(panel, row);
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

    const wrap = this.screenShell('Training Notes', 'Practice Arena', 'Sharpen timing and become clutch in pressure rallies.');
    const body = document.createElement('div');
    body.className = 'panel tutorial-body';
    body.textContent = done ? 'You are match ready. Take the court and chase your next streak.' : tips[step];

    const row = document.createElement('div');
    row.className = 'btn-row two';
    if (!done) row.append(this.button('Next Tip', () => this.game.nextTutorial()));
    row.append(this.button(done ? 'Done' : 'Skip', () => this.game.finishTutorial(), 'main-btn alt'));

    wrap.append(body, row);
    this.layer.append(wrap);
  }

  renderMatchHUD(state) {
    const prev = this.lastHudState;
    this.lastHudState = { ...state };
    const scorePulse = prev && (prev.playerScore !== state.playerScore || prev.aiScore !== state.aiScore) ? 'score-pop' : '';
    const energyPulse = state.specialReady ? 'ready' : '';

    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'match-overlay';
    wrap.innerHTML = `
      <div class="hud-top ${scorePulse}">
        <div class="hud-bubble"><span class="subtitle">YOU</span><strong>${state.playerScore}</strong><em class="hud-tag">🏆</em></div>
        <div class="hud-bubble hud-center">
          <span class="subtitle">RALLY</span><strong>${state.rally}</strong>
          <div class="event-chip">${state.eventText || 'Keep pressure high'}</div>
        </div>
        <div class="hud-bubble" style="text-align:right;"><span class="subtitle">CPU</span><strong>${state.aiScore}</strong><em class="hud-tag">⚔️</em></div>
      </div>
      <div class="special-meter ${energyPulse}">
        <div class="special-fill" style="width:${Math.max(0, Math.min(100, state.energy))}%"></div>
        <span class="meter-text">SPECIAL ${Math.floor(state.energy)}%</span>
      </div>
      <button type="button" class="pause-chip">II Pause</button>
      <div class="touch-controls">
        <div class="pad"><div class="ctrl">LEFT</div><div class="ctrl">RIGHT</div></div>
        <div class="pad"><div class="ctrl action">JUMP</div><div class="ctrl action">SPECIAL</div></div>
      </div>
    `;

    wrap.querySelector('.pause-chip').addEventListener('click', () => this.game.togglePause());
    this.layer.append(wrap);
  }

  showPauseMenu() {
    const modal = document.createElement('div');
    modal.className = 'modal-shell';
    const panel = document.createElement('div');
    panel.className = 'panel pause-modal';
    panel.innerHTML = '<div class="title">Paused</div><div class="mission-meta">Take a breather, then jump back in.</div>';
    const actions = document.createElement('div');
    actions.className = 'btn-row two';
    actions.append(
      this.button('Resume', () => this.game.togglePause()),
      this.button('Quit Match', () => this.game.quitMatchToMenu(), 'main-btn alt')
    );
    panel.append(actions);
    modal.append(panel);
    this.layer.append(modal);
  }

  showMatchIntro(text) {
    const intro = document.createElement('div');
    intro.className = 'cinematic-banner';
    intro.innerHTML = `<div class="subtitle">Match Start</div><strong>${text}</strong>`;
    this.layer.append(intro);
    setTimeout(() => intro.remove(), 1400);
  }

  showResultBanner(won, summary = {}) {
    const shell = document.createElement('div');
    shell.className = 'modal-shell';
    const banner = document.createElement('div');
    banner.className = `results-banner ${won ? 'win' : 'lose'}`;
    const delta = summary.trophies || 0;
    banner.innerHTML = `
      <div class="subtitle">${won ? 'Arena conquered' : 'Almost there'}</div>
      <div class="title">${won ? 'Victory' : 'Defeat'}</div>
      <div class="result-metrics">
        <div><span>Trophies</span><strong>${delta >= 0 ? '+' : ''}${delta}</strong></div>
        <div><span>Spikes</span><strong>${summary.spikes || 0}</strong></div>
        <div><span>Specials</span><strong>${summary.specials || 0}</strong></div>
      </div>
    `;
    shell.append(banner);
    this.layer.append(shell);
    setTimeout(() => shell.remove(), 1800);
  }


  renderMatchmaking({ modeLabel, arenaLabel, status }) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'flow-overlay matchmaking';
    wrap.innerHTML = `
      <div class="flow-bg"></div>
      <div class="flow-panel">
        <div class="subtitle">${modeLabel}</div>
        <div class="title">MATCHMAKING</div>
        <div class="flow-status">${status}</div>
        <div class="flow-meta">${arenaLabel} • Region Auto</div>
        <div class="scan-line"></div>
      </div>
    `;
    this.layer.append(wrap);
  }

  renderVersusScreen(context) {
    this.clear();
    const wrap = document.createElement('div');
    wrap.className = 'flow-overlay versus';
    wrap.innerHTML = `
      <div class="flow-bg glow"></div>
      <div class="versus-label">${context.modeLabel} • ${context.arenaLabel}</div>
      <div class="versus-shell">
        <section class="versus-card player">
          <div class="subtitle">Player</div>
          <canvas class="portrait big" width="92" height="92"></canvas>
          <div class="versus-name">${context.player.name}</div>
          <div class="versus-meta">🏆 ${context.player.trophies}</div>
          <div class="versus-char">${context.player.character.name}</div>
        </section>
        <div class="versus-core">VS</div>
        <section class="versus-card enemy">
          <div class="subtitle">Opponent Found</div>
          <canvas class="portrait big" width="92" height="92"></canvas>
          <div class="versus-name">${context.opponent.name}</div>
          <div class="versus-meta">🏆 ${context.opponent.trophies}</div>
          <div class="versus-char">${context.opponent.character.name}</div>
        </section>
      </div>
    `;
    this.layer.append(wrap);
    const portraits = wrap.querySelectorAll('canvas');
    this.drawPortrait(portraits[0], context.player.character);
    this.drawPortrait(portraits[1], context.opponent.character);
  }

  renderResultsScreen(payload) {
    this.clear();
    const shell = document.createElement('div');
    shell.className = 'flow-overlay results';
    const signed = payload.trophyDelta >= 0 ? `+${payload.trophyDelta}` : `${payload.trophyDelta}`;
    const positive = payload.trophyDelta >= 0;
    const milestoneItems = payload.roadProgress.crossedMilestones || [];

    shell.innerHTML = `
      <div class="flow-bg"></div>
      <div class="results-shell ${payload.won ? 'win' : 'lose'}">
        <div class="subtitle">${payload.ranked ? 'Trophy Match Complete' : 'Casual Match Complete'}</div>
        <div class="results-headline">${payload.won ? 'VICTORY' : 'DEFEAT'}</div>
        <div class="scoreline">${payload.playerScore} - ${payload.aiScore}</div>

        <section class="trophy-delta ${positive ? 'up' : 'down'}">
          <div class="subtitle">Trophy Change</div>
          <div class="delta-value">🏆 <span id="deltaVal">${signed}</span></div>
          <div class="trophy-total"><span id="oldTrophy">${payload.beforeTrophies}</span> → <span id="newTrophy">${payload.afterTrophies}</span></div>
        </section>

        <section class="road-progress">
          <div class="subtitle">Road Progress</div>
          <div class="bar"><div class="bar-fill" style="width:${payload.roadProgress.progress}%"></div></div>
          <div class="road-meta">Next milestone: ${payload.roadProgress.nextMilestone?.trophies ?? payload.afterTrophies} 🏆</div>
        </section>

        <section class="result-rewards">
          <div class="reward-chip">Coins +${payload.earnedCoins}</div>
          <div class="reward-chip">${payload.matchBonus.label}</div>
          ${milestoneItems.length ? `<div class="reward-unlock">Milestones crossed: ${milestoneItems.map((m) => `${m.trophies}🏆`).join(', ')}</div>` : '<div class="road-meta">No new milestone this match.</div>'}
        </section>

        <div class="btn-row two">
          <button type="button" class="main-btn" id="rematchBtn">Rematch</button>
          <button type="button" class="main-btn alt" id="homeBtn">Home</button>
        </div>
      </div>
    `;
    this.layer.append(shell);

    const rematchBtn = shell.querySelector('#rematchBtn');
    const homeBtn = shell.querySelector('#homeBtn');
    rematchBtn.addEventListener('click', () => this.game.startMatch(payload.ranked));
    homeBtn.addEventListener('click', () => this.game.changeScene('menu'));

    const oldNode = shell.querySelector('#oldTrophy');
    const newNode = shell.querySelector('#newTrophy');
    const start = payload.beforeTrophies;
    const end = payload.afterTrophies;
    const startTs = performance.now();
    const animate = (ts) => {
      const p = Math.min(1, (ts - startTs) / 850);
      const eased = 1 - (1 - p) ** 3;
      const curr = Math.round(start + (end - start) * eased);
      oldNode.textContent = start;
      newNode.textContent = curr;
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    if (milestoneItems.length) this.game.audio.play('trophyMilestone');
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
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const v = char.visuals;
    const px = (x, y, w, h, c) => {
      ctx.fillStyle = v.outline;
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
    };

    const scale = canvas.width / 64;
    ctx.save();
    ctx.scale(scale, scale);
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
    ctx.restore();
  }
}
