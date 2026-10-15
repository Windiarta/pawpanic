import './styles.css';
import { W, H } from './config.js';
import { playSFX, toggleSound, isSoundEnabled } from './audio.js';
import { LEVELS } from './levels.js';
import { initInput, getPlayerInputs, justPressed, touchState } from './input.js';
import {
  initNetwork,
  getNetMode,
  setNetMode,
  getRoomCode,
  isNetworkConnected,
  networkSend,
  remoteInput,
  createRoom,
  joinRoom,
  leaveRoom,
  updateHeaderBadge,
  setLobbyStatus
} from './network.js';
import { createPlayer, updatePhysicsEngine } from './physics.js';
import { renderGame, drawSingleCat, drawSkinPreview } from './renderer.js';
import { getSkin, saveSkin, loadSkin, getRandomSkin, SKIN_PALETTES, ACCESSORIES } from './skin.js';

// Setup Canvas with 2x Super-Sampling
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1920;
canvas.height = 1080;
ctx.scale(2, 2);

// Game State
const state = {
  currentLevelIdx: 0,
  levelClearTimer: 0,
  allGameWon: false,
  hostStateTick: 0,
  particles: [],
  players: [],
  walls: [],
  blocks: [],
  buttons: [],
  movers: [],
  keyItem: null,
  door: null,
  tetherConfig: { active: false, length: 180 }
};

let currentScreen = 'menu'; // 'menu' | 'levelSelect' | 'game'
let isPaused = false;
let selectedTier = 1;
let peerSkin = null;

// Timer State
let levelStartTime = 0;
let levelElapsedMs = 0;
let pauseStartTime = 0;
let timerRunning = false;

// OPTION A: AUTO-FULLSCREEN ON FIRST USER GESTURE
let hasRequestedFs = false;
function tryAutoFullscreen() {
  if (!hasRequestedFs && !document.fullscreenElement && !document.webkitFullscreenElement) {
    hasRequestedFs = true;
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  }
}
window.addEventListener('click', tryAutoFullscreen, { passive: true });
window.addEventListener('keydown', tryAutoFullscreen, { passive: true });

export function spawnConfetti(x, y, count = 32) {
  const colors = ['#FF7A29', '#2EC4B6', '#FFD166', '#EF476F', '#8B5CF6', '#10B981', '#38BDF8'];
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 11,
      vy: (Math.random() - 0.85) * 10,
      size: 6 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 55 + Math.random() * 35,
      maxLife: 90,
      shape: Math.random() > 0.3 ? 'rect' : 'star'
    });
  }
}

export function spawnDust(x, y, count = 6) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -Math.random() * 1.5 - 0.5,
      size: 4 + Math.random() * 4,
      rot: 0,
      vrot: 0,
      color: 'rgba(148, 163, 184, 0.45)',
      life: 18 + Math.random() * 10,
      maxLife: 28,
      shape: 'circle'
    });
  }
}

function updateParticles() {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.rot += pt.vrot;
    pt.vy += pt.shape === 'circle' ? 0.05 : 0.22;
    pt.vx *= 0.98;
    pt.life--;
    if (pt.life <= 0) state.particles.splice(i, 1);
  }
}

function applySkinsToPlayers() {
  const net = getNetMode();
  const p1Custom = getSkin(1);
  const p2Custom = getSkin(2);

  if (state.players[0]) {
    if (net === 'client' && peerSkin) {
      state.players[0].color = peerSkin.color;
      state.players[0].darkColor = peerSkin.darkColor;
      state.players[0].hat = peerSkin.accessoryId;
    } else {
      state.players[0].color = p1Custom.color;
      state.players[0].darkColor = p1Custom.darkColor;
      state.players[0].hat = p1Custom.accessoryId;
    }
  }

  if (state.players[1]) {
    if (net === 'client') {
      state.players[1].color = p2Custom.color;
      state.players[1].darkColor = p2Custom.darkColor;
      state.players[1].hat = p2Custom.accessoryId;
    } else if (peerSkin) {
      state.players[1].color = peerSkin.color;
      state.players[1].darkColor = peerSkin.darkColor;
      state.players[1].hat = peerSkin.accessoryId;
    } else {
      // Local multiplayer uses custom Player 2 skin!
      state.players[1].color = p2Custom.color;
      state.players[1].darkColor = p2Custom.darkColor;
      state.players[1].hat = p2Custom.accessoryId;
    }
  }
}

function loadLevel(idx, broadcast = true) {
  state.currentLevelIdx = idx;
  const select = document.getElementById('levelSelect');
  if (select) select.value = String(idx);

  // Update floating HUD title
  const hudLevelName = document.getElementById('hudLevelName');
  if (hudLevelName && LEVELS[idx]) {
    hudLevelName.textContent = LEVELS[idx].name;
  }

  const lvl = LEVELS[idx];
  state.levelClearTimer = 0;
  state.allGameWon = false;
  state.particles = [];

  state.players = [
    createPlayer(0, lvl.spawns[0].x, lvl.spawns[0].y),
    createPlayer(1, lvl.spawns[1].x, lvl.spawns[1].y)
  ];
  applySkinsToPlayers();

  state.walls = lvl.walls.map(w => ({ ...w }));
  state.blocks = lvl.blocks.map(b => ({
    ...b,
    targetX: b.x,
    targetY: b.y,
    vx: 0,
    vy: 0,
    pushersLeft: 0,
    pushersRight: 0
  }));

  state.buttons = lvl.buttons.map(b => ({
    ...b,
    pressed: false,
    toggled: false
  }));

  state.movers = lvl.movers.map(m => ({
    ...m,
    targetX: m.x,
    targetY: m.y,
    dx: 0,
    dy: 0,
    active: false,
    oscDir: 1
  }));

  state.keyItem = {
    x: lvl.key.x,
    y: lvl.key.y,
    baseY: lvl.key.y,
    targetX: lvl.key.x,
    targetY: lvl.key.y,
    carrierIdx: -1,
    used: false,
    floatTick: 0
  };

  state.door = {
    x: lvl.door.x,
    y: lvl.door.y,
    w: 54,
    h: 72,
    unlocked: false,
    openProgress: 0
  };

  state.tetherConfig = {
    active: !!lvl.tether,
    length: lvl.tetherLength || 175
  };

  levelStartTime = performance.now();
  pauseStartTime = 0;
  levelElapsedMs = 0;
  timerRunning = true;
  const timerText = document.getElementById('timerText');
  if (timerText) {
    timerText.textContent = '00:00.00';
  }

  if (broadcast && getNetMode() === 'client' && isNetworkConnected()) {
    networkSend({ type: 'cmd', action: 'level', levelIdx: idx });
  }
}

function skipLevel() {
  if (state.currentLevelIdx < LEVELS.length - 1) {
    const nextIdx = state.currentLevelIdx + 1;
    loadLevel(nextIdx, true);
    playSFX('unlock');
    spawnConfetti(W / 2, H / 3, 40);
    if (getNetMode() === 'host' && isNetworkConnected()) {
      networkSend({ type: 'cmd', action: 'skip' });
    }
  } else {
    state.allGameWon = true;
  }
}

