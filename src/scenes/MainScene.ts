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
  protected wallsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  protected mousePointer: Phaser.Input.Pointer | null = null;

  // Game state
  protected gameOver: boolean = false;
  protected gameOverText: Phaser.GameObjects.Text | null = null;
  protected restartText: Phaser.GameObjects.Text | null = null;

  // Room system
  protected roomManager: RoomManager | null = null;

  // Managers and utilities
  protected pathfindingGrid: PathfindingGrid;
  protected barrelManager: BarrelManager | null = null;
  protected enemyManager: EnemyManager | null = null;
  protected itemManager: ItemManager | null = null;
  protected wandManager: WandManager | null = null;
  protected movementManager: MovementManager | null = null;
  // MiniMap removed - no longer needed
  private mazeData!: MazeData;
  private treasure: Treasure | null = null;

  constructor(key: string = 'MainScene') {
    super({ key: key });
    this.pathfindingGrid = PathfindingGrid.getInstance();
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

    console.log('Game started!');

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
    
    console.log('Spawning player at:', spawnX, spawnY, 'in room:', startRoom.id);
    
    this.player = new Player(this, spawnX, spawnY);
    
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

    // Create the treasure
    this.treasure = new Treasure(this, treasureX, treasureY, this.player);
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
      this.physics.add.collider(this.player, this.wallsLayer); // Player vs Walls
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

    // Stop all movement
    this.player.setVelocity(0, 0);

    // Disable player controls
    this.player.setActive(false);

    // Get camera center position
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

    // Create restart button text (15% smaller)
    this.restartText = this.add.text(cameraCenterX, cameraCenterY + 25, 'RESTART THY JOURNEY', {
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

  private handleWin(): void {
    if (this.gameOver) return;

    // Stop all movement
    this.player.setVelocity(0, 0);

    // Disable player controls
    this.player.setActive(false);

    // Get camera center position
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
    //Clean up player
    if (this.player) {
      this.player.destroy();
    }

    // Clean up managers
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
    // MiniMap removed - no longer needed

    // Clean up UI elements
    if (this.gameOverText) {
      this.gameOverText.destroy();
    }
    if (this.restartText) {
      this.restartText.destroy();
    }

    // Clean up input
    if (this.input && this.input.keyboard) {
      this.input.keyboard.removeAllKeys();
    }

    // Clean up events
    this.events.removeListener('playerDied', this.handlePlayerDeath, this);

    // Clean up tilemap layers
    if (this.wallsLayer) {
      this.wallsLayer.destroy();
    }

    this.player = null;
    this.roomManager = null;
    this.barrelManager = null;
    this.enemyManager = null;
    this.itemManager = null;
    this.wandManager = null;
    this.movementManager = null;
    this.treasure = null;
    // MiniMap removed - no longer needed
  }
}