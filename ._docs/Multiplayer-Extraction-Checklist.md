# 🚀 **Multiplayer Extraction Plan - Detailed Checklist**

## **Phase 1: Scene Architecture Setup**

### ✅ **Step 1.1: Create MultiplayerScene.ts**
```typescript
// Create: src/scenes/MultiplayerScene.ts
- [ ] Create new file `src/scenes/MultiplayerScene.ts`
- [ ] Import MainScene and extend it
- [ ] Add player2, camera2 properties
- [ ] Override init() to set isMultiplayer flag
- [ ] Create placeholder override methods for setupPlayer, setupCamera, etc.
```

### ✅ **Step 1.2: Update Scene Registry**
```typescript
// Update: src/main.ts or game config
- [ ] Register MultiplayerScene in game config
- [ ] Add scene key 'MultiplayerScene'
```

### ✅ **Step 1.3: Update Menu Navigation**
```typescript
// Update: src/scenes/MenuScene.ts
- [ ] Change startMultiplayerGame() to start 'MultiplayerScene' instead of 'MainScene'
- [ ] Keep startSoloGame() pointing to 'MainScene'
- [ ] Remove isMultiplayer flag from MenuScene (line 6)
- [ ] Remove isMultiplayer logic from MenuScene (lines 268-276)
```

---

## **Phase 2: Clean MainScene.ts**

### ✅ **Step 2.1: Remove Multiplayer Properties**
```typescript
// MainScene.ts - Remove these lines:
- [ ] Line 28: Remove `protected player2: Player | null = null;`
- [ ] Line 38: Remove `private isMultiplayer: boolean = false;`
- [ ] Line 44-45: Remove camera2 properties
- [ ] Lines 15-20: Remove DEBUG_MULTIPLAYER and debugLog function
```

### ✅ **Step 2.2: Clean init() Method**
```typescript
// MainScene.ts - Lines 66-71
- [ ] Remove isMultiplayer parameter from init()
- [ ] Remove this.isMultiplayer assignment
- [ ] Remove multiplayer logging
```

### ✅ **Step 2.3: Clean create() Method**
```typescript
// MainScene.ts - Lines 129-188
- [ ] Remove multiplayer canvas resize logic (lines 129-131)
- [ ] Remove multiplayer debug summary (lines 167-188)
- [ ] Remove force health bar repositioning for player2 (lines 178-184)
```

### ✅ **Step 2.4: Clean setupPlayer() Method**
```typescript
// MainScene.ts - Lines 310-345
- [ ] Remove all player2 creation logic (lines 326-344)
- [ ] Remove player2 death event listener
- [ ] Remove isMultiplayer checks
```

### ✅ **Step 2.5: Clean setupCamera() Method**
```typescript
// MainScene.ts - Lines 357-411
- [ ] Remove entire isMultiplayer block (lines 371-411)
- [ ] Keep only single-player camera setup
- [ ] Remove debugLog calls
```

### ✅ **Step 2.6: Clean setupRooms() Method**
```typescript
// MainScene.ts - Lines 426-449
- [ ] Remove player2 addition to room manager (lines 432-436)
- [ ] Remove debugLog calls
```

### ✅ **Step 2.7: Clean Other Setup Methods**
```typescript
// Remove player2 additions from:
- [ ] setupWandManager() - Remove lines 351-355
- [ ] setupTreasure() - Remove lines 483-485  
- [ ] setupBarrels() - Remove lines 514-517
- [ ] setupPotions() - Remove lines 525-528
- [ ] setupEnemies() - Remove lines 535-562
- [ ] setupCollisions() - Remove player2 collision setup
```

### ✅ **Step 2.8: Clean Death/Victory Methods**
```typescript
// MainScene.ts - Remove multiplayer-specific methods:
- [ ] Remove showMultiplayerVictory() method (lines ~1430+)
- [ ] Clean handlePlayerDeath() - remove player2 logic
- [ ] Clean handleTreasureVictory() - remove multiplayer checks
- [ ] Remove deathModalContainers player2 logic
```

