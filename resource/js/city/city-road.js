/**
 * city-road.js
 * Hong Kong Citypop Night City - Roads, Crosswalks, Guardrails
 *
 * Contains:
 * - Main road (tunnel to curve)
 * - Curved 90-degree turn
 * - South road (after curve)
 * - Residential pedestrian path
 * - Sloped road extension
 * - Guardrails and retaining walls
 * - Crosswalks
 */

import * as THREE from 'three';

/**
 * Create road helper (internal)
 */
function createRoadHelper(scene, x, z, y, width, length, rotation = 0) {
  // Road (dark navy)
  const roadGeometry = new THREE.PlaneGeometry(width, length);
  const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x252530 });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rotation;
  road.position.set(x, y + 0.01, z);
  scene.add(road);

  // Road edges (light pink)
  const edgeGeom = new THREE.PlaneGeometry(0.15, length);
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xddaaaa });

  const leftEdge = new THREE.Mesh(edgeGeom, edgeMat);
  leftEdge.rotation.x = -Math.PI / 2;
  leftEdge.rotation.z = rotation;
  if (rotation === 0) {
    leftEdge.position.set(x - width/2 + 0.2, y + 0.02, z);
  } else {
    leftEdge.position.set(x, y + 0.02, z - width/2 + 0.2);
  }
  scene.add(leftEdge);

  const rightEdge = new THREE.Mesh(edgeGeom, edgeMat);
  rightEdge.rotation.x = -Math.PI / 2;
  rightEdge.rotation.z = rotation;
  if (rotation === 0) {
    rightEdge.position.set(x + width/2 - 0.2, y + 0.02, z);
  } else {
    rightEdge.position.set(x, y + 0.02, z + width/2 - 0.2);
  }
  scene.add(rightEdge);
}

/**
 * Create roads - Main road + Residential road + Shopping alley
 * Main road goes from east (tunnel) through hotel/shopping to playground, then turns south
 */
