import { Scene, Types, GameObjects } from 'phaser';
import { Player } from '../objects/player/Player';
import { PlainSpell } from '../objects/wands/PlainSpell';
import { EnemyManager } from '../objects/enemy/EnemyManager';
import { RoomManager } from '../objects/rooms/RoomManager';
import { PathfindingGrid } from '../objects/pathfinding/PathfindingGrid';
import { MovementManager } from '../objects/enemy/MovementManager';
import { Room, RoomState } from '../objects/rooms/Room';
import { BarrelManager } from '../objects/props/BarrelManager';
import { WandManager } from '../objects/wands/WandManager';
import { ItemManager } from '../objects/items/ItemManager';
import { MazeGenerator, MazeData } from '../objects/maze/MazeGenerator';
import { Treasure } from '../objects/items/Treasure';
// MiniMap removed - no longer needed

export class MainScene extends Scene {
  // Core game objects
  protected player: Player | null = null;
  protected player2: Player | null = null; // Second player for multiplayer
  protected wallsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  protected wallsLayer2: Phaser.Tilemaps.TilemapLayer | null = null; // Second walls layer for player 2
  protected mousePointer: Phaser.Input.Pointer | null = null;

  // Game state
  protected gameOver: boolean = false;
  protected gameOverText: Phaser.GameObjects.Text | null = null;
  protected restartText: Phaser.GameObjects.Text | null = null;

  // Educational data
  private chemistryLevel: string = '';
  private subSubject: string = '';
  private isMultiplayer: boolean = false;

  // UI elements
  private quitPopup: Phaser.GameObjects.Container | null = null;

  // Room system
  protected roomManager: RoomManager | null = null;
  protected roomManager2: RoomManager | null = null; // Second room manager for player 2

  // Managers and utilities
  protected pathfindingGrid: PathfindingGrid;
  protected pathfindingGrid2: PathfindingGrid | null = null; // Second pathfinding grid for player 2
  protected barrelManager: BarrelManager | null = null;
  protected barrelManager2: BarrelManager | null = null; // Second barrel manager for player 2
  protected enemyManager: EnemyManager | null = null;
  protected enemyManager2: EnemyManager | null = null; // Second enemy manager for player 2
  protected itemManager: ItemManager | null = null;
  protected itemManager2: ItemManager | null = null; // Second item manager for player 2
  protected wandManager: WandManager | null = null;
  protected wandManager2: WandManager | null = null; // Second wand manager for player 2
  protected movementManager: MovementManager | null = null;
  protected movementManager2: MovementManager | null = null; // Second movement manager for player 2
  // MiniMap removed - no longer needed
  private mazeData!: MazeData;
  private mazeData2!: MazeData; // Second maze for player 2
  private treasure: Treasure | null = null;
  private treasure2: Treasure | null = null; // Second treasure for player 2

  // Split-screen cameras
  private camera1: Phaser.Cameras.Scene2D.Camera | null = null;
  private camera2: Phaser.Cameras.Scene2D.Camera | null = null;

  // World containers for separation
  private world1Container: Phaser.GameObjects.Container | null = null;
  private world2Container: Phaser.GameObjects.Container | null = null;

  // Multiplayer state
  private player1Won: boolean = false;
  private player2Won: boolean = false;
  private multiplayerGameOver: boolean = false;

  constructor(key: string = 'MainScene') {
    super({ key: key });
    this.pathfindingGrid = PathfindingGrid.getInstance();
  }

  init(data: { chemistryLevel?: string; subSubject?: string; isMultiplayer?: boolean }): void {
    this.chemistryLevel = data.chemistryLevel || '';
    this.subSubject = data.subSubject || '';
    this.isMultiplayer = data.isMultiplayer || false;
    console.log('Starting game with:', this.chemistryLevel, '-', this.subSubject, 'Multiplayer:', this.isMultiplayer);
  }

  // Asset loading
  preload() {
    this.loadGameAssets();
  }

  private loadGameAssets() {
    this.loadSprite('merlin-idle', 'sprites/merlin-idle.png', 64, 64); // 2 frames
    this.loadSprite('merlin-run', 'sprites/merlin-run.png', 64, 64); // 3 frames
    this.loadSprite('draugr-sprite', 'sprites/draugr.png', 16, 32);
    this.loadSprite('dumb-dumb-sprite', 'sprites/dumb-dumb.png', 32, 32);
    this.loadSprite('scoundrel-sprite', 'sprites/scoundrel.png', 16, 32);
    this.loadSprite('dragon-ling-sprite', 'sprites/dragon-ling.png', 16, 32);
    this.loadSprite('canon', 'sprites/canon.png', 16, 16);
    this.loadSprite('troll-sprite', 'sprites/troll-sprite.png', 32, 32);
    this.loadSprite('arrow', 'sprites/arrow.png', 32, 16);
    this.loadSprite('scoundrel-star', 'sprites/scoundrel-star.png', 32, 32);
    this.loadSprite('smashed-barrel', 'sprites/smashed-barrel.png', 32, 32);
    this.loadSprite('slug-sprite', 'sprites/slug-sprite.png', 16, 32);
    this.loadSprite('spell-bot-animation', 'sprites/spell-bot-sheet.png', 32, 32);
    
    // Load treasure animation frames
    for (let i = 1; i <= 8; i++) {
      this.load.image(`treasure-layer-${i}`, `sprites/treasure/Layer-${i}.png`);
    }
    
    // Load tiles and maps
    this.load.image('tiles-32', 'tiles.png');
    this.load.tilemapTiledJSON('dungeon-map', 'dungeon-32.tmj');

    // Load props
    this.load.image('particle', 'sprites/particle.png');
    // Door system removed - free exploration mode
    this.load.image('barrel', 'sprites/barrel.png');
    this.load.image('health-potion', 'sprites/health-potion.png');
    this.load.image('spark-boost', 'sprites/spark-boost.png');
    this.load.image('plain-spell-1', 'sprites/plain-spell-1.png');
    this.load.image('spell-bot', 'sprites/spell-bot.png');
    this.load.image('slime-shot', 'sprites/slime-shot.png');
    this.load.image('wand-upgrade', 'sprites/wand-upgrade.png');
    // Load sound effects
    // this.load.audio('weapon-upgrade', 'assets/sounds/weapon-upgrade.mp3');
  }

