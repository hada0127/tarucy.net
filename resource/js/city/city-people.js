/**
 * city-people.js
 * Hong Kong Citypop Night City - Pedestrian System (Zone-Based)
 *
 * Features:
 * - Zone-based movement (2D rectangular areas)
 * - Waypoint navigation within zones
 * - Boundary clamping (never exit zone boundaries)
 * - Explicit connection points between zones
 * - Crosswalk-only road crossing
 */

import * as THREE from 'three';

// Person colors (neon citypop style)
const personColors = [
  0xff80a0, 0x80d0e0, 0xe080c0, 0x90e0e0, 0xd090e0,
  0xffaa80, 0x80ffaa, 0xaa80ff, 0xffff80, 0x80ffff
];

// ============================================================
// WALKABLE ZONES - Rectangular areas where people can walk
// ============================================================
const walkableZones = [
  // === Y=0 Level (Ground) ===

  // Main road north sidewalk (from main road to stairs/shops) - extended west
  { id: 'mainNorthSidewalk', xMin: -48, xMax: 55, zMin: -14, zMax: -10, y: 0 },

  // Main road south sidewalk - extended west to connect with south road junction
  { id: 'mainSouthSidewalk', xMin: -48, xMax: 55, zMin: -30, zMax: -26, y: 0 },

  // Hotel front sidewalk (connecting main sidewalks to hotel area)
  { id: 'hotelFrontSidewalkNorth', xMin: 55, xMax: 80, zMin: -14, zMax: -10, y: 0 },
  { id: 'hotelFrontSidewalkSouth', xMin: 55, xMax: 80, zMin: -30, zMax: -26, y: 0 },

  // Main road east (after hotel) - north
  { id: 'mainNorthEastSidewalk', xMin: 80, xMax: 200, zMin: -14, zMax: -10, y: 0 },

  // Main road east (after hotel) - south
  { id: 'mainSouthEastSidewalk', xMin: 80, xMax: 200, zMin: -30, zMax: -26, y: 0 },

  // South road sidewalks (extended north to connect with main area)
  { id: 'southEastSidewalk', xMin: -52, xMax: -48, zMin: -230, zMax: -26, y: 0 },
  { id: 'southWestSidewalk', xMin: -65, xMax: -61, zMin: -230, zMax: -26, y: 0 },

  // South road junction (connects main sidewalk to south road)
  { id: 'southRoadJunction', xMin: -65, xMax: -30, zMin: -35, zMax: -26, y: 0 },

  // Stairs landing area at bottom (Y=0, connects to shops/main road)
  // Extended x range to overlap with leftPark (-28) and connect to rightPark/hotel
  // zMax=17 to extend right under the wall (wall at z=18.5)
  { id: 'stairsBottomArea', xMin: -30, xMax: 48, zMin: -10, zMax: 18, y: 0 },

  // Hotel entrance area (Y=0, connects right park to hotel) - extended to wall
  { id: 'hotelEntranceArea', xMin: 30, xMax: 78, zMin: -10, zMax: 18, y: 0 },

  // Below right park area (Y=0, fills gap under the elevated park) - extended to wall
  { id: 'belowRightPark', xMin: 25, xMax: 47, zMin: -10, zMax: 18, y: 0 },

  // === Y=0 Level (Shopping District - same level as streets) ===

  // Left park area (children's playground) - extended to wall
  { id: 'leftPark', xMin: -52, xMax: -26, zMin: -10, zMax: 18, y: 0 },

  // Main shopping alley (between vendor stalls)
  { id: 'shopAlley', xMin: -20, xMax: 20, zMin: 2, zMax: 12, y: 0 },

  // Right park area (fountain park) - extended to wall
  { id: 'rightPark', xMin: 20, xMax: 50, zMin: -10, zMax: 18, y: 0 },

  // Connecting path between left park and shop alley (overlap with leftPark at x=-28 to -26)
  { id: 'leftParkToShop', xMin: -30, xMax: -16, zMin: -10, zMax: 12, y: 0 },

  // Connecting path between right park and shop alley (overlap with rightPark at x=18-24)
  { id: 'rightParkToShop', xMin: 16, xMax: 26, zMin: -10, zMax: 12, y: 0 },

  // Shop front area (connects to stairs)
  { id: 'shopFrontArea', xMin: -28, xMax: 28, zMin: -10, zMax: 3, y: 0 },

  // Back area behind shops (between shops and wall) - extended to wall
  { id: 'shopBackArea', xMin: -20, xMax: 20, zMin: 10, zMax: 18, y: 0 },

  // Right park to hotel connection - extended to wall
  { id: 'rightParkToHotel', xMin: 40, xMax: 78, zMin: -10, zMax: 18, y: 0 },

  // === Y=10 Level (Upper Residential) ===

  // Stairs top landing platform - matches actual rendered landing (z=15.5 to 18.5)
  // Left stairs exit at x=-3, Right stairs exit at x=3, both at z=17
  { id: 'stairsTopPlatform', xMin: -5, xMax: 5, zMin: 16, zMax: 18, y: 10 },

  // Residential walkway (after guardrail at z=18.5, pedestrian path z=20-28)
  { id: 'residentialPath', xMin: -47, xMax: 50, zMin: 20, zMax: 28, y: 10 },

  // === Y=10~16 (Sloped) ===
  { id: 'slopedPath', xMin: 50, xMax: 90, zMin: 20, zMax: 28, y: 'sloped', yStart: 10, yEnd: 16 },

  // === Y=16 (Flat Top) ===
  { id: 'flatTopPath', xMin: 90, xMax: 118, zMin: 20, zMax: 28, y: 16 },
];

// ============================================================
// ROAD ZONES - Areas where pedestrians cannot walk (except crosswalks)
// ============================================================
const roadZones = [
  // Main road (extended west to match sidewalk extension)
  { xMin: -50, xMax: 300, zMin: -25, zMax: -15 },
  // South road (only the actual road, sidewalks are separate zones)
  { xMin: -61, xMax: -52, zMin: -250, zMax: -35 },
];

