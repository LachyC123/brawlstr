import { Game } from './game/Game.js';

const canvas = document.getElementById('game-canvas');
const uiLayer = document.getElementById('ui-layer');

const game = new Game(canvas, uiLayer);
game.start();

window.addEventListener('beforeunload', () => game.persist());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.persist();
});