function formatTimer(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const cs = String(centiseconds).padStart(2, '0');
  return `${mm}:${ss}.${cs}`;
}

function updateTimer() {
  if (!timerRunning || isPaused || currentScreen !== 'game' || state.levelClearTimer > 0 || state.allGameWon) return;
  levelElapsedMs = performance.now() - levelStartTime;
  const timerText = document.getElementById('timerText');
  if (timerText) {
    timerText.textContent = formatTimer(levelElapsedMs);
  }
}

// SCREEN STATE MANAGEMENT: 'menu' | 'levelSelect' | 'game'
function setScreen(screen) {
  currentScreen = screen;
  const menuScreen = document.getElementById('mainMenuScreen');
  const gameViewport = document.getElementById('gameViewport');
  const levelSelectScreen = document.getElementById('levelSelectScreen');
  const pauseModal = document.getElementById('pauseModal');

  if (menuScreen) {
    if (screen === 'menu') menuScreen.classList.remove('hidden');
    else menuScreen.classList.add('hidden');
  }

  if (gameViewport) {
    if (screen === 'game') gameViewport.classList.remove('hidden');
    else gameViewport.classList.add('hidden');
  }

  if (levelSelectScreen) {
    if (screen === 'levelSelect') {
      levelSelectScreen.classList.remove('hidden');
      renderCandyJourneyMap();
      setTimeout(() => scrollToActiveLevel(false), 50);
    } else {
      levelSelectScreen.classList.add('hidden');
      closeCandyLevelPopup();
    }
  }

  if (screen !== 'game' && pauseModal) {
    pauseModal.classList.add('hidden');
    isPaused = false;
    pauseStartTime = 0;
  }

  // Update online badge visibility in HUD
  const connBadge = document.getElementById('hudConnBadge');
  if (connBadge) {
    connBadge.classList.toggle('hidden', getNetMode() === 'local');
  }
}

function togglePause() {
  if (currentScreen !== 'game') return;
  const modal = document.getElementById('pauseModal');
  if (!modal) return;
  isPaused = !isPaused;
  if (isPaused) {
    pauseStartTime = performance.now();
    modal.classList.remove('hidden');
    // Show disconnect button in pause menu if online
    const btnDc = document.getElementById('btnDisconnect');
    if (btnDc) btnDc.classList.toggle('hidden', getNetMode() === 'local');
  } else {
    if (pauseStartTime > 0) {
      levelStartTime += performance.now() - pauseStartTime;
      pauseStartTime = 0;
    }
    modal.classList.add('hidden');
  }
}

