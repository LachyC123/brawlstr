const ANIM_STATES = {
  IDLE: 'idle',
  MOVE: 'move',
  JUMP_RISE: 'jumpRise',
  JUMP_FALL: 'jumpFall',
  SPIKE: 'spike',
  BLOCK: 'block',
  LAND: 'land',
  WIN: 'win',
  LOSE: 'lose',
  SPECIAL: 'special',
};

export class Player {
  constructor(x, groundY, character, isAI = false) {
    this.x = x;
    this.y = groundY;
    this.vx = 0;
    this.vy = 0;
    this.groundY = groundY;
    this.width = 52;
    this.height = 70;
    this.isGrounded = true;
    this.character = character;
    this.isAI = isAI;
    this.energy = 0;
    this.specialReady = false;
    this.specialTimer = 0;
    this.touches = 0;
    this.jumpCount = 0;
    this.landingPulse = 0;
    this.animState = ANIM_STATES.IDLE;
    this.animTime = 0;
    this.facing = isAI ? -1 : 1;
    this.hitPoseTimer = 0;
    this.blockPoseTimer = 0;
    this.resultPose = null;
    this.justJumped = false;
  }

  reset(x) {
    this.x = x;
    this.y = this.groundY;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.specialTimer = 0;
    this.touches = 0;
    this.landingPulse = 0;
    this.animState = ANIM_STATES.IDLE;
    this.animTime = 0;
    this.hitPoseTimer = 0;
    this.blockPoseTimer = 0;
    this.resultPose = null;
    this.justJumped = false;
  }

  triggerHitPose() {
    this.hitPoseTimer = 0.16;
  }

  triggerBlockPose() {
    this.blockPoseTimer = 0.14;
  }

  setResultPose(won) {
    this.resultPose = won ? ANIM_STATES.WIN : ANIM_STATES.LOSE;
  }

  update(dt, dir, jump, special, gravity) {
    this.justJumped = false;
    const stats = this.character.stats;
    const speed = 345 * stats.speed;
    const accel = this.isGrounded ? 1 : 0.76;
    this.vx = dir * speed * accel;
    this.x += this.vx * dt;
    if (Math.abs(dir) > 0) this.facing = Math.sign(dir);

    if (jump && this.isGrounded) {
      this.vy = -870 * stats.jump;
      this.isGrounded = false;
      this.jumpCount += 1;
      this.justJumped = true;
      if (this.character.id === 'volt' && this.jumpCount % 3 === 0) {
        this.vy *= 1.18;
        this.energy = Math.min(100, this.energy + 12);
      }
    }

    if (special && this.specialReady) {
      this.specialReady = false;
      this.specialTimer = 0.55;
      this.energy = 0;
    }

    this.vy += gravity * dt;
    this.y += this.vy * dt;

    if (this.y >= this.groundY) {
      if (!this.isGrounded && Math.abs(this.vy) > 260) this.landingPulse = 0.18;
      this.y = this.groundY;
      this.vy = 0;
      this.isGrounded = true;
    }

    if (this.specialTimer > 0) this.specialTimer -= dt;
    if (this.landingPulse > 0) this.landingPulse -= dt;
    if (this.hitPoseTimer > 0) this.hitPoseTimer -= dt;
    if (this.blockPoseTimer > 0) this.blockPoseTimer -= dt;

    this.updateAnimState(dt, dir);
  }

  updateAnimState(dt, dir) {
    if (this.resultPose) {
      this.animState = this.resultPose;
      this.animTime += dt;
      return;
    }

    if (this.specialTimer > 0.03) this.animState = ANIM_STATES.SPECIAL;
    else if (this.hitPoseTimer > 0) this.animState = ANIM_STATES.SPIKE;
    else if (this.blockPoseTimer > 0) this.animState = ANIM_STATES.BLOCK;
    else if (!this.isGrounded) this.animState = this.vy < -70 ? ANIM_STATES.JUMP_RISE : ANIM_STATES.JUMP_FALL;
    else if (this.landingPulse > 0.08) this.animState = ANIM_STATES.LAND;
    else if (Math.abs(dir) > 0.15) this.animState = ANIM_STATES.MOVE;
    else this.animState = ANIM_STATES.IDLE;

    this.animTime += dt;
  }

  gainEnergy(v) {
    this.energy = Math.min(100, this.energy + v);
    this.specialReady = this.energy >= 100;
  }

