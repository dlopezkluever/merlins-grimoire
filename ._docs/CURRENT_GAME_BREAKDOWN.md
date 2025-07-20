# Merlin's Grimoire: Complete Current Game Experience Breakdown

## Overview

**Merlin's Grimoire** is a top-down dungeon crawler built with Phaser 3 and TypeScript. Players control Merlin, a wizard navigating through procedurally generated dungeons filled with enemies, treasure, and magical upgrades. The game combines tactical movement, automatic combat, exploration, and progression mechanics in a classic dungeon-crawler format.

## Core Game Flow

### 1. **Game Start**
- Player spawns as Merlin in the starting room of a **5x5 procedurally generated maze** (25 rooms total)
- Starting equipment: Basic **Boltspitter** wand with 10 damage and 300ms fire rate
- Starting health: **50 HP maximum**
- Game world: **800x600 pixel base resolution** that scales to fit screen

### 2. **Primary Objective**
- **Win Condition**: Find and touch the **animated treasure** located in a goal room
- **Goal Room Selection**: Randomly placed at 60%-100% of maximum distance from start (minimum 2 rooms away)
- **Treasure Animation**: 8-frame animated sequence when discovered
- **Victory Sequence**: "TREASURE DISCOVERED!" screen with "Pleased with Thou, King Arthur Shalt be!" subtitle

### 3. **Secondary Objective**
- **Alternative Win**: Clear all enemies in the designated end room (separate from treasure room)
- **Room Clearing**: Defeat all spawned enemies to mark room as "cleared"

### 4. **Failure Condition**
- **Death**: Game over when Merlin's health reaches 0
- **Game Over Screen**: "GAME OVER" with restart functionality

---

## Character & Movement System

### **Merlin (Player Character)**
- **Sprite**: 64x64 pixel wizard with idle and running animations
- **Base Movement Speed**: 200 pixels/second
- **Controls**: 
  - **WASD keys** for 8-directional movement
  - **Touch/Mouse support** for mobile compatibility
  - **Diagonal movement** properly normalized (no speed advantage)
- **Physics**: Smooth acceleration/deceleration with 85% friction when no input detected
- **Animation States**: 
  - `merlin-idle-anim` when stationary
  - `merlin-run-anim` when moving
- **Visual Direction**: Sprite flips horizontally based on movement direction

---

## Combat System (Automatic)

### **Auto-Targeting Mechanics**
- **Targeting**: Automatically aims at the **nearest enemy** within range
- **Fire Rate**: Varies by equipped wand (default 500ms cooldown between shots)
- **Range**: Unlimited range for most wands
- **Projectile Physics**: Spells travel in straight lines with collision detection
- **No Manual Aiming**: Player only controls movement; combat is fully automated

### **Damage System**
- **Player Damage Output**: Varies by equipped wand (8-35 damage per shot)
- **Player Health**: 50 HP maximum, regenerates through potions only
- **Invulnerability Frames**: 1-second immunity after taking damage with red flash effect
- **Death**: Player becomes inactive when health reaches 0

---

## Weapon (Wand) System

### **Starting Weapon**
**Boltspitter** (Default)
- Type: Ranged
- Damage: 10 HP per shot
- Fire Rate: 300ms (3.3 shots per second)
- Projectile: Gray spell bolt
- Sprite: `plain-spell-1`

### **Weapon Upgrades** (Found in rooms)

#### **RAPIDWAND**
- Type: Ranged
- Damage: 8 HP per shot
- Fire Rate: 200ms (5 shots per second) - **Highest fire rate**
- Visual: Green tinted wand icon
- Strategy: High damage-per-second through rapid fire

#### **ELDERWAND**
- Type: Ranged  
- Damage: 35 HP per shot - **Highest damage**
- Fire Rate: 600ms (1.67 shots per second)
- Visual: Gold tinted wand icon
- Strategy: High per-shot damage, slower but powerful

#### **SPELLBOT (Deployable)**
- Type: Deployable turret
- Damage: 10 HP per shot
- Special: Places stationary auto-turret that targets enemies
- Targeting: Finds nearest enemy every 200ms
- Lifespan: Respawns periodically until room is cleared
- Strategy: Area control and defensive positioning