// ============================================================
// ZONE CONNECTIONS - Points where zones connect
// ============================================================
const zoneConnections = [
  // === Main road crosswalks (north <-> south) ===
  {
    from: 'mainNorthSidewalk', to: 'mainSouthSidewalk',
    type: 'crosswalk', crosswalkId: 'main1',
    xMin: 22, xMax: 28, zFrom: -14, zTo: -26
  },
  {
    from: 'mainNorthSidewalk', to: 'mainSouthSidewalk',
    type: 'crosswalk', crosswalkId: 'main2',
    xMin: -38, xMax: -32, zFrom: -14, zTo: -26
  },

  // === Hotel front crosswalk (north <-> south) ===
  {
    from: 'hotelFrontSidewalkNorth', to: 'hotelFrontSidewalkSouth',
    type: 'crosswalk', crosswalkId: 'hotel1',
    xMin: 63, xMax: 69, zFrom: -14, zTo: -26
  },

  // === South road crosswalks (adjusted to match road zone) ===
  {
    from: 'southEastSidewalk', to: 'southWestSidewalk',
    type: 'crosswalk', crosswalkId: 'south1',
    zMin: -93, zMax: -87, xFrom: -52, xTo: -61
  },
  {
    from: 'southEastSidewalk', to: 'southWestSidewalk',
    type: 'crosswalk', crosswalkId: 'south2',
    zMin: -148, zMax: -142, xFrom: -52, xTo: -61
  },
  {
    from: 'southEastSidewalk', to: 'southWestSidewalk',
    type: 'crosswalk', crosswalkId: 'south3',
    zMin: -203, zMax: -197, xFrom: -52, xTo: -61
  },

  // === South road junction connections ===
  {
    from: 'mainSouthSidewalk', to: 'southRoadJunction',
    type: 'direct', xMin: -48, xMax: -30, z: -28
  },
  {
    from: 'southRoadJunction', to: 'southEastSidewalk',
    type: 'direct', xMin: -52, xMax: -48, z: -30
  },
  {
    from: 'southRoadJunction', to: 'southWestSidewalk',
    type: 'direct', xMin: -65, xMax: -61, z: -30
  },

  // === Main sidewalk to hotel front sidewalk ===
  {
    from: 'mainNorthSidewalk', to: 'hotelFrontSidewalkNorth',
    type: 'direct', xMin: 54, xMax: 56, z: -12
  },
  {
    from: 'mainSouthSidewalk', to: 'hotelFrontSidewalkSouth',
    type: 'direct', xMin: 54, xMax: 56, z: -28
  },

  // === Hotel front sidewalk to main east sidewalk ===
  {
    from: 'hotelFrontSidewalkNorth', to: 'mainNorthEastSidewalk',
    type: 'direct', xMin: 79, xMax: 81, z: -12
  },
  {
    from: 'hotelFrontSidewalkSouth', to: 'mainSouthEastSidewalk',
    type: 'direct', xMin: 79, xMax: 81, z: -28
  },

  // === Hotel front sidewalk to hotel entrance ===
  {
    from: 'hotelFrontSidewalkNorth', to: 'hotelEntranceArea',
    type: 'direct', xMin: 55, xMax: 70, z: -10
  },

  // === Main road to stairs bottom area (expanded range for better coverage) ===
  {
    from: 'mainNorthSidewalk', to: 'stairsBottomArea',
    type: 'direct', xMin: -30, xMax: 30, z: -10
  },

  // === Main road to left park ===
  {
    from: 'mainNorthSidewalk', to: 'leftPark',
    type: 'direct', xMin: -52, xMax: -28, z: -10
  },

  // === Main road to shop front area ===
  {
    from: 'mainNorthSidewalk', to: 'shopFrontArea',
    type: 'direct', xMin: -28, xMax: 28, z: -10
  },

  // === Main road to right park ===
  {
    from: 'mainNorthSidewalk', to: 'rightPark',
    type: 'direct', xMin: 22, xMax: 47, z: -10
  },

  // === Main road to below right park ===
  {
    from: 'mainNorthSidewalk', to: 'belowRightPark',
    type: 'direct', xMin: 25, xMax: 47, z: -10
  },

  // === Main road to right park hotel connection ===
  {
    from: 'mainNorthSidewalk', to: 'rightParkToHotel',
    type: 'direct', xMin: 46, xMax: 55, z: -10
  },

  // === Stairs bottom to below right park (overlap at x=25 to 47) ===
  {
    from: 'stairsBottomArea', to: 'belowRightPark',
    type: 'direct', xMin: 25, xMax: 47, z: 5
  },

  // === Stairs bottom to hotel entrance (overlap at x=30 to 48) ===
  {
    from: 'stairsBottomArea', to: 'hotelEntranceArea',
    type: 'direct', xMin: 30, xMax: 48, z: 5
  },

  // === Stairs bottom to right park (overlap at x=20 to 48) ===
  {
    from: 'stairsBottomArea', to: 'rightPark',
    type: 'direct', xMin: 20, xMax: 48, z: 5
  },

  // === Below right park to hotel entrance ===
  {
    from: 'belowRightPark', to: 'hotelEntranceArea',
    type: 'direct', xMin: 45, xMax: 50, z: 0
  },

  // === Right park to hotel entrance ===
  {
    from: 'rightPark', to: 'hotelEntranceArea',
    type: 'direct', xMin: 30, xMax: 50, z: 0
  },

  // === Stairs bottom area to shop front area ===
  {
    from: 'stairsBottomArea', to: 'shopFrontArea',
    type: 'direct', xMin: -30, xMax: 30, z: 0
  },

  // === Shop front to shop alley ===
  {
    from: 'shopFrontArea', to: 'shopAlley',
    type: 'direct', xMin: -20, xMax: 20, z: 2
  },

  // === Shop back area connections ===
  {
    from: 'shopAlley', to: 'shopBackArea',
    type: 'direct', xMin: -20, xMax: 20, z: 10
  },
  {
    from: 'shopBackArea', to: 'leftPark',
    type: 'direct', xMin: -28, xMax: -20, z: 12
  },
  {
    from: 'shopBackArea', to: 'rightPark',
    type: 'direct', xMin: 20, xMax: 24, z: 12
  },

  // === Left park connections ===
  {
    from: 'leftPark', to: 'leftParkToShop',
    type: 'direct', xMin: -30, xMax: -26, z: 5
  },
  {
    from: 'leftParkToShop', to: 'shopAlley',
    type: 'direct', xMin: -20, xMax: -16, z: 5
  },
  {
    from: 'leftParkToShop', to: 'shopFrontArea',
    type: 'direct', xMin: -28, xMax: -16, z: 0
  },
  // Left park to stairs bottom (overlap at x=-30 to -26)
  {
    from: 'leftPark', to: 'stairsBottomArea',
    type: 'direct', xMin: -30, xMax: -26, z: 8
  },

  // === Right park connections ===
  {
    from: 'rightPark', to: 'rightParkToShop',
    type: 'direct', xMin: 20, xMax: 26, z: 5
  },
  {
    from: 'rightParkToShop', to: 'shopAlley',
    type: 'direct', xMin: 16, xMax: 20, z: 5
  },
  {
    from: 'rightParkToShop', to: 'shopFrontArea',
    type: 'direct', xMin: 16, xMax: 28, z: 0
  },
  // Right park to stairs bottom (rightPark overlaps with stairsBottomArea at x=20-48)
  {
    from: 'rightPark', to: 'stairsBottomArea',
    type: 'direct', xMin: 20, xMax: 48, z: 8
  },

  // === Right park to hotel connections ===
  {
    from: 'rightPark', to: 'rightParkToHotel',
    type: 'direct', xMin: 40, xMax: 50, z: 10
  },
  {
    from: 'rightParkToHotel', to: 'hotelEntranceArea',
    type: 'direct', xMin: 50, xMax: 78, z: 5
  },
  {
    from: 'rightParkToHotel', to: 'belowRightPark',
    type: 'direct', xMin: 46, xMax: 48, z: 5
  },

  // === Stairs top platform connections ===
  {
    from: 'stairsTopPlatform', to: 'residentialPath',
    type: 'direct', xMin: -5, xMax: 5, z: 20
  },

  // === Upper residential connections ===
  {
    from: 'residentialPath', to: 'slopedPath',
    type: 'direct', xMin: 48, xMax: 52, z: 20
  },
  {
    from: 'slopedPath', to: 'flatTopPath',
    type: 'direct', xMin: 88, xMax: 92, z: 23
  },
];

