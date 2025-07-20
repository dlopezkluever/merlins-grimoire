Example 1: 
ou're asking about the procedural dungeon generation algorithm implemented in the dungeoneer library, specifically how it creates maze-like maps with rooms and corridors that generate differently each time.

Answer
The dungeoneer library implements Bob Nystrom's "rooms and mazes" algorithm through a 5-stage process in the Dungeon constructor function index.js:63 :

1. Initial Setup and Room Placement
The generation starts by filling the entire dungeon with walls using fill('wall') index.js:222 . Then _addRooms() attempts to place up to 50 randomly-sized rooms index.js:64 .

Each room is generated with odd dimensions to align with the maze algorithm index.js:357 . Rooms that overlap existing rooms are discarded index.js:386-396 . Successfully placed rooms are carved out using carveArea() which converts wall tiles to floor tiles index.js:418-424 .

2. Maze Generation in Empty Spaces
After room placement, the algorithm fills all remaining empty space with mazes using a nested loop that starts at every odd coordinate index.js:227-235 . The _growMaze() function implements the "growing tree" algorithm index.js:283-341 .

The maze generation works by:

Starting from an uncarved position and creating a new region index.js:291-293
Maintaining a stack of cells and carving in cardinal directions index.js:306-310
Using a "winding" parameter to control corridor straightness vs. twistiness index.js:317-322
Carving two cells at a time to maintain proper maze structure index.js:324-330
3. Region Connection via Doors
At this point, rooms and mazes exist as separate, unconnected regions. The _connectRegions() function finds "connector" tiles - wall tiles adjacent to two different regions index.js:431-453 .

It randomly selects one connector per region pair and converts it to a door tile index.js:455-458 . There's also a chance to create additional connections for more complex connectivity index.js:461-465 .

4. Dead End Removal
The final step removes dead ends from maze corridors by repeatedly filling in tiles that are surrounded by walls on three sides index.js:239 . This ensures every corridor leads somewhere meaningful.

5. Randomization and Seeding
Each generation uses a seeded random number generator (Chance.js) index.js:214-218 . You can provide your own seed for reproducible dungeons, or let it generate a random one index.js:214 .

The main entry point is the build() function which validates dimensions (minimum 5x5, automatically converts to odd numbers) and orchestrates the entire process index.js:197-247 .

Usage in Your Game
To use this in your game, call dungeoneer.build() with width/height parameters main.js:14-17 . The returned object contains:

rooms: Array of room objects with position/size data
tiles: 2D grid where each tile has a type ('wall', 'floor', or 'door') and neighbor references
seed: The generation seed for reproducibility
The demo application shows how to render this data to a canvas, drawing rooms in red, floors in white, and doors in yellow main.js:32-49 .

Notes
The algorithm ensures every generated dungeon is fully connected while maintaining the classic "rooms connected by winding corridors" structure. The combination of random room placement, maze filling, and strategic connection creates varied, playable dungeon layouts each time while avoiding common issues like unreachable areas or excessive dead ends.

Wiki pages you might want to explore:

relevant sections of thier code:
demo/main.js
*
 * @constructor
 */
