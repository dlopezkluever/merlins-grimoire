import { Scene, GameObjects, Physics } from 'phaser';
import { Player } from '../player/Player';

export class Treasure extends Physics.Arcade.Sprite {
  private player: Player | null = null;
  private isOpening: boolean = false;
  private isOpened: boolean = false;
  private animationFrames: string[] = [];
  private currentFrame: number = 0;
  private animationSpeed: number = 150; // milliseconds between frames

  constructor(scene: Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'treasure-layer-1');
    
    this.player = player;
    
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
      body.setSize(32, 32); // Adjust size as needed
      body.setImmovable(true);
    }
    
    // Set depth to ensure it's visible
    this.setDepth(10);
    this.setOrigin(0.5, 0.5);
    
    // Set up collision with player
    if (this.player) {
      scene.physics.add.overlap(this, this.player, this.onPlayerTouch, undefined, this);
    }
  }

  private onPlayerTouch = (): void => {
    if (this.isOpening || this.isOpened) {
      return; // Already opening or opened
    }
    
    console.log('Player touched treasure!');
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
    console.log('Treasure animation complete!');
    
    // Trigger victory
    this.triggerVictory();
  }

  private triggerVictory(): void {
    // Disable player movement
    if (this.player) {
      this.player.setActive(false);
      this.player.setVelocity(0, 0);
    }

    // Get camera center position for victory screen
    const camera = this.scene.cameras.main;
    const centerX = camera.scrollX + camera.width / 2;
    const centerY = camera.scrollY + camera.height / 2;

    // Create victory overlay
    const overlay = this.scene.add.rectangle(centerX, centerY, camera.width, camera.height, 0x263238, 0.85);
    overlay.setOrigin(0.5);
    overlay.setDepth(1000);
    overlay.setScrollFactor(0); // Fixed to camera

    // Create ornate border frame for the victory message (50% smaller)
    const frameWidth = 350;
    const frameHeight = 200;
    const frame = this.scene.add.rectangle(centerX, centerY, frameWidth, frameHeight, 0x3E2723);
    frame.setStrokeStyle(4, 0xFFB300); // Golden border (proportionally smaller)
    frame.setOrigin(0.5);
    frame.setDepth(1001);
    frame.setScrollFactor(0);

    // Create victory text (smaller)
    const victoryText = this.scene.add.text(centerX, centerY - 40, 'TREASURE DISCOVERED!', {
      fontSize: '28px',
      color: '#FFB300', // Gold color
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
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(1002);
    victoryText.setScrollFactor(0); // Fixed to camera

    // Create subtitle text (smaller)
    const subtitleText = this.scene.add.text(centerX, centerY - 5, 'Thy magical quest is complete!', {
      fontSize: '14px',
      color: '#E0E0E0',
      fontFamily: 'Alagard'
    });
    subtitleText.setOrigin(0.5);
    subtitleText.setDepth(1002);
    subtitleText.setScrollFactor(0); // Fixed to camera

    // Create play again button with medieval styling (smaller)
    const buttonBg = this.scene.add.rectangle(centerX, centerY + 30, 160, 40, 0x5D4037);
    buttonBg.setStrokeStyle(2, 0xFFB300);
    buttonBg.setOrigin(0.5);
    buttonBg.setDepth(1002);
    buttonBg.setScrollFactor(0);
    buttonBg.setInteractive({ useHandCursor: true });

    const buttonText = this.scene.add.text(centerX, centerY + 30, 'BEGIN NEW QUEST', {
      fontSize: '16px',
      color: '#FFC107',
      fontFamily: 'Alagard'
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(1003);
    buttonText.setScrollFactor(0);

    // Add button hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x6D4C41);
      buttonBg.setScale(1.05);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x5D4037);
      buttonBg.setScale(1);
    });

    // Add restart functionality
    buttonBg.on('pointerdown', () => {
      this.scene.scene.restart();
    });

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