// ============================================================
// CROSSWALK DEFINITIONS (for vehicle stopping)
// ============================================================
const crosswalks = [
  { id: 'main1', x: 25, z: -20, width: 10, length: 4, direction: 'vertical', roadType: 'main' },
  { id: 'main2', x: -35, z: -20, width: 10, length: 4, direction: 'vertical', roadType: 'main' },
  { id: 'hotel1', x: 66, z: -20, width: 10, length: 4, direction: 'vertical', roadType: 'main' },
  { id: 'south1', x: -55, z: -90, width: 4, length: 10, direction: 'horizontal', roadType: 'south' },
  { id: 'south2', x: -55, z: -145, width: 4, length: 10, direction: 'horizontal', roadType: 'south' },
  { id: 'south3', x: -55, z: -200, width: 4, length: 10, direction: 'horizontal', roadType: 'south' },
];

// ============================================================
// STAIR PATHS (for going between Y levels: Y=10 residential to Y=0 ground)
// Stairs are attached to wall at z=18.5, depth=3, so z ranges from ~15.5 to 18.5
// Left stairs: x=-3 (top) to x=-28 (bottom)
// Right stairs: x=3 (top) to x=28 (bottom)
// ============================================================
const stairPaths = [
  { id: 'leftStairs', xStart: -3, xEnd: -28, z: 17, yTop: 10, yBottom: 0 },
  { id: 'rightStairs', xStart: 3, xEnd: 28, z: 17, yTop: 10, yBottom: 0 },
];

// ============================================================
// ZONE POPULATION TARGETS
// ============================================================
const zonePopulationTargets = {
  // Y=0 Ground level
  mainNorthSidewalk: { min: 6, max: 12 },
  mainSouthSidewalk: { min: 6, max: 12 },
  hotelFrontSidewalkNorth: { min: 2, max: 5 },
  hotelFrontSidewalkSouth: { min: 2, max: 5 },
  mainNorthEastSidewalk: { min: 4, max: 8 },
  mainSouthEastSidewalk: { min: 4, max: 8 },
  southEastSidewalk: { min: 3, max: 6 },
  southWestSidewalk: { min: 3, max: 6 },
  southRoadJunction: { min: 2, max: 5 },
  stairsBottomArea: { min: 5, max: 10 },
  hotelEntranceArea: { min: 3, max: 6 },
  belowRightPark: { min: 3, max: 6 },

  // Y=0 Shopping district (same level as sidewalks)
  leftPark: { min: 6, max: 12 },
  shopAlley: { min: 12, max: 20 },
  rightPark: { min: 6, max: 12 },
  leftParkToShop: { min: 3, max: 6 },
  rightParkToShop: { min: 3, max: 6 },
  shopFrontArea: { min: 5, max: 10 },
  shopBackArea: { min: 4, max: 8 },
  rightParkToHotel: { min: 3, max: 6 },

  // Y=10+ Residential
  stairsTopPlatform: { min: 2, max: 5 },
  residentialPath: { min: 10, max: 20 },
  slopedPath: { min: 4, max: 8 },
  flatTopPath: { min: 3, max: 6 },
};

const MAX_POPULATION = 200;

// ============================================================
// STATE
// ============================================================
let pedestrians = [];
let crosswalkStates = {};
let sceneRef = null;

// ============================================================
// ZONE UTILITY FUNCTIONS
// ============================================================

/**
 * Get zone by ID
 */
function getZoneById(id) {
  return walkableZones.find(z => z.id === id);
}

/**
 * Check if position is inside a zone
 */
function isInsideZone(x, y, z, zone) {
  // Y level check - use larger tolerance (2.5) to handle Y=0 to Y=2 transitions
  const yTolerance = 2.5;
  if (zone.y === 'sloped') {
    const t = Math.max(0, Math.min(1, (x - zone.xMin) / (zone.xMax - zone.xMin)));
    const expectedY = zone.yStart + t * (zone.yEnd - zone.yStart);
    if (Math.abs(y - expectedY) > yTolerance) return false;
  } else {
    if (Math.abs(y - zone.y) > yTolerance) return false;
  }

  // XZ range check with small tolerance for smooth transitions
  const tolerance = 0.5;
  return x >= zone.xMin - tolerance && x <= zone.xMax + tolerance &&
         z >= zone.zMin - tolerance && z <= zone.zMax + tolerance;
}

