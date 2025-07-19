# **Merlin's Grimoire: Chemistry Edition (Adapted MVP)**

## **Executive Summary**

**Product Name:** Merlin's Grimoire: Chemistry Edition (Adapted MVP)
**Version:** 1.1 (Adapted MVP)
**Development Timeline:** Focused for rapid build, leveraging existing codebase
**Platform:** Browser-based

A focused educational wizard game centered on chemistry. Players traverse labyrinths, collect mythical chemical materials, and craft potions through real chemical reactions. These potions are then activated into spells by solving chemistry problems through **multiple-choice input**, which are used to defeat King Arthur-lore-based enemies and open doors. The game provides immediate feedback on chemical accuracy and problem-solving, integrating educational outcomes directly into engaging gameplay. This version adapts an existing top-down dungeon shooter, retaining its core movement, enemy systems, and map generation, while integrating new educational mechanics, a robust backend (Supabase), and **real-time multiplayer capabilities via Socket.IO**.

## **Product Vision**

Create an immersive educational gaming experience where fundamental chemistry knowledge enables potion creation and problem-solving determines spell effectiveness, making STEM learning engaging through magical gameplay mechanics. This MVP focuses solely on the chemistry-driven experience to ensure a solid core, now with the added dimension of real-time multiplayer interaction.

## **Target Audience**

* High school students (Ages 14-18) studying chemistry.
* College students (Ages 18-22) in introductory chemistry courses.
* Educators seeking integrated learning tools focused on chemistry.

## **Core Game Concept**

**Game Overview:** Players race through procedurally generated labyrinths as wizard alchemists, collecting mythical chemical materials to craft potions. These potions are then used to activate spells by solving chemistry problems, enabling them to defeat King Arthur-lore-based enemies and open doors, all while searching for a special treasure at the center of the labyrinth. The game will leverage the existing "Merlin's Grimoire" base as a starting point, keeping its core map mechanics, enemy behaviors, and general game flow, and extending it with real-time multiplayer via Socket.IO.

**Core Gameplay Loop:**

1.  **Player Onboarding (First Playthrough):**
    * Upon opening the game for the first time, the player will choose their current academic level in chemistry (e.g., High School Chem 1, Organic Chemistry, Biochemistry). This chosen level will be stored with the user's profile.
2.  **Sub-Subject Selection (Start of Each Level/Session):**
    * At the start of every new game level or session, the player will have the option to select "Random" for a sub-subject within their chosen chemistry level, or manually pick a specific sub-subject (e.g., "Reaction Times," "Gas Reactions," "Basic Organic Reactions").
3.  **"Merlin's Journal" / "Merlin's Study" (Pre-Level Review - Optional):**
    * Before gameplay begins for a new level, "Merlin's Journal" will appear, specifically opening to the "Merlin's Study" guide for the current round.
    * This is an optional review period presenting a short, engaging study guide on the specific chemistry concepts to be covered. The player can skip it or close it at any time (e.g., after 10 seconds).
4.  **Labyrinth Exploration Begins:** The player (Merlin) starts at a specific point within a 3x3 procedurally generated dungeon.
5.  **Material Collection:**
    * Merlin traverses the labyrinth, actively searching for **mythical chemical materials** scattered throughout the environment (e.g., Frost Giant Foot, Gremlin's Toenail, Dragon's Tooth, Fairy Feather, Mercury Vial). Each material will have a unique sprite.
    * Upon contact, materials are collected and added to Merlin's inventory.
    * **Potion Material Requirements:** There are four potion types: Fire, Water, Gas, and Acid. For each of these four potion types, two specific types of materials must be collected. These material requirements are consistent for a given potion type (e.g., Fire potions always require Material A and Material B).
6.  **Initiate Potion Crafting (Pop-up Modal & Time Dilation):**
    * Once the two required materials for a specific potion type are collected, the player can initiate the brewing process by pressing a dedicated key (e.g., 'P').
    * This opens a pop-up modal and causes all action around Merlin to pause (time dilation).
    * **Visual Transition:** Merlin performs a specific sprite action (e.g., raising hands, eyes glowing), all action around him pauses, and the screen changes to a dedicated view of Merlin (e.g., standing, thinking, holding a cauldron).
