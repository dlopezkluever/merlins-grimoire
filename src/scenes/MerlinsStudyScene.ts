import Phaser from 'phaser';

export class MerlinsStudyScene extends Phaser.Scene {
  private chemistryLevel: string = '';
  private subSubject: string = '';
  private skipTimer: number = 3;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timerText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MerlinsStudyScene' });
  }

  init(data: { chemistryLevel: string; subSubject: string }): void {
    this.chemistryLevel = data.chemistryLevel;
    this.subSubject = data.subSubject;
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Create background with parchment color
    this.add.rectangle(0, 0, width, height, 0xF5DEB3).setOrigin(0, 0);
    
    // Add texture overlay for aged paper effect
    const overlay = this.add.graphics();
    overlay.fillStyle(0x8B4513, 0.1);
    overlay.fillRect(0, 0, width, height);

    // Create ornate journal frame
    this.createJournalFrame();

    // Create title
    this.createTitle();

    // Create study content
    this.createStudyContent();

    // Create skip button
    this.createSkipButton();

    // Setup auto-skip timer
    this.setupAutoSkip();

    // Setup keyboard skip
    this.setupKeyboardSkip();
  }

  private createJournalFrame(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();

    // Main journal frame with thick border
    graphics.lineStyle(12, 0x3E2723, 1);
    graphics.strokeRoundedRect(30, 30, width - 60, height - 60, 20);

    // Inner decorative frame
    graphics.lineStyle(6, 0xFFB300, 0.8);
    graphics.strokeRoundedRect(40, 40, width - 80, height - 80, 16);

    // Page edge effects
    graphics.lineStyle(2, 0x5D4037, 0.3);
    for (let i = 0; i < 3; i++) {
      graphics.strokeRoundedRect(50 + i * 3, 50 + i * 3, width - 100 - i * 6, height - 100 - i * 6, 12);
    }

    // Corner decorations
    const corners = [
      { x: 50, y: 50 },
      { x: width - 50, y: 50 },
      { x: 50, y: height - 50 },
      { x: width - 50, y: height - 50 }
    ];

    graphics.fillStyle(0xFFB300, 1);
    corners.forEach(corner => {
      // Ornate corner symbols
      graphics.fillCircle(corner.x, corner.y, 8);
      graphics.lineStyle(2, 0x3E2723, 1);
      graphics.strokeCircle(corner.x, corner.y, 12);
    });
  }

  private createTitle(): void {
    const { width } = this.cameras.main;

    // Main title
    const title = this.add.text(width / 2, 90, "MERLIN'S STUDY", {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      color: '#4A148C',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // Subject subtitle
    const subtitle = this.add.text(width / 2, 140, `${this.chemistryLevel} - ${this.subSubject}`, {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#6A1B9A',
      fontStyle: 'italic'
    });
    subtitle.setOrigin(0.5);

    // Decorative underline
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0xFFB300, 1);
    graphics.strokeLineShape(new Phaser.Geom.Line(width / 2 - 150, 165, width / 2 + 150, 165));
  }

  private createStudyContent(): void {
    const { width, height } = this.cameras.main;

    // Create scroll-like content area
    const contentBg = this.add.graphics();
    contentBg.fillStyle(0xFFFAF0, 0.7);
    contentBg.fillRoundedRect(80, 200, width - 160, height - 320, 20);
    contentBg.lineStyle(3, 0x8B4513, 0.8);
    contentBg.strokeRoundedRect(80, 200, width - 160, height - 320, 20);

    // Placeholder content
    const placeholderText = `PLACEHOLDER CONTENT

Implement a comprehensive review guide here
for each sub-category of a level here, later.

This magical tome shall contain:
• Key concepts for ${this.subSubject}
• Formulas and equations
• Example problems
• Mystical tips from Merlin himself

The actual content will be loaded from
JSON files based on the selected subject.`;

    const content = this.add.text(width / 2, height / 2 - 20, placeholderText, {
      fontFamily: 'Georgia, serif',
      fontSize: '18px',
      color: '#2C1810',
      align: 'center',
      wordWrap: { width: width - 200 },
      lineSpacing: 8
    });
    content.setOrigin(0.5);

    // Add decorative elements
    const leftRune = this.add.text(100, 220, '✦', {
      fontSize: '32px',
      color: '#FFB300'
    });

    const rightRune = this.add.text(width - 100, 220, '✦', {
      fontSize: '32px',
      color: '#FFB300'
    });

    // Animate runes
    this.tweens.add({
      targets: [leftRune, rightRune],
      rotation: Math.PI * 2,
      duration: 4000,
      repeat: -1
    });
  }

  private createSkipButton(): void {
    const { width, height } = this.cameras.main;

    const button = this.add.container(width - 150, height - 80);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x4A148C, 0.9);
    bg.fillRoundedRect(-80, -30, 160, 60, 10);
    bg.lineStyle(3, 0xFFB300, 1);
    bg.strokeRoundedRect(-80, -30, 160, 60, 10);

    // Button text
    const text = this.add.text(0, -10, 'SKIP STUDY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#FFFFFF'
    });
    text.setOrigin(0.5);

    // Timer text
    this.timerText = this.add.text(0, 12, `(${this.skipTimer}s)`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#E0E0E0'
    });
    this.timerText.setOrigin(0.5);

    button.add([bg, text, this.timerText]);
    button.setSize(160, 60);
    button.setInteractive();

    // Hover effect
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x6A1B9A, 1);
      bg.fillRoundedRect(-80, -30, 160, 60, 10);
      bg.lineStyle(3, 0xFFB300, 1);
      bg.strokeRoundedRect(-80, -30, 160, 60, 10);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4A148C, 0.9);
      bg.fillRoundedRect(-80, -30, 160, 60, 10);
      bg.lineStyle(3, 0xFFB300, 1);
      bg.strokeRoundedRect(-80, -30, 160, 60, 10);
    });

    button.on('pointerdown', () => {
      this.skipToGame();
    });
  }

  private setupAutoSkip(): void {
    // Update timer every second
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.skipTimer--;
        if (this.timerText) {
          this.timerText.setText(`(${this.skipTimer}s)`);
        }
        
        if (this.skipTimer <= 0) {
          this.skipToGame();
        }
      },
      repeat: 2 // Repeat 2 times for 3 seconds total
    });
  }

  private setupKeyboardSkip(): void {
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.skipToGame();
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.skipToGame();
    });
  }

  private skipToGame(): void {
    // Clean up timer
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }

    // Pass all accumulated data to MainScene
    const isMultiplayer = sessionStorage.getItem('isMultiplayer') === 'true';
    
    console.log('MerlinsStudyScene: Starting MainScene with data:', {
      chemistryLevel: this.chemistryLevel,
      subSubject: this.subSubject,
      isMultiplayer: isMultiplayer
    });
    
    this.scene.start('MainScene', {
      chemistryLevel: this.chemistryLevel,
      subSubject: this.subSubject,
      isMultiplayer: isMultiplayer
    });
  }
} 