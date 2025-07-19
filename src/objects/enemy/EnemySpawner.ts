import { Scene } from "phaser";
import { EnemyFactory, EnemyType } from "./EnemyFactory";
import { Room, RoomState } from "../rooms/Room";
import { Player } from "../player/Player";
import { MainScene } from "../../scenes/MainScene";

export class EnemySpawner {
    private scene: Scene;
    private spawnRate: number = 500;
    private player: Player;
    private spawnTimer: Phaser.Time.TimerEvent | null = null;
    private room: Room;
    public static readonly ENEMY_CREATED = 'enemy-created';

    constructor(scene: Scene, player: Player, room: Room) {
        this.scene = scene;
        this.player = player;
        this.room = room;
    }

    public spawnEnemies() {
        // Get a random point for spawning
        this.getRandomPoint().then(points => {
            if (points && points.length > 0) {
                if (!this.room.canSpawnEnemies()) {
                    return;
                }
                const enemyTypes = this.room.getEnemyTypesToSpawn();
                // Schedule next enemy spawn after delay
                this.scene.time.delayedCall(200, () => {
                    this.spawnEnemyWithDelay(points, enemyTypes);
                });
            }
        });
    }

    /**
     * Recursively spawns enemies with a delay between each one
     * @param room The room to spawn enemies in
     * @param points The spawn points
     * @param enemyTypeIndex The current enemy type index
     * @param enemyIndex The current enemy index within the type
     * @param pointIndex The current spawn point index
     */
    private spawnEnemyWithDelay(points: { x: number, y: number }[], enemyTypes: { type: EnemyType, count: number }[], enemyTypeIndex: number = 0, enemyIndex: number = 0, pointIndex: number = 0): void {
        // Check if we've processed all enemy types
        if (enemyTypeIndex >= enemyTypes.length) {
            return;
        }

        const enemyType = enemyTypes[enemyTypeIndex];
        if (!enemyType) return;

        // Check if we've spawned all enemies of this type
        if (enemyIndex >= enemyType.count) {
            // Move to next enemy type
            this.room.updateMaxSpawns(enemyType.type);
            this.spawnEnemyWithDelay(points, enemyTypes, enemyTypeIndex + 1, 0, pointIndex);
            return;
        }

        const point = points[pointIndex % points.length];
        console.log(point, points, pointIndex);
        if (!point) return;

        // Create spawn effect
        this.createSpawnEffect(point.x, point.y);

        // Spawn a single enemy
        const enemy = EnemyFactory.createEnemy(
            this.scene,
            enemyType.type,
            point.x,
            point.y,
            `enemy_${this.room.getId()}_${Date.now()}`
        );

        this.room.setWorkingSpawnPoint(point.x, point.y);

        this.room.addEnemy(enemy);
        enemy.setPlayer(this.player);
        this.scene.events.emit(EnemySpawner.ENEMY_CREATED, { enemy: enemy });


        // Set room state to spawning
        this.room.setState(RoomState.SPAWNING);

        // Schedule next enemy spawn after delay
        this.scene.time.delayedCall(this.spawnRate, () => {
            this.spawnEnemyWithDelay(points, enemyTypes, enemyTypeIndex, enemyIndex + 1, pointIndex + 1);
        });
    }

    /**
     * Creates a visual effect when an enemy spawns
     * @param x The x coordinate where the enemy spawned
     * @param y The y coordinate where the enemy spawned
     */
    private createSpawnEffect(x: number, y: number): void {
        // Create a flash effect
        const flash = this.scene.add.graphics();
        flash.fillStyle(0xffffff, 0.5);
        flash.fillCircle(x, y, 20);

        // Fade out the flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });

        // Create particle effect if texture exists
        if (this.scene.textures.exists('particle')) {
            const particles = this.scene.add.particles(0, 0, 'particle', {
                x: x,
                y: y,
                speed: { min: 50, max: 100 },
                scale: { start: 0.5, end: 0 },
                lifespan: 800,
                quantity: 10,
                tint: 0xffffff, // white color
                alpha: { start: 0.8, end: 0 },
                blendMode: 'ADD',
                gravityY: 0
            });

            // Emit particles for a short duration
            particles.explode(10, x, y);

            // Destroy particles after animation completes
            this.scene.time.delayedCall(500, () => {
                particles.destroy();
            });
        }
    }

    private async getRandomPoint(): Promise<{ x: number, y: number }[] | null> {
        const numberOfPoints = 15;
        const pathfindingGrid = (this.scene as MainScene).getPathfindingGrid();
        const roomBounds = this.room.getZone().getBounds();

        const spawnPoints: { x: number, y: number }[] = [];
        
        // Try to find spawn points throughout the room, not just around the player
        const maxAttempts = Math.min(numberOfPoints * 2, 100); // Cap attempts to prevent infinite loops
        for (let i = 0; i < maxAttempts; i++) {
            let x: number, y: number;
            
            // 60% chance to spawn away from player, 40% chance near player
            if (Math.random() < 0.6) {
                // Spawn anywhere in the room, avoiding player vicinity
                x = Phaser.Math.Between(roomBounds.x + 32, roomBounds.x + roomBounds.width - 32);
                y = Phaser.Math.Between(roomBounds.y + 32, roomBounds.y + roomBounds.height - 32);
                
                // Ensure minimum distance from player (avoid spawning too close)
                const distanceFromPlayer = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
                if (distanceFromPlayer < 200) {
                    continue; // Skip this point if too close to player
                }
            } else {
                // Spawn in a random radius around player (for some challenge)
                const angle = Math.random() * Math.PI * 2;
                const radius = Phaser.Math.Between(200, 400);
                x = Math.round(this.player.x + radius * Math.cos(angle));
                y = Math.round(this.player.y + radius * Math.sin(angle));
            }
            
            if (!this.room.inRoom(x, y)) {
                continue;
            }
            
            const gridX = pathfindingGrid.getGridX(x);
            const gridY = pathfindingGrid.getGridY(y);

            if (pathfindingGrid.isTileWalkable(gridX, gridY) &&
                roomBounds.contains(x, y)) {
                spawnPoints.push({ x, y });
            }
            
            // Stop once we have enough points
            if (spawnPoints.length >= numberOfPoints) {
                break;
            }
        }
        
        if (spawnPoints.length > 0) {
            return spawnPoints;
        }
        
        const workingSpawnPoint = this.room.getWorkingSpawnPoint();
        if (workingSpawnPoint) {
            return [workingSpawnPoint];
        }
        
        // Fallback: spawn in room corners rather than center
        const cornerPoints = [
            { x: roomBounds.x + 50, y: roomBounds.y + 50 },
            { x: roomBounds.x + roomBounds.width - 50, y: roomBounds.y + 50 },
            { x: roomBounds.x + 50, y: roomBounds.y + roomBounds.height - 50 },
            { x: roomBounds.x + roomBounds.width - 50, y: roomBounds.y + roomBounds.height - 50 }
        ];
        
        return [cornerPoints[Math.floor(Math.random() * cornerPoints.length)]];
    }

    public destroy() {
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
            this.spawnTimer = null;
        }
        this.scene = null;
        this.player = null;
        this.room = null;

    }
}