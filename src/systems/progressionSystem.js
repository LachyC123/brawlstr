import { addRewards } from '../save.js';

export function finalizeMatch(save, { win, mode, heroId }) {
  const trophiesDelta = win ? 8 : -5;
  return addRewards(save, { win, mode, heroId, trophiesDelta });
}
