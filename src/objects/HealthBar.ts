import { Scene, GameObjects } from 'phaser';

export class HealthBar {
  private scene: Scene;
  private parent: Phaser.GameObjects.GameObject;
  private bar: GameObjects.Graphics;
  private container?: GameObjects.Container; // Container for player health bar
  private width: number;
  private height: number;
  private padding: number = 10; // Padding from the screen edges
  private currentHealth: number;
  private maxHealth: number;
  private visible: boolean = true;
  private isPlayerBar: boolean = false;
  private healthText?: Phaser.GameObjects.Text;
  private lastDrawnHealth: number = -1; // Track last drawn health to avoid unnecessary redraws

  constructor(
    scene: Scene,
    parent: Phaser.GameObjects.GameObject,
    width: number = 150,
    height: number = 10,
    isPlayerBar: boolean = false
  ) {
    this.scene = scene;
    this.parent = parent;
    this.width = width;
    this.height = height;
    this.currentHealth = 100;
    this.maxHealth = 100;
    this.isPlayerBar = isPlayerBar;

    if (this.isPlayerBar) {
      // For player bar, use a container approach like WandOverlay
      const camera = scene.cameras.main;
      
      // Account for zoom to find actual visible area
      const zoom = camera.zoom || 1;
      const visibleWidth = camera.width / zoom;
      const visibleHeight = camera.height / zoom;
      
      // Center of the viewport in screen coordinates
      const centerX = camera.width / 2;
      const centerY = camera.height / 2;
      
      // Calculate bottom-right position within visible area
      const x = centerX + (visibleWidth / 2) - this.width - this.padding;
      const y = centerY + (visibleHeight / 2) - this.height - this.padding;
      
      this.container = scene.add.container(x, y);
      this.container.setScrollFactor(0); // Fixed to screen
      this.container.setDepth(100);
      
      // Create the health bar graphics inside the container
      this.bar = scene.add.graphics();
      this.container.add(this.bar);
    } else {
      // For enemy bars, use the regular approach
      this.bar = scene.add.graphics();
      this.bar.setDepth(100);
    }

    // Position the health bar based on whether it's a player bar or enemy bar
    this.updatePosition();
    
    // Ensure we draw the health bar after positioning
    this.draw();
  }

  public setHealth(current: number, max: number): void {
    const previousHealth = this.currentHealth;
    this.currentHealth = current;
    this.maxHealth = max;
    
    // Add visual feedback for health changes
    if (this.isPlayerBar && previousHealth !== current) {
      // Flash effect when health changes
      if (current < previousHealth) {
        // Damage taken - flash red
        this.flashBar(0xff0000);
      } else if (current > previousHealth) {
        // Health gained - flash green
        this.flashBar(0x00ff00);
      }
    }
    
    this.draw();
  }
  
