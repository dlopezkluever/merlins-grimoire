export const TYPE_MELEE = 'melee';
export const TYPE_RANGED = 'ranged';
export const OWNER_PLAYER = 'player';
export const OWNER_ENEMY = 'enemy';

export interface WandConfig {
  type: typeof TYPE_MELEE | typeof TYPE_RANGED;
  owner: typeof OWNER_PLAYER | typeof OWNER_ENEMY;
  deployable?: boolean;
  damage: number;
  attackRate: number; // Cooldown time in milliseconds between attacks
  spellSpeed?: number;
  spellSprite?: string;
  spellWidth?: number;
  spellHeight?: number;
  spellSpinSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  displayConfig?: {
    sprite?: string;
    animation?: string;
    color?: string;
  } | null;
}

export const WAND_CONFIGS = {
  // Enemy wands
  STRIKE: {
    type: TYPE_MELEE,
    owner: OWNER_ENEMY,
    damage: 20,
    attackRate: 1000, // 1 second cooldown
    minDistance: 40,
    maxDistance: 50
  },
  CHOMPER_BITE: {
    type: TYPE_MELEE,
    owner: OWNER_ENEMY,
    damage: 10,
    attackRate: 300, // 3 bites per second
    minDistance: 40,
    maxDistance: 50
  },
  SWORD: {
    type: TYPE_MELEE,
    owner: OWNER_ENEMY,
    damage: 15,
    attackRate: 1000, // 1 second cooldown
    minDistance: 50,
    maxDistance: 100
  },
  BOW: {
    type: TYPE_RANGED,
    owner: OWNER_ENEMY,
    damage: 15,
    attackRate: 667, // ~1.5 attacks per second (1000ms / 1.5)
    bulletSpeed: 300,
    bulletSprite: 'arrow',
    bulletWidth: 32,
    bulletHeight: 16,
    minDistance: 100,
    maxDistance: 200
  },
  SPEAR: {
    type: TYPE_MELEE,
    owner: OWNER_ENEMY,
    damage: 20,
    attackRate: 1250, // 0.8 attacks per second (1000ms / 0.8)
    minDistance: 50,
    maxDistance: 100
  },
  SCOUNDREL_STAR: {
    type: TYPE_RANGED,
    owner: OWNER_ENEMY,
    damage: 10,
    attackRate: 2000, // 0.5 attacks per second (1000ms / 0.5)
    spellSpeed: 400,
    spellSprite: 'scoundrel-star',
    spellWidth: 32,
    spellHeight: 32,
    spellSpinSpeed: 10, // 10 rotations per second
    minDistance: 100,
    maxDistance: 200
  },
  SPELLBOT_SHOT: {
    type: TYPE_RANGED,
    owner: OWNER_ENEMY,
    damage: 30,
    attackRate: 5000, // 2 attacks per second (1000ms / 2)
    spellSpeed: 400,
    spellSprite: 'spell-bot-spell',
    spellWidth: 32,
    spellHeight: 32,
    minDistance: 70,
    maxDistance: 500,
  },
  SLIME_SHOT: {
    type: TYPE_RANGED,
    owner: OWNER_ENEMY,
    damage: 30,
    attackRate: 1000,
    bulletSpeed: 400,
    bulletSprite: 'slime-shot',
    bulletWidth: 32,
    bulletHeight: 32,
    minDistance: 100,
    maxDistance: 300,
  },
  // Player wands
  RAPIDWAND: {
    type: TYPE_RANGED,
    owner: OWNER_PLAYER,
    damage: 10,
    attackRate: 300, // 2 attacks per second (1000ms / 2)
    spellSpeed: 300,
    spellSprite: 'plain-spell-1',
    spellWidth: 32,
    spellHeight: 32,
    minDistance: 100,
    maxDistance: 300,
    displayConfig: {
      sprite: 'wand-upgrade',
      color: '0x888888' // Gray
    }
  },
  ELDERWAND: {
    type: TYPE_RANGED,
    owner: OWNER_PLAYER,
    damage: 20,
    attackRate: 150, // 4 attacks per second (1000ms / 4)
    spellSpeed: 350,
    spellSprite: 'plain-spell-1',
    spellWidth: 32,
    spellHeight: 32,
    minDistance: 100,
    maxDistance: 300,
    displayConfig: {
      sprite: 'wand-upgrade',
      color: '0xffffff' // Pure white
    }
  },
  SPELLBOT: {
    type: TYPE_RANGED,
    owner: OWNER_PLAYER,
    damage: 10,
    attackRate: 1000,
    deployable: true,
    spellSpeed: 400,
    spellSprite: 'plain-spell-1',
    spellWidth: 32,
    spellHeight: 32,
    minDistance: 70,
    maxDistance: 500,
    displayConfig: {
      sprite: 'spell-bot',
      color: '0xffffff', // Pure white
      animation: 'spell-bot-animation'
    }
  },
} as const;

export const WAND_UPGRADE = {
  '1': 'ELDERWAND',
  '2': 'SPELLBOT'
}

export type WandType = keyof typeof WAND_CONFIGS;
