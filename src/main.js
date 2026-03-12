import { Game } from './game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
requestAnimationFrame((t) => game.tick(t));