const Dungeon = function Dungeon () {
  const numRoomTries = 50

  // The inverse chance of adding a connector between two regions that have
  // already been joined. Increasing this leads to more loosely connected


   *
   * @returns {Object} - Tile information for the dungeon
   */
  const build = (stage) => {
    if (stage.width < 5) {
      throw new RangeError(`DungeoneerError: options.width must not be less than 5, received ${stage.width}`)
    }

    if (stage.height < 5) {
      throw new RangeError(`DungeoneerError: options.height must not be less than 5, received ${stage.height}`)
    }

    if (stage.width % 2 === 0) {
      stage.width += 1
    }

    if (stage.height % 2 === 0) {
      stage.height += 1
    }

    const seed = stage.seed || `${nameChance.word({ length: 7 })}-${nameChance.word({ length: 7 })}`

    rng = new Chance(seed)

    _seed = seed

    bindStage(stage)

    fill('wall')

    _addRooms()

    // Fill in all of the empty space with mazes.
    for (let y = 1; y < stage.height; y += 2) {
      for (let x = 1; x < stage.width; x += 2) {
        // Skip the maze generation if the tile is already carved
        if (getTile(x, y).type === 'floor') {
          continue
        }
        _growMaze(x, y)
      }
    }

    _connectRegions()

    _removeDeadEnds()

    return {
      rooms: _rooms,
      tiles: _tiles,
      seed,
      toJS: _toJS
    }
  }

  const _toJS = () => {
    const rooms = []


   *
   * @returns {void}
   */
  const _growMaze = (startX, startY) => {
    const cells = []
    let lastDir

    if (Object.keys(_tiles[startX][startY].neighbours).filter(x => x.type === 'floor').length > 0) {
      return
    }

    _startRegion()

    _carve(startX, startY)

    cells.push(new Victor(startX, startY))

    let count = 0

    while (cells.length && count < 500) {
      count++
      const cell = cells[cells.length - 1]

      // See which adjacent cells are open.
      const unmadeCells = []

      for (const dir of cardinalDirections) {
        if (_canCarve(cell, dir)) {
          unmadeCells.push(dir)
        }
      }

      if (unmadeCells.length) {
        // Based on how "windy" passages are, try to prefer carving in the
        // same direction.
        let dir
        const stringifiedCells = unmadeCells.map(v => v.toString())
        if (lastDir && stringifiedCells.indexOf(lastDir.toString()) > -1 && randBetween(1, 100) > windingPercent) {
          dir = lastDir.clone()
        } else {
          const rand = randBetween(0, unmadeCells.length - 1)
          dir = unmadeCells[rand].clone()
        }

        const carveLoc1 = cell.clone().add(dir).toObject()
        _carve(carveLoc1.x, carveLoc1.y)

        const carveLoc2 = cell.clone().add(dir).add(dir).toObject()
        _carve(carveLoc2.x, carveLoc2.y)

        cells.push(cell.clone().add(dir).add(dir))

        lastDir = dir.clone()
      } else {
        // No adjacent uncarved cells.
        cells.pop()

        // This path has ended.
        lastDir = null
      }
    }
  }

  /**
   * @desc Creates rooms in the dungeon by repeatedly creating random rooms and

      // - It makes sure rooms are odd-sized to line up with maze.
      // - It avoids creating rooms that are too rectangular: too tall and
      //   narrow or too wide and flat.
      const size = randBetween(1, 3 + roomExtraSize) * 2 + 1
      const rectangularity = randBetween(0, 1 + Math.floor(size / 2)) * 2
      let width = size
      let height = size



      const room = new Room(x, y, width, height)
      let overlaps = false

      for (const other of _rooms) {
        if (room.intersects(other)) {
          overlaps = true
          break
        }
      }

      if (overlaps) {
        continue
      }

      _rooms.push(room)


   *
   * @returns {void}
   */
  const carveArea = (x, y, width, height) => {
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        _carve(i, j)
      }
    }
  }

  /**
   * @desc Creates doorways between each generated region of tiles
   *
   * @return {void}
   */
  const _connectRegions = () => {
    const regionConnections = {}
    _tiles.forEach(row => {
      row.forEach(tile => {
        if (tile.type === 'floor') {
          return
        }

        const tileRegions = _.unique(
          getTileNESW(tile).map(x => x.region)
            .filter(x => !_.isUndefined(x))
        )
        if (tileRegions.length <= 1) {
          return
        }

        const key = tileRegions.join('-')
        if (!regionConnections[key]) {
          regionConnections[key] = []
        }
        regionConnections[key].push(tile)
      })
    })
 
    _.each(regionConnections, (connections) => {
      const index = randBetween(0, connections.length - 1)
      connections[index].type = 'door'
      connections.splice(index, 1)

      // Occasional open up additional connections
      connections.forEach(conn => {
        if (_oneIn(extraConnectorChance)) {
          conn.type = 'door'
        }
      })
    })
  }