/**
 * Check if position is on a road
 */
function isOnRoad(x, z, y) {
  if (y > 1) return false;
  for (const road of roadZones) {
    if (x >= road.xMin && x <= road.xMax && z >= road.zMin && z <= road.zMax) {
      return true;
    }
  }
  return false;
}

/**
 * Clamp position to connected zones (allows movement between connected zones)
 */
function clampToConnectedZones(person) {
  const data = person.userData;
  if (!data.currentZone) return;

  const pos = person.position;

  // Check if still inside current zone
  if (isInsideZone(pos.x, pos.y, pos.z, data.currentZone)) {
    // Update Y for sloped zones
    if (data.currentZone.y === 'sloped') {
      const t = Math.max(0, Math.min(1, (pos.x - data.currentZone.xMin) / (data.currentZone.xMax - data.currentZone.xMin)));
      person.position.y = data.currentZone.yStart + t * (data.currentZone.yEnd - data.currentZone.yStart);
    }
    return;
  }

  // Check if moved into a connected zone
  const connectedZones = getConnectedZones(data.currentZone.id);
  for (const zone of connectedZones) {
    if (zone.id !== data.currentZone.id && isInsideZone(pos.x, pos.y, pos.z, zone)) {
      // Transitioned to connected zone
      data.currentZone = zone;
      if (zone.y !== 'sloped') {
        person.position.y = zone.y;
      }
      return;
    }
  }

  // Check if moved into any other zone (for crosswalk destinations etc)
  const newZone = findZoneAtPosition(pos.x, pos.y, pos.z);
  if (newZone) {
    data.currentZone = newZone;
    if (newZone.y !== 'sloped') {
      person.position.y = newZone.y;
    }
    return;
  }

  // Not in any zone - clamp to current zone boundaries
  const zone = data.currentZone;
  const margin = 0.3;
  const oldX = person.position.x;
  const oldZ = person.position.z;

  person.position.x = Math.max(zone.xMin + margin, Math.min(zone.xMax - margin, person.position.x));
  person.position.z = Math.max(zone.zMin + margin, Math.min(zone.zMax - margin, person.position.z));

  // If position was clamped (hit boundary), pick a new waypoint to change direction
  const wasClamped = (oldX !== person.position.x || oldZ !== person.position.z);
  if (wasClamped) {
    // Increment stuck counter
    data.stuckCounter = (data.stuckCounter || 0) + 1;

    // After being stuck a few times, pick a completely new waypoint
    if (data.stuckCounter >= 3) {
      data.waypoint = getRandomPointInZone(zone);
      data.stuckCounter = 0;
    }
  } else {
    // Reset stuck counter when moving freely
    data.stuckCounter = 0;
  }
}

/**
 * Get random point inside a zone
 */
function getRandomPointInZone(zone) {
  const margin = 0.5;
  const x = zone.xMin + margin + Math.random() * (zone.xMax - zone.xMin - margin * 2);
  const z = zone.zMin + margin + Math.random() * (zone.zMax - zone.zMin - margin * 2);

  let y;
  if (zone.y === 'sloped') {
    const t = (x - zone.xMin) / (zone.xMax - zone.xMin);
    y = zone.yStart + t * (zone.yEnd - zone.yStart);
  } else {
    y = zone.y;
  }

  return { x, y, z };
}

/**
 * Get zone Y at a given X position
 */
function getZoneY(zone, x) {
  if (zone.y === 'sloped') {
    const t = Math.max(0, Math.min(1, (x - zone.xMin) / (zone.xMax - zone.xMin)));
    return zone.yStart + t * (zone.yEnd - zone.yStart);
  }
  return zone.y;
}

/**
 * Get connections from a zone
 */
function getConnectionsFrom(zoneId) {
  return zoneConnections.filter(c => c.from === zoneId || c.to === zoneId);
}

/**
 * Get all zones connected to the given zone (including different Y levels)
 */
function getConnectedZones(zoneId, visited = new Set()) {
  if (visited.has(zoneId)) return [];
  visited.add(zoneId);

  const currentZone = getZoneById(zoneId);
  if (!currentZone) return [];

  const result = [currentZone];
  const connections = getConnectionsFrom(zoneId);

  for (const conn of connections) {
    // Skip crosswalks - they require explicit crossing action
    if (conn.type === 'crosswalk') continue;

    const otherZoneId = conn.from === zoneId ? conn.to : conn.from;
    const otherZone = getZoneById(otherZoneId);

    if (otherZone && !visited.has(otherZoneId)) {
      // Include all directly connected zones regardless of Y level
      result.push(...getConnectedZones(otherZoneId, visited));
    }
  }

  return result.filter(z => z != null);
}

/**
 * Check if position is near a connection point
 */
function isNearConnection(pos, conn) {
  const tolerance = 2.0;

  if (conn.type === 'crosswalk') {
    if (conn.xMin !== undefined) {
      return pos.x >= conn.xMin - tolerance && pos.x <= conn.xMax + tolerance &&
             (Math.abs(pos.z - conn.zFrom) < tolerance || Math.abs(pos.z - conn.zTo) < tolerance);
    } else {
      return pos.z >= conn.zMin - tolerance && pos.z <= conn.zMax + tolerance &&
             (Math.abs(pos.x - conn.xFrom) < tolerance || Math.abs(pos.x - conn.xTo) < tolerance);
    }
  } else if (conn.z !== undefined) {
    return pos.x >= conn.xMin - tolerance && pos.x <= conn.xMax + tolerance &&
           Math.abs(pos.z - conn.z) < tolerance;
  } else if (conn.zFrom !== undefined) {
    return pos.x >= conn.xMin - tolerance && pos.x <= conn.xMax + tolerance &&
           (Math.abs(pos.z - conn.zFrom) < tolerance || Math.abs(pos.z - conn.zTo) < tolerance);
  }

  return false;
}

