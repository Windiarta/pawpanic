import { W, H, GRAVITY, MOVE_SPEED, JUMP_FORCE, PLAYER_W, PLAYER_H } from './config.js';
import { playSFX } from './audio.js';
import { networkSend, isNetworkConnected } from './network.js';

export function rectOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function getSolidObstacles(walls, movers) {
  return [...walls, ...movers];
}

export function createPlayer(idx, x, y) {
  return {
    idx,
    label: idx === 0 ? '1P' : '2P',
    color: idx === 0 ? '#FF7A29' : '#2EC4B6',
    darkColor: idx === 0 ? '#C84B00' : '#177E73',
    x,
    y,
    targetX: x,
    targetY: y,
    vx: 0,
    vy: 0,
    w: PLAYER_W,
    h: PLAYER_H,
    onGround: false,
    standingOnPlayer: null,
    facing: 1,
    walkFrame: 0,
    pushingBlock: false,
    sweating: false,
    inDoor: false,
    emoteText: '',
    emoteTimer: 0
  };
}

export function updatePhysicsEngine({
  state,
  inputs,
  netMode,
  spawnDust,
  spawnConfetti,
  onResetLevel,
  onAdvanceLevel
}) {
  const { players, walls, blocks, buttons, movers, tetherConfig, keyItem, door } = state;

  if (netMode === 'client') {
    // 1. Smooth LERP interpolation from host state (no rubberbanding)
    players.forEach((p) => {
      if (typeof p.targetX === 'number') {
        const dist = Math.hypot(p.targetX - p.x, p.targetY - p.y);
        const factor = dist > 40 ? 0.75 : 0.55;
        p.x += (p.targetX - p.x) * factor;
        p.y += (p.targetY - p.y) * factor;
      }
    });
    blocks.forEach(b => {
      if (typeof b.targetX === 'number') {
        b.x += (b.targetX - b.x) * 0.55;
        b.y += (b.targetY - b.y) * 0.55;
      }
    });
    movers.forEach(m => {
      if (typeof m.targetX === 'number') {
        m.x += (m.targetX - m.x) * 0.55;
        m.y += (m.targetY - m.y) * 0.55;
      }
    });
    if (keyItem && typeof keyItem.targetX === 'number') {
      keyItem.x += (keyItem.targetX - keyItem.x) * 0.5;
      keyItem.y += (keyItem.targetY - keyItem.y) * 0.5;
    }

    // 2. Responsive visual animation for Player 2 without modifying coordinates
    const inp = inputs[1];
    const p2 = players[1];
    if (p2 && !p2.inDoor) {
      if (inp.left && !inp.right) {
        p2.facing = -1;
        p2.walkFrame += 0.25;
      } else if (inp.right && !inp.left) {
        p2.facing = 1;
        p2.walkFrame += 0.25;
      } else {
        p2.walkFrame = 0;
      }
    }
    return;
  }

  // Host & Local Physics
  if (state.levelClearTimer > 0) {
    state.levelClearTimer++;
    if (state.levelClearTimer === 95) {
      onAdvanceLevel();
    }
    return;
  }

  // 1. UPDATE BUTTONS & MOVERS
  const syncButtons = buttons.filter(b => b.mode === 'sync');
  let allSyncPressed = syncButtons.length > 0;

  buttons.forEach(btn => {
    const triggerZone = { x: btn.x + 2, y: btn.y - 6, w: btn.w - 4, h: btn.h + 6 };
    let isDown = false;
    players.forEach(p => {
      if (!p.inDoor && rectOverlap(p, triggerZone)) isDown = true;
    });
    blocks.forEach(bl => {
      if (rectOverlap(bl, triggerZone)) isDown = true;
    });

    if (isDown && !btn.pressed) {
      playSFX('button');
      if (netMode === 'host' && isNetworkConnected()) networkSend({ type: 'sfx', sfx: 'button' });
    }
    btn.pressed = isDown;

    if (btn.mode === 'toggle' && isDown) {
      btn.toggled = true;
    }
    if (btn.mode === 'sync' && !isDown) {
      allSyncPressed = false;
    }
  });

  if (allSyncPressed && syncButtons.length > 0) {
    syncButtons.forEach(b => { b.toggled = true; });
  }

  movers.forEach(m => {
    let shouldActivate = false;
    buttons.forEach(b => {
      if (b.targetId === m.id || m.alsoBy === b.id) {
        if (b.mode === 'hold' && b.pressed) shouldActivate = true;
        if ((b.mode === 'toggle' || b.mode === 'sync') && b.toggled) shouldActivate = true;
      }
    });
    m.active = shouldActivate;
    const prevX = m.x;
    const prevY = m.y;

    let targetX = m.active ? m.activeX : m.idleX;
    let targetY = m.active ? m.activeY : m.idleY;

    if (m.oscillate && m.active) {
      targetY = m.oscDir === 1 ? m.activeY : m.idleY;
      if (Math.abs(m.y - targetY) < 2) {
        m.oscDir *= -1;
      }
    }

    const speed = m.oscillate ? 2.2 : 3.2;
    const diffX = targetX - m.x;
    const diffY = targetY - m.y;
    m.x += Math.abs(diffX) <= speed ? diffX : Math.sign(diffX) * speed;
    m.y += Math.abs(diffY) <= speed ? diffY : Math.sign(diffY) * speed;
    m.dx = m.x - prevX;
    m.dy = m.y - prevY;

    // Carry players standing on top of mover
    players.forEach(p => {
      if (p.inDoor) return;
      const onTop =
        p.x + p.w > m.x &&
        p.x < m.x + m.w &&
        Math.abs((p.y + p.h) - prevY) <= 7;
      if (onTop) {
        p.x += m.dx;
        p.y += m.dy;
      }
    });
  });

  // 2. PLAYER INPUT & HORIZONTAL VELOCITY
  players.forEach((p, idx) => {
    if (p.inDoor) return;
    const inp = inputs[idx];
    p.pushingBlock = false;
    p.sweating = false;

    if (inp.left && !inp.right) {
      p.vx = -MOVE_SPEED;
      p.facing = -1;
      p.walkFrame += 0.22;
    } else if (inp.right && !inp.left) {
      p.vx = MOVE_SPEED;
      p.facing = 1;
      p.walkFrame += 0.22;
    } else {
      p.vx *= 0.65;
      if (Math.abs(p.vx) < 0.1) p.vx = 0;
      p.walkFrame = 0;
    }

    if (inp.jumpPressed && p.onGround) {
      p.vy = JUMP_FORCE;
      p.onGround = false;
      p.standingOnPlayer = null;
      spawnDust(p.x + p.w / 2, p.y + p.h, 8);
      playSFX('jump');
      if (netMode === 'host' && isNetworkConnected()) networkSend({ type: 'sfx', sfx: 'jump' });
    }

    p.vy = Math.min(p.vy + GRAVITY, 12.5);
    if (p.emoteTimer > 0) p.emoteTimer--;
  });

  // 3. TETHER ROPE CONSTRAINT (Level 4)
  if (tetherConfig.active && !players[0].inDoor && !players[1].inDoor) {
    const p1 = players[0];
    const p2 = players[1];
    const cx1 = p1.x + p1.w / 2;
    const cy1 = p1.y + p1.h / 2;
    const cx2 = p2.x + p2.w / 2;
    const cy2 = p2.y + p2.h / 2;
    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const dist = Math.hypot(dx, dy);
    if (dist > tetherConfig.length) {
      const pull = (dist - tetherConfig.length) * 0.045;
      const nx = dx / dist;
      const ny = dy / dist;
      p1.vx += nx * pull;
      p1.vy += ny * pull;
      p2.vx -= nx * pull;
      p2.vy -= ny * pull;
    }
  }

  // 4. CO-OP BLOCK PUSHING & BLOCK PHYSICS
  const solids = getSolidObstacles(walls, movers);

  blocks.forEach(bl => {
    bl.pushersRight = 0;
    bl.pushersLeft = 0;

    players.forEach((p, idx) => {
      if (p.inDoor) return;
      const other = players[1 - idx];
      const vOverlap = p.y + p.h > bl.y + 4 && p.y < bl.y + bl.h - 4;

      if (vOverlap && p.vx > 0.5 && Math.abs((p.x + p.w) - bl.x) <= 10) {
        bl.pushersRight++;
        p.pushingBlock = true;
        const behindPush = !other.inDoor && other.vx > 0.5 && Math.abs((other.x + other.w) - p.x) <= 12 && Math.abs(other.y - p.y) < 35;
        const stackedPush = !other.inDoor && other.standingOnPlayer === p.idx && other.vx > 0.5;
        if (behindPush || stackedPush) {
          bl.pushersRight++;
          other.pushingBlock = true;
        }
      }

      if (vOverlap && p.vx < -0.5 && Math.abs(p.x - (bl.x + bl.w)) <= 10) {
        bl.pushersLeft++;
        p.pushingBlock = true;
        const behindPush = !other.inDoor && other.vx < -0.5 && Math.abs(other.x - (p.x + p.w)) <= 12 && Math.abs(other.y - p.y) < 35;
        const stackedPush = !other.inDoor && other.standingOnPlayer === p.idx && other.vx < -0.5;
        if (behindPush || stackedPush) {
          bl.pushersLeft++;
          other.pushingBlock = true;
        }
      }
    });

    bl.pushersRight = Math.min(2, bl.pushersRight);
    bl.pushersLeft = Math.min(2, bl.pushersLeft);

    if (bl.pushersRight >= bl.req) {
      bl.vx = 2.3;
    } else if (bl.pushersLeft >= bl.req) {
      bl.vx = -2.3;
    } else {
      bl.vx = 0;
      if (bl.pushersRight > 0 || bl.pushersLeft > 0) {
        players.forEach(p => { if (p.pushingBlock) p.sweating = true; });
      }
    }

    bl.x += bl.vx;
    solids.forEach(s => {
      if (rectOverlap(bl, s)) {
        if (bl.vx > 0) bl.x = s.x - bl.w;
        else if (bl.vx < 0) bl.x = s.x + s.w;
        bl.vx = 0;
      }
    });

    bl.vy = Math.min(bl.vy + GRAVITY, 12);
    bl.y += bl.vy;
    solids.forEach(s => {
      if (rectOverlap(bl, s)) {
        if (bl.vy > 0) {
          bl.y = s.y - bl.h;
          bl.vy = 0;
        } else if (bl.vy < 0) {
          bl.y = s.y + s.h;
          bl.vy = 0;
        }
      }
    });
  });

  // 5. MOVE PLAYERS & COLLISION
  const allStaticAndBlocks = [...solids, ...blocks];
  const dxMoved = [0, 0];

  players.forEach((p, idx) => {
    if (p.inDoor) return;
    const startX = p.x;
    p.x += p.vx;

    allStaticAndBlocks.forEach(s => {
      if (rectOverlap(p, s)) {
        if (p.vx > 0) p.x = s.x - p.w;
        else if (p.vx < 0) p.x = s.x + s.w;
      }
    });

    const other = players[1 - idx];
    if (!other.inDoor && rectOverlap(p, other)) {
      const verticalOverlap = Math.min(p.y + p.h, other.y + other.h) - Math.max(p.y, other.y);
      if (verticalOverlap > 10) {
        if (p.x < other.x) p.x = other.x - p.w;
        else p.x = other.x + other.w;
      }
    }

    dxMoved[idx] = p.x - startX;
  });

  // Carry head-riding partner horizontally
  players.forEach((p) => {
    if (p.inDoor) return;
    if (p.standingOnPlayer !== null) {
      const carrierIdx = p.standingOnPlayer;
      const carryDx = dxMoved[carrierIdx];
      if (carryDx !== 0) {
        p.x += carryDx;
        allStaticAndBlocks.forEach(s => {
          if (rectOverlap(p, s)) {
            if (carryDx > 0) p.x = s.x - p.w;
            else if (carryDx < 0) p.x = s.x + s.w;
          }
        });
      }
    }
  });

  // Vertical movement & Head-Stacking
  players.forEach((p, idx) => {
    if (p.inDoor) return;
    p.y += p.vy;
    p.onGround = false;
    p.standingOnPlayer = null;

    allStaticAndBlocks.forEach(s => {
      if (rectOverlap(p, s)) {
        if (p.vy > 0) {
          p.y = s.y - p.h;
          p.vy = 0;
          p.onGround = true;
        } else if (p.vy < 0) {
          p.y = s.y + s.h;
          p.vy = 0;
        }
      }
    });

    const other = players[1 - idx];
    if (!other.inDoor && rectOverlap(p, other)) {
      if (p.vy >= 0 && (p.y + p.h - p.vy) <= other.y + 12) {
        p.y = other.y - p.h;
        p.vy = other.vy;
        p.onGround = true;
        p.standingOnPlayer = other.idx;
      } else if (p.vy < 0 && p.y >= other.y + other.h - 14) {
        p.y = other.y + other.h;
        p.vy = 0;
      }
    }

    if (p.y > H + 40) {
      playSFX('dead');
      if (netMode === 'host' && isNetworkConnected()) networkSend({ type: 'sfx', sfx: 'dead' });
      onResetLevel();
    }
  });

  // 6. KEY & DOOR LOGIC
  keyItem.floatTick += 0.08;
  if (keyItem.carrierIdx === -1 && !keyItem.used) {
    keyItem.y = keyItem.baseY + Math.sin(keyItem.floatTick) * 5;
    const keyBox = { x: keyItem.x - 14, y: keyItem.y - 14, w: 28, h: 28 };
    players.forEach(p => {
      if (!p.inDoor && rectOverlap(p, keyBox)) {
        keyItem.carrierIdx = p.idx;
        playSFX('key');
        if (netMode === 'host' && isNetworkConnected()) networkSend({ type: 'sfx', sfx: 'key' });
        spawnConfetti(keyItem.x, keyItem.y, 14);
      }
    });
  } else if (keyItem.carrierIdx !== -1 && !keyItem.used) {
    const carrier = players[keyItem.carrierIdx];
    const targetX = carrier.x + carrier.w / 2 - carrier.facing * 30;
    const targetY = carrier.y + 10 + Math.sin(keyItem.floatTick) * 3;
    keyItem.x += (targetX - keyItem.x) * 0.22;
    keyItem.y += (targetY - keyItem.y) * 0.22;
  }

  // Door unlock
  players.forEach(p => {
    if (p.inDoor) return;
    if (rectOverlap(p, door)) {
      if (!door.unlocked && keyItem.carrierIdx === p.idx) {
        door.unlocked = true;
        keyItem.used = true;
        playSFX('unlock');
        if (netMode === 'host' && isNetworkConnected()) networkSend({ type: 'sfx', sfx: 'unlock' });
        spawnConfetti(door.x + door.w / 2, door.y + door.h / 2, 24);
      }
      if (door.unlocked && p.onGround) {
        p.inDoor = true;
        spawnConfetti(p.x + p.w / 2, p.y + p.h / 2, 16);
      }
    }
  });

  if (door.unlocked && door.openProgress < 1) {
    door.openProgress = Math.min(1, door.openProgress + 0.08);
  }

  if (players[0].inDoor && players[1].inDoor && state.levelClearTimer === 0) {
    state.levelClearTimer = 1;
    playSFX('win');
    if (netMode === 'host' && isNetworkConnected()) networkSend({ type: 'sfx', sfx: 'win' });
    spawnConfetti(door.x + 25, door.y + 20, 45);
  }
}
