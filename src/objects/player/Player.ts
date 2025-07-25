import { Scene, GameObjects, Physics, Types, Input } from 'phaser';
import { PlainSpell } from '../wands/PlainSpell';
import { HealthBar } from '../HealthBar';
import { HealthPotion } from '../items/HealthPotion';
import { Wand } from '../wands/Wand';
import { WandFactory } from '../wands/WandFactory';
import { WandOverlay } from '../wands/WandOverlay';
import { SparkBoost } from '../items/SparkBoost';
import { RoomState } from '../rooms/Room';
import { Room } from '../rooms/Room';
import { DeployableWand } from '../wands/DeployableWand';
import { SpellBot } from '../items/SpellBot';
import { MainScene } from '../../scenes/MainScene';

// Extend Physics.Arcade.Sprite for physics and preUpdate
export class Player extends Physics.Arcade.Sprite {
  // Removed redundant body declaration, it's inherited

  private wand: Wand;
  private deployableWand: DeployableWand | null = null;

  public lastFired: number = 0;
  public fireRate: number = 500; // Fire every 0.5 seconds

  // Health system
  private maxHealth: number = 50;
  private currentHealth: number = 50;
  private isInvulnerable: boolean = false;
  private invulnerabilityDuration: number = 1000; // 1 second of invulnerability after being hit

  private healthBar: HealthBar;
  private wandOverlay: WandOverlay;
  private speedBoostTimer: Phaser.Time.TimerEvent | null = null;
  private speedBoostTrail: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private floatingImage: Phaser.GameObjects.Image | null = null;

  public moveSpeed: number = 200; // Base movement speed
  public isSpeedBoosted: boolean = false;