export function createRoads(scene) {
  const roadY = 0.03;
  const roadZ = -20;
  const roadWidth = 10;
  const dashLength = 3;
  const dashGap = 2;
  const centerLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  const noStopLineMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  const roadMat = new THREE.MeshBasicMaterial({ color: 0x252530, side: THREE.DoubleSide });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xddaaaa });

  // === Curve parameters (defines where main road ends) ===
  const turnCenterX = -40;      // Center of the curve (X) - east of south road
  const turnCenterZ = -35;      // Center of the curve (Z) - south of main road
  const turnRadius = 15;        // Radius of the curve
  const turnRoadWidth = 10;     // Same as main road width

  // Main road ends where the curve begins (at north side of curve)
  const mainRoadEndX = turnCenterX; // x = -40 (curve connects at this x)
  const mainRoadStartX = 300;   // East end (toward tunnel)
  const mainRoadLength = mainRoadStartX - mainRoadEndX; // 340
  const mainRoadCenterX = (mainRoadStartX + mainRoadEndX) / 2; // 130

  // === Main road (from tunnel to curve start) ===
  // Road surface
  const mainRoadGeom = new THREE.PlaneGeometry(mainRoadLength, roadWidth);
  const mainRoad = new THREE.Mesh(mainRoadGeom, roadMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(mainRoadCenterX, roadY - 0.01, roadZ);
  scene.add(mainRoad);

  // Edge lines - stop before curve junction (leave gap of ~5 units)
  const mainEdgeLength = mainRoadLength - 10; // Shorter to not reach junction
  const mainEdgeCenterX = mainRoadCenterX + 5; // Shift right to keep gap at curve
  const mainEdgeGeom = new THREE.PlaneGeometry(mainEdgeLength, 0.15);

  const mainLeftEdge = new THREE.Mesh(mainEdgeGeom, edgeMat);
  mainLeftEdge.rotation.x = -Math.PI / 2;
  mainLeftEdge.position.set(mainEdgeCenterX, roadY + 0.02, roadZ - roadWidth/2 + 0.2);
  scene.add(mainLeftEdge);

  const mainRightEdge = new THREE.Mesh(mainEdgeGeom, edgeMat);
  mainRightEdge.rotation.x = -Math.PI / 2;
  mainRightEdge.position.set(mainEdgeCenterX, roadY + 0.02, roadZ + roadWidth/2 - 0.2);
  scene.add(mainRightEdge);

  // Dashed yellow center line
  const numDashes = Math.floor(mainRoadLength / (dashLength + dashGap));
  for (let i = 0; i < numDashes; i++) {
    const dashGeom = new THREE.PlaneGeometry(dashLength, 0.2);
    const dash = new THREE.Mesh(dashGeom, centerLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(mainRoadEndX + dashLength/2 + i * (dashLength + dashGap), roadY, roadZ);
    scene.add(dash);
  }

  // Yellow no-parking lines on both sides
  const sideLineGeom = new THREE.PlaneGeometry(mainRoadLength, 0.15);

  const leftSideLine = new THREE.Mesh(sideLineGeom, noStopLineMat);
  leftSideLine.rotation.x = -Math.PI / 2;
  leftSideLine.position.set(mainRoadCenterX, roadY, roadZ - roadWidth/2 + 0.8);
  scene.add(leftSideLine);

  const rightSideLine = new THREE.Mesh(sideLineGeom, noStopLineMat);
  rightSideLine.rotation.x = -Math.PI / 2;
  rightSideLine.position.set(mainRoadCenterX, roadY, roadZ + roadWidth/2 - 0.8);
  scene.add(rightSideLine);

  // Crosswalks (zebra crossings) - main road
  const crosswalkPositions = [25, -35]; // Right side and near curve junction

  crosswalkPositions.forEach(xPos => {
    const stripeLength = 4;
    const stripeWidth = 0.5;
    const stripeGap = 0.4;
    const numStripes = 10;

    for (let i = 0; i < numStripes; i++) {
      const stripeGeom = new THREE.PlaneGeometry(stripeLength, stripeWidth);
      const stripe = new THREE.Mesh(stripeGeom, crosswalkMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(
        xPos,
        roadY + 0.01,
        roadZ - roadWidth/2 + 1 + i * (stripeWidth + stripeGap)
      );
      scene.add(stripe);
    }
  });

  // === Curved 90-degree turn (from main road going south) ===
  const turnSegments = 16;

  // Create curved road surface using BufferGeometry
  // Curve goes from angle π/2 (north, connecting to main road) to π (west, connecting to south road)
  const curveVertices = [];
  for (let i = 0; i <= turnSegments; i++) {
    const angle = Math.PI / 2 + (Math.PI / 2) * (i / turnSegments); // 90 to 180 degrees
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Inner edge of road (closer to turn center)
    const innerX = turnCenterX + (turnRadius - turnRoadWidth / 2) * cos;
    const innerZ = turnCenterZ + (turnRadius - turnRoadWidth / 2) * sin;

    // Outer edge of road (farther from turn center)
    const outerX = turnCenterX + (turnRadius + turnRoadWidth / 2) * cos;
    const outerZ = turnCenterZ + (turnRadius + turnRoadWidth / 2) * sin;

    if (i > 0) {
      const prevAngle = Math.PI / 2 + (Math.PI / 2) * ((i - 1) / turnSegments);
      const prevCos = Math.cos(prevAngle);
      const prevSin = Math.sin(prevAngle);

      const prevInnerX = turnCenterX + (turnRadius - turnRoadWidth / 2) * prevCos;
      const prevInnerZ = turnCenterZ + (turnRadius - turnRoadWidth / 2) * prevSin;
      const prevOuterX = turnCenterX + (turnRadius + turnRoadWidth / 2) * prevCos;
      const prevOuterZ = turnCenterZ + (turnRadius + turnRoadWidth / 2) * prevSin;

      // Triangle 1
      curveVertices.push(prevInnerX, roadY - 0.01, prevInnerZ);
      curveVertices.push(prevOuterX, roadY - 0.01, prevOuterZ);
      curveVertices.push(innerX, roadY - 0.01, innerZ);

      // Triangle 2
      curveVertices.push(prevOuterX, roadY - 0.01, prevOuterZ);
      curveVertices.push(outerX, roadY - 0.01, outerZ);
      curveVertices.push(innerX, roadY - 0.01, innerZ);
    }
  }

  const curveGeom = new THREE.BufferGeometry();
  curveGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(curveVertices), 3));
  curveGeom.computeVertexNormals();
  const curveRoad = new THREE.Mesh(curveGeom, roadMat);
  scene.add(curveRoad);

  // Curved road edges (inner and outer) - skip first and last segments at junctions
  for (let edge = 0; edge < 2; edge++) {
    const edgeRadius = edge === 0
      ? turnRadius - turnRoadWidth / 2 + 0.2
      : turnRadius + turnRoadWidth / 2 - 0.2;

    for (let i = 1; i < turnSegments - 1; i++) {
      const angle1 = Math.PI / 2 + (Math.PI / 2) * (i / turnSegments);
      const angle2 = Math.PI / 2 + (Math.PI / 2) * ((i + 1) / turnSegments);

      const x1 = turnCenterX + edgeRadius * Math.cos(angle1);
      const z1 = turnCenterZ + edgeRadius * Math.sin(angle1);
      const x2 = turnCenterX + edgeRadius * Math.cos(angle2);
      const z2 = turnCenterZ + edgeRadius * Math.sin(angle2);

      const segLength = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const segAngle = Math.atan2(z2 - z1, x2 - x1);

      const edgeGeom = new THREE.PlaneGeometry(segLength, 0.15);
      const edgeLine = new THREE.Mesh(edgeGeom, edgeMat);
      edgeLine.rotation.x = -Math.PI / 2;
      edgeLine.rotation.z = -segAngle;
      edgeLine.position.set((x1 + x2) / 2, roadY + 0.02, (z1 + z2) / 2);
      scene.add(edgeLine);
    }
  }

  // Dashed center line for curved section
  for (let i = 0; i < turnSegments; i += 2) {
    const angle1 = Math.PI / 2 + (Math.PI / 2) * (i / turnSegments);
    const angle2 = Math.PI / 2 + (Math.PI / 2) * ((i + 1) / turnSegments);

    const x1 = turnCenterX + turnRadius * Math.cos(angle1);
    const z1 = turnCenterZ + turnRadius * Math.sin(angle1);
    const x2 = turnCenterX + turnRadius * Math.cos(angle2);
    const z2 = turnCenterZ + turnRadius * Math.sin(angle2);

    const segLength = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
    const segAngle = Math.atan2(z2 - z1, x2 - x1);

    const dashGeom = new THREE.PlaneGeometry(segLength, 0.2);
    const dash = new THREE.Mesh(dashGeom, centerLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.rotation.z = -segAngle;
    dash.position.set((x1 + x2) / 2, roadY + 0.03, (z1 + z2) / 2);
    scene.add(dash);
  }

  // Yellow no-parking lines for curved section (inner and outer)
  for (let side = 0; side < 2; side++) {
    const sideRadius = side === 0
      ? turnRadius - turnRoadWidth / 2 + 0.8  // Inner side
      : turnRadius + turnRoadWidth / 2 - 0.8; // Outer side

    for (let i = 0; i < turnSegments; i++) {
      const angle1 = Math.PI / 2 + (Math.PI / 2) * (i / turnSegments);
      const angle2 = Math.PI / 2 + (Math.PI / 2) * ((i + 1) / turnSegments);

      const x1 = turnCenterX + sideRadius * Math.cos(angle1);
      const z1 = turnCenterZ + sideRadius * Math.sin(angle1);
      const x2 = turnCenterX + sideRadius * Math.cos(angle2);
      const z2 = turnCenterZ + sideRadius * Math.sin(angle2);

      const segLength = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const segAngle = Math.atan2(z2 - z1, x2 - x1);

      const sideLineGeom = new THREE.PlaneGeometry(segLength, 0.15);
      const sideLine = new THREE.Mesh(sideLineGeom, noStopLineMat);
      sideLine.rotation.x = -Math.PI / 2;
      sideLine.rotation.z = -segAngle;
      sideLine.position.set((x1 + x2) / 2, roadY, (z1 + z2) / 2);
      scene.add(sideLine);
    }
  }

  // === Straight road going south after the curve ===
  // Curve ends at angle π: x = turnCenterX - turnRadius, z = turnCenterZ
  const southRoadX = turnCenterX - turnRadius; // = -55
  const southRoadStartZ = turnCenterZ; // = -35
  const southRoadEndZ = -250; // How far south the road goes
  const southRoadLength = Math.abs(southRoadEndZ - southRoadStartZ);

  // South road surface
  const southRoadGeom = new THREE.PlaneGeometry(turnRoadWidth, southRoadLength);
  const southRoad = new THREE.Mesh(southRoadGeom, roadMat);
  southRoad.rotation.x = -Math.PI / 2;
  southRoad.position.set(southRoadX, roadY - 0.01, (southRoadStartZ + southRoadEndZ) / 2);
  scene.add(southRoad);

  // South road edges - start after curve junction (leave gap of ~5 units)
  const southEdgeStartZ = southRoadStartZ - 5; // Start 5 units after junction
  const southEdgeLength = Math.abs(southRoadEndZ - southEdgeStartZ);
  const southEdgeCenterZ = (southEdgeStartZ + southRoadEndZ) / 2;

  const southEdgeGeom = new THREE.PlaneGeometry(0.15, southEdgeLength);
  const southLeftEdge = new THREE.Mesh(southEdgeGeom, edgeMat);
  southLeftEdge.rotation.x = -Math.PI / 2;
  southLeftEdge.position.set(southRoadX - turnRoadWidth / 2 + 0.2, roadY + 0.02, southEdgeCenterZ);
  scene.add(southLeftEdge);

  const southRightEdge = new THREE.Mesh(southEdgeGeom, edgeMat);
  southRightEdge.rotation.x = -Math.PI / 2;
  southRightEdge.position.set(southRoadX + turnRoadWidth / 2 - 0.2, roadY + 0.02, southEdgeCenterZ);
  scene.add(southRightEdge);

  // Dashed center line for south road
  const southDashCount = Math.floor(southRoadLength / (dashLength + dashGap));
  for (let i = 0; i < southDashCount; i++) {
    const dashGeom = new THREE.PlaneGeometry(0.2, dashLength);
    const dash = new THREE.Mesh(dashGeom, centerLineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(southRoadX, roadY + 0.03, southRoadStartZ - dashLength / 2 - i * (dashLength + dashGap));
    scene.add(dash);
  }

  // Yellow no-parking lines for south road (both sides)
  const southSideLineGeom = new THREE.PlaneGeometry(0.15, southRoadLength);

  const southLeftSideLine = new THREE.Mesh(southSideLineGeom, noStopLineMat);
  southLeftSideLine.rotation.x = -Math.PI / 2;
  southLeftSideLine.position.set(southRoadX - turnRoadWidth / 2 + 0.8, roadY, (southRoadStartZ + southRoadEndZ) / 2);
  scene.add(southLeftSideLine);

  const southRightSideLine = new THREE.Mesh(southSideLineGeom, noStopLineMat);
  southRightSideLine.rotation.x = -Math.PI / 2;
  southRightSideLine.position.set(southRoadX + turnRoadWidth / 2 - 0.8, roadY, (southRoadStartZ + southRoadEndZ) / 2);
  scene.add(southRightSideLine);

  // South road crosswalks (3 evenly distributed)
  const southCrosswalkZPositions = [-90, -145, -200];
  const southStripeLength = 4;
  const southStripeWidth = 0.5;
  const southStripeGap = 0.4;
  const southNumStripes = 10;

  southCrosswalkZPositions.forEach(zPos => {
    for (let i = 0; i < southNumStripes; i++) {
      const sStripeGeom = new THREE.PlaneGeometry(southStripeWidth, southStripeLength);
      const sStripe = new THREE.Mesh(sStripeGeom, crosswalkMat);
      sStripe.rotation.x = -Math.PI / 2;
      sStripe.position.set(
        southRoadX - turnRoadWidth / 2 + 1 + i * (southStripeWidth + southStripeGap),
        roadY + 0.04,
        zPos
      );
      scene.add(sStripe);
    }
  });

  // === Slope variables (used by guardrails) ===
  const slopeStartX = 47.5;
  const slopeEndX = 92.5;
  const slopeStartY = 10.01;
  const slopeEndY = 16;

  // === Guardrails along slope and flat top (z=18.5 to match main road guardrail) ===
  const guardZ = 18.5;
  const slopeRailMat = new THREE.MeshBasicMaterial({ color: 0x656575 });
  const slopePostMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  const slopeRise = slopeEndY - slopeStartY;
  const slopeHorizontalLength = slopeEndX - slopeStartX;

  // Sloped guardrail posts (every 3 units along slope)
  const numSlopePosts = 15;
  for (let i = 0; i <= numSlopePosts; i++) {
    const t = i / numSlopePosts;
    const postX = slopeStartX + t * slopeHorizontalLength;
    const postY = slopeStartY + t * slopeRise;

    const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const post = new THREE.Mesh(postGeom, slopePostMat);
    post.position.set(postX, postY + 0.4, guardZ);
    scene.add(post);
  }

  // Sloped guardrail bars (using BufferGeometry)
  const slopeRailVertices1 = new Float32Array([
    slopeStartX, slopeStartY + 0.7, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.7, guardZ - 0.04,
    slopeStartX, slopeStartY + 0.7, guardZ + 0.04,
    slopeEndX, slopeEndY + 0.7, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.7, guardZ + 0.04,
    slopeStartX, slopeStartY + 0.7, guardZ + 0.04,
  ]);
  const slopeRailGeom1 = new THREE.BufferGeometry();
  slopeRailGeom1.setAttribute('position', new THREE.BufferAttribute(slopeRailVertices1, 3));
  const slopeRail1 = new THREE.Mesh(slopeRailGeom1, new THREE.MeshBasicMaterial({ color: 0x656575, side: THREE.DoubleSide }));
  scene.add(slopeRail1);

  const slopeRailVertices2 = new Float32Array([
    slopeStartX, slopeStartY + 0.4, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.4, guardZ - 0.04,
    slopeStartX, slopeStartY + 0.4, guardZ + 0.04,
    slopeEndX, slopeEndY + 0.4, guardZ - 0.04,
    slopeEndX, slopeEndY + 0.4, guardZ + 0.04,
    slopeStartX, slopeStartY + 0.4, guardZ + 0.04,
  ]);
  const slopeRailGeom2 = new THREE.BufferGeometry();
  slopeRailGeom2.setAttribute('position', new THREE.BufferAttribute(slopeRailVertices2, 3));
  const slopeRail2 = new THREE.Mesh(slopeRailGeom2, new THREE.MeshBasicMaterial({ color: 0x656575, side: THREE.DoubleSide }));
  scene.add(slopeRail2);

  // Flat top guardrail
  const flatRailBarGeom = new THREE.BoxGeometry(30, 0.12, 0.08);
  const flatRailBar1 = new THREE.Mesh(flatRailBarGeom, slopeRailMat);
  flatRailBar1.position.set(slopeEndX + 15, slopeEndY + 0.7, guardZ);
  scene.add(flatRailBar1);
  const flatRailBar2 = new THREE.Mesh(flatRailBarGeom, slopeRailMat);
  flatRailBar2.position.set(slopeEndX + 15, slopeEndY + 0.4, guardZ);
  scene.add(flatRailBar2);

  // Flat top guardrail posts
  for (let i = 0; i < 10; i++) {
    const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const post = new THREE.Mesh(postGeom, slopePostMat);
    post.position.set(slopeEndX + 1.5 + i * 3, slopeEndY + 0.4, guardZ);
    scene.add(post);
  }

  // Thick retaining wall below residential road (from y=0 to y=9.9, at z=20)
  const retainingWallGeom = new THREE.BoxGeometry(95, 9.9, 2); // width 95, height 9.9, depth 2
  const retainingWallMat = new THREE.MeshBasicMaterial({ color: 0x2a2a32 }); // Darker than road
  const retainingWall = new THREE.Mesh(retainingWallGeom, retainingWallMat);
  retainingWall.position.set(0, 4.95, 19); // Center at y=4.95 (from y=0 to y=9.9), z=19
  scene.add(retainingWall);

  // Vertical pillar segments on retaining wall for texture
  const pillarMat = new THREE.MeshBasicMaterial({ color: 0x252528 });
  for (let i = 0; i < 16; i++) {
    const pillarGeom = new THREE.BoxGeometry(0.8, 9.9, 0.3);
    const pillar = new THREE.Mesh(pillarGeom, pillarMat);
    pillar.position.set(-42 + i * 6, 4.95, 18);
    scene.add(pillar);
  }

  // Horizontal bands on wall
  const bandMat = new THREE.MeshBasicMaterial({ color: 0x303038 });
  const band1Geom = new THREE.BoxGeometry(95, 0.2, 0.2);
  const band1 = new THREE.Mesh(band1Geom, bandMat);
  band1.position.set(0, 3, 18);
  scene.add(band1);
  const band2 = new THREE.Mesh(band1Geom, bandMat);
  band2.position.set(0, 7, 18);
  scene.add(band2);

  // === Sloped retaining wall extension (from x=47.5 to x=92.5) ===
  const slopeWallZ = 19;
  const slopeWallFrontZ = 18;
  const wallBottomY = 0;
  const wallTopStartY = 9.9;  // Matches main wall height at start
  const wallTopEndY = 15.9;   // Follows slope (6 units rise over 45 units)

  // Sloped retaining wall using BufferGeometry
  const slopeWallVertices = new Float32Array([
    // Front face (z=18)
    slopeStartX, wallBottomY, slopeWallFrontZ,
    slopeEndX, wallBottomY, slopeWallFrontZ,
    slopeStartX, wallTopStartY, slopeWallFrontZ,
    slopeEndX, wallBottomY, slopeWallFrontZ,
    slopeEndX, wallTopEndY, slopeWallFrontZ,
    slopeStartX, wallTopStartY, slopeWallFrontZ,
    // Back face (z=20)
    slopeStartX, wallBottomY, slopeWallZ + 1,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    slopeEndX, wallBottomY, slopeWallZ + 1,
    slopeEndX, wallBottomY, slopeWallZ + 1,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    slopeEndX, wallTopEndY, slopeWallZ + 1,
    // Top face (sloped)
    slopeStartX, wallTopStartY, slopeWallFrontZ,
    slopeEndX, wallTopEndY, slopeWallFrontZ,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    slopeEndX, wallTopEndY, slopeWallFrontZ,
    slopeEndX, wallTopEndY, slopeWallZ + 1,
    slopeStartX, wallTopStartY, slopeWallZ + 1,
    // Bottom face
    slopeStartX, wallBottomY, slopeWallFrontZ,
    slopeStartX, wallBottomY, slopeWallZ + 1,
    slopeEndX, wallBottomY, slopeWallFrontZ,
    slopeEndX, wallBottomY, slopeWallFrontZ,
    slopeStartX, wallBottomY, slopeWallZ + 1,
    slopeEndX, wallBottomY, slopeWallZ + 1,
  ]);

  const slopeWallGeom = new THREE.BufferGeometry();
  slopeWallGeom.setAttribute('position', new THREE.BufferAttribute(slopeWallVertices, 3));
  slopeWallGeom.computeVertexNormals();
  const slopeWall = new THREE.Mesh(slopeWallGeom, new THREE.MeshBasicMaterial({
    color: 0x2a2a32,
    side: THREE.DoubleSide
  }));
  scene.add(slopeWall);

  // Vertical pillar segments on sloped retaining wall
  const slopePillarMat = new THREE.MeshBasicMaterial({ color: 0x252528 });
  const slopeWallLength = slopeEndX - slopeStartX;
  const numSlopePillars = 8;
  for (let i = 0; i < numSlopePillars; i++) {
    const t = (i + 0.5) / numSlopePillars;
    const pillarX = slopeStartX + t * slopeWallLength;
    const pillarTopY = wallTopStartY + t * (wallTopEndY - wallTopStartY);
    const pillarHeight = pillarTopY - wallBottomY;
    const pillarCenterY = pillarHeight / 2;

    const slopePillarGeom = new THREE.BoxGeometry(0.8, pillarHeight, 0.3);
    const slopePillar = new THREE.Mesh(slopePillarGeom, slopePillarMat);
    slopePillar.position.set(pillarX, pillarCenterY, slopeWallFrontZ);
    scene.add(slopePillar);
  }

  // Horizontal bands on sloped wall (using BufferGeometry for angled bands)
  const slopeBandMat = new THREE.MeshBasicMaterial({ color: 0x303038, side: THREE.DoubleSide });

  // Lower band
  const band1StartY = 3;
  const band1EndY = 3 + (wallTopEndY - wallTopStartY) * (3 / wallTopStartY);
  const slopeBand1Vertices = new Float32Array([
    slopeStartX, band1StartY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band1EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band1StartY + 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band1EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band1EndY + 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band1StartY + 0.1, slopeWallFrontZ - 0.1,
  ]);
  const slopeBand1Geom = new THREE.BufferGeometry();
  slopeBand1Geom.setAttribute('position', new THREE.BufferAttribute(slopeBand1Vertices, 3));
  const slopeBand1 = new THREE.Mesh(slopeBand1Geom, slopeBandMat);
  scene.add(slopeBand1);

  // Upper band
  const band2StartY = 7;
  const band2EndY = 7 + (wallTopEndY - wallTopStartY) * (7 / wallTopStartY);
  const slopeBand2Vertices = new Float32Array([
    slopeStartX, band2StartY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band2EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band2StartY + 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band2EndY - 0.1, slopeWallFrontZ - 0.1,
    slopeEndX, band2EndY + 0.1, slopeWallFrontZ - 0.1,
    slopeStartX, band2StartY + 0.1, slopeWallFrontZ - 0.1,
  ]);
  const slopeBand2Geom = new THREE.BufferGeometry();
  slopeBand2Geom.setAttribute('position', new THREE.BufferAttribute(slopeBand2Vertices, 3));
  const slopeBand2 = new THREE.Mesh(slopeBand2Geom, slopeBandMat);
  scene.add(slopeBand2);

  // Guardrail on outer side of lamps/poles (toward shopping district, z=18.5)
  // Split into two sections with small gap for stairs top landing (x=-4 to x=4)
  const railMat = new THREE.MeshBasicMaterial({ color: 0x656575 });

  // Left section rail bars (x=-47.5 to x=-4)
  const leftRailBarGeom = new THREE.BoxGeometry(43.5, 0.12, 0.08);
  const leftRailBar1 = new THREE.Mesh(leftRailBarGeom, railMat);
  leftRailBar1.position.set(-25.75, 10.7, 18.5);
  scene.add(leftRailBar1);
  const leftRailBar2 = new THREE.Mesh(leftRailBarGeom, railMat);
  leftRailBar2.position.set(-25.75, 10.4, 18.5);
  scene.add(leftRailBar2);

  // Right section rail bars (x=4 to x=47.5)
  const rightRailBarGeom = new THREE.BoxGeometry(43.5, 0.12, 0.08);
  const rightRailBar1 = new THREE.Mesh(rightRailBarGeom, railMat);
  rightRailBar1.position.set(25.75, 10.7, 18.5);
  scene.add(rightRailBar1);
  const rightRailBar2 = new THREE.Mesh(rightRailBarGeom, railMat);
  rightRailBar2.position.set(25.75, 10.4, 18.5);
  scene.add(rightRailBar2);

  // Guardrail posts (skip stairs top landing area x=-4 to x=4)
  const postMat = new THREE.MeshBasicMaterial({ color: 0x555565 });
  for (let i = 0; i < 32; i++) {
    const postX = -46.5 + i * 3;
    // Skip posts in stairs top landing area
    if (postX > -5 && postX < 5) continue;
    const postGeom = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const post = new THREE.Mesh(postGeom, postMat);
    post.position.set(postX, 10.4, 18.5);
    scene.add(post);
  }
}

/**
 * Create crosswalks (simplified for new layout)
 */
export function createCrosswalks(scene) {
  const crosswalks = [];
  // Crosswalks are now created in createRoads function
  return crosswalks;
}
