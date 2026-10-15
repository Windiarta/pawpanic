# DESIGN.MD — PAW PANIC!

Dokumen desain game teknis dan konseptual untuk **PAW PANIC!** (2-Player Co-Op Online Multiplayer Puzzle Platformer).

---

## 1. Ikhtisar Game (Overview)

- **Judul**: PAW PANIC!
- **Genre**: 2-Player Co-Op Puzzle Platformer
- **Inspirasi**: *Pico Park*
- **Platform**: Web Browser (Desktop, Tablet, Mobile)
- **Target Audiens**: Pemain kasual, teman, pasangan yang mencari game kerja sama santai namun menantang.
- **Pilar Utama**:
  1. **Kerja Sama Wajib**: Level tidak bisa diselesaikan sendirian; kedua pemain harus mencapai pintu keluar bersama.
  2. **Aksesibilitas Instan**: Tanpa instalasi, berjalan langsung di browser dengan kode room 4 karakter atau mode lokal 1 keyboard.
  3. **Fisika Kolaboratif**: Saling menumpuk (*stacking*), mendorong beban bersama, dan tali pengikat elastis (*tether*).

---

## 2. Mekanik Inti (Core Gameplay Mechanics)

### 2.1 Stacking (Tumpuk Karakter)
- Pemain dapat melompat dan mendarat di atas kepala rekannya.
- Pemain di bawah dapat bergerak dan membawa pemain di atasnya.
- Berfungsi untuk mencapai platform tinggi atau kunci yang tidak terjangkau lompatan biasa.

### 2.2 Blok Beban Co-Op (`req: 2`)
- Objek balok khusus yang membutuhkan kekuatan 2 pemain secara simultan untuk dapat digeser.
- Jika hanya 1 pemain yang mendorong, balok tidak bergerak dan memicu efek keringat/beban berat.

### 2.3 Tombol & Mover Interaktif
- **Hold Button**: Tombol yang harus terus diinjak pemain agar platform/lift tetap aktif di posisi target.
- **Toggle Switch**: Saklar yang mengubah status gerbang atau lift setiap kali diinjak/dilewati.
- **Sync Button**: Dua tombol yang harus diinjak bersamaan oleh kedua pemain dalam jendela waktu yang sama.
- **Movers**: Platform bergerak horizontal/vertikal yang dipicu oleh saklar atau berosilasi otomatis.

### 2.4 Kunci & Pintu Keluar (Key & Door)
- Salah satu pemain harus mengambil kunci emas untuk membuka gembok pintu keluar.
- Kedua kucing harus masuk ke dalam pintu keluar secara utuh untuk memicu status *Level Clear*.

### 2.5 Tali Pengikat Elastis (Tether / Bond)
- Menghubungkan kedua pemain dengan batas jarak tertentu (`tetherLength`).
- Menerapkan gaya tarik pegas elastis jika kedua pemain menjauh melebihi ambang batas tali, memaksa koordinasi lompatan dan momentum bersama.

---

## 3. Struktur Level & Progresi (100 Levels)

Terdapat **100 Level** berurutan yang dikelompokkan ke dalam 5 Tier:

| Tier | Rentang Level | Tema & Mekanik Kunci | Karakteristik Tantangan |
|---|---|---|---|
| **Tier 1** | Level 1 – 20 | **Foundations** (Dasar & Tumpukan) | Pengenalan stack jump, tombol sederhana, dan dorongan balok berat `[2]`. |
| **Tier 2** | Level 21 – 40 | **Sync & Timing** (Sinkronisasi Waktu) | Tombol ganda simultan (*twin sync*), celah jurang melebar, dan jembatan berwaktu. |
| **Tier 3** | Level 41 – 60 | **Tether Tension** (Tali Elastis) | Tali pengikat aktif terus-menerus dengan panjang tali yang semakin memendek (195px → 125px). |
| **Tier 4** | Level 61 – 80 | **Multitasking & Speed Lifts** | Lift berkecepatan tinggi, teka-teki multi-lantai, dan manipulasi saklar kompleks. |
| **Tier 5** | Level 81 – 100 | **Master Gauntlets & Finale** | Platform mikro sempit (hingga 85px), jurang lebar, tali maut, dan Level 100 Grand Finale. |

---

## 4. Arsitektur Teknis

