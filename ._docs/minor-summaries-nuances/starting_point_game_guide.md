# Merlin's Grimoire: Comprehensive Game Guide

## Overview

**Merlin's Grimoire** is a top-down dungeon shooter built with Phaser 3 and TypeScript. Players control Merlin, a wizard navigating through procedurally generated dungeons filled with enemies, traps, and treasures. The game combines tactical combat, exploration, and progression mechanics in a classic dungeon-crawler format.

## User Experience

### Game Flow
1. **Start**: Player spawns in the starting room of a 3x3 procedurally generated dungeon
2. **Explore**: Navigate through interconnected rooms using WASD keys
3. **Combat**: Fight various enemy types using auto-targeting weapons
4. **Progress**: Clear rooms of enemies to unlock doors and advance
5. **Objective**: Reach and clear the final room to achieve victory
6. **Death/Victory**: Game over screen with restart option or victory celebration

### Visual & Audio Experience
- **Art Style**: Pixel art with 32x32 tiles and detailed sprite animations
- **Character**: Merlin with idle and running animations (64x64 sprite frames)
- **Enemies**: Distinct visual designs for each enemy type
- **Environment**: Procedurally generated dungeon layouts with walls, floors, and decorative elements
- **UI**: Health bar, weapon display overlay, and game state feedback

## Core Gameplay Mechanics

### Player Character (Merlin)

#### Movement & Controls
- **Movement**: WASD keys for 8-directional movement at 200 pixels/second base speed
- **Alternative Control**: Touch/mouse input support for mobile compatibility
- **Diagonal Movement**: Properly normalized to prevent speed advantages
- **Animation System**: Idle and running states with automatic transitions

#### Health System
- **Health Points**: 50 HP maximum
- **Damage System**: Takes damage from enemy attacks (10-30 damage depending on enemy)
- **Invulnerability Frames**: 1-second immunity after taking damage with visual feedback (red flash)
- **Death Condition**: Game over when health reaches 0

#### Combat System
- **Auto-Targeting**: Automatically fires at the nearest enemy
- **Weapon Management**: Equipped weapon determines damage, fire rate, and bullet type
- **Fire Rate**: Default 500ms cooldown between shots (varies by weapon)
- **Range-Based**: Different weapons have varying effective ranges

### Enemy System

#### Enemy Types & Characteristics

1. **Zombie** (Melee)
   - Health: 40 HP
   - Speed: 120 pixels/second  
   - Damage: 20 HP per attack
   - Behavior: Slow but heavily armored tank unit

2. **Skeleton** (Ranged)
   - Health: 20 HP
   - Speed: 80 pixels/second
   - Weapon: Bow (arrows)
   - Behavior: Keeps distance and shoots arrows

3. **Ninja** (Ranged)
   - Health: 30 HP
   - Speed: 100 pixels/second
   - Weapon: Ninja stars with spin effects
   - Behavior: Fast, evasive ranged attacker

4. **Chomper** (Melee)
   - Health: 30 HP
   - Speed: 150 pixels/second
   - Attack Rate: 300ms (very fast biting)
   - Behavior: Fast melee rushdown unit

5. **Troll** (Melee)
   - Health: 50 HP
   - Speed: 150 pixels/second
   - Special: Drops explosive canons when killed
   - Behavior: Heavy melee unit with environmental hazard

6. **Slug** (Ranged)
   - Health: 10 HP
   - Speed: 50 pixels/second
   - Weapon: Slime shots
   - Behavior: Weak but numerous ranged attacker

#### AI Behavior
- **Pathfinding**: Uses EasyStar.js for intelligent navigation around obstacles
- **Target Acquisition**: Automatically targets and pursues the player
- **Smart Movement**: Can navigate around walls and obstacles
- **Attack Patterns**: Melee enemies charge, ranged enemies maintain distance
- **Stuck Detection**: Alternative movement when pathfinding fails

### Weapon System

#### Player Weapons

1. **Boltspitter** (Starting Weapon)
   - Type: Ranged
   - Damage: 10 HP
   - Fire Rate: 300ms (3.3 shots/second)
   - Color: Gray

2. **Quicklash** (Upgrade)
   - Type: Ranged
   - Damage: 20 HP
   - Fire Rate: 150ms (6.7 shots/second)
   - Color: White

3. **Turret** (Deployable)
   - Type: Deployable ranged weapon
   - Damage: 10 HP per shot
   - Special: Places stationary turret that auto-fires at enemies
   - Strategic placement for area control

