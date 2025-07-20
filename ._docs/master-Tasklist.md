# **Simplified Tasklist: Merlin's Grimoire - Chemistry Edition**

This tasklist outlines the development process for the simplified version of "Merlin's Grimoire: Chemistry Edition," focusing on rapid implementation with browser-only functionality, simplified potion/spell systems, and local 2-player support.

## **Implementation Notes**

### **Boot Scene Decision**
- **No Boot Scene Required:** Since MainScene already handles asset loading efficiently, we're skipping the boot scene to maintain simplicity
- **Asset Loading Strategy:**
  - Menu assets (UI elements, backgrounds) load in MenuScene
  - Game assets remain in MainScene preload
  - This prevents unnecessary asset loading during menu navigation
- **Scene Flow:** MenuScene → ChemistryLevelSelectScene → SubSubjectSelectScene → MerlinsStudyScene → MainScene

### **Multiplayer Considerations**
- Canvas dynamically resizes to 1600x800 when "2-Player Local" is selected
- Camera system should follow both players
- Consider split-screen implementation if players separate too far

## **Phase 1: Core Game Adaptation & Scene Management**

### **1.1 Scene Structure & Navigation**
* [ ] **Implement Main Menu Scene:**
    * [ ] Create title screen with game logo
    * [ ] Add "Solo Play" button
    * [ ] Add "2-Player Local" button (triggers canvas resize to 1600x00)
    * [ ] Add "Settings" button (volume controls)
    * [ ] Add "Credits" button
    * [ ] **Add "Q" key functionality to quit to main menu from gameplay**
    * [ ] Load menu-specific assets (backgrounds, UI elements) in preload
    * [ ] Initialize session storage for game data

* [ ] **Create Chemistry Level Selection Scene:**
    * [ ] Design UI for academic level selection
    * [ ] Options: "High School Chem 1", "Organic Chemistry", "Biochemistry"
    * [ ] Store selection in browser session storage
    * [ ] Pass data to next scene using Phaser scene data: `this.scene.start('SubSubjectSelectScene', { chemistryLevel: selectedLevel })`
    * [ ] Transition to Sub-Subject Selection

* [ ] **Create Sub-Subject Selection Scene:**
    * [ ] Design UI for sub-subject selection within chosen level
    * [ ] Add "Random" option
    * [ ] Store selection in session storage
    * [ ] Pass accumulated data to next scene
    * [ ] Transition to Merlin's Study

* [ ] **Implement Merlin's Study Scene (Pre-Game):**
    * [ ] Design study guide UI with medieval theme
    * [ ] Load content based on selected sub-subject from local JSON
    * [ ] Add 3-second auto-skip timer
    * [ ] Add "Skip" button
    * [ ] Pass all game configuration data to MainScene
    * [ ] Transition to MainScene (Game)

### **1.2 Player Controls & Movement**
* [ ] **Adapt Single Player Controls:**
    * [ ] Confirm WASD/Arrow keys for movement
    * [ ] Implement P key for potion crafting
    * [ ] Implement M key for Merlin's Study access
    * [ ] Add Q key to quit to main menu

* [ ] **Implement Local 2-Player Support:**
    * [ ] Player 1: Arrow keys movement, P for potions, M for study
    * [ ] Player 2: WASD movement, T for potions, R for study
    * [ ] Handle simultaneous input from both players
    * [ ] Spawn second Merlin sprite with different color/tint 
    * [ ] Make Spawn near the same point in the same room &, they can't do damage to eachother. 
    * [ ] If enemy encounters both of them they randomly choose which to attack. 50/50 chance
    * [ ] Implement camera system that follows both players
    * [ ] Consider split-screen if players get too far apart

## **Phase 2: Material & Inventory System**

### **2.1 Material Implementation**
* [ ] **Create Material Entities:**
    * [ ] Design/acquire sprites for Items A, B, C, and D
    * [ ] Implement `Material` class with type property
    * [ ] Add collection animation (fade out, particle effect)

* [ ] **Implement Material Spawning:**
    * [ ] Random placement throughout dungeon rooms
    * [ ] Ensure balanced distribution of all 4 types
    * [ ] Set appropriate spawn density (materials per room)

* [ ] **Create Browser-Based Inventory:**
    * [ ] Implement `Inventory` class using JavaScript Map/Object
    * [ ] Track quantities of each material type
    * [ ] Functions: `addMaterial()`, `removeMaterial()`, `hasMaterials()`
    * [ ] Store in session storage for persistence during gameplay

### **2.2 Collection Mechanics**
* [ ] **Implement Pickup System:**
    * [ ] Collision detection between player and materials
    * [ ] Add to inventory on contact
    * [ ] Play collection sound/animation
    * [ ] Update UI to show current inventory counts

## **Phase 3: Educational Question System**

