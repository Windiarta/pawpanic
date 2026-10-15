export const SKIN_PALETTES = [
  { id: 'classic-orange', name: 'Classic Orange', color: '#FF7A29', darkColor: '#C84B00' },
  { id: 'mint-teal', name: 'Mint Teal', color: '#2EC4B6', darkColor: '#177E73' },
  { id: 'pastel-pink', name: 'Pastel Pink', color: '#F472B6', darkColor: '#DB2777' },
  { id: 'electric-purple', name: 'Electric Purple', color: '#A855F7', darkColor: '#7E22CE' },
  { id: 'neon-lime', name: 'Neon Lime', color: '#84CC16', darkColor: '#4D7C0F' },
  { id: 'sky-blue', name: 'Sky Blue', color: '#38BDF8', darkColor: '#0284C7' },
  { id: 'solar-gold', name: 'Solar Gold', color: '#FACC15', darkColor: '#CA8A04' },
  { id: 'midnight-black', name: 'Midnight Black', color: '#334155', darkColor: '#0F172A' },
  { id: 'snow-white', name: 'Snow White', color: '#F8FAFC', darkColor: '#94A3B8' },
  { id: 'crimson-red', name: 'Crimson Red', color: '#EF4444', darkColor: '#B91C1C' },
  { id: 'lavender-mist', name: 'Lavender Mist', color: '#C084FC', darkColor: '#7E22CE' },
  { id: 'matcha-green', name: 'Matcha Green', color: '#10B981', darkColor: '#047857' },
  { id: 'bubblegum', name: 'Bubblegum', color: '#FB7185', darkColor: '#BE123C' },
  { id: 'chocolate', name: 'Choco Mocha', color: '#B45309', darkColor: '#78350F' },
  { id: 'cyber-cyan', name: 'Cyber Cyan', color: '#06B6D4', darkColor: '#0E7490' },
  { id: 'royal-velvet', name: 'Royal Velvet', color: '#6366F1', darkColor: '#3730A3' }
];

export const ACCESSORIES = [
  // Basics & Classic Hats
  { id: 'none', name: 'No Hat', icon: '✨', cat: 'hat' },
  { id: 'crown', name: 'Golden Crown', icon: '👑', cat: 'hat' },
  { id: 'tiara', name: 'Crystal Tiara', icon: '👸', cat: 'hat' },
  { id: 'cap', name: 'Baseball Cap', icon: '🧢', cat: 'hat' },
  { id: 'beret', name: 'Artist Beret', icon: '🎨', cat: 'hat' },
  { id: 'strawhat', name: 'Beach Sunhat', icon: '👒', cat: 'hat' },
  { id: 'party', name: 'Party Cone', icon: '🎉', cat: 'hat' },
  { id: 'wizard', name: 'Wizard Hat', icon: '🧙', cat: 'hat' },
  { id: 'chef', name: 'Chef Hat', icon: '👨‍🍳', cat: 'hat' },
  { id: 'viking', name: 'Viking Helmet', icon: '⚔️', cat: 'hat' },
  { id: 'propeller', name: 'Propeller Beanie', icon: '🚁', cat: 'hat' },

  // Wigs & Hair (Reference from Fashion Image)
  { id: 'wig_bob', name: 'Bob Cut Diva', icon: '💇‍♀️', cat: 'hair' },
  { id: 'wig_ponytail', name: 'Glamour Ponytail', icon: '👱‍♀️', cat: 'hair' },
  { id: 'star_clip', name: 'Star Diamond Clip', icon: '⭐', cat: 'hair' },
  { id: 'flower', name: 'Rose Blossom', icon: '🌸', cat: 'hair' },
  { id: 'bow', name: 'Pink Glamour Bow', icon: '🎀', cat: 'hair' },
  { id: 'headband', name: 'Ninja Headband', icon: '🥷', cat: 'hair' },

  // Runway Fashion & Dresses (Reference from Fashion Image)
  { id: 'gown_gold', name: 'Gold Runway Gown', icon: '👗', cat: 'fashion' },
  { id: 'dress_ballerina', name: 'Pink Frill Ballgown', icon: '🩰', cat: 'fashion' },
  { id: 'dress_royal', name: 'Sapphire Gala Gown', icon: '💎', cat: 'fashion' },

  // Luxury Accessories & Shoes (Reference from Fashion Image)
  { id: 'necklace_pearl', name: 'Black Pearl Choker', icon: '📿', cat: 'style' },
  { id: 'clutch', name: 'Studded Clutch Bag', icon: '👛', cat: 'style' },
  { id: 'heels_gladiator', name: 'Gladiator Strappy Heels', icon: '👠', cat: 'style' },
  { id: 'glasses', name: 'Cool Shades', icon: '🕶️', cat: 'style' },
  { id: 'headphones', name: 'RGB Gaming Headset', icon: '🎧', cat: 'style' },
  { id: 'halo', name: 'Angel Halo', icon: '😇', cat: 'style' }
];

const STORAGE_KEY_P1 = 'picopark_skin_p1';
const STORAGE_KEY_P2 = 'picopark_skin_p2';

let p1Skin = {
  paletteId: 'classic-orange',
  accessoryId: 'none'
};

let p2Skin = {
  paletteId: 'mint-teal',
  accessoryId: 'none'
};

export function loadSkin(playerNum = 1) {
  try {
    const raw1 = localStorage.getItem(STORAGE_KEY_P1);
    if (raw1) {
      const parsed = JSON.parse(raw1);
      if (parsed && parsed.paletteId) {
        p1Skin = { paletteId: parsed.paletteId, accessoryId: parsed.accessoryId || 'none' };
      }
    }
    const raw2 = localStorage.getItem(STORAGE_KEY_P2);
    if (raw2) {
      const parsed = JSON.parse(raw2);
      if (parsed && parsed.paletteId) {
        p2Skin = { paletteId: parsed.paletteId, accessoryId: parsed.accessoryId || 'none' };
      }
    }
  } catch (e) {}
  return getSkin(playerNum);
}

export function saveSkin(skin, playerNum = 1) {
  const target = playerNum === 2 ? p2Skin : p1Skin;
  target.paletteId = skin.paletteId || (playerNum === 2 ? 'mint-teal' : 'classic-orange');
  target.accessoryId = skin.accessoryId || 'none';

  try {
    const key = playerNum === 2 ? STORAGE_KEY_P2 : STORAGE_KEY_P1;
    localStorage.setItem(key, JSON.stringify(target));
  } catch (e) {}

  return getSkin(playerNum);
}

export function getSkin(playerNum = 1) {
  const cur = playerNum === 2 ? p2Skin : p1Skin;
  const fallback = playerNum === 2 ? SKIN_PALETTES[1] : SKIN_PALETTES[0];
  const palette = SKIN_PALETTES.find(p => p.id === cur.paletteId) || fallback;
  return {
    paletteId: palette.id,
    name: palette.name,
    color: palette.color,
    darkColor: palette.darkColor,
    accessoryId: cur.accessoryId || 'none'
  };
}

export function setSkin(skin, playerNum = 1) {
  return saveSkin(skin, playerNum);
}

export function getRandomSkin() {
  const randPal = SKIN_PALETTES[Math.floor(Math.random() * SKIN_PALETTES.length)];
  const randAcc = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)];
  return {
    paletteId: randPal.id,
    accessoryId: randAcc.id
  };
}