  private flashBar(color: number): void {
    // Create a temporary flash overlay
    const flash = this.scene.add.graphics();
    
    if (this.isPlayerBar && this.container) {
      // Add flash to container for player bar
      this.container.add(flash);
      flash.fillStyle(color, 0.5);
      flash.fillRect(0, 0, this.width, this.height);
    } else {
      // For enemy bars, position normally
      flash.setScrollFactor(0);
      flash.setDepth(102);
      
      const camera = this.scene.cameras.main;
      const x = camera.width - this.width - this.padding;
      const y = camera.height - this.height - this.padding;
      
      flash.fillStyle(color, 0.5);
      flash.fillRect(x, y, this.width, this.height);
    }
    
    // Fade out the flash
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.isPlayerBar && this.container) {
      this.container.setVisible(visible);
    } else {
      this.bar.setVisible(visible);
    }
  }

  private updatePosition(): void {
    if (this.isPlayerBar) {
      // For player bar, update container position
      if (this.container) {
        const camera = this.scene.cameras.main;
        
        // Account for zoom to find actual visible area
        const zoom = camera.zoom || 1;
        const visibleWidth = camera.width / zoom;
        const visibleHeight = camera.height / zoom;
        
        // Center of the viewport in screen coordinates
        const centerX = camera.width / 2;
        const centerY = camera.height / 2;
        
        // Calculate bottom-right position within visible area
        const x = centerX + (visibleWidth / 2) - this.width - this.padding;
        const y = centerY + (visibleHeight / 2) - this.height - this.padding;
        
        this.container.setPosition(x, y);
      }
    } else {
      // Position enemy health bars above the enemy
      const parentSprite = this.parent as Phaser.GameObjects.Sprite;
      const offsetY = -20; // Offset above the enemy
      this.bar.setPosition(parentSprite.x - this.width / 2, parentSprite.y + offsetY);
    }
    this.draw();
  }

  private draw(): void {
    if (!this.visible) return;
    
    // Skip redraw if health hasn't changed
    if (this.lastDrawnHealth === this.currentHealth && this.bar.scene) {
      return;
    }
    
    this.lastDrawnHealth = this.currentHealth;

    this.bar.clear();

    // For player bar with container, always draw at 0,0
    // For enemy bars, draw at calculated position
    let drawX = 0;
    let drawY = 0;
    
    if (this.isPlayerBar) {
      // Player bar draws at 0,0 within its container
      // Container handles the screen positioning
    }

    // Background (dark red)
    this.bar.fillStyle(0x660000);
    this.bar.fillRect(drawX, drawY, this.width, this.height);

    // Health bar with color based on health percentage
    const healthWidth = (this.currentHealth / this.maxHealth) * this.width;
    const healthPercent = this.currentHealth / this.maxHealth;
    
    // Color transitions: green -> yellow -> red based on health
    let healthColor = 0x00ff00; // Green
    if (healthPercent < 0.3) {
      healthColor = 0xff0000; // Red
    } else if (healthPercent < 0.6) {
      healthColor = 0xffff00; // Yellow
    }
    
    this.bar.fillStyle(healthColor);
    this.bar.fillRect(drawX, drawY, healthWidth, this.height);

    // Border (thicker for player bar)
    const borderWidth = this.isPlayerBar ? 2 : 1;
    this.bar.lineStyle(borderWidth, 0xffffff);
    this.bar.strokeRect(drawX, drawY, this.width, this.height);
    
    // Add health text for player bar
    if (this.isPlayerBar) {
      // Create or update health text
      const healthText = `${Math.ceil(this.currentHealth)}/${this.maxHealth}`;
      if (!this.healthText) {
        this.healthText = this.scene.add.text(0, -20, healthText, {
          fontSize: '14px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2
        });
        this.container?.add(this.healthText); // Add to container
        this.healthText.setDepth(101);
      } else {
        this.healthText.setText(healthText);
      }
    }
  }

  public update(): void {
    if (!this.isPlayerBar) {
      // Update enemy health bar position to follow the enemy
      const parentSprite = this.parent as Phaser.GameObjects.Sprite;
      const offsetY = -20; // Offset above the enemy
      if (parentSprite) {
        this.bar.setPosition(parentSprite.x - this.width / 2, parentSprite.y + offsetY);
      }
      // Redraw the health bar after updating position
      this.draw();
    }
    // Player health bar doesn't need position updates - it's fixed
  }

  // Force repositioning - useful after camera changes
  public forceReposition(): void {
    if (this.isPlayerBar) {
      this.updatePosition();
    }
  }

  // Get the container (for external access if needed)
  public getContainer(): GameObjects.Container | undefined {
    return this.container;
  }

  public destroy(): void {
    if (this.container) {
      this.container.destroy(); // This will also destroy children (bar and healthText)
    } else {
      this.bar.destroy();
    }
    if (this.healthText && !this.container) {
      this.healthText.destroy();
    }
    this.parent = null;
    this.scene = null;
  }
} 