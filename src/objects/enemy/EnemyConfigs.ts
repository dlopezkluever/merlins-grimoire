import { WandType } from '../wands/WandConfigs';
import { DropSpellBotBehaviour, EnemyBehaviour } from './EnemyBehaviour';

export interface AnimationConfig {
  startFrame: number;
  endFrame: number;
  frameRate: number;
  repeat: number;
}

export interface EnemyConfig {
  type: 'melee' | 'ranged';
  sprite: string;
  scale: number;
  moveSpeed: number;
  health: number;
  maxHealth: number;
  animationKey: string;
  animationConfig?: AnimationConfig;
  wandType?: WandType;
  behaviour?: EnemyBehaviour;
}

export const ENEMY_CONFIGS = {
  DUMBDUMB: {
    type: 'melee',
    sprite: 'dumb-dumb-sprite',
    scale: 2,
    moveSpeed: 120,
    health: 40,
    maxHealth: 40,
    animationKey: 'dumb-dumb-walk',
    animationConfig: {
      startFrame: 0,
      endFrame: 7,
      frameRate: 8,
      repeat: -1
    },
    wandType: 'STRIKE'
  },
  DRAUGR: {
    type: 'ranged',
    sprite: 'draugr-sprite',
    scale: 2,
    moveSpeed: 80,
    health: 20,
    maxHealth: 20,
    animationKey: 'draugr-walk',
    animationConfig: {
      startFrame: 0,
      endFrame: 7,
      frameRate: 10,
      repeat: -1
    },
    wandType: 'BOW'
  },
  SCOUNDREL: {
    type: 'ranged',
    sprite: 'scoundrel-sprite',
    scale: 2,
    moveSpeed: 100,
    health: 30,
    maxHealth: 30,
    animationKey: 'scoundrel-walk',
    animationConfig: {
      startFrame: 0,
      endFrame: 7,
      frameRate: 7,
      repeat: -1
    },
    wandType: 'SCOUNDREL_STAR'
  },
  DRAGONLING: {
    type: 'melee',
    sprite: 'dragon-ling-sprite',
    scale: 2,
    moveSpeed: 150,
    health: 30,
    maxHealth: 30,
    animationKey: 'dragon-ling-walk',
    animationConfig: {
      startFrame: 0,
      endFrame: 7,
      frameRate: 8,
      repeat: -1
    },
    wandType: 'CHOMPER_BITE'
  },
  TROLL: {
    type: 'melee',
    sprite: 'troll-sprite',
    scale: 2,
    moveSpeed: 150,
    health: 50,
    maxHealth: 50,
    animationKey: 'troll-walk',
    animationConfig: {
      startFrame: 0,
      endFrame: 7,
      frameRate: 8,
      repeat: -1
    },
    wandType: 'STRIKE',
    behaviour: new DropSpellBotBehaviour()
  },
  SLUG: {
    type: 'ranged',
    sprite: 'slug-sprite',
    scale: 2,
    moveSpeed: 50,
    health: 10,
    maxHealth: 10,
    animationKey: 'slug-walk',
    animationConfig: {
      startFrame: 0,
      endFrame: 7,
      frameRate: 8,
      repeat: -1
    },
    wandType: 'SLIME_SHOT'
  }
} as const; 