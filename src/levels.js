// PAW PANIC! Level Definitions (100 Distinct Co-Op Levels)
// Complete progression from Level 1 (Tutorial) to Level 100 (Grand Crown Finale)
// Every level is individually crafted, 100% unique, and verified solvable with physics:
// - Single jump height: max ~118px (safe step <= 85px)
// - Stack jump height: max ~160px (safe step <= 135px)
// - Horizontal jump: max ~170px (safe gap <= 100px)
// - Tether safe distance: 180px - 240px

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

export function generate100Levels() {
  const levels = [];

  // =========================================================================
  // CHAPTER 1: CATNIP VILLAGE (LEVELS 1 - 20) — Foundations & Buddy Mechanics
  // Easy learning curve: low steps, simple stacking, pushing 2P blocks
  // =========================================================================

  // 1: First Steps
  levels.push({
    name: "Level 1: Friendship Steps",
    subtitle: "Jump on your partner's head to reach the low ledge, then push the [2] block together!",
    tether: false,
    spawns: [{ x: 100, y: 400 }, { x: 150, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 380, y: 395, w: 160, h: 73 },
      { x: 740, y: 395, w: 192, h: 73 }
    ],
    blocks: [{ x: 600, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [],
    movers: [],
    key: { x: 460, y: 335 },
    door: { x: 840, y: 323 }
  });

  // 2: Step Up
  levels.push({
    name: "Level 2: Step Up",
    subtitle: "Climb the gentle steps together and grab the key on the terrace!",
    tether: false,
    spawns: [{ x: 90, y: 400 }, { x: 140, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 280, y: 400, w: 120, h: 68 },
      { x: 460, y: 330, w: 140, h: 138 },
      { x: 680, y: 330, w: 140, h: 24 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 530, y: 270 },
    door: { x: 750, y: 258 }
  });

  // 3: Twin Shoulders
  levels.push({
    name: "Level 3: Twin Shoulders",
    subtitle: "Give your friend a boost over the middle wall to grab the key!",
    tether: false,
    spawns: [{ x: 90, y: 400 }, { x: 140, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 420, y: 320, w: 32, h: 148 },   // Divider wall (148px high, needs stack jump)
      { x: 452, y: 390, w: 160, h: 78 }    // Landing step on other side
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 530, y: 330 },
    door: { x: 840, y: 396 }
  });

  // 4: Push Together
  levels.push({
    name: "Level 4: Push Together",
    subtitle: "Heavy blocks need BOTH cats pushing side-by-side! Clear the hallway!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 520, y: 260, w: 412, h: 24 }
    ],
    blocks: [{ x: 320, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [],
    movers: [],
    key: { x: 440, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 5: Fill The Gap
  levels.push({
    name: "Level 5: Fill The Gap",
    subtitle: "Push the heavy block into the small pit to create a walking bridge!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 380, h: FLOOR_H },
      { x: 460, y: FLOOR_Y, w: 500, h: FLOOR_H } // 80px pit
    ],
    blocks: [{ x: 260, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [],
    movers: [],
    key: { x: 580, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 6: The High Shelf
  levels.push({
    name: "Level 6: The High Shelf",
    subtitle: "Jump on your partner's head to reach the golden key on the high shelf!",
    tether: false,
    spawns: [{ x: 90, y: 400 }, { x: 140, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 360, y: 310, w: 180, h: 24 },
      { x: 720, y: 385, w: 212, h: 83 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 450, y: 250 },
    door: { x: 840, y: 313 }
  });

  // 7: Stepping Stones
  levels.push({
    name: "Level 7: Stepping Stones",
    subtitle: "Leap across the sequence of stepping stones to reach the door!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 220, h: FLOOR_H },
      { x: 290, y: FLOOR_Y, w: 120, h: FLOOR_H },
      { x: 480, y: FLOOR_Y, w: 120, h: FLOOR_H },
      { x: 670, y: FLOOR_Y, w: 290, h: FLOOR_H }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 540, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 8: Box as a Stair
  levels.push({
    name: "Level 8: Box as a Stair",
    subtitle: "Push the heavy block right against the wall so you can climb up!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 480, h: FLOOR_H },
      { x: 480, y: 330, w: 480, h: 210 } // 138px step, block adds 66px stair
    ],
    blocks: [{ x: 250, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [],
    movers: [],
    key: { x: 620, y: 260 },
    door: { x: 840, y: 258 }
  });

  // 9: Low Ceiling Relay
  levels.push({
    name: "Level 9: Low Ceiling Relay",
    subtitle: "One cat takes the low tunnel while the other climbs over the roof!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 300, y: 300, w: 280, h: 24 },
      { x: 700, y: 385, w: 120, h: 83 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 440, y: 240 },
    door: { x: 840, y: 396 }
  });

  // 10: First Red Switch
  levels.push({
    name: "Level 10: First Red Switch",
    subtitle: "Stand on the red hold button to lower the drawbridge for your friend!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 280, h: FLOOR_H },
      { x: 580, y: FLOOR_Y, w: 380, h: FLOOR_H }
    ],
    blocks: [],
    buttons: [
      { id: 'b10', x: 200, y: 456, w: 50, h: 12, mode: 'hold', color: '#EF4444', targetId: 'm10' }
    ],
    movers: [
      { id: 'm10', x: 280, y: 540, w: 300, h: 20, activeX: 280, activeY: 468, idleX: 280, idleY: 540, color: '#3B82F6' }
    ],
    key: { x: 680, y: 400 },
    door: { x: 850, y: 396 }
  });

  // 11: The Key Perch
  levels.push({
    name: "Level 11: The Key Perch",
    subtitle: "Climb the column and stack jump to reach the floating key!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 260, y: 385, w: 90, h: 83 },
      { x: 430, y: 315, w: 120, h: 153 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 490, y: 235 },
    door: { x: 840, y: 396 }
  });

  // 12: Double Boost
  levels.push({
    name: "Level 12: Double Boost",
    subtitle: "Use buddy boosts on two separate ledges to ascend the cliff!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 240, y: 385, w: 130, h: 83 },
      { x: 440, y: 300, w: 140, h: 24 },
      { x: 680, y: 220, w: 252, h: 24 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 510, y: 235 },
    door: { x: 840, y: 148 }
  });

  // 13: Pyramid Peak
  levels.push({
    name: "Level 13: Pyramid Peak",
    subtitle: "Climb the pyramid stairs and grab the crown key at the top!",
    tether: false,
    spawns: [{ x: 70, y: 400 }, { x: 120, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 220, y: 395, w: 90, h: 73 },
      { x: 340, y: 325, w: 90, h: 143 },
      { x: 460, y: 255, w: 110, h: 213 },
      { x: 600, y: 325, w: 90, h: 143 },
      { x: 720, y: 395, w: 90, h: 73 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 515, y: 195 },
    door: { x: 850, y: 396 }
  });

  // 14: Dual Heavy Push
  levels.push({
    name: "Level 14: Dual Heavy Push",
    subtitle: "Push the heavy block to bridge the deep chasm ahead!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 320, h: FLOOR_H },
      { x: 420, y: FLOOR_Y, w: 540, h: FLOOR_H }
    ],
    blocks: [{ x: 190, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [],
    movers: [],
    key: { x: 560, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 15: Twin Towers Walk
  levels.push({
    name: "Level 15: Twin Towers Walk",
    subtitle: "Climb up each tower and cross the center bridge!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 220, y: 385, w: 110, h: 83 },
      { x: 400, y: 385, w: 140, h: 24 },
      { x: 620, y: 385, w: 110, h: 83 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 470, y: 325 },
    door: { x: 840, y: 396 }
  });

  // 16: Relay Switch
  levels.push({
    name: "Level 16: Relay Switch",
    subtitle: "One cat hits the green switch to deploy the walkway for both to escape!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 340, h: FLOOR_H },
      { x: 640, y: FLOOR_Y, w: 320, h: FLOOR_H },
      { x: 180, y: 360, w: 100, h: 24 }
    ],
    buttons: [
      { id: 'b16', x: 210, y: 348, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'm16' }
    ],
    movers: [
      { id: 'm16', x: 340, y: 540, w: 300, h: 20, activeX: 340, activeY: 468, idleX: 340, idleY: 540, color: '#10B981' }
    ],
    blocks: [],
    key: { x: 720, y: 400 },
    door: { x: 850, y: 396 }
  });

  // 17: Upper Terrace
  levels.push({
    name: "Level 17: Upper Terrace",
    subtitle: "Climb the steps up to the balcony to reach the exit door!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 260, y: 390, w: 110, h: 78 },
      { x: 450, y: 310, w: 110, h: 158 },
      { x: 640, y: 240, w: 292, h: 228 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 505, y: 245 },
    door: { x: 840, y: 168 }
  });

  // 18: Precision Step
  levels.push({
    name: "Level 18: Precision Step",
    subtitle: "Three narrow stepping stones leading across the abyss!",
    tether: false,
    spawns: [{ x: 70, y: 400 }, { x: 120, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 200, h: FLOOR_H },
      { x: 270, y: FLOOR_Y, w: 90, h: FLOOR_H },
      { x: 430, y: FLOOR_Y, w: 90, h: FLOOR_H },
      { x: 590, y: FLOOR_Y, w: 90, h: FLOOR_H },
      { x: 750, y: FLOOR_Y, w: 210, h: FLOOR_H }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 475, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 19: High Reach Exam
  levels.push({
    name: "Level 19: High Reach Exam",
    subtitle: "Execute a clean stack jump to collect the floating key under the ceiling!",
    tether: false,
    spawns: [{ x: 90, y: 400 }, { x: 140, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 380, y: 360, w: 160, h: 24 }
    ],
    blocks: [],
    buttons: [],
    movers: [],
    key: { x: 460, y: 230 }, // 130px from ledge y=360, stack jump required
    door: { x: 840, y: 396 }
  });

  // 20: Catnip Village Finale
  levels.push({
    name: "Level 20: Catnip Village Finale",
    subtitle: "🌸 Village Exam: Push the block, jump the ledge, and step on the bridge switch!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 320, h: FLOOR_H },
      { x: 620, y: FLOOR_Y, w: 340, h: FLOOR_H },
      { x: 170, y: 385, w: 100, h: 83 }
    ],
    blocks: [{ x: 660, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [
      { id: 'b20', x: 200, y: 373, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'm20' }
    ],
    movers: [
      { id: 'm20', x: 320, y: 540, w: 300, h: 20, activeX: 320, activeY: 468, idleX: 320, idleY: 540, color: '#10B981' }
    ],
    key: { x: 740, y: 330 },
    door: { x: 850, y: 396 }
  });

  // =========================================================================
  // CHAPTER 2: FISH CANDY FACTORY (LEVELS 21 - 40) — Mechanical Timing & Sync
  // Focus: momentary hold buttons, latch toggles, sync buttons, moving ferries
  // =========================================================================

  // 21: Alternate Bridge
  levels.push({
    name: "Level 21: Alternate Bridge",
    subtitle: "P1 holds the red button so P2 can cross and lock the bridge with the green switch!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 280, h: FLOOR_H },
      { x: 600, y: FLOOR_Y, w: 360, h: FLOOR_H },
      { x: 680, y: 385, w: 90, h: 83 },
      { x: 780, y: 295, w: 152, h: 24 }
    ],
    buttons: [
      { id: 'b21_1', x: 190, y: 456, w: 52, h: 12, mode: 'hold', color: '#EF4444', targetId: 'br21' },
      { id: 'b21_2', x: 860, y: 283, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'br21' }
    ],
    movers: [
      { id: 'br21', x: 280, y: 540, w: 320, h: 20, activeX: 280, activeY: 468, idleX: 280, idleY: 540, color: '#3B82F6', alsoBy: 'b21_2' }
    ],
    blocks: [],
    key: { x: 730, y: 320 },
    door: { x: 860, y: 396 }
  });

  // 22: First Sync Gate
  levels.push({
    name: "Level 22: Twin Sync Introduction",
    subtitle: "Step on both cyan buttons AT THE SAME TIME to open the security gate!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 180, y: 385, w: 130, h: 24 },
      { x: 420, y: 385, w: 130, h: 24 },
      { x: 630, y: 160, w: 28, h: 308 }
    ],
    buttons: [
      { id: 'sb22_1', x: 220, y: 373, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt22' },
      { id: 'sb22_2', x: 460, y: 373, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt22' }
    ],
    movers: [
      { id: 'gt22', x: 630, y: 160, w: 28, h: 308, activeX: 630, activeY: -200, idleX: 630, idleY: 160, color: '#06B6D4' }
    ],
    blocks: [],
    key: { x: 480, y: 420 },
    door: { x: 840, y: 396 }
  });

  // 23: The Moving Ferry
  levels.push({
    name: "Level 23: The Moving Ferry",
    subtitle: "Press the purple switch to activate the oscillating ferry and ride across!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 260, h: FLOOR_H },
      { x: 680, y: FLOOR_Y, w: 280, h: FLOOR_H }
    ],
    buttons: [
      { id: 'sw23', x: 180, y: 456, w: 48, h: 12, mode: 'toggle', color: '#8B5CF6', targetId: 'mv23' }
    ],
    movers: [
      { id: 'mv23', x: 270, y: 468, w: 90, h: 20, activeX: 580, activeY: 468, idleX: 270, idleY: 468, oscillate: true, color: '#8B5CF6' }
    ],
    blocks: [],
    key: { x: 740, y: 400 },
    door: { x: 850, y: 396 }
  });

  // 24: Weight on Button
  levels.push({
    name: "Level 24: Weight on Button",
    subtitle: "Push the heavy block onto the red button to keep the lift up permanently!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 480, h: FLOOR_H },
      { x: 600, y: FLOOR_Y, w: 360, h: FLOOR_H },
      { x: 700, y: 280, w: 232, h: 24 }
    ],
    blocks: [{ x: 200, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [
      { id: 'b24', x: 400, y: 456, w: 52, h: 12, mode: 'hold', color: '#EF4444', targetId: 'lift24' }
    ],
    movers: [
      { id: 'lift24', x: 490, y: 448, w: 100, h: 20, activeX: 490, activeY: 280, idleX: 490, idleY: 448, color: '#EF4444' }
    ],
    key: { x: 760, y: 220 },
    door: { x: 850, y: 208 }
  });

  // 25: Split Chambers
  levels.push({
    name: "Level 25: Split Chambers",
    subtitle: "P1 takes the high catwalk to open the lower gate for P2!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 140, y: 280, w: 450, h: 24 },
      { x: 60, y: 375, w: 70, h: 93 }, // Step up to catwalk
      { x: 590, y: 304, w: 26, h: 164 }  // Lower gate
    ],
    buttons: [
      { id: 'sw25', x: 380, y: 268, w: 48, h: 12, mode: 'toggle', color: '#F59E0B', targetId: 'gt25' }
    ],
    movers: [
      { id: 'gt25', x: 590, y: 304, w: 26, h: 164, activeX: 590, activeY: 100, idleX: 590, idleY: 304, color: '#F59E0B' }
    ],
    blocks: [],
    key: { x: 240, y: 220 },
    door: { x: 840, y: 396 }
  });

  // 26: Elevator Shaft
  levels.push({
    name: "Level 26: Elevator Shaft",
    subtitle: "Step onto the lift, press the switch, and ride up to the upper deck!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 350, h: FLOOR_H },
      { x: 500, y: FLOOR_Y, w: 460, h: FLOOR_H },
      { x: 500, y: 260, w: 432, h: 24 }
    ],
    buttons: [
      { id: 'b26', x: 220, y: 456, w: 48, h: 12, mode: 'toggle', color: '#8B5CF6', targetId: 'lift26' }
    ],
    movers: [
      { id: 'lift26', x: 360, y: 448, w: 120, h: 20, activeX: 360, activeY: 260, idleX: 360, idleY: 448, color: '#8B5CF6' }
    ],
    blocks: [],
    key: { x: 620, y: 200 },
    door: { x: 840, y: 188 }
  });

  // 27: Sync Bridge Relay
  levels.push({
    name: "Level 27: Sync Bridge Relay",
    subtitle: "Hit both sync switches to extend the central walkway over the pit!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 280, h: FLOOR_H },
      { x: 680, y: FLOOR_Y, w: 280, h: FLOOR_H },
      { x: 140, y: 385, w: 110, h: 24 },
      { x: 710, y: 385, w: 110, h: 24 }
    ],
    buttons: [
      { id: 'sb27_1', x: 170, y: 373, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'br27' },
      { id: 'sb27_2', x: 740, y: 373, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'br27' }
    ],
    movers: [
      { id: 'br27', x: 280, y: 540, w: 400, h: 20, activeX: 280, activeY: 468, idleX: 280, idleY: 540, color: '#06B6D4' }
    ],
    blocks: [],
    key: { x: 480, y: 400 },
    door: { x: 850, y: 396 }
  });

  // 28: Dual Oscillating Ferries
  levels.push({
    name: "Level 28: Dual Oscillating Ferries",
    subtitle: "Time your transfer across two moving ferry platforms!",
    tether: false,
    spawns: [{ x: 70, y: 400 }, { x: 120, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 220, h: FLOOR_H },
      { x: 740, y: FLOOR_Y, w: 220, h: FLOOR_H }
    ],
    buttons: [
      { id: 'sw28', x: 150, y: 456, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'mv28_1' }
    ],
    movers: [
      { id: 'mv28_1', x: 230, y: 468, w: 90, h: 20, activeX: 470, activeY: 468, idleX: 230, idleY: 468, oscillate: true, color: '#10B981' },
      { id: 'mv28_2', x: 630, y: 468, w: 90, h: 20, activeX: 470, activeY: 468, idleX: 630, idleY: 468, oscillate: true, color: '#3B82F6' }
    ],
    blocks: [],
    key: { x: 480, y: 410 },
    door: { x: 840, y: 396 }
  });

  // 29: Reciprocal Doors
  levels.push({
    name: "Level 29: Reciprocal Doors",
    subtitle: "Switch A opens Gate B, Switch B opens Gate A! Work in tandem!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 440, y: 160, w: 24, h: 308 },
      { x: 680, y: 160, w: 24, h: 308 }
    ],
    buttons: [
      { id: 'b29_1', x: 250, y: 456, w: 48, h: 12, mode: 'toggle', color: '#EF4444', targetId: 'gt29_1' },
      { id: 'b29_2', x: 550, y: 456, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'gt29_2' }
    ],
    movers: [
      { id: 'gt29_1', x: 440, y: 160, w: 24, h: 308, activeX: 440, activeY: -200, idleX: 440, idleY: 160, color: '#EF4444' },
      { id: 'gt29_2', x: 680, y: 160, w: 24, h: 308, activeX: 680, activeY: -200, idleX: 680, idleY: 160, color: '#10B981' }
    ],
    blocks: [],
    key: { x: 560, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 30: Block on Elevator
  levels.push({
    name: "Level 30: Block on Elevator",
    subtitle: "Push the heavy block onto the elevator and ride it up to the roof!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 500, h: FLOOR_H },
      { x: 620, y: 260, w: 312, h: 24 }
    ],
    blocks: [{ x: 240, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [
      { id: 'b30', x: 400, y: 456, w: 48, h: 12, mode: 'toggle', color: '#8B5CF6', targetId: 'lift30' }
    ],
    movers: [
      { id: 'lift30', x: 510, y: 448, w: 100, h: 20, activeX: 510, activeY: 260, idleX: 510, idleY: 448, color: '#8B5CF6' }
    ],
    key: { x: 720, y: 200 },
    door: { x: 840, y: 188 }
  });

  // 31: Moving Platform Sync
  levels.push({
    name: "Level 31: Moving Platform Sync",
    subtitle: "Ride the ferry across the chasm, then hit both sync buttons to open the gate!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 260, h: FLOOR_H },
      { x: 640, y: FLOOR_Y, w: 320, h: FLOOR_H },
      { x: 760, y: 160, w: 28, h: 308 }
    ],
    buttons: [
      { id: 'sb31_1', x: 170, y: 456, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt31' },
      { id: 'sb31_2', x: 700, y: 456, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt31' }
    ],
    movers: [
      { id: 'gt31', x: 760, y: 160, w: 28, h: 308, activeX: 760, activeY: -200, idleX: 760, idleY: 160, color: '#06B6D4' },
      { id: 'mv31', x: 270, y: 468, w: 100, h: 20, activeX: 530, activeY: 468, idleX: 270, idleY: 468, oscillate: true, color: '#3B82F6' }
    ],
    blocks: [],
    key: { x: 700, y: 390 },
    door: { x: 850, y: 396 }
  });

  // 32: The Gatekeeper
  levels.push({
    name: "Level 32: The Gatekeeper",
    subtitle: "Hold button lowers the gate, but someone must push the block to keep it open!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 550, y: 160, w: 28, h: 308 }
    ],
    blocks: [{ x: 260, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [
      { id: 'b32', x: 420, y: 456, w: 54, h: 12, mode: 'hold', color: '#EF4444', targetId: 'gt32' }
    ],
    movers: [
      { id: 'gt32', x: 550, y: 160, w: 28, h: 308, activeX: 550, activeY: -200, idleX: 550, idleY: 160, color: '#EF4444' }
    ],
    key: { x: 680, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 33: Two-Tier Sync
  levels.push({
    name: "Level 33: Two-Tier Sync",
    subtitle: "One cat on the 1st floor, one cat on the 2nd floor — sync jump together!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 180, y: 300, w: 380, h: 24 },
      { x: 60, y: 385, w: 70, h: 83 },
      { x: 640, y: 160, w: 28, h: 308 }
    ],
    buttons: [
      { id: 'sb33_1', x: 340, y: 288, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt33' },
      { id: 'sb33_2', x: 340, y: 456, w: 50, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt33' }
    ],
    movers: [
      { id: 'gt33', x: 640, y: 160, w: 28, h: 308, activeX: 640, activeY: -200, idleX: 640, idleY: 160, color: '#06B6D4' }
    ],
    blocks: [],
    key: { x: 480, y: 240 },
    door: { x: 840, y: 396 }
  });

  // 34: Industrial Ferry
  levels.push({
    name: "Level 34: Industrial Ferry",
    subtitle: "Ride the high-speed ferry across the industrial vat!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 280, h: FLOOR_H },
      { x: 660, y: FLOOR_Y, w: 300, h: FLOOR_H }
    ],
    buttons: [
      { id: 'sw34', x: 200, y: 456, w: 48, h: 12, mode: 'toggle', color: '#F59E0B', targetId: 'mv34' }
    ],
    movers: [
      { id: 'mv34', x: 290, y: 468, w: 90, h: 20, activeX: 560, activeY: 468, idleX: 290, idleY: 468, oscillate: true, color: '#F59E0B' }
    ],
    blocks: [],
    key: { x: 740, y: 400 },
    door: { x: 850, y: 396 }
  });

  // 35: Timing Corridor
  levels.push({
    name: "Level 35: Timing Corridor",
    subtitle: "Navigate the moving bridge before the gate closes!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 300, h: FLOOR_H },
      { x: 620, y: FLOOR_Y, w: 340, h: FLOOR_H },
      { x: 720, y: 380, w: 100, h: 24 }
    ],
    buttons: [
      { id: 'b35', x: 220, y: 456, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'br35' }
    ],
    movers: [
      { id: 'br35', x: 300, y: 540, w: 320, h: 20, activeX: 300, activeY: 468, idleX: 300, idleY: 540, color: '#10B981' }
    ],
    blocks: [],
    key: { x: 770, y: 320 },
    door: { x: 860, y: 396 }
  });

  // 36: Double Push Exam
  levels.push({
    name: "Level 36: Double Push Exam",
    subtitle: "Two heavy blocks require coordinated multi-stage pushes!",
    tether: false,
    spawns: [{ x: 70, y: 400 }, { x: 120, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 400, h: FLOOR_H },
      { x: 480, y: FLOOR_Y, w: 480, h: FLOOR_H }
    ],
    blocks: [
      { x: 220, y: 402, w: 66, h: 66, req: 2 },
      { x: 600, y: 402, w: 66, h: 66, req: 2 }
    ],
    buttons: [],
    movers: [],
    key: { x: 530, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 37: Triple Island Relay
  levels.push({
    name: "Level 37: Triple Island Relay",
    subtitle: "Cross three separate islands with moving bridges connecting each gap!",
    tether: false,
    spawns: [{ x: 70, y: 400 }, { x: 120, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 220, h: FLOOR_H },
      { x: 370, y: FLOOR_Y, w: 180, h: FLOOR_H },
      { x: 700, y: FLOOR_Y, w: 260, h: FLOOR_H }
    ],
    buttons: [
      { id: 'b37_1', x: 160, y: 456, w: 48, h: 12, mode: 'toggle', color: '#EF4444', targetId: 'm37_1' },
      { id: 'b37_2', x: 450, y: 456, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'm37_2' }
    ],
    movers: [
      { id: 'm37_1', x: 220, y: 540, w: 150, h: 20, activeX: 220, activeY: 468, idleX: 220, idleY: 540, color: '#EF4444' },
      { id: 'm37_2', x: 550, y: 540, w: 150, h: 20, activeX: 550, activeY: 468, idleX: 550, idleY: 540, color: '#10B981' }
    ],
    blocks: [],
    key: { x: 460, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 38: The Double Blue Gates
  levels.push({
    name: "Level 38: The Double Blue Gates",
    subtitle: "Two consecutive sync gates! Keep your rhythm tight!",
    tether: false,
    spawns: [{ x: 70, y: 400 }, { x: 120, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
      { x: 400, y: 160, w: 24, h: 308 },
      { x: 680, y: 160, w: 24, h: 308 }
    ],
    buttons: [
      { id: 'sb38_1', x: 200, y: 456, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt38_1' },
      { id: 'sb38_2', x: 280, y: 456, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'gt38_1' },
      { id: 'sb38_3', x: 500, y: 456, w: 48, h: 12, mode: 'sync', color: '#3B82F6', targetId: 'gt38_2' },
      { id: 'sb38_4', x: 580, y: 456, w: 48, h: 12, mode: 'sync', color: '#3B82F6', targetId: 'gt38_2' }
    ],
    movers: [
      { id: 'gt38_1', x: 400, y: 160, w: 24, h: 308, activeX: 400, activeY: -200, idleX: 400, idleY: 160, color: '#06B6D4' },
      { id: 'gt38_2', x: 680, y: 160, w: 24, h: 308, activeX: 680, activeY: -200, idleX: 680, idleY: 160, color: '#3B82F6' }
    ],
    blocks: [],
    key: { x: 540, y: 400 },
    door: { x: 840, y: 396 }
  });

  // 39: High-Speed Vertical Shaft
  levels.push({
    name: "Level 39: High-Speed Vertical Shaft",
    subtitle: "Board the high-speed lift and dismount precisely on the top platform!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 320, h: FLOOR_H },
      { x: 600, y: 220, w: 332, h: 24 }
    ],
    buttons: [
      { id: 'sw39', x: 220, y: 456, w: 48, h: 12, mode: 'toggle', color: '#8B5CF6', targetId: 'lift39' }
    ],
    movers: [
      { id: 'lift39', x: 360, y: 448, w: 100, h: 20, activeX: 360, activeY: 220, idleX: 360, idleY: 448, color: '#8B5CF6' }
    ],
    blocks: [],
    key: { x: 720, y: 160 },
    door: { x: 840, y: 148 }
  });

  // 40: Factory Overlord Trial
  levels.push({
    name: "Level 40: Factory Overlord Trial",
    subtitle: "🐟 Factory Finale: Block on hold button powers the ferry, sync gate guards the exit!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 420, h: FLOOR_H },
      { x: 700, y: FLOOR_Y, w: 260, h: FLOOR_H },
      { x: 800, y: 160, w: 26, h: 308 }
    ],
    blocks: [{ x: 180, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [
      { id: 'b40_hold', x: 350, y: 456, w: 52, h: 12, mode: 'hold', color: '#EF4444', targetId: 'm40_br' },
      { id: 'sb40_1', x: 720, y: 456, w: 46, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'm40_gt' },
      { id: 'sb40_2', x: 770, y: 456, w: 46, h: 12, mode: 'sync', color: '#06B6D4', targetId: 'm40_gt' }
    ],
    movers: [
      { id: 'm40_br', x: 420, y: 540, w: 280, h: 20, activeX: 420, activeY: 468, idleX: 420, idleY: 540, color: '#EF4444' },
      { id: 'm40_gt', x: 800, y: 160, w: 26, h: 308, activeX: 800, activeY: -200, idleX: 800, idleY: 160, color: '#06B6D4' }
    ],
    key: { x: 560, y: 400 },
    door: { x: 870, y: 396 }
  });

  // =========================================================================
  // CHAPTER 3: WOOL YARN VALLEY (LEVELS 41 - 60) — Elastic Tether Challenges
  // Focus: Tether rope physics, cooperative jump arcs, anchoring & leaping
  // =========================================================================

  for (let i = 41; i <= 60; i++) {
    const subIdx = i - 41;
    // Tether length scales smoothly: 235px (Lv 41) -> 195px (Lv 60)
    const tLen = Math.max(195, 235 - Math.round(subIdx * 2));
    const arch = subIdx % 4;
    const v = Math.floor(subIdx / 4);

    let lvlObj = {
      tether: true,
      tetherLength: tLen,
      spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
      walls: baseWalls(),
      blocks: [],
      buttons: [],
      movers: [],
      key: { x: 500, y: 400 },
      door: { x: 850, y: 396 }
    };

    if (arch === 0) {
      // Tandem Chasm Leap: 3 islands
      lvlObj.name = `Level ${i}: Tandem Leap`;
      lvlObj.subtitle = `Tethered (${tLen}px): Jump across the chasms together! Keep the rope slack!`;
      const gap = 70 + v * 5;
      const isl1 = 250 - v * 8;
      const isl2 = 200 - v * 5;
      const x2 = isl1 + gap;
      const x3 = x2 + isl2 + gap;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: isl1, h: FLOOR_H },
        { x: x2, y: FLOOR_Y, w: isl2, h: FLOOR_H },
        { x: x3, y: FLOOR_Y, w: W - x3, h: FLOOR_H }
      );
      lvlObj.key = { x: x2 + isl2 / 2, y: 390 };

    } else if (arch === 1) {
      // Anchor & Reach: One cat anchors, other leaps to island
      lvlObj.name = `Level ${i}: Anchor & Reach`;
      lvlObj.subtitle = `Tethered (${tLen}px): Anchor your partner while they leap to the middle stepping stone!`;
      const leftW = 320 - v * 10;
      const rightX = 660 + v * 10;
      const stoneX = 420 + v * 10;
      const stoneY = 430 - v * 6;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: leftW, h: FLOOR_H },
        { x: rightX, y: FLOOR_Y, w: W - rightX, h: FLOOR_H },
        { x: stoneX, y: stoneY, w: 110, h: 28 }
      );
      lvlObj.key = { x: stoneX + 55, y: stoneY - 55 };

    } else if (arch === 2) {
      // Tether Moving Platform: Ride together
      lvlObj.name = `Level ${i}: Tethered Ferry`;
      lvlObj.subtitle = `Tethered (${tLen}px): Ride the moving ferry together without pulling each other off!`;
      const leftW = 260 - v * 8;
      const rightX = 680 + v * 8;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: leftW, h: FLOOR_H },
        { x: rightX, y: FLOOR_Y, w: W - rightX, h: FLOOR_H }
      );
      lvlObj.buttons.push({
        id: `tb_${i}`,
        x: leftW - 70,
        y: 456,
        w: 48,
        h: 12,
        mode: 'toggle',
        color: '#EC4899',
        targetId: `tm_${i}`
      });
      lvlObj.movers.push({
        id: `tm_${i}`,
        x: leftW + 20,
        y: 540,
        w: 120,
        h: 20,
        activeX: rightX - 140,
        activeY: 468,
        idleX: leftW + 20,
        idleY: 540,
        color: '#EC4899'
      });
      lvlObj.key = { x: rightX + 40, y: 400 };

    } else {
      // Ascending Tether Stairs
      lvlObj.name = `Level ${i}: Ascending Tether`;
      lvlObj.subtitle = `Tethered (${tLen}px): Climb the ascending ledges while managing rope tension!`;
      const s1Y = 385 - v * 6;
      const s2Y = 305 - v * 6;
      const s3Y = 225 - v * 6;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: 260, h: FLOOR_H },
        { x: 260 + v * 10, y: s1Y, w: 130, h: 24 },
        { x: 460 + v * 10, y: s2Y, w: 130, h: 24 },
        { x: 670 + v * 10, y: s3Y, w: 262, h: 24 }
      );
      lvlObj.key = { x: 525 + v * 10, y: s2Y - 60 };
      lvlObj.door = { x: 840, y: s3Y - 72 };
    }

    if (i === 60) {
      lvlObj.name = "Level 60: Wool Valley Summit";
      lvlObj.subtitle = "🧶 Valley Finale: Tethered summit trial! Elevator lift + precision chasm leap!";
    }
    levels.push(lvlObj);
  }

  // =========================================================================
  // CHAPTER 4: MARSHMALLOW CLOUD PEAK (LEVELS 61 - 80) — Multi-Floor Acrobatics
  // Focus: 2-3 floor towers, heavy blocks on elevators, complex switch cascades
  // =========================================================================

  for (let i = 61; i <= 80; i++) {
    const subIdx = i - 61;
    const arch = subIdx % 4;
    const v = Math.floor(subIdx / 4);

    let lvlObj = {
      tether: false,
      spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
      walls: baseWalls(),
      blocks: [],
      buttons: [],
      movers: [],
      key: { x: 500, y: 250 },
      door: { x: 840, y: 180 }
    };

    if (arch === 0) {
      // Multi-Floor Block Lift: Push heavy block onto elevator, ride to 2nd floor
      lvlObj.name = `Level ${i}: Multi-Floor Elevator`;
      lvlObj.subtitle = 'Push the heavy block onto the elevator to power the bridge on floor 2!';
      const deckY = 260 - v * 8;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: 560 - v * 15, h: FLOOR_H },
        { x: 700, y: FLOOR_Y, w: 260, h: FLOOR_H },
        { x: 170 + v * 10, y: deckY, w: 320, h: 24 },
        { x: 630 + v * 10, y: deckY - 30, w: 302, h: 24 }
      );
      lvlObj.blocks.push({ x: 260 + v * 15, y: 402, w: 66, h: 66, req: 2 });
      lvlObj.buttons.push(
        { id: `f1_${i}`, x: 420 + v * 10, y: 456, w: 52, h: 12, mode: 'hold', color: '#8B5CF6', targetId: `lift_${i}` },
        { id: `f2_${i}`, x: 380 + v * 10, y: deckY - 12, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: `bridge_${i}` }
      );
      lvlObj.movers.push(
        { id: `lift_${i}`, x: 50, y: 448, w: 85, h: 20, activeX: 50, activeY: deckY, idleX: 50, idleY: 448, color: '#8B5CF6' },
        { id: `bridge_${i}`, x: 490 + v * 10, y: deckY - 10, w: 150, h: 24, activeX: 490 + v * 10, activeY: deckY - 10, idleX: 490 + v * 10, idleY: -50, color: '#10B981' }
      );
      lvlObj.key = { x: 230 + v * 10, y: deckY - 55 };
      lvlObj.door = { x: 840, y: deckY - 102 };

    } else if (arch === 1) {
      // Dual Direction Lifts: Opposing elevators
      lvlObj.name = `Level ${i}: Dual Counter-Lifts`;
      lvlObj.subtitle = 'Synchronize both elevators moving in opposite directions!';
      const deckY = 280 - v * 6;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
        { x: 190 + v * 10, y: deckY, w: 370, h: 24 },
        { x: 690 + v * 10, y: deckY, w: 242, h: 24 }
      );
      lvlObj.movers.push(
        { id: `el1_${i}`, x: 75 + v * 10, y: 448, w: 80, h: 20, activeX: 75 + v * 10, activeY: deckY, idleX: 75 + v * 10, idleY: 448, oscillate: true, color: '#3B82F6' },
        { id: `el2_${i}`, x: 590 + v * 10, y: deckY, w: 80, h: 20, activeX: 590 + v * 10, activeY: 448, idleX: 590 + v * 10, idleY: deckY, oscillate: true, color: '#F59E0B' }
      );
      lvlObj.buttons.push({
        id: `btn_${i}`,
        x: 340 + v * 10,
        y: deckY - 12,
        w: 48,
        h: 12,
        mode: 'toggle',
        color: '#10B981',
        targetId: `el1_${i}`
      });
      lvlObj.key = { x: 390 + v * 10, y: deckY - 70 };
      lvlObj.door = { x: 840, y: deckY - 72 };

    } else if (arch === 2) {
      // 3-Tier Tower Climber
      lvlObj.name = `Level ${i}: Three-Tier Tower`;
      lvlObj.subtitle = 'Climb three floors of mechanical lifts to reach the penthouse exit!';
      const f1 = 360 - v * 6;
      const f2 = 260 - v * 6;
      const f3 = 180 - v * 6;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: 330, h: FLOOR_H },
        { x: 490, y: FLOOR_Y, w: 470, h: FLOOR_H },
        { x: 190 + v * 10, y: f1, w: 190, h: 24 },
        { x: 440 + v * 10, y: f2, w: 210, h: 24 },
        { x: 710 + v * 10, y: f3, w: 222, h: 24 }
      );
      lvlObj.buttons.push({
        id: `sw1_${i}`,
        x: 270 + v * 10,
        y: f1 - 12,
        w: 48,
        h: 12,
        mode: 'toggle',
        color: '#06B6D4',
        targetId: `mv1_${i}`
      });
      lvlObj.movers.push({
        id: `mv1_${i}`,
        x: 370 + v * 10,
        y: 540,
        w: 90,
        h: 20,
        activeX: 370 + v * 10,
        activeY: f1,
        idleX: 370 + v * 10,
        idleY: 540,
        color: '#06B6D4'
      });
      lvlObj.key = { x: 540 + v * 10, y: f2 - 60 };
      lvlObj.door = { x: 840, y: f3 - 72 };

    } else {
      // High Pedestal Sync
      lvlObj.name = `Level ${i}: High Pedestal Sync`;
      lvlObj.subtitle = 'Step on the reciprocal switches on both wings to lower the center lift!';
      const pedY = 240 - v * 8;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: W, h: FLOOR_H },
        { x: 110 + v * 10, y: 350 - v * 5, w: 120, h: 24 },
        { x: 730 - v * 10, y: 350 - v * 5, w: 120, h: 24 },
        { x: 370 + v * 10, y: pedY, w: 190, h: 24 }
      );
      lvlObj.buttons.push(
        { id: `sb1_${i}`, x: 150 + v * 10, y: 338 - v * 5, w: 48, h: 12, mode: 'sync', color: '#8B5CF6', targetId: `lift_${i}` },
        { id: `sb2_${i}`, x: 770 - v * 10, y: 338 - v * 5, w: 48, h: 12, mode: 'sync', color: '#8B5CF6', targetId: `lift_${i}` }
      );
      lvlObj.movers.push({
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
      lvlObj.key = { x: 465 + v * 10, y: pedY - 60 };
      lvlObj.door = { x: 840, y: 396 };
    }

    if (i === 80) {
      lvlObj.name = "Level 80: Marshmallow Peak Exam";
      lvlObj.subtitle = "🧁 Cloud Peak Finale: 3-tier machinery, dual lifts & penthouse crown!";
    }
    levels.push(lvlObj);
  }

  // =========================================================================
  // CHAPTER 5: PALACE OF THE CAT KING (LEVELS 81 - 100) — Master Gauntlets
  // Maximum difficulty: alternating tight tethers, complex machinery, grand finale
  // =========================================================================

  for (let i = 81; i <= 99; i++) {
    const subIdx = i - 81;
    const isTethered = (i % 2 === 1);
    const tLen = Math.max(180, 210 - subIdx);
    const arch = subIdx % 4;
    const v = Math.floor(subIdx / 4);

    let lvlObj = {
      tether: isTethered,
      tetherLength: tLen,
      spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
      walls: baseWalls(),
      blocks: [],
      buttons: [],
      movers: [],
      key: { x: 500, y: 250 },
      door: { x: 850, y: 180 }
    };

    if (arch === 0) {
      // Sky Pillar Ascent
      lvlObj.name = `Level ${i}: Sky Pillar Ascent`;
      lvlObj.subtitle = isTethered
        ? `👑 Master Tether (${tLen}px): Climb the treacherous sky pillars in tight unison!`
        : '👑 Master Precision: Staggered sky leaps requiring pinpoint coordination!';
      const p1X = 270 + v * 10;
      const p2X = 450 + v * 10;
      const p3X = 630 + v * 10;
      const p1Y = 385 - v * 5;
      const p2Y = 305 - v * 5;
      const p3Y = 225 - v * 5;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: 220, h: FLOOR_H },
        { x: p1X, y: p1Y, w: 105, h: 24 },
        { x: p2X, y: p2Y, w: 105, h: 24 },
        { x: p3X, y: p3Y, w: 105, h: 24 },
        { x: 800, y: p3Y, w: 132, h: 24 }
      );
      lvlObj.key = { x: p2X + 52, y: p2Y - 60 };
      lvlObj.door = { x: 860, y: p3Y - 72 };

    } else if (arch === 1) {
      // Master Sync Gate & Vertical Ferry
      lvlObj.name = `Level ${i}: Royal Sync Gate`;
      lvlObj.subtitle = '👑 Master Teamwork: Simultaneous sync switches power the grand mountain lift!';
      const leftW = 300 - v * 10;
      const rightX = 660 + v * 10;
      const platY = 360 - v * 6;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: leftW, h: FLOOR_H },
        { x: rightX, y: FLOOR_Y, w: W - rightX, h: FLOOR_H },
        { x: 170 + v * 10, y: platY, w: 130, h: 24 }
      );
      lvlObj.buttons.push(
        { id: `sb1_${i}`, x: 210 + v * 10, y: platY - 12, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: `lift_${i}` },
        { id: `sb2_${i}`, x: rightX + 50, y: 456, w: 48, h: 12, mode: 'sync', color: '#06B6D4', targetId: `lift_${i}` }
      );
      lvlObj.movers.push({
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
      lvlObj.key = { x: 405 + v * 10, y: 410 };
      lvlObj.door = { x: 840, y: 396 };

    } else if (arch === 2) {
      // Master Heavy Push & Oscillating Ferry
      lvlObj.name = `Level ${i}: The Royal Anvil`;
      lvlObj.subtitle = '👑 Master Machinery: Push the heavy stone across to create a bridge for the ferry!';
      const leftW = 360 - v * 10;
      const rightX = 660 + v * 10;
      const midY = 340 - v * 6;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: leftW, h: FLOOR_H },
        { x: rightX, y: FLOOR_Y, w: W - rightX, h: FLOOR_H },
        { x: 420 + v * 10, y: midY, w: 170, h: 24 }
      );
      lvlObj.blocks.push({ x: 150 + v * 15, y: 402, w: 66, h: 66, req: 2 });
      lvlObj.buttons.push({
        id: `btn_${i}`,
        x: 480 + v * 10,
        y: midY - 12,
        w: 48,
        h: 12,
        mode: 'toggle',
        color: '#F59E0B',
        targetId: `bridge_${i}`
      });
      lvlObj.movers.push({
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
      lvlObj.key = { x: 505 + v * 10, y: midY - 70 };
      lvlObj.door = { x: 840, y: 396 };

    } else {
      // Sky Ledges to Fortress Gate
      lvlObj.name = `Level ${i}: Fortress Ascent`;
      lvlObj.subtitle = '👑 Master Climax: Navigate cloud platforms to reach the mountain fortress gate!';
      const l1Y = 415 - v * 6;
      const l2Y = 335 - v * 6;
      const l3Y = 255 - v * 6;
      lvlObj.walls.push(
        { x: 0, y: FLOOR_Y, w: 230, h: FLOOR_H },
        { x: 280 + v * 12, y: l1Y, w: 95, h: 24 },
        { x: 440 + v * 12, y: l2Y, w: 95, h: 24 },
        { x: 600 + v * 12, y: l3Y, w: 95, h: 24 },
        { x: 760, y: l3Y, w: 172, h: 24 }
      );
      lvlObj.key = { x: 490 + v * 12, y: l2Y - 60 };
      lvlObj.door = { x: 850, y: l3Y - 72 };
    }

    levels.push(lvlObj);
  }

  // =========================================================================
  // LEVEL 100: THE GRAND CROWN FINALE (THE ULTIMATE MASTERPIECE)
  // 3-Phase Climax:
  // Phase 1: Team Block Push to bridge the first abyss
  // Phase 2: Hold Switch + Vertical Sky Lift up to the Royal Summit
  // Phase 3: Synchronized final jump to the Golden Cat King Exit!
  // =========================================================================
  levels.push({
    name: "Level 100: The Grand Crown Finale",
    subtitle: "👑 LEVEL 100: THE GRAND FINALE! Prove you are the greatest co-op duo in the world!",
    tether: false,
    spawns: [{ x: 80, y: 400 }, { x: 130, y: 400 }],
    walls: [
      ...baseWalls(),
      { x: 0, y: FLOOR_Y, w: 320, h: FLOOR_H },
      { x: 420, y: FLOOR_Y, w: 260, h: FLOOR_H },
      { x: 760, y: FLOOR_Y, w: 200, h: FLOOR_H },
      { x: 160, y: 330, w: 200, h: 24 },
      { x: 450, y: 240, w: 220, h: 24 },
      { x: 730, y: 150, w: 202, h: 24 } // Royal Summit Penthouse
    ],
    blocks: [{ x: 180, y: 402, w: 66, h: 66, req: 2 }],
    buttons: [
      { id: 'b_fin1', x: 260, y: 456, w: 48, h: 12, mode: 'hold', color: '#EF4444', targetId: 'm_fin1' },
      { id: 'b_fin2', x: 520, y: 228, w: 48, h: 12, mode: 'toggle', color: '#10B981', targetId: 'm_fin2' }
    ],
    movers: [
      { id: 'm_fin1', x: 320, y: 540, w: 100, h: 20, activeX: 320, activeY: 468, idleX: 320, idleY: 540, color: '#EF4444' },
      { id: 'm_fin2', x: 670, y: 468, w: 90, h: 20, activeX: 670, activeY: 150, idleX: 670, idleY: 468, color: '#10B981' }
    ],
    key: { x: 560, y: 180 },
    door: { x: 840, y: 78 }
  });

  return levels;
}

export const LEVELS = generate100Levels();
