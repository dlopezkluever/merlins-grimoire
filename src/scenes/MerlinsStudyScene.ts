import Phaser from 'phaser';

interface StudyLesson {
  title: string;
  content: string;
}

interface StudyData {
  [level: string]: {
    [subject: string]: StudyLesson;
  };
}

export class MerlinsStudyScene extends Phaser.Scene {
  private chemistryLevel: string = '';
  private subSubject: string = '';
  private studyData: StudyData = {};
  private contentContainer?: Phaser.GameObjects.Container;
  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'MerlinsStudyScene' });
  }

  init(data: { chemistryLevel: string; subSubject: string }): void {
    this.chemistryLevel = data.chemistryLevel;
    this.subSubject = data.subSubject;
    this.scrollY = 0;
    this.loadStudyData();
  }

  preload(): void {
    // Load the journal background
    this.load.image('journalBg', 'assets/Merlins-Journal-bg.png');
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Add journal background
    const bg = this.add.image(0, 0, 'journalBg');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(width, height);

    // Create scrollable content container
    this.createScrollableContent();

    // Create skip button
    this.createSkipButton();

    // Setup keyboard controls
    this.setupKeyboardControls();
  }

  private loadStudyData(): void {
    // Embedded study data (matching the JSON structure)
    this.studyData = {
      "High School Chem 1": {
        "Reaction Types": {
          "title": "Chemical Reaction Types",
          "content": "Welcome, young alchemist!\n\nIn this realm, you shall master the five fundamental reaction types:\n\n• Synthesis: When elements unite (A + B → AB)\n• Decomposition: When compounds break apart (AB → A + B)\n• Single Replacement: When one element takes another's place\n• Double Replacement: When partners exchange\n• Combustion: When substances burn with oxygen\n\nRemember: Balance is key to all magical transformations!\n\nExamples:\n• 2H₂ + O₂ → 2H₂O (Synthesis)\n• 2H₂O → 2H₂ + O₂ (Decomposition)\n• Zn + CuSO₄ → ZnSO₄ + Cu (Single Replacement)\n• AgNO₃ + NaCl → AgCl + NaNO₃ (Double Replacement)\n• CH₄ + 2O₂ → CO₂ + 2H₂O (Combustion)"
        },
        "Gas Reactions": {
          "title": "The Mysteries of Gases",
          "content": "Behold the ethereal nature of gases!\n\nGas laws govern the invisible forces:\n\n• Boyle's Law: Pressure and volume dance inversely (PV = k)\n• Charles' Law: Temperature and volume rise together (V/T = k)\n• Gay-Lussac's Law: Pressure and temperature unite (P/T = k)\n• Avogadro's Principle: Equal volumes, equal molecules\n• Ideal Gas Law: PV = nRT\n\nMaster these principles to control the very air!\n\nApplications:\n• Breathing and lungs follow Boyle's Law\n• Hot air balloons use Charles' Law\n• Pressure cookers apply Gay-Lussac's Law\n• Standard Temperature and Pressure (STP): 0°C, 1 atm"
        },
        "Basic Stoichiometry": {
          "title": "The Art of Chemical Calculations",
          "content": "Learn the ancient art of measuring chemical quantities!\n\nKey Concepts:\n\n• Mole: Avogadro's number (6.022 × 10²³) of particles\n• Molar Mass: Mass of one mole of substance (g/mol)\n• Stoichiometric Ratios: Relationships from balanced equations\n• Limiting Reactant: The ingredient that runs out first\n• Theoretical Yield: Maximum possible product\n• Percent Yield: Actual yield / Theoretical yield × 100%\n\nMaster these calculations to predict potion outcomes!\n\nExample Problem:\n2H₂ + O₂ → 2H₂O\nIf you have 4 moles H₂ and 1 mole O₂, how much H₂O can you make?\nAnswer: 2 moles H₂O (limited by O₂)"
        },
        "Random": {
          "title": "The Chaos Curriculum",
          "content": "Prepare for anything, young wizard!\n\nIn this challenge, all knowledge converges:\n\n• Any reaction type may appear\n• All principles are fair game\n• Quick thinking is essential\n• Trust your training\n\nMay fortune favor the prepared mind!\n\nReview all concepts:\n• Balancing equations\n• Reaction types\n• Gas laws\n• Stoichiometry\n• Periodic trends\n• Chemical bonding\n• Chemical bonding\n\nStay alert and ready for surprises!"
        }
      },
      "Organic Chemistry": {
        "Functional Groups": {
          "title": "The Building Blocks of Life",
          "content": "Discover the mystical functional groups!\n\nMajor Functional Groups:\n\n• Alkanes: Single bonds only (C-C, C-H)\n• Alkenes: Double bonds (C=C)\n• Alkynes: Triple bonds (C≡C)\n• Alcohols: Hydroxyl group (-OH)\n• Aldehydes: Carbonyl at end (-CHO)\n• Ketones: Carbonyl in middle (C=O)\n• Carboxylic Acids: -COOH group\n• Esters: -COO- linkage\n• Amines: Nitrogen-containing (-NH₂)\n• Ethers: Oxygen bridge (R-O-R)\n\nEach group has unique properties and reactions.\n\nNaming Patterns:\n• -ane (alkanes), -ene (alkenes), -yne (alkynes)\n• -ol (alcohols), -al (aldehydes), -one (ketones)\n• -oic acid (carboxylic acids)"
        },
        "Basic Organic Reactions": {
          "title": "Organic Alchemy",
          "content": "The magic of carbon compounds!\n\nOrganic reactions shape life itself:\n\n• Addition: Bonds break, new ones form (alkenes → alkanes)\n• Substitution: One group replaces another\n• Elimination: Creating double bonds (alcohols → alkenes)\n• Oxidation: Adding oxygen or removing hydrogen\n• Reduction: Adding hydrogen or removing oxygen\n• Polymerization: Small molecules join to form chains\n\nReaction Types:\n• Combustion: Organic + O₂ → CO₂ + H₂O\n• Hydration: Alkene + H₂O → Alcohol\n• Dehydration: Alcohol → Alkene + H₂O\n• Esterification: Acid + Alcohol → Ester + H₂O\n\nCarbon chains hold infinite possibilities!\n\nExample: CH₂=CH₂ + H₂O → CH₃CH₂OH (Hydration)"
        },
        "Stereochemistry": {
          "title": "The Dance of Molecular Shapes",
          "content": "Explore the three-dimensional world of molecules!\n\nKey Concepts:\n\n• Chirality: Molecules with handedness\n• Enantiomers: Non-superimposable mirror images\n• Optical Activity: Rotation of polarized light\n• R/S Configuration: Systematic naming of stereocenters\n• E/Z Isomerism: Geometric isomers of alkenes\n• Fischer Projections: 2D representations of 3D molecules\n\nImportance:\n• Drug activity often depends on stereochemistry\n• One enantiomer may be beneficial, the other harmful\n• Enzymes are highly stereoselective\n\nRules:\n• Assign priorities by atomic number\n• R = clockwise, S = counterclockwise\n• E = opposite sides, Z = same side\n\nThe shape of molecules determines their magical properties!"
        },
        "Random": {
          "title": "The Organic Synthesis Challenge",
          "content": "Master the art of organic transformation!\n\nPrepare for comprehensive organic chemistry:\n\n• Functional group identification\n• Reaction mechanisms\n• Stereochemistry problems\n• Synthesis planning\n• Spectroscopy interpretation\n\nSkills to master:\n• Recognizing reaction patterns\n• Predicting products\n• Designing synthetic routes\n• Understanding mechanisms\n\nKey strategies:\n• Work backwards from target molecule\n• Identify key bond formations\n• Consider functional group compatibility\n• Plan protecting group strategies\n\nOrganic synthesis is both art and science!"
        }
      },
      "Biochemistry": {
        "Amino Acids and Proteins": {
          "title": "The Molecules of Life",
          "content": "Discover the building blocks of living beings!\n\nAmino Acids:\n\n• 20 standard amino acids\n• Essential vs. non-essential\n• Structure: amino group, carboxyl group, side chain\n• Classification by side chain properties:\n  - Polar (hydrophilic)\n  - Nonpolar (hydrophobic)\n  - Charged (positive/negative)\n  - Special (glycine, proline, cysteine)\n\nProtein Structure:\n• Primary: amino acid sequence\n• Secondary: α-helices and β-sheets\n• Tertiary: 3D folding\n• Quaternary: multiple protein subunits\n\nProtein Functions:\n• Enzymes (catalysis)\n• Structure (collagen, keratin)\n• Transport (hemoglobin)\n• Defense (antibodies)\n• Hormones (insulin)\n\nProtein folding determines function!"
        },
        "Enzyme Kinetics": {
          "title": "The Catalysts of Life",
          "content": "Master the magic of biological catalysts!\n\nEnzyme Properties:\n\n• Lower activation energy\n• Increase reaction rate\n• Remain unchanged after reaction\n• Highly specific for substrates\n• Activity affected by temperature and pH\n\nMichaelis-Menten Kinetics:\n• Km: substrate concentration at ½ Vmax\n• Vmax: maximum reaction velocity\n• kcat: turnover number\n• kcat/Km: catalytic efficiency\n\nEnzyme Inhibition:\n• Competitive: competes with substrate\n• Non-competitive: binds at different site\n• Uncompetitive: binds only to enzyme-substrate complex\n• Irreversible: permanent modification\n\nFactors Affecting Enzyme Activity:\n• Temperature (optimal ~37°C for human enzymes)\n• pH (each enzyme has optimal pH)\n• Substrate concentration\n• Presence of inhibitors or activators"
        },
        "Metabolic Pathways": {
          "title": "The Rivers of Cellular Energy",
          "content": "Navigate the complex networks of cellular chemistry!\n\nMajor Pathways:\n\n• Glycolysis: Glucose → Pyruvate (cytoplasm)\n• Citric Acid Cycle: Pyruvate → CO₂ (mitochondria)\n• Electron Transport: NADH → ATP (mitochondria)\n• Gluconeogenesis: Non-glucose → Glucose\n• Fatty Acid Oxidation: Fats → Acetyl-CoA\n• Fatty Acid Synthesis: Acetyl-CoA → Fats\n\nKey Molecules:\n• ATP: Universal energy currency\n• NADH/NAD+: Electron carriers\n• FADH₂/FAD: Electron carriers\n• Acetyl-CoA: Central metabolite\n• Glucose: Primary fuel\n\nRegulation:\n• Allosteric control\n• Covalent modification\n• Enzyme induction/repression\n• Compartmentalization\n\nMetabolism is the chemistry of life itself!"
        },
        "Random": {
          "title": "The Biochemical Mastery Test",
          "content": "Prove your command of life's chemistry!\n\nComprehensive biochemistry knowledge:\n\n• Protein structure and function\n• Enzyme mechanisms and kinetics\n• Metabolic pathway integration\n• Membrane structure and transport\n• DNA/RNA structure and function\n• Signal transduction\n• Regulation mechanisms\n\nSkills to demonstrate:\n• Connecting structure to function\n• Understanding regulatory mechanisms\n• Predicting metabolic effects\n• Analyzing experimental data\n• Integrating multiple pathways\n\nAreas of focus:\n• Thermodynamics of biological processes\n• Enzyme-substrate interactions\n• Metabolic flux control\n• Cellular signaling cascades\n• Genetic information flow\n\nBiochemistry unifies all life sciences!"
        }
      }
    };
  }

  private createScrollableContent(): void {
    const { width, height } = this.cameras.main;

    // Create a graphics object for the content area mask
    const mask = this.add.graphics();
    mask.fillRect(60, 100, width - 120, height - 200);

    // Create container for scrollable content
    this.contentContainer = this.add.container(0, 0);
    this.contentContainer.setMask(mask.createGeometryMask());

    // Get the lesson data
    const lesson = this.studyData[this.chemistryLevel]?.[this.subSubject];
    
    if (lesson) {
      // Create title
      const title = this.add.text(width / 2, 120, lesson.title.toUpperCase(), {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#000000',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width - 140 }
      });
      title.setOrigin(0.5, 0);
      this.contentContainer.add(title);

      // Create content text
      const content = this.add.text(80, 180, lesson.content, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#000000',
        align: 'left',
        wordWrap: { width: width - 160 },
        lineSpacing: 6
      });
      content.setOrigin(0, 0);
      this.contentContainer.add(content);

      // Calculate max scroll based on content height
      const contentHeight = content.height + 200; // 200 for title and spacing
      const viewHeight = height - 200; // Available viewing area
      this.maxScrollY = Math.max(0, contentHeight - viewHeight);

      // Add scroll indicators if content is scrollable
      if (this.maxScrollY > 0) {
        const scrollHint = this.add.text(width / 2, height - 120, 
          'Use ARROW KEYS or MOUSE WHEEL to scroll', {
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          color: '#555555',
          align: 'center'
        });
        scrollHint.setOrigin(0.5);
      }
    } else {
      // Fallback content
      const errorText = this.add.text(width / 2, height / 2, 
        `Study material for ${this.chemistryLevel} - ${this.subSubject} not found.`, {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#000000',
        align: 'center',
        wordWrap: { width: width - 140 }
      });
      errorText.setOrigin(0.5);
      this.contentContainer.add(errorText);
    }
  }

  private createSkipButton(): void {
    const { width, height } = this.cameras.main;

    const button = this.add.container(width - 120, height - 60);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x4A148C, 0.9);
    bg.fillRoundedRect(-70, -25, 140, 50, 8);
    bg.lineStyle(2, 0xFFB300, 1);
    bg.strokeRoundedRect(-70, -25, 140, 50, 8);

    // Button text
    const text = this.add.text(0, 0, 'START QUEST', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#FFFFFF'
    });
    text.setOrigin(0.5);

    button.add([bg, text]);
    button.setSize(140, 50);
    button.setInteractive();

    // Hover effect
    button.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x6A1B9A, 1);
      bg.fillRoundedRect(-70, -25, 140, 50, 8);
      bg.lineStyle(2, 0xFFB300, 1);
      bg.strokeRoundedRect(-70, -25, 140, 50, 8);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4A148C, 0.9);
      bg.fillRoundedRect(-70, -25, 140, 50, 8);
      bg.lineStyle(2, 0xFFB300, 1);
      bg.strokeRoundedRect(-70, -25, 140, 50, 8);
    });

    button.on('pointerdown', () => {
      this.startGame();
    });
  }

  private setupKeyboardControls(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    
    this.cursors?.up.on('down', () => {
      this.scroll(-30);
    });

    this.cursors?.down.on('down', () => {
      this.scroll(30);
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.startGame();
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startGame();
    });

    // Mouse wheel scrolling
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.scroll(deltaY * 0.5);
    });
  }

  private scroll(deltaY: number): void {
    if (!this.contentContainer) return;

    this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY, 0, this.maxScrollY);
    this.contentContainer.setY(-this.scrollY);
  }

  private startGame(): void {
    // Pass all accumulated data to appropriate scene
    const isMultiplayer = sessionStorage.getItem('isMultiplayer') === 'true';
    
    // Choose the appropriate scene based on multiplayer flag
    const sceneKey = isMultiplayer ? 'MultiplayerScene' : 'MainScene';
    
    this.scene.start(sceneKey, {
      chemistryLevel: this.chemistryLevel,
      subSubject: this.subSubject
    });
  }
} 