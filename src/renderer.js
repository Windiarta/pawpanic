import { W, H } from './config.js';

export function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

export function renderGame(ctx, state, currentLvl) {
  const { players, walls, blocks, buttons, movers, tetherConfig, keyItem, door, particles, levelClearTimer, allGameWon } = state;

  ctx.clearRect(0, 0, W, H);

  // 1. SOFT AMBIENT BACKGROUND
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2 - 30, 90, W / 2, H / 2, 620);
  bgGrad.addColorStop(0, '#FFFDF8');
  bgGrad.addColorStop(1, '#F3EFE0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle clean dot grid
  ctx.fillStyle = 'rgba(41, 50, 65, 0.055)';
  for (let gx = 24; gx < W; gx += 32) {
    for (let gy = 24; gy < H; gy += 32) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft Vignette border
  ctx.strokeStyle = 'rgba(41, 50, 65, 0.04)';
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Level Banner Text
  ctx.save();
  ctx.fillStyle = 'rgba(41, 50, 65, 0.9)';
  ctx.font = '900 19px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(currentLvl.name, 44, 48);
  ctx.fillStyle = '#64748B';
  ctx.font = '700 13px "Segoe UI", sans-serif';
  ctx.fillText(currentLvl.subtitle, 44, 69);
  ctx.restore();

  // 2. MOVER GUIDE RAILS
  movers.forEach(m => {
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(m.idleX + m.w / 2, m.idleY + m.h / 2);
    ctx.lineTo(m.activeX + m.w / 2, m.activeY + m.h / 2);
    ctx.stroke();
    ctx.restore();
  });

  // 3. DRAW GOAL DOOR
  ctx.save();
  ctx.fillStyle = 'rgba(41, 50, 65, 0.14)';
  ctx.beginPath();
  ctx.ellipse(door.x + door.w / 2, door.y + door.h + 2, door.w / 2 + 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#293241';
  drawRoundedRect(ctx, door.x - 5, door.y - 7, door.w + 10, door.h + 9, 12);
  ctx.fill();

  ctx.fillStyle = '#475569';
  drawRoundedRect(ctx, door.x - 2, door.y - 4, door.w + 4, door.h + 5, 9);
  ctx.fill();

  const doorLight = ctx.createLinearGradient(door.x, door.y, door.x, door.y + door.h);
  if (door.unlocked) {
    doorLight.addColorStop(0, '#FEF08A');
    doorLight.addColorStop(0.5, '#FDE047');
    doorLight.addColorStop(1, '#CA8A04');
  } else {
    doorLight.addColorStop(0, '#334155');
    doorLight.addColorStop(1, '#1E293B');
  }
  ctx.fillStyle = doorLight;
  drawRoundedRect(ctx, door.x, door.y, door.w, door.h, 7);
  ctx.fill();

  const slideW = door.w * (1 - door.openProgress * 0.9);
  if (slideW > 1) {
    const doorSlabGrad = ctx.createLinearGradient(door.x, door.y, door.x + slideW, door.y);
    doorSlabGrad.addColorStop(0, door.unlocked ? '#10B981' : '#64748B');
    doorSlabGrad.addColorStop(1, door.unlocked ? '#059669' : '#475569');
    ctx.fillStyle = doorSlabGrad;
    drawRoundedRect(ctx, door.x, door.y, slideW, door.h, 6);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(door.x + 6, door.y + 8, Math.max(0, slideW - 12), door.h - 16);
  }

  const badgeY = door.y - 14;
  ctx.fillStyle = door.unlocked ? '#10B981' : '#293241';
  drawRoundedRect(ctx, door.x + door.w / 2 - 34, badgeY - 10, 68, 20, 6);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(door.unlocked ? 'ENTER! ➔' : '🔒 LOCKED', door.x + door.w / 2, badgeY + 4);
  ctx.restore();

  // 4. DRAW WALLS & GROUND PLATFORMS
  walls.forEach(w => {
    ctx.save();
    ctx.fillStyle = 'rgba(41, 50, 65, 0.12)';
    ctx.fillRect(w.x + 2, w.y + w.h, w.w - 4, 5);

    const wallGrad = ctx.createLinearGradient(w.x, w.y, w.x, w.y + w.h);
    wallGrad.addColorStop(0, '#FF7A59');
    wallGrad.addColorStop(1, '#E25B3A');
    ctx.fillStyle = wallGrad;
    drawRoundedRect(ctx, w.x, w.y, w.w, w.h, 6);
    ctx.fill();

    ctx.fillStyle = '#FFA187';
    ctx.fillRect(w.x + 2, w.y + 2, w.w - 4, 4);

    ctx.strokeStyle = 'rgba(41, 50, 65, 0.2)';
    ctx.lineWidth = 1.5;
    for (let bx = w.x + 36; bx < w.x + w.w - 10; bx += 36) {
      ctx.beginPath();
      ctx.moveTo(bx, w.y + 6);
      ctx.lineTo(bx, w.y + w.h - 4);
      ctx.stroke();
    }

    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, w.x, w.y, w.w, w.h, 6);
    ctx.stroke();
    ctx.restore();
  });

  // 5. DRAW MOVERS
  movers.forEach(m => {
    ctx.save();
    ctx.fillStyle = 'rgba(41, 50, 65, 0.16)';
    ctx.fillRect(m.x + 2, m.y + m.h, m.w - 4, 4);

    ctx.fillStyle = m.color || '#8B5CF6';
    drawRoundedRect(ctx, m.x, m.y, m.w, m.h, 6);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    drawRoundedRect(ctx, m.x, m.y, m.w, m.h, 6);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 5;
    for (let sx = -20; sx < m.w + 20; sx += 14) {
      ctx.beginPath();
      ctx.moveTo(m.x + sx, m.y);
      ctx.lineTo(m.x + sx + 10, m.y + m.h);
      ctx.stroke();
    }
    ctx.restore();

    const ledColor = m.active ? '#10B981' : '#F59E0B';
    ctx.fillStyle = ledColor;
    ctx.beginPath();
    ctx.arc(m.x + 8, m.y + m.h / 2, 3.5, 0, Math.PI * 2);
    ctx.arc(m.x + m.w - 8, m.y + m.h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, m.x, m.y, m.w, m.h, 6);
    ctx.stroke();
    ctx.restore();
  });

  // 6. DRAW BUTTONS
  buttons.forEach(b => {
    ctx.save();
    const isAct = b.pressed || b.toggled;
    const bh = isAct ? 6 : b.h;
    const by = b.y + (b.h - bh);

    ctx.fillStyle = '#1E293B';
    drawRoundedRect(ctx, b.x - 5, b.y + b.h - 4, b.w + 10, 6, 3);
    ctx.fill();

    ctx.fillStyle = '#64748B';
    ctx.fillRect(b.x + 4, by + 4, b.w - 8, Math.max(0, b.y + b.h - by - 4));

    const capGrad = ctx.createLinearGradient(b.x, by, b.x, by + bh);
    capGrad.addColorStop(0, b.color);
    capGrad.addColorStop(1, '#D97706');
    ctx.fillStyle = capGrad;
    drawRoundedRect(ctx, b.x, by, b.w, bh, 5);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(b.x + 4, by + 2, b.w - 8, Math.max(1, bh * 0.4));

    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, b.x, by, b.w, bh, 5);
    ctx.stroke();

    if (isAct) {
      ctx.fillStyle = b.color + '33';
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, by + bh / 2, b.w * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // 7. DRAW HEAVY PUSH BLOCKS
  blocks.forEach(bl => {
    ctx.save();
    ctx.fillStyle = 'rgba(41, 50, 65, 0.16)';
    ctx.beginPath();
    ctx.ellipse(bl.x + bl.w / 2, bl.y + bl.h + 3, bl.w / 2 - 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const blGrad = ctx.createLinearGradient(bl.x, bl.y, bl.x, bl.y + bl.h);
    blGrad.addColorStop(0, '#FFE082');
    blGrad.addColorStop(1, '#FFCA28');
    ctx.fillStyle = blGrad;
    drawRoundedRect(ctx, bl.x, bl.y, bl.w, bl.h, 10);
    ctx.fill();

    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(bl.x + 4, bl.y + 3, bl.w - 8, 5);

    ctx.fillStyle = '#FFB300';
    drawRoundedRect(ctx, bl.x + 8, bl.y + 8, bl.w - 16, bl.h - 16, 6);
    ctx.fill();

    ctx.fillStyle = '#293241';
    const corners = [
      [bl.x + 13, bl.y + 13],
      [bl.x + bl.w - 13, bl.y + 13],
      [bl.x + 13, bl.y + bl.h - 13],
      [bl.x + bl.w - 13, bl.y + bl.h - 13]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    const curPush = Math.max(bl.pushersLeft || 0, bl.pushersRight || 0);
    const remaining = Math.max(0, bl.req - curPush);
    const isMoving = remaining === 0;

    ctx.fillStyle = isMoving ? '#10B981' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(bl.x + bl.w / 2, bl.y + bl.h / 2 - 3, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = isMoving ? '#FFFFFF' : '#293241';
    ctx.font = '900 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isMoving ? '✓' : String(remaining), bl.x + bl.w / 2, bl.y + bl.h / 2 - 2);

    ctx.font = '900 10px "Segoe UI", sans-serif';
    ctx.fillStyle = '#293241';
    ctx.fillText('PUSH', bl.x + bl.w / 2, bl.y + bl.h - 11);
    ctx.textBaseline = 'alphabetic';

    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, bl.x, bl.y, bl.w, bl.h, 10);
    ctx.stroke();
    ctx.restore();
  });

  // 8. DRAW TETHER ROPE
  if (tetherConfig.active && !players[0].inDoor && !players[1].inDoor) {
    const p1 = players[0];
    const p2 = players[1];
    const x1 = p1.x + p1.w / 2;
    const y1 = p1.y + p1.h / 2;
    const x2 = p2.x + p2.w / 2;
    const y2 = p2.y + p2.h / 2;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const slack = Math.max(0, (tetherConfig.length - dist) * 0.28);
    const nearLimit = dist > tetherConfig.length * 0.92;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1 + 5);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + slack + 5, x2, y2 + 5);
    ctx.strokeStyle = 'rgba(41, 50, 65, 0.15)';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + slack, x2, y2);
    ctx.strokeStyle = nearLimit ? '#EF4444' : '#293241';
    ctx.lineWidth = 4.5;
    ctx.setLineDash([7, 4]);
    ctx.stroke();
    ctx.restore();
  }

  // 9. DRAW FLOATING KEY
  if (!keyItem.used) {
    ctx.save();
    ctx.translate(keyItem.x, keyItem.y);

    const halo = ctx.createRadialGradient(0, 0, 4, 0, 0, 22);
    halo.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
    halo.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(41, 50, 65, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 24, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const keyGrad = ctx.createLinearGradient(-10, -10, 10, 10);
    keyGrad.addColorStop(0, '#FDE047');
    keyGrad.addColorStop(1, '#D97706');
    ctx.fillStyle = keyGrad;
    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(-6, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(-6, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = keyGrad;
    ctx.fillRect(2, -3.5, 15, 7);
    ctx.strokeRect(2, -3.5, 15, 7);
    ctx.fillRect(11, 3.5, 5, 5);
    ctx.strokeRect(11, 3.5, 5, 5);

    const spX = Math.cos(keyItem.floatTick * 2) * 16;
    const spY = Math.sin(keyItem.floatTick * 2) * 14;
    drawStar(ctx, spX, spY, 4, 4.5, 1.8, '#FEF08A');
    ctx.restore();
  }

  // 10. DRAW CHARACTERS
  players.forEach(p => {
    if (p.inDoor) return;
    drawSingleCat(ctx, p, true);
  });

  // 11. PARTICLES
  particles.forEach(pt => {
    ctx.save();
    ctx.translate(pt.x, pt.y);
    const alpha = Math.max(0, pt.life / pt.maxLife);
    ctx.globalAlpha = alpha;

    if (pt.shape === 'star') {
      drawStar(ctx, 0, 0, 4, pt.size, pt.size * 0.45, pt.color);
    } else if (pt.shape === 'circle') {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(0, 0, pt.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.rotate(pt.rot);
      ctx.fillStyle = pt.color;
      const scaleX = Math.cos(pt.rot * 1.5);
      ctx.scale(scaleX, 1);
      ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 0.65);
    }
    ctx.restore();
  });

  // 12. LEVEL CLEAR / VICTORY BANNER
  if (levelClearTimer > 0 && !allGameWon) {
    ctx.fillStyle = 'rgba(41, 50, 65, 0.6)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, W / 2 - 220, H / 2 - 75, 440, 150, 20);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#293241';
    drawRoundedRect(ctx, W / 2 - 220, H / 2 - 75, 440, 150, 20);
    ctx.stroke();

    ctx.fillStyle = '#10B981';
    ctx.font = '900 34px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STAGE CLEAR! 🎉', W / 2, H / 2 - 12);

    ctx.fillStyle = '#475569';
    ctx.font = '800 15px "Segoe UI", sans-serif';
    ctx.fillText('Great teamwork! Preparing next stage...', W / 2, H / 2 + 28);
    ctx.restore();
  }

  if (allGameWon) {
    ctx.fillStyle = 'rgba(41, 50, 65, 0.75)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.fillStyle = '#FFFDF7';
    drawRoundedRect(ctx, W / 2 - 250, H / 2 - 100, 500, 200, 22);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#293241';
    drawRoundedRect(ctx, W / 2 - 250, H / 2 - 100, 500, 200, 22);
    ctx.stroke();

    ctx.fillStyle = '#FF7A29';
    ctx.font = '900 32px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👑 VICTORY! YOU WIN! 👑', W / 2, H / 2 - 32);

    ctx.fillStyle = '#293241';
    ctx.font = '700 16px "Segoe UI", sans-serif';
    ctx.fillText('All PAW PANIC! Co-Op Levels Completed!', W / 2, H / 2 + 10);

    ctx.fillStyle = '#64748B';
    ctx.font = '700 14px "Segoe UI", sans-serif';
    ctx.fillText('Press [R] or select a level above to play again.', W / 2, H / 2 + 48);
    ctx.restore();
  }
}

export function drawAccessory(ctx, p) {
  const hat = p.hat || p.accessoryId || 'none';
  if (hat === 'none') return;

  const cx = p.x + p.w / 2 + p.facing * 2;
  const topY = p.y;

  ctx.save();
  ctx.strokeStyle = '#293241';
  ctx.lineWidth = 2.5;

  if (hat === 'crown') {
    const crownW = 22;
    const crownH = 14;
    const baseLeft = cx - crownW / 2;
    const baseRight = cx + crownW / 2;
    const baseY = topY + 2;

    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(baseLeft, baseY);
    ctx.lineTo(baseLeft - 2, baseY - crownH * 0.8);
    ctx.lineTo(cx - 4, baseY - crownH * 0.45);
    ctx.lineTo(cx, baseY - crownH);
    ctx.lineTo(cx + 4, baseY - crownH * 0.45);
    ctx.lineTo(baseRight + 2, baseY - crownH * 0.8);
    ctx.lineTo(baseRight, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    [baseLeft - 2, cx, baseRight + 2].forEach((jx, idx) => {
      const jy = idx === 1 ? baseY - crownH : baseY - crownH * 0.8;
      ctx.beginPath();
      ctx.arc(jx, jy, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (hat === 'cap') {
    const capW = 24;
    const baseY = topY + 3;

    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(cx, baseY, capW / 2, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const visorX = cx + (p.facing > 0 ? 3 : -17);
    const visorW = 15;
    ctx.fillStyle = '#991B1B';
    drawRoundedRect(ctx, visorX, baseY - 2, visorW, 4.5, 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, baseY - capW / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === 'bow') {
    const bx = cx + (p.facing > 0 ? 6 : -6);
    const by = topY - 1;

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 8, by - 5);
    ctx.lineTo(bx - 8, by + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + 8, by - 5);
    ctx.lineTo(bx + 8, by + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFE4E6';
    ctx.beginPath();
    ctx.arc(bx, by, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === 'party') {
    const baseY = topY + 2;
    const tipX = cx + p.facing * 2;
    const tipY = topY - 18;

    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.moveTo(cx - 9, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(cx + 9, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 6, baseY - 5);
    ctx.lineTo(cx + 6, baseY - 5);
    ctx.moveTo(cx - 3, baseY - 11);
    ctx.lineTo(cx + 3, baseY - 11);
    ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (hat === 'headband') {
    const bandY = topY + 5;
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(p.x + 2, bandY, p.w - 4, 6);
    ctx.strokeRect(p.x + 2, bandY, p.w - 4, 6);

    const tieX = cx - p.facing * (p.w / 2 - 2);
    ctx.beginPath();
    ctx.moveTo(tieX, bandY + 2);
    ctx.lineTo(tieX - p.facing * 9, bandY + 8);
    ctx.lineTo(tieX - p.facing * 13, bandY + 12);
    ctx.moveTo(tieX, bandY + 4);
    ctx.lineTo(tieX - p.facing * 8, bandY + 10);
    ctx.lineTo(tieX - p.facing * 11, bandY + 16);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx, bandY + 3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (hat === 'halo') {
    const haloY = topY - 12;
    ctx.save();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#FEF08A';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(cx, haloY, 14, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (hat === 'wizard') {
    const baseY = topY + 3;
    const tipX = cx + p.facing * 8;
    const tipY = topY - 24;
    ctx.fillStyle = '#6D28D9';
    ctx.beginPath();
    ctx.ellipse(cx, baseY, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 11, baseY);
    ctx.quadraticCurveTo(cx - 4, baseY - 12, tipX, tipY);
    ctx.quadraticCurveTo(cx + 6, baseY - 10, cx + 11, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    drawStar(ctx, cx, baseY - 8, 4, 3.5, 1.5, '#FDE047');
  } else if (hat === 'viking') {
    const baseY = topY + 4;
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(cx, baseY, 13, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.moveTo(cx - 11, baseY);
    ctx.quadraticCurveTo(cx - 20, baseY - 4, cx - 18, baseY - 14);
    ctx.quadraticCurveTo(cx - 13, baseY - 7, cx - 7, baseY - 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 11, baseY);
    ctx.quadraticCurveTo(cx + 20, baseY - 4, cx + 18, baseY - 14);
    ctx.quadraticCurveTo(cx + 13, baseY - 7, cx + 7, baseY - 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (hat === 'chef') {
    const baseY = topY + 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 7, baseY - 12, 6, 0, Math.PI * 2);
    ctx.arc(cx, baseY - 16, 7.5, 0, Math.PI * 2);
    ctx.arc(cx + 7, baseY - 12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(cx - 9, baseY - 8, 18, 8);
    ctx.strokeRect(cx - 9, baseY - 8, 18, 8);
  } else if (hat === 'flower') {
    const fx = cx + (p.facing > 0 ? 8 : -8);
    const fy = topY - 2;
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.ellipse(fx + 6, fy + 4, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F43F5E';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2.5) {
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * 4.5, fy + Math.sin(a) * 4.5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(fx, fy, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (hat === 'headphones') {
    const baseY = topY + 12;
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, baseY - 3, 17, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, cx - 18, baseY - 6, 6, 12, 3);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, cx + 12, baseY - 6, 6, 12, 3);
    ctx.fill();
    ctx.stroke();
  } else if (hat === 'glasses') {
    const eyeY = topY + 16;
    const gx = cx - 12 + p.facing * 3;
    ctx.fillStyle = '#0F172A';
    drawRoundedRect(ctx, gx, eyeY - 4, 24, 8, 2);
    ctx.fill();
    ctx.fillRect(gx + 9, eyeY - 2, 6, 3);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(gx + 2, eyeY + 2);
    ctx.lineTo(gx + 6, eyeY - 3);
    ctx.lineTo(gx + 7, eyeY - 3);
    ctx.lineTo(gx + 3, eyeY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(gx + 14, eyeY + 2);
    ctx.lineTo(gx + 18, eyeY - 3);
    ctx.lineTo(gx + 19, eyeY - 3);
    ctx.lineTo(gx + 15, eyeY + 2);
    ctx.closePath();
    ctx.fill();
  } else if (hat === 'propeller') {
    const baseY = topY + 4;
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(cx, baseY, 12, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - 12);
    ctx.lineTo(cx, baseY - 18);
    ctx.stroke();

    const spin = Date.now() / 60;
    const bW = Math.cos(spin) * 12;
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(cx + bW / 2, baseY - 18, Math.abs(bW) / 2 + 1, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, baseY - 18, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === 'tiara') {
    const baseY = topY + 2;
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(cx - 10, baseY);
    ctx.lineTo(cx - 6, baseY - 7);
    ctx.lineTo(cx - 2, baseY - 4);
    ctx.lineTo(cx, baseY - 10);
    ctx.lineTo(cx + 2, baseY - 4);
    ctx.lineTo(cx + 6, baseY - 7);
    ctx.lineTo(cx + 10, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    [-6, 0, 6].forEach((tx, idx) => {
      ctx.beginPath();
      ctx.arc(cx + tx, idx === 1 ? baseY - 10 : baseY - 7, 1.8, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (hat === 'beret') {
    const baseY = topY + 4;
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.ellipse(cx + p.facing * 3, baseY, 15, 6, p.facing * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#1E1B4B';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + p.facing * 3, baseY - 6);
    ctx.lineTo(cx + p.facing * 4, baseY - 9);
    ctx.stroke();
  } else if (hat === 'strawhat') {
    const baseY = topY + 4;
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.ellipse(cx, baseY, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, baseY - 2, 8, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(cx - 8, baseY - 4, 16, 3);
  } else if (hat === 'wig_bob') {
    // Chic Brunette Bob Cut (From Reference Image!)
    const hairY = topY + 4;
    ctx.fillStyle = '#3E2723';
    // Back & Bangs
    ctx.beginPath();
    ctx.ellipse(cx, hairY, 16, 12, 0, Math.PI, 0, false);
    ctx.lineTo(cx + 16, hairY + 16);
    ctx.quadraticCurveTo(cx + 13, hairY + 22, cx + 8, hairY + 20);
    ctx.lineTo(cx + 5, hairY + 8);
    ctx.lineTo(cx - 5, hairY + 8);
    ctx.lineTo(cx - 8, hairY + 20);
    ctx.quadraticCurveTo(cx - 13, hairY + 22, cx - 16, hairY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Star Diamond Hair Clip on side (From Reference Image!)
    drawStar(ctx, cx - 10, hairY + 2, 4, 4, 1.8, '#38BDF8');
  } else if (hat === 'wig_ponytail') {
    // Glamour High Ponytail (From Reference Image!)
    const hairY = topY + 5;
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.ellipse(cx, hairY, 15, 8, 0, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // High Ponytail Flowing Down
    const pX = cx - p.facing * 12;
    const pY = hairY - 3;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(cx - p.facing * 6, pY);
    ctx.quadraticCurveTo(pX - p.facing * 6, pY - 8, pX - p.facing * 10, pY + 16);
    ctx.quadraticCurveTo(pX - p.facing * 6, pY + 22, cx - p.facing * 2, pY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pink Scrunchie / Tie
    ctx.fillStyle = '#EC4899';
    ctx.beginPath();
    ctx.arc(cx - p.facing * 6, pY, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (hat === 'star_clip') {
    // Sparkling Diamond Star Hair Clip (From Reference Image!)
    const clipX = cx - 10 * p.facing;
    const clipY = topY + 6;
    drawStar(ctx, clipX, clipY, 5, 6, 2.5, '#38BDF8');
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(clipX, clipY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (hat === 'gown_gold') {
    // Gold Tribal Pattern Runway Dress on Cat Body (From Reference Image!)
    const dressY = topY + p.h - 18;
    ctx.fillStyle = '#F59E0B';
    drawRoundedRect(ctx, p.x + 2, dressY, p.w - 4, 14, 4);
    ctx.fill();
    ctx.stroke();

    // Black Tribal Geometric Motif
    ctx.fillStyle = '#18181B';
    ctx.fillRect(p.x + 6, dressY + 3, p.w - 12, 2.5);
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, dressY + 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(p.x + 8, dressY + 11, p.w - 16, 2);
  } else if (hat === 'dress_ballerina') {
    // Pink Layered Frill Ballgown (From Reference Image!)
    const dressY = topY + p.h - 17;
    ctx.fillStyle = '#EC4899';
    drawRoundedRect(ctx, p.x + 1, dressY, p.w - 2, 7, 3);
    ctx.fill();
    ctx.stroke();

    // Ruffled Tiered Skirt
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.moveTo(p.x - 2, dressY + 6);
    ctx.quadraticCurveTo(p.x + p.w / 2, dressY + 13, p.x + p.w + 2, dressY + 6);
    ctx.lineTo(p.x + p.w, dressY + 14);
    ctx.quadraticCurveTo(p.x + p.w / 2, dressY + 18, p.x, dressY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (hat === 'dress_royal') {
    // Sapphire Gala Gown (From Reference Image!)
    const dressY = topY + p.h - 18;
    ctx.fillStyle = '#1E40AF';
    drawRoundedRect(ctx, p.x + 2, dressY, p.w - 4, 15, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.moveTo(p.x + p.w / 2, dressY + 2);
    ctx.lineTo(p.x + p.w / 2 + 5, dressY + 14);
    ctx.lineTo(p.x + p.w / 2 - 5, dressY + 14);
    ctx.closePath();
    ctx.fill();
  } else if (hat === 'necklace_pearl') {
    // Black Pearl Beaded Choker (From Reference Image!)
    const neckY = topY + 28;
    ctx.fillStyle = '#0F172A';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      const pearlX = cx + i * 4;
      const pearlY = neckY + Math.abs(i) * 1.2;
      ctx.arc(pearlX, pearlY, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (hat === 'clutch') {
    // Gold-Studded Evening Clutch Bag (From Reference Image!)
    const bagX = cx + p.facing * (p.w / 2 - 2);
    const bagY = topY + p.h - 16;
    ctx.fillStyle = '#18181B';
    drawRoundedRect(ctx, bagX, bagY, 14, 10, 2);
    ctx.fill();
    ctx.stroke();

    // Envelope flap
    ctx.beginPath();
    ctx.moveTo(bagX, bagY);
    ctx.lineTo(bagX + 7, bagY + 6);
    ctx.lineTo(bagX + 14, bagY);
    ctx.stroke();

    // Gold studs
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(bagX + 7, bagY + 6, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (hat === 'heels_gladiator') {
    // Strappy Black Gladiator Heels on Paws (From Reference Image!)
    const pawY = topY + p.h - 7;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;

    // Left paw straps
    const p1x = p.x + 5;
    ctx.beginPath();
    ctx.moveTo(p1x, pawY - 6);
    ctx.lineTo(p1x + 10, pawY - 2);
    ctx.moveTo(p1x + 10, pawY - 6);
    ctx.lineTo(p1x, pawY - 2);
    ctx.stroke();

    // Right paw straps
    const p2x = p.x + p.w - 15;
    ctx.beginPath();
    ctx.moveTo(p2x, pawY - 6);
    ctx.lineTo(p2x + 10, pawY - 2);
    ctx.moveTo(p2x + 10, pawY - 6);
    ctx.lineTo(p2x, pawY - 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSingleCat(ctx, p, showBadge = true) {
  ctx.save();

  ctx.fillStyle = 'rgba(41, 50, 65, 0.18)';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + p.h - 1, p.w / 2 - 2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  let sx = 1;
  let sy = 1;
  if (!p.onGround) {
    sy = 1 + Math.abs(p.vy || 0) * 0.015;
    sx = 1 / sy;
  }

  ctx.translate(p.x + p.w / 2, p.y + p.h);
  ctx.scale(sx, sy);
  ctx.translate(-(p.x + p.w / 2), -(p.y + p.h));

  const legBob = Math.sin(p.walkFrame || 0) * 4;

  // Cat Wagging Tail
  const tailDir = -p.facing;
  const tailWiggle = Math.sin((p.walkFrame || 0) * 1.5) * 4;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p.x + p.w / 2 + tailDir * 14, p.y + p.h - 14);
  ctx.quadraticCurveTo(
    p.x + p.w / 2 + tailDir * 24 + tailWiggle,
    p.y + p.h - 22,
    p.x + p.w / 2 + tailDir * 26,
    p.y + p.h - 30
  );
  ctx.stroke();
  ctx.strokeStyle = '#293241';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cat Ears
  const earY = p.y;
  ctx.fillStyle = p.color;
  ctx.strokeStyle = '#293241';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x + 3, earY + 8);
  ctx.lineTo(p.x + 5, earY - 8);
  ctx.lineTo(p.x + 16, earY + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFAAA6';
  ctx.beginPath();
  ctx.moveTo(p.x + 6, earY + 6);
  ctx.lineTo(p.x + 7, earY - 4);
  ctx.lineTo(p.x + 13, earY + 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(p.x + p.w - 3, earY + 8);
  ctx.lineTo(p.x + p.w - 5, earY - 8);
  ctx.lineTo(p.x + p.w - 16, earY + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFAAA6';
  ctx.beginPath();
  ctx.moveTo(p.x + p.w - 6, earY + 6);
  ctx.lineTo(p.x + p.w - 7, earY - 4);
  ctx.lineTo(p.x + p.w - 13, earY + 2);
  ctx.closePath();
  ctx.fill();

  // Body Capsule
  const bodyGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
  bodyGrad.addColorStop(0, p.color);
  bodyGrad.addColorStop(1, p.darkColor || p.color);
  ctx.fillStyle = bodyGrad;
  drawRoundedRect(ctx, p.x, p.y, p.w, p.h - 6, 12);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2, p.y + 7, p.w / 3, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#293241';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, p.x, p.y, p.w, p.h - 6, 12);
  ctx.stroke();

  // Paws
  ctx.fillStyle = p.darkColor || p.color;
  ctx.strokeStyle = '#293241';
  ctx.lineWidth = 2.5;

  const f1Y = p.y + p.h - 6 + (p.vx ? legBob : 0);
  drawRoundedRect(ctx, p.x + 5, f1Y, 10, 6, 3);
  ctx.fill();
  ctx.stroke();

  const f2Y = p.y + p.h - 6 - (p.vx ? legBob : 0);
  drawRoundedRect(ctx, p.x + p.w - 15, f2Y, 10, 6, 3);
  ctx.fill();
  ctx.stroke();

  // Blushing Cheeks
  ctx.fillStyle = 'rgba(255, 150, 150, 0.55)';
  ctx.beginPath();
  ctx.arc(p.x + 8, p.y + 23, 4, 0, Math.PI * 2);
  ctx.arc(p.x + p.w - 8, p.y + 23, 4, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeOffsetX = p.facing * 5;
  const eyeY = p.y + 16;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(p.x + p.w / 2 - 7 + eyeOffsetX, eyeY, 5, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(p.x + p.w / 2 + 7 + eyeOffsetX, eyeY, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#293241';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2 - 6 + eyeOffsetX * 1.2, eyeY, 3, 0, Math.PI * 2);
  ctx.arc(p.x + p.w / 2 + 8 + eyeOffsetX * 1.2, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2 - 7 + eyeOffsetX * 1.2, eyeY - 1.5, 1.4, 0, Math.PI * 2);
  ctx.arc(p.x + p.w / 2 + 7 + eyeOffsetX * 1.2, eyeY - 1.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#293241';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2 - 2 + eyeOffsetX * 0.5, eyeY + 8, 2.5, 0, Math.PI);
  ctx.arc(p.x + p.w / 2 + 2 + eyeOffsetX * 0.5, eyeY + 8, 2.5, 0, Math.PI);
  ctx.stroke();

  // Custom Accessory / Hat
  drawAccessory(ctx, p);

  // Badge
  if (showBadge && p.label) {
    const hasHat = p.hat && p.hat !== 'none';
    const badgeY = hasHat ? p.y - 28 : p.y - 20;
    const badgeBg = p.color;
    ctx.fillStyle = badgeBg;
    drawRoundedRect(ctx, p.x + p.w / 2 - 14, badgeY, 28, 16, 8);
    ctx.fill();
    ctx.strokeStyle = '#293241';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, p.x + p.w / 2 - 14, badgeY, 28, 16, 8);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, p.x + p.w / 2, badgeY + 12);
  }

  if (p.sweating) {
    const swX = p.x + (p.facing > 0 ? -8 : p.w + 8);
    const swY = p.y + 12 + ((Date.now() / 8) % 12);
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(swX, swY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.font = '900 11px "Segoe UI", sans-serif';
    ctx.fillText('NEEDS 2 CATS! 💦', p.x + p.w / 2, p.y - 26);
  }

  if (p.emoteTimer > 0 && p.emoteText) {
    ctx.font = '900 13px "Segoe UI", sans-serif';
    const tw = ctx.measureText(p.emoteText).width + 20;
    const bx = p.x + p.w / 2 - tw / 2;
    const by = p.y - 48;
    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, bx, by, tw, 26, 10);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#293241';
    drawRoundedRect(ctx, bx, by, tw, 26, 10);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(p.x + p.w / 2 - 5, by + 26);
    ctx.lineTo(p.x + p.w / 2, by + 32);
    ctx.lineTo(p.x + p.w / 2 + 5, by + 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#293241';
    ctx.fillText(p.emoteText, p.x + p.w / 2, by + 18);
  }

  ctx.restore();
}

export function drawSkinPreview(canvas, palette, accessoryId = 'none') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.clearRect(0, 0, cw, ch);

  // Soft glowing pedestal circle
  ctx.save();
  const grad = ctx.createRadialGradient(cw / 2, ch / 2, 10, cw / 2, ch / 2, cw / 2 - 6);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.01)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cw / 2, ch / 2, cw / 2 - 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Draw scaled cat
  ctx.save();
  const scale = cw >= 140 ? 1.45 : 1.0;
  ctx.translate(cw / 2, ch / 2 + 12);
  ctx.scale(scale, scale);
  ctx.translate(-22, -26);

  const mockP = {
    x: 0,
    y: 0,
    w: 44,
    h: 48,
    color: palette.color,
    darkColor: palette.darkColor,
    facing: 1,
    walkFrame: 0,
    vx: 0,
    onGround: true,
    label: '',
    sweating: false,
    emoteTimer: 0,
    hat: accessoryId
  };

  drawSingleCat(ctx, mockP, false);
  ctx.restore();
}