### **Weapon Upgrade System**
- **Collection**: Find glowing wand upgrade items scattered in rooms
- **Swapping**: Walk over upgrade to automatically swap current wand
- **Visual Feedback**: 
  - Wand Overlay in bottom-right shows current weapon
  - Color-coded display (Green=Rapid, Gold=Elder, White=Deployable)
  - Shows damage and attack rate stats
- **Distribution**: ~30% of rooms contain wand upgrades (max 4 total)

---

## Enemy System (6 Enemy Types)

### **Enemy Types & Stats**

#### **1. DUMBDUMB (Zombie) - Melee Tank**
- **Health**: 40 HP
- **Speed**: 120 pixels/second
- **Damage**: 20 HP per attack
- **Attack Rate**: 1000ms cooldown
- **Weapon**: STRIKE (melee)
- **Behavior**: Slow but heavily armored, charges directly at player
- **Visual**: 32x32 zombie sprite with walking animation

#### **2. DRAUGR (Skeleton) - Ranged Archer** 
- **Health**: 20 HP
- **Speed**: 80 pixels/second  
- **Damage**: 15 HP per shot
- **Attack Rate**: 667ms (1.5 shots/second)
- **Weapon**: BOW (shoots arrows)
- **Behavior**: Maintains distance, shoots arrows at player
- **Visual**: 16x32 skeleton sprite

#### **3. SCOUNDREL (Ninja) - Ranged Spinner**
- **Health**: 30 HP
- **Speed**: 100 pixels/second
- **Damage**: 10 HP per shot
- **Attack Rate**: 2000ms (0.5 shots/second)
- **Weapon**: SCOUNDREL_STAR (spinning ninja stars)
- **Projectile**: Spins at 10 rotations/second with visual effects
- **Behavior**: Mobile ranged attacker with spinning projectiles

#### **4. DRAGONLING (Chomper) - Fast Melee**
- **Health**: 30 HP
- **Speed**: 150 pixels/second - **Fastest enemy**
- **Damage**: 10 HP per attack
- **Attack Rate**: 300ms - **Fastest attack rate**
- **Weapon**: CHOMPER_BITE (rapid biting)
- **Behavior**: Fast rushdown unit, overwhelms with rapid attacks

#### **5. TROLL - Heavy Melee with Special**
- **Health**: 50 HP - **Highest health**
- **Speed**: 150 pixels/second
- **Damage**: 20 HP per attack
- **Attack Rate**: 1000ms
- **Special Ability**: Drops **SpellBot** explosive when killed
- **SpellBot Explosion**: 10 damage to all enemies within 70 pixels
- **Behavior**: Heavy tank that creates environmental hazards on death

#### **6. SLUG - Weak Ranged Swarm**
- **Health**: 10 HP - **Lowest health**
- **Speed**: 50 pixels/second - **Slowest**
- **Damage**: 30 HP per shot - **High damage**
- **Attack Rate**: 1000ms
- **Weapon**: SLIME_SHOT (slime projectiles)
- **Behavior**: Weak individually but dangerous in groups

### **Enemy AI & Behavior**
- **Pathfinding**: Uses **EasyStar.js** for intelligent navigation around walls
- **Target Acquisition**: All enemies automatically pursue the player
- **Stuck Detection**: Alternative movement when pathfinding fails
- **Attack Patterns**: 
  - **Melee enemies**: Charge directly toward player
  - **Ranged enemies**: Maintain optimal distance while shooting
- **Spawn Delay**: 1-second delay after spawning before enemies can attack
- **Death Effects**: Visual death animations and potential item drops

---

## Dungeon Generation System

### **Maze Architecture**
- **Grid Size**: 5x5 room grid (25 total rooms)
- **Room Dimensions**: Variable 7-11 tiles per room (224-352 pixels)
- **Total Map Size**: Approximately 160x160 tiles (5120x5120 pixels)
- **Tile System**: 32x32 pixel tiles for walls and floors

### **Maze Features**
- **Long Corridors**: 8-15 tiles long, 3 tiles wide
- **Dead Ends**: 30% probability for dead-end branches
- **Multiple Paths**: 20% chance for extra connections between rooms
- **Winding Paths**: Natural curves and turns, not straight grid lines
- **Room Variety**: Start room, normal rooms, goal room, dead-end rooms

