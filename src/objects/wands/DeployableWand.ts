import { Scene } from "phaser";
import { WandConfig } from "./WandConfigs";
import { Wand } from "./Wand";
import { WandType } from "./WandConfigs";
import { DeployableWandInstance } from "./DeployableWandInstance";
import { Room } from "../rooms/Room";

export class DeployableWand extends Wand {

    constructor(scene: Scene, type: WandType, config: WandConfig) {
        super(scene, type, config);
    }

    public isDeployable(): boolean {
        return true;
    }

    public deploy(shooter: any, room: Room): void {
        DeployableWandInstance.create(this.scene, shooter, room);
    }
}