  private touchPosition: { x: number; y: number } | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keys: { [key: string]: Phaser.Input.Keyboard.Key } | null = null;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, 'merlin-idle');

    this.setupPhysics(scene);
    this.setupInput(scene);
    this.setupWands(scene);
    this.setupUI(scene);
    this.setupEventListeners(scene);
    this.setupAnimations(scene);
  }

  private setupPhysics(scene: Scene): void {
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set scale for Merlin sprite (0.75x to make it appropriately sized)
    this.setScale(0.5);
    this.setDepth(1); // Ensure player appears above floor

    const body = this.body as Physics.Arcade.Body;
    body.setBounce(0);
    body.setCollideWorldBounds(true);
    body.setDamping(false); // Disable automatic damping to prevent conflicts
    body.setDrag(0); // Remove drag to prevent movement conflicts
    body.setMaxVelocity(500);
    body.setSize(32, 48); // Adjusted collision box for 64x64 sprite
    body.setOffset(16, 16); // Center the collision box
    
    // Ensure physics body is enabled (in case it was disabled from previous game)
    body.setEnable(true);
  }

  private setupInput(scene: Scene): void {
    // Set up WASD keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = {
      up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // Set up touch input
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchPosition = { x: pointer.worldX, y: pointer.worldY };
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.touchPosition = { x: pointer.worldX, y: pointer.worldY };
      }
    });

    scene.input.on('pointerup', () => {
      this.touchPosition = null;
    });
  }

  private setupWands(scene: Scene): void {
    // Initialize weapon with LEVEL_1_GUN configuration
    this.wand = WandFactory.createPlayerWand(scene, 'RAPIDWAND');
  }

  private setupUI(scene: Scene): void {
    // Initialize health bar
    this.healthBar = new HealthBar(scene, this, 150, 10, true);
    this.healthBar.setHealth(this.currentHealth, this.maxHealth);

    // Initialize weapon overlay
    this.wandOverlay = new WandOverlay(scene);
    this.wandOverlay.updateWand(this.wand);
  }

  private setupEventListeners(scene: Scene): void {
    scene.events.on(HealthPotion.COLLECTED_EVENT, (data: { x: number, y: number, healAmount: number }) => {
      this.heal(data.healAmount);
      this.showFloatingImage('health-potion');
    });

    scene.events.on(SparkBoost.COLLECTED_EVENT, (data: { x: number, y: number, speedBoost: number }) => {
      this.applySpeedBoost(data.speedBoost);
      this.showFloatingImage('spark-boost');
    });

    scene.events.on(Room.ROOM_STATE_CHANGED, (room: Room, state: RoomState) => {
      if (state === RoomState.TRIGGERED) {
        this.deployableWand?.deploy(this, room);
      }
    });
  }

  private setupAnimations(scene: Scene): void {
    // Create idle animation with 2 frames
    if (!scene.anims.exists('merlin-idle-anim')) {
      scene.anims.create({
        key: 'merlin-idle-anim',
        frames: scene.anims.generateFrameNumbers('merlin-idle', { start: 0, end: 1 }),
        frameRate: 4,
        repeat: -1
      });
    }

    // Create run animation with 3 frames
    if (!scene.anims.exists('merlin-run-anim')) {
      scene.anims.create({
        key: 'merlin-run-anim',
        frames: scene.anims.generateFrameNumbers('merlin-run', { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Start with idle animation
    this.play('merlin-idle-anim');
  }

  private handleKeyboardMovement(body: Physics.Arcade.Body): boolean {
    if (!this.cursors || !this.keys) return false;

    const up = this.cursors.up?.isDown || this.keys['up'].isDown;
    const down = this.cursors.down?.isDown || this.keys['down'].isDown;
    const left = this.cursors.left?.isDown || this.keys['left'].isDown;
    const right = this.cursors.right?.isDown || this.keys['right'].isDown;

    if (!(up || down || left || right)) return false;

    let velocityX = 0;
    let velocityY = 0;

    if (up) velocityY = -this.moveSpeed;
    if (down) velocityY = this.moveSpeed;
    if (left) velocityX = -this.moveSpeed;
    if (right) velocityX = this.moveSpeed;

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      const factor = Math.sqrt(2) / 2;
      velocityX *= factor;
      velocityY *= factor;
    }

    body.setVelocity(velocityX, velocityY);
    this.flipX = velocityX < 0;
    return true;
  }

  private handleTouchMovement(body: Physics.Arcade.Body): boolean {
    if (!this.touchPosition) return false;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.touchPosition.x, this.touchPosition.y);
    if (distance <= 10) return false;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.touchPosition.x, this.touchPosition.y);
    const speedMultiplier = Math.min(1, distance / 50);
    const velocityX = Math.cos(angle) * this.moveSpeed * speedMultiplier;
    const velocityY = Math.sin(angle) * this.moveSpeed * speedMultiplier;

    body.setVelocity(velocityX, velocityY);
    this.flipX = velocityX < 0;
    return true;
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Don't process movement if player is inactive (dead/victory)
    if (!this.active) {
      return;
    }

    const body = this.body as Physics.Arcade.Body;
    
    // Only reset velocity if no input is detected
    const isMoving = this.handleKeyboardMovement(body) || this.handleTouchMovement(body);
    
    if (!isMoving) {
      // Apply smooth deceleration
      const currentVelocityX = body.velocity.x;
      const currentVelocityY = body.velocity.y;
      const threshold = 10; // Lower threshold for snappier response
      
      if (Math.abs(currentVelocityX) > threshold || Math.abs(currentVelocityY) > threshold) {
        body.setVelocity(currentVelocityX * 0.85, currentVelocityY * 0.85);
      } else {
        body.setVelocity(0, 0);
      }
    }

    // Update animation based on movement
    if (isMoving) {
      this.play('merlin-run-anim', true);
    } else {
      this.play('merlin-idle-anim', true);
    }
    
    // Player health bar is now fixed position - no need to update

    // Handle auto-targeting (only if player is active)
    if (this.active) {
      this.handleAutoTargeting();
    }
  }

  public getWand(): Wand {
    return this.wand;
  }

  public getDeployableWand(): DeployableWand | null {
    return this.deployableWand;
  }

  public hasDeployableWand(): boolean {
    return this.deployableWand !== null;
  }

  // Method to take damage
  public takeDamage(amount: number = 10): void {
    if (this.isInvulnerable) return;

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.healthBar.setHealth(this.currentHealth, this.maxHealth);

    // Visual feedback - flash red
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // Set invulnerability
    this.isInvulnerable = true;
    this.scene.time.delayedCall(this.invulnerabilityDuration, () => {
      this.isInvulnerable = false;
    });

    // Check if player is dead
    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  // Method to heal the player
  public heal(amount: number): void {
    if (this.currentHealth >= this.maxHealth) return;

    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
    this.healthBar.setHealth(this.currentHealth, this.maxHealth);

    // Create healing particles
    if (this.scene.textures.exists('particle')) {
      const particles = this.scene.add.particles(0, 0, 'particle', {
        x: this.x,
        y: this.y,
        speed: { min: 20, max: 50 },
        scale: { start: 0.5, end: 0 },
        lifespan: 800,
        quantity: 10,
        tint: 0x00ff00,
        alpha: { start: 0.8, end: 0 },
        blendMode: 'ADD',
        gravityY: -50
      });
      // Emit particles for a short duration
      particles.explode(20, this.x, this.y);
      // Create healing text
      const healText = this.scene.add.text(this.x, this.y - 20, `+${amount}`, {
        fontSize: '16px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      });
      // Animate the text
      this.scene.tweens.add({
        targets: healText,
        y: this.y - 40,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          healText.destroy();
          particles.destroy();
        }
      });
    }
  }

  private applySpeedBoost(boostAmount: number): void {
    // Store the original speed
    const originalSpeed = this.moveSpeed;

    // Apply the boost
    this.moveSpeed *= boostAmount;
    this.isSpeedBoosted = true;

    // Add visual effects
    this.setTint(0x00ffff); // Cyan tint
    this.createSpeedBoostTrail();

    // Clear any existing timer
    if (this.speedBoostTimer) {
      this.speedBoostTimer.destroy();
    }

    this.speedBoostTimer = this.scene.time.addEvent({
      delay: 5000,
      callback: () => {
        // Revert back to original speed
        this.moveSpeed = originalSpeed;
        this.isSpeedBoosted = false;
        this.clearTint();
        if (this.speedBoostTrail) {
          this.speedBoostTrail.destroy();
          this.speedBoostTrail = null;
        }
      }
    });
  }

  private createSpeedBoostTrail(): void {
    if (this.speedBoostTrail) {
      this.speedBoostTrail.destroy();
    }

    this.speedBoostTrail = this.scene.add.particles(0, 0, 'particle', {
      follow: this,
      scale: { start: 0.8, end: 0 },  // Increased start scale
      alpha: { start: 0.8, end: 0 },  // Increased start alpha
      speed: 0,
      lifespan: 800,  // Increased lifespan
      quantity: 2,    // Increased quantity
      frequency: 25,  // Decreased frequency for more particles
      blendMode: 'ADD',
      emitting: true,
      gravityY: 0,
      tint: 0x00ffff //cyan
    });

    // Set depth to be behind player but above background
    this.speedBoostTrail.setDepth(this.depth - 0.1);

    // Start emitting immediately
    this.speedBoostTrail.start();
  }

  // Method to handle player death
  private die(): void {
    // Disable player controls
    this.setActive(false);
    this.setVisible(false);

    // Hide health bar
    this.healthBar.setVisible(false);

    // Emit an event that the scene can listen for
    this.scene.events.emit('playerDied');
  }

  // Method to check if player is dead
  public isDead(): boolean {
    return this.currentHealth <= 0;
  }

  // Method to get current health
  public getHealth(): number {
    return this.currentHealth;
  }

  // Method to get max health
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  // Method to check if player is invulnerable
  public isCurrentlyInvulnerable(): boolean {
    return this.isInvulnerable;
  }

  public shootAtTarget(x: number, y: number) {
    // Check fire rate before firing
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastFired > this.fireRate) {
      // Calculate angle to target
      const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);

      // Get a spell from the wand's spell group
      if (this.wand.spells) {
        const spell = this.wand.spells.get() as PlainSpell;
        if (spell) {
          // Calculate the center position of the player
          const centerX = this.x;
          const centerY = this.y - 5; // Slight upward offset

          // Fire in the direction of the target
          spell.fire(centerX, centerY, angle);
        }
      }

      this.lastFired = currentTime;
    }
  }

  public swapWand(newWand: Wand): void {
    if (newWand.isDeployable()) {
      this.deployableWand = newWand as DeployableWand;
    } else {
      this.wand = newWand;
    }
    this.wandOverlay.updateWand(this.wand);
  }

  private handleAutoTargeting(): void {
    // Get the enemy manager from the scene
    const scene = this.scene as MainScene;
    const enemyManager = scene.getEnemyManager();
    const enemies = enemyManager.getEnemies();

    if (enemies.length === 0) return;

    // Find the nearest enemy
    let nearestEnemy = enemies[0];
    let nearestDistance = Phaser.Math.Distance.Between(
      this.x, this.y,
      nearestEnemy.x, nearestEnemy.y
    );

    for (let i = 1; i < enemies.length; i++) {
      const enemy = enemies[i];
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        enemy.x, enemy.y
      );

      if (distance < nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    }

    // Fire at the nearest enemy
    this.wand.fireInDirection(this, nearestEnemy.x, nearestEnemy.y);
  }

  private showFloatingImage(texture: string): void {
    // Remove any existing floating image
    if (this.floatingImage) {
      this.floatingImage.destroy();
      this.floatingImage = null;
    }

    // Create a new floating image above the player
    this.floatingImage = this.scene.add.image(this.x, this.y - 30, texture);
    this.floatingImage.setScale(0.8);
    this.floatingImage.setDepth(this.depth + 1); // Ensure it's above the player

    // Add a floating animation
    this.scene.tweens.add({
      targets: this.floatingImage,
      y: this.y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        if (this.floatingImage) {
          this.floatingImage.destroy();
          this.floatingImage = null;
        }
      }
    });
  }

  public destroy(): void {
    if (this.scene) {
      this.scene.events.off(SpellBot.SPELLBOT_EXPLODE);
      this.scene.events.off(HealthPotion.COLLECTED_EVENT);
      this.scene.events.off(SparkBoost.COLLECTED_EVENT);
      this.scene.events.off(Room.ROOM_STATE_CHANGED);
    }
    this.wand?.destroy?.();
    this.deployableWand?.destroy?.();
    this.healthBar?.destroy?.();
    this.wandOverlay?.destroy?.();
    this.speedBoostTrail?.stop();
    this.speedBoostTrail?.destroy();
    this.floatingImage?.destroy?.();
  }
}