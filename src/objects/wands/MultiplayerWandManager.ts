import { Scene } from 'phaser';
import { WandManager } from './WandManager';
import { Player } from '../player/Player';

export class MultiplayerWandManager extends WandManager {
  private players: Player[] = [];

  constructor(scene: Scene, player: Player) {
    super(scene, player);
    this.players = [player];
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
    
    // Set up collision for existing wand upgrades
    this.wandUpgrades.forEach(upgrade => {
      this.scene.physics.add.overlap(
        player,
        upgrade,
        this.onEnterUpgradeArea,
        undefined,
        this
      );
    });
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }
} 