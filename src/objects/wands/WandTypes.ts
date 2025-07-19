import { Player } from '../player/Player';
import { Enemy } from '../enemy/Enemy';
import { RangedEnemy } from '../enemy/RangedEnemy';

// Interface for base wand properties
export interface WandBase {
  damage: number;
  attackRate: number; // Time between attacks in milliseconds
  minDistance: number;
  maxDistance: number;
}

// Interface for melee wands
export interface MeleeWand extends WandBase {
  knockback?: number;
}

// Interface for ranged wands
export interface RangedWand extends WandBase {
  spellSpeed: number;
  spellSprite: string;
  fire(shooter: RangedEnemy, target: Player): void;
} 