---

## **Phase 3: Extract Manager Classes**

### ✅ **Step 3.1: Clean EnemyManager.ts**
```typescript
// src/objects/enemy/EnemyManager.ts
- [ ] Remove `private players: Player[] = [];` (line 25)
- [ ] Remove `addPlayer()` method (lines 50-64)
- [ ] Remove `getClosestPlayer()` method (lines 287-310)
- [ ] Update collision setup to single player only
- [ ] Remove debug logging (lines 14-20)
```

### ✅ **Step 3.2: Clean BarrelManager.ts**
```typescript
// src/objects/props/BarrelManager.ts
- [ ] Remove `private players: Player[] = [];` (line 11)
- [ ] Remove `addPlayer()` method (lines 26-37)
- [ ] Update collision setup for single player only
```

### ✅ **Step 3.3: Clean ItemManager.ts**
```typescript
// src/objects/items/ItemManager.ts
- [ ] Remove `private players: Player[] = [];` (line 14)
- [ ] Remove `addPlayer()` method (lines 54-82)
- [ ] Update collision setup for single player only
```

### ✅ **Step 3.4: Clean RoomManager.ts**
```typescript
// src/objects/rooms/RoomManager.ts
- [ ] Remove `private players: Player[] = [];` (line 21)
- [ ] Remove `addPlayer()` method (lines 31-49)
- [ ] Update room overlap setup for single player only
- [ ] Remove debug logging (lines 9-13)
```

### ✅ **Step 3.5: Clean WandManager.ts**
```typescript
// src/objects/wands/WandManager.ts
- [ ] Remove `private players: Player[] = [];` (line 12)
- [ ] Remove `addPlayer()` method (lines 23-36)
- [ ] Update collision setup for single player only
```

---

## **Phase 4: Clean Object Classes**

### ✅ **Step 4.1: Clean HealthBar.ts**
```typescript
// src/objects/HealthBar.ts
- [ ] Remove multiplayer camera positioning logic (lines 53-127)
- [ ] Simplify constructor - remove playerId parameter
- [ ] Remove split-screen viewport calculations
- [ ] Remove camera ignore logic
- [ ] Remove debug logging (lines 4-8)
```

### ✅ **Step 4.2: Clean Treasure.ts**
```typescript
// src/objects/items/Treasure.ts
- [ ] Remove `private players: Player[] = [];` (line 16)
- [ ] Remove `addPlayer()` method (lines 56-64)
- [ ] Update collision setup for single player only
- [ ] Remove debug logging (lines 5-9)
```

### ✅ **Step 4.3: Clean EnemySpawner.ts**
```typescript
// src/objects/enemy/EnemySpawner.ts
- [ ] Remove `getRandomPlayer()` logic (lines 98-101)
- [ ] Always target this.player instead
- [ ] Remove debug logging (lines 8-15)
```

### ✅ **Step 4.4: Clean Player.ts**
```typescript
// src/objects/player/Player.ts
- [ ] Remove debug logging (lines 17-21)
- [ ] Clean up playerId usage if only used for debugging
```

---

## **Phase 5: Create MultiplayerScene Implementation**

### ✅ **Step 5.1: Implement MultiplayerScene Core**
```typescript
// src/scenes/MultiplayerScene.ts
- [ ] Add player2: Player property
- [ ] Add camera2: Camera property  
- [ ] Add isMultiplayer = true flag
- [ ] Override init() to set multiplayer flag
```

### ✅ **Step 5.2: Override Setup Methods**
```typescript
// MultiplayerScene.ts - Override these methods:
- [ ] setupPlayer() - Add player2 creation
- [ ] setupCamera() - Add split-screen logic
- [ ] setupRooms() - Add player2 to room manager
- [ ] setupWandManager() - Add player2 to wand manager  
- [ ] setupTreasure() - Add player2 to treasure
- [ ] setupBarrels() - Add player2 to barrel manager
- [ ] setupPotions() - Add player2 to item manager
- [ ] setupEnemies() - Add player2 to enemy manager
- [ ] setupCollisions() - Add player2 collisions
```

