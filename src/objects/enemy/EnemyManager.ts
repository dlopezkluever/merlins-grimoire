import { Scene } from 'phaser';
import { Enemy } from './Enemy';
import { Room } from '../rooms/Room';
import { Player } from '../player/Player';
import { RangedEnemy } from './RangedEnemy';
import { PlainSpell } from '../wands/PlainSpell';
import { EnemyType } from './EnemyFactory';
import { MainScene } from '../../scenes/MainScene';
import { WandUpgrade } from '../wands/WandUpgrade';
import { WandManager } from '../wands/WandManager';
import { EnemySpawner } from './EnemySpawner';

export class EnemyManager {
  protected scene: Scene;
  private enemies: Phaser.Physics.Arcade.Group;
  protected player: Player;

  constructor(scene: Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    
    this.enemies = this.scene.physics.add.group({
      classType: Enemy,
      runChildUpdate: true
    });

    // Listen for enemy created events
    this.scene.events.on(EnemySpawner.ENEMY_CREATED, (data: { enemy: Enemy }) => {
      if (data.enemy && data.enemy.body) {
        this.enemies.add(data.enemy);
        this.setupEnemySpellCollisions(data.enemy);
      }
    });

    scene.events.on(WandManager.SWAPPED_EVENT, (data: { wandUpgrade: WandUpgrade }) => {
      this.setupPlayerSpellCollisions();
    });
  }



  public createEnemiesFromSpawnLayer(spawnLayer: Phaser.Tilemaps.ObjectLayer, rooms: Map<string, Room>): void {
    // Find all enemy spawn points in the spawn layer
    spawnLayer.objects.forEach((obj) => {

      // Ensure all required properties exist
      if (typeof obj.x !== 'number' ||
        typeof obj.y !== 'number') {
        console.warn('Invalid enemy spawn object properties:', obj);
        return;
      }

      const roomProperty = obj.properties?.find((p: { name: string; value: string }) => p.name === 'Room');
      const roomId = roomProperty?.value;
      const room = rooms.get(roomId);

      if (room) {
        // Get enemy type from properties
        const typeProperty = obj.properties?.find((p: { name: string; value: string }) => p.name === 'Type');
        const enemyType = typeProperty?.value?.toUpperCase() as EnemyType;
        const quantityProperty = obj.properties?.find((p: { name: string; value: string }) => p.name === 'Quantity');
        const maxSpawnsProperty = obj.properties?.find((p: { name: string; value: string }) => p.name === 'MaxSpawns');

        // Add spawn point to room
        room.addEnemyType(enemyType, parseInt(quantityProperty?.value || '1'));
        room.setMaxSpawns(enemyType, parseInt(maxSpawnsProperty?.value || '1'));
      }
    });
  }

  public setupProceduralEnemies(rooms: Map<string, Room>): void {
    // Define enemy types and their spawn probabilities
    const enemyTypes = [
      { type: 'DRAUGR' as EnemyType, weight: 30, minCount: 1, maxCount: 3 },
      { type: 'DUMBDUMB' as EnemyType, weight: 25, minCount: 1, maxCount: 2 },
      { type: 'SCOUNDREL' as EnemyType, weight: 20, minCount: 1, maxCount: 2 },
      { type: 'DRAGONLING' as EnemyType, weight: 15, minCount: 1, maxCount: 2 },
      { type: 'TROLL' as EnemyType, weight: 10, minCount: 1, maxCount: 1 }
    ];

    rooms.forEach((room, roomId) => {
      // Skip the starting room (always room ID '1')
      if (roomId === '1') {
        console.log('Skipping enemy spawn for starting room');
        return;
      }

      // Determine difficulty based on room distance from start
      const roomNum = parseInt(roomId);
      const difficultyMultiplier = Math.min(1 + (roomNum / 10), 2.5);

      // Randomly select enemy types for this room
      const selectedEnemies = this.selectRandomEnemies(enemyTypes, difficultyMultiplier);

      // Add enemy types to room
      selectedEnemies.forEach(enemy => {
        room.addEnemyType(enemy.type, enemy.count);
        room.setMaxSpawns(enemy.type, enemy.maxSpawns);
      });
    });
  }