LucianBuzzo/dungeoneer
demo/main.js



const create = function (width, height) {
  const cellSize = 4
  const dungeon = dungeoneer.build({
    width: width,
    height: height
  })

  console.log('Generated dungeon', dungeon)


  ctx.fillStyle = 'red'
  dungeon.rooms.forEach((room) => {
    ctx.fillStyle = 'red'
    ctx.fillRect(room.x * cellSize, room.y * cellSize, room.width * cellSize, room.height * cellSize)
  })

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'

  for (let x = 0; x < dungeon.tiles.length; x++) {
    for (let y = 0; y < dungeon.tiles[x].length; y++) {
      if (dungeon.tiles[x][y].type === 'floor') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
      if (dungeon.tiles[x][y].type === 'door') {
        ctx.fillStyle = 'yellow'
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }

  window.ctx = ctx



Example 2: 

You're asking about the dungeon generation system in the mipearson/dungeondash codebase, specifically how the maze-like map with corridors and rooms is procedurally generated for each new game.

Dungeon Generation Overview
The dungeon generation happens in the Map class constructor, which uses the external Dungeoneer library to create the base dungeon structure, then converts it into Phaser tilemaps with proper collision detection and visual rendering. Map.ts:22-26

Core Generation Process
1. Initial Dungeon Structure
The process starts by calling Dungeoneer.build() with width and height parameters to generate the basic dungeon layout. Map.ts:23-27 This creates a dungeon object containing rooms and the tile structure that defines walls, doors, and open spaces.

2. Tile Conversion and Grid Creation
The system then converts the Dungeoneer output into a 2D grid of Tile objects: Map.ts:32-39 Each tile gets its type determined by Tile.tileTypeFor() which converts string identifiers like "wall" and "door" into the TileType enum. Tile.ts:20-28

3. Wall Cleanup Process
After initial tile placement, the system removes enclosed wall tiles that would be invisible to the player: Map.ts:41-53 This uses the isEnclosed() method which checks if a wall tile is completely surrounded by other walls of the same corridor type. Tile.ts:58-64

Room and Corridor System
Room Generation and Floor Textures
The system distinguishes between rooms and corridors through different floor textures. For each generated room, it applies specific floor tiles: Map.ts:89-96 Rooms get Graphics.environment.indices.floor.outer tiles, while corridors use Graphics.environment.indices.floor.outerCorridor tiles. Map.ts:79-85

Corridor vs Room Detection
Each tile knows whether it's in a corridor or room through the corridor property, determined by checking if the tile's position falls within any room's bounding box: Tile.ts:38 The withinRoom() method checks this by expanding each room's bounds by 1 tile in all directions. Map.ts:177-186

Visual Rendering System
Wall Sprite Selection
The visual appearance of walls depends on their neighboring tiles and whether they're in corridors or rooms. The spriteIndex() method adds a modifier of 8 for corridor walls to use different sprites: Tile.ts:66-69 This allows corridor walls to have a different visual style than room walls.

Smart Wall Connections
The system uses intelligent wall sprite selection based on neighboring wall tiles. The rawIndex() method checks all four cardinal directions and selects appropriate wall intersection sprites: Tile.ts:75-107 This creates seamless wall connections that look natural regardless of the dungeon layout.

Layer System and Collision
Multiple Rendering Layers
The map uses separate Phaser tilemap layers for different elements:

Ground layer for floor textures Map.ts:77-85
Wall layer for static wall collision Map.ts:120-144
Door layer for interactive doors Map.ts:127-163
Door Interaction System
Doors are placed on a dynamic layer with collision callbacks that destroy them when touched, converting them to destroyed door sprites and recalculating field of view: Map.ts:151-163

Player Spawn and Enemy Placement
Random Starting Position
The player spawns in the center of a randomly selected room: Map.ts:55-59 This ensures the player always starts in a safe, open area.

Enemy Distribution
Slime enemies are spawned in rooms larger than 4x4 tiles, with 1-3 slimes per qualifying room placed at random positions within the room bounds: Map.ts:98-117

Integration with Game Scene
The entire map generation is triggered when DungeonScene creates a new Map instance: DungeonScene.ts:95-96 The scene then uses the generated map for physics collision setup and camera bounds configuration.

Notes

The system relies heavily on the external Dungeoneer library for the core maze generation algorithm, which this codebase doesn't implement directly. The Map class serves as an adapter that converts Dungeoneer's output into a format suitable for the Phaser game engine, adding visual polish, collision detection, and gameplay elements like enemy spawning.

Some of thier relevant code: 
src/entities/Map.ts

  public readonly rooms: Dungeoneer.Room[];
  constructor(width: number, height: number, scene: DungeonScene) {
    const dungeon = Dungeoneer.build({
      width: width,
      height: height
    });
    this.rooms = dungeon.rooms;

    this.width = width;
    this.height = height;
    this.tiles = [];
    for (let y = 0; y < height; y++) {
      this.tiles.push([]);
      for (let x = 0; x < width; x++) {
        const tileType = Tile.tileTypeFor(dungeon.tiles[x][y].type);
        this.tiles[y][x] = new Tile(tileType, x, y, this);
      }
    }
 
    const toReset = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = this.tiles[y][x];
        if (tile.type === TileType.Wall && tile.isEnclosed()) {
          toReset.push({ y: y, x: x });
        }
      }
    }

    toReset.forEach(d => {
      this.tiles[d.y][d.x] = new Tile(TileType.None, d.x, d.y, this);
    });
 
    const roomNumber = Math.floor(Math.random() * dungeon.rooms.length);

    const firstRoom = dungeon.rooms[roomNumber];
    this.startingX = Math.floor(firstRoom.x + firstRoom.width / 2);
    this.startingY = Math.floor(firstRoom.y + firstRoom.height / 2);

    this.tilemap = scene.make.tilemap({
      tileWidth: Graphics.environment.width,

      Graphics.environment.spacing
    );
    const groundLayer = this.tilemap
      .createBlankDynamicLayer("Ground", dungeonTiles, 0, 0)
      .randomize(
        0,
        0,
        this.width,
        this.height,
        Graphics.environment.indices.floor.outerCorridor
      );

    this.slimes = [];
    for (let room of dungeon.rooms) {
      groundLayer.randomize(
        room.x - 1,
        room.y - 1,
        room.width + 2,
        room.height + 2,
        Graphics.environment.indices.floor.outer
      );
 
      if (room.height < 4 || room.width < 4) {
        continue;
      }

      const roomTL = this.tilemap.tileToWorldXY(room.x + 1, room.y + 1);
      const roomBounds = this.tilemap.tileToWorldXY(
        room.x + room.width - 1,
        room.y + room.height - 1
      );
      const numSlimes = Phaser.Math.Between(1, 3);
      for (let i = 0; i < numSlimes; i++) {
        this.slimes.push(
          new Slime(
            Phaser.Math.Between(roomTL.x, roomBounds.x),
            Phaser.Math.Between(roomTL.y, roomBounds.y),
            scene
          )
        );
      }
    }
    this.tilemap.convertLayerToStatic(groundLayer).setDepth(1);
    const wallLayer = this.tilemap.createBlankDynamicLayer(
      "Wall",
      dungeonTiles,
      0,
      0
    );

    this.doorLayer = this.tilemap.createBlankDynamicLayer(
      "Door",
      dungeonTiles,
      0,
      0
    );

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tile = this.tiles[y][x];
        if (tile.type === TileType.Wall) {
          wallLayer.putTileAt(tile.spriteIndex(), x, y);
        } else if (tile.type === TileType.Door) {
          this.doorLayer.putTileAt(tile.spriteIndex(), x, y);
        }
      }
    }
    wallLayer.setCollisionBetween(0, 0x7f);
    const collidableDoors = [
      Graphics.environment.indices.doors.horizontal,
      Graphics.environment.indices.doors.vertical
    ];
    this.doorLayer.setCollision(collidableDoors);

    this.doorLayer.setTileIndexCallback(
      collidableDoors,
      (_: unknown, tile: Phaser.Tilemaps.Tile) => {
        this.doorLayer.putTileAt(
          Graphics.environment.indices.doors.destroyed,
          tile.x,
          tile.y
        );
        this.tileAt(tile.x, tile.y)!.open();
        scene.fov!.recalculate();
      },
      this
    );
    this.doorLayer.setDepth(3);

    this.wallLayer = this.tilemap.convertLayerToStatic(wallLayer);

    return this.tiles[y][x];
  }
  withinRoom(x: number, y: number): boolean {
    return (
      this.rooms.find(r => {
        const { top, left, right, bottom } = r.getBoundingBox();
        return (
          y >= top - 1 && y <= bottom + 1 && x >= left - 1 && x <= right + 1
        );
      }) != undefined
    );
  }
}
src/entities/Tile.ts
 public desiredAlpha: number; // TODO: Move out of this class, specific to FOV
  public readonly corridor: boolean;
  public static tileTypeFor(type: string): TileType {
    if (type === "wall") {
      return TileType.Wall;
    } else if (type === "door") {
      return TileType.Door;
    } else {
      return TileType.None;
    }
  }

  constructor(type: TileType, x: number, y: number, map: Map) {
    this.type = type;

    this.y = y;
    this.seen = false;
    this.desiredAlpha = 1;
    this.corridor = !map.withinRoom(x, y);
  }

  open() {

    };
  }
  isEnclosed(): boolean {
    return (
      Object.values(this.neighbours()).filter(
        t => !t || (t.type === TileType.Wall && t.corridor === this.corridor)
      ).length === 8
    );
  }
 
  spriteIndex(): number {
    const modifier = this.type === TileType.Wall && this.corridor ? 8 : 0;
    return this.rawIndex() + modifier;
  }

  // prettier-ignore
  private rawIndex(): number {
    const neighbours = this.neighbours();
    const n = neighbours.n && neighbours.n.type === TileType.Wall && neighbours.n.corridor === this.corridor;
    const s = neighbours.s && neighbours.s.type === TileType.Wall && neighbours.s.corridor === this.corridor
    const w = neighbours.w && neighbours.w.type === TileType.Wall && neighbours.w.corridor === this.corridor
    const e = neighbours.e && neighbours.e.type === TileType.Wall && neighbours.e.corridor === this.corridor

    const wDoor = neighbours.w && neighbours.w.type === TileType.Door;
    const eDoor = neighbours.e && neighbours.e.type === TileType.Door;

    const i = Graphics.environment.indices.walls;

    if (this.type === TileType.Wall) {
      if (n && e && s && w) { return i.intersections.n_e_s_w; }
      if (n && e && s) { return i.intersections.n_e_s; }
      if (n && s && w) { return i.intersections.n_s_w; }
      if (e && s && w) { return i.intersections.e_s_w; }
      if (n && e && w) { return i.intersections.n_e_w; }

      if (e && s) { return i.intersections.e_s; }
      if (e && w) { return i.intersections.e_w; }
      if (s && w) { return i.intersections.s_w; }
      if (n && s) { return i.intersections.n_s; }
      if (n && e) { return i.intersections.n_e; }
      if (n && w) { return i.intersections.n_w; }

      if (w && eDoor) { return i.intersections.e_door; }
      if (e && wDoor) { return i.intersections.w_door; }

      if (n) { return i.intersections.n; }
      if (s) { return i.intersections.s; }
      if (e) { return i.intersections.e; }
      if (w) { return i.intersections.w; }

      return i.alone;
    }

    if (this.type === TileType.Door) {
src/scenes/DungeonScene.ts
  }
    });
    const map = new Map(worldTileWidth, worldTileHeight, this);
    this.tilemap = map.tilemap;

    this.fov = new FOVLayer(map);

