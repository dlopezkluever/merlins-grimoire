import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private selectedButtonIndex: number = 0;
  private buttons: Phaser.GameObjects.Container[] = [];
  private isMultiplayer: boolean = false;

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    // Load menu-specific assets
    // For now, we'll create UI elements programmatically
    // Later we can add background images, etc.
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Initialize session storage
    this.initializeSessionStorage();

    // Create background
    this.add.rectangle(0, 0, width, height, 0x263238).setOrigin(0, 0);

    // Create ornate border frame
    this.createOrnateFrame();

    // Create title
    this.createTitle();

    // Create menu buttons
    this.createMenuButtons();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Add decorative elements
    this.addDecorativeElements();
  }

  private initializeSessionStorage(): void {
    // Clear any existing game session data
    sessionStorage.removeItem('chemistryLevel');
    sessionStorage.removeItem('subSubject');
    sessionStorage.removeItem('isMultiplayer');
  }

  private createOrnateFrame(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();

    // Outer frame with brown leather color
    graphics.lineStyle(8, 0x5D4037, 1);
    graphics.strokeRoundedRect(20, 20, width - 40, height - 40, 16);

    // Inner frame with golden accent
    graphics.lineStyle(4, 0xFFB300, 0.8);
    graphics.strokeRoundedRect(30, 30, width - 60, height - 60, 12);

    // Corner decorations
    const corners = [
      { x: 30, y: 30 },
      { x: width - 30, y: 30 },
      { x: 30, y: height - 30 },
      { x: width - 30, y: height - 30 }
    ];

    graphics.fillStyle(0xFFB300, 1);
    corners.forEach(corner => {
      graphics.fillCircle(corner.x, corner.y, 12);
    });
  }

  private createTitle(): void {
    const { width } = this.cameras.main;

    // Main title
    const title = this.add.text(width / 2, 100, "MERLIN'S GRIMOIRE", {
      fontFamily: 'Arial, serif',
      fontSize: '48px',
      color: '#FFB300',
      stroke: '#2A1A4A',
      strokeThickness: 6,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 150, 'Chemistry Edition', {
      fontFamily: 'Arial, serif',
      fontSize: '24px',
      color: '#00BCD4',
      stroke: '#2A1A4A',
      strokeThickness: 3
    });
    subtitle.setOrigin(0.5);

    // Add magical sparkle animation to title
    this.tweens.add({
      targets: title,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  private createMenuButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonData = [
      { text: 'SOLO PLAY', action: () => this.startSoloGame() },
      { text: '2-PLAYER LOCAL', action: () => this.startMultiplayerGame() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'CREDITS', action: () => this.showCredits() }
    ];

    const startY = height / 2 - 50;
    const buttonSpacing = 70;

    buttonData.forEach((data, index) => {
      const button = this.createButton(width / 2, startY + index * buttonSpacing, data.text, data.action);
      this.buttons.push(button);
    });

    // Select first button by default
    this.selectButton(0);
  }

  private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x3E2723, 0.9);
    bg.fillRoundedRect(-120, -25, 240, 50, 10);
    bg.lineStyle(3, 0xFFB300, 0.8);
    bg.strokeRoundedRect(-120, -25, 240, 50, 10);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#FFFFFF'
    });
    buttonText.setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(240, 50);
    container.setInteractive();
    container.setData('onClick', onClick);
    container.setData('bg', bg);
    container.setData('text', buttonText);

    // Mouse interactions
    container.on('pointerover', () => {
      const index = this.buttons.indexOf(container);
      this.selectButton(index);
    });

    container.on('pointerdown', onClick);

    return container;
  }

  private selectButton(index: number): void {
    if (index < 0 || index >= this.buttons.length) return;
    
    this.selectedButtonIndex = index;

    this.buttons.forEach((button, i) => {
      const bg = button.getData('bg') as Phaser.GameObjects.Graphics;
      const text = button.getData('text') as Phaser.GameObjects.Text;

      if (i === index) {
        // Selected state
        bg.clear();
        bg.fillStyle(0x4A148C, 1);
        bg.fillRoundedRect(-120, -25, 240, 50, 10);
        bg.lineStyle(3, 0xFFB300, 1);
        bg.strokeRoundedRect(-120, -25, 240, 50, 10);
        text.setColor('#FFB300');
        
        // Add glow effect
        this.tweens.add({
          targets: button,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
          ease: 'Power2'
        });
      } else {
        // Normal state
        bg.clear();
        bg.fillStyle(0x3E2723, 0.9);
        bg.fillRoundedRect(-120, -25, 240, 50, 10);
        bg.lineStyle(3, 0xFFB300, 0.8);
        bg.strokeRoundedRect(-120, -25, 240, 50, 10);
        text.setColor('#FFFFFF');
        
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Power2'
        });
      }
    });
  }

  private setupKeyboardNavigation(): void {
    const cursors = this.input.keyboard?.createCursorKeys();
    
    cursors?.up.on('down', () => {
      this.selectButton((this.selectedButtonIndex - 1 + this.buttons.length) % this.buttons.length);
    });

    cursors?.down.on('down', () => {
      this.selectButton((this.selectedButtonIndex + 1) % this.buttons.length);
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      const selectedButton = this.buttons[this.selectedButtonIndex];
      const onClick = selectedButton.getData('onClick') as () => void;
      onClick();
    });
  }

  private addDecorativeElements(): void {
    const { width, height } = this.cameras.main;

    // Add mystical runes in corners
    const runePositions = [
      { x: 60, y: 60, text: '✦' },
      { x: width - 60, y: 60, text: '✧' },
      { x: 60, y: height - 60, text: '✧' },
      { x: width - 60, y: height - 60, text: '✦' }
    ];

    runePositions.forEach((pos, index) => {
      const rune = this.add.text(pos.x, pos.y, pos.text, {
        fontSize: '32px',
        color: '#6A1B9A'
      });
      rune.setOrigin(0.5);

      // Rotating animation
      this.tweens.add({
        targets: rune,
        rotation: Math.PI * 2,
        duration: 8000 + index * 1000,
        repeat: -1
      });
    });
  }

  private startSoloGame(): void {
    this.isMultiplayer = false;
    sessionStorage.setItem('isMultiplayer', 'false');
    this.scene.start('ChemistryLevelSelectScene');
  }

  private startMultiplayerGame(): void {
    this.isMultiplayer = true;
    sessionStorage.setItem('isMultiplayer', 'true');
    
    // Don't resize here - let MainScene handle it
    // Canvas will be resized when entering MainScene
    
    this.scene.start('ChemistryLevelSelectScene');
  }

  private openSettings(): void {
    // TODO: Implement settings scene
    console.log('Settings not yet implemented');
  }

  private showCredits(): void {
    // TODO: Implement credits scene
    console.log('Credits not yet implemented');
  }
} 