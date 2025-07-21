import Phaser from 'phaser';

export class SubSubjectSelectScene extends Phaser.Scene {
  private chemistryLevel: string = '';
  private selectedSubjectIndex: number = 0;
  private subjectButtons: Phaser.GameObjects.Container[] = [];
  private subjects: string[] = [];

  constructor() {
    super({ key: 'SubSubjectSelectScene' });
  }

  init(data: { chemistryLevel: string }): void {
    this.chemistryLevel = data.chemistryLevel;
  }

  preload(): void {
    // Load background image
    this.load.image('menuBg', 'assets/menu-bgs.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Reset state
    this.subjectButtons = [];
    this.selectedSubjectIndex = 0;

    // Create background
    const bg = this.add.image(0, 0, 'menuBg');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(width, height);

    // Create ornate frame
    this.createOrnateFrame();

    // Create title
    this.createTitle();

    // Get subjects based on chemistry level
    this.subjects = this.getSubjectsForLevel();

    // Create subject buttons
    this.createSubjectButtons();

    // Create navigation instructions
    this.createInstructions();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Add back button
    this.createBackButton();
  }

  private getSubjectsForLevel(): string[] {
    const subjectMap: { [key: string]: string[] } = {
      'High School Chem 1': [
        'Reaction Types',
        'Gas Reactions', 
        'Basic Stoichiometry',
        'Random'
      ],
      'Organic Chemistry': [
        'Functional Groups',
        'Basic Organic Reactions',
        'Stereochemistry',
        'Random'
      ],
      'Biochemistry': [
        'Amino Acids and Proteins',
        'Enzyme Kinetics',
        'Metabolic Pathways',
        'Random'
      ]
    };

    return subjectMap[this.chemistryLevel] || ['Random'];
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

    const title = this.add.text(width / 2, 80, 'CHOOSE THY FOCUS', {
      fontFamily: 'Arial, serif',
      fontSize: '36px',
      color: '#FFB300',
      stroke: '#2A1A4A',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(width / 2, 120, `${this.chemistryLevel} - Select a sub-subject`, {
      fontFamily: 'Arial, serif',
      fontSize: '20px',
      color: '#00BCD4'
    });
    subtitle.setOrigin(0.5);
  }

  private createSubjectButtons(): void {
    const { width, height } = this.cameras.main;
    const buttonWidth = 400;
    const buttonHeight = 60;
    const spacing = 20;
    const totalHeight = (buttonHeight * this.subjects.length) + (spacing * (this.subjects.length - 1));
    const startY = (height - totalHeight) / 2 + buttonHeight / 2;

    this.subjects.forEach((subject, index) => {
      const y = startY + index * (buttonHeight + spacing);
      const button = this.createSubjectButton(width / 2, y, buttonWidth, buttonHeight, subject, index);
      this.subjectButtons.push(button);
    });

    // Select first button by default
    this.selectSubject(0);
  }

  private createSubjectButton(
    x: number,
    y: number,
    width: number,
    height: number,
    subject: string,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const isRandom = subject === 'Random';

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(isRandom ? 0x9C27B0 : 0x3E2723, 0.9);
    bg.fillRoundedRect(-width/2, -height/2, width, height, 10);
    bg.lineStyle(3, 0xFFB300, 0.8);
    bg.strokeRoundedRect(-width/2, -height/2, width, height, 10);

    // Button text
    const text = this.add.text(0, 0, subject.toUpperCase(), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#FFFFFF'
    });
    text.setOrigin(0.5);

    // Add icon for random
    if (isRandom) {
      const icon = this.add.text(-width/2 + 40, 0, '🎲', {
        fontSize: '24px'
      });
      icon.setOrigin(0.5);
      container.add(icon);
    }

    container.add([bg, text]);
    container.setSize(width, height);
    container.setInteractive();
    container.setData('bg', bg);
    container.setData('text', text);
    container.setData('subject', subject);
    container.setData('isRandom', isRandom);

    // Mouse interactions
    container.on('pointerover', () => {
      this.selectSubject(index);
    });

    container.on('pointerdown', () => {
      this.confirmSelection();
    });

    return container;
  }

  private selectSubject(index: number): void {
    if (index < 0 || index >= this.subjectButtons.length) return;
    
    this.selectedSubjectIndex = index;

    this.subjectButtons.forEach((button, i) => {
      const bg = button.getData('bg') as Phaser.GameObjects.Graphics;
      const text = button.getData('text') as Phaser.GameObjects.Text;
      const isRandom = button.getData('isRandom') as boolean;

      if (i === index) {
        // Selected state
        bg.clear();
        bg.fillStyle(0x4A148C, 1);
        bg.fillRoundedRect(-200, -30, 400, 60, 10);
        bg.lineStyle(3, 0xFFB300, 1);
        bg.strokeRoundedRect(-200, -30, 400, 60, 10);
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
        bg.fillStyle(isRandom ? 0x9C27B0 : 0x3E2723, 0.9);
        bg.fillRoundedRect(-200, -30, 400, 60, 10);
        bg.lineStyle(3, 0xFFB300, 0.8);
        bg.strokeRoundedRect(-200, -30, 400, 60, 10);
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

  private createInstructions(): void {
    const { width, height } = this.cameras.main;

    const instructions = this.add.text(width / 2, height - 60,
      'Use ARROW KEYS to select • ENTER to confirm • ESC to return', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#00BCD4'
    });
    instructions.setOrigin(0.5);
  }

  private createBackButton(): void {
    const backButton = this.add.text(60, 60, '← BACK', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#FFB300'
    });
    backButton.setOrigin(0.5);
    backButton.setInteractive();

    backButton.on('pointerover', () => {
      backButton.setScale(1.1);
      backButton.setColor('#FFFFFF');
    });

    backButton.on('pointerout', () => {
      backButton.setScale(1);
      backButton.setColor('#FFB300');
    });

    backButton.on('pointerdown', () => {
      this.scene.start('ChemistryLevelSelectScene');
    });
  }

  private setupKeyboardNavigation(): void {
    const cursors = this.input.keyboard?.createCursorKeys();
    
    cursors?.up.on('down', () => {
      this.selectSubject((this.selectedSubjectIndex - 1 + this.subjects.length) % this.subjects.length);
    });

    cursors?.down.on('down', () => {
      this.selectSubject((this.selectedSubjectIndex + 1) % this.subjects.length);
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.confirmSelection();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('ChemistryLevelSelectScene');
    });
  }

  private confirmSelection(): void {
    const selectedSubject = this.subjects[this.selectedSubjectIndex];
    sessionStorage.setItem('subSubject', selectedSubject);
    
    // Pass accumulated data to next scene
    this.scene.start('MerlinsStudyScene', {
      chemistryLevel: this.chemistryLevel,
      subSubject: selectedSubject
    });
  }
} 