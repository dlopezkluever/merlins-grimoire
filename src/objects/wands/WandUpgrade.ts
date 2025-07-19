import { Player } from "../player/Player";
import { Wand } from "./Wand";

export class WandUpgrade extends Phaser.Physics.Arcade.Sprite {
  public wand: Wand | null = null;
  public isUpgradeCollected: boolean = false;
  private glowEffect: Phaser.GameObjects.Graphics | null = null;
  private wandNameText: Phaser.GameObjects.Text | null = null;

  private player: Player | null = null;
  private canSwapWand: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, wand: Wand, player: Player) {
    const spriteKey = wand.config.displayConfig?.sprite || 'wand-upgrade';
    console.log('Using sprite key:', spriteKey);

    super(scene, x, y, spriteKey);
    this.wand = wand;
    this.player = player;
    this.scene.add.existing(this)


    // Add to scene and enable physics in one step
    scene.physics.add.existing(this);

    // Apply visual cue based on wand type
    this.applyWandVisualCue();

    // Create wand name text
    this.createWandNameText();

    // Create glow effect
    this.createGlowEffect();
  }

  private createWandNameText(): void {
    if (!this.wand) return;
    // Format the wand name for display (replace underscores with spaces and capitalize)
    const displayName = this.wand.wandType
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

    this.wandNameText = this.scene.add.text(this.x, this.y - 20, displayName, {
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    });
    this.wandNameText.setOrigin(0.5);
    this.wandNameText.setDepth(this.depth + 1);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.player || this.canSwapWand) { return; }
    const playerBounds = this.player.getBounds();
    const upgradeBounds = this.getBounds();

    const isOverlapping = Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, upgradeBounds);
    if (!isOverlapping) {
      this.canSwapWand = true;
    }

    // Update wand name text position
    if (this.wandNameText) {
      this.wandNameText.setPosition(this.x, this.y - 20);
    }
  }

  private applyWandVisualCue(): void {
    // Add a pulsing effect to make it more noticeable
    this.scene.tweens.add({
      targets: this,
      alpha: 0.8, // Increased from 0.7 to 0.8 for more visibility
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  private createGlowEffect(): void {
    // Create a glowing circle around the wand upgrade
    this.glowEffect = this.scene.add.graphics();
    this.glowEffect.setDepth(this.depth - 1);

    // Update the glow effect in the update method
    this.scene.events.on('update', this.updateGlowEffect, this);
  }

  private updateGlowEffect(): void {
    if (!this.wand) return;
    const displayConfig = this.wand.config.displayConfig;
    if (displayConfig) {
      this.setTint(parseInt(displayConfig.color as string, 16));
    }

    //  if (this.isUpgradeCollected || !this.glowEffect) return;
    if (!this.glowEffect) return;
    this.glowEffect.clear();

    // Create a pulsing glow effect
    const time = this.scene.time.now;
    const alpha = 0.3 + Math.sin(time / 300) * 0.2;
    const scale = 1 + Math.sin(time / 500) * 0.1;

    // Draw the glow

    this.glowEffect.lineStyle(2, 0x00ffff, alpha);
    this.glowEffect.strokeCircle(this.x, this.y, 20 * scale);

    // Add a second glow with different color
    this.glowEffect.lineStyle(2, 0xff00ff, alpha * 0.7);
    this.glowEffect.strokeCircle(this.x, this.y, 25 * scale);
  }


  public swapWand(oldWand: Wand): Wand | null {
    if (!this.canSwapWand) { return null }
    this.canSwapWand = false;
    const upgradeWand = this.wand;
    // Store the old wand as the dropped wand
    this.wand = oldWand;

    // Create visual representation of the dropped wand
    if (!this.isUpgradeCollected) {
      if (this.glowEffect) {
        this.glowEffect.destroy();
      }
      this.isUpgradeCollected = true;
    }

    this.applyWandVisualCue();


    if (!this.wand) {
      this.scene.time.delayedCall(100, () => {
        this.destroy();
      });
    }
    else {

      // Update the wand name text
      if (this.wandNameText) {
        const displayName = this.wand.wandType
          .split('_')
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ');
        this.wandNameText.setText(displayName);
      }
    }

    // Return the new wand
    return upgradeWand;
  }

  public destroy(): void {
    // Clean up event listeners
    if (this.scene) {
      this.scene.events.off('update', this.updateGlowEffect, this);
    }

    // Destroy glow effect
    if (this.glowEffect) {
      this.glowEffect.destroy();
      this.glowEffect = null;
    }

    // Destroy wand name text
    if (this.wandNameText) {
      this.wandNameText.destroy();
      this.wandNameText = null;
    }

    // Null out references
    this.wand = null;
    this.player = null;

    super.destroy(true);

  }
}