```
picopark/
├── server.js               # Node.js + Express + Socket.io (Room Relay & Fallback Signaling)
├── src/
│   ├── config.js           # Konstanta fisika, dimensi canvas (960x540 base)
│   ├── physics.js          # Simulasi AABB collision, stacking, tether, platforming
│   ├── renderer.js         # Canvas 2D rendering, super-sampling 2x, partikel, emoticons
│   ├── levels.js           # Generator level prosedural-deterministik (100 levels)
│   ├── input.js            # Keyboard mapping (P1 WASD, P2 Arrows) & touch virtual d-pad
│   ├── network.js          # Socket.io room state, input streaming, PeerJS WebRTC P2P
│   ├── skin.js             # 16 palet warna kucing & 40+ aksesoris (topi, rambut, kacamata)
│   ├── audio.js            # Synthesizer Web Audio API tanpa asset eksternal
│   └── index.js            # Game loop, state machine, routing layar, HUD
```

### 4.1 Rendering & Layar
- **Resolusi Logis**: 960 × 540 (Rasio 16:9).
- **Resolusi Fisik Canvas**: 1920 × 1080 (Super-Sampling 2x untuk tepi tajam di layar Retina/HiDPI).
- **CSS Letterbox**: Skalasi responsif mempertahankan aspect ratio dengan margin hitam otomatis di berbagai orientasi layar.

### 4.2 Mesin Fisika (Custom 2D AABB)
- Kecepatan Gerak: `4.1 px/frame`
- Gravitasi: `0.52 px/frame²`
- Gaya Lompat: `-10.8 px/frame`
- Resolusi tabrakan berbasis sumbu independen (X lalu Y) untuk mencegah penetrasi dinding/platform bergerak.
- Deteksi tumpukan dinamis (*player-on-player platforming*).

### 4.3 Jaringan & Multi-Pemain
- **Model Otoritas**: Host-authoritative physics simulation.
  - **Host**: Menjalankan simulasi fisika lengkap, memancarkan state game (posisi, mover, blok, partikel) ke Client.
  - **Client**: Mengirim paket input pengguna (Left, Right, Jump) ke Host dan menginterpolasi posisi entitas.
- **Transpor Ganda**:
  - WebSocket (Socket.io) via Server Relay Node.js.
  - Fallback WebRTC DataChannel via PeerJS untuk direct P2P latensi rendah.
- **Sistem Reconnect**: Token sesi persisten di `localStorage` untuk pemulihan koneksi saat refresh browser.

### 4.4 Audio System
- Ditenagai murni oleh **Web Audio API** sintetis (tanpa file audio eksternal):
  - Nada lompat: Frequency ramp sine wave.
  - Suara tombol: Square wave klik tajam.
  - Suara kunci/kemenangan: Arpeggio akord harmonis.

---

## 5. Skema Kontrol

| Aksi | Pemain 1 (Local) | Pemain 2 (Local) | Mode Online | Touch Screen |
|---|---|---|---|---|
| **Kiri** | `A` | `Arrow Left` | `A` / `Arrow Left` | D-Pad Virtual Kiri |
| **Kanan** | `D` | `Arrow Right` | `D` / `Arrow Right` | D-Pad Virtual Kanan |
| **Lompat** | `W` / `Space` | `Arrow Up` / `Numpad 0` | `W` / `Space` / `Up` | Tombol `JUMP` |
| **Emote** | `E` | `Enter` | `E` | Tombol Emote |
| **Reset** | `R` | `R` | `R` (Host) | Tombol UI Reset |

---

## 6. Kustomisasi Karakter

- **16 Palet Warna**: Classic Orange, Mint Teal, Pastel Pink, Electric Purple, Neon Lime, Sky Blue, Solar Gold, Midnight Black, Crimson Red, Matcha Green, dll.
- **40+ Aksesoris**:
  - *Topi & Helm*: Crown, Tiara, Cap, Beret, Wizard Hat, Chef, Viking, Propeller Beanie.
  - *Rambut*: Bob Cut Diva, Glamour Ponytail, Ninja Headband, Bow, Flower.
  - *Kacamata & Wajah*: Pixel Thug Shades, Heart Glasses, VR Headset, Mustache.
  - *Sayap & Efek*: Angel Wings, Devil Wings, Cat Tail Bow, Halo.
- Karakter kustom disinkronkan ke pemain lain saat sesi lobi terbentuk.