/**
 * Find which zone contains the given position
 */
function findZoneAtPosition(x, y, z) {
  for (const zone of walkableZones) {
    if (isInsideZone(x, y, z, zone)) {
      return zone;
    }
  }
  return null;
}

/**
 * Get a random waypoint from connected zones
 */
function getRandomWaypointInConnectedZones(currentZone) {
  const connectedZones = getConnectedZones(currentZone.id);

  // Weight current zone more heavily (50%), other zones share remaining 50%
  if (connectedZones.length <= 1 || Math.random() < 0.5) {
    return getRandomPointInZone(currentZone);
  }

  // Pick a random connected zone (excluding current)
  const otherZones = connectedZones.filter(z => z.id !== currentZone.id);
  if (otherZones.length === 0) {
    return getRandomPointInZone(currentZone);
  }

  const randomZone = otherZones[Math.floor(Math.random() * otherZones.length)];
  return getRandomPointInZone(randomZone);
}

// ============================================================
// PEDESTRIAN CREATION
// ============================================================

/**
 * Create a pedestrian mesh
 */
function createPedestrianMesh() {
  const group = new THREE.Group();
  const color = personColors[Math.floor(Math.random() * personColors.length)];
  const mat = new THREE.MeshBasicMaterial({ color });

  // Head
  const headGeom = new THREE.BoxGeometry(0.4, 0.45, 0.4);
  const head = new THREE.Mesh(headGeom, mat);
  head.position.y = 1.55;
  group.add(head);

  // Body
  const bodyGeom = new THREE.BoxGeometry(0.5, 0.7, 0.3);
  const body = new THREE.Mesh(bodyGeom, mat);
  body.position.y = 0.95;
  group.add(body);

  // Legs
  const legGeom = new THREE.BoxGeometry(0.18, 0.6, 0.18);
  const leftLeg = new THREE.Mesh(legGeom, mat);
  leftLeg.position.set(-0.12, 0.3, 0);
  group.add(leftLeg);
  const rightLeg = new THREE.Mesh(legGeom, mat);
  rightLeg.position.set(0.12, 0.3, 0);
  group.add(rightLeg);

  // Arms
  const armGeom = new THREE.BoxGeometry(0.14, 0.5, 0.14);
  const leftArm = new THREE.Mesh(armGeom, mat);
  leftArm.position.set(-0.35, 0.95, 0);
  group.add(leftArm);
  const rightArm = new THREE.Mesh(armGeom, mat);
  rightArm.position.set(0.35, 0.95, 0);
  group.add(rightArm);

  return group;
}

/**
 * Create a pedestrian in a specific zone
 */
function createPedestrian(scene, zoneId, position = null) {
  const zone = getZoneById(zoneId);
  if (!zone) return null;

  const group = createPedestrianMesh();

  // Set initial position
  const pos = position || getRandomPointInZone(zone);
  group.position.set(pos.x, pos.y, pos.z);

  group.userData = {
    currentZone: zone,
    speed: 1.5 + Math.random() * 1.0,
    state: 'walking',
    waypoint: null,
    animOffset: Math.random() * Math.PI * 2,
    animSpeed: 4 + Math.random() * 2,
    crossingData: null,
    stairData: null,
    waitTime: 0,
  };

  // Set initial waypoint (can be in connected zones)
  group.userData.waypoint = getRandomWaypointInConnectedZones(zone);
  updateRotation(group);

  scene.add(group);
  return group;
}

/**
 * Create a stair-walking pedestrian
 */
function createStairPedestrian(scene, stairId, goingUp) {
  const group = createPedestrianMesh();
  const stair = stairPaths.find(s => s.id === stairId);
  if (!stair) return null;

  const progress = Math.random();
  const x = stair.xStart + (stair.xEnd - stair.xStart) * progress;
  const y = stair.yTop + (stair.yBottom - stair.yTop) * progress;

  group.position.set(x, y, stair.z);

  group.userData = {
    currentZone: null,
    speed: 1.0 + Math.random() * 0.5,
    state: 'stairs',
    waypoint: null,
    animOffset: Math.random() * Math.PI * 2,
    animSpeed: 3 + Math.random() * 1,
    crossingData: null,
    stairData: {
      stairId: stairId,
      goingUp: goingUp,
      progress: progress
    },
    waitTime: 0,
  };

  group.rotation.y = goingUp ? -Math.PI / 2 : Math.PI / 2;

  scene.add(group);
  return group;
}

// ============================================================
// ROTATION & ANIMATION
// ============================================================

/**
 * Update pedestrian rotation to face movement direction
 */
function updateRotation(person) {
  const data = person.userData;

  if (data.state === 'crossing' && data.crossingData) {
    const dx = data.crossingData.endX - data.crossingData.startX;
    const dz = data.crossingData.endZ - data.crossingData.startZ;
    person.rotation.y = Math.atan2(dx, dz);
  } else if (data.waypoint) {
    const dx = data.waypoint.x - person.position.x;
    const dz = data.waypoint.z - person.position.z;
    if (Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1) {
      person.rotation.y = Math.atan2(dx, dz);
    }
  }
}

/**
 * Animate walking motion
 */
function animateWalk(person, time) {
  const data = person.userData;
  const zone = data.currentZone;

  if (data.state === 'waiting') {
    return;
  }

  const t = time * data.animSpeed + data.animOffset;

  // Bounce - only add bounce offset, don't reset Y (to preserve Y interpolation during transitions)
  if (data.state !== 'stairs' && data.state !== 'crossing') {
    const bounce = Math.abs(Math.sin(t * 2)) * 0.08;
    // Store base Y if not already stored, or update it when fully in a zone
    if (zone) {
      const zoneY = zone.y === 'sloped' ? getZoneY(zone, person.position.x) : zone.y;
      // Only snap Y if we're close to the zone's Y level (not during transitions)
      if (Math.abs(person.position.y - zoneY) < 0.3) {
        person.position.y = zoneY + bounce;
      } else {
        // During transitions, just add bounce to current Y
        // Store original Y to add bounce
        const baseY = Math.floor(person.position.y * 10) / 10; // Reduce jitter
        person.position.y = baseY + bounce;
      }
    }
  }

  // Legs
  if (person.children[2] && person.children[3]) {
    person.children[2].rotation.x = Math.sin(t) * 0.5;
    person.children[3].rotation.x = Math.sin(t + Math.PI) * 0.5;
  }

  // Arms
  if (person.children[4] && person.children[5]) {
    person.children[4].rotation.x = Math.sin(t + Math.PI) * 0.4;
    person.children[5].rotation.x = Math.sin(t) * 0.4;
  }
}

