import mqtt from 'mqtt';
import { playSFX } from './audio.js';

let netMode = 'local'; // 'local' | 'host' | 'client'
let isSocketPaired = false;
let roomCode = '';
let pingMs = 0;
let lastPingSent = 0;

let mqttClient = null;
let currentPubTopic = '';
let currentSubTopic = '';

let onDataCallback = null;
let onStartGameCallback = null;

const SESSION_KEY = 'pawpanic_session';
const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';

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
  if (mqttClient) {
    try {
      if (currentPubTopic) {
        mqttClient.publish(currentPubTopic, JSON.stringify({ type: 'leave' }));
      }
      mqttClient.end(true);
    } catch (e) {}
    mqttClient = null;
  }
  netMode = 'local';
  isSocketPaired = false;
  roomCode = '';
  currentPubTopic = '';
  currentSubTopic = '';
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
  return isSocketPaired && !!mqttClient && mqttClient.connected;
}

export function networkSend(data) {
  if (!mqttClient || !mqttClient.connected || !currentPubTopic) return;
  try {
    mqttClient.publish(currentPubTopic, JSON.stringify(data));
  } catch (e) {
    console.error('[MQTT] Send error:', e);
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

  // Heartbeat / ping interval
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
  if (data.type === 'leave') {
    clearSession();
    setLobbyStatus('⚠️ Friend left the room. Returned to Local Mode.', '#FEE2E2');
    netMode = 'local';
    isSocketPaired = false;
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
  if (mqttClient) {
    try { mqttClient.end(true); } catch (e) {}
    mqttClient = null;
  }

  roomCode = generateShortCode();
  const hostDisplay = document.getElementById('hostCodeDisplay');
  if (hostDisplay) hostDisplay.textContent = roomCode;
  setLobbyStatus(`⏳ Creating room <b>${roomCode}</b> on cloud relay...`, '#FEF3C7');

  currentPubTopic = `pawpanic/rooms/${roomCode}/host_to_guest`;
  currentSubTopic = `pawpanic/rooms/${roomCode}/guest_to_host`;

  const clientId = 'pawpanic-host-' + Math.random().toString(36).slice(2, 10);
  mqttClient = mqtt.connect(MQTT_BROKER, {
    clientId,
    keepalive: 30,
    reconnectPeriod: 2000,
    clean: true
  });

  mqttClient.on('connect', () => {
    console.log('[MQTT Host] Connected to broker');
    mqttClient.subscribe(currentSubTopic, (err) => {
      if (err) {
        setLobbyStatus(`⚠️ Failed to subscribe room: ${err.message}`, '#FEE2E2');
        return;
      }
      netMode = 'host';
      isSocketPaired = false;
      updateHeaderBadge();
      setLobbyStatus(`✅ Room <b>${roomCode}</b> ready! Share this code with your friend. Waiting for Player 2...`, '#DCFCE7');
    });
  });

  mqttClient.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());

      if (data.type === 'join-request') {
        console.log('[MQTT Host] Guest requested to join');
        isSocketPaired = true;
        updateHeaderBadge();
        playSFX('unlock');
        setLobbyStatus(`🎉 Player 2 joined Room <b>${roomCode}</b>! Have fun!`, '#DCFCE7');

        // Acknowledge guest
        networkSend({ type: 'join-ack', roomCode });

        const modal = document.getElementById('lobbyModal');
        if (modal) setTimeout(() => modal.classList.add('hidden'), 650);

        if (onStartGameCallback) onStartGameCallback('host');
        return;
      }

      handleIncomingPacket(data);
    } catch (e) {
      console.error('[MQTT Host] Parse error:', e);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('[MQTT Host] Error:', err);
    setLobbyStatus(`⚠️ Cloud relay error (${err.message || err}).`, '#FEE2E2');
  });

  mqttClient.on('close', () => {
    if (netMode === 'host' && isSocketPaired) {
      setLobbyStatus('⚠️ Connection to cloud relay closed.', '#FEE2E2');
    }
  });
}

export function joinRoom(rawCode) {
  if (!rawCode || rawCode.length < 3) {
    setLobbyStatus('⚠️ Please enter the 4-character room code from Player 1!', '#FEE2E2');
    return;
  }

  if (mqttClient) {
    try { mqttClient.end(true); } catch (e) {}
    mqttClient = null;
  }

  roomCode = rawCode.trim().toUpperCase();
  setLobbyStatus(`⏳ Connecting to Room <b>${roomCode}</b> on cloud relay...`, '#FEF3C7');

  currentPubTopic = `pawpanic/rooms/${roomCode}/guest_to_host`;
  currentSubTopic = `pawpanic/rooms/${roomCode}/host_to_guest`;

  const clientId = 'pawpanic-guest-' + Math.random().toString(36).slice(2, 10);
  mqttClient = mqtt.connect(MQTT_BROKER, {
    clientId,
    keepalive: 30,
    reconnectPeriod: 2000,
    clean: true
  });

  let ackReceived = false;

  mqttClient.on('connect', () => {
    console.log('[MQTT Guest] Connected to broker');
    mqttClient.subscribe(currentSubTopic, (err) => {
      if (err) {
        setLobbyStatus(`⚠️ Failed to join room topic: ${err.message}`, '#FEE2E2');
        return;
      }
      netMode = 'client';
      updateHeaderBadge();

      // Send join request periodically until acked
      const sendJoin = () => {
        if (!ackReceived && mqttClient && mqttClient.connected) {
          networkSend({ type: 'join-request' });
        }
      };

      sendJoin();
      const joinInterval = setInterval(() => {
        if (ackReceived) {
          clearInterval(joinInterval);
        } else {
          sendJoin();
        }
      }, 800);

      setTimeout(() => {
        clearInterval(joinInterval);
        if (!ackReceived) {
          setLobbyStatus(`⚠️ Room <b>${roomCode}</b> not responding. Check if Player 1 is waiting on screen!`, '#FEE2E2');
        }
      }, 10000);
    });
  });

  mqttClient.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());

      if (data.type === 'join-ack') {
        if (!ackReceived) {
          ackReceived = true;
          console.log('[MQTT Guest] Join acknowledged by Host!');
          isSocketPaired = true;
          updateHeaderBadge();
          playSFX('unlock');
          setLobbyStatus(`🎉 Successfully connected to Room <b>${roomCode}</b>! Have fun!`, '#DCFCE7');

          const modal = document.getElementById('lobbyModal');
          if (modal) setTimeout(() => modal.classList.add('hidden'), 650);

          if (onStartGameCallback) onStartGameCallback('client');
        }
        return;
      }

      handleIncomingPacket(data);
    } catch (e) {
      console.error('[MQTT Guest] Parse error:', e);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('[MQTT Guest] Error:', err);
    setLobbyStatus(`⚠️ Connection error (${err.message || err}).`, '#FEE2E2');
  });

  mqttClient.on('close', () => {
    if (netMode === 'client' && isSocketPaired) {
      setLobbyStatus('⚠️ Connection to cloud relay closed.', '#FEE2E2');
    }
  });
}
