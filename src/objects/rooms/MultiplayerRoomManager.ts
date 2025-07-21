import { Scene } from 'phaser';
import { RoomManager } from './RoomManager';
import { Player } from '../player/Player';

export class MultiplayerRoomManager extends RoomManager {
  private players: Player[] = [];

  constructor(scene: Scene, player: Player) {
    super(scene, player);
    this.players = [player];
  }

  public addPlayer(player: Player): void {
    // Check if player is already added to avoid duplicates
    if (this.players.includes(player)) {
      return;
    }
    
    this.players.push(player);
    
    // Set up room overlaps for the new player
    this.rooms.forEach(room => {
      this.scene.physics.add.overlap(player, room.getZone(), () => {
        this.handleRoomEntry(room);
      });
    });
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }
} 