import { Scene } from 'phaser';
import { BarrelManager } from './BarrelManager';
import { Player } from '../player/Player';

export class MultiplayerBarrelManager extends BarrelManager {
  private players: Player[] = [];

  constructor(scene: Scene, player: Player) {
    super(scene, player);
    this.players = [player];
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
    
    // Set up collisions for the new player
    this.scene.physics.add.overlap(
      player,
      this.barrels,
      this.handleBarrelCollision,
      undefined,
      this
    );
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }

  public getBarrelsGroup(): Phaser.Physics.Arcade.Group {
    return this.barrels;
  }
} 