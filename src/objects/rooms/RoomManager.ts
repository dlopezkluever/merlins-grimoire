import { Types, Physics, Scene } from "phaser";
import { Room } from "./Room";
// Door system removed - import { Door } from "../Door";
// Door system removed - import { DoorDirection } from "../Door";
import { Player } from "../player/Player";
import { MazeData, MazeRoom } from "../maze/MazeGenerator";

const DEBUG_ROOMS = false; // Reduced to prevent log spam

function debugLog(message: string, ...args: any[]) {
  if (DEBUG_ROOMS) {
    console.log(`[ROOM DEBUG] ${message}`, ...args);
  }
}

export class RoomManager {
  private scene: Scene;
  private rooms: Map<string, Room>;
  private currentRoom: Room | null = null;
  private player: Player;
  private players: Player[] = [];

  constructor(scene: Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.players = [player];
    debugLog('RoomManager created with player:', player.constructor.name);
    this.rooms = new Map();

  }

  public addPlayer(player: Player): void {
    // Check if player is already added to avoid duplicates
    if (this.players.includes(player)) {
      debugLog('Player already in room manager, skipping');
      return;
    }
    
    this.players.push(player);
    debugLog('Adding player to room manager:', player.constructor.name, 'Total players:', this.players.length);
    // Set up room overlaps for the new player
    this.rooms.forEach(room => {
      debugLog('Setting up room overlap for new player in room:', room.getId());
      this.scene.physics.add.overlap(player, room.getZone(), () => {
        debugLog('Player entered room via addPlayer overlap:', player.constructor.name);
        this.handleRoomEntry(room);
      });
    });
  }

  public initializeRooms(roomLayer: Phaser.Tilemaps.ObjectLayer): void {
    if (roomLayer) {
      roomLayer.objects.filter(obj => obj.name === "Room").forEach(roomObj => {
        const room = this.createFromTilemapObject(roomObj);
        if (room) {
          const roomId = roomObj.properties?.find((p: { name: string; value: string }) => p.name === 'Room');

          this.rooms.set(roomId.value, room);
          this.scene.physics.add.overlap(this.player, room.getZone(), () => {
            this.handleRoomEntry(room);
          });
        }
      });

      this.currentRoom = this.rooms.get("1") || null;

      roomLayer.objects.filter(obj => obj.name === "EnemyTrigger").forEach(triggerObj => {
        const roomProperty = triggerObj.properties?.find((p: { name: string; value: string }) => p.name === 'Room');
        if (!roomProperty) return;
        const room = this.rooms.get(roomProperty.value as string);
        if (room) {
          this.setupEnemyTrigger(triggerObj, room);
        }
      });

      // Door system removed - free exploration mode
    } else {
      console.warn("No 'Rooms' layer found in map");
    }


  }

  public initializeRoomsFromMazeData(mazeData: MazeData): void {
    // Create rooms from generated maze data
    mazeData.rooms.forEach(roomData => {
      const room = this.createFromMazeData(roomData);
      if (room) {
        this.rooms.set(roomData.id, room);
        // Set up overlaps for all players
        this.players.forEach(player => {
          debugLog('Setting up room overlap for player:', player.constructor.name, 'in room:', roomData.id);
          this.scene.physics.add.overlap(player, room.getZone(), () => {
            debugLog('Player entered room via maze data overlap:', player.constructor.name, 'Room:', roomData.id);
            this.handleRoomEntry(room);
          });
        });
      }
    });

    // Set starting room (first room or center room)
    const centerRoomId = Math.ceil(mazeData.rooms.length / 2).toString();
    this.currentRoom = this.rooms.get(centerRoomId) || this.rooms.get("1") || null;

    // No doors needed - removed for free exploration

    // Setup enemy triggers for each room
    mazeData.rooms.forEach(roomData => {
      const room = this.rooms.get(roomData.id);
      if (room) {
        this.setupEnemyTriggerFromMazeData(roomData, room);
      }
    });
  }

