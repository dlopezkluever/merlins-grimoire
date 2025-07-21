import { Scene } from 'phaser';
import { ItemManager } from './ItemManager';
import { Player } from '../player/Player';
import { HealthPotion } from './HealthPotion';
import { SparkBoost } from './SparkBoost';

export class MultiplayerItemManager extends ItemManager {
  private players: Player[] = [];

  constructor(scene: Scene, player: Player) {
    super(scene, player);
    this.players = [player];
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
    
    // Setup collisions for the new player
    this.scene.physics.add.overlap(
      player,
      this.potions,
      (playerObj: any, potionObj: any) => {
        const potion = potionObj as HealthPotion;
        const playerInstance = playerObj as Player;
        if (!potion.isItemCollected()) {
          potion.collect(playerInstance);
        }
      }
    );

    this.scene.physics.add.overlap(
      player,
      this.powerups,
      (playerObj: any, powerupObj: any) => {
        const powerup = powerupObj as SparkBoost;
        const playerInstance = playerObj as Player;
        if (!powerup.isItemCollected()) {
          powerup.collect(playerInstance);
        }
      }
    );
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }

  public getPotionsGroup(): Phaser.Physics.Arcade.Group {
    return this.potions;
  }

  public getPowerupsGroup(): Phaser.Physics.Arcade.Group {
    return this.powerups;
  }
} 