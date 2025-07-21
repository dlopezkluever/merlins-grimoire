import { Scene } from 'phaser';
import { EnemyManager } from './EnemyManager';
import { Player } from '../player/Player';
import { Enemy } from './Enemy';
import { RangedEnemy } from './RangedEnemy';

export class MultiplayerEnemyManager extends EnemyManager {
  private players: Player[] = [];

  constructor(scene: Scene, player: Player) {
    super(scene, player);
    this.players = [player];
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
    
    // Setup overlap for the new player
    this.scene.physics.add.overlap(
      this.getEnemiesGroup(),
      player,
      this.handlePlayerEnemyOverlap,
      undefined,
      this
    );
  }

  public setupEnemySpellCollisions(enemyInstance: Enemy) {
    const wallsLayer = (this.scene as any).getWallsLayer();

    if (enemyInstance instanceof RangedEnemy && enemyInstance.wand && enemyInstance.wand.spells) {
      // Enemy Spells vs All Players
      this.players.forEach(player => {
        this.scene.physics.add.collider(player, enemyInstance.wand.spells, this.handlePlayerSpellCollision, undefined, this);
      });
      
      // Enemy Spells vs Walls
      if (wallsLayer) {
        this.scene.physics.add.collider(enemyInstance.wand.spells, wallsLayer, (this.scene as any).handleSpellCollision, undefined, this);
      }
    }
  }

  public getClosestPlayer(enemyX: number, enemyY: number): Player | null {
    if (this.players.length === 0) return null;
    
    let closestPlayer = this.players[0];
    let closestDistance = Phaser.Math.Distance.Between(enemyX, enemyY, closestPlayer.x, closestPlayer.y);
    
    for (let i = 1; i < this.players.length; i++) {
      const distance = Phaser.Math.Distance.Between(enemyX, enemyY, this.players[i].x, this.players[i].y);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = this.players[i];
      }
    }
    
    return closestPlayer;
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }
} 