  getPose() {
    const visuals = this.character.visuals;
    const t = performance.now() * 0.0065 * visuals.poseTempo + this.x * 0.01;
    const stride = Math.sin(t);

    const base = {
      torsoScaleY: 1,
      torsoScaleX: 1,
      headY: -58,
      armLeft: -2,
      armRight: 2,
      armLift: 0,
      legLeft: -1,
      legRight: 1,
      kneeBend: 0,
      lean: visuals.stance.lean,
      squash: 1,
      bob: Math.sin(t * 0.6) * 1.3,
    };

    if (this.animState === ANIM_STATES.MOVE) {
      base.armLeft -= 6 + stride * 6;
      base.armRight += 6 + stride * -6;
      base.legLeft += stride * 4;
      base.legRight += stride * -4;
      base.kneeBend = Math.abs(stride) * 2;
      base.bob += Math.abs(stride) * 1.2;
    } else if (this.animState === ANIM_STATES.JUMP_RISE) {
      base.armLift = -15;
      base.headY = -62;
      base.torsoScaleY = 0.95;
      base.torsoScaleX = 1.06;
      base.bob = -2;
    } else if (this.animState === ANIM_STATES.JUMP_FALL) {
      base.armLift = -6;
      base.kneeBend = 4;
      base.torsoScaleY = 1.05;
      base.torsoScaleX = 0.96;
      base.bob = 1;
    } else if (this.animState === ANIM_STATES.SPIKE) {
      base.armRight += 11;
      base.armLift = -18;
      base.lean -= 5;
      base.torsoScaleY = 0.92;
      base.torsoScaleX = 1.08;
    } else if (this.animState === ANIM_STATES.BLOCK) {
      base.armLeft -= 12;
      base.armRight += 12;
      base.armLift = -9;
      base.headY = -60;
      base.torsoScaleY = 0.95;
    } else if (this.animState === ANIM_STATES.LAND) {
      base.torsoScaleY = 1.13;
      base.torsoScaleX = 0.9;
      base.kneeBend = 5;
      base.bob = 2;
    } else if (this.animState === ANIM_STATES.WIN) {
      base.armLeft = -13;
      base.armRight = 13;
      base.armLift = -11;
      base.bob = Math.sin(t * 1.6) * 2;
      base.headY = -61;
    } else if (this.animState === ANIM_STATES.LOSE) {
      base.armLeft = -3;
      base.armRight = 3;
      base.armLift = 6;
      base.lean += 3;
      base.headY = -54;
      base.torsoScaleY = 1.04;
    } else if (this.animState === ANIM_STATES.SPECIAL) {
      base.armLeft = -9;
      base.armRight = 10;
      base.armLift = -13;
      base.torsoScaleY = 0.9;
      base.torsoScaleX = 1.08;
      base.headY = -62;
      base.bob = -1;
    }

    return base;
  }

  draw(ctx) {
    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const v = this.character.visuals;
    const pose = this.getPose();

    ctx.save();
    ctx.translate(x, y + pose.bob);
    ctx.scale(this.facing, 1);

    if (this.landingPulse > 0) {
      ctx.fillStyle = 'rgba(230, 247, 255, 0.4)';
      ctx.fillRect(-30, 4, 60, 6);
    }

    if (this.specialTimer > 0) {
      ctx.strokeStyle = this.character.fxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(-31, -87, 62, 83);
    }

    ctx.translate(pose.lean, 0);
    ctx.scale(pose.torsoScaleX, pose.torsoScaleY);

    const outline = v.outline;
    const px = (x0, y0, w, h, color) => {
      ctx.fillStyle = outline;
      ctx.fillRect(x0 - 1, y0 - 1, w + 2, h + 2);
      ctx.fillStyle = color;
      ctx.fillRect(x0, y0, w, h);
    };

    px(-11 + v.stance.legSpread, -17 + pose.kneeBend, 10, 15, v.legs);
    px(2 + v.stance.legSpread, -17 + pose.kneeBend, 10, 15, v.legs);
    px(-11 + v.stance.legSpread, -4 + pose.kneeBend, 10, 6, v.shoes);
    px(2 + v.stance.legSpread, -4 + pose.kneeBend, 10, 6, v.shoes);

    px(-16, -58, 32, 43, v.torso);
    px(-21 + pose.armLeft, -52 + pose.armLift, 9, 25, v.shoulder);
    px(12 + pose.armRight, -52 + pose.armLift, 9, 25, v.shoulder);
    px(-21 + pose.armLeft, -31 + pose.armLift, 9, 8, v.gloves);
    px(12 + pose.armRight, -31 + pose.armLift, 9, 8, v.gloves);

    px(-13, pose.headY, 26, 20, v.skin);
    px(-15, pose.headY - 8, 30, 8, v.hair);
    px(-8, pose.headY - 11, 16, 4, v.headgear);
    px(-3, -44, 6, 12, v.band);

    ctx.fillStyle = outline;
    ctx.fillRect(-7, pose.headY + 6, 3, 3);
    ctx.fillRect(4, pose.headY + 6, 3, 3);

    ctx.fillStyle = v.band;
    ctx.font = 'bold 9px Inter';
    ctx.fillText(v.emblem, -4, -34);

    ctx.restore();
  }
}
