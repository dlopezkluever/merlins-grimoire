import { Scene } from 'phaser';
import { Item } from './Item';

export class SparkBoost extends Item {
    private duration: number = 5000;
    private speedBoost: number = 1.5;

    public static readonly COLLECTED_EVENT = 'spark-boost-collected';

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'spark-boost');
    }

    protected getCollectData(): { [key: string]: any } {
        return {
            duration: this.duration,
            speedBoost: this.speedBoost
        };
    }
    public getSpeedBoost(): number {
        return this.speedBoost;
    }
    public setSpeedBoost(speedBoost: number): void {
        this.speedBoost = speedBoost;
    }

    protected getCollectEvent(): string {
        return SparkBoost.COLLECTED_EVENT;
    }
}


