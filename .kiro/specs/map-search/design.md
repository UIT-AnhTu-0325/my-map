# Design Document: Map Search

## Overview

The Map Search feature adds a unified search bar component overlaid on the existing `MapPage`. It serves two purposes from a single input:

1. **Text search** — filters the already-loaded `locations` array by matching the query against `title` and `description` (case-insensitive). Results appear in a dropdown; selecting one pans/zooms the map and opens the marker popup.
2. **Coordinate navigation** — detects coordinate patterns (`lat,lng` or Google Maps `@lat,lng` URLs), validates ranges, and offers a "Go to coordinates" action that flies the map to that position.

No new backend endpoints or Firestore queries are needed. All filtering happens client-side against the locations already fetched by `MapPage`.

## Architecture

The feature is implemented entirely in the React frontend layer. It introduces one new component (`MapSearchBar`) and one pure utility module (`searchUtils`) for parsing/filtering logic.

```mermaid
graph TD
    A[MapPage] -->|passes locations + map ref| B[MapSearchBar]
    B -->|user types| C[searchUtils.parseInput]
    C -->|coordinate detected| D[CoordinateResult]
    C -->|text query| E[searchUtils.filterLocations]
    E --> F[LocationResult[]]
    B -->|user selects result| G[Map.flyTo / openPopup]
```

### Key decisions

- **No debounce** — the location list is small (loaded in memory), so filtering on every keystroke is fine. No network calls involved.
- **Pure utility functions** — all parsing and filtering logic lives in `searchUtils.ts` with no React or DOM dependencies, making it trivially testable.
- **Map interaction via `useMap` hook** — a small inner component (`MapSearchBar` rendered inside `MapContainer`) accesses the Leaflet map instance directly through react-leaflet's `useMap`.

## Components and Interfaces

### MapSearchBar (React component)

Rendered inside `MapContainer` in `MapPage.tsx`. Receives the locations array as a prop.

```typescript
interface MapSearchBarProps {
  locations: Location[];
}
```

Internal state:
- `query: string` — current input value
- `isOpen: boolean` — whether the results dropdown is visible

Behavior:
- On input change → call `parseInput(query)` to determine input type
- If coordinate → show single "Go to lat, lng" result
- If text (≥ 2 chars) → show `filterLocations(locations, query)` results
- On result select → `map.flyTo(...)`, open popup (for location results), clear input, close dropdown
- On Escape / outside click / clear → close dropdown

### searchUtils (pure module)

```typescript
// Determines if input is a coordinate or text query
type ParsedInput =
  | { type: 'coordinate'; lat: number; lng: number }
  | { type: 'text'; query: string }
  | { type: 'empty' };

function parseInput(raw: string): ParsedInput;

// Filters locations by title/description match (case-insensitive)
function filterLocations(locations: Location[], query: string): Location[];

// Extracts lat,lng from a Google Maps URL containing @lat,lng
function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null;

// Validates lat in [-90,90] and lng in [-180,180]
function isValidCoordinate(lat: number, lng: number): boolean;
```

### MapPage changes

Minimal changes to `MapPage.tsx`:
- Import and render `<MapSearchBar locations={locations} />` inside `MapContainer`
- Store marker refs so the search component can programmatically open a popup

## Data Models

No new data models are introduced. The feature operates on the existing `Location` type:

```typescript
interface Location {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  tiktokUrl: string;
  status: 'selling' | 'sold';
  createdAt: string;
}
```

### Search result types (internal, not persisted)

