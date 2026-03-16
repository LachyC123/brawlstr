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
    const tempo = visuals.poseTempo || 1;
    const t = performance.now() * 0.0062 * tempo + this.x * 0.01;
    const stride = Math.sin(t);
    const stance = visuals.stance || {};

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
      lean: stance.lean || 0,
      squash: 1,
      bob: Math.sin(t * (0.52 + tempo * 0.08)) * (1.1 + (stance.bobAmp || 0)),
    };

    if (this.animState === ANIM_STATES.MOVE) {
      base.armLeft -= 6 + stride * 6;
      base.armRight += 6 + stride * -6;
      base.legLeft += stride * 4;
      base.legRight += stride * -4;
      base.kneeBend = Math.abs(stride) * (2 + (stance.kneeBias || 0));
      base.bob += Math.abs(stride) * (1.1 + (stance.bobAmp || 0));
    } else if (this.animState === ANIM_STATES.JUMP_RISE) {
      base.armLift = -15;
      base.headY = -62;
      base.torsoScaleY = 0.95;
      base.torsoScaleX = 1.06;
      base.bob = -2.6 - (stance.jumpLift || 0);
    } else if (this.animState === ANIM_STATES.JUMP_FALL) {
      base.armLift = -6;
      base.kneeBend = 4;
      base.torsoScaleY = 1.05;
      base.torsoScaleX = 0.96;
      base.bob = 1.4;
    } else if (this.animState === ANIM_STATES.SPIKE) {
      base.armLeft -= 4;
      base.armRight += 16 + (stance.spikeReach || 0);
      base.armLift = -24 - (stance.spikeReach || 0) * 0.5;
      base.lean -= 9;
      base.headY = -63;
      base.torsoScaleY = 0.88;
      base.torsoScaleX = 1.12;
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
      ctx.fillStyle = 'rgba(230, 247, 255, 0.35)';
      ctx.fillRect(-30, 4, 60, 6);
      ctx.fillStyle = 'rgba(185, 225, 255, 0.28)';
      ctx.fillRect(-24, 10, 48, 3);
    }

    if (this.specialTimer > 0) {
      ctx.strokeStyle = this.character.fxColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(-31, -87, 62, 83);
      ctx.fillStyle = `${this.character.fxColor}33`;
      ctx.fillRect(-30, -86, 60, 81);

      const pulse = (Math.sin(performance.now() * 0.02) * 0.5 + 0.5) * 0.45;
      ctx.fillStyle = `rgba(255,255,255,${pulse})`;
      ctx.fillRect(-28, -82, 56, 8);
    }

    if (this.specialReady && this.specialTimer <= 0) {
      ctx.strokeStyle = 'rgba(255,223,147,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(-33, -92, 66, 88);
      ctx.fillStyle = 'rgba(255, 219, 120, 0.12)';
      ctx.fillRect(-32, -91, 64, 86);
    }

    ctx.translate(pose.lean, 0);
    ctx.scale(pose.torsoScaleX, pose.torsoScaleY);

    const outline = v.outline;
    const stance = v.stance || {};
    const torsoWidth = 32 + (stance.bulk || 0);
    const shoulderLift = stance.shoulderLift || 0;
    const headWidth = 26 + (stance.headSize || 0);
    const px = (x0, y0, w, h, color) => {
      ctx.fillStyle = outline;
      ctx.fillRect(x0 - 1, y0 - 1, w + 2, h + 2);
      ctx.fillStyle = color;
      ctx.fillRect(x0, y0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.fillRect(x0, y0, w, Math.max(1, Math.floor(h * 0.2)));
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x0, y0 + Math.floor(h * 0.68), w, Math.max(1, Math.floor(h * 0.3)));
    };

    px(-11 + v.stance.legSpread, -17 + pose.kneeBend, 10, 15, v.legs);
    px(2 + v.stance.legSpread, -17 + pose.kneeBend, 10, 15, v.legs);
    px(-11 + v.stance.legSpread, -4 + pose.kneeBend, 10, 6, v.shoes);
    px(2 + v.stance.legSpread, -4 + pose.kneeBend, 10, 6, v.shoes);

    px(-Math.floor(torsoWidth / 2), -58, torsoWidth, 43, v.torso);
    px(-21 + pose.armLeft, -52 + pose.armLift + shoulderLift, 9, 25, v.shoulder);
    px(12 + pose.armRight, -52 + pose.armLift + shoulderLift, 9, 25, v.shoulder);
    px(-21 + pose.armLeft, -31 + pose.armLift + shoulderLift, 9, 8, v.gloves);
    px(12 + pose.armRight, -31 + pose.armLift + shoulderLift, 9, 8, v.gloves);

    px(-Math.floor(headWidth / 2), pose.headY, headWidth, 20, v.skin);
    px(-15, pose.headY - 8, 30, 8, v.hair);
    px(-8, pose.headY - 11, 16, 4, v.headgear);
    px(-3, -44, 6, 12, v.band);
    px(-14, -52, 4, 14, v.band);
    px(10, -52, 4, 14, v.band);

    ctx.fillStyle = outline;
    ctx.fillRect(-7, pose.headY + 6, 3, 3);
    ctx.fillRect(4, pose.headY + 6, 3, 3);

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-10, pose.headY + 2, 20, 2);
    ctx.fillRect(-14, -56, 28, 3);

    ctx.fillStyle = v.band;
    ctx.font = 'bold 9px Inter';
    ctx.fillText(v.emblem, -4, -34);

    if (this.animState === ANIM_STATES.WIN) {
      ctx.fillStyle = 'rgba(255, 232, 142, 0.4)';
      ctx.fillRect(-24, -86, 48, 4);
    }

    ctx.restore();
  }
}
