# Implementation Plan: Map Search

## Overview

Implement a unified search bar overlaid on the map that supports text-based location filtering and coordinate/Google Maps URL navigation. All logic is client-side using pure utility functions (`searchUtils.ts`) and a single new React component (`MapSearchBar`). Property-based tests use fast-check.

## Tasks

- [x] 1. Create search utility module (`src/searchUtils.ts`)
  - [x] 1.1 Implement `isValidCoordinate`, `parseGoogleMapsUrl`, `parseInput`, and `filterLocations` functions
    - `isValidCoordinate(lat, lng)`: returns true if lat in [-90,90] and lng in [-180,180]
    - `parseGoogleMapsUrl(url)`: extracts lat/lng from `@lat,lng` segment in Google Maps URLs, returns `{ lat, lng }` or `null`
    - `parseInput(raw)`: trims input, returns `{ type: 'empty' }` for blank, detects coordinate patterns (`lat,lng` or Google Maps URL) and returns `{ type: 'coordinate', lat, lng }` if valid, otherwise returns `{ type: 'text', query }`
    - `filterLocations(locations, query)`: case-insensitive substring match on `title` and `description`, returns matching locations
    - Export `ParsedInput` type union
    - _Requirements: 1.2, 1.3, 2.1, 2.6, 3.1, 3.4, 3.5_

  - [x] 1.2 Write property tests for searchUtils
    - Install `fast-check` as a dev dependency
    - Create `src/__tests__/searchUtils.property.test.ts`
    - **Property 1: Coordinate parsing round-trip** — generate valid lat/lng, format as `"lat,lng"`, assert `parseInput` returns matching coordinate result
    - **Validates: Requirements 1.3, 3.1**
    - **Property 2: Filter results match query** — generate locations and query, assert every returned location contains query in title or description, and no excluded location contains it
    - **Validates: Requirements 2.1**
    - **Property 3: Minimum query length gate** — generate 0-1 char non-coordinate strings, assert `parseInput` returns `empty` or `text` (component ignores text < 2 chars)
    - **Validates: Requirements 2.6**
    - **Property 4: Out-of-range coordinates fall back to text** — generate out-of-range lat or lng, format as coordinate string, assert `parseInput` returns text type
    - **Validates: Requirements 3.4**
    - **Property 5: Google Maps URL coordinate extraction round-trip** — generate valid lat/lng, construct `https://www.google.com/maps/place/@lat,lng,15z`, assert `parseInput` returns matching coordinate result
    - **Validates: Requirements 3.5**

  - [x] 1.3 Write unit tests for searchUtils edge cases
    - Create `src/__tests__/searchUtils.test.ts`
    - Test exact boundary coordinates (-90, 90, -180, 180)
    - Test whitespace around coordinates (`" 10.82 , 106.63 "`)
    - Test Google Maps URL with extra path segments after `@lat,lng,15z`
    - Test malformed input like `"10.82, abc"` returns text type
    - Test empty and whitespace-only input returns empty type
    - Test `filterLocations` with empty locations array
    - Test `filterLocations` with empty query returns no results
    - _Requirements: 1.3, 2.1, 2.5, 3.1, 3.4, 3.5_

- [x] 2. Checkpoint - Verify search utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create MapSearchBar component and styles
  - [x] 3.1 Implement `MapSearchBar` component (`src/components/MapSearchBar.tsx`)
    - Accept `locations: Location[]` prop
    - Use `useMap()` hook to access Leaflet map instance
    - Manage `query` and `isOpen` state
    - On input change: call `parseInput(query)`, show coordinate result or filtered locations (only when query ≥ 2 chars)
    - Render search icon and placeholder text "Search locations or paste coordinates..."
    - Render results dropdown with location results (title, status badge, truncated description) and coordinate result ("Go to lat, lng")
    - On location result select: `map.flyTo([lat, lng], 15)`, open the marker popup, clear input, close dropdown
    - On coordinate result select: `map.flyTo([lat, lng], 15)`, clear input, close dropdown
    - On Escape key: close dropdown
    - On click outside: close dropdown (useEffect with document click listener)
    - Show "No locations found" when text query has ≥ 2 chars but no matches
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

  - [x] 3.2 Add CSS styles for search bar and results dropdown
    - Add styles to `src/App.css` for `.map-search-bar`, `.search-input-wrapper`, `.search-results`, `.search-result-item`, `.search-no-results`
    - Position search bar as fixed overlay at top of map with appropriate z-index
    - Style results dropdown below the input with scroll for overflow
    - _Requirements: 1.1, 1.4, 2.2_

  - [x] 3.3 Write unit tests for MapSearchBar component
    - Create `src/__tests__/MapSearchBar.test.tsx`
    - Test typing a query shows filtered results
    - Test selecting a location calls `map.flyTo` with correct coordinates
    - Test pressing Escape closes dropdown
    - Test selecting a result clears input
    - Test "No locations found" message when no matches
    - _Requirements: 2.3, 2.4, 2.5, 4.2, 4.3_

- [x] 4. Integrate MapSearchBar into MapPage
  - [x] 4.1 Update `MapPage.tsx` to render MapSearchBar and store marker refs
    - Import `MapSearchBar` component
    - Create a `markerRefs` map (`Record<string, L.Marker>`) using `useRef`
    - Attach refs to each `<Marker>` via the `ref` callback
    - Pass `locations` and `markerRefs` to `<MapSearchBar>` rendered inside `<MapContainer>`
    - _Requirements: 1.1, 2.3, 2.4_

  - [x] 4.2 Write property test for search result display fields
    - Add to `src/__tests__/searchUtils.property.test.ts`
    - **Property 6: Search results contain required display fields** — for any location returned by `filterLocations`, assert it has non-empty `title`, valid `status`, and `description` fields
    - **Validates: Requirements 2.2**

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- No new runtime dependencies needed; only `fast-check` as a dev dependency for testing
