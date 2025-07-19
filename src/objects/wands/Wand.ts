import { Scene, Physics, Math } from 'phaser';
import { Player } from '../player/Player';
import { Enemy } from '../enemy/Enemy';
import { PlainSpell } from './PlainSpell';
import { WandConfig, WandType } from './WandConfigs';

export class Wand {
  public damage: number;
  public attackRate: number;
  public spellSpeed?: number;
  public spellSprite?: string;
  public spellWidth?: number;
  public spellHeight?: number;
  public spellSpinSpeed?: number;
  public type: 'melee' | 'ranged';
  public spells?: Physics.Arcade.Group;
  public minDistance: number = 50;
  public maxDistance: number = 200;
  public wandType: WandType;
  protected scene: Scene;
  public config: WandConfig;
  private lastFired: number = 0;
  public displayConfig?: WandConfig['displayConfig'] | null;

  constructor(scene: Scene, type: WandType, config: WandConfig) {
    this.scene = scene;

    this.wandType = type;

    this.config = config;
    this.displayConfig = config.displayConfig || null;
    // Apply configuration
    this.type = config.type;
    this.damage = config.damage;
    this.attackRate = config.attackRate || 1000; // Default to 1 second cooldown if not provided
    this.minDistance = config.minDistance || this.minDistance;
    this.maxDistance = config.maxDistance || this.maxDistance;

    // Set spell properties for ranged wands
    if (this.type === 'ranged') {
      this.spellSpeed = config.spellSpeed || 300;
      this.spellSprite = config.spellSprite || 'arrow';
      this.spellWidth = config.spellWidth || 32;
      this.spellHeight = config.spellHeight || 16;
      this.spellSpinSpeed = config.spellSpinSpeed || 0;

      // Create spell group for ranged wands
      this.spells = this.createSpellGroup(scene);
    }

  }

  public isDeployable(): boolean {
    return false;
  }

  private createSpellGroup(scene: Scene): Physics.Arcade.Group {
    return scene.physics.add.group({
      classType: PlainSpell,
      runChildUpdate: true,
      createCallback: (item) => {
        const spell = item as PlainSpell;
        spell.setTexture(this.spellSprite || 'arrow');
        spell.setDisplaySize(this.spellWidth || 32, this.spellHeight || 16);
        spell.setOrigin(0.5, 0.5);
        spell.setDamage(this.damage);
        spell.setSpeed(this.spellSpeed || 300);
        // Set a smaller hit area for the spell
        const body = spell.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setSize(8, 8);
        }
      }
    });
  }

  // Deal damage method for melee weapons
  public dealDamage(attacker: Player | Enemy, target: Player | Enemy): void {
    if (this.type !== 'melee') return;

    // Check attack rate cooldown
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastFired < this.attackRate) return;

    // Calculate distance to target
    const distance = Phaser.Math.Distance.Between(
      attacker.x, attacker.y,
      target.x, target.y
    );
    // Only attack if in range
    if (distance <= this.maxDistance) {
      // Apply damage to target
      target.takeDamage(this.damage);
      this.lastFired = currentTime;
    }
  }

  public fire(shooter: any, target: any): void {
    // Check if weapon can fire
    if (this.type !== 'ranged' || !this.spells) return;

    // Check cooldown
    const now = Date.now();
    if (now - this.lastFired < this.attackRate) return;

    // Get a spell from the wand's spell group
    const spell = this.spells.get() as PlainSpell;
    if (spell) {
      // Calculate angle from shooter to target
      const angle = Phaser.Math.Angle.Between(shooter.x, shooter.y, target.x, target.y);
      spell.fire(shooter.x, shooter.y, angle);
      this.lastFired = now;
    }
  }

  // Fire method for ranged wands
  public fireAtTarget(shooter: any, target: any): void {
    if (this.type !== 'ranged' || !this.spells) return;

    // Check attack rate cooldown
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastFired < this.attackRate) return;

    // Get target position
    const targetX = target.x;
    const targetY = target.y;

    // Calculate angle to target
    const angle = Phaser.Math.Angle.Between(
      shooter.x,
      shooter.y,
      targetX,
      targetY
    );

    // Get a spell from the wand's spell group
    const spell = this.spells.get() as PlainSpell;
    if (spell) {
      spell.fire(shooter.x, shooter.y, angle);

      // Apply spinning animation if specified
      if (this.spellSpinSpeed !== undefined && this.spellSpinSpeed !== 0) {
        // Add a tween to continuously rotate the spell
        this.scene.tweens.add({
          targets: spell,
          angle: 360,
          duration: 1000 / this.spellSpinSpeed, // Duration based on spin speed
          repeat: -1,
          ease: 'Linear'
        });
      }
    }
    this.lastFired = currentTime;
  }

  public fireInDirection(shooter: any, x: number, y: number): void {
    if (this.type !== 'ranged' || !this.spells) return;

    // Check attack rate cooldown
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastFired < this.attackRate) return;

    // Calculate angle
    const angle = Phaser.Math.Angle.Between(shooter.x, shooter.y, x, y);

    // Get a spell from the wand's spell group
    const spell = this.spells.get() as PlainSpell;
    if (spell) {
      spell.fire(shooter.x, shooter.y, angle);
    }
    this.lastFired = currentTime;
  }

  // Method to deactivate all spells (used when enemy dies)
  public deactivateAllSpells(): void {
    if (this.spells) {
      this.spells.getChildren().forEach((spell) => {
        (spell as PlainSpell).deactivate();
      });
    }
  }

  public getDamage(): number {
    return this.damage;
  }

  public getFireRate(): number {
    return this.attackRate;
  }

  public getRange(): number {
    return this.maxDistance;
  }

  public setDamage(damage: number): void {
    this.damage = damage;
  }

  public setFireRate(fireRate: number): void {
    this.attackRate = fireRate;
  }

  public setRange(range: number): void {
    this.maxDistance = range;
  }

  public destroy(): void {
    if (this.spells) {
      this.spells.clear(true, true); // Destroys all spells
      this.spells.destroy();         // Destroys the group itself
      this.spells = undefined;
    }

    // Null references for cleanup (optional, helps GC)
    this.config = null;
    this.displayConfig = null;
  }
} 