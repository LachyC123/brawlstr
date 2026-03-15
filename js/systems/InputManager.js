export class InputManager {
  constructor(canvas, uiLayer) {
    this.canvas = canvas;
    this.uiLayer = uiLayer;
    this.state = { left: false, right: false, jump: false, special: false };
    this.pointerMap = new Map();
    this.bind();
  }

  bind() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.state.left = true;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.state.right = true;
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key.toLowerCase() === 'w') this.state.jump = true;
      if (e.key.toLowerCase() === 'e' || e.key === 'Shift') this.state.special = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.state.left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.state.right = false;
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key.toLowerCase() === 'w') this.state.jump = false;
      if (e.key.toLowerCase() === 'e' || e.key === 'Shift') this.state.special = false;
    });

    const target = this.uiLayer;
    target.addEventListener('pointerdown', (e) => this.handlePointer(e, true));
    target.addEventListener('pointermove', (e) => this.handlePointer(e, true));
    target.addEventListener('pointerup', (e) => this.handlePointer(e, false));
    target.addEventListener('pointercancel', (e) => this.handlePointer(e, false));
  }

  handlePointer(e, active) {
    const rect = this.uiLayer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (!active) {
      this.pointerMap.delete(e.pointerId);
    } else {
      this.pointerMap.set(e.pointerId, x);
    }
    this.rebuildTouchState();
  }

  rebuildTouchState() {
    this.state.left = false;
    this.state.right = false;
    this.state.jump = false;
    this.state.special = false;

    for (const x of this.pointerMap.values()) {
      if (x < 0.25) this.state.left = true;
      else if (x < 0.5) this.state.right = true;
      else if (x < 0.75) this.state.jump = true;
      else this.state.special = true;
    }
  }
}
