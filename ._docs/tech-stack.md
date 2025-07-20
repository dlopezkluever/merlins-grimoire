### **Merlin's Grimoire - Tech Stack (Current & Planned)**

#### **Frontend (Game Interface and Rendering)**

1. **Game Engine: Phaser 3** ✅ *Currently Implemented*
   * **Why**: Phaser 3.70.0 provides excellent 2D game development capabilities with robust physics, rendering, and scene management for our top-down dungeon shooter.
   * **Current Implementation**:
     * **2D Top-Down Gameplay**: 32x32 pixel tilemap system for procedurally generated dungeons
     * **Physics**: Arcade physics for collision detection, movement, and bullet mechanics
     * **Rendering**: Pixel-perfect rendering with anti-aliasing disabled for crisp pixel art
     * **Scene Management**: Single MainScene handling complete game loop
   * **Features Currently Supported**:
     * Player movement and auto-targeting combat
     * Enemy AI with pathfinding
     * Weapon system with upgrades
     * Health and damage systems
     * Procedural dungeon generation

2. **Development Language: TypeScript** ✅ *Currently Implemented*
   * **Why**: TypeScript 5.2.2 provides type safety and better development experience for complex game logic.
   * **Implementation**: Complete codebase written in TypeScript with proper typing for game objects, managers, and configurations.
   * **Features Supported**:
     * Type-safe game object interactions
     * Intellisense and error catching during development
     * Better code maintainability and refactoring

3. **Build System: Vite** ✅ *Currently Implemented*
   * **Why**: Vite 6.2.6 offers fast development server and optimized production builds.
   * **Implementation**: Hot module replacement for rapid development, optimized bundling for production.
   * **Features Supported**:
     * Fast development workflow
     * Asset optimization and bundling
     * Development and production environments

4. **UI Framework: Phaser UI** ✅ *Currently Implemented*
   * **Why**: Phaser's built-in UI system handles all game interfaces with pixel-art styling for consistency.
   * **Current Implementation**:
     * **Health Bar**: Player health display
     * **Weapon Overlay**: Current weapon display
     * **Game UI**: All in-game interfaces using Phaser UI elements
   * **Planned Enhancements**:
     * **Modal Popups**: Educational challenge interfaces
     * **Inventory System**: Spell bank with nostalgic visuals
     * **Chemistry UI**: Potion crafting and spell casting interfaces
   * **Features Supported**:
     * Pixel-perfect UI elements
     * Game Boy-style aesthetic
     * Consistent visual theming

5. **Pathfinding: EasyStar.js** ✅ *Currently Implemented*
   * **Why**: EasyStar.js 0.4.4 provides intelligent enemy AI navigation around dungeon obstacles.
   * **Implementation**: Smart enemy movement that adapts to procedurally generated maze layouts.
   * **Features Supported**:
     * Intelligent enemy pathfinding
     * Dynamic obstacle avoidance
     * Performance-optimized routing

6. **Speech Analysis: Web Speech API with LangChain** 🚀 *Planned Implementation*
   * **Why**: Web Speech API handles real-time speech-to-text for chemistry answers, with LangChain scoring and validating correctness.
   * **Planned Implementation**:
     * **Voice Input**: Real-time speech recognition for spell casting
     * **Answer Validation**: LangChain integration for chemistry answer scoring
     * **Fallback System**: Typing input for accessibility
   * **Features to be Supported**:
     * Voice-activated spell casting
     * Accessibility-friendly input options
     * Real-time speech processing

7. **Procedural Generation: Phaser with Tiled** ✅ *Currently Implemented*
   * **Why**: Phaser's tilemap system with Tiled editor supports dynamic dungeon generation.
   * **Current Implementation**: 
     * **Dynamic Tilemaps**: Runtime generation from maze data
     * **Tiled Integration**: Uses .tmj files and Phaser tilemap system
     * **32x32 Tiles**: Consistent pixel art grid system
   * **Features Supported**:
     * Procedural maze generation
     * Dynamic tilemap creation
     * Tiled map editor compatibility

#### **Backend (Game Logic, Multiplayer, and Data Management)**

1. **Backend Platform: Supabase** 🚀 *Planned Implementation*
   * **Why**: Supabase provides PostgreSQL database, authentication, and Edge Functions for persistent game data and user management.
   * **Planned Implementation**:
     * **Game Data Persistence**: Store player profiles, statistics, and progression
     * **Authentication**: User accounts, session management, and profile persistence
     * **Leaderboards**: Track high scores, completion times, and player rankings
     * **Edge Functions**: Server-side game logic validation and anti-cheat measures
     * **Asset Storage**: Player avatars and custom content
   * **Features to be Supported**:
     * Persistent player progression
     * Secure authentication and profiles
     * Global leaderboards and statistics
     * Cross-device profile sync

2. **Real-time Multiplayer: Socket.IO** 🚀 *Planned Implementation*
   * **Why**: Socket.IO is the industry standard for real-time multiplayer gaming, providing low-latency communication essential for fast-paced dungeon combat.
   * **Planned Implementation**:
     * **Game Rooms**: Create and manage multiplayer dungeon instances (4-player races)
     * **Player Synchronization**: Real-time position, health, weapon state, and movement
     * **Combat Events**: Spell casting, enemy hits, damage dealing, and death events
     * **Game State Sync**: Enemy spawning, room clearing, item collection, and door states
     * **Communication**: In-game chat, emotes, and voice chat integration
   * **Features to be Supported**:
     * **2-4 Player Co-op**: Cooperative dungeon clearing with shared objectives
     * **Real-time Combat**: Synchronized spell casting, damage, and enemy interactions
     * **Shared Progression**: Team-based room clearing and victory conditions
     * **Low Latency**: <50ms response times for competitive gameplay
     * **Reconnection Handling**: Robust disconnect/reconnect for mobile players