7.  **Potion Crafting Interface:**
    * Within this interface, the player sees their current **mythical ingredient inventory**.
    * A "recipe" for the potion will be explicitly displayed (e.g., "Requires: 1x Frost Giant Foot, 1x Mercury Vial, 1x Fairy Feather"). The player selects these items from their inventory into designated slots.
    * Once ingredients are selected, a **difficult, academic-level chemistry problem** related to the potion type being brewed is presented. This problem is a **standalone question (unrelated to the mythical ingredients)**, serving as the core educational challenge.
8.  **Submit Reaction & Receive Feedback:** The player provides their answer to the chemistry problem.
    * **Input Method:** **Six (6) multiple-choice** answers.
    * **Visuals:** Static images will accompany chemistry questions to provide context or illustrations, but these will not be interactive.
    * **Visual & Textual Feedback:**
        * **Successful Brewing (Correct Reaction):** If the player selects the correct answer, the potion is successfully brewed. A perfect potion appears with a success animation and clear message (e.g., "Potion of Frost crafted!"). This creates a "full-power" potion. An animation of Merlin putting chemicals into the cauldron occurs, and the "strong" potion sprite is shown. Upon successful brewing and "drinking" the potion, the player immediately gains **three (3) spells of that potion's type** (e.g., three Fire spells for a Fire potion).
        * **Inaccurate/Suboptimal Reaction:** If the answer is partially correct or has minor errors, a visually flawed potion is created, labeled "corrupted." This results in a "weak" potion. An animation of Merlin putting chemicals into the cauldron occurs, and the "weak" potion sprite is shown. This also grants three spells, but they are "weak" spells.
        * **Failed Brewing (Catastrophic Failure):** If the player selects the incorrect answer, the potion will explode. An explosion animation occurs within the crafting module. Merlin takes **10% health damage**. A **random amount** of the mythical ingredients used in that attempt are lost. An explicit error message appears (e.g., "Explosion! Potion failed!"). An animation of Merlin putting chemicals into the cauldron occurs, followed by an "explosion" animation sprite.
9.  **Potion Stored & Spell Loadings:**
    * Successfully crafted potions (full-power or corrupted) are added to Merlin's "Spell Bank" (inventory).
    * Every correctly crafted potion (full-power or corrupted) creates **three (3) spell loadings** of that specific potion type (e.g., Frost Potion for Ice Spells, Flame Potion for Fire Spells, Acid Potion for Acidic Spells).
10. **Encounter Obstacle (Door or Enemy):** Merlin continues exploring until he encounters a door or an enemy. The existing game's enemy types and characteristics, including their AI behavior, will be largely retained.
11. **Initiate Spell Casting:** To overcome the obstacle, Merlin must cast a spell. The **Auto-Targeting** and **Weapon Management** system of the existing base game will be removed and replaced with this spell-casting system.
12. **Spell Availability and Questions:**
    * When the player has zero spells of any type, no questions will appear at the bottom center of the game window.
    * The moment the player successfully brews a potion and acquires spells, a chemistry question related to the first spell type acquired will appear at the **bottom center of the game window**.
    * This question will be specific to the currently selected spell type.
