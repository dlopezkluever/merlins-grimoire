import { DoorDirection } from '../Door';

export interface MazeRoom {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: { direction: DoorDirection; targetRoomId: string }[];
  isDeadEnd: boolean;
  gridX: number;
  gridY: number;
  roomType: 'start' | 'normal' | 'end' | 'hallway' | 'junction';
  corridors: { x: number; y: number; direction: DoorDirection }[];
}

export interface MazeData {
  rooms: MazeRoom[];
  wallTiles: { x: number; y: number }[];
  floorTiles: { x: number; y: number }[];
  doors: { x: number; y: number; direction: DoorDirection; roomId: string; targetRoomId: string }[];
  mapWidth: number;
  mapHeight: number;
  endRoomId: string;
}

export class MazeGenerator {
  private gridWidth: number;
  private gridHeight: number;
  private tileSize: number = 32;
  private cellSize: number = 20; // Increased for longer corridors
  private roomMinSize: number = 7;
  private roomMaxSize: number = 11;
  private corridorMinLength: number = 8; // Minimum corridor length
  private corridorMaxLength: number = 15; // Maximum corridor length
  private deadEndProbability: number = 0.3; // 30% chance for dead ends
  private extraConnectionProbability: number = 0.2; // 20% chance for extra connections

  constructor(gridWidth: number = 5, gridHeight: number = 5) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  public generateMaze(): MazeData {
    // Calculate total map size - make it much larger to accommodate corridors and dead ends
    const mapWidth = this.gridWidth * this.cellSize + 100; // Further increased buffer for long corridors
    const mapHeight = this.gridHeight * this.cellSize + 100; // Further increased buffer for long corridors
    
    // Initialize the tile grid - start with all walls
    const tileGrid: boolean[][] = [];
    for (let y = 0; y < mapHeight; y++) {
      tileGrid[y] = [];
      for (let x = 0; x < mapWidth; x++) {
        tileGrid[y][x] = false; // false = wall, true = floor
      }
    }
    
    // Step 1: Place rooms in a grid pattern with randomization
    const rooms = this.placeRooms(mapWidth, mapHeight);
    
    // Step 2: Carve out the rooms
    this.carveRooms(tileGrid, rooms);
    
    // Step 3: Create corridors between rooms with maze-like complexity
    const corridors = this.createCorridors(tileGrid, rooms, mapWidth, mapHeight);
    
    // Step 4: Add dead ends and extra branches
    this.addDeadEnds(tileGrid, rooms, mapWidth, mapHeight);
    
    // Step 5: Add extra connections for multiple paths
    this.addExtraConnections(tileGrid, rooms);
    
    // Step 6: No doors needed - removed for free exploration
    
    // Step 7: Determine the end room (farthest from start)
    const endRoomId = this.findEndRoom(rooms);
    
    // Convert to final format
    const wallTiles: { x: number; y: number }[] = [];
    const floorTiles: { x: number; y: number }[] = [];
    
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (tileGrid[y][x]) {
          floorTiles.push({ x, y });
        } else {
          wallTiles.push({ x, y });
        }
      }
    }
    
    return {
      rooms,
      wallTiles,
      floorTiles,
      doors: [], // No doors needed
      mapWidth,
      mapHeight,
      endRoomId
    };
  }

  private placeRooms(mapWidth: number, mapHeight: number): MazeRoom[] {
    const rooms: MazeRoom[] = [];
    let roomId = 1;
    
    // Place rooms in a grid with some randomization
    for (let gridY = 0; gridY < this.gridHeight; gridY++) {
      for (let gridX = 0; gridX < this.gridWidth; gridX++) {
        // Calculate base position with some randomization
        const baseX = gridX * this.cellSize + 5;
        const baseY = gridY * this.cellSize + 5;
        
        // Add random offset to make it less grid-like
        const offsetX = Math.floor(Math.random() * 4) - 2;
        const offsetY = Math.floor(Math.random() * 4) - 2;
        
        const x = Math.max(3, Math.min(mapWidth - this.roomMaxSize - 3, baseX + offsetX));
        const y = Math.max(3, Math.min(mapHeight - this.roomMaxSize - 3, baseY + offsetY));
        
        // Random room size
        const width = this.roomMinSize + Math.floor(Math.random() * (this.roomMaxSize - this.roomMinSize + 1));
        const height = this.roomMinSize + Math.floor(Math.random() * (this.roomMaxSize - this.roomMinSize + 1));
        
        // Determine room type
        let roomType: MazeRoom['roomType'] = 'normal';
        if (gridX === 0 && gridY === 0) {
          roomType = 'start';
        }
        
        const room: MazeRoom = {
          id: roomId.toString(),
          x,
          y,
          width,
          height,
          connections: [],
          isDeadEnd: false,
          gridX,
          gridY,
          roomType,
          corridors: []
        };
        
        rooms.push(room);
        roomId++;
      }
    }
    
    return rooms;
  }

  private carveRooms(tileGrid: boolean[][], rooms: MazeRoom[]): void {
    for (const room of rooms) {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          if (y >= 0 && y < tileGrid.length && x >= 0 && x < tileGrid[0].length) {
            tileGrid[y][x] = true;
          }
        }
      }
    }
  }

  private createCorridors(tileGrid: boolean[][], rooms: MazeRoom[], mapWidth: number, mapHeight: number): void {
    // Create a minimum spanning tree of rooms first
    const connected = new Set<string>();
    const toConnect = new Set<string>(rooms.map(r => r.id));
    
    // Start with the first room
    const startRoom = rooms[0];
    connected.add(startRoom.id);
    toConnect.delete(startRoom.id);
    
    // Connect all rooms with corridors
    while (toConnect.size > 0) {
      let bestConnection: { from: MazeRoom; to: MazeRoom; distance: number } | null = null;
      
      // Find the closest unconnected room to any connected room
      for (const fromId of connected) {
        const fromRoom = rooms.find(r => r.id === fromId)!;
        
        for (const toId of toConnect) {
          const toRoom = rooms.find(r => r.id === toId)!;
          const distance = this.getDistance(fromRoom, toRoom);
          
          if (!bestConnection || distance < bestConnection.distance) {
            bestConnection = { from: fromRoom, to: toRoom, distance };
          }
        }
      }
      
      if (bestConnection) {
        // Create a corridor between the rooms
        this.createCorridor(tileGrid, bestConnection.from, bestConnection.to, mapWidth, mapHeight);
        
        // Mark the room as connected
        connected.add(bestConnection.to.id);
        toConnect.delete(bestConnection.to.id);
        
        // Add connection info
        const direction = this.getDirection(bestConnection.from, bestConnection.to);
        bestConnection.from.connections.push({
          direction,
          targetRoomId: bestConnection.to.id
        });
        bestConnection.to.connections.push({
          direction: this.oppositeDirection(direction),
          targetRoomId: bestConnection.from.id
        });
      }
    }
  }

  private createCorridor(tileGrid: boolean[][], fromRoom: MazeRoom, toRoom: MazeRoom, mapWidth: number, mapHeight: number): void {
    // Create longer, more complex corridors
    const fromCenter = {
      x: Math.floor(fromRoom.x + fromRoom.width / 2),
      y: Math.floor(fromRoom.y + fromRoom.height / 2)
    };
    const toCenter = {
      x: Math.floor(toRoom.x + toRoom.width / 2),
      y: Math.floor(toRoom.y + toRoom.height / 2)
    };
    
    // Decide on corridor exit points from rooms (multiple possible exits)
    const fromExits = this.getRoomExitPoints(fromRoom);
    const toExits = this.getRoomExitPoints(toRoom);
    
    // Choose random exit points
    const fromExit = fromExits[Math.floor(Math.random() * fromExits.length)];
    const toExit = toExits[Math.floor(Math.random() * toExits.length)];
    
    // Store corridor start points
    fromRoom.corridors.push({ ...fromExit, direction: this.getDirection(fromRoom, toRoom) });
    toRoom.corridors.push({ ...toExit, direction: this.getDirection(toRoom, fromRoom) });
    
    // Create a winding path between exits
    this.carveWindingPath(tileGrid, fromExit, toExit, mapWidth, mapHeight);
  }

  private getRoomExitPoints(room: MazeRoom): { x: number; y: number }[] {
    const exits: { x: number; y: number }[] = [];
    const numExits = 2 + Math.floor(Math.random() * 3); // 2-4 exits per room
    
    // Top edge
    for (let i = 0; i < numExits; i++) {
      exits.push({
        x: room.x + 2 + Math.floor(Math.random() * (room.width - 4)),
        y: room.y - 1
      });
    }
    
    // Bottom edge
    for (let i = 0; i < numExits; i++) {
      exits.push({
        x: room.x + 2 + Math.floor(Math.random() * (room.width - 4)),
        y: room.y + room.height
      });
    }
    
    // Left edge
    for (let i = 0; i < numExits; i++) {
      exits.push({
        x: room.x - 1,
        y: room.y + 2 + Math.floor(Math.random() * (room.height - 4))
      });
    }
    
    // Right edge
    for (let i = 0; i < numExits; i++) {
      exits.push({
        x: room.x + room.width,
        y: room.y + 2 + Math.floor(Math.random() * (room.height - 4))
      });
    }
    
    return exits;
  }

  private carveWindingPath(tileGrid: boolean[][], from: { x: number; y: number }, to: { x: number; y: number }, mapWidth: number, mapHeight: number): void {
    const corridorWidth = 3; // Make corridors 3 tiles wide
    let current = { ...from };
    
    // Use A* or similar to create a path, but add randomness for winding effect
    while (current.x !== to.x || current.y !== to.y) {
      // Determine general direction
      const dx = to.x - current.x;
      const dy = to.y - current.y;
      
      // Add some randomness to create winding paths
      const randomFactor = 0.3;
      let moveX = 0;
      let moveY = 0;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        moveX = dx > 0 ? 1 : -1;
        if (Math.random() < randomFactor && Math.abs(dy) > 2) {
          moveY = dy > 0 ? 1 : -1;
          moveX = 0;
        }
      } else {
        moveY = dy > 0 ? 1 : -1;
        if (Math.random() < randomFactor && Math.abs(dx) > 2) {
          moveX = dx > 0 ? 1 : -1;
          moveY = 0;
        }
      }
      
      // Move and carve
      current.x += moveX;
      current.y += moveY;
      
      // Carve a wider corridor
      for (let dy = -Math.floor(corridorWidth / 2); dy <= Math.floor(corridorWidth / 2); dy++) {
        for (let dx = -Math.floor(corridorWidth / 2); dx <= Math.floor(corridorWidth / 2); dx++) {
          const carveX = current.x + dx;
          const carveY = current.y + dy;
          
          if (carveX >= 0 && carveX < mapWidth && carveY >= 0 && carveY < mapHeight) {
            tileGrid[carveY][carveX] = true;
          }
        }
      }
    }
  }

  private addDeadEnds(tileGrid: boolean[][], rooms: MazeRoom[], mapWidth: number, mapHeight: number): void {
    // Add dead end branches from some rooms
    for (const room of rooms) {
      if (Math.random() < this.deadEndProbability && room.roomType !== 'start') {
        // Create a dead end corridor
        const exitPoint = this.getRoomExitPoints(room)[0];
        const corridorLength = this.corridorMinLength + Math.floor(Math.random() * (this.corridorMaxLength - this.corridorMinLength));
        
        // Choose a random direction
        const directions = [
          { x: 0, y: -1 }, // North
          { x: 1, y: 0 },  // East
          { x: 0, y: 1 },  // South
          { x: -1, y: 0 }  // West
        ];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        // Carve the dead end
        let current = { ...exitPoint };
        for (let i = 0; i < corridorLength; i++) {
          current.x += direction.x;
          current.y += direction.y;
          
          // Stop if we hit the edge
          if (current.x < 3 || current.x >= mapWidth - 3 || current.y < 3 || current.y >= mapHeight - 3) {
            break;
          }
          
          // Carve a 3-wide corridor
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const carveX = current.x + dx;
              const carveY = current.y + dy;
              
              if (carveX >= 0 && carveX < mapWidth && carveY >= 0 && carveY < mapHeight) {
                tileGrid[carveY][carveX] = true;
              }
            }
          }
        }
        
        // Optionally add a small dead-end room
        if (Math.random() < 0.5) {
          const deadEndRoom: MazeRoom = {
            id: `dead_${room.id}`,
            x: current.x - 2,
            y: current.y - 2,
            width: 5,
            height: 5,
            connections: [],
            isDeadEnd: true,
            gridX: -1,
            gridY: -1,
            roomType: 'normal',
            corridors: []
          };
          
          // Carve the dead end room
          for (let y = deadEndRoom.y; y < deadEndRoom.y + deadEndRoom.height; y++) {
            for (let x = deadEndRoom.x; x < deadEndRoom.x + deadEndRoom.width; x++) {
              if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) {
                tileGrid[y][x] = true;
              }
            }
          }
          
          rooms.push(deadEndRoom);
        }
      }
    }
  }

  private addExtraConnections(tileGrid: boolean[][], rooms: MazeRoom[]): void {
    // Add extra connections between nearby rooms for multiple paths
    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const room1 = rooms[i];
        const room2 = rooms[j];
        
        // Check if rooms are adjacent (not already connected)
        const distance = this.getDistance(room1, room2);
        const alreadyConnected = room1.connections.some(c => c.targetRoomId === room2.id);
        
        if (distance < this.cellSize * 1.5 && !alreadyConnected && Math.random() < this.extraConnectionProbability) {
          // Create an additional corridor
          this.createCorridor(tileGrid, room1, room2, tileGrid[0].length, tileGrid.length);
          
          // Add connection info
          const direction = this.getDirection(room1, room2);
          room1.connections.push({
            direction,
            targetRoomId: room2.id
          });
          room2.connections.push({
            direction: this.oppositeDirection(direction),
            targetRoomId: room1.id
          });
        }
      }
    }
  }



  private findEndRoom(rooms: MazeRoom[]): string {
    // Use BFS to find rooms at different distances from start
    const startRoom = rooms.find(r => r.roomType === 'start')!;
    const distances = new Map<string, number>();
    const queue: { room: MazeRoom; distance: number }[] = [];
    
    queue.push({ room: startRoom, distance: 0 });
    distances.set(startRoom.id, 0);
    
    const roomsByDistance: MazeRoom[][] = [];
    let maxDistance = 0;
    
    while (queue.length > 0) {
      const { room, distance } = queue.shift()!;
      
      // Group rooms by distance
      if (!roomsByDistance[distance]) {
        roomsByDistance[distance] = [];
      }
      roomsByDistance[distance].push(room);
      maxDistance = Math.max(maxDistance, distance);
      
      // Check all connected rooms
      for (const connection of room.connections) {
        const connectedRoom = rooms.find(r => r.id === connection.targetRoomId);
        if (connectedRoom && !distances.has(connectedRoom.id)) {
          distances.set(connectedRoom.id, distance + 1);
          queue.push({ room: connectedRoom, distance: distance + 1 });
        }
      }
    }
    
    // Select a goal room from the latter half of distances (but not necessarily the farthest)
    const minGoalDistance = Math.max(2, Math.floor(maxDistance * 0.6)); // At least distance 2, or 60% of max
    const maxGoalDistance = maxDistance;
    
    // Collect all suitable rooms
    const goalCandidates: MazeRoom[] = [];
    for (let dist = minGoalDistance; dist <= maxGoalDistance; dist++) {
      if (roomsByDistance[dist]) {
        goalCandidates.push(...roomsByDistance[dist]);
      }
    }
    
    // Select a random room from candidates
    const goalRoom = goalCandidates[Math.floor(Math.random() * goalCandidates.length)];
    
    // Mark the selected room as the end/goal room
    goalRoom.roomType = 'end';
    return goalRoom.id;
  }

  private getDistance(room1: MazeRoom, room2: MazeRoom): number {
    const dx = (room1.x + room1.width / 2) - (room2.x + room2.width / 2);
    const dy = (room1.y + room1.height / 2) - (room2.y + room2.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getDirection(from: MazeRoom, to: MazeRoom): DoorDirection {
    const fromCenter = {
      x: from.x + from.width / 2,
      y: from.y + from.height / 2
    };
    const toCenter = {
      x: to.x + to.width / 2,
      y: to.y + to.height / 2
    };
    
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? DoorDirection.EAST : DoorDirection.WEST;
    } else {
      return dy > 0 ? DoorDirection.SOUTH : DoorDirection.NORTH;
    }
  }

  private oppositeDirection(direction: DoorDirection): DoorDirection {
    switch (direction) {
      case DoorDirection.NORTH: return DoorDirection.SOUTH;
      case DoorDirection.SOUTH: return DoorDirection.NORTH;
      case DoorDirection.EAST: return DoorDirection.WEST;
      case DoorDirection.WEST: return DoorDirection.EAST;
    }
  }
} 