### **Procedural Generation Algorithm**
1. **Place Rooms**: 5x5 grid with randomized positioning
2. **Carve Rooms**: Create floor tiles within room boundaries  
3. **Create Corridors**: Connect rooms with winding pathways
4. **Add Dead Ends**: Generate exploration branches and wrong turns
5. **Extra Connections**: Add loops and alternative routes
6. **Populate Content**: Place enemies, items, and treasure

### **Room States & Management**
- **Room States**: CREATED → TRIGGERED → SPAWNING → RESPAWN → ROOM_CLEARED
- **Enemy Spawning**: Triggered when player enters room boundary
- **Room Clearing**: All enemies must be defeated to mark room as cleared
- **Free Exploration**: No doors block movement between rooms

---

## Items & Collectibles System

### **Health Potions**
- **Healing**: Restore 20 HP when collected
- **Visual**: Red potion sprite with floating animation
- **Sources**: 
  - **Barrel destruction** (random chance)
  - **Specific room spawns** (rooms 2, 3, 5)
- **Collection**: Walk over to automatically consume
- **Effect**: Immediate health restoration up to 50 HP maximum

### **Speed Boost Power-ups**
- **Effect**: 1.5x movement speed multiplier
- **Duration**: 5 seconds with visual particle trail
- **Visual**: Purple power-up sprite with glow effect
- **Sources**: 
  - **Barrel destruction** (random chance)
  - **Specific room spawns** (rooms 3, 4, 5)
- **Stacking**: Does not stack, resets timer if collected during boost

### **Destructible Barrels**
- **Health**: Destroyed by player spells
- **Distribution**: 2-4 barrels per room (70% of rooms have barrels)
- **Contents**: Random chance for health potions or speed boosts
- **Visual Feedback**: 
  - Yellow hover highlight when mouse over
  - Particle explosion when destroyed
  - Smashed barrel sprite remains briefly
- **Physics**: Immovable objects that block movement until destroyed
- **Strategic Value**: Risk vs. reward - time spent destroying vs. potential benefit

---

## User Interface & HUD

### **Health Bar**
- **Location**: Top-left corner of screen (fixed position)
- **Display**: Current HP / Maximum HP with visual bar
- **Color**: Green (healthy) → Yellow (moderate) → Red (critical)
- **Updates**: Real-time health changes with smooth animations

### **Wand Overlay** 
- **Location**: Bottom-right corner of screen
- **Display**: 
  - Current wand icon with color coding
  - Wand name (formatted for readability)
  - Damage and attack rate statistics
  - Special descriptions (Rapid Fire, High Power, Deployable)
- **Updates**: Automatic when wand is swapped

### **Game State Messages**
- **Victory Screen**: "TREASURE DISCOVERED!" with medieval styling
- **Game Over Screen**: "GAME OVER" with restart option
- **Interactive Elements**: Clickable restart buttons with hover effects

---

## Input Controls

### **Movement Controls**
- **Primary**: WASD keys for 8-directional movement
- **Alternative**: Arrow keys (supported but WASD preferred)
- **Touch/Mobile**: Touch and drag for mobile device compatibility
- **Diagonal Movement**: Properly normalized to prevent speed advantages

### **System Controls**
- **R Key**: Restart game from game over screen
- **F Key**: Toggle fullscreen mode
- **Mouse**: Hover effects on interactive elements
- **Pointer**: Touch controls for mobile devices

### **No Combat Controls**
- **Auto-Combat**: No manual aiming or shooting required
- **No Weapon Switching**: Weapons auto-swap when upgrades are collected
- **No Inventory Management**: Items automatically consumed on pickup

---

## Game Balance & Progression

### **Difficulty Scaling**
- **Room-Based**: Enemy spawn rates increase with distance from start
- **Enemy Variety**: Later rooms have more dangerous enemy combinations
- **Resource Management**: Limited healing creates tension
- **Weapon Progression**: Player power increases through wand upgrades