### **3.1 Question Database Setup**
* [ ] **Create Local Question Storage:**
    * [ ] Design JSON structure for chemistry questions
    * [ ] Categories: chemistry level, sub-subject, difficulty
    * [ ] Include question text, 6 answer options, correct answer
    * [ ] Create initial question bank (minimum 50 questions per level)

* [ ] **Implement Question Loading System:**
    * [ ] Load questions from JSON files
    * [ ] Filter by selected level and sub-subject
    * [ ] Random selection without immediate repeats

### **3.2 Persistent Question Display**
* [ ] **Create Question UI Component:**
    * [ ] Position at bottom-center of screen
    * [ ] Display question text clearly
    * [ ] Show 6 numbered answer options (1-6)
    * [ ] Highlight on hover/selection

* [ ] **Implement Answer Input:**
    * [ ] Listen for number keys 1-6
    * [ ] Visual feedback on selection
    * [ ] Process answer immediately

* [ ] **Create Spell Timer System:**
    * [ ] Track remaining spell-firing time
    * [ ] Display timer visually (progress bar or countdown)
    * [ ] Accumulate time for consecutive correct answers

### **3.3 Question Response Logic**
* [ ] **Correct Answer Handling:**
    * [ ] Add 4 seconds to spell-firing timer
    * [ ] Play success sound/visual effect
    * [ ] Load next question
    * [ ] Enable weapon auto-firing if not already active

* [ ] **Incorrect Answer Handling:**
    * [ ] Deduct 5 HP from player
    * [ ] Play error sound/visual effect
    * [ ] Flash screen red briefly
    * [ ] Load next question

## **Phase 4: Potion Crafting System**

### **4.1 Crafting Interface**
* [ ] **Create Potion Crafting Modal:**
    * [ ] Full-screen overlay with medieval aesthetic
    * [ ] Display current inventory counts
    * [ ] Show recipe requirements for each potion type
    * [ ] Material selection interface

* [ ] **Implement Time Pause:**
    * [ ] Pause all game entities when crafting opens
    * [ ] Apply visual effect (blur/darken background)
    * [ ] Resume on crafting complete/cancel

### **4.2 Crafting Mechanics**
* [ ] **Recipe System:**
    * [ ] Health Potion: Items A + B
    * [ ] Acid Potion: Items C + D
    * [ ] Display requirements clearly
    * [ ] Validate material availability

* [ ] **Chemistry Problem Integration:**
    * [ ] Present chemistry problem when materials selected
    * [ ] 6 multiple-choice options
    * [ ] Different problem types for each potion

* [ ] **Crafting Results:**
    * [ ] **Success:** Create potion, consume materials
    * [ ] **Failure:** Deal 10 damage, consume materials
    * [ ] Appropriate animations/sounds for each outcome

### **4.3 Potion Effects**
* [ ] **Health Potion Implementation:**
    * [ ] Automatically restore player to full health on creation
    * [ ] No inventory storage needed (instant use)
    * [ ] Healing animation/particle effect (just make charcter flash with green)

* [ ] **Acid Potion Implementation:**
    * [ ] Store in player inventory (max 1 at a time)
    * [ ] Display "Acid Potion Ready" indicator
    * [ ] Required for crystal wall interaction

## **Phase 5: Combat & Spell System Modifications**

### **5.1 Spell-Firing Control**
* [ ] **Modify Weapon Manager:**
    * [ ] Disable default auto-firing behavior
    * [ ] Create `canFire` flag controlled by spell timer
    * [ ] Enable firing only when timer > 0

* [ ] **Timer Management:**
    * [ ] Decrease timer by delta time each frame
    * [ ] Disable firing when timer reaches 0
    * [ ] Visual indicator for active/inactive state

### **5.2 Existing Enemy Integration**
* [ ] **Verify Enemy Systems:**
    * [ ] Confirm all 6 enemy types functioning
    * [ ] Ensure pathfinding and AI work correctly
    * [ ] No changes to enemy health/damage values

## **Phase 6: Victory Condition & Crystal Wall**

### **6.1 Crystal Wall Implementation**
* [ ] **Create Crystal Wall Entity:**
    * [ ] Design/acquire crystal wall sprite
    * [ ] Place around treasure
    * [ ] Implement collision blocking
    * [ ] Add shimmer/glow effect

* [ ] **Acid Potion Interaction:**
    * [ ] Detect when player with Acid Potion touches wall
    * [ ] Trigger breaking animation
    * [ ] Remove wall collision
    * [ ] Consume Acid Potion

### **6.2 Treasure & Victory**
* [ ] **Treasure Placement:**
    * [ ] Ensure treasure
    * [ ] Surrounded by crystal wall
    * [ ] Use existing treasure sprite/animation

