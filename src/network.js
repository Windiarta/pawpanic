import { io } from 'socket.io-client';
import { playSFX } from './audio.js';

let netMode = 'local'; // 'local' | 'host' | 'client'
let peer = null;
let conn = null;
let socket = null;
let isSocketPaired = false;
let roomCode = '';
let pingMs = 0;
let lastPingSent = 0;

let onDataCallback = null;
let onStartGameCallback = null;

const SESSION_KEY = 'picopark_session';

export function getSavedSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {}
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}

export function generateToken() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function leaveRoom() {
  clearSession();
  if (socket && socket.connected) {
    socket.emit('leave-room');
  }
  if (peer) {
    try { peer.destroy(); } catch (e) {}
    peer = null;
  }
  conn = null;
  netMode = 'local';
  isSocketPaired = false;
  roomCode = '';
  updateHeaderBadge();
  setLobbyStatus('Mode lokal aktif. Kamu telah keluar dari room.', '#F1F5F9');
}

export const remoteInput = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false
};

export function getNetMode() {
  return netMode;
}

export function setNetMode(mode) {
  netMode = mode;
}

export function getRoomCode() {
  return roomCode;
}

export function isNetworkConnected() {
  if (socket && socket.connected) {
    return isSocketPaired;
  }
  return !!(conn && conn.open);
}

export function networkSend(data) {
  if (socket && socket.connected) {
    socket.emit('game-msg', data);
  } else if (conn && conn.open) {
    conn.send(data);
  }
}

export function setLobbyStatus(msg, bg = '#F1F5F9') {
  const el = document.getElementById('lobbyStatus');
  if (el) {
    el.innerHTML = msg;
    el.style.background = bg;
  }
}

export function updateHeaderBadge() {
  const connDot = document.getElementById('connDot');
  const connText = document.getElementById('connText');
  const controlsHint = document.getElementById('controlsHint');
  const btnDisconnect = document.getElementById('btnDisconnect');

  if (btnDisconnect) {
    if (netMode !== 'local') {
      btnDisconnect.classList.remove('hidden');
    } else {
      btnDisconnect.classList.add('hidden');
    }
  }

  if (!connDot || !connText) return;

  if (netMode === 'local') {
    connDot.className = 'status-dot';
    connText.textContent = 'Local Mode (2 Players on 1 Screen)';
    if (controlsHint) controlsHint.innerHTML = '<b>Local Controls:</b> P1 [A/D Walk, W Jump] • P2 [◀/▶ Walk, ▲ Jump] • [R] Restart';
  } else if (netMode === 'host') {
    if (isNetworkConnected()) {
      connDot.className = 'status-dot online';
      connText.textContent = `Online (Host: ${roomCode}) • P2 Connected ${pingMs ? '(' + pingMs + 'ms)' : ''}`;
      if (controlsHint) controlsHint.innerHTML = '<b>You are Player 1:</b> Use [A/D] or [◀/▶] to Walk, [W / ▲ / Space] to Jump';
    } else {
      connDot.className = 'status-dot waiting';
      connText.textContent = `Waiting for P2... (Code: ${roomCode})`;
    }
  } else if (netMode === 'client') {
    if (isNetworkConnected()) {
      connDot.className = 'status-dot online';
      connText.textContent = `Online (Client: ${roomCode}) • Connected ${pingMs ? '(' + pingMs + 'ms)' : ''}`;
      if (controlsHint) controlsHint.innerHTML = '<b>You are Player 2:</b> Use [A/D] or [◀/▶] to Walk, [W / ▲ / Space] to Jump';
    } else {
      connDot.className = 'status-dot waiting';
      connText.textContent = `Connecting to ${roomCode}...`;
    }
  }
}

function generateShortCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function initNetwork(handlers) {
  onDataCallback = handlers.onData;
  onStartGameCallback = handlers.onStartGame;

  const isLocalhost = Boolean(
    typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.')
    )
  );

  const defaultRemoteServer = ''; // Nonaktif jika tidak ada backend khusus
  const customServer = (typeof window !== 'undefined' && (window.__SOCKET_SERVER__ || localStorage.getItem('pawpanic_server_url')));

  const serverOrigin = customServer || (isLocalhost ? window.location.origin : '');

  if (serverOrigin) {
    try {
      socket = io(serverOrigin, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 5000
      });

    socket.on('connect', () => {
      setLobbyStatus('⚡ Terhubung ke Game Server (Socket.IO siap). Buat room atau gabung kode!', '#EFF6FF');

      // Auto-reconnect with saved session if present
      const saved = getSavedSession();
      if (saved && saved.code && saved.token && saved.role) {
        setLobbyStatus(`⏳ Memulihkan sesi Room <b>${saved.code}</b>...`, '#FEF3C7');
        socket.emit('reconnect-room', { code: saved.code, token: saved.token, role: saved.role }, (res) => {
          if (res && res.ok) {
            roomCode = res.code;
            netMode = res.role === 'host' ? 'host' : 'client';
            isSocketPaired = true;
            updateHeaderBadge();
            playSFX('unlock');
            setLobbyStatus(`⚡ Reconnected to Room <b>${roomCode}</b>!`, '#DCFCE7');
            const modal = document.getElementById('lobbyModal');
            if (modal) modal.classList.add('hidden');
            if (onStartGameCallback) onStartGameCallback(netMode);
          } else {
            clearSession();
            netMode = 'local';
            isSocketPaired = false;
            updateHeaderBadge();
            setLobbyStatus('Previous room session expired. Please create a new room.', '#F1F5F9');
          }
        });
      }
    });

    socket.on('player-joined', () => {
      if (netMode === 'host') {
        isSocketPaired = true;
        updateHeaderBadge();
        playSFX('unlock');
        setLobbyStatus(`🎉 Player 2 joined Room <b>${roomCode}</b>! Have fun!`, '#DCFCE7');
        const modal = document.getElementById('lobbyModal');
        if (modal) setTimeout(() => modal.classList.add('hidden'), 650);
        if (onStartGameCallback) onStartGameCallback('host');
      }
    });

    socket.on('game-ready', () => {
      if (netMode === 'client') {
        isSocketPaired = true;
        updateHeaderBadge();
        playSFX('unlock');
        setLobbyStatus(`🎉 Successfully connected to Room <b>${roomCode}</b>! Have fun!`, '#DCFCE7');
        const modal = document.getElementById('lobbyModal');
        if (modal) setTimeout(() => modal.classList.add('hidden'), 650);
        if (onStartGameCallback) onStartGameCallback('client');
      }
    });

    socket.on('peer-reconnected', () => {
      isSocketPaired = true;
      updateHeaderBadge();
      setLobbyStatus(`🎉 Friend reconnected to Room <b>${roomCode}</b>!`, '#DCFCE7');
    });

    socket.on('peer-reconnecting', () => {
      isSocketPaired = false;
      updateHeaderBadge();
      setLobbyStatus(`⏳ Friend disconnected, waiting for reconnection...`, '#FEF3C7');
    });

    socket.on('game-msg', (data) => {
      handleIncomingPacket(data);
    });

    socket.on('peer-disconnected', (data) => {
      clearSession();
      setLobbyStatus(`⚠️ ${(data && data.reason) || 'Friend disconnected'}. Returned to Local Mode.`, '#FEE2E2');
      netMode = 'local';
      isSocketPaired = false;
      updateHeaderBadge();
    });
  } catch (e) {
    socket = null;
  }
} else {
  socket = null;
}

  // Ping interval
  setInterval(() => {
    if (isNetworkConnected()) {
      lastPingSent = performance.now();
      networkSend({ type: 'ping', t: lastPingSent });
    }
  }, 2000);
}

function handleIncomingPacket(data) {
  if (!data || !data.type) return;

  if (data.type === 'ping') {
    networkSend({ type: 'pong', t: data.t });
    return;
  }
  if (data.type === 'pong') {
    pingMs = Math.max(1, Math.round(performance.now() - data.t));
    updateHeaderBadge();
    return;
  }
  if (data.type === 'input' && netMode === 'host') {
    remoteInput.left = !!data.left;
    remoteInput.right = !!data.right;
    remoteInput.jump = !!data.jump;
    if (data.jumpPressed) remoteInput.jumpPressed = true;
    return;
  }

  if (onDataCallback) onDataCallback(data);
}

