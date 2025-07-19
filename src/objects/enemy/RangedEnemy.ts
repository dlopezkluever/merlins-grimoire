import { Scene, Physics } from 'phaser';
import { Enemy } from './Enemy';
import { EnemyConfig } from './EnemyConfigs';
import { EnemyType } from './EnemyFactory';

export class RangedEnemy extends Enemy {
  // Pathfinding properties

  constructor(scene: Scene, x: number, y: number, id: string, enemyType: EnemyType, config: EnemyConfig) {
    super(scene, x, y, id, enemyType, config);
  }


  protected performAttack(): void {
    // Implement ranged attack logic
    if (!this.wand || !this.player) return;

    // Use the wand's fire method
    this.wand.fireAtTarget(this, this.player);
  }


  // Keep the public fire method for backward compatibility
  public fire(): void {
    this.performAttack();
  }

  override die(): void {
    // Deactivate all spells in the wand
    if (this.wand) {
      this.wand.deactivateAllSpells();
    }

    super.die();
  }

} 