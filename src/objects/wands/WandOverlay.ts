import { Scene, GameObjects } from 'phaser';
import { Wand } from './Wand';
import { DeployableWand } from './DeployableWand';

export class WandOverlay {
    private scene: Scene;
    private container: GameObjects.Container;
    private wandIcon: GameObjects.Sprite;
    private wandName: GameObjects.Text;
    private wandStats: GameObjects.Text;
    private background: GameObjects.Rectangle;
    private deployableContainer: GameObjects.Container;
    private deployableIcon: GameObjects.Sprite;
    private deployableName: GameObjects.Text;
    private deployableStats: GameObjects.Text;

    constructor(scene: Scene) {
        this.scene = scene;

        // Create container for all overlay elements
        this.container = scene.add.container(scene.cameras.main.width - 180, 5);
        this.container.setScrollFactor(0); // Make it fixed to the screen
        this.container.setDepth(100); // Ensure it's above other elements

        // Create semi-transparent background with reduced opacity
        this.background = scene.add.rectangle(0, 0, 140, 60, 0xffffff, 0.2);
        this.background.setOrigin(0, 0);
        this.container.add(this.background);

        // Create wand icon if texture exists
        if (scene.textures.exists('wand-upgrade')) {
            this.wandIcon = scene.add.sprite(25, 25, 'wand-upgrade');
            this.wandIcon.setScale(1);
            this.container.add(this.wandIcon);
        }

        // Create wand name text
        this.wandName = scene.add.text(55, 5, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'Arial',
        });
        this.container.add(this.wandName);

        // Create wand stats text
        this.wandStats = scene.add.text(55, 30, '', {
            fontSize: '10px',
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        this.container.add(this.wandStats);

        // Create deployable container
        this.deployableContainer = scene.add.container(0, 60);
        this.container.add(this.deployableContainer);

        // Create deployable icon if texture exists
        if (scene.textures.exists('turret')) {
            this.deployableIcon = scene.add.sprite(25, 25, 'turret');
            this.deployableIcon.setScale(1);
            this.deployableContainer.add(this.deployableIcon);
        }

        // Create deployable name text
        this.deployableName = scene.add.text(55, 5, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontFamily: 'Arial',
        });
        this.deployableContainer.add(this.deployableName);

        // Create deployable stats text
        this.deployableStats = scene.add.text(55, 30, '', {
            fontSize: '10px',
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        this.deployableContainer.add(this.deployableStats);

        // Hide initially
        this.container.setVisible(false);
        this.deployableContainer.setVisible(false);
    }

    public updateWand(wand: Wand, deployableWand?: DeployableWand | null): void {
        if (!wand) {
            this.container.setVisible(false);
            return;
        }

        // Show container
        this.container.setVisible(true);

        // Update wand icon color
        if (wand.displayConfig?.color) {
            this.wandIcon.setTint(parseInt(wand.displayConfig.color, 16));
        } else {
            this.wandIcon.clearTint();
        }

        // Format wand name
        const displayName = wand.wandType
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');

        // Update wand name
        this.wandName.setText(displayName);

        // Format and update wand stats
        const attackRate = (1000 / wand.attackRate).toFixed(1);
        const stats = [
            `Damage: ${wand.damage}`,
            `Attack Rate: ${attackRate}/s`
        ].join('\n');
        this.wandStats.setText(stats);

        // Update deployable wand if available
        if (deployableWand) {
            this.background.setSize(140, 120);
            this.deployableContainer.setVisible(true);

            // Update deployable icon color
            if (deployableWand.displayConfig?.color) {
                this.deployableIcon.setTint(parseInt(deployableWand.displayConfig.color, 16));
            } else {
                this.deployableIcon.clearTint();
            }

            // Format deployable name
            const deployableDisplayName = deployableWand.wandType
                .split('_')
                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                .join(' ');

            // Update deployable name
            this.deployableName.setText(deployableDisplayName);

            // Format and update deployable stats
            const deployableAttackRate = (1000 / deployableWand.attackRate).toFixed(1);
            const deployableStats = [
                `Damage: ${deployableWand.damage}`,
                `Attack Rate: ${deployableAttackRate}/s`
            ].join('\n');
            this.deployableStats.setText(deployableStats);
        } else {
            this.deployableContainer.setVisible(false);
        }
    }

    public destroy(): void {
        this.container.destroy();
    }
} 