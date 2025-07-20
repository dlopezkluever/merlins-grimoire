# **Revised Tasklist: Merlin's Grimoire - Adapted Development Plan**

This comprehensive task list outlines the development process for "Merlin's Grimoire: Chemistry Edition," adapting an existing open-source game ("Merlin's Grimoire" base) as a foundational starting point. It integrates the educational "Ed-tech" features, backend systems (Supabase), specific spellcasting mechanics, and **real-time multiplayer via Socket.IO** as detailed in the Adapted MVP PRD, while leveraging the "Revised Game Project Plan" for strategic guidance and incorporating relevant elements from the "Original-Task-List."

## **Phase 0: Initial Project Setup & Core Adaptation**

This phase focuses on acquiring, setting up, and initially adapting the chosen open-source game, "Merlin's Grimoire" base.

* **0.2 Feature Removal and Simplification (DON'T DO THE ITEMS THAT SAY IGNORE):**
    * [ ] **IGNORE**  **Remove Automatic Firing Mechanism:**
        * [ ] Identify and remove all code related to the player character's rapid automatic firing. This includes projectile instantiation, firing rate logic, and associated animations.
        * [ ] Ensure no residual auto-firing behavior remains.
    * [ ] **IGNORE** **Remove Weapon System:**
        * [ ] Delete weapon models/sprites and textures from `public/assets/sprites/` that are not relevant to Merlin's staff/spellcasting.
        * [ ] Remove code modules/classes related to weapon handling, upgrades, and selection.
        * [ ] Ensure the player character no longer displays or interacts with traditional weapons.
    * [] **CHANGE Irrelevant UI Elements:**
        * [ ] **IGNORE** Identify and remove any UI elements from the existing game that are specific to the old combat system (e.g., weapon display overlay, ammo count).
        * [ ] Change all text elements in the game to use our fonts (assets/fonts), as directed in the ui-guide.md
    * [ ] **Review and Remove Other Unwanted Features:**
        * **IGNORE** [ ] Systematically go through the `Merlin's Grimoire` codebase and remove any other systems, modules, assets, or functionalities explicitly deemed irrelevant by the PRD (e.g., specific power-ups not related to potions, unneeded item collection types).
        * **IGNORE** [ ] Systematically go through the `Merlin's Grimoire` codebase and remove any other systems, modules, assets, or functionalities explicitly deemed irrelevant by the PRD (e.g., specific power-ups not related to potions, unneeded item collection types). 
* **0.3 Codebase Refactoring for Originality & Thematic Alignment:**
    * [ ] **Rename Project & Core Directories:**
        * [ ] Rename the main project folder (if applicable) to "Merlin's Grimoire."
        * [ ] Rename core game directories/namespaces (e.g., `src/game/dungeon_warrior` to `src/game/merlins_grimoire`).
    * [ ] **Refactor Core Game Object Naming:**
        * [ ] Rename player-related variables, functions, and classes from generic "player" or "hero" to "Merlin" (e.g., `PlayerCharacter` to `MerlinEntity`).
        * [ ] Rename weapon/projectile related variables to "spell" or "potion" related terms (e.g., `Bullet` to `SpellProjectile`).
    * [ ] **Update In-Game Text and Comments:**
        * [ ] Replace any hardcoded text or strings within the game (e.g., old game references, "Victory!") with "Merlin's Grimoire" themed equivalents. Using our UI found in ._docs/ui-guide.md
        * [ ] Update code comments to reflect the new game's logic and narrative. (Change / Reword as many of the existing as possible comments)
    * [ ] **Review and Update Asset Paths:**
        * [ ] Adjust asset loading paths in Phaser scenes to point to new or renamed asset directories (e.g., `public/assets/sprites/merlin/`).
    * [ ] **Document Open-Source Attribution:**
        * [ ] Create a clear `ATTRIBUTION.md` or `LICENSE.md` file in the project root, acknowledging the original base game and its license.
    * [ ] ** Create a README.md: **
        * [ ] Create a readme based off the master_project_overview and like how to install and what tech we are using 
    

## **Phase 1: Backend & Multiplayer Integration, and Core Systems Adaptation**

This phase focuses on establishing the Supabase backend, setting up the Socket.IO server, and adapting the core game systems inherited from the base game to align with "Merlin's Grimoire" and support multiplayer.

* **1.1 Supabase Backend Setup & Database Schema Design:**
    * [ ] **Create New Supabase Project:** Set up a new project on the Supabase platform.
    * [ ] **Retrieve Supabase Credentials:** Note down the project URL and anon key.
    * [ ] **Install Supabase JavaScript Client:** Run `npm install @supabase/supabase-js`.
    * [ ] **Configure Supabase Client in Project:**
        * [ ] Create `src/services/supabase.ts` (or similar) to initialize the Supabase client.
        * [ ] Use environment variables for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
        * [ ] Create/update `.env` file for local development with these variables.
        * [ ] Update `vite.config.ts` to ensure environment variables are correctly loaded and exposed to the client-side.
    * [ ] **Test Supabase Connection:** Implement a simple test query (e.g., fetching a dummy record) to confirm successful connection.
    * [ ] **Design and Create Database Tables (Supabase Schema):**
        * [ ] `users`: `id` (PK), `email` (UNIQUE), `username` (UNIQUE), `chemistry_level` (ENUM: 'High School Chem 1', 'Organic Chemistry', 'Biochemistry'), `created_at`, `updated_at`.
        * [ ] `player_profiles`: `id` (PK), `user_id` (FK to `users.id`), `total_games_played`, `total_potions_crafted`, `total_enemies_defeated`, `chemistry_strength_scores` (JSONB for detailed mastery tracking).
        * [ ] `game_sessions`: `id` (PK), `player_id` (FK to `users.id`), `sub_subject` (TEXT), `started_at`, `ended_at`, `final_score`, `enemies_defeated`, `potions_crafted`, `room_id` (for multiplayer session tracking).
        * [ ] `chemical_reactions`: `id` (PK), `player_id` (FK to `users.id`), `session_id` (FK to `game_sessions.id`), `mythical_ingredients` (ARRAY of TEXT), `chemistry_problem` (TEXT), `player_answer` (TEXT), `correct_answer` (TEXT), `is_correct` (BOOLEAN), `reaction_type` (TEXT), `timestamp`.
        * [ ] `chemistry_problems`: `id` (PK), `chemistry_level` (ENUM), `sub_subject` (TEXT), `problem_type` (ENUM: 'balancing_equation', 'predict_product', 'identify_reaction', 'calculation'), `question` (TEXT), `correct_answer` (TEXT), `multiple_choice_options` (ARRAY of TEXT), `image_url` (TEXT, nullable), `difficulty` (INT), `tags` (ARRAY of TEXT).
        * [ ] `leaderboards`: `id` (PK), `player_id` (FK to `users.id`), `chemistry_level` (ENUM), `sub_subject` (TEXT), `score` (INT), `timestamp`.
    * [ ] **Configure Supabase Row Level Security (RLS) Policies:**
        * [ ] Enable RLS on all tables.
        * [ ] Create policies to allow authenticated users to read/write their own `users`, `player_profiles`, `game_sessions`, `chemical_reactions` records.
        * [ ] Create policies for `chemistry_problems` and `leaderboards` (e.g., read-only for all authenticated users).
    * [ ] **Implement Supabase Edge Functions (Optional for MVP, but good for future):**
        * [ ] Plan for `validate-chemistry-answer`, `update-chemistry-strength`, `generate-chemistry-problem`, `calculate-game-score` functions. (Note: Actual implementation might be client-side for MVP if simpler).
* **IGNORE FOR NOW** **1.2 Socket.IO Server Setup (Node.js):** **IGNORE FOR NOW**
    * [ ] **Create a New Node.js Project for the Server:** Initialize a new npm project in a separate directory (e.g., `server/`).
    * [ ] **Install Dependencies:** `npm install express socket.io`
    * [ ] **Set Up Basic Express Server:** Create `server/index.js` to serve static files (if needed) and listen for connections.
    * [ ] **Integrate Socket.IO:** Initialize Socket.IO with the Express server.
    * [ ] **Define Basic Socket.IO Events:**
        * [ ] `connection`: Handle new client connections, assign unique IDs.
        * [ ] `disconnect`: Handle client disconnections.
        * [ ] `playerJoined`: Broadcast when a new player joins a room/session.
        * [ ] `playerMoved`: Receive player movement data and broadcast to others.
        * [ ] `playerAction`: Receive actions (e.g., spell cast) and broadcast.
    * [ ] **Implement Room Management:** Set up basic logic for players to join/leave game rooms.
    * [ ] **Deploy Server (Planned):** Consider deployment options (Railway/Heroku/etc.) for the Node.js server.
***IGNORE FOR NOW** **1.3 Player Character (Merlin) Adaptation & Multiplayer Integration:**
    * [ ] **Retain Core Movement:** Confirm WASD 8-directional movement at 200 pixels/second base speed is fully functional.
    * [ ] **Synchronize Player Movement:**
        * [ ] Send Merlin's position and animation state to the Socket.IO server on update.
        * [ ] Receive other players' positions and states from the server and render them in the game.
    * [ ] **Retain Health System:** Confirm 50 HP, 10-30 damage from enemies, 1-second invulnerability frames, and game over condition at 0 HP are functional.
    * [ ] **Update Merlin's Visuals:**
        * [ ] Acquire/create new pixel art sprites for Merlin (64x64 sprite frames) including idle, running, casting, damage, and death animations.
        * [ ] Integrate these new sprites into the Phaser game.
* **IGNORE FOR NOW** **1.4 Enemy System Adaptation & Multiplayer Integration:**
    * [ ] **Confirm Existing Enemy Integration:** Verify that the six distinct enemy types (Zombie, Skeleton, Ninja, Chomper, Troll, Slug) from the base game are correctly loaded and their core mechanics (health, speed, damage, AI behaviors like pathfinding, target acquisition, smart movement, attack patterns) are retained.
    * [ ] **Synchronize Enemy State:**
        * [ ] Determine server-authoritative or client-side prediction for enemy positions and health.
        * [ ] Send/receive enemy health updates and defeat events via Socket.IO.
    * [ ] **Update Enemy Visuals:** Acquire/create new pixel art sprites for each enemy type to align with the new theme and branding.
    * [ ] **Adjust Enemy Spawning:** Ensure enemy spawning aligns with the room-based difficulty scaling and enemy variety described in the base game guide, and is synchronized across clients.
***IGNORE FOR NOW** **1.5 Map and Environment Adaptation:**
    * [ ] **Confirm Procedural Dungeon Generation:** Verify the 3x3 procedural dungeon generation, room connections, and door mechanics are fully functional.
    * [ ] **Synchronize Map State:** Ensure all connected players see the same dungeon layout and door states.
    * [ ] **Update Environmental Assets:**
        * [ ] Replace existing wall, floor, and decorative element tilesets with new pixel art assets to create a unique atmosphere.
        * [ ] Ensure collision detection for walls and obstacles is correct.
    * [ ] **Camera and Collision System:** Confirm the camera system (follow player, bounds, zoom) and collision system (player-environment, enemy-environment) are correctly implemented and optimized.

## **Phase 2: Core Gameplay & Educational Feature Implementation**

This phase focuses on building out the unique educational mechanics and integrating them with the adapted game core, ensuring multiplayer compatibility.

* **2.1 Scene Management & UI Flow:**
    * [ ] **Implement `BootScene`:** Load all game assets (sprites, tilesets, audio), display a loading progress bar, and initialize core game systems.
    * [ ] **Develop `MainMenuScene`:**
        * [ ] Design and implement the main menu UI (title, "New Game," "Continue," "Settings," "Credits" buttons).
        * [ ] Integrate scene transitions to `ChemistryLevelSelectScene` and `GameScene` (for continue).
    * [ ] **Create `ChemistryLevelSelectScene`:**
        * [ ] Design UI for academic level selection (e.g., High School Chem 1, Organic Chemistry, Biochemistry).
        * [ ] Store the chosen level in the player's Supabase profile.
        * [ ] Implement transition to `SubSubjectSelectScene`.
    * [ ] **Develop `SubSubjectSelectScene`:**
        * [ ] Design UI for sub-subject selection (e.g., "Reaction Times," "Gas Reactions," "Basic Organic Reactions," "Random").
        * [ ] Store the chosen sub-subject for the current game session.
        * [ ] Implement transition to `MerlinsStudyScene`.
    * [ ] **Implement `MerlinsStudyScene` (Pre-Round Review):**
        * [ ] Design the UI for the study guide, consistent with "Merlin's Journal" aesthetics.
        * [ ] Dynamically load and display study guide content based on the selected sub-subject.
        * [ ] Implement a "Skip Review" button and an automatic timeout (e.g., 10 seconds) for skipping.
        * [ ] Implement transition to `GameScene`.
    * [ ] **Refine `GameScene` (Main Gameplay):**
        * [ ] Ensure seamless integration of all new UI elements (HUD, question prompts) without obstructing gameplay.
        * [ ] Manage game state transitions (e.g., entering potion crafting mode, spellcasting).
    * [ ] **Develop `GameOverScene`:**
        * [ ] Design UI for game over/victory screens, displaying score and relevant stats.
        * [ ] Implement "Restart" and "Main Menu" options.
* **2.2 User Authentication & Player Profile System:**
    * [ ] **Implement Supabase Authentication:**
        * [ ] Initialize Supabase Auth (`supabase.auth`).
        * [ ] Implement `signInWithPassword` and `signUp` (for email/password flow).
        * [ ] Set up `onAuthStateChange` listener to manage user state.
    * [ ] **Implement Guest Mode Feature:**
        * [ ] Add "Play as Guest" button on authentication screen.
        * [ ] Implement `startGuestSession()` and `endGuestSession()` in `AuthService` (or `GuestService`).
        * [ ] Ensure guest data is stored **locally only in browser memory** and **not synced to Supabase**.
        * [ ] Display "Welcome, Guest Player! (Guest Mode)" and "Progress will not be saved" warnings.
    * [ ] **Integrate Player Profile with Supabase:**
        * [ ] On first login (for authenticated users), prompt player for `username` and `chemistry_level`.
        * [ ] Save this data to the `users` and `player_profiles` tables in Supabase.
        * [ ] Load existing player profile data upon subsequent logins.
        * [ ] Display the `userId` prominently in the UI for multiplayer identification.
* **2.3 Mythical Ingredient & Inventory System:**
    * [ ] **Design & Create Mythical Ingredient Assets:**
        * [ ] Acquire/create unique pixel art sprites for each mythical ingredient (e.g., Frost Giant Foot, Gremlin's Toenail, Dragon's Tooth, Fairy Feather, Mercury Vial).
    * [ ] **Implement `MythicalIngredient` Entity:**
        * [ ] Define properties (type, rarity, value).
        * [ ] Implement rendering and collection animation (e.g., fade out, add to inventory).
    * [ ] **Implement Ingredient Spawning Logic:**
        * [ ] Integrate random placement of ingredients within dungeon rooms.
        * [ ] Implement rarity-based spawn rates.
        * [ ] Define respawn mechanics (if any).
        * [ ] **Synchronize Ingredient State:** Ensure collected ingredients are removed for all players in a multiplayer session.
    * [ ] **Develop `Inventory` System (`src/game/systems/Inventory.ts`):**
        * [ ] Data structure to track quantities of each ingredient (`Map<string, number>`).
        * [ ] Functions for `addIngredient(type, quantity)`, `removeIngredient(type, quantity)`, `hasIngredients(recipe)`.
        * [ ] Implement stack sizes for inventory items.
        * [ ] Persist inventory state to Supabase (`player_profiles` table) for authenticated users. For guest users, persist locally only via `GuestService`.
        * [ ] **Synchronize Inventory (if collaborative crafting):** If multiple players share an inventory for crafting, ensure real-time updates via Socket.IO.
    * [ ] **Define Potion Material Requirements:**
        * [ ] Clearly define the two specific materials required for each of the four potion types: Fire, Water, Gas, and Acid.
* **2.4 Potion Crafting System (Apothecary Chamber):**
    * [ ] **Implement "Potion-Building Mode" Activation:**
        * [ ] Assign a dedicated keyboard key (e.g., 'P') to toggle the mode.
        * [ ] Implement time dilation: pause game world action, apply visual effects (e.g., screen blur, tint).
        * [ ] Implement visual transition for entering/exiting crafting mode (Merlin's sprite action, screen change).
    * [ ] **Design & Implement Potion Crafting Interface:**
        * [ ] Create a dedicated UI screen for the Apothecary Chamber.
        * [ ] Display current mythical ingredient inventory clearly.
        * [ ] Display the required recipe for the selected potion.
        * [ ] Implement interactive slots for selecting ingredients from inventory.
    * [ ] **Integrate Chemistry Problem Presentation (Potion Crafting):**
        * [ ] Fetch a **difficult, academic-level** standalone chemistry problem from `chemistry_problems` table (unrelated to ingredients) related to the potion type being brewed.
        * [ ] Display the question clearly within the crafting UI.
        * [ ] Integrate static images alongside questions for context.
        * [ ] Implement input for **six (6) multiple-choice selection**.
    * [ ] **Develop Potion Crafting Logic & Feedback:**
        * [ ] Define valid recipes and their corresponding potion types.
        * [ ] Implement ingredient consumption upon attempt.
        * [ ] Implement logic to evaluate player's answer against the correct chemistry problem answer.
        * [ ] **Feedback for Successful Brewing (Correct Answer):**
            * [ ] Play success animation and sound.
            * [ ] Display "Potion of [Type] crafted!" message.
            * [ ] Create a "full-power" potion object.
            * [ ] Play Merlin's crafting animation and show "strong" potion sprite.
            * [ ] Upon successful brewing and "drinking" the potion, the player immediately gains **three (3) spells of that potion's type**.
        * [ ] **Feedback for Inaccurate/Suboptimal Reaction:**
            * [ ] Play "imperfect synthesis" animation/sound.
            * [ ] Display "Imperfect Synthesis" message.
            * [ ] Create a "weak" potion object (half damage for spells).
            * [ ] Play Merlin's crafting animation and show "weak" potion sprite.
            * [ ] **No material loss** for inaccurate reactions. This also grants three spells, but they are "weak" spells.
        * [ ] **Feedback for Failed Brewing (Incorrect Answer):**
            * [ ] Play explosion animation and sound.
            * [ ] Merlin takes **10% health damage**.
            * [ ] Lose a **random amount** of mythical ingredients used.
            * [ ] Display "Explosion! Potion failed!" message.
            * [ ] Play Merlin's crafting animation followed by "explosion" sprite.
    * [ ] **Store Crafted Potions & Generate Spell Loadings:**
        * [ ] Add successfully crafted potions (full-power or corrupted) to Merlin's "Spell Bank" (inventory for spells).
        * [ ] Generate **three (3) spell loadings** for each crafted potion (e.g., Frost Potion -> 3 Ice Spell loadings).
        * [ ] **Synchronize Spell Loadings:** Update spell loading counts across all clients in a multiplayer session.
* **2.5 Spell Casting System (Replacing Auto-Firing) & Multiplayer Integration:**
    * [ ] **Design & Create Spell Effect Assets:**
        * [ ] Acquire/create pixel art sprites and particle systems for each spell type (e.g., Ice, Fire, Acid).
    * [ ] **Implement `SpellProjectile` Entity:**
        * [ ] Define properties (type, damage, speed).
        * [ ] Implement physics-based movement.
        * [ ] Implement collision detection with enemies and environmental elements (walls).
        * [ ] Implement multi-hit capability for the "three-squares-tall blast" effect.
    * [ ] **Implement `SpellCasting` System (`src/game/systems/SpellCasting.ts`):**
        * [ ] Assign a dedicated keyboard button to activate spellcasting.
        * [ ] Implement spell selection UI (if multiple potion types are available for casting).
        * [ ] Trigger Merlin's casting animation.
        * [ ] Manage spell cooldowns.
        * [ ] Consume one spell loading per cast.
        * [ ] **Send Spell Cast Event:** Emit a Socket.IO event when a player casts a spell, including spell type, origin, direction.
    * [ ] **Integrate Chemistry Question Presentation (Spell Casting):**
        * [ ] **Conditional Question Display:** Implement logic so that when the player has zero spells of any type, no questions appear. The moment the player successfully brews a potion and acquires spells, a question related to the first spell type acquired will appear.
        * [ ] Fetch a chemistry question from `chemistry_problems` table based on player's level/sub-subject, specific to the currently selected spell type.
        * [ ] Display the question at the **bottom center of the game window**, like subtitles, with multiple-choice answers listed below them (e.g., "1. Answer A", "2. Answer B", etc.).
        * [ ] Implement input via pressing the **corresponding number (1, 2, 3, 4, etc.)** for the desired answer.
        * [ ] Ensure game world remains active during question display (player can move, interact).
    * [ ] **Develop Spell Firing/Failure Logic:**
        * [ ] **Correct Answer:**
            * [ ] Immediately fire the spell as a large, three-squares-tall blast in Merlin's facing direction.
            * [ ] Consume one spell loading.
            * [ ] **Broadcast Spell Fired:** Emit Socket.IO event for spell firing to other clients.
        * [ ] **Incorrect Answer:**
            * [ ] Display "Spell fizzled!" on-screen message.
            * [ ] Play a "fizzle" animation/sound near Merlin.
            * [ ] Consume and waste one spell loading.
            * [ ] **Broadcast Spell Failed:** Emit Socket.IO event for spell failure.
    * [ ] **Implement Spell Effect on Enemies & Doors:**
        * [ ] For regular enemies: full-power spell = 1 hit kill; weak spell = 2 hits.
        * [ ] For boss enemies: multiple hits required (4-6 hits).
        * [ ] For doors: any spell breaks a door.
        * [ ] **Synchronize Damage/Destruction:** Send damage events to the server, and the server broadcasts enemy health updates or destruction events to all clients.
    * [ ] **Implement Spell Type Switching:**
        * [ ] Assign the **'S' key** to cycle through acquired spell types.
        * [ ] Implement logic to cycle through available spell types (e.g., Water -> Fire -> Water).
        * [ ] Update the displayed question at the bottom of the screen to match the newly selected spell type.
        * [ ] Implement a clear text delineation above the question indicating the currently selected spell type.
    * [ ] **Implement Spell UI Elements:**
        * [ ] **Spell Inventory Display:** Create a UI element in the **bottom right corner** to display the count of each spell type (e.g., "Fire Spells: 3", "Water Spells: 6", "Acid Spells: 0", "Gas Spells: 0").
        * [ ] **Game Controls/Keybinds Display:** Create a small, prominent window in the **top right corner** to display:
            * 'P': Opens the potion building modal (pauses the game).
            * 'S': Cycles through acquired spell types (and displays their respective questions).
* **2.6 Combat Loop (Boss Battles - Special Case) & Multiplayer Integration:**
    * [ ] **Implement Boss Encounter Trigger:** Define conditions for encountering a boss (e.g., last room of a dungeon).
    * [ ] **Synchronize Boss State:** Ensure boss health, position, and abilities are synchronized across clients.
    * [ ] **Implement Boss Time Dilation Phase:**
        * [ ] During boss battles, allow Merlin to re-enter "time dilation" for a limited period (e.g., 30 seconds).
        * [ ] During this phase, present multiple chemistry questions.
        * [ ] Each correct answer grants **one (1) powerful spell loading** (distinct from regular potion loadings).
        * [ ] **Synchronize Time Dilation:** Ensure all players in the boss room experience time dilation simultaneously.
    * [ ] **Implement Boss Attack Phase:**
        * [ ] After time dilation, Merlin exits and uses loaded powerful spells.
        * [ ] Boss executes its "specialty ability" (e.g., summons minions, temporary invincibility, fires dodgable projectiles).
        * [ ] Manage timer for re-entering time dilation.
        * [ ] **Synchronize Boss Attacks:** Broadcast boss attack events to all clients.

## **Phase 3: Learning & Progression Systems, and Polish**

This phase focuses on the "Ed-tech" aspects, overall game progression, and final polish, ensuring multiplayer considerations are maintained.

* **3.1 Merlin's Journal Implementation:**
    * [ ] **Design & Implement Merlin's Journal UI:**
        * [ ] Create a dedicated, visually appealing UI for Merlin's Journal (consistent with game theme).
        * [ ] Ensure it can be opened at any time during gameplay via a dedicated key (e.g., 'J').
    * [ ] **Integrate "Merlin's Study" Guide:**
        * [ ] Ensure the journal opens specifically to the "Merlin's Study" guide for the current round/sub-subject.
        * [ ] Display the current study guide content.
    * [ ] **Populate Reaction Database:**
        * [ ] Log all potion crafting attempts (correct, inaccurate, catastrophic) to the `chemical_reactions` table in Supabase for authenticated users. For guest users, log locally only.
        * [ ] Display these attempts in the Journal, showing player's answer vs. correct answer.
    * [ ] **Display Past Answers & Lesson Guides:**
        * [ ] Log all spell-casting chemistry questions and player answers to Supabase for authenticated users. For guest users, log locally only.
        * [ ] Allow players to review past spell-casting questions and their answers in the Journal.
        * [ ] Implement navigation to view past lesson guides.
* **3.2 Game Progression & Victory Conditions:**
    * [ ] **Implement Door Mechanics:**
        * [ ] Ensure doors are initially locked and unlock upon clearing a room of enemies.
        * [ ] Implement animations for doors opening/breaking.
        * [ ] Confirm spell collision with doors.
        * [ ] **Synchronize Door State:** Ensure door open/close states are synchronized across all clients.
    * [ ] **Define Final Room & Treasure:**
        * [ ] Design the final room of the dungeon.
        * [ ] Place the "lost treasure" asset within the final room.
    * [ ] **Implement Winning the Game:**
        * [ ] Implement collision detection for Merlin with the treasure asset.
        * [ ] Trigger victory sequence the moment Merlin makes contact with the treasure asset.
        * [ ] Display a victory celebration screen with score and relevant stats.
        * [ ] **Synchronize Victory:** Broadcast victory event to all clients in a session.
    * [ ] **Implement Losing the Game:**
        * [ ] Implement game over condition: if Merlin's health reaches zero.
        * [ ] Trigger game over sequence (Merlin dies animation, game over screen).
* **3.3 Content Generation & Management:**
    * [ ] **Develop Comprehensive Chemistry Question Bank:**
        * [ ] Create a large pool of chemistry questions for each `chemistry_level` and `sub_subject`.
        * [ ] Ensure a mix of `problem_type` (balancing, predicting, identifying, calculation).
        * [ ] Create static images to accompany questions where beneficial.
        * [ ] Store questions in the `chemistry_problems` table in Supabase.
    * [ ] **Acquire/Create Remaining Assets:**
        * [ ] Ensure all necessary mythical ingredient sprites, potion sprites (full-power, corrupted, health), and spell effect sprites are high-quality pixel art.
        * [ ] Acquire/create new sound effects for spellcasting, potion crafting, UI interactions, and enemy hits.
        * [ ] Acquire/create new background music tracks for different scenes (main menu, game, boss battle).
* **3.4 Performance Optimization & Bug Fixing:**
    * [ ] **Continuous Performance Monitoring:**
        * [ ] Implement FPS tracking.
        * [ ] Monitor memory usage and optimize asset loading.
        * [ ] Optimize network calls to Supabase and **Socket.IO for efficient data transfer**.
    * [ ] **Thorough Testing & Bug Fixing:**
        * [ ] Conduct extensive playtesting to identify gameplay issues, bugs, and balance problems.
        * [ ] Implement unit tests for critical game systems (e.g., inventory, spellcasting logic, damage calculation).
        * [ ] Implement integration tests for Supabase interactions and **Socket.IO communication**.
        * [ ] Use `try/catch` blocks for robust error handling, especially with external API calls.
        * [ ] **Multiplayer Specific Testing:** Test for latency, desynchronization, and edge cases in real-time interactions.
* **3.5 Polish & User Experience:**
    * [ ] **Refine UI/UX:** Ensure all UI elements are intuitive, visually appealing, and responsive across different screen sizes.
    * [ ] **Add Visual Effects & Animations:** Enhance spell effects, enemy hit reactions, potion crafting animations, and UI transitions.
    * [ ] **Sound Design:** Integrate and balance all sound effects and music to enhance immersion.
    * [ ] **Accessibility Review:** Ensure all input methods are robust and visual feedback is clear.

## **Ongoing Tasks Throughout Development**

These tasks are continuous throughout the project lifecycle.

* **Version Control:**
    * [ ] Regular, atomic commits with clear, descriptive messages.
    * [ ] Utilize a feature branch workflow for new features and bug fixes.
    * [ ] Conduct regular code reviews for major features.
    * [ ] Tag releases for stable versions.
* **Documentation:**
    * [ ] Maintain comprehensive code documentation (JSDoc for JavaScript/TypeScript).
    * [ ] Document API endpoints and Supabase schema.
    * [ ] Document **Socket.IO events and data structures**.
    * [ ] Create architecture diagrams for complex systems.
    * [ ] Maintain a development wiki for internal knowledge sharing.
* **Testing:**
    * [ ] Implement and expand unit tests for core game logic.
    * [ ] Develop integration tests for interactions between systems (e.g., inventory and crafting).
    * [ ] Conduct end-to-end testing for full gameplay loops.
    * [ ] Organize regular playtesting sessions with feedback collection.
    * [ ] **Multiplayer Testing:** Specifically test network stability, lag compensation, and synchronization accuracy.
* **Security:**
    * [ ] Ensure API keys (especially Supabase keys) are protected and not hardcoded directly in client-side code (use environment variables).
    * [ ] Implement input validation for all user inputs (e.g., chemistry answers).
    * [ ] Guard against common web vulnerabilities (e.g., XSS prevention).
    * [ ] Implement rate limiting for Supabase calls and **Socket.IO events** if necessary to prevent abuse.
* **Performance Monitoring:**
    * [ ] Continuously monitor game performance (FPS, load times).
    * [ ] Profile memory usage to identify and resolve leaks.
    * [ ] Optimize network requests to Supabase and **Socket.IO for efficiency and low latency**.
    * [ ] Optimize asset sizes and loading strategies.

## **Future Functionality (To be Added Later)**

* **Multiplayer Functionality:**
    * [ ] Add "Multiplayer" button to the main menu.
    * [ ] Implement UI for selecting the number of participants for multiplayer gameplay.
    * [ ] **Note:** This feature is to be implemented later in the development cycle.