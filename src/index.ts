import 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { ChemistryLevelSelectScene } from './scenes/ChemistryLevelSelectScene';
import { SubSubjectSelectScene } from './scenes/SubSubjectSelectScene';
import { MerlinsStudyScene } from './scenes/MerlinsStudyScene';
import { MainScene } from './scenes/MainScene';
import { MultiplayerScene } from './scenes/MultiplayerScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#2d2d2d',
  scene: [MenuScene, ChemistryLevelSelectScene, SubSubjectSelectScene, MerlinsStudyScene, MainScene, MultiplayerScene],
  // scene: [EnemyTestScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.NONE, // Use NONE to prevent auto-scaling issues
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    expandParent: true, // Allow canvas to expand beyond initial size
    fullscreenTarget: 'game'
  },
  pixelArt: true,
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true
  },
};

new Phaser.Game(config); 