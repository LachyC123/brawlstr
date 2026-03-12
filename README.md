# Neon Scrappers

Neon Scrappers is an original top-down, hero-based arena shooter built with plain HTML/CSS/JavaScript + Canvas for desktop browser play.
It focuses on short, intense matches, readable combat, and an offline progression loop that works on GitHub Pages.

## Core Features (Phase 1 implemented)
- Original IP/theme (no external game assets/branding reused)
- Fast top-down keyboard+mouse combat
- 8 original heroes defined in data (4+ fully practical for immediate play)
- 3 fully playable modes:
  - Shard Rush
  - Team Skirmish
  - Zone Hold
- Bot allies/enemies with difficulty-aware behavior
- 5 original map themes (2 production layouts + 3 scaffolded)
- Meta progression via localStorage:
  - account level + XP
  - credits
  - hero unlocks / selected hero
  - hero trophies/mastery stats
  - win/loss + mode stats
- Menu flow: title/menu -> roster/progression -> match -> results -> rematch
- Polished combat juice (shake, flashes, zone effects, HUD)
- Modular architecture ready for expansion

## Controls
- `WASD` move
- Mouse aim
- `Left Click` basic attack
- `Right Click` gadget
- `Space` super
- `Tab` scoreboard
- `Esc` pause
- `P` unpause

## Folder Structure

```text
/index.html
/style.css
/src/main.js
/src/game.js
/src/config.js
/src/input.js
/src/audio.js
/src/save.js
/src/utils.js
/src/render/
  camera.js
  effects.js
  ui.js
/src/entities/
  entity.js
  player.js
  bot.js
  projectile.js
  pickup.js
/src/systems/
  combatSystem.js
  abilitySystem.js
  botAISystem.js
  collisionSystem.js
  gameModeSystem.js
  progressionSystem.js
/src/data/
  heroes.js
  maps.js
  modes.js
  upgrades.js
/src/scenes/
  menuScene.js
  characterSelectScene.js
  battleScene.js
  resultsScene.js
  progressionScene.js
/assets/
  ui/
  sfx/
  music/
```

## Run Locally
Option A (quick):
1. Open `index.html` in a modern browser.

Option B (recommended static server):
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

## GitHub Pages Deployment
1. Push this repo to GitHub.
2. In **Settings → Pages**, set source to the main branch root (`/`).
3. Save; GitHub Pages serves `index.html` automatically.
4. Ensure all paths remain relative (`./src/main.js`, `style.css`) as already configured.

## Known Limitations
- Audio manager is placeholder-safe and currently silent by default.
- Three additional maps are scaffolded but not fully blocked-out yet.
- Advanced modes (payload/survival/ball/heist variants) are scaffold targets for next phases.
- Minimap and cosmetic inventory UI are not implemented yet.

## Future Expansion Ideas
- Full objective mode set (payload, duo survival, core assault, sport mode)
- Deeper bot navigation and tactical mode logic
- Cosmetic unlocks and daily quest system
- Full settings panel UI with sliders/toggles
- Optional gamepad support and key remapping
- Expanded VFX/SFX pass and authored audio pack
