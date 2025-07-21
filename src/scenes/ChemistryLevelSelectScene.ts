import Phaser from 'phaser';

export class ChemistryLevelSelectScene extends Phaser.Scene {
  private selectedLevelIndex: number = 0;
  private levelButtons: Phaser.GameObjects.Container[] = [];
  private levels = [
    { 
      name: 'High School Chem 1',
      description: 'Basic chemistry fundamentals',
      color: 0x4CAF50 
    },
    { 
      name: 'Organic Chemistry',
      description: 'Carbon-based compounds',
      color: 0xFF9800 
    },
    { 
      name: 'Biochemistry',
      description: 'Chemistry of life',
      color: 0x9C27B0 
    }
  ];

  constructor() {
    super({ key: 'ChemistryLevelSelectScene' });
  }

  preload(): void {
    // Load background image
    this.load.image('menuBg', 'assets/menu-bgs.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Create background
    const bg = this.add.image(0, 0, 'menuBg');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(width, height);

    // Create ornate frame
    this.createOrnateFrame();

    // Create title
    this.createTitle();

    // Create level selection cards
    this.createLevelCards();

    // Create navigation instructions
    this.createInstructions();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();
  }

  private createOrnateFrame(): void {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();

    // Outer frame
    graphics.lineStyle(8, 0x5D4037, 1);
    graphics.strokeRoundedRect(20, 20, width - 40, height - 40, 16);

    // Inner frame
    graphics.lineStyle(4, 0xFFB300, 0.8);
    graphics.strokeRoundedRect(30, 30, width - 60, height - 60, 12);
  }

  private createTitle(): void {
    const { width } = this.cameras.main;

    const title = this.add.text(width / 2, 80, 'SELECT THY ACADEMIC PROWESS', {
      fontFamily: 'Arial, serif',
      fontSize: '36px',
      color: '#FFB300',
      stroke: '#2A1A4A',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(width / 2, 120, 'Choose wisely, young alchemist', {
      fontFamily: 'Arial, serif',
      fontSize: '20px',
      color: '#00BCD4'
    });
    subtitle.setOrigin(0.5);
  }

  private createLevelCards(): void {
    const { width, height } = this.cameras.main;
    const cardWidth = 180; // Reduced from 220
    const cardHeight = 240; // Reduced from 280
    const spacing = 40;
    const totalWidth = (cardWidth * this.levels.length) + (spacing * (this.levels.length - 1));
    const startX = (width - totalWidth) / 2 + cardWidth / 2;
    const cardY = height / 2;

    this.levels.forEach((level, index) => {
      const x = startX + index * (cardWidth + spacing);
      const card = this.createLevelCard(x, cardY, cardWidth, cardHeight, level, index);
      this.levelButtons.push(card);
    });

    // Select first card by default
    this.selectLevel(0);
  }

  private createLevelCard(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    level: any,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x3E2723, 0.9);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 15);
    bg.lineStyle(4, level.color, 0.8);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 15);

    // Card icon (placeholder - could be replaced with actual icons)
    const iconBg = this.add.graphics();
    iconBg.fillStyle(level.color, 0.3);
    iconBg.fillCircle(0, -40, 30); // Reduced from 40
    iconBg.lineStyle(3, level.color, 1);
    iconBg.strokeCircle(0, -40, 30);

    // Icon symbol
    const symbols = ['⚗️', '🧪', '🧬'];
    const icon = this.add.text(0, -40, symbols[index], {
      fontSize: '24px' // Reduced from 32px
    });
    icon.setOrigin(0.5);

    // Level name
    const nameText = this.add.text(0, 15, level.name.toUpperCase(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px', // Reduced from 20px
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: width - 30 }
    });
    nameText.setOrigin(0.5);

    // Level description
    const descText = this.add.text(0, 50, level.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px', // Reduced from 14px
      color: '#E0E0E0',
      align: 'center',
      wordWrap: { width: width - 30 }
    });
    descText.setOrigin(0.5);

    container.add([bg, iconBg, icon, nameText, descText]);
    container.setSize(width, height);
    container.setInteractive();
    container.setData('bg', bg);
    container.setData('iconBg', iconBg);
    container.setData('levelData', level);

    // Mouse interactions
    container.on('pointerover', () => {
      this.selectLevel(index);
    });

    container.on('pointerdown', () => {
      this.confirmSelection();
    });

    return container;
  }

  private selectLevel(index: number): void {
    if (index < 0 || index >= this.levelButtons.length) return;
    
    this.selectedLevelIndex = index;

    this.levelButtons.forEach((card, i) => {
      const bg = card.getData('bg') as Phaser.GameObjects.Graphics;
      const iconBg = card.getData('iconBg') as Phaser.GameObjects.Graphics;
      const levelData = card.getData('levelData');
      const cardWidth = 180;
      const cardHeight = 240;

      if (i === index) {
        // Selected state
        bg.clear();
        bg.fillStyle(0x4A148C, 1);
        bg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 15);
        bg.lineStyle(5, levelData.color, 1);
        bg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 15);

        // Animate selection
        this.tweens.add({
          targets: card,
          scaleX: 1.05,
          scaleY: 1.05,
          y: card.y - 10,
          duration: 200,
          ease: 'Power2'
        });

        // Add glow effect
        iconBg.clear();
        iconBg.fillStyle(levelData.color, 0.5);
        iconBg.fillCircle(0, -40, 35);
        iconBg.lineStyle(4, levelData.color, 1);
        iconBg.strokeCircle(0, -40, 35);
      } else {
        // Normal state
        bg.clear();
        bg.fillStyle(0x3E2723, 0.9);
        bg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 15);
        bg.lineStyle(4, levelData.color, 0.8);
        bg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 15);

        this.tweens.add({
          targets: card,
          scaleX: 1,
          scaleY: 1,
          y: this.cameras.main.height / 2,
          duration: 200,
          ease: 'Power2'
        });

        iconBg.clear();
        iconBg.fillStyle(levelData.color, 0.3);
        iconBg.fillCircle(0, -40, 30);
        iconBg.lineStyle(3, levelData.color, 1);
        iconBg.strokeCircle(0, -40, 30);
      }
    });
  }

  private createInstructions(): void {
    const { width, height } = this.cameras.main;

    const instructions = this.add.text(width / 2, height - 60, 
      'Use ARROW KEYS to select • ENTER to confirm', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#00BCD4'
    });
    instructions.setOrigin(0.5);
  }

  private setupKeyboardNavigation(): void {
    const cursors = this.input.keyboard?.createCursorKeys();
    
    cursors?.left.on('down', () => {
      this.selectLevel((this.selectedLevelIndex - 1 + this.levels.length) % this.levels.length);
    });

    cursors?.right.on('down', () => {
      this.selectLevel((this.selectedLevelIndex + 1) % this.levels.length);
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.confirmSelection();
    });
  }

  private confirmSelection(): void {
    const selectedLevel = this.levels[this.selectedLevelIndex];
    sessionStorage.setItem('chemistryLevel', selectedLevel.name);
    
    // Pass data to next scene
    this.scene.start('SubSubjectSelectScene', { 
      chemistryLevel: selectedLevel.name 
    });
  }
} 