  private createFromTilemapObject(roomObj: Types.Tilemaps.TiledObject): Room | null {
    const roomProperty = roomObj.properties?.find((p: { name: string; value: string }) => p.name === 'Room');
    if (!roomProperty) {
      console.warn('Room object missing Room property');
      return null;
    }

    const roomId = roomProperty.value;

    if (typeof roomObj.x !== 'number' ||
      typeof roomObj.y !== 'number' ||
      typeof roomObj.width !== 'number' ||
      typeof roomObj.height !== 'number') {
      console.warn('Invalid room object properties:', roomObj);
      return null;
    }

    return new Room(
      this.scene,
      roomId,
      roomObj.x,
      roomObj.y,
      roomObj.width,
      roomObj.height
    );
  }

  private createFromMazeData(roomData: MazeRoom): Room | null {
    // Convert tile coordinates to pixel coordinates
    const tileSize = 32;
    return new Room(
      this.scene,
      roomData.id,
      roomData.x * tileSize,
      roomData.y * tileSize,
      roomData.width * tileSize,
      roomData.height * tileSize
    );
  }

  private setupEnemyTrigger(obj: Phaser.Types.Tilemaps.TiledObject, room: Room): void {
    if (typeof obj.x !== 'number' ||
      typeof obj.y !== 'number' ||
      typeof obj.width !== 'number' ||
      typeof obj.height !== 'number') {
      console.warn('Invalid trigger object properties:', obj);
      return;
    }

    const zone = this.scene.add.zone(
      obj.x + (obj.width / 2),
      obj.y + (obj.height / 2),
      obj.width,
      obj.height
    );
    room.setEnemyTriggerZone(zone);

    this.scene.physics.world.enable(zone);
    (zone.body as Physics.Arcade.Body).setAllowGravity(false);
    (zone.body as Physics.Arcade.Body).moves = false;

    if (this.player) {
      this.scene.physics.add.overlap(this.player, zone, () => {
        if (room.isCreated()) {
          room.triggerRoom();
        }
      });
    }
  }



  private setupEnemyTriggerFromMazeData(roomData: MazeRoom, room: Room): void {
    // Create enemy trigger zone in center of room
    const tileSize = 32;
    const triggerWidth = roomData.width * tileSize * 0.6;
    const triggerHeight = roomData.height * tileSize * 0.6;
    
    const zone = this.scene.add.zone(
      roomData.x * tileSize + (roomData.width * tileSize) / 2,
      roomData.y * tileSize + (roomData.height * tileSize) / 2,
      triggerWidth,
      triggerHeight
    );
    
    room.setEnemyTriggerZone(zone);
    
    this.scene.physics.world.enable(zone);
    (zone.body as Physics.Arcade.Body).setAllowGravity(false);
    (zone.body as Physics.Arcade.Body).moves = false;

    if (this.player) {
      this.scene.physics.add.overlap(this.player, zone, () => {
        if (room.isCreated()) {
          room.triggerRoom();
        }
      });
    }
  }

  // Door system removed - setupDoor method no longer needed


  private lastRoomChange: number = 0;
  
  private handleRoomEntry(room: Room) {
    // Debounce room entry logs to reduce spam
    const now = Date.now();
    const shouldLog = now - this.lastRoomChange > 1000; // Only log room changes every 1 second
    
    if (shouldLog) {
      debugLog('handleRoomEntry called for room:', room.getId(), 'Current room:', this.currentRoom?.getId());
    }
    
    if (this.currentRoom === room) {
      return; // Already in this room, no need to log
    }
    
    if (shouldLog) {
      debugLog('Switching to new room:', room.getId(), 'from:', this.currentRoom?.getId());
      this.lastRoomChange = now;
    }
    
    this.currentRoom = room;
  }

  public getCurrentRoom(): Room | null {
    return this.currentRoom;
  }

  public getRooms(): Map<string, Room> {
    return this.rooms;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getRoomAtPosition(x: number, y: number): Room | undefined {
    return Array.from(this.rooms.values()).find(room => room.getZone().getBounds().contains(x, y));
  }

  public destroy(): void {
    this.rooms.forEach(room => room.destroy());
    this.rooms.clear();
    this.currentRoom = null;
    this.player = null;
    this.scene = null;
  }
} 