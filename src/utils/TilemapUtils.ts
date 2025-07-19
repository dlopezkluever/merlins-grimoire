export class TilemapUtils {
    /**
     * Validates that a tilemap object has the required numeric properties
     */
    static validateObjectProperties(obj: any, requiredProps: string[] = ['x', 'y']): boolean {
        for (const prop of requiredProps) {
            if (typeof obj[prop] !== 'number') {
                console.warn(`Invalid object properties - missing or invalid ${prop}:`, obj);
                return false;
            }
        }
        return true;
    }

    /**
     * Gets a property value from a tilemap object's properties array
     */
    static getProperty(obj: any, propertyName: string): string | undefined {
        const property = obj.properties?.find((p: { name: string; value: string }) => p.name === propertyName);
        return property?.value;
    }

    /**
     * Validates and gets a room property from a tilemap object
     */
    static validateAndGetRoom(obj: any, rooms: Map<string, any>): any | null {
        if (!this.validateObjectProperties(obj)) {
            return null;
        }

        const roomId = this.getProperty(obj, 'Room');
        if (!roomId) {
            console.warn('Object missing Room property:', obj);
            return null;
        }

        const room = rooms.get(roomId);
        if (!room) {
            console.warn(`Room ${roomId} not found for object:`, obj);
            return null;
        }

        return room;
    }
} 