// ============================================================
// COLLISION AVOIDANCE
// ============================================================

/**
 * Get avoidance vector from nearby pedestrians
 */
function getAvoidanceVector(person, allPedestrians) {
  const avoidRadius = 1.0;
  const avoidStrength = 0.8;
  let avoidX = 0;
  let avoidZ = 0;

  for (const other of allPedestrians) {
    if (other === person) continue;
    if (Math.abs(person.position.y - other.position.y) > 2) continue;

    const dx = person.position.x - other.position.x;
    const dz = person.position.z - other.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < avoidRadius && dist > 0.1) {
      const factor = (avoidRadius - dist) / avoidRadius * avoidStrength;
      avoidX += (dx / dist) * factor;
      avoidZ += (dz / dist) * factor;
    }
  }

  return { x: avoidX, z: avoidZ };
}

// ============================================================
// CROSSING LOGIC
// ============================================================

/**
 * Start crossing a crosswalk
 */
function startCrossing(person, conn) {
  const data = person.userData;
  const pos = person.position;

  data.state = 'crossing';

  let startX, startZ, endX, endZ;

  if (conn.xMin !== undefined) {
    // Vertical crosswalk (crossing in Z direction)
    startX = pos.x;
    startZ = pos.z;
    endX = pos.x;
    endZ = Math.abs(pos.z - conn.zFrom) < Math.abs(pos.z - conn.zTo) ? conn.zTo : conn.zFrom;
  } else {
    // Horizontal crosswalk (crossing in X direction)
    startX = pos.x;
    startZ = pos.z;
    endX = Math.abs(pos.x - conn.xFrom) < Math.abs(pos.x - conn.xTo) ? conn.xTo : conn.xFrom;
    endZ = pos.z;
  }

  data.crossingData = {
    crosswalkId: conn.crosswalkId,
    startX: startX,
    startZ: startZ,
    endX: endX,
    endZ: endZ,
    progress: 0,
    targetZone: conn.from === data.currentZone?.id ? conn.to : conn.from
  };

  updateRotation(person);
}

/**
 * Update crossing state
 */
function updateCrossing(person, deltaTime) {
  const data = person.userData;
  const cd = data.crossingData;

  cd.progress += deltaTime * data.speed * 0.4;

  if (cd.progress >= 1) {
    person.position.x = cd.endX;
    person.position.z = cd.endZ;
    data.state = 'walking';

    // Assign to target zone
    const targetZone = getZoneById(cd.targetZone);
    if (targetZone) {
      data.currentZone = targetZone;
      data.waypoint = getRandomPointInZone(targetZone);
    }

    data.crossingData = null;
    return;
  }

  person.position.x = cd.startX + (cd.endX - cd.startX) * cd.progress;
  person.position.z = cd.startZ + (cd.endZ - cd.startZ) * cd.progress;
}

// ============================================================
// STAIR LOGIC
// ============================================================

/**
 * Update stair walking
 */
function updateStairWalking(person, deltaTime) {
  const data = person.userData;
  const sd = data.stairData;
  const stair = stairPaths.find(s => s.id === sd.stairId);

  const speedFactor = sd.goingUp ? 0.015 : 0.02;
  if (sd.goingUp) {
    sd.progress -= deltaTime * data.speed * speedFactor;
  } else {
    sd.progress += deltaTime * data.speed * speedFactor;
  }

  if (sd.progress <= 0 || sd.progress >= 1) {
    if (sd.progress <= 0) {
      // Reached top (y=10) - assign directly to residentialPath (skip stairsTopPlatform to avoid guardrail)
      person.position.y = stair.yTop;
      data.state = 'walking';
      data.stairData = null;
      data.currentZone = getZoneById('residentialPath');
      if (data.currentZone) {
        // Position past guardrail (z=18.5), on residential path
        person.position.z = 20;
        data.waypoint = getRandomPointInZone(data.currentZone);
      }
      updateRotation(person);
    } else {
      // Reached bottom (y=0) - assign to stairsBottomArea
      person.position.y = stair.yBottom;
      data.state = 'walking';
      data.stairData = null;
      data.currentZone = getZoneById('stairsBottomArea');
      if (data.currentZone) {
        // Position at stairs front (z=15.5, so z=15 is just in front)
        person.position.z = 15;
        data.waypoint = getRandomPointInZone(data.currentZone);
      }
      updateRotation(person);
    }
    return;
  }

  // Update position along stair
  person.position.x = stair.xStart + (stair.xEnd - stair.xStart) * sd.progress;
  person.position.y = stair.yTop + (stair.yBottom - stair.yTop) * sd.progress;
}

/**
 * Check if person should use stairs
 * Stairs connect residentialPath (Y=10) to stairsBottomArea (Y=0)
 */
function checkForStairs(person) {
  const data = person.userData;
  if (data.state !== 'walking') return;
  if (!data.currentZone) return;

  const pos = person.position;
  const zoneId = data.currentZone.id;

  for (const stair of stairPaths) {
    // From stairsTopPlatform or residentialPath (Y=10) - going down
    const canGoDown = (zoneId === 'stairsTopPlatform' || zoneId === 'residentialPath') &&
                      Math.abs(pos.y - stair.yTop) < 2;
    if (canGoDown) {
      // Check if near stairs entrance (x near xStart, z near stair.z)
      if (Math.abs(pos.x - stair.xStart) < 5 && Math.abs(pos.z - stair.z) < 5) {
        if (Math.random() < 0.01) {
          data.state = 'stairs';
          data.currentZone = null;
          data.stairData = {
            stairId: stair.id,
            goingUp: false,
            progress: 0
          };
          // Move to actual stair position
          person.position.x = stair.xStart;
          person.position.z = stair.z;
          // Face the direction of descent
          person.rotation.y = stair.xStart < stair.xEnd ? Math.PI / 2 : -Math.PI / 2;
          return;
        }
      }
    }

    // From stairsBottomArea (Y=0) - going up
    if (zoneId === 'stairsBottomArea' && Math.abs(pos.y - stair.yBottom) < 2) {
      // Check if near stairs entrance (x near xEnd, z near stair.z)
      if (Math.abs(pos.x - stair.xEnd) < 5 && Math.abs(pos.z - stair.z) < 5) {
        if (Math.random() < 0.01) {
          data.state = 'stairs';
          data.currentZone = null;
          data.stairData = {
            stairId: stair.id,
            goingUp: true,
            progress: 1
          };
          // Move to actual stair position
          person.position.x = stair.xEnd;
          person.position.z = stair.z;
          // Face the direction of ascent
          person.rotation.y = stair.xStart < stair.xEnd ? -Math.PI / 2 : Math.PI / 2;
          return;
        }
      }
    }
  }
}

