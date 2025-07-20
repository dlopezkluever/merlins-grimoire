import { Scene, GameObjects, Physics } from 'phaser';
import { Player } from '../player/Player';

const DEBUG_TREASURE = false; // Reduced to prevent log spam

function debugLog(message: string, ...args: any[]) {
  if (DEBUG_TREASURE) {
    console.log(`[TREASURE DEBUG] ${message}`, ...args);
  }
}

export class Treasure extends Physics.Arcade.Sprite {
  private player: Player | null = null;
  private players: Player[] = [];
  private isOpening: boolean = false;
  private isOpened: boolean = false;
  private animationFrames: string[] = [];
  private currentFrame: number = 0;
  private animationSpeed: number = 150; // milliseconds between frames

  constructor(scene: Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'treasure-layer-1');
    
    this.player = player;
    this.players = [player];
    debugLog('Treasure created at position:', x, y, 'with player:', player.constructor.name);
    
    // Initialize animation frames array
    for (let i = 1; i <= 8; i++) {
      this.animationFrames.push(`treasure-layer-${i}`);
    }
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics body
    if (this.body) {
      const body = this.body as Physics.Arcade.Body;
      body.setSize(48, 48); // Larger collision area for easier interaction
      body.setImmovable(true);
    }
    
    // Set depth to ensure it's visible
    this.setDepth(10);
    this.setOrigin(0.5, 0.5);
    
    // Set up collision with player
    if (this.player) {
      debugLog('Setting up treasure collision with primary player');
      scene.physics.add.overlap(this, this.player, this.onPlayerTouch, undefined, this);
    } else {
      console.error('❌ No player reference provided to treasure!');
    }
  }

  public addPlayer(player: Player): void {
    this.players.push(player);
    debugLog('Adding player to treasure:', player.constructor.name, 'Total players:', this.players.length);
    
    // Set up collision for the new player
    this.scene.physics.add.overlap(this, player, this.onPlayerTouch, undefined, this);
    debugLog('Treasure collision set up for new player');
  }

  private currentTouchingPlayer: Player | null = null;

  private onPlayerTouch = (treasure: any, player: any): void => {
    debugLog('onPlayerTouch called with player:', player.constructor.name);
    
    if (this.isOpening || this.isOpened) {
      debugLog('Treasure already opening/opened, ignoring touch');
      return; // Already opening or opened
    }
    
    // Store which player touched the treasure
    this.currentTouchingPlayer = player as Player;
    debugLog('Player touching treasure:', this.currentTouchingPlayer.constructor.name);
    
    this.startOpeningAnimation();
  }

  private startOpeningAnimation(): void {
    if (this.isOpening) return;
    
    this.isOpening = true;
    this.currentFrame = 0;
    
    // Play opening animation
    this.playAnimationSequence();
  }

  private playAnimationSequence(): void {
    if (this.currentFrame >= this.animationFrames.length) {
      // Animation complete
      this.onAnimationComplete();
      return;
    }
    
    // Set current frame texture
    const frameKey = this.animationFrames[this.currentFrame];
    this.setTexture(frameKey);
    
    // Schedule next frame
    this.currentFrame++;
    this.scene.time.delayedCall(this.animationSpeed, () => {
      this.playAnimationSequence();
    });
  }

  private onAnimationComplete(): void {
    this.isOpened = true;
    
    // Trigger victory
    this.triggerVictory();
  }

  private triggerVictory(): void {
    
    // Trigger the scene's victory system instead of creating our own
    const mainScene = this.scene as any;
    if (mainScene.handleTreasureVictory) {
      mainScene.handleTreasureVictory(this.currentTouchingPlayer);
    } else {
      console.error('❌ MainScene.handleTreasureVictory method not found!');
    }
    
    // Add some sparkle effects around the treasure
    this.addSparkleEffects();
  }

  private addSparkleEffects(): void {
    // Create particle emitter for sparkles
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 1000,
      quantity: 2,
      frequency: 100,
      alpha: { start: 1, end: 0 },
      tint: [0xFFD700, 0xFFA500, 0xFFFF00] // Gold, orange, yellow
    });
    particles.setDepth(15);
  }

  public isPlayerNear(): boolean {
    if (!this.player) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.player.x, this.player.y
    );
    
    return distance < 50; // Within 50 pixels
  }
} 