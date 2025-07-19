import { WAND_UPGRADE, WandType } from "./WandConfigs";
import { WandFactory } from "./WandFactory";
import { WandUpgrade } from "./WandUpgrade";
import { Player } from "../player/Player";
import { MainScene } from "../../scenes/MainScene";
import { Scene } from "phaser";
import { Wand } from "./Wand";
import { Room } from "../rooms/Room";

export class WandManager {
  private player: Player | null = null;
  private scene: Scene;
  private wandUpgrades: WandUpgrade[] = [];
  public static readonly SWAPPED_EVENT = 'wand-swapped';

  constructor(scene: Scene, player: Player) {
    this.scene = scene;
    this.player = player;
  }

  public setupWandUpgrades(itemsLayer: Phaser.Tilemaps.ObjectLayer): void {
    itemsLayer.objects.forEach((item) => {
      if (item.name === 'WandUpgrade') {
        if (typeof item.x !== 'number' ||
          typeof item.y !== 'number') {
          console.warn('Invalid item properties:', item);
          return;
        }
        const levelProperty = item.properties?.find((p: { name: string; value: string }) => p.name === 'Level');
        const wandType = WAND_UPGRADE[levelProperty?.value as keyof typeof WAND_UPGRADE];
        if (wandType && this.player) {
          const wand = WandFactory.createPlayerWand(this.scene, wandType as unknown as WandType);
          const wandUpgrade = new WandUpgrade(this.scene, item.x, item.y, wand, this.player);
          this.wandUpgrades.push(wandUpgrade);
          this.setupWandUpgrade(wandUpgrade);
        }
      }
    });
  }

  public setupProceduralWandUpgrades(rooms: Map<string, Room>): void {
    // Define available wand upgrades
    const wandTypes: WandType[] = [
      'RAPIDWAND',
      'ELDERWAND',
      'SPELLBOT'
    ];

    let upgradeCount = 0;
    const maxUpgrades = Math.min(4, Math.floor(rooms.size * 0.3)); // 30% of rooms have upgrades

    rooms.forEach((room, roomId) => {
      // Skip starting room and limit total upgrades
      if (roomId === '1' || roomId === Math.ceil(rooms.size / 2).toString() || upgradeCount >= maxUpgrades) {
        return;
      }

      // 30% chance for a wand upgrade in this room
      if (Math.random() < 0.3) {
        const roomBounds = room.getZone().getBounds();
        
        // Place upgrade in center of room
        const x = roomBounds.x + roomBounds.width / 2;
        const y = roomBounds.y + roomBounds.height / 2;

        // Select a random wand type
        const wandType = wandTypes[Math.floor(Math.random() * wandTypes.length)];
        const wand = WandFactory.createPlayerWand(this.scene, wandType);
        
        if (this.player) {
          const wandUpgrade = new WandUpgrade(this.scene, x, y, wand, this.player);
          this.wandUpgrades.push(wandUpgrade);
          this.setupWandUpgrade(wandUpgrade);
          upgradeCount++;
        }
      }
    });
  }

  public setupWandUpgrade(upgrade: WandUpgrade): void {
    // Add overlap detection for entering the upgrade area
    if (!this.player) { return; }
    this.scene.physics.add.overlap(
      this.player,
      upgrade,
      this.onEnterUpgradeArea,
      undefined,
      this
    );
  }

  public setupCollisions(): void {
    const mainScene = this.scene as MainScene;
    const wallsLayer = mainScene.getWallsLayer();
    if (!this.player || !wallsLayer) { return; }

    // Remove any existing collisions first
    const currentWand = this.player.getWand();

    // Setup new collisions
    if (currentWand?.spells) {
      // Player Spells vs Walls
      this.scene.physics.add.collider(
        currentWand.spells,
        wallsLayer,
        mainScene.handleSpellCollision,
        undefined,
        this
      );
    }
  }

  private onEnterUpgradeArea(player: any, upgrade: any): void {
    if (!this.player) return;

    let newWand = null;
    // Get the new wand from the upgrade
    const wandUpgrade = upgrade as WandUpgrade;
    if (!wandUpgrade.wand) return;
    if (wandUpgrade.wand.isDeployable()) {
      newWand = wandUpgrade.swapWand(this.player.getDeployableWand() as Wand);
    } else {
      newWand = wandUpgrade.swapWand(this.player.getWand());
    }

    if (newWand) {
      // Update the player's wand
      this.player.swapWand(newWand);

      // Create upgrade effect
      this.createPlayerUpgradeEffect();

      // Emit wand swapped event
      this.scene.events.emit(WandManager.SWAPPED_EVENT, {
        oldWand: this.player.getWand(),
        newWand: newWand
      });

      this.setupCollisions();
    }
  }



  private createPlayerUpgradeEffect(): void {
    if (!this.player) {
      console.warn('Player is not set');
      return;
    }
    // Create a flash effect around the player
    const flash = this.scene.add.graphics();
    flash.fillStyle(0x00ffff, 0.5);
    flash.fillCircle(this.player.x, this.player.y, 40);
    flash.setDepth(this.player.depth - 1);

    // Fade out the flash
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        flash.destroy();
      }
    });

    // Create a particle burst around the player
    const particles = this.scene.add.particles(0, 0, 'wand-upgrade', {
      x: this.player.x,
      y: this.player.y,
      speed: { min: 50, max: 100 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 1000,
      quantity: 8,
      frequency: 50,
      blendMode: 'ADD',
      emitting: true,
      gravityY: -50,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 1),
        quantity: 8
      }
    });

    // Destroy the particles after the burst is complete
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });


    // Add a screen shake effect
    this.scene.cameras.main.shake(200, 0.005);
  }

  public destroy(): void {
    // Clean up all weapon upgrades
    this.wandUpgrades.forEach(upgrade => {
      if (upgrade) {
        upgrade.destroy();
      }
    });
    this.wandUpgrades = [];


    this.player = null;
    this.scene = null;
  }
}