13. **Casting a Spell:**
    * To cast a spell, the player must correctly answer the multiple-choice question displayed at the bottom of the screen by pressing the **corresponding number (1, 2, 3, 4, etc.)** for the desired answer.
    * **Correct Answer:** If the correct number is pressed, the spell fires immediately. The spell fires as a large, three-squares-tall blast originating from Merlin and extending in the direction he is facing. This "ray" effect will hit any enemies within its path (one square above Merlin, one square at Merlin's height, and one square below Merlin). This will also apply to doors. One spell loading is consumed.
    * **Incorrect Answer:** If the incorrect number is pressed, the spell is wasted (consumed without effect). The spell fails to fire, and **one spell loading is consumed and wasted**. An on-screen message (e.g., "Spell fizzled!") indicates the failure.
14. **Switching Spell Types:**
    * Players can switch between the different spell types they have acquired by pressing the **'S' key**.
    * Pressing 'S' will cycle through the available spell types. For example, if the player has Water and Fire spells, pressing 'S' will switch from Water to Fire, and pressing 'S' again will switch back to Water.
    * The currently selected spell type will be clearly indicated with a delineation (e.g., text) above the question at the bottom of the screen.
15. **Enemy/Door Resolution:**
    * **Regular Enemies:** If hit by a full-power spell, regular enemies (found throughout the labyrinth) are defeated with a single shot. If hit by a weak spell, they take half damage and require two hits to be defeated.
    * **Boss Enemies:** Boss enemies (found solo in their own chambers) can take multiple hits (e.g., 4-6 hits) and will have a "specialty ability" that makes them trickier (e.g., summons weak minions, temporary invincibility, fires a dodgable projectile).
    * **Door Opening:** For the initial MVP, any spell can break a door.
16. **Combat Loop (Boss Battles - Special Case):**
    * During boss battles, Merlin can re-enter "time dilation" for a limited period (e.g., 30 seconds).
    * Within this time, Merlin answers multiple chemistry questions to load "powerful spells." Each correct answer grants **one (1) powerful spell loading**. These are distinct from standard potion loadings.
    * After the time limit, Merlin exits time dilation and uses the loaded spells to attack and avoid the boss until the timer resets and he needs to re-enter time dilation.
17. **Continue Exploration/Seek Goal:** Merlin continues to traverse the labyrinth, collecting more materials, crafting more potions, and defeating more enemies, all while working towards finding a special material/treasure (e.g., King Arthur lore-based item) at the end of the labyrinth to win.
18. **Merlin's Journal Access:** At any point during gameplay, the player can open "Merlin's Journal" via a dedicated key (e.g., 'J').

## **Chemistry Foundation - "The Alchemist's Craft" (MVP Scope)**

**Material Collection System:**

* **Specific Ingredients:** Players will collect specific **mythical ingredients** (e.g., Frost Giant Foot, Gremlin's Toenail) throughout the dungeon.
* **Inventory Tracking:** The inventory system will track quantities of each mythical material collected.
* **Potion Types and Materials:** There are four potion types: Fire, Water, Gas, and Acid. Each potion type requires two specific types of materials to be collected, and these requirements are consistent for a given potion type.

**Apothecary Chamber Mechanics:**

* **Interactive Lab Interface:** Accessed via a dedicated key (e.g., 'P').
* **Reaction Execution:** Player selects mythical ingredients based on a displayed recipe, then solves a **difficult, academic-level chemistry problem** related to the potion type being brewed.
* **Equation Balancing:** Players must correctly balance chemical equations as part of the problem-solving (for relevant question types).

**Potion Crafting Process:**

1.  **Material Identification:** Recognize required mythical components from the displayed recipe.
2.  **Ingredient Consumption:** Upon attempting to craft a potion, the selected mythical materials are consumed from Merlin's inventory.
3.  **Reaction Execution:** Player solves a presented chemistry problem.
4.  **Product Creation & Feedback:**
    * **Failed Brewing (Catastrophic Failure):** Explosion animation, Merlin takes **10% health damage**, a **random amount** of the input mythical materials are lost, and an explicit error message.
    * **Inaccurate/Suboptimal:** Visual corruption of the resulting potion (e.g., wrong color, odd bubbling) and a distinct message indicating "Imperfect Synthesis." This yields a "weak" potion. No materials are lost from the attempt for potion creation. This also grants three spells, but they are "weak" spells.
    * **Successful Brewing (Correct Reaction):** Visually perfect potion, success animation, and clear success message. This yields a "full-power" potion. Upon successful brewing and "drinking" the potion, the player immediately gains **three (3) spells of that potion's type**.
5.  **Health Potion:**
    * **Definition:** A specific type of potion that restores Merlin's health.
    * **Recipe:** Define a specific recipe for a "Health Potion" using mythical ingredients.
    * **Effect:** When crafted and used, it restores a significant portion of Merlin's health (e.g., 50% or 100%).
    * **Rarity:** Its mythical ingredients or its chemistry problem should be designed to make it "rare to make."

**Progression Levels (Chemistry Focus):**

* **Level 1:** Basic inorganic reactions (acid-base neutralization, precipitation).
* **Level 2:** Basic Organic chemistry (functional group reactions).
* **Level 3:** General knowledge chemistry questions, such as reaction times calculations or identifying the category of an element (e.g., "noble gas").

## **Integrated Combat System (MVP Scope)**

**Enemy Encounters:**

* **Collision Detection:** When players meet enemies in corridors.
* **Enemy Types (Mechanically):** The game will utilize the six distinct enemy types from the base game (Zombie, Skeleton, Ninja, Chomper, Troll, Slug) with their existing health, speed, damage, and AI behaviors (Pathfinding, Target Acquisition, Smart Movement, Attack Patterns).
    * **Regular Enemies:** Found throughout the labyrinth. Defeated with a single full-power spell shot or two weak spell shots.
    * **Boss Enemies:** Solo in their own chambers at the end of rooms. Can take multiple hits (e.g., 4-6 hits) and will have a "specialty ability."
* **Merlin's Health:** Merlin has a maximum of **50 HP** and takes **10-30 damage** from enemy attacks. He has **1-second invulnerability frames** after taking damage. Merlin can take approximately **10 blows** (meaning 100% health, each blow reduces 10% health). Game over occurs when health reaches 0.

**Battle Phases (Simplified for MVP):**

1.  **Spell Casting Question & Multiple-Choice Input:** A chemistry question appears at the bottom of the screen. The player selects the answer from multiple-choice options by pressing the corresponding number.
2.  **Spell Firing/Failure:**
    * **Correct Answer:** Spell fires immediately, projecting at ~60-degree angle. One spell loading is consumed.
    * **Incorrect Answer:** Spell fails, one spell loading is consumed and wasted.
3.  **Damage Application:** Enemy takes damage based on spell effectiveness. Outcome determination (enemy defeated or battle continues).

## **Educational Integration (MVP Scope)**

**Chemistry Mastery Track (MVP Focus):**

* **Atomic Structure:** Understand electron configurations for reaction prediction.
* **Chemical Bonding:** Ionic, covalent, and metallic bond formation.
* **Reaction Mechanisms:** Step-by-step pathway understanding.

**Merlin's Journal / Merlin's Study (MVP Scope):**

* **Integrated Study Guide & Progress Tracking:** The opening window of "Merlin's Study" *is* Merlin's Journal, specifically opening to the current study guide for the current round.
* **Accessibility:** Merlin's Journal should be openable at any time during gameplay via a dedicated key (e.g., 'J').
* **Content:**
    * **Current Study Guide:** Presents the specific chemistry concepts to be covered in the current level's gameplay. This can be reviewed for 10 seconds or skipped.
    * **Reaction Database:** All reactions Merlin attempts during a quest (both correct and incorrect) are added to the Journal. It will show the player's correct and incorrect attempts.
    * **Past Lesson Guides:** Players can navigate within the journal to see past lesson guides.
    * **Past Answers:** Players can review past reactions and spell-casting questions they answered (both correct and incorrect).
* **Supabase Integration for Learning Data:** Update player's chemistry "strength" scores based on performance, store incorrect reaction details, and incorrect spell-casting answers for journal review.
    * **Suggestion:** Define how "chemistry strength scores" are calculated (e.g., percentage of correct answers, speed, number of explosions). How will this score be used or displayed to the player?

## **Technical Specifications (MVP Focus)**

**User Interface Design (MVP Scope):**

* **Potion Building Mode / Apothecary Chamber Interface:**
    * **Activation:** Accessed by pressing a designated key ('P').
    * **Time Dilation Visuals:** Visual effect of surrounding environment slowing down or freezing upon entry, and resuming upon exit.
    * **Mythical Chemical Inventory:** Visual organization of collected mythical materials.
    * **Reaction Workspace:** Input area for solving chemistry problems.
        * **Input Method:** **Six (6) multiple-choice** questions.
    * **Feedback Indicators:**
        * **Failed Brewing (Catastrophic Failure):** Explosion animation, health damage display, material loss indication, and explicit error message.
        * **Inaccurate/Suboptimal:** Visual corruption of the resulting potion (e.g., wrong color, odd bubbling) and a distinct message indicating "Imperfect Synthesis."
        * **Successful Brewing (Correct Reaction):** Visually perfect potion, success animation, and clear success message.
* **Spell UI Elements:**
    * **Question Display:** Chemistry questions for spell casting will be displayed at the **bottom center of the game window**, with multiple-choice answers listed below them (e.g., "1. Answer A", "2. Answer B", etc.). The currently selected spell type will be clearly indicated with a delineation (e.g., text) above the question. No questions will appear if the player has zero spells.
    * **Spell Inventory Display:** In the **bottom right corner** of the game window, there will be a clear inventory displaying the count of each spell type the player possesses (e.g., "Fire Spells: 3", "Water Spells: 6", "Acid Spells: 0", "Gas Spells: 0").
    * **Game Controls/Keybinds Display:** A small, prominent window in the **top right corner** of the game screen will display key notable controls:
        * **'P':** Opens the potion building modal (pauses the game).
        * **'S':** Cycles through acquired spell types (and displays their respective questions at the bottom of the screen).
* **Combat HUD (Simplified):** Health bar for Merlin. Display of current spell loadings (e.g., "Frost Spells: 2/3," "Fire Spells: 1/3").
* **Door UI:** No specific UI for door types in the initial MVP, as any spell breaks any door.

**Multiplayer (Socket.IO):**

* **Real-time Player Synchronization:** Player positions, movements, and actions will be synchronized across connected clients using Socket.IO.
* **Shared Dungeon State:** Key game state elements, such as enemy health, enemy defeat, and door states, will be synchronized.
* **Low-Latency Communication:** Socket.IO will be used for efficient, low-latency updates between client and server.

**Content Generation (MVP Focus):**

* **Chemistry Question Bank:** Ready-to-go questions for each chemistry level selected by the player.
    * **Question Format:** A mix of question types, including:
        * **Balancing Chemical Equations** (player selects from multiple choice).
        * **Predicting Simple Products** (player selects from multiple choice).
        * **Identifying Reaction Types** (player selects from multiple choice).
        * **Simple Calculations** (e.g., molar mass, basic stoichiometry, player selects from multiple choice).
    * **Visuals:** Static images will accompany chemistry questions to provide context or illustrations.
* **Mythical Ingredient Sprites:** Unique sprites for each defined mythical ingredient.
* **Potion Sprites:** Unique sprites for each potion type (full-power, corrupted, health potion).

**Authentication and User Management:**

* **Supabase Authentication:** Supabase's authentication services will be used for user account creation, login, and session management. This will include support for email/password authentication.
* **Guest Mode Support:** A "Guest Mode" feature will allow players to access core gameplay without requiring an account. Guest mode data will be temporary, stored only in browser memory, and will not persist or sync with Supabase.

## **Game Progression and Win Condition**

* **Winning the Game:** The player (Merlin) will start at a designated point in the game. The primary objective is to find the treasure located within the game's main area. The moment Merlin makes contact with the treasure asset, the game is won.
* **Losing the Game:** If Merlin's health reaches zero before finding the treasure, the game ends (Merlin dies).

## **Future Functionality (To be Added Later)**

* **Multiplayer Functionality:**
    * A "Multiplayer" button will be added to the main menu.
    * Players will be able to select the number of participants for multiplayer gameplay.
    * This feature is to be implemented later in the development cycle.