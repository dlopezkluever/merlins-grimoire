import { SpellBot } from "../items/SpellBot";
import { Scene } from "phaser";
import { Enemy } from "./Enemy";
import { Room, RoomState } from "../rooms/Room";
import { MainScene } from "../../scenes/MainScene";
export interface EnemyBehaviour {

    init(scene: Scene, enemy: Enemy): void;
    preUpdate(time: number, delta: number, scene: Scene, enemy: Enemy): void;
    destroy(scene: Scene): void;
}


export class DropSpellBotBehaviour implements EnemyBehaviour {
    private actionTimer: number = 0;
    private actionInterval: number = 4000;
    private spellBots: Phaser.Physics.Arcade.Group | null = null;
    private isDestroying: boolean = false;
    private direction: { x: number, y: number }[] =
        [{ x: 150, y: 150 },
        { x: 150, y: 0 },
        { x: 0, y: 150 },
        { x: -150, y: 150 },
        { x: -150, y: 0 },
        { x: 0, y: -150 },
        { x: 150, y: -150 },
        { x: 150, y: 0 },
        { x: 0, y: 150 },
        { x: -150, y: 150 }];

    constructor() {
        // Group will be initialized in init method
    }

    public init(scene: Scene, enemy: Enemy) {
        // Initialize the group with the scene
        this.spellBots = scene.physics.add.group({
                            classType: SpellBot,
            runChildUpdate: true,
            maxSize: 10
        });
        scene.events.on(Room.ROOM_STATE_CHANGED, (room: Room) => {
            if (room.getState() === RoomState.ROOM_CLEARED) {
                this.destroy(scene);
            }
        });
    }

    public preUpdate(time: number, delta: number, scene: Scene, enemy: Enemy) {
        // Don't create new spell bots if we're in the process of destroying
        if (this.isDestroying) return;

        this.actionTimer += delta;
        if (this.actionTimer >= this.actionInterval) {
            if (scene && enemy && enemy.active && this.spellBots) {
                // Try to get a spell bot from the pool
                const spellBot = this.spellBots.getFirstDead() as SpellBot;
                const position = this.getValidPosition(enemy.x, enemy.y, scene);

                if (spellBot) {
                    // Reactivate existing spell bot
                    spellBot.activate(position.x, position.y);
                } else {
                    // Create new spell bot if pool is empty
                    const newSpellBot = new SpellBot(scene, position.x, position.y);
                    this.spellBots.add(newSpellBot);
                }
            }
            this.actionTimer = 0;
        }
    }

    private getValidPosition(x: number, y: number, scene: Scene): { x: number, y: number } {
        const position = { x: x, y: y };
        for (const direction of this.direction) {
            position.x += direction.x;
            position.y += direction.y;
            if (scene instanceof MainScene && scene.isPositionValid(position.x, position.y)) {
                return position;
            }
        }
        return { x: x, y: y };
    }
    private areAllSpellBotsInactive(): boolean {
        if (!this.spellBots) return true;

        let allInactive = true;
        this.spellBots.getChildren().forEach((spellBot: Phaser.GameObjects.GameObject) => {
            if (spellBot.active) {
                allInactive = false;
            }
        });
        return allInactive;
    }

    public destroy(scene: Scene): void {
        if (this.isDestroying) return;
        this.isDestroying = true;

        // If there are active spell bots, wait for them to explode
        if (!this.areAllSpellBotsInactive()) {
            // Check every 100ms if all spell bots are inactive
            const checkInterval = scene?.time.addEvent({
                delay: 100,
                callback: () => {
                    if (this.areAllSpellBotsInactive()) {
                        checkInterval?.destroy();
                        this.finalizeDestroy();
                    }
                },
                loop: true
            });
        } else {
            this.finalizeDestroy();
        }
    }

    private finalizeDestroy(): void {
        console.log('Finalizing destroy', this.spellBots);
        if (this.spellBots) {
            this.spellBots.clear(true, true);
            this.spellBots.destroy();
            this.spellBots = null;
        }
    }
}