  private loadSprite(name: string, path: string, frameWidth: number, frameHeight: number) {
    this.load.spritesheet(name, path, {
      frameWidth: frameWidth,
      frameHeight: frameHeight
    });
  }

  // Scene initialization
  create() {

    console.log('Game started!', 'Multiplayer:', this.isMultiplayer);
    console.log('Canvas current size:', this.scale.width, 'x', this.scale.height);

    // Resize canvas for multiplayer
    if (this.isMultiplayer) {
      console.log('MULTIPLAYER MODE: Resizing canvas to 1600x600');
      console.log('Before resize - Canvas:', this.scale.canvas.width, 'x', this.scale.canvas.height);
      console.log('Before resize - Scale:', this.scale.width, 'x', this.scale.height);
      
      this.scale.resize(1600, 600);
      
      console.log('After resize - Canvas:', this.scale.canvas.width, 'x', this.scale.canvas.height);
      console.log('After resize - Scale:', this.scale.width, 'x', this.scale.height);
      
      // Force a refresh
      this.scale.refresh();
      
      console.log('After refresh - Canvas:', this.scale.canvas.width, 'x', this.scale.canvas.height);
      console.log('After refresh - Scale:', this.scale.width, 'x', this.scale.height);
      
      this.setupMultiplayerWorlds();
    } else {
      this.setupInput();
      this.setupMap();
      this.setupPlayer();
      this.setupRooms();        // Moved before setupWeaponManager
      this.setupTreasure();     // Place treasure in goal room
      this.setupEnemies();      // Moved here to initialize before player update
      this.setupWandManager();
      this.setupCamera();
      
      // Force health bar repositioning after camera zoom is applied
      if (this.player) {
        const healthBar = (this.player as any).healthBar;
        if (healthBar && healthBar.forceReposition) {
          healthBar.forceReposition();
        }
      }
      
      this.setupPhysics();
      this.setupPathfinding();
      this.setupBarrels();
      this.setupPotions();
      this.setupCollisions();
      // MiniMap removed - no longer needed
    }
    
    // Enable debug visualization
    // this.physics.world.createDebugGraphic();

  }

  private setupInput() {
    if (this.input && this.input.keyboard) {
      this.input.keyboard.on('keydown-F', () => {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
      });
      this.mousePointer = this.input.activePointer;
    }

    if (this.input && this.input.keyboard) {
      this.input.keyboard.on('keydown-R', () => {
        this.shutdown();
        this.scene.restart();
        this.gameOver = false;
      });
      
      // Add Q key functionality for quit/restart popup
      this.input.keyboard.on('keydown-Q', () => {
        this.showQuitPopup();
      });
    }
  }

  private setupMap() {
    // Generate maze data
    const mazeGenerator = new MazeGenerator(5, 5); // 5x5 grid for complex maze
    this.mazeData = mazeGenerator.generateMaze();
    
    // Debug: Log maze data
    console.log('Generated maze with', this.mazeData.rooms.length, 'rooms');
    console.log('Map dimensions:', this.mazeData.mapWidth, 'x', this.mazeData.mapHeight);
    
    // Create tilemap from generated data
    const map = this.createTilemapFromMazeData(this.mazeData);
    const tileset = map.addTilesetImage('tiles-32', 'tiles-32');

    if (!tileset) {
      console.error('Failed to load tilesets');
      return;
    }

    // Create layers from generated data
    const floorLayer = this.createFloorLayer(map, tileset, this.mazeData);
    const floorDecorLayer = map.createBlankLayer('FloorDecor', tileset, 0, 0);
    this.wallsLayer = this.createWallsLayer(map, tileset, this.mazeData);

    // Apply existing layer configurations
    if (floorLayer) {
      floorLayer.setAlpha(1);
      floorLayer.setDepth(-1);
      floorLayer.setPipeline('TextureTintPipeline');
      floorLayer.setScrollFactor(1);
      floorLayer.setCullPadding(32, 32);
    }

    if (floorDecorLayer) {
      floorDecorLayer.setAlpha(1);
      floorDecorLayer.setDepth(-0.5);
      floorDecorLayer.setPipeline('TextureTintPipeline');
      floorDecorLayer.setScrollFactor(1);
      floorDecorLayer.setCullPadding(32, 32);
    }

    if (this.wallsLayer) {
      this.wallsLayer.setCollisionByProperty({ collides: true });
      this.wallsLayer.setPipeline('TextureTintPipeline');
      this.wallsLayer.setScrollFactor(1);
      this.wallsLayer.setCullPadding(32, 32);
    } else {
      console.error('Walls layer is null');
    }
  }