// ============================================================
// ZONE TRANSITION
// ============================================================

/**
 * Check if pedestrian reached waypoint
 */
function reachedWaypoint(person) {
  const data = person.userData;
  if (!data.waypoint) return true;

  const dx = data.waypoint.x - person.position.x;
  const dz = data.waypoint.z - person.position.z;
  return Math.sqrt(dx * dx + dz * dz) < 0.5;
}

/**
 * Try to cross a crosswalk (only handles crosswalks, direct transitions are automatic)
 */
function tryZoneTransition(person) {
  const data = person.userData;
  if (!data.currentZone) return;

  const pos = person.position;
  const connections = getConnectionsFrom(data.currentZone.id);

  for (const conn of connections) {
    // Only handle crosswalks here - direct transitions are handled by clampToConnectedZones
    if (conn.type !== 'crosswalk') continue;
    if (!isNearConnection(pos, conn)) continue;

    // Random chance to cross (5% per frame when near crosswalk)
    if (Math.random() > 0.05) continue;

    startCrossing(person, conn);
    return;
  }
}

// ============================================================
// MAIN UPDATE
// ============================================================

/**
 * Update a single pedestrian
 */
function updatePedestrian(person, deltaTime, allPedestrians) {
  const data = person.userData;

  // Handle stairs
  if (data.state === 'stairs') {
    updateStairWalking(person, deltaTime);
    return;
  }

  // Handle crossing
  if (data.state === 'crossing') {
    updateCrossing(person, deltaTime);
    return;
  }

  // Handle waiting
  if (data.state === 'waiting') {
    data.waitTime -= deltaTime;
    if (data.waitTime <= 0) {
      data.state = 'walking';
    }
    return;
  }

  // No zone assigned
  if (!data.currentZone) return;

  // Check if waypoint reached or doesn't exist - pick from connected zones
  if (!data.waypoint || reachedWaypoint(person)) {
    data.waypoint = getRandomWaypointInConnectedZones(data.currentZone);
  }

  // Get avoidance
  const avoid = getAvoidanceVector(person, allPedestrians);

  // Calculate movement toward waypoint (including Y for smooth transitions)
  const dx = data.waypoint.x - person.position.x;
  const dy = data.waypoint.y - person.position.y;
  const dz = data.waypoint.z - person.position.z;
  const distXZ = Math.sqrt(dx * dx + dz * dz);
  const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (distXZ > 0.1) {
    const speed = data.speed * deltaTime;
    const moveX = (dx / distXZ) * speed + avoid.x * deltaTime;
    const moveZ = (dz / distXZ) * speed + avoid.z * deltaTime;

    person.position.x += moveX;
    person.position.z += moveZ;

    // Smoothly interpolate Y position toward waypoint Y
    if (Math.abs(dy) > 0.1) {
      const ySpeed = Math.abs(dy) / distXZ * speed * 2; // Move Y faster to match terrain
      person.position.y += Math.sign(dy) * Math.min(ySpeed, Math.abs(dy));
    }
  }

  // Handle zone transitions and boundary clamping
  clampToConnectedZones(person);

  // Update rotation
  updateRotation(person);

  // Check for crosswalk crossing opportunities
  tryZoneTransition(person);

  // Check for stairs (Y=0 <-> Y=10)
  checkForStairs(person);
}

// ============================================================
// CROSSWALK STATE (for vehicles)
// ============================================================

/**
 * Check if any pedestrian is on a crosswalk
 */
function isPedestrianOnCrosswalk(crosswalk) {
  for (const person of pedestrians) {
    if (person.userData.state === 'crossing') {
      const cd = person.userData.crossingData;
      if (cd && cd.crosswalkId === crosswalk.id) return true;
    }
    const pos = person.position;
    const cw = crosswalk;
    if (cw.direction === 'vertical') {
      if (Math.abs(pos.x - cw.x) < cw.length / 2 && Math.abs(pos.z - cw.z) < cw.width / 2) return true;
    } else {
      if (Math.abs(pos.x - cw.x) < cw.width / 2 && Math.abs(pos.z - cw.z) < cw.length / 2) return true;
    }
  }
  return false;
}

// ============================================================
// POPULATION MANAGEMENT
// ============================================================

/**
 * Count pedestrians in a zone
 */
function countPedestriansInZone(zoneId) {
  return pedestrians.filter(p => p.userData.currentZone?.id === zoneId).length;
}

/**
 * Spawn pedestrian in zone if needed
 */
