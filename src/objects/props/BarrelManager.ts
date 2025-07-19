import { Scene } from 'phaser';
import { Barrel } from './Barrel';
import { Room } from '../rooms/Room';
import { Player } from '../player/Player';
import { WandUpgrade } from '../wands/WandUpgrade';
import { WandManager } from '../wands/WandManager';
export class BarrelManager {
  private scene: Scene;
  private barrels: Phaser.Physics.Arcade.Group;
  private player: Player;

  constructor(scene: Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.barrels = this.scene.physics.add.group({
      classType: Barrel,
      runChildUpdate: true
    });

    this.scene.events.on(WandManager.SWAPPED_EVENT, (data: { wandUpgrade: WandUpgrade }) => {
      this.setupPlayerSpellCollisions();
    });
  }

  public createBarrelsFromPropsLayer(propsLayer: Phaser.Tilemaps.ObjectLayer, rooms: Map<string, Room>): void {
    // Find all barrel tiles in the props layer
    propsLayer.objects.forEach((obj) => {
      if (obj.name === 'Barrels') {
        // Ensure all required properties exist
        if (typeof obj.x !== 'number' ||
          typeof obj.y !== 'number' ||
          typeof obj.width !== 'number' ||
          typeof obj.height !== 'number') {
          console.warn('Invalid barrel object properties:', obj);
          return;
        }

        const roomProperty = obj.properties?.find((p: { name: string; value: string }) => p.name === 'Room');
        const roomId = roomProperty?.value;
        const room = rooms.get(roomId);
        if (room) {
          // Calculate the bounds
          const bounds = {
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height
          };

          // Create 3-5 barrels
          const numBarrels = Phaser.Math.Between(3, 5);
          const barrelSize = 24; // Size of a barrel
          const padding = 8; // Minimum space between barrels

          // Calculate grid positions
          const cols = Math.floor(bounds.width / (barrelSize + padding));
          const rows = Math.floor(bounds.height / (barrelSize + padding));

          // Create a list of possible positions
          const positions: { x: number, y: number }[] = [];
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              positions.push({
                x: bounds.x + (col * (barrelSize + padding)) + barrelSize / 2,
                y: bounds.y + (row * (barrelSize + padding)) + barrelSize / 2
              });
            }
          }

          // Shuffle positions and take the number we need
          const shuffledPositions = Phaser.Utils.Array.Shuffle(positions).slice(0, numBarrels);

          // Create barrels at the selected positions
          shuffledPositions.forEach(pos => {
            // Create the barrel sprite
            const barrel = new Barrel(this.scene, pos.x, pos.y);

            // Add to group
            this.barrels.add(barrel);

            // Set properties
            barrel.setDepth(0.5);

            // Add to room
            room.addBarrel(barrel);

          });
        }
      }
    });
  }

  public createProceduralBarrels(rooms: Map<string, Room>): void {
    rooms.forEach((room, roomId) => {
      // Randomly decide if this room should have barrels (70% chance)
      if (Math.random() > 0.3) {
        const numBarrels = Phaser.Math.Between(2, 4);
        const barrelSize = 24;
        const padding = 32;

        // Get room bounds
        const roomBounds = room.getZone().getBounds();
        
        // Create safe spawn area (avoid walls)
        const safeArea = {
          x: roomBounds.x + padding,
          y: roomBounds.y + padding,
          width: roomBounds.width - (padding * 2),
          height: roomBounds.height - (padding * 2)
        };

        // Generate random positions within safe area
        for (let i = 0; i < numBarrels; i++) {
          const x = Phaser.Math.Between(safeArea.x, safeArea.x + safeArea.width);
          const y = Phaser.Math.Between(safeArea.y, safeArea.y + safeArea.height);

          // Create the barrel
          const barrel = new Barrel(this.scene, x, y);
          this.barrels.add(barrel);
          barrel.setDepth(0.5);
          room.addBarrel(barrel);
        }
      }
    });
  }

  public setupPlayerSpellCollisions(): void {
    const currentWand = this.player.getWand();
    const deployableWand = this.player.getDeployableWand();

    if (currentWand?.spells) {
      // Player Spells vs Barrels
      this.scene.physics.add.collider(
        currentWand.spells,
        this.barrels,
        this.handleSpellBarrelCollision,
        undefined,
        this
      );
    }

    if (deployableWand?.spells) {
      // Player Spells vs Barrels
      this.scene.physics.add.collider(
        deployableWand.spells,
        this.barrels,
        this.handleSpellBarrelCollision,
        undefined,
        this
      );
    }
  }

  public setupCollisions(): void {
    this.setupPlayerSpellCollisions();
    this.scene.physics.add.overlap(
      this.player,
      this.barrels,
      this.handleBarrelCollision,
      undefined,
      this
    );
  }

  private handleSpellBarrelCollision(barrel: any, spell: any): void {
    if (barrel instanceof Barrel && spell instanceof Phaser.Physics.Arcade.Sprite) {
      if (!barrel.isBarrelSmashed()) {
        barrel.smash();
      }
    }
  }

  private handleBarrelCollision(player: any, barrel: any): void {
    if (barrel instanceof Barrel && player instanceof Player) {
      if (!barrel.isBarrelSmashed()) {
        barrel.smash();
      }
    }
  }

  public destroyBarrel(): void {
    this.barrels.destroy(true);
  }

  public destroy(): void {
    this.barrels.destroy(true);
    this.scene.events.off(WandManager.SWAPPED_EVENT);
    this.player = null;
    this.scene = null;
  }
} 