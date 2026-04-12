/**
 * Geometry utilities for farm map tools.
 * All coordinates in GeoJSON order: [longitude, latitude]
 * All distances in feet unless noted.
 */

const EARTH_RADIUS_FT = 20_902_231; // feet
const DEG_TO_RAD = Math.PI / 180;
const FT_PER_DEGREE_LAT = 364_567; // approximate at mid-latitudes

// ─── Distance ────────────────────────────────────────────────────────

export function haversineDistance(a: [number, number], b: [number, number]): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_FT * Math.asin(Math.sqrt(h));
}

// ─── Projection (equirectangular, local XY in feet) ──────────────────

function projectToXY(origin: [number, number], point: [number, number]): [number, number] {
  const cosLat = Math.cos(origin[1] * DEG_TO_RAD);
  const x = (point[0] - origin[0]) * cosLat * FT_PER_DEGREE_LAT;
  const y = (point[1] - origin[1]) * FT_PER_DEGREE_LAT;
  return [x, y];
}

function unprojectFromXY(origin: [number, number], xy: [number, number]): [number, number] {
  const cosLat = Math.cos(origin[1] * DEG_TO_RAD);
  const lng = xy[0] / (cosLat * FT_PER_DEGREE_LAT) + origin[0];
  const lat = xy[1] / FT_PER_DEGREE_LAT + origin[1];
  return [lng, lat];
}

// ─── Polygon Area (Shoelace formula) ─────────────────────────────────

export function polygonAreaSqFt(ring: [number, number][]): number {
  if (ring.length < 3) return 0;
  // Compute centroid for projection origin
  const centLng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
  const centLat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
  const origin: [number, number] = [centLng, centLat];

  const projected = ring.map(c => projectToXY(origin, c));

  let area = 0;
  for (let i = 0; i < projected.length; i++) {
    const j = (i + 1) % projected.length;
    area += projected[i][0] * projected[j][1];
    area -= projected[j][0] * projected[i][1];
  }
  return Math.abs(area / 2);
}

export function sqFtToAcres(sqFt: number): number {
  return sqFt / 43560;
}

// ─── Perimeter ───────────────────────────────────────────────────────

export function polygonPerimeterFt(ring: [number, number][]): number {
  if (ring.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < ring.length; i++) {
    const j = (i + 1) % ring.length;
    total += haversineDistance(ring[i], ring[j]);
  }
  return total;
}

// ─── Edge Lengths ────────────────────────────────────────────────────

export function edgeLengths(ring: [number, number][]): number[] {
  const lengths: number[] = [];
  for (let i = 0; i < ring.length; i++) {
    const j = (i + 1) % ring.length;
    lengths.push(haversineDistance(ring[i], ring[j]));
  }
  return lengths;
}

// ─── Midpoint ────────────────────────────────────────────────────────

export function edgeMidpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// ─── Snap to Vertex ──────────────────────────────────────────────────

export function findSnapTarget(
  point: { lat: number; lng: number },
  existingVertices: { lat: number; lng: number }[],
  map: any, // L.Map
  thresholdPx: number = 12
): { lat: number; lng: number } | null {
  if (!map || !existingVertices.length) return null;

  const pointPx = map.latLngToContainerPoint(point);
  let closest: { lat: number; lng: number } | null = null;
  let closestDist = Infinity;

  for (const v of existingVertices) {
    const vPx = map.latLngToContainerPoint(v);
    const dx = pointPx.x - vPx.x;
    const dy = pointPx.y - vPx.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < thresholdPx && dist < closestDist) {
      closestDist = dist;
      closest = v;
    }
  }
  return closest;
}

// ─── 90-Degree Constraint ────────────────────────────────────────────

export function constrainTo90Degrees(
  prev: [number, number],
  current: [number, number],
  candidate: [number, number]
): [number, number] {
  // Get the direction of the previous edge
  const dx = current[0] - prev[0];
  const dy = current[1] - prev[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return candidate;

  // Perpendicular directions (90° from previous edge)
  const perpX1 = -dy / len;
  const perpY1 = dx / len;
  const perpX2 = dy / len;
  const perpY2 = -dx / len;

  // Also allow continuing along the same direction
  const paraX = dx / len;
  const paraY = dy / len;

  // Project candidate onto each direction
  const cDx = candidate[0] - current[0];
  const cDy = candidate[1] - current[1];

  const projections = [
    { dot: cDx * perpX1 + cDy * perpY1, dir: [perpX1, perpY1] },
    { dot: cDx * perpX2 + cDy * perpY2, dir: [perpX2, perpY2] },
    { dot: cDx * paraX + cDy * paraY, dir: [paraX, paraY] },
    { dot: -(cDx * paraX + cDy * paraY), dir: [-paraX, -paraY] },
  ];

  // Pick the direction with the largest positive projection
  let best = projections[0];
  for (const p of projections) {
    if (Math.abs(p.dot) > Math.abs(best.dot)) best = p;
  }

  const d = Math.abs(best.dot);
  return [
    current[0] + best.dir[0] * d,
    current[1] + best.dir[1] * d,
  ];
}

export function perpendicularDirections(
  a: [number, number],
  b: [number, number]
): [[number, number], [number, number]] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [[0, 1], [0, -1]];
  return [
    [-dy / len, dx / len],
    [dy / len, -dx / len],
  ];
}

// ─── Grid Interval ───────────────────────────────────────────────────

export function getGridInterval(zoom: number): { intervalFt: number; label: string; minorFt?: number; minorLabel?: string } {
  if (zoom <= 16) return { intervalFt: 300, label: '100yd' };
  if (zoom === 17) return { intervalFt: 150, label: '50yd' };
  if (zoom === 18) return { intervalFt: 30, label: '10yd' };
  if (zoom === 19) return { intervalFt: 9, label: '3yd' };
  if (zoom === 20) return { intervalFt: 3, label: '1yd' };
  return { intervalFt: 3, label: '1yd', minorFt: 1, minorLabel: '1ft' };
}

// Convert feet to degrees latitude (approximate)
export function feetToDegreesLat(ft: number): number {
  return ft / FT_PER_DEGREE_LAT;
}

// Convert feet to degrees longitude at a given latitude
export function feetToDegreesLng(ft: number, lat: number): number {
  return ft / (FT_PER_DEGREE_LAT * Math.cos(lat * DEG_TO_RAD));
}

// ─── Formatting ──────────────────────────────────────────────────────

export function formatFeet(feet: number): string {
  if (feet < 100) return `${Math.round(feet)} ft`;
  if (feet < 5280) return `${Math.round(feet).toLocaleString()} ft`;
  return `${(feet / 5280).toFixed(2)} mi`;
}

export function formatArea(sqFt: number): string {
  if (sqFt < 43560) return `${Math.round(sqFt).toLocaleString()} sq ft`;
  return `${(sqFt / 43560).toFixed(2)} ac`;
}

export function formatAcres(sqFt: number): string {
  return `${(sqFt / 43560).toFixed(2)} ac`;
}
