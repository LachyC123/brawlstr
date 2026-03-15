# SkySpike Legends

SkySpike Legends is a **mobile-first, portrait arcade prototype** for GitHub Pages built with plain HTML/CSS/JavaScript and Canvas rendering.

## Concept
A fast, skill-based fusion of:
- **Volleyball rally fundamentals** (serve, positioning, jump timing, spike/block)
- **Hero battler abilities** (each character has unique passive identity + active special)
- **Meta progression loop** (trophy ladder, roster upgrades, missions, capsules)

The design target is short high-intensity matches and a strong “one more match” loop.

## Core Gameplay Loop
1. Enter Quick Match or Trophy Match.
2. Serve and rally in short first-to-5 rounds.
3. Build energy by touching the ball and trigger your hero special.
4. Win to gain trophies, coins, and capsule opportunities.
5. Spend rewards on upgrades and unlock more heroes.
6. Progress through Trophy Road milestones.

## Characters (6)
- **Flare Ace** (Rare): power-focused rally finisher.
- **Mistral Zip** (Epic): aerial mobility specialist.
- **Granite Wall** (Common): tanky net defender.
- **Volt Kicker** (Rare): jump rhythm burst kit.
- **Echo Trickster** (Epic): curve/feint control style.
- **Reef Saver** (Common): defensive rescue specialist.

## Controls
### Mobile (portrait)
- Left quarter: move left
- Mid-left quarter: move right
- Mid-right quarter: jump
- Right quarter: special

### Desktop
- A / Left Arrow = left
- D / Right Arrow = right
- W / Up / Space = jump
- E / Shift = special

## Features Implemented
- Scene/state architecture
- Canvas gameplay and physics
- AI scaling with trophy level
- Character roster + individual upgrades
- Trophy Road with real claim logic
- Reward capsules with weighted loot table
- Currencies: coins, gems, packs
- Daily missions and claim flow
- localStorage save persistence
- Lightweight tutorial flow
- Mobile UX overlays + large tap targets
- Lightweight synthesized audio manager (easy to replace)

## File Structure
- `index.html`
- `css/style.css`
- `js/main.js`
- `js/config.js`
- `js/game/Game.js`
- `js/game/scenes/BootScene.js`
- `js/game/scenes/MenuScene.js`
- `js/game/scenes/MatchScene.js`
- `js/game/scenes/TrophyRoadScene.js`
- `js/game/scenes/RosterScene.js`
- `js/game/scenes/RewardsScene.js`
- `js/systems/InputManager.js`
- `js/systems/AudioManager.js`
- `js/systems/SaveManager.js`
- `js/systems/UIManager.js`
- `js/systems/ProgressionSystem.js`
- `js/systems/CharacterSystem.js`
- `js/entities/Player.js`
- `js/entities/Opponent.js`
- `js/entities/Ball.js`
- `js/entities/Net.js`
- `js/data/characters.js`
- `js/data/trophyRoad.js`
- `js/data/rewards.js`
- `assets/sprites/`, `assets/ui/`, `assets/backgrounds/`, `assets/audio/`

## Run Locally
Because this uses JS modules, run any static server from project root:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy to GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set source to your default branch root (`/`).
4. Save and wait for deployment.

No build step is required.

## Swapping Placeholder Art / Audio Later
- Replace procedural drawing in entity/UI render methods with sprite-sheet rendering.
- Keep the current class interfaces (`draw`, scene `render`) and only swap internals.
- Replace `AudioManager.play()` synth tones with loaded SFX files from `assets/audio/`.
- Add an asset manifest/loader in `BootScene` for preloading production assets.
