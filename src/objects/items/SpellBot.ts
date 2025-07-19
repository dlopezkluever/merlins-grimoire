import { MainScene } from "../../scenes/MainScene";
import { Player } from "../player/Player";
import { PlainSpell } from "../wands/PlainSpell";

export class SpellBot extends Phaser.Physics.Arcade.Sprite {
    private actionTimer: number = 0;
    private actionInterval: number = 5000;
    public static readonly SPELLBOT_EXPLODE = 'spell-bot-explode';
    private particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'spell-bot-animation');
        this.setScale(2);
        this.createAnimations();
        this.scene.add.existing(this);
        console.log('SpellBot created');

        // Add to scene and enable physics in one step
        scene.physics.add.existing(this);

        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setSize(16, 16);
            this.body.setBounce(0);
            this.body.immovable = true;
        }
        this.setupOverlap();
    }

    private setupOverlap() {
        const player = (this.scene as MainScene).getPlayer();
        this.scene.physics.add.overlap(this, player, (obj1, obj2) => this.handleOverlap(obj1 as SpellBot, obj2 as Player), undefined, this);
        this.scene.physics.add.overlap(this, player.getWand().spells as Phaser.Physics.Arcade.Group, (obj1, obj2) => this.handleOverlap(obj1 as SpellBot, obj2 as PlainSpell), undefined, this);
    }

    private handleOverlap(spellBot: SpellBot, other: Player | PlainSpell) {
        this.explode();
    }

    private createAnimations() {
        if (this.scene.anims.exists('spell-bot-explode')) return;
        this.scene.anims.create({
            key: 'spell-bot-explode',
            frames: this.scene.anims.generateFrameNumbers('spell-bot-animation', {
                start: 0,
                end: 1,
            }),
            frameRate: 8,
            repeat: -1
        });
    }

    override preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        
        // Only start the animation if it's not already playing
        if (!this.anims.isPlaying) {
            this.play('spell-bot-explode');
        }
        
        this.actionTimer += delta;
        if (this.actionTimer >= this.actionInterval) {
            this.explode();
            this.actionTimer = 0;
        }
    }

    public explode() {
        const player = (this.scene as MainScene).getPlayer();
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance < 50) {
            player.takeDamage(10);
        }
        this.scene.events.emit(SpellBot.SPELLBOT_EXPLODE, this.x, this.y);

        // Create explosion particles
        this.particles = this.scene.add.particles(0, 0, 'particle', {
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 800,
            quantity: 20,
            tint: 0xff5500, // Orange-red color
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            gravityY: 0
        });

        // Emit particles for a short duration
        this.particles.explode(20, this.x, this.y);

        // Destroy particles after animation completes
        this.scene.time.delayedCall(800, () => {
            if (this.particles) {
                this.particles.destroy();
                this.particles = null;
            }
        });

        this.deactivate();
    }

    public deactivate(): void {
        // return to pool   
        this.setVisible(false);
        this.setActive(false);
        this.body.enable = false;

        // Clean up particles if they exist
        if (this.particles) {
            this.particles.destroy();
            this.particles = null;
        }

        // Reset action timer
        this.actionTimer = 0;
    }

    public activate(x: number, y: number): void {
        this.setPosition(x, y);
        this.setVisible(true);
        this.setActive(true);
        this.body.enable = true;
        this.actionTimer = 0;
    }
}