export function createRoom() {
  const token = generateToken();
  if (socket && socket.connected) {
    socket.emit('create-room', { token }, (res) => {
      if (res && res.ok) {
        roomCode = res.code;
        netMode = 'host';
        isSocketPaired = false;
        saveSession({ code: res.code, role: 'host', token: res.token || token });
        const hostDisplay = document.getElementById('hostCodeDisplay');
        if (hostDisplay) hostDisplay.textContent = roomCode;
        updateHeaderBadge();
        setLobbyStatus(`✅ Room <b>${roomCode}</b> is active on server! Share this code with your friend. Waiting for Player 2...`, '#DCFCE7');
      } else {
        setLobbyStatus('⚠️ Failed to create room on server.', '#FEE2E2');
      }
    });
    return;
  }

  // Fallback: PeerJS
  if (typeof window.Peer === 'undefined') {
    setLobbyStatus('⚠️ Network library not loaded. Check internet connection or start server.', '#FEE2E2');
    return;
  }
  if (peer) peer.destroy();

  roomCode = generateShortCode();
  const fullPeerId = 'picopark-id-' + roomCode.toLowerCase();
  const hostDisplay = document.getElementById('hostCodeDisplay');
  if (hostDisplay) hostDisplay.textContent = roomCode;
  setLobbyStatus(`⏳ Setting up room <b>${roomCode}</b> (WebRTC)...`, '#FEF3C7');

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ];

  peer = new window.Peer(fullPeerId, {
    debug: 1,
    config: { iceServers }
  });

  peer.on('open', () => {
    netMode = 'host';
    updateHeaderBadge();
    setLobbyStatus(`✅ Room <b>${roomCode}</b> ready! Share this code with your friend. Waiting for Player 2...`, '#DCFCE7');
  });

  peer.on('connection', (incomingConn) => {
    conn = incomingConn;
    setupPeerHandlers();
    conn.on('open', () => {
      isSocketPaired = true;
      updateHeaderBadge();
      playSFX('unlock');
      setLobbyStatus(`🎉 Player 2 joined Room <b>${roomCode}</b>! Have fun!`, '#DCFCE7');
      const modal = document.getElementById('lobbyModal');
      if (modal) setTimeout(() => modal.classList.add('hidden'), 650);

      if (onStartGameCallback) onStartGameCallback('host');
    });
  });

  peer.on('error', (err) => {
    setLobbyStatus(`⚠️ Failed to create room (${err.type}). Try clicking Create Room Code again.`, '#FEE2E2');
  });
}

export function joinRoom(rawCode) {
  if (!rawCode || rawCode.length < 3) {
    setLobbyStatus('⚠️ Please enter the 4-character room code from Player 1!', '#FEE2E2');
    return;
  }
  const token = generateToken();

  if (socket && socket.connected) {
    setLobbyStatus(`⏳ Connecting to Room <b>${rawCode}</b> on server...`, '#FEF3C7');
    socket.emit('join-room', { code: rawCode, token }, (res) => {
      if (res && res.ok) {
        roomCode = res.code;
        netMode = 'client';
        isSocketPaired = true;
        saveSession({ code: res.code, role: 'guest', token: res.token || token });
        updateHeaderBadge();
        playSFX('unlock');
        setLobbyStatus(`🎉 Successfully connected to Room <b>${roomCode}</b>! Have fun!`, '#DCFCE7');
        const modal = document.getElementById('lobbyModal');
        if (modal) setTimeout(() => modal.classList.add('hidden'), 650);
        if (onStartGameCallback) onStartGameCallback('client');
      } else {
        setLobbyStatus(`⚠️ ${(res && res.error) || 'Failed to connect to room'}`, '#FEE2E2');
      }
    });
    return;
  }

  // Fallback: PeerJS
  if (typeof window.Peer === 'undefined') {
    setLobbyStatus('⚠️ Network library not loaded. Check internet connection or start server.', '#FEE2E2');
    return;
  }

  if (peer) peer.destroy();
  roomCode = rawCode;
  setLobbyStatus(`⏳ Connecting to Room <b>${roomCode}</b> (WebRTC)...`, '#FEF3C7');

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ];

  peer = new window.Peer({
    debug: 1,
    config: { iceServers }
  });

  peer.on('open', () => {
    netMode = 'client';
    updateHeaderBadge();
    const targetPeerId = 'picopark-id-' + roomCode.toLowerCase();
    conn = peer.connect(targetPeerId, { reliable: true });
    setupPeerHandlers();
  });

  peer.on('error', (err) => {
    setLobbyStatus(`⚠️ Room <b>${roomCode}</b> not found (${err.type}). Ensure code is correct!`, '#FEE2E2');
  });
}

function setupPeerHandlers() {
  if (!conn) return;

  conn.on('open', () => {
    isSocketPaired = true;
    updateHeaderBadge();
    playSFX('unlock');
    setLobbyStatus(`🎉 Successfully connected to Room <b>${roomCode}</b>! Have fun!`, '#DCFCE7');
    const modal = document.getElementById('lobbyModal');
    if (modal) setTimeout(() => modal.classList.add('hidden'), 650);

    if (onStartGameCallback) onStartGameCallback(netMode);
  });

  conn.on('data', (data) => {
    handleIncomingPacket(data);
  });

  conn.on('close', () => {
    setLobbyStatus('⚠️ Connection lost. Returned to Local Mode.', '#FEE2E2');
    netMode = 'local';
    isSocketPaired = false;
    conn = null;
    updateHeaderBadge();
  });

  conn.on('error', (err) => {
    console.error('Peer connection error:', err);
    setLobbyStatus(`⚠️ P2P connection error: ${err.message || err.type || err}`, '#FEE2E2');
  });
}