// LEVEL PROGRESS & RECORDS STORAGE
function getClearedLevels() {
  try {
    const raw = localStorage.getItem('pawpanic_cleared_levels');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function getLevelRecords() {
  try {
    const raw = localStorage.getItem('pawpanic_level_records');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function recordLevelClear(levelIdx, timeMs) {
  try {
    const cleared = getClearedLevels();
    cleared.add(levelIdx);
    localStorage.setItem('pawpanic_cleared_levels', JSON.stringify([...cleared]));

    if (timeMs && timeMs > 500) {
      const records = getLevelRecords();
      if (!records[levelIdx] || timeMs < records[levelIdx]) {
        records[levelIdx] = Math.round(timeMs);
        localStorage.setItem('pawpanic_level_records', JSON.stringify(records));
      }
    }
  } catch (e) {}
}

// ==============================================================
// CANDY CRUSH SAGA JOURNEY MAP (100 LEVELS WITH CATS & LANDMARKS)
// ==============================================================
let selectedPopupLevelIdx = 0;

function renderCandyJourneyMap() {
  const scrollArea = document.getElementById('candyMapScroll');
  const nodesLayer = document.getElementById('candyNodesLayer');
  const landmarksLayer = document.getElementById('candyLandmarksLayer');
  const playerPin = document.getElementById('candyPlayerPin');
  const totalStarsEl = document.getElementById('candyTotalStars');
  const levelIndicator = document.getElementById('candyLevelIndicator');
  if (!scrollArea || !nodesLayer || !landmarksLayer) return;

  const clearedLevels = getClearedLevels();
  const levelRecords = getLevelRecords();

  if (totalStarsEl) {
    totalStarsEl.textContent = String(clearedLevels.size);
  }
  if (levelIndicator) {
    const curIdx = state.currentLevelIdx;
    const curTier = Math.floor(curIdx / 20) + 1;
    const tierNames = ['Dasar (1-20)', 'Mekanik (21-40)', 'Tali Karet (41-60)', 'Akrobatik (61-80)', 'Master (81-100)'];
    levelIndicator.textContent = `Level ${curIdx + 1} • ${tierNames[curTier - 1] || 'Catnip'}`;
  }

  // 1. Calculate points along the winding path (100 levels)
  const TOTAL_LEVELS = LEVELS.length; // 100
  const startY = 8350;
  const stepY = 81;
  const pts = [];

  for (let i = 0; i < TOTAL_LEVELS; i++) {
    const y = startY - i * stepY;
    const xPercent = 50 + 33 * Math.sin(i * 0.76);
    pts.push({
      idx: i,
      xPercent,
      y,
      pxX: (xPercent / 100) * 500,
      pxY: y
    });
  }

  // 2. Draw smooth SVG serpentine curve track
  const svg = document.getElementById('candyTrackSvg');
  if (svg) {
    svg.setAttribute('viewBox', '0 0 500 8600');
    let d = `M ${pts[0].pxX} ${pts[0].pxY}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const midY = (p0.pxY + p1.pxY) / 2;
      d += ` C ${p0.pxX} ${midY}, ${p1.pxX} ${midY}, ${p1.pxX} ${p1.pxY}`;
    }

    const b = document.getElementById('svgTrackBorder');
    const c = document.getElementById('svgTrackCandy');
    const inLine = document.getElementById('svgTrackInner');
    if (b) b.setAttribute('d', d);
    if (c) c.setAttribute('d', d);
    if (inLine) inLine.setAttribute('d', d);
  }

  // 3. Render Landmarks and Lots of Cats
  landmarksLayer.innerHTML = '';

  const CANDY_LANDMARKS = [
    { level: 1, y: 8460, xPercent: 50, icon: '🏡', cats: '🐱🐾', title: '🌸 Catnip Village', desc: 'Start your 100-level adventure!' },
    { level: 10, y: 7600, xPercent: 82, icon: '🎣', cats: '🐱🐟', title: '🐟 Caramel Fish Pond', desc: 'Calico cat enjoys cozy fishing!' },
    { level: 21, y: 6720, isRibbon: true, ribbonText: '🎀 Chapter 2: Fish Candy Factory (Lv 21 - 40)' },
    { level: 22, y: 6640, xPercent: 18, icon: '🎪', cats: '🐱🍦', title: '🍦 Fish Ice Cream Cart', desc: 'Sweet strawberry salmon ice cream!' },
    { level: 33, y: 5740, xPercent: 82, icon: '🥞', cats: '🐱🍯', title: '🥞 Honey Pancake Tower', desc: 'Chonky orange cat in food coma!' },
    { level: 41, y: 5100, isRibbon: true, ribbonText: '🎀 Chapter 3: Wool Yarn Valley (Lv 41 - 60)' },
    { level: 43, y: 4940, xPercent: 20, icon: '⛲', cats: '🐱🥛', title: '🥛 Warm Milk Fountain', desc: 'Kittens splashing in warm milk!' },
    { level: 54, y: 4040, xPercent: 82, icon: '🍩', cats: '🐱💤', title: '🍩 Strawberry Donut Hill', desc: 'Tabby snoozing inside a giant donut!' },
    { level: 61, y: 3460, isRibbon: true, ribbonText: '🎀 Chapter 4: Marshmallow Cloud Peak (Lv 61 - 80)' },
    { level: 63, y: 3300, xPercent: 18, icon: '🧶', cats: '🐱✨', title: '🧶 Rainbow Yarn Ball', desc: 'Cats playing with friendship yarn!' },
    { level: 74, y: 2400, xPercent: 82, icon: '🧁', cats: '🐱👨‍🍳', title: '🧁 Kitty Cupcake Bakery', desc: 'Chef cat baking fresh paw cakes!' },
    { level: 81, y: 1820, isRibbon: true, ribbonText: '🎀 Chapter 5: Golden Palace of the Cat King (Lv 81 - 100)' },
    { level: 83, y: 1660, xPercent: 20, icon: '☁️', cats: '🐱😇', title: '☁️ Sugar Cloud Trampoline', desc: 'Halo cat floating through dream clouds!' },
    { level: 94, y: 760, xPercent: 82, icon: '💎', cats: '🐱🥷', title: '💎 Golden Key Crystal', desc: 'Ninja cat guarding the summit gate!' },
    { level: 100, y: 160, xPercent: 50, icon: '🏰', cats: '👑🐱👑', title: '👑 Palace of the Cat King (Victory)', desc: '100-level summit victory together!' }
  ];

  CANDY_LANDMARKS.forEach(lm => {
    if (lm.isRibbon) {
      const rib = document.createElement('div');
      rib.className = 'candy-world-ribbon-marker';
      rib.style.top = `${lm.y}px`;
      rib.textContent = lm.ribbonText;
      landmarksLayer.appendChild(rib);
    } else {
      const card = document.createElement('div');
      card.className = 'candy-landmark';
      card.style.left = `${lm.xPercent}%`;
      card.style.top = `${lm.y}px`;
      card.innerHTML = `
        <div class="candy-landmark-card">
          <div class="candy-landmark-icon">${lm.icon}</div>
          <div class="candy-landmark-cats">${lm.cats}</div>
          <div class="candy-landmark-title">${lm.title}</div>
          <div class="candy-landmark-desc">${lm.desc}</div>
        </div>
      `;
      landmarksLayer.appendChild(card);
    }
  });

  // Additional cute scattered cats & flowers along the trail
  const DECO_ITEMS = [
    { x: 15, y: 8100, emoji: '🐱', type: 'cat' },
    { x: 85, y: 7920, emoji: '🌸', type: 'flower' },
    { x: 18, y: 7300, emoji: '🐾', type: 'flower' },
    { x: 84, y: 7100, emoji: '🐱💤', type: 'cat' },
    { x: 14, y: 6400, emoji: '🍭', type: 'flower' },
    { x: 86, y: 6200, emoji: '🐱', type: 'cat' },
    { x: 16, y: 5500, emoji: '🍬', type: 'flower' },
    { x: 84, y: 5300, emoji: '🐱✨', type: 'cat' },
    { x: 15, y: 4600, emoji: '🦋', type: 'flower' },
    { x: 85, y: 4400, emoji: '🐱🐾', type: 'cat' },
    { x: 14, y: 3800, emoji: '🌸', type: 'flower' },
    { x: 86, y: 3600, emoji: '🐱🍰', type: 'cat' },
    { x: 15, y: 2900, emoji: '✨', type: 'flower' },
    { x: 85, y: 2700, emoji: '🐱', type: 'cat' },
    { x: 16, y: 2100, emoji: '🍭', type: 'flower' },
    { x: 84, y: 1900, emoji: '🐱👑', type: 'cat' },
    { x: 15, y: 1300, emoji: '🌸', type: 'flower' },
    { x: 85, y: 1100, emoji: '🐱🎉', type: 'cat' },
    { x: 20, y: 450, emoji: '👑', type: 'flower' },
    { x: 80, y: 400, emoji: '🐱🏆', type: 'cat' }
  ];

  DECO_ITEMS.forEach(d => {
    const el = document.createElement('div');
    el.className = d.type === 'cat' ? 'candy-cat-deco' : 'candy-flower-patch';
    el.style.left = `${d.x}%`;
    el.style.top = `${d.y}px`;
    el.textContent = d.emoji;
    landmarksLayer.appendChild(el);
  });

  // 4. Render 100 Candy Nodes
  nodesLayer.innerHTML = '';
  pts.forEach(pt => {
    const i = pt.idx;
    const isCurrent = state.currentLevelIdx === i;
    const isCleared = clearedLevels.has(i);
    const isMilestone = (i + 1) % 5 === 0 || i === TOTAL_LEVELS - 1;

    const nodeBtn = document.createElement('button');
    nodeBtn.className = `candy-level-node${isCleared ? ' is-cleared' : ''}${isMilestone ? ' is-milestone' : ''}${isCurrent ? ' is-active' : ''}`;
    nodeBtn.style.left = `${pt.xPercent}%`;
    nodeBtn.style.top = `${pt.y}px`;
    nodeBtn.setAttribute('data-idx', String(i));
    nodeBtn.title = `Level ${i + 1}: ${LEVELS[i]?.name || ''}`;

    let crownHtml = isMilestone ? '<span class="node-crown">👑</span>' : '';
    let starsHtml = isCleared ? '<div class="node-stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>' : '';

    nodeBtn.innerHTML = `
      ${crownHtml}
      <span>${i + 1}</span>
      ${starsHtml}
    `;

    nodeBtn.addEventListener('click', () => {
      playSFX('button');
      openCandyLevelPopup(i);
    });

    nodesLayer.appendChild(nodeBtn);
  });

  // 5. Update Player Cat Pin on Active Level
  if (playerPin && pts[state.currentLevelIdx]) {
    const curPt = pts[state.currentLevelIdx];
    playerPin.style.left = `${curPt.xPercent}%`;
    playerPin.style.top = `${curPt.y}px`;
    const bubble = playerPin.querySelector('.cat-pin-bubble');
    if (bubble) bubble.textContent = `LEVEL ${state.currentLevelIdx + 1} 🐾`;
  }
}

function scrollToActiveLevel(smooth = true) {
  const scrollArea = document.getElementById('candyMapScroll');
  if (!scrollArea) return;
  const startY = 8350;
  const stepY = 81;
  const targetY = startY - state.currentLevelIdx * stepY;
  scrollArea.scrollTo({
    top: Math.max(0, targetY - scrollArea.clientHeight / 2),
    behavior: smooth ? 'smooth' : 'auto'
  });
}

function openCandyLevelPopup(idx) {
  selectedPopupLevelIdx = idx;
  const popup = document.getElementById('candyLevelPopup');
  const lvl = LEVELS[idx];
  if (!popup || !lvl) return;

  const clearedLevels = getClearedLevels();
  const records = getLevelRecords();
  const isCleared = clearedLevels.has(idx);
  const bestTime = records[idx];

  const ribbon = document.getElementById('popupRibbon');
  const title = document.getElementById('popupTitle');
  const sub = document.getElementById('popupSubtitle');
  const chips = document.getElementById('popupChips');
  const stars = document.getElementById('popupStars');
  const recordWrap = document.getElementById('popupRecordWrap');
  const recordTime = document.getElementById('popupRecordTime');

  if (ribbon) ribbon.textContent = `LEVEL ${idx + 1}`;
  if (title) title.textContent = lvl.name.replace(/^Level \d+:\s*/, '');
  if (sub) sub.textContent = lvl.subtitle || 'Work together to grab the key and reach the exit door!';

  if (stars) {
    stars.innerHTML = isCleared
      ? '<span>⭐</span><span>⭐</span><span>⭐</span>'
      : '<span style="opacity:0.3">⭐</span><span style="opacity:0.3">⭐</span><span style="opacity:0.3">⭐</span>';
  }

  if (chips) {
    const tags = [];
    if (lvl.tether) tags.push('<span class="lvl-chip chip-tether">🔗 Tether Rope</span>');
    if (lvl.blocks?.length) tags.push('<span class="lvl-chip chip-block">📦 2P Block</span>');
    if (lvl.buttons?.length) tags.push('<span class="lvl-chip chip-btn">🔘 Button</span>');
    if (lvl.movers?.length) tags.push('<span class="lvl-chip chip-mover">🚀 Lift</span>');
    chips.innerHTML = tags.join('');
  }

  if (recordWrap && recordTime) {
    if (bestTime) {
      recordWrap.classList.remove('hidden');
      recordTime.textContent = formatTimer(bestTime);
    } else {
      recordWrap.classList.add('hidden');
    }
  }

  popup.classList.remove('hidden');
}

function closeCandyLevelPopup() {
  const popup = document.getElementById('candyLevelPopup');
  if (popup) popup.classList.add('hidden');
}

// SKIN CUSTOMIZATION MODAL (DUAL PLAYER P1 & P2 STUDIO)
let currentEditingPlayer = 1;
let tempSkinP1 = { ...loadSkin(1) };
let tempSkinP2 = { ...loadSkin(2) };

function openSkinModal() {
  const modal = document.getElementById('skinModal');
  if (!modal) return;
  tempSkinP1 = { ...getSkin(1) };
  tempSkinP2 = { ...getSkin(2) };
  currentEditingPlayer = 1;
  updateSkinModalUI();
  modal.classList.remove('hidden');
}

function closeSkinModal() {
  const modal = document.getElementById('skinModal');
  if (modal) modal.classList.add('hidden');
}

function getActiveTempSkin() {
  return currentEditingPlayer === 1 ? tempSkinP1 : tempSkinP2;
}

function updateSkinModalUI() {
  const tabP1 = document.getElementById('tabSkinP1');
  const tabP2 = document.getElementById('tabSkinP2');
  const playerIndicator = document.getElementById('skinPlayerIndicator');
  const colorNameLabel = document.getElementById('skinColorName');
  const hatNameLabel = document.getElementById('skinHatName');
  const previewCanvas = document.getElementById('skinPreviewCanvas');
  const paletteGrid = document.getElementById('skinPaletteGrid');
  const accessoryGrid = document.getElementById('skinAccessoryGrid');

  if (tabP1) tabP1.classList.toggle('active', currentEditingPlayer === 1);
  if (tabP2) tabP2.classList.toggle('active', currentEditingPlayer === 2);

  if (playerIndicator) {
    playerIndicator.textContent = currentEditingPlayer === 1
      ? 'Player 1 (P1 - Orange Host)'
      : 'Player 2 (P2 - Teal Partner)';
    playerIndicator.style.color = currentEditingPlayer === 1 ? '#FF7A29' : '#2EC4B6';
  }

  const cur = getActiveTempSkin();
  const palette = SKIN_PALETTES.find(p => p.id === cur.paletteId) || SKIN_PALETTES[0];
  const accessory = ACCESSORIES.find(a => a.id === cur.accessoryId) || ACCESSORIES[0];

  if (colorNameLabel) colorNameLabel.textContent = palette.name;
  if (hatNameLabel) hatNameLabel.textContent = `${accessory.icon || ''} ${accessory.name}`;

  drawSkinPreview(previewCanvas, palette, cur.accessoryId);

  if (paletteGrid) {
    paletteGrid.querySelectorAll('.palette-swatch').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === cur.paletteId);
    });
  }
  if (accessoryGrid) {
    accessoryGrid.querySelectorAll('.accessory-card').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === cur.accessoryId);
    });
  }
}

function initSkinModal() {
  const tabP1 = document.getElementById('tabSkinP1');
  const tabP2 = document.getElementById('tabSkinP2');
  const paletteGrid = document.getElementById('skinPaletteGrid');
  const accessoryGrid = document.getElementById('skinAccessoryGrid');
  const btnRandom = document.getElementById('btnRandomSkin');
  const btnResetDefault = document.getElementById('btnResetDefaultSkin');

  if (tabP1) {
    tabP1.addEventListener('click', () => {
      playSFX('button');
      currentEditingPlayer = 1;
      updateSkinModalUI();
    });
  }

  if (tabP2) {
    tabP2.addEventListener('click', () => {
      playSFX('button');
      currentEditingPlayer = 2;
      updateSkinModalUI();
    });
  }

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      playSFX('key');
      const rand = getRandomSkin();
      if (currentEditingPlayer === 1) {
        tempSkinP1.paletteId = rand.paletteId;
        tempSkinP1.accessoryId = rand.accessoryId;
      } else {
        tempSkinP2.paletteId = rand.paletteId;
        tempSkinP2.accessoryId = rand.accessoryId;
      }
      updateSkinModalUI();
    });
  }

  if (btnResetDefault) {
    btnResetDefault.addEventListener('click', () => {
      playSFX('button');
      if (currentEditingPlayer === 1) {
        tempSkinP1 = { paletteId: 'classic-orange', accessoryId: 'none' };
      } else {
        tempSkinP2 = { paletteId: 'mint-teal', accessoryId: 'none' };
      }
      updateSkinModalUI();
    });
  }

  if (paletteGrid) {
    paletteGrid.innerHTML = SKIN_PALETTES.map(p => `
      <button class="palette-swatch" data-id="${p.id}" style="background:${p.color};" title="${p.name}">
        ${p.name.split(' ')[0]}
      </button>
    `).join('');

    paletteGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.palette-swatch');
      if (btn) {
        playSFX('button');
        const pid = btn.dataset.id;
        if (currentEditingPlayer === 1) tempSkinP1.paletteId = pid;
        else tempSkinP2.paletteId = pid;
        updateSkinModalUI();
      }
    });
  }

  if (accessoryGrid) {
    accessoryGrid.innerHTML = ACCESSORIES.map(a => `
      <button class="accessory-card" data-id="${a.id}">
        <span style="font-size:1.2rem;">${a.icon || '✨'}</span>
        <span>${a.name}</span>
      </button>
    `).join('');

    accessoryGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.accessory-card');
      if (btn) {
        playSFX('button');
        const aid = btn.dataset.id;
        if (currentEditingPlayer === 1) tempSkinP1.accessoryId = aid;
        else tempSkinP2.accessoryId = aid;
        updateSkinModalUI();
      }
    });
  }

  document.getElementById('btnCloseSkinModal').addEventListener('click', closeSkinModal);

  document.getElementById('btnSaveSkinModal').addEventListener('click', () => {
    saveSkin(tempSkinP1, 1);
    saveSkin(tempSkinP2, 2);
    applySkinsToPlayers();
    playSFX('unlock');

    if (isNetworkConnected()) {
      const activeSkin = getNetMode() === 'client' ? getSkin(2) : getSkin(1);
      networkSend({ type: 'skin', role: getNetMode(), skin: activeSkin });
    }
    closeSkinModal();
  });
}

// LIVE ANIMATED DUAL CATS ON MAIN MENU
const menuCatCanvas = document.getElementById('menuCatCanvas');
const menuCatCtx = menuCatCanvas ? menuCatCanvas.getContext('2d') : null;
let menuCatTick = 0;
let menuJumpPhase = 0;
const menuParticles = [];

function triggerMenuCatJump() {
  menuJumpPhase = 22;
  playSFX('jump');
  const w = menuCatCanvas ? menuCatCanvas.width : 540;
  const colors = ['#FF7A29', '#2EC4B6', '#FFD166', '#FF6B9D', '#A855F7', '#38BDF8'];
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 2.5 + Math.random() * 6;
    menuParticles.push({
      x: w / 2 + (Math.random() - 0.5) * 140,
      y: 120 + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 3.5,
      size: 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 35 + Math.random() * 25,
      maxLife: 60,
      isPaw: Math.random() > 0.6
    });
  }
}

if (menuCatCanvas) {
  menuCatCanvas.addEventListener('click', triggerMenuCatJump);
}

function renderMenuCatAvatar() {
  if (!menuCatCtx || currentScreen !== 'menu') return;
  menuCatTick += 0.045;

  const w = menuCatCanvas.width;
  const h = menuCatCanvas.height;
  menuCatCtx.clearRect(0, 0, w, h);

  // Jump animation calculation
  let jumpOffset1 = 0;
  let jumpOffset2 = 0;
  if (menuJumpPhase > 0) {
    jumpOffset1 = Math.sin((menuJumpPhase / 22) * Math.PI) * -38;
    jumpOffset2 = Math.sin(((Math.max(0, menuJumpPhase - 2)) / 22) * Math.PI) * -34;
    menuJumpPhase--;
  }

  // Periodic ambient sparkles/paw spawn
  if (Math.random() < 0.05) {
    menuParticles.push({
      x: w / 2 + (Math.random() - 0.5) * 60,
      y: 120,
      vx: (Math.random() - 0.5) * 1,
      vy: -1.2 - Math.random() * 1.5,
      size: 10 + Math.random() * 8,
      color: Math.random() > 0.5 ? '#FFD166' : '#FF6B9D',
      life: 42,
      maxLife: 42,
      isPaw: Math.random() > 0.4,
      isHeart: Math.random() <= 0.4
    });
  }

  // 1. DRAW IN-GAME PUZZLE PLATFORM UNDER THE CATS
  const platX = 50;
  const platY = 178;
  const platW = w - 100;
  const platH = 42;

  menuCatCtx.save();
  // Drop shadow
  menuCatCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  menuCatCtx.beginPath();
  menuCatCtx.roundRect(platX + 4, platY + 6, platW, platH, 10);
  menuCatCtx.fill();

  // Platform brick body (Coral arcade wall style)
  const platGrad = menuCatCtx.createLinearGradient(platX, platY, platX, platY + platH);
  platGrad.addColorStop(0, '#EE6C4D');
  platGrad.addColorStop(1, '#D1492B');
  menuCatCtx.fillStyle = platGrad;
  menuCatCtx.strokeStyle = '#293241';
  menuCatCtx.lineWidth = 3;
  menuCatCtx.beginPath();
  menuCatCtx.roundRect(platX, platY, platW, platH, 10);
  menuCatCtx.fill();
  menuCatCtx.stroke();

  // Top highlight line
  menuCatCtx.fillStyle = '#FFA187';
  menuCatCtx.fillRect(platX + 4, platY + 2, platW - 8, 4);

  // Vertical brick lines
  menuCatCtx.strokeStyle = 'rgba(41, 50, 65, 0.35)';
  menuCatCtx.lineWidth = 2;
  for (let bx = platX + 40; bx < platX + platW - 20; bx += 48) {
    menuCatCtx.beginPath();
    menuCatCtx.moveTo(bx, platY + 6);
    menuCatCtx.lineTo(bx, platY + platH - 4);
    menuCatCtx.stroke();
  }

  // Co-op Mechanical Floor Button (Green, depressed by player 2)
  const btnX = platX + platW - 90;
  const btnY = platY - 6;
  menuCatCtx.fillStyle = '#10B981';
  menuCatCtx.strokeStyle = '#293241';
  menuCatCtx.lineWidth = 2;
  menuCatCtx.beginPath();
  menuCatCtx.roundRect(btnX, btnY, 44, 8, [4, 4, 0, 0]);
  menuCatCtx.fill();
  menuCatCtx.stroke();

  // Push Block [2] on the left side of platform
  const blkX = platX + 16;
  const blkY = platY - 42;
  const blkGrad = menuCatCtx.createLinearGradient(blkX, blkY, blkX, blkY + 42);
  blkGrad.addColorStop(0, '#FFE082');
  blkGrad.addColorStop(1, '#FFB300');
  menuCatCtx.fillStyle = blkGrad;
  menuCatCtx.strokeStyle = '#293241';
  menuCatCtx.lineWidth = 2.5;
  menuCatCtx.beginPath();
  menuCatCtx.roundRect(blkX, blkY, 42, 42, 8);
  menuCatCtx.fill();
  menuCatCtx.stroke();
  // Block [2] badge
  menuCatCtx.fillStyle = '#FFFFFF';
  menuCatCtx.beginPath();
  menuCatCtx.arc(blkX + 21, blkY + 21, 12, 0, Math.PI * 2);
  menuCatCtx.fill();
  menuCatCtx.strokeStyle = '#293241';
  menuCatCtx.lineWidth = 2;
  menuCatCtx.stroke();
  menuCatCtx.fillStyle = '#293241';
  menuCatCtx.font = '900 13px sans-serif';
  menuCatCtx.textAlign = 'center';
  menuCatCtx.textBaseline = 'middle';
  menuCatCtx.fillText('2', blkX + 21, blkY + 22);

  menuCatCtx.restore();

  // 2. ELASTIC TETHER LINE BETWEEN P1 & P2
  const bobY1 = Math.sin(menuCatTick * 1.5) * 3.5 + jumpOffset1;
  const bobY2 = Math.sin((menuCatTick + 0.9) * 1.5) * 3.5 + jumpOffset2;
  const p1CenterX = w / 2 - 65;
  const p1CenterY = 178 + bobY1 - 38;
  const p2CenterX = w / 2 + 65;
  const p2CenterY = 178 + bobY2 - 38;

  menuCatCtx.save();
  menuCatCtx.beginPath();
  menuCatCtx.setLineDash([6, 5]);
  menuCatCtx.strokeStyle = '#EC4899';
  menuCatCtx.lineWidth = 3;
  menuCatCtx.shadowColor = '#EC4899';
  menuCatCtx.shadowBlur = 8;
  menuCatCtx.moveTo(p1CenterX, p1CenterY);
  menuCatCtx.quadraticCurveTo(w / 2, (p1CenterY + p2CenterY) / 2 + 18, p2CenterX, p2CenterY);
  menuCatCtx.stroke();
  menuCatCtx.restore();

  // 3. FLOATING GOLDEN KEY BETWEEN CATS
  const keyBob = Math.sin(menuCatTick * 2) * 6;
  const keyY = 66 + keyBob;
  menuCatCtx.save();
  menuCatCtx.translate(w / 2, keyY);
  // Key aura glow
  const keyGlow = menuCatCtx.createRadialGradient(0, 0, 4, 0, 0, 24);
  keyGlow.addColorStop(0, 'rgba(255, 233, 77, 0.6)');
  keyGlow.addColorStop(1, 'rgba(255, 233, 77, 0)');
  menuCatCtx.fillStyle = keyGlow;
  menuCatCtx.beginPath();
  menuCatCtx.arc(0, 0, 24, 0, Math.PI * 2);
  menuCatCtx.fill();
  // Key icon
  menuCatCtx.font = '24px sans-serif';
  menuCatCtx.textAlign = 'center';
  menuCatCtx.textBaseline = 'middle';
  menuCatCtx.fillText('🔑', 0, 0);
  menuCatCtx.restore();

  // 4. RENDER & UPDATE PARTICLES
  for (let i = menuParticles.length - 1; i >= 0; i--) {
    const p = menuParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      menuParticles.splice(i, 1);
      continue;
    }
    const alpha = Math.max(0, p.life / p.maxLife);
    menuCatCtx.save();
    menuCatCtx.globalAlpha = alpha;
    if (p.isHeart) {
      menuCatCtx.font = `${p.size}px sans-serif`;
      menuCatCtx.textAlign = 'center';
      menuCatCtx.fillText('💖', p.x, p.y);
    } else if (p.isPaw) {
      menuCatCtx.font = `${p.size}px sans-serif`;
      menuCatCtx.textAlign = 'center';
      menuCatCtx.shadowColor = p.color;
      menuCatCtx.shadowBlur = 8;
      menuCatCtx.fillText('🐾', p.x, p.y);
    } else {
      menuCatCtx.fillStyle = p.color;
      menuCatCtx.shadowColor = p.color;
      menuCatCtx.shadowBlur = 6;
      menuCatCtx.beginPath();
      menuCatCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      menuCatCtx.fill();
    }
    menuCatCtx.restore();
  }

  // 5. GET SKIN DATA FOR BOTH CATS
  const skin1 = getSkin(1);
  const pal1 = SKIN_PALETTES.find(p => p.id === skin1.paletteId) || SKIN_PALETTES[0];

  const skin2 = peerSkin || getSkin(2);
  const pal2 = SKIN_PALETTES.find(p => p.id === skin2.paletteId) || SKIN_PALETTES[1];

  // Update Main Menu Badge Labels
  const p1Badge = document.getElementById('menuCatP1Badge');
  const p2Badge = document.getElementById('menuCatP2Badge');
  if (p1Badge) p1Badge.textContent = `🟠 P1: ${pal1.name.split(' ')[0]}`;
  if (p2Badge) p2Badge.textContent = `🟢 P2: ${pal2.name.split(' ')[0]}`;

  // 6. DRAW TWO SCALED HERO CATS (Scale: 1.8x, truly prominent!)
  const scale = 1.8;

  menuCatCtx.save();
  menuCatCtx.scale(scale, scale);

  // Cat 1 (Player 1 - Left)
  const cat1 = {
    x: (w / 2 - 105) / scale,
    y: (platY + bobY1 - 44 * scale) / scale,
    w: 40,
    h: 44,
    color: pal1.color,
    darkColor: pal1.darkColor,
    hat: skin1.accessoryId,
    facing: 1,
    walkFrame: menuCatTick * 2,
    onGround: jumpOffset1 === 0,
    vx: 0,
    vy: jumpOffset1 !== 0 ? -2 : 0,
    label: '1P',
    inDoor: false,
    sweating: false,
    emoteTimer: 0
  };
  drawSingleCat(menuCatCtx, cat1, true);

  // Cat 2 (Player 2 - Right)
  const cat2 = {
    x: (w / 2 + 25) / scale,
    y: (platY + bobY2 - 44 * scale) / scale,
    w: 40,
    h: 44,
    color: pal2.color,
    darkColor: pal2.darkColor,
    hat: skin2.accessoryId,
    facing: -1,
    walkFrame: (menuCatTick + 0.9) * 2,
    onGround: jumpOffset2 === 0,
    vx: 0,
    vy: jumpOffset2 !== 0 ? -2 : 0,
    label: '2P',
    inDoor: false,
    sweating: false,
    emoteTimer: 0
  };
  drawSingleCat(menuCatCtx, cat2, true);

  menuCatCtx.restore();
}

function showEmoteBubble(playerIdx, text) {
  if (!state.players[playerIdx]) return;
  state.players[playerIdx].emoteText = text;
  state.players[playerIdx].emoteTimer = 130;
  playSFX('emote');
}

function triggerEmote(text) {
  const myIdx = getNetMode() === 'client' ? 1 : 0;
  showEmoteBubble(myIdx, text);
  if (isNetworkConnected()) {
    networkSend({ type: 'emote', playerIdx: myIdx, text });
  }
}

function sendHostState() {
  if (!isNetworkConnected()) return;
  networkSend({
    type: 'state',
    lvl: state.currentLevelIdx,
    clearTimer: state.levelClearTimer,
    allWon: state.allGameWon,
    elapsed: Math.round(levelElapsedMs),
    p: state.players.map(p => ({
      x: Math.round(p.x * 10) / 10,
      y: Math.round(p.y * 10) / 10,
      f: p.facing,
      wf: Math.round(p.walkFrame * 10) / 10,
      sw: p.sweating,
      inD: p.inDoor
    })),
    bl: state.blocks.map(b => ({ x: Math.round(b.x), y: Math.round(b.y), pr: b.pushersRight, pl: b.pushersLeft })),
    bt: state.buttons.map(b => ({ p: b.pressed, t: b.toggled })),
    mv: state.movers.map(m => ({ x: Math.round(m.x), y: Math.round(m.y) })),
    k: { x: Math.round(state.keyItem.x), y: Math.round(state.keyItem.y), c: state.keyItem.carrierIdx, u: state.keyItem.used },
    d: { u: state.door.unlocked, o: state.door.openProgress }
  });
}

function applyHostState(s) {
  if (s.lvl !== state.currentLevelIdx) {
    loadLevel(s.lvl, false);
  }
  state.levelClearTimer = s.clearTimer;
  state.allGameWon = s.allWon;
  if (typeof s.elapsed === 'number') {
    levelElapsedMs = s.elapsed;
    levelStartTime = performance.now() - levelElapsedMs;
  }
  s.p.forEach((sp, i) => {
    if (!state.players[i]) return;
    state.players[i].targetX = sp.x;
    state.players[i].targetY = sp.y;
    state.players[i].facing = sp.f;
    state.players[i].walkFrame = sp.wf;
    state.players[i].sweating = sp.sw;
    state.players[i].inDoor = sp.inD;
    if (Math.hypot(state.players[i].x - sp.x, state.players[i].y - sp.y) > 85) {
      state.players[i].x = sp.x;
      state.players[i].y = sp.y;
    }
    if (state.players[i].emoteTimer > 0) state.players[i].emoteTimer--;
  });
  s.bl.forEach((sb, i) => {
    if (!state.blocks[i]) return;
    state.blocks[i].targetX = sb.x;
    state.blocks[i].targetY = sb.y;
    state.blocks[i].pushersRight = sb.pr;
    state.blocks[i].pushersLeft = sb.pl;
    if (Math.abs(state.blocks[i].x - sb.x) > 60) {
      state.blocks[i].x = sb.x;
      state.blocks[i].y = sb.y;
    }
  });
  s.bt.forEach((sbt, i) => {
    if (!state.buttons[i]) return;
    state.buttons[i].pressed = sbt.p;
    state.buttons[i].toggled = sbt.t;
  });
  s.mv.forEach((sm, i) => {
    if (!state.movers[i]) return;
    state.movers[i].targetX = sm.x;
    state.movers[i].targetY = sm.y;
    if (Math.hypot(state.movers[i].x - sm.x, state.movers[i].y - sm.y) > 50) {
      state.movers[i].x = sm.x;
      state.movers[i].y = sm.y;
    }
  });
  state.keyItem.targetX = s.k.x;
  state.keyItem.targetY = s.k.y;
  state.keyItem.carrierIdx = s.k.c;
  state.keyItem.used = s.k.u;
  state.door.unlocked = s.d.u;
  state.door.openProgress = s.d.o;
}

function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

// Initialize Inputs and Network Handlers
initInput(
  // onReset
  () => {
    if (currentScreen !== 'game') return;
    if (getNetMode() === 'client' && isNetworkConnected()) {
      networkSend({ type: 'cmd', action: 'reset' });
    } else {
      loadLevel(state.currentLevelIdx, true);
    }
  },
  // onEmote
  triggerEmote,
  // onToggleFs
  toggleFullscreen
);

initNetwork({
  onData: (data) => {
    if (data.type === 'state' && getNetMode() === 'client') {
      applyHostState(data);
    } else if (data.type === 'emote') {
      showEmoteBubble(data.playerIdx, data.text);
    } else if (data.type === 'sfx' && getNetMode() === 'client') {
      playSFX(data.sfx);
    } else if (data.type === 'cmd' && getNetMode() === 'host') {
      if (data.action === 'reset') loadLevel(state.currentLevelIdx, true);
      if (data.action === 'level') loadLevel(data.levelIdx, true);
      if (data.action === 'skip') skipLevel();
    } else if (data.type === 'skin') {
      peerSkin = data.skin;
      applySkinsToPlayers();
    }
  },
  onStartGame: (role) => {
    networkSend({ type: 'skin', role, skin: getSkin() });
    if (role === 'host') {
      loadLevel(state.currentLevelIdx, false);
      sendHostState();
    }
    setScreen('game');
  }
});

// UI Event Listeners
function updateSoundUI(on) {
  const btn1 = document.getElementById('btnSound');
  const btn2 = document.getElementById('btnMenuSoundToggle');
  const txt = on ? '🔊' : '🔇';
  const txtLong = on ? '🔊 Sound: ON' : '🔇 Sound: OFF';
  if (btn1) btn1.textContent = txt;
  if (btn2) btn2.textContent = txtLong;
}

document.getElementById('btnSound').addEventListener('click', () => {
  const on = toggleSound();
  updateSoundUI(on);
});

const btnMenuSoundToggle = document.getElementById('btnMenuSoundToggle');
if (btnMenuSoundToggle) {
  btnMenuSoundToggle.addEventListener('click', () => {
    const on = toggleSound();
    updateSoundUI(on);
  });
}

document.getElementById('btnFullscreen').addEventListener('click', toggleFullscreen);

const btnMenuFsToggle = document.getElementById('btnMenuFsToggle');
if (btnMenuFsToggle) {
  btnMenuFsToggle.addEventListener('click', toggleFullscreen);
}

document.addEventListener('fullscreenchange', () => {
  const isFs = !!document.fullscreenElement;
  const b1 = document.getElementById('btnFullscreen');
  const b2 = document.getElementById('btnMenuFsToggle');
  if (b1) b1.textContent = isFs ? '↩' : '⛶';
  if (b2) b2.textContent = isFs ? '↩ Exit' : '⛶ Fullscreen';
});

// Skip Level Buttons
document.getElementById('btnSkipLevel').addEventListener('click', skipLevel);
document.getElementById('btnPauseSkip').addEventListener('click', () => {
  skipLevel();
  if (isPaused) togglePause();
});

// In-Game Reset Button
document.getElementById('btnReset').addEventListener('click', () => {
  if (getNetMode() === 'client' && isNetworkConnected()) {
    networkSend({ type: 'cmd', action: 'reset' });
  } else {
    loadLevel(state.currentLevelIdx, true);
  }
});

// Pause Menu Handlers
document.getElementById('btnPause').addEventListener('click', togglePause);
document.getElementById('btnPauseResume').addEventListener('click', togglePause);
document.getElementById('btnPauseReset').addEventListener('click', () => {
  if (getNetMode() === 'client' && isNetworkConnected()) {
    networkSend({ type: 'cmd', action: 'reset' });
  } else {
    loadLevel(state.currentLevelIdx, true);
  }
  togglePause();
});
document.getElementById('btnPauseLevelSelect').addEventListener('click', () => {
  togglePause();
  setScreen('levelSelect');
});
document.getElementById('btnPauseMainMenu').addEventListener('click', () => {
  togglePause();
  setScreen('menu');
});

// Disconnect Button in Pause Menu
const btnDisconnect = document.getElementById('btnDisconnect');
if (btnDisconnect) {
  btnDisconnect.addEventListener('click', () => {
    leaveRoom();
    setNetMode('local');
    updateHeaderBadge();
    togglePause();
    setScreen('menu');
  });
}

// MAIN MENU BUTTONS
document.getElementById('btnMenuPlay').addEventListener('click', () => {
  setNetMode('local');
  updateHeaderBadge();
  loadLevel(state.currentLevelIdx, false);
  setScreen('game');
});

document.getElementById('btnMenuOnline').addEventListener('click', () => {
  document.getElementById('lobbyModal').classList.remove('hidden');
});

document.getElementById('btnMenuLevelSelect').addEventListener('click', () => {
  setScreen('levelSelect');
});

document.getElementById('btnMenuSkin').addEventListener('click', openSkinModal);

document.getElementById('btnMenuHowToPlay').addEventListener('click', () => {
  document.getElementById('howToPlayModal').classList.remove('hidden');
});

// How to Play Modal
document.getElementById('btnCloseHowToPlay').addEventListener('click', () => {
  document.getElementById('howToPlayModal').classList.add('hidden');
});
document.getElementById('btnGotIt').addEventListener('click', () => {
  document.getElementById('howToPlayModal').classList.add('hidden');
});

// Candy Crush Cat Journey Event Listeners
document.getElementById('btnCloseLevelSelect')?.addEventListener('click', () => {
  closeCandyLevelPopup();
  setScreen(state.players.length > 0 ? 'game' : 'menu');
});

document.getElementById('btnLevelSelectBack')?.addEventListener('click', () => {
  closeCandyLevelPopup();
  setScreen('menu');
});

document.getElementById('btnLevelSelectPlayCurrent')?.addEventListener('click', () => {
  closeCandyLevelPopup();
  loadLevel(state.currentLevelIdx, true);
  setScreen('game');
});

document.getElementById('btnCandyScrollToActive')?.addEventListener('click', () => {
  scrollToActiveLevel(true);
});

// Random level selector button
const btnRandom = document.getElementById('btnRandomLevel');
if (btnRandom) {
  btnRandom.addEventListener('click', () => {
    closeCandyLevelPopup();
    const randIdx = Math.floor(Math.random() * LEVELS.length);
    loadLevel(randIdx, true);
    playSFX('unlock');
    spawnConfetti(W / 2, H / 3, 35);
    setScreen('game');
  });
}

// World Tabs navigation
document.getElementById('candyWorldTabs')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.candy-world-tab');
  if (!btn) return;
  const w = parseInt(btn.getAttribute('data-world'), 10);
  document.querySelectorAll('.candy-world-tab').forEach(b => b.classList.toggle('active', b === btn));
  
  const worldLevels = [0, 20, 40, 60, 80];
  const targetIdx = worldLevels[w - 1] || 0;
  const scrollArea = document.getElementById('candyMapScroll');
  if (scrollArea) {
    const targetY = 8350 - targetIdx * 81;
    scrollArea.scrollTo({
      top: Math.max(0, targetY - scrollArea.clientHeight / 2),
      behavior: 'smooth'
    });
  }
});

// Candy Level Popup Controls
document.getElementById('btnCandyPopupClose')?.addEventListener('click', closeCandyLevelPopup);
document.getElementById('btnCandyPopupPlay')?.addEventListener('click', () => {
  closeCandyLevelPopup();
  loadLevel(selectedPopupLevelIdx, true);
  setScreen('game');
});

// Gift button in header
document.getElementById('btnCandyGift')?.addEventListener('click', () => {
  playSFX('win');
  spawnConfetti(W / 2, H / 3, 40);
});

// Online Lobby Modal Buttons
document.getElementById('btnCreateRoom').addEventListener('click', createRoom);
document.getElementById('btnJoinRoom').addEventListener('click', () => {
  const rawCode = document.getElementById('joinCodeInput').value.trim().toUpperCase();
  joinRoom(rawCode);
});
document.getElementById('btnCopyCode').addEventListener('click', () => {
  const code = getRoomCode();
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    setLobbyStatus(`📋 Code <b>${code}</b> copied to clipboard! Share it with your friend.`, '#DCFCE7');
  });
});
document.getElementById('btnCloseLobby').addEventListener('click', () => {
  document.getElementById('lobbyModal').classList.add('hidden');
});
document.getElementById('btnPlayLocal').addEventListener('click', () => {
  document.getElementById('lobbyModal').classList.add('hidden');
  setNetMode('local');
  updateHeaderBadge();
  loadLevel(state.currentLevelIdx, false);
  setScreen('game');
});

// ESC Key Pause
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (currentScreen === 'game') {
      togglePause();
    } else if (currentScreen === 'levelSelect') {
      setScreen('menu');
    }
  }
});

// Initialize Modals & Initial Level Load
initSkinModal();
loadLevel(0, false);
setScreen('menu');

// Main Game & Animation Loop (60 FPS)
function gameLoop() {
  if (currentScreen === 'menu') {
    renderMenuCatAvatar();
  } else if (currentScreen === 'game') {
    if (!isPaused) {
      const inputs = getPlayerInputs(
        getNetMode(),
        remoteInput,
        networkSend,
        isNetworkConnected
      );

      for (const k in justPressed) delete justPressed[k];
      touchState.jumpPressed = false;

      updatePhysicsEngine({
        state,
        inputs,
        netMode: getNetMode(),
        spawnDust,
        spawnConfetti,
        onResetLevel: () => loadLevel(state.currentLevelIdx, false),
        onAdvanceLevel: () => {
          recordLevelClear(state.currentLevelIdx, levelElapsedMs);
          if (state.currentLevelIdx < LEVELS.length - 1) {
            loadLevel(state.currentLevelIdx + 1, false);
          } else {
            state.allGameWon = true;
          }
        }
      });

      updateParticles();

      if (getNetMode() === 'host') {
        state.hostStateTick++;
        if (state.hostStateTick % 2 === 0) {
          sendHostState();
        }
      }

      updateTimer();
    }

    renderGame(ctx, state, LEVELS[state.currentLevelIdx]);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
