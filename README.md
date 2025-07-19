# Merlin's Grimoire: Chemistry Edition

## Overview

**Merlin's Grimoire: Chemistry Edition** is an educational wizard game that transforms chemistry learning into an immersive magical adventure. Players traverse procedurally generated labyrinths as the wizard Merlin, collecting mythical ingredients to craft potions through real chemical reactions. These potions are then activated into spells by solving chemistry problems, which are used to defeat mythical enemies and unlock doors in the quest for hidden treasure.

## Core Features

- **Educational Chemistry Integration**: Real chemistry problems integrated directly into gameplay mechanics
- **Potion Crafting System**: Collect mythical ingredients and solve chemistry problems to create magical potions
- **Spell Casting Mechanics**: Answer chemistry questions to cast powerful spells against enemies
- **Procedural Dungeon Generation**: 3x3 room dungeons with unique layouts each playthrough
- **Real-time Multiplayer**: Socket.IO integration for collaborative gameplay (coming soon)
- **Adaptive Difficulty**: Chemistry questions tailored to player's academic level
- **Progress Tracking**: Comprehensive learning analytics via Supabase backend

## Technology Stack

- **Frontend**: Phaser 3 (TypeScript)
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Multiplayer**: Socket.IO (Node.js server)
- **Build Tool**: Vite
- **Styling**: Pixel art with retro 2000s aesthetic

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd merlin-edtech-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the game**
   Navigate to `http://localhost:5173` in your web browser

## Game Controls

- **Movement**: WASD keys (8-directional movement)
- **Potion Crafting**: Press 'P' to open the apothecary chamber
- **Spell Switching**: Press 'S' to cycle through available spell types
- **Spell Casting**: Press number keys (1-6) to answer chemistry questions and cast spells
- **Journal Access**: Press 'J' to open Merlin's Journal (coming soon)

## Gameplay Guide

1. **Select Your Chemistry Level**: Choose from High School Chemistry, Organic Chemistry, or Biochemistry
2. **Explore the Dungeon**: Navigate through rooms collecting mythical ingredients
3. **Craft Potions**: Combine ingredients and solve chemistry problems to create magical potions
4. **Cast Spells**: Answer chemistry questions correctly to unleash spells against enemies
5. **Find the Treasure**: Defeat enemies, unlock doors, and locate the hidden treasure to win

## Educational Content

The game covers various chemistry topics including:
- Chemical equation balancing
- Reaction type identification
- Stoichiometry calculations
- Organic chemistry reactions
- Molecular structure recognition

## Development

### Project Structure
```
merlin-edtech-game/
├── src/
│   ├── objects/       # Game entities (player, enemies, items)
│   ├── scenes/        # Phaser scenes
│   └── index.ts       # Entry point
├── assets/
│   ├── sprites/       # Game sprites and animations
│   ├── fonts/         # Custom fonts (Alagard, m6x11)
│   └── tiles/         # Tilemap assets
├── server/            # Socket.IO server (multiplayer)
└── ._docs/            # Documentation and design guides
```

### Building for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

Please refer to our contributing guidelines in the `._docs` directory for information on:
- Code style and standards
- Git workflow
- Testing requirements
- Documentation standards

## License

This project is based on an open-source dungeon crawler game and maintains attribution to the original creators. See `ATTRIBUTION.md` for details.

## Credits

- **Development Team**: [Your team information]
- **Art Assets**: Custom pixel art inspired by classic RPGs
- **Educational Content**: Aligned with standard chemistry curricula
- **Original Base Game**: See attribution file for original game credits

## Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact the development team at [contact information]

---

*Merlin's Grimoire: Making chemistry magical through gaming!* 

## Overview

**Merlin's Grimoire: Chemistry Edition** is an educational wizard game that transforms chemistry learning into an immersive magical adventure. Players traverse procedurally generated labyrinths as the wizard Merlin, collecting mythical ingredients to craft potions through real chemical reactions. These potions are then activated into spells by solving chemistry problems, which are used to defeat mythical enemies and unlock doors in the quest for hidden treasure.

## Core Features

- **Educational Chemistry Integration**: Real chemistry problems integrated directly into gameplay mechanics
- **Potion Crafting System**: Collect mythical ingredients and solve chemistry problems to create magical potions
- **Spell Casting Mechanics**: Answer chemistry questions to cast powerful spells against enemies
- **Procedural Dungeon Generation**: 3x3 room dungeons with unique layouts each playthrough
- **Real-time Multiplayer**: Socket.IO integration for collaborative gameplay (coming soon)
- **Adaptive Difficulty**: Chemistry questions tailored to player's academic level
- **Progress Tracking**: Comprehensive learning analytics via Supabase backend

## Technology Stack

- **Frontend**: Phaser 3 (TypeScript)
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Multiplayer**: Socket.IO (Node.js server)
- **Build Tool**: Vite
- **Styling**: Pixel art with retro 2000s aesthetic

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd merlin-edtech-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the game**
   Navigate to `http://localhost:5173` in your web browser

## Game Controls

- **Movement**: WASD keys (8-directional movement)
- **Potion Crafting**: Press 'P' to open the apothecary chamber
- **Spell Switching**: Press 'S' to cycle through available spell types
- **Spell Casting**: Press number keys (1-6) to answer chemistry questions and cast spells
- **Journal Access**: Press 'J' to open Merlin's Journal (coming soon)

## Gameplay Guide

1. **Select Your Chemistry Level**: Choose from High School Chemistry, Organic Chemistry, or Biochemistry
2. **Explore the Dungeon**: Navigate through rooms collecting mythical ingredients
3. **Craft Potions**: Combine ingredients and solve chemistry problems to create magical potions
4. **Cast Spells**: Answer chemistry questions correctly to unleash spells against enemies
5. **Find the Treasure**: Defeat enemies, unlock doors, and locate the hidden treasure to win

## Educational Content

The game covers various chemistry topics including:
- Chemical equation balancing
- Reaction type identification
- Stoichiometry calculations
- Organic chemistry reactions
- Molecular structure recognition

## Development

### Project Structure
```
merlin-edtech-game/
├── src/
│   ├── objects/       # Game entities (player, enemies, items)
│   ├── scenes/        # Phaser scenes
│   └── index.ts       # Entry point
├── assets/
│   ├── sprites/       # Game sprites and animations
│   ├── fonts/         # Custom fonts (Alagard, m6x11)
│   └── tiles/         # Tilemap assets
├── server/            # Socket.IO server (multiplayer)
└── ._docs/            # Documentation and design guides
```

### Building for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

Please refer to our contributing guidelines in the `._docs` directory for information on:
- Code style and standards
- Git workflow
- Testing requirements
- Documentation standards

## License

This project is based on an open-source dungeon crawler game and maintains attribution to the original creators. See `ATTRIBUTION.md` for details.

## Credits

- **Development Team**: [Your team information]
- **Art Assets**: Custom pixel art inspired by classic RPGs
- **Educational Content**: Aligned with standard chemistry curricula
- **Original Base Game**: See attribution file for original game credits

## Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact the development team at [contact information]

---

*Merlin's Grimoire: Making chemistry magical through gaming!* 