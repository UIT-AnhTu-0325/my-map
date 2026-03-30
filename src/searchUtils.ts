import type { Location } from './types';

export type ParsedInput =
  | { type: 'coordinate'; lat: number; lng: number }
  | { type: 'text'; query: string }
  | { type: 'empty' };

/**
 * Returns true if lat is in [-90, 90] and lng is in [-180, 180].
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Extracts lat/lng from a Google Maps URL containing an `@lat,lng` segment.
 * Returns `{ lat, lng }` or `null` if not found or invalid.
 */
export function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  const match = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);

  if (!isValidCoordinate(lat, lng)) return null;
  return { lat, lng };
}

/**
 * Parses raw search input into one of three types:
 * - `empty` for blank/whitespace-only input
 * - `coordinate` for valid lat,lng patterns or Google Maps URLs
 * - `text` for everything else
 */
export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim();

  if (trimmed === '') {
    return { type: 'empty' };
  }

  // Try Google Maps URL first (contains @lat,lng)
  if (trimmed.includes('@')) {
    const coords = parseGoogleMapsUrl(trimmed);
    if (coords) {
      return { type: 'coordinate', lat: coords.lat, lng: coords.lng };
    }
  }

  // Try plain coordinate pattern: lat,lng (with optional spaces around comma)
  const coordMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (isValidCoordinate(lat, lng)) {
      return { type: 'coordinate', lat, lng };
    }
  }

  return { type: 'text', query: trimmed };
}

/**
 * Filters locations by case-insensitive substring match on title and description.
 */
export function filterLocations(locations: Location[], query: string): Location[] {
  const lower = query.toLowerCase();
  return locations.filter(
    (loc) =>
      loc.title.toLowerCase().includes(lower) ||
      loc.description.toLowerCase().includes(lower)
  );
}

export interface GeoSearchResult {
  name: string;
  lat: number;
  lng: number;
  bbox: [number, number, number, number]; // [south, north, west, east]
}

/**
 * Search for places using OpenStreetMap Nominatim API (free, no key needed).
 */
export async function searchPlaces(query: string): Promise<GeoSearchResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: { display_name: string; lat: string; lon: string; boundingbox: string[] }) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      bbox: item.boundingbox.map(Number) as [number, number, number, number],
    }));
  } catch {
    return [];
  }
}