* [ ] **Victory Trigger:**
    * [ ] Detect player collision with treasure
    * [ ] Trigger existing victory sequence
    * [ ] Show completion stats (time, enemies defeated)

## **Phase 7: UI & Polish**

### **7.1 Game HUD Updates**
* [ ] **Health Bar:** Already implemented
* [ ] **Spell Timer Display:**
    * [ ] Add timer bar or countdown
    * [ ] Position near health bar
    * [ ] Color coding (green=active, red=inactive)

* [ ] **Inventory Display:**
    * [ ] Small icons for Items A, B, C, D with counts
    * [ ] Position in corner of screen
    * [ ] Update in real-time

* [ ] **Acid Potion Indicator:**
    * [ ] Special UI element when Acid Potion ready
    * [ ] Prominent but non-intrusive placement

### **7.2 In-Game Study Access**
* [ ] **Merlin's Study Modal:**
    * [ ] Accessible via M key (Player 1) or R key (Player 2)
    * [ ] Pause game when opened
    * [ ] Display current lesson content only
    * [ ] Close button or ESC to resume

### **7.3 2-Player UI Considerations**
* [ ] **Split UI Elements:**
    * [ ] Separate health bars for each player
    * [ ] Individual spell timers
    * [ ] Shared inventory display
    * [ ] Clear player indicators

## **Phase 8: Content & Assets**

### **8.1 Question Content Creation**
* [ ] **High School Chemistry Questions:**
    * [ ] Basic equations and balancing
    * [ ] Simple reaction identification
    * [ ] Fundamental calculations
    * [ ] Create 50+ questions with answers

* [ ] **Organic Chemistry Questions:**
    * [ ] Functional group reactions
    * [ ] Basic organic mechanisms
    * [ ] Nomenclature questions
    * [ ] Create 50+ questions with answers

* [ ] **Biochemistry Questions:**
    * [ ] Protein/enzyme questions
    * [ ] Metabolic pathways basics
    * [ ] pH and buffer systems
    * [ ] Create 50+ questions with answers

### **8.2 Study Guide Content**
* [ ] **Write Study Guides:**
    * [ ] One guide per sub-subject
    * [ ] Concise, focused content
    * [ ] Medieval theme/language where appropriate
    * [ ] Store in JSON with questions

### **8.3 Asset Requirements**
* [ ] **New Sprites Needed:**
    * [ ] Items A, B, C, D (distinct, recognizable)
    * [ ] Crystal wall (magical appearance)
    * [ ] Potion crafting UI elements
    * [ ] Player 2 Merlin variant (color difference)

* [ ] **Sound Effects:**
    * [ ] Material collection
    * [ ] Correct/incorrect answer
    * [ ] Potion success/failure
    * [ ] Crystal wall breaking

## **Phase 9: Testing & Optimization**

### **9.1 Gameplay Testing**
* [ ] **Single Player Testing:**
    * [ ] Full playthrough all chemistry levels
    * [ ] Question randomization verification
    * [ ] Spell timer accumulation
    * [ ] Victory condition achievement

* [ ] **2-Player Testing:**
    * [ ] Control scheme conflicts
    * [ ] Shared inventory functionality
    * [ ] Both players can craft potions
    * [ ] Screen space and camera handling

### **9.2 Educational Testing**
* [ ] **Question Validation:**
    * [ ] Verify all questions have correct answers
    * [ ] Check difficulty progression
    * [ ] Ensure variety in question types

* [ ] **Learning Flow:**
    * [ ] Study guide to gameplay connection
    * [ ] Immediate feedback effectiveness
    * [ ] Penalty/reward balance

### **9.3 Performance Optimization**
* [ ] **Browser Performance:**
    * [ ] Test on various browsers
    * [ ] Optimize for lower-end devices
    * [ ] Memory usage monitoring
    * [ ] Frame rate optimization

## **Ongoing Throughout Development**

* **Version Control:**
    * [ ] Regular commits with clear messages
    * [ ] Branch for major features
    * [ ] Tag stable builds

* **Documentation:**
    * [ ] Code comments for complex systems
    * [ ] README with setup instructions
    * [ ] Controls reference guide

* **Playtesting:**
    * [ ] Regular testing sessions
    * [ ] Gather feedback on difficulty
    * [ ] Iterate on question clarity
    * [ ] Balance material spawn rates

## **Removed Features (No Longer Required)**

* ❌ All Supabase backend integration
* ❌ User authentication and accounts
* ❌ Socket.IO server and online multiplayer
* ❌ Progress tracking and leaderboards
* ❌ Merlin's Journal with history
* ❌ Complex potion types (Fire, Water, Gas)
* ❌ Spell inventory and type switching
* ❌ Boss battles with special mechanics
* ❌ Door-breaking with spells
* ❌ Weak vs full-power potions
* ❌ Material rarity system
* ❌ Cross-device synchronization 