```typescript
type SearchResult =
  | { type: 'location'; location: Location }
  | { type: 'coordinate'; lat: number; lng: number };
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Coordinate parsing round-trip

*For any* valid latitude in [-90, 90] and longitude in [-180, 180], formatting them as the string `"lat, lng"` or `"lat,lng"` and passing the result to `parseInput` should return a coordinate result with the same latitude and longitude values (within floating-point tolerance).

**Validates: Requirements 1.3, 3.1**

### Property 2: Filter results match query

*For any* list of locations and any text query of length ≥ 2, every location returned by `filterLocations` must contain the query as a case-insensitive substring of its `title` or `description`. Conversely, no location excluded from the results should contain the query in either field.

**Validates: Requirements 2.1**

### Property 3: Minimum query length gate

*For any* input string of length 0 or 1 that is not a valid coordinate, `parseInput` should return a result that does not trigger the results dropdown (either `empty` or a text query that the component ignores due to length).

**Validates: Requirements 2.6**

### Property 4: Out-of-range coordinates fall back to text

*For any* pair of decimal numbers where latitude is outside [-90, 90] or longitude is outside [-180, 180], formatting them as `"lat,lng"` and passing to `parseInput` should return a text-type result, not a coordinate result.

**Validates: Requirements 3.4**

### Property 5: Google Maps URL coordinate extraction round-trip

*For any* valid latitude in [-90, 90] and longitude in [-180, 180], constructing a Google Maps URL in the format `https://www.google.com/maps/.../@lat,lng,...` and passing it to `parseInput` should return a coordinate result with the same latitude and longitude values.

**Validates: Requirements 3.5**

### Property 6: Search results contain required display fields

*For any* location returned by `filterLocations`, the rendered result item must include the location's title, its status, and a substring of its description.

**Validates: Requirements 2.2**

## Error Handling

| Scenario | Behavior |
|---|---|
| Malformed coordinate string (e.g. `10.82, abc`) | Treated as a text query — no error shown |
| Out-of-range coordinates | Treated as a text query (Property 4) |
| Google Maps URL without `@lat,lng` segment | Treated as a text query |
| Empty or whitespace-only input | Dropdown closes, no results shown |
| Locations array is empty | Text search returns empty list, "No locations found" message shown |
| Very long input string | Parsed normally; no truncation on input, only on result descriptions |

No exceptions are thrown to the user. All invalid inputs gracefully degrade to text search behavior.

## Testing Strategy

### Unit Tests

Unit tests cover specific examples and edge cases:

- `parseInput` with known coordinate strings returns correct lat/lng
- `parseInput` with a Google Maps URL extracts correct coordinates
- `parseInput` with plain text returns text type
- `filterLocations` with known locations and query returns expected matches
- `filterLocations` with empty query returns no results
- Edge: coordinates at exact boundaries (-90, 90, -180, 180)
- Edge: input with extra whitespace around coordinates
- Edge: Google Maps URL with zoom level and other parameters after `@lat,lng`

### Property-Based Tests

Use **fast-check** as the property-based testing library for TypeScript.

Each property test runs a minimum of 100 iterations and is tagged with its design property reference.

- **Feature: map-search, Property 1: Coordinate parsing round-trip** — Generate random valid lat/lng, format as string, parse, assert equality.
- **Feature: map-search, Property 2: Filter results match query** — Generate random locations and query strings, assert all results contain the query and no missed results exist.
- **Feature: map-search, Property 3: Minimum query length gate** — Generate random 0-1 character strings, assert parseInput does not return actionable results.
- **Feature: map-search, Property 4: Out-of-range coordinates fall back to text** — Generate lat outside [-90,90] or lng outside [-180,180], format as coordinate string, assert text result.
- **Feature: map-search, Property 5: Google Maps URL coordinate extraction round-trip** — Generate random valid lat/lng, construct Google Maps URL, parse, assert equality.
- **Feature: map-search, Property 6: Search results contain required display fields** — Generate random locations that match a query, assert rendered output includes title, status, and description substring.

### Component Tests

Integration tests for the `MapSearchBar` React component:

- Typing a query shows filtered results in dropdown
- Selecting a location result calls `map.flyTo` with correct coordinates
- Pressing Escape closes the dropdown
- Clicking outside closes the dropdown
- Selecting a result clears the input

These use React Testing Library with a mocked Leaflet map context.