### **Strategic Elements**
- **Positioning**: Player must manage distance from melee vs ranged enemies
- **Resource Collection**: Risk vs reward in barrel destruction
- **Room Exploration**: Dead ends require backtracking decisions
- **Weapon Selection**: Different wands suit different enemy compositions

### **Spawn Probabilities** (Per Room)
- **Enemy Types**: Weighted random selection
  - DRAUGR: 30% weight (1-3 per room)
  - DUMBDUMB: 25% weight (1-2 per room) 
  - SCOUNDREL: 20% weight (1-2 per room)
  - DRAGONLING: 15% weight (1-2 per room)
  - TROLL: 10% weight (1 per room)
- **Wand Upgrades**: 30% of rooms (maximum 4 total)
- **Barrels**: 70% of rooms contain 2-4 barrels

---

## Technical Features

### **Performance Optimizations**
- **Object Pooling**: Bullets and enemies reuse objects for memory efficiency
- **Culling**: Off-screen elements automatically managed
- **Physics**: Arcade physics system for fast collision detection
- **Rendering**: Pixel-perfect rendering with anti-aliasing disabled

### **Architecture Patterns**
- **Manager Pattern**: Separate managers for enemies, weapons, items, rooms, barrels
- **Factory Pattern**: Enemy and weapon creation through factory classes  
- **Event System**: Phaser event system for component communication
- **Scene Management**: Single MainScene handles entire game loop

### **Asset Management**
- **Sprites**: All game assets loaded at startup
- **Animations**: Frame-based animations for characters and effects
- **Tilesets**: 32x32 pixel tileset for dungeon construction
- **Sound**: Placeholder for future audio implementation

---

## Victory & End Conditions

### **Primary Victory: Treasure Discovery**
1. **Treasure Location**: Animated treasure in randomly selected goal room
2. **Discovery**: Player touches treasure to trigger 8-frame opening animation  
3. **Victory Screen**: "TREASURE DISCOVERED!" with ornate medieval styling
4. **Flavor Text**: "Pleased with Thou, King Arthur Shalt be!"
5. **Restart Option**: "BEGIN NEW QUEST" button with hover effects

### **Alternative Victory: Room Clearing**
1. **End Room**: Separate room designated as "end room" 
2. **Completion**: Clear all enemies in the end room
3. **Victory Screen**: "VICTORY!" message with restart option

### **Defeat Condition**
1. **Player Death**: Health reaches 0 from enemy attacks
2. **Game Over Screen**: "GAME OVER" with restart functionality
3. **Restart Mechanism**: R key or clicking restart button

---

## Current State & Missing Features

### **Fully Implemented Systems** ✅
- Complete player movement and combat
- Six distinct enemy types with unique behaviors  
- Procedural dungeon generation (5x5 maze)
- Weapon system with three upgrade types
- Health and damage systems
- Item collection and power-ups
- Room progression mechanics
- Game over/victory conditions
- Visual effects and animations

### **Educational Features** (Planned - Not Yet Implemented) 🚧
- Chemistry problem solving integration
- Potion crafting system
- Merlin's Journal (study guide)
- Spell casting through chemistry questions
- Material collection for potion ingredients
- Academic level selection (High School, Organic, etc.)

### **Multiplayer Features** (Planned - Not Yet Implemented) 🚧
- Local multiplayer (2-4 players same device)
- Online multiplayer with Socket.IO
- Room creation and joining
- Real-time player synchronization

### **Backend Features** (Planned - Not Yet Implemented) 🚧
- Supabase authentication and user accounts
- Progress tracking and leaderboards
- User profile management
- Cross-device synchronization

---

## Summary

**Merlin's Grimoire** currently provides a complete, polished dungeon crawler experience with automatic combat, procedural generation, and strategic progression. The game successfully combines exploration, tactical positioning, resource management, and character progression in a cohesive magical fantasy setting. 

The current build serves as an excellent foundation for the planned educational chemistry features, multiplayer capabilities, and backend integration. All core systems are functional and ready for enhancement with the educational gameplay mechanics that will transform this from a traditional dungeon crawler into an innovative chemistry learning platform.

**Current Estimated Play Time**: 10-20 minutes per run depending on maze complexity and player skill, with high replay value due to procedural generation. 