  private selectRandomEnemies(enemyTypes: any[], difficultyMultiplier: number): any[] {
    const selected = [];
    const totalWeight = enemyTypes.reduce((sum, type) => sum + type.weight, 0);

    // Determine number of different enemy types (1-3 based on difficulty)
    const numTypes = Math.min(Math.floor(1 + Math.random() * difficultyMultiplier), 3);

    for (let i = 0; i < numTypes; i++) {
      let random = Math.random() * totalWeight;
      
      for (const enemyType of enemyTypes) {
        random -= enemyType.weight;
        if (random <= 0) {
          const count = Math.floor(
            enemyType.minCount + 
            Math.random() * (enemyType.maxCount - enemyType.minCount + 1) * difficultyMultiplier
          );
          
          selected.push({
            type: enemyType.type,
            count: Math.max(1, count),
            maxSpawns: Math.ceil(count * 1.5) // Allow some respawns
          });
          break;
        }
      }
    }

    return selected;
  }

  public setupCollisions(): void {
    const wallsLayer = (this.scene as MainScene).getWallsLayer();

    this.setupPlayerSpellCollisions();

    if (wallsLayer) {
      // Enemy collisions with walls
      this.scene.physics.add.collider(
        this.enemies,
        wallsLayer,
        this.handleEnemyWallCollision,
        undefined,
        this
      );
    }

    // Enemy overlap with player (for melee damage)
    this.scene.physics.add.overlap(
      this.enemies,
      this.player,
      this.handlePlayerEnemyOverlap,
      undefined,
      this
    );
  }

  private setupPlayerSpellCollisions(): void {
    const currentWand = this.player.getWand();
    const deployableWand = this.player.getDeployableWand();

    if (currentWand?.spells) {
      this.scene.physics.add.collider(
        this.enemies,
        currentWand.spells,
        this.handleEnemySpellCollision,
        undefined,
        this
      );
    }

    if (deployableWand?.spells) {
      this.scene.physics.add.collider(
        this.enemies,
        deployableWand.spells,
        this.handleEnemySpellCollision,
        undefined,
        this
      );
    }
  }

  // Helper to set up collisions for a specific enemy's spells
  public setupEnemySpellCollisions(enemyInstance: Enemy) {
    const wallsLayer = (this.scene as MainScene).getWallsLayer();

    if (enemyInstance instanceof RangedEnemy && enemyInstance.wand && enemyInstance.wand.spells) {
      // Enemy Spells vs Player
      this.scene.physics.add.collider(this.player, enemyInstance.wand.spells, this.handlePlayerSpellCollision, undefined, this);
      
      // Enemy Spells vs Walls
      if (wallsLayer) {
        this.scene.physics.add.collider(enemyInstance.wand.spells, wallsLayer, (this.scene as MainScene).handleSpellCollision, undefined, this);
      }
    }
  }

  // Handles collision between enemy spells and the player
  protected handlePlayerSpellCollision(player: any, spell: any) {
    const playerInstance = player as Player;
    const spellInstance = spell as PlainSpell;

    if (!playerInstance.active || !spellInstance.active) {
      return;
    }

    playerInstance.takeDamage(spellInstance.getDamage());
    spellInstance.deactivate();
  }

  private handleEnemyWallCollision(enemy: any, wall: any): void {
    if (enemy instanceof Enemy) {
      // Handle enemy wall collision (e.g., stop movement, change direction)
      enemy.handleWallCollision();
    }
  }

  private handleEnemySpellCollision(enemy: any, spell: any): void {
    const enemyInstance = enemy as Enemy;
    const spellInstance = spell as PlainSpell;

    if (!enemyInstance.active || !spellInstance.active) {
      return;
    }

    spellInstance.deactivate();
    enemyInstance.takeDamage(spellInstance.getDamage());
  }

  protected handlePlayerEnemyOverlap = (obj1: any, obj2: any): void => {
    const enemy = obj1 as Enemy;
    const player = obj2 as Player;
    
    // Check if enemy is active using the active property
    if (enemy.active) {
      player.takeDamage(10, 'enemy_contact');
    }
  };

  public destroy(): void {

    if (this.scene) {
      this.scene.events.off(WandManager.SWAPPED_EVENT);
    }

    this.enemies.destroy(true);
    this.enemies = null;
    this.player = null;
    this.scene = null;
  }


  public getEnemies(): Enemy[] {
    return this.enemies.getChildren() as Enemy[];
  }

  public getEnemiesGroup(): Phaser.Physics.Arcade.Group {
    return this.enemies;
  }

  public getClosestPlayer(enemyX: number, enemyY: number): Player | null {
    // Single player mode - just return the player
    return this.player;
  }
} 