  private createTilemapFromMazeData(mazeData: MazeData): Phaser.Tilemaps.Tilemap {
    return this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: mazeData.mapWidth,
      height: mazeData.mapHeight
    });
  }

  private createFloorLayer(map: Phaser.Tilemaps.Tilemap, tileset: Phaser.Tilemaps.Tileset, mazeData: MazeData): Phaser.Tilemaps.TilemapLayer | null {
    const layer = map.createBlankLayer('Floor', tileset, 0, 0);
    
    if (!layer) return null;
    
    // Place floor tiles based on generated data
    // Using tile index 64 for floor tiles (you may need to adjust based on your tileset)
    mazeData.floorTiles.forEach(tile => {
      layer.putTileAt(64, tile.x, tile.y);
    });
    
    return layer;
  }

  private createWallsLayer(map: Phaser.Tilemaps.Tilemap, tileset: Phaser.Tilemaps.Tileset, mazeData: MazeData): Phaser.Tilemaps.TilemapLayer | null {
    const layer = map.createBlankLayer('Walls', tileset, 0, 0);
    
    if (!layer) return null;
    
    // Place wall tiles based on generated data
    // Using tile index 18 for wall tiles (you may need to adjust based on your tileset)
    mazeData.wallTiles.forEach(tile => {
      const wallTile = layer.putTileAt(18, tile.x, tile.y);
      if (wallTile) {
        wallTile.setCollision(true);
      }
    });
    
    return layer;
  }

  private setupPlayer() {
    // Find the start room (room type 'start')
    const startRoom = this.mazeData.rooms.find(r => r.roomType === 'start') || this.mazeData.rooms[0];
    
    // Spawn player in the center of the start room (convert tile to pixel coordinates)
    const tileSize = 32;
    const spawnX = (startRoom.x + startRoom.width / 2) * tileSize;
    const spawnY = (startRoom.y + startRoom.height / 2) * tileSize;
    
    console.log('Spawning player 1 at:', spawnX, spawnY, 'in room:', startRoom.id);
    
    this.player = new Player(this, spawnX, spawnY, 1);
    
    if (this.isMultiplayer) {
      // Spawn player 2 slightly offset
      console.log('Spawning player 2 at:', spawnX + 50, spawnY, 'in room:', startRoom.id);
      this.player2 = new Player(this, spawnX + 50, spawnY, 2);
      this.player2.setTint(0x808080); // Darker tint for player 2
      
      // Setup player 2 death event
      this.events.on('player2Died', this.handlePlayer2Death, this);
    }
    
    // Setup player death event
    this.events.on('playerDied', this.handlePlayerDeath, this);
  }

  private setupWandManager() {
    this.wandManager = new WandManager(this, this.player);
    this.wandManager.setupProceduralWandUpgrades(this.getRoomManager().getRooms());
  }

  private setupCamera() {
    if (!this.cameras || !this.cameras.main) {
      console.error('Camera system not available');
      return;
    }
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1.5); // Zoom in a bit to see the maze better
    this.cameras.main.setBounds(0, 0, this.mazeData.mapWidth * 32, this.mazeData.mapHeight * 32);
  }

  private setupPhysics() {
    // Set physics bounds to match the actual generated map size
    const worldWidth = this.mazeData.mapWidth * 32;
    const worldHeight = this.mazeData.mapHeight * 32;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    console.log('Physics world bounds set to:', worldWidth, 'x', worldHeight);
  }

  private setupRooms() {
    this.roomManager = new RoomManager(this, this.player);
    this.roomManager.initializeRoomsFromMazeData(this.mazeData);

    // Listen for room state changes
    this.events.on(Room.ROOM_STATE_CHANGED, (room: Room, state: RoomState) => {
      // Win condition: clear the end room
      if (room.getId() === this.mazeData.endRoomId && state === RoomState.ROOM_CLEARED) {
        console.log('You found and cleared the final room! Victory!');
        this.handleWin();
      }
    });
    
    console.log('End room ID:', this.mazeData.endRoomId);
  }

  private setupTreasure() {
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

    // Log detailed information about treasure placement
    console.log('Goal room details:', {
      id: goalRoom.id,
      gridPos: { x: goalRoom.gridX, y: goalRoom.gridY },
      tilePos: { x: goalRoom.x, y: goalRoom.y },
      size: { width: goalRoom.width, height: goalRoom.height },
      roomType: goalRoom.roomType
    });
    console.log('Treasure position (pixels):', treasureX, treasureY);
    console.log('Map bounds:', this.mazeData.mapWidth * tileSize, 'x', this.mazeData.mapHeight * tileSize);

    // Create the treasure for player 1
    this.treasure = new Treasure(this, treasureX, treasureY, this.player, 1);
    
    if (this.isMultiplayer && this.player2) {
      // Create a second treasure for player 2 at a different location
      const treasureX2 = treasureX + 100; // Offset for visibility
      const treasureY2 = treasureY + 50;
      console.log('Spawning treasure 2 at:', treasureX2, treasureY2, 'in room:', goalRoom.id);
      this.treasure2 = new Treasure(this, treasureX2, treasureY2, this.player2, 2);
    }
  }

  private setupPathfinding() {
    const pathfindingGrid = PathfindingGrid.getInstance();
    const map = this.createTilemapFromMazeData(this.mazeData);
    pathfindingGrid.initialize(this, map);
    // Add keyboard shortcut to toggle grid labels
    if (this.input && this.input.keyboard) {
      this.input.keyboard.on('keydown-G', () => {
        if (this.pathfindingGrid) {
          this.pathfindingGrid.toggleGridLabels(this);
        }
      });

      // Add keyboard shortcut to toggle buffered grid visualization
      this.input.keyboard.on('keydown-B', () => {
        if (this.pathfindingGrid) {
          this.pathfindingGrid.toggleBufferedGridVisualization(this);
        }
      });
    }
  }

  private setupBarrels() {
    this.barrelManager = new BarrelManager(this, this.player);
    this.barrelManager.createProceduralBarrels(this.getRoomManager().getRooms());
  }

  private setupPotions() {
    this.itemManager = new ItemManager(this, this.player);
    this.itemManager.setSpawnPoints(this.getRoomManager().getRooms());
    // No need to load from tilemap anymore - items will spawn from barrels
  }

  protected setupEnemies() {
    this.movementManager = new MovementManager(this, this.player);
    this.enemyManager = new EnemyManager(this, this.player);
    this.enemyManager.setupProceduralEnemies(this.getRoomManager().getRooms());
  }


  // Setup collisions AFTER enemies group and player exist
  private setupCollisions() {
    // Collisions with walls
    if (this.wallsLayer) {
      this.physics.add.collider(this.player, this.wallsLayer); // Player 1 vs Walls
      
      if (this.isMultiplayer && this.player2) {
        this.physics.add.collider(this.player2, this.wallsLayer); // Player 2 vs Walls
      }
    }

    if (this.wandManager) {
      this.wandManager.setupCollisions();
    }

    // Setup enemy collisions
    if (this.enemyManager) {
      this.enemyManager.setupCollisions();
    }

    // Setup barrel collisions
    if (this.barrelManager) {
      this.barrelManager.setupCollisions();
    }

    if (this.itemManager) {
      this.itemManager.setupCollisions();
    }
  }

  public handleSpellCollision(spell: any, platform: any) {
    const spellInstance = spell as PlainSpell;
    if (spellInstance && spellInstance.active) {
      spellInstance.deactivate();
    }
  }


  // MiniMap removed - no longer needed

  update(time: number, delta: number) {
    if (this.gameOver) {
      return;
    }
    if (this.movementManager) {
      this.movementManager.updateFlankingPoints(this.getEnemyManager().getEnemies());
    }
    // MiniMap removed - no longer needed
  }


  // Handle player death
  private handlePlayerDeath(): void {
    if (this.gameOver) return;

    // PROPERLY stop all player movement and physics
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setActive(false);
    
    // Get the physics body and disable it completely
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
      body.setDrag(1000); // High drag to stop any residual movement
      body.setMaxVelocity(0); // Prevent any movement
      body.setEnable(false); // Disable the physics body completely
    }
    
    // STOP camera from following the player
    this.cameras.main.stopFollow();
    
    // Get CURRENT camera center position (not player position)
    const cameraCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const cameraCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    // Create semi-transparent dark overlay
    const overlay = this.add.rectangle(cameraCenterX, cameraCenterY, cameraWidth, cameraHeight, 0x263238, 0.85);
    overlay.setOrigin(0.5);
    overlay.setDepth(100); // Ensure it's above other elements

    // Create ornate border frame for the game over message (50% smaller)
    const frameWidth = 300;
    const frameHeight = 150;
    const frame = this.add.rectangle(cameraCenterX, cameraCenterY, frameWidth, frameHeight, 0x3E2723);
    frame.setStrokeStyle(4, 0xFFB300); // Golden border (proportionally smaller)
    frame.setOrigin(0.5);
    frame.setDepth(101);

    // Show game over text at the center of the screen (smaller)
    this.gameOverText = this.add.text(cameraCenterX, cameraCenterY - 25, 'THY QUEST HATH ENDED', {
      fontSize: '24px',
      color: '#FFB300',
      fontFamily: 'Alagard',
      stroke: '#2A1A4A',
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#2A1A4A',
        blur: 1,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5).setDepth(102);

    // Create restart button with medieval styling (15% longer for text)
    const buttonBg = this.add.rectangle(cameraCenterX, cameraCenterY + 25, 180, 40, 0x5D4037);
    buttonBg.setStrokeStyle(2, 0xFFB300);
    buttonBg.setOrigin(0.5);
    buttonBg.setDepth(102);
    buttonBg.setInteractive({ useHandCursor: true });

    // Add button hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x6D4C41);
      buttonBg.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x5D4037);
      buttonBg.setScale(1);
    });

    // Create restart button text (10% smaller)
    this.restartText = this.add.text(cameraCenterX, cameraCenterY + 25, 'RESTART THY JOURNEY', {
      fontSize: '14px',
      color: '#FFC107',
      fontFamily: 'Alagard'
    }).setOrigin(0.5).setDepth(103);

    // Add click handler
    buttonBg.on('pointerdown', () => {
      this.shutdown();
      this.scene.restart();
      this.gameOver = false;
    });

    // Set game over flag
    this.gameOver = true;
  }

  // Show quit/restart popup
  private showQuitPopup(): void {
    // Don't show popup if one already exists or game is over
    if (this.quitPopup || this.gameOver) {
      return;
    }

    // Pause the game
    this.physics.pause();
    
    // Get camera center position
    const cameraCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const cameraCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
    
    // Create popup container
    this.quitPopup = this.add.container(cameraCenterX, cameraCenterY);
    this.quitPopup.setDepth(200);
    
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
    overlay.setInteractive(); // Block clicks behind popup
    
    // Create popup background
    const popupBg = this.add.rectangle(0, 0, 400, 250, 0x3E2723);
    popupBg.setStrokeStyle(4, 0xFFB300);
    
    // Add title text
    const titleText = this.add.text(0, -80, 'WHAT DOST THOU WISH?', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#FFB300',
      stroke: '#2A1A4A',
      strokeThickness: 3
    });
    titleText.setOrigin(0.5);
    
    // Create button style function
    const createButton = (x: number, y: number, text: string, callback: () => void) => {
      const buttonContainer = this.add.container(x, y);
      
      const bg = this.add.rectangle(0, 0, 200, 50, 0x5D4037);
      bg.setStrokeStyle(2, 0xFFB300);
      bg.setInteractive({ useHandCursor: true });
      
      const buttonText = this.add.text(0, 0, text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#FFFFFF'
      });
      buttonText.setOrigin(0.5);
      
      buttonContainer.add([bg, buttonText]);
      
      // Hover effects
      bg.on('pointerover', () => {
        bg.setFillStyle(0x6D4C41);
        bg.setScale(1.05);
      });
      
      bg.on('pointerout', () => {
        bg.setFillStyle(0x5D4037);
        bg.setScale(1);
      });
      
      bg.on('pointerdown', callback);
      
      return buttonContainer;
    };
    
    // Create buttons
    const restartButton = createButton(0, -20, 'RESTART GAME', () => {
      this.closeQuitPopup();
      this.shutdown();
      this.scene.restart({ 
        chemistryLevel: this.chemistryLevel, 
        subSubject: this.subSubject,
        isMultiplayer: this.isMultiplayer
      });
    });
    
    const mainMenuButton = createButton(0, 40, 'MAIN MENU', () => {
      this.closeQuitPopup();
      console.log('Main menu button clicked - reloading page');
      // Reload the entire page to ensure clean state
      window.location.reload();
    });
    
    const cancelButton = createButton(0, 100, 'CONTINUE', () => {
      this.closeQuitPopup();
    });
    
    // Add all elements to popup
    this.quitPopup.add([
      overlay,
      popupBg,
      titleText,
      restartButton,
      mainMenuButton,
      cancelButton
    ]);
    
    // Add ESC key to close popup
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.once('down', () => {
      this.closeQuitPopup();
    });
  }
  
  private closeQuitPopup(): void {
    if (this.quitPopup) {
      this.quitPopup.destroy();
      this.quitPopup = null;
      this.physics.resume();
    }
  }

  // Handle treasure discovery victory
  public handleTreasureVictory(): void {
    if (this.gameOver) {
      return;
    }

    // PROPERLY stop all player movement and physics
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setActive(false);
    
    // Get the physics body and disable it completely
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
      body.setDrag(1000); // High drag to stop any residual movement
      body.setMaxVelocity(0); // Prevent any movement
      body.setEnable(false); // Disable the physics body completely
    }
    
    // STOP camera from following the player
    this.cameras.main.stopFollow();

    // Get CURRENT camera center position (not player position)
    const cameraCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const cameraCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    // Create semi-transparent dark overlay
    const overlay = this.add.rectangle(cameraCenterX, cameraCenterY, cameraWidth, cameraHeight, 0x263238, 0.85);
    overlay.setOrigin(0.5);
    overlay.setDepth(100); // Ensure it's above other elements

    // Create ornate border frame for the victory message (larger for subtitle)
    const frameWidth = 350;
    const frameHeight = 200;
    const frame = this.add.rectangle(cameraCenterX, cameraCenterY, frameWidth, frameHeight, 0x3E2723);
    frame.setStrokeStyle(4, 0xFFB300); // Golden border
    frame.setOrigin(0.5);
    frame.setDepth(101);

    // Show victory text at the center of the screen
    this.gameOverText = this.add.text(cameraCenterX, cameraCenterY - 40, 'TREASURE DISCOVERED!', {
      fontSize: '28px',
      color: '#FFB300',
      fontFamily: 'Alagard',
      stroke: '#2A1A4A',
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#2A1A4A',
        blur: 1,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5).setDepth(102);

    // Add the requested subtitle
    const subtitleText = this.add.text(cameraCenterX, cameraCenterY - 5, 'Pleased with Thou, King Arthur Shalt be!', {
      fontSize: '16px',
      color: '#E0E0E0',
      fontFamily: 'Alagard'
    }).setOrigin(0.5).setDepth(102);

    // Create restart button with medieval styling
    const buttonBg = this.add.rectangle(cameraCenterX, cameraCenterY + 40, 180, 40, 0x5D4037);
    buttonBg.setStrokeStyle(2, 0xFFB300);
    buttonBg.setOrigin(0.5);
    buttonBg.setDepth(102);
    buttonBg.setInteractive({ useHandCursor: true });

    // Add button hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x6D4C41);
      buttonBg.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x5D4037);
      buttonBg.setScale(1);
    });

    // Create restart button text
    this.restartText = this.add.text(cameraCenterX, cameraCenterY + 40, 'BEGIN NEW QUEST', {
      fontSize: '16px',
      color: '#FFC107',
      fontFamily: 'Alagard'
    }).setOrigin(0.5).setDepth(103);

    // Add click handler
    buttonBg.on('pointerdown', () => {
      this.shutdown();
      this.scene.restart();
      this.gameOver = false;
    });

    // Set game over flag to stop all game updates
    this.gameOver = true;
  }

  private handleWin(): void {
    if (this.gameOver) return;

    // PROPERLY stop all player movement and physics
    this.player.setVelocity(0, 0);
    this.player.setAcceleration(0, 0);
    this.player.setActive(false);
    
    // Get the physics body and disable it completely
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
      body.setDrag(1000); // High drag to stop any residual movement
      body.setMaxVelocity(0); // Prevent any movement
      body.setEnable(false); // Disable the physics body completely
    }
    
    // STOP camera from following the player
    this.cameras.main.stopFollow();

    // Get CURRENT camera center position (not player position)
    const cameraCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const cameraCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;

    // Create semi-transparent dark overlay
    const overlay = this.add.rectangle(cameraCenterX, cameraCenterY, cameraWidth, cameraHeight, 0x263238, 0.85);
    overlay.setOrigin(0.5);
    overlay.setDepth(100); // Ensure it's above other elements

    // Create ornate border frame for the victory message (50% smaller)
    const frameWidth = 300;
    const frameHeight = 150;
    const frame = this.add.rectangle(cameraCenterX, cameraCenterY, frameWidth, frameHeight, 0x3E2723);
    frame.setStrokeStyle(4, 0xFFB300); // Golden border (proportionally smaller)
    frame.setOrigin(0.5);
    frame.setDepth(101);

    // Show victory text at the center of the screen (smaller)
    this.gameOverText = this.add.text(cameraCenterX, cameraCenterY - 25, 'VICTORIOUS WIZARD!', {
      fontSize: '24px',
      color: '#FFB300',
      fontFamily: 'Alagard',
      stroke: '#2A1A4A',
      strokeThickness: 2,
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#2A1A4A',
        blur: 1,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5).setDepth(102);

    // Create restart button with medieval styling
    const buttonBg = this.add.rectangle(cameraCenterX, cameraCenterY + 25, 120, 40, 0x5D4037);
    buttonBg.setStrokeStyle(2, 0xFFB300);
    buttonBg.setOrigin(0.5);
    buttonBg.setDepth(102);
    buttonBg.setInteractive({ useHandCursor: true });

    // Add button hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x6D4C41);
      buttonBg.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x5D4037);
      buttonBg.setScale(1);
    });

    // Create restart button text
    this.restartText = this.add.text(cameraCenterX, cameraCenterY + 25, 'PLAY AGAIN', {
      fontSize: '16px',
      color: '#FFC107',
      fontFamily: 'Alagard'
    }).setOrigin(0.5).setDepth(103);

    // Add click handler
    buttonBg.on('pointerdown', () => {
      this.shutdown();
      this.scene.restart();
      this.gameOver = false;
    });

    // Set game over flag
    this.gameOver = true;
  }

  // Getter for player
  public getPlayer(): Player {
    if (!this.player) {
      throw new Error('Player not initialized');
    }
    return this.player;
  }

  // Getter for walls layer
  public getWallsLayer(): Phaser.Tilemaps.TilemapLayer | null {
    return this.wallsLayer;
  }

  // Getter for tilemap
  public getTilemap(): Phaser.Tilemaps.Tilemap | null {
    return this.createTilemapFromMazeData(this.mazeData);
  }

  // Add getter for pathfinding grid
  public getPathfindingGrid(): PathfindingGrid {
    return this.pathfindingGrid;
  }

  // Add getter for barrel manager
  public getBarrelManager(): BarrelManager {
    if (!this.barrelManager) {
      throw new Error('BarrelManager not initialized');
    }
    return this.barrelManager;
  }

  // Add getter for enemy manager
  public getEnemyManager(): EnemyManager {
    if (!this.enemyManager) {
      throw new Error('EnemyManager not initialized');
    }
    return this.enemyManager;
  }

  public getRoomManager(): RoomManager {
    if (!this.roomManager) {
      throw new Error('RoomManager not initialized');
    }
    return this.roomManager;
  }


  public getMovementManager(): MovementManager {
    if (!this.movementManager) {
      throw new Error('MovementManager not initialized');
    }
    return this.movementManager;
  }

  public getItemManager(): ItemManager {
    if (!this.itemManager) {
      throw new Error('ItemManager not initialized');
    }
    return this.itemManager;
  }

  public getWandManager(): WandManager {
    if (!this.wandManager) {
      throw new Error('WandManager not initialized');
    }
    return this.wandManager;
  }

  public isPositionValid(x: number, y: number): boolean {
    const pathfindingGrid = this.getPathfindingGrid();
    return pathfindingGrid.isTileWalkable(x, y);
  }

  shutdown() {
    console.log('Shutting down scene');
    
    // Clean up players
    if (this.player) {
      this.player.destroy();
    }
    if (this.player2) {
      this.player2.destroy();
    }

    // Clean up managers for world 1
    if (this.roomManager) {
      this.roomManager.destroy();
    }
    if (this.barrelManager) {
      this.barrelManager.destroy();
    }
    if (this.enemyManager) {
      this.enemyManager.destroy();
    }
    if (this.itemManager) {
      this.itemManager.destroy();
    }
    if (this.wandManager) {
      this.wandManager.destroy();
    }
    if (this.movementManager) {
      this.movementManager.destroy();
    }
    if (this.treasure) {
      this.treasure.destroy();
      this.treasure = null;
    }
    
    // Clean up managers for world 2
    if (this.roomManager2) {
      this.roomManager2.destroy();
    }
    if (this.barrelManager2) {
      this.barrelManager2.destroy();
    }
    if (this.enemyManager2) {
      this.enemyManager2.destroy();
    }
    if (this.itemManager2) {
      this.itemManager2.destroy();
    }
    if (this.wandManager2) {
      this.wandManager2.destroy();
    }
    if (this.movementManager2) {
      this.movementManager2.destroy();
    }
    if (this.treasure2) {
      this.treasure2.destroy();
      this.treasure2 = null;
    }

    // Clean up UI elements
    if (this.gameOverText) {
      this.gameOverText.destroy();
    }
    if (this.restartText) {
      this.restartText.destroy();
    }
    if (this.quitPopup) {
      this.quitPopup.destroy();
      this.quitPopup = null;
    }

    // Clean up world containers
    if (this.world1Container) {
      this.world1Container.destroy();
    }
    if (this.world2Container) {
      this.world2Container.destroy();
    }

    // Clean up input
    if (this.input && this.input.keyboard) {
      this.input.keyboard.removeAllKeys();
    }

    // Clean up events
    this.events.removeListener('playerDied', this.handlePlayerDeath, this);
    this.events.removeListener('player2Died', this.handlePlayer2Death, this);
    this.events.removeListener('treasureCollected', this.handleMultiplayerWin, this);

    // Clean up tilemap layers
    if (this.wallsLayer) {
      this.wallsLayer.destroy();
    }
    if (this.wallsLayer2) {
      this.wallsLayer2.destroy();
    }

    // Reset all references
    this.player = null;
    this.player2 = null;
    this.roomManager = null;
    this.roomManager2 = null;
    this.barrelManager = null;
    this.barrelManager2 = null;
    this.enemyManager = null;
    this.enemyManager2 = null;
    this.itemManager = null;
    this.itemManager2 = null;
    this.wandManager = null;
    this.wandManager2 = null;
    this.movementManager = null;
    this.movementManager2 = null;
    this.treasure = null;
    this.treasure2 = null;
    this.world1Container = null;
    this.world2Container = null;
    this.camera1 = null;
    this.camera2 = null;
    
    // Reset multiplayer state
    this.multiplayerGameOver = false;
    this.player1Won = false;
    this.player2Won = false;
  }

  // Multiplayer setup methods
  private setupMultiplayerWorlds(): void {
    console.log('Setting up multiplayer worlds...');
    
    try {
      // Setup input first
      console.log('Setting up input...');
      this.setupInput();
      
      // Setup the map (shared tilemap but we'll have two separate mazes)
      console.log('Setting up map...');
      this.setupMap();
      
             // Setup both players
       console.log('Setting up players...');
       this.setupPlayer();
      
      // Setup rooms for both players
      console.log('Setting up rooms...');
      this.setupRooms();
      
      // Setup treasures for both players
      console.log('Setting up treasures...');
      this.setupTreasure();
      
      // Setup enemies for both players
      console.log('Setting up enemies...');
      this.setupEnemies();
      
      // Setup wand managers
      console.log('Setting up wand managers...');
      this.setupWandManager();
      
      // Setup split-screen cameras
      console.log('Setting up multiplayer cameras...');
      this.setupMultiplayerCameras();
      
      // Setup physics
      console.log('Setting up physics...');
      this.setupPhysics();
      
      // Setup pathfinding
      console.log('Setting up pathfinding...');
      this.setupPathfinding();
      
      // Setup barrels
      console.log('Setting up barrels...');
      this.setupBarrels();
      
      // Setup potions
      console.log('Setting up potions...');
      this.setupPotions();
      
      // Setup collisions
      console.log('Setting up collisions...');
      this.setupCollisions();
      
      // Setup multiplayer-specific events
      console.log('Setting up multiplayer events...');
      this.setupMultiplayerEvents();
      
      console.log('Multiplayer setup completed successfully!');
    } catch (error) {
      console.error('ERROR in setupMultiplayerWorlds:', error);
    }
  }



  private setupMultiplayerCameras(): void {
    if (!this.isMultiplayer || !this.player2) {
      // Just setup single camera if not multiplayer
      this.cameras.main.startFollow(this.player!);
      this.cameras.main.setZoom(1.5);
      this.cameras.main.setBounds(0, 0, this.mazeData.mapWidth * 32, this.mazeData.mapHeight * 32);
      return;
    }
    
    console.log('Setting up split-screen cameras...');
    
    // Hide the main camera
    this.cameras.main.setVisible(false);
    
    // Create camera for Player 1 (right side)
    this.camera1 = this.cameras.add(800, 0, 800, 600);
    this.camera1.startFollow(this.player!);
    this.camera1.setZoom(1.5);
    this.camera1.setBounds(0, 0, this.mazeData.mapWidth * 32, this.mazeData.mapHeight * 32);
    console.log('Player 1 camera created (right side)');
    
    // Create camera for Player 2 (left side)
    this.camera2 = this.cameras.add(0, 0, 800, 600);
    this.camera2.startFollow(this.player2);
    this.camera2.setZoom(1.5);
    this.camera2.setBounds(0, 0, this.mazeData.mapWidth * 32, this.mazeData.mapHeight * 32);
    console.log('Player 2 camera created (left side)');
    
    // Add divider line between screens
    const divider = this.add.rectangle(800, 300, 4, 600, 0x000000);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
    console.log('Split-screen divider added');
  }



  private setupMultiplayerEvents(): void {
    // Override treasure collection to handle multiplayer win conditions
    this.events.off('treasureCollected');
    
    // Listen for treasure collection from either player
    this.events.on('treasureCollected', (playerId: number) => {
      this.handleMultiplayerWin(playerId);
    });
  }

  private handleMultiplayerWin(winnerId: number): void {
    if (this.multiplayerGameOver) return;
    
    this.multiplayerGameOver = true;
    
    // Stop both players
    if (this.player) {
      this.player.setActive(false);
      this.player.setVelocity(0, 0);
    }
    if (this.player2) {
      this.player2.setActive(false);
      this.player2.setVelocity(0, 0);
    }
    
    // Stop cameras
    this.camera1?.stopFollow();
    this.camera2?.stopFollow();
    
    // Show victory modal for winner and defeat modal for loser
    if (winnerId === 1) {
      this.showMultiplayerVictoryModal(1);
      this.showMultiplayerDefeatModal(2);
    } else {
      this.showMultiplayerVictoryModal(2);
      this.showMultiplayerDefeatModal(1);
    }
  }

  private showMultiplayerVictoryModal(playerId: number): void {
    const camera = playerId === 1 ? this.camera1 : this.camera2;
    if (!camera) return;
    
    const centerX = camera.scrollX + camera.width / 2;
    const centerY = camera.scrollY + camera.height / 2;
    
    // Create overlay
    const overlay = this.add.rectangle(centerX, centerY, camera.width, camera.height, 0x263238, 0.85);
    overlay.setDepth(100);
    
    // Create frame
    const frame = this.add.rectangle(centerX, centerY, 400, 250, 0x3E2723);
    frame.setStrokeStyle(4, 0xFFB300);
    frame.setDepth(101);
    
    // Victory text
    const titleText = this.add.text(centerX, centerY - 60, 'Victory!', {
      fontSize: '36px',
      color: '#FFB300',
      fontFamily: 'Alagard',
      stroke: '#2A1A4A',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(102);
    
    const subtitleText = this.add.text(centerX, centerY - 20, 'Pleased and Tickled with Thou,\nKing Arthur Shalt Be', {
      fontSize: '18px',
      color: '#E0E0E0',
      fontFamily: 'Alagard',
      align: 'center'
    }).setOrigin(0.5).setDepth(102);
    
    // Restart button
    const buttonBg = this.add.rectangle(centerX, centerY + 50, 200, 50, 0x5D4037);
    buttonBg.setStrokeStyle(2, 0xFFB300);
    buttonBg.setDepth(102);
    buttonBg.setInteractive({ useHandCursor: true });
    
    const buttonText = this.add.text(centerX, centerY + 50, 'RECOMMENCE QUEST', {
      fontSize: '18px',
      color: '#FFC107',
      fontFamily: 'Alagard'
    }).setOrigin(0.5).setDepth(103);
    
    buttonBg.on('pointerdown', () => {
      this.shutdown();
      this.scene.restart({ 
        chemistryLevel: this.chemistryLevel, 
        subSubject: this.subSubject,
        isMultiplayer: this.isMultiplayer
      });
    });
    
    // Make sure only the correct camera sees this modal
    if (playerId === 1) {
      this.camera2?.ignore([overlay, frame, titleText, subtitleText, buttonBg, buttonText]);
    } else {
      this.camera1?.ignore([overlay, frame, titleText, subtitleText, buttonBg, buttonText]);
    }
  }

  private showMultiplayerDefeatModal(playerId: number): void {
    const camera = playerId === 1 ? this.camera1 : this.camera2;
    if (!camera) return;
    
    const centerX = camera.scrollX + camera.width / 2;
    const centerY = camera.scrollY + camera.height / 2;
    
    // Create overlay
    const overlay = this.add.rectangle(centerX, centerY, camera.width, camera.height, 0x263238, 0.85);
    overlay.setDepth(100);
    
    // Create frame
    const frame = this.add.rectangle(centerX, centerY, 400, 250, 0x3E2723);
    frame.setStrokeStyle(4, 0x8B0000); // Red border for defeat
    frame.setDepth(101);
    
    // Defeat text
    const titleText = this.add.text(centerX, centerY - 60, 'Pity, Thou art a Loser!', {
      fontSize: '28px',
      color: '#FF0000',
      fontFamily: 'Alagard',
      stroke: '#2A1A4A',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(102);
    
    const subtitleText = this.add.text(centerX, centerY - 20, 'Thou shalt lead a life of\nimpoverished shame from this day onward!', {
      fontSize: '16px',
      color: '#E0E0E0',
      fontFamily: 'Alagard',
      align: 'center'
    }).setOrigin(0.5).setDepth(102);
    
    // Restart button
    const buttonBg = this.add.rectangle(centerX, centerY + 50, 200, 50, 0x5D4037);
    buttonBg.setStrokeStyle(2, 0x8B0000);
    buttonBg.setDepth(102);
    buttonBg.setInteractive({ useHandCursor: true });
    
    const buttonText = this.add.text(centerX, centerY + 50, 'TRY AGAIN', {
      fontSize: '18px',
      color: '#FF6666',
      fontFamily: 'Alagard'
    }).setOrigin(0.5).setDepth(103);
    
    buttonBg.on('pointerdown', () => {
      this.shutdown();
      this.scene.restart({ 
        chemistryLevel: this.chemistryLevel, 
        subSubject: this.subSubject,
        isMultiplayer: this.isMultiplayer
      });
    });
    
    // Make sure only the correct camera sees this modal
    if (playerId === 1) {
      this.camera2?.ignore([overlay, frame, titleText, subtitleText, buttonBg, buttonText]);
    } else {
      this.camera1?.ignore([overlay, frame, titleText, subtitleText, buttonBg, buttonText]);
    }
  }

  private handlePlayer1Death(): void {
    this.handlePlayerDeath(); // Use the existing method for now
  }

  private handlePlayer2Death(): void {
    if (this.gameOver || this.multiplayerGameOver) return;
    
    // For now, use the same logic as player 1 but for player 2
    if (!this.player2) return;
    
    // Show death popup for player 2
    console.log('Player 2 died! Implementing respawn...');
    
    // Simple respawn after 3 seconds
    this.time.delayedCall(3000, () => {
      this.respawnPlayer2();
    });
  }

  private showPlayerDeathPopup(playerId: number): void {
    const camera = playerId === 1 ? this.camera1 : this.camera2;
    const player = playerId === 1 ? this.player : this.player2;
    if (!camera || !player) return;
    
    const centerX = camera.scrollX + camera.width / 2;
    const centerY = camera.scrollY + camera.height / 2;
    
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(centerX, centerY, camera.width, camera.height, 0x000000, 0.7);
    overlay.setDepth(90);
    
    // Create popup background
    const popupBg = this.add.rectangle(centerX, centerY, 350, 200, 0x3E2723);
    popupBg.setStrokeStyle(3, 0x8B0000);
    popupBg.setDepth(91);
    
    // Death message
    const deathText = this.add.text(centerX, centerY - 40, 'THY JOURNEY HAS ENDED', {
      fontSize: '24px',
      color: '#FF6666',
      fontFamily: 'Alagard',
      stroke: '#2A1A4A',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(92);
    
    const subtitleText = this.add.text(centerX, centerY, "But don't worry, a new quest\nshall begin very soon", {
      fontSize: '16px',
      color: '#E0E0E0',
      fontFamily: 'Alagard',
      align: 'center'
    }).setOrigin(0.5).setDepth(92);
    
    const timerText = this.add.text(centerX, centerY + 40, 'Respawning in 3...', {
      fontSize: '18px',
      color: '#FFC107',
      fontFamily: 'Alagard'
    }).setOrigin(0.5).setDepth(92);
    
    // Countdown timer
    let countdown = 3;
    const timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        countdown--;
        if (countdown > 0) {
          timerText.setText(`Respawning in ${countdown}...`);
        }
      },
      repeat: 2
    });
    
    // Make sure only the correct camera sees this popup
    const popupElements = [overlay, popupBg, deathText, subtitleText, timerText];
    if (playerId === 1) {
      this.camera2?.ignore(popupElements);
    } else {
      this.camera1?.ignore(popupElements);
    }
    
    // Clean up popup after 3 seconds
    this.time.delayedCall(3000, () => {
      popupElements.forEach(element => element.destroy());
    });
  }

  private respawnPlayer1(): void {
    if (!this.player || this.multiplayerGameOver) return;
    
    // Find start room
    const startRoom = this.mazeData.rooms.find(r => r.roomType === 'start') || this.mazeData.rooms[0];
    const tileSize = 32;
    const spawnX = (startRoom.x + startRoom.width / 2) * tileSize;
    const spawnY = (startRoom.y + startRoom.height / 2) * tileSize;
    
    // Reset player
    this.player.setPosition(spawnX, spawnY);
    this.player.setActive(true);
    this.player.setVisible(true);
    
    // Reset health and other stats
    (this.player as any).resetHealth();
    (this.player as any).resetWand();
    (this.player as any).clearInventory();
    
    // Re-enable physics
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(true);
      body.setVelocity(0, 0);
    }
    
    // Make health bar visible again
    (this.player as any).healthBar?.setVisible(true);
    
    // Resume camera follow
    this.camera1?.startFollow(this.player);
  }

  private respawnPlayer2(): void {
    if (!this.player2 || this.multiplayerGameOver) return;
    
    // Find start room
    const startRoom = this.mazeData2.rooms.find(r => r.roomType === 'start') || this.mazeData2.rooms[0];
    const tileSize = 32;
    const spawnX = (startRoom.x + startRoom.width / 2) * tileSize;
    const spawnY = (startRoom.y + startRoom.height / 2) * tileSize;
    
    // Reset player
    this.player2.setPosition(spawnX, spawnY);
    this.player2.setActive(true);
    this.player2.setVisible(true);
    
    // Reset health and other stats
    (this.player2 as any).resetHealth();
    (this.player2 as any).resetWand();
    (this.player2 as any).clearInventory();
    
    // Re-enable physics
    const body = this.player2.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(true);
      body.setVelocity(0, 0);
    }
    
    // Make health bar visible again
    (this.player2 as any).healthBar?.setVisible(true);
    
    // Resume camera follow
    this.camera2?.startFollow(this.player2);
  }

  private applyMazeToTilemap(map: Phaser.Tilemaps.Tilemap, mazeData: MazeData): void {
    // This is a placeholder - the actual implementation would need to 
    // properly apply the maze data to the tilemap
    // For now, we'll just use the existing tilemap as-is
  }
}