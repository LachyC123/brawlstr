import { Game } from './game/Game.js';

const canvas = document.getElementById('game-canvas');
const uiLayer = document.getElementById('ui-layer');
const app = document.getElementById('app');

const blockDefaultTouch = (event) => {
  if (event.cancelable) event.preventDefault();
};

['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
  document.addEventListener(type, blockDefaultTouch, { passive: false });
});

document.addEventListener('dblclick', blockDefaultTouch, { passive: false });
window.addEventListener('touchmove', blockDefaultTouch, { passive: false });
app.addEventListener('contextmenu', (e) => e.preventDefault());

const game = new Game(canvas, uiLayer);
game.start();

window.addEventListener('beforeunload', () => game.persist());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.persist();
});