#### Weapon Upgrades
- **Collection**: Find weapon upgrade items in rooms
- **Visual Feedback**: Weapon overlay shows current weapon with color coding
- **Progressive Power**: Each upgrade increases damage and/or fire rate

### Dungeon Generation System

#### Maze Structure
- **Grid-Based**: 3x3 grid of interconnected rooms
- **Procedural**: Random maze generation using depth-first search algorithm
- **Room Types**: 
  - Start room (player spawn)
  - Normal rooms (enemy encounters)
  - End room (victory condition)
  - Hallways (connecting passages)

#### Room Mechanics
- **Room States**: Created → Triggered → Spawning → Cleared
- **Enemy Spawning**: Enemies spawn when player enters room
- **Door System**: Doors close when enemies are present, open when room is cleared
- **Progressive Difficulty**: Enemy count and types scale with distance from start

#### Map Layout
- **Tile-Based**: 32x32 pixel tiles for walls, floors, and decorations
- **Size**: Approximately 1440x1440 pixels (45x45 tiles)
- **Navigation**: Connected rooms with doorways in cardinal directions

### Items & Collectibles

#### Health Potions
- **Healing**: Restore 15-25 HP when collected
- **Sources**: 
  - Destroyed barrels (random chance)
  - Specific room spawns
- **Visual**: Red potion sprite

#### Power-ups
- **Speed Boost**: Temporarily increases movement speed
- **Duration**: Timed effect with visual trail particle effect
- **Sources**: Barrel destruction and room completion rewards

#### Destructible Props
- **Barrels**: 
  - Health: Can be destroyed by player bullets
  - Contents: Random chance for potions or power-ups
  - Visual Feedback: Hover highlighting, destruction animation
  - Strategic Element: Breaking barrels is risk/reward mechanic

### Progression & Objectives

#### Win Condition
- **Primary Goal**: Reach and clear the final room (farthest from start)
- **Room Clearing**: Defeat all enemies in the end room
- **Victory Screen**: "VICTORY!" message with option to play again

#### Failure Condition
- **Death**: When player health reaches 0
- **Game Over Screen**: "GAME OVER" message with restart button
- **Restart Mechanism**: R key or clicking restart button

### Technical Features

#### Performance Optimizations
- **Object Pooling**: Bullets and enemies use pooled objects for efficiency
- **Culling**: Layers use padding for off-screen culling
- **Physics**: Arcade physics system for collision detection
- **Rendering**: Pixel-perfect rendering with anti-aliasing disabled

#### Input Systems
- **Keyboard**: WASD movement, R for restart, F for fullscreen
- **Mouse**: Aiming and targeting (though auto-targeting is primary)
- **Touch**: Mobile-compatible touch controls
- **Fullscreen**: Toggle fullscreen mode

#### Game Architecture
- **Scene Management**: Single MainScene handles entire game loop
- **Manager Pattern**: Separate managers for enemies, weapons, items, rooms, barrels
- **Event System**: Phaser event system for component communication
- **Factory Pattern**: Enemy and weapon creation through factory classes

## Game Balance & Difficulty

### Difficulty Scaling
- **Room-Based**: Later rooms spawn more dangerous enemy combinations
- **Enemy Variety**: Mix of melee and ranged enemies creates tactical challenges
- **Resource Management**: Limited healing requires careful health management
- **Weapon Progression**: Player power increases through weapon upgrades

### Strategic Elements
- **Positioning**: Player must manage distance from melee vs ranged enemies
- **Resource Collection**: Risk vs reward in barrel destruction
- **Room Clearing**: Must defeat all enemies to progress
- **Weapon Selection**: Different weapons suit different enemy compositions

## Current State & Features

### Implemented Systems
- ✅ Complete player movement and combat
- ✅ Six distinct enemy types with unique behaviors
- ✅ Procedural dungeon generation
- ✅ Weapon system with upgrades
- ✅ Health and damage systems
- ✅ Item collection and power-ups
- ✅ Room progression mechanics
- ✅ Game over/victory conditions
- ✅ Visual effects and animations

### Technical Stack
- **Framework**: Phaser 3.70.0
- **Language**: TypeScript 5.2.2
- **Build Tool**: Vite 6.2.6
- **Pathfinding**: EasyStar.js 0.4.4
- **Assets**: Custom pixel art sprites and tileset

This creates a complete action-RPG experience where players must use skill, strategy, and resource management to successfully navigate through the procedurally generated dungeon and achieve victory. 