function balanceZonePopulation(zoneId, config) {
  if (!sceneRef) return;

  const count = countPedestriansInZone(zoneId);

  // Spawn if below minimum
  if (count < config.min && pedestrians.length < MAX_POPULATION) {
    const person = createPedestrian(sceneRef, zoneId);
    if (person) {
      pedestrians.push(person);
    }
  }

  // Remove if above maximum
  if (count > config.max && Math.random() < 0.3) {
    for (let i = pedestrians.length - 1; i >= 0; i--) {
      if (pedestrians[i].userData.currentZone?.id === zoneId) {
        sceneRef.remove(pedestrians[i]);
        pedestrians.splice(i, 1);
        break;
      }
    }
  }
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Initialize pedestrian system
 */
export function initPedestrians(scene) {
  pedestrians = [];
  sceneRef = scene;

  // Spawn initial population based on targets
  for (const [zoneId, config] of Object.entries(zonePopulationTargets)) {
    const count = config.min + Math.floor(Math.random() * (config.max - config.min));
    for (let i = 0; i < count; i++) {
      const person = createPedestrian(scene, zoneId);
      if (person) {
        pedestrians.push(person);
      }
    }
  }

  // Add some stair walkers
  for (let i = 0; i < 2; i++) {
    const p1 = createStairPedestrian(scene, 'leftStairs', Math.random() > 0.5);
    const p2 = createStairPedestrian(scene, 'rightStairs', Math.random() > 0.5);
    if (p1) pedestrians.push(p1);
    if (p2) pedestrians.push(p2);
  }

  // Initialize crosswalk states
  crosswalks.forEach(cw => {
    crosswalkStates[cw.id] = false;
  });

  return pedestrians;
}

/**
 * Update all pedestrians
 */
export function updatePedestrians(deltaTime, time) {
  // Update crosswalk states
  crosswalks.forEach(cw => {
    crosswalkStates[cw.id] = isPedestrianOnCrosswalk(cw);
  });

  // Update each pedestrian
  pedestrians.forEach(person => {
    updatePedestrian(person, deltaTime, pedestrians);
    animateWalk(person, time);
  });

  // Population balancing (1% chance per frame)
  if (Math.random() < 0.01 && sceneRef) {
    for (const [zoneId, config] of Object.entries(zonePopulationTargets)) {
      balanceZonePopulation(zoneId, config);
    }
  }
}

/**
 * Check if vehicle should stop for pedestrians
 */
export function shouldVehicleStop(vehicleX, vehicleZ, vehicleLane) {
  if (pedestrians.length === 0) return false;

  for (const cw of crosswalks) {
    let isApproaching = false;
    let distanceToCrosswalk = Infinity;

    if (cw.roadType === 'main') {
      if (vehicleLane === 'mainWest' || vehicleLane === 'mainEast') {
        distanceToCrosswalk = Math.abs(vehicleX - cw.x);
        if (distanceToCrosswalk < 15 && distanceToCrosswalk > 2) isApproaching = true;
      }
    } else if (cw.roadType === 'south') {
      if (vehicleLane === 'southUp' || vehicleLane === 'southDown') {
        distanceToCrosswalk = Math.abs(vehicleZ - cw.z);
        if (distanceToCrosswalk < 15 && distanceToCrosswalk > 2) isApproaching = true;
      }
    }

    if (isApproaching && crosswalkStates[cw.id]) return true;
  }
  return false;
}

export function getPedestrians() { return pedestrians; }
export function getCrosswalkStates() { return crosswalkStates; }

/**
 * Visualize walkable zones (for debugging)
 */
export function visualizeWalkableZones(scene) {
  const zoneMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  const crosswalkMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  const stairMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  const connectionMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  const visualizations = [];

  // Visualize walkable zones (RED)
  for (const zone of walkableZones) {
    const width = zone.xMax - zone.xMin;
    const depth = zone.zMax - zone.zMin;
    const centerX = (zone.xMin + zone.xMax) / 2;
    const centerZ = (zone.zMin + zone.zMax) / 2;

    if (zone.y === 'sloped') {
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        zone.xMin, zone.yStart + 0.1, zone.zMin,
        zone.xMax, zone.yEnd + 0.1, zone.zMin,
        zone.xMin, zone.yStart + 0.1, zone.zMax,
        zone.xMax, zone.yEnd + 0.1, zone.zMin,
        zone.xMax, zone.yEnd + 0.1, zone.zMax,
        zone.xMin, zone.yStart + 0.1, zone.zMax,
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, zoneMaterial);
      scene.add(mesh);
      visualizations.push(mesh);
    } else {
      const geometry = new THREE.PlaneGeometry(width, depth);
      const mesh = new THREE.Mesh(geometry, zoneMaterial);
      mesh.position.set(centerX, zone.y + 0.1, centerZ);
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);
      visualizations.push(mesh);
    }
  }

  // Visualize crosswalks (GREEN)
  for (const cw of crosswalks) {
    const geometry = new THREE.PlaneGeometry(cw.length, cw.width);
    const mesh = new THREE.Mesh(geometry, crosswalkMaterial);
    mesh.position.set(cw.x, 0.15, cw.z);
    mesh.rotation.x = -Math.PI / 2;
    if (cw.direction === 'horizontal') {
      mesh.rotation.z = Math.PI / 2;
    }
    scene.add(mesh);
    visualizations.push(mesh);
  }

  // Visualize stairs (BLUE)
  for (const stair of stairPaths) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      stair.xStart, stair.yTop + 0.1, stair.z - 1.5,
      stair.xEnd, stair.yBottom + 0.1, stair.z - 1.5,
      stair.xStart, stair.yTop + 0.1, stair.z + 1.5,
      stair.xEnd, stair.yBottom + 0.1, stair.z - 1.5,
      stair.xEnd, stair.yBottom + 0.1, stair.z + 1.5,
      stair.xStart, stair.yTop + 0.1, stair.z + 1.5,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, stairMaterial);
    scene.add(mesh);
    visualizations.push(mesh);
  }

  // Visualize zone connections (YELLOW - small markers)
  for (const conn of zoneConnections) {
    if (conn.type === 'crosswalk') continue; // Already shown in green

    let x, z, y = 0.2;
    if (conn.z !== undefined) {
      x = (conn.xMin + conn.xMax) / 2;
      z = conn.z;
    } else if (conn.zFrom !== undefined) {
      x = (conn.xMin + conn.xMax) / 2;
      z = (conn.zFrom + conn.zTo) / 2;
    } else {
      continue;
    }

    // Find Y from connected zones
    const fromZone = getZoneById(conn.from);
    if (fromZone) {
      y = (fromZone.y === 'sloped' ? fromZone.yStart : fromZone.y) + 0.2;
    }

    const geometry = new THREE.PlaneGeometry(3, 3);
    const mesh = new THREE.Mesh(geometry, connectionMaterial);
    mesh.position.set(x, y, z);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    visualizations.push(mesh);
  }

  return visualizations;
}

export { crosswalks, walkableZones as walkPaths };