### ✅ **Step 5.3: Add Multiplayer-Specific Methods**
```typescript
// MultiplayerScene.ts - Add these methods:
- [ ] setupPlayer2() - Player2 creation logic
- [ ] setupSplitScreenCamera() - Camera viewport logic
- [ ] showMultiplayerVictory() - Victory screen logic
- [ ] getRandomPlayer() - Random player targeting
- [ ] getAllPlayers() - Return both players array
```

---

## **Phase 6: Create Multiplayer Manager Classes**

### ✅ **Step 6.1: Create MultiplayerEnemyManager**
```typescript
// Create: src/objects/enemy/MultiplayerEnemyManager.ts
- [ ] Extend EnemyManager
- [ ] Add players array and addPlayer method back
- [ ] Add getClosestPlayer method back
- [ ] Add multi-player collision setup
```

### ✅ **Step 6.2: Create Other Multiplayer Managers**
```typescript
// Create multiplayer versions:
- [ ] MultiplayerBarrelManager.ts
- [ ] MultiplayerItemManager.ts  
- [ ] MultiplayerRoomManager.ts
- [ ] MultiplayerWandManager.ts
```

### ✅ **Step 6.3: Update MultiplayerScene to Use Multiplayer Managers**
```typescript
// MultiplayerScene.ts
- [ ] Import multiplayer manager classes
- [ ] Override manager creation methods
- [ ] Use MultiplayerEnemyManager instead of EnemyManager
- [ ] Use other multiplayer managers as needed
```

---

## **Phase 7: Testing & Cleanup**

### ✅ **Step 7.1: Test Single Player Mode** ✅
```typescript
// Verify MainScene works without multiplayer:
- [x] Start single player game from menu
- [x] Verify player spawns correctly
- [x] Verify camera follows player
- [x] Verify enemies target player
- [x] Verify health bar shows correctly
- [x] Verify treasure victory works
- [x] Verify all managers work with single player
```

### ✅ **Step 7.2: Test Multiplayer Mode** ✅
```typescript
// Verify MultiplayerScene works:
- [x] Start multiplayer game from menu
- [x] Verify both players spawn
- [x] Verify split-screen cameras work
- [x] Verify both health bars show
- [x] Verify enemies target both players
- [x] Verify treasure victory works for both
- [x] Verify all multiplayer features work
```

### ✅ **Step 7.3: Final Cleanup** ✅
```typescript
// Remove any remaining multiplayer artifacts:
- [x] Search codebase for "isMultiplayer" - should only be in MultiplayerScene
- [x] Search for "player2" - should only be in MultiplayerScene  
- [x] Search for "debugLog" - remove all instances
- [x] Search for "DEBUG_MULTIPLAYER" - should be gone
- [x] Remove any unused imports
- [x] Clean up any console.log statements
```

---

## **🎯 Success Criteria**

**Single Player MainScene:**
- ✅ No `isMultiplayer` checks
- ✅ No `player2` references  
- ✅ No debug logging
- ✅ Clean, readable code
- ✅ All features work with one player

**Multiplayer Scene:**
- ✅ Inherits from MainScene
- ✅ Adds multiplayer complexity cleanly
- ✅ All multiplayer features work
- ✅ No impact on single player

**Result:** Clean architecture where you can add single-player features easily to MainScene without worrying about multiplayer complexity!

---

## **🎉 EXTRACTION COMPLETE! 🎉**

**All 7 Phases Successfully Completed:**
- ✅ Phase 1: Scene Architecture Setup
- ✅ Phase 2: Clean MainScene.ts  
- ✅ Phase 3: Extract Manager Classes
- ✅ Phase 4: Clean Object Classes
- ✅ Phase 5: Implement MultiplayerScene
- ✅ Phase 6: Create Multiplayer Manager Classes
- ✅ Phase 7: Testing & Cleanup

**Architecture Achievement:** Perfect separation between single-player simplicity and multiplayer functionality! 