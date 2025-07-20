# **Merlin's Grimoire: Chemistry Edition (Simplified MVP)**

## **Executive Summary**

**Product Name:** Merlin's Grimoire: Chemistry Edition (Simplified MVP)
**Version:** 2.0 (Simplified)
**Development Timeline:** Rapid build for rush deadline
**Platform:** Browser-based, no backend required

A focused educational wizard game centered on chemistry. Players traverse labyrinths, collect materials, and craft potions through solving chemistry problems. The game features persistent educational questions that control spell-casting duration and a simplified potion system focused on reaching a treasure protected by a crystal wall. All data is stored locally in the browser with no backend requirements.

## **Product Vision**

Create an engaging educational gaming experience where chemistry knowledge directly controls gameplay mechanics, making STEM learning fun through immediate feedback and consequence-based learning.

## **Target Audience**

* High school students (Ages 14-18) studying chemistry
* College students (Ages 18-22) in introductory chemistry courses
* Educators seeking integrated learning tools focused on chemistry

## **Core Game Concept**

**Game Overview:** Players control Merlin through procedurally generated labyrinths, collecting materials to craft potions while answering chemistry questions to activate spell-firing abilities. The ultimate goal is to craft an Acid Potion to break through a crystal wall and reach the treasure.

**Core Gameplay Loop:**

1. **Game Start & Level Selection:**
   * Main menu with "Solo" or "2-Player Local" options
   * Select chemistry level (e.g., High School Chem 1, Organic Chemistry, Biochemistry)
   * Choose sub-subject focus or "Random" 
   * All selections stored temporarily in browser session

2. **Pre-Game Study (Optional):**
   * "Merlin's Study" appears with current lesson content
   * Can be skipped or closed after 10 seconds
   * Accessible during gameplay via M key (Player 1) or R key (Player 2)

3. **Material Collection:**
   * Four material types scattered throughout the dungeon:
     - Item A & Item B (for Health Potions)
     - Item C & Item D (for Acid Potions)
   * Materials collected on contact and stored in browser-based inventory

4. **Persistent Question System (Spell Activation):**
   * Multiple-choice questions always displayed at bottom of screen
   * 6 answer options per question
   * **Correct Answer:** Grants 4 seconds of automatic spell-firing
   * **Incorrect Answer:** Lose 5 HP
   * Time accumulates if answering faster than spell duration expires

5. **Potion Crafting System:**
   * Press P key (Player 1) or T key (Player 2) to open crafting interface
   * Time pauses when crafting interface is open
   * Select 2 materials from inventory
   * Solve 6-option chemistry problem related to reaction
   * **Success:** Potion created
   * **Failure:** Take 10 HP damage

6. **Potion Types:**
   * **Health Potion (Items A + B):** Automatically restores full health upon creation
   * **Acid Potion (Items C + D):** Required to break crystal wall around treasure

7. **Victory Condition:**
   * Navigate to treasure location
   * Use Acid Potion to break crystal wall
   * Touch treasure to win

8. **Failure Condition:**
   * Game over when health reaches 0

## **Gameplay Systems**

### **Movement & Controls**

**Solo Play:**
* Movement: WASD or Arrow keys
* Open Potion Crafting: P key
* Open Merlin's Study: M key

**2-Player Local:**
* Player 1: Arrow keys for movement, P for potions, M for study
* Player 2: WASD for movement, T for potions, R for study
* Spawn in same room, at near same spot, can't do damage to eachother.

### **Combat System**

* Retains existing auto-targeting from base game
* Spell firing only active when earned through correct answers
* Enemies behave as in original game (6 types with existing AI)
* No manual spell casting or spell types

### **Health System**

* Maximum 50 HP
* Damage sources:
  - Enemy attacks: 10-20 damage
  - Wrong chemistry answers: 5 damage  
  - Failed potion crafting: 10 damage
* Healing: Only through crafting Health Potions

### **Inventory System**

* Browser-based storage (no backend)
* Tracks quantities of Items A, B, C, and D
* Displayed in potion crafting interface
* Materials consumed upon crafting attempt

## **Educational Integration**

### **Question System**

* Questions loaded from local JSON/dictionary files
* Categories based on selected chemistry level and sub-subject
* Two question contexts:
  1. **Persistent Spell Questions:** Control spell-firing duration
  2. **Potion Crafting Questions:** Determine crafting success

### **Question Types**

* Balancing chemical equations
* Predicting reaction products
* Identifying reaction types
* Basic calculations (molar mass, stoichiometry)
* All presented as 6-option multiple choice

### **Merlin's Study**

* Pre-game optional review of current lesson
* Accessible during gameplay 
* Contains study guide for selected sub-subject
* No progress tracking or history

## **Technical Specifications**

### **Scene Flow & Asset Loading**

* **No Boot Scene Required:** MainScene already handles asset loading efficiently
* **Scene Navigation Flow:** 
  ```
  MenuScene → ChemistryLevelSelectScene → SubSubjectSelectScene → MerlinsStudyScene → MainScene
  ```
* **Asset Loading Strategy:**
  - Menu-specific assets (UI elements, backgrounds) loaded in MenuScene
  - Game assets remain in MainScene preload where they're used
  - Prevents loading unnecessary assets during menu navigation

### **Window Sizing**

* **Single Player:** Standard 800x600 resolution
* **Local 2-Player:** Dynamic resize to 1600x800 when "2-Player Local" selected
* **Implementation:** Canvas dynamically resizes based on game mode selection

### **Data Storage**

* All game data stored in browser session
* No external database connections
* Questions stored in local JSON files
* Inventory tracked in JavaScript objects

### **User Interface**

**Main Elements:**
* Health bar (top-left)
* Persistent question display (bottom-center)
* Answer options (1-6) below question
* Current spell-firing time remaining (if active)

**Potion Crafting Interface:**
* Material inventory display
* Recipe requirements (2 materials)
* Chemistry problem presentation
* 6 multiple-choice options
* Success/failure feedback

### **Asset Requirements**

* Merlin sprites (existing)
* Enemy sprites (existing 6 types)
* Material sprites (4 unique items)
* Crystal wall sprite
* Treasure chest sprite
* Potion effect animations
* UI elements

## **Simplified Features Summary**

### **Removed from Previous Version:**
* ❌ Supabase backend and authentication
* ❌ Online multiplayer via Socket.IO
* ❌ User accounts and progress tracking
* ❌ Merlin's Journal with history
* ❌ Complex potion system (Fire, Water, Gas types)
* ❌ Spell inventory and loadings
* ❌ Boss battles with special mechanics
* ❌ Door-breaking mechanics
* ❌ Weak vs full-power potions
* ❌ Spell type switching

### **Core Features Retained:**
* ✅ Procedural dungeon generation
* ✅ 6 enemy types with existing AI
* ✅ Basic movement and collision
* ✅ Educational chemistry questions
* ✅ Local 2-player support (Two screens on windows)
* ✅ Study guide access

### **New Simplified Features:**
* ✅ Persistent questions for spell activation
* ✅ Time-based spell firing
* ✅ 2 potion types only
* ✅ Crystal wall treasure protection
* ✅ Browser-only data storage 