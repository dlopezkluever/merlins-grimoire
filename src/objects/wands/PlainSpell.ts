import { Scene, Physics } from 'phaser';

// Extend Physics.Arcade.Sprite for physics and automatic updates
export class PlainSpell extends Physics.Arcade.Sprite {
    // Removed redundant body declaration, it's inherited
    private speed: number = 300; // Increased spell speed to be faster than player movement
    private damage: number = 10; // Default damage amount

    constructor(scene: Scene, x: number, y: number, textureKey: string = '__WHITE') {
        // Call Sprite constructor with the provided texture
        super(scene, x, y, 'arrow');
    }

    setSpeed(speed: number): void {
        this.speed = speed;
    }

    // Method to set the damage amount
    setDamage(amount: number): void {
        this.damage = amount;
    }

    // Method to get the damage amount
    getDamage(): number {
        return this.damage;
    }

    // Method to fire the spell from a specific position towards an angle
    fire(x: number, y: number, angle: number): void {
        // 1. Activate the GameObject
        this.setActive(true);
        this.setVisible(true);

        // 2. Enable the physics body
        (this.body as Physics.Arcade.Body).setEnable(true);

        // 3. Set position *after* enabling
        this.setPosition(x, y);
        // Make sure the body's internal position is also synced
        (this.body as Physics.Arcade.Body).reset(x, y);

        // 4. Ensure physics properties are correct for an active spell
        const body = this.body as Physics.Arcade.Body;


        // 6. Calculate and set velocity manually
        const vx = Math.cos(angle) * this.speed;
        const vy = Math.sin(angle) * this.speed;
        body.setVelocity(vx, vy);

        // 7. Set rotation to match the angle
        this.setRotation(angle);
    }

    // Method to deactivate the spell (return to pool)
    public deactivate(): void {
        // 1. Deactivate GameObject
        this.setActive(false);
        this.setVisible(false);

        // 2. Disable physics body
        const body = this.body as Physics.Arcade.Body;
        if (body) {
            body.setEnable(false);
            body.setVelocity(0, 0); // Explicitly stop motion
        }
    }

    // Override preUpdate to check for world bounds
    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        const body = this.body as Physics.Arcade.Body;

        if (this.active && body.checkWorldBounds()) {
            this.deactivate();
        }
    }
} 