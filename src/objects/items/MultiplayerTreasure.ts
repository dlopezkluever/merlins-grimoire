import { Scene } from 'phaser';
import { Treasure } from './Treasure';
import { Player } from '../player/Player';

export class MultiplayerTreasure extends Treasure {
  private players: Player[] = [];

  constructor(scene: Scene, x: number, y: number, player: Player) {
    super(scene, x, y, player);
    this.players = [player];
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
    
    // Set up collision for the new player
    this.scene.physics.add.overlap(this, player, this.onPlayerTouch, undefined, this);
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }
} 