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

const DEBUG_MULTIPLAYER = true; // Keep on for setup debugging

function debugLog(message: string, ...args: any[]) {
  if (DEBUG_MULTIPLAYER) {
    console.log(`[MULTIPLAYER DEBUG] ${message}`, ...args);
  }
}

export class MainScene extends Scene {
  // Core game objects
  protected player: Player | null = null;
  protected player2: Player | null = null; // Second player for multiplayer
  protected wallsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
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
  
  // Split-screen cameras
  private camera1: Phaser.Cameras.Scene2D.Camera | null = null;
  private camera2: Phaser.Cameras.Scene2D.Camera | null = null;

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

    console.log('Game started!');

    // Handle multiplayer canvas resize
    if (this.isMultiplayer) {
      console.log('Setting up multiplayer mode...');
      this.scale.resize(1600, 800);
    }

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
    
    if (this.player2) {
      const healthBar2 = (this.player2 as any).healthBar;
      if (healthBar2 && healthBar2.forceReposition) {
        healthBar2.forceReposition();
      }
    }
    
    this.setupPhysics();
    this.setupPathfinding();
    this.setupBarrels();
    this.setupPotions();
    this.setupCollisions();
    // MiniMap removed - no longer needed
    
    // Debug summary for multiplayer
    if (this.isMultiplayer) {
      debugLog('=== MULTIPLAYER SETUP SUMMARY ===');
      debugLog('Canvas size:', this.game.canvas.width, 'x', this.game.canvas.height);
      debugLog('Scale size:', this.scale.gameSize.width, 'x', this.scale.gameSize.height);
      debugLog('Player 1 position:', this.player.x, this.player.y);
      debugLog('Player 2 position:', this.player2?.x, this.player2?.y);
      debugLog('Main camera viewport:', {
        x: this.cameras.main.x, 
        y: this.cameras.main.y, 
        width: this.cameras.main.width, 
        height: this.cameras.main.height
      });
      debugLog('Camera2 viewport:', this.camera2 ? {
        x: this.camera2.x, 
        y: this.camera2.y, 
        width: this.camera2.width, 
        height: this.camera2.height
      } : 'NOT_CREATED');
      debugLog('Total children in scene:', this.children.length);
      debugLog('Players in scene:', this.children.list.filter(child => child.type === 'Sprite' && (child as any).texture?.key?.includes?.('player')).length);
      debugLog('Barrels in scene:', this.children.list.filter(child => (child as any).texture?.key?.includes?.('barrel')).length);
      debugLog('=== END SUMMARY ===');
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
    
    console.log('Spawning player at:', spawnX, spawnY, 'in room:', startRoom.id);
    
    // Create player 1
    this.player = new Player(this, spawnX, spawnY, 1);
    
    // Create player 2 for multiplayer
    if (this.isMultiplayer) {
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
    
    // Setup player death event
    this.events.on('playerDied', (player: Player) => {
      this.handlePlayerDeath(player);
    });
  }

  private setupWandManager() {
    this.wandManager = new WandManager(this, this.player);
    this.wandManager.setupProceduralWandUpgrades(this.getRoomManager().getRooms());
    
    // In multiplayer, add player 2 to wand manager
    if (this.isMultiplayer && this.player2) {
      debugLog('Adding Player 2 to wand manager');
      (this.wandManager as any).addPlayer(this.player2);
      debugLog('Player 2 added to wand manager');
    }
  }

  private setupCamera() {
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

    if (this.isMultiplayer) {
      debugLog('Setting up multiplayer mode - FULL 1600x600');
      
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
      debugLog('Player 1 camera (main) configured:', {
        viewport: { x: halfWidth, y: 0, width: halfWidth, height: screenHeight },
        bounds: worldBounds,
        zoom: 1.5
      });

      // Create left camera for Player 2
      this.camera2 = this.cameras.add(0, 0, halfWidth, screenHeight);
      this.camera2.startFollow(this.player2);
      this.camera2.setZoom(1.5);
      this.camera2.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
      debugLog('Player 2 camera created:', {
        viewport: { x: 0, y: 0, width: halfWidth, height: screenHeight },
        bounds: worldBounds,
        zoom: 1.5
      });

      // Simple divider line
      const divider = this.add.rectangle(halfWidth, screenHeight / 2, 2, screenHeight, 0x000000);
      divider.setScrollFactor(0);
      divider.setDepth(1000);
      debugLog('Simple divider created');
      
      debugLog('Simplified multiplayer setup complete');
    } else {
      // Single player setup
      this.cameras.main.startFollow(this.player);
      this.cameras.main.setZoom(1.5);
      this.cameras.main.setBounds(worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height);
    }
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
    
    // In multiplayer, set up room tracking for player 2
    if (this.isMultiplayer && this.player2) {
      debugLog('Adding Player 2 to game systems');
      (this.roomManager as any).addPlayer(this.player2);
      debugLog('Player 2 added to room manager');
    }

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
    
    // Add player 2 if in multiplayer
    if (this.isMultiplayer && this.player2) {
      (this.treasure as any).addPlayer(this.player2);
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
    
    // Add player 2 to barrel manager if in multiplayer
    if (this.isMultiplayer && this.player2) {
      (this.barrelManager as any).addPlayer(this.player2);
    }
  }

  private setupPotions() {
    this.itemManager = new ItemManager(this, this.player);
    this.itemManager.setSpawnPoints(this.getRoomManager().getRooms());
    // No need to load from tilemap anymore - items will spawn from barrels
    
    // Add player 2 to item manager if in multiplayer
    if (this.isMultiplayer && this.player2) {
      (this.itemManager as any).addPlayer(this.player2);
    }
  }

  protected setupEnemies() {
    this.movementManager = new MovementManager(this, this.player);
    this.enemyManager = new EnemyManager(this, this.player);
    
    // Add Player 2 to enemy manager in multiplayer
    if (this.isMultiplayer && this.player2) {
      debugLog('Adding Player 2 to enemy manager in setupEnemies');
      (this.enemyManager as any).addPlayer(this.player2);
      debugLog('Player 2 added to enemy manager in setupEnemies');
    }
    
    this.enemyManager.setupProceduralEnemies(this.getRoomManager().getRooms());
    
    // In multiplayer, setup random targeting (player already added in enemy manager setup)
    if (this.isMultiplayer && this.player2) {
      // Add a method to the scene that enemies can use to get a random target
      (this as any).getRandomPlayer = () => {
        // 50/50 chance to target either player
        return Math.random() < 0.5 ? this.player : this.player2;
      };
      
      // Also provide a method to get all players
      (this as any).getAllPlayers = () => {
        return [this.player, this.player2];
      };
    } else {
      // Single player mode
      (this as any).getRandomPlayer = () => this.player;
      (this as any).getAllPlayers = () => [this.player];
    }
    
    // Player 2 already added to enemy manager during setupEnemies()
  }


  // Setup collisions AFTER enemies group and player exist
  private setupCollisions() {
    // Collisions with walls
    if (this.wallsLayer) {
      this.physics.add.collider(this.player, this.wallsLayer); // Player vs Walls
      
      // Player 2 collisions with walls
      if (this.isMultiplayer && this.player2) {
        this.physics.add.collider(this.player2, this.wallsLayer);
      }
    }
    
    // Players can't damage each other - no collision between them
    if (this.isMultiplayer && this.player2) {
      // Players pass through each other
      this.physics.add.overlap(this.player, this.player2, undefined, () => false);
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


  // Handle player death with respawn
  private handlePlayerDeath(deadPlayer?: Player): void {
    if (this.gameOver) return;

    // Determine which player died
    const playerToRespawn = deadPlayer || this.player;
    const isPlayer2 = playerToRespawn === this.player2;
    
    // Disable the dead player temporarily
    playerToRespawn.setActive(false);
    playerToRespawn.setVisible(false);
    
    // Get the physics body and disable it
    const body = playerToRespawn.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.setEnable(false);
    }
    
    // Show death modal
    this.showDeathModal(isPlayer2);
    
    // Respawn after 3 second delay
    this.time.delayedCall(3000, () => {
      this.hideDeathModal(isPlayer2);
      this.respawnPlayer(playerToRespawn, isPlayer2);
    });
  }
  
  private deathModalContainers: { [key: number]: Phaser.GameObjects.Container } = {};
  
  private showDeathModal(isPlayer2: boolean): void {
    const playerId = isPlayer2 ? 2 : 1;
    
    // Get the appropriate camera position
    let x: number, y: number;
    if (this.isMultiplayer) {
      const screenWidth = 1600;
      const screenHeight = 800;
      if (isPlayer2) {
        // Player 2 (left side)
        x = screenWidth / 4;
        y = screenHeight / 2;
      } else {
        // Player 1 (right side)
        x = (screenWidth / 4) * 3;
        y = screenHeight / 2;
      }
    } else {
      // Single player - center of screen
      x = this.cameras.main.width / 2;
      y = this.cameras.main.height / 2;
    }
    
    // Create modal container
    const container = this.add.container(x, y);
    container.setScrollFactor(0);
    container.setDepth(200);
    
    // Semi-transparent overlay
    const overlay = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.85);
    
    // Border
    const border = this.add.rectangle(0, 0, 400, 200, 0x000000, 0);
    border.setStrokeStyle(4, 0xFFB300);
    
    // Update modal style to match victory modal
    overlay.fillColor = 0x263238;
    overlay.setAlpha(0.85);
    
    // Message text
    const messageText = this.add.text(0, -30, 'Thy journey hath endth', {
      fontFamily: 'Arial, serif',
      fontSize: '24px',
      color: '#FFB300',
      stroke: '#2A1A4A',
      strokeThickness: 3
    });
    messageText.setOrigin(0.5);
    
    const subText = this.add.text(0, 10, 'But thy journey shall begin again soon.', {
      fontFamily: 'Arial, serif',
      fontSize: '18px',
      color: '#FFFFFF'
    });
    subText.setOrigin(0.5);
    
    container.add([overlay, border, messageText, subText]);
    
    // Store the container so we can remove it later
    this.deathModalContainers[playerId] = container;
    
    // In multiplayer, ensure modal is only visible in the correct camera
    if (this.isMultiplayer) {
      if (playerId === 1) {
        this.camera2?.ignore(container);
      } else {
        this.camera1?.ignore(container);
      }
    }
  }
  
  private hideDeathModal(isPlayer2: boolean): void {
    const playerId = isPlayer2 ? 2 : 1;
    const container = this.deathModalContainers[playerId];
    if (container) {
      container.destroy();
      delete this.deathModalContainers[playerId];
    }
  }

  private respawnPlayer(player: Player, isPlayer2: boolean): void {
    // Find the start room
    const startRoom = this.mazeData.rooms.find(r => r.roomType === 'start') || this.mazeData.rooms[0];
    const tileSize = 32;
    let spawnX = (startRoom.x + startRoom.width / 2) * tileSize;
    const spawnY = (startRoom.y + startRoom.height / 2) * tileSize;
    
    // Offset player 2
    if (isPlayer2) {
      spawnX += 50;
    }
    
    // Reset player position
    player.setPosition(spawnX, spawnY);
    
    // Reset player state
    player.setActive(true);
    player.setVisible(true);
    (player as any).resetHealth(); // Reset health to full
    (player as any).resetWand(); // Reset wand to base state
    (player as any).clearInventory(); // Clear inventory
    
    // Re-enable physics
    const body = player.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setEnable(true);
      body.setVelocity(0, 0);
    }
  }

  // Old game over code - keeping for single player mode if needed later
  private showGameOverScreen(): void {
    // Get camera center position
    const cameraCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
    const cameraCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;
    
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
      
      // Reset canvas size if in multiplayer
      if (this.isMultiplayer) {
        this.scale.resize(800, 600);
      }
      
      this.shutdown();
      this.scene.start('MenuScene');
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
  public handleTreasureVictory(winningPlayer?: Player): void {
    if (this.gameOver) {
      return;
    }
    
    // Determine the winning player
    const winner = winningPlayer || this.player;
    const isPlayer2Winner = winner === this.player2;

    // Handle multiplayer victory
    if (this.isMultiplayer) {
      this.showMultiplayerVictory(isPlayer2Winner);
      return;
    }
    
    // Single player victory - continue with existing code
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
    //Clean up player
    if (this.player) {
      this.player.destroy();
    }
    if (this.player2) {
      this.player2.destroy();
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
    if (this.quitPopup) {
      this.quitPopup.destroy();
      this.quitPopup = null;
    }
    
    // Clean up death modals
    Object.values(this.deathModalContainers).forEach(container => {
      container.destroy();
    });
    this.deathModalContainers = {};

    // Clean up input
    if (this.input && this.input.keyboard) {
      this.input.keyboard.removeAllKeys();
    }

    // Clean up events
          this.events.removeAllListeners('playerDied');
      this.events.removeAllListeners('player2Died');

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
      this.camera1?.ignore(winnerContainer);
      this.camera2?.ignore(loserContainer);
    } else {
      this.camera2?.ignore(winnerContainer);
      this.camera1?.ignore(loserContainer);
    }
    
    // Set game over flag
    this.gameOver = true;
  }
}