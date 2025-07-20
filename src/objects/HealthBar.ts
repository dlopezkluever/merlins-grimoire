import { Scene, GameObjects } from 'phaser';

const DEBUG_HEALTHBAR = false; // Reduced to prevent log spam

function debugLog(message: string, ...args: any[]) {
  if (DEBUG_HEALTHBAR) {
    console.log(`[HEALTHBAR DEBUG] ${message}`, ...args);
  }
}

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
    isPlayerBar: boolean = false,
    playerId: number = 1
  ) {
    this.scene = scene;
    this.parent = parent;
    this.width = width;
    this.height = height;
    this.currentHealth = 100;
    this.maxHealth = 100;
    this.isPlayerBar = isPlayerBar;
    this.visible = true; // Initialize visibility
    
    if (this.isPlayerBar) {
      console.log('[PLAYER HEALTHBAR] Constructor - Initial health:', this.currentHealth, '/', this.maxHealth);
      console.log('[PLAYER HEALTHBAR] Creating new health bar for player:', playerId);
    }

    debugLog(`Creating health bar for ${this.isPlayerBar ? 'Player' : 'Enemy'}`, 
      this.isPlayerBar ? `(Player ${playerId})` : '', 
      'Multiplayer:', (scene as any).isMultiplayer);

    if (this.isPlayerBar) {
      // For player bar, position based on playerId in multiplayer
      const isMultiplayer = (scene as any).isMultiplayer;
      let x: number, y: number;
      
      if (isMultiplayer) {
        // Split screen positioning - different positions for each player
        const cameraWidth = 800; // Each camera is 800px wide
        const cameraHeight = 600; // Each camera is 600px tall
        
        if (playerId === 1) {
          // Player 1 - RIGHT side (main camera at x: 800-1600)
          x = 800 + (cameraWidth / 2); // 1200 (center of right viewport)
          y = cameraHeight - this.height - this.padding; // 580
        } else {
          // Player 2 - LEFT side (camera2 at x: 0-800)  
          x = cameraWidth / 2; // 400 (center of left viewport)
          y = cameraHeight - this.height - this.padding; // 580
        }
        
        console.log(`[HEALTHBAR] Calculated position for player ${playerId}:`, x, y, 'cameraHeight:', cameraHeight);
      } else {
        // Single player - use original positioning
        const camera = scene.cameras.main;
        const zoom = camera.zoom || 1;
        const visibleWidth = camera.width / zoom;
        const visibleHeight = camera.height / zoom;
        const centerX = camera.width / 2;
        const centerY = camera.height / 2;
        x = centerX + (visibleWidth / 2) - this.width - this.padding;
        y = centerY + (visibleHeight / 2) - this.height - this.padding;
      }
      
      console.log(`[HEALTHBAR] Player ${playerId} health bar position:`, x, y);
      console.log(`[HEALTHBAR] isMultiplayer:`, isMultiplayer);
      console.log(`[HEALTHBAR] Padding:`, this.padding);
      
      // Offset x to center the health bar
      const containerX = x - (this.width / 2);
      
      this.container = scene.add.container(containerX, y);
      this.container.setScrollFactor(0); // Fixed to screen
      this.container.setDepth(100);
      this.container.setVisible(true); // Ensure visibility
      
      console.log(`[HEALTHBAR] Player ${playerId} health bar container created at:`, containerX, y);
      console.log(`[HEALTHBAR] Container dimensions:`, this.width, 'x', this.height);
      console.log(`[HEALTHBAR] Container visible:`, this.container.visible);
      
      // Create the health bar graphics inside the container
      this.bar = scene.add.graphics();
      this.container.add(this.bar);
      console.log('[PLAYER HEALTHBAR] Graphics added to container. Bar:', this.bar, 'Container children:', this.container.list.length);
      
      // In multiplayer, ensure health bar is visible in the correct camera
              if (isMultiplayer) {
          debugLog(`Setting up camera visibility for Player ${playerId}`);
          // Get the cameras
          const mainCamera = scene.cameras.main; // Player 1 camera (right side)
          const camera2 = (scene as any).camera2; // Player 2 camera (left side)
          
          if (mainCamera && camera2) {
            if (playerId === 1) {
              // Player 1 health bar only visible in main camera (right side)
              camera2.ignore(this.container);
              debugLog('Player 1 health bar hidden from camera2 (left)');
            } else {
              // Player 2 health bar only visible in camera2 (left side)
              mainCamera.ignore(this.container);
              debugLog('Player 2 health bar hidden from main camera (right)');
            }
          } else {
            debugLog('WARNING: Cameras not found for multiplayer health bar setup');
          }
        }
    } else {
      debugLog('Enemy health bar created');
      // For enemy bars, use the regular approach
      this.bar = scene.add.graphics();
      this.bar.setDepth(100);
    }

    // Position the health bar based on whether it's a player bar or enemy bar
    this.updatePosition();
    
    // Ensure we draw the health bar after positioning
    this.draw();
    debugLog(`Health bar initialization complete for ${this.isPlayerBar ? 'Player' : 'Enemy'}`);
  }

  public setHealth(current: number, max: number): void {
    const previousHealth = this.currentHealth;
    this.currentHealth = current;
    this.maxHealth = max;
    
    if (this.isPlayerBar) {
      console.log('[PLAYER HEALTHBAR] setHealth called, previous:', previousHealth, 'current:', current);
    }
    
    // Add visual feedback for health changes
    if (this.isPlayerBar && previousHealth !== current) {
      // Flash effect when health changes
      if (current < previousHealth) {
        // Damage taken - flash red
        console.log('[PLAYER HEALTHBAR] Damage taken, flashing red. Container exists:', !!this.container, 'Bar exists:', !!this.bar);
        this.flashBar(0xff0000);
      } else if (current > previousHealth) {
        // Health gained - flash green
        console.log('[HEALTHBAR] Health gained, flashing green');
        this.flashBar(0x00ff00);
      }
    }
    
    this.draw();
    
    // Force container visibility for player bars
    if (this.isPlayerBar && this.container) {
      this.container.setVisible(true);
      console.log('[HEALTHBAR] Container visibility set to true');
    }
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
    if (this.isPlayerBar) {
      console.log(`[PLAYER HEALTHBAR] setVisible(${visible}) called`);
      console.log(`[PLAYER HEALTHBAR] Before: this.visible=${this.visible}, container.visible=${this.container?.visible}`);
    }
    this.visible = visible;
    if (this.isPlayerBar && this.container) {
      this.container.setVisible(visible);
    } else {
      this.bar.setVisible(visible);
    }
    if (this.isPlayerBar) {
      console.log(`[PLAYER HEALTHBAR] After: this.visible=${this.visible}, container.visible=${this.container?.visible}`);
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
    // Check visibility for both the HealthBar and its container
    const isVisible = this.visible && (this.isPlayerBar ? this.container?.visible !== false : true);
    if (!isVisible) {
      console.log('[HEALTHBAR] Draw skipped - not visible, isPlayerBar:', this.isPlayerBar, 'this.visible:', this.visible, 'container.visible:', this.container?.visible);
      return;
    }
    
    // Skip redraw if health hasn't changed
    if (this.lastDrawnHealth === this.currentHealth && this.bar.scene) {
      // Force redraw for debugging
      // return;
    }
    
    if (this.isPlayerBar) {
      console.log('[PLAYER HEALTHBAR] Drawing health bar, Health:', this.currentHealth, '/', this.maxHealth);
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
      // Make sure the graphics object is visible
      this.bar.setVisible(true);
    }

    // Background (dark red)
    this.bar.fillStyle(0x660000);
    this.bar.fillRect(drawX, drawY, this.width, this.height);
    if (this.isPlayerBar) {
      console.log('[PLAYER HEALTHBAR] Drawing background rect at', drawX, drawY, this.width, this.height);
      console.log('[PLAYER HEALTHBAR] Container position:', this.container?.x, this.container?.y);
    }

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
      // Create or update health text with "Thy Health:" prefix
      const healthText = `Thy Health: ${Math.ceil(this.currentHealth)}/${this.maxHealth}`;
      console.log('[PLAYER HEALTHBAR] Health text should be:', healthText);
      if (!this.healthText) {
        console.log('[PLAYER HEALTHBAR] Creating NEW health text');
        this.healthText = this.scene.add.text(0, -20, healthText, {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'Alagard',
          stroke: '#000000',
          strokeThickness: 2
        });
        this.container?.add(this.healthText); // Add to container
        this.healthText.setDepth(101);
      } else {
        console.log('[PLAYER HEALTHBAR] UPDATING existing health text to:', healthText);
        this.healthText.setText(healthText);
      }
      console.log('[PLAYER HEALTHBAR] Text object text is now:', this.healthText?.text);
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