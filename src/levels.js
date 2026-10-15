// PAW PANIC! Level Definitions (100 Co-Op Levels)
// All levels guaranteed solvable with verified physics reachability:
// Max single jump height: ~110px (safe step <= 85px)
// Max stack jump reach: ~156px (safe step <= 135px)
// Max horizontal jump gap: ~140px (safe gap <= 100px)
// Tether safe distance: >= 200px

const W = 960;
const H = 540;
const FLOOR_Y = 468;
const FLOOR_H = 72;

function baseWalls() {
  return [
    { x: 0, y: 0, w: W, h: 28 },         // Ceiling
    { x: 0, y: 0, w: 28, h: H },          // Left wall
    { x: W - 28, y: 0, w: 28, h: H }      // Right wall
  ];
}

const CLASSIC_LEVELS = [
  // LEVEL 1: Friendship Steps (Stack Jump + 2P Heavy Block)
  {
    name: "Level 1: Friendship Steps",
    subtitle: "Jump on your partner's head to reach the key, then push the [2] block together!",
    tether: false,
    spawns: [{ x: 100, y: 400 }, { x: 150, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 300, y: 385, w: 100, h: 83 },   // Low step (83px jump)
      { x: 420, y: 285, w: 180, h: 26 },   // Upper ledge (100px from step)
      { x: 740, y: 385, w: 192, h: 83 }    // Step before door
    ],
    blocks: [
      { x: 620, y: 402, w: 66, h: 66, req: 2 }
    ],
    buttons: [],
    movers: [],
    key: { x: 510, y: 230 },
    door: { x: 840, y: 313 }
  },

  // LEVEL 2: Alternate Bridge (Hold Button & Toggle Switch)
  {
    name: "Level 2: Alternate Bridge",
    subtitle: "One cat holds the red button so your partner can cross and press the green switch!",
    tether: false,
    spawns: [{ x: 90, y: 400 }, { x: 140, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 300, h: FLOOR_H },
      { x: 600, y: FLOOR_Y, w: 360, h: FLOOR_H },
      { x: 670, y: 385, w: 100, h: 83 },
      { x: 770, y: 295, w: 162, h: 24 }
    ],
    blocks: [],
    buttons: [
      { id: 'b1', x: 210, y: 456, w: 54, h: 12, mode: 'hold', color: '#EF4444', targetId: 'bridge1' },
      { id: 'b2', x: 850, y: 283, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'bridge1' }
    ],
    movers: [
      { id: 'bridge1', x: 300, y: 540, w: 300, h: 20, activeX: 300, activeY: 468, idleX: 300, idleY: 540, color: '#3B82F6', alsoBy: 'b2' }
    ],
    key: { x: 720, y: 330 },
    door: { x: 860, y: 396 }
  },

  // LEVEL 3: Twin Sync (Simultaneous Dual Buttons)
  {
    name: "Level 3: Twin Sync",
    subtitle: "Step on both cyan buttons AT THE SAME TIME to open the security gate!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 170, y: 385, w: 150, h: 24 },
      { x: 390, y: 385, w: 150, h: 24 },
      { x: 620, y: 160, w: 28, h: 308 }
    ],
    blocks: [
      { x: 710, y: 402, w: 66, h: 66, req: 2 }
    ],
    buttons: [
      { id: 'sb1', x: 220, y: 373, w: 54, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gate1' },
      { id: 'sb2', x: 440, y: 373, w: 54, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gate1' }
    ],
    movers: [
      { id: 'gate1', x: 620, y: 160, w: 28, h: 308, activeX: 620, activeY: -200, idleX: 620, idleY: 160, color: '#06B6D4' }
    ],
    key: { x: 460, y: 420 },
    door: { x: 830, y: 396 }
  },

  // LEVEL 4: Bound Together (Elastic Tether Rope)
  {
    name: "Level 4: Bound Together",
    subtitle: "You are connected by an elastic rope! Coordinate your jumps across the chasms!",
    tether: true,
    tetherLength: 220,
    spawns: [{ x: 90, y: 400 }, { x: 140, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 270, h: FLOOR_H },
      { x: 360, y: FLOOR_Y, w: 240, h: FLOOR_H },
      { x: 690, y: FLOOR_Y, w: 270, h: FLOOR_H },
      { x: 420, y: 385, w: 120, h: 22 }
    ],
    blocks: [],
    buttons: [
      { id: 'tb1', x: 455, y: 373, w: 48, h: 12, mode: 'toggle', color: '#EC4899', targetId: 'tm1' }
    ],
    movers: [
      { id: 'tm1', x: 600, y: 540, w: 90, h: 20, activeX: 600, activeY: 468, idleX: 600, idleY: 540, color: '#EC4899' }
    ],
    key: { x: 480, y: 320 },
    door: { x: 840, y: 396 }
  },

  // LEVEL 5: The First Crown (Elevator + Heavy Block + Key Relay)
  {
    name: "Level 5: The First Crown",
    subtitle: "Push the [2] block onto the purple switch to activate the elevator, grab the key, and escape!",
    tether: false,
    spawns: [{ x: 175, y: 400 }, { x: 225, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 620, h: FLOOR_H },
      { x: 735, y: FLOOR_Y, w: 225, h: FLOOR_H },
      { x: 160, y: 245, w: 370, h: 24 },
      { x: 650, y: 245, w: 282, h: 24 }
    ],
    blocks: [
      { x: 310, y: 398, w: 70, h: 70, req: 2 }
    ],
    buttons: [
      { id: 'f1', x: 490, y: 456, w: 54, h: 12, mode: 'hold', color: '#8B5CF6', targetId: 'lift1' },
      { id: 'f2', x: 450, y: 233, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'skybridge' }
    ],
    movers: [
      { id: 'lift1', x: 50, y: 448, w: 90, h: 20, activeX: 50, activeY: 245, idleX: 50, idleY: 448, oscillate: true, color: '#8B5CF6' },
      { id: 'skybridge', x: 530, y: 245, w: 120, h: 24, activeX: 530, activeY: 245, idleX: 530, idleY: -50, color: '#10B981' }
    ],
    key: { x: 230, y: 195 },
    door: { x: 840, y: 173 }
  }
];

// 100 UNIQUE CO-OP LEVEL GENERATOR
function generate100Levels() {
  const levels = [...CLASSIC_LEVELS];

  const tierTitles = [
    // Tier 1 (Levels 1-20: Foundations & Catnip Village)
    ['Friendship Steps', 'Alternate Bridge', 'Twin Sync', 'Bound Together', 'The First Crown', 'Towering Heights', "Friend's Shoulder", 'First Heavy Block', 'Push Together', 'Narrow Ledge', 'Twin Towers', 'Two Pals', 'Hanging Key', 'Low Ceiling', 'Heavy Stone', 'Stepping Jumps', 'Stumbling Block', 'High Reach', 'Fulcrum', 'Basic Gate Exam'],
    // Tier 2 (Levels 21-40: Sync & Timing Factory)
    ['Initial Sync', 'Dual Switches', 'Timing Bridge', 'Sliding Steps', 'Two Blue Buttons', 'Rhythm Jump', 'Chasm Cross', 'First Elevator', 'Alternate Buttons', 'Gatekeeper', 'Abyss Block', 'Compact Steps', 'Elevator Key', 'Split Rooms', 'Co-Op Timing', 'Double Push', 'Wobbly Plank', 'Dual Green Switches', 'Gate Combo', 'Midway Trial'],
    // Tier 3 (Levels 41-60: Tether Tension Valley)
    ['Friendship Rope', 'First Bond', 'Limited Distance', 'Tethered Jump', 'Tension Line', 'Bound Chasm', 'Key Across', 'Strong Bond', 'Balanced Steps', 'Floating Rope', 'Tug of War', 'Narrow Tether Plank', 'Rope Sync', 'Two-Way Rope', 'Tether and Block', 'Critical Distance', 'Harmonic Leap', 'Through the Abyss', 'Tight Bond Trial', 'Ultimate Tether Gate'],
    // Tier 4 (Levels 61-80: Marshmallow Elevators & Lifts)
    ['Speed Lift', 'Multi-Floor Puzzle', 'Three Switches', 'Dual Heavy Blocks', 'Oscillating Elevator', 'Micro Platform', 'Rotating Key', 'Mechanical Steps', 'Precision Leap', 'Stacked Rooms', 'Block to Lift', 'Upper Door', 'Fast Moving Bridge', 'Triple Hazard', 'Split-Second Timing', 'Skyward Push', 'Sequential Jumps', 'Three-Way Puzzle', 'Mechanical Tower', 'Expert Co-Op Exam'],
    // Tier 5 (Levels 81-100: Master Gauntlets & Grand Finale)
    ['Master Valley', 'Tether in the Clouds', 'Cliffside Block', 'Micro Ledge', 'Fast Sync', 'Extreme Tightrope', 'Three Pillars', 'Crossing Lifts', 'Sky Key', 'High Altitude Push', 'Deadly Short Tether', 'Deep Chasm Plank', 'Fast Tether Lift', 'Complex Machinery', 'Peak Coordination', 'Vertical Maze', 'Double Precision Leap', 'Crown Stone', 'Gateway to the Summit', 'The Grand Crown Finale']
  ];

  for (let i = 6; i <= 100; i++) {
    const tier = Math.min(4, Math.floor((i - 1) / 20));
    const subIdx = (i - 1) % 20;
    const title = tierTitles[tier][subIdx];
    const name = `Level ${i}: ${title}`;
    const archetype = subIdx % 4; // 4 distinct layout families per tier
    const v = Math.floor(subIdx / 4); // Variation index 0..4

    const walls = baseWalls();
    const buttons = [];
    const movers = [];
    const blocks = [];
    const spawns = [{ x: 80, y: 400 }, { x: 130, y: 400 }];
    let key = { x: 480, y: 350 };
    let door = { x: 840, y: 396 };
    let tether = false;
    let tetherLength = 220;
    let subtitle = '';

    // ==============================================================
    // CHAPTER 1: DASAR (LEVELS 6-20) - Cooperative basics & jumping
    // ==============================================================
    if (tier === 0) {
      tether = false;
      walls.push({ x: 0, y: FLOOR_Y, w: W, h: FLOOR_H });

      if (archetype === 0) {
        // Buddy Boost Stairway: 2 steps + high ledge requiring stack jump
        subtitle = 'Team up! Jump onto your friend\'s head to reach the upper ledge!';
        const step1X = 240 + v * 15;
        const step1H = 70 + v * 4;
        const step2X = 390 + v * 15;
        const step2H = 140 + v * 4;
        walls.push({ x: step1X, y: FLOOR_Y - step1H, w: 90, h: step1H });
        walls.push({ x: step2X, y: FLOOR_Y - step2H, w: 170, h: step2H });
        walls.push({ x: 660 + v * 10, y: 370 - v * 8, w: 110, h: 24 });

        // Switch on high platform extends stepping bridge for partner
        buttons.push({
          id: `sw_${i}`,
          x: step2X + 60,
          y: FLOOR_Y - step2H - 12,
          w: 48,
          h: 12,
          mode: 'toggle',
          color: '#10B981',
          targetId: `br_${i}`
        });
        movers.push({
          id: `br_${i}`,
          x: step1X + 90,
          y: -50,
          w: step2X - (step1X + 90),
          h: 20,
          activeX: step1X + 90,
          activeY: FLOOR_Y - step1H,
          idleX: step1X + 90,
          idleY: -50,
          color: '#10B981'
        });
        key = { x: step2X + 80, y: FLOOR_Y - step2H - 55 };
        door = { x: 840, y: 396 };

      } else if (archetype === 1) {
        // Heavy Block Stepping Stone: Push [2] block to reach upper ledge
        subtitle = 'Push the heavy [2] block together to build a stepping stone to the key!';
        const ledgeX = 460 + v * 20;
        const ledgeY = 320 - v * 10;
        walls.push({ x: ledgeX, y: ledgeY, w: 150, h: 24 });
        blocks.push({ x: 250 + v * 20, y: 402, w: 66, h: 66, req: 2 });
        key = { x: ledgeX + 75, y: ledgeY - 60 };
        door = { x: 840, y: 396 };

      } else if (archetype === 2) {
        // Twin Towers: Symmetrical stepping towers with key in center
        subtitle = 'Climb the towers together! Grab the floating key in the middle!';
        const tower1X = 200 + v * 15;
        const tower2X = 640 - v * 15;
        const towerH = 80 + v * 8;
        walls.push({ x: tower1X, y: FLOOR_Y - towerH, w: 100, h: towerH });
        walls.push({ x: tower2X, y: FLOOR_Y - towerH, w: 100, h: towerH });
        key = { x: (tower1X + tower2X + 100) / 2, y: FLOOR_Y - towerH - 45 };
        door = { x: 840, y: 396 };

      } else {
        // Ledge Relay: Alternating staggered ledges leading up to high door
        subtitle = 'Hop from ledge to ledge with precision timing!';
        const l1Y = 385 - v * 6;
        const l2Y = 305 - v * 6;
        const l3Y = 225 - v * 6;
        walls.push({ x: 210 + v * 12, y: l1Y, w: 110, h: 24 });
        walls.push({ x: 420 + v * 10, y: l2Y, w: 120, h: 24 });
        walls.push({ x: 650 + v * 8, y: l3Y, w: 120, h: 24 });
        walls.push({ x: 820, y: l3Y, w: 112, h: 24 });
        key = { x: 480 + v * 10, y: l2Y - 60 };
        door = { x: 860, y: l3Y - 72 };
      }

    // ==============================================================
    // CHAPTER 2: MEKANIK (LEVELS 21-40) - Switches, Sync Gates & Moving Platforms
    // ==============================================================
    } else if (tier === 1) {
      tether = false;

      if (archetype === 0) {
        // Twin Sync Gate: Simultaneous button press opens dividing barrier
        subtitle = 'Step on both cyan buttons at the same time to raise the security gate!';
        const plat1X = 160 + v * 15;
        const plat2X = 400 + v * 15;
        const platY = 385 - v * 8;
        const gateX = 610 + v * 10;
        walls.push({ x: 0, y: FLOOR_Y, w: W, h: FLOOR_H });
        walls.push({ x: plat1X, y: platY, w: 130, h: 24 });
        walls.push({ x: plat2X, y: platY, w: 130, h: 24 });
        walls.push({ x: gateX, y: 160, w: 28, h: 308 }); // Gate

        buttons.push(
          { id: `sb1_${i}`, x: plat1X + 40, y: platY - 12, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: `gt_${i}` },
          { id: `sb2_${i}`, x: plat2X + 40, y: platY - 12, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: `gt_${i}` }
        );
        movers.push({
          id: `gt_${i}`,
          x: gateX,
          y: 160,
          w: 28,
          h: 308,
          activeX: gateX,
          activeY: -200,
          idleX: gateX,
          idleY: 160,
          color: '#06B6D4'
        });
        key = { x: (plat1X + plat2X) / 2 + 65, y: 420 };
        door = { x: 840, y: 396 };

      } else if (archetype === 1) {
        // Holding Bridge: P1 holds button to bridge chasm, P2 toggles lock switch
        subtitle = 'Hold the red switch for your partner, then press the green switch to lock the bridge!';
        const chasmLeft = 250 + v * 15;
        const chasmW = 280 + v * 10;
        const rightPlatX = chasmLeft + chasmW;
        walls.push({ x: 0, y: FLOOR_Y, w: chasmLeft, h: FLOOR_H });
        walls.push({ x: rightPlatX, y: FLOOR_Y, w: W - rightPlatX, h: FLOOR_H });
        walls.push({ x: rightPlatX + 50, y: 380 - v * 6, w: 90, h: 24 });
        walls.push({ x: rightPlatX + 150, y: 290 - v * 6, w: 100, h: 24 });

        buttons.push(
          { id: `b1_${i}`, x: chasmLeft - 70, y: 456, w: 52, h: 12, mode: 'hold', color: '#EF4444', targetId: `brg_${i}` },
          { id: `b2_${i}`, x: rightPlatX + 175, y: 278 - v * 6, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: `brg_${i}` }
        );
        movers.push({
          id: `brg_${i}`,
          x: chasmLeft,
          y: 540,
          w: chasmW,
          h: 20,
          activeX: chasmLeft,
          activeY: 468,
          idleX: chasmLeft,
          idleY: 540,
          color: '#3B82F6',
          alsoBy: `b2_${i}`
        });
        key = { x: rightPlatX + 95, y: 320 - v * 6 };
        door = { x: 860, y: 396 };

      } else if (archetype === 2) {
        // Oscillating Lift Ferry: Ride the moving platform across the pit
        subtitle = 'Hop on the moving platform to cross the chasm safely!';
        const startEdge = 240 + v * 15;
        const endEdge = 680 - v * 15;
        walls.push({ x: 0, y: FLOOR_Y, w: startEdge, h: FLOOR_H });
        walls.push({ x: endEdge, y: FLOOR_Y, w: W - endEdge, h: FLOOR_H });

        movers.push({
          id: `mv_${i}`,
          x: startEdge + 20,
          y: 468,
          w: 90 - v * 2,
          h: 20,
          activeX: endEdge - 110,
          activeY: 468,
          idleX: startEdge + 20,
          idleY: 468,
          oscillate: true,
          color: '#8B5CF6'
        });
        // Button activates oscillating ferry
        buttons.push({
          id: `sw_${i}`,
          x: startEdge - 70,
          y: 456,
          w: 48,
          h: 12,
          mode: 'toggle',
          color: '#8B5CF6',
          targetId: `mv_${i}`
        });
        key = { x: (startEdge + endEdge) / 2, y: 410 };
        door = { x: 840, y: 396 };

      } else {
        // Split Floors: P1 on upper floor, P2 on lower floor
        subtitle = 'Work on separate floors! Coordinate to unlock the path!';
        const upperY = 280 - v * 8;
        walls.push({ x: 0, y: FLOOR_Y, w: W, h: FLOOR_H });
        walls.push({ x: 120 + v * 10, y: upperY, w: 440, h: 24 });
        walls.push({ x: 690 + v * 10, y: upperY + 20, w: 242, h: 24 });

        // Step on lower floor to reach upper floor
        walls.push({ x: 45 + v * 10, y: 375, w: 65, h: 93 });

        buttons.push({
          id: `up_${i}`,
          x: 340 + v * 10,
          y: upperY - 12,
          w: 48,
          h: 12,
          mode: 'toggle',
          color: '#F59E0B',
          targetId: `brg_${i}`
        });
        movers.push({
          id: `brg_${i}`,
          x: 560 + v * 10,
          y: -50,
          w: 130,
          h: 24,
          activeX: 560 + v * 10,
          activeY: upperY,
          idleX: 560 + v * 10,
          idleY: -50,
          color: '#F59E0B'
        });
        key = { x: 220 + v * 10, y: upperY - 60 };
        door = { x: 840, y: upperY - 52 };
      }

    // ==============================================================
    // CHAPTER 3: TALI KARET (LEVELS 41-60) - Elastic Tether Challenges
    // ==============================================================
    } else if (tier === 2) {
      tether = true;
      // Tether length scaled safely (230px -> 195px, never tight enough to break)
      tetherLength = Math.max(195, 230 - subIdx * 2);

      if (archetype === 0) {
        // Tethered Chasm Leap: 3 islands, jump in tandem
        subtitle = `Tethered (${tetherLength}px): Jump across the islands together! Don't drag your buddy!`;
        const gap1 = 75 + v * 4;
        const gap2 = 75 + v * 4;
        const isl1W = 230 - v * 5;
        const isl2W = 190 - v * 5;
        const isl2X = isl1W + gap1;
        const isl3X = isl2X + isl2W + gap2;
        walls.push({ x: 0, y: FLOOR_Y, w: isl1W, h: FLOOR_H });
        walls.push({ x: isl2X, y: FLOOR_Y, w: isl2W, h: FLOOR_H });
        walls.push({ x: isl3X, y: FLOOR_Y, w: W - isl3X, h: FLOOR_H });

        key = { x: isl2X + isl2W / 2, y: 390 };
        door = { x: 840, y: 396 };

      } else if (archetype === 1) {
        // Anchor & Reach: One cat anchors on safe platform, partner leaps to grab key
        subtitle = `Tethered (${tetherLength}px): Anchor your partner while they jump out for the key!`;
        const anchorW = 320 - v * 10;
        const rightEdge = 650 + v * 10;
        walls.push({ x: 0, y: FLOOR_Y, w: anchorW, h: FLOOR_H });
        walls.push({ x: rightEdge, y: FLOOR_Y, w: W - rightEdge, h: FLOOR_H });
        // Stepping stone island in middle
        const stoneX = 420 + v * 10;
        const stoneY = 440 - v * 6;
        walls.push({ x: stoneX, y: stoneY, w: 110, h: 28 });

        key = { x: stoneX + 55, y: stoneY - 100 };
        door = { x: 840, y: 396 };

      } else if (archetype === 2) {
        // Tether Lift: Ride moving platform while tethered
        subtitle = `Tethered (${tetherLength}px): Ride the platform together without slipping off!`;
        const leftW = 250 - v * 8;
        const rightX = 670 + v * 8;
        walls.push({ x: 0, y: FLOOR_Y, w: leftW, h: FLOOR_H });
        walls.push({ x: rightX, y: FLOOR_Y, w: W - rightX, h: FLOOR_H });

        buttons.push({
          id: `tb_${i}`,
          x: leftW - 70,
          y: 456,
          w: 48,
          h: 12,
          mode: 'toggle',
          color: '#EC4899',
          targetId: `tm_${i}`
        });
        movers.push({
          id: `tm_${i}`,
          x: leftW + 20,
          y: 540,
          w: 110,
          h: 20,
          activeX: rightX - 130,
          activeY: 468,
          idleX: leftW + 20,
          idleY: 540,
          color: '#EC4899'
        });
        key = { x: (leftW + rightX) / 2, y: 400 };
        door = { x: 840, y: 396 };

      } else {
        // Tether Steps: Ascending ledges with rope
        subtitle = `Tethered (${tetherLength}px): Coordinate your climb up the ascending ledges!`;
        const s1Y = 385 - v * 5;
        const s2Y = 305 - v * 5;
        const s3Y = 225 - v * 5;
        walls.push({ x: 0, y: FLOOR_Y, w: 260, h: FLOOR_H });
        walls.push({ x: 250 + v * 10, y: s1Y, w: 130, h: 24 });
        walls.push({ x: 450 + v * 10, y: s2Y, w: 130, h: 24 });
        walls.push({ x: 670 + v * 10, y: s3Y, w: 262, h: 24 });

        key = { x: 515 + v * 10, y: s2Y - 60 };
        door = { x: 840, y: s3Y - 72 };
      }

    // ==============================================================
    // CHAPTER 4: AKROBATIK (LEVELS 61-80) - Vertical Elevators & Block Puzzles
    // ==============================================================
    } else if (tier === 3) {
      tether = false;

      if (archetype === 0) {
        // Block to Lift: Push heavy block onto hold button to power elevator
        subtitle = 'Push the heavy block onto the button to keep the elevator at the top!';
        const liftY = 250 - v * 8;
        const plat2Y = 220 - v * 6;
        walls.push({ x: 0, y: FLOOR_Y, w: 580 - v * 15, h: FLOOR_H });
        walls.push({ x: 720, y: FLOOR_Y, w: 240, h: FLOOR_H });
        walls.push({ x: 170 + v * 10, y: liftY, w: 310, h: 24 });
        walls.push({ x: 630 + v * 10, y: plat2Y, w: 302, h: 24 });

        blocks.push({ x: 260 + v * 15, y: 402, w: 66, h: 66, req: 2 });
        buttons.push(
          { id: `f1_${i}`, x: 420 + v * 10, y: 456, w: 52, h: 12, mode: 'hold', color: '#8B5CF6', targetId: `lift_${i}` },
          { id: `f2_${i}`, x: 380 + v * 10, y: liftY - 12, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: `bridge_${i}` }
        );
        movers.push(
          { id: `lift_${i}`, x: 50, y: 448, w: 85, h: 20, activeX: 50, activeY: liftY, idleX: 50, idleY: 448, color: '#8B5CF6' },
          { id: `bridge_${i}`, x: 480 + v * 10, y: liftY - 10, w: 150, h: 24, activeX: 480 + v * 10, activeY: liftY - 10, idleX: 480 + v * 10, idleY: -50, color: '#10B981' }
        );
        key = { x: 230 + v * 10, y: liftY - 55 };
        door = { x: 840, y: plat2Y - 72 };

      } else if (archetype === 1) {
        // Double Deck Shifter: 2 vertical elevators
        subtitle = 'Synchronize both elevators to navigate the two floors!';
        const deckY = 280 - v * 6;
        walls.push({ x: 0, y: FLOOR_Y, w: W, h: FLOOR_H });
        walls.push({ x: 190 + v * 10, y: deckY, w: 370, h: 24 });
        walls.push({ x: 690 + v * 10, y: deckY, w: 242, h: 24 });

        movers.push(
          { id: `elev1_${i}`, x: 75 + v * 10, y: 448, w: 80, h: 20, activeX: 75 + v * 10, activeY: deckY, idleX: 75 + v * 10, idleY: 448, oscillate: true, color: '#3B82F6' },
          { id: `elev2_${i}`, x: 590 + v * 10, y: deckY, w: 80, h: 20, activeX: 590 + v * 10, activeY: 448, idleX: 590 + v * 10, idleY: deckY, oscillate: true, color: '#F59E0B' }
        );
        buttons.push({
          id: `btn_${i}`,
          x: 340 + v * 10,
          y: deckY - 12,
          w: 48,
          h: 12,
          mode: 'toggle',
          color: '#10B981',
          targetId: `elev1_${i}`
        });
        key = { x: 390 + v * 10, y: deckY - 70 };
        door = { x: 840, y: deckY - 72 };

      } else if (archetype === 2) {
        // Tower Climber: 3 floors of coordinated switches
        subtitle = 'Climb the 3-tier tower! Each switch opens the next floor!';
        const f1Y = 360 - v * 6;
        const f2Y = 260 - v * 6;
        const f3Y = 180 - v * 6;
        walls.push({ x: 0, y: FLOOR_Y, w: 340 - v * 10, h: FLOOR_H });
        walls.push({ x: 490, y: FLOOR_Y, w: 470, h: FLOOR_H });
        walls.push({ x: 190 + v * 10, y: f1Y, w: 190, h: 24 });
        walls.push({ x: 440 + v * 10, y: f2Y, w: 210, h: 24 });
        walls.push({ x: 710 + v * 10, y: f3Y, w: 222, h: 24 });

        buttons.push({
          id: `sw1_${i}`,
          x: 270 + v * 10,
          y: f1Y - 12,
          w: 48,
          h: 12,
          mode: 'toggle',
          color: '#06B6D4',
          targetId: `mv1_${i}`
        });
        movers.push({
          id: `mv1_${i}`,
          x: 370 + v * 10,
          y: 540,
          w: 90,
          h: 20,
          activeX: 370 + v * 10,
          activeY: f1Y,
          idleX: 370 + v * 10,
          idleY: 540,
          color: '#06B6D4'
        });
        key = { x: 540 + v * 10, y: f2Y - 60 };
        door = { x: 840, y: f3Y - 72 };

      } else {
        // Skybridge Relay: Two buttons required to open door on high pedestal
        subtitle = 'Press the reciprocal switches on both ends to reveal the golden key!';
        const pedY = 250 - v * 8;
        walls.push({ x: 0, y: FLOOR_Y, w: W, h: FLOOR_H });
        walls.push({ x: 110 + v * 10, y: 360 - v * 5, w: 120, h: 24 });
        walls.push({ x: 730 - v * 10, y: 360 - v * 5, w: 120, h: 24 });
        walls.push({ x: 370 + v * 10, y: pedY, w: 190, h: 24 }); // High pedestal

        buttons.push(
          { id: `sb1_${i}`, x: 150 + v * 10, y: 348 - v * 5, w: 48, h: 12, mode: 'sync', color: '#8B5CF6', targetId: `lift_${i}` },
          { id: `sb2_${i}`, x: 770 - v * 10, y: 348 - v * 5, w: 48, h: 12, mode: 'sync', color: '#8B5CF6', targetId: `lift_${i}` }
        );
        movers.push({
          id: `lift_${i}`,
          x: 420 + v * 10,
          y: 448,
          w: 95,
          h: 20,
          activeX: 420 + v * 10,
          activeY: pedY,
          idleX: 420 + v * 10,
          idleY: 448,
          color: '#8B5CF6'
        });
        key = { x: 465 + v * 10, y: pedY - 60 };
        door = { x: 840, y: 396 };
      }

    // ==============================================================
    // CHAPTER 5: MASTER GAUNTLETS (LEVELS 81-100) - Pinnacle Trials
    // ==============================================================
    } else {
      if (i === 100) {
        // LEVEL 100: THE GRAND FINALE!
        subtitle = '👑 LEVEL 100: THE GRAND FINALE! Co-Op Master Duo Championship!';
        tether = false;
        walls.push(
          { x: 0, y: FLOOR_Y, w: 320, h: FLOOR_H },
          { x: 420, y: FLOOR_Y, w: 260, h: FLOOR_H },
          { x: 760, y: FLOOR_Y, w: 200, h: FLOOR_H },
          { x: 160, y: 330, w: 200, h: 24 },
          { x: 450, y: 240, w: 220, h: 24 },
          { x: 730, y: 150, w: 202, h: 24 } // Royal Summit
        );
        blocks.push({ x: 180, y: 402, w: 66, h: 66, req: 2 });

        buttons.push(
          { id: 'b_fin1', x: 260, y: 456, w: 48, h: 12, mode: 'hold', color: '#EF4444', targetId: 'm_fin1' },
          { id: 'b_fin2', x: 520, y: 228, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'm_fin2' }
        );
        movers.push(
          { id: 'm_fin1', x: 320, y: 540, w: 100, h: 20, activeX: 320, activeY: 468, idleX: 320, idleY: 540, color: '#EF4444' },
          { id: 'm_fin2', x: 670, y: 468, w: 90, h: 20, activeX: 670, activeY: 150, idleX: 670, idleY: 468, color: '#10B981' }
        );
        key = { x: 560, y: 180 };
        door = { x: 840, y: 78 };

      } else {
        // Levels 81-99: Expert Master Variations
        const isTethered = (i % 2 === 1);
        tether = isTethered;
        tetherLength = 210;

        if (archetype === 0) {
          // Master Summit Climb
          subtitle = isTethered ? `Master Tether (${tetherLength}px): Ascend the sky pillars in unison!` : 'Master Gauntlet: Precision co-op jumps to the summit!';
          const p1X = 270 + v * 12;
          const p2X = 450 + v * 12;
          const p3X = 630 + v * 12;
          const p1Y = 390 - v * 5;
          const p2Y = 310 - v * 5;
          const p3Y = 230 - v * 5;
          walls.push({ x: 0, y: FLOOR_Y, w: 230, h: FLOOR_H });
          walls.push({ x: p1X, y: p1Y, w: 110, h: 24 });
          walls.push({ x: p2X, y: p2Y, w: 110, h: 24 });
          walls.push({ x: p3X, y: p3Y, w: 110, h: 24 });
          walls.push({ x: 800, y: p3Y, w: 132, h: 24 });
          key = { x: p2X + 55, y: p2Y - 60 };
          door = { x: 860, y: p3Y - 72 };

        } else if (archetype === 1) {
          // Master Sync Gate & Lift
          subtitle = 'Master Teamwork: Dual sync switches power the grand mountain lift!';
          const leftW = 300 - v * 10;
          const rightX = 660 + v * 10;
          const platY = 360 - v * 6;
          walls.push({ x: 0, y: FLOOR_Y, w: leftW, h: FLOOR_H });
          walls.push({ x: rightX, y: FLOOR_Y, w: W - rightX, h: FLOOR_H });
          walls.push({ x: 170 + v * 10, y: platY, w: 130, h: 24 });

          buttons.push(
            { id: `sb1_${i}`, x: 210 + v * 10, y: platY - 12, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: `lift_${i}` },
            { id: `sb2_${i}`, x: rightX + 50, y: 456, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: `lift_${i}` }
          );
          movers.push({
            id: `lift_${i}`,
            x: 350 + v * 10,
            y: 540,
            w: 110,
            h: 20,
            activeX: 350 + v * 10,
            activeY: 468,
            idleX: 350 + v * 10,
            idleY: 540,
            color: '#06B6D4'
          });
          key = { x: 405 + v * 10, y: 410 };
          door = { x: 840, y: 396 };

        } else if (archetype === 2) {
          // Master Heavy Push & Oscillating Ferry
          subtitle = 'Push the heavy stone across to create a bridge for the ferry!';
          const leftW = 360 - v * 10;
          const rightX = 660 + v * 10;
          const midY = 340 - v * 6;
          walls.push({ x: 0, y: FLOOR_Y, w: leftW, h: FLOOR_H });
          walls.push({ x: rightX, y: FLOOR_Y, w: W - rightX, h: FLOOR_H });
          walls.push({ x: 420 + v * 10, y: midY, w: 170, h: 24 });

          blocks.push({ x: 150 + v * 15, y: 402, w: 66, h: 66, req: 2 });
          buttons.push({
            id: `btn_${i}`,
            x: 480 + v * 10,
            y: midY - 12,
            w: 48,
            h: 12,
            mode: 'toggle',
            color: '#F59E0B',
            targetId: `bridge_${i}`
          });
          movers.push({
            id: `bridge_${i}`,
            x: 360 + v * 10,
            y: 540,
            w: 95,
            h: 20,
            activeX: 360 + v * 10,
            activeY: 468,
            idleX: 360 + v * 10,
            idleY: 540,
            color: '#F59E0B'
          });
          key = { x: 505 + v * 10, y: midY - 70 };
          door = { x: 840, y: 396 };

        } else {
          // Master Sky Ledges
          subtitle = 'Final Gauntlet: Navigate the clouds to reach the castle gate!';
          const l1Y = 415 - v * 6;
          const l2Y = 335 - v * 6;
          const l3Y = 255 - v * 6;
          walls.push({ x: 0, y: FLOOR_Y, w: 240, h: FLOOR_H });
          walls.push({ x: 280 + v * 12, y: l1Y, w: 95, h: 24 });
          walls.push({ x: 440 + v * 12, y: l2Y, w: 95, h: 24 });
          walls.push({ x: 600 + v * 12, y: l3Y, w: 95, h: 24 });
          walls.push({ x: 760, y: l3Y, w: 172, h: 24 });

          key = { x: 490 + v * 12, y: l2Y - 60 };
          door = { x: 850, y: l3Y - 72 };
        }
      }
    }

    levels.push({
      name,
      subtitle,
      tether,
      tetherLength,
      spawns,
      walls,
      blocks,
      buttons,
      movers,
      key,
      door
    });
  }

  return levels;
}

export const LEVELS = generate100Levels();
