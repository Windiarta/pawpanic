const fs = require('fs');
const http = require('http');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3003;

// Serve static game files: prioritize Rsbuild `dist/` if built, otherwise fallback to root
const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : __dirname;
app.use(express.static(staticDir));

app.get('/health', (req, res) => {
  res.json({ ok: true, rooms: rooms.size, sockets: socketToRoom.size });
});

// Room management
// rooms[code] = { hostId, guestId, hostToken, guestToken, destroyTimer, createdAt }
const rooms = new Map();
const socketToRoom = new Map();

function generateToken() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateCode() : code;
}

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

io.on('connection', (socket) => {
  socket.on('create-room', (payload, callback) => {
    let cb = typeof payload === 'function' ? payload : callback;
    const token = (payload && typeof payload === 'object' && payload.token) ? payload.token : generateToken();
    const code = generateCode();

    socket.join(code);
    rooms.set(code, {
      hostId: socket.id,
      guestId: null,
      hostToken: token,
      guestToken: null,
      destroyTimer: null,
      createdAt: Date.now()
    });
    socketToRoom.set(socket.id, { code, role: 'host', token });

    if (typeof cb === 'function') {
      cb({ ok: true, code, token, role: 'host' });
    }
  });

  socket.on('join-room', (payload, callback) => {
    let cb = typeof payload === 'function' ? payload : callback;
    const rawCode = (payload && typeof payload === 'object') ? payload.code : payload;
    const token = (payload && typeof payload === 'object' && payload.token) ? payload.token : generateToken();
    const code = (rawCode || '').trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      if (typeof cb === 'function') {
        cb({ ok: false, error: `Room "${code}" not found. Please verify the code.` });
      }
      return;
    }

    if (room.guestId) {
      if (typeof cb === 'function') {
        cb({ ok: false, error: `Room "${code}" is already full (max 2 players).` });
      }
      return;
    }

    room.guestId = socket.id;
    room.guestToken = token;
    socket.join(code);
    socketToRoom.set(socket.id, { code, role: 'guest', token });

    if (typeof cb === 'function') {
      cb({ ok: true, code, token, role: 'guest' });
    }

    // Notify host that guest connected
    io.to(room.hostId).emit('player-joined', { code });
    // Notify guest to start
    socket.emit('game-ready', { role: 'guest', code });
  });

  socket.on('reconnect-room', ({ code: rawCode, token, role } = {}, callback) => {
    const code = (rawCode || '').trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      if (typeof callback === 'function') {
        callback({ ok: false, error: 'Room session has expired.' });
      }
      return;
    }

    const isHost = role === 'host' && token && token === room.hostToken;
    const isGuest = role === 'guest' && token && token === room.guestToken;

    if (!isHost && !isGuest) {
      if (typeof callback === 'function') {
        callback({ ok: false, error: 'Room session has expired.' });
      }
      return;
    }

    if (room.destroyTimer) {
      clearTimeout(room.destroyTimer);
      room.destroyTimer = null;
    }

    if (isHost) {
      room.hostId = socket.id;
    } else {
      room.guestId = socket.id;
    }

    socket.join(code);
    socketToRoom.set(socket.id, { code, role, token });

    if (typeof callback === 'function') {
      callback({ ok: true, code, role, token });
    }

    socket.to(code).emit('peer-reconnected', { role });
  });

  socket.on('leave-room', () => {
    const info = socketToRoom.get(socket.id);
    if (!info) return;

    const { code } = info;
    socketToRoom.delete(socket.id);

    const room = rooms.get(code);
    if (room) {
      if (room.destroyTimer) {
        clearTimeout(room.destroyTimer);
        room.destroyTimer = null;
      }
      rooms.delete(code);
      socket.to(code).emit('peer-disconnected', { reason: 'Player left the room' });
    }
    socket.leave(code);
  });

  // Relay game messages directly between host and guest in the room
  socket.on('game-msg', (data) => {
    const info = socketToRoom.get(socket.id);
    if (!info) return;
    socket.to(info.code).emit('game-msg', data);
  });

  socket.on('disconnect', () => {
    const info = socketToRoom.get(socket.id);
    if (!info) return;

    const { code, role } = info;
    socketToRoom.delete(socket.id);

    const room = rooms.get(code);
    if (!room) return;

    if (role === 'host') room.hostId = null;
    if (role === 'guest') room.guestId = null;

    socket.to(code).emit('peer-reconnecting', { role });

    if (room.destroyTimer) {
      clearTimeout(room.destroyTimer);
    }

    room.destroyTimer = setTimeout(() => {
      rooms.delete(code);
      io.to(code).emit('peer-disconnected', { reason: 'Reconnection timeout expired' });
    }, 40000);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log('='.repeat(52));
  console.log(`🐾 PAW PANIC! ONLINE SERVER RUNNING!`);
  console.log(`• Localhost: http://localhost:${PORT}`);
  console.log(`• Network (Wi-Fi): http://${localIp}:${PORT}`);
  console.log('='.repeat(52));
});
