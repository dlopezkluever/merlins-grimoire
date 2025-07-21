import { Scene } from 'phaser';
import { HealthPotion } from './HealthPotion';
import { Player } from '../player/Player';
import { Room } from '../rooms/Room';
import { Barrel } from '../props/Barrel';
import { ItemType } from './ItemType';
import { SparkBoost } from './SparkBoost';

export class ItemManager {
  protected scene: Scene;
  protected potions: Phaser.Physics.Arcade.Group;
  protected powerups: Phaser.Physics.Arcade.Group;
  protected player: Player;
  private maxPotions: number = 3;
  private maxPowerups: number = 2;
  private roomsToSpawnItems: { [key: string]: ItemType[] } = {
    '1': [],
    '2': [ItemType.HealthPotion],
    '3': [ItemType.SparkBoost, ItemType.HealthPotion],
    '4': [ItemType.SparkBoost],
    '5': [ItemType.HealthPotion, ItemType.SparkBoost]
  };

  constructor(scene: Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    // Create potions group
    this.potions = scene.physics.add.group({
      classType: HealthPotion,
      maxSize: this.maxPotions,
      runChildUpdate: true
    });

    // Create powerups group
    this.powerups = scene.physics.add.group({
      classType: SparkBoost,
      maxSize: this.maxPowerups,
      runChildUpdate: true
    });

    // Listen for barrel smashed events
    scene.events.on(Barrel.SMASHED_EVENT, (data: { x: number, y: number, barrel: Barrel }) => {
      if (data.barrel.getItemType() === ItemType.HealthPotion) {
        this.spawnPotion(data.x, data.y);
      }
      if (data.barrel.getItemType() === ItemType.SparkBoost) {
        this.spawnPowerup(data.x, data.y);
      }
    });
  }



  public createItemsFromItemsLayer(itemsLayer: Phaser.Tilemaps.ObjectLayer): void {
    itemsLayer.objects.filter(item => item.name === 'Potion').forEach(item => {
      if (item.x && item.y) {
        const healAmount = item.properties?.find((p: { name: string; value: string }) => p.name === 'HealAmount')?.value as number;
        this.spawnPotion(item.x, item.y, healAmount);
      }
    });
  }

  public setSpawnPoints(rooms: Map<string, Room>): void {
    for (const [roomId, itemTypes] of Object.entries(this.roomsToSpawnItems)) {
      const room = rooms.get(roomId);
      for (const itemType of itemTypes) {
        const barrels: Barrel[] = room?.getBarrels() || [];
        barrels.sort(() => Math.random() - 0.5);
        const barrel = barrels.find(barrel => !barrel.getItemType());
        if (barrel) {
          barrel.addItem(itemType as ItemType);
        }
      }
    }
  }

  private spawnPotion(x: number, y: number, healAmount: number = 50): void {
    if (this.potions.countActive(true) >= this.maxPotions) return;
    const potion: HealthPotion = this.potions.get(x, y) as HealthPotion;
    if (potion) {
      potion.setHealAmount(healAmount);
      potion.setActive(true);
      potion.setVisible(true);
    }
  }

  private spawnPowerup(x: number, y: number): void {
    if (this.powerups.countActive(true) >= this.maxPowerups) return;

    const powerup: SparkBoost = this.powerups.get(x, y) as SparkBoost;
    if (powerup) {
      const speedBoostAmount = Phaser.Math.FloatBetween(2, 3);
      powerup.setSpeedBoost(speedBoostAmount);
      powerup.setActive(true);
      powerup.setVisible(true);
    }
  }

  public setupCollisions(): void {
    if (!this.player) return;

    // Setup potion collisions
    this.scene.physics.add.overlap(
      this.player,
      this.potions,
      (player: any, potionObj: any) => {
        const potion = potionObj as HealthPotion;
        if (!potion.isItemCollected()) {
          potion.collect();
        }
      }
    );

    // Setup powerup collisions
    this.scene.physics.add.overlap(
      this.player,
      this.powerups,
      (player: any, powerupObj: any) => {
        const powerup = powerupObj as SparkBoost;
        if (!powerup.isItemCollected()) {
          powerup.collect();
        }
      }
    );
  }


  public destroy(): void {
    // Remove event listeners
    this.scene.events.off(Barrel.SMASHED_EVENT);

    // // // Clear all items
    // this.potions.clear(true, true);
    // this.powerups.clear(true, true);

    this.player = null;
    this.scene = null;
  }
} 