3. **AI Content Generation: OpenAI API with LangChain** 🚀 *Planned Implementation*
   * **Why**: OpenAI with LangChain generates chemistry problems and powers the AI tutor system.
   * **Planned Implementation**:
     * **Dynamic Problem Generation**: Chemistry questions based on difficulty and subject
     * **AI Tutor System**: "Ancient Merlin" conversational learning assistant
     * **Answer Validation**: Intelligent scoring of chemistry responses
   * **Features to be Supported**:
     * Adaptive difficulty chemistry problems
     * Personalized tutoring interactions
     * Real-time answer analysis and feedback

#### **Content Generation (Educational Problems and Mazes)**

1. **Procedural Dungeon Generation: Custom Algorithm** ✅ *Currently Implemented*
   * **Why**: Custom maze generation using depth-first search creates unique dungeon layouts for each playthrough.
   * **Current Implementation**:
     * **Grid-Based Generation**: 3x3 room grid with intelligent connections
     * **Room Variety**: Start rooms, enemy encounters, treasure rooms, and boss chambers
     * **Dynamic Difficulty**: Enemy placement and types scale with room distance from start
   * **Features Currently Supported**:
     * Unique dungeon layouts every game
     * Balanced room distribution and connectivity
     * Progressive difficulty scaling

2. **Enemy Spawning System** ✅ *Currently Implemented*
   * **Why**: Dynamic enemy placement based on room types and difficulty progression.
   * **Implementation**: Six distinct enemy types with unique behaviors, weapons, and AI patterns.
   * **Features Supported**:
     * Diverse combat encounters
     * Adaptive enemy combinations
     * Balanced challenge progression

#### **Game Architecture and Performance**

1. **Object Pooling** ✅ *Currently Implemented*
   * **Why**: Efficient memory management for bullets, enemies, and effects.
   * **Implementation**: Phaser groups with object recycling for performance optimization.
   * **Features Supported**:
     * Smooth 60fps gameplay
     * Memory-efficient bullet systems
     * Optimized enemy spawning

2. **Manager Pattern** ✅ *Currently Implemented*
   * **Why**: Organized code architecture with separate managers for different game systems.
   * **Implementation**: EnemyManager, WeaponManager, RoomManager, ItemManager, and BarrelManager.
   * **Features Supported**:
     * Maintainable and scalable codebase
     * Clear separation of concerns
     * Easy feature addition and modification

3. **Event-Driven Architecture** ✅ *Currently Implemented*
   * **Why**: Phaser event system enables loose coupling between game systems.
   * **Implementation**: Custom events for player death, enemy destruction, room clearing, and item collection.
   * **Features Supported**:
     * Modular system interactions
     * Easy debugging and testing
     * Flexible game state management

#### **Planned Enhancements**

1. **Database Schema** 🚀 *Planned (Supabase)*
   * **Players Table**: User profiles, statistics, preferences, authentication
   **IGNORE**: 
   * **Game Sessions**: Multiplayer room state, match history, and statistics
   * **Leaderboards**: High scores, completion times, and achievement tracking
   * **Player Stats**: Detailed gameplay analytics and progression metrics
   * ** END OF IGNORE**


2. **Real-time Multiplayer Features** 🚀 *Planned (Socket.IO)*
   * **Live Player Synchronization**: Position, health, weapons, and actions (60fps updates)
   * **Shared Dungeon State**: Synchronized enemy spawning, room clearing, and item collection
   * **Combat Synchronization**: Real-time spell trajectories, damage dealing, and death events
   * **Communication Systems**: Text chat, voice chat, and quick command emotes
   * **Spectator Mode**: Watch ongoing games and learn from other players

3. **Educational Integration** 🚀 *Planned (Web Speech API + LangChain + OpenAI)*
   * **Voice-Activated Spells**: Speech recognition for chemistry answer input
   * **AI Tutor**: LangChain-powered "Ancient Merlin" learning assistant
   * **Dynamic Problems**: OpenAI-generated chemistry questions with adaptive difficulty
   * **Learning Analytics**: Track educational progress and chemistry mastery

#### **Development Tools and Workflow**

- **Version Control**: Git with feature branch workflow
- **Asset Pipeline**: Custom pixel art with consistent 32x32 tile system
- **Testing**: Manual testing with planned automated test integration for multiplayer
- **Deployment**: 
  - **Frontend**: Static hosting (Vercel/Netlify) for Phaser app
  - **Backend**: Node.js server deployment (Railway/Heroku) for Socket.IO
  - **Database**: Supabase hosted PostgreSQL
- **Monitoring**: Socket.IO performance metrics and Supabase analytics

#### **Architecture Benefits**

**Phaser UI for Game Interfaces**:
- ✅ Native game engine integration
- ✅ Pixel-perfect rendering
- ✅ Consistent visual theming
- ✅ Performance optimized for games
- ✅ No external framework overhead

**Socket.IO for Real-time Gaming**:
- ✅ Industry standard for multiplayer games
- ✅ Low-latency communication (<50ms)
- ✅ Built-in room management
- ✅ Automatic fallback (WebSocket → HTTP long polling)
- ✅ Perfect for high-frequency game updates

**Supabase for Data Persistence**:
- ✅ Robust PostgreSQL database
- ✅ Built-in authentication and security
- ✅ Real-time subscriptions for leaderboards
- ✅ Edge Functions for server-side validation
- ✅ Excellent developer experience

**Current Status**: Fully functional single-player dungeon crawler ready for Socket.IO multiplayer integration and Supabase backend enhancement. 