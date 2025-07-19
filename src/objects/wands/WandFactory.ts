import { Scene } from 'phaser';
import { Wand } from './Wand';
import { WAND_CONFIGS, WandType, OWNER_PLAYER, OWNER_ENEMY, WandConfig } from './WandConfigs';
import { DeployableWand } from './DeployableWand';

export class WandFactory {

  static getWandConfig(type: WandType): WandConfig | undefined {
    return WAND_CONFIGS[type];
  }

  static createPlayerWand(scene: Scene, type: WandType): Wand {
    const config = WAND_CONFIGS[type];
    if (config.owner !== OWNER_PLAYER) {
      console.warn(`Wand type ${type} is not a player wand`);
    }

    // Use type assertion to handle deployable property
    const wandConfig = config as unknown as WandConfig;

    if (wandConfig.deployable === true) {
      return new DeployableWand(scene, type, wandConfig);
    } else {
      return new Wand(scene, type, wandConfig);
    }
  }


  static createEnemyWand(scene: Scene, type: WandType): Wand {
    const config = WAND_CONFIGS[type];
    if (config.owner !== OWNER_ENEMY) {
      console.warn(`Wand type ${type} is not an enemy wand`);
    }

    // Use type assertion to handle deployable property
    const wandConfig = config as unknown as WandConfig;

    return new Wand(scene, type, wandConfig);
  }
} 