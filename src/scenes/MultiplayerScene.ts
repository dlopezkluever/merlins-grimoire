import { MainScene } from './MainScene';
import { Player } from '../objects/player/Player';
import { MultiplayerEnemyManager } from '../objects/enemy/MultiplayerEnemyManager';
import { MultiplayerBarrelManager } from '../objects/props/MultiplayerBarrelManager';
import { MultiplayerItemManager } from '../objects/items/MultiplayerItemManager';
import { MultiplayerRoomManager } from '../objects/rooms/MultiplayerRoomManager';
import { MultiplayerWandManager } from '../objects/wands/MultiplayerWandManager';
import { MultiplayerTreasure } from '../objects/items/MultiplayerTreasure';
import { MovementManager } from '../objects/enemy/MovementManager';

export class MultiplayerScene extends MainScene {
  // Multiplayer-specific properties
  protected player2: Player | null = null;
  private camera2: Phaser.Cameras.Scene2D.Camera | null = null;
  private isMultiplayer: boolean = true; // Always true for this scene

  constructor() {
    super('MultiplayerScene');
  }

  init(data: any): void {
    // Always set isMultiplayer to true for this scene
    super.init({ ...data, isMultiplayer: true });
  }

  // Override setupPlayer to add player2
  protected setupPlayer(): void {
    // Call parent to setup player1
    super.setupPlayer();
    
    // Add player2 setup
    this.setupPlayer2();
  }

  private setupPlayer2(): void {
    if (!this.player) {
      console.error('Player 1 must be setup before Player 2');
      return;
    }

    // Find the start room (room type 'start')
    const startRoom = this.mazeData.rooms.find(r => r.roomType === 'start') || this.mazeData.rooms[0];
    
    // Spawn player in the center of the start room (convert tile to pixel coordinates)
    const tileSize = 32;
    const spawnX = (startRoom.x + startRoom.width / 2) * tileSize;
    const spawnY = (startRoom.y + startRoom.height / 2) * tileSize;
    
    // Spawn player 2 slightly offset from player 1
    const offsetX = 50;
    this.player2 = new Player(this, spawnX + offsetX, spawnY, 2);
    
    // Apply darker tint to player 2
    this.player2.setTint(0x808080); // Darker gray tint
    
    // Setup player 2 death event
    this.events.on('player2Died', (player: Player) => {
      this.handlePlayerDeath(player);
    });
  }

  // Override setupCamera to add split-screen
  protected setupCamera(): void {
    if (!this.cameras || !this.cameras.main) {
      console.error('Camera system not available');
      return;
    }

    const worldBounds = {
      x: 0,
      y: 0,
      width: this.mazeData.mapWidth * 32,
      height: this.mazeData.mapHeight * 32
    };

    // Resize canvas to 1600x600 for multiplayer
    const screenWidth = 1600;
    const screenHeight = 600;
    this.scale.resize(screenWidth, screenHeight);
    
    // Each player gets 800x600 view
    const halfWidth = screenWidth / 2; // 800
    
    // Configure main camera for Player 1 (right half)
    this.cameras.main.setViewport(halfWidth, 0, halfWidth, screenHeight);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);

    // Create left camera for Player 2
    this.camera2 = this.cameras.add(0, 0, halfWidth, screenHeight);
    this.camera2.startFollow(this.player2);
    this.camera2.setZoom(1.5);
    this.camera2.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);

    // Simple divider line
    const divider = this.add.rectangle(halfWidth, screenHeight / 2, 2, screenHeight, 0x000000);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  // Override manager creation methods to use multiplayer versions
  protected setupRooms(): void {
    // Create multiplayer room manager instead of single-player
    this.roomManager = new MultiplayerRoomManager(this, this.player);
    this.roomManager.initializeRoomsFromMazeData(this.mazeData);
    
    // Add player2 to room manager
    if (this.player2) {
      (this.roomManager as MultiplayerRoomManager).addPlayer(this.player2);
    }

    // Listen for room state changes
    this.events.on('room-state-changed', (room: any, state: any) => {
      // Win condition: clear the end room
      if (room.getId() === this.mazeData.endRoomId && state === 'ROOM_CLEARED') {
        console.log('You found and cleared the final room! Victory!');
        this.handleWin();
      }
    });
    
    console.log('End room ID:', this.mazeData.endRoomId);
  }

  protected setupWandManager(): void {
    // Create multiplayer wand manager
    this.wandManager = new MultiplayerWandManager(this, this.player);
    this.wandManager.setupProceduralWandUpgrades(this.getRoomManager().getRooms());
    
    // Add player2 to wand manager
    if (this.player2) {
      (this.wandManager as MultiplayerWandManager).addPlayer(this.player2);
    }
  }

  protected setupTreasure(): void {
    if (!this.player || !this.mazeData || !this.mazeData.endRoomId) {
      console.warn('Cannot setup treasure: missing player, maze data, or end room ID');
      return;
    }

    // Find the goal room
    const goalRoom = this.mazeData.rooms.find(room => room.id === this.mazeData.endRoomId);
    if (!goalRoom) {
      console.warn('Goal room not found for treasure placement');
      return;
    }

    // Calculate treasure position in the center of the goal room (convert to pixel coordinates)
    const tileSize = 32;
    const treasureX = (goalRoom.x + goalRoom.width / 2) * tileSize;
    const treasureY = (goalRoom.y + goalRoom.height / 2) * tileSize;

    // Create multiplayer treasure
    this.treasure = new MultiplayerTreasure(this, treasureX, treasureY, this.player);
    
    // Add player2 to treasure
    if (this.player2 && this.treasure) {
      (this.treasure as MultiplayerTreasure).addPlayer(this.player2);
    }
  }

  protected setupBarrels(): void {
    // Create multiplayer barrel manager
    this.barrelManager = new MultiplayerBarrelManager(this, this.player);
    this.barrelManager.createProceduralBarrels(this.getRoomManager().getRooms());
    
    // Add player2 to barrel manager
    if (this.player2) {
      (this.barrelManager as MultiplayerBarrelManager).addPlayer(this.player2);
    }
  }

  protected setupPotions(): void {
    // Create multiplayer item manager
    this.itemManager = new MultiplayerItemManager(this, this.player);
    this.itemManager.setSpawnPoints(this.getRoomManager().getRooms());
    
    // Add player2 to item manager
    if (this.player2) {
      (this.itemManager as MultiplayerItemManager).addPlayer(this.player2);
    }
  }

  protected setupEnemies(): void {
    this.movementManager = new MovementManager(this, this.player);
    
    // Create multiplayer enemy manager
    this.enemyManager = new MultiplayerEnemyManager(this, this.player);
    this.enemyManager.setupProceduralEnemies(this.getRoomManager().getRooms());
    
    // Add player2 to enemy manager
    if (this.player2) {
      (this.enemyManager as MultiplayerEnemyManager).addPlayer(this.player2);
    }
    
    // Override targeting methods for multiplayer
    (this as any).getRandomPlayer = () => {
      return Math.random() < 0.5 ? this.player : this.player2;
    };
    
    (this as any).getAllPlayers = () => {
      return [this.player, this.player2].filter(p => p !== null);
    };
  }

  protected setupCollisions(): void {
    super.setupCollisions();
    
    // Add player2 collisions
    if (this.player2) {
      // Player 2 collisions with walls
      if (this.wallsLayer) {
        this.physics.add.collider(this.player2, this.wallsLayer);
      }
      
      // Players can't damage each other - no collision between them
      this.physics.add.overlap(this.player, this.player2, undefined, () => false);
    }
  }

  // Add multiplayer-specific victory handling
  public handleTreasureVictory(winningPlayer?: Player): void {
    if (this.gameOver) {
      return;
    }
    
    // Determine the winning player
    const winner = winningPlayer || this.player;
    const isPlayer2Winner = winner === this.player2;

    this.showMultiplayerVictory(isPlayer2Winner);
  }

  private showMultiplayerVictory(isPlayer2Winner: boolean): void {
    // Stop both players
    [this.player, this.player2].forEach(player => {
      if (player) {
        player.setVelocity(0, 0);
        player.setAcceleration(0, 0);
        player.setActive(false);
        
        const body = player.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(0, 0);
          body.setAcceleration(0, 0);
          body.setEnable(false);
        }
      }
    });

    const screenWidth = 1600;
    const screenHeight = 800;
    
    // Show winner modal
    const winnerX = isPlayer2Winner ? 400 : 1200; // Center of each half (800px wide)
    const winnerY = 300; // Center vertically (600px height)
    
    const winnerContainer = this.add.container(winnerX, winnerY);
    winnerContainer.setScrollFactor(0);
    winnerContainer.setDepth(200);
    
    // Winner overlay
    const winnerOverlay = this.add.rectangle(0, 0, 350, 200, 0x263238, 0.85);
    const winnerBorder = this.add.rectangle(0, 0, 350, 200, 0x000000, 0);
    winnerBorder.setStrokeStyle(4, 0xFFB300);
    
    // Winner text
    const winnerText = this.add.text(0, -50, 'VICTORY!', {
      fontFamily: 'Arial, serif',
      fontSize: '42px',
      color: '#FFB300',
      stroke: '#2A1A4A',
      strokeThickness: 4
    });
    winnerText.setOrigin(0.5);
    
    const winnerSubtext = this.add.text(0, 0, 'King Arthur shall be pleased', {
      fontFamily: 'Arial, serif',
      fontSize: '24px',
      color: '#FFFFFF'
    });
    winnerSubtext.setOrigin(0.5);
    
    const winnerSubtext2 = this.add.text(0, 30, 'with thy performance!', {
      fontFamily: 'Arial, serif',
      fontSize: '24px',
      color: '#FFFFFF'
    });
    winnerSubtext2.setOrigin(0.5);
    
    winnerContainer.add([winnerOverlay, winnerBorder, winnerText, winnerSubtext, winnerSubtext2]);
    
    // Show loser modal
    const loserX = isPlayer2Winner ? 1200 : 400; // Opposite of winner
    const loserY = 300; // Center vertically
    
    const loserContainer = this.add.container(loserX, loserY);
    loserContainer.setScrollFactor(0);
    loserContainer.setDepth(200);
    
    // Loser overlay
    const loserOverlay = this.add.rectangle(0, 0, 350, 200, 0x263238, 0.85);
    const loserBorder = this.add.rectangle(0, 0, 350, 200, 0x000000, 0);
    loserBorder.setStrokeStyle(4, 0xFFB300);
    
    // Loser text
    const loserText = this.add.text(0, -50, 'Pity, Thou art a loser!', {
      fontFamily: 'Arial, serif',
      fontSize: '32px',
      color: '#FFB300',
      stroke: '#2A1A4A',
      strokeThickness: 4
    });
    loserText.setOrigin(0.5);
    
    const loserSubtext = this.add.text(0, 0, 'Thou shalt lead a life of', {
      fontFamily: 'Arial, serif',
      fontSize: '20px',
      color: '#FFFFFF'
    });
    loserSubtext.setOrigin(0.5);
    
    const loserSubtext2 = this.add.text(0, 25, 'impoverished shame', {
      fontFamily: 'Arial, serif',
      fontSize: '20px',
      color: '#FFFFFF'
    });
    loserSubtext2.setOrigin(0.5);
    
    const loserSubtext3 = this.add.text(0, 50, 'from this day onward!', {
      fontFamily: 'Arial, serif',
      fontSize: '20px',
      color: '#FFFFFF'
    });
    loserSubtext3.setOrigin(0.5);
    
    loserContainer.add([loserOverlay, loserBorder, loserText, loserSubtext, loserSubtext2, loserSubtext3]);
    
    // Make sure modals are visible in correct cameras
    if (isPlayer2Winner) {
      this.cameras.main.ignore(winnerContainer);
      this.camera2?.ignore(loserContainer);
    } else {
      this.camera2?.ignore(winnerContainer);
      this.cameras.main.ignore(loserContainer);
    }
    
    // Set game over flag
    this.gameOver = true;
  }

  // Override create method to add debug summary
  create(): void {
    super.create();
    
    // Debug summary for multiplayer
  }

  // Override shutdown to clean up player2
  shutdown(): void {
    if (this.player2) {
      this.player2.destroy();
      this.player2 = null;
    }
    
    if (this.camera2) {
      this.cameras.remove(this.camera2);
      this.camera2 = null;
    }

    // Clean up events
    this.events.removeAllListeners('player2Died');